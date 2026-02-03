
import { NextResponse } from 'next/server';

export const runtime = 'edge';

// For the "Unoptimized" version, we try to use FS locally but must 
// provide a fallback for the Cloudflare Edge environment.
export async function GET() {
  try {
    // We use a dynamic import and check to prevent the edge bundler 
    // from crashing during the build process.
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      const fs = await import('fs');
      const path = await import('path');
      const FILE_PATH = path.join(process.cwd(), 'public', 'data.json');
      
      if (fs.existsSync(FILE_PATH)) {
        const fileContent = fs.readFileSync(FILE_PATH, 'utf-8');
        return NextResponse.json(JSON.parse(fileContent));
      }
    }
  } catch (e) {
    console.error("Local file read failed, falling back to mock");
  }

  // Fallback / Production Mock Data (since 300MB files don't work on Edge)
  return NextResponse.json(
    Array.from({ length: 50 }, (_, i) => ({
      id: `edge-${i}`,
      name: `Edge Record ${i} (Demo Mode)`,
      email: `user${i}@edge-runtime.io`,
      role: "Cloudflare Worker",
      department: "Network Edge",
      status: "Active",
      joinedDate: "2024-02-01",
      location: "Global Edge",
      salary: 100000,
      performance: 10,
      bio: "This is a mock record because the Edge Runtime cannot host a 300MB JSON file. Local 'Unoptimized' mode supports full file CRUD."
    }))
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: "File System writes are not supported on the Cloudflare Edge. Please run locally to see the unoptimized write lag." },
    { status: 403 }
  );
}
