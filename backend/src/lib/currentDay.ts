import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Retourne le jour de vote actif (1-5) défini par l'admin.
 * null = vote fermé.
 */
export async function getCurrentVoteDay(): Promise<number | null> {
    const config = await prisma.voteConfig.findUnique({
        where: { id: 'singleton' }
    });
    return config?.activeDay ?? null;
}
