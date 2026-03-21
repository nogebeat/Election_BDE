import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // 3 requests per IP
    message: { error: 'Too many requests, please try again later.' }
});

router.post('/request-code', otpLimiter, async (req: any, res: any) => {
    const { email } = req.body;
    if (!email || !email.endsWith('@epitech.eu')) {
        return res.status(400).json({ error: 'Valid @epitech.eu email is required.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    try {
        await prisma.verificationToken.create({
            data: { email, code, expiresAt }
        });
        
        // Mock email sending
        console.log(`[MOCK EMAIL] To: ${email} - Your voting code is: ${code}`);

        res.json({ message: 'Verification code sent.' });
    } catch (error) {
        console.error("Error creating code:", error);
        res.status(500).json({ error: 'Failed to generate code.' });
    }
});

router.post('/verify-code', async (req: any, res: any) => {
    const { email, code } = req.body;

    try {
        const tokenRecord = await prisma.verificationToken.findUnique({
            where: { email_code: { email, code } }
        });

        if (!tokenRecord) {
            return res.status(401).json({ error: 'Invalid verification code.' });
        }
        if (tokenRecord.expiresAt < new Date()) {
            return res.status(401).json({ error: 'Verification code expired.' });
        }

        // Delete token
        await prisma.verificationToken.delete({ where: { id: tokenRecord.id } });

        // Find or create User. Force ADMIN if specific email.
        const role = email === 'akhenaton.dandjinou@epitech.eu' ? 'ADMIN' : 'STUDENT';
        
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma.user.create({ data: { email, role } });
        } else if (user.role !== role) {
            // Update role if it changed (e.g. promoting the user)
            user = await prisma.user.update({ where: { email }, data: { role } });
        }

        // Generate JWT
        const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
        const token = jwt.sign({ userId: user.id, role: user.role }, jwtSecret, { expiresIn: '24h' });

        res.json({ token, role: user.role, email: user.email });
    } catch (error) {
        console.error("Error verifying code:", error);
        res.status(500).json({ error: 'Authentication failed.' });
    }
});

export default router;
