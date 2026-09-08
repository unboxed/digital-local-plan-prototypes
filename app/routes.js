//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const appConfig = require('./config.json')

// --- Site-wide service header ---
//
// setupRouter() mounts this router at "/", ahead of the kit's own auto-view-rendering
// fallback (see node_modules/govuk-prototype-kit/server.js), so this middleware runs for every
// request — including pages with no custom route below, like the plain app/views/*/index.html
// prototype landing pages. That makes res.locals.activeSection/organisationName available to
// every template via layouts/main.html's `header` block, with no per-page wiring needed.
router.use((req, res, next) => {
  res.locals.organisationName = appConfig.organisationName
  if (req.path.startsWith('/project-management')) {
    res.locals.activeSection = 'project-management'
  } else if (req.path.startsWith('/policy-writing')) {
    res.locals.activeSection = 'policy-writing'
  } else if (req.path.startsWith('/evidence')) {
    res.locals.activeSection = 'evidence'
  }
  next()
})

// --- Evidence prototype (E2US3 / E2US4) ---
//
// Session-backed evidence tagging flow across three screens:
//   /evidence                    - evidence library, search and filters
//   /evidence/document-tagging   - document viewing, passage and note tagging
//   /evidence/results            - filtered results and export confirmation
//
// Evidence items are stored in req.session.data.evidenceItems. Search and
// filter state is stored in session too (evidenceSearch, evidenceTagFilter,
// evidencePolicyAreaFilter, evidencePolicyReferenceFilter) so it persists as
// a user moves between the library, the document and the results screen.

const DOCUMENT_SOURCE = 'Local Housing Needs Assessment'
const DOCUMENT_CHAPTER = 'Chapter 3: Housing need'

// Full, uninterrupted document body. Users highlight any part of this text
// directly rather than selecting from predefined chunks.
const DOCUMENT_PARAGRAPHS = [
  'Local population growth has increased demand for homes in the borough over the last decade. Forecasts suggest that households will continue to form at a faster rate than previously expected, leading to pressure on both the private rented and affordable housing markets.',
  'The council has a strategic objective to provide enough homes for future residents, while also ensuring that new development is delivered in a way that supports transport capacity, local services and environmental protection.',
  'Projected household growth over the next 15 years will place significant pressure on existing housing supply.',
  'Existing housing supply is heavily constrained by the availability of brownfield land, infrastructure delivery constraints and limited capacity in some strategic growth areas. These issues are likely to shape the authority\'s future development trajectory and the level of intervention required through the local plan.',
  'In several parts of the borough, the evidence suggests that housing demand is concentrated in areas with stronger public transport links and better access to services. This means that future growth may need to be planned carefully to maintain the balance between housing provision and local amenity.'
]

const SUGGESTED_TAGS = [
  'Need', 'Capacity', 'Heritage', 'Conservation', 'Green Belt',
  'AONB', 'SSSI', 'Article 4', 'Flood Risk', 'Site Allocations', 'Office'
]

// Maps each suggested tag to a govuk-tag colour modifier (blank = default blue)
const TAG_COLOURS = {
  'Need': '',
  'Capacity': 'grey',
  'Heritage': 'purple',
  'Conservation': 'turquoise',
  'Green Belt': 'green',
  'AONB': 'teal',
  'SSSI': 'magenta',
  'Article 4': 'orange',
  'Flood Risk': 'red',
  'Site Allocations': 'yellow',
  'Office': 'pink'
}

const POLICY_AREAS = [
  'Health, inclusion and safety',
  'Housing',
  'Infrastructure',
  'Design',
  'Offices',
  'Retail',
  'Culture and visitors',
  'Heritage and Tall Buildings',
  'Open Spaces and Green Infrastructure',
  'Climate Resilience',
  'Transport'
]

// Pre-encoded so the sidebar's nav links don't depend on a urlencode filter
// being available in Nunjucks.
const POLICY_AREA_LINKS = POLICY_AREAS.map(area => ({
  label: area,
  encoded: encodeURIComponent(area)
}))

const POLICY_REFERENCES = [
  'H1', 'H2', 'H3', 'T1', 'T2', 'EN1', 'EN2',
  'HE1', 'HE2', 'GB1', 'SA1', 'SA2', 'EMP1', 'OFF1'
]

