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

const { POLICIES } = require('./policies.js')

const REGULATION_URL = 'https://www.legislation.gov.uk/uksi/2026/186/regulation/32/made'

const SDS_STATEMENT_HREF = '/plan/make/gateway-preparation/statement-of-compliance/spatial-development-strategy'
const POLICIES_HREF = '/plan/make/gateway-preparation/statement-of-compliance/policies'
// Every timetable link in the prototypes goes to the timetable's placeholder while its flow is
// rebuilt (see CLAUDE.md, Getting ready).
const TIMETABLE_HREF = '/plan/manage/getting-ready/timetable-placeholder'

const SOC_BASE = '/plan/make/gateway-preparation/statement-of-compliance'

// Pages elsewhere in the prototypes that a requirement is met by. Anything with no page of its
// own opens in the statement's placeholder document viewer (documentHref).
const PLACES = {
  gateway2: '/plan/view/gateway-2-progress-check',
  gateway1Summary: '/plan/manage/versions/documents/gateway-1',
  consultationResponses: '/plan/consultation/managing-responses',
  consultationStatement: '/plan/manage/versions/examination-library/items/lp-05',
  londonPlanAlignment: '/plan/make/london-plan-alignment',
  shma: '/plan/sources/review?source=' + encodeURIComponent('Strategic Housing Market Assessment'),
  lnrs: '/plan/sources/review?source=' + encodeURIComponent('Local nature recovery strategy'),
  policyMap: '/plan/manage/versions/documents/policy-map',
  policyLayers: '/plan/sources/gis-layers',
  environmentalReport: '/plan/manage/versions/documents/sea',
  examinationLibrary: '/plan/manage/versions/examination-library',
  nppf: require('./policy-drafting.js').NPPF_URL
}

function policyHref (ref) {
  return POLICIES_HREF + '#policy-' + ref
}

function documentHref (title) {
  return SOC_BASE + '/documents/' + encodeURIComponent(title)
}

// The City Plan 2040 policies that set the amount, type, location or timing of development,
// which regulation 32(a) is about. Marked on the policies page.
const DEVELOPMENT_POLICY_REFS = ['S3', 'HS1', 'S4', 'OF1', 'OF2', 'S5', 'RE1', 'CV4', 'S12']

// --- Where each requirement is met ---------------------------------------------------------
//
// Each requirement's page has a table: one row per part of the requirement, each with any number
// of links to where it is met. Officers add and remove links on the page, so the rows' links are
// session data (getSocLinks in routes.js), seeded from LINK_ROWS below. A link is stored as a key
// and resolved here, so its text and address are never copied into the session:
//   policy:<ref>       a policy on Policies in the proposed plan
//   page:<id>          a page elsewhere in the prototypes (LINK_PAGES)
//   document:<title>   a document with no page, shown in the placeholder document viewer
const LINK_PAGES = {
  allPolicies: { text: 'View all policies', href: POLICIES_HREF },
  timetable: { text: 'View the timetable', href: TIMETABLE_HREF },
  shma: { text: 'View the Strategic Housing Market Assessment', href: PLACES.shma },
  lnrs: { text: 'View the Local nature recovery strategy', href: PLACES.lnrs },
  gateway2: { text: 'View the Gateway 2 progress check', href: PLACES.gateway2 },
  gateway1Summary: { text: 'View the Gateway 1 self-assessment summary', href: PLACES.gateway1Summary },
  consultationResponses: { text: 'View consultation responses', href: PLACES.consultationResponses },
  consultationStatement: { text: 'View the consultation statement', href: PLACES.consultationStatement },
  londonPlanAlignment: { text: 'View alignment with London Plan', href: PLACES.londonPlanAlignment },
  sds: { text: 'View the Greater London Authority’s responses', href: SDS_STATEMENT_HREF },
  nppf: { text: 'View the National Planning Policy Framework', href: PLACES.nppf, newTab: true },
  policyMap: { text: 'View the policy map', href: PLACES.policyMap },
  policyLayers: { text: 'View the policy layers', href: PLACES.policyLayers },
  environmentalReport: { text: 'View the strategic environmental assessment', href: PLACES.environmentalReport },
  examinationLibrary: { text: 'View the examination library', href: PLACES.examinationLibrary },
  statementOfCompliance: { text: 'View the statement of compliance', href: SOC_BASE }
}

