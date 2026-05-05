import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const containerVars = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const itemVars = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const cardVars = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] } },
};

const TEAM = [
  {
    name: 'Aarav Gupta',
    role: 'Lead Developer',
    phone: '+254 797 953 316',
    emoji: '👨‍💻',
    color: '#00E5B4',
  },
  {
    name: 'Prayan Gupta',
    role: 'Co-Developer',
    phone: '+254 767 624 892',
    emoji: '👨‍🎨',
    color: '#A78BFA',
  },
];

const SOCIAL = [
  { platform: 'Instagram', handle: '@Classroom_Warden', icon: '📸', color: '#E1306C', bg: 'rgba(225,48,108,0.08)', border: 'rgba(225,48,108,0.22)' },
  { platform: 'TikTok',    handle: '@Classroom_Warden', icon: '🎵', color: '#69C9D0', bg: 'rgba(105,201,208,0.08)', border: 'rgba(105,201,208,0.22)' },
  { platform: 'Snapchat',  handle: '@Classroom_Warden', icon: '👻', color: '#FFFC00', bg: 'rgba(255,252,0,0.06)',  border: 'rgba(255,252,0,0.2)' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name = 'Name is required';
    if (!form.email.trim())   e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.message.trim()) e.message = 'Message is required';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitted(true);
    setErrors({});
  };

  return (
    <motion.div className="contact-page" variants={containerVars} initial="hidden" animate="show">
      <motion.div className="section-header" variants={itemVars}>
        <h2 className="section-title">Contact Us</h2>
        <p className="section-sub">Oshwal Academy Nairobi Junior High · Get in touch with the Classroom Warden team</p>
      </motion.div>

      {/* School info banner */}
      <motion.div className="glass-card contact-school-card" variants={itemVars}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}>
        <div className="contact-school-logo">🏫</div>
        <div>
          <div className="contact-school-name">Oshwal Academy Nairobi Junior High</div>
          <div className="contact-school-detail">📧 info@oshwal.ac.ke</div>
        </div>
      </motion.div>

      {/* Team cards */}
      <motion.div className="contact-team-grid" variants={containerVars}>
        {TEAM.map((member) => (
          <motion.div key={member.name} className="glass-card contact-team-card" variants={cardVars}
            whileHover={{ y: -5, borderColor: member.color + '44', transition: { duration: 0.2 } }}>
            <div className="contact-avatar" style={{ background: member.color + '18', borderColor: member.color + '33' }}>
              {member.emoji}
            </div>
            <div className="contact-member-name" style={{ color: member.color }}>{member.name}</div>
            <div className="contact-member-role">{member.role}</div>
            <a href={`tel:${member.phone}`} className="contact-phone-pill" style={{ borderColor: member.color + '44', color: member.color }}>
              📞 {member.phone}
            </a>
          </motion.div>
        ))}
      </motion.div>

      {/* Social links */}
      <motion.div variants={itemVars}>
        <div className="contact-section-label">Follow Us</div>
        <div className="contact-social-grid">
          {SOCIAL.map((s) => (
            <motion.div key={s.platform} className="contact-social-card"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}
              whileHover={{ scale: 1.04, y: -3, transition: { duration: 0.18 } }}
              whileTap={{ scale: 0.97 }}>
              <span className="contact-social-icon">{s.icon}</span>
              <div className="contact-social-platform" style={{ color: s.color }}>{s.platform}</div>
              <div className="contact-social-handle">{s.handle}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Contact form */}
      <motion.div className="glass-card contact-form-card" variants={itemVars}>
        <div className="contact-form-title">Send a Message</div>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div className="contact-thanks"
              key="thanks"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}>
              <div className="contact-thanks-icon">✅</div>
              <div className="contact-thanks-title">Message Received!</div>
              <div className="contact-thanks-sub">Thank you, {form.name}! We'll get back to you soon at {form.email}.</div>
              <motion.button className="contact-btn" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', message: '' }); }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                Send Another
              </motion.button>
            </motion.div>
          ) : (
            <motion.form key="form" className="contact-form" onSubmit={handleSubmit}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {[
                { key: 'name',    label: 'Your Name',    type: 'text',  placeholder: 'Enter your name' },
                { key: 'email',   label: 'Email Address', type: 'email', placeholder: 'your@email.com' },
              ].map((f) => (
                <div key={f.key} className="contact-field">
                  <label className="contact-label">{f.label}</label>
                  <input
                    className={`contact-input${errors[f.key] ? ' error' : ''}`}
                    type={f.type} placeholder={f.placeholder} value={form[f.key]}
                    onChange={(e) => { setForm(p => ({ ...p, [f.key]: e.target.value })); setErrors(p => ({ ...p, [f.key]: '' })); }}
                  />
                  {errors[f.key] && <span className="contact-error">{errors[f.key]}</span>}
                </div>
              ))}
              <div className="contact-field">
                <label className="contact-label">Message</label>
                <textarea
                  className={`contact-input contact-textarea${errors.message ? ' error' : ''}`}
                  placeholder="Write your message here..."
                  value={form.message}
                  onChange={(e) => { setForm(p => ({ ...p, message: e.target.value })); setErrors(p => ({ ...p, message: '' })); }}
                />
                {errors.message && <span className="contact-error">{errors.message}</span>}
              </div>
              <motion.button type="submit" className="contact-btn" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                Send Message →
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
