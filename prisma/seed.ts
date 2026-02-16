
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const offices = [
    { key: 'PRESIDENT', name: 'President', scope: 'NATIONAL' },
    { key: 'GOVERNOR', name: 'Governor', scope: 'STATE' },
    { key: 'SENATE', name: 'Senate', scope: 'STATE' },
    { key: 'REPS', name: 'House of Reps', scope: 'STATE' },
    { key: 'CHAIRMAN', name: 'LGA Chairman', scope: 'LGA' },
    { key: 'COUNCILLOR', name: 'Councillor', scope: 'WARD' },
  ];

  for (const o of offices) {
    const office = await prisma.office.upsert({
      where: { key: o.key },
      update: {},
      create: o,
    });

    // Seed 3 generic candidates per office
    const parties = ['Party A', 'Party B', 'Party C'];
    for (let i = 0; i < 3; i++) {
      await prisma.candidate.create({
        data: {
          name: `Candidate ${String.fromCharCode(65 + i)}`,
          party: parties[i],
          officeId: office.id,
          verified: true,
          // Placeholder for Lagos scope examples
          state: o.scope !== 'NATIONAL' ? 'Lagos' : null,
          lga: o.scope === 'LGA' ? 'Ikeja' : null,
        }
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    // Casting to any to fix "Property 'exit' does not exist on type 'Process'" error in restricted TypeScript environments
    (process as any).exit(1);
  });
