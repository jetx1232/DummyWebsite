import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Cpu,
  MemoryStick,
  Play,
  Server,
  StopCircle,
} from 'lucide-react';

const HISTORY_LENGTH = 30;

const randomBetween = (min, max) => Math.round(Math.random() * (max - min) + min);

const buildInitialHistory = (base) =>
  Array.from({ length: HISTORY_LENGTH }, () => randomBetween(base - 10, base + 10));

const initialContainers = [
  { id: 'a81c12f', image: 'nexus/api:2.4', status: 'running', cpu: 64, memory: 58, uptime: '12h 32m' },
  { id: 'b52fd31', image: 'nexus/web:latest', status: 'running', cpu: 42, memory: 46, uptime: '9h 14m' },
  { id: 'c17a9d4', image: 'nexus/worker:1.8', status: 'running', cpu: 71, memory: 62, uptime: '3h 05m' },
  { id: 'd921fe3', image: 'nexus/db:12', status: 'running', cpu: 51, memory: 77, uptime: '27h 49m' },
  { id: 'e61bc92', image: 'redis:7', status: 'running', cpu: 22, memory: 33, uptime: '18h 06m' },
  { id: 'f312bd8', image: 'nexus/analytics:edge', status: 'stopped', cpu: 0, memory: 0, uptime: '—' },
];

const criticalServices = [
  { name: 'Ingress Gateway', status: 'Healthy', latency: '23ms' },
  { name: 'Telemetry Stream', status: 'Degraded', latency: '118ms' },
  { name: 'Secrets Manager', status: 'Healthy', latency: '31ms' },
  { name: 'Job Scheduler', status: 'At Risk', latency: '219ms' },
];

const levelStyles = {
  INFO: 'text-emerald-400',
  WARN: 'text-amber-300',
  ERROR: 'text-rose-400',
};

const gradientStops = {
  cpu: 'from-indigo-500/70 via-indigo-400/40 to-indigo-400/10',
  memory: 'from-emerald-500/70 via-emerald-400/40 to-emerald-400/10',
};

const buildPath = (points, height = 40, max = 100) => {
  if (points.length === 0) return '';
  return points
    .map((value, index) => {
      const x = (index / (points.length - 1 || 1)) * 100;
      const y = height - (Math.min(value, max) / max) * height;
      return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
    })
    .join(' ');
};

const statCards = [
  {
    key: 'containers',
    label: 'Total Containers',
    icon: Server,
    value: (containers) => containers.length,
    accent: 'text-indigo-300',
  },
  {
    key: 'cpu',
    label: 'CPU Load',
    icon: Cpu,
    value: (_, cpuHistory) => `${cpuHistory.at(-1) ?? 0}%`,
    accent: 'text-emerald-300',
  },
  {
    key: 'memory',
    label: 'Memory Usage',
    icon: MemoryStick,
    value: (_, __, memoryHistory) => `${memoryHistory.at(-1) ?? 0}%`,
    accent: 'text-rose-300',
  },
  {
    key: 'network',
    label: 'Network',
    icon: Activity,
    value: (_, __, ___, network) => `${network} Mbps`,
    accent: 'text-sky-300',
  },
];

const randomLogMessage = () => {
  const samples = [
    'Synced artifact manifest with registry',
    'Scaling auto-healing group',
    'Pulled latest service image',
    'Detected latency spike on telemetry stream',
    'Applied secret rotation policy',
    'Reconciled container drift',
    'Completed metrics snapshot export',
  ];
  return samples[Math.floor(Math.random() * samples.length)];
};

