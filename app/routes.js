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
  } else if (req.path.startsWith('/user-stories')) {
    res.locals.activeSection = 'user-stories'
  }
  next()
})

const {
  DOCUMENT_SOURCE,
  DOCUMENT_CHAPTER,
  DOCUMENT_PARAGRAPHS,
  DOCUMENTS,
  getDocument
} = require('./data/documents.js')

const {
  getSearchTerms,
  getPoliciesForArea,
  getPolicy,
  getPolicyRefsForSource
} = require('./data/policies.js')
const { EVIDENCE_EXCERPTS } = require('./data/evidence-excerpts.js')
const { USER_STORY_THEMES, getUserStoryCount } = require('./data/user-stories.js')

// --- Evidence prototype (E2US3 / E2US4) ---
//
// Session-backed evidence tagging flow:
//   /evidence                    - index of the evidence prototypes
//   /evidence/library            - evidence library, policy areas, filters
//   /evidence/document-tagging   - document viewing, passage and note tagging
//   /evidence/review             - review a document: details, tag it by hand
//                                  or from an AI summary, and take notes
//   /evidence/document-view      - read-only, PDF-style document preview
//   /evidence/results            - filtered results and export confirmation
//
// Evidence items are stored in req.session.data.evidenceItems. Search and
// filter state is stored in session too (evidenceSearch, evidenceTagFilter,
// evidencePolicyAreaFilter, evidencePolicyReferenceFilter) so it persists as
// a user moves between the library, the document and the results screen.
//
// Note the kit's session middleware auto-stores both req.body and req.query
// into req.session.data, and skips any field whose name starts with "_" —
// which is why transient control fields here are named _returnTo.

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

// Date.now() alone collides when several items are created in the same
// millisecond (accepting several AI suggestions in one go does exactly
// that), and duplicate ids would make remove-tag strip a tag off the wrong
// item.
let evidenceIdCounter = 0
function nextEvidenceId () {
  evidenceIdCounter += 1
  return 'evidence-' + Date.now() + '-' + evidenceIdCounter
}

// Only ever redirect back to somewhere inside this prototype.
function safeReturn (value, fallback) {
  return typeof value === 'string' && value.indexOf('/evidence') === 0 ? value : fallback
}

// Builds an evidence item from a submitted tagging form. Tag lozenge
// selections arrive as a single comma-joined field; anything that isn't a
// recognised suggested tag is treated as a custom tag. Returns null when
// there is nothing worth saving.
function buildEvidenceItem (body, doc) {
  const submittedTags = parseTagList(body.tags)
  const tags = submittedTags.filter(tag => SUGGESTED_TAGS.includes(tag))
  const customTags = submittedTags.filter(tag => !SUGGESTED_TAGS.includes(tag))
  const policyAreas = parseTagList(body.policyAreas)

  if (!tags.length && !customTags.length && !policyAreas.length) return null

  const isNote = body.entryType === 'note'
  const text = (isNote ? body.noteText : body.selectedText || '').trim()
  if (!text) return null

  const sourceType = isNote
    ? (NOTE_SOURCE_TYPES.some(candidate => candidate.value === body.sourceType) ? body.sourceType : 'note')
    : 'document'

  return {
    id: nextEvidenceId(),
    type: isNote ? 'note' : 'passage',
    sourceType,
    text,
    source: doc.source,
    chapter: doc.chapter,
    tags,
    customTags,
    policyAreas,
    policyReference: body.policyReference || ''
  }
}

