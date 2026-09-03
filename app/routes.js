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

const DOCUMENT_PASSAGES = [
  {
    id: 'passage-1',
    chapter: 'Chapter 3: Housing need',
    text: 'Projected household growth over the next 15 years will place significant pressure on existing housing supply.'
  },
  {
    id: 'passage-2',
    chapter: 'Chapter 3: Housing need',
    text: 'Existing housing supply is heavily constrained by the availability of brownfield land, infrastructure delivery constraints and limited capacity in some strategic growth areas.'
  },
  {
    id: 'passage-3',
    chapter: 'Chapter 3: Housing need',
    text: 'In several parts of the borough, the evidence suggests that housing demand is concentrated in areas with stronger public transport links and better access to services.'
  }
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

function getEvidenceItems (req) {
  if (!Array.isArray(req.session.data.evidenceItems)) {
    req.session.data.evidenceItems = []
  }
  return req.session.data.evidenceItems
}

function asArray (value) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function parseCustomTags (value) {
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
      const haystack = [item.text, item.source, item.policyArea, item.policyReference]
        .concat(allTags)
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(search)) return false
    }

    if (filters.tags.length && !filters.tags.some(tag => allTags.includes(tag))) {
      return false
    }

    if (filters.policyArea && item.policyArea !== filters.policyArea) {
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
  policyAreas: POLICY_AREAS
}

// --- Compatibility redirects for earlier prototype URLs ---

router.get('/evidence/selected-evidence', (req, res) => {
  res.redirect('/evidence')
})

router.get('/evidence/tag-insight', (req, res) => {
  res.redirect('/evidence/document-tagging')
})

// --- Document viewing, passage selection and note tagging ---

router.get('/evidence/document-tagging', (req, res) => {
  const items = getEvidenceItems(req)

  res.render('evidence/document-tagging/index', Object.assign({}, evidenceViewData, {
    documentSource: DOCUMENT_SOURCE,
    passages: DOCUMENT_PASSAGES,
    savedItems: items.filter(item => item.source === DOCUMENT_SOURCE).slice().reverse()
  }))
})

router.post('/evidence/document-tagging', (req, res) => {
  const items = getEvidenceItems(req)
  const tags = asArray(req.body.tags)
  const customTags = parseCustomTags(req.body.customTag)
  const policyArea = req.body.policyArea || ''
  const policyReference = (req.body.policyReference || '').trim()

  if (req.body.entryType === 'passage') {
    const passage = DOCUMENT_PASSAGES.find(candidate => candidate.id === req.body.passageId)
    if (passage && (tags.length || customTags.length)) {
      items.push({
        id: 'evidence-' + Date.now(),
        type: 'passage',
        text: passage.text,
        source: DOCUMENT_SOURCE,
        tags,
        customTags,
        policyArea,
        policyReference
      })
    }
  } else if (req.body.entryType === 'note') {
    const noteText = (req.body.noteText || '').trim()
    if (noteText) {
      items.push({
        id: 'evidence-' + Date.now(),
        type: 'note',
        text: noteText,
        source: DOCUMENT_SOURCE,
        tags,
        customTags,
        policyArea,
        policyReference
      })
    }
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
