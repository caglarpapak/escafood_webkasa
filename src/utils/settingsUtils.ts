import { Customer } from '../models/customer';
import { Supplier } from '../models/supplier';
import { BankMaster } from '../models/bank';
import { PosTerminal } from '../models/pos';
import { generateId } from './id';

// Storage keys
export const BANK_FLAGS_STORAGE_KEY = 'esca-webkasa-bank-flags';
export const CARD_EXTRAS_STORAGE_KEY = 'esca-webkasa-card-extras';
export const CUSTOMERS_STORAGE_KEY = 'esca-webkasa-customers';
export const SUPPLIERS_STORAGE_KEY = 'esca-webkasa-suppliers';
export const POS_TERMINALS_STORAGE_KEY = 'esca-webkasa-pos-terminals';

// CSV delimiter
export const CSV_DELIMITER = ';';

// Bank flags type
export type BankFlagMap = Record<
  string,
  {
    cekKarnesiVarMi?: boolean;
    posVarMi?: boolean;
    krediKartiVarMi?: boolean;
  }
>;

// Credit card extras type
export type CardExtrasMap = Record<
  string,
  {
    sonEkstreBorcu: number;
    asgariOran: number;
    maskeliKartNo: string;
  }
>;

/**
 * Generate next code for customers/suppliers
 */
export function nextCode(items: { kod: string }[], prefix: string): string {
  const max = items.reduce((acc, item) => {
    const num = parseInt(item.kod.replace(`${prefix}-`, ''), 10);
    return Number.isNaN(num) ? acc : Math.max(acc, num);
  }, 0);
  const next = String(max + 1).padStart(4, '0');
  return `${prefix}-${next}`;
}

/**
 * Load bank flags from localStorage
 */
