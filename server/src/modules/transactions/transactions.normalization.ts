import { CreateTransactionDto } from './transactions.types';
import { DailyTransactionType, DailyTransactionSource } from '@prisma/client';

/**
 * Normalized transaction amounts
 */
export interface NormalizedTransactionAmounts {
  incoming: number;
  outgoing: number;
  bankDelta: number;
  storedSource: DailyTransactionSource;
}

/**
 * Normalize transaction payload to canonical form
 * 
 * This function ensures consistent calculation of incoming, outgoing, and bankDelta
 * for all transaction types, regardless of how the client sends the data.
 * 
 * Rules:
 * - Accept canonical fields: incoming, outgoing, bankDelta
 * - displayIncoming/displayOutgoing are UI-only and not authoritative
 * - For types requiring net calculation (e.g., POS_TAHSILAT_BRUT), compute from provided values
 * - Validate required amount fields per transaction type
 * 
 * @param data - The transaction data from client
 * @returns Normalized amounts and stored source
 * @throws Error with statusCode 400 if validation fails
 */
export function normalizeTransactionPayload(
  data: CreateTransactionDto
): NormalizedTransactionAmounts {
  const type = data.type;
  const source = data.source;
  
  let incoming: number;
  let outgoing: number;
  let bankDelta: number;
  let storedSource: DailyTransactionSource = source;

  // Extract amount values (default to 0 if not provided)
  const providedIncoming = data.incoming ?? 0;
  const providedOutgoing = data.outgoing ?? 0;
  const providedBankDelta = data.bankDelta ?? 0;
  const displayIncoming = data.displayIncoming ?? 0;
  const displayOutgoing = data.displayOutgoing ?? 0;

  switch (type) {
    case 'NAKIT_TAHSILAT':
      if (source === 'KASA') {
        // CASH IN: incoming=amount, outgoing=0, bankDelta=0
        incoming = providedIncoming;
        if (incoming <= 0) {
          throw createValidationError('NAKIT_TAHSILAT (KASA) requires incoming > 0');
        }
        outgoing = 0;
        bankDelta = 0;
      } else if (source === 'BANKA') {
        // BANK CASH IN: incoming=0, outgoing=0, bankDelta=+amount
        incoming = 0;
        outgoing = 0;
        bankDelta = providedIncoming > 0 ? providedIncoming : (providedBankDelta > 0 ? providedBankDelta : 0);
        if (bankDelta <= 0) {
          throw createValidationError('NAKIT_TAHSILAT (BANKA) requires incoming or bankDelta > 0');
        }
      } else {
        throw createValidationError(`NAKIT_TAHSILAT requires source to be KASA or BANKA, got ${source}`);
      }
      break;

    case 'NAKIT_ODEME':
      if (source === 'KASA') {
        // CASH OUT: incoming=0, outgoing=amount, bankDelta=0
        incoming = 0;
        outgoing = providedOutgoing;
        if (outgoing <= 0) {
          throw createValidationError('NAKIT_ODEME (KASA) requires outgoing > 0');
        }
        bankDelta = 0;
      } else if (source === 'BANKA') {
        // BANK CASH OUT: incoming=0, outgoing=amount, bankDelta=-amount
        incoming = 0;
        outgoing = providedOutgoing;
        if (outgoing <= 0) {
          throw createValidationError('NAKIT_ODEME (BANKA) requires outgoing > 0');
        }
        bankDelta = -outgoing; // Always negative for cash out
      } else {
        throw createValidationError(`NAKIT_ODEME requires source to be KASA or BANKA, got ${source}`);
      }
      break;

    case 'POS_TAHSILAT_BRUT':
      // POS COLLECTION: incoming=0, outgoing=0, bankDelta=+netAmount
      // Net amount = gross - commission
      // Client should send bankDelta as net amount, or we compute from displayIncoming - displayOutgoing
      incoming = 0;
      outgoing = 0;
      if (providedBankDelta > 0) {
        bankDelta = providedBankDelta;
      } else if (displayIncoming > 0 && displayOutgoing > 0) {
        // Fallback: compute net from display values
        bankDelta = displayIncoming - displayOutgoing;
        if (bankDelta <= 0) {
          throw createValidationError('POS_TAHSILAT_BRUT: net amount (gross - commission) must be > 0');
        }
      } else {
        throw createValidationError('POS_TAHSILAT_BRUT requires bankDelta > 0 or valid displayIncoming/displayOutgoing');
      }
      break;

    case 'POS_KOMISYONU':
      // POS COMMISSION: incoming=0, outgoing=0, bankDelta=-commissionAmount
      incoming = 0;
      outgoing = 0;
      bankDelta = providedBankDelta < 0 ? providedBankDelta : (displayOutgoing > 0 ? -displayOutgoing : 0);
      if (bankDelta >= 0) {
        throw createValidationError('POS_KOMISYONU requires bankDelta < 0 or displayOutgoing > 0');
      }
      break;

    case 'KREDI_KARTI_HARCAMA':
      // CREDIT CARD EXPENSE: incoming=0, outgoing=0, bankDelta=0
      // Card debt is tracked separately via CreditCardOperation
      incoming = 0;
      outgoing = 0;
      bankDelta = 0;
      break;

    case 'KREDI_KARTI_EKSTRE_ODEME':
      // CREDIT CARD PAYMENT:
      // - If source=BANKA: incoming=0, outgoing=amount, bankDelta=-amount
      // - If source=KASA: incoming=0, outgoing=amount, bankDelta=0
      incoming = 0;
      outgoing = providedOutgoing;
      if (outgoing <= 0) {
        throw createValidationError('KREDI_KARTI_EKSTRE_ODEME requires outgoing > 0');
      }
      if (source === 'BANKA') {
        bankDelta = -outgoing;
      } else if (source === 'KASA') {
        bankDelta = 0;
      } else {
        throw createValidationError(`KREDI_KARTI_EKSTRE_ODEME requires source to be BANKA or KASA, got ${source}`);
      }
      break;

    case 'BANKA_KASA_TRANSFER':
      // BANK TO CASH TRANSFER: Money moves from bank to cash
      // incoming=amount (cash increases), outgoing=0, bankDelta=-amount (bank decreases)
      // IMPORTANT: storedSource must be KASA so it affects cash balance calculation
      incoming = providedIncoming;
      if (incoming <= 0) {
        throw createValidationError('BANKA_KASA_TRANSFER requires incoming > 0');
      }
      outgoing = 0;
      bankDelta = -incoming; // Bank decreases
      storedSource = 'KASA'; // Store as KASA for balance calculation
      break;

    case 'KASA_BANKA_TRANSFER':
      // CASH TO BANK TRANSFER: Money moves from cash to bank
      // incoming=0, outgoing=amount (cash decreases), bankDelta=+amount (bank increases)
      // IMPORTANT: storedSource must be KASA so it affects cash balance calculation
      incoming = 0;
      outgoing = providedOutgoing;
      if (outgoing <= 0) {
        throw createValidationError('KASA_BANKA_TRANSFER requires outgoing > 0');
      }
      bankDelta = outgoing; // Bank increases
      storedSource = 'KASA'; // Store as KASA for balance calculation
      break;

    case 'BANKA_HAVALE_GIRIS':
      // BANK TRANSFER IN: incoming=0, outgoing=0, bankDelta=+amount
      incoming = 0;
      outgoing = 0;
      bankDelta = providedIncoming > 0 ? providedIncoming : (providedBankDelta > 0 ? providedBankDelta : 0);
      if (bankDelta <= 0) {
        throw createValidationError('BANKA_HAVALE_GIRIS requires incoming or bankDelta > 0');
      }
      break;

    case 'BANKA_HAVALE_CIKIS':
      // BANK TRANSFER OUT: incoming=0, outgoing=0, bankDelta=-amount
      incoming = 0;
      outgoing = 0;
      bankDelta = providedOutgoing > 0 ? -providedOutgoing : (providedBankDelta < 0 ? providedBankDelta : 0);
      if (bankDelta >= 0) {
        throw createValidationError('BANKA_HAVALE_CIKIS requires outgoing > 0 or bankDelta < 0');
      }
      break;

    case 'CEK_GIRISI':
    case 'CEK_TAHSIL_BANKA':
    case 'CEK_ODENMESI':
    case 'CEK_KARSILIKSIZ':
      // Cheque operations: use provided values, validate as needed
      incoming = providedIncoming;
      outgoing = providedOutgoing;
      bankDelta = providedBankDelta;
      // Add specific validation per cheque type if needed
      break;

    case 'DEVIR_BAKIYE':
      // Balance transfer: use provided values
      incoming = providedIncoming;
      outgoing = providedOutgoing;
      bankDelta = providedBankDelta;
      break;

    case 'DUZELTME':
      // Correction: use provided values
      incoming = providedIncoming;
      outgoing = providedOutgoing;
      bankDelta = providedBankDelta;
      break;

    case 'KREDI_TAKSIT_ODEME':
      // Loan installment payment: typically from bank
      incoming = 0;
      outgoing = providedOutgoing;
      if (outgoing <= 0) {
        throw createValidationError('KREDI_TAKSIT_ODEME requires outgoing > 0');
      }
      if (source === 'BANKA') {
        bankDelta = -outgoing;
      } else {
        bankDelta = 0;
      }
      break;

    default:
      // For unknown types, use provided values as-is (backward compatibility)
      incoming = providedIncoming;
      outgoing = providedOutgoing;
      bankDelta = providedBankDelta;
      console.warn(`Unknown transaction type: ${type}, using provided values as-is`);
  }

  return {
    incoming,
    outgoing,
    bankDelta,
    storedSource,
  };
}

/**
 * Create a validation error with status code
 */
function createValidationError(message: string): Error {
  const error = new Error(message);
  (error as any).statusCode = 400;
  (error as any).isClientError = true;
  return error;
}

