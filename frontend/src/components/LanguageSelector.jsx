import { Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSelector({ className = '', onChange }) {
  const { language, setLanguage, languages } = useLanguage();

  const handle = (event) => {
    setLanguage(event.target.value);
    if (onChange) onChange(event.target.value);
  };

  return (
    <label className={`inline-flex items-center gap-2 rounded-xl border border-white/10 bg-night-800/70 px-3 py-2 ${className}`}>
      <Languages className="h-4 w-4 text-signal-400" aria-hidden="true" />
      <span className="sr-only">Language</span>
      <select value={language} onChange={handle} className="bg-transparent text-sm text-mist-100 focus:outline-none">
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-night-800">
            {lang.native}
          </option>
        ))}
      </select>
    </label>
  );
}
