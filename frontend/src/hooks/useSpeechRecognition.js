import { useCallback, useEffect, useRef, useState } from 'react';

import { LANGUAGE_META } from '../i18n/localeData';
import translations from '../i18n/translations';

const SPEECH_LOCALES = Object.fromEntries(LANGUAGE_META.map(({ code, speech }) => [code, speech]));

/**
 * Browser speech recognition (Chrome and Edge). Returns supported=false
 * elsewhere so the UI can show a clear fallback message instead of a dead button.
 */
export default function useSpeechRecognition({ language = 'en', onResult } = {}) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  const SpeechRecognition =
    typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
  const supported = Boolean(SpeechRecognition);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    if (!supported) {
      setError(translations[language]?.['voice.unsupported'] || translations.en['voice.unsupported']);
      return;
    }
    setError(null);

    const recognition = new SpeechRecognition();
    recognition.lang = SPEECH_LOCALES[language] || SPEECH_LOCALES.en;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript && onResultRef.current) onResultRef.current(transcript);
    };
    recognition.onerror = (event) => {
      setError(
        event.error === 'not-allowed'
          ? translations[language]?.['voice.permission'] || translations.en['voice.permission']
          : translations[language]?.['voice.failed'] || translations.en['voice.failed']
      );
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [SpeechRecognition, language, supported]);

  useEffect(() => () => recognitionRef.current?.abort?.(), []);

  return { supported, listening, error, start, stop, toggle: () => (listening ? stop() : start()) };
}
