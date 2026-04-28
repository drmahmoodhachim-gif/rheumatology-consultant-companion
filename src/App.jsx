import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'rheumatology-companion-v2'

const defaultProfile = {
  patientName: '',
  age: '',
  diagnosis: 'Rheumatoid Arthritis',
  consultant: '',
}

const defaultChecklist = {
  medsExplained: false,
  flarePlanReviewed: false,
  exercisePlanGiven: false,
}

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

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function downloadTextFile(fileName, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function App() {
  const initialData = loadFromStorage()
  const [mode, setMode] = useState('consultant')
  const [profile, setProfile] = useState(initialData?.profile ?? defaultProfile)
  const [pain, setPain] = useState(initialData?.triage?.pain ?? 4)
  const [stiffness, setStiffness] = useState(initialData?.triage?.stiffness ?? 4)
  const [swollenJoints, setSwollenJoints] = useState(initialData?.triage?.swollenJoints ?? 4)
  const [energy, setEnergy] = useState(initialData?.triage?.energy ?? 6)
  const [educationTrack, setEducationTrack] = useState(initialData?.educationTrack ?? 'newly-diagnosed')
  const [checklist, setChecklist] = useState(initialData?.checklist ?? defaultChecklist)
  const [meds, setMeds] = useState(initialData?.meds ?? [])
  const [medInput, setMedInput] = useState('')
  const [journalEntry, setJournalEntry] = useState({
    date: new Date().toISOString().slice(0, 10),
    pain: 4,
    stiffness: 4,
    fatigue: 4,
    notes: '',
  })
  const [journal, setJournal] = useState(initialData?.journal ?? [])
  const [visitHistory, setVisitHistory] = useState(initialData?.visitHistory ?? [])
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    const payload = {
      profile,
      triage: { pain, stiffness, swollenJoints, energy },
      educationTrack,
      checklist,
      meds,
      journal,
      visitHistory,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [profile, pain, stiffness, swollenJoints, energy, educationTrack, checklist, meds, journal, visitHistory])

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

  const medicationAdherence = useMemo(() => {
    if (!meds.length) return 0
    const taken = meds.filter((item) => item.takenToday).length
    return Math.round((taken / meds.length) * 100)
  }, [meds])

  const flareRisk = useMemo(() => {
    const journalAverage =
      journal.length > 0
        ? journal.reduce((acc, item) => acc + (item.pain + item.stiffness + item.fatigue) / 3, 0) / journal.length
        : 0
    const score = activityScore * 0.6 + (100 - medicationAdherence) * 0.2 + journalAverage * 0.2
    if (score < 30) return 'Low'
    if (score < 60) return 'Moderate'
    return 'High'
  }, [activityScore, medicationAdherence, journal])

  const adherenceNudge = useMemo(() => {
    if (medicationAdherence < 50) return 'Adherence is low. Confirm barriers and simplify dose scheduling.'
    if (energy <= 3) return 'Prioritize fatigue plan, sleep hygiene, and lighter movement blocks this week.'
    if (pain >= 7) return 'Discuss flare rescue protocol and pre-visit monitoring reminders with the patient.'
    return 'Continue current routine and reinforce hydration, mobility, and medication timing.'
  }, [medicationAdherence, energy, pain])

  function saveVisitSnapshot() {
    const snapshot = {
      id: generateId(),
      date: new Date().toISOString(),
      score: activityScore,
      risk: riskLevel.label,
      adherence: medicationAdherence,
      flareRisk,
    }
    setVisitHistory((prev) => [snapshot, ...prev].slice(0, 20))
    setStatusMessage('Visit snapshot saved to timeline.')
  }

  function addMedication() {
    const name = medInput.trim()
    if (!name) return
    const next = { id: generateId(), name, takenToday: false }
    setMeds((prev) => [...prev, next])
    setMedInput('')
  }

  function toggleMedication(id) {
    setMeds((prev) => prev.map((item) => (item.id === id ? { ...item, takenToday: !item.takenToday } : item)))
  }

  function removeMedication(id) {
    setMeds((prev) => prev.filter((item) => item.id !== id))
  }

  function resetMedicationDay() {
    setMeds((prev) => prev.map((item) => ({ ...item, takenToday: false })))
    setStatusMessage('Medication checks reset for a new day.')
  }

  function addJournalEntry() {
    const entry = {
      id: generateId(),
      ...journalEntry,
      pain: Number(journalEntry.pain),
      stiffness: Number(journalEntry.stiffness),
      fatigue: Number(journalEntry.fatigue),
    }
    setJournal((prev) => [entry, ...prev].slice(0, 30))
    setJournalEntry((prev) => ({ ...prev, notes: '' }))
    setStatusMessage('Symptom journal entry added.')
  }

  function exportReport() {
    const latestVisit = visitHistory[0]
    const latestJournal = journal[0]
    const checkedItems = Object.entries(checklist)
      .filter(([, value]) => value)
      .map(([key]) => key)
      .join(', ')
    const lines = [
      'Rheumatology Companion - Clinical Report',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      `Patient: ${profile.patientName || 'N/A'}`,
      `Age: ${profile.age || 'N/A'}`,
      `Diagnosis: ${profile.diagnosis || 'N/A'}`,
      `Consultant: ${profile.consultant || 'N/A'}`,
      '',
      `Current Activity Score: ${activityScore} (${riskLevel.label})`,
      `Medication Adherence: ${medicationAdherence}%`,
      `Flare Risk: ${flareRisk}`,
      '',
      `Education Track: ${educationContent[educationTrack].title}`,
      `Education Completed: ${checkedItems || 'None'}`,
      '',
      `Latest Visit: ${latestVisit ? `${new Date(latestVisit.date).toLocaleString()} | Score ${latestVisit.score}` : 'N/A'}`,
      `Latest Journal: ${
        latestJournal
          ? `${latestJournal.date} | pain ${latestJournal.pain}, stiffness ${latestJournal.stiffness}, fatigue ${latestJournal.fatigue}`
          : 'N/A'
      }`,
      '',
      'Medications:',
      ...(meds.length ? meds.map((m) => `- ${m.name}: ${m.takenToday ? 'Taken today' : 'Pending'}`) : ['- None']),
    ]
    downloadTextFile('rheumatology-report.txt', lines.join('\n'))
    setStatusMessage('Report exported as a text file.')
  }

  function resetAllData() {
    localStorage.removeItem(STORAGE_KEY)
    setProfile(defaultProfile)
    setPain(4)
    setStiffness(4)
    setSwollenJoints(4)
    setEnergy(6)
    setEducationTrack('newly-diagnosed')
    setChecklist(defaultChecklist)
    setMeds([])
    setJournal([])
    setVisitHistory([])
    setStatusMessage('All local data reset.')
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-glow" />
        <p className="eyebrow">Rheumatology Consultant Companion</p>
        <h1>Fully operational workspace for consultants and patients.</h1>
        <p className="hero-copy">
          Track disease activity, medication adherence, education milestones, and visit progress with persistent local
          data and export-ready clinical reports.
        </p>
        <div className="hero-actions">
          <button type="button" className={mode === 'consultant' ? 'active' : 'ghost'} onClick={() => setMode('consultant')}>
            Consultant Mode
          </button>
          <button type="button" className={mode === 'patient' ? 'active' : 'ghost'} onClick={() => setMode('patient')}>
            Patient Mode
          </button>
          <button type="button" className="ghost" onClick={exportReport}>
            Export Report
          </button>
          <button type="button" className="danger" onClick={resetAllData}>
            Reset All Data
          </button>
        </div>
        {statusMessage ? <p className="status-message">{statusMessage}</p> : null}
      </header>

      <main className="grid">
        <section className="card tool-card">
          <div className="card-head">
            <h2>Disease Activity Assistant</h2>
            <span className={riskLevel.className}>{riskLevel.label}</span>
          </div>
          <p className="muted">Live triage model that saves snapshots to consultant timeline.</p>
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
          <button type="button" onClick={saveVisitSnapshot}>
            Save Visit Snapshot
          </button>
        </section>

        <section className="card">
          <h2>Patient Profile + Consultation</h2>
          <p className="muted">Structured profile fields ready for real clinic use.</p>
          <div className="form-grid">
            <label>
              Patient name
              <input
                type="text"
                value={profile.patientName}
                onChange={(e) => setProfile((prev) => ({ ...prev, patientName: e.target.value }))}
              />
            </label>
            <label>
              Age
              <input type="number" value={profile.age} onChange={(e) => setProfile((prev) => ({ ...prev, age: e.target.value }))} />
            </label>
            <label>
              Diagnosis
              <input
                type="text"
                value={profile.diagnosis}
                onChange={(e) => setProfile((prev) => ({ ...prev, diagnosis: e.target.value }))}
              />
            </label>
            <label>
              Consultant
              <input
                type="text"
                value={profile.consultant}
                onChange={(e) => setProfile((prev) => ({ ...prev, consultant: e.target.value }))}
              />
            </label>
          </div>
          <div className="summary-row">
            <span>Medication adherence: {medicationAdherence}%</span>
            <span>Current flare risk: {flareRisk}</span>
          </div>
          <div className="timeline">
            <h3>Visit Timeline</h3>
            {visitHistory.length ? (
              visitHistory.map((visit) => (
                <div key={visit.id} className="timeline-item">
                  <strong>{new Date(visit.date).toLocaleString()}</strong>
                  <span>Score {visit.score} | {visit.risk}</span>
                  <span>Adherence {visit.adherence}% | Flare {visit.flareRisk}</span>
                </div>
              ))
            ) : (
              <p className="muted">No saved snapshots yet.</p>
            )}
          </div>
        </section>

        <section className="card education-card">
          <h2>Patient Education Studio</h2>
          <p className="muted">Interactive education path with completion checklist.</p>
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
          <div className="checklist">
            <label>
              <input
                type="checkbox"
                checked={checklist.medsExplained}
                onChange={(e) => setChecklist((prev) => ({ ...prev, medsExplained: e.target.checked }))}
              />
              Medication purpose and side effects explained
            </label>
            <label>
              <input
                type="checkbox"
                checked={checklist.flarePlanReviewed}
                onChange={(e) => setChecklist((prev) => ({ ...prev, flarePlanReviewed: e.target.checked }))}
              />
              Flare action plan reviewed with patient
            </label>
            <label>
              <input
                type="checkbox"
                checked={checklist.exercisePlanGiven}
                onChange={(e) => setChecklist((prev) => ({ ...prev, exercisePlanGiven: e.target.checked }))}
              />
              Exercise and mobility plan delivered
            </label>
          </div>
        </section>

        <section className="card">
          <h2>Patient Tools</h2>
          <p className="muted">
            {mode === 'consultant'
              ? 'Consultant-facing controls with real data tracking.'
              : 'Patient-facing controls for daily self-management.'}
          </p>
          <div className="tools-list">
            <div>
              <h3>Medication Rhythm Tracker</h3>
              <div className="inline-group">
                <input
                  type="text"
                  value={medInput}
                  placeholder="Add medication name"
                  onChange={(e) => setMedInput(e.target.value)}
                />
                <button type="button" onClick={addMedication}>
                  Add
                </button>
                <button type="button" className="ghost" onClick={resetMedicationDay}>
                  New Day
                </button>
              </div>
              <div className="list-area">
                {meds.length ? (
                  meds.map((item) => (
                    <div key={item.id} className="list-item">
                      <label>
                        <input type="checkbox" checked={item.takenToday} onChange={() => toggleMedication(item.id)} />
                        {item.name}
                      </label>
                      <button type="button" className="danger small" onClick={() => removeMedication(item.id)}>
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="muted">No medications added yet.</p>
                )}
              </div>
            </div>

            <div>
              <h3>Flare Trigger Journal</h3>
              <div className="form-grid compact">
                <label>
                  Date
                  <input
                    type="date"
                    value={journalEntry.date}
                    onChange={(e) => setJournalEntry((prev) => ({ ...prev, date: e.target.value }))}
                  />
                </label>
                <label>
                  Pain
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={journalEntry.pain}
                    onChange={(e) => setJournalEntry((prev) => ({ ...prev, pain: e.target.value }))}
                  />
                </label>
                <label>
                  Stiffness
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={journalEntry.stiffness}
                    onChange={(e) => setJournalEntry((prev) => ({ ...prev, stiffness: e.target.value }))}
                  />
                </label>
                <label>
                  Fatigue
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={journalEntry.fatigue}
                    onChange={(e) => setJournalEntry((prev) => ({ ...prev, fatigue: e.target.value }))}
                  />
                </label>
              </div>
              <label>
                Notes
                <textarea
                  rows="2"
                  value={journalEntry.notes}
                  onChange={(e) => setJournalEntry((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </label>
              <button type="button" onClick={addJournalEntry}>
                Add Journal Entry
              </button>
              <div className="list-area">
                {journal.length ? (
                  journal.slice(0, 5).map((item) => (
                    <div key={item.id} className="list-item stacked">
                      <strong>{item.date}</strong>
                      <span>
                        Pain {item.pain}, Stiffness {item.stiffness}, Fatigue {item.fatigue}
                      </span>
                      {item.notes ? <span className="muted">{item.notes}</span> : null}
                    </div>
                  ))
                ) : (
                  <p className="muted">No journal entries yet.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Operational standalone project with local persistence, visit logging, adherence tracking, and report export.</p>
        <small>Live on GitHub + Netlify</small>
      </footer>
    </div>
  )
}

export default App