// An evidence item's sourceType decides its display header:
//   document                     -> "<source> / <chapter>"
//   note                         -> "Note"
//   scoping-consultation-response -> "Scoping consultation response"
//   consultation-response        -> "Consultation response"
const NOTE_SOURCE_TYPES = [
  { value: 'note', label: 'Note' },
  { value: 'scoping-consultation-response', label: 'Scoping consultation response' },
  { value: 'consultation-response', label: 'Consultation response' }
]

// The prototype kit merges session-data-defaults.js into a brand new
// session with a shallow Object.assign, so a fresh session's evidenceItems
// starts out as the *same array object* as the seed data. Deep-clone it on
// first touch so pushing a new item never mutates the shared seed data
// (which would otherwise leak added evidence into every future session).
function getEvidenceItems (req) {
  if (!req.session.data.evidenceItemsOwned) {
    req.session.data.evidenceItems = JSON.parse(JSON.stringify(req.session.data.evidenceItems || []))
    req.session.data.evidenceItemsOwned = true
  }
  return req.session.data.evidenceItems
}

function asArray (value) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

// Splits a comma-joined string (built client-side from lozenge selections)
// into a clean list of tag names.
function parseTagList (value) {
  if (!value) return []
  return value.split(',').map(tag => tag.trim()).filter(Boolean)
}

function getFilters (req) {
  const policyArea = req.session.data.evidencePolicyAreaFilter || ''
  return {
    search: req.session.data.evidenceSearch || '',
    tags: asArray(req.session.data.evidenceTagFilter),
    policyArea,
    policyAreaEncoded: encodeURIComponent(policyArea),
    policyReference: req.session.data.evidencePolicyReferenceFilter || ''
  }
}

function filterEvidenceItems (items, filters) {
  const search = filters.search.trim().toLowerCase()
  const policyReference = filters.policyReference.trim().toLowerCase()

  return items.filter(item => {
    const allTags = item.tags.concat(item.customTags)

    if (search) {
      const haystack = [item.text, item.source, item.policyReference]
        .concat(allTags)
        .concat(item.policyAreas)
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(search)) return false
    }

    if (filters.tags.length && !filters.tags.some(tag => allTags.includes(tag))) {
      return false
    }

    if (filters.policyArea && !item.policyAreas.includes(filters.policyArea)) {
      return false
    }

    if (policyReference && !item.policyReference.toLowerCase().includes(policyReference)) {
      return false
    }

    return true
  })
}

const evidenceViewData = {
  suggestedTags: SUGGESTED_TAGS,
  tagColours: TAG_COLOURS,
  policyAreas: POLICY_AREAS,
  policyAreaLinks: POLICY_AREA_LINKS,
  policyReferences: POLICY_REFERENCES,
  noteSourceTypes: NOTE_SOURCE_TYPES
}

// --- Compatibility redirects for earlier prototype URLs ---

router.get('/evidence/selected-evidence', (req, res) => {
  res.redirect('/evidence')
})

router.get('/evidence/tag-insight', (req, res) => {
  res.redirect('/evidence/document-tagging')
})

// --- Document viewing, highlight-to-tag and note tagging ---

router.get('/evidence/document-tagging', (req, res) => {
  const items = getEvidenceItems(req)
  const savedPassages = items.filter(item => item.source === DOCUMENT_SOURCE && item.type === 'passage')

  res.render('evidence/document-tagging/index', Object.assign({}, evidenceViewData, {
    documentSource: DOCUMENT_SOURCE,
    documentSourceEncoded: encodeURIComponent(DOCUMENT_SOURCE),
    documentChapter: DOCUMENT_CHAPTER,
    documentParagraphs: DOCUMENT_PARAGRAPHS,
    savedItems: items.filter(item => item.source === DOCUMENT_SOURCE).slice().reverse(),
    savedPassagesJson: JSON.stringify(savedPassages)
  }))
})

