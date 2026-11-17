// Static reference content for the Make your plan prototype (/plan/manage/getting-ready).
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

// --- Readiness checker -----------------------------------------------------------------------
//
// From the "Readiness checker for gateway 1" spreadsheet: each Area is a section, each Activity a
// check, and each check has a descriptor for three of the statuses (what that level of progress
// looks like). Wording as in the spreadsheet, with typos corrected. Statuses are set by hand.

const READINESS_STATUSES = ['Not started', 'Work started', 'Recommended progress', 'Not applicable']

// The status each descriptor describes.
const READINESS_LEVEL_KEYS = { 'Recommended progress': 'recommended', 'Work started': 'started', 'Not started': 'notStarted' }

function check (id, text, recommended, started, notStarted) {
  return { id, text, levels: { recommended, started, notStarted } }
}

const READINESS_SECTIONS = [
  {
    id: 'legal',
    title: 'Legal requirements you must have met before proceeding',
    checks: [
      check('legal-requirements', 'Preparing and publishing a timetable in line with the data standard, publishing a notice of intention to commence and undertaking the scoping consultation',
        'We have complied with these legal requirements.',
        '',
        'We have not met some or all of these legal requirements.')
    ]
  },
  {
    id: 'timetable',
    title: 'Preparing and publishing a local plan timetable',
    checks: [
      check('timetable-time', 'Considering the expected time it will take to adopt the plan',
        'The timetable shows how we will prepare and adopt a plan within 30 months.',
        'The timetable shows how we will prepare and adopt a plan within 30 months but there are significant risks to this.',
        'The timetable shows that preparing and adopting a plan will take substantially longer than 30 months.')
    ]
  },
  {
    id: 'governance',
    title: 'Establishing project management and governance arrangements',
    checks: [
      check('governance-approach', 'Establishing appropriate project management, governance and resourcing to support the timetable',
        'We have a robust approach to manage, govern, resource and finance the preparation of the plan that supports the delivery of the local plan timetable.',
        'We have considered our approach to manage, govern, resource and finance the preparation of the plan, but there are some gaps or an approach is not yet signed off.',
        'We have key unresolved questions for how we will manage, govern, resource or finance the preparation of the plan.'),
      check('governance-testing', 'Testing and agreeing project management and governance internally',
        'All relevant teams and decision makers have been involved in designing, and signing-off the approach.',
        'Relevant teams and decision makers have been involved in designing and testing our approach, but it is not yet signed off.',
        'We still need to involve other relevant teams and decision makers.'),
      check('governance-risk', 'Establishing risk monitoring, management and mitigation',
        'We have identified potential risks and have effective processes in place to monitor, manage and mitigate them.',
        'We have identified potential risks and are working to establish processes to monitor, manage and mitigate them.',
        'We’re still identifying risks or are yet to consider how we will monitor, manage and mitigate them.')
    ]
  },
  {
    id: 'engagement',
    title: 'Consulting and engaging on the plan',
    checks: [
      check('engagement-strategy', 'Preparing an engagement strategy',
        'We have a positive strategy for engaging the community and other key stakeholders in the preparation of the plan, which has been prepared with regard to government guidance.',
        'We have made some progress in preparing an engagement strategy.',
        'We need to start preparing an engagement strategy.'),
      check('engagement-processes', 'Establishing processes for consultation and engagement',
        'We have clear processes in place to maximise diversity in participation, utilising both digital-first and traditional methods.',
        'We have scoped out digital-first and traditional methods for engaging with different audiences, but our processes are not yet fully formed.',
        'We haven’t explored what engagement methods we could use.'),
      check('engagement-agreeing', 'Agreeing the engagement strategy internally',
        'We have sought feedback on and agreed the engagement strategy with key decision makers.',
        'We have sought feedback on the engagement strategy with key decision makers, but it’s not yet signed off.',
        'We still need to seek feedback on our engagement approach with key decision makers.')
    ]
  },
  {
    id: 'scoping',
    title: 'Scoping the anticipated content of the plan',
    checks: [
      check('scoping-scope', 'Defining the scope of the plan',
        'We understand the proposed scope of the local plan. We know the main areas or locally specific subject matters it will address. This is based on data from the existing local plan, as well as information gathering, baselining and early engagement to date. Scoping work aligns with the work we have carried out on our SEA (if SEA is required).',
        'Scoping work is underway. We have reviewed monitoring information for the previous local plan, but still have work to do on information gathering, baselining and early engagement. The scoping work aligns or partially aligns with the work we have carried out on our SEA (if SEA is required).',
        'We’re only in the early stages of scoping and haven’t considered how this relates to the SEA.'),
      check('scoping-vision', 'Drafting a vision for the plan',
        'We have used early baselining and engagement activities to begin drafting a vision.',
        'Using our baselining work and analysis of feedback from the scoping consultation we have started to develop some ideas about what the vision might focus on.',
        'We need to start drafting a vision.'),
      check('scoping-monitoring', 'Considering how we will monitor progress towards the vision',
        'We have started to identify measurable outcomes to monitor our progress towards the vision.',
        'We have considered how we might monitor progress towards our vision, but haven’t identified specific measurable outcomes yet.',
        'We haven’t considered how we will monitor progress towards our vision.'),
      check('scoping-evidence', 'Gathering evidence to inform the new plan',
        'We have mostly identified and scoped our evidence needs and have a plan for how we will deliver this.',
        'We have identified some of our evidence needs but still have work to do to scope the work and identify how we will deliver this.',
        'We need to start identifying our evidence needs and how we will deliver this.'),
      check('scoping-housing', 'Calculating a housing requirement',
        'We have calculated a housing requirement for the plan area using the Government’s recommended standard method and started to identify the needs for homes of different sizes, types and tenures, including affordable homes.',
        'We have calculated a housing requirement for the plan area using the Government’s standard method. We haven’t started to identify the need for homes of different sizes, types and tenures and affordable homes yet.',
        'We haven’t calculated a housing requirement using the Government’s standard method.'),
      check('scoping-options', 'Exploring our high-level options and policies',
        'We have started to consider high-level and conceptual spatial options to deliver the identified development need, and begun to identify the potential scope of locally specific policies.',
        'We have identified the high-level capacity and constraints for development but have not started to develop spatial options to deliver the development need or scoped out locally specific policies.',
        'We haven’t done any work on high-level spatial options or locally specific policies.')
    ]
  },
  {
    id: 'sea',
    title: 'Progressing the Strategic Environmental Assessment',
    checks: [
      check('sea-plans', 'Identifying other plans/programmes that have a relationship with the local plan',
        'We have identified other relevant plans and programmes and their relationship to the local plan to establish how the plan or programme is affected by those plans or programmes.',
        'We have identified other relevant plans and programmes but have not yet analysed how the local plan is affected by those plans or programmes.',
        'We have not yet identified other relevant plans or programmes that affect the local plan.'),
      check('sea-baseline', 'Collecting baseline information for the SEA',
        'We have identified baseline information showing the existing environmental characteristics of the area and their likely evolution without implementation of a new plan, as well as data on historic and likely future trends. It provides the basis against which we can assess the likely effects of our different options.',
        'We have identified baseline information on the existing environmental characteristics of the area. We have not used this information to establish trends or used it to test the environmental effects of our options.',
        'We are in the early stages of (or haven’t yet started) assembling baseline information to inform our strategic environmental assessment.'),
      check('sea-objectives-protection', 'Identify environmental protection objectives to inform plan preparation',
        'We have identified the relevant environmental protection objectives, established at international, community or national level, and environmental considerations that will be taken into account during the preparation of the plan and recorded in the environmental report.',
        'We are in the process of identifying relevant environmental protection objectives that will be taken into account when preparing the plan.',
        'We have not identified any environmental protection objectives.'),
      check('sea-scope', 'Developing the scope of the SEA',
        'We have begun to identify the scope and level of detail of the information we intend to include in the environmental report. We have started to set out this information in a suitable document, such as a draft, emerging environmental report or scoping document. We are on track to consult on the scope of the SEA at the consultation on proposed plan content and evidence.',
        'We’re still working out what the scope and/or level of detail to include in the environmental report. We’re making progress on setting out this information in an appropriate document, but we’re not ready to consult on the scope of the SEA.',
        'We have not decided on the scope of the SEA or the level of detail we should include in the environmental report.'),
      check('sea-objectives', 'Developing SEA objectives',
        'We have started to develop SEA objectives which will help assess the environmental performance of the local plan.',
        'We have begun to identify the key themes likely to be important when developing SEA objectives to use to assess the environmental performance of the local plan.',
        'We have not yet begun on developing SEA objectives to assess the environmental performance of the plan against.')
    ]
  }
]

