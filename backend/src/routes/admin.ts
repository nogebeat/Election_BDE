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
