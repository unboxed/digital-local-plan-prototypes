//
// Content for the MODs prototype: managing main modifications to the plan after the hearings.
//
// After the hearings, the inspector tells the authority which main modifications (MMs) the plan
// needs to be sound. The authority drafts them as a team, keeps a schedule of every
// modification, and keeps a tracked changes version of the plan showing main modifications and
// its own additional modifications (AMs: minor changes that don't affect soundness). It then
// consults on the main modifications for at least six weeks and sends the comments to the
// inspector. This prototype shows only the authority's screens.
//
// ALL OF THIS IS INVENTED PROTOTYPE CONTENT. The policies and their wording are those of
// POLICY_TEXT (plan-paragraphs.js), but the inspector's letter, the modifications, comments,
// consultation responses and dates are written for the prototype. They are not the main
// modifications to the real City Plan 2040.
//
// Dates follow the MIQs prototype: hearings 12 to 14 January 2027, where the team captured the
// suggested changes (the inspector's among them). The main modifications were drafted in
// February, published for consultation on 1 March and the consultation closed on 12 April.
// "Today" is 20 April: the responses are in, and the team is revising some modifications in the
// light of them.
//

const MIQD = require('./miqs.js')
const PD = require('./policy-drafting.js')

const OFFICER = MIQD.OFFICER
const INSPECTOR = MIQD.INSPECTOR
const PROGRAMME_OFFICER = MIQD.PROGRAMME_OFFICER

// The prototype's "today", used for every new action, so new entries sit after the seeded ones
// rather than before the letter arrived.
const TODAY = '20 April 2027'

// The team working on the modifications: the officer you play, then Policy drafting's officers
// (less Priya Sharma, whose name is too close to Priya Shah's). Helen Marsh is the policy
// manager, who assigns suggested changes to officers.
const MANAGER_ID = 'helen-marsh'
const TEAM = [{ id: 'priya-shah', name: OFFICER, role: 'Planning Policy Officer' }]
  .concat(PD.OFFICERS.filter(officer => officer.id !== 'priya-sharma')
    .map(officer => officer.id === MANAGER_ID ? Object.assign({}, officer, { role: 'Planning Policy Manager' }) : officer))

function teamMember (id) {
  return TEAM.find(member => member.id === id) || null
}

// Everyone who can suggest a change: the team, the planning director and the inspector.
const PEOPLE = TEAM.concat([
  { id: 'rachel-adeyemi', name: 'Rachel Adeyemi', role: 'Director of Planning' },
  { id: 'inspector', name: INSPECTOR, role: 'Planning Inspector' }
])

function person (id) {
  return PEOPLE.find(member => member.id === id) || null
}

// Who a suggestion is captured as: the person signed in. The capture page lets you switch
// between these four ("Prototype only") to see each role's view.
const SUGGESTERS = [
  { id: 'priya-shah', role: 'Policy officer' },
  { id: MANAGER_ID, role: 'Policy manager' },
  { id: 'rachel-adeyemi', role: 'Planning director' },
  { id: 'inspector', role: 'Inspector' }
]

// The three kinds of change. A minor change or typo isn't numbered as a main or additional
// modification: it is labelled "Typo 1", "Typo 2".
const KINDS = [
  { value: 'MM', text: 'Main modification', hint: 'A change needed to make the plan sound. Consulted on.' },
  { value: 'AM', text: 'Additional modification', hint: 'A change that doesn’t affect soundness, such as an update. Shown in the schedule.' },
  { value: 'TYPO', text: 'Minor change or typo', hint: 'A correction, such as a spelling, punctuation or cross-reference. Not marked as MM or AM.' }
]

// The policies with full wording, which are the ones that can be modified (POLICY_TEXT).
const POLICY_REFS = ['S3', 'HS1', 'HS2', 'HS3', 'HS4', 'HS5', 'HS6', 'HS7', 'HS8']

