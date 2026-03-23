import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { sendVerificationEmail } from '../lib/mailer';

const router = Router();
const prisma = new PrismaClient();

const ADMIN_EMAILS = ['akhenaton.dandjinou@epitech.eu', "james.gbetchedji@epitech.eu"];
const ALLOWED_DOMAIN = '@epitech.eu';

function getRole(email: string): 'ADMIN' | 'STUDENT' {
    return ADMIN_EMAILS.includes(email) ? 'ADMIN' : 'STUDENT';
}

function generateJWT(userId: string, role: string): string {
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    return jwt.sign({ userId, role }, secret, { expiresIn: '24h' });
}

// Vérifie que l'email est bien @epitech.eu — obligatoire pour TOUS les modes de connexion
function isEpitechEmail(email: string): boolean {
    return typeof email === 'string' && email.trim().toLowerCase().endsWith(ALLOWED_DOMAIN);
}

async function findOrCreateUser(email: string, name?: string): Promise<any> {
    const normalizedEmail = email.trim().toLowerCase();
    const role = getRole(normalizedEmail);
    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
        user = await prisma.user.create({ data: { email: normalizedEmail, role } });
    } else if (user.role !== role) {
        user = await prisma.user.update({ where: { email: normalizedEmail }, data: { role } });
    }
    return user;
}

// ─── Rate limiter OTP ────────────────────────────────────────────────────────
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Trop de tentatives. Réessayez dans 15 minutes.' }
});

// ─── EMAIL OTP: Demander un code ─────────────────────────────────────────────
router.post('/request-code', otpLimiter, async (req: any, res: any) => {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Email requis.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isEpitechEmail(normalizedEmail)) {
        return res.status(400).json({ error: 'Une adresse @epitech.eu est requise.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    try {
        await prisma.verificationToken.deleteMany({ where: { email: normalizedEmail } });
        await prisma.verificationToken.create({
            data: { email: normalizedEmail, code, expiresAt }
        });

        await sendVerificationEmail(normalizedEmail, code);
        res.json({ message: 'Code de vérification envoyé.' });
    } catch (error) {
        console.error('Error creating code:', error);
        res.status(500).json({ error: 'Impossible de générer le code.' });
    }
});

// ─── EMAIL OTP: Vérifier le code ─────────────────────────────────────────────
router.post('/verify-code', async (req: any, res: any) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ error: 'Email et code requis.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isEpitechEmail(normalizedEmail)) {
        return res.status(400).json({ error: 'Une adresse @epitech.eu est requise.' });
    }

    try {
        const tokenRecord = await prisma.verificationToken.findFirst({
            where: { email: normalizedEmail, code: code.trim() }
        });

        if (!tokenRecord) {
            return res.status(401).json({ error: 'Code de vérification invalide.' });
        }
        if (tokenRecord.expiresAt < new Date()) {
            await prisma.verificationToken.delete({ where: { id: tokenRecord.id } });
            return res.status(401).json({ error: 'Code expiré. Veuillez en demander un nouveau.' });
        }

        await prisma.verificationToken.delete({ where: { id: tokenRecord.id } });

        const user = await findOrCreateUser(normalizedEmail);
        const token = generateJWT(user.id, user.role);

        res.json({ token, role: user.role, email: user.email });
    } catch (error) {
        console.error('Error verifying code:', error);
        res.status(500).json({ error: "Erreur d'authentification." });
    }
});

// ─── GOOGLE OAuth ─────────────────────────────────────────────────────────────
router.get('/google', (req: any, res: any) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'your_google_client_id.apps.googleusercontent.com') {
        return res.status(503).json({ error: 'Google OAuth non configuré.' });
    }
    const redirectUri = getBackendUrl() + '/api/auth/google/callback';
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'select_account',
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

