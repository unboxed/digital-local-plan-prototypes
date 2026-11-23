//
// Content for the Statement of compliance prototype.
//
// The requirements are those of regulation 32 of The Town and Country Planning (Local Planning)
// (England) Regulations 2026 (SI 2026/186), "Gateway 3: prescribed requirements": the twelve
// things, (a) to (l), the person appointed under section 15CA(3) of the Act must be satisfied
// of. Their references and the sections and regulations they point to are genuine; the titles
// and descriptions are this prototype's plain-English explanation of each, not quoted legal
// text. The audit log history, dates, officers and planned activities are entirely invented
// illustrative content for a fictional plan.
//
// A requirement's status is DERIVED from how much of its full history has happened yet in the
// draft snapshot (draftEntryCount), rather than stored separately — so "Partially met" always
// means "some but not all of this requirement's history has happened", not a second,
// independently-set signal that could disagree with the audit log shown underneath it. The
// "completed" variant always shows the full history and "Fully met" for every requirement.
//

const REGULATION_URL = 'https://www.legislation.gov.uk/uksi/2026/186/regulation/32/made'

const SDS_STATEMENT_HREF = '/plan/make/gateway-preparation/statement-of-compliance/spatial-development-strategy'

const REQUIREMENTS = [
  {
    ref: 'Regulation 32(a)',
    title: 'Policies on the amount, type, location and timing of development',
    description: 'The proposed local plan sets out the authority’s policies on the amount, type and location of development in its area, and the timetable for it, as section 15C(3) of the Act requires.'
  },
  {
    ref: 'Regulation 32(b)',
    title: 'Vision, measurable outcomes and superseded policies',
    description: 'In line with regulation 11, the proposed local plan contains a vision for how the area will change over the plan period that relates to its particular characteristics, no more than ten measurable outcomes to monitor progress towards that vision, and the policies it supersedes under regulation 11(4), unless the statement of compliance explains why that is not engaged.'
  },
  {
    ref: 'Regulation 32(c)',
    title: 'Mitigating and adapting to climate change',
    description: 'The proposed local plan is designed so that the use and development of land in the area contribute to the mitigation of, and adaptation to, climate change, as section 15C(6) of the Act requires.'
  },
  {
    ref: 'Regulation 32(d)',
    title: 'Taking account of the local nature recovery strategy',
    description: 'The proposed local plan takes account of any local nature recovery strategy covering all or part of the area, including the matters in section 15C(7)(a) to (c) of the Act.'
  },
  {
    ref: 'Regulation 32(e)',
    title: 'Taking account of housing need, including affordable housing',
    description: 'The proposed local plan takes account of an assessment of the amount and type of housing needed in the area, including the amount of affordable housing needed, as section 15C(8) of the Act requires.'
  },
  {
    ref: 'Regulation 32(f)',
    title: 'Only content the Act and regulation 11 permit',
    description: 'The proposed local plan includes nothing that is not permitted or required by section 15C(3) to (5) or (10) of the Act or by regulation 11, in line with section 15C(9)(a) of the Act.'
  },
  {
    ref: 'Regulation 32(g)',
    title: 'Advice sought at the prescribed gateways',
    description: 'The authority has sought observations and advice from a person appointed by the Secretary of State, under section 15CA(3) of the Act, at the times prescribed by regulations 26 (gateway 2), 31 (gateway 3: prescribed requirements assessment) and, where it applies, 33 (repeat of gateway 3).'
  },
  {
    ref: 'Regulation 32(h)',
    title: 'Gateway 2 observations and advice published',
    description: 'The authority has published any observations or advice it received at gateway 2, as section 15CA(5) of the Act and regulation 26(5)(a) require.'
  },
  {
    ref: 'Regulation 32(i)',
    title: 'Regard to the matters in section 15CA(6) and regulation 14',
    description: 'In preparing the proposed local plan, the authority has had regard to the matters in section 15CA(6) of the Act (including gateway advice, consultation responses, national policy and the rest of the development plan) and those in regulation 14 (including the self-assessment summary, local transport policies, major accident hazards and the national waste management plan).',
    // For the City of London, the rest of the development plan is the London Plan, so its
    // statement of general conformity is part of the evidence here (see app/data/sds-conformity.js).
    statement: { text: 'Statement of general conformity with the London Plan', href: SDS_STATEMENT_HREF }
  },
  {
    ref: 'Regulation 32(j)',
    title: 'Examination submission documents prepared',
    description: 'The authority has prepared the documents regulation 34(1)(a) and (c) to (i) prescribe for submission to independent examination: the policies map, the consultation and engagement statement, the summary of consultation on the proposed plan, any representations on general conformity with the spatial development strategy, the statements of compliance and soundness, and the environmental report or the reasons none was needed.'
  },
  {
    ref: 'Regulation 32(k)',
    title: 'Policies map shows where policies apply',
    description: 'The authority’s map of proposed local plan policies accurately illustrates where the policies that apply to part of its area apply.'
  },
  {
    ref: 'Regulation 32(l)',
    title: 'Ready for independent examination',
    description: 'The authority is ready to proceed to independent examination of its proposed local plan.'
  }
]

