import React, { useEffect, useState } from 'react';
import { formatTlPlain, parseTl } from '../utils/money';

interface MoneyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number | null;
  onChange: (value: number | null) => void;
}

const MoneyInput: React.FC<MoneyInputProps> = ({ value, onChange, ...rest }) => {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isFocused) return;

    if (value == null || Number.isNaN(value)) {
      setText('');
    } else {
      setText(formatTlPlain(value));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextText = e.target.value;
    setText(nextText);

    const parsed = parseTl(nextText);
    if (parsed == null) {
      onChange(null);
    } else {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);

    const trimmed = text.trim();
    if (!trimmed) {
      onChange(null);
      setText('');
      return;
    }

    const parsed = parseTl(trimmed);
    if (parsed == null) return;

    onChange(parsed);
    setText(formatTlPlain(parsed));
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <input
      {...rest}
      value={text}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      inputMode="decimal"
    />
  );
};

export default MoneyInput;
