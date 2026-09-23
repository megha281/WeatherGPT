import { useCallback, useEffect, useRef, useState } from 'react';

const SPEECH_LOCALES = { en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN', ta: 'ta-IN', te: 'te-IN' };

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
      setError('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    setError(null);

    const recognition = new SpeechRecognition();
    recognition.lang = SPEECH_LOCALES[language] || 'en-IN';
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
          ? 'Microphone permission was denied. Allow it in the browser address bar to use voice.'
          : 'Could not catch that. Try again, or type the question.'
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
