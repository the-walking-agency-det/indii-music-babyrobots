import { PrismaClient } from '@prisma/client';
import { dbConfig } from './test-db-config';

/**
 * Sets up a Prisma client for testing
 */
export async function setupPrisma() {
  const prisma = new PrismaClient(dbConfig.prisma);
  
  // Clean database
  await prisma.$transaction([
    prisma.task.deleteMany(),
    prisma.agent.deleteMany(),
    prisma.vectorDocument.deleteMany(),
    prisma.memory.deleteMany()
  ]);
  
  return prisma;
}

/**
 * Tests for the Prisma setup utility
 */
if (process.env.NODE_ENV === 'test') {
  describe('Prisma Setup', () => {
    let prisma: PrismaClient;

    beforeEach(async () => {
      prisma = await setupPrisma();
    });

    afterEach(async () => {
      await prisma.$disconnect();
    });

    it('should create a working database connection', async () => {
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      expect(result[0].test).toBe(1);
    });

    it('should start with empty tables', async () => {
      const counts = await Promise.all([
        prisma.memory.count(),
        prisma.vectorDocument.count(),
        prisma.agent.count(),
        prisma.task.count()
      ]);
      
      counts.forEach(count => expect(count).toBe(0));
    });

    it('should enforce foreign key constraints', async () => {
      // Try to create a task with non-existent agent
      await expect(
        prisma.task.create({
          data: {
            agentId: 'fake-agent',
            status: 'pending',
            data: {}
          }
        })
      ).rejects.toThrow();
    });

    it('should handle transactions correctly', async () => {
      // Start a transaction that should fail
      try {
        await prisma.$transaction(async (tx) => {
          // Create an agent
          await tx.agent.create({
            data: {
              name: 'test-agent',
              metadata: {},
              lastActive: new Date()
            }
          });

          // This should fail due to duplicate name
          await tx.agent.create({
            data: {
              name: 'test-agent', // Same name!
              metadata: {},
              lastActive: new Date()
            }
          });
        });
        fail('Transaction should have failed');
      } catch (error) {
        // Transaction failed as expected
        const agentCount = await prisma.agent.count();
        expect(agentCount).toBe(0); // Transaction rolled back
      }
    });
  });
}
