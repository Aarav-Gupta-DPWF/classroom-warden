import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const CLASSES = [
  { id: 1, name: 'Room 8A', teacher: 'Mr. Wakaba',   subject: 'Business Studies', streak: 7,  baseDb: 38 },
  { id: 2, name: 'Room 8B', teacher: 'Mr. Nicholas', subject: 'Chemistry',         streak: 3,  baseDb: 47 },
  { id: 3, name: 'Room 8C', teacher: 'Ms. Sharon',   subject: 'Maths',             streak: 12, baseDb: 42 },
  { id: 4, name: 'Room 7A', teacher: 'Mr. Meshak',   subject: 'Biology',           streak: 5,  baseDb: 54 },
  { id: 5, name: 'Room 7B', teacher: 'Mr. Nick',     subject: 'Physics',           streak: 1,  baseDb: 63 },
  { id: 6, name: 'Room 9A', teacher: 'Ms. Preeti',   subject: 'Hindi',             streak: 0,  baseDb: 71 },
  { id: 7, name: 'Room 8D', teacher: 'Mr. Kopiyo',   subject: 'French',            streak: 8,  baseDb: 50 },
  { id: 8, name: 'Room 7C', teacher: 'Ms. Vannesa',  subject: 'PSHE',              streak: 4,  baseDb: 55 },
];

const MONTHLY = [
  { month: 'Nov 25', avg: 52, peak: 78 },
  { month: 'Dec 25', avg: 47, peak: 71 },
  { month: 'Jan 26', avg: 58, peak: 85 },
  { month: 'Feb 26', avg: 55, peak: 79 },
  { month: 'Mar 26', avg: 51, peak: 73 },
  { month: 'Apr 26', avg: 44, peak: 68 },
];

const AXIS_STYLE = { fill: 'rgba(232,234,240,0.3)', fontSize: 11, fontWeight: 600 };
const GRID       = 'rgba(255,255,255,0.04)';

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(6,11,24,0.97)', border: '1px solid rgba(0,229,180,0.15)', borderRadius: 12, padding: '10px 14px' }}>
      <div style={{ fontSize: 11, color: 'rgba(232,234,240,0.4)', fontWeight: 700, letterSpacing: 1.2, marginBottom: 8 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ color: 'rgba(232,234,240,0.5)' }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: p.color }}>{p.value} dB</span>
        </div>
      ))}
    </div>
  );
}

