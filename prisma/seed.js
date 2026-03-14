import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const runningTips = [
  { tip: "Start slowly: Begin your run at an easy pace and gradually increase speed over time.", dayOfWeek: 0 },
  { tip: "Focus on cadence: Aim for 170-180 steps per minute to improve running efficiency.", dayOfWeek: 1 },
  { tip: "Interval training: Alternate between fast and slow running to boost your speed.", dayOfWeek: 2 },
  { tip: "Strengthen your core: Planks and bridges help maintain good running form.", dayOfWeek: 3 },
  { tip: "Rest days are crucial: Allow your muscles to recover to prevent injury.", dayOfWeek: 4 },
  { tip: "Hill repeats: Running uphill builds strength and improves sprint power.", dayOfWeek: 5 },
  { tip: "Stay consistent: Regular running builds cardiovascular endurance better than occasional intense workouts.", dayOfWeek: 6 },
];

async function main() {
  console.log('Seeding database...');
  
  await prisma.tip.createMany({
    data: runningTips,
    skipDuplicates: true,
  });
  
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });