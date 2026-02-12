import { Hono } from 'hono'
import { authServer } from './lib/auth'
import { logger } from './lib/logger'
import { cors } from 'hono/cors'
import { drizzle } from 'drizzle-orm/d1'
import { rateLimiter } from "hono-rate-limiter";
import billing from './modules/billing'
import git from './modules/git'
import progressRouter from './modules/progress'
import registryRouter from './modules/registry'
import userRouter from './modules/user'
import aiRouter from './modules/ai'
import tutorRouter from './modules/tutor'
import notificationRouter from './modules/notifications'

// Middlewares
import corsMiddleware from './middlewares/cors'
import { authMiddleware, verifySession, type AuthVariables } from './middlewares/auth'


const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: AuthVariables;
}>()

  // Middlewares
  .use('*', corsMiddleware)
  .use('*', authMiddleware)

  // Routes
  .route('/billing', billing)
  .route('/git', git)
  .get('/auth/get-session', async (c) => {
    const session = await verifySession(c)
    if (session) {
      logger.info('SESSION-CHECK', 'Session verification success', { email: session.user.email })
      return c.json(session)
    }
    return c.json(null)
  })
  .route('/progress', progressRouter)
  .route('/registry', registryRouter)
  .route('/packages', registryRouter)
  .route('/user', userRouter)
  .route('/ai', aiRouter)
  .route('/tutor', tutorRouter)
  .route('/notifications', notificationRouter)

  // Better Auth Handler
  .all('/auth/:path{.*}', async (c) => {
    try {
      const auth = authServer(c.env)
      logger.debug('AUTH-DEBUG', 'Handling auth request', { path: c.req.path });
      const res = await auth.handler(c.req.raw)
      logger.debug('AUTH-DEBUG', 'Better-Auth response received', { status: res.status });
      return res
    } catch (err: any) {
      logger.error('AUTH-FATAL', err.message, err)
      return c.json({ error: 'Internal Auth Error', message: err.message }, 500)
    }
  })

  // Global Error Handler
  .onError((err, c) => {
    logger.error('CRASH', err.message, err)
    return c.text(`Internal Server Error: ${err.message}`, 500)
  })

  // 404 Debugging
  .notFound((c) => {
    logger.info('404', 'Route not found', { method: c.req.method, url: c.req.url })
    return c.text(`Route not found: ${c.req.method} ${c.req.path}`, 404)
  })

  // Device Verification UI
  .get('/device', async (c) => {

    const userCode = c.req.query('user_code') || ''

    const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Progy - Secure Login</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  rust: {
                    light: '#dea584',
                    DEFAULT: '#ce412b',
                    dark: '#8a2b1d',
                  },
                },
                fontFamily: {
                  sans: ['Outfit', 'sans-serif'],
                },
              }
            }
          }
        </script>
        <style>
          body { background-color: #050505; color: #fff; scrollbar-width: none; }
          .glass-card {
            background: rgba(12, 12, 15, 0.6);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
          .glow-orb {
            filter: blur(120px);
            opacity: 0.15;
            z-index: 0;
            pointer-events: none;
          }
          .animate-pulse-slow {
            animation: pulse-slow 4s ease-in-out infinite;
          }
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.1; transform: scale(1); }
            50% { opacity: 0.2; transform: scale(1.1); }
          }
          .btn-primary {
            background: linear-gradient(135deg, #ce412b 0%, #f97316 100%);
            box-shadow: 0 10px 20px -5px rgba(206, 65, 43, 0.3);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
          }
          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 30px -8px rgba(206, 65, 43, 0.5);
            filter: brightness(1.1);
          }
          .btn-primary:active { transform: translateY(0px) scale(0.98); }
          
          .input-modern {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.05);
            transition: all 0.3s ease;
          }
          .input-modern:focus {
            border-color: #ce412b;
            box-shadow: 0 0 0 4px rgba(206, 65, 43, 0.1);
            background: rgba(0, 0, 0, 0.5);
          }
          .zap-container {
             background: linear-gradient(135deg, #ce412b 0%, #8a2b1d 100%);
             box-shadow: 0 8px 16px -4px rgba(206, 65, 43, 0.4);
          }
        </style>
      </head>
      <body class="flex items-center justify-center min-h-screen px-6 py-12">
        <!-- Background Decorations -->
        <div class="fixed top-1/4 -left-20 w-[40vw] h-[40vw] bg-rust glow-orb rounded-full animate-pulse-slow"></div>
        <div class="fixed bottom-1/4 -right-20 w-[40vw] h-[40vw] bg-orange-600 glow-orb rounded-full animate-pulse-slow" style="animation-delay: -2s"></div>

        <div class="max-w-md w-full glass-card rounded-[2.5rem] relative z-10 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <!-- Top Bar Accent -->
          <div class="h-1.5 w-full bg-gradient-to-r from-rust via-orange-500 to-rust-dark"></div>
          
          <div class="p-10 text-center">
            <!-- Icon -->
            <div class="mb-10 flex justify-center">
               <div class="relative group">
                 <div class="absolute inset-0 bg-rust blur-2xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse"></div>
                 <div class="relative zap-container w-16 h-16 rounded-[1.25rem] flex items-center justify-center transform rotate-6 transition-transform hover:rotate-0 duration-500">
                   <svg class="w-8 h-8 text-white fill-white" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 </div>
               </div>
            </div>

            <header class="mb-10">
              <h1 class="text-3xl font-black tracking-tight text-white mb-2">
                Progy<span class="bg-gradient-to-r from-rust to-orange-400 bg-clip-text text-transparent">ID</span>
              </h1>
              <h2 id="subtitle" class="text-xs uppercase font-black tracking-[0.3em] text-zinc-500 italic">Authorization Required</h2>
            </header>

            <main>
              <!-- Phase 1: Sign In -->
              <section id="login-section" class="hidden animate-in fade-in zoom-in-95 duration-500">
                <p class="text-zinc-400 text-xs mb-8 leading-relaxed max-w-[240px] mx-auto font-medium">
                  Authorize your GitHub account to proceed with Progy CLI tools.
                </p>
                <button id="loginBtn" class="btn-primary w-full py-3 rounded-xl font-bold tracking-tight text-sm flex items-center justify-center gap-3 transition-all group">
                  <svg class="w-5 h-5 fill-white opacity-80 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                  Connect GitHub
                </button>
              </section>

              <!-- Phase 2: Verify Device -->
              <section id="verify-section" class="hidden animate-in fade-in zoom-in-95 duration-500">
                <div class="mb-8 text-center">
                  <p class="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-5">Identity Code</p>
                  <div class="relative group">
                     <input 
                      type="text" 
                      id="userCodeInput" 
                      value="${userCode}" 
                      placeholder="XXXX-XXXX" 
                      maxlength="9"
                      class="input-modern w-full px-6 py-4 rounded-xl text-center text-2xl font-bold tracking-[0.2em] font-mono text-white placeholder-zinc-800 outline-none transition-all uppercase" 
                    />
                  </div>
                </div>
                <button id="verifyBtn" class="btn-primary w-full py-3.5 rounded-xl font-bold tracking-tight text-sm flex items-center justify-center gap-2.5 active:scale-[0.98]">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Authorize System
                </button>
              </section>

              <!-- Processing Explorer -->
              <section id="status" class="hidden my-12 animate-in fade-in zoom-in-90">
                <div class="flex flex-col items-center gap-6">
                  <div class="relative w-12 h-12">
                    <div class="absolute inset-0 border-4 border-rust/10 rounded-full"></div>
                    <div class="absolute inset-0 border-4 border-t-rust rounded-full animate-spin"></div>
                  </div>
                  <span class="text-[10px] uppercase font-bold tracking-[0.3em] text-zinc-600">Syncing Identity</span>
                </div>
              </section>

              <!-- Message Display -->
              <div id="message-container" class="mt-8 transition-all duration-500 overflow-hidden h-0 opacity-0">
                <div id="message" class="py-3 px-4 rounded-xl text-xs font-bold border"></div>
              </div>
            </main>

            <footer class="mt-12 pt-8 border-t border-zinc-900 flex flex-col gap-4">
               <div class="flex justify-between items-center px-2">
                 <span class="text-[9px] uppercase font-black tracking-widest text-zinc-700">Auth Engine v4.0</span>
                 <div class="flex gap-1.5">
                   <div class="w-1 h-1 rounded-full bg-zinc-800"></div>
                   <div class="w-1 h-1 rounded-full bg-zinc-800"></div>
                   <div class="w-1 h-1 rounded-full bg-zinc-800"></div>
                 </div>
               </div>
            </footer>
          </div>
        </div>

        <script>
          const loginSection = document.getElementById('login-section');
          const verifySection = document.getElementById('verify-section');
          const loginBtn = document.getElementById('loginBtn');
          const verifyBtn = document.getElementById('verifyBtn');
          const userCodeInput = document.getElementById('userCodeInput');
          const status = document.getElementById('status');
          const messageContainer = document.getElementById('message-container');
          const message = document.getElementById('message');
          const subtitle = document.getElementById('subtitle');

          const baseURL = "/auth"; 

          function showMessage(text, isError = false) {
             message.innerText = text;
             messageContainer.style.height = 'auto';
             messageContainer.style.opacity = '1';
             message.className = \`py-3 px-4 rounded-xl text-xs font-bold border transition-all \${isError ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}\`;
          }

          async function checkSession() {
            try {
              const res = await fetch(baseURL + '/get-session');
              const data = await res.json();
              return data?.user;
            } catch (e) { return null; }
          }

          async function verifyDevice() {
            const code = userCodeInput.value.trim().toUpperCase();
            if (!code) { showMessage("Please enter the identity code", true); return; }

            status.classList.remove('hidden');
            verifySection.classList.add('opacity-0', 'pointer-events-none');
            messageContainer.style.opacity = '0';

            try {
              const res = await fetch(baseURL + '/device/approve', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userCode: code })
              });
              
              const result = await res.json();
              if (res.ok) {
                 showMessage("✅ Authorization granted! Return to terminal.");
                 verifySection.innerHTML = \`<div class="py-6 animate-in zoom-in duration-500">
                                            <div class="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                                              <svg class="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                            </div>
                                            <p class="text-zinc-500 text-xs font-black uppercase tracking-widest">Handshake Complete</p>
                                          </div>\`;
                 verifySection.classList.remove('pointer-events-none', 'opacity-0');
                 subtitle.innerText = "System Synced";
                 subtitle.classList.replace('text-zinc-500', 'text-emerald-500');
              } else {
                 showMessage(result.message || "Invalid or stale code", true);
                 verifySection.classList.remove('opacity-0', 'pointer-events-none');
              }
            } catch (e) {
               showMessage("Network protocol failure", true);
               verifySection.classList.remove('opacity-0', 'pointer-events-none');
            } finally {
               status.classList.add('hidden');
            }
          }

          async function init() {
            status.classList.remove('hidden');
            const user = await checkSession();
            status.classList.add('hidden');

            if (user) {
               verifySection.classList.remove('hidden');
               subtitle.innerText = "Confirm Handshake";
               if (userCodeInput.value) {
                 verifyBtn.focus();
               }
            } else {
               loginSection.classList.remove('hidden');
               subtitle.innerText = "Identify User";
            }
          }

          loginBtn.onclick = async () => {
             const callbackURL = window.location.href;
             loginBtn.disabled = true;
             loginBtn.innerHTML = '<div class="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>';
             
             try {
               const res = await fetch(baseURL + "/sign-in/social", {
                 method: "POST",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify({ provider: "github", callbackURL })
               });
               const data = await res.json();
               if (data.url || data.redirect) {
                 window.location.href = data.url || data.redirect;
               } else {
                 showMessage("Social auth failed", true);
                 loginBtn.disabled = false;
                 loginBtn.innerText = "Connect GitHub";
               }
             } catch (e) {
               showMessage("Protocol error during sign-in", true);
               loginBtn.disabled = false;
               loginBtn.innerText = "Connect GitHub";
             }
          };

          verifyBtn.onclick = verifyDevice;
          userCodeInput.onkeyup = (e) => {
            if (e.key === 'Enter') verifyDevice();
          };

          init();
        </script>
      </body>
    </html>
  `;
    return c.html(html)
  })

  .get('/', (c) => {
    const error = c.req.query('error');
    const message = c.req.query('message');

    const title = error ? 'Authentication Error' : 'System Status';
    const subtitle = error ? 'Handshake Failed' : 'Operations Normal';
    const displayMessage = error
      ? (error === 'unable_to_create_user'
        ? 'Failed to initialize your account profile. This often happens if the database is in maintenance or a unique constraint was violated.'
        : `An error occurred during authentication: ${error}`)
      : (message || 'Progy Backend is live and systems are operational.');

    const icon = error
      ? '<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>'
      : '<svg class="w-8 h-8 text-white fill-white" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>';

    const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Progy - ${title}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  rust: {
                    light: '#dea584',
                    DEFAULT: '#ce412b',
                    dark: '#8a2b1d',
                  },
                },
                fontFamily: {
                  sans: ['Outfit', 'sans-serif'],
                },
              }
            }
          }
        </script>
        <style>
          body { background-color: #050505; color: #fff; overflow: hidden; }
          .glass-card {
            background: rgba(12, 12, 15, 0.6);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
          .glow-orb {
            filter: blur(120px);
            opacity: 0.15;
            z-index: 0;
            pointer-events: none;
          }
          .animate-pulse-slow {
            animation: pulse-slow 4s ease-in-out infinite;
          }
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.1; transform: scale(1); }
            50% { opacity: 0.2; transform: scale(1.1); }
          }
          .btn-primary {
            background: linear-gradient(135deg, #ce412b 0%, #f97316 100%);
            box-shadow: 0 10px 20px -5px rgba(206, 65, 43, 0.3);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .btn-primary:hover {
            transform: translateY(-2px);
            filter: brightness(1.1);
          }
          .icon-container {
             background: ${error ? 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)' : 'linear-gradient(135deg, #ce412b 0%, #8a2b1d 100%)'};
             box-shadow: 0 8px 16px -4px ${error ? 'rgba(239, 68, 68, 0.4)' : 'rgba(206, 65, 43, 0.4)'};
          }
        </style>
      </head>
      <body class="flex items-center justify-center min-h-screen px-6">
        <div class="fixed top-1/4 -left-20 w-[40vw] h-[40vw] bg-rust glow-orb rounded-full animate-pulse-slow"></div>
        <div class="fixed bottom-1/4 -right-20 w-[40vw] h-[40vw] bg-orange-600 glow-orb rounded-full animate-pulse-slow" style="animation-delay: -2s"></div>

        <div class="max-w-md w-full glass-card rounded-[2.5rem] relative z-10 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div class="h-1.5 w-full bg-gradient-to-r from-rust via-orange-500 to-rust-dark"></div>
          
          <div class="p-10 text-center">
            <div class="mb-10 flex justify-center">
              <div class="relative group">
                <div class="absolute inset-0 ${error ? 'bg-red-500' : 'bg-rust'} blur-2xl opacity-40 animate-pulse"></div>
                <div class="relative icon-container w-16 h-16 rounded-[1.25rem] flex items-center justify-center transform rotate-6 transition-transform hover:rotate-0 duration-500">
                  ${icon}
                </div>
              </div>
            </div>

            <header class="mb-8">
              <h1 class="text-3xl font-black tracking-tight text-white mb-2">
                Progy<span class="bg-gradient-to-r from-rust to-orange-400 bg-clip-text text-transparent">API</span>
              </h1>
              <h2 class="text-xs uppercase font-black tracking-[0.3em] ${error ? 'text-red-500' : 'text-zinc-500'} italic">${subtitle}</h2>
            </header>

            <div class="mb-10">
              <p class="text-zinc-400 text-sm leading-relaxed font-medium italic">
                "${displayMessage}"
              </p>
            </div>

            ${error ? `
              <div class="flex flex-col gap-3">
                <a href="https://progy.dev/dashboard" class="btn-primary py-3 rounded-xl font-bold tracking-tight text-xs uppercase flex items-center justify-center gap-2">
                   Return to Dashboard
                </a>
                <p class="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Error Code: ${error}</p>
              </div>
            ` : `
              <div class="py-3 px-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center gap-3">
                <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span class="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">All Systems Operational</span>
              </div>
            `}

            <footer class="mt-12 pt-8 border-t border-zinc-900">
               <span class="text-[9px] uppercase font-black tracking-widest text-zinc-700">Progy Backend Infrastructure v1.0</span>
            </footer>
          </div>
        </div>
      </body>
    </html>
  `;
    return c.html(html);
  })

// Workflow Exports
export { CourseGuardWorkflow } from './workflows/course-guard';
export { TutorAgentWorkflow } from './workflows/tutor-agent';
export { AggregationWorkflow } from './workflows/aggregation';


export type AppType = typeof app;
export default app

