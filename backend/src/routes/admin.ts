import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/stats', requireAuth, requireAdmin, async (req: AuthRequest, res: any) => {
    try {
        // 1. Total unique voters overall
        const uniqueVoters = await prisma.user.count({
            where: {
                votes: { some: {} }
            }
        });

        // 2. Voters per day
        const votersPerDay = await prisma.vote.groupBy({
            by: ['day'],
            _count: { userId: true },
        });

        // 3. Overall averages per list for RadarChart
        const listAverages = await prisma.vote.groupBy({
            by: ['listName'],
            _avg: {
                scoreBouffe: true,
                scoreAmbiance: true,
                scoreProjets: true,
                scoreRespect: true
            }
        });

        const criteriaKeys = ['Bouffe', 'Ambiance', 'Projets', 'Respect'];
        const radarData = criteriaKeys.map(criteria => {
            const row: any = { criteria };
            listAverages.forEach(list => {
                row[list.listName] = list._avg[`score${criteria}` as keyof typeof list._avg] || 0;
            });
            return row;
        });

        // 4. Daily progression for LineChart
        const dailyProgression = await prisma.vote.groupBy({
            by: ['listName', 'day'],
            _avg: {
                scoreBouffe: true,
                scoreAmbiance: true,
                scoreProjets: true,
                scoreRespect: true
            }
        });

        const validDays = [1, 2, 3, 4, 5];
        const lineData = validDays.map(day => {
            const row: any = { day: `J${day}` };
            dailyProgression.filter(dp => dp.day === day).forEach(list => {
                // Sum the averages to get the total daily average "score" for that list
                const totalAvg = 
                    (list._avg.scoreBouffe || 0) + 
                    (list._avg.scoreAmbiance || 0) + 
                    (list._avg.scoreProjets || 0) + 
                    (list._avg.scoreRespect || 0);
                row[list.listName] = totalAvg;
            });
            return row;
        });

        // 5. Determine Overall Leading List
        let leadValue = -1;
        let leadingList = 'Égalité / N/A';
        
        listAverages.forEach(list => {
            const total = 
                (list._avg.scoreBouffe || 0) + 
                (list._avg.scoreAmbiance || 0) + 
                (list._avg.scoreProjets || 0) + 
                (list._avg.scoreRespect || 0);
            if (total > leadValue) {
                leadValue = total;
                leadingList = list.listName;
            } else if (total === leadValue) {
                leadingList = 'Égalité';
            }
        });

        res.json({
            kpi: {
                totalVoters: uniqueVoters,
                todayParticipation: votersPerDay.length ? votersPerDay[votersPerDay.length - 1]._count.userId : 0,
                leadingList
            },
            radarData,
            lineData
        });

    } catch (error) {
        console.error("Admin stats error:", error);
        res.status(500).json({ error: 'Failed to aggregate statistics.' });
    }
});

export default router;

// ─── Endpoint évaluation globale publique (accessible à tous les connectés) ──
router.get('/global-evaluation', async (req: any, res: any) => {
    try {
        const criteriaKeys = ['Bouffe', 'Ambiance', 'Projets', 'Respect'] as const;
        type CriteriaKey = typeof criteriaKeys[number];

        // Moyennes globales par liste
        const listAverages = await prisma.vote.groupBy({
            by: ['listName'],
            _avg: {
                scoreBouffe: true,
                scoreAmbiance: true,
                scoreProjets: true,
                scoreRespect: true
            },
            _count: { userId: true }
        });

        // Moyennes par jour par liste
        const dailyData = await prisma.vote.groupBy({
            by: ['listName', 'day'],
            _avg: {
                scoreBouffe: true,
                scoreAmbiance: true,
                scoreProjets: true,
                scoreRespect: true
            }
        });

        // Nombre total de votants
        const totalVoters = await prisma.user.count({
            where: { votes: { some: {} } }
        });

        // Votants par jour
        const votersPerDay = await prisma.vote.groupBy({
            by: ['day'],
            _count: { userId: true }
        });

        // Construction des données radar (par critère)
        const radarData = criteriaKeys.map(criteria => {
            const scoreKey = `score${criteria}` as `score${CriteriaKey}`;
            const row: any = { criteria };
            listAverages.forEach(list => {
                row[list.listName] = Number((list._avg[scoreKey] || 0).toFixed(2));
            });
            return row;
        });

        // Progression journalière (score total moyen par jour)
        const validDays = [1, 2, 3, 4, 5];
        const lineData = validDays.map(day => {
            const row: any = { day: `J${day}`, voters: 0 };
            const dayVoters = votersPerDay.find(v => v.day === day);
            row.voters = dayVoters?._count.userId || 0;
            dailyData.filter(d => d.day === day).forEach(list => {
                const total = criteriaKeys.reduce((sum, k) => {
                    return sum + (list._avg[`score${k}` as `score${CriteriaKey}`] || 0);
                }, 0);
                row[list.listName] = Number(total.toFixed(2));
            });
            return row;
        });

        // Scores globaux par liste (total des 4 critères)
        const globalScores = listAverages.map(list => {
            const total = criteriaKeys.reduce((sum, k) => {
                return sum + (list._avg[`score${k}` as `score${CriteriaKey}`] || 0);
            }, 0);
            return {
                name: list.listName,
                total: Number(total.toFixed(2)),
                votes: list._count.userId,
                details: {
                    Bouffe: Number((list._avg.scoreBouffe || 0).toFixed(2)),
                    Ambiance: Number((list._avg.scoreAmbiance || 0).toFixed(2)),
                    Projets: Number((list._avg.scoreProjets || 0).toFixed(2)),
                    Respect: Number((list._avg.scoreRespect || 0).toFixed(2)),
                }
            };
        });

        const winner = globalScores.length
            ? globalScores.reduce((a, b) => a.total > b.total ? a : b)
            : null;

        res.json({
            totalVoters,
            globalScores,
            winner: winner?.name || null,
            radarData,
            lineData,
        });

    } catch (error) {
        console.error('Global evaluation error:', error);
        res.status(500).json({ error: 'Impossible de charger l\'évaluation globale.' });
    }
});
