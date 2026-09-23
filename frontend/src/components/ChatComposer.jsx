import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Send } from 'lucide-react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { useLanguage } from '../context/LanguageContext';
import { Spinner } from './Loading';

export default function ChatComposer({ onSend, busy = false }) {
  const { t, language } = useLanguage();
  const [value, setValue] = useState('');
  const inputRef = useRef(null);
  const { supported, listening, error, toggle } = useSpeechRecognition({
    language,
    onResult: (transcript) => setValue((current) => (current ? `${current} ${transcript}` : transcript)),
  });

  useEffect(() => {
    if (!busy) inputRef.current?.focus();
  }, [busy]);

  const submit = () => {
    const text = value.trim();
    if (!text || busy) return;
    setValue('');
    onSend(text);
  };

  return (
    <div className="border-t border-white/10 bg-night-900/80 p-3">
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={t('chat.placeholder')}
          aria-label={t('chat.placeholder')}
          className="field max-h-40 min-h-[48px] flex-1 resize-y py-3"
        />

        <button
          type="button"
          onClick={toggle}
          className={`btn-ghost h-12 ${listening ? 'border-signal-500 text-signal-400' : ''}`}
          title={supported ? t('chat.voice') : t('chat.voiceUnsupported')}
          aria-label={t('chat.voice')}
        >
          {listening ? <MicOff className="h-5 w-5" aria-hidden="true" /> : <Mic className="h-5 w-5" aria-hidden="true" />}
        </button>

        <button type="button" onClick={submit} disabled={busy || !value.trim()} className="btn-primary h-12">
          {busy ? <Spinner /> : <Send className="h-4 w-4" aria-hidden="true" />}
          <span className="hidden sm:inline">{t('chat.send')}</span>
        </button>
      </div>

      {listening ? <p className="mt-2 text-sm text-signal-400">{t('chat.listening')}</p> : null}
      {!supported ? <p className="mt-2 text-xs text-mist-400">{t('chat.voiceUnsupported')}</p> : null}
      {error ? <p className="mt-2 text-sm text-risk-moderate">{error}</p> : null}
    </div>
  );
}