const pickLevel = () => {
  const roll = Math.random();
  if (roll < 0.65) return 'INFO';
  if (roll < 0.9) return 'WARN';
  return 'ERROR';
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cpuHistory, setCpuHistory] = useState(buildInitialHistory(55));
  const [memoryHistory, setMemoryHistory] = useState(buildInitialHistory(60));
  const [network, setNetwork] = useState(2.5);
  const [containers, setContainers] = useState(initialContainers);
  const [logs, setLogs] = useState([
    { id: 1, level: 'INFO', timestamp: '08:00:00', message: 'Nexus Cloud Monitor boot sequence complete.' },
  ]);

  useEffect(() => {
    const metricsInterval = setInterval(() => {
      setCpuHistory((prev) => {
        const nextValue = Math.min(100, Math.max(15, (prev.at(-1) ?? 50) + randomBetween(-8, 8)));
        return [...prev.slice(-(HISTORY_LENGTH - 1)), nextValue];
      });
      setMemoryHistory((prev) => {
        const nextValue = Math.min(100, Math.max(25, (prev.at(-1) ?? 60) + randomBetween(-5, 5)));
        return [...prev.slice(-(HISTORY_LENGTH - 1)), nextValue];
      });
      setNetwork((prev) => Number((Math.max(0.5, prev + (Math.random() - 0.5) * 0.8)).toFixed(2)));
      setContainers((prev) =>
        prev.map((container) => {
          if (container.status !== 'running') {
            return { ...container, cpu: 0, memory: container.memory };
          }
          const cpu = Math.min(95, Math.max(5, container.cpu + randomBetween(-5, 5)));
          const memory = Math.min(95, Math.max(20, container.memory + randomBetween(-2, 2)));
          return { ...container, cpu, memory };
        })
      );
    }, 1000);

    const logInterval = setInterval(() => {
      setLogs((prev) => {
        const level = pickLevel();
        const newLog = {
          id: Date.now(),
          level,
          timestamp: new Date().toLocaleTimeString('en-GB', { hour12: false }),
          message: randomLogMessage(),
        };
        return [...prev.slice(-49), newLog];
      });
    }, 2000);

    return () => {
      clearInterval(metricsInterval);
      clearInterval(logInterval);
    };
  }, []);

  const cpuPath = useMemo(() => buildPath(cpuHistory), [cpuHistory]);
  const memoryPath = useMemo(() => buildPath(memoryHistory), [memoryHistory]);

  const handleToggleContainer = (id) => {
    setContainers((prev) =>
      prev.map((container) =>
        container.id === id
          ? {
              ...container,
              status: container.status === 'running' ? 'stopped' : 'running',
              uptime: container.status === 'running' ? '—' : '0h 00m',
            }
          : container
      )
    );
  };

  const renderGraph = (label, data, path, gradientKey) => (
    <div className="flex flex-1 flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">{label}</p>
        <span className="text-lg font-semibold text-white">{data.at(-1)}%</span>
      </div>
      <svg viewBox="0 0 100 40" className="h-40 w-full">
        <defs>
          <linearGradient id={`${gradientKey}-line`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(99 102 241)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="rgb(14 165 233)" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id={`${gradientKey}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(99,102,241,0.35)" />
            <stop offset="100%" stopColor="rgba(15,23,42,0)" />
          </linearGradient>
        </defs>
        <path d={`${path} L 100,40 L 0,40 Z`} fill={`url(#${gradientKey}-fill)`} className="transition-all duration-700" />
        <path d={path} stroke={`url(#${gradientKey}-line)`} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );

  const tabButton = (tabKey, label) => (
    <button
      key={tabKey}
      onClick={() => setActiveTab(tabKey)}
      className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
        activeTab === tabKey ? 'bg-indigo-500/40 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      <aside className="fixed inset-y-0 flex w-64 flex-col border-r border-white/10 bg-slate-950/60 p-6 backdrop-blur-2xl">
        <div className="mb-10 flex items-center gap-3">
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/20 p-3">
            <Server className="h-6 w-6 text-indigo-300" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-wide text-white">Nexus Cloud</h1>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Monitor</p>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          {['dashboard', 'containers', 'logs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold uppercase tracking-wide transition ${
                activeTab === tab ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-indigo-400 shadow shadow-indigo-500/60"></span>
              {tab}
            </button>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-slate-900 to-slate-950 p-4 text-xs text-slate-300">
          <p className="font-semibold uppercase tracking-wide text-indigo-200">Live Status</p>
          <p className="mt-2 text-emerald-300">Secure link active</p>
          <p className="text-slate-400">Last sync: {logs.at(-1)?.timestamp}</p>
        </div>
      </aside>

      <main className="ml-64 flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-10 border-b border-white/5 bg-slate-900/80 backdrop-blur-lg">
          <div className="flex flex-wrap items-center justify-between gap-4 px-10 py-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-indigo-400">Operations Center</p>
              <h2 className="text-2xl font-semibold text-white">Nexus Cloud Monitor</h2>
            </div>
            <div className="flex items-center gap-3">
              {['dashboard', 'containers', 'logs'].map((tab) => tabButton(tab, tab.charAt(0).toUpperCase() + tab.slice(1)))}
            </div>
          </div>
        </header>

        <section className="flex-1 px-10 py-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map(({ key, label, icon: Icon, value, accent }) => (
                  <div
                    key={key}
                    className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 shadow-2xl shadow-slate-950/30 backdrop-blur"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</p>
                        <p className={`mt-3 text-3xl font-semibold text-white ${key !== 'containers' ? '' : accent}`}>
                          {value(containers, cpuHistory, memoryHistory, network)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-indigo-300">
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <div className={`mt-4 text-xs uppercase tracking-wide ${accent}`}>Live</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-6 lg:flex-row">
                {renderGraph('CPU Utilization', cpuHistory, cpuPath, 'cpu')}
                {renderGraph('Memory Utilization', memoryHistory, memoryPath, 'memory')}
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-slate-900/40 backdrop-blur-md">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">Critical Services</p>
                    <span className="text-xs text-slate-400">Quick view</span>
                  </div>
                  <div className="space-y-4">
                    {criticalServices.map((service) => (
                      <div key={service.name} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{service.name}</p>
                          <p className="text-xs text-slate-400">Latency {service.latency}</p>
                        </div>
                        <span
                          className={`text-xs font-semibold uppercase tracking-wide ${
                            service.status === 'Healthy'
                              ? 'text-emerald-400'
                              : service.status === 'Degraded'
                              ? 'text-amber-300'
                              : 'text-rose-400'
                          }`}
                        >
                          {service.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/50 p-6 shadow-inner shadow-black/60 backdrop-blur-md">
                  <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-300">Telemetry Stream</p>
                  <div className="h-64 space-y-2 overflow-y-auto font-mono text-xs leading-6 text-slate-100">
                    {logs
                      .slice(-12)
                      .reverse()
                      .map((log) => (
                        <div key={log.id} className="flex gap-4">
                          <span className="text-slate-500">{log.timestamp}</span>
                          <span className={`font-semibold ${levelStyles[log.level]}`}>{log.level}</span>
                          <span className="text-slate-200">{log.message}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'containers' && (
            <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-indigo-400">Fleet</p>
                  <h3 className="text-xl font-semibold text-white">Docker Containers</h3>
                </div>
                <span className="rounded-full border border-emerald-400/40 px-4 py-1 text-xs text-emerald-300">
                  {containers.filter((c) => c.status === 'running').length} active
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-200">
                  <thead className="text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      {['ID', 'Image', 'Status', 'CPU %', 'Memory %', 'Uptime', 'Action'].map((column) => (
                        <th key={column} className="border-b border-white/5 py-3 pr-6">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {containers.map((container) => (
                      <tr key={container.id} className="border-b border-white/5 last:border-b-0">
                        <td className="py-4 pr-6 font-mono text-xs text-slate-400">{container.id}</td>
                        <td className="pr-6">{container.image}</td>
                        <td className="pr-6">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              container.status === 'running' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {container.status}
                          </span>
                        </td>
                        <td className="pr-6">{container.cpu}%</td>
                        <td className="pr-6">{container.memory}%</td>
                        <td className="pr-6">{container.uptime}</td>
                        <td>
                          <button
                            onClick={() => handleToggleContainer(container.id)}
                            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                              container.status === 'running'
                                ? 'border-rose-500/40 text-rose-300 hover:bg-rose-500/10'
                                : 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10'
                            }`}
                          >
                            {container.status === 'running' ? (
                              <>
                                <StopCircle className="h-4 w-4" /> Stop
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4" /> Start
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="rounded-3xl border border-white/10 bg-black/80 p-6 shadow-inner shadow-black/70 backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Event Log Stream</h3>
                <span className="text-xs text-slate-400">Realtime feed</span>
              </div>
              <div className="h-[540px] overflow-y-auto rounded-2xl border border-white/5 bg-black/70 p-4 font-mono text-xs leading-7 text-slate-100">
                {logs
                  .slice()
                  .reverse()
                  .map((log) => (
                    <div key={log.id} className="flex gap-4">
                      <span className="text-slate-500">{log.timestamp}</span>
                      <span className={`w-16 font-semibold ${levelStyles[log.level]}`}>{log.level}</span>
                      <span className="text-slate-200">{log.message}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}