function getReadinessCheck (id) {
  for (const section of READINESS_SECTIONS) {
    const found = section.checks.find(item => item.id === id)
    if (found) return { section, check: found }
  }
  return null
}

// The descriptor for a status on a check, or '' (Not applicable has none).
function readinessDescriptor (item, status) {
  const key = READINESS_LEVEL_KEYS[status]
  return key ? item.levels[key] || '' : ''
}

// Every check Not started, with no note and no audit log.
function emptyReadiness () {
  const readiness = {}
  READINESS_SECTIONS.forEach(section => section.checks.forEach(item => {
    readiness[item.id] = { status: 'Not started', note: '', log: [] }
  }))
  return readiness
}

const SYSTEM = 'Automated by the system'

// Part way through, as in the design: the timetable and the scope of the plan at recommended
// progress, with their audit logs, and a few others started.
function midwayReadiness () {
  const readiness = emptyReadiness()
  const changed = (id, status, at, by) => {
    readiness[id].status = status
    readiness[id].log.push({ at, by, activity: 'Status changed to ' + status, comment: readinessDescriptor(getReadinessCheck(id).check, status) })
  }
  changed('legal-requirements', 'Work started', '28-09-2026 10:12', TEAM.dd.name)
  readiness['legal-requirements'].note = 'Need to liaise with legal team to get review of current proposals'
  readiness['legal-requirements'].log.push({ at: '28-09-2026 10:14', by: TEAM.dd.name, activity: 'Note added' })

  readiness['timetable-time'].log.push(
    { at: '21-09-2026 14:37', by: TEAM.sm.name, activity: 'Timetable created' },
    { at: '28-09-2026 09:02', by: SYSTEM, activity: 'Timetable CSV generated' },
    { at: '28-09-2026 09:04', by: SYSTEM, activity: 'Upload to Planning Data Platform confirmed' },
    { at: '28-09-2026 09:30', by: TEAM.sm.name, activity: 'Timetable data uploaded to website' }
  )
  changed('timetable-time', 'Recommended progress', '28-09-2026 09:31', SYSTEM)

  changed('engagement-strategy', 'Work started', '02-10-2026 11:20', TEAM.jo.name)

  readiness['scoping-scope'].log.push(
    { at: '05-10-2026 14:37', by: TEAM.rk.name, activity: 'Themes added from adopted plan' },
    { at: '05-10-2026 15:02', by: TEAM.rk.name, activity: 'Themes added because of new needs' },
    { at: '05-10-2026 15:10', by: TEAM.rk.name, activity: 'Themes added because of national or regional requirements' },
    { at: '06-10-2026 10:15', by: TEAM.rk.name, activity: '10/22 themes updated with all details.' },
    { at: '07-10-2026 12:40', by: TEAM.dd.name, activity: '18/22 themes updated with all details.' },
    { at: '08-10-2026 16:05', by: TEAM.dd.name, activity: '22/22 themes updated with all details.' }
  )
  changed('scoping-scope', 'Recommended progress', '08-10-2026 16:06', SYSTEM)
  changed('scoping-vision', 'Work started', '09-10-2026 09:45', TEAM.rk.name)
  changed('scoping-housing', 'Work started', '12-10-2026 13:20', TEAM.jo.name)
  changed('sea-plans', 'Work started', '13-10-2026 10:05', TEAM.sm.name)
  return readiness
}

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
    scopingConsultationStarted: false,
    readiness: emptyReadiness()
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
  state.readiness = midwayReadiness()
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
  READINESS_STATUSES,
  READINESS_SECTIONS,
  getReadinessCheck,
  readinessDescriptor,
  startingState,
  midwayState
}
