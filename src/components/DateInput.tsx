interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
}

export default function DateInput({ value, onChange, min, max }: DateInputProps) {
  return (
    <div className="relative">
      <input
        type="date"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </span>
    </div>
  );
}
