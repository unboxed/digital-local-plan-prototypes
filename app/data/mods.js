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
// Dates follow the MIQs prototype: hearings 12 to 14 January 2027, so the inspector's letter
// arrives in February 2027. The main modifications were drafted in February, published for
// consultation on 1 March and the consultation closed on 12 April. "Today" is 20 April: the
// responses are in, and the team is revising some modifications in the light of them.
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
// (less Priya Sharma, whose name is too close to Priya Shah's).
const TEAM = [{ id: 'priya-shah', name: OFFICER, role: 'Planning Policy Officer' }]
  .concat(PD.OFFICERS.filter(officer => officer.id !== 'priya-sharma'))

function teamMember (id) {
  return TEAM.find(member => member.id === id) || null
}

// The policies with full wording, which are the ones that can be modified (POLICY_TEXT).
const POLICY_REFS = ['S3', 'HS1', 'HS2', 'HS3', 'HS4', 'HS5', 'HS6', 'HS7', 'HS8']

// The inspector's post-hearing letter, listing the main modifications the plan needs.
const LETTER = {
  ref: 'INS-07',
  title: 'City Plan 2040: Inspector’s post-hearing letter and suggested main modifications',
  fileName: 'INS-07_City_Plan_2040_Post_Hearing_Letter.pdf',
  issued: '2 February 2027',
  received: '2 February 2027',
  intro: [
    'Thank you for your help during the hearings, which closed on 14 January 2027. This letter sets out the main modifications I consider necessary to make the plan sound. It does not set out my final conclusions, which will be in my report.',
    'I ask the Corporation to prepare a schedule of the main modifications, with a tracked changes version of the plan, and to consult on them for at least six weeks. The Corporation may also make additional modifications that do not affect soundness, such as corrections and updates; these should be shown in the schedule but are not for consultation.',
    'Please send me the schedule for checking before the consultation begins, and then all the comments received once it closes.'
  ]
}

// What the inspector asks for, one per part of a policy. `target` is a part key (see
// modParts in routes.js): "S3.1" is clause 1, "S3.2a" clause 2(a), "S3.intro" the introduction,
// "S3.exp" the supporting text. `matterId` and `questionId` are the MIQs' (miqs.js).
const REQUESTS = [
  {
    id: 'r1',
    target: 'S3.1',
    matterId: '2',
    questionId: '2.2',
    text: 'To be effective, Policy S3 should refer to the housing trajectory and say how delivery against the requirement will be monitored, so that a shortfall is identified and acted on.'
  },
  {
    id: 'r2',
    target: 'S3.2a',
    matterId: '2',
    questionId: '2.3',
    text: 'Clause 2(a) is unclear as drafted (“ensuring the delivery of applying…”). Reword it so that the threshold approach, and the 35% and 50% figures, read unambiguously.'
  },
  {
    id: 'r3',
    target: 'S3.2b',
    matterId: '2',
    questionId: '2.4',
    text: 'Set out in the policy, rather than the supporting text, the circumstances in which off-site provision or a payment in lieu would be acceptable, and that any viability evidence will be published and independently reviewed.'
  },
  {
    id: 'r4',
    target: 'HS1.1',
    matterId: '2',
    questionId: '2.5',
    text: 'The identified residential areas are too narrowly drawn to deliver the requirement. Allow new housing outside them where the criteria in clause 1 are met and residential amenity can be secured.'
  },
  {
    id: 'r5',
    target: 'HS6.2',
    matterId: '2',
    questionId: null,
    text: 'As discussed at the hearing, a nominations agreement should be one way of securing student accommodation, not the only way. Allow the affordable student accommodation to be secured through a legal agreement instead.'
  },
  {
    id: 'r6',
    target: 'HS7.1',
    matterId: '2',
    questionId: null,
    text: 'The period for the older people’s housing target (2023 to 2040) is not the plan period. Align it with the plan period in Policy S3, and say that the figure is a minimum.'
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
  'HS8.1': 'The provision of self and custom build housing units will be encouraged within large residential schemes, having regard to the demand shown on the City Corporation’s self-build and custom housebuilding register.'
}

const REASONS = {
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
    requestId: null,
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
  REQUESTS.forEach(request => {
    list.push(mod('m' + (list.length + 1), { requestId: request.id, target: request.target, after: WORDING[request.target], reason: REASONS[request.target], status: 'agreed', updatedAt: '24 February 2027', updatedBy: 'Helen Marsh' }))
  })
  ;['S3.exp', 'HS4.1', 'HS8.1'].forEach(target => {
    list.push(mod('m' + (list.length + 1), { type: 'AM', target, after: WORDING[target], reason: REASONS[target], status: 'agreed', assignee: 'daniel-reyes', updatedAt: '24 February 2027', updatedBy: 'Helen Marsh' }))
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
    nextId: 10,
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

  log(LETTER.received, OFFICER, 'Received the inspector’s post-hearing letter (' + LETTER.ref + ')')
  log('12 February 2027', OFFICER, 'Drafted all six main modifications')
  log('19 February 2027', OFFICER, 'Shared a version of the tracked changes plan for internal review')
  log('24 February 2027', 'Helen Marsh', 'Agreed every modification in the schedule')
  log('1 March 2027', 'Helen Marsh', 'Published the tracked changes plan for consultation, closing on ' + CONSULTATION.closes)
  log('13 April 2027', OFFICER, 'The consultation closed and the responses were received')
  log('14 April 2027', 'Daniel Reyes', 'Reopened the additional modification to HS8 clause 1')
  log('15 April 2027', 'Tom Okafor', 'Reopened the main modification to HS7 clause 1')
  log('16 April 2027', 'Sarah Jenkins', 'Reopened the main modification to S3 clause 1')
  log('17 April 2027', OFFICER, 'Sent the additional modification to S3 supporting text for review')
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
  POLICY_REFS,
  LETTER,
  REQUESTS,
  RESPONSES,
  CONSULTATION,
  startingState
}
