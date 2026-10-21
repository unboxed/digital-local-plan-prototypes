// Static content for the "Viewing and structuring evidence" prototype
// (/evidence/viewing-structuring). Built from the Figma frames in the git-ignored
// `Figma screenshots/` folder (1 document-viewer, 1b hearing-transcript-viewer,
// 2 evidence-report-card, 3 evidence-list, 4 policy-writer-evidence).
//
// It is a set of linked screens with no session state: nothing here is mutated, so it is read
// straight from this module rather than seeded into session data.
//
// Copy is the frames' own, except where they disagreed with each other about which evidence
// item a reference points at (see CLAUDE.md). The documents, figures and people are invented
// for the prototype.

// Evidence types, in the order they appear in the key. `colour` picks the dlp-vse-type--*
// modifier. Each type keeps one colour on every screen.
const TYPES = {
  'fact': { label: 'Fact', colour: 'blue' },
  'expert-opinion': { label: 'Expert opinion', colour: 'yellow' },
  'concept': { label: 'Concept', colour: 'pink' },
  'inspector-comment': { label: 'Inspector comment', colour: 'orange' },
  'member-comment': { label: 'Member comment', colour: 'teal' }
}

const POLICY_AREAS = [
  { id: 'housing', text: 'Housing' },
  { id: 'offices', text: 'Offices' },
  { id: 'culture', text: 'Culture' },
  { id: 'infrastructure', text: 'Infrastructure' }
]

