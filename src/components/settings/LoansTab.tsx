import React from 'react';
import { Loan } from '../../models/loan';

interface Props {
  loans: Loan[];
  bankOptions: Array<{ value: string; label: string }>;
  loading: boolean;
  onFieldChange: (loanId: string, field: keyof Loan, value: string | number | boolean) => void;
  onAdd: () => void;
  onDelete: (loan: Loan) => void;
  onSave: () => void;
}

const LoansTab: React.FC<Props> = ({ loans, bankOptions, loading, onFieldChange, onAdd, onDelete, onSave }) => {
  return (
    <div className="settings-tab">
      <div className="settings-tab-header">
        <h3>Krediler</h3>
        <button type="button" className="btn btn-secondary" onClick={onAdd}>
          Yeni Kredi
        </button>
      </div>

      <div className="settings-table-wrapper">
        <table className="settings-table">
          <thead>
            <tr>
              <th>Kredi Adı</th>
              <th>Banka</th>
              <th>Toplam Tutar</th>
              <th>Taksit Sayısı</th>
              <th>İlk Taksit Tarihi</th>
              <th>Yıllık Faiz Oranı (%)</th>
              <th>BSMV Oranı (%)</th>
              <th>Aktif</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td>
                  <input
                    className="input"
                    value={loan.name}
                    onChange={(e) => onFieldChange(loan.id, 'name', e.target.value)}
                  />
                </td>
                <td>
                  <select
                    className="input"
                    value={loan.bankId}
                    onChange={(e) => onFieldChange(loan.id, 'bankId', e.target.value)}
                  >
                    <option value="">Seçilmedi</option>
                    {bankOptions.map((bank) => (
                      <option key={bank.value} value={bank.value}>
                        {bank.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    value={loan.totalAmount ?? 0}
                    onChange={(e) => onFieldChange(loan.id, 'totalAmount', Number(e.target.value) || 0)}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    value={loan.installmentCount ?? 0}
                    onChange={(e) => onFieldChange(loan.id, 'installmentCount', Number(e.target.value) || 0)}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="date"
                    value={loan.firstInstallmentDate}
                    onChange={(e) => onFieldChange(loan.id, 'firstInstallmentDate', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={loan.annualInterestRate ?? 0}
                    onChange={(e) => onFieldChange(loan.id, 'annualInterestRate', Number(e.target.value) || 0)}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={loan.bsmvRate ?? 0}
                    onChange={(e) => onFieldChange(loan.id, 'bsmvRate', Number(e.target.value) || 0)}
                  />
                </td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={loan.isActive}
                    onChange={(e) => onFieldChange(loan.id, 'isActive', e.target.checked)}
                  />
                </td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => onDelete(loan)}>
                    Sil
                  </button>
                </td>
              </tr>
            ))}
            {loans.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-muted">
                  Kayıtlı kredi yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="settings-actions">
        <button type="button" className="btn btn-primary" disabled={loading} onClick={onSave}>
          Kaydet
        </button>
      </div>
    </div>
  );
};

export default LoansTab;

