import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'rheumatology-companion-v3'

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

const defaultPredictors = {
  tenderJoints: 6,
  crp: 12,
  esr: 28,
  sleepHours: 6,
  stress: 6,
  activityMinutes: 25,
  steps: 4500,
  bmi: 27,
  smoking: false,
  activeInfection: false,
}

const defaultSimulator = {
  sleepDelta: 1,
  stressDelta: -2,
  activityDelta: 20,
  stepsDelta: 2000,
  adherenceDelta: 10,
}

const LANGUAGES = ['en', 'ar']

const I18N = {
  en: {
    title: 'Fully operational workspace for consultants and patients.',
    subtitle:
      'Track disease activity, medication adherence, education milestones, and visit progress with persistent local data and export-ready clinical reports.',
    consultantMode: 'Consultant Mode',
    patientMode: 'Patient Mode',
    exportReport: 'Export Report',
    resetAll: 'Reset All Data',
    predictiveDashboard: 'Predictive Dashboard',
    diseaseAssistant: 'Disease Activity Assistant',
    multilingualAndDrugHub: 'Multilingual + Drug Intelligence Hub',
    language: 'Language',
    selectedDrug: 'Selected drug',
    class: 'Class',
    indications: 'Indications',
    keySideEffects: 'Key side effects',
    contraindications: 'Contraindications',
    pharmacogenetics: 'Pharmacogenetics',
    noPgx: 'No established pharmacogenetic guidance listed for this drug.',
    interactionChecker: 'Drug-Drug Interaction Checker',
    drugA: 'Drug A',
    drugB: 'Drug B',
    interactionResult: 'Interaction result',
    noInteraction: 'No major interaction rule found in this local knowledge base.',
    suggestedTests: 'Suggested Tests',
    addLabResult: 'Add Lab Test Result',
    addRadiology: 'Add Radiology Entry',
    testType: 'Test type',
    value: 'Value',
    unit: 'Unit',
    normalRange: 'Normal range',
    interpretation: 'Interpretation',
    modality: 'Modality',
    region: 'Region',
    finding: 'Finding',
    impression: 'Impression',
    add: 'Add',
    savedTests: 'Saved Test Results',
    savedRadiology: 'Saved Radiology Results',
  },
  ar: {
    title: 'منصة تشغيلية متكاملة للأطباء والمرضى.',
    subtitle:
      'تتبّع نشاط المرض والالتزام الدوائي والتعليم الصحي وتقدم الزيارات مع حفظ محلي وتقرير قابل للتصدير.',
    consultantMode: 'وضع الاستشاري',
    patientMode: 'وضع المريض',
    exportReport: 'تصدير التقرير',
    resetAll: 'إعادة ضبط البيانات',
    predictiveDashboard: 'لوحة التنبؤ',
    diseaseAssistant: 'مساعد نشاط المرض',
    multilingualAndDrugHub: 'واجهة متعددة اللغات + معلومات دوائية',
    language: 'اللغة',
    selectedDrug: 'الدواء المختار',
    class: 'التصنيف',
    indications: 'الاستطبابات',
    keySideEffects: 'الآثار الجانبية المهمة',
    contraindications: 'موانع الاستعمال',
    pharmacogenetics: 'الدوائيات الجينية',
    noPgx: 'لا توجد توصيات دوائية جينية ثابتة لهذا الدواء ضمن هذه القاعدة المحلية.',
    interactionChecker: 'فاحص التداخلات الدوائية',
    drugA: 'الدواء الأول',
    drugB: 'الدواء الثاني',
    interactionResult: 'نتيجة التداخل',
    noInteraction: 'لا يوجد تداخل رئيسي مطابق في قاعدة المعرفة المحلية.',
    suggestedTests: 'الفحوصات المقترحة',
    addLabResult: 'إضافة نتيجة فحص مخبري',
    addRadiology: 'إضافة نتيجة شعاعية',
    testType: 'نوع الفحص',
    value: 'القيمة',
    unit: 'الوحدة',
    normalRange: 'المدى الطبيعي',
    interpretation: 'التفسير',
    modality: 'نوع التصوير',
    region: 'المنطقة',
    finding: 'النتيجة',
    impression: 'الانطباع النهائي',
    add: 'إضافة',
    savedTests: 'نتائج الفحوصات المحفوظة',
    savedRadiology: 'النتائج الشعاعية المحفوظة',
  },
}