// history is each requirement's full, eventual audit trail (shown as-is for the "completed"
// variant). draftEntryCount is how many of those entries have happened yet in the "draft"
// snapshot — 0 entries means "Not yet met", some-but-not-all means "Partially met", all of
// them means "Fully met" (see getStatus). plannedActivity is shown only on the draft variant,
// for whatever hasn't happened yet. An entry's optional `href` takes its document link to a
// real page instead of the placeholder document viewer.
const REQUIREMENT_DATA = {
  'Regulation 32(a)': {
    history: [
      { type: 'Strategic policies drafted', description: 'Strategic policies drafted, setting the amount, type and location of development, with housing and office floorspace trajectories for the plan period.', date: '20 August 2026', actor: 'Femi Okonkwo', status: 'Done', document: 'Proposed local plan' },
      { type: 'Trajectories updated', description: 'Housing and office floorspace trajectories updated after the consultation on proposed content and evidence.', date: '3 November 2026', actor: 'Femi Okonkwo', status: 'Done' },
      { type: 'Confirmed for Gateway 3', description: 'Policies checked against section 15C(3) of the Act and recorded in the Gateway 3 completion statement.', date: '2 March 2027', actor: 'Pauline Perrot', status: 'Done', document: 'Gateway 3 completion statement' }
    ],
    draftEntryCount: 2,
    plannedActivity: 'Confirm the policies against section 15C(3) in the Gateway 3 completion statement, planned for March 2027.'
  },
  'Regulation 32(b)': {
    history: [
      { type: 'Vision agreed', description: 'Vision for the City in 2040 agreed by the Local Plans Sub-Committee.', date: '9 July 2026', actor: 'Pauline Perrot', status: 'Done', document: 'Vision and measurable outcomes' },
      { type: 'Outcomes set', description: 'Eight measurable outcomes set to monitor progress towards the vision, within the limit of ten.', date: '22 September 2026', actor: 'Daniel Osei', status: 'Done' },
      { type: 'Superseded policies listed', description: 'Schedule of the existing local plan policies the new plan supersedes added to the proposed plan.', date: '30 November 2026', actor: 'Alys Whitfield', status: 'Done', document: 'Schedule of superseded policies' }
    ],
    draftEntryCount: 2,
    plannedActivity: 'Add the schedule of superseded policies to the proposed plan, planned for 30 November 2026.'
  },
  'Regulation 32(c)': {
    history: [
      { type: 'Climate policies drafted', description: 'Policies on sustainable design and whole life-cycle carbon, climate resilience and flood risk, and the circular economy drafted.', date: '30 July 2026', actor: 'Femi Okonkwo', status: 'Done' },
      { type: 'Climate assessment published', description: 'Assessment of how the plan contributes to the mitigation of, and adaptation to, climate change published with the evidence base.', date: '14 October 2026', actor: 'Femi Okonkwo', status: 'Done', document: 'Climate change mitigation and adaptation assessment' }
    ],
    draftEntryCount: 2,
    plannedActivity: null
  },
  'Regulation 32(d)': {
    history: [
      { type: 'Strategy reviewed', description: 'The London local nature recovery strategy reviewed for its priorities and the potential measures it maps in the City.', date: '18 August 2026', actor: 'Alys Whitfield', status: 'Done' },
      { type: 'Topic paper published', description: 'Topic paper published showing how the open space, urban greening, biodiversity and tree policies take account of the strategy.', date: '30 November 2026', actor: 'Alys Whitfield', status: 'Done', document: 'Local nature recovery strategy topic paper' }
    ],
    draftEntryCount: 1,
    plannedActivity: 'Publish the topic paper showing how the plan takes account of the local nature recovery strategy, planned for 30 November 2026.'
  },
  'Regulation 32(e)': {
    history: [
      { type: 'Housing need assessed', description: 'Strategic Housing Market Assessment published, setting out the amount and type of housing needed, including affordable housing.', date: 'September 2023', actor: 'Femi Okonkwo', status: 'Done', document: 'Strategic Housing Market Assessment' },
      { type: 'Housing policies drafted', description: 'Housing policies drafted to take account of the assessed need and to meet the London Plan target of 1,460 homes.', date: '20 August 2026', actor: 'Femi Okonkwo', status: 'Done' }
    ],
    draftEntryCount: 2,
    plannedActivity: null
  },
  'Regulation 32(f)': {
    history: [
      { type: 'Content reviewed', description: 'Proposed plan reviewed against what section 15C of the Act and regulation 11 permit, and matters already covered by national development management policies removed.', date: '4 November 2026', actor: 'Daniel Osei', status: 'Done' },
      { type: 'Legal review completed', description: 'Legal review confirming that everything in the proposed plan is permitted or required.', date: '8 January 2027', actor: 'Daniel Osei', status: 'Done', document: 'Legal review of plan content' }
    ],
    draftEntryCount: 1,
    plannedActivity: 'Complete the legal review of the proposed plan’s content, planned for January 2027.'
  },
  'Regulation 32(g)': {
    history: [
      { type: 'Gateway 2 advice sought', description: 'Observations and advice sought from the appointed person at gateway 2 (regulation 26).', date: '17 November 2026', actor: 'Pauline Perrot', status: 'Done' },
      { type: 'Gateway 3 assessment requested', description: 'Gateway 3 prescribed requirements assessment requested from the appointed person (regulation 31).', date: '2 March 2027', actor: 'Pauline Perrot', status: 'Done' }
    ],
    draftEntryCount: 1,
    plannedActivity: 'Request the Gateway 3 prescribed requirements assessment, planned for March 2027.'
  },
  'Regulation 32(h)': {
    history: [
      { type: 'Gateway 2 advice received', description: 'Appointed person’s observations and advice on the proposed plan received and reported to committee.', date: '15 December 2026', actor: 'Pauline Perrot', status: 'Done' },
      { type: 'Gateway 2 advice published', description: 'Gateway 2 observations and advice published on the City Corporation’s website.', date: '22 December 2026', actor: 'Pauline Perrot', status: 'Done', document: 'Gateway 2 observations and advice' }
    ],
    draftEntryCount: 0,
    plannedActivity: 'Publish the appointed person’s Gateway 2 observations and advice as soon as they are received, expected December 2026.'
  },
  'Regulation 32(i)': {
    history: [
      { type: 'Self-assessment taken into account', description: 'Gateway 1 self-assessment summary taken into account in setting the scope of the plan (regulation 14(a)).', date: '28 July 2026', actor: 'Pauline Perrot', status: 'Done', document: 'Gateway 1 self-assessment summary' },
      { type: 'Consultation responses taken into account', description: 'Responses to the consultation on proposed content and evidence considered, and a summary published of how they were taken into account.', date: '27 October 2026', actor: 'Jomo Adeyemi', status: 'Done', document: 'Summary of consultation on proposed content and evidence' },
      { type: 'National policy and other matters checked', description: 'Proposed plan checked against national development management policies, the City’s Transport Strategy, major accident hazards and the national waste management plan.', date: '5 November 2026', actor: 'Daniel Osei', status: 'Done' },
      { type: 'London Plan conformity checked', description: 'Every London Plan policy checked against the proposed plan, as part of the development plan for the City.', date: '12 January 2027', actor: 'Daniel Osei', status: 'Done', document: 'Statement of general conformity with the London Plan', href: SDS_STATEMENT_HREF }
    ],
    draftEntryCount: 3,
    plannedActivity: 'Complete the statement of general conformity with the London Plan, planned for January 2027.'
  },
  'Regulation 32(j)': {
    history: [
      { type: 'Environmental report prepared', description: 'Environmental report prepared under the Environmental Assessment of Plans and Programmes Regulations 2004.', date: '3 November 2026', actor: 'Alys Whitfield', status: 'Done', document: 'Environmental report' },
      { type: 'Consultation statement prepared', description: 'Statement summarising the consultation and engagement carried out in preparing the plan, with the summary of consultation on the proposed plan.', date: '9 March 2027', actor: 'Jomo Adeyemi', status: 'Done', document: 'Consultation and engagement statement' },
      { type: 'Statements of compliance and soundness prepared', description: 'Statement of compliance and statement of soundness prepared for submission.', date: '16 March 2027', actor: 'Pauline Perrot', status: 'Done', document: 'Statement of soundness' }
    ],
    draftEntryCount: 1,
    plannedActivity: 'Prepare the consultation and engagement statement and the statements of compliance and soundness once consultation on the proposed plan closes, planned for March 2027.'
  },
  'Regulation 32(k)': {
    history: [
      { type: 'Map drafted', description: 'Draft policies map prepared, covering the majority of the policies that apply to part of the City.', date: '3 November 2026', actor: 'Alys Whitfield', status: 'Done' },
      { type: 'Map checked and finalised', description: 'Policies map checked against every policy that applies to part of the City and finalised for the proposed plan.', date: '24 November 2026', actor: 'Alys Whitfield', status: 'Done', document: 'Policies map' }
    ],
    draftEntryCount: 1,
    plannedActivity: 'Check the policies map against every area-based policy and finalise it, planned for 24 November 2026.'
  },
  'Regulation 32(l)': {
    history: [
      { type: 'Gateway 3 completion statement prepared', description: 'Gateway 3 completion statement prepared, confirming the plan is ready for examination.', date: '2 March 2027', actor: 'Pauline Perrot', status: 'Done', document: 'Gateway 3 completion statement' },
      { type: 'Approved for submission', description: 'Court of Common Council approved the proposed plan for submission for independent examination.', date: '18 March 2027', actor: 'Marta Nowak', status: 'Done' }
    ],
    draftEntryCount: 0,
    plannedActivity: 'Prepare the Gateway 3 completion statement and seek approval to submit the plan for examination, planned for March 2027.'
  }
}

