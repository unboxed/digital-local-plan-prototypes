// Static content for the "Publish plan versions" prototype
// (/project-management/publish-plan-versions). Built from the Figma frames in the git-ignored
// `Figma screenshots/Versioning/` folder.
//
// Version names, dates, people and layer dates are as drawn in the frames, by design request,
// even where they don't line up with the other prototypes' timeline. Plan wording is written for
// the prototype, except the foreword's first two paragraphs, which are the City Plan 2040's own.

const PLAN_TITLE = 'City of London Local Plan'

// The officer who publishes and shares new versions in the prototype.
const OFFICER = 'Danny Dyer'

// The chapters of the current draft, in plan order (frame 4).
const CHAPTERS = [
  { id: 'strategic-priorities', title: 'Strategic Priorities (Economic, Social, and Environmental objectives)', short: 'Strategic Priorities' },
  { id: 'spatial-strategy', title: 'Spatial Strategy' },
  { id: 'health', title: 'Health, Inclusion & Safety' },
  { id: 'housing', title: 'Housing' },
  { id: 'offices', title: 'Offices' },
  { id: 'retail', title: 'Retail' },
  { id: 'culture', title: 'Culture & Visitors' },
  { id: 'infrastructure', title: 'Infrastructure' },
  { id: 'design', title: 'Design' },
  { id: 'transport', title: 'Transport' },
  { id: 'heritage', title: 'Heritage & Tall buildings' },
  { id: 'open-spaces', title: 'Open Spaces & Green Infrastructure' },
  { id: 'climate', title: 'Climate Resilience' },
  { id: 'temple-thames', title: 'The Temple, the Thames Policy Area & the Key Areas of Change', short: 'The Temple, the Thames Policy Area & the Key Areas of Change' },
  { id: 'implementation', title: 'Implementation (including Planning Contributions and Monitoring)', short: 'Implementation' },
  { id: 'appendices', title: 'Appendices & Glossary' }
]

// One or two paragraphs per chapter of the current draft. Spatial Strategy and Housing open with
// the same wording as the published excerpts, so comparing the draft with them shows what moved.
const DRAFT_PARAGRAPHS = {
  'strategic-priorities': [
    'The plan sets out economic, social and environmental objectives for the City to 2040, so that growth in jobs and homes goes hand in hand with a healthier, greener and more inclusive Square Mile.'
  ],
  'spatial-strategy': [
    'Growth will be focused in accessible locations, supporting the City’s role as a business centre.',
    'Development should protect heritage and improve public spaces, walking routes and the setting of the river.'
  ],
  'health': [
    'Development should support healthy, inclusive and safe places, designed so that everyone can use buildings and public spaces independently.'
  ],
  'housing': [
    'New housing will contribute to a range of high-quality homes.',
    'Development should support existing communities and provide access to local services and open space.'
  ],
  'offices': [
    'The City will provide for at least 1.2 million square metres of net additional office floorspace by 2040, prioritising high-quality, flexible workspace.'
  ],
  'retail': [
    'Retail and other active uses will be supported in the Principal Shopping Centres, keeping ground floors lively throughout the week.'
  ],
  'culture': [
    'Cultural venues, visitor attractions and the City’s evening economy will be protected and expanded, with the Culture Mile at their heart.'
  ],
  'infrastructure': [
    'New development must be served by adequate utilities, digital connectivity and social infrastructure, delivered in step with growth.'
  ],
  'design': [
    'All development should be of exemplary design, contributing positively to the City’s townscape and the quality of its streets and spaces.'
  ],
  'transport': [
    'Streets will prioritise people walking, wheeling and cycling, with reduced motor traffic and safer junctions across the City.'
  ],
  'heritage': [
    'The City’s heritage assets and their settings will be conserved and enhanced. Tall buildings will be directed to the Tall Buildings Policy Area.'
  ],
  'open-spaces': [
    'Existing open spaces will be protected and new publicly accessible spaces, greening and urban habitats created as part of development.'
  ],
  'climate': [
    'Development must be net zero carbon in operation, minimise embodied carbon and be designed to cope with heat, flooding and drought.'
  ],
  'temple-thames': [
    'The Temple, the Thames Policy Area and the Key Areas of Change will be managed to secure their distinctive character while accommodating growth.'
  ],
  'implementation': [
    'The plan will be delivered with partners and funded in part through planning obligations and the Community Infrastructure Levy, and monitored each year in the Authority Monitoring Report.'
  ],
  'appendices': [
    'The appendices list the evidence base, the policies map and a glossary of the terms used in the plan.'
  ]
}

