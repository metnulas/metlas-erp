import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function Field({ label, error, required = false, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
