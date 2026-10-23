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
  label: 'Version 3',
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
    title: 'Scoping consultation: proposed local plan content',
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
  'Scoping consultation: proposed local plan content',
  'Consultation: proposed local plan',
  'Examination: proposed local plan',
  'Adopted plan'
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
  draftContent,
  startingState,
  getChapter,
  getSeedVersion
}