router.post('/evidence/document-tagging', (req, res) => {
  const items = getEvidenceItems(req)

  // Lozenge selections arrive as a single comma-joined field. Anything that
  // isn't a recognised suggested tag is treated as a custom tag.
  const submittedTags = parseTagList(req.body.tags)
  const tags = submittedTags.filter(tag => SUGGESTED_TAGS.includes(tag))
  const customTags = submittedTags.filter(tag => !SUGGESTED_TAGS.includes(tag))
  const policyAreas = parseTagList(req.body.policyAreas)
  const policyReference = req.body.policyReference || ''
  const hasTags = tags.length || customTags.length || policyAreas.length

  if (req.body.entryType === 'passage') {
    const text = (req.body.selectedText || '').trim()
    if (text && hasTags) {
      items.push({
        id: 'evidence-' + Date.now(),
        type: 'passage',
        sourceType: 'document',
        text,
        source: DOCUMENT_SOURCE,
        chapter: DOCUMENT_CHAPTER,
        tags,
        customTags,
        policyAreas,
        policyReference
      })
    }
  } else if (req.body.entryType === 'note') {
    const text = (req.body.noteText || '').trim()
    const sourceType = NOTE_SOURCE_TYPES.some(candidate => candidate.value === req.body.sourceType)
      ? req.body.sourceType
      : 'note'
    if (text && hasTags) {
      items.push({
        id: 'evidence-' + Date.now(),
        type: 'note',
        sourceType,
        text,
        source: DOCUMENT_SOURCE,
        chapter: DOCUMENT_CHAPTER,
        tags,
        customTags,
        policyAreas,
        policyReference
      })
    }
  }

  res.redirect('/evidence/document-tagging')
})

// Removes a single tag (suggested or custom) from a saved item, clicked
// directly on its chip within the document view.
router.post('/evidence/document-tagging/remove-tag', (req, res) => {
  const items = getEvidenceItems(req)
  const item = items.find(candidate => candidate.id === req.body.itemId)

  if (item) {
    item.tags = item.tags.filter(tag => tag !== req.body.tag)
    item.customTags = item.customTags.filter(tag => tag !== req.body.tag)
    item.policyAreas = item.policyAreas.filter(area => area !== req.body.tag)
  }

  res.redirect('/evidence/document-tagging')
})

// A read-only, print/PDF-styled view of a document, opened in a new window
// by "Open in new window" actions. The prototype only holds the full body
// text for the interactive document (DOCUMENT_SOURCE) — for any other
// source, it falls back to showing the extracts already tagged from it.
router.get('/evidence/document-view', (req, res) => {
  const items = getEvidenceItems(req)
  const source = req.query.source || DOCUMENT_SOURCE
  const isInteractiveDocument = source === DOCUMENT_SOURCE

  res.render('evidence/document-view/index', {
    source,
    chapter: isInteractiveDocument ? DOCUMENT_CHAPTER : '',
    paragraphs: isInteractiveDocument ? DOCUMENT_PARAGRAPHS : [],
    extracts: isInteractiveDocument ? [] : items.filter(item => item.source === source).map(item => item.text)
  })
})

// --- Evidence library: policy area navigation, search, filter, browse ---

// The documents relating to the selected policy area (or all documents, if
// no area is selected) — one row per distinct source, regardless of how
// many tagged evidence items came from it.
function getDocumentsForPolicyArea (items, policyArea) {
  const inScope = policyArea
    ? items.filter(item => item.policyAreas.includes(policyArea))
    : items

  const documents = []
  inScope.forEach(item => {
    let document = documents.find(candidate => candidate.source === item.source)
    if (!document) {
      document = { source: item.source, chapter: item.chapter || '', count: 0, encoded: encodeURIComponent(item.source) }
      documents.push(document)
    }
    document.count += 1
  })

  return documents
}

router.get('/evidence', (req, res) => {
  const items = getEvidenceItems(req)
  const filters = getFilters(req)
  const documents = getDocumentsForPolicyArea(items, filters.policyArea)

  // The filtered evidence list only appears once the user has hit Apply on
  // the horizontal filter bar — browsing a policy area shows its documents
  // first, matching the "open a document" vs "filter for evidence" choice.
  const filtersApplied = req.query.applied === '1'
  const filteredItems = filtersApplied ? filterEvidenceItems(items, filters) : []

  res.render('evidence/index', Object.assign({}, evidenceViewData, {
    documents,
    items: filteredItems.slice().reverse(),
    resultCount: filteredItems.length,
    filtersApplied,
    filters
  }))
})

