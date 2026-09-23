import { Link } from 'react-router-dom';
import { CloudOff } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <CloudOff className="mx-auto h-12 w-12 text-signal-400" aria-hidden="true" />
      <h1 className="mt-5 font-display text-4xl font-extrabold text-white">Nothing here</h1>
      <p className="mt-3 text-mist-300">
        That page does not exist. The forecast, the chat and the alerts all still do.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary">Back home</Link>
        <Link to="/weather" className="btn-ghost">Check the weather</Link>
      </div>
    </div>
  );
}