// Sources an officer reads and tags. `kind` decides the breadcrumb and the hint wording;
// a transcript block carries a `speaker`. A block with a `passage` is a tagged passage.
const SOURCES = {
  'ed-hou21': {
    id: 'ed-hou21',
    kind: 'document',
    shortTitle: 'ED HOU21',
    title: 'ED HOU21 - Strategic Housing Market Assessment',
    meta: 'Source document uploaded by CBRE Research · 14 March 2025',
    evidenceItem: 'ei-021',
    sections: [
      {
        heading: '3. Commercial Floorspace Supply and Demand',
        blocks: [
          { text: 'This section assesses historical absorption trends and future supply projections for office space in the City of London. Stock requirements have shifted post-2023, requiring a more dynamic planning response to accommodate the rapid evolution of technology and financial services hubs.' },
          {
            text: 'Net absorption of office space reached 1.8 million sq ft in the 12 months to Q4 2024, a 23% increase year-on-year, driven primarily by pre-lets in the EC2 and EC3 postcodes.',
            passage: { id: 'net-absorption', type: 'fact', quote: 'Net absorption of office space reached 1.8 million sq ft in the 12 months to Q4 2024, a 23% increase…' }
          },
          { text: 'Additionally, structural parameters surrounding workspace configuration are shifting rapidly. Industry experts indicate that historic space utilisation coefficients no longer represent current agile working arrangements.' },
          {
            text: 'Knight Frank recommends general office density parameters of 1 FTE per 8-13 sq m NIA to match structural shifts in commercial demand models.',
            passage: { id: 'density-parameters', type: 'expert-opinion', quote: 'Knight Frank recommends general office density parameters of 1 FTE per 8-13 sq m NIA to match structural sh…' }
          },
          { text: 'This supply deficit is compounded by qualitative mismatch. Older, low-spec secondary stock (Grade B or below) continues to experience rising vacancy rates, contrasting with the acute shortage of high-sustainability Grade A workspace.' },
          {
            text: 'Grade B vacancy has risen to 12.3%, indicating a structural oversupply of secondary stock that may be suitable for conversion to residential or mixed-use under permitted development rights.',
            passage: { id: 'grade-b-vacancy', type: 'concept', quote: 'secondary stock that may be suitable for conversion to residential or mixed-use under permitted development rig…' }
          }
        ]
      },
      {
        heading: '4. Employment Growth Projections',
        blocks: [
          { text: 'Baseline growth models suggest that professional service firms will account for over 60% of all new office occupancy demand in the square mile over the next decade. Standardised metrics must be established to align employment forecasting with zoning capacity.' },
          {
            text: 'Employment density benchmarks recommend 1 FTE per 8-13 sq m NIA for general office (B1a) use class, creating a baseline spatial planning standard.',
            passage: { id: 'density-benchmarks', type: 'fact', quote: 'Employment density benchmarks recommend 1 FTE per 8-13 sq m NIA for general office (B1a) use class.' }
          }
        ]
      }
    ]
  },
  'g1-hearing': {
    id: 'g1-hearing',
    kind: 'hearing',
    shortTitle: 'G1 Hearing',
    title: 'Gateway 1 Examination Hearing - Commercial Floorspace',
    meta: 'Transcript recorded 8 November 2024 · Inspector: Sarah Mitchell',
    evidenceItem: 'ei-008',
    sections: [
      {
        heading: 'Gateway 1 Hearing Transcript (Official Record)',
        blocks: [
          { speaker: 'Inspector Mitchell', text: 'I am opening this session of the Gateway 1 examination hearing. Today we will focus on examining the overall soundness of the commercial floorspace planning policy under Policy S4. I would like to ask the Council to formally summarise the evidence base supporting their projected office demand figures. Specifically, please explain the methodology behind your target of 1.2 million sq ft of net new workspace.' },
          {
            speaker: 'Mr Davies (City of London)',
            text: 'We are relying on the CBRE employment projections which indicate a solid 2.3% annual growth in financial services jobs. Based on standard NIA parameters, this drives our baseline target of 1.2 million sq ft of Grade A floorspace which is thoroughly detailed in the Economic Evidence Base Study.',
            passage: { id: 'employment-projections', type: 'fact', quote: 'solid 2.3% annual growth in financial services jobs… 1.2 million sq ft target.' }
          },
          {
            speaker: 'Inspector Mitchell',
            text: 'Are those vacancy rate assumptions still valid given the significant structural changes in post-pandemic agile working patterns? Specifically, is the 8.5% vacancy rate benchmark realistic?',
            passage: { id: 'vacancy-question', type: 'inspector-comment', quote: 'Are those vacancy rate assumptions still valid given agile patterns?' }
          },
          {
            speaker: 'Ms Chen (Workspace Association)',
            text: 'We are concerned that this local plan significantly underestimates demand for agile space. In 2023, approximately 34% of all new office lettings across EC2 and EC3 were secured by flexible workspace operators.',
            passage: { id: 'flexible-lettings', type: 'member-comment', quote: 'approximately 34% of all new office lettings in EC2 and EC3 were flexible.' }
          },
          { speaker: 'Mr Davies (City of London)', text: 'To respond to Ms Chen\'s point, the Council asserts that flexible workspace demand is already captured aggregate-wide within our broader B1a use class modelling. We ran comprehensive sensitivity scenarios in our Commercial Floorspace Demand Study to ensure the parameters could comfortably cushion variations in operator type.' },
          { speaker: 'Inspector Mitchell', text: 'I note those points. Let us turn to the conversion policies. Specifically, is the protection threshold of 1,000 sq m for Article 4 Direction zoning interventions backed by solid empirical evidence?' },
          {
            speaker: 'Dr Patel (Historic England)',
            text: 'Large-scale commercial conversions in conservation areas raise major concerns. We have identified 3 specific listed buildings at high risk of losing their primary architectural integrity if subject to unchecked permitted development.',
            passage: { id: 'heritage-conversions', type: 'member-comment', quote: 'heritage implications of commercial conversions… 3 listed buildings at risk.' }
          },
          {
            speaker: 'Inspector Mitchell',
            text: 'In conclusion for this session, I direct the Council to submit supplementary evidence outlining their vacancy rate methodology and a clear justification for the 1,000 sq m Article 4 threshold by 6 December 2024.',
            passage: { id: 'inspector-direction', type: 'inspector-comment', quote: 'Council directed to submit supplementary evidence by 6 December 2024.' }
          }
        ]
      }
    ]
  }
}