// --- Filtered results and export confirmation ---

router.get('/evidence/results', (req, res) => {
  const items = getEvidenceItems(req)
  const filters = getFilters(req)
  const filteredItems = filterEvidenceItems(items, filters)

  res.render('evidence/results/index', Object.assign({}, evidenceViewData, {
    items: filteredItems.slice().reverse(),
    resultCount: filteredItems.length,
    filters,
    exportSummary: req.query.exported ? req.session.data.evidenceExportSummary : null
  }))
})

router.post('/evidence/results', (req, res) => {
  const items = getEvidenceItems(req)
  const filters = getFilters(req)
  const filteredItems = filterEvidenceItems(items, filters)

  req.session.data.evidenceExportSummary = {
    count: filteredItems.length,
    filters
  }

  res.redirect('/evidence/results?exported=1')
})

// --- Policy writing prototype ---
//
// Session-backed, three-phase journey:
//   /policy-writing/starting-points/:step   - 7-step "starting points" wizard
//   /policy-writing/topics/...              - aggregate view + create/review topics
//   /policy-writing/write/:topicId          - policy writer drafting workspace
//
// Starting point items are stored in req.session.data.policyStartingPointItems, an object
// keyed by step slug. Topics are stored in req.session.data.policyTopics. The Sources panel in
// the writer workspace uses static seed data in req.session.data.policyWriterSources. All three
// follow the same lazy-deep-clone-on-first-touch pattern as getEvidenceItems above, since the
// kit merges session-data-defaults.js into a new session with a shallow Object.assign.

const STARTING_POINT_STEPS = [
  {
    slug: 'adopted-plan-chapters',
    group: 'now',
    navLabel: 'Add adopted plan chapters',
    hint: 'Enter in the chapters in your currently adopted plan, these might be called themes or sections. You do not need to enter in each policy now, this will happen later.',
    itemLabel: 'Adopted plan chapter',
    sourceLabel: 'Adopted plan'
  },
  {
    slug: 'existing-data-sources',
    group: 'now',
    navLabel: 'Add existing data sources',
    hint: 'Enter the data sources you currently hold that are relevant to this plan.',
    itemLabel: 'Data source',
    sourceLabel: 'Existing data source'
  },
  {
    slug: 'current-trends',
    group: 'now',
    navLabel: 'Add current trends',
    hint: 'Enter emerging trends you have identified that may need a new policy response.',
    itemLabel: 'Trend',
    sourceLabel: 'New need'
  },
  {
    slug: 'scoping-consultation-themes',
    group: 'next',
    navLabel: 'Add scoping consultation themes',
    hint: 'Enter the themes raised in your scoping consultation.',
    itemLabel: 'Scoping consultation theme',
    sourceLabel: 'Scoping consultation theme'
  },
  {
    slug: 'political-priorities',
    group: 'next',
    navLabel: 'Add political priorities',
    hint: 'Enter the political priorities relevant to this plan.',
    itemLabel: 'Political priority',
    sourceLabel: 'Political priority'
  },
  {
    slug: 'other-plans-policies-strategies',
    group: 'next',
    navLabel: 'Add other plans, policies or strategies',
    hint: 'Enter other plans, policies or strategies this plan needs to align with.',
    itemLabel: 'Plan, policy or strategy',
    sourceLabel: 'Other plan, policy or strategy'
  },
  {
    slug: 'nppf-sds-requirements',
    group: 'next',
    navLabel: 'Add NPPF and SDS requirements',
    hint: 'Enter the NPPF and Spatial Development Strategy requirements relevant to this plan.',
    itemLabel: 'NPPF or SDS requirement',
    sourceLabel: 'NPPF/SDS'
  }
]

const EXISTING_DOCUMENTS = [
  'SHLAA 2025', 'Brownfield register v2.0', 'Housing needs assessment study',
  'Strategic Flood Risk Assessment', 'Employment Land Review'
]

function findStartingPointStep (slug) {
  return STARTING_POINT_STEPS.find(step => step.slug === slug)
}