const FOREWORD = [
  'The City of London is like nowhere else on Earth. A global economic powerhouse, and an ancient city. A centre of collaboration and innovation for the hundreds of thousands of people who work here every day. A destination for visitors and tourists who come to experience our unparalleled culture and heritage. A unique place to live – right in the heart of the capital. A place where the architecture of centuries past sits cheek-by-jowl with modern skyscrapers, creating a thrilling juxtaposition of form and function and a skyline that is recognisable the world over – telling the history of this great capital city in microcosm.',
  'The great paradox of the City – of all truly successful cities – is that to remain successful it has needed to adapt, to change and to grow. The City of today has enormous strengths but, like all places, it faces challenges. The City Plan 2040 will help to shape the City’s built environment in ways that rise to these challenges and make the most of our strengths.',
  'We need to continue creating the workplaces and the infrastructure that will attract businesses to the City, while making it a greener, more welcoming place for everyone who lives, works and visits here.'
]

// The draft being shared or published (frames 4 and 5).
const DRAFT = {
  saved: '29 September 2025',
  versionDate: '29 Sep 2025'
}

function draftChapter (chapter, index) {
  const number = index + 1
  return {
    id: chapter.id,
    heading: 'Chapter ' + number + ': ' + chapter.title,
    paragraphs: DRAFT_PARAGRAPHS[chapter.id].map((text, i) => ({ number: number + '.' + (i + 1), text }))
  }
}

// The draft's content for the chosen chapters (all of them when `chapterIds` is empty), as
// shown in the preview and snapshotted into a new version.
function draftContent (chapterIds) {
  const wanted = chapterIds && chapterIds.length ? chapterIds : CHAPTERS.map(c => c.id)
  return {
    foreword: FOREWORD,
    chapters: CHAPTERS.map(draftChapter).filter(chapter => wanted.includes(chapter.id))
  }
}

function excerpt (spatial, housing, extraSpatial) {
  const spatialParagraphs = [
    { number: '2.1', text: 'Growth will be focused in accessible locations, supporting the City’s role as a business centre.' },
    { number: '2.2', text: spatial }
  ]
  if (extraSpatial) spatialParagraphs.push({ number: '2.3', text: extraSpatial })
  return {
    chapters: [
      {
        id: 'introduction',
        heading: 'Chapter 1: Introduction',
        paragraphs: [{ number: '1.1', text: 'The Local Plan sets out the vision, priorities and planning policies for the City of London to 2040. It guides decisions on development and the use of land.' }]
      },
      { id: 'spatial-strategy', heading: 'Chapter 2: Spatial strategy', paragraphs: spatialParagraphs },
      {
        id: 'housing',
        heading: 'Chapter 3: Housing',
        paragraphs: [
          { number: '3.1', text: 'New housing will contribute to a range of high-quality homes.' },
          { number: '3.2', text: housing }
        ]
      }
    ]
  }
}

// Layers published with a version (frame 2). Names, geometry and feature counts come from the
// GIS catalogue in gis-layers.js; versions and created dates are the frame's.
function layers (versions) {
  return [
    { id: 'compass-historic-environment-2', type: 'evidence', version: versions[0], created: '30 June 2025' },
    { id: 'compass-draft-policy-13', type: 'plan', version: versions[1], created: '14 March 2025' },
    { id: 'compass-draft-policy-16', type: 'plan', version: versions[2], created: '14 March 2025' },
    { id: 'compass-draft-policy-17', type: 'plan', version: versions[3], created: '1 February 2025' },
    { id: 'compass-draft-policy-15', type: 'plan', version: '1.0.0', created: '1 February 2024' },
    { id: 'housing-completions', type: 'evidence', version: '1.0.0', created: '12 September 2025' },
    { id: 'housing-capacity-sites', type: 'evidence', version: versions[4], created: '3 October 2025' },
    { id: 'compass-historic-environment-6', type: 'plan', version: '1.0.0', created: '19 October 2026' }
  ]
}