const LINK_ROWS = {
  'Regulation 32(a)': [
    { id: 'policies', requirement: 'Policies on the amount, type and location of development', links: ['page:allPolicies'] },
    { id: 'timetable', requirement: 'Timetable for development', links: ['page:timetable'] }
  ],
  'Regulation 32(b)': [
    { id: 'vision', requirement: 'A vision for how the area will change over the plan period', links: ['document:Vision and measurable outcomes'] },
    { id: 'outcomes', requirement: 'No more than ten measurable outcomes', links: ['document:Vision and measurable outcomes'] },
    { id: 'superseded', requirement: 'Policies the plan supersedes (regulation 11(4))', links: ['document:Schedule of superseded policies'] }
  ],
  'Regulation 32(c)': [
    { id: 'mitigation', requirement: 'Mitigation of climate change', links: ['policy:DE1', 'policy:S16', 'policy:CE1'] },
    { id: 'adaptation', requirement: 'Adaptation to climate change', links: ['policy:S15', 'policy:CR1', 'policy:CR2', 'policy:CR3'] },
    { id: 'assessment', requirement: 'Assessment of the plan’s contribution', links: ['document:Climate change mitigation and adaptation assessment'] }
  ],
  'Regulation 32(d)': [
    { id: 'strategy', requirement: 'Taking account of the local nature recovery strategy', links: ['page:lnrs'] },
    { id: 'policies', requirement: 'Policies on nature recovery', links: ['policy:S14', 'policy:OS2', 'policy:OS3', 'policy:OS4', 'policy:OS5'] }
  ],
  'Regulation 32(e)': [
    { id: 'assessment', requirement: 'Assessment of the amount and type of housing needed, including affordable housing', links: ['page:shma'] },
    { id: 'policies', requirement: 'Policies that take account of it', links: ['policy:S3', 'policy:HS1'] }
  ],
  'Regulation 32(f)': [
    { id: 'content', requirement: 'The plan’s content', links: ['page:allPolicies'] },
    { id: 'review', requirement: 'Review of what the plan may contain', links: ['document:Legal review of plan content'] }
  ],
  'Regulation 32(g)': [
    { id: 'gateway-2', requirement: 'Gateway 2 (regulation 26)', links: ['page:gateway2'] },
    { id: 'gateway-3', requirement: 'Gateway 3 prescribed requirements assessment (regulation 31)', links: ['document:Gateway 3 completion statement'] }
  ],
  'Regulation 32(h)': [
    { id: 'published', requirement: 'Gateway 2 observations and advice, published', links: ['document:Gateway 2 observations and advice'] }
  ],
  'Regulation 32(i)': [
    { id: 'advice', requirement: 'Gateway observations and advice (section 15CA(6)(a))', links: ['page:gateway2'] },
    { id: 'consultation', requirement: 'Consultation responses (section 15CA(6)(b))', links: ['page:consultationResponses'] },
    { id: 'national-policy', requirement: 'National policy (section 15CA(6)(c) and (d))', links: ['page:nppf'] },
    { id: 'development-plan', requirement: 'The rest of the development plan (section 15CA(6)(g))', links: ['page:sds'] },
    { id: 'self-assessment', requirement: 'The self-assessment summary (regulation 14(a))', links: ['page:gateway1Summary'] }
  ],
  'Regulation 32(j)': [
    { id: 'policy-map', requirement: 'Map of proposed local plan policies (34(1)(a))', links: ['page:policyMap'] },
    { id: 'consultation-statement', requirement: 'Consultation and engagement statement (34(1)(c))', links: ['page:consultationStatement'] },
    { id: 'consultation-summary', requirement: 'Summary of consultation on the proposed plan (34(1)(d))', links: ['page:consultationResponses'] },
    { id: 'sds', requirement: 'Representations on general conformity with the spatial development strategy (34(1)(e))', links: ['page:sds'] },
    { id: 'statement-of-compliance', requirement: 'Statement of compliance (34(1)(f))', links: ['page:statementOfCompliance'] },
    { id: 'statement-of-soundness', requirement: 'Statement of soundness (34(1)(g))', links: ['document:Statement of soundness'] },
    { id: 'environmental-report', requirement: 'Environmental report (34(1)(h) and (i))', links: ['page:environmentalReport'] }
  ],
  'Regulation 32(k)': [
    { id: 'map', requirement: 'Map of proposed local plan policies', links: ['page:policyMap'] },
    { id: 'layers', requirement: 'Policies that apply to part of the area', links: ['page:policyLayers'] }
  ],
  'Regulation 32(l)': [
    { id: 'readiness', requirement: 'Readiness for independent examination', links: ['document:Gateway 3 completion statement'] },
    { id: 'submission', requirement: 'Submission for examination', links: ['page:examinationLibrary'] }
  ]
}

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
    description: 'The proposed local plan includes nothing that is not permitted or required by section 15C(3) to (5) or (10) of the Act or by regulation 11, in line with section 15C(9)(a) of the Act.',
    // A sign-off shown on the requirement's page: in the completed statement as given, in the
    // draft as still to come. Recorded in the audit log too, as the requirement's last entry.
    confirmation: {
      text: 'I confirm that the proposed local plan includes only content that section 15C(3) to (5) or (10) of the Act and regulation 11 permit or require.',
      name: 'Pauline Perrot',
      role: 'Plan making manager',
      date: '12 January 2027'
    }
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
    description: 'In preparing the proposed local plan, the authority has had regard to the matters in section 15CA(6) of the Act (including gateway advice, consultation responses, national policy and the rest of the development plan) and those in regulation 14 (including the self-assessment summary, local transport policies, major accident hazards and the national waste management plan).'
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
      { type: 'Strategic policies drafted', description: 'Strategic policies drafted, setting the amount, type and location of development: housing (S3), offices (S4), retail (S5) and tall buildings (S12).', date: '20 August 2026', actor: 'Femi Okonkwo', status: 'Done', document: 'View all policies', href: POLICIES_HREF },
      { type: 'Timetable published', description: 'Local Plan timetable published, setting out when each stage of the plan will take place.', date: '28 September 2026', actor: 'Danny Dyer', status: 'Done', document: 'View the timetable', href: TIMETABLE_HREF },
      { type: 'Policy S3 Housing updated', description: 'Housing trajectory in Policy S3 updated after the consultation on proposed content and evidence, phasing delivery over the plan period.', date: '3 November 2026', actor: 'Femi Okonkwo', status: 'Done', document: 'View Policy S3 Housing', href: POLICIES_HREF + '#policy-S3' },
      { type: 'Policy S4 Offices updated', description: 'Office floorspace target and trajectory in Policy S4 updated after the consultation on proposed content and evidence.', date: '3 November 2026', actor: 'Femi Okonkwo', status: 'Done', document: 'View Policy S4 Offices', href: POLICIES_HREF + '#policy-S4' },
      { type: 'Timetable updated', description: 'Local Plan timetable updated with the dates for Gateway 3 and submission for examination.', date: '19 January 2027', actor: 'Danny Dyer', status: 'Done', document: 'View the timetable', href: TIMETABLE_HREF },
      { type: 'Confirmed for Gateway 3', description: 'Policies and timetable checked against section 15C(3) of the Act and recorded in the Gateway 3 completion statement.', date: '2 March 2027', actor: 'Pauline Perrot', status: 'Done', document: 'Gateway 3 completion statement' }
    ],
    draftEntryCount: 4,
    plannedActivity: 'Update the timetable with the dates for Gateway 3 and submission, planned for January 2027, then confirm the policies and timetable against section 15C(3) in the Gateway 3 completion statement, planned for March 2027.'
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
      { type: 'Climate policies drafted', description: 'Policies on sustainable design and whole life-cycle carbon, climate resilience and flood risk, and the circular economy drafted.', date: '30 July 2026', actor: 'Femi Okonkwo', status: 'Done', document: 'View Policy S15 Climate Resilience and Flood Risk', href: policyHref('S15') },
      { type: 'Climate assessment published', description: 'Assessment of how the plan contributes to the mitigation of, and adaptation to, climate change published with the evidence base.', date: '14 October 2026', actor: 'Femi Okonkwo', status: 'Done', document: 'Climate change mitigation and adaptation assessment' }
    ],
    draftEntryCount: 2,
    plannedActivity: null
  },
  'Regulation 32(d)': {
    history: [
      { type: 'Strategy reviewed', description: 'The London local nature recovery strategy reviewed for its priorities and the potential measures it maps in the City.', date: '18 August 2026', actor: 'Alys Whitfield', status: 'Done' },
      { type: 'Strategy added to the evidence base', description: 'The local nature recovery strategy added to the evidence base, with how the open space, urban greening, biodiversity and tree policies take account of it.', date: '30 November 2026', actor: 'Alys Whitfield', status: 'Done', document: 'View the Local nature recovery strategy', href: PLACES.lnrs }
    ],
    draftEntryCount: 1,
    plannedActivity: 'Add the local nature recovery strategy to the evidence base, with how the plan takes account of it, planned for 30 November 2026.'
  },
  'Regulation 32(e)': {
    history: [
      { type: 'Housing need assessed', description: 'Strategic Housing Market Assessment published, setting out the amount and type of housing needed, including affordable housing.', date: 'September 2023', actor: 'Femi Okonkwo', status: 'Done', document: 'View the Strategic Housing Market Assessment', href: PLACES.shma },
      { type: 'Housing policies drafted', description: 'Housing policies drafted to take account of the assessed need and to meet the London Plan target of 1,460 homes.', date: '20 August 2026', actor: 'Femi Okonkwo', status: 'Done', document: 'View Policy S3 Housing', href: policyHref('S3') }
    ],
    draftEntryCount: 2,
    plannedActivity: null
  },
  'Regulation 32(f)': {
    history: [
      { type: 'Content reviewed', description: 'Proposed plan reviewed against what section 15C of the Act and regulation 11 permit, and matters already covered by national development management policies removed.', date: '4 November 2026', actor: 'Daniel Osei', status: 'Done', document: 'View all policies', href: POLICIES_HREF },
      { type: 'Legal review completed', description: 'Legal review confirming that everything in the proposed plan is permitted or required.', date: '8 January 2027', actor: 'Daniel Osei', status: 'Done', document: 'Legal review of plan content' },
      { type: 'Confirmed by the plan making manager', description: 'Plan making manager confirmed that the proposed local plan includes only content that section 15C(3) to (5) or (10) of the Act and regulation 11 permit or require.', date: '12 January 2027', actor: 'Pauline Perrot', status: 'Done' }
    ],
    draftEntryCount: 1,
    plannedActivity: 'Complete the legal review of the proposed plan’s content, then the plan making manager’s confirmation that it includes only allowable content, planned for January 2027.'
  },
  'Regulation 32(g)': {
    history: [
      { type: 'Gateway 2 advice sought', description: 'Observations and advice sought from the appointed person at gateway 2 (regulation 26).', date: '17 November 2026', actor: 'Pauline Perrot', status: 'Done', document: 'View the Gateway 2 progress check', href: PLACES.gateway2 },
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
      { type: 'Self-assessment taken into account', description: 'Gateway 1 self-assessment summary taken into account in setting the scope of the plan (regulation 14(a)).', date: '28 July 2026', actor: 'Pauline Perrot', status: 'Done', document: 'View the Gateway 1 self-assessment summary', href: PLACES.gateway1Summary },
      { type: 'Consultation responses taken into account', description: 'Responses to the consultation on proposed content and evidence considered, and a summary published of how they were taken into account.', date: '27 October 2026', actor: 'Jomo Adeyemi', status: 'Done', document: 'View consultation responses', href: PLACES.consultationResponses },
      { type: 'National policy and other matters checked', description: 'Proposed plan checked against national development management policies, the City’s Transport Strategy, major accident hazards and the national waste management plan.', date: '5 November 2026', actor: 'Daniel Osei', status: 'Done' },
      { type: 'London Plan taken into account', description: 'Proposed plan reviewed against the London Plan, as part of the development plan for the City.', date: '12 January 2027', actor: 'Daniel Osei', status: 'Done', document: 'View alignment with London Plan', href: PLACES.londonPlanAlignment }
    ],
    draftEntryCount: 3,
    plannedActivity: 'Complete the review of the proposed plan against the London Plan, planned for January 2027.'
  },
  'Regulation 32(j)': {
    history: [
      { type: 'Environmental report prepared', description: 'Environmental report prepared under the Environmental Assessment of Plans and Programmes Regulations 2004.', date: '3 November 2026', actor: 'Alys Whitfield', status: 'Done', document: 'View the strategic environmental assessment', href: PLACES.environmentalReport },
      { type: 'Consultation statement prepared', description: 'Statement summarising the consultation and engagement carried out in preparing the plan, with the summary of consultation on the proposed plan.', date: '9 March 2027', actor: 'Jomo Adeyemi', status: 'Done', document: 'View the consultation statement', href: PLACES.consultationStatement },
      { type: 'GLA representations compiled', description: 'The Greater London Authority’s representations on general conformity with the London Plan (regulation 28) compiled for submission.', date: '10 March 2027', actor: 'Daniel Osei', status: 'Done', document: 'View the Greater London Authority’s responses', href: SDS_STATEMENT_HREF },
      { type: 'Statements of compliance and soundness prepared', description: 'Statement of compliance and statement of soundness prepared for submission.', date: '16 March 2027', actor: 'Pauline Perrot', status: 'Done', document: 'Statement of soundness' }
    ],
    draftEntryCount: 1,
    plannedActivity: 'Prepare the consultation and engagement statement and the statements of compliance and soundness once consultation on the proposed plan closes, planned for March 2027.'
  },
  'Regulation 32(k)': {
    history: [
      { type: 'Map drafted', description: 'Draft policies map prepared, covering the majority of the policies that apply to part of the City.', date: '3 November 2026', actor: 'Alys Whitfield', status: 'Done' },
      { type: 'Map checked and finalised', description: 'Policies map checked against every policy that applies to part of the City and finalised for the proposed plan.', date: '24 November 2026', actor: 'Alys Whitfield', status: 'Done', document: 'View the policy map', href: PLACES.policyMap }
    ],
    draftEntryCount: 1,
    plannedActivity: 'Check the policies map against every area-based policy and finalise it, planned for 24 November 2026.'
  },
  'Regulation 32(l)': {
    history: [
      { type: 'Gateway 3 completion statement prepared', description: 'Gateway 3 completion statement prepared, confirming the plan is ready for examination.', date: '2 March 2027', actor: 'Pauline Perrot', status: 'Done', document: 'Gateway 3 completion statement' },
      { type: 'Approved for submission', description: 'Court of Common Council approved the proposed plan for submission for independent examination.', date: '18 March 2027', actor: 'Marta Nowak', status: 'Done', document: 'View the examination library', href: PLACES.examinationLibrary }
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
    documentHref: entry.document ? (entry.href || documentHref(entry.document)) : null
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
    .concat(Object.values(LINK_ROWS).flat().flatMap(row => row.links)
      .filter(key => key.startsWith('document:'))
      .map(key => key.slice('document:'.length)))
))