router.get('/google/callback', async (req: any, res: any) => {
    const { code, error } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';

    if (error || !code) {
        return res.redirect(`${frontendUrl}/login?error=google_denied`);
    }

    try {
        const redirectUri = getBackendUrl() + '/api/auth/google/callback';

        const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        });

        const { access_token } = tokenRes.data;

        const profileRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const { id: googleId, email, name } = profileRes.data;

        if (!email) {
            return res.redirect(`${frontendUrl}/login?error=no_email`);
        }

        // Vérifie que l'email est bien @epitech.eu
        if (!isEpitechEmail(email)) {
            return res.redirect(`${frontendUrl}/login?error=not_epitech`);
        }

        const normalizedEmail = email.trim().toLowerCase();

        let oauthAccount = await prisma.oauthAccount.findUnique({
            where: { provider_providerId: { provider: 'google', providerId: String(googleId) } },
            include: { user: true }
        });

        let user;
        if (oauthAccount) {
            user = oauthAccount.user;
        } else {
            user = await findOrCreateUser(normalizedEmail);
            await prisma.oauthAccount.create({
                data: { provider: 'google', providerId: String(googleId), userId: user.id }
            });
        }

        const token = generateJWT(user.id, user.role);
        res.redirect(`${frontendUrl}/login?token=${token}&role=${user.role}&email=${encodeURIComponent(user.email)}`);

    } catch (err: any) {
        console.error('Google OAuth error:', err.message);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
        res.redirect(`${frontendUrl}/login?error=google_failed`);
    }
});

// ─── GITHUB OAuth ─────────────────────────────────────────────────────────────
router.get('/github', (req: any, res: any) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId || clientId === 'your_github_client_id') {
        return res.status(503).json({ error: 'GitHub OAuth non configuré.' });
    }
    const redirectUri = getBackendUrl() + '/api/auth/github/callback';
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: 'user:email',
    });
    res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

router.get('/github/callback', async (req: any, res: any) => {
    const { code, error } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';

    if (error || !code) {
        return res.redirect(`${frontendUrl}/login?error=github_denied`);
    }

    try {
        const redirectUri = getBackendUrl() + '/api/auth/github/callback';

        const tokenRes = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
                redirect_uri: redirectUri,
            },
            { headers: { Accept: 'application/json' } }
        );

        const { access_token } = tokenRes.data;
        if (!access_token) {
            return res.redirect(`${frontendUrl}/login?error=github_failed`);
        }

        const [profileRes, emailsRes] = await Promise.all([
            axios.get('https://api.github.com/user', {
                headers: { Authorization: `Bearer ${access_token}`, 'User-Agent': 'Election-BDE' }
            }),
            axios.get('https://api.github.com/user/emails', {
                headers: { Authorization: `Bearer ${access_token}`, 'User-Agent': 'Election-BDE' }
            })
        ]);

        const { id: githubId, name } = profileRes.data;

        // Cherche l'email @epitech.eu parmi les emails GitHub vérifiés
        const epitechEmail = emailsRes.data.find(
            (e: any) => e.verified && isEpitechEmail(e.email)
        )?.email;

        if (!epitechEmail) {
            // Aucun email @epitech.eu vérifié sur ce compte GitHub
            return res.redirect(`${frontendUrl}/login?error=not_epitech`);
        }

        const normalizedEmail = epitechEmail.trim().toLowerCase();

        let oauthAccount = await prisma.oauthAccount.findUnique({
            where: { provider_providerId: { provider: 'github', providerId: String(githubId) } },
            include: { user: true }
        });

        let user;
        if (oauthAccount) {
            user = oauthAccount.user;
        } else {
            user = await findOrCreateUser(normalizedEmail);
            await prisma.oauthAccount.create({
                data: { provider: 'github', providerId: String(githubId), userId: user.id }
            });
        }

        const token = generateJWT(user.id, user.role);
        res.redirect(`${frontendUrl}/login?token=${token}&role=${user.role}&email=${encodeURIComponent(user.email)}`);

    } catch (err: any) {
        console.error('GitHub OAuth error:', err.message);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
        res.redirect(`${frontendUrl}/login?error=github_failed`);
    }
});

// Helper — URL du backend pour les redirections OAuth
function getBackendUrl(): string {
    return process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`;
}

export default router;
