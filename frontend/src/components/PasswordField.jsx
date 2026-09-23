import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function PasswordField({ id, label, value, onChange, autoComplete = 'current-password', hint }) {
  const [visible, setVisible] = useState(false);
  const { t } = useLanguage();
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className="field pr-12"
          required
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 grid w-12 place-items-center text-mist-300 hover:text-white"
          aria-label={visible ? t('common.hidePassword') : t('common.showPassword')}
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
      {hint ? <p className="mt-1.5 text-xs text-mist-400">{hint}</p> : null}
    </div>
  );
}
