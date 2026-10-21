// Static reference content for the Make your plan prototype (/project-management/make-your-plan).
// Everything the user changes lives in session data instead, as `projectManagement`, seeded in
// session-data-defaults.js from startingState() below.
//
// The plan-event codes and the timetable's field names follow the frames' "Local plan timetable
// data format" preview. They are written for the prototype in the style of planning.data.gov.uk's
// datasets, not copied from a published specification.

const PLAN_REFERENCE = 'LP-COL-2027'

// The person the prototype is seen as, and the people shown against each task on the overview.
const OFFICER = { name: 'Danny Dyer', initials: 'DD' }

const TEAM = {
  dd: { name: 'Danny Dyer', initials: 'DD' },
  sm: { name: 'Sarah Mitchell', initials: 'SM' },
  jo: { name: 'James Okafor', initials: 'JO' },
  rk: { name: 'Rachel Kemp', initials: 'RK' }
}

// The events in a local plan timetable under the new plan-making system, in order. `stage`
// groups start and end dates into one block on the published timetable (see
// buildPublishedTimetable in app/routes.js). Consultation names are the new system's, never
// "Regulation 18/19" — see CLAUDE.md.
const EVENT_TYPES = [
  { code: 'publish-notice-intention-commence', label: 'Publish notice of intention to commence', stage: 'notice' },
  { code: 'scoping-consultation-start', label: 'Scoping consultation start', stage: 'scoping', part: 'start' },
  { code: 'scoping-consultation-end', label: 'Scoping consultation end', stage: 'scoping', part: 'end' },
  { code: 'gateway-1-self-assessment', label: 'Gateway 1 self-assessment', stage: 'gateway-1' },
  { code: 'plan-content-consultation-start', label: 'Plan content and evidence consultation start', stage: 'plan-content', part: 'start' },
  { code: 'plan-content-consultation-end', label: 'Plan content and evidence consultation end', stage: 'plan-content', part: 'end' },
  { code: 'gateway-2-advice-sought', label: 'Gateway 2 advice sought', stage: 'gateway-2' },
  { code: 'proposed-plan-consultation-start', label: 'Proposed plan consultation start', stage: 'proposed-plan', part: 'start' },
  { code: 'proposed-plan-consultation-end', label: 'Proposed plan consultation end', stage: 'proposed-plan', part: 'end' },
  { code: 'gateway-3-advice-sought', label: 'Gateway 3 advice sought', stage: 'gateway-3' },
  { code: 'examination-submitted', label: 'Examination submitted', stage: 'examination' },
  { code: 'adopted', label: 'Adopted', stage: 'adopted' }
]

// How each stage reads on the authority's website (the "Website preview" frame). A stage with a
// start and an end shows the end as the date representations must be received by.
const PUBLISHED_STAGES = [
  { stage: 'notice', title: 'Notice of intention to commence Local Plan preparation published' },
  { stage: 'scoping', title: 'Scoping consultation', description: 'Consultation on the scope of the Local Plan for a minimum of 21 days' },
  { stage: 'gateway-1', title: 'Gateway 1', description: 'Self-assessment summary published' },
  { stage: 'plan-content', title: 'Consultation on proposed plan content and evidence', description: 'Consultation on plan content and evidence for a minimum of six weeks' },
  { stage: 'gateway-2', title: 'Gateway 2', description: 'Gateway two advice sought from the Planning Inspectorate' },
  { stage: 'proposed-plan', title: 'Consultation on the proposed local plan', description: 'Consultation on the proposed Local Plan for a minimum of eight weeks' },
  { stage: 'gateway-3', title: 'Gateway 3', description: 'Gateway three advice sought from the Planning Inspectorate' },
  { stage: 'examination', title: 'Examination submitted', description: 'Plan submitted for independent examination' },
  { stage: 'adopted', title: 'Adopted', description: 'Local Plan formally adopted by the Council' }
]

function getEventType (code) {
  return EVENT_TYPES.find(type => type.code === code)
}