// Evidence items: insights drawn out of a source and structured so they can be listed and cited.
// `headline` is the one line shown on a list card. `sourcePath` is set only where the source is one
// of the SOURCES above, so "View source" never leads nowhere.
const EVIDENCE_ITEMS = {
  'ei-021': {
    id: 'ei-021',
    ref: 'EI 021',
    title: 'Economic impacts of floor space',
    description: 'Analysing the economic impacts of commercial floorspace provision, demand projections, and development pipeline capacity across the City of London.',
    sourceTitle: 'Strategic Housing Market Assessment',
    sourceDocument: 'ED HOU21 - Strategic Housing Market Assessment',
    sourceType: 'Commissioned evidence',
    sourcePath: 'documents/ed-hou21',
    types: ['fact', 'expert-opinion'],
    policyArea: 'Offices',
    relatesTo: ['Economic impact', 'Growth'],
    date: '14 March 2025',
    author: 'CBRE Research',
    headline: 'Net absorption of office space reached 1.8 million sq ft in 12 months to Q4 2024, a 23% increase year-on-year.',
    summary: 'This evidence base quantifies the current and projected demand for commercial office floorspace across the City of London. It analyses net absorption rates, vacancy levels by grade, and pipeline supply against forecast employment growth in financial and professional services sectors. The assessment identifies a shortfall of approximately 1.2 million sq ft of Grade A office space by 2030 under the baseline growth scenario.',
    findings: [
      'Total office floorspace stock in the City stands at 82.4 million sq ft (7.65 million sq m), of which 68% is classified as Grade A or refurbished to Grade A standard.',
      'Net absorption of office space reached 1.8 million sq ft in the 12 months to Q4 2024, a 23% increase year-on-year, driven primarily by pre-lets in the EC2 and EC3 postcodes.',
      'The development pipeline contains 4.6 million sq ft of consented but unbuilt office floorspace, of which only 1.9 million sq ft is under construction with expected delivery before 2028.',
      'Grade B vacancy has risen to 12.3%, indicating a structural oversupply of secondary stock that may be suitable for conversion to residential or mixed-use under permitted development rights.'
    ]
  },
  'ei-034': {
    id: 'ei-034',
    ref: 'EI 034',
    title: 'Affordable workspace requirement',
    description: 'The plan\'s existing requirement for affordable workspace in large new developments, and how it has been applied.',
    sourceTitle: 'City Plan 2036 Matters Statement',
    sourceDocument: 'City Plan 2036 Matters Statement',
    sourceType: 'Matters Statement',
    types: ['concept'],
    policyArea: 'Offices',
    relatesTo: ['Affordable workspace'],
    date: '2 September 2024',
    author: 'City of London Corporation',
    headline: 'Policy SI.1 requires minimum 30% affordable workspace provision in new developments exceeding 1,000 sq m GIA.',
    summary: 'The Matters Statement sets out the Council\'s position on affordable workspace. It explains how the 30% requirement for developments over 1,000 sq m GIA was arrived at, and how it interacts with viability testing on major schemes.',
    findings: [
      'Policy SI.1 requires minimum 30% affordable workspace provision in new developments exceeding 1,000 sq m GIA.',
      'The requirement has been applied to 14 major schemes since adoption, with 9 delivering it in full.',
      'Where the requirement is reduced on viability grounds, a review mechanism applies at practical completion.'
    ]
  },
  'ei-008': {
    id: 'ei-008',
    ref: 'EI 008',
    title: 'Gateway 1 Hearing Direction',
    description: 'What the Inspector asked of the Council at the Gateway 1 hearing on commercial floorspace, and the points raised by participants.',
    sourceTitle: 'Gateway 1 Hearing Direction',
    sourceDocument: 'Gateway 1 Examination Hearing - Commercial Floorspace',
    sourceType: 'G1 Hearing',
    sourcePath: 'hearings/g1-hearing',
    types: ['inspector-comment', 'member-comment'],
    policyArea: 'Offices',
    relatesTo: ['Article 4', 'Vacancy'],
    date: '8 November 2024',
    author: 'Inspector Sarah Mitchell',
    headline: 'The Inspector directed the Council to justify its vacancy rate methodology and the 1,000 sq m Article 4 threshold by 6 December 2024.',
    summary: 'At the Gateway 1 hearing the Inspector questioned the vacancy rate assumptions behind the office demand figures and asked whether the 1,000 sq m Article 4 threshold is supported by evidence. Participants raised the growth of flexible workspace and the heritage risk from large conversions in conservation areas.',
    findings: [
      'The Council is directed to submit supplementary evidence on its vacancy rate methodology and the 1,000 sq m Article 4 threshold by 6 December 2024.',
      'The Inspector questioned whether the 8.5% vacancy rate benchmark remains realistic given post-pandemic working patterns.',
      'The Workspace Association reported that approximately 34% of new office lettings across EC2 and EC3 in 2023 went to flexible workspace operators.',
      'Historic England identified 3 listed buildings at high risk from unchecked permitted development conversions.'
    ]
  },
  'ei-045': {
    id: 'ei-045',
    ref: 'EI 045',
    title: 'Grade A office demand to 2034',
    description: 'Forecast demand for Grade A office floorspace set against the development pipeline.',
    sourceTitle: 'Commercial Floorspace Demand Study',
    sourceDocument: 'Commercial Floorspace Demand Study',
    sourceType: 'Commissioned evidence',
    types: ['fact', 'concept'],
    policyArea: 'Offices',
    relatesTo: ['Economic impact', 'Growth'],
    date: '30 January 2025',
    author: 'Lichfields',
    headline: 'Forecast demand for Grade A office floorspace will exceed pipeline supply by 340,000 sq m by 2034.',
    summary: 'The study models demand for Grade A office floorspace under three growth scenarios, including sensitivity tests for flexible workspace and changing occupational densities, and compares each with the consented pipeline.',
    findings: [
      'Forecast demand for Grade A office floorspace will exceed pipeline supply by 340,000 sq m by 2034.',
      'Under the low growth scenario the shortfall falls to 120,000 sq m, still requiring new allocations.',
      'Flexible workspace operators are modelled within the B1a use class rather than as a separate sector.'
    ]
  },
  'ei-012': {
    id: 'ei-012',
    ref: 'EI 012',
    title: 'Employment density benchmarks',
    description: 'Employment density standards for converting floorspace into jobs, and the reverse.',
    sourceTitle: 'Employment Land Review',
    sourceDocument: 'Commissioned Employment Land Review',
    sourceType: 'Policy review',
    types: ['fact'],
    policyArea: 'Offices',
    relatesTo: ['Employment density'],
    date: '11 June 2024',
    author: 'Knight Frank',
    headline: 'Employment density benchmarks recommend 1 FTE per 8-13 sq m NIA for general office (B1a) use class.',
    summary: 'The review recommends employment density standards for the City\'s office stock, based on occupier surveys and national guidance, for use in translating employment forecasts into floorspace need.',
    findings: [
      'Employment density benchmarks recommend 1 FTE per 8-13 sq m NIA for general office (B1a) use class.',
      'Densities in newly let Grade A space average 10.4 sq m NIA per FTE.',
      'Densities have loosened by around 8% since 2019, reflecting hybrid working.'
    ]
  },
  'ei-029': {
    id: 'ei-029',
    ref: 'EI 029',
    title: 'Commercial completions 2023-24',
    description: 'Commercial floorspace completed in the latest monitoring year.',
    sourceTitle: 'Annual Monitoring Report 2024',
    sourceDocument: 'Annual Monitoring Report 2024',
    sourceType: 'Annual monitoring',
    types: ['fact'],
    policyArea: 'Offices',
    relatesTo: ['Monitoring'],
    date: '19 December 2024',
    author: 'City of London Corporation',
    headline: 'Completions of commercial floorspace totalled 185,000 sq m in monitoring year 2023-24, 12% above the 5-year average.',
    summary: 'The Annual Monitoring Report records completions, permissions and losses of commercial floorspace in the 2023-24 monitoring year.',
    findings: [
      'Completions of commercial floorspace totalled 185,000 sq m in monitoring year 2023-24, 12% above the 5-year average.',
      'Net loss of office floorspace through conversion was 9,200 sq m, mostly Grade B stock.',
      'Permissions granted in the year add 310,000 sq m to the pipeline.'
    ]
  }
}

