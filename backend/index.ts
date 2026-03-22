import 'dotenv/config'; // Charge les variables .env en premier
import express, { Request, Response } from 'express';
import cors from 'cors';

import authRoutes from './src/routes/auth';
import voteRoutes from './src/routes/votes';
import adminRoutes from './src/routes/admin';

const app = express();
const port = process.env.PORT || 3001;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';

// CORS — autorise le frontend
app.use(cors({
    origin: [frontendUrl, 'http://localhost:5173', 'http://localhost:8080'],
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'Backend Election BDE — opérationnel' });
});

// Gestion globale des erreurs non catchées
app.use((err: any, _req: Request, res: Response, _next: any) => {
    console.error('[SERVER ERROR]', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
});

app.listen(port, () => {
    console.log(`Backend démarré sur http://localhost:${port}`);
    console.log(`Frontend URL: ${frontendUrl}`);
});