// The four versions in the history (frame 1), oldest first.
const SEED_VERSIONS = [
  {
    id: 'scoping',
    title: 'Consultation: proposed local plan content and evidence',
    versionDate: '12 Sep 2025',
    published: '12 Sep 2025',
    publishedLong: '12 September 2025',
    exportedBy: 'Priya Shah',
    status: 'published',
    included: 'Full local plan',
    content: excerpt(
      'Development should protect heritage and improve public spaces.',
      'Development should support existing residential communities.'
    ),
    layers: []
  },
  {
    id: 'consultation',
    title: 'Consultation: proposed local plan',
    versionDate: '18 Sep 2025',
    published: '20 Sep 2025',
    publishedLong: '20 September 2025',
    exportedBy: 'Marcus Chen',
    status: 'published',
    included: 'Full local plan',
    content: excerpt(
      'Development should protect heritage and improve public spaces and walking routes.',
      'Development should support existing communities and provide access to local services.'
    ),
    layers: layers(['3.2.0', '1.0.0', '2.0.0', '1.1.0', '1.1.0'])
  },
  {
    id: 'examination',
    title: 'Examination: proposed local plan',
    versionDate: '02 Oct 2025',
    published: '03 Oct 2025',
    publishedLong: '3 October 2025',
    exportedBy: 'Leila Hassan',
    status: 'published',
    included: 'Full local plan',
    content: excerpt(
      'Development should protect heritage and improve public spaces and walking routes.',
      'Development should support existing communities and provide access to local services and open space.',
      'Tall buildings will be directed to the Tall Buildings Policy Area.'
    ),
    layers: layers(['3.2.0', '1.1.0', '2.0.0', '1.2.0', '1.1.0'])
  },
  {
    id: 'adopted',
    title: 'Adopted local plan',
    versionDate: '10 Oct 2025',
    published: '10 Oct 2025',
    publishedLong: '10 October 2025',
    exportedBy: 'Danny Dyer',
    status: 'published',
    included: 'Full local plan',
    content: excerpt(
      'Development should protect heritage and improve public spaces, walking routes and the setting of the river.',
      'Development should support existing communities and provide access to local services and open space.',
      'Tall buildings will be directed to the Tall Buildings Policy Area, outside the protected views.'
    ),
    layers: layers(['3.3.0', '1.1.0', '2.1.0', '1.2.0', '1.2.0'])
  }
]

// Milestones a published version can be linked to (frame 4).
const MILESTONES = [
  'Consultation: proposed local plan content and evidence',
  'Consultation: proposed local plan',
  'Examination: proposed local plan',
  'Adopted plan'
]

// Where each item stands, shown beside it in Share or publish: 'draft' | 'pending' (approval) |
// 'complete'. Invented. Anything the tester sends for approval also shows as pending.
const ITEM_STATUSES = {
  draft: { text: 'Draft', classes: 'govuk-tag--grey' },
  pending: { text: 'Pending approval', classes: 'govuk-tag--yellow' },
  complete: { text: 'Complete', classes: 'govuk-tag--green' }
}

const CHAPTER_STATUSES = {
  'strategic-priorities': 'complete',
  'spatial-strategy': 'complete',
  health: 'draft',
  housing: 'draft',
  offices: 'complete',
  retail: 'draft',
  culture: 'draft',
  infrastructure: 'pending',
  design: 'draft',
  transport: 'complete',
  heritage: 'pending',
  'open-spaces': 'draft',
  climate: 'draft',
  'temple-thames': 'draft',
  implementation: 'draft'
}

// The supporting documents Share or publish can include, after the chapters. "Other" asks for the
// document's name, and has no status.
const PLAN_DOCUMENTS = [
  { id: 'timetable', title: 'Timetable', status: 'complete' },
  { id: 'pid', title: 'Project initiation document', status: 'complete' },
  { id: 'notice', title: 'Notice of intention to commence', status: 'complete' },
  { id: 'gateway-1', title: 'Gateway 1 self-assessment summary', status: 'complete' },
  { id: 'statement-of-compliance', title: 'Statement of compliance', status: 'draft' },
  { id: 'scoping-summary', title: 'Summary of scoping consultation', status: 'complete' },
  { id: 'timetable-amendments', title: 'Schedule of amendments to timetable', status: 'pending' },
  { id: 'policy-map', title: 'Policy map', status: 'draft' },
  { id: 'sea', title: 'Strategic environmental assessment (SEA)', status: 'draft' },
  { id: 'modifications', title: 'Modifications report', status: 'draft' },
  { id: 'other', title: 'Other' }
]

