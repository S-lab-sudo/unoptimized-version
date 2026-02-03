
import { NextResponse } from 'next/server';

export const runtime = 'edge';

const FILE_PATH = './public/data.json';

// THE ULTIMATE UNOPTIMIZED GET
export async function GET() {
  // 1. LOCAL LOGIC: If running locally and file exists, read it (Slowest approach)
  if (process.env.NODE_ENV === 'development') {
    try {
      const fs = await import('fs');
      if (fs.existsSync(FILE_PATH)) {
        const data = fs.readFileSync(FILE_PATH, 'utf-8');
        return new Response(data, { headers: { 'Content-Type': 'application/json' } });
      }
    } catch (e) {
      console.warn("Local file read unavailable, falling back to streamer");
    }
  }

  // 2. CLOUDFLARE/DEPLOYED LOGIC: Stream 1M rows directly to browser-memory
  const encoder = new TextEncoder();
  const totalRows = 1000000;

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode('['));
      for (let i = 0; i < totalRows; i++) {
        const record = {
          id: `row-${i}`,
          name: `Unoptimized User ${i}`,
          email: `crash-test-${i}@bad-ux.com`,
          role: "Developer",
          department: "Performance Bottlenecks",
          status: "Active",
          joinedDate: "2024-01-01",
          location: "Browser Memory Hell",
          salary: 50000 + i,
          performance: 1,
          bio: "This is a redundant string designed to occupy as much heap memory as possible."
        };
        let json = JSON.stringify(record);
        if (i < totalRows - 1) json += ',';
        controller.enqueue(encoder.encode(json));
        if (i % 10000 === 0) await new Promise(r => setTimeout(r, 0));
      }
      controller.enqueue(encoder.encode(']'));
      controller.close();
    }
  });

  return new Response(stream, { headers: { 'Content-Type': 'application/json' } });
}

// THE ULTIMATE UNOPTIMIZED PATCH
export async function PATCH(request: Request) {
  const { id, updates } = await request.json();

  // 1. LOCAL LOGIC: Actually overwrite the 300MB file (Extremely slow/unoptimized)
  if (process.env.NODE_ENV === 'development') {
    try {
      const fs = await import('fs');
      if (fs.existsSync(FILE_PATH)) {
        console.log(`[UNOPTIMIZED] Reading 300MB to update 1 row...`);
        const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
        
        const index = data.findIndex((item: any) => item.id === id);
        if (index !== -1) {
          data[index] = { ...data[index], ...updates };
          console.log(`[UNOPTIMIZED] Writing 300MB back to disk...`);
          fs.writeFileSync(FILE_PATH, JSON.stringify(data));
          return NextResponse.json({ success: true, message: "Bloated Write Complete" });
        }
      }
    } catch (e: any) {
      return NextResponse.json({ error: "Local Write Failed: " + e.message }, { status: 500 });
    }
  }

  // 2. CLOUDFLARE LOGIC: Explain the architectual failure
  return NextResponse.json(
    { error: "RUNTIME_RESTRICTION: File System writes are impossible on Cloudflare Edge. This architectural limitation is exactly why we need a Database for Phase 2." },
    { status: 403 }
  );
}
