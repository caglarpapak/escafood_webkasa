import React, { useEffect, useState } from 'react';
import { Supplier } from '../../models/supplier';
import { generateId } from '../../utils/id';
import { nextCode, downloadCsv, parseCsvFile, parseSupplierCsv, triggerCsvUpload, CSV_DELIMITER } from '../../utils/settingsUtils';
import FormRow from '../FormRow';

interface Props {
  suppliers: Supplier[];
  onSetSuppliers: (suppliers: Supplier[]) => void;
  onDirty: () => void;
  onSave: () => void;
  loading?: boolean;
}

const SuppliersTab: React.FC<Props> = ({ suppliers, onSetSuppliers, onDirty, onSave, loading = false }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ kod: string; ad: string; aktifMi: boolean }>({
    kod: '',
    ad: '',
    aktifMi: true,
  });

  useEffect(() => {
    if (editingId) {
      const supplier = suppliers.find((s) => s.id === editingId);
      if (supplier) {
        setForm({ kod: supplier.kod, ad: supplier.ad, aktifMi: supplier.aktifMi });
      }
    } else {
      setForm({ kod: nextCode(suppliers, 'TED'), ad: '', aktifMi: true });
    }
  }, [editingId, suppliers]);

  const handleSave = () => {
    if (!form.ad || !form.ad.trim()) {
      alert('Tedarikçi adı gereklidir.');
      return;
    }
    onDirty();
    if (editingId) {
      onSetSuppliers(
        suppliers.map((s) => (s.id === editingId ? { ...s, ad: form.ad.trim(), aktifMi: form.aktifMi } : s))
      );
    } else {
      const newSupplier = { id: generateId(), kod: form.kod, ad: form.ad.trim(), aktifMi: form.aktifMi };
      console.log('SuppliersTab - Adding new supplier:', newSupplier);
      onSetSuppliers([...suppliers, newSupplier]);
    }
    setEditingId(null);
    // Reset form for next entry
    setForm({ kod: nextCode(suppliers, 'TED'), ad: '', aktifMi: true });
  };

  const handleRemove = (id: string) => {
    onDirty();
    onSetSuppliers(suppliers.filter((s) => s.id !== id));
  };

  const handleCsvDownload = () => {
    const lines = [
      ['kod', 'ad', 'aktifMi'].join(CSV_DELIMITER),
      ...suppliers.map((s) => [s.kod, s.ad, s.aktifMi ? 'true' : 'false'].join(CSV_DELIMITER)),
    ];
    downloadCsv(lines.join('\n'), 'suppliers-template.csv');
  };

  const handleCsvUpload = async (file: File) => {
    try {
      const lines = await parseCsvFile(file);
      const parsed = parseSupplierCsv(lines, suppliers);
      onDirty();
      onSetSuppliers(parsed);
    } catch (error: any) {
      alert(error?.message || 'CSV yüklenirken bir hata oluştu.');
    }
  };

  return (
    <div className="settings-tab">
      <div className="settings-tab-header">
        <h3>Tedarikçiler</h3>
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
              {suppliers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-slate-500">
                    Kayıtlı tedarikçi yok. Sağdaki formdan yeni tedarikçi ekleyin.
                  </td>
                </tr>
              )}
              {suppliers.map((supplier) => (
                <tr
                  key={supplier.id}
                  className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                  onClick={() => setEditingId(supplier.id)}
                >
                  <td className="px-3 py-2">{supplier.kod}</td>
                  <td className="px-3 py-2">{supplier.ad}</td>
                  <td className="px-3 py-2">{supplier.aktifMi ? 'Evet' : 'Hayır'}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      className="text-rose-600 hover:text-rose-700 text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(supplier.id);
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
            <div className="font-semibold text-slate-900">{editingId ? 'Tedarikçi Düzenle' : 'Yeni Tedarikçi'}</div>
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

export default SuppliersTab;