// The committee calendar milestones can be scheduled against. Invented dates, on the City's
// real committee names.
const COMMITTEES = [
  { id: 'pt-2026-11', name: 'Planning and Transportation Committee', date: '2026-11-17' },
  { id: 'fin-2026-11', name: 'Finance Committee', date: '2026-11-24' },
  { id: 'pt-2026-12', name: 'Planning and Transportation Committee', date: '2026-12-15' },
  { id: 'fin-2027-01', name: 'Finance Committee', date: '2027-01-19' },
  { id: 'pt-2027-01', name: 'Planning and Transportation Committee', date: '2027-01-26' },
  { id: 'fin-2027-02', name: 'Finance Committee', date: '2027-02-23' }
]

const COMMITTEE_DATES_URL = 'https://democracy.cityoflondon.gov.uk/'
const GUIDANCE_URL = 'https://www.gov.uk/guidance/plan-making'
const GUIDANCE_SEARCH_URL = 'https://www.gov.uk/search/all'
const CHECK_AND_PROVIDE_URL = 'https://check.planning.data.gov.uk/'

const ROLE_OF_PLAN = 'As a local planning authority (LPA), we have a statutory duty under both the Planning and Compulsory Purchase Act 2004 and amendments made by the Levelling Up and Regeneration Act 2023 to prepare and adopt a Local Plan. Our Local Plan establishes how land within our area will be used and developed, setting out priorities for housing, employment, infrastructure, design, and environmental standards. In planning for housing, the government\'s Standard Method provides the initial benchmark for determining local housing need. Importantly, our policies must contribute to climate change mitigation and adaptation, avoid inconsistency with national development management policies, and align generally with any operative spatial development strategy relevant to our area. The Act empowers the Secretary of State to specify matters our plan must or may address. Once adopted, our Local Plan will serve as the principal basis for making planning decisions, directly shaping the future growth, development, and sustainability of our communities.'

const DEFAULT_STATEMENT = 'In accordance with the Town and Country Planning (Local Planning) (England) Regulations 2026, this timetable is formally to have effect from 1 February 2027. Once in effect, our local planning authority must comply with this schedule.'

const BUDGET_CATEGORIES = [
  { key: 'staff', label: 'Staff costs' },
  { key: 'evidence', label: 'Evidence and consultancy costs' },
  { key: 'engagement', label: 'Engagement and consultancy' },
  { key: 'examination', label: 'Examination - PINS costs and programme officer' }
]
const BUDGET_YEARS = [1, 2, 3, 4]

const LEVELS = ['Low', 'Medium', 'High']

// Who signs the PID off. The political lead and sponsor come from the Governance section; the
// chief executive has nowhere to be entered in the design, so is fixed here.
const CHIEF_EXECUTIVE = 'Helen Marsh'

// --- Seed states ---------------------------------------------------------------------------

function milestone (code, eventDate, entryDate) {
  return {
    id: code,
    reference: 'LP1-' + code,
    plan: PLAN_REFERENCE,
    event: code,
    eventDate: eventDate || '',
    actualDate: '',
    entryDate: entryDate || '',
    notes: ''
  }
}

// Things to take to committee, on the Schedule milestones for committee screen.
function committeeItems () {
  return [
    { id: 'pid-sign-off', title: 'PID and budget sign off', description: 'Approval of the Project Initiation Documentation and the plan-making budget before the notice of intention is published.', committee: '' },
    { id: 'gateway-1-draft', title: 'Gateway 1 draft', description: 'Self-assessment summary published', committee: '' },
    { id: 'gateway-2-draft', title: 'Gateway 2 draft', description: 'Gateway two advice sought from the Planning Inspectorate', committee: '' }
  ]
}