// The suggested changes the team captured during the hearings, and since. `target` is a part key
// (see modParts in routes.js): "S3.1" is clause 1, "S3.2a" clause 2(a), "S3.intro" the
// introduction, "S3.exp" the supporting text. Every suggestion has one. `by` is
// who suggested it (PEOPLE), `assignee` the officer the manager gave it to (null if no one yet).
// `matterId` and `questionId` are the MIQs' (miqs.js), for the inspector's.
const SUGGESTIONS = [
  {
    id: 's1',
    kind: 'MM',
    target: 'S3.1',
    by: 'inspector',
    at: '13 January 2027',
    assignee: 'sarah-jenkins',
    matterId: '2',
    questionId: '2.2',
    text: 'To be effective, Policy S3 should refer to the housing trajectory and say how delivery against the requirement will be monitored, so that a shortfall is identified and acted on.'
  },
  {
    id: 's2',
    kind: 'MM',
    target: 'S3.2a',
    by: 'inspector',
    at: '13 January 2027',
    assignee: 'priya-shah',
    matterId: '2',
    questionId: '2.3',
    text: 'Clause 2(a) is unclear as drafted (“ensuring the delivery of applying…”). Reword it so that the threshold approach, and the 35% and 50% figures, read unambiguously.'
  },
  {
    id: 's3',
    kind: 'MM',
    target: 'S3.2b',
    by: 'inspector',
    at: '13 January 2027',
    assignee: 'james-chen',
    matterId: '2',
    questionId: '2.4',
    text: 'Set out in the policy, rather than the supporting text, the circumstances in which off-site provision or a payment in lieu would be acceptable, and that any viability evidence will be published and independently reviewed.'
  },
  {
    id: 's4',
    kind: 'MM',
    target: 'HS1.1',
    by: 'inspector',
    at: '13 January 2027',
    assignee: 'priya-shah',
    matterId: '2',
    questionId: '2.5',
    text: 'The identified residential areas are too narrowly drawn to deliver the requirement. Allow new housing outside them where the criteria in clause 1 are met and residential amenity can be secured.'
  },
  {
    id: 's5',
    kind: 'MM',
    target: 'HS6.2',
    by: 'inspector',
    at: '13 January 2027',
    assignee: 'priya-shah',
    matterId: '2',
    questionId: null,
    text: 'A nominations agreement should be one way of securing student accommodation, not the only way. Allow the affordable student accommodation to be secured through a legal agreement instead.'
  },
  {
    id: 's6',
    kind: 'MM',
    target: 'HS7.1',
    by: 'inspector',
    at: '13 January 2027',
    assignee: 'tom-okafor',
    matterId: '2',
    questionId: null,
    text: 'The period for the older people’s housing target (2023 to 2040) is not the plan period. Align it with the plan period in Policy S3, and say that the figure is a minimum.'
  },
  {
    id: 's7',
    kind: 'AM',
    target: 'S3.exp',
    by: 'helen-marsh',
    at: '13 January 2027',
    assignee: 'priya-shah',
    text: 'Tighten the first paragraph of the supporting text to S3: it repeats itself about the shortage of affordable housing.'
  },
  {
    id: 's8',
    kind: 'AM',
    target: 'HS4.1',
    by: 'priya-shah',
    at: '14 January 2027',
    assignee: 'daniel-reyes',
    text: 'HS4 refers to “the London Plan” standards. Name the edition (London Plan 2021), as the GLA asked at the hearing.'
  },
  {
    id: 's9',
    kind: 'AM',
    target: 'HS8.1',
    by: 'rachel-adeyemi',
    at: '14 January 2027',
    assignee: 'daniel-reyes',
    text: 'Use the register’s full name in HS8: the self-build and custom housebuilding register.'
  },
  {
    id: 's10',
    kind: 'TYPO',
    target: 'HS2.2',
    by: 'priya-shah',
    at: '14 January 2027',
    assignee: 'priya-shah',
    text: 'Add a cross-reference to Policy HS1, where the identified residential areas are defined.'
  },
  {
    id: 's11',
    kind: 'AM',
    target: 'HS3.1b',
    by: 'helen-marsh',
    at: '14 January 2027',
    assignee: 'tom-okafor',
    text: 'Say that daylight and sunlight will be assessed against the BRE guidance, as discussed at the hearing.'
  },
  {
    id: 's12',
    kind: 'TYPO',
    target: 'HS5.2',
    by: 'priya-shah',
    at: '14 January 2027',
    assignee: null,
    text: '“Short-term letting” is hyphenated here but not in the glossary. Make them the same.'
  },
  {
    id: 's13',
    kind: 'AM',
    target: 'HS6.1',
    by: 'rachel-adeyemi',
    at: '14 January 2027',
    assignee: null,
    text: 'The plan doesn’t say what it means by a hostel. Define it here, or refer to the glossary.'
  }
]

