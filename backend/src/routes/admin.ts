import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth';
import { getCurrentVoteDay } from '../lib/currentDay';

const router = Router();
const prisma = new PrismaClient();

// ─── Obtenir le jour actif ────────────────────────────────────────────────────
router.get('/vote-day', requireAuth, requireAdmin, async (req: AuthRequest, res: any) => {
    const day = await getCurrentVoteDay();
    res.json({ activeDay: day });
});

// ─── Définir / fermer le jour actif ──────────────────────────────────────────
router.post('/vote-day', requireAuth, requireAdmin, async (req: AuthRequest, res: any) => {
    const { activeDay } = req.body; // number 1-5 ou null pour fermer

    if (activeDay !== null && (typeof activeDay !== 'number' || activeDay < 1 || activeDay > 5)) {
        return res.status(400).json({ error: 'activeDay doit être un entier entre 1 et 5, ou null.' });
    }

    const adminEmail = req.user!.userId; // on a l'id, c'est suffisant
    const config = await prisma.voteConfig.upsert({
        where:  { id: 'singleton' },
        update: { activeDay, updatedBy: adminEmail },
        create: { id: 'singleton', activeDay, updatedBy: adminEmail },
    });

    res.json({
        message: activeDay ? `Vote ouvert pour J${activeDay}.` : 'Vote fermé.',
        activeDay: config.activeDay
    });
});

// ─── Stats admin ──────────────────────────────────────────────────────────────
router.get('/stats', requireAuth, requireAdmin, async (req: AuthRequest, res: any) => {
    try {
        const uniqueVoters  = await prisma.user.count({ where: { votes: { some: {} } } });
        const votersPerDay  = await prisma.vote.groupBy({ by: ['day'], _count: { userId: true } });
        const listAverages  = await prisma.vote.groupBy({
            by: ['listName'],
            _avg: { scoreBouffe: true, scoreAmbiance: true, scoreProjets: true, scoreRespect: true }
        });

        const criteriaKeys = ['Bouffe', 'Ambiance', 'Projets', 'Respect'];
        const radarData = criteriaKeys.map(criteria => {
            const row: any = { criteria };
            listAverages.forEach(list => {
                row[list.listName] = list._avg[`score${criteria}` as keyof typeof list._avg] || 0;
            });
            return row;
        });

        const dailyProgression = await prisma.vote.groupBy({
            by: ['listName', 'day'],
            _avg: { scoreBouffe: true, scoreAmbiance: true, scoreProjets: true, scoreRespect: true }
        });

        const lineData = [1,2,3,4,5].map(day => {
            const row: any = { day: `J${day}` };
            dailyProgression.filter(dp => dp.day === day).forEach(list => {
                row[list.listName] = (list._avg.scoreBouffe||0)+(list._avg.scoreAmbiance||0)+(list._avg.scoreProjets||0)+(list._avg.scoreRespect||0);
            });
            return row;
        });

        let leadValue = -1, leadingList = 'Égalité / N/A';
        listAverages.forEach(list => {
            const total = (list._avg.scoreBouffe||0)+(list._avg.scoreAmbiance||0)+(list._avg.scoreProjets||0)+(list._avg.scoreRespect||0);
            if (total > leadValue) { leadValue = total; leadingList = list.listName; }
            else if (total === leadValue) leadingList = 'Égalité';
        });

        const activeDay = await getCurrentVoteDay();

        res.json({
            kpi: {
                totalVoters: uniqueVoters,
                todayParticipation: votersPerDay.find(v => v.day === activeDay)?._count.userId || 0,
                leadingList,
                activeDay,
            },
            radarData,
            lineData,
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ error: 'Failed to aggregate statistics.' });
    }
});

// ─── Évaluation globale publique ──────────────────────────────────────────────
router.get('/global-evaluation', async (req: any, res: any) => {
    try {
        const criteriaKeys = ['Bouffe', 'Ambiance', 'Projets', 'Respect'] as const;
        type CK = typeof criteriaKeys[number];

        const listAverages = await prisma.vote.groupBy({
            by: ['listName'],
            _avg: { scoreBouffe: true, scoreAmbiance: true, scoreProjets: true, scoreRespect: true },
            _count: { userId: true }
        });
        const dailyData = await prisma.vote.groupBy({
            by: ['listName', 'day'],
            _avg: { scoreBouffe: true, scoreAmbiance: true, scoreProjets: true, scoreRespect: true }
        });
        const totalVoters  = await prisma.user.count({ where: { votes: { some: {} } } });
        const votersPerDay = await prisma.vote.groupBy({ by: ['day'], _count: { userId: true } });

        const radarData = criteriaKeys.map(criteria => {
            const row: any = { criteria };
            listAverages.forEach(list => {
                row[list.listName] = Number((list._avg[`score${criteria}` as `score${CK}`] || 0).toFixed(2));
            });
            return row;
        });

        const lineData = [1,2,3,4,5].map(day => {
            const row: any = { day: `J${day}`, voters: votersPerDay.find(v => v.day === day)?._count.userId || 0 };
            dailyData.filter(d => d.day === day).forEach(list => {
                row[list.listName] = Number(criteriaKeys.reduce((s,k) => s+(list._avg[`score${k}` as `score${CK}`]||0), 0).toFixed(2));
            });
            return row;
        });

        const globalScores = listAverages.map(list => ({
            name: list.listName,
            total: Number(criteriaKeys.reduce((s,k) => s+(list._avg[`score${k}` as `score${CK}`]||0), 0).toFixed(2)),
            votes: list._count.userId,
            details: {
                Bouffe:    Number((list._avg.scoreBouffe    || 0).toFixed(2)),
                Ambiance:  Number((list._avg.scoreAmbiance  || 0).toFixed(2)),
                Projets:   Number((list._avg.scoreProjets   || 0).toFixed(2)),
                Respect:   Number((list._avg.scoreRespect   || 0).toFixed(2)),
            }
        }));

        const winner = globalScores.length ? globalScores.reduce((a,b) => a.total > b.total ? a : b) : null;
        res.json({ totalVoters, globalScores, winner: winner?.name || null, radarData, lineData });
    } catch (error) {
        console.error('Global evaluation error:', error);
        res.status(500).json({ error: 'Impossible de charger l\'évaluation globale.' });
    }
});

export default router;
