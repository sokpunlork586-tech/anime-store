import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface AuthCardLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const AuthCardLayout: React.FC<AuthCardLayoutProps> = ({
  title,
  subtitle,
  children,
  footer,
}) => (
  <div className="py-6 sm:py-10 px-4 flex items-center justify-center">
    <div className="w-full max-w-md rounded-3xl bg-[#FFFDF9] border border-[#EFE0CE] p-7 sm:p-9 shadow-[0_12px_32px_rgba(61,22,15,0.06)]">
      <div className="flex justify-center mb-5">
        <BrandLogo layout="stacked" size="sm" />
      </div>

      <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#3D160F] text-center">
        {title}
      </h1>
      <p className="mt-1.5 text-sm text-[#724A3E] text-center">{subtitle}</p>

      <div className="mt-6">{children}</div>

      {footer && (
        <div className="mt-6 pt-5 border-t border-[#F0E2D3] text-center text-xs text-[#724A3E]">
          {footer}
        </div>
      )}
    </div>
  </div>
);

interface AuthAlertProps {
  type: 'error' | 'success' | 'warning';
  message: string;
}

export const AuthAlert: React.FC<AuthAlertProps> = ({ type, message }) => {
  const styles =
    type === 'success'
      ? 'bg-[#2E7D32]/10 border-[#2E7D32]/30 text-[#1B5E20]'
      : type === 'warning'
        ? 'bg-[#D96532]/10 border-[#D96532]/35 text-[#8A3B17]'
        : 'bg-[#C62828]/10 border-[#C62828]/30 text-[#A31E1E]';

  const Icon = type === 'success' ? CheckCircle2 : AlertCircle;

  return (
    <div
      role="alert"
      className={`mb-4 rounded-xl border px-4 py-2.5 text-xs font-semibold flex items-start gap-2 ${styles}`}
    >
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
};

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = '••••••••',
  autoComplete = 'current-password',
  required = true,
  minLength,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-[#5A3224] mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Lock className="w-4 h-4 text-[#8E6453] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm text-[#3D160F] focus:outline-none focus:border-[#D96532] focus:ring-2 focus:ring-[#D96532]/15"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E6453] hover:text-[#3D160F] cursor-pointer"
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

interface GoogleSignInButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onClick,
  disabled = false,
  label = 'Continue with Google',
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className="w-full inline-flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-[#FFF8EF] hover:bg-[#F7DCC3]/55 border border-[#E7D2BC] text-sm font-semibold text-[#3D160F] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
  >
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
      />
    </svg>
    <span>{label}</span>
  </button>
);