// The plan's main procedural milestones, which the statement no longer lists but Gateway 2
// progress check's plan timeline is built from (getPlanTimeline). Regulation numbers are the
// 2026 Regulations' own; everything else is invented, as above.
const PROCESS_HISTORY = {
  'Regulation 19': [
    { type: 'Notice prepared', description: 'Notice of intention to commence local plan preparation drafted and approved by committee.', date: '28 April 2026', actor: 'Pauline Perrot', status: 'Done' },
    { type: 'Notice published', description: 'Notice of intention published on the council website and in the local press.', date: '5 May 2026', actor: 'Pauline Perrot', status: 'Done', document: 'Notice of intention to commence local plan preparation' }
  ],
  'Regulation 20': [
    { type: 'Consultation launched', description: 'Scoping consultation opened, inviting views from prescribed bodies and the public on the scope of the new plan.', date: '2 June 2026', actor: 'Jomo Adeyemi', status: 'Done', document: 'Scoping consultation document' },
    { type: 'Consultation closed', description: 'Scoping consultation closed after six weeks.', date: '14 July 2026', actor: 'Jomo Adeyemi', status: 'Done' }
  ],
  'Regulation 21': [
    { type: 'Self-assessment completed', description: 'Gateway 1 self-assessment of readiness completed, covering resourcing, evidence and governance.', date: '24 July 2026', actor: 'Pauline Perrot', status: 'Done' },
    { type: 'Self-assessment published', description: 'Gateway 1 self-assessment published alongside the committee report.', date: '28 July 2026', actor: 'Pauline Perrot', status: 'Done', document: 'Gateway 1 self-assessment of readiness' }
  ],
  'Regulation 23': [
    { type: 'Consultation launched', description: 'Consultation opened on the proposed content of the local plan and its supporting evidence.', date: '1 September 2026', actor: 'Femi Okonkwo', status: 'Done', document: 'Proposed local plan content and evidence consultation document' },
    { type: 'Consultation closed', description: 'Consultation on proposed content and evidence closed after six weeks.', date: '13 October 2026', actor: 'Femi Okonkwo', status: 'Done' }
  ],
  'Regulation 26': [
    { type: 'Submitted for Gateway 2', description: 'Proposed local plan submitted for Gateway 2 review by an appointed person.', date: '17 November 2026', actor: 'Pauline Perrot', status: 'Done' }
  ]
}

