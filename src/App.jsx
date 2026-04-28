import { useMemo, useState } from 'react'

function App() {
  const [pain, setPain] = useState(4)
  const [stiffness, setStiffness] = useState(4)
  const [swollenJoints, setSwollenJoints] = useState(4)
  const [energy, setEnergy] = useState(6)
  const [educationTrack, setEducationTrack] = useState('newly-diagnosed')

  const activityScore = useMemo(() => {
    const weightedSum = pain * 0.32 + stiffness * 0.28 + swollenJoints * 0.3 + (10 - energy) * 0.1
    return Number(weightedSum.toFixed(1))
  }, [pain, stiffness, swollenJoints, energy])

  const riskLevel = useMemo(() => {
    if (activityScore < 3.5) {
      return { label: 'Low activity', className: 'pill low' }
    }
    if (activityScore < 6.5) {
      return { label: 'Moderate activity', className: 'pill moderate' }
    }
    return { label: 'High activity', className: 'pill high' }
  }, [activityScore])

  const adherenceNudge = useMemo(() => {
    if (energy <= 3) return 'Prioritize fatigue plan, sleep hygiene, and lighter movement blocks this week.'
    if (pain >= 7) return 'Discuss flare rescue protocol and pre-visit monitoring reminders with the patient.'
    return 'Continue current routine and reinforce hydration, mobility, and medication timing.'
  }, [energy, pain])

  const educationContent = {
    'newly-diagnosed': {
      title: 'Newly Diagnosed Starter Path',
      bullets: [
        'Understanding autoimmune inflammation in plain language.',
        'How biologics, DMARDs, and pain plans differ.',
        'A simple first-month routine for meds, movement, and sleep.',
      ],
    },
    flare: {
      title: 'Flare Week Survival Kit',
      bullets: [
        'At-home symptom calming sequence in 20 minutes.',
        'When to escalate to tele-consult or in-person care.',
        'Food and hydration choices that support recovery.',
      ],
    },
    longterm: {
      title: 'Long-Term Joint Protection',
      bullets: [
        'Mobility stacking with low-impact micro-workouts.',
        'Tracking function milestones instead of pain alone.',
        'Lifestyle habits to protect joints over years.',
      ],
    },
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-glow" />
        <p className="eyebrow">Rheumatology Consultant Companion</p>
        <h1>Clinical intelligence and patient education in one innovative workspace.</h1>
        <p className="hero-copy">
          Built for rheumatology consultants to guide treatment decisions, support patient education,
          and deliver practical daily tools with a modern care experience.
        </p>
        <div className="hero-actions">
          <button type="button">Start Consultation</button>
          <button type="button" className="ghost">
            Open Patient Mode
          </button>
        </div>
      </header>

      <main className="grid">
        <section className="card tool-card">
          <div className="card-head">
            <h2>Disease Activity Assistant</h2>
            <span className={riskLevel.className}>{riskLevel.label}</span>
          </div>
          <p className="muted">
            Interactive triage helper to quickly estimate current rheumatoid activity for visit prep.
          </p>
          <div className="score-panel">
            <span>Activity Score</span>
            <strong>{activityScore}</strong>
          </div>
          <label>
            Pain level
            <input type="range" min="0" max="10" value={pain} onChange={(e) => setPain(Number(e.target.value))} />
            <span>{pain}/10</span>
          </label>
          <label>
            Morning stiffness
            <input
              type="range"
              min="0"
              max="10"
              value={stiffness}
              onChange={(e) => setStiffness(Number(e.target.value))}
            />
            <span>{stiffness}/10</span>
          </label>
          <label>
            Swollen joint burden
            <input
              type="range"
              min="0"
              max="10"
              value={swollenJoints}
              onChange={(e) => setSwollenJoints(Number(e.target.value))}
            />
            <span>{swollenJoints}/10</span>
          </label>
          <label>
            Energy reserve
            <input type="range" min="0" max="10" value={energy} onChange={(e) => setEnergy(Number(e.target.value))} />
            <span>{energy}/10</span>
          </label>
          <p className="nudge">{adherenceNudge}</p>
        </section>

        <section className="card">
          <h2>Consultant Command Center</h2>
          <p className="muted">Fast access modules to improve consistency, quality, and speed.</p>
          <div className="tiles">
            <article>
              <h3>Smart Differential Lens</h3>
              <p>Compares inflammatory, degenerative, and connective tissue patterns in one glance.</p>
            </article>
            <article>
              <h3>Biologic Safety Radar</h3>
              <p>Flags monitoring checkpoints, latent infection reminders, and vaccination timing.</p>
            </article>
            <article>
              <h3>Visit Narrative Builder</h3>
              <p>Generates concise progress story and care priorities for referral communication.</p>
            </article>
            <article>
              <h3>Imaging + Labs Timeline</h3>
              <p>Unified trend view for ESR, CRP, anti-CCP, ultrasound, and MRI markers.</p>
            </article>
          </div>
        </section>

        <section className="card education-card">
          <h2>Patient Education Studio</h2>
          <p className="muted">Switch educational tracks to match each patient journey stage.</p>
          <div className="segment">
            <button
              type="button"
              className={educationTrack === 'newly-diagnosed' ? 'active' : ''}
              onClick={() => setEducationTrack('newly-diagnosed')}
            >
              Newly Diagnosed
            </button>
            <button
              type="button"
              className={educationTrack === 'flare' ? 'active' : ''}
              onClick={() => setEducationTrack('flare')}
            >
              Flare Care
            </button>
            <button
              type="button"
              className={educationTrack === 'longterm' ? 'active' : ''}
              onClick={() => setEducationTrack('longterm')}
            >
              Long-Term Care
            </button>
          </div>
          <div className="education-panel">
            <h3>{educationContent[educationTrack].title}</h3>
            <ul>
              {educationContent[educationTrack].bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="resource-row">
            <span>Voice-ready handout export</span>
            <span>Arabic/English dual language mode</span>
            <span>Home exercise quick cards</span>
          </div>
        </section>

        <section className="card">
          <h2>Patient Tools</h2>
          <p className="muted">Practical tools designed for daily confidence and symptom self-management.</p>
          <div className="tools-list">
            <div>
              <h3>Medication Rhythm Tracker</h3>
              <p>Visual adherence ring with reminders and side-effect checkpoints.</p>
            </div>
            <div>
              <h3>Joint Mobility Coach</h3>
              <p>Guided 5-minute movement sessions for hands, knees, and spine.</p>
            </div>
            <div>
              <h3>Flare Trigger Journal</h3>
              <p>Pattern detection for stress, sleep, weather, and nutrition influences.</p>
            </div>
            <div>
              <h3>Care Team Connect</h3>
              <p>One-tap summary sharing for consultant, physiotherapy, and pharmacy follow-up.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Standalone demo project for rheumatology innovation, consultant workflows, and patient empowerment.</p>
        <small>Deploy-ready for GitHub + Netlify</small>
      </footer>
    </div>
  )
}

export default App
