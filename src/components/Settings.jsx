import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CLASSES = [
  { id: 1, name: 'Room 8A', teacher: 'Mr. Wakaba' },
  { id: 2, name: 'Room 8B', teacher: 'Mr. Nicholas' },
  { id: 3, name: 'Room 8C', teacher: 'Ms. Sharon' },
  { id: 4, name: 'Room 7A', teacher: 'Mr. Meshak' },
  { id: 5, name: 'Room 7B', teacher: 'Mr. Nick' },
  { id: 6, name: 'Room 9A', teacher: 'Ms. Preeti' },
  { id: 7, name: 'Room 8D', teacher: 'Mr. Kopiyo' },
  { id: 8, name: 'Room 7C', teacher: 'Ms. Vannesa' },
];

const DEFAULTS = {
  quietThreshold: 45,
  moderateThreshold: 65,
  selectedClass: 1,
  alertsEnabled: true,
  alertVolume: 70,
  dataRetention: 30,
  darkMode: true,
  micSensitivity: 1.0,
};

function loadSettings() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem('cw-settings') || '{}') }; }
  catch { return DEFAULTS; }
}

const containerVars = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const itemVars = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

function Toggle({ value, onChange, color = '#00E5B4' }) {
  return (
    <motion.button
      className={`settings-toggle${value ? ' on' : ''}`}
      style={{ '--toggle-color': color }}
      onClick={() => onChange(!value)}
      whileTap={{ scale: 0.93 }}>
      <motion.div className="toggle-thumb" layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
    </motion.button>
  );
}

function Slider({ value, min, max, step = 1, onChange, color = '#00E5B4', format = v => v }) {
  return (
    <div className="settings-slider-wrap">
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="settings-slider"
        style={{ '--slider-color': color, '--pct': `${((value - min) / (max - min)) * 100}%` }}
      />
      <span className="settings-slider-val" style={{ color }}>{format(value)}</span>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <motion.div className="glass-card settings-section" variants={itemVars}>
      <div className="settings-section-header">
        <span className="settings-section-icon">{icon}</span>
        <span className="settings-section-title">{title}</span>
      </div>
      {children}
    </motion.div>
  );
}

function Row({ label, hint, children }) {
  return (
    <div className="settings-row">
      <div className="settings-row-info">
        <div className="settings-row-label">{label}</div>
        {hint && <div className="settings-row-hint">{hint}</div>}
      </div>
      <div className="settings-row-control">{children}</div>
    </div>
  );
}

export default function Settings() {
  const [s, setS] = useState(loadSettings);
  const [saved, setSaved] = useState(false);

  const set = (key, val) => setS(prev => ({ ...prev, [key]: val }));

  const save = () => {
    localStorage.setItem('cw-settings', JSON.stringify(s));
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const reset = () => { setS(DEFAULTS); };

  return (
    <motion.div className="settings-page" variants={containerVars} initial="hidden" animate="show">
      <motion.div className="section-header" variants={itemVars}>
        <h2 className="section-title">Settings</h2>
        <p className="section-sub">Configure Classroom Warden to your preferences</p>
      </motion.div>

      <Section title="Noise Thresholds" icon="🎚️">
        <Row label="Quiet threshold" hint="Below this = Quiet (green)">
          <Slider value={s.quietThreshold} min={25} max={55} onChange={v => set('quietThreshold', v)}
            color="#2ED573" format={v => `${v} dB`} />
        </Row>
        <Row label="Moderate threshold" hint="Between quiet & this = Moderate (orange)">
          <Slider value={s.moderateThreshold} min={50} max={80} onChange={v => set('moderateThreshold', v)}
            color="#FFA502" format={v => `${v} dB`} />
        </Row>
        <div className="settings-threshold-preview">
          <div className="threshold-bar-quiet"   style={{ flex: s.quietThreshold }}>Quiet</div>
          <div className="threshold-bar-moderate" style={{ flex: s.moderateThreshold - s.quietThreshold }}>Moderate</div>
          <div className="threshold-bar-loud"     style={{ flex: 88 - s.moderateThreshold }}>Loud</div>
        </div>
      </Section>

      <Section title="Microphone" icon="🎤">
        <Row label="Sensitivity" hint="Amplify mic input for quieter rooms">
          <Slider value={s.micSensitivity} min={0.5} max={3.0} step={0.1}
            onChange={v => set('micSensitivity', v)} color="#00E5B4" format={v => `${v.toFixed(1)}×`} />
        </Row>
      </Section>

      <Section title="Class Monitor" icon="🏫">
        <Row label="Monitored class" hint="Select which classroom to focus on">
          <select className="settings-select" value={s.selectedClass}
            onChange={e => set('selectedClass', Number(e.target.value))}>
            {CLASSES.map(c => (
              <option key={c.id} value={c.id}>{c.name} — {c.teacher}</option>
            ))}
          </select>
        </Row>
      </Section>

      <Section title="Sound Alerts" icon="🔔">
        <Row label="Enable alerts" hint="Play a sound when noise exceeds threshold">
          <Toggle value={s.alertsEnabled} onChange={v => set('alertsEnabled', v)} />
        </Row>
        <Row label="Alert volume" hint="Volume of the alert sound">
          <Slider value={s.alertVolume} min={0} max={100} onChange={v => set('alertVolume', v)}
            color="#FFD93D" format={v => `${v}%`} />
        </Row>
      </Section>

      <Section title="Data & Privacy" icon="💾">
        <Row label="Data retention" hint="How many days of history to keep">
          <Slider value={s.dataRetention} min={7} max={90} step={1}
            onChange={v => set('dataRetention', v)} color="#A78BFA" format={v => `${v} days`} />
        </Row>
      </Section>

      <Section title="Appearance" icon="🎨">
        <Row label="Dark mode" hint="Currently only dark mode is fully supported">
          <Toggle value={s.darkMode} onChange={v => set('darkMode', v)} color="#A78BFA" />
        </Row>
      </Section>

      <motion.div className="settings-actions" variants={itemVars}>
        <motion.button className="settings-reset-btn" onClick={reset}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          Reset to Defaults
        </motion.button>
        <motion.button className="settings-save-btn" onClick={save}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <AnimatePresence mode="wait">
            {saved
              ? <motion.span key="saved" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>✓ Saved!</motion.span>
              : <motion.span key="save"  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>Save Settings</motion.span>
            }
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