function getStartingPointItems (req, stepSlug) {
  if (!req.session.data.policyStartingPointItemsOwned) {
    req.session.data.policyStartingPointItems = JSON.parse(JSON.stringify(req.session.data.policyStartingPointItems || {}))
    req.session.data.policyStartingPointItemsOwned = true
  }
  if (!req.session.data.policyStartingPointItems[stepSlug]) {
    req.session.data.policyStartingPointItems[stepSlug] = []
  }
  return req.session.data.policyStartingPointItems[stepSlug]
}

function getPolicyTopics (req) {
  if (!req.session.data.policyTopicsOwned) {
    req.session.data.policyTopics = JSON.parse(JSON.stringify(req.session.data.policyTopics || []))
    req.session.data.policyTopicsOwned = true
  }
  return req.session.data.policyTopics
}

function getTopic (req, topicId) {
  return getPolicyTopics(req).find(topic => topic.id === topicId)
}

function getPolicyWriterSources (req) {
  if (!req.session.data.policyWriterSourcesOwned) {
    req.session.data.policyWriterSources = JSON.parse(JSON.stringify(req.session.data.policyWriterSources || []))
    req.session.data.policyWriterSourcesOwned = true
  }
  return req.session.data.policyWriterSources
}

// Builds the three-group sidebar (shared status vocabulary: Completed/In progress/Not started,
// shown via the status icons in partials/icons/status-icon.html) for every page across the
// starting-points and create-topics phases.
function buildStartingPointsSidebar (req, activeHref) {
  const stepNavItem = step => {
    const href = '/policy-writing/starting-points/' + step.slug
    const complete = getStartingPointItems(req, step.slug).length > 0
    return {
      text: step.navLabel,
      href,
      active: href === activeHref,
      status: complete ? 'Completed' : 'Not started'
    }
  }

  return [
    {
      heading: 'Policy starting points - now',
      items: STARTING_POINT_STEPS.filter(step => step.group === 'now').map(stepNavItem)
    },
    {
      heading: 'Policy starting points - next',
      items: STARTING_POINT_STEPS.filter(step => step.group === 'next').map(stepNavItem)
    },
    {
      heading: 'Create topics',
      items: [
        { text: 'Review starting points', href: '/policy-writing/topics/review-starting-points', active: activeHref === '/policy-writing/topics/review-starting-points' },
        { text: 'Create topics', href: '/policy-writing/topics/new', active: activeHref === '/policy-writing/topics/new' },
        { text: 'Review topics', href: '/policy-writing/topics', active: activeHref === '/policy-writing/topics' }
      ]
    }
  ]
}

// --- Starting points wizard: one shared route pair for all 7 steps ---

router.get('/policy-writing/starting-points/:step', (req, res) => {
  const step = findStartingPointStep(req.params.step)
  if (!step) return res.redirect('/policy-writing/starting-points/' + STARTING_POINT_STEPS[0].slug)

  const items = getStartingPointItems(req, step.slug)
  const editItem = req.query.edit ? items.find(item => item.id === req.query.edit) : null

  res.render('policy-writing/starting-points/step', {
    step,
    items,
    editItem,
    sidebarSections: buildStartingPointsSidebar(req, '/policy-writing/starting-points/' + step.slug)
  })
})

router.post('/policy-writing/starting-points/:step', (req, res) => {
  const step = findStartingPointStep(req.params.step)
  if (!step) return res.redirect('/policy-writing/starting-points/' + STARTING_POINT_STEPS[0].slug)

  const items = getStartingPointItems(req, step.slug)
  const text = (req.body.itemText || '').trim()

  if (text) {
    if (req.body.itemId) {
      const existing = items.find(item => item.id === req.body.itemId)
      if (existing) existing.text = text
    } else {
      items.push({ id: 'psp-' + Date.now(), text })
    }
  }

  res.redirect('/policy-writing/starting-points/' + step.slug)
})

router.post('/policy-writing/starting-points/:step/:itemId/remove', (req, res) => {
  const step = findStartingPointStep(req.params.step)
  if (step) {
    const items = getStartingPointItems(req, step.slug)
    const index = items.findIndex(item => item.id === req.params.itemId)
    if (index !== -1) items.splice(index, 1)
  }
  res.redirect('/policy-writing/starting-points/' + req.params.step)
})

// --- Review starting points: aggregate table across all 7 steps ---