// The supporting documents and their versions, for the table under the plan's version history,
// each version's page and comparing two versions of one document (one per PLAN_DOCUMENTS entry
// but "Other"). Text, dates, version numbers and people are invented for the prototype, in the
// history's 2025 timeline. Each version's text is the document's `base` paragraphs with that
// version's `edits` (by paragraph index; an index past the end adds one), in the same
// {chapters: [{id, heading, paragraphs}]} shape as a plan version, so ppvDiff compares them too.
// Versions are oldest first; the last is the latest. A draft has no published date. Only the
// policy map (plan layers) and the SEA (evidence layers) carry layers, in a plan version's
// {id, type, version, created} shape. `link` opens the document in the prototype that makes it.
const POLICY_MAP_LAYERS = [
  { id: 'compass-draft-policy-13', type: 'plan', version: '1.0.0', created: '14 March 2025' },
  { id: 'compass-draft-policy-15', type: 'plan', version: '1.0.0', created: '1 February 2024' },
  { id: 'compass-draft-policy-16', type: 'plan', version: '2.0.0', created: '14 March 2025' },
  { id: 'compass-draft-policy-17', type: 'plan', version: '1.1.0', created: '1 February 2025' }
]
const SEA_LAYERS = [
  { id: 'compass-historic-environment-2', type: 'evidence', version: '3.2.0', created: '30 June 2025' },
  { id: 'compass-historic-environment-6', type: 'evidence', version: '1.0.0', created: '19 October 2026' },
  { id: 'housing-completions', type: 'evidence', version: '1.0.0', created: '12 September 2025' }
]

