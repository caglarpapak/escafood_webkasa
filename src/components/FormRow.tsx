import React from 'react';

interface FormRowProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

export default function FormRow({ label, required, children }: FormRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
      <label className="text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="text-rose-600"> *</span> : null}
      </label>
      <div className="md:col-span-2 space-y-2">{children}</div>
    </div>
  );
}