function generatePDF() {
  const doc = new jsPDF();
  const teal = [0, 229, 180];
  const dark = [10, 14, 26];

  // Header band
  doc.setFillColor(...dark);
  doc.rect(0, 0, 210, 38, 'F');

  doc.setFontSize(20);
  doc.setTextColor(...teal);
  doc.setFont('helvetica', 'bold');
  doc.text('CLASSROOM WARDEN', 14, 16);

  doc.setFontSize(11);
  doc.setTextColor(180, 190, 210);
  doc.setFont('helvetica', 'normal');
  doc.text('Monthly Noise Intelligence Report', 14, 25);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, 14, 32);

  doc.setFontSize(9);
  doc.setTextColor(100, 120, 150);
  doc.text('Oshwal Academy Nairobi Junior High  ·  info@oshwal.ac.ke', 210 - 14, 32, { align: 'right' });

  // Summary
  doc.setFontSize(13);
  doc.setTextColor(...dark);
  doc.setFont('helvetica', 'bold');
  doc.text('School Summary', 14, 52);

  autoTable(doc, {
    startY: 56,
    head: [['Metric', 'Value']],
    body: [
      ['Report Period',    'May 2026'],
      ['School Average',   '52 dB'],
      ['Quietest Class',   'Room 8A — 38 dB (Mr. Wakaba)'],
      ['Loudest Class',    'Room 9A — 71 dB (Ms. Preeti)'],
      ['Total Classes',    '8'],
      ['Overall Trend',    '▼ 8 dB improvement vs 6 months ago'],
    ],
    headStyles:  { fillColor: dark, textColor: teal, fontStyle: 'bold' },
    bodyStyles:  { textColor: [40, 50, 70] },
    alternateRowStyles: { fillColor: [245, 248, 252] },
    columnStyles: { 0: { fontStyle: 'bold' } },
    margin: { left: 14, right: 14 },
  });

  // Class breakdown
  const afterSummary = doc.lastAutoTable.finalY + 14;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...dark);
  doc.text('Class-by-Class Breakdown', 14, afterSummary);

  const sorted = [...CLASSES].sort((a, b) => a.baseDb - b.baseDb);
  autoTable(doc, {
    startY: afterSummary + 4,
    head: [['Rank', 'Class', 'Teacher', 'Subject', 'Avg dB', 'Status', 'Streak']],
    body: sorted.map((c, i) => [
      i + 1,
      c.name,
      c.teacher,
      c.subject,
      `${c.baseDb} dB`,
      c.baseDb < 45 ? 'Quiet' : c.baseDb < 65 ? 'Moderate' : 'Loud',
      c.streak > 0 ? `${c.streak} days 🔥` : 'None',
    ]),
    headStyles: { fillColor: dark, textColor: teal, fontStyle: 'bold' },
    bodyStyles: { textColor: [40, 50, 70], fontSize: 10 },
    alternateRowStyles: { fillColor: [245, 248, 252] },
    columnStyles: {
      4: { halign: 'center' },
      5: { halign: 'center' },
      6: { halign: 'center' },
    },
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      if (data.column.index === 5 && data.section === 'body') {
        const v = data.cell.raw;
        data.cell.styles.textColor = v === 'Quiet' ? [46, 213, 115] : v === 'Moderate' ? [255, 165, 2] : [255, 71, 87];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // 6-month trend note
  const afterTable = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...dark);
  doc.text('6-Month Noise Trend Summary', 14, afterTable);

  autoTable(doc, {
    startY: afterTable + 4,
    head: [['Month', 'Average dB', 'Peak dB', 'Status']],
    body: MONTHLY.map(m => [
      m.month, `${m.avg} dB`, `${m.peak} dB`,
      m.avg < 45 ? 'Excellent' : m.avg < 55 ? 'Good' : m.avg < 65 ? 'Moderate' : 'Needs Improvement',
    ]),
    headStyles: { fillColor: dark, textColor: teal, fontStyle: 'bold' },
    bodyStyles: { textColor: [40, 50, 70], fontSize: 10 },
    alternateRowStyles: { fillColor: [245, 248, 252] },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pageH = doc.internal.pageSize.height;
  doc.setFillColor(...dark);
  doc.rect(0, pageH - 14, 210, 14, 'F');
  doc.setFontSize(8);
  doc.setTextColor(...teal);
  doc.text('Classroom Warden  ·  Live Noise Intelligence  ·  Oshwal Academy Nairobi Junior High', 105, pageH - 5, { align: 'center' });

  doc.save(`classroom-warden-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}

const containerVars = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };
const itemVars = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function Reports() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      generatePDF();
      setDownloading(false);
    }, 600);
  };

  const sorted = [...CLASSES].sort((a, b) => a.baseDb - b.baseDb);
  const schoolAvg = Math.round(CLASSES.reduce((a, c) => a + c.baseDb, 0) / CLASSES.length);

  return (
    <motion.div className="reports-page" variants={containerVars} initial="hidden" animate="show">
      <motion.div className="reports-header-row" variants={itemVars}>
        <div className="section-header" style={{ margin: 0 }}>
          <h2 className="section-title">Reports</h2>
          <p className="section-sub">Monthly noise summary · Oshwal Academy Nairobi Junior High</p>
        </div>
        <motion.button className="report-download-btn" onClick={handleDownload} disabled={downloading}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <AnimatePresence mode="wait">
            {downloading
              ? <motion.span key="dl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>⏳ Generating…</motion.span>
              : <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>⬇ Download PDF</motion.span>
            }
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Report preview card */}
      <motion.div className="glass-card report-preview" variants={itemVars}>
        <div className="report-preview-header">
          <div className="report-preview-logo">📋</div>
          <div>
            <div className="report-preview-title">Monthly Noise Intelligence Report</div>
            <div className="report-preview-meta">Oshwal Academy Nairobi Junior High · May 2026</div>
          </div>
        </div>

        {/* Summary stats row */}
        <div className="report-summary-row">
          {[
            { label: 'School Avg',     value: `${schoolAvg} dB`, color: '#A78BFA' },
            { label: 'Quietest Class', value: 'Room 8A',          color: '#2ED573' },
            { label: 'Loudest Class',  value: 'Room 9A',          color: '#FF4757' },
            { label: 'Total Classes',  value: '8',                color: '#00E5B4' },
          ].map(s => (
            <div key={s.label} className="report-summary-item">
              <div className="report-summary-val" style={{ color: s.color }}>{s.value}</div>
              <div className="report-summary-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 6-month trend chart */}
      <motion.div className="glass-card chart-section" variants={itemVars}>
        <div className="chart-header">
          <div className="chart-title">6-Month Noise Averages</div>
          <div className="chart-subtitle">School-wide average and peak dB levels</div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={MONTHLY} barGap={4} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="rAvg"  x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00E5B4" stopOpacity="0.95"/><stop offset="100%" stopColor="#00E5B4" stopOpacity="0.3"/></linearGradient>
              <linearGradient id="rPeak" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFD93D" stopOpacity="0.9"/><stop offset="100%" stopColor="#FFD93D" stopOpacity="0.28"/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke={GRID} vertical={false} />
            <XAxis dataKey="month" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} domain={[20, 100]} />
            <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <ReferenceLine y={55} stroke="rgba(255,71,87,0.3)" strokeDasharray="5 4"
              label={{ value: 'Target 55 dB', position: 'insideTopRight', fill: 'rgba(255,71,87,0.5)', fontSize: 10 }} />
            <Bar dataKey="avg"  name="average" fill="url(#rAvg)"  radius={[5,5,0,0]} isAnimationActive animationDuration={1000} />
            <Bar dataKey="peak" name="peak"    fill="url(#rPeak)" radius={[5,5,0,0]} isAnimationActive animationDuration={1000} animationBegin={180} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Class breakdown table */}
      <motion.div className="glass-card reports-table-card" variants={itemVars}>
        <div className="chart-header">
          <div className="chart-title">Class-by-Class Breakdown</div>
          <div className="chart-subtitle">Ranked by average noise level — lower is better</div>
        </div>
        <div className="reports-table-wrap">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Rank</th><th>Class</th><th>Teacher</th><th>Subject</th>
                <th>Avg dB</th><th>Status</th><th>Streak</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c, i) => {
                const color = c.baseDb < 45 ? '#2ED573' : c.baseDb < 65 ? '#FFA502' : '#FF4757';
                const label = c.baseDb < 45 ? 'Quiet' : c.baseDb < 65 ? 'Moderate' : 'Loud';
                return (
                  <motion.tr key={c.id}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.4 }}>
                    <td style={{ color: i < 3 ? ['#FFD700','#C0C0C0','#CD7F32'][i] : 'rgba(232,234,240,0.35)', fontWeight: 700 }}>{i + 1}</td>
                    <td style={{ fontWeight: 600, color: '#E8EAF0' }}>{c.name}</td>
                    <td>{c.teacher}</td>
                    <td style={{ color: 'rgba(232,234,240,0.5)' }}>{c.subject}</td>
                    <td style={{ color, fontWeight: 700 }}>{c.baseDb} dB</td>
                    <td><span className="reports-status-pill" style={{ background: color + '1A', color, border: `1px solid ${color}44` }}>{label}</span></td>
                    <td>{c.streak > 0 ? <span style={{ color: '#FFA502' }}>🔥 {c.streak}d</span> : <span style={{ color: 'rgba(232,234,240,0.25)' }}>—</span>}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
