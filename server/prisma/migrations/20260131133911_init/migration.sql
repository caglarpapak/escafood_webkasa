-- CreateTable
CREATE TABLE `PosTerminal` (
    `id` VARCHAR(191) NOT NULL,
    `bankId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `commissionRate` DECIMAL(5, 4) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NULL,
    `updatedBy` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bank` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `accountNo` VARCHAR(191) NULL,
    `iban` VARCHAR(191) NULL,
    `openingBalance` DECIMAL(18, 2) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NULL,
    `updatedBy` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CreditCard` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `bankId` VARCHAR(191) NULL,
    `limit` DECIMAL(18, 2) NULL,
    `closingDay` INTEGER NULL,
    `dueDay` INTEGER NULL,
    `installmentPrincipal` DECIMAL(18, 2) NULL,
    `installmentInterestRate` DECIMAL(18, 4) NULL,
    `installmentBsmvRate` DECIMAL(18, 4) NULL,
    `installmentCount` INTEGER NULL,
    `firstInstallmentDate` VARCHAR(191) NULL,
    `sonEkstreBorcu` DECIMAL(18, 2) NULL DEFAULT 0,
    `manualGuncelBorc` DECIMAL(18, 2) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NULL,
    `updatedBy` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CreditCardOperation` (
    `id` VARCHAR(191) NOT NULL,
    `creditCardId` VARCHAR(191) NOT NULL,
    `isoDate` VARCHAR(191) NOT NULL,
    `type` ENUM('HARCAMA', 'ODEME', 'IADE', 'FAIZ', 'AIDAT') NOT NULL,
    `amount` DECIMAL(18, 2) NOT NULL,
    `description` VARCHAR(191) NULL,
    `relatedTransactionId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NULL,
    `updatedBy` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cheque` (
    `id` VARCHAR(191) NOT NULL,
    `cekNo` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(18, 2) NOT NULL,
    `entryDate` VARCHAR(191) NOT NULL,
    `maturityDate` VARCHAR(191) NOT NULL,
    `status` ENUM('KASADA', 'BANKADA_TAHSILDE', 'ODEMEDE', 'TAHSIL_EDILDI', 'ODENDI', 'KARSILIKSIZ') NOT NULL,
    `direction` ENUM('ALACAK', 'BORC') NOT NULL,
    `customerId` VARCHAR(191) NULL,
    `supplierId` VARCHAR(191) NULL,
    `issuerBankName` VARCHAR(191) NOT NULL,
    `depositBankId` VARCHAR(191) NULL,
    `drawerName` VARCHAR(191) NOT NULL,
    `payeeName` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `attachmentId` VARCHAR(191) NULL,
    `imageDataUrl` VARCHAR(191) NULL,
    `paidAt` DATETIME(3) NULL,
    `paidBankId` VARCHAR(191) NULL,
    `paymentTransactionId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NULL,
    `updatedBy` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` VARCHAR(191) NULL,

    UNIQUE INDEX `Cheque_paymentTransactionId_key`(`paymentTransactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `taxNo` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NULL,
    `updatedBy` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Supplier` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `taxNo` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NULL,
    `updatedBy` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Attachment` (
    `id` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `base64Data` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NULL,
    `updatedBy` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` VARCHAR(191) NOT NULL,
    `isoDate` VARCHAR(191) NOT NULL,
    `documentNo` VARCHAR(191) NULL,
    `type` ENUM('NAKIT_TAHSILAT', 'NAKIT_ODEME', 'KASA_BANKA_TRANSFER_OUT', 'KASA_BANKA_TRANSFER_IN', 'BANKA_KASA_TRANSFER_OUT', 'BANKA_KASA_TRANSFER_IN', 'BANKA_HAVALE_GIRIS', 'BANKA_HAVALE_CIKIS', 'POS_TAHSILAT_BRUT', 'POS_KOMISYONU', 'KREDI_KARTI_HARCAMA', 'KREDI_KARTI_EKSTRE_ODEME', 'CEK_GIRISI', 'CEK_TAHSIL_BANKA', 'CEK_ODENMESI', 'CEK_KARSILIKSIZ', 'DEVIR_BAKIYE', 'DUZELTME', 'KREDI_TAKSIT_ODEME') NOT NULL,
    `source` ENUM('KASA', 'BANKA', 'POS', 'KREDI_KARTI', 'CEK', 'SENET', 'DIGER') NOT NULL,
    `counterparty` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `category` VARCHAR(191) NULL,
    `incoming` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `outgoing` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `bankDelta` DECIMAL(18, 2) NOT NULL DEFAULT 0,
    `displayIncoming` DECIMAL(18, 2) NULL,
    `displayOutgoing` DECIMAL(18, 2) NULL,
    `balanceAfter` DECIMAL(18, 2) NOT NULL,
    `cashAccountId` VARCHAR(191) NULL,
    `bankId` VARCHAR(191) NULL,
    `creditCardId` VARCHAR(191) NULL,
    `chequeId` VARCHAR(191) NULL,
    `customerId` VARCHAR(191) NULL,
    `supplierId` VARCHAR(191) NULL,
    `attachmentId` VARCHAR(191) NULL,
    `loanInstallmentId` VARCHAR(191) NULL,
    `transferGroupId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `createdByEmail` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NULL,
    `updatedBy` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` VARCHAR(191) NULL,

    INDEX `transactions_transferGroupId_idx`(`transferGroupId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `actorEmail` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NULL,
    `summary` VARCHAR(191) NOT NULL,
    `diff` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_actorEmail_idx`(`actorEmail`),
    INDEX `audit_logs_action_idx`(`action`),
    INDEX `audit_logs_entityType_idx`(`entityType`),
    INDEX `audit_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loans` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `bankId` VARCHAR(191) NOT NULL,
    `totalAmount` DECIMAL(18, 2) NOT NULL,
    `installmentCount` INTEGER NOT NULL,
    `firstInstallmentDate` VARCHAR(191) NOT NULL,
    `annualInterestRate` DECIMAL(18, 4) NOT NULL,
    `bsmvRate` DECIMAL(18, 4) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NULL,
    `updatedBy` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loan_installments` (
    `id` VARCHAR(191) NOT NULL,
    `loanId` VARCHAR(191) NOT NULL,
    `installmentNumber` INTEGER NOT NULL,
    `dueDate` VARCHAR(191) NOT NULL,
    `principal` DECIMAL(18, 2) NOT NULL,
    `interest` DECIMAL(18, 2) NOT NULL,
    `bsmv` DECIMAL(18, 2) NOT NULL,
    `totalAmount` DECIMAL(18, 2) NOT NULL,
    `status` ENUM('BEKLENIYOR', 'ODEME_ALINDI', 'GECIKMIS') NOT NULL DEFAULT 'BEKLENIYOR',
    `paidDate` VARCHAR(191) NULL,
    `transactionId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdBy` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NULL,
    `updatedBy` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `deletedBy` VARCHAR(191) NULL,

    UNIQUE INDEX `loan_installments_transactionId_key`(`transactionId`),
    UNIQUE INDEX `loan_installments_loanId_installmentNumber_key`(`loanId`, `installmentNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PosTerminal` ADD CONSTRAINT `PosTerminal_bankId_fkey` FOREIGN KEY (`bankId`) REFERENCES `Bank`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PosTerminal` ADD CONSTRAINT `PosTerminal_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PosTerminal` ADD CONSTRAINT `PosTerminal_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PosTerminal` ADD CONSTRAINT `PosTerminal_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bank` ADD CONSTRAINT `Bank_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bank` ADD CONSTRAINT `Bank_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bank` ADD CONSTRAINT `Bank_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditCard` ADD CONSTRAINT `CreditCard_bankId_fkey` FOREIGN KEY (`bankId`) REFERENCES `Bank`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditCard` ADD CONSTRAINT `CreditCard_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditCard` ADD CONSTRAINT `CreditCard_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditCard` ADD CONSTRAINT `CreditCard_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditCardOperation` ADD CONSTRAINT `CreditCardOperation_creditCardId_fkey` FOREIGN KEY (`creditCardId`) REFERENCES `CreditCard`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditCardOperation` ADD CONSTRAINT `CreditCardOperation_relatedTransactionId_fkey` FOREIGN KEY (`relatedTransactionId`) REFERENCES `transactions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditCardOperation` ADD CONSTRAINT `CreditCardOperation_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditCardOperation` ADD CONSTRAINT `CreditCardOperation_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditCardOperation` ADD CONSTRAINT `CreditCardOperation_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cheque` ADD CONSTRAINT `Cheque_depositBankId_fkey` FOREIGN KEY (`depositBankId`) REFERENCES `Bank`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cheque` ADD CONSTRAINT `Cheque_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cheque` ADD CONSTRAINT `Cheque_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cheque` ADD CONSTRAINT `Cheque_attachmentId_fkey` FOREIGN KEY (`attachmentId`) REFERENCES `Attachment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cheque` ADD CONSTRAINT `Cheque_paymentTransactionId_fkey` FOREIGN KEY (`paymentTransactionId`) REFERENCES `transactions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cheque` ADD CONSTRAINT `Cheque_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cheque` ADD CONSTRAINT `Cheque_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cheque` ADD CONSTRAINT `Cheque_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supplier` ADD CONSTRAINT `Supplier_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supplier` ADD CONSTRAINT `Supplier_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supplier` ADD CONSTRAINT `Supplier_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attachment` ADD CONSTRAINT `Attachment_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attachment` ADD CONSTRAINT `Attachment_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attachment` ADD CONSTRAINT `Attachment_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_bankId_fkey` FOREIGN KEY (`bankId`) REFERENCES `Bank`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_creditCardId_fkey` FOREIGN KEY (`creditCardId`) REFERENCES `CreditCard`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_chequeId_fkey` FOREIGN KEY (`chequeId`) REFERENCES `Cheque`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_attachmentId_fkey` FOREIGN KEY (`attachmentId`) REFERENCES `Attachment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loans` ADD CONSTRAINT `loans_bankId_fkey` FOREIGN KEY (`bankId`) REFERENCES `Bank`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loans` ADD CONSTRAINT `loans_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loans` ADD CONSTRAINT `loans_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loans` ADD CONSTRAINT `loans_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loan_installments` ADD CONSTRAINT `loan_installments_loanId_fkey` FOREIGN KEY (`loanId`) REFERENCES `loans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loan_installments` ADD CONSTRAINT `loan_installments_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loan_installments` ADD CONSTRAINT `loan_installments_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loan_installments` ADD CONSTRAINT `loan_installments_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loan_installments` ADD CONSTRAINT `loan_installments_deletedBy_fkey` FOREIGN KEY (`deletedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