function getRequirements () {
  return REQUIREMENTS
}

function getRequirement (ref) {
  return REQUIREMENTS.find(requirement => requirement.ref === ref) || null
}

function getStatus (ref, variant) {
  if (variant === 'completed') return 'Fully met'

  const data = REQUIREMENT_DATA[ref]
  if (!data || data.draftEntryCount === 0) return 'Not yet met'
  if (data.draftEntryCount < data.history.length) return 'Partially met'
  return 'Fully met'
}

// Hrefs are pre-encoded here rather than in the template, same reason as elsewhere in this
// project (POLICY_AREA_LINKS, Gateway 2's evidence links) — a document's title can contain
// spaces and punctuation that need encoding for the URL.
function withDocumentHref (entry) {
  return Object.assign({}, entry, {
    documentHref: entry.document ? (entry.href || '/plan/make/gateway-preparation/statement-of-compliance/documents/' + encodeURIComponent(entry.document)) : null
  })
}

function getHistory (ref, variant) {
  const data = REQUIREMENT_DATA[ref]
  if (!data) return []

  const entries = variant === 'completed' ? data.history : data.history.slice(0, data.draftEntryCount)
  return entries.map(withDocumentHref)
}

function getPlannedActivity (ref, variant) {
  if (variant !== 'draft') return null

  const data = REQUIREMENT_DATA[ref]
  return data ? data.plannedActivity : null
}

