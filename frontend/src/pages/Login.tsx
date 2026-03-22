import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Icône Google SVG inline
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// Icône GitHub SVG inline
const GitHubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Gère le retour OAuth (Google/GitHub redirigent ici avec ?token=...)
  useEffect(() => {
    const token = searchParams.get('token');
    const role = searchParams.get('role');
    const userEmail = searchParams.get('email');
    const oauthError = searchParams.get('error');

    if (oauthError) {
      const messages: Record<string, string> = {
        google_denied: 'Connexion Google annulée.',
        github_denied: 'Connexion GitHub annulée.',
        google_failed: 'Échec de la connexion Google. Réessayez.',
        github_failed: 'Échec de la connexion GitHub. Réessayez.',
        no_email: 'Impossible de récupérer votre email.',
        no_verified_email: 'Votre email GitHub n\'est pas vérifié.',
        not_epitech: 'Accès refusé : seuls les comptes @epitech.eu sont autorisés.',
      };
      setError(messages[oauthError] || 'Erreur d\'authentification OAuth.');
      return;
    }

    if (token && role && userEmail) {
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('email', decodeURIComponent(userEmail));
      navigate('/');
    }
  }, [searchParams, navigate]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith('@epitech.eu')) {
      setError('Une adresse @epitech.eu est requise.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/request-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await res.json();
      if (res.ok) {
        setStep(2);
        setSuccess(`Code envoyé à ${normalizedEmail}`);
      } else {
        setError(data.error || 'Erreur lors de la demande de code.');
      }
    } catch {
      setError('Impossible de joindre le serveur. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('email', data.email);
        navigate('/');
      } else {
        setError(data.error || 'Code invalide ou expiré.');
      }
    } catch {
      setError('Impossible de joindre le serveur.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: 'google' | 'github') => {
    // Redirige vers le backend qui gère le flow OAuth
    window.location.href = `${API_URL}/api/auth/${provider}`;
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#050505] text-white">
      <div className="glass-panel-gold p-6 sm:p-10 rounded-3xl w-full max-w-md flex flex-col items-center border border-white/10 shadow-2xl relative overflow-hidden mx-4">
        {/* Glow décoratif */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[100px] bg-olympusGold/20 blur-[80px]" />

        <h1 className="text-3xl font-black tracking-widest uppercase mb-2 bg-clip-text text-transparent bg-gradient-to-r from-olympusGold to-white z-10 text-center">
          Secured Access
        </h1>
        <p className="text-white/50 text-sm mb-8 z-10 uppercase tracking-widest text-center">
          Election BDE System
        </p>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 w-full p-3 rounded-xl mb-4 text-sm text-center z-10">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 w-full p-3 rounded-xl mb-4 text-sm text-center z-10">
            {success}
          </div>
        )}

        {/* ── Boutons OAuth ───────────────────────────────────────── */}
        <div className="w-full flex flex-col gap-3 mb-6 z-10">
          <button
            onClick={() => handleOAuth('google')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all font-medium text-sm disabled:opacity-50"
          >
            <GoogleIcon />
            <span>Continuer avec Google</span>
          </button>

          <button
            onClick={() => handleOAuth('github')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all font-medium text-sm disabled:opacity-50"
          >
            <GitHubIcon />
            <span>Continuer avec GitHub</span>
          </button>
        </div>

        {/* Séparateur */}
        <div className="w-full flex items-center gap-3 mb-6 z-10">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-xs uppercase tracking-widest">ou par email</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* ── Formulaire Email OTP ─────────────────────────────────── */}
        {step === 1 ? (
          <form onSubmit={handleRequestCode} className="w-full flex flex-col gap-6 z-10">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest text-white/50">
                E-mail Epitech
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prenom.nom@epitech.eu"
                className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-olympusGold/50 focus:ring-1 focus:ring-olympusGold/50 transition-all font-mono"
                required
                autoComplete="email"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="glass-button w-full py-4 rounded-full font-bold uppercase tracking-widest hover:bg-white/10 transition-colors mt-2 disabled:opacity-50"
            >
              {loading ? 'Envoi en cours...' : 'Recevoir le code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="w-full flex flex-col gap-6 z-10">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-widest text-white/50">
                Code de vérification (6 chiffres)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-beesYellow/50 focus:ring-1 focus:ring-beesYellow/50 transition-all font-mono text-center tracking-[0.5em] text-xl"
                required
                autoFocus
              />
              <p className="text-[10px] text-center text-white/30 uppercase tracking-widest mt-1">
                Vérifiez votre boîte mail (et les spams)
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="glass-button w-full py-4 rounded-full font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 transition-colors mt-2 disabled:opacity-50"
            >
              {loading ? 'Vérification...' : 'Valider & Entrer'}
            </button>
            <button
              type="button"
              onClick={() => { setStep(1); setError(''); setSuccess(''); setCode(''); }}
              className="text-xs text-white/40 hover:text-white transition-colors uppercase tracking-widest mt-2"
            >
              ← Retour
            </button>
          </form>
        )}
      {/* Lien public vers l'évaluation */}
      <div className="mt-6 z-10">
        <Link
          to="/evaluation"
          className="text-white/30 hover:text-white/60 text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          Voir les résultats en direct
        </Link>
      </div>
      </div>
    </div>
  );
};
