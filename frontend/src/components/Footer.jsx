import { Link } from 'react-router-dom';
import { CloudLightning } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-night-900">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-signal-500 text-night-900">
              <CloudLightning className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="font-display text-base font-extrabold text-white">WeatherGPT</span>
          </div>
          <p className="mt-3 text-sm text-mist-400">
            Conversational AI for weather forecasting, alerts and climate information.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-mist-400">
            <li><Link to="/weather" className="hover:text-signal-400">Weather</Link></li>
            <li><Link to="/weather-gpt" className="hover:text-signal-400">Ask WeatherGPT</Link></li>
            <li><Link to="/alerts" className="hover:text-signal-400">Alerts</Link></li>
            <li><Link to="/climate" className="hover:text-signal-400">Climate</Link></li>
            <li><Link to="/map" className="hover:text-signal-400">Map</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Data and sources</p>
          <ul className="mt-3 space-y-2 text-sm text-mist-400">
            <li>
              <a href="https://open-meteo.com" target="_blank" rel="noreferrer" className="hover:text-signal-400">
                Weather data: Open-Meteo
              </a>
            </li>
            <li>
              <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="hover:text-signal-400">
                Maps: OpenStreetMap contributors
              </a>
            </li>
            <li>Knowledge: WeatherGPT Knowledge Base</li>
            <li>AI: Google Gemini</li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Smart India Hackathon 2026</p>
          <ul className="mt-3 space-y-1 text-sm text-mist-400">
            <li>Problem Statement: SIH26068</li>
            <li>Theme: Disaster Management</li>
            <li>Team: Binary Brains (KU40)</li>
          </ul>
          <Link to="/about" className="mt-3 inline-block text-sm text-signal-400 hover:text-signal-300">
            About this project
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4">
        <p className="mx-auto max-w-7xl text-xs text-mist-400">
          WeatherGPT risk assessments are automated and are not official government warnings. Always follow
          IMD, NDMA and local authority instructions during severe weather.
        </p>
      </div>
    </footer>
  );
}
