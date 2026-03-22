import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { getCurrentVoteDay } from '../lib/currentDay';

const router = Router();
const prisma = new PrismaClient();

function isValidScore(score: any): boolean {
    return typeof score === 'number' && Number.isInteger(score) && score >= 1 && score <= 10;
}

router.post('/', requireAuth, async (req: AuthRequest, res: any) => {
    const userId = req.user!.userId;
    const { listName, day, scoreBouffe, scoreAmbiance, scoreProjets, scoreRespect } = req.body;

    if (!listName || !['olympus', 'bees'].includes(listName))
        return res.status(400).json({ error: 'listName invalide.' });
    if (!day || typeof day !== 'number' || day < 1 || day > 5)
        return res.status(400).json({ error: 'day invalide (1-5).' });

    const todayDay = await getCurrentVoteDay();

    if (todayDay === null)
        return res.status(403).json({ error: 'Le vote est fermé. L\'admin n\'a pas encore ouvert le vote du jour.' });
    if (day !== todayDay)
        return res.status(403).json({ error: `Seul le vote du J${todayDay} est autorisé aujourd'hui.` });

    if (!isValidScore(scoreBouffe) || !isValidScore(scoreAmbiance) ||
        !isValidScore(scoreProjets) || !isValidScore(scoreRespect))
        return res.status(400).json({ error: 'Les scores doivent être des entiers entre 1 et 10.' });

    try {
        const vote = await prisma.vote.create({
            data: { userId, listName, day, scoreBouffe, scoreAmbiance, scoreProjets, scoreRespect }
        });
        res.json({ message: 'Vote enregistré avec succès.', vote });
    } catch (error: any) {
        if (error.code === 'P2002')
            return res.status(403).json({ error: 'Vous avez déjà voté pour ce jour.' });
        console.error('Voting error:', error);
        res.status(500).json({ error: 'Impossible d\'enregistrer le vote.' });
    }
});

router.get('/my-votes', requireAuth, async (req: AuthRequest, res: any) => {
    const userId = req.user!.userId;
    try {
        const [votes, currentDay] = await Promise.all([
            prisma.vote.findMany({
                where: { userId },
                select: { day: true, listName: true, createdAt: true }
            }),
            getCurrentVoteDay()
        ]);
        res.json({ votes, currentDay });
    } catch (error) {
        res.status(500).json({ error: 'Impossible de récupérer les votes.' });
    }
});

export default router;
