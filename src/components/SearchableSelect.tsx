import { useEffect, useMemo, useState } from 'react';

export interface SearchableSelectOption {
  id: string;
  label: string;
}

interface SearchableSelectProps {
  label?: string;
  valueId: string | null;
  options: SearchableSelectOption[];
  placeholder?: string;
  onChange: (id: string | null) => void;
  required?: boolean;
}

export default function SearchableSelect({
  valueId,
  options,
  placeholder,
  onChange,
  label,
  required,
}: SearchableSelectProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(query.toLowerCase()));
  }, [options, query]);

  const currentLabel = valueId ? options.find((o) => o.id === valueId)?.label || '' : '';

  return (
    <div className="relative w-full max-w-full">
      {label ? (
        <div className="text-sm font-medium text-slate-700 mb-1">
          {label}
          {required ? <span className="text-rose-600"> *</span> : null}
        </div>
      ) : null}
      <input
        className="w-full max-w-full truncate rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        value={open ? query : currentLabel}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        placeholder={placeholder}
        readOnly={false}
      />
      {open && (
        <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500">Sonuç bulunamadı</div>
          ) : (
            filtered.map((opt) => (
              <div
                key={opt.id}
                className="cursor-pointer px-3 py-2 text-sm hover:bg-emerald-50"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(opt.id);
                  setQuery(opt.label);
                  setOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
      <button
        type="button"
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400"
        onClick={() => {
          onChange(null);
          setQuery('');
          setOpen(false);
        }}
        tabIndex={-1}
      >
        ✕
      </button>
    </div>
  );
}