const DRUG_CATALOG = [
  {
    key: 'methotrexate',
    name: { en: 'Methotrexate', ar: 'ميثوتريكسات' },
    class: { en: 'csDMARD', ar: 'دواء معدّل لمسار المرض' },
    indications: { en: 'RA, PsA, inflammatory arthritis', ar: 'الروماتويد، الصدفية المفصلية، التهاب المفاصل الالتهابي' },
    sideEffects: { en: 'Hepatotoxicity, cytopenia, stomatitis', ar: 'سمية كبدية، نقص خلايا الدم، التهاب الفم' },
    contraindications: { en: 'Pregnancy, severe liver disease', ar: 'الحمل، مرض كبدي شديد' },
    pgx: [{ gene: 'MTHFR', note: { en: 'Variants may influence toxicity risk in some populations.', ar: 'قد تؤثر بعض الطفرات على خطورة السمية لدى بعض الفئات.' } }],
    tests: ['CBC', 'ALT/AST', 'Creatinine', 'Hepatitis B/C screen'],
  },
  {
    key: 'hydroxychloroquine',
    name: { en: 'Hydroxychloroquine', ar: 'هيدروكسي كلوروكوين' },
    class: { en: 'csDMARD', ar: 'دواء معدّل لمسار المرض' },
    indications: { en: 'RA, SLE', ar: 'الروماتويد، الذئبة' },
    sideEffects: { en: 'Retinopathy, GI upset, QT concerns', ar: 'اعتلال شبكي، اضطراب هضمي، إطالة QT' },
    contraindications: { en: 'Known retinal disease caution', ar: 'الحذر عند وجود مرض شبكي' },
    pgx: [],
    tests: ['Baseline ophthalmology', 'Annual ophthalmology', 'CBC', 'LFT'],
  },
  {
    key: 'leflunomide',
    name: { en: 'Leflunomide', ar: 'ليفلو نومايد' },
    class: { en: 'csDMARD', ar: 'دواء معدّل لمسار المرض' },
    indications: { en: 'RA', ar: 'الروماتويد' },
    sideEffects: { en: 'Hepatotoxicity, hypertension, diarrhea', ar: 'سمية كبدية، ارتفاع ضغط، إسهال' },
    contraindications: { en: 'Pregnancy, severe liver disease', ar: 'الحمل، مرض كبدي شديد' },
    pgx: [],
    tests: ['CBC', 'ALT/AST', 'Blood pressure', 'Pregnancy test'],
  },
  {
    key: 'adalimumab',
    name: { en: 'Adalimumab', ar: 'أداليموماب' },
    class: { en: 'TNF inhibitor biologic', ar: 'بيولوجي مثبط TNF' },
    indications: { en: 'RA, PsA, axial SpA', ar: 'الروماتويد، الصدفية المفصلية، التهاب الفقار' },
    sideEffects: { en: 'Infection risk, injection site reaction', ar: 'زيادة خطر العدوى، تفاعل موضع الحقن' },
    contraindications: { en: 'Active serious infection', ar: 'عدوى فعالة شديدة' },
    pgx: [],
    tests: ['TB test', 'Hepatitis B/C screen', 'CBC', 'CRP'],
  },
  {
    key: 'tofacitinib',
    name: { en: 'Tofacitinib', ar: 'توفاسيتينيب' },
    class: { en: 'JAK inhibitor', ar: 'مثبط JAK' },
    indications: { en: 'RA, PsA', ar: 'الروماتويد، الصدفية المفصلية' },
    sideEffects: { en: 'Herpes zoster, thrombosis warning, lipid rise', ar: 'الحزام الناري، خطر الخثار، ارتفاع الدهون' },
    contraindications: { en: 'Severe active infection', ar: 'عدوى فعالة شديدة' },
    pgx: [{ gene: 'CYP3A4/2C19', note: { en: 'Dose caution with strong CYP interactions.', ar: 'يلزم الحذر بالجرعة مع التداخلات القوية على CYP.' } }],
    tests: ['CBC', 'Lipid profile', 'LFT', 'TB test'],
  },
]

const INTERACTIONS = [
  { a: 'methotrexate', b: 'leflunomide', severity: 'High', note: { en: 'Higher hepatotoxicity and marrow suppression risk.', ar: 'زيادة خطر السمية الكبدية وكبت نقي العظم.' } },
  { a: 'methotrexate', b: 'tofacitinib', severity: 'Moderate', note: { en: 'Monitor infection and cytopenia risk closely.', ar: 'مراقبة خطر العدوى ونقص خلايا الدم.' } },
  { a: 'adalimumab', b: 'tofacitinib', severity: 'High', note: { en: 'Additive immunosuppression risk; combination usually avoided.', ar: 'زيادة التثبيط المناعي؛ غالبا يُتجنب الجمع.' } },
  { a: 'hydroxychloroquine', b: 'tofacitinib', severity: 'Low', note: { en: 'Usually manageable; monitor QT and tolerability.', ar: 'غالبا يمكن تدبيره؛ راقب QT والتحمل.' } },
]

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

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function computeFlareScore({ predictors, activityScore, medicationAdherence, journalTrendPerDay }) {
  const normalizedCrp = clamp((predictors.crp / 30) * 100, 0, 100)
  const normalizedEsr = clamp((predictors.esr / 60) * 100, 0, 100)
  const sleepPenalty = clamp((8 - predictors.sleepHours) * 12, 0, 35)
  const stressPenalty = predictors.stress * 5.5
  const activityPenalty = clamp((45 - predictors.activityMinutes) * 1.4, 0, 35)
  const stepsPenalty = clamp((7000 - predictors.steps) / 120, 0, 35)
  const bmiPenalty = predictors.bmi > 25 ? clamp((predictors.bmi - 25) * 2.8, 0, 28) : 0
  const trendPenalty = clamp((journalTrendPerDay + 1.2) * 16, 0, 35)
  const adherencePenalty = (100 - medicationAdherence) * 0.26
  const immuneLoad = predictors.activeInfection ? 12 : 0
  const smokeLoad = predictors.smoking ? 9 : 0
  const score =
    activityScore * 8.4 +
    predictors.tenderJoints * 2 +
    normalizedCrp * 0.18 +
    normalizedEsr * 0.14 +
    sleepPenalty +
    stressPenalty +
    activityPenalty +
    stepsPenalty +
    bmiPenalty +
    trendPenalty +
    adherencePenalty +
    immuneLoad +
    smokeLoad
  return clamp(Math.round(score / 3.2), 1, 99)
}

