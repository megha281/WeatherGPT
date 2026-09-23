import SavedLocationsPanel from '../components/SavedLocationsPanel';
import { useLanguage } from '../context/LanguageContext';

export default function SavedLocations() {
  const { t } = useLanguage();
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header>
        <h1 className="font-display text-3xl font-extrabold text-white">{t('nav.savedLocations')}</h1>
        <p className="mt-1 text-mist-300">
          {t('saved.description')}
        </p>
      </header>

      <div className="mt-6">
        <SavedLocationsPanel allowAdd />
      </div>
    </div>
  );
}