function processEntry (ref, index) {
  return withDocumentHref(PROCESS_HISTORY[ref][index])
}

// A high-level, plan-wide timeline for Gateway 2 progress check's Plan Progress page — the
// gateways, consultations and giving of notice, one milestone each. Always reflects the "now"
// state: Gateway 2 itself has no status, since its own review is still in progress, and the
// Regulation 27 consultation has no status or actor, since it hasn't happened yet — both render
// with a hollow marker.
function getPlanTimeline () {
  const notice = processEntry('Regulation 19', 1)
  const scopingOpen = processEntry('Regulation 20', 0)
  const scopingClose = processEntry('Regulation 20', 1)
  const gateway1 = processEntry('Regulation 21', 1)
  const contentOpen = processEntry('Regulation 23', 0)
  const contentClose = processEntry('Regulation 23', 1)
  const gateway2Submitted = processEntry('Regulation 26', 0)

  return [
    {
      type: 'Notice of intention given',
      description: 'Notice of intention to commence local plan preparation published (Regulation 19).',
      date: notice.date,
      actor: notice.actor,
      status: 'Done',
      document: notice.document,
      documentHref: notice.documentHref
    },
    {
      type: 'Scoping consultation',
      description: 'Consulted prescribed bodies and the public on the scope of the new plan (Regulation 20).',
      date: scopingOpen.date + ' to ' + scopingClose.date,
      actor: scopingOpen.actor,
      status: 'Done',
      document: scopingOpen.document,
      documentHref: scopingOpen.documentHref
    },
    {
      type: 'Gateway 1',
      description: 'Self-assessment of readiness to begin preparing the local plan completed and published (Regulation 21).',
      date: gateway1.date,
      actor: gateway1.actor,
      status: 'Done',
      document: gateway1.document,
      documentHref: gateway1.documentHref
    },
    {
      type: 'Consultation on proposed content and evidence',
      description: 'Consulted on the proposed content of the local plan and its supporting evidence (Regulation 23).',
      date: contentOpen.date + ' to ' + contentClose.date,
      actor: contentOpen.actor,
      status: 'Done',
      document: contentOpen.document,
      documentHref: contentOpen.documentHref
    },
    {
      type: 'Gateway 2',
      description: 'Submitted for Gateway 2 review by an appointed person; observations and advice awaited (Regulation 26).',
      date: gateway2Submitted.date,
      actor: gateway2Submitted.actor
    },
    {
      type: 'Consultation on the proposed local plan',
      description: 'Consultation on the full proposed local plan, incorporating Gateway 2 advice, once observations are addressed (Regulation 27).',
      date: 'Planned for January 2027',
      actor: 'Policy team'
    }
  ]
}

// Every document referenced in the requirements' or the process milestones' history,
// regardless of variant — used to validate the document viewer route rather than rendering a
// page for any arbitrary title typed into the URL. Documents with a real page of their own
// (`href`) are left out.
const DOCUMENT_TITLES = Array.from(new Set(
  Object.values(REQUIREMENT_DATA).flatMap(data => data.history)
    .concat(Object.values(PROCESS_HISTORY).flat())
    .filter(entry => entry.document && !entry.href)
    .map(entry => entry.document)
))

function isKnownDocument (title) {
  return DOCUMENT_TITLES.includes(title)
}

module.exports = {
  REGULATION_URL,
  REQUIREMENTS,
  DOCUMENT_TITLES,
  getRequirements,
  getRequirement,
  getStatus,
  getHistory,
  getPlannedActivity,
  getPlanTimeline,
  isKnownDocument
}
