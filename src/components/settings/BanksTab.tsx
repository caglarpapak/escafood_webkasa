import React from 'react';
import { BankMaster } from '../../models/bank';
import { BankFlagMap, downloadCsv, parseCsvFile, parseBankCsv, triggerCsvUpload, CSV_DELIMITER } from '../../utils/settingsUtils';

interface Props {
  banks: BankMaster[];
  bankFlags: BankFlagMap;
  loading: boolean;
  onFieldChange: (bankId: string, field: keyof BankMaster, value: string | number | boolean) => void;
  onFlagChange: (bankId: string, field: keyof BankFlagMap[string], value: boolean) => void;
  onAdd: () => void;
  onDelete: (bank: BankMaster) => void;
  onSave: (banks?: BankMaster[]) => Promise<BankMaster[]>;
  onSetBanks: (banks: BankMaster[]) => void;
  onDirty: () => void;
}

const BanksTab: React.FC<Props> = ({
  banks,
  bankFlags,
  loading,
  onFieldChange,
  onFlagChange,
  onAdd,
  onDelete,
  onSave,
  onSetBanks,
  onDirty,
}) => {
  const handleCsvDownload = () => {
    const lines = [
      ['bankaAdi', 'hesapNo', 'iban', 'acilisBakiyesi', 'aktifMi', 'cekKarnesiVarMi', 'posVarMi', 'krediKartiVarMi'].join(CSV_DELIMITER),
      ...banks.map((b) => {
        const hesapNo = b.hesapAdi.includes(' - ') ? b.hesapAdi.split(' - ')[1] : '';
        return [
          b.bankaAdi,
          hesapNo,
          b.iban || '',
          String(b.acilisBakiyesi || 0),
          b.aktifMi ? 'true' : 'false',
          b.cekKarnesiVarMi ? 'true' : 'false',
          b.posVarMi ? 'true' : 'false',
          b.krediKartiVarMi ? 'true' : 'false',
        ].join(CSV_DELIMITER);
      }),
    ];
    downloadCsv(lines.join('\n'), 'banks-template.csv');
  };

  const handleCsvUpload = async (file: File) => {
    try {
      const lines = await parseCsvFile(file);
      const parsed = parseBankCsv(lines, banks);
      
      if (parsed.length === 0) {
        alert('CSV dosyasında geçerli banka bulunamadı.');
        return;
      }
      
      // Update local state first
      onDirty();
      onSetBanks(parsed);
      
      try {
        const result = await onSave(parsed);
        if (result && Array.isArray(result) && result.length > 0) {
          alert(`${parsed.length} banka CSV'den yüklendi ve başarıyla kaydedildi.`);
        } else {
          alert(`${parsed.length} banka CSV'den yüklendi. Kaydetme işlemi tamamlandı.`);
        }
      } catch (saveError: any) {
        alert(`Banka kaydedilirken hata oluştu: ${saveError?.message || 'Bilinmeyen hata'}`);
        throw saveError;
      }
    } catch (error: any) {
      console.error('CSV upload error:', error);
      alert(error?.message || 'CSV yüklenirken bir hata oluştu.');
    }
  };

  return (
    <div className="settings-tab">
      <div className="settings-tab-header">
        <h3>Bankalar</h3>
        <div className="flex gap-2">
          <button className="text-indigo-600 hover:text-indigo-700 text-sm" onClick={handleCsvDownload}>
            CSV Şablonu İndir
          </button>
          <button className="text-indigo-600 hover:text-indigo-700 text-sm" onClick={() => triggerCsvUpload(handleCsvUpload)}>
            CSV Yükle
          </button>
          <button type="button" className="btn btn-secondary" onClick={onAdd}>
            Yeni Banka
          </button>
        </div>
      </div>

      <div className="settings-table-wrapper">
        <table className="settings-table">
          <thead>
            <tr>
              <th>Banka Adı</th>
              <th>Hesap No</th>
              <th>IBAN</th>
              <th>Açılış Bakiyesi</th>
              <th>Aktif</th>
              <th>Çek Karnesi</th>
              <th>POS</th>
              <th>Kredi Kartı</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {banks.map((bank) => (
              <tr key={bank.id}>
                <td>
                  <input
                    className="input"
                    value={bank.bankaAdi}
                    onChange={(e) => onFieldChange(bank.id, 'bankaAdi', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    value={bank.hesapAdi.includes(' - ') ? bank.hesapAdi.split(' - ')[1] : ''}
                    onChange={(e) => {
                      const accountNo = e.target.value;
                      onFieldChange(
                        bank.id,
                        'hesapAdi',
                        accountNo ? `${bank.bankaAdi} - ${accountNo}` : bank.bankaAdi
                      );
                      onFieldChange(
                        bank.id,
                        'kodu',
                        accountNo ? accountNo.substring(0, 4).toUpperCase() : 'BNK'
                      );
                    }}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    value={bank.iban ?? ''}
                    onChange={(e) => onFieldChange(bank.id, 'iban', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    value={bank.acilisBakiyesi ?? 0}
                    onChange={(e) => onFieldChange(bank.id, 'acilisBakiyesi', Number(e.target.value) || 0)}
                  />
                </td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={bank.aktifMi}
                    onChange={(e) => onFieldChange(bank.id, 'aktifMi', e.target.checked)}
                  />
                </td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={!!bank.cekKarnesiVarMi}
                    onChange={(e) => onFlagChange(bank.id, 'cekKarnesiVarMi', e.target.checked)}
                  />
                </td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={!!bank.posVarMi}
                    onChange={(e) => onFlagChange(bank.id, 'posVarMi', e.target.checked)}
                  />
                </td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={!!bank.krediKartiVarMi}
                    onChange={(e) => onFlagChange(bank.id, 'krediKartiVarMi', e.target.checked)}
                  />
                </td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => onDelete(bank)}>
                    Sil
                  </button>
                </td>
              </tr>
            ))}
            {banks.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-muted">
                  Kayıtlı banka yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="settings-actions">
        <button type="button" className="btn btn-primary" disabled={loading} onClick={() => onSave()}>
          Kaydet
        </button>
      </div>
    </div>
  );
};

export default BanksTab;