function emptyPid () {
  return {
    planTitle: '',
    lastUpdated: '',
    roleOfPlan: ROLE_OF_PLAN,
    governanceSummary: '',
    councilLeadName: '',
    councilLeadEmail: '',
    sponsorName: '',
    sponsorEmail: '',
    seniorEngagement: '',
    staff: [],
    teamLead: '',
    supportNeeds: '',
    related: [],
    engagementApproach: '',
    budget: {},
    budgetReviews: [],
    risks: [],
    // Sections that are lists (staff, related documents, risks) are only finished when they are
    // saved, since "none" can be a real answer for related documents.
    saved: {},
    approval: { sent: '', approved: '' }
  }
}

// Nothing done yet: the "empty state" frame.
function startingState () {
  return {
    milestones: EVENT_TYPES.map(type => milestone(type.code)),
    committeeItems: committeeItems(),
    timetable: { statement: DEFAULT_STATEMENT, statementSaved: false, published: '' },
    notice: { area: '', timetableLink: '', addresses: '', updates: '', published: '' },
    pid: emptyPid(),
    // Scoping activities: the policy starting points wizard's items, keyed by step slug, and the
    // GIS connection its "Add existing plan layers" step brings layers in through.
    startingPoints: {},
    gisConnection: null,
    scopingConsultationStarted: false
  }
}

// Part-way through: the "completed state" frame. The timetable is published, the PID is half
// written, the scoping consultation is under way, and the notice is waiting on the PID's approval.
function midwayState () {
  const state = startingState()
  const dates = {
    'publish-notice-intention-commence': '2027-02-01',
    'scoping-consultation-start': '2027-03-01',
    'scoping-consultation-end': '2027-04-12',
    'gateway-1-self-assessment': '2027-07-30',
    'plan-content-consultation-start': '2027-09-06',
    'plan-content-consultation-end': '2027-10-18',
    'gateway-2-advice-sought': '2028-03-01',
    'proposed-plan-consultation-start': '2028-05-08',
    'proposed-plan-consultation-end': '2028-07-03'
  }
  state.milestones.forEach(item => {
    if (dates[item.event]) {
      item.eventDate = dates[item.event]
      item.entryDate = '2026-09-21'
    }
  })
  state.committeeItems[0].committee = 'pt-2026-11'
  state.timetable.statementSaved = true
  state.timetable.published = '2026-09-28'
  state.scopingConsultationStarted = true
  Object.assign(state.pid, {
    planTitle: 'City Plan 2040 review',
    lastUpdated: '2026-10-06',
    governanceSummary: 'Each stage of the plan is agreed by the Planning and Transportation Committee before it goes to the Court of Common Council. Officers report progress to the Local Plans Sub-Committee every quarter.',
    councilLeadName: 'Councillor Jo Bennett',
    councilLeadEmail: 'jo.bennett@cityoflondon.example',
    sponsorName: 'Sarah Mitchell',
    sponsorEmail: 'sarah.mitchell@cityoflondon.example',
    seniorEngagement: 'Monthly briefing for the Executive Director of Environment, and a standing item at the Chief Officers\' group before each committee report.',
    staff: [
      { id: 's1', jobTitle: 'Planning Policy Lead', name: 'Sarah Mitchell', fte: '1', postStatus: 'Filled', timeOnPlan: '80' },
      { id: 's2', jobTitle: 'Principal Planning Officer', name: 'Danny Dyer', fte: '1', postStatus: 'Filled', timeOnPlan: '100' },
      { id: 's3', jobTitle: 'Senior Planning Officer (evidence)', name: '', fte: '1', postStatus: 'Vacant', timeOnPlan: '100' }
    ],
    teamLead: 's1',
    saved: { staff: true }
  })
  return state
}

module.exports = {
  PLAN_REFERENCE,
  OFFICER,
  TEAM,
  EVENT_TYPES,
  PUBLISHED_STAGES,
  getEventType,
  COMMITTEES,
  COMMITTEE_DATES_URL,
  GUIDANCE_URL,
  GUIDANCE_SEARCH_URL,
  CHECK_AND_PROVIDE_URL,
  ROLE_OF_PLAN,
  BUDGET_CATEGORIES,
  BUDGET_YEARS,
  LEVELS,
  CHIEF_EXECUTIVE,
  milestone,
  startingState,
  midwayState
}