router.get('/policy-writing/topics/review-starting-points', (req, res) => {
  const rows = []
  STARTING_POINT_STEPS.forEach(step => {
    getStartingPointItems(req, step.slug).forEach(item => {
      rows.push({
        id: item.id,
        text: item.text,
        stepSlug: step.slug,
        sourceLabel: step.sourceLabel,
        status: 'Not started'
      })
    })
  })

  res.render('policy-writing/topics/review-starting-points', {
    rows,
    sidebarSections: buildStartingPointsSidebar(req, '/policy-writing/topics/review-starting-points')
  })
})

router.post('/policy-writing/topics/review-starting-points/:sourceStep/:itemId/remove', (req, res) => {
  const step = findStartingPointStep(req.params.sourceStep)
  if (step) {
    const items = getStartingPointItems(req, step.slug)
    const index = items.findIndex(item => item.id === req.params.itemId)
    if (index !== -1) items.splice(index, 1)
  }
  res.redirect('/policy-writing/topics/review-starting-points')
})

// --- Topics list ---

router.get('/policy-writing/topics', (req, res) => {
  res.render('policy-writing/topics/index', {
    topics: getPolicyTopics(req),
    sidebarSections: buildStartingPointsSidebar(req, '/policy-writing/topics')
  })
})

// --- Create topics ---

router.get('/policy-writing/topics/new', (req, res) => {
  res.render('policy-writing/topics/new', {
    startingPointGroups: STARTING_POINT_STEPS.map(step => ({
      step,
      items: getStartingPointItems(req, step.slug)
    })),
    sidebarSections: buildStartingPointsSidebar(req, '/policy-writing/topics/new')
  })
})

