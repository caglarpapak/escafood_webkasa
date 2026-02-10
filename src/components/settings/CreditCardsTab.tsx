import React from 'react';
import { CreditCard } from '../../models/card';

interface Props {
  cards: CreditCard[];
  bankOptions: Array<{ value: string; label: string }>;
  loading: boolean;
  onFieldChange: (cardId: string, field: keyof CreditCard, value: string | number | boolean | null) => void;
  onAdd: () => void;
  onDelete: (card: CreditCard) => void;
  onSave: () => void;
}

const CreditCardsTab: React.FC<Props> = ({
  cards,
  bankOptions,
  loading,
  onFieldChange,
  onAdd,
  onDelete,
  onSave,
}) => {
  return (
    <div className="settings-tab">
      <div className="settings-tab-header">
        <h3>Kredi Kartları</h3>
        <button type="button" className="btn btn-secondary" onClick={onAdd}>
          Yeni Kart
        </button>
      </div>

      <div className="settings-table-wrapper">
        <table className="settings-table">
          <thead>
            <tr>
              <th>Kart Adı</th>
              <th>Banka</th>
              <th>Limit</th>
              <th>Güncel Borç</th>
              <th>Son Ekstre Borcu</th>
              <th>Hesap Kesim Günü</th>
              <th>Son Ödeme Günü</th>
              <th>Aktif</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => (
              <tr key={card.id}>
                <td>
                  <input
                    className="input"
                    value={card.kartAdi}
                    onChange={(e) => onFieldChange(card.id, 'kartAdi', e.target.value)}
                  />
                </td>
                <td>
                  <select
                    className="input"
                    value={card.bankaId ?? ''}
                    onChange={(e) => onFieldChange(card.id, 'bankaId', e.target.value || null)}
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
                    value={card.limit ?? 0}
                    onChange={(e) => onFieldChange(card.id, 'limit', Number(e.target.value) || 0)}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    value={card.guncelBorc ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      onFieldChange(card.id, 'guncelBorc', val === '' ? null : Number(val));
                    }}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    value={card.sonEkstreBorcu ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      onFieldChange(card.id, 'sonEkstreBorcu', val === '' ? 0 : Number(val));
                    }}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    value={card.hesapKesimGunu ?? ''}
                    onChange={(e) =>
                      onFieldChange(card.id, 'hesapKesimGunu', e.target.value ? Number(e.target.value) || null : null)
                    }
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    value={card.sonOdemeGunu ?? ''}
                    onChange={(e) =>
                      onFieldChange(card.id, 'sonOdemeGunu', e.target.value ? Number(e.target.value) || null : null)
                    }
                  />
                </td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={card.aktifMi}
                    onChange={(e) => onFieldChange(card.id, 'aktifMi', e.target.checked)}
                  />
                </td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => onDelete(card)}>
                    Sil
                  </button>
                </td>
              </tr>
            ))}
            {cards.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-muted">
                  Kayıtlı kart yok.
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

export default CreditCardsTab;