export function loadBankFlagsFromStorage(): BankFlagMap {
  try {
    const raw = localStorage.getItem(BANK_FLAGS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as BankFlagMap;
  } catch {
    return {};
  }
}

/**
 * Save bank flags to localStorage
 */
export function saveBankFlagsToStorage(flags: BankFlagMap): void {
  try {
    localStorage.setItem(BANK_FLAGS_STORAGE_KEY, JSON.stringify(flags));
  } catch {
    // Cache error should not break the app
  }
}

/**
 * Load credit card extras from localStorage
 */
export function loadCardExtrasFromStorage(): CardExtrasMap {
  try {
    const raw = localStorage.getItem(CARD_EXTRAS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as CardExtrasMap;
  } catch {
    return {};
  }
}

/**
 * Save credit card extras to localStorage
 */
export function saveCardExtrasToStorage(extras: CardExtrasMap): void {
  try {
    localStorage.setItem(CARD_EXTRAS_STORAGE_KEY, JSON.stringify(extras));
  } catch {
    // Cache error should not break the app
  }
}

/**
 * Load customers from localStorage
 */
export function loadCustomersFromStorage(): Customer[] {
  try {
    const raw = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Customer[];
  } catch {
    return [];
  }
}

/**
 * Save customers to localStorage
 */
export function saveCustomersToStorage(customers: Customer[]): void {
  try {
    localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
  } catch (error) {
    console.error('Failed to save customers to localStorage:', error);
  }
}

/**
 * Load suppliers from localStorage
 */
export function loadSuppliersFromStorage(): Supplier[] {
  try {
    const raw = localStorage.getItem(SUPPLIERS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Supplier[];
  } catch {
    return [];
  }
}

/**
 * Save suppliers to localStorage
 */
export function saveSuppliersToStorage(suppliers: Supplier[]): void {
  try {
    localStorage.setItem(SUPPLIERS_STORAGE_KEY, JSON.stringify(suppliers));
  } catch (error) {
    console.error('Failed to save suppliers to localStorage:', error);
  }
}

/**
 * Load POS terminals from localStorage
 */
export function loadPosTerminalsFromStorage(): PosTerminal[] {
  try {
    const raw = localStorage.getItem(POS_TERMINALS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PosTerminal[];
  } catch {
    return [];
  }
}

/**
 * Save POS terminals to localStorage
 */
export function savePosTerminalsToStorage(terminals: PosTerminal[]): void {
  try {
    localStorage.setItem(POS_TERMINALS_STORAGE_KEY, JSON.stringify(terminals));
  } catch (error) {
    console.error('Failed to save POS terminals to localStorage:', error);
  }
}

/**
 * Download CSV file
 */
export function downloadCsv(content: string, filename: string): void {
  const bom = '\uFEFF';
  const csvContent = bom + content;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Parse CSV file
 */
export function parseCsvFile(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const rawText = (reader.result as string) || '';
      const cleanText = rawText.replace(/^\uFEFF/, '');
      const lines = cleanText.split(/\r?\n/).filter((line) => line.trim().length > 0);
      resolve(lines);
    };
    reader.onerror = reject;
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Parse customer CSV
 */
export function parseCustomerCsv(
  lines: string[],
  existingCustomers: Customer[]
): Customer[] {
  if (!lines.length) return [];

  const header = lines[0].split(/[;,]/).map((h) => h.trim().toLowerCase());
  if (header.length < 3 || header[0] !== 'kod' || header[1] !== 'ad' || header[2] !== 'aktifmi') {
    throw new Error('Geçersiz CSV formatı. Başlıklar kod,ad,aktifMi olmalıdır.');
  }

  const parsed: Customer[] = [];
  const getNext = () => nextCode([...existingCustomers, ...parsed], 'MUST');

  lines.slice(1).forEach((line) => {
    const cols = line.split(/[;,]/);
    const kodRaw = cols[0]?.trim() ?? '';
    const adRaw = cols[1]?.trim() ?? '';
    const aktifMiRaw = cols[2]?.trim() ?? '';

    if (!kodRaw && !adRaw) return;
    if (!adRaw) return;

    const raw = aktifMiRaw.toLowerCase();
    let aktifMi: boolean;
    if (raw === 'false' || raw === '0' || raw === 'hayır' || raw === 'hayir') {
      aktifMi = false;
    } else if (raw === 'true' || raw === '1' || raw === 'evet') {
      aktifMi = true;
    } else {
      aktifMi = true;
    }

    const kod = kodRaw || getNext();
    parsed.push({ id: generateId(), kod, ad: adRaw, aktifMi });
  });

  return parsed;
}

/**
 * Parse supplier CSV
 */
export function parseSupplierCsv(
  lines: string[],
  existingSuppliers: Supplier[]
): Supplier[] {
  if (!lines.length) return [];

  const header = lines[0].split(/[;,]/).map((h) => h.trim().toLowerCase());
  if (header.length < 3 || header[0] !== 'kod' || header[1] !== 'ad' || header[2] !== 'aktifmi') {
    throw new Error('Geçersiz CSV formatı. Başlıklar kod,ad,aktifMi olmalıdır.');
  }

  const parsed: Supplier[] = [];
  const getNext = () => nextCode([...existingSuppliers, ...parsed], 'TDRK');

  lines.slice(1).forEach((line) => {
    const cols = line.split(/[;,]/);
    const kodRaw = cols[0]?.trim() ?? '';
    const adRaw = cols[1]?.trim() ?? '';
    const aktifMiRaw = cols[2]?.trim() ?? '';

    if (!kodRaw && !adRaw) return;
    if (!adRaw) return;

    const raw = aktifMiRaw.toLowerCase();
    let aktifMi: boolean;
    if (raw === 'false' || raw === '0' || raw === 'hayır' || raw === 'hayir') {
      aktifMi = false;
    } else if (raw === 'true' || raw === '1' || raw === 'evet') {
      aktifMi = true;
    } else {
      aktifMi = true;
    }

    const kod = kodRaw || getNext();
    parsed.push({ id: generateId(), kod, ad: adRaw, aktifMi });
  });

  return parsed;
}

/**
 * Parse bank CSV
 */
export function parseBankCsv(
  lines: string[],
  existingBanks: BankMaster[]
): BankMaster[] {
  if (!lines.length) return [];

  const header = lines[0].split(/[;,]/).map((h) => h.trim().toLowerCase());
  const expectedHeaders = ['bankaadi', 'hesapno', 'iban', 'acilisbakiyesi', 'aktifmi', 'cekkarnesivarmi', 'posvarmi', 'kredikartivarmi'];
  const headerMatch = expectedHeaders.every((h) => header.includes(h));
  
  if (!headerMatch) {
    throw new Error('Geçersiz CSV formatı. Başlıklar: bankaAdi,hesapNo,iban,acilisBakiyesi,aktifMi,cekKarnesiVarMi,posVarMi,krediKartiVarMi olmalıdır.');
  }

  const parsed: BankMaster[] = [];

  lines.slice(1).forEach((line) => {
    const cols = line.split(/[;,]/);
    const bankaAdiRaw = cols[0]?.trim() ?? '';
    const hesapNoRaw = cols[1]?.trim() ?? '';
    const ibanRaw = cols[2]?.trim() ?? '';
    const acilisBakiyesiRaw = cols[3]?.trim() ?? '0';
    const aktifMiRaw = cols[4]?.trim() ?? 'true';
    const cekKarnesiVarMiRaw = cols[5]?.trim() ?? 'false';
    const posVarMiRaw = cols[6]?.trim() ?? 'false';
    const krediKartiVarMiRaw = cols[7]?.trim() ?? 'false';

    if (!bankaAdiRaw) return;

    const parseBoolean = (raw: string, defaultValue: boolean = false): boolean => {
      const lower = raw.toLowerCase();
      if (lower === 'false' || lower === '0' || lower === 'hayır' || lower === 'hayir') {
        return false;
      } else if (lower === 'true' || lower === '1' || lower === 'evet') {
        return true;
      }
      return defaultValue;
    };

    const acilisBakiyesi = Number(acilisBakiyesiRaw) || 0;
    const aktifMi = parseBoolean(aktifMiRaw, true);
    const cekKarnesiVarMi = parseBoolean(cekKarnesiVarMiRaw, false);
    const posVarMi = parseBoolean(posVarMiRaw, false);
    const krediKartiVarMi = parseBoolean(krediKartiVarMiRaw, false);

    const hesapAdi = hesapNoRaw ? `${bankaAdiRaw} - ${hesapNoRaw}` : bankaAdiRaw;
    const kodu = hesapNoRaw ? hesapNoRaw.substring(0, 4).toUpperCase() : 'BNK';

    // Use tmp- prefix for new banks (backend expects tmp-* IDs for new banks)
    parsed.push({
      id: `tmp-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
      bankaAdi: bankaAdiRaw,
      kodu,
      hesapAdi,
      iban: ibanRaw || undefined,
      acilisBakiyesi,
      aktifMi,
      cekKarnesiVarMi,
      posVarMi,
      krediKartiVarMi,
    });
  });

  return parsed;
}

/**
 * Trigger file input for CSV upload
 */
export function triggerCsvUpload(onFileSelected: (file: File) => void): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv';
  input.onchange = (e) => {
    const target = e.target as HTMLInputElement;
    if (target.files?.[0]) {
      onFileSelected(target.files[0]);
    }
  };
  input.click();
}