// Proposed wording, as the team has drafted it (or finished it), by part key.
const WORDING = {
  'S3.1': 'Making provision for a minimum of 1,706 net additional dwellings between 2025/26 and 2039/40, in line with the housing trajectory in Appendix 2. Delivery will be monitored each year in the Authority Monitoring Report, and a shortfall against the trajectory will trigger a review of the reasons and the action needed:',
  'S3.1-draft': 'Making provision for a minimum of 1,706 net additional dwellings between 2025/26 and 2039/40, in line with the housing trajectory in Appendix 2:',
  'S3.2a': 'applying the Mayor’s threshold approach, requiring a minimum of 35% affordable housing, and a minimum of 50% affordable housing on public sector land;',
  'S3.2b': 'requiring residential developments with the potential for 10 or more units to provide a minimum of 35% affordable housing on-site. Exceptionally, new affordable housing may be provided off-site, or through an equivalent cash in lieu payment, where on-site provision cannot be satisfactorily delivered and is not viable. Any viability assessment submitted will be published and independently reviewed; and',
  'S3.2b-draft': 'requiring residential developments with the potential for 10 or more units to provide a minimum of 35% affordable housing on-site. Exceptionally, new affordable housing may be provided off-site, or through an equivalent cash in lieu payment, where on-site provision cannot be satisfactorily delivered and is not viable; and',
  'HS1.1': 'New housing will be supported on suitable sites in or near the identified residential areas shown on the Policies Map, and elsewhere where a good standard of residential amenity can be secured, where it would not:',
  'HS6.2': 'Purpose-built student accommodation must provide at least 35% of bedrooms as affordable student accommodation, and be secured for students through a nominations agreement with one or more higher education providers or through a legal agreement.',
  'HS7.1': 'A minimum of 86 net additional dwellings for older people will be sought between 2025/26 and 2039/40.',
  'HS7.1-draft': 'A minimum of 86 net additional dwellings for older people will be sought between 2025/26 and 2039/40.',
  'S3.exp': 'Housing is vital for the City’s future economy and its communities. A shortage of housing, particularly affordable housing, is one of the main barriers to future business and community growth in the City and across London. High quality, affordable housing is also essential to meet the housing needs of the City’s communities on lower incomes.',
  'HS4.1': 'meet or exceed the London Plan 2021 internal space standards and provide private outdoor amenity space in line with London Plan standards;',
  'HS2.2': 'Where a loss of housing is accepted, any replacement provision should be of at least equivalent floorspace and quality, located in or near an identified residential area (see Policy HS1).',
  'HS8.1': 'The provision of self and custom build housing units will be encouraged within large residential schemes, having regard to the demand shown on the City Corporation’s self-build and custom housebuilding register.'
}

const REASONS = {
  'HS2.2': 'Correction: adds a cross-reference to Policy HS1.',
  'S3.1': 'For effectiveness: links the requirement to the trajectory and sets out how delivery will be monitored (inspector’s letter, Matter 2).',
  'S3.2a': 'For clarity and effectiveness: corrects the wording of the threshold approach (inspector’s letter, Matter 2).',
  'S3.2b': 'For effectiveness: sets out when off-site provision is acceptable and that viability evidence will be published (inspector’s letter, Matter 2).',
  'HS1.1': 'To be justified and effective: allows housing outside the identified residential areas where amenity can be secured (inspector’s letter, Matter 2).',
  'HS6.2': 'For effectiveness: allows affordable student accommodation to be secured through a legal agreement (inspector’s letter).',
  'HS7.1': 'For consistency: aligns the target with the plan period (inspector’s letter).',
  'S3.exp': 'Minor wording correction.',
  'HS4.1': 'Update: names the edition of the London Plan.',
  'HS8.1': 'Correction: uses the register’s full statutory name.'
}

