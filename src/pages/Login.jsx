import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) { setError('Veuillez remplir tous les champs'); return; }
    setSubmitting(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Identifiants incorrects');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-[32px] shadow-xl border border-outline-variant/30 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-3xl text-on-primary">store</span>
          </div>
          <h1 className="text-headline-md font-headline-md text-on-surface">Jemla POS</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Connectez-vous pour continuer</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-label-md font-bold text-on-surface-variant mb-2">Nom d'utilisateur</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">person</span>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-primary/30 text-body-md outline-none text-on-surface placeholder:text-on-surface-variant/50"
                placeholder="admin"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-label-md font-bold text-on-surface-variant mb-2">Mot de passe</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">lock</span>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-primary/30 text-body-md outline-none text-on-surface placeholder:text-on-surface-variant/50"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="bg-error/10 text-error text-label-md px-4 py-3 rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-on-primary py-3.5 rounded-2xl font-bold text-label-md flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60"
          >
            {submitting ? (
              <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined">login</span>
                Se connecter
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