const DOCUMENT_SOURCES = [
  {
    id: 'timetable',
    heading: 'Local plan timetable',
    link: { href: '/project-management/make-your-plan/timetable-placeholder', text: 'Open in Make your plan' },
    base: [
      'This timetable sets out the key stages for preparing the City Plan 2040 under the new plan-making system, and when each is expected.',
      'Scoping consultation will run for six weeks from July 2025. Gateway 1 is expected in August 2025.',
      'Consultation on the proposed local plan is planned for spring 2026, followed by Gateway 2 and submission for examination.'
    ],
    versions: [
      { version: '1.0', versionDate: '02 Jun 2025', published: '04 Jun 2025', exportedBy: 'Priya Shah' },
      {
        version: '2.0',
        versionDate: '10 Sep 2025',
        published: '12 Sep 2025',
        exportedBy: 'Priya Shah',
        edits: {
          1: 'Scoping consultation ran for six weeks from July 2025. Gateway 1 was held in September 2025, a month later than planned.',
          3: 'Later milestones have not moved. The timetable will be reviewed again after Gateway 2.'
        }
      }
    ]
  },
  {
    id: 'pid',
    heading: 'Project initiation document',
    link: { href: '/project-management/make-your-plan/pid', text: 'Open in Make your plan' },
    base: [
      'The City Plan 2040 sets out how the City will grow and change. This document sets out how the plan will be prepared, governed and resourced.',
      'The project is led by the Planning Policy team, reporting to the Planning and Transportation Committee.',
      'The budget covers evidence studies, consultation, examination and staff time over the 30-month plan-making period.'
    ],
    versions: [
      { version: '1.0', versionDate: '12 May 2025', published: '14 May 2025', exportedBy: 'Priya Shah' },
      {
        version: '1.1',
        versionDate: '30 Jun 2025',
        published: '01 Jul 2025',
        exportedBy: 'Marcus Chen',
        edits: { 1: 'The project is led by the Planning Policy team, reporting to the Planning and Transportation Committee through a monthly project board.' }
      },
      {
        version: '1.2',
        versionDate: '04 Sep 2025',
        published: '05 Sep 2025',
        exportedBy: 'Priya Shah',
        edits: {
          1: 'The project is led by the Planning Policy team, reporting to the Planning and Transportation Committee through a monthly project board.',
          2: 'The budget covers evidence studies, consultation, examination and staff time over the 30-month plan-making period, with a 10% contingency for additional evidence.'
        }
      }
    ]
  },
  {
    id: 'notice',
    heading: 'Notice of intention to commence',
    link: { href: '/project-management/make-your-plan/notice', text: 'Open in Make your plan' },
    base: [
      'The City of London Corporation gives notice that it intends to begin preparing a new local plan, the City Plan 2040.',
      'The plan will cover the whole of the City of London and set out planning policies to 2040.',
      'You can find out more and register for updates on the City of London Corporation website.'
    ],
    versions: [
      { version: '1.0', versionDate: '08 Sep 2025', published: '08 Sep 2025', exportedBy: 'Marcus Chen' }
    ]
  },
  {
    id: 'gateway-1',
    heading: 'Gateway 1 self-assessment summary',
    base: [
      'This summary sets out how the City Plan 2040 meets the Gateway 1 requirements before consultation on proposed plan content.',
      'The plan\'s scope and vision were set out in the scoping consultation, and the responses have been considered.',
      'An evidence plan is in place. Studies on housing need and employment land are under way.'
    ],
    versions: [
      { version: '0.9', versionDate: '01 Sep 2025', published: null, exportedBy: 'Leila Hassan' },
      {
        version: '1.0',
        versionDate: '15 Sep 2025',
        published: '16 Sep 2025',
        exportedBy: 'Marcus Chen',
        edits: {
          2: 'An evidence plan is in place. The housing need study is complete and the employment land study will report in November 2025.',
          3: 'No risks to the timetable were identified at Gateway 1.'
        }
      }
    ]
  },
  {
    id: 'statement-of-compliance',
    heading: 'Statement of compliance',
    link: { href: '/statement-of-compliance', text: 'Open in Statement of compliance' },
    base: [
      'This statement sets out how the City Plan 2040 has been prepared in line with the legal and procedural requirements.',
      'Consultation has followed the Statement of Community Involvement.',
      'A strategic environmental assessment is being prepared alongside the plan.'
    ],
    versions: [
      { version: '0.3', versionDate: '15 Sep 2025', published: null, exportedBy: 'Leila Hassan' },
      {
        version: '0.4',
        versionDate: '29 Sep 2025',
        published: null,
        exportedBy: 'Leila Hassan',
        edits: {
          1: 'Consultation has followed the Statement of Community Involvement. A summary of responses to the scoping consultation has been published.',
          3: 'The duty to cooperate has been met through regular meetings with neighbouring boroughs and the Greater London Authority.'
        }
      }
    ]
  },
  {
    id: 'scoping-summary',
    heading: 'Summary of scoping consultation',
    base: [
      'The scoping consultation ran from 7 July to 18 August 2025. We received 214 responses.',
      'Most responses supported the plan\'s focus on office growth, with many asking for more homes and better public spaces.',
      'The next version of the plan will respond to these points.'
    ],
    versions: [
      { version: '1.0', versionDate: '22 Sep 2025', published: '23 Sep 2025', exportedBy: 'Priya Shah' }
    ]
  },
  {
    id: 'timetable-amendments',
    heading: 'Schedule of amendments to timetable',
    base: [
      'This schedule lists changes to the local plan timetable since it was last published.',
      'Gateway 1 moved from August to September 2025 to allow time to consider scoping consultation responses.'
    ],
    versions: [
      { version: '1.0', versionDate: '26 Sep 2025', published: null, exportedBy: 'Priya Shah' }
    ]
  },
  {
    id: 'policy-map',
    heading: 'Policy map',
    base: [
      'The policy map shows where the plan\'s policies apply, as layers on a map of the City.',
      'It shows the City Cluster, the protected views and the conservation areas.',
      'The map will be updated as the plan\'s policies change.'
    ],
    versions: [
      { version: '0.5', versionDate: '12 Sep 2025', published: null, exportedBy: 'Leila Hassan', layers: POLICY_MAP_LAYERS.slice(0, 3) },
      {
        version: '0.6',
        versionDate: '29 Sep 2025',
        published: null,
        exportedBy: 'Leila Hassan',
        layers: POLICY_MAP_LAYERS,
        edits: { 1: 'It shows the City Cluster, the protected views, the conservation areas and the areas for new homes.' }
      }
    ]
  },
  {
    id: 'sea',
    heading: 'Strategic environmental assessment (SEA)',
    base: [
      'This assessment considers the likely environmental effects of the City Plan 2040 and reasonable alternatives to it.',
      'The main effects are on the historic environment, air quality and climate resilience.',
      'Mitigation will be set out for each significant effect.'
    ],
    versions: [
      { version: '0.2', versionDate: '05 Sep 2025', published: null, exportedBy: 'Marcus Chen', layers: SEA_LAYERS.slice(0, 1) },
      {
        version: '0.3',
        versionDate: '25 Sep 2025',
        published: null,
        exportedBy: 'Marcus Chen',
        layers: SEA_LAYERS,
        edits: {
          1: 'The main effects are on the historic environment, air quality, climate resilience and the supply of homes.',
          2: 'Mitigation is set out for each significant effect, with monitoring indicators.'
        }
      }
    ]
  },
  {
    id: 'modifications',
    heading: 'Modifications report',
    base: [
      'This report will list the changes proposed to the City Plan 2040 during examination.',
      'It will be completed once the Inspector has set out the modifications needed.'
    ],
    versions: [
      { version: '0.1', versionDate: '01 Oct 2025', published: null, exportedBy: 'Leila Hassan' }
    ]
  }
]

