//
// Content for the MIQs prototype: responding to the inspector's matters, issues and questions.
//
// Before the hearings, the inspector sends the authority a document of matters, issues and
// questions (MIQs). The authority publishes it, receives hearing statements from participants,
// writes its own statement answering each question and sends everything to the programme
// officer. This prototype shows only the authority's screens.
//
// ALL OF THIS IS INVENTED PROTOTYPE CONTENT. Policy refs and titles are the City Plan 2040's (as
// in policies.js), and the consultees are those of the consultation responses prototype, but the
// matters, issues, questions, hearing statements, summaries and dates are written for the
// prototype. They are not the inspector's questions on the real City Plan 2040.
//
// Dates follow the consultation responses prototype (consultation on the proposed local plan in
// February to March 2026, responses finalised that autumn), not the examination library's 2025
// dates, which already disagree with it.
//

const OFFICER = 'Priya Shah'
const INSPECTOR = 'Inspector A. Rahman'
const PROGRAMME_OFFICER = 'Jo Fletcher, Programme Officer'

// The inspector's document: the main matters, issues and questions, with the hearing programme
// as part of it.
const MIQ_DOCUMENT = {
  ref: 'INS-03',
  title: 'City Plan 2040: Main matters, issues and questions and hearing programme',
  fileName: 'INS-03_City_Plan_2040_MIQs_and_Hearing_Programme.pdf',
  issued: '2 November 2026',
  hearingsFrom: '12 January 2027',
  venue: 'Guildhall, City of London',
  defaultDeadline: { day: '4', month: '12', year: '2026' },
  intro: [
    'This document sets out the main matters, issues and questions I wish to explore at the hearings into the City Plan 2040, and the programme for those hearings. It does not cover every representation made on the plan, only the issues on which I need to hear more before reaching my conclusions on soundness and legal compliance.',
    'The Corporation and participants may send a hearing statement in response to any or all of the questions. Statements should answer the questions directly, refer to the evidence already before the examination, and should not introduce new evidence.'
  ]
}

// The hearing programme, part of the same document. Invented for the prototype: days, times
// and the venue are illustrative, not a real programme.
const HEARING_PROGRAMME = [
  {
    day: 'Day 1: Tuesday 12 January 2027',
    sessions: [
      { time: '10:00', title: 'Opening, then Matter 1: Legal compliance', questions: 'Questions 1.1 to 1.3' },
      { time: '14:00', title: 'Matter 2: Housing, the housing requirement and its delivery', questions: 'Questions 2.1 and 2.2' }
    ]
  },
  {
    day: 'Day 2: Wednesday 13 January 2027',
    sessions: [
      { time: '10:00', title: 'Matter 2: Housing, affordable housing and the location of new housing', questions: 'Questions 2.3 to 2.5' }
    ]
  },
  {
    day: 'Day 3: Thursday 14 January 2027',
    sessions: [
      { time: '10:00', title: 'Matter 3: Tall buildings and the historic environment', questions: 'Questions 3.1 to 3.4' },
      { time: '15:30', title: 'Close of the hearings', questions: '' }
    ]
  }
]

// The tests of soundness every question may touch on.
const SOUNDNESS_TESTS = [
  { id: 'positively-prepared', title: 'Positively prepared', description: 'Provides a strategy that seeks to meet the area’s objectively assessed needs, informed by agreements with other authorities.' },
  { id: 'justified', title: 'Justified', description: 'An appropriate strategy, taking into account the reasonable alternatives, and based on proportionate evidence.' },
  { id: 'effective', title: 'Effective', description: 'Deliverable over the plan period, and based on effective joint working on cross-boundary strategic matters.' },
  { id: 'consistent', title: 'Consistent with national policy', description: 'Enables the delivery of sustainable development in accordance with national policy.' }
]