function removeTagFromItem (items, itemId, tag) {
  const item = items.find(candidate => candidate.id === itemId)
  if (!item) return

  item.tags = item.tags.filter(candidate => candidate !== tag)
  item.customTags = item.customTags.filter(candidate => candidate !== tag)
  item.policyAreas = item.policyAreas.filter(candidate => candidate !== tag)
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

// Everything a tag search can match: the suggested tags plus the policy
// references, tagged with their kind so the list can label them.
const TAG_SEARCH_OPTIONS = SUGGESTED_TAGS
  .map(tag => ({ value: tag, kind: 'tag' }))
  .concat(POLICY_REFERENCES.map(reference => ({ value: reference, kind: 'reference' })))

const evidenceViewData = {
  suggestedTags: SUGGESTED_TAGS,
  tagSearchOptionsJson: JSON.stringify(TAG_SEARCH_OPTIONS),
  tagColours: TAG_COLOURS,
  policyAreas: POLICY_AREAS,
  policyAreaLinks: POLICY_AREA_LINKS,
  policyReferences: POLICY_REFERENCES,
  noteSourceTypes: NOTE_SOURCE_TYPES
}

// --- Compatibility redirects for earlier prototype URLs ---

router.get('/evidence/selected-evidence', (req, res) => {
  res.redirect('/evidence/library')
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
  const item = buildEvidenceItem(req.body, getDocument(DOCUMENT_SOURCE))

  if (item) items.push(item)

  res.redirect('/evidence/document-tagging')
})

// Removes a single tag (suggested or custom) from a saved item, clicked
// directly on its chip within the document view.
router.post('/evidence/document-tagging/remove-tag', (req, res) => {
  removeTagFromItem(getEvidenceItems(req), req.body.itemId, req.body.tag)
  res.redirect('/evidence/document-tagging')
})

// --- Review evidence: document details, manual tagging or an AI summary ---

function getReviewReturn (source, fragment) {
  return '/evidence/review?source=' + encodeURIComponent(source) + (fragment || '')
}

router.get('/evidence/review', (req, res) => {
  const items = getEvidenceItems(req)
  const source = req.query.source || DOCUMENT_SOURCE
  const doc = getDocument(source)
  const fromThisDocument = items.filter(item => item.source === source)

  // Whether a suggestion has been accepted is derived from the saved items
  // rather than stored separately, so the summary's "added" state and the
  // document's highlights can never disagree.
  const savedTexts = fromThisDocument.map(item => item.text)
  const dismissed = asArray(req.session.data.evidenceDismissedSuggestions)
  const summaryGenerated = asArray(req.session.data.evidenceSummariesGenerated).includes(source)

  const summarySections = (doc.summary ? doc.summary.sections : [])
    .filter(section => !dismissed.includes(section.id))
    .map(section => Object.assign({}, section, { saved: savedTexts.includes(section.quote) }))

  res.render('evidence/review/index', Object.assign({}, evidenceViewData, {
    doc,
    sourceEncoded: encodeURIComponent(source),
    returnTo: getReviewReturn(source),
    summaryGenerated,
    summarySections,
    notes: fromThisDocument.filter(item => item.type === 'note').slice().reverse(),
    passages: fromThisDocument.filter(item => item.type === 'passage').slice().reverse(),
    savedPassagesJson: JSON.stringify(fromThisDocument.filter(item => item.type === 'passage')),
    documentParagraphsJson: JSON.stringify(doc.paragraphs)
  }))
})

router.post('/evidence/review', (req, res) => {
  const items = getEvidenceItems(req)
  const doc = getDocument(req.body.source || DOCUMENT_SOURCE)
  const item = buildEvidenceItem(req.body, doc)

  if (item) items.push(item)

  res.redirect(safeReturn(req.body._returnTo, getReviewReturn(doc.source)))
})

router.post('/evidence/review/remove-tag', (req, res) => {
  removeTagFromItem(getEvidenceItems(req), req.body.itemId, req.body.tag)
  res.redirect(safeReturn(req.body._returnTo, '/evidence/review'))
})

router.post('/evidence/review/generate-summary', (req, res) => {
  const source = req.body.source || DOCUMENT_SOURCE
  const generated = asArray(req.session.data.evidenceSummariesGenerated)

  if (!generated.includes(source)) {
    req.session.data.evidenceSummariesGenerated = generated.concat(source)
  }

  res.redirect(safeReturn(req.body._returnTo, getReviewReturn(source, '#auto-summarise')))
})

// Accepts an AI suggestion, turning that section into a real tagged evidence
// item. The verbatim quote is saved (not the paraphrase) so the passage
// still matches when the document view draws its highlights.
router.post('/evidence/review/accept-suggestion', (req, res) => {
  const items = getEvidenceItems(req)
  const source = req.body.source || DOCUMENT_SOURCE
  const doc = getDocument(source)
  const section = (doc.summary ? doc.summary.sections : [])
    .find(candidate => candidate.id === req.body.sectionId)

  if (section && !items.some(item => item.source === source && item.text === section.quote)) {
    items.push(buildEvidenceItem({
      entryType: 'passage',
      selectedText: section.quote,
      tags: section.suggestedTags.join(','),
      policyAreas: section.suggestedPolicyAreas.join(','),
      policyReference: section.suggestedPolicyReference
    }, doc))
  }

  res.redirect(safeReturn(req.body._returnTo, getReviewReturn(source, '#auto-summarise')))
})

router.post('/evidence/review/dismiss-suggestion', (req, res) => {
  const source = req.body.source || DOCUMENT_SOURCE
  const dismissed = asArray(req.session.data.evidenceDismissedSuggestions)

  if (req.body.sectionId && !dismissed.includes(req.body.sectionId)) {
    req.session.data.evidenceDismissedSuggestions = dismissed.concat(req.body.sectionId)
  }

  res.redirect(safeReturn(req.body._returnTo, getReviewReturn(source, '#auto-summarise')))
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

router.get('/evidence/library', (req, res) => {
  const items = getEvidenceItems(req)
  const filters = getFilters(req)
  const documents = getDocumentsForPolicyArea(items, filters.policyArea)

  // The filtered evidence list only appears once the user has hit Apply on
  // the horizontal filter bar — browsing a policy area shows its documents
  // first, matching the "open a document" vs "filter for evidence" choice.
  const filtersApplied = req.query.applied === '1'
  const filteredItems = filtersApplied ? filterEvidenceItems(items, filters) : []

  res.render('evidence/library/index', Object.assign({}, evidenceViewData, {
    documents,
    items: filteredItems.slice().reverse(),
    resultCount: filteredItems.length,
    filtersApplied,
    filters
  }))
})

// --- User stories from the value proposition framework ---

router.get('/user-stories', (req, res) => {
  res.render('user-stories/index', {
    themes: USER_STORY_THEMES,
    storyCount: getUserStoryCount()
  })
})

// --- Policy: view a policy summary ---

// Everything the policy screen's keyword search looks through: the excerpts
// held against the evidence base, the evidence a user has tagged, and the body
// text of the documents that evidence came from. Results are shown as
// excerpts, so each passage carries where it came from (`source`/`ref`) and
// the policies it relates to (`policyRefs`), which the modal shows against it.
//
// Excerpts state their own policy refs; for the other two, the refs are the
// policies that cite the document, capped so a widely cited document doesn't
// swamp the result with refs.
const MAX_DERIVED_POLICY_REFS = 3

function getSearchableEvidence (items) {
  const passages = EVIDENCE_EXCERPTS.map(excerpt => ({
    text: excerpt.text,
    source: excerpt.source,
    ref: excerpt.ref,
    policyRefs: excerpt.policyRefs,
    tagged: false
  }))

  // A tagged item's own policyReference is deliberately not used here: the
  // Evidence prototype tags against its own reference set (H1, T2, EN1), not
  // the City Plan refs the policy screen shows, and mixing the two vocabularies
  // in one result list would be misleading.
  items.forEach(item => {
    if (passages.some(passage => passage.text === item.text)) return
    passages.push({
      text: item.text,
      source: item.source,
      ref: item.chapter || '',
      policyRefs: getPolicyRefsForSource(item.source).slice(0, MAX_DERIVED_POLICY_REFS),
      tagged: true
    })
  })

  Object.keys(DOCUMENTS).forEach(source => {
    const derivedRefs = getPolicyRefsForSource(source).slice(0, MAX_DERIVED_POLICY_REFS)

    DOCUMENTS[source].paragraphs.forEach(paragraph => {
      // A tagged extract is usually a sentence lifted out of a paragraph that
      // is also in the corpus, which would otherwise show up as two near
      // identical results. Keep one: the full paragraph, because it reads
      // better as an excerpt, still marked as tagged.
      const tagged = passages.find(passage => {
        return passage.tagged && passage.source === source && paragraph.indexOf(passage.text) !== -1
      })

      if (tagged) {
        tagged.text = paragraph
        return
      }

      if (passages.some(passage => passage.text === paragraph)) return

      passages.push({
        text: paragraph,
        source,
        ref: DOCUMENTS[source].chapter || '',
        policyRefs: derivedRefs,
        tagged: false
      })
    })
  })

  return passages
}

router.get('/policy-writing/policy-summary', (req, res) => {
  const items = getEvidenceItems(req)
  const policyArea = req.query.policyArea || ''
  const policies = getPoliciesForArea(policyArea)
  const policy = req.query.ref ? getPolicy(req.query.ref) : null

  res.render('policy-writing/policy-summary/index', {
    policyAreaLinks: POLICY_AREA_LINKS,
    tagColours: TAG_COLOURS,
    policyArea,
    policyAreaEncoded: encodeURIComponent(policyArea),
    policies,
    policy,
    searchableEvidenceJson: JSON.stringify(getSearchableEvidence(items)),
    searchTermsJson: JSON.stringify(getSearchTerms())
  })
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
