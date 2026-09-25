import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import { CloudLightning, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';

const PUBLIC_LINKS = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/weather', key: 'nav.weather' },
  { to: '/weather-gpt', key: 'nav.chat' },
  { to: '/alerts', key: 'nav.alerts' },
  { to: '/map', key: 'nav.map' },
  { to: '/about', key: 'nav.about' },
];

const ACCOUNT_LINKS = [
  { to: '/dashboard', key: 'nav.dashboard' },
  { to: '/saved-locations', key: 'nav.savedLocations' },
  { to: '/chat-history', key: 'nav.chatHistory' },
  { to: '/profile', key: 'nav.profile' },
  { to: '/settings', key: 'nav.settings' },
];

function linkClass({ isActive }) {
  return `rounded-lg px-3 py-2 text-sm transition ${
    isActive ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-100' : 'text-slate-600 hover:text-slate-900'
  }`;
}

export default function Navbar() {
  const { t } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const routerLocation = useRouterLocation();
  const navigate = useNavigate();

  // Close the mobile menu whenever the route changes.
  useEffect(() => setOpen(false), [routerLocation.pathname]);

  const signOut = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-500 text-white shadow-sm">
            <CloudLightning className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-slate-900">WeatherGPT</span>
        </Link>

        <div className="ml-4 hidden items-center gap-1 lg:flex">
          {PUBLIC_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {t(link.key)}
            </NavLink>
          ))}
        </div>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <LanguageSelector />
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                {t('nav.dashboard')}
              </NavLink>
              <NavLink to="/profile" className={linkClass}>
                {t('nav.profile')}
              </NavLink>
              <button type="button" onClick={signOut} className="btn-ghost">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">
                {t('nav.signin')}
              </Link>
              <Link to="/register" className="btn-primary">
                {t('nav.signup')}
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="btn-ghost ml-auto lg:hidden"
          aria-expanded={open}
          aria-label={t('common.menu')}
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </nav>

      {open ? (
        <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div className="grid gap-1">
            {PUBLIC_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                {t(link.key)}
              </NavLink>
            ))}
          </div>

          <div className="mt-3 border-t border-slate-200 pt-3">
            {isAuthenticated ? (
              <div className="grid gap-1">
                <p className="px-3 py-1 text-xs text-slate-500">{user?.name}</p>
                {ACCOUNT_LINKS.map((link) => (
                  <NavLink key={link.to} to={link.to} className={linkClass}>
                    {t(link.key)}
                  </NavLink>
                ))}
                <button type="button" onClick={signOut} className="btn-ghost mt-2">
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="btn-ghost flex-1">
                  {t('nav.signin')}
                </Link>
                <Link to="/register" className="btn-primary flex-1">
                  {t('nav.signup')}
                </Link>
              </div>
            )}
          </div>

          <div className="mt-3 border-t border-slate-200 pt-3">
            <LanguageSelector className="w-full" />
          </div>
        </div>
      ) : null}
    </header>
  );
}
