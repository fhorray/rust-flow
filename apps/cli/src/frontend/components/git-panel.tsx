import { useState, useEffect } from "react";
import { GitCommit, RefreshCw, UploadCloud, CheckCircle, AlertCircle, Loader } from "lucide-react";

interface GitChange {
  code: string;
  file: string;
}

export function GitPanel() {
  const [changes, setChanges] = useState<GitChange[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [stats, setStats] = useState({ ahead: 0, behind: 0, currentBranch: "main" });

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/local/git/status");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setChanges(data.changes || []);
      setStats({
        ahead: data.ahead || 0,
        behind: data.behind || 0,
        currentBranch: data.currentBranch || "main"
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Poll every 10s for full view
    return () => clearInterval(interval);
  }, []);

  const handleCommit = async () => {
    if (!message) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/local/git/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Commit failed");
      }
      setMessage("");
      setSuccess("Changes committed successfully!");
      setTimeout(() => setSuccess(null), 3000);
      fetchStatus();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      const res = await fetch("/local/git/sync", { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Sync failed");
      }
      setSuccess("Synced with GitHub!");
      setTimeout(() => setSuccess(null), 3000);
      fetchStatus();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl animate-in fade-in zoom-in duration-300">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-rust/10 p-2.5 rounded-xl text-rust border border-rust/20">
            <GitCommit size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-zinc-100 italic tracking-tight flex items-center gap-2">
              Sync System
              <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-bold not-italic tracking-widest border border-zinc-700">EXPERIMENTAL</span>
            </h2>

            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-0.5">
              {stats.ahead > 0 ? `${stats.ahead} Commits to Push` : "Source Control"}
            </p>
          </div>
        </div>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 transition-all active:scale-95 disabled:opacity-30"
          title="Refresh Status"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        <div className="container mx-auto space-y-8">
          {/* Notifications */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-start gap-4 animate-in slide-in-from-top-2">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-black uppercase text-[10px] tracking-widest mb-1">Error Detected</p>
                <p className="text-zinc-300 font-medium">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-sm flex items-center gap-4 animate-in zoom-in">
              <CheckCircle size={20} />
              <div>
                <p className="font-black uppercase text-[10px] tracking-widest mb-0.5">Success</p>
                <p className="text-zinc-100 font-bold">{success}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* File Changes List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                  PENDING CHANGES
                </h3>
                <span className="text-[10px] font-black text-rust tabular-nums">
                  {changes.length} FILES
                </span>
              </div>

              <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl p-2 min-h-[300px] flex flex-col shadow-inner">
                {loading && !changes.length ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 gap-4">
                    <Loader className="animate-spin text-rust" size={32} />
                    <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Scanning Course Files...</span>
                  </div>
                ) : changes.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 gap-4 opacity-40">
                    <CheckCircle size={48} strokeWidth={1.5} />
                    <p className="text-xs font-bold italic tracking-wide">Workspace is synchronized</p>
                  </div>
                ) : (
                  <div className="space-y-1 overflow-y-auto max-h-[500px] p-2 custom-scrollbar">
                    {changes.map((c, i) => (
                      <div key={i} className="flex items-center gap-4 text-sm text-zinc-300 p-3 bg-zinc-900/30 hover:bg-zinc-800/50 border border-zinc-800/30 hover:border-zinc-700/50 rounded-xl group transition-all">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-[10px] font-black ${c.code.includes("M") ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                          c.code.includes("?") ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                            c.code.includes("D") ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-zinc-800 text-zinc-500"
                          }`}>
                          {c.code.trim() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-bold text-zinc-200 text-xs" title={c.file}>{c.file}</p>
                          <p className="text-[9px] text-zinc-600 font-black uppercase tracking-tighter">
                            {c.code.includes("M") ? "Modified" : c.code.includes("?") ? "Untracked" : "Deleted"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Commit Form */}
            <div className="space-y-4 flex flex-col">
              <div className="flex items-center mb-2">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                  PREPARE UPDATE
                </h3>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-6 flex-1 shadow-lg">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Update Description</label>
                    <span className="text-[9px] font-bold text-zinc-600 tabular-nums">{message.length}/200</span>
                  </div>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value.substring(0, 200))}
                    placeholder="Briefly describe your changes..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-100 focus:outline-none focus:border-rust/50 focus:ring-1 focus:ring-rust/20 transition-all resize-none h-32 font-medium"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleCommit}
                    disabled={!message || loading || syncing || changes.length === 0}
                    className="w-full bg-gradient-to-r from-rust to-orange-500 hover:brightness-110 disabled:opacity-20 disabled:grayscale text-white py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-rust/10 active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    {loading && !syncing ? <Loader className="animate-spin" size={16} /> : <CheckCircle size={18} />}
                    COMMIT TO HISTORY
                  </button>

                  <div className="relative py-2 flex items-center">
                    <div className="flex-1 border-t border-zinc-800"></div>
                    <span className="px-3 text-[9px] font-black text-zinc-700 uppercase tracking-widest">or</span>
                    <div className="flex-1 border-t border-zinc-800"></div>
                  </div>

                  <button
                    onClick={handleSync}
                    disabled={loading || syncing}
                    className="w-full bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 disabled:opacity-20 text-zinc-300 hover:text-white rounded-xl py-4 font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    {syncing ? <Loader className="animate-spin text-rust" size={16} /> : <UploadCloud size={18} />}
                    PUSH & PULL (SYNC) {stats.ahead > 0 && `(${stats.ahead})`}
                  </button>
                </div>

                <p className="text-[9px] text-zinc-600 font-bold text-center italic mt-auto">
                  Your work is automatically cached locally, but syncing ensures persistence across devices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}