const SUPPORTING_DOCUMENTS = DOCUMENT_SOURCES.map(source => {
  const document = PLAN_DOCUMENTS.find(d => d.id === source.id)
  const versions = source.versions.map((v, index) => {
    const texts = source.base.slice()
    Object.keys(v.edits || {}).forEach(i => { texts[Number(i)] = v.edits[i] })
    return {
      key: source.id + ':' + v.version,
      documentId: source.id,
      title: document.title + ', version ' + v.version,
      version: v.version,
      versionDate: v.versionDate,
      published: v.published,
      exportedBy: v.exportedBy,
      latest: index === source.versions.length - 1,
      layers: v.layers || [],
      content: {
        chapters: [{
          id: source.id,
          heading: source.heading,
          paragraphs: texts.map((text, i) => ({ number: '1.' + (i + 1), text }))
        }]
      }
    }
  })
  return { id: source.id, title: document.title, status: document.status, link: source.link || null, versions }
})

// A supporting document's version from its key, "<document id>:<version>".
function getDocumentVersion (key) {
  const documentId = String(key).split(':')[0]
  const document = SUPPORTING_DOCUMENTS.find(d => d.id === documentId)
  return document ? document.versions.find(v => v.key === key) || null : null
}

// The plan-making milestones an item can be set to publish at, in the new system's order. Fuller
// than MILESTONES, which names the seeded versions.
const PUBLISH_MILESTONES = [
  'Notice of intention to commence',
  'Scoping consultation',
  'Gateway 1',
  'Consultation: proposed local plan content and evidence',
  'Gateway 2',
  'Consultation: proposed local plan',
  'Gateway 3',
  'Submission for examination',
  'Examination: proposed local plan',
  "Inspector's report",
  'Adopted plan'
]

// Managers who can approve publishing. Invented, like everyone else here.
const APPROVERS = [
  { id: 'helen-marsh', name: 'Helen Marsh', role: 'Policy Team Leader' },
  { id: 'rob-adeyemi', name: 'Rob Adeyemi', role: 'Head of Planning Policy' },
  { id: 'claire-whitfield', name: 'Claire Whitfield', role: 'Director of Planning' }
]

function startingState () {
  return {
    versions: JSON.parse(JSON.stringify(SEED_VERSIONS)),
    pending: null,
    flash: null,
    nextId: 1
  }
}

// A seeded version as published, for the Examination library to pin to. It reads the seed rather
// than session data, so a tester resetting or publishing can't change what was examined.
function getSeedVersion (id) {
  return SEED_VERSIONS.find(version => version.id === id) || null
}

function getChapter (id) {
  return CHAPTERS.find(chapter => chapter.id === id) || null
}

module.exports = {
  PLAN_TITLE,
  OFFICER,
  CHAPTERS,
  DRAFT,
  MILESTONES,
  PLAN_DOCUMENTS,
  SUPPORTING_DOCUMENTS,
  getDocumentVersion,
  ITEM_STATUSES,
  CHAPTER_STATUSES,
  PUBLISH_MILESTONES,
  APPROVERS,
  draftContent,
  startingState,
  getChapter,
  getSeedVersion
}