function isKnownDocument (title) {
  return DOCUMENT_TITLES.includes(title)
}

// A stored link key as { key, text, href, newTab }, or null if it no longer resolves.
function resolveLink (key) {
  const [kind, ...rest] = String(key).split(':')
  const value = rest.join(':')
  if (kind === 'policy') {
    const policy = POLICIES.find(candidate => candidate.ref === value)
    return policy ? { key, text: 'Policy ' + policy.ref + ' ' + policy.title, href: policyHref(policy.ref) } : null
  }
  if (kind === 'page' && LINK_PAGES[value]) return Object.assign({ key }, LINK_PAGES[value])
  if (kind === 'document' && DOCUMENT_TITLES.includes(value)) return { key, text: value, href: documentHref(value) }
  return null
}

function getLinkRows (ref) {
  return LINK_ROWS[ref] || []
}

// The seed for session data: { <requirement ref>: { <row id>: [link keys] } }.
function startingLinks () {
  const state = {}
  Object.keys(LINK_ROWS).forEach(ref => {
    state[ref] = {}
    LINK_ROWS[ref].forEach(row => { state[ref][row.id] = row.links.slice() })
  })
  return state
}

// Everything a link can be added to, grouped for the select's optgroups: pages and documents,
// then every policy by policy area in plan order.
function linkOptions () {
  const groups = [{
    label: 'Pages and documents',
    options: Object.keys(LINK_PAGES).map(id => ({ value: 'page:' + id, text: LINK_PAGES[id].text }))
      .concat(DOCUMENT_TITLES.map(title => ({ value: 'document:' + title, text: title })))
  }]
  POLICIES.forEach(policy => {
    let group = groups.find(candidate => candidate.label === policy.policyArea)
    if (!group) groups.push(group = { label: policy.policyArea, options: [] })
    group.options.push({ value: 'policy:' + policy.ref, text: 'Policy ' + policy.ref + ' ' + policy.title })
  })
  return groups
}

module.exports = {
  resolveLink,
  getLinkRows,
  startingLinks,
  linkOptions,
  REGULATION_URL,
  DEVELOPMENT_POLICY_REFS,
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