router.post('/policy-writing/topics/new', (req, res) => {
  const topics = getPolicyTopics(req)
  const name = (req.body.topicName || '').trim()

  if (name) {
    const selectedRefs = asArray(req.body.startingPoints)
    const sources = selectedRefs.map(ref => {
      const [stepSlug, itemId] = ref.split('::')
      const step = findStartingPointStep(stepSlug)
      const item = step && getStartingPointItems(req, stepSlug).find(candidate => candidate.id === itemId)
      if (!step || !item) return null
      return { id: 'src-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6), label: item.text + ' (' + step.sourceLabel + ')' }
    }).filter(Boolean)

    topics.push({
      id: 'topic-' + Date.now(),
      name,
      assignedTo: '',
      brief: (req.body.brief || '').trim(),
      desiredImpact: '',
      sources,
      examplePolicies: [],
      evidenceNotes: '',
      linkedEvidence: [],
      additionalEvidenceNeeds: '',
      chapterTitle: '',
      explanatoryText: '',
      policyBlocks: [],
      policyHistory: [],
      latestNote: null
    })
  }

  res.redirect(req.body.action === 'add-another' ? '/policy-writing/topics/new' : '/policy-writing/topics')
})

// --- Review topics: single-topic detail ---

router.get('/policy-writing/topics/:topicId', (req, res) => {
  const topic = getTopic(req, req.params.topicId)
  if (!topic) return res.redirect('/policy-writing/topics')

  res.render('policy-writing/topics/show', {
    topic,
    existingDocuments: EXISTING_DOCUMENTS,
    sidebarSections: buildStartingPointsSidebar(req, '/policy-writing/topics')
  })
})

router.post('/policy-writing/topics/:topicId', (req, res) => {
  const topic = getTopic(req, req.params.topicId)
  if (topic) {
    topic.name = (req.body.topicName || topic.name).trim()
    topic.brief = req.body.brief || ''
    topic.desiredImpact = req.body.desiredImpact || ''
    topic.evidenceNotes = req.body.evidenceNotes || ''
    topic.additionalEvidenceNeeds = req.body.additionalEvidenceNeeds || ''
  }
  res.redirect('/policy-writing/topics/' + req.params.topicId)
})

router.get('/policy-writing/topics/:topicId/assigned-to', (req, res) => {
  const topic = getTopic(req, req.params.topicId)
  if (!topic) return res.redirect('/policy-writing/topics')
  res.render('policy-writing/topics/assigned-to', { topic })
})

router.post('/policy-writing/topics/:topicId/assigned-to', (req, res) => {
  const topic = getTopic(req, req.params.topicId)
  if (topic) topic.assignedTo = (req.body.assignedTo || '').trim()
  res.redirect('/policy-writing/topics/' + req.params.topicId)
})

router.post('/policy-writing/topics/:topicId/sources', (req, res) => {
  const topic = getTopic(req, req.params.topicId)
  const label = (req.body.sourceLabel || '').trim()
  if (topic && label) {
    topic.sources.push({ id: 'src-' + Date.now(), label })
  }
  res.redirect('/policy-writing/topics/' + req.params.topicId)
})

router.post('/policy-writing/topics/:topicId/sources/:sourceId/remove', (req, res) => {
  const topic = getTopic(req, req.params.topicId)
  if (topic) {
    topic.sources = topic.sources.filter(source => source.id !== req.params.sourceId)
  }
  res.redirect('/policy-writing/topics/' + req.params.topicId)
})

router.post('/policy-writing/topics/:topicId/example-policies', (req, res) => {
  const topic = getTopic(req, req.params.topicId)
  const label = (req.body.examplePolicyLabel || '').trim()
  if (topic && label) {
    topic.examplePolicies.push({ id: 'ep-' + Date.now(), label })
  }
  res.redirect('/policy-writing/topics/' + req.params.topicId)
})

router.post('/policy-writing/topics/:topicId/example-policies/:policyId/remove', (req, res) => {
  const topic = getTopic(req, req.params.topicId)
  if (topic) {
    topic.examplePolicies = topic.examplePolicies.filter(policy => policy.id !== req.params.policyId)
  }
  res.redirect('/policy-writing/topics/' + req.params.topicId)
})

// Evidence can be linked either by picking an existing document from the dropdown, or by
// choosing a file to upload. The prototype kit's default body parser doesn't process file
// uploads, so — consistent with the "Policy writer" workspace's decorative rich-text toolbar —
// the file input is present but not wired up; only the "link to existing document" path
// actually records a linked-evidence entry.
router.post('/policy-writing/topics/:topicId/linked-evidence', (req, res) => {
  const topic = getTopic(req, req.params.topicId)
  const label = (req.body.existingDocument || '').trim()
  if (topic && label) {
    topic.linkedEvidence.push({ id: 'le-' + Date.now(), label })
  }
  res.redirect('/policy-writing/topics/' + req.params.topicId)
})

// --- Policy writer workspace ---

router.get('/policy-writing/write/:topicId', (req, res) => {
  const topic = getTopic(req, req.params.topicId)
  if (!topic) return res.redirect('/policy-writing/topics')

  const sources = getPolicyWriterSources(req)
  const requestedKinds = asArray(req.query.sourceType)
  const activeKinds = requestedKinds.length ? requestedKinds : ['policy', 'evidence', 'comment']

  res.render('policy-writing/write/index', {
    topic,
    sources: sources.filter(source => activeKinds.includes(source.kind)),
    totalSourceCount: sources.length,
    activeKinds
  })
})

// Shared by both routes below so that clicking "Add policy block" (a submit button with its
// own formaction, inside the same form) saves whatever the user has already typed before
// appending a new block, rather than discarding it.
function saveWorkspaceFields (topic, body) {
  topic.chapterTitle = body.chapterTitle || ''
  topic.explanatoryText = body.explanatoryText || ''

  const submittedBlocks = body.policyBlocks || {}
  topic.policyBlocks.forEach((block, index) => {
    const submitted = submittedBlocks[index]
    if (submitted) {
      block.title = submitted.title || ''
      block.detail = submitted.detail || ''
    }
  })
}

router.post('/policy-writing/write/:topicId', (req, res) => {
  const topic = getTopic(req, req.params.topicId)
  if (topic) saveWorkspaceFields(topic, req.body)
  res.redirect('/policy-writing/write/' + req.params.topicId)
})

router.post('/policy-writing/write/:topicId/policy-blocks', (req, res) => {
  const topic = getTopic(req, req.params.topicId)
  if (topic) {
    saveWorkspaceFields(topic, req.body)
    topic.policyBlocks.push({ id: 'block-' + Date.now(), title: '', detail: '' })
  }
  res.redirect('/policy-writing/write/' + req.params.topicId)
})
