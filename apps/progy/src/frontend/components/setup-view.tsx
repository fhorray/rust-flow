import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import {
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  Loader2,
  Zap,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Button } from './ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from './ui/card';
import { Badge } from './ui/badge';

interface Check {
  name: string;
  status: 'pass' | 'fail';
  message: string;
}

interface SetupStatus {
  success: boolean;
  checks: Check[];
}

interface SetupViewProps {
  onCheckComplete: () => void;
}

export function SetupView({ onCheckComplete }: SetupViewProps) {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [guide, setGuide] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  async function checkStatus() {
    setChecking(true);
    try {
      const res = await fetch('/setup/status');
      const data = await res.json();
      setStatus(data);

      if (!data.success) {
        const guideRes = await fetch('/setup/guide');
        const guideData = await guideRes.json();
        setGuide(guideData.markdown);
      } else {
        setTimeout(() => onCheckComplete(), 1500);
      }
    } catch (e) {
      console.error('Failed to check setup status', e);
    } finally {
      setLoading(false);
      setChecking(false);
    }
  }

  useEffect(() => {
    checkStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 bg-rust blur-xl opacity-30 animate-pulse" />
            <div className="relative bg-gradient-to-br from-rust via-orange-500 to-rust-dark p-4 rounded-2xl shadow-2xl flex items-center justify-center">
              <Zap className="w-8 h-8 text-white fill-white animate-bounce" />
            </div>
          </div>
          <p className="text-xl font-black tracking-tight italic text-zinc-400">
            Verifying environment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-start p-6 relative overflow-hidden overflow-y-auto">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-rust/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-3xl w-full space-y-8 relative z-10 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="text-center space-y-3">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-rust blur-xl opacity-30 animate-pulse" />
              <div className="relative bg-gradient-to-br from-rust via-orange-500 to-rust-dark p-2 rounded-xl shadow-2xl">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Prog
              <span className="bg-gradient-to-r from-rust to-orange-400 bg-clip-text text-transparent">
                y
              </span>
            </h1>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
            Setup Required
          </h2>
          <p className="text-zinc-400 font-medium">
            We need to verify a few things before you can start learning.
          </p>
        </header>

        {/* Vertical Stack */}
        <div className="space-y-6">
          {/* Guide Card - Now First */}
          {!status?.success && guide && (
            <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50 shadow-2xl rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-zinc-800/50 bg-zinc-900/40 py-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-rust" />
                  Installation Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-zinc-300">
                  <ReactMarkdown
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      h1: ({ node, ...props }) => (
                        <h1
                          className="text-3xl font-bold text-zinc-100 mt-0 mb-4"
                          {...props}
                        />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2
                          className="text-2xl font-bold text-zinc-100 mt-5 mb-3"
                          {...props}
                        />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3
                          className="text-xl font-bold text-zinc-100 mt-4 mb-2"
                          {...props}
                        />
                      ),
                      p: ({ node, ...props }) => (
                        <p className="mb-4 leading-relaxed" {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul
                          className="list-disc list-inside mb-4 space-y-1"
                          {...props}
                        />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="ml-4" {...props} />
                      ),
                      code: ({ node, className, children, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return !match ? (
                          <code
                            className="bg-zinc-900/50 text-rust-light px-1.5 py-0.5 rounded text-sm font-mono"
                            {...props}
                          >
                            {children}
                          </code>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                      pre: ({ node, ...props }) => (
                        <pre
                          className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4 overflow-x-auto"
                          {...props}
                        />
                      ),
                      strong: ({ node, ...props }) => (
                        <strong className="text-rust font-bold" {...props} />
                      ),
                      a: ({ node, ...props }) => (
                        <a
                          className="text-rust hover:text-rust-light underline underline-offset-4"
                          {...props}
                        />
                      ),
                      blockquote: ({ node, ...props }) => (
                        <blockquote
                          className="border-l-4 border-rust pl-4 italic text-zinc-400 my-4"
                          {...props}
                        />
                      ),
                    }}
                  >
                    {guide}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Requirements & Action Card */}
          <Card className="bg-zinc-900/40 backdrop-blur-xl border-zinc-800/50 shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-zinc-800/50 bg-zinc-900/40 py-4">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-rust" />
                  Verification Details
                </span>
                {status?.success && (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    All Good
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {status?.checks.map((check, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50 group transition-all hover:bg-zinc-800/50"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-2 rounded-full ${check.status === 'pass' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rust/10 text-rust'}`}
                      >
                        {check.status === 'pass' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <AlertCircle className="w-4 h-4" />
                        )}
                      </div>
                      <span className="font-bold text-zinc-100">
                        {check.name}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`font-mono text-[10px] py-1 px-3 ${check.status === 'pass' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-rust/30 bg-rust/10 text-rust'}`}
                    >
                      {check.status === 'pass' ? 'DETECTED' : 'MISSING'}
                    </Badge>
                  </div>
                ))}
              </div>

              {status?.success ? (
                <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-emerald-400 text-center space-y-2 animate-pulse mt-4">
                  <p className="font-black text-lg">Everything looks great!</p>
                  <p className="text-sm opacity-80 font-medium tracking-tight">
                    Redirecting you to the dashboard...
                  </p>
                </div>
              ) : (
                <div className="pt-4">
                  <Button
                    variant="default"
                    size="lg"
                    onClick={checkStatus}
                    disabled={checking}
                    className="w-full bg-gradient-to-r from-rust to-orange-500 hover:from-rust/90 hover:to-orange-500/90 text-white font-black tracking-tight shadow-xl shadow-rust/20 h-12 transition-all active:scale-95"
                  >
                    {checking ? (
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    ) : (
                      <RefreshCcw className="w-5 h-5 mr-3" />
                    )}
                    {checking ? 'Checking System...' : 'Verify Installation'}
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="px-6 py-4 bg-zinc-900/40 border-t border-zinc-800/50">
              <p className="text-[11px] text-zinc-500 flex items-center gap-2 font-medium">
                <AlertCircle className="w-3 h-3" />
                {status?.success
                  ? 'Redirection is automatic.'
                  : 'Please follow the guide above before clicking verify.'}
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
