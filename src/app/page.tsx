
"use client";

export const runtime = 'edge';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Database, Search, RefreshCcw, HardDrive, Edit3, Settings2 } from "lucide-react";

// Fix for TypeScript performance memory error
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [status, setStatus] = useState("System Idle");
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  
  // Edit Modal State
  const [editingRow, setEditingRow] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [memUsage, setMemUsage] = useState<number | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
    // Update memory usage every second
    const interval = setInterval(() => {
      const usage = (performance as PerformanceWithMemory).memory?.usedJSHeapSize;
      setMemUsage(usage);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFetch = async () => {
    setIsLoading(true);
    setStatus("Downloading 300MB JSON payload...");
    const start = performance.now();
    
    try {
      const res = await fetch("/api/data");
      if (!res.ok) throw new Error("Network error during file streaming");
      
      const json = await res.json();
      const end = performance.now();
      
      setData(json);
      setStatus(`Bottleneck hit: ${json.length.toLocaleString()} items parsed in ${Math.round(end - start)}ms`);
    } catch (err: any) {
      setStatus("Critical Failure: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingRow) return;
    
    setIsUpdating(true);
    setStatus("Blocking IO: Re-writing 300MB storage...");
    const start = performance.now();
    
    try {
      const res = await fetch("/api/data", {
        method: "PATCH",
        body: JSON.stringify({ id: editingRow.id, updates: editingRow }),
      });
      
      if (res.ok) {
        const end = performance.now();
        setStatus(`Disk Write Success: ${Math.round(end - start)}ms elapsed`);
        setData(prev => prev.map(item => item.id === editingRow.id ? editingRow : item));
        setEditingRow(null);
      }
    } catch (err) {
      setStatus("Disk Write Failed");
    } finally {
      setIsUpdating(false);
    }
  };

  // Heavy main-thread filtering
  const filteredData = search 
    ? data.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) || 
        item.email.toLowerCase().includes(search.toLowerCase()) ||
        item.role.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 15)
    : data.slice(0, 15);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-4 md:p-8 font-sans selection:bg-rose-500 selection:text-white">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-neutral-900 dark:text-neutral-50 leading-none">
              UNOPTIMIZED<span className="text-destructive font-serif italic">!</span>
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-lg max-w-2xl leading-relaxed">
              Managing <span className="text-neutral-900 dark:text-neutral-100 font-bold">1 Million Rows</span> inside a single JSON file. 
              Searching and saving will block the JavaScript main thread.
            </p>
          </div>
          
          <Card className="bg-neutral-900 border-neutral-800 shadow-2xl p-6 min-w-[280px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-neutral-500 uppercase">Heap Usage</span>
                <span className="text-destructive text-xs font-bold font-mono">{memUsage ? Math.round(memUsage / 1048576) : '--'} MB</span>
              </div>
              <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div className={`h-full bg-destructive transition-all duration-1000 ${data.length > 0 ? 'w-[85%]' : 'w-[5%]'}`}></div>
              </div>
              <p className="text-[10px] text-neutral-500 italic text-center underline decoration-neutral-700">Main thread status: {data.length > 0 ? 'HEAVILY THROTTLED' : 'IDLE'}</p>
            </div>
          </Card>
        </div>

        {/* Control Center */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden bg-white dark:bg-neutral-900">
           <CardHeader className="border-b bg-neutral-50/50 dark:bg-neutral-800/50 px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
            <Button 
              onClick={handleFetch} 
              disabled={isLoading}
              className="group relative flex-1 h-20 bg-destructive hover:bg-red-600 text-white border-none shadow-[0_10px_0_0_#991b1b] active:shadow-none active:translate-y-[10px] transition-all overflow-hidden"
            >
              <div className="relative z-10 flex items-center justify-center gap-4">
                {isLoading ? <RefreshCcw className="w-8 h-8 animate-spin" /> : <Database className="w-8 h-8 group-hover:scale-110 transition-transform" />}
                <div className="text-left">
                  <div className="text-xl font-black uppercase leading-none tracking-tighter">Fetch and show data</div>
                  <div className="text-[10px] uppercase font-bold opacity-70">Trigger Main-Thread Execution Lock</div>
                </div>
              </div>
            </Button>
                <div className="h-14 px-6 flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono text-xs">
                   <span className="text-neutral-400 mr-2 uppercase">Log:</span> <span className="font-bold text-neutral-800 dark:text-neutral-200 truncate max-w-[200px]">{status}</span>
                </div>
              </div>

              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <Input 
                  placeholder="Filter by name, email, or role..."
                  className="h-14 pl-12 text-base border-2 focus-visible:ring-destructive rounded-xl"
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            {data.length > 0 ? (
              <Table>
                <TableHeader className="bg-neutral-50 dark:bg-neutral-950">
                  <TableRow className="border-b border-neutral-200 dark:border-neutral-800">
                    <TableHead className="px-6 py-4 font-black text-[10px] tracking-widest uppercase text-neutral-400">UUID / Identity</TableHead>
                    <TableHead className="px-6 py-4 font-black text-[10px] tracking-widest uppercase text-neutral-400">Information</TableHead>
                    <TableHead className="px-6 py-4 font-black text-[10px] tracking-widest uppercase text-neutral-400">Context</TableHead>
                    <TableHead className="px-6 py-4 font-black text-[10px] tracking-widest uppercase text-neutral-400">Metrics</TableHead>
                    <TableHead className="px-6 py-4 font-black text-[10px] tracking-widest uppercase text-neutral-400 text-right">Ops</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((row) => (
                    <TableRow key={row.id} className="group hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors border-b dark:border-neutral-800">
                      <TableCell className="px-6 py-6 align-top">
                        <div className="font-mono text-[10px] text-neutral-400 mb-1">{row.id}</div>
                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter">Loc: {row.location}</Badge>
                      </TableCell>
                      <TableCell className="px-6 py-6 align-top">
                        <div className="font-black text-xl text-neutral-900 dark:text-neutral-100 group-hover:text-destructive transition-colors">{row.name}</div>
                        <div className="text-sm font-medium text-neutral-500">{row.email}</div>
                      </TableCell>
                      <TableCell className="px-6 py-6 align-top">
                        <div className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{row.role}</div>
                        <div className="text-xs text-neutral-500 underline decoration-neutral-300 dark:decoration-neutral-700">{row.department}</div>
                      </TableCell>
                      <TableCell className="px-6 py-6 align-top">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-neutral-400">SALARY</span>
                            <span className="text-sm font-mono font-bold">${row.salary.toLocaleString()}</span>
                          </div>
                          <Badge className={`w-fit py-0.5 text-[9px] font-black uppercase ${
                            row.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-neutral-400 text-white'
                          }`}>{row.status}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-6 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="hover:bg-neutral-200 dark:hover:bg-neutral-800 h-10 w-10 text-neutral-400 hover:text-destructive transition-all"
                          onClick={() => setEditingRow(row)}
                        >
                          <Edit3 className="w-5 h-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-20 text-center flex flex-col items-center gap-4 opacity-50">
                <Database className="w-12 h-12 text-neutral-300" />
                <p className="font-serif italic text-neutral-400">Storage not yet loaded. Press button to stream 300MB...</p>
              </div>
            )}
          </CardContent>
          {data.length > 0 && (
            <div className="p-6 bg-neutral-100/50 dark:bg-neutral-950/50 border-t border-neutral-200 dark:border-neutral-800 text-center">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
                Data Stream Active // Rendering index <span className="text-destructive font-bold underline">0 - 15</span> of 1,000,000
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingRow} onOpenChange={() => setEditingRow(null)}>
        <DialogContent className="sm:max-w-[700px] border-neutral-200 dark:border-neutral-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-destructive" /> Modify Record
            </DialogTitle>
            <DialogDescription className="text-neutral-500 font-medium">
              Updating this record will require the server to re-write a 300MB JSON file.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Full Name</Label>
              <Input 
                id="name" 
                value={editingRow?.name || ""} 
                onChange={(e) => setEditingRow({...editingRow, name: e.target.value})}
                className="font-bold h-12 border-2 focus-visible:ring-destructive"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Email Address</Label>
              <Input 
                id="email" 
                value={editingRow?.email || ""} 
                onChange={(e) => setEditingRow({...editingRow, email: e.target.value})}
                className="font-medium h-12 border-2 focus-visible:ring-destructive"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Role / Position</Label>
              <Input 
                id="role" 
                value={editingRow?.role || ""} 
                onChange={(e) => setEditingRow({...editingRow, role: e.target.value})}
                className="font-bold h-12 border-2 focus-visible:ring-destructive"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary" className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Annual Salary ($)</Label>
              <Input 
                id="salary" 
                type="number"
                value={editingRow?.salary || 0} 
                onChange={(e) => setEditingRow({...editingRow, salary: parseInt(e.target.value)})}
                className="font-mono font-bold h-12 border-2 focus-visible:ring-destructive"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="bio" className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Biography / Notes</Label>
              <Input 
                id="bio" 
                value={editingRow?.bio || ""} 
                onChange={(e) => setEditingRow({...editingRow, bio: e.target.value})}
                className="italic font-medium h-12 border-2 focus-visible:ring-destructive"
              />
            </div>
          </div>

          <DialogFooter className="bg-neutral-50 dark:bg-neutral-900 -mx-6 -mb-6 p-6 border-t dark:border-neutral-800">
            <Button variant="outline" onClick={() => setEditingRow(null)} className="h-12 px-6 font-bold uppercase text-xs tracking-widest">Abort</Button>
            <Button 
               variant="destructive" 
               onClick={handleUpdate} 
               disabled={isUpdating}
               className="h-12 px-8 font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all gap-2"
            >
              {isUpdating ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <HardDrive className="w-4 h-4" />}
              Commit Heavy Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
