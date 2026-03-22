import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

function isValidScore(score: any): boolean {
    return typeof score === 'number' && Number.isInteger(score) && score >= 0 && score <= 10;
}

router.post('/', requireAuth, async (req: AuthRequest, res: any) => {
    const userId = req.user!.userId;
    const { listName, day, scoreBouffe, scoreAmbiance, scoreProjets, scoreRespect } = req.body;

    // Validation complète
    if (!listName || !['olympus', 'bees'].includes(listName)) {
        return res.status(400).json({ error: 'listName invalide. Valeurs: olympus, bees.' });
    }
    if (!day || typeof day !== 'number' || day < 1 || day > 5) {
        return res.status(400).json({ error: 'day invalide. Valeurs: 1-5.' });
    }
    if (!isValidScore(scoreBouffe) || !isValidScore(scoreAmbiance) ||
        !isValidScore(scoreProjets) || !isValidScore(scoreRespect)) {
        return res.status(400).json({ error: 'Les scores doivent être des entiers entre 0 et 10.' });
    }

    try {
        const vote = await prisma.vote.create({
            data: { userId, listName, day, scoreBouffe, scoreAmbiance, scoreProjets, scoreRespect }
        });
        res.json({ message: 'Vote enregistré avec succès', vote });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(403).json({ error: 'Vous avez déjà voté aujourd\'hui.' });
        }
        console.error('Voting error:', error);
        res.status(500).json({ error: 'Impossible d\'enregistrer le vote.' });
    }
});

// Récupère les votes de l'utilisateur connecté
router.get('/my-votes', requireAuth, async (req: AuthRequest, res: any) => {
    const userId = req.user!.userId;
    try {
        const votes = await prisma.vote.findMany({
            where: { userId },
            select: { day: true, listName: true, createdAt: true }
        });
        res.json({ votes });
    } catch (error) {
        res.status(500).json({ error: 'Impossible de récupérer les votes.' });
    }
});

export default router;
