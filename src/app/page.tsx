
"use client";

export const runtime = 'edge';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Database, Search, RefreshCcw, HardDrive, Edit3, Settings2, AlertTriangle, Zap } from "lucide-react";

interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [status, setStatus] = useState("System Standby");
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  
  const [editingRow, setEditingRow] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [memUsage, setMemUsage] = useState<number | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      const usage = (performance as PerformanceWithMemory).memory?.usedJSHeapSize;
      setMemUsage(usage);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFetch = async () => {
    setIsLoading(true);
    setData([]);
    setStatus("Initiating Stream: 1M Rows...");
    const start = performance.now();
    
    try {
      const res = await fetch("/api/data");
      if (!res.ok) throw new Error("Stream Interrupted");
      
      const json = await res.json();
      const end = performance.now();
      
      setData(json);
      setStatus(`Bottleneck: ${json.length.toLocaleString()} items parsed in ${Math.round(end - start)}ms`);
    } catch (err: any) {
      setStatus("Failure: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingRow) return;
    setIsUpdating(true);
    setStatus("Performing Bloated Write...");
    
    try {
      const res = await fetch("/api/data", {
        method: "PATCH",
        body: JSON.stringify({ id: editingRow.id, updates: editingRow }),
      });
      
      if (res.ok) {
        setStatus(`Mutation Persistent`);
        setData(prev => prev.map(item => item.id === editingRow.id ? editingRow : item));
        setEditingRow(null);
      } else {
        const err = await res.json();
        setStatus("Error: " + err.error);
      }
    } catch (err) {
      setStatus("Connection Lost");
    } finally {
      setIsUpdating(false);
    }
  };

  // UNOPTIMIZED FILTERING: No virtualization, raw DOM pressure
  const filteredData = search 
    ? data.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) || 
        item.email.toLowerCase().includes(search.toLowerCase()) ||
        item.role?.toLowerCase().includes(search.toLowerCase())
      )
    : data;

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-[#171717] dark:text-[#ededed] font-sans selection:bg-indigo-500/30">
      
      {/* Premium Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 py-12 md:py-20 space-y-12">
        
        {/* Header Section */}
        <header className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest animate-fade-in">
            <Zap className="w-3 h-3 fill-current" />
            Performance Case Study: Phase 1
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-none bg-gradient-to-r from-[#171717] to-[#737373] dark:from-[#ededed] dark:to-[#737373] bg-clip-text text-transparent">
                Unoptimized<br />Legacy System.
              </h1>
              <p className="text-lg text-neutral-500 max-w-xl font-medium">
                Simulating the failure of monolithic data structures. 1 Million records loaded directly into Client-State without virtualization.
              </p>
            </div>
            
            <Card className="group relative overflow-hidden bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl border-neutral-200 dark:border-neutral-800 shadow-2xl transition-all duration-500 hover:shadow-indigo-500/10">
              <CardContent className="p-6 min-w-[300px] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Browser Heap</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-lg font-mono font-black text-rose-500">{memUsage ? Math.round(memUsage / 1048576) : '--'} MB</span>
                  </div>
                </div>
                <div className="h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-rose-500 transition-all duration-1000 ${data.length > 0 ? 'w-full' : 'w-[5%]'}`} 
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">
                  <span>State: {data.length > 0 ? 'MEMORY_STRESSED' : 'STABLE'}</span>
                  <span>{data.length.toLocaleString()} ROWS</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </header>

        {/* Dashboard Shell */}
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col lg:flex-row gap-4">
            <Button 
              onClick={handleFetch} 
              disabled={isLoading}
              className={`relative h-16 px-8 rounded-2xl font-bold text-base transition-all duration-300 flex items-center gap-3 overflow-hidden group shadow-xl ${
                isLoading 
                ? 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800' 
                : 'bg-[#171717] text-white dark:bg-white dark:text-black hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-1000 -translate-x-full" />
              {isLoading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
              <span>{isLoading ? "STREAMING PAYLOAD..." : "Fetch and show data"}</span>
            </Button>

            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-indigo-500 transition-colors" />
              <Input 
                placeholder="Search across 1M records (Warning: Heavy CPU Lag)..."
                className="h-16 pl-14 pr-6 rounded-2xl border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md focus-visible:ring-indigo-500/50 focus-visible:ring-offset-0 text-base font-medium shadow-lg transition-all"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center h-16 px-6 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl gap-3 min-w-[240px]">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600/60 dark:text-amber-400/60 mb-1">Status</span>
                <span className="text-xs font-bold font-mono text-amber-700 dark:text-amber-300 truncate max-w-[150px]">{status}</span>
              </div>
            </div>
          </div>

          {/* Main Table View */}
          <Card className="border-neutral-200 dark:border-neutral-800 bg-white/30 dark:bg-neutral-900/30 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors duration-500">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                {data.length > 0 ? (
                  <Table>
                    <TableHeader className="bg-neutral-50/50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-24 px-8 py-5 font-bold text-[10px] uppercase tracking-widest text-neutral-400">ID</TableHead>
                        <TableHead className="px-8 py-5 font-bold text-[10px] uppercase tracking-widest text-neutral-400">Entity Metadata</TableHead>
                        <TableHead className="px-8 py-5 font-bold text-[10px] uppercase tracking-widest text-neutral-400">Commercial</TableHead>
                        <TableHead className="px-8 py-5 font-bold text-[10px] uppercase tracking-widest text-neutral-400 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((row) => (
                        <TableRow key={row.id} className="group border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-all duration-200">
                          <TableCell className="px-8 py-5 font-mono text-[10px] text-neutral-400">#{row.id.split('-')[1]}</TableCell>
                          <TableCell className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="text-base font-bold text-[#171717] dark:text-[#ededed] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{row.name}</span>
                              <span className="text-xs text-neutral-500 font-medium">{row.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">${row.salary.toLocaleString()}</span>
                              <Badge variant="secondary" className="w-fit text-[9px] h-4 font-black px-1.5 rounded-sm uppercase tracking-tighter mt-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-none">{row.role}</Badge>
                            </div>
                          </TableCell>
                          <TableCell className="px-8 py-5 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 px-0 rounded-lg hover:bg-indigo-500/10 hover:text-indigo-600 text-neutral-400 transition-all"
                              onClick={() => setEditingRow(row)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-40 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                      <Database className="relative w-16 h-16 text-neutral-300 dark:text-neutral-700" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-bold text-neutral-400 dark:text-neutral-600 uppercase tracking-tighter italic">Database Latent</p>
                      <p className="text-xs text-neutral-500 max-w-[240px]">The local storage is ready for ingestion. Initiating the fetch will stress the JavaScript engine.</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            {data.length > 0 && (
              <div className="px-8 py-4 bg-rose-500/5 border-t border-neutral-200 dark:border-neutral-800 backdrop-blur-xl">
                 <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 text-center">
                  Showing <span className="text-rose-500 underline underline-offset-4">{data.length.toLocaleString()}</span> records // Thread blocking: <span className="text-rose-600 font-black">HIGH RISK</span>
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modern Edit Dialog */}
      <Dialog open={!!editingRow} onOpenChange={() => setEditingRow(null)}>
        <DialogContent className="sm:max-w-xl rounded-[2rem] border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-0">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
              <Settings2 className="w-6 h-6 text-indigo-600" />
            </div>
            <DialogTitle className="text-3xl font-bold tracking-tight">Modify Instance</DialogTitle>
            <DialogDescription className="text-neutral-500 text-base font-medium">
              Mutating this record will trigger a full JSON block re-write on the server runtime.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-8 grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Entity Name</Label>
              <Input 
                value={editingRow?.name || ""} 
                onChange={(e) => setEditingRow({...editingRow, name: e.target.value})}
                className="h-14 rounded-xl border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-white/5 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Contact Email</Label>
              <Input 
                value={editingRow?.email || ""} 
                onChange={(e) => setEditingRow({...editingRow, email: e.target.value})}
                className="h-14 rounded-xl border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-white/5 font-medium text-neutral-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Role Architecture</Label>
              <Input 
                value={editingRow?.role || ""} 
                onChange={(e) => setEditingRow({...editingRow, role: e.target.value})}
                className="h-14 rounded-xl border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-white/5 font-bold"
              />
            </div>
             <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Metrics (Salary)</Label>
              <Input 
                type="number"
                value={editingRow?.salary || 50000} 
                onChange={(e) => setEditingRow({...editingRow, salary: parseInt(e.target.value)})}
                className="h-14 rounded-xl border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-white/5 font-mono font-bold"
              />
            </div>
          </div>

          <DialogFooter className="p-8 pt-4 bg-neutral-50 dark:bg-neutral-800/30 flex gap-3">
            <Button variant="ghost" onClick={() => setEditingRow(null)} className="flex-1 h-14 rounded-xl font-bold">Discard</Button>
            <Button 
               onClick={handleUpdate} 
               disabled={isUpdating}
               className="flex-1 h-14 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
            >
              {isUpdating ? <RefreshCcw className="w-5 h-5 animate-spin mr-2" /> : <HardDrive className="w-5 h-5 mr-2" />}
              Commit Mutation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
