import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie,
  ReferenceLine,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  Cell,
} from 'recharts';
import { t } from '../i18n/i18n';
import { getUserId } from '../utils/storage';
import { fetchUserSessions, fetchUserTrials } from '../firebase/firestoreService';

const ACCENT   = '#6366f1';
const GREEN    = '#22c55e';
const RED      = '#ef4444';
const AMBER    = '#f59e0b';
const MUTED    = '#64748b';

const MODE_LABEL = { experiment: 'Eksperiments', repeat: 'Atkārtots', interactive: 'Interaktīvs' };

function formatDate(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('lv-LV', { day: '2-digit', month: '2-digit' });
}

// Custom tooltip for all charts
function ChartTip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tip">
      {label !== undefined && <p className="chart-tip-label">{label}</p>}
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}{unit ?? ''}</strong>
        </p>
      ))}
    </div>
  );
}

export default function DashboardView() {
  const navigate = useNavigate();
  const userId = getUserId();

  const [sessions, setSessions] = useState([]);
  const [trials, setTrials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    Promise.all([fetchUserSessions(userId), fetchUserTrials(userId)])
      .then(([s, tr]) => { setSessions(s); setTrials(tr); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="view">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ielādē datus…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view">
        <p style={{ color: 'var(--red)' }}>Kļūda: {error}</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="view">
        <h1>{t('dashboard.title')}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('dashboard.noData')}</p>
        <button onClick={() => navigate('/')}>{t('nav.home')}</button>
      </div>
    );
  }

  // ── Derived data ────────────────────────────────────────────────────────────

  // Sessions for line/bar charts — numbered for display
  const sessionChartData = sessions.map((s, i) => ({
    name: `S${i + 1}`,
    label: `${MODE_LABEL[s.mode] ?? s.mode} · ${formatDate(s.completedAt)}`,
    accuracy: Math.round((s.accuracy ?? 0) * 100),
    avgRT: s.avgReactionTime ?? 0,
    mode: s.mode,
  }));

  // Selected session — defaults to the latest one
  const selectedSession =
    (selectedId ? sessions.find((s) => s.id === selectedId) : null)
    ?? sessions[sessions.length - 1];
  const selectedIndex = sessions.indexOf(selectedSession);
  const selectedName = `S${selectedIndex + 1}`;

  // Accuracy by difficulty tier — groups any angle into easy/medium/hard by value.
  // Works for both fixed-experiment angles and randomly generated angles.
  const TIER_DEFS = [
    { label: 'Viegls (0–60°)',    min:  0, max:  60 },
    { label: 'Vidējs (61–120°)',  min: 61, max: 120 },
    { label: 'Grūts (121–180°)', min: 121, max: 180 },
  ];
  const angleTrials = trials.filter((tr) => tr.sessionId === selectedSession.id);
  const angleData = TIER_DEFS.map(({ label, min, max }) => {
    const subset = angleTrials.filter((tr) => {
      const a = Number(tr.rotationAngle);
      return a >= min && a <= max;
    });
    const correct = subset.filter((tr) => tr.isCorrect).length;
    return {
      angle: label,
      accuracy: subset.length ? Math.round((correct / subset.length) * 100) : null,
      count: subset.length,
    };
  });

  // Correct vs incorrect for selected session
  const pieData = [
    { name: 'Pareizi', value: selectedSession.correctCount ?? 0, fill: GREEN },
    { name: 'Nepareizi', value: (selectedSession.totalTrials ?? 0) - (selectedSession.correctCount ?? 0), fill: RED },
  ];

  // Summary stats across all sessions
  const bestAccuracy = Math.max(...sessions.map((s) => Math.round((s.accuracy ?? 0) * 100)));
  const latestAccuracy = Math.round((sessions[sessions.length - 1]?.accuracy ?? 0) * 100);
  const latestRT = sessions[sessions.length - 1]?.avgReactionTime ?? 0;
  const totalSessions = sessions.length;

  return (
    <div className="dashboard">
      <div className="dash-header">
        <h1>{t('dashboard.title')}</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-outline" onClick={() => navigate('/instructions')}>
            {t('nav.instructions')}
          </button>
          <button className="btn-outline" onClick={() => navigate('/')}>
            {t('nav.home')}
          </button>
        </div>
      </div>

      {/* ── KPI row ── */}
      <div className="kpi-row">
        <div className="kpi-card">
          <span className="kpi-label">Sesijas</span>
          <span className="kpi-value">{totalSessions}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Pēdējā precizitāte</span>
          <span className="kpi-value" style={{ color: latestAccuracy >= 70 ? GREEN : RED }}>
            {latestAccuracy}%
          </span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Labākā precizitāte</span>
          <span className="kpi-value" style={{ color: GREEN }}>{bestAccuracy}%</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Pēdējais vid. RT</span>
          <span className="kpi-value">{latestRT} <small>ms</small></span>
        </div>
      </div>

      {/* ── Charts grid ── */}
      <div className="charts-grid">

        {/* Accuracy over sessions */}
        <div className="chart-card chart-wide">
          <h2 className="chart-title">Precizitāte pa sesijām</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={sessionChartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis dataKey="name" tick={{ fill: MUTED, fontSize: 12 }} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: MUTED, fontSize: 12 }} />
              <Tooltip content={<ChartTip unit="%" />} />
              <ReferenceLine x={selectedName} stroke={ACCENT} strokeDasharray="4 3" strokeOpacity={0.5} />
              <Line
                type="monotone" dataKey="accuracy" name="Precizitāte"
                stroke={ACCENT} strokeWidth={2} dot={{ r: 4, fill: ACCENT }} activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Reaction time over sessions */}
        <div className="chart-card chart-wide">
          <h2 className="chart-title">Vidējais reakcijas laiks pa sesijām</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={sessionChartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis dataKey="name" tick={{ fill: MUTED, fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `${v}ms`} tick={{ fill: MUTED, fontSize: 12 }} />
              <Tooltip content={<ChartTip unit=" ms" />} />
              <ReferenceLine x={selectedName} stroke={AMBER} strokeDasharray="4 3" strokeOpacity={0.5} />
              <Line
                type="monotone" dataKey="avgRT" name="Vid. RT"
                stroke={AMBER} strokeWidth={2} dot={{ r: 4, fill: AMBER }} activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Accuracy by rotation angle */}
        <div className="chart-card">
          <h2 className="chart-title">Precizitāte pēc grūtības pakāpes</h2>
          <p className="chart-sub">
            Sesija {selectedName} · {MODE_LABEL[selectedSession.mode] ?? selectedSession.mode}
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={angleData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis dataKey="angle" tick={{ fill: MUTED, fontSize: 12 }} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: MUTED, fontSize: 12 }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const d = angleData.find((a) => a.angle === label);
                  return (
                    <div className="chart-tip">
                      <p className="chart-tip-label">{label}</p>
                      {d?.count > 0
                        ? <p style={{ color: ACCENT }}>Precizitāte: <strong>{payload[0]?.value ?? 0}%</strong></p>
                        : <p style={{ color: MUTED }}>Nav datu</p>
                      }
                      {d && <p style={{ color: MUTED }}>Uzdevumi: {d.count}</p>}
                    </div>
                  );
                }}
              />
              <Bar dataKey="accuracy" name="Precizitāte" radius={[4, 4, 0, 0]}>
                {angleData.map((entry) => (
                  <Cell
                    key={entry.angle}
                    fill={entry.accuracy == null ? MUTED : entry.accuracy >= 70 ? ACCENT : entry.accuracy >= 50 ? AMBER : RED}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Correct vs incorrect pie — selected session */}
        <div className="chart-card">
          <h2 className="chart-title">Pareizi / Nepareizi</h2>
          <p className="chart-sub">Sesija {selectedName} · {MODE_LABEL[selectedSession.mode] ?? selectedSession.mode}</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius="45%"
                  outerRadius="75%"
                  dataKey="value"
                  paddingAngle={3}
                  startAngle={90}
                  endAngle={-270}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle" iconSize={10}
                  formatter={(v) => <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{v}</span>}
                />
                <Tooltip formatter={(v, n) => [`${v} atbildes`, n]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
      </div>

      {/* ── Session history table ── */}
      <div className="chart-card" style={{ marginTop: '1.5rem' }}>
        <h2 className="chart-title">Sesiju vēsture</h2>
        <div className="session-table-wrap">
          <table className="session-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Datums</th>
                <th>Režīms</th>
                <th>Precizitāte</th>
                <th>Vid. RT</th>
                <th>Pareizi / Kopā</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr
                  key={s.id}
                  className={selectedSession?.id === s.id ? 'selected' : ''}
                  onClick={() => setSelectedId(s.id)}
                >
                  <td>{i + 1}</td>
                  <td>{formatDate(s.completedAt)}</td>
                  <td><span className={`mode-badge mode-${s.mode}`}>{MODE_LABEL[s.mode] ?? s.mode}</span></td>
                  <td style={{ color: Math.round((s.accuracy ?? 0) * 100) >= 70 ? GREEN : RED }}>
                    {Math.round((s.accuracy ?? 0) * 100)}%
                  </td>
                  <td>{s.avgReactionTime ?? '—'} ms</td>
                  <td>{s.correctCount} / {s.totalTrials}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

