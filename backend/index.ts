import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize default scores if they don't exist
async function initializeScores() {
    const existingScore = await prisma.score.findFirst();
    if (!existingScore) {
        await prisma.score.create({
            data: {
                olympusScore: 0,
                beesScore: 0,
            },
        });
    }
}

app.get('/api/scores', async (req: Request, res: Response) => {
    try {
        const scores = await prisma.score.findFirst();
        res.json(scores);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch scores' });
    }
});

app.post('/api/scores/vote', async (req: Request, res: Response): Promise<any> => {
    const { team } = req.body; // 'olympus' or 'bees'

    try {
        const currentScore = await prisma.score.findFirst();
        if (!currentScore) {
            return res.status(404).json({ error: 'Scores not initialized' });
        }

        // Example logic for updating
        const updateData: any = {};
        if (team === 'olympus') {
            updateData.olympusScore = { increment: 1 };
        } else if (team === 'bees') {
            updateData.beesScore = { increment: 1 };
        } else {
            return res.status(400).json({ error: 'Invalid team specified' });
        }

        const updatedScore = await prisma.score.update({
            where: { id: currentScore.id },
            data: updateData,
        });

        res.json(updatedScore);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update score' });
    }
});

app.listen(port, async () => {
    await initializeScores();
    console.log(`Backend server is running on http://localhost:${port}`);
});
