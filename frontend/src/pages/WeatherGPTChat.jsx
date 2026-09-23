import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation as useRouterLocation, useSearchParams } from 'react-router-dom';
import { MapPin, Trash2 } from 'lucide-react';
import chatService from '../services/chatService';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import ChatMessage from '../components/ChatMessage';
import ChatComposer from '../components/ChatComposer';
import TypingIndicator from '../components/TypingIndicator';
import LocationSearch from '../components/LocationSearch';
import SUGGESTED_QUESTIONS from '../utils/suggestions';

export default function WeatherGPTChat() {
  const { t, language } = useLanguage();
  const { location } = useLocation();
  const routerLocation = useRouterLocation();
  const [searchParams] = useSearchParams();

  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [chatId, setChatId] = useState(null);
  const scrollRef = useRef(null);
  const askedRef = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const send = useCallback(
    async (text) => {
      setError(null);
      setMessages((list) => [...list, { role: 'user', content: text }]);
      setBusy(true);
      try {
        const result = await chatService.ask({
          message: text,
          location: location ? { name: location.name, latitude: location.latitude, longitude: location.longitude } : null,
          language,
          chatId,
          history: messages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
        });
        if (result.chatId) setChatId(result.chatId);
        setMessages((list) => [
          ...list,
          {
            role: 'assistant',
            content: result.answer,
            structured: {
              location: result.location,
              weather: result.weather,
              risk: result.risk,
              advisory: result.advisory,
              sources: result.sources,
            },
          },
        ]);
      } catch (err) {
        setError(err.message);
      } finally {
        setBusy(false);
      }
    },
    [chatId, language, location, messages]
  );

  // A question handed over from the landing page or a ?q= link is asked once.
  useEffect(() => {
    const seeded = routerLocation.state?.question || searchParams.get('q');
    if (seeded && !askedRef.current) {
      askedRef.current = true;
      send(seeded);
    }
  }, [routerLocation.state, searchParams, send]);

  const clear = () => {
    setMessages([]);
    setChatId(null);
    setError(null);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-white">{t('chat.title')}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-mist-300">
            <MapPin className="h-4 w-4 text-signal-400" aria-hidden="true" />
            {location?.label || location?.name}
          </p>
        </div>
        <button type="button" onClick={clear} className="btn-ghost" disabled={!messages.length}>
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          {t('chat.clear')}
        </button>
      </header>

      <div className="mt-4 max-w-lg">
        <LocationSearch />
      </div>

      <section className="mt-5 flex h-[62vh] min-h-[28rem] flex-col overflow-hidden rounded-2xl border border-white/10 bg-night-800/60">
        <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
          {messages.length === 0 && !busy ? (
            <div className="py-6">
              <p className="font-display text-xl font-bold text-white">Ask about the weather where you are.</p>
              <p className="mt-2 text-sm text-mist-300">
                Every number in the answer comes from Open-Meteo for the place and time you asked about. Risk levels
                come from our rule engine and are always labelled as a WeatherGPT Risk Assessment, never as an official
                warning.
              </p>
              <p className="mt-6 text-sm text-mist-400">{t('chat.suggestions')}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button key={q} type="button" onClick={() => send(q)} className="chip hover:border-signal-500/60">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((message, i) => (
            <ChatMessage key={i} message={message} />
          ))}

          {busy ? <TypingIndicator /> : null}
          {error ? (
            <p className="rounded-xl border border-risk-severe/40 bg-risk-severe/10 px-4 py-3 text-sm text-mist-100">{error}</p>
          ) : null}
        </div>

        <ChatComposer onSend={send} busy={busy} />
      </section>

      <p className="mt-3 text-xs text-mist-400">
        Weather data: Open-Meteo · Knowledge: WeatherGPT Knowledge Base · AI: Google Gemini. Gemini explains the data;
        it does not produce the measurements.
      </p>
    </div>
  );
}