// A modification in session state. `before` is never stored: it is always read from
// POLICY_TEXT, so the tracked change is worked out against the plan's own wording.
function mod (id, fields) {
  return Object.assign({
    id,
    type: 'MM',
    target: '',
    after: '',
    reason: '',
    status: 'draft',
    assignee: 'priya-shah',
    updatedAt: TODAY,
    updatedBy: OFFICER,
    comments: []
  }, fields)
}

function comment (id, author, at, text, extra) {
  return Object.assign({ id, author, at, text, resolved: false, replies: [] }, extra)
}

// Consultation responses on the main modifications, by part key: who responded and whether
// they support or object. No summaries: the prototype shows only counts and who.
const RESPONSES = {
  'S3.1': [
    { consulteeId: 'greater-london-authority', type: 'Support' },
    { consulteeId: 'historic-england', type: 'Neutral' }
  ],
  'S3.2a': [
    { consulteeId: 'greater-london-authority', type: 'Support' }
  ],
  'S3.2b': [
    { consulteeId: 'greater-london-authority', type: 'Support' },
    { consulteeId: 'transport-for-london', type: 'Neutral' },
    { consulteeId: 'thames-water', type: 'Objection' }
  ],
  'HS1.1': [
    { consulteeId: 'environment-agency', type: 'Objection' },
    { consulteeId: 'natural-england', type: 'Neutral' }
  ],
  'HS6.2': [],
  'HS7.1': [
    { consulteeId: 'sport-england', type: 'Neutral' }
  ],
  // Additional modifications: not consulted on, but some respondents commented on them anyway.
  'S3.exp': [
    { consulteeId: 'city-residents-association', type: 'Support' }
  ],
  'HS4.1': [
    { consulteeId: 'greater-london-authority', type: 'Support' },
    { consulteeId: 'berkeley-group', type: 'Objection' }
  ],
  'HS8.1': [
    { consulteeId: 'barbican-association', type: 'Neutral' }
  ]
}
// The consultation on the main modifications, which the seeded consultation version was
// published for.
const CONSULTATION = { opened: '1 Mar 2027', closes: '12 Apr 2027' }

// The modifications as the team agreed them in February, before the consultation. The seeded
// versions are snapshots of these: a version keeps its own copy of the modifications, so it
// still shows what was published after the working copy moves on.
function agreedModifications () {
  const list = []
  // The inspector's six and the three additional modifications; the later suggestions came after.
  const agreed = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9']
  SUGGESTIONS.filter(suggestion => agreed.includes(suggestion.id)).forEach(suggestion => {
    list.push(mod('m' + (list.length + 1), { type: suggestion.kind, target: suggestion.target, after: WORDING[suggestion.target], reason: REASONS[suggestion.target], status: 'agreed', assignee: suggestion.assignee, updatedAt: '24 February 2027', updatedBy: 'Helen Marsh' }))
  })
  return list
}

// A version of the tracked changes plan, in the versioning prototype's shape (title, version
// date, published date, exported by), with its own copy of the modifications.
function version (id, fields) {
  return Object.assign({ id, published: null, sharedAt: null, closes: null, modifications: agreedModifications() }, fields)
}

