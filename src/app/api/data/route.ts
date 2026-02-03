
import { NextResponse } from 'next/server';

export const runtime = 'edge';

const FILE_PATH = './public/data.json';

export async function GET() {
  // LOCAL LOGIC
  if (process.env.NODE_ENV === 'development') {
    try {
      const fs = await import('fs');
      if (fs.existsSync(FILE_PATH)) {
        const data = fs.readFileSync(FILE_PATH, 'utf-8');
        return new Response(data, { headers: { 'Content-Type': 'application/json' } });
      }
    } catch (e) {
      console.warn("Local file read unavailable");
    }
  }

  // WEB LOGIC: STREAMING 1,000,000 ROWS
  const encoder = new TextEncoder();
  const totalRows = 1000000;

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode('['));
      
      // Batch rows to avoid overhead and improve performance
      const batchSize = 1000;
      for (let i = 0; i < totalRows; i += batchSize) {
        let chunk = "";
        for (let j = 0; j < batchSize && (i + j) < totalRows; j++) {
          const currentIdx = i + j;
          const record = {
            id: `r-${currentIdx}`,
            name: `User ${currentIdx}`,
            email: `trash-${currentIdx}@unoptimized.com`,
            role: "Developer",
            salary: 50000 + currentIdx,
            bio: "Redundant buffer text designed to consume memory."
          };
          
          chunk += JSON.stringify(record);
          if (currentIdx < totalRows - 1) chunk += ',';
        }
        
        controller.enqueue(encoder.encode(chunk));
        
        // Give the event loop a break every batch to prevent Cloudflare from killing the worker
        await new Promise(r => setTimeout(r, 0));
      }
      
      controller.enqueue(encoder.encode(']'));
      controller.close();
    }
  });

  return new Response(stream, { 
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    } 
  });
}

export async function PATCH(request: Request) {
  const { id, updates } = await request.json();

  if (process.env.NODE_ENV === 'development') {
    try {
      const fs = await import('fs');
      if (fs.existsSync(FILE_PATH)) {
        const data = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
        const index = data.findIndex((item: any) => item.id === id);
        if (index !== -1) {
          data[index] = { ...data[index], ...updates };
          fs.writeFileSync(FILE_PATH, JSON.stringify(data));
          return NextResponse.json({ success: true });
        }
      }
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  return NextResponse.json(
    { error: "FILE_SYSTEM_UNAVAILABLE: Writes are blocked on Cloudflare Edge Runtime." },
    { status: 403 }
  );
}