function App() {
  const embedMode = new URLSearchParams(window.location.search).get('embed') === '1'
  const initialData = loadFromStorage()
  const [mode, setMode] = useState('consultant')
  const [profile, setProfile] = useState(initialData?.profile ?? defaultProfile)
  const [language, setLanguage] = useState(initialData?.language ?? 'en')
  const [pain, setPain] = useState(initialData?.triage?.pain ?? 4)
  const [stiffness, setStiffness] = useState(initialData?.triage?.stiffness ?? 4)
  const [swollenJoints, setSwollenJoints] = useState(initialData?.triage?.swollenJoints ?? 4)
  const [energy, setEnergy] = useState(initialData?.triage?.energy ?? 6)
  const [educationTrack, setEducationTrack] = useState(initialData?.educationTrack ?? 'newly-diagnosed')
  const [checklist, setChecklist] = useState(initialData?.checklist ?? defaultChecklist)
  const [predictors, setPredictors] = useState(initialData?.predictors ?? defaultPredictors)
  const [simulator, setSimulator] = useState(initialData?.simulator ?? defaultSimulator)
  const [selectedDrug, setSelectedDrug] = useState(initialData?.selectedDrug ?? DRUG_CATALOG[0].key)
  const [interactionA, setInteractionA] = useState(initialData?.interactionA ?? DRUG_CATALOG[0].key)
  const [interactionB, setInteractionB] = useState(initialData?.interactionB ?? DRUG_CATALOG[1].key)
  const [meds, setMeds] = useState(initialData?.meds ?? [])
  const [medInput, setMedInput] = useState('')
  const [journalEntry, setJournalEntry] = useState({
    date: new Date().toISOString().slice(0, 10),
    pain: 4,
    stiffness: 4,
    fatigue: 4,
    sleepHours: 6,
    stress: 5,
    steps: 4500,
    notes: '',
  })
  const [journal, setJournal] = useState(initialData?.journal ?? [])
  const [visitHistory, setVisitHistory] = useState(initialData?.visitHistory ?? [])
  const [testEntry, setTestEntry] = useState(
    initialData?.testEntry ?? {
      date: new Date().toISOString().slice(0, 10),
      type: 'CRP',
      value: '',
      unit: 'mg/L',
      normalRange: '',
      interpretation: '',
    },
  )
  const [testResults, setTestResults] = useState(initialData?.testResults ?? [])
  const [radiologyEntry, setRadiologyEntry] = useState(
    initialData?.radiologyEntry ?? {
      date: new Date().toISOString().slice(0, 10),
      modality: 'Ultrasound',
      region: 'Hands/Wrists',
      finding: '',
      impression: '',
    },
  )
  const [radiologyResults, setRadiologyResults] = useState(initialData?.radiologyResults ?? [])
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    const payload = {
      profile,
      language,
      triage: { pain, stiffness, swollenJoints, energy },
      educationTrack,
      checklist,
      predictors,
      simulator,
      selectedDrug,
      interactionA,
      interactionB,
      meds,
      journal,
      visitHistory,
      testEntry,
      testResults,
      radiologyEntry,
      radiologyResults,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [
    profile,
    language,
    pain,
    stiffness,
    swollenJoints,
    energy,
    educationTrack,
    checklist,
    predictors,
    simulator,
    selectedDrug,
    interactionA,
    interactionB,
    meds,
    journal,
    visitHistory,
    testEntry,
    testResults,
    radiologyEntry,
    radiologyResults,
  ])

  const t = (key) => I18N[language]?.[key] ?? I18N.en[key] ?? key

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

  const recentJournal = useMemo(
    () => [...journal].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-10),
    [journal],
  )

  const journalTrendPerDay = useMemo(() => {
    if (recentJournal.length < 2) return 0
    const first = recentJournal[0]
    const last = recentJournal[recentJournal.length - 1]
    const firstAvg = (Number(first.pain) + Number(first.stiffness) + Number(first.fatigue)) / 3
    const lastAvg = (Number(last.pain) + Number(last.stiffness) + Number(last.fatigue)) / 3
    const totalDays = Math.max(
      1,
      (new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24),
    )
    return Number(((lastAvg - firstAvg) / totalDays).toFixed(2))
  }, [recentJournal])

  const flareScore = useMemo(() => {
    return computeFlareScore({ predictors, activityScore, medicationAdherence, journalTrendPerDay })
  }, [activityScore, medicationAdherence, predictors, journalTrendPerDay])

  const flareRisk = useMemo(() => {
    if (flareScore < 35) return 'Low'
    if (flareScore < 65) return 'Moderate'
    return 'High'
  }, [flareScore])

  const forecast14Day = useMemo(() => {
    const base = 100 - flareScore
    const trendAdjust = journalTrendPerDay > 0 ? -8 : 6
    const adherenceAdjust = medicationAdherence > 80 ? 6 : -4
    return clamp(Math.round(base + trendAdjust + adherenceAdjust), 5, 95)
  }, [flareScore, journalTrendPerDay, medicationAdherence])

  const riskDrivers = useMemo(() => {
    const drivers = [
      { name: 'Inflammation markers (CRP/ESR)', value: clamp(((predictors.crp / 30) * 100 + (predictors.esr / 60) * 100) / 2, 0, 100) },
      { name: 'Clinical symptoms', value: clamp(activityScore * 10, 0, 100) },
      { name: 'Medication adherence gap', value: clamp(100 - medicationAdherence, 0, 100) },
      { name: 'Stress + low sleep', value: clamp(predictors.stress * 8 + (8 - predictors.sleepHours) * 10, 0, 100) },
      { name: 'Low movement load', value: clamp((7000 - predictors.steps) / 70 + (45 - predictors.activityMinutes), 0, 100) },
      { name: 'Trend acceleration', value: clamp((journalTrendPerDay + 1.2) * 40, 0, 100) },
    ]
    return drivers.sort((a, b) => b.value - a.value).slice(0, 4)
  }, [predictors, activityScore, medicationAdherence, journalTrendPerDay])

  const currentDrug = useMemo(
    () => DRUG_CATALOG.find((drug) => drug.key === selectedDrug) ?? DRUG_CATALOG[0],
    [selectedDrug],
  )

  const interactionResult = useMemo(() => {
    const normalizedA = interactionA
    const normalizedB = interactionB
    return (
      INTERACTIONS.find(
        (entry) =>
          (entry.a === normalizedA && entry.b === normalizedB) ||
          (entry.a === normalizedB && entry.b === normalizedA),
      ) ?? null
    )
  }, [interactionA, interactionB])

  const dynamicSuggestedTests = useMemo(() => {
    const mapped = meds
      .map((med) =>
        DRUG_CATALOG.find((drug) => med.name.toLowerCase().includes(drug.name.en.toLowerCase().split(' ')[0])),
      )
      .filter(Boolean)
      .flatMap((drug) => drug.tests)
    const base = ['CRP', 'ESR', 'CBC', 'LFT', 'Creatinine']
    return [...new Set([...base, ...mapped])]
  }, [meds])

  const sparklineData = useMemo(() => {
    if (!recentJournal.length) return []
    return recentJournal.map((entry, index) => {
      const average = (Number(entry.pain) + Number(entry.stiffness) + Number(entry.fatigue)) / 3
      return { x: index, y: average }
    })
  }, [recentJournal])

  const sparklinePoints = useMemo(() => {
    if (!sparklineData.length) return ''
    const width = 220
    const height = 64
    return sparklineData
      .map((point, i) => {
        const x = sparklineData.length === 1 ? 0 : (i / (sparklineData.length - 1)) * width
        const y = height - (point.y / 10) * height
        return `${x},${y}`
      })
      .join(' ')
  }, [sparklineData])

  const simulatedScenario = useMemo(() => {
    const projectedPredictors = {
      ...predictors,
      sleepHours: clamp(predictors.sleepHours + simulator.sleepDelta, 0, 12),
      stress: clamp(predictors.stress + simulator.stressDelta, 0, 10),
      activityMinutes: clamp(predictors.activityMinutes + simulator.activityDelta, 0, 240),
      steps: clamp(predictors.steps + simulator.stepsDelta, 0, 50000),
    }
    const projectedAdherence = clamp(medicationAdherence + simulator.adherenceDelta, 0, 100)
    const projectedTrend = clamp(
      journalTrendPerDay - simulator.sleepDelta * 0.05 - simulator.activityDelta * 0.002 + simulator.stressDelta * 0.03,
      -2,
      2,
    )
    const projectedScore = computeFlareScore({
      predictors: projectedPredictors,
      activityScore,
      medicationAdherence: projectedAdherence,
      journalTrendPerDay: projectedTrend,
    })
    const delta = projectedScore - flareScore
    return {
      projectedPredictors,
      projectedAdherence,
      projectedScore,
      delta,
      projectedRisk: projectedScore < 35 ? 'Low' : projectedScore < 65 ? 'Moderate' : 'High',
    }
  }, [predictors, simulator, medicationAdherence, journalTrendPerDay, activityScore, flareScore])

  const riskAlerts = useMemo(() => {
    const alerts = []
    if (flareScore >= 75) alerts.push({ level: 'critical', text: 'Predicted flare risk is critical; prioritize urgent review plan.' })
    if (predictors.crp >= 20 || predictors.esr >= 40) alerts.push({ level: 'high', text: 'Inflammatory markers are elevated above target zone.' })
    if (medicationAdherence < 60) alerts.push({ level: 'high', text: 'Medication adherence is below 60%; intervention needed.' })
    if (predictors.sleepHours < 6 && predictors.stress >= 7) alerts.push({ level: 'medium', text: 'High stress with low sleep raises near-term flare pressure.' })
    if (predictors.activeInfection) alerts.push({ level: 'critical', text: 'Active infection flag can destabilize disease activity.' })
    if (journalTrendPerDay > 0.15) alerts.push({ level: 'medium', text: 'Journal trend is accelerating in the wrong direction.' })
    return alerts
  }, [flareScore, predictors, medicationAdherence, journalTrendPerDay])

  const actionPlan = useMemo(() => {
    const plan = []
    if (flareScore >= 65) plan.push('Increase follow-up frequency and set early escalation threshold.')
    if (predictors.crp >= 20 || predictors.esr >= 40) plan.push('Repeat inflammatory panel and correlate with clinical exam.')
    if (medicationAdherence < 70) plan.push('Run adherence barrier review and simplify regimen timing.')
    if (predictors.sleepHours < 6) plan.push('Initiate short sleep intervention protocol for the next 2 weeks.')
    if (predictors.stress >= 7) plan.push('Add stress-modulation tasks and daily breathing routine reminders.')
    if (predictors.steps < 5000 || predictors.activityMinutes < 25) plan.push('Set progressive movement goal with weekly increments.')
    if (!plan.length) plan.push('Maintain current plan and continue weekly monitoring.')
    return plan.slice(0, 5)
  }, [flareScore, predictors, medicationAdherence])

  const adherenceNudge = useMemo(() => {
    if (flareScore >= 70) return 'High risk: escalate review cadence and consider rescue protocol + lab recheck window.'
    if (medicationAdherence < 50) return 'Adherence is low. Confirm barriers and simplify dose scheduling.'
    if (predictors.sleepHours < 6 || predictors.stress >= 7) return 'Lifestyle signal is worsening. Add sleep/stress interventions now.'
    if (energy <= 3) return 'Prioritize fatigue plan, sleep hygiene, and lighter movement blocks this week.'
    if (pain >= 7) return 'Discuss flare rescue protocol and pre-visit monitoring reminders with the patient.'
    return 'Continue current routine and reinforce hydration, mobility, and medication timing.'
  }, [flareScore, medicationAdherence, predictors.sleepHours, predictors.stress, energy, pain])

  function saveVisitSnapshot() {
    const snapshot = {
      id: generateId(),
      date: new Date().toISOString(),
      score: activityScore,
      risk: riskLevel.label,
      adherence: medicationAdherence,
      flareRisk,
      flareScore,
      forecast14Day,
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
      sleepHours: Number(journalEntry.sleepHours),
      stress: Number(journalEntry.stress),
      steps: Number(journalEntry.steps),
    }
    setJournal((prev) => [entry, ...prev].slice(0, 30))
    setJournalEntry((prev) => ({ ...prev, notes: '' }))
    setStatusMessage('Symptom journal entry added.')
  }

  function addTestResult() {
    const entry = { id: generateId(), ...testEntry }
    setTestResults((prev) => [entry, ...prev].slice(0, 40))
    setStatusMessage('Lab result added.')
  }

  function addRadiologyResult() {
    const entry = { id: generateId(), ...radiologyEntry }
    setRadiologyResults((prev) => [entry, ...prev].slice(0, 30))
    setStatusMessage('Radiology result added.')
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
      `Flare Risk Band: ${flareRisk}`,
      `Flare Probability Score: ${flareScore}%`,
      `14-Day Stability Forecast: ${forecast14Day}%`,
      `Scenario Projected Flare Score: ${simulatedScenario.projectedScore}% (${simulatedScenario.projectedRisk})`,
      `Language: ${language.toUpperCase()}`,
      '',
      `Tender joints: ${predictors.tenderJoints}`,
      `CRP (mg/L): ${predictors.crp}`,
      `ESR (mm/h): ${predictors.esr}`,
      `Sleep (hours): ${predictors.sleepHours}`,
      `Stress (0-10): ${predictors.stress}`,
      `Activity (min/day): ${predictors.activityMinutes}`,
      `Steps/day: ${predictors.steps}`,
      `BMI: ${predictors.bmi}`,
      `Smoking: ${predictors.smoking ? 'Yes' : 'No'}`,
      `Active infection: ${predictors.activeInfection ? 'Yes' : 'No'}`,
      '',
      `Education Track: ${educationContent[educationTrack].title}`,
      `Education Completed: ${checkedItems || 'None'}`,
      '',
      `Latest Visit: ${latestVisit ? `${new Date(latestVisit.date).toLocaleString()} | Score ${latestVisit.score}` : 'N/A'}`,
      `Latest Journal: ${
        latestJournal
          ? `${latestJournal.date} | pain ${latestJournal.pain}, stiffness ${latestJournal.stiffness}, fatigue ${latestJournal.fatigue}, sleep ${latestJournal.sleepHours}h, stress ${latestJournal.stress}`
          : 'N/A'
      }`,
      '',
      'Active Alerts:',
      ...(riskAlerts.length ? riskAlerts.map((a) => `- [${a.level.toUpperCase()}] ${a.text}`) : ['- None']),
      '',
      'Action Plan:',
      ...actionPlan.map((step) => `- ${step}`),
      '',
      'Lab Results:',
      ...(testResults.length
        ? testResults.map(
            (r) => `- ${r.date} | ${r.type}: ${r.value} ${r.unit} (range ${r.normalRange || 'N/A'}) | ${r.interpretation || 'N/A'}`,
          )
        : ['- None']),
      '',
      'Radiology:',
      ...(radiologyResults.length
        ? radiologyResults.map(
            (r) => `- ${r.date} | ${r.modality} ${r.region} | ${r.finding || 'N/A'} | Impression: ${r.impression || 'N/A'}`,
          )
        : ['- None']),
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
    setLanguage('en')
    setPain(4)
    setStiffness(4)
    setSwollenJoints(4)
    setEnergy(6)
    setEducationTrack('newly-diagnosed')
    setChecklist(defaultChecklist)
    setPredictors(defaultPredictors)
    setSimulator(defaultSimulator)
    setSelectedDrug(DRUG_CATALOG[0].key)
    setInteractionA(DRUG_CATALOG[0].key)
    setInteractionB(DRUG_CATALOG[1].key)
    setMeds([])
    setJournal([])
    setVisitHistory([])
    setTestResults([])
    setRadiologyResults([])
    setStatusMessage('All local data reset.')
  }

  return (
    <div className={`rcc-app ${embedMode ? 'rcc-embed' : ''} ${language === 'ar' ? 'rcc-rtl' : ''}`}>
      <div className="app-shell">
      <header className="hero">
        <div className="hero-glow" />
        <p className="eyebrow">GCC AIR Rheumatology Consultant Companion</p>
        <h1>{t('title')}</h1>
        <p className="hero-copy">{t('subtitle')}</p>
        <div className="hero-actions">
          <button type="button" className={mode === 'consultant' ? 'active' : 'ghost'} onClick={() => setMode('consultant')}>
            {t('consultantMode')}
          </button>
          <button type="button" className={mode === 'patient' ? 'active' : 'ghost'} onClick={() => setMode('patient')}>
            {t('patientMode')}
          </button>
          <button type="button" className={language === 'en' ? 'active' : 'ghost'} onClick={() => setLanguage('en')}>
            English
          </button>
          <button type="button" className={language === 'ar' ? 'active' : 'ghost'} onClick={() => setLanguage('ar')}>
            العربية
          </button>
          <button type="button" className="ghost" onClick={exportReport}>
            {t('exportReport')}
          </button>
          {!embedMode ? (
            <button type="button" className="danger" onClick={resetAllData}>
              {t('resetAll')}
            </button>
          ) : null}
        </div>
        {statusMessage ? <p className="status-message">{statusMessage}</p> : null}
      </header>

      <main className="grid">
        <section className="card dashboard-visual">
          <div className="card-head">
            <h2>Predictive Dashboard</h2>
            <span className={flareRisk === 'High' ? 'pill high' : flareRisk === 'Moderate' ? 'pill moderate' : 'pill low'}>
              {flareRisk} flare risk
            </span>
          </div>
          <div className="metric-grid">
            <div className="metric-card">
              <span>Flare Probability</span>
              <div
                className="ring"
                style={{
                  background: `conic-gradient(rgba(255,107,138,0.92) ${flareScore * 3.6}deg, rgba(184,205,255,0.2) ${flareScore * 3.6}deg)`,
                }}
              >
                <strong>{flareScore}%</strong>
              </div>
            </div>
            <div className="metric-card">
              <span>14-Day Stability Forecast</span>
              <div
                className="ring success"
                style={{
                  background: `conic-gradient(rgba(61,226,159,0.9) ${forecast14Day * 3.6}deg, rgba(184,205,255,0.2) ${forecast14Day * 3.6}deg)`,
                }}
              >
                <strong>{forecast14Day}%</strong>
              </div>
            </div>
            <div className="metric-card">
              <span>Symptom Trend (last 10 entries)</span>
              {sparklineData.length > 1 ? (
                <svg viewBox="0 0 220 64" className="sparkline" role="img" aria-label="Symptom trend chart">
                  <polyline points={sparklinePoints} />
                </svg>
              ) : (
                <p className="muted">Add at least 2 journal entries to view trend.</p>
              )}
              <small className={journalTrendPerDay > 0 ? 'risk-up' : 'risk-down'}>
                {journalTrendPerDay > 0 ? 'Worsening' : 'Improving'} trend: {journalTrendPerDay} per day
              </small>
            </div>
          </div>
          <div className="drivers">
            {riskDrivers.map((driver) => (
              <div key={driver.name} className="driver-row">
                <span>{driver.name}</span>
                <div>
                  <i style={{ width: `${driver.value}%` }} />
                </div>
                <strong>{Math.round(driver.value)}%</strong>
              </div>
            ))}
          </div>
          <div className="insight-grid">
            <div className="insight-panel">
              <h3>What-If Simulator</h3>
              <p className="muted">Model targeted behavior changes before applying real interventions.</p>
              <div className="form-grid compact">
                <label>
                  Sleep delta (h)
                  <input
                    type="number"
                    min="-4"
                    max="4"
                    value={simulator.sleepDelta}
                    onChange={(e) => setSimulator((prev) => ({ ...prev, sleepDelta: Number(e.target.value) }))}
                  />
                </label>
                <label>
                  Stress delta
                  <input
                    type="number"
                    min="-5"
                    max="5"
                    value={simulator.stressDelta}
                    onChange={(e) => setSimulator((prev) => ({ ...prev, stressDelta: Number(e.target.value) }))}
                  />
                </label>
                <label>
                  Activity delta (min/day)
                  <input
                    type="number"
                    min="-60"
                    max="90"
                    value={simulator.activityDelta}
                    onChange={(e) => setSimulator((prev) => ({ ...prev, activityDelta: Number(e.target.value) }))}
                  />
                </label>
                <label>
                  Steps delta
                  <input
                    type="number"
                    min="-6000"
                    max="12000"
                    value={simulator.stepsDelta}
                    onChange={(e) => setSimulator((prev) => ({ ...prev, stepsDelta: Number(e.target.value) }))}
                  />
                </label>
                <label>
                  Adherence delta (%)
                  <input
                    type="number"
                    min="-40"
                    max="40"
                    value={simulator.adherenceDelta}
                    onChange={(e) => setSimulator((prev) => ({ ...prev, adherenceDelta: Number(e.target.value) }))}
                  />
                </label>
              </div>
              <div className="sim-result">
                <span>Projected flare score</span>
                <strong>{simulatedScenario.projectedScore}%</strong>
                <small className={simulatedScenario.delta > 0 ? 'risk-up' : 'risk-down'}>
                  {simulatedScenario.delta > 0 ? '+' : ''}
                  {simulatedScenario.delta} vs current ({simulatedScenario.projectedRisk})
                </small>
              </div>
            </div>

            <div className="insight-panel">
              <h3>Risk Alerts + Action Plan</h3>
              <div className="alert-list">
                {riskAlerts.length ? (
                  riskAlerts.map((alert) => (
                    <div key={alert.text} className={`alert-row ${alert.level}`}>
                      <strong>{alert.level.toUpperCase()}</strong>
                      <span>{alert.text}</span>
                    </div>
                  ))
                ) : (
                  <p className="muted">No active risk alerts.</p>
                )}
              </div>
              <ol className="action-list">
                {actionPlan.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="card">
          <h2>{t('multilingualAndDrugHub')}</h2>
          <div className="form-grid compact">
            <label>
              {t('selectedDrug')}
              <select value={selectedDrug} onChange={(e) => setSelectedDrug(e.target.value)}>
                {DRUG_CATALOG.map((drug) => (
                  <option key={drug.key} value={drug.key}>
                    {drug.name[language]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="drug-grid">
            <div className="drug-box">
              <h3>{currentDrug.name[language]}</h3>
              <p><strong>{t('class')}:</strong> {currentDrug.class[language]}</p>
              <p><strong>{t('indications')}:</strong> {currentDrug.indications[language]}</p>
              <p><strong>{t('keySideEffects')}:</strong> {currentDrug.sideEffects[language]}</p>
              <p><strong>{t('contraindications')}:</strong> {currentDrug.contraindications[language]}</p>
              <h4>{t('pharmacogenetics')}</h4>
              {currentDrug.pgx.length ? (
                <ul>
                  {currentDrug.pgx.map((item) => (
                    <li key={`${currentDrug.key}-${item.gene}`}>
                      <strong>{item.gene}:</strong> {item.note[language]}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">{t('noPgx')}</p>
              )}
            </div>

            <div className="drug-box">
              <h3>{t('interactionChecker')}</h3>
              <div className="form-grid">
                <label>
                  {t('drugA')}
                  <select value={interactionA} onChange={(e) => setInteractionA(e.target.value)}>
                    {DRUG_CATALOG.map((drug) => (
                      <option key={`a-${drug.key}`} value={drug.key}>
                        {drug.name[language]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {t('drugB')}
                  <select value={interactionB} onChange={(e) => setInteractionB(e.target.value)}>
                    {DRUG_CATALOG.map((drug) => (
                      <option key={`b-${drug.key}`} value={drug.key}>
                        {drug.name[language]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <p>
                <strong>{t('interactionResult')}:</strong>{' '}
                {interactionResult
                  ? `${interactionResult.severity} - ${interactionResult.note[language]}`
                  : t('noInteraction')}
              </p>
              <h4>{t('suggestedTests')}</h4>
              <ul>
                {dynamicSuggestedTests.map((test) => (
                  <li key={test}>{test}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="drug-grid">
            <div className="drug-box">
              <h3>{t('addLabResult')}</h3>
              <div className="form-grid compact">
                <label>
                  Date
                  <input
                    type="date"
                    value={testEntry.date}
                    onChange={(e) => setTestEntry((prev) => ({ ...prev, date: e.target.value }))}
                  />
                </label>
                <label>
                  {t('testType')}
                  <input
                    type="text"
                    value={testEntry.type}
                    onChange={(e) => setTestEntry((prev) => ({ ...prev, type: e.target.value }))}
                  />
                </label>
                <label>
                  {t('value')}
                  <input
                    type="text"
                    value={testEntry.value}
                    onChange={(e) => setTestEntry((prev) => ({ ...prev, value: e.target.value }))}
                  />
                </label>
                <label>
                  {t('unit')}
                  <input
                    type="text"
                    value={testEntry.unit}
                    onChange={(e) => setTestEntry((prev) => ({ ...prev, unit: e.target.value }))}
                  />
                </label>
              </div>
              <div className="form-grid">
                <label>
                  {t('normalRange')}
                  <input
                    type="text"
                    value={testEntry.normalRange}
                    onChange={(e) => setTestEntry((prev) => ({ ...prev, normalRange: e.target.value }))}
                  />
                </label>
                <label>
                  {t('interpretation')}
                  <input
                    type="text"
                    value={testEntry.interpretation}
                    onChange={(e) => setTestEntry((prev) => ({ ...prev, interpretation: e.target.value }))}
                  />
                </label>
              </div>
              <button type="button" onClick={addTestResult}>{t('add')}</button>
              <h4>{t('savedTests')}</h4>
              <div className="list-area">
                {testResults.length ? (
                  testResults.slice(0, 5).map((item) => (
                    <div key={item.id} className="list-item stacked">
                      <strong>{item.date}</strong>
                      <span>{item.type}: {item.value} {item.unit} ({item.normalRange || 'N/A'})</span>
                      <span className="muted">{item.interpretation || 'N/A'}</span>
                    </div>
                  ))
                ) : (
                  <p className="muted">No test results yet.</p>
                )}
              </div>
            </div>

            <div className="drug-box">
              <h3>{t('addRadiology')}</h3>
              <div className="form-grid compact">
                <label>
                  Date
                  <input
                    type="date"
                    value={radiologyEntry.date}
                    onChange={(e) => setRadiologyEntry((prev) => ({ ...prev, date: e.target.value }))}
                  />
                </label>
                <label>
                  {t('modality')}
                  <input
                    type="text"
                    value={radiologyEntry.modality}
                    onChange={(e) => setRadiologyEntry((prev) => ({ ...prev, modality: e.target.value }))}
                  />
                </label>
                <label>
                  {t('region')}
                  <input
                    type="text"
                    value={radiologyEntry.region}
                    onChange={(e) => setRadiologyEntry((prev) => ({ ...prev, region: e.target.value }))}
                  />
                </label>
              </div>
              <div className="form-grid">
                <label>
                  {t('finding')}
                  <input
                    type="text"
                    value={radiologyEntry.finding}
                    onChange={(e) => setRadiologyEntry((prev) => ({ ...prev, finding: e.target.value }))}
                  />
                </label>
                <label>
                  {t('impression')}
                  <input
                    type="text"
                    value={radiologyEntry.impression}
                    onChange={(e) => setRadiologyEntry((prev) => ({ ...prev, impression: e.target.value }))}
                  />
                </label>
              </div>
              <button type="button" onClick={addRadiologyResult}>{t('add')}</button>
              <h4>{t('savedRadiology')}</h4>
              <div className="list-area">
                {radiologyResults.length ? (
                  radiologyResults.slice(0, 5).map((item) => (
                    <div key={item.id} className="list-item stacked">
                      <strong>{item.date}</strong>
                      <span>{item.modality} - {item.region}</span>
                      <span>{item.finding || 'N/A'}</span>
                      <span className="muted">{item.impression || 'N/A'}</span>
                    </div>
                  ))
                ) : (
                  <p className="muted">No radiology entries yet.</p>
                )}
              </div>
            </div>
          </div>
        </section>

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
          <div className="form-grid compact">
            <label>
              Tender joints
              <input
                type="number"
                min="0"
                max="28"
                value={predictors.tenderJoints}
                onChange={(e) => setPredictors((prev) => ({ ...prev, tenderJoints: Number(e.target.value) }))}
              />
            </label>
            <label>
              CRP (mg/L)
              <input
                type="number"
                min="0"
                value={predictors.crp}
                onChange={(e) => setPredictors((prev) => ({ ...prev, crp: Number(e.target.value) }))}
              />
            </label>
            <label>
              ESR (mm/h)
              <input
                type="number"
                min="0"
                value={predictors.esr}
                onChange={(e) => setPredictors((prev) => ({ ...prev, esr: Number(e.target.value) }))}
              />
            </label>
            <label>
              BMI
              <input
                type="number"
                min="10"
                max="60"
                value={predictors.bmi}
                onChange={(e) => setPredictors((prev) => ({ ...prev, bmi: Number(e.target.value) }))}
              />
            </label>
          </div>
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
            <span>Flare probability: {flareScore}%</span>
            <span>14-day stability: {forecast14Day}%</span>
          </div>
          <div className="timeline">
            <h3>Visit Timeline</h3>
            {visitHistory.length ? (
              visitHistory.map((visit) => (
                <div key={visit.id} className="timeline-item">
                  <strong>{new Date(visit.date).toLocaleString()}</strong>
                  <span>Score {visit.score} | {visit.risk}</span>
                  <span>Adherence {visit.adherence}% | Flare {visit.flareRisk} ({visit.flareScore}%)</span>
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
                <label>
                  Sleep (hours)
                  <input
                    type="number"
                    min="0"
                    max="12"
                    value={journalEntry.sleepHours}
                    onChange={(e) => setJournalEntry((prev) => ({ ...prev, sleepHours: e.target.value }))}
                  />
                </label>
                <label>
                  Stress (0-10)
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={journalEntry.stress}
                    onChange={(e) => setJournalEntry((prev) => ({ ...prev, stress: e.target.value }))}
                  />
                </label>
                <label>
                  Steps
                  <input
                    type="number"
                    min="0"
                    value={journalEntry.steps}
                    onChange={(e) => setJournalEntry((prev) => ({ ...prev, steps: e.target.value }))}
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
                      <span>
                        Sleep {item.sleepHours}h, Stress {item.stress}, Steps {item.steps}
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

          <div className="form-grid compact predictor-inputs">
            <label>
              Sleep baseline (h)
              <input
                type="number"
                min="0"
                max="12"
                value={predictors.sleepHours}
                onChange={(e) => setPredictors((prev) => ({ ...prev, sleepHours: Number(e.target.value) }))}
              />
            </label>
            <label>
              Stress baseline (0-10)
              <input
                type="number"
                min="0"
                max="10"
                value={predictors.stress}
                onChange={(e) => setPredictors((prev) => ({ ...prev, stress: Number(e.target.value) }))}
              />
            </label>
            <label>
              Activity min/day
              <input
                type="number"
                min="0"
                max="180"
                value={predictors.activityMinutes}
                onChange={(e) => setPredictors((prev) => ({ ...prev, activityMinutes: Number(e.target.value) }))}
              />
            </label>
            <label>
              Steps/day
              <input
                type="number"
                min="0"
                value={predictors.steps}
                onChange={(e) => setPredictors((prev) => ({ ...prev, steps: Number(e.target.value) }))}
              />
            </label>
            <label className="toggle-line">
              <input
                type="checkbox"
                checked={predictors.smoking}
                onChange={(e) => setPredictors((prev) => ({ ...prev, smoking: e.target.checked }))}
              />
              Current smoker
            </label>
            <label className="toggle-line">
              <input
                type="checkbox"
                checked={predictors.activeInfection}
                onChange={(e) => setPredictors((prev) => ({ ...prev, activeInfection: e.target.checked }))}
              />
              Active infection
            </label>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>
          Integration-ready module for future GCC AIR website incorporation with local persistence, visit logging,
          adherence tracking, and report export.
        </p>
        <small>{embedMode ? 'Embed Mode Active (?embed=1)' : 'Standalone Mode Active'}</small>
      </footer>
      </div>
    </div>
  )
}

export default App
