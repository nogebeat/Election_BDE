import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.post('/', requireAuth, async (req: AuthRequest, res: any) => {
    const userId = req.user!.userId;
    const { listName, day, scoreBouffe, scoreAmbiance, scoreProjets, scoreRespect } = req.body;

    if (!listName || !day || day < 1 || day > 5) {
        return res.status(400).json({ error: 'Invalid voting parameters.' });
    }

    try {
        const vote = await prisma.vote.create({
            data: {
                userId,
                listName, // 'olympus' or 'bees'
                day,
                scoreBouffe,
                scoreAmbiance,
                scoreProjets,
                scoreRespect
            }
        });
        res.json({ message: 'Vote recorded successfully', vote });
    } catch (error: any) {
        // P2002 is Prisma's error code for Unique constraint failed
        if (error.code === 'P2002') {
            return res.status(403).json({ error: 'Vous avez déjà voté aujourd\'hui.' });
        }
        console.error("Voting error:", error);
        res.status(500).json({ error: 'Failed to record vote.' });
    }
});

export default router;
