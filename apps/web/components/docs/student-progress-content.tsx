import { SectionHeading, SubHeading, Callout } from './section-heading';
import { Trophy, Flame, Star, Cloud, Wifi, WifiOff } from 'lucide-react';

export function StudentProgressContent() {
  return (
    <div className="space-y-8 py-6 animate-in fade-in duration-500 max-w-3xl">
      <SectionHeading
        title="Progress & XP"
        subtitle="Track your learning journey with experience points, daily streaks, and cloud synchronization."
        badge="🏆 Gamification"
      />

      <section className="space-y-4">
        <SubHeading icon={<Star className="text-primary" size={20} />}>
          How XP Works
        </SubHeading>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Every exercise you complete earns you{' '}
          <strong>Experience Points (XP)</strong>. XP is tracked per-course and
          saved to the cloud when you&apos;re logged in.
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            {
              icon: <Star className="text-yellow-400" size={16} />,
              title: '+20 XP',
              desc: 'Per exercise completed',
            },
            {
              icon: <Flame className="text-orange-400" size={16} />,
              title: 'Daily Streaks',
              desc: 'Keep coding every day to build streaks',
            },
            {
              icon: <Trophy className="text-amber-400" size={16} />,
              title: 'Achievements',
              desc: 'Unlock milestones as you progress',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-4 rounded-xl border border-border bg-card flex flex-col items-center text-center gap-2"
            >
              <div className="p-2 rounded-lg bg-muted">{item.icon}</div>
              <span className="text-sm font-bold text-foreground">
                {item.title}
              </span>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SubHeading icon={<Flame className="text-orange-400" size={20} />}>
          Streaks
        </SubHeading>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Complete at least <strong>one exercise per day</strong> to build your
          streak. Your current and longest streaks are tracked automatically.
        </p>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-black text-orange-400">7</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">
                Current
              </div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-center">
              <div className="text-3xl font-black text-foreground">14</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">
                Longest
              </div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="flex gap-1 flex-1 justify-center">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
                (day, i) => (
                  <div key={day} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-5 h-5 rounded-md ${
                        i < 5
                          ? 'bg-orange-400/80'
                          : i === 5
                            ? 'bg-orange-400/30'
                            : 'bg-muted'
                      }`}
                    />
                    <span className="text-[9px] text-muted-foreground">
                      {day}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
        <Callout type="tip">
          Missing a day resets your current streak to zero, but your longest
          streak is preserved forever.
        </Callout>
      </section>

      <section className="space-y-4">
        <SubHeading icon={<Cloud className="text-blue-400" size={20} />}>
          Cloud Sync vs Offline Mode
        </SubHeading>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Progy supports both online and offline modes. Your progress is always
          saved, but the storage location differs:
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5 space-y-2">
            <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
              <Wifi size={16} /> Online Mode
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• XP & progress saved to Progy Cloud</li>
              <li>• Accessible from any machine</li>
              <li>
                • Requires{' '}
                <code className="bg-muted px-1 rounded">progy login</code>
              </li>
              <li>• Automatic sync on exercise completion</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 space-y-2">
            <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
              <WifiOff size={16} /> Offline Mode
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>
                • Progress saved locally in{' '}
                <code className="bg-muted px-1 rounded">.progy/</code>
              </li>
              <li>• No authentication required</li>
              <li>
                • Use{' '}
                <code className="bg-muted px-1 rounded">
                  progy start --offline
                </code>
              </li>
              <li>• Great for air-gapped environments</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
