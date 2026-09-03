//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

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
  'Housing',
  'Employment and economy',
  'Transport and connectivity',
  'Environment and climate',
  'Heritage and design',
  'Green Belt and countryside',
  'Infrastructure and delivery'
]

const POLICY_REFERENCES = [
  'H1', 'H2', 'H3', 'T1', 'T2', 'EN1', 'EN2',
  'HE1', 'HE2', 'GB1', 'SA1', 'SA2', 'OFF1'
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
  return {
    search: req.session.data.evidenceSearch || '',
    tags: asArray(req.session.data.evidenceTagFilter),
    policyArea: req.session.data.evidencePolicyAreaFilter || '',
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
  policyReferences: POLICY_REFERENCES
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
    if (text && hasTags) {
      items.push({
        id: 'evidence-' + Date.now(),
        type: 'note',
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

// --- Evidence library: search, filter, browse ---

router.get('/evidence', (req, res) => {
  const items = getEvidenceItems(req)
  const filters = getFilters(req)
  const filteredItems = filterEvidenceItems(items, filters)

  res.render('evidence/index', Object.assign({}, evidenceViewData, {
    items: filteredItems.slice().reverse(),
    resultCount: filteredItems.length,
    totalCount: items.length,
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