// The starting state: the examples. The consultation version is published and its responses
// are in; the working copy has moved on since, with some modifications reopened after the
// responses, one waiting for review, and comments from the team.
function startingState () {
  const state = {
    modifications: agreedModifications(),
    suggestions: JSON.parse(JSON.stringify(SUGGESTIONS)),
    nextId: 10,
    nextSuggestionId: 14,
    // Who the capture page adds suggestions as (SUGGESTERS).
    actingAs: 'priya-shah',
    versions: [
      version('v1', { title: 'Internal review: draft main modifications', versionDate: '19 Feb 2027', sharedAt: '19 Feb 2027', exportedBy: OFFICER }),
      version('v2', { title: 'Consultation: proposed main modifications', versionDate: '26 Feb 2027', published: '1 Mar 2027', closes: CONSULTATION.closes, exportedBy: 'Helen Marsh' })
    ],
    preview: false,
    sent: null,
    lastChange: { at: '19 April 2027', by: 'James Chen' },
    history: []
  }
  const log = (at, actor, action) => state.history.push({ at, actor, action })
  const revise = (target, fields) => Object.assign(state.modifications.find(item => item.target === target), fields)

  revise('S3.1', {
    after: WORDING['S3.1-draft'],
    status: 'draft',
    assignee: 'sarah-jenkins',
    updatedAt: '16 April 2027',
    updatedBy: 'Sarah Jenkins',
    comments: [
      comment('c1', 'Helen Marsh', '16 April 2027', 'Historic England’s response asks how delivery will be monitored. Can we point to the Authority Monitoring Report?'),
      comment('c2', 'James Chen', '15 April 2027', 'Appendix 2 is the trajectory in the submitted plan, so that reference is right.', { resolved: true })
    ]
  })
  revise('S3.2b', {
    after: WORDING['S3.2b-draft'],
    status: 'review',
    assignee: 'james-chen',
    updatedAt: '19 April 2027',
    updatedBy: 'James Chen',
    comments: [
      comment('c3', 'James Chen', '19 April 2027', 'Revised after Thames Water’s objection. I’ve left out the publication of viability assessments for now: should that be in the policy or the supporting text?', {
        replies: [{ author: 'Helen Marsh', at: '19 April 2027', text: 'The inspector asked for it in the policy. Let’s put it back.' }]
      })
    ]
  })
  revise('HS7.1', { after: WORDING['HS7.1-draft'], status: 'draft', assignee: 'tom-okafor', updatedAt: '15 April 2027', updatedBy: 'Tom Okafor' })
  revise('HS8.1', { status: 'draft', updatedAt: '14 April 2027', updatedBy: 'Daniel Reyes' })
  revise('S3.exp', { status: 'review', assignee: 'priya-shah', updatedAt: '17 April 2027', updatedBy: OFFICER })
  // A typo, drafted since the consultation.
  state.modifications.push(mod('m' + state.nextId, { type: 'TYPO', target: 'HS2.2', after: WORDING['HS2.2'], reason: REASONS['HS2.2'], status: 'draft', updatedAt: '17 April 2027', updatedBy: OFFICER }))
  state.nextId += 1

  log('13 January 2027', OFFICER, 'Captured the inspector’s six suggested changes at the Matter 2 hearing')
  log('14 January 2027', 'Helen Marsh', 'Assigned the suggested changes to officers')
  log('12 February 2027', OFFICER, 'Drafted all six main modifications')
  log('19 February 2027', OFFICER, 'Shared a version of the tracked changes plan for internal review')
  log('24 February 2027', 'Helen Marsh', 'Agreed every modification in the schedule')
  log('1 March 2027', 'Helen Marsh', 'Published the tracked changes plan for consultation, closing on ' + CONSULTATION.closes)
  log('13 April 2027', OFFICER, 'The consultation closed and the responses were received')
  log('14 April 2027', 'Daniel Reyes', 'Reopened the additional modification to HS8 clause 1')
  log('15 April 2027', 'Tom Okafor', 'Reopened the main modification to HS7 clause 1')
  log('16 April 2027', 'Sarah Jenkins', 'Reopened the main modification to S3 clause 1')
  log('17 April 2027', OFFICER, 'Sent the additional modification to S3 supporting text for review')
  log('17 April 2027', OFFICER, 'Started a minor change to HS2 clause 2')
  log('19 April 2027', 'James Chen', 'Sent the main modification to S3 clause 2(b) for review')
  return state
}

module.exports = {
  OFFICER,
  INSPECTOR,
  PROGRAMME_OFFICER,
  TODAY,
  TEAM,
  teamMember,
  MANAGER_ID,
  PEOPLE,
  person,
  SUGGESTERS,
  KINDS,
  POLICY_REFS,
  SUGGESTIONS,
  RESPONSES,
  CONSULTATION,
  startingState
}