// Matter → issue → question, as the inspector's document sets them out. A question's
// `policies` are the City Plan 2040 refs it is about, as read from the document: the officer can
// correct them on the "Check what we found" page. `tests`, `compliance` (Statement of compliance
// regulation refs) and `sds` (London Plan policy refs) drive the Legal compliance and soundness
// tab. `summary` is the canned "AI generated" summary.
const MATTERS = [
  {
    id: '1',
    title: 'Legal compliance',
    intro: 'Whether the Corporation has complied with the relevant procedural and legal requirements in preparing the plan.',
    issues: [
      {
        id: '1a',
        title: 'Has the plan been prepared in accordance with the legal and procedural requirements?',
        questions: [
          {
            id: '1.1',
            text: 'Has consultation on the proposed local plan been carried out in accordance with the Regulations, and have the representations received been taken into account?',
            policies: [],
            tests: ['positively-prepared'],
            compliance: ['Regulation 23', 'Regulation 27', 'Regulation 30'],
            sds: [],
            summary: {
              evidence: 'The Statement of compliance records consultation on the proposed plan content and evidence (May 2024) and on the proposed local plan (8 February to 22 March 2026), with the summaries of responses published for each. The consultation on the proposed local plan received representations from 31 consultees across eight themes.',
              issues: 'No representation challenges the conduct of the consultation itself. Several organisations ask how their earlier comments were taken into account, which the published summaries of responses answer theme by theme.'
            }
          },
          {
            id: '1.2',
            text: 'Is the plan in general conformity with the London Plan, in particular on the housing target and the location of tall buildings?',
            policies: ['S3', 'S12'],
            tests: ['consistent'],
            compliance: ['Regulation 28'],
            sds: ['H1', 'D9'],
            summary: {
              evidence: 'The statement of general conformity links London Plan H1 to Policies S3 and HS1, which plan to meet the City’s ten-year target of 1,460 homes, and D9 to Policy S12, which defines tall building areas and heights as D9 requires. The Greater London Authority’s representation confirms general conformity.',
              issues: 'Developers argue that the tall building contours are more restrictive than D9 requires. Historic England argues the reverse in relation to the Tower of London World Heritage Site.'
            }
          }
        ]
      },
      {
        id: '1b',
        title: 'Has the Corporation engaged with neighbouring authorities on strategic cross-boundary matters?',
        questions: [
          {
            id: '1.3',
            text: 'What engagement has taken place with neighbouring boroughs on the effect of tall buildings and protected views across the borough boundary, and what is its outcome?',
            policies: ['S12', 'S13'],
            tests: ['effective', 'positively-prepared'],
            compliance: ['Regulation 27'],
            sds: ['D9'],
            summary: {
              evidence: 'The London Borough of Southwark responded on building heights and heritage. The townscape and heritage evidence includes views from the South Bank, and the protected views in S13 follow the London View Management Framework, which already applies across borough boundaries.',
              issues: 'Southwark asks that cumulative effects on views from the South Bank are assessed. There is no objection that engagement was inadequate.'
            }
          }
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'Housing',
    intro: 'Whether the plan’s policies for housing are justified, effective and consistent with national policy.',
    issues: [
      {
        id: '2a',
        title: 'Is the housing requirement justified, and will it be delivered?',
        questions: [
          {
            id: '2.1',
            text: 'Is the minimum target of 1,706 net additional dwellings between 2025/26 and 2039/40 in Policy S3 justified by the evidence, and consistent with the London Plan?',
            policies: ['S3'],
            tests: ['justified', 'consistent', 'positively-prepared'],
            compliance: [],
            sds: ['H1'],
            summary: {
              evidence: 'The Local Housing Needs Assessment projects household formation outpacing completions in every year of the plan period. The target in S3 rolls forward the London Plan’s ten-year figure for the City of 1,460 homes over the full plan period, and the housing trajectory shows how it will be met.',
              issues: 'Residents support more housing but doubt that infrastructure will keep pace. Developers say the target should be higher, and that the residential areas in HS1 are too narrowly drawn to deliver it.'
            }
          },
          {
            id: '2.2',
            text: 'Is the housing trajectory realistic? What is the evidence that sites in the trajectory, including constrained sites, will come forward when expected?',
            policies: ['S3', 'HS1'],
            tests: ['effective'],
            compliance: [],
            sds: ['H1', 'H2'],
            summary: {
              evidence: 'The housing trajectory draws on permissions, allocations and a small sites allowance. The Viability Assessment tests delivery on constrained sites, and the Infrastructure Delivery Plan sets out the services needed to support new homes.',
              issues: 'Developers question delivery on constrained sites and ask for flexibility on affordable housing where site constraints are shown. Residents question whether infrastructure will keep pace with the trajectory.'
            }
          }
        ]
      },
      {
        id: '2b',
        title: 'Are the policies for affordable housing justified and effective?',
        questions: [
          {
            id: '2.3',
            text: 'Is the requirement for at least 50% affordable housing on public sector land justified, having regard to the viability evidence?',
            policies: ['S3'],
            tests: ['justified', 'effective'],
            compliance: [],
            sds: ['H4', 'H5'],
            summary: {
              evidence: 'The 50% requirement on public sector land follows the London Plan’s threshold approach (H5). The Viability Assessment tests the requirement across site typologies, and the Strategic Housing Market Assessment sets out the tenure and size of homes needed.',
              issues: 'The most common concern is that viability assessments are used to reduce affordable housing. Developers object that the requirement will make some constrained sites unviable.'
            }
          },
          {
            id: '2.4',
            text: 'How will on-site affordable housing be secured, and in what circumstances would an off-site payment be acceptable? Is the policy sufficiently clear?',
            policies: ['S3', 'HS1'],
            tests: ['effective'],
            compliance: [],
            sds: ['H4'],
            summary: {
              evidence: 'S3 expects affordable housing on site wherever possible. Viability assessments submitted to justify a lower contribution will be independently reviewed and published, as the Corporation’s response to the consultation set out.',
              issues: 'Respondents object to off-site payments in place of on-site homes, and ask for viability assessments to be published in full.'
            }
          }
        ]
      },
      {
        id: '2c',
        title: 'Is the approach to the location of new housing justified?',
        questions: [
          {
            id: '2.5',
            text: 'Is the approach in Policy HS1 of directing new homes to the identified residential areas justified, and is it effective in protecting office floorspace?',
            policies: ['HS1'],
            tests: ['justified', 'effective'],
            compliance: [],
            sds: ['SD5'],
            summary: {
              evidence: 'The Employment Land Review shows housing pressure on land in business use. Directing homes to the residential areas follows London Plan SD5, which gives offices priority in the Central Activities Zone. The Noise and Soundscape Study supports keeping new homes away from late-night and servicing uses.',
              issues: 'The Home Builders Federation asks for the amenity requirements to be set as clear thresholds. Some developers say the residential areas are too narrowly drawn.'
            }
          }
        ]
      }
    ]
  },
  {
    id: '3',
    title: 'Tall buildings and the historic environment',
    intro: 'Whether the plan’s approach to tall buildings, protected views and heritage is justified, effective and consistent with national policy.',
    issues: [
      {
        id: '3a',
        title: 'Is the approach to tall buildings justified?',
        questions: [
          {
            id: '3.1',
            text: 'Are the tall building areas and height contours in Policy S12 and Figure 15 justified by the evidence, and do they strike the right balance between growth and the protection of heritage assets?',
            policies: ['S12'],
            tests: ['justified', 'consistent'],
            compliance: [],
            sds: ['D9'],
            summary: {
              evidence: 'The Tall Buildings Study and the townscape and heritage evidence define the City Cluster and Fleet Valley tall building areas, with contours that step down towards the Tower of London and St Paul’s Cathedral.',
              issues: 'Historic England proposes alternative contours to better protect the Tower of London World Heritage Site. Developers argue the contours are too restrictive. Residents raise overshadowing and wind at street level.'
            }
          },
          {
            id: '3.2',
            text: 'Is the definition of a tall building as one over 75m AOD clear and effective, and how will proposals below that height be assessed?',
            policies: ['S12'],
            tests: ['effective'],
            compliance: [],
            sds: ['D9'],
            summary: {
              evidence: 'D9 asks boroughs to define what is a tall building for their area. The 75m AOD definition reflects the City’s prevailing building heights, set out in the Tall Buildings Study.',
              issues: 'Respondents say the absence of a clear maximum height leaves decisions open to negotiation, and ask how buildings just below 75m will be assessed.'
            }
          }
        ]
      },
      {
        id: '3b',
        title: 'Does the plan provide effective protection for the historic environment and protected views?',
        questions: [
          {
            id: '3.3',
            text: 'Does Policy HE1 set a sufficiently clear test for development affecting the setting of designated heritage assets?',
            policies: ['HE1'],
            tests: ['effective', 'consistent'],
            compliance: [],
            sds: ['HC1'],
            summary: {
              evidence: 'HE1 requires a Statement of Heritage Significance and a Heritage Impact Assessment for proposals affecting heritage assets, with a presumption against harm unless public benefits clearly outweigh it. The supporting text explains how verified views will be used.',
              issues: 'Historic England objects that the test for setting should be in the policy itself, not the supporting text. A planning consultant objects that verified views should be proportionate to the proposal.'
            }
          },
          {
            id: '3.4',
            text: 'Is the approach to protected views in Policy S13 consistent with the London View Management Framework and the St Paul’s Heights code?',
            policies: ['S13'],
            tests: ['consistent'],
            compliance: [],
            sds: ['HC4'],
            summary: {
              evidence: 'S13 implements the Mayor’s London View Management Framework and the City’s own St Paul’s Heights code, and identifies the City’s own significant views.',
              issues: 'Respondents are concerned about the loss of views across the skyline, including from the Thames Path. Southwark asks for cumulative effects on views from the South Bank to be assessed.'
            }
          }
        ]
      }
    ]
  }
]

// Every question, in document order, with its matter and issue.
const QUESTIONS = []
MATTERS.forEach(matter => {
  matter.issues.forEach(issue => {
    issue.questions.forEach(question => {
      QUESTIONS.push(Object.assign({ matterId: matter.id, issueId: issue.id }, question))
    })
  })
})

function getMatter (id) {
  return MATTERS.find(matter => matter.id === id) || null
}

function getQuestion (id) {
  return QUESTIONS.find(question => question.id === id) || null
}

// Hearing statements from participants, as the authority receives them.
const HEARING_STATEMENTS = [
  {
    id: 'hs-gla',
    consulteeId: 'greater-london-authority',
    questions: ['1.2', '2.1', '3.1'],
    received: '20 November 2026',
    fileName: 'M1-M3_GLA_Hearing_Statement.pdf'
  },
  {
    id: 'hs-historic-england',
    consulteeId: 'historic-england',
    questions: ['1.2', '3.1', '3.3', '3.4'],
    received: '27 November 2026',
    fileName: 'M1-M3_Historic_England_Hearing_Statement.pdf'
  },
  {
    id: 'hs-barratt',
    consulteeId: 'barratt-london',
    questions: ['2.1', '2.2', '2.3'],
    received: '28 November 2026',
    fileName: 'M2_Barratt_London_Hearing_Statement.pdf'
  },
  {
    id: 'hs-berkeley',
    consulteeId: 'berkeley-group',
    questions: ['2.3', '2.4'],
    received: '1 December 2026',
    fileName: 'M2_Berkeley_Group_Hearing_Statement.pdf'
  },
  {
    id: 'hs-residents',
    consulteeId: 'city-residents-association',
    questions: ['2.2', '2.5', '3.1'],
    received: '2 December 2026',
    fileName: 'M2-M3_City_Residents_Association_Hearing_Statement.pdf'
  },
  {
    id: 'hs-heritage-society',
    consulteeId: 'city-heritage-society',
    questions: ['3.3', '3.4'],
    received: '3 December 2026',
    fileName: 'M3_City_Heritage_Society_Hearing_Statement.pdf'
  },
  {
    id: 'hs-southwark',
    consulteeId: 'southwark-council',
    questions: ['1.3', '3.4'],
    received: '3 December 2026',
    fileName: 'M1-M3_LB_Southwark_Hearing_Statement.pdf'
  },
  {
    id: 'hs-ludgate',
    consulteeId: 'ludgate-planning',
    questions: ['3.3'],
    received: '4 December 2026',
    fileName: 'M3_Ludgate_Planning_Hearing_Statement.pdf'
  }
]

// The authority's own responses, written out for the stages that start part-way through.
const DRAFT_RESPONSES = {
  '1.1': 'Consultation on the proposed local plan ran from 8 February to 22 March 2026, in line with Regulation 27. The Corporation consulted the prescribed bodies and published the plan, its evidence and a response form on its website. The summary of responses required by Regulation 30 sets out the main issues raised under each theme and how each has been taken into account. The Statement of compliance (CS-01) records each stage.',
  '1.2': 'The Greater London Authority has confirmed that the plan is in general conformity with the London Plan. Policy S3 plans to meet the City’s ten-year target in London Plan Policy H1 over the full plan period, and Policy S12 identifies the locations and heights where tall buildings may be appropriate, as London Plan Policy D9 requires. The statement of general conformity sets out the link for every London Plan policy.',
  '1.3': 'The Corporation has engaged with the London Borough of Southwark throughout plan preparation on the effect of tall buildings on views from the South Bank. Southwark’s hearing statement confirms that engagement. The protected views in Policy S13 implement the London View Management Framework, which applies across borough boundaries.',
  '2.1': 'Yes. The minimum target in Policy S3 rolls forward the London Plan’s ten-year figure for the City (1,460 homes) over the full plan period (Local Housing Needs Assessment, Chapter 3). The housing trajectory shows the target being met from permissions, allocations and a small sites allowance. The Greater London Authority supports the target in its hearing statement.',
  '2.2': 'The trajectory is based on sites with planning permission, sites identified in the residential areas and a small sites allowance supported by past completions. The Viability Assessment tests delivery on constrained sites (Viability Assessment, paragraph 3.1), and the Infrastructure Delivery Plan sets out the',
  '2.3': 'Yes. The 50% requirement on public sector land follows the threshold approach in London Plan Policy H5. The Viability Assessment tested it across the site typologies expected in the City and found it viable in every case.',
  '2.4': 'Policy S3 expects affordable housing to be provided on site. An off-site payment would be acceptable only where on-site provision is shown not to be practical and the payment would deliver more affordable homes. Viability assessments submitted to justify a lower contribution will be independently reviewed and published.',
  '2.5': 'Yes. Directing new homes to the identified residential areas follows London Plan Policy SD5, which gives offices priority in the Central Activities Zone, and protects office floorspace as the Employment Land Review recommends. The Noise and Soundscape Study supports keeping new homes away from late-night and servicing uses.',
  '3.1': 'Yes. The tall building areas and contours are based on the Tall Buildings Study and the townscape and heritage evidence. The contours step down towards the Tower of London and St Paul’s Cathedral. The Corporation has considered Historic England’s alternative contours and sets out why the plan’s contours strike the better balance in its response to Question 3.3.',
  '3.2': 'The 75m AOD definition reflects the City’s prevailing building heights, as London Plan Policy D9 asks boroughs to define. Buildings below 75m are assessed against the design policies and, where relevant, Policy S13’s protected views.',
  '3.3': 'Policy HE1 requires a Statement of Heritage Significance and a Heritage Impact Assessment for any proposal affecting a heritage asset or its setting. To address Historic England’s concern, the Corporation proposes a modification to bring the test for setting into the policy itself.',
  '3.4': 'Yes. Policy S13 implements the Mayor’s London View Management Framework and the St Paul’s Heights code, and identifies the City’s own significant views. Cumulative effects on views will be assessed through the verified views required by Policy HE1.'
}

// The three starting points on the landing page. Every one starts with the inspector's
// document received: the prototype doesn't show it arriving.
//   received  the document has just arrived, not yet checked
//   drafting  published, statements in, the housing matter part-answered
//   ready     every question answered, ready to send to the programme officer
function startingState (stage) {
  const state = {
    upload: null,
    confirmed: false,
    linkOverrides: {},
    published: null,
    statements: [],
    responses: {},
    sent: null,
    history: [
      { at: '3 November 2026', actor: OFFICER, action: 'Received the inspector’s matters, issues and questions (' + MIQ_DOCUMENT.ref + ')' }
    ]
  }
  // The prototype assumes the document has arrived: every stage starts with it.
  state.upload = { fileName: MIQ_DOCUMENT.fileName, at: '3 November 2026' }
  if (stage === 'received') return state

  state.confirmed = true
  state.published = { at: '4 November 2026', deadline: '4 December 2026', deadlineParts: Object.assign({}, MIQ_DOCUMENT.defaultDeadline) }
  state.statements = JSON.parse(JSON.stringify(HEARING_STATEMENTS))
  state.history.push(
    { at: '3 November 2026', actor: OFFICER, action: 'Checked the matters, issues and questions and their policies' },
    { at: '4 November 2026', actor: OFFICER, action: 'Published the matters, issues and questions, with hearing statements due by 4 December 2026' }
  )
  HEARING_STATEMENTS.forEach(statement => {
    state.history.push({ at: statement.received, actor: OFFICER, action: 'Received a hearing statement' })
  })

  if (stage === 'drafting') {
    state.responses['2.1'] = { text: DRAFT_RESPONSES['2.1'], complete: true, tests: ['justified', 'consistent'] }
    state.responses['2.2'] = { text: DRAFT_RESPONSES['2.2'], complete: false, tests: ['effective'] }
    state.history.push({ at: '7 December 2026', actor: OFFICER, action: 'Marked the response to question 2.1 as complete' })
    return state
  }

  QUESTIONS.forEach(question => {
    const text = question.id === '2.2'
      ? DRAFT_RESPONSES['2.2'] + ' services and utilities needed to support new homes in step with the trajectory (Infrastructure Delivery Plan 2024, paragraph 6.1).'
      : DRAFT_RESPONSES[question.id]
    state.responses[question.id] = { text, complete: true, tests: question.tests.slice() }
  })
  state.history.push({ at: '11 December 2026', actor: OFFICER, action: 'Marked every response as complete' })
  return state
}

module.exports = {
  OFFICER,
  INSPECTOR,
  PROGRAMME_OFFICER,
  MIQ_DOCUMENT,
  HEARING_PROGRAMME,
  SOUNDNESS_TESTS,
  MATTERS,
  QUESTIONS,
  HEARING_STATEMENTS,
  getMatter,
  getQuestion,
  startingState
}