// An officer's lists of evidence items. Only the first has content to show: the others carry
// a count so the My lists panel looks lived in, and render as plain cards rather than links.
const LISTS = [
  {
    id: 'economic-impacts',
    title: 'Economic impacts (floorspace)',
    items: ['ei-021', 'ei-034', 'ei-008', 'ei-045', 'ei-012', 'ei-029']
  },
  { id: 'heritage-impact', title: 'Heritage impact', count: 7 },
  { id: 'viability', title: 'Viability', count: 2 }
]

const POLICY_SECTIONS = [
  { id: 's1', text: 'S1: Spatial Strategy' },
  { id: 's2', text: 'S2: Housing Delivery' },
  { id: 's3', text: 'S3: Commercial Growth' },
  { id: 's4', text: 'S4: Office Floorspace' },
  { id: 's5', text: 'S5: Culture and Leisure' },
  { id: 's6', text: 'S6: Infrastructure' }
]

// The policy being drafted. A clause with `evidence` is linked to an evidence item.
const POLICIES = {
  's3': {
    id: 's3',
    ref: 'S3',
    title: 'Policy S3: Commercial Growth',
    shortTitle: 'S3: Commercial Growth',
    explanatoryText: 'The City of London\'s approach to commercial growth is designed to facilitate robust business activity and sustainable development across our core commercial districts. Meeting the rising demand for premium commercial floorspace requires a coordinated strategy of protecting existing high-quality offices while actively encouraging new developments that support local employment opportunities and the financial services sector.',
    intro: 'New commercial developments within the City of London will be assessed against their contribution to sustainable economic output, architectural excellence, and infrastructural capacity. To achieve these strategic goals, the following standards are enacted:',
    clauses: [
      { text: '1. The City of London will require the provision of a minimum of 1.2 million sq ft of new Grade A office floorspace to be delivered by 2030 to meet the projected expansion requirements of key tenant sectors.', evidence: 'ei-021', type: 'fact' },
      { text: '2. Development proposals that result in the net loss of major commercial floorspace in prime districts will be resisted unless it can be demonstrated that the building is no longer viable for continued employment use.' },
      { text: '3. To maintain structural balance, Article 4 Direction protections will apply to preserve commercial allocations for all offices exceeding a threshold of 1,000 sq m in continuous floor area.', evidence: 'ei-008', type: 'inspector-comment' },
      { text: '4. All major commercial developments must demonstrate an optimal employment density, aiming for a target operational standard of 1 FTE per 8–13 sq m NIA of new floorspace.', evidence: 'ei-012', type: 'fact' }
    ],
    detail: 'Implementation of Policy S3 will be monitored through annual authority monitoring reports (AMRs) tracking commercial completions, pipeline permissions, and vacancy rates. Specific supplementary planning guidance (SPG) will follow to detail the compliance pathways for mixed-use developments within secondary commercial zones.'
  }
}

function getSource (kind, id) {
  const source = SOURCES[id]
  return source && source.kind === kind ? source : null
}

function getEvidenceItem (id) {
  return EVIDENCE_ITEMS[id] || null
}

function getList (id) {
  const list = LISTS.find(l => l.id === id)
  return list && list.items ? list : null
}

function getPolicy (id) {
  return POLICIES[id] || null
}

// Every tagged passage in a source, in reading order, for the Tagged passages panel.
function getPassages (source) {
  return source.sections.flatMap(section => section.blocks.filter(b => b.passage).map(b => b.passage))
}

// The My lists panel, with each list's count derived from its items where it has them.
function getListSummaries () {
  return LISTS.map(list => ({
    id: list.id,
    title: list.title,
    count: list.items ? list.items.length : list.count,
    linked: Boolean(list.items)
  }))
}

module.exports = {
  TYPES,
  POLICY_AREAS,
  POLICY_SECTIONS,
  EVIDENCE_ITEMS,
  getSource,
  getEvidenceItem,
  getList,
  getPolicy,
  getPassages,
  getListSummaries
}
