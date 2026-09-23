import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MailCheck, MailX } from 'lucide-react';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { LoadingBlock, Spinner } from '../components/Loading';

export default function VerifyEmail() {
  const { token } = useParams();
  const { user, setUser } = useAuth();
  const [state, setState] = useState({ status: 'checking', message: '' });
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(null);

  useEffect(() => {
    let cancelled = false;
    authService
      .verifyEmail(token)
      .then((data) => {
        if (cancelled) return;
        setState({ status: 'done', message: data.message });
        if (data.user) setUser(data.user);
      })
      .catch((err) => !cancelled && setState({ status: 'failed', message: err.message }));
    return () => {
      cancelled = true;
    };
  }, [token, setUser]);

  const resend = async () => {
    setResending(true);
    try {
      const data = await authService.resendVerification(user?.email);
      setResent(data.dev?.verifyUrl ? `${data.message} Development link: ${data.dev.verifyUrl}` : data.message);
    } catch (err) {
      setResent(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      {state.status === 'checking' ? (
        <LoadingBlock label="Verifying your email…" />
      ) : state.status === 'done' ? (
        <div className="panel p-8 text-center">
          <MailCheck className="mx-auto h-10 w-10 text-signal-400" aria-hidden="true" />
          <h1 className="mt-4 font-display text-2xl font-extrabold text-white">Email verified</h1>
          <p className="mt-2 text-mist-300">{state.message}</p>
          <Link to="/dashboard" className="btn-primary mt-6">
            Go to dashboard
          </Link>
        </div>
      ) : (
        <div className="panel p-8 text-center">
          <MailX className="mx-auto h-10 w-10 text-risk-high" aria-hidden="true" />
          <h1 className="mt-4 font-display text-2xl font-extrabold text-white">That link did not work</h1>
          <p className="mt-2 text-mist-300">{state.message}</p>
          <p className="mt-2 text-sm text-mist-400">
            Verification links expire after 24 hours. Request a new one and check the backend terminal if email is not
            configured.
          </p>
          <button type="button" onClick={resend} className="btn-ghost mt-6" disabled={resending || !user}>
            {resending ? <Spinner /> : null}
            Resend verification email
          </button>
          {!user ? <p className="mt-2 text-xs text-mist-400">Sign in first to request a new link.</p> : null}
          {resent ? <p className="mt-3 break-all text-sm text-mist-200">{resent}</p> : null}
        </div>
      )}
    </div>
  );
}
