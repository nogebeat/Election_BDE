import express, { Request, Response } from 'express';
import cors from 'cors';

import authRoutes from './src/routes/auth';
import voteRoutes from './src/routes/votes';
import adminRoutes from './src/routes/admin';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Main API Routes
app.use('/api/auth', authRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'Backend is running with Postgres/Prisma' });
});

app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
});
