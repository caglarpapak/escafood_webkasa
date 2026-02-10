import React, { useEffect, useState } from 'react';
import { PosTerminal } from '../../models/pos';
import { BankMaster } from '../../models/bank';
import { generateId } from '../../utils/id';
import FormRow from '../FormRow';

interface Props {
  terminals: PosTerminal[];
  banks: BankMaster[];
  onSetTerminals: (terminals: PosTerminal[]) => void;
  onDirty: () => void;
  onSave: () => void;
  loading?: boolean;
}

const PosTab: React.FC<Props> = ({ terminals, banks, onSetTerminals, onDirty, onSave, loading = false }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ bankaId: '', posAdi: '', komisyonOrani: 0.02, aktifMi: true });

  useEffect(() => {
    if (editingId) {
      const terminal = terminals.find((p) => p.id === editingId);
      if (terminal) {
        setForm({
          bankaId: terminal.bankaId,
          posAdi: terminal.posAdi,
          komisyonOrani: terminal.komisyonOrani,
          aktifMi: terminal.aktifMi,
        });
      }
    } else {
      setForm({ bankaId: '', posAdi: '', komisyonOrani: 0.02, aktifMi: true });
    }
  }, [editingId, terminals]);

  const handleSave = () => {
    if (!form.bankaId || !form.posAdi) return;
    onDirty();
    if (editingId) {
      onSetTerminals(terminals.map((p) => (p.id === editingId ? { ...p, ...form } : p)));
    } else {
      onSetTerminals([...terminals, { id: generateId(), ...form }]);
    }
    setEditingId(null);
  };

  const handleRemove = (id: string) => {
    onDirty();
    onSetTerminals(terminals.filter((p) => p.id !== id));
  };

  return (
    <div className="settings-tab">
      <div className="settings-tab-header">
        <h3>POS</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-3 py-2 border-b border-slate-200">POS</th>
                <th className="text-left px-3 py-2 border-b border-slate-200">Banka</th>
                <th className="text-left px-3 py-2 border-b border-slate-200">Komisyon</th>
                <th className="px-3 py-2 border-b border-slate-200"></th>
              </tr>
            </thead>
            <tbody>
              {terminals.map((terminal) => (
                <tr
                  key={terminal.id}
                  className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                  onClick={() => setEditingId(terminal.id)}
                >
                  <td className="px-3 py-2">{terminal.posAdi}</td>
                  <td className="px-3 py-2">{banks.find((b) => b.id === terminal.bankaId)?.bankaAdi || '-'}</td>
                  <td className="px-3 py-2">{(terminal.komisyonOrani * 100).toFixed(2)}%</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      className="text-rose-600 hover:text-rose-700 text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(terminal.id);
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
            <div className="font-semibold text-slate-900">{editingId ? 'POS Düzenle' : 'Yeni POS'}</div>
            <button
              className="text-sm text-indigo-600 hover:text-indigo-700"
              onClick={() => setEditingId(null)}
            >
              Yeni
            </button>
          </div>

          <FormRow label="Banka" required>
            <select
              className="input"
              value={form.bankaId}
              onChange={(e) => setForm({ ...form, bankaId: e.target.value })}
            >
              <option value="">Seçiniz</option>
              {banks.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bank.bankaAdi}
                </option>
              ))}
            </select>
          </FormRow>

          <FormRow label="POS Adı" required>
            <input
              className="input"
              value={form.posAdi}
              onChange={(e) => setForm({ ...form, posAdi: e.target.value })}
            />
          </FormRow>

          <FormRow label="Komisyon Oranı" required>
            <input
              className="input"
              type="number"
              step="0.001"
              value={form.komisyonOrani}
              onChange={(e) => setForm({ ...form, komisyonOrani: Number(e.target.value) })}
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

          <div className="flex justify-end pt-2 gap-2">
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
              {editingId ? 'Güncelle' : 'Ekle'}
            </button>
            <button className="btn btn-secondary" onClick={() => onSave()} disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Tümünü Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosTab;

