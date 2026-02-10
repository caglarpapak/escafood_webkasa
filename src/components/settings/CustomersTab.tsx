import React, { useEffect, useState } from 'react';
import { Customer } from '../../models/customer';
import { generateId } from '../../utils/id';
import { nextCode, downloadCsv, parseCsvFile, parseCustomerCsv, triggerCsvUpload, CSV_DELIMITER } from '../../utils/settingsUtils';
import FormRow from '../FormRow';

interface Props {
  customers: Customer[];
  onSetCustomers: (customers: Customer[]) => void;
  onDirty: () => void;
  onSave: () => void;
  loading?: boolean;
}

const CustomersTab: React.FC<Props> = ({ customers, onSetCustomers, onDirty, onSave, loading = false }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ kod: string; ad: string; aktifMi: boolean }>({
    kod: '',
    ad: '',
    aktifMi: true,
  });

  useEffect(() => {
    if (editingId) {
      const customer = customers.find((c) => c.id === editingId);
      if (customer) {
        setForm({ kod: customer.kod, ad: customer.ad, aktifMi: customer.aktifMi });
      }
    } else {
      setForm({ kod: nextCode(customers, 'MUST'), ad: '', aktifMi: true });
    }
  }, [editingId, customers]);

  const handleSave = () => {
    if (!form.ad) return;
    onDirty();
    if (editingId) {
      onSetCustomers(
        customers.map((c) => (c.id === editingId ? { ...c, ad: form.ad, aktifMi: form.aktifMi } : c))
      );
    } else {
      onSetCustomers([...customers, { id: generateId(), kod: form.kod, ad: form.ad, aktifMi: form.aktifMi }]);
    }
    setEditingId(null);
  };

  const handleRemove = (id: string) => {
    onDirty();
    onSetCustomers(customers.filter((c) => c.id !== id));
  };

  const handleCsvDownload = () => {
    const lines = [
      ['kod', 'ad', 'aktifMi'].join(CSV_DELIMITER),
      ...customers.map((c) => [c.kod, c.ad, c.aktifMi ? 'true' : 'false'].join(CSV_DELIMITER)),
    ];
    downloadCsv(lines.join('\n'), 'customers-template.csv');
  };

  const handleCsvUpload = async (file: File) => {
    try {
      const lines = await parseCsvFile(file);
      const parsed = parseCustomerCsv(lines, customers);
      onDirty();
      onSetCustomers(parsed);
    } catch (error: any) {
      alert(error?.message || 'CSV yüklenirken bir hata oluştu.');
    }
  };

  return (
    <div className="settings-tab">
      <div className="settings-tab-header">
        <h3>Müşteriler</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="max-h-96 overflow-auto">
          <div className="flex justify-between mb-2 text-sm">
            <button className="text-indigo-600 hover:text-indigo-700" onClick={handleCsvDownload}>
              CSV Şablonu İndir
            </button>
            <button className="text-indigo-600 hover:text-indigo-700" onClick={() => triggerCsvUpload(handleCsvUpload)}>
              CSV Yükle
            </button>
          </div>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-3 py-2 border-b border-slate-200">Kod</th>
                <th className="text-left px-3 py-2 border-b border-slate-200">Ad</th>
                <th className="text-left px-3 py-2 border-b border-slate-200">Aktif</th>
                <th className="px-3 py-2 border-b border-slate-200"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                  onClick={() => setEditingId(customer.id)}
                >
                  <td className="px-3 py-2">{customer.kod}</td>
                  <td className="px-3 py-2">{customer.ad}</td>
                  <td className="px-3 py-2">{customer.aktifMi ? 'Evet' : 'Hayır'}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      className="text-rose-600 hover:text-rose-700 text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(customer.id);
                      }}
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="font-semibold text-slate-900">{editingId ? 'Müşteri Düzenle' : 'Yeni Müşteri'}</div>
            <button
              className="text-sm text-indigo-600 hover:text-indigo-700"
              onClick={() => setEditingId(null)}
            >
              Yeni
            </button>
          </div>

          <FormRow label="Kod">
            <input className="input" value={form.kod} readOnly />
          </FormRow>

          <FormRow label="Ad" required>
            <input
              className="input"
              value={form.ad}
              onChange={(e) => setForm({ ...form, ad: e.target.value })}
            />
          </FormRow>

          <label className="inline-flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={form.aktifMi}
              onChange={(e) => setForm({ ...form, aktifMi: e.target.checked })}
            />
            <span>Aktif</span>
          </label>

          <div className="flex justify-end pt-2">
            <button className="btn btn-primary" onClick={handleSave}>
              Ekle/Düzenle
            </button>
          </div>
        </div>
      </div>

      <div className="settings-actions mt-4">
        <button type="button" className="btn btn-primary" disabled={loading} onClick={() => onSave()}>
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </div>
  );
};

export default CustomersTab;

