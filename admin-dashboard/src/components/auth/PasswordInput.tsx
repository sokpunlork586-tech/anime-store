import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  name?: string;
  id?: string;
  required?: boolean;
  className?: string;
}

export default function PasswordInput({
  value,
  onChange,
  placeholder = 'Password',
  error,
  name = 'password',
  id = 'password',
  required = false,
  className = '',
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
          <Lock size={18} />
        </div>

        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`w-full pl-10 pr-11 py-2 bg-white text-text-primary placeholder:text-text-muted/70 text-sm rounded-xl border transition-all duration-200 outline-none
            ${
              error
                ? 'border-danger focus:ring-2 focus:ring-danger/20'
                : 'border-border/80 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20'
            }`}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error && <p className="text-xs text-danger font-medium mt-1 pl-1">{error}</p>}
    </div>
  );
}
