import { useCallback, useEffect, useState } from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import chatService from '../services/chatService';
import { useLanguage } from '../context/LanguageContext';
import ChatMessage from '../components/ChatMessage';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { LoadingBlock, Spinner } from '../components/Loading';
import { relativeTime } from '../utils/format';

export default function ChatHistory() {
  const { t } = useLanguage();
  const [chats, setChats] = useState([]);
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingOne, setLoadingOne] = useState(false);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setChats(await chatService.history());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openChat = async (id) => {
    setLoadingOne(true);
    try {
      setOpen(await chatService.get(id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingOne(false);
    }
  };

  const remove = async (id) => {
    setPending(id);
    try {
      await chatService.remove(id);
      setChats((list) => list.filter((c) => c.id !== id));
      if (open?.id === id) setOpen(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(null);
    }
  };

  const clearAll = async () => {
    setPending('all');
    try {
      await chatService.clearAll();
      setChats([]);
      setOpen(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(null);
    }
  };

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-16"><LoadingBlock label="Loading conversations…" /></div>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-white">{t('nav.chatHistory')}</h1>
          <p className="mt-1 text-mist-300">Conversations are saved to your account only while you are signed in.</p>
        </div>
        {chats.length ? (
          <button type="button" onClick={clearAll} className="btn-ghost" disabled={pending === 'all'}>
            {pending === 'all' ? <Spinner /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
            Delete all
          </button>
        ) : null}
      </header>

      {error ? <div className="mt-6"><ErrorState message={error} onRetry={load} /></div> : null}

      {chats.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={MessageSquare}
            title={t('empty.conversations')}
            description="Ask WeatherGPT a question and it will be saved here."
            actionLabel={t('chat.title')}
            actionTo="/weather-gpt"
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <ul className="space-y-2">
            {chats.map((chat) => (
              <li
                key={chat.id}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 ${
                  open?.id === chat.id ? 'border-signal-500/60 bg-signal-500/5' : 'border-white/10 bg-night-900/40'
                }`}
              >
                <button type="button" onClick={() => openChat(chat.id)} className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-sm text-mist-100">{chat.title}</span>
                  <span className="block truncate text-xs text-mist-400">
                    {chat.location?.name ? `${chat.location.name} · ` : ''}
                    {chat.messageCount} messages · {relativeTime(chat.updatedAt)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => remove(chat.id)}
                  className="btn-quiet px-2"
                  aria-label={`${t('common.delete')} ${chat.title}`}
                  disabled={pending === chat.id}
                >
                  {pending === chat.id ? <Spinner /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
                </button>
              </li>
            ))}
          </ul>

          <section className="panel p-5 lg:col-span-2">
            {loadingOne ? (
              <LoadingBlock label="Opening conversation…" />
            ) : open ? (
              <>
                <h2 className="section-title">{open.title}</h2>
                <p className="mt-1 text-xs text-mist-400">
                  {open.location?.name ? `${open.location.name} · ` : ''}
                  {relativeTime(open.updatedAt)}
                </p>
                <div className="mt-5 space-y-5">
                  {open.messages.map((message, i) => (
                    <ChatMessage key={i} message={message} />
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-mist-300">Pick a conversation on the left to read it.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
