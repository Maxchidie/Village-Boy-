
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type OfficeSeed = {
  key: string;
  name: string;
  scope: "NATIONAL" | "STATE" | "LGA" | "WARD";
};

const OFFICES: OfficeSeed[] = [
  { key: "PRESIDENT", name: "President", scope: "NATIONAL" },
  { key: "GOVERNOR", name: "Governor", scope: "STATE" },
  { key: "SENATE", name: "Senate", scope: "STATE" },
  { key: "REPS", name: "House of Representatives", scope: "STATE" },
  { key: "STATE_ASSEMBLY", name: "State House of Assembly", scope: "STATE" },
  { key: "LGA_CHAIR", name: "Local Government Chair", scope: "LGA" },
  { key: "COUNCILLOR", name: "Councillor", scope: "WARD" },
];

async function main() {
  for (const o of OFFICES) {
    await prisma.office.upsert({
      where: { key: o.key },
      update: { name: o.name, scope: o.scope },
      create: { key: o.key, name: o.name, scope: o.scope },
    });
  }

  const offices = await prisma.office.findMany();
  // Added explicit types to Map to help with inference
  const officeByKey = new Map<string, any>(offices.map((o) => [o.key, o]));

  const lagos = "Lagos";
  const ikeja = "Ikeja";
  const ward1 = "Ward 1";

  const candidates: Array<{
    officeId: string;
    name: string;
    party?: string | null;
    verified?: boolean;
    state?: string | null;
    lga?: string | null;
    ward?: string | null;
  }> = [];

  const add = (
    officeKey: string,
    name: string,
    opts?: { party?: string; state?: string; lga?: string; ward?: string }
  ) => {
    const office = officeByKey.get(officeKey);
    if (!office) throw new Error(`Missing office: ${officeKey}`);
    candidates.push({
      // Fixed: Property 'id' does not exist on type 'unknown'. Cast office to any.
      officeId: (office as any).id,
      name,
      party: opts?.party ?? null,
      verified: false,
      state: opts?.state ?? null,
      lga: opts?.lga ?? null,
      ward: opts?.ward ?? null,
    });
  };

  add("PRESIDENT", "Candidate A", { party: "Party 1" });
  add("PRESIDENT", "Candidate B", { party: "Party 2" });
  add("PRESIDENT", "Candidate C", { party: "Party 3" });

  add("GOVERNOR", "Candidate X", { state: lagos, party: "Party 1" });
  add("GOVERNOR", "Candidate Y", { state: lagos, party: "Party 2" });

  add("LGA_CHAIR", "Chair Alpha", { state: lagos, lga: ikeja, party: "Party 1" });
  add("LGA_CHAIR", "Chair Beta", { state: lagos, lga: ikeja, party: "Party 3" });

  for (const c of candidates) {
    const existing = await prisma.candidate.findFirst({
      where: {
        officeId: c.officeId,
        name: c.name,
        state: c.state ?? null,
        lga: c.lga ?? null,
        ward: c.ward ?? null,
      },
    });

    if (existing) {
      await prisma.candidate.update({
        where: { id: existing.id },
        data: {
          party: c.party ?? null,
          verified: c.verified ?? false,
        },
      });
    } else {
      await prisma.candidate.create({ data: c });
    }
  }

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    // Fixed: Property 'exit' does not exist on type 'Process'. Cast process to any.
    (process as any).exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
