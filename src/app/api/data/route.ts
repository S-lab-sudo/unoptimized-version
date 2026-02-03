
import { NextResponse } from 'next/server';

export const runtime = 'edge';

// HEAVY MOCK GENERATOR: We generate a significant dataset for the Edge to ensure 
// that client-side rendering and filtering still lag as intended.
const generateHeavyMock = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `edge-mock-${i}`,
    name: `Pseudo Record ${i}`,
    email: `heavy-payload-${i}@edge-simulation.io`,
    role: "Mock Developer",
    department: "Lag Simulation",
    status: i % 3 === 0 ? "Active" : "Inactive",
    joinedDate: "2024-01-01",
    location: "Global Edge",
    salary: 75000 + (i % 1000),
    performance: 5,
    bio: "This is a simulated heavy record used to demonstrate client-side bottlenecks on the web deployment."
  }));
};

export async function GET() {
  try {
    // If we are running the build or on the edge where fs isn't available
    // but NODE_ENV is development (local machine), use the real file.
    if (process.env.NODE_ENV === 'development') {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const FILE_PATH = path.join(process.cwd(), 'public', 'data.json');
        
        if (fs.existsSync(FILE_PATH)) {
          const fileContent = fs.readFileSync(FILE_PATH, 'utf-8');
          return NextResponse.json(JSON.parse(fileContent));
        }
      } catch (innerError) {
        console.warn("FS import failed even in dev, likely edge-shimmed environment.");
      }
    }
  } catch (e) {
    console.error("Local file read exception");
  }

  // ON THE WEB: We return 100,000 items instead of 50. 
  // This is enough to lag any browser without virtualization.
  const heavyData = generateHeavyMock(100000);
  return NextResponse.json(heavyData);
}

export async function PATCH() {
  // Simulate a 2.5-second blocking delay before returning the error
  // to show "Server Lag" on the web version.
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  return NextResponse.json(
    { error: "EDGE_LIMIT_REACHED: File System writes are physically impossible on Cloudflare Edge. This proves the need for a Database (Phase 2)." },
    { status: 403 }
  );
}
