import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.endsWith('@epitech.eu')) {
        setError('Une adresse @epitech.eu est requise.');
        return;
    }

    setLoading(true);
    try {
        const res = await fetch('http://localhost:3001/api/auth/request-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        
        if (res.ok) {
            setStep(2);
        } else {
            const data = await res.json();
            setError(data.error || 'Erreur lors de la demande de code.');
        }
    } catch (err) {
        setError('Impossible de joindre le serveur.');
    } finally {
        setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        const res = await fetch('http://localhost:3001/api/auth/verify-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        });
        
        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('email', data.email);
            navigate('/');
        } else {
            const data = await res.json();
            setError(data.error || 'Code invalide ou expiré.');
        }
    } catch (err) {
        setError('Impossible de joindre le serveur.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#050505] text-white">
      <div className="glass-panel-gold p-10 rounded-3xl w-full max-w-md flex flex-col items-center border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[100px] bg-olympusGold/20 blur-[80px]"></div>
        
        <h1 className="text-3xl font-black tracking-widest uppercase mb-2 bg-clip-text text-transparent bg-gradient-to-r from-olympusGold to-white z-10 text-center">
            Secured Access
        </h1>
        <p className="text-white/50 text-sm mb-8 z-10 uppercase tracking-widest text-center">Election BDE System</p>

        {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 w-full p-3 rounded-xl mb-6 text-sm text-center z-10">{error}</div>}

        {step === 1 ? (
            <form onSubmit={handleRequestCode} className="w-full flex flex-col gap-6 z-10">
                <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-widest text-white/50">E-mail Epitech</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="prenom.nom@epitech.eu"
                        className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-olympusGold/50 focus:ring-1 focus:ring-olympusGold/50 transition-all font-mono"
                        required
                    />
                </div>
                <button type="submit" disabled={loading} className="glass-button w-full py-4 rounded-full font-bold uppercase tracking-widest hover:bg-white/10 transition-colors mt-2 disabled:opacity-50">
                    {loading ? 'Envoi...' : 'Recevoir le code'}
                </button>
            </form>
        ) : (
            <form onSubmit={handleVerifyCode} className="w-full flex flex-col gap-6 z-10">
                <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-widest text-white/50">Code de vérification (6 chiffres)</label>
                    <input 
                        type="text" 
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-beesYellow/50 focus:ring-1 focus:ring-beesYellow/50 transition-all font-mono text-center tracking-[0.5em] text-xl"
                        required
                    />
                    <p className="text-[10px] text-center text-white/30 uppercase tracking-widest mt-1">Regarde les logs du serveur backend</p>
                </div>
                <button type="submit" disabled={loading} className="glass-button w-full py-4 rounded-full font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 transition-colors mt-2 disabled:opacity-50">
                    {loading ? 'Vérification...' : 'Valider & Entrer'}
                </button>
                <button type="button" onClick={() => setStep(1)} className="text-xs text-white/40 hover:text-white transition-colors uppercase tracking-widest mt-2">
                    Retour
                </button>
            </form>
        )}
      </div>
    </div>
  );
};
