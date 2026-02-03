
import { NextResponse } from 'next/server';

export const runtime = 'edge';

// THE ULTIMATE UNOPTIMIZED STREAMER
// We stream 1,000,000 rows manually to the client.
// This is intentionally bad architecture designed to overwhelm the browser.
export async function GET() {
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
          bio: "This is a redundant string designed to occupy as much heap memory as possible to demonstrate the failure of unoptimized data handling at scale."
        };
        
        let json = JSON.stringify(record);
        if (i < totalRows - 1) json += ',';
        
        controller.enqueue(encoder.encode(json));
        
        // Yield every 5000 rows to prevent the Edge from timing out
        if (i % 5000 === 0) {
          await new Promise(r => setTimeout(r, 0));
        }
      }
      
      controller.enqueue(encoder.encode(']'));
      controller.close();
    }
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function PATCH() {
  // Simulate 3 seconds of "Thinking" to show bad server IO
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  return NextResponse.json(
    { error: "IO_FAILURE: Cloudflare Edge has no FileSystem. In a real app, this would be where we fail to save a 300MB file for a 1-row update." },
    { status: 403 }
  );
}
