const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

beforeAll(async () => {
  // Reset the test database before all tests
  execSync('npm run test:db:reset');
});

beforeEach(async () => {
  // No cleanup needed between tests as we're using real data
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Make prisma client available globally
global.prisma = prisma;
