import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) { setError(t('login.error_required')); return; }
    setSubmitting(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || t('login.error_invalid'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-card rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#F1F5F9] dark:border-border bg-gradient-to-br from-white via-white to-[#E2E8F0] dark:from-card dark:via-card dark:to-white/[0.07] p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0F766E] dark:bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#0F766E]/20 dark:shadow-teal-900/30">
            <span className="material-symbols-outlined text-3xl text-white">store</span>
          </div>
          <h1 className="text-[26px] font-extrabold text-[#0f172a] dark:text-foreground">Jemla POS</h1>
          <p className="text-sm text-[#64748B] dark:text-muted-foreground mt-1">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#64748B] dark:text-muted-foreground mb-2">{t('login.username')}</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-muted-foreground z-10">person</span>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 h-12 bg-white dark:bg-card rounded-[20px] border border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground placeholder:text-[#94a3b8] dark:placeholder:text-muted-foreground outline-none focus:border-[#0F766E]/30 dark:focus:border-teal-700 focus:shadow-[0_0_0_3px_rgba(15,118,110,0.1)] dark:focus:shadow-[0_0_0_3px_rgba(20,184,166,0.2)] transition-all"
                placeholder="admin"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#64748B] dark:text-muted-foreground mb-2">{t('login.password')}</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-muted-foreground z-10">lock</span>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 h-12 bg-white dark:bg-card rounded-[20px] border border-[#F1F5F9] dark:border-border text-sm text-[#0f172a] dark:text-foreground placeholder:text-[#94a3b8] dark:placeholder:text-muted-foreground outline-none focus:border-[#0F766E]/30 dark:focus:border-teal-700 focus:shadow-[0_0_0_3px_rgba(15,118,110,0.1)] dark:focus:shadow-[0_0_0_3px_rgba(20,184,166,0.2)] transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </div>
          )}

          <button type="submit" disabled={submitting} className="w-full h-12 bg-[#0F766E] dark:bg-teal-600 text-white rounded-2xl text-xs font-semibold hover:bg-[#0F766E]/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#0F766E]/20 dark:shadow-teal-900/30 disabled:opacity-60">
            {submitting ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined">login</span>
                {t('login.submit')}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
