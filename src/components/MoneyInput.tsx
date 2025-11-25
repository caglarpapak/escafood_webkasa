import { useEffect, useState } from 'react';
import { formatTlPlain, parseTl } from '../utils/money';

interface MoneyInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
}

export default function MoneyInput({ value, onChange, placeholder }: MoneyInputProps) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (value === null || Number.isNaN(value)) {
      setInputValue('');
    } else {
      setInputValue(formatTlPlain(value));
    }
  }, [value]);

  const handleChange = (val: string) => {
    setInputValue(val);
    const parsed = parseTl(val);
    onChange(parsed);
  };

  const handleBlur = () => {
    const parsed = parseTl(inputValue);
    if (parsed === null) {
      setInputValue('');
    } else {
      setInputValue(formatTlPlain(parsed));
    }
  };

  return (
    <input
      className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      value={inputValue}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      placeholder={placeholder}
    />
  );
}
