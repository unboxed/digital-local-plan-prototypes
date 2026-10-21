//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const appConfig = require('./config.json')
const sessionDataDefaults = require('./data/session-data-defaults.js')

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
  } else if (req.path.startsWith('/statement-of-compliance')) {
    res.locals.activeSection = 'statement-of-compliance'
  } else if (req.path.startsWith('/consultations')) {
    // Includes the inspector's screen, which overrides the header block to leave this nav out
    // (see consultations/managing-responses/partials/inspector-layout.html).
    res.locals.activeSection = 'consultations'
  } else if (req.path.startsWith('/pins-view')) {
    // Only the PINS hub page. The prototypes it links to are seen by inspectors, so they keep
    // their own external header with no internal nav (see partials/external-header).
    res.locals.activeSection = 'pins-view'
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
  POLICIES,
  getSearchTerms,
  getPoliciesForArea,
  getPolicy,
  getPolicyRefsForSource
} = require('./data/policies.js')
const { EVIDENCE_EXCERPTS } = require('./data/evidence-excerpts.js')
const { USER_STORY_THEMES, getUserStoryCount, getUserStoryThemeGroups, getUserStories } = require('./data/user-stories.js')
const { getParagraphsForPolicy, NATIONAL_POLICY_REFERENCES, POLICY_RESOURCES, POLICY_TEXT } = require('./data/plan-paragraphs.js')
const { POLICY_TEMPLATES, getPolicyTemplate } = require('./data/policy-templates.js')
const { getEvidenceDocument } = require('./data/evidence-documents.js')
const {
  getChapterStatus,
  getEvidenceStatus,
  getChapterOfficers,
  getChapterBrief,
  getChapterAuditLog,
  getStageStatuses,
  getPolicyStatus,
  getSourceOfficerNote,
  getEvidenceOfficerNote,
  getChapterContent
} = require('./data/gateway-2-progress.js')
const {
  getRequirements,
  getRequirement,
  getStatus: getRequirementStatus,
  getHistory: getRequirementHistory,
  getPlannedActivity,
  getPlanTimeline,
  isKnownDocument
} = require('./data/statement-of-compliance.js')

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

// The Local Plan's paragraphs, flattened into plan order (chapter, then policy, then
// paragraph within that policy) for the Examination - inspector view prototype. Computed once
// at startup since none of this is session data — array order *is* plan order, so moving to
// the previous/next paragraph is just stepping to the neighbouring array index.
const PLAN_PARAGRAPHS = POLICY_AREAS.flatMap(area =>
  getPoliciesForArea(area).flatMap(policy =>
    getParagraphsForPolicy(policy).map((paragraph, index) => ({
      id: policy.ref.toLowerCase() + '-' + (index + 1),
      policyRef: policy.ref,
      policyTitle: policy.title,
      policyArea: area,
      isStrategic: policy.isStrategic,
      sectionTitle: paragraph.sectionTitle,
      text: paragraph.text,
      body: paragraph.body,
      explanatoryText: paragraph.explanatoryText
    }))
  )
)

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
    themes: getUserStoryThemeGroups(),
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

// --- Managing commissioned evidence ---
//
// An officer briefs an external consultant, the consultant submits a report, and the officer
// reviews, comments, adds notes and accepts it into the evidence library:
//   /evidence/commissioned                       - landing page, with a reset per entry point
//   /evidence/commissioned/create-brief          - write and send the brief
//   /evidence/commissioned/brief(-sent)          - the sent brief, and its confirmation
//   /evidence/commissioned/consultant/...        - the consultant's screens (an external user)
//   /evidence/commissioned/review                - the report, with comments beside it
//   /evidence/commissioned/notes                 - notes, sent to the consultant or internal
//   /evidence/commissioned/accept                - tag and accept the report
//   /evidence/commissioned/source                - the accepted source in the library
//
// The consultant's screens wouldn't be reachable from the officer's journey in a real service.
// Testers get to them through "Prototype only" handoff panels (commissioned/partials/handoff.html)
// and from the landing page, and they use their own header without the internal nav.
//
// Everything is one object, req.session.data.commissionedEvidence, read only through
// getCommission. Free-text fields are named `_…` so the kit doesn't copy them into session data.

const CE = '/evidence/commissioned'
const COMMISSIONED_EVIDENCE_SCHEMA_VERSION = 2

const {
  THEMES: CE_THEMES,
  OFFICER: CE_OFFICER,
  PREVIOUS_CONSULTANTS,
  getPreviousConsultant,
  startingCommission,
  emptyReport
} = require('./data/commissioned-evidence.js')

function getCommission (req) {
  if (req.session.data.commissionedEvidenceSchemaVersion !== COMMISSIONED_EVIDENCE_SCHEMA_VERSION) {
    req.session.data.commissionedEvidence = JSON.parse(JSON.stringify(sessionDataDefaults.commissionedEvidence))
    req.session.data.commissionedEvidenceOwned = true
    req.session.data.commissionedEvidenceSchemaVersion = COMMISSIONED_EVIDENCE_SCHEMA_VERSION
  }
  if (!req.session.data.commissionedEvidenceOwned) {
    req.session.data.commissionedEvidence = JSON.parse(JSON.stringify(req.session.data.commissionedEvidence))
    req.session.data.commissionedEvidenceOwned = true
  }
  return req.session.data.commissionedEvidence
}

// The seed with the report taken out: the brief has gone to the consultant and nothing has come
// back yet. This is where "See the consultant's view" starts.
function briefSentCommission () {
  const commission = JSON.parse(JSON.stringify(sessionDataDefaults.commissionedEvidence))
  commission.stage = 'brief-sent'
  commission.report = emptyReport()
  commission.summary = null
  commission.comments = []
  commission.notes = []
  commission.history = commission.history.slice(0, 1)
  commission.gisConnection = null
  return commission
}

const CE_STARTS = {
  start: { build: startingCommission, redirect: CE + '/create-brief' },
  consultant: { build: briefSentCommission, redirect: CE + '/consultant/submit-report' },
  review: { build: () => JSON.parse(JSON.stringify(sessionDataDefaults.commissionedEvidence)), redirect: CE + '/review' }
}

function ceTimeZoneFormat (options) {
  return new Date().toLocaleString('en-GB', Object.assign({ timeZone: 'Europe/London' }, options))
}

function ceNow () {
  return ceTimeZoneFormat({ day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function ceToday () {
  return ceTimeZoneFormat({ day: 'numeric', month: 'long', year: 'numeric' })
}

function ceLog (commission, actor, action, link) {
  commission.history.push({ at: ceNow(), actor, action, link: link || null })
}

function ceText (value) {
  return typeof value === 'string' ? value.trim() : ''
}

function ceThemes (value) {
  return [].concat(value || []).filter(theme => CE_THEMES.includes(theme))
}

function ceNextId (prefix, items) {
  return prefix + Date.now().toString(36) + items.length
}

// Errors survive the redirect in session data, and are cleared as soon as they're shown.
function ceSetErrors (req, errors) {
  req.session.data.commissionedEvidenceErrors = errors
}

function ceTakeErrors (req) {
  const errors = req.session.data.commissionedEvidenceErrors || {}
  delete req.session.data.commissionedEvidenceErrors
  return errors
}

function ceErrorList (errors) {
  return Object.keys(errors).map(id => ({ text: errors[id], href: '#' + id }))
}

function ceCommentLabel (comment) {
  return comment.section || 'General comment'
}

// Sidebar statuses follow from where the commission has got to. Only three states here, by
// design: Not started, In progress (the page you're on) and Completed. A step that can't be
// done yet reads as Not started rather than showing a lock; its page redirects back anyway.
function buildCommissionSidebar (commission, active, layerCount) {
  const briefSent = commission.stage !== 'not-started'
  const accepted = commission.status === 'accepted'
  const steps = [
    { key: 'brief', text: 'Create brief', href: briefSent ? CE + '/brief' : CE + '/create-brief', done: briefSent },
    { key: 'review', text: 'Review and comment', href: CE + '/review', done: accepted },
    { key: 'layers', text: 'Add GIS layers', href: CE + '/layers', done: layerCount > 0 },
    { key: 'accept', text: 'Accept and save', href: CE + '/accept', done: accepted },
    { key: 'source', text: 'Manage source', href: CE + '/source', done: false }
  ]
  return [{
    items: steps.map(step => {
      const isActive = step.key === active
      let status = 'Not started'
      if (step.done) status = 'Completed'
      else if (isActive) status = 'In progress'
      return { text: step.text, href: step.href, active: isActive, status }
    })
  }]
}

// Numbers each comment that is anchored to a paragraph, in reading order, so the [n] beside a
// paragraph and the [n] on its comment match.
function numberCommission (commission) {
  const paragraphs = commission.report.paragraphs.map((paragraph, index) => ({
    id: paragraph.id,
    text: paragraph.text,
    position: index + 1,
    comments: []
  }))
  const numbers = {}
  let next = 1
  paragraphs.forEach(paragraph => {
    commission.comments.filter(comment => comment.anchor === paragraph.id).forEach(comment => {
      numbers[comment.id] = next++
      paragraph.comments.push({ id: comment.id, number: numbers[comment.id], resolved: comment.resolved })
    })
    paragraph.highlighted = paragraph.comments.some(comment => !comment.resolved)
  })
  const comments = commission.comments.map(comment => Object.assign({}, comment, { number: numbers[comment.id] || null }))
  return { paragraphs, comments }
}

function renderCommissionPage (req, res, view, active, locals) {
  const commission = getCommission(req)
  const errors = ceTakeErrors(req)
  res.render('evidence/commissioned/' + view, Object.assign({
    commission,
    themes: CE_THEMES,
    officer: CE_OFFICER,
    viewer: CE_OFFICER.name,
    errors,
    errorList: ceErrorList(errors),
    sidebarSections: buildCommissionSidebar(commission, active, commissionLayers(req).length)
  }, locals))
}

// The commission's GIS layers: those in the shared collection added from here.
function commissionLayers (req) {
  return getGisLayers(req).filter(layer => layer.origins.includes('commissioned')).map(gisLayerView)
}

router.get(CE, (req, res) => {
  res.render('evidence/commissioned/index')
})

router.post(CE + '/reset', (req, res) => {
  const start = CE_STARTS[req.body._stage] || CE_STARTS.start
  getCommission(req)
  req.session.data.commissionedEvidence = start.build()
  req.session.data.commissionedEvidenceOwned = true
  delete req.session.data.commissionedEvidenceErrors
  // The commission's layers are part of its state: clear them, then put back the ones the
  // review state is seeded with (startingGisLayers in app/data/gis-layers.js).
  getGisLayers(req).slice().forEach(layer => removeGisLayerOrigin(req, layer.id, 'commissioned'))
  if (req.session.data.commissionedEvidence.gisConnection) {
    GIS.COMMISSIONED_SEED_LAYERS.forEach(id => addGisLayer(req, id, 'evidence', 'commissioned'))
  }
  res.redirect(start.redirect)
})

// --- Create brief ---

router.get(CE + '/create-brief', (req, res) => {
  if (getCommission(req).stage !== 'not-started') return res.redirect(CE + '/brief')
  renderCommissionPage(req, res, 'create-brief', 'brief', { consultants: PREVIOUS_CONSULTANTS })
})

router.post(CE + '/create-brief', (req, res) => {
  const commission = getCommission(req)
  if (commission.stage !== 'not-started') return res.redirect(CE + '/brief')
  const brief = commission.brief
  const body = req.body

  // Keep what was typed, so a validation error doesn't lose it.
  brief.title = ceText(body._title)
  brief.text = ceText(body._brief)
  brief.link = ceText(body._link)
  if (ceText(body._file)) brief.file = ceText(body._file)
  brief.themes = ceThemes(body._themes)
  brief.consultantMode = body._consultantMode === 'new' ? 'new' : 'previous'
  brief.consultantId = ceText(body._consultantId)
  brief.newConsultant = {
    name: ceText(body._consultantName),
    organisation: ceText(body._consultantOrganisation),
    email: ceText(body._consultantEmail)
  }

  const errors = {}
  if (!brief.title) errors.title = 'Enter a title for the brief'
  if (!brief.text) errors.brief = 'Describe what the consultant needs to investigate or report on'
  let consultant = null
  if (brief.consultantMode === 'previous') {
    consultant = getPreviousConsultant(brief.consultantId)
    if (!consultant) errors.consultantId = 'Select a consultant'
  } else {
    if (!brief.newConsultant.name) errors.consultantName = 'Enter the consultant\'s full name'
    if (!brief.newConsultant.email) errors.consultantEmail = 'Enter the consultant\'s email address'
    consultant = brief.newConsultant
  }
  if (Object.keys(errors).length) {
    ceSetErrors(req, errors)
    return res.redirect(CE + '/create-brief')
  }

  brief.consultant = {
    name: consultant.name,
    organisation: consultant.organisation,
    email: consultant.email
  }
  brief.commencedOn = ceToday()
  commission.stage = 'brief-sent'
  commission.status = 'draft'
  commission.report = emptyReport()
  commission.summary = null
  commission.comments = []
  commission.notes = []
  commission.history = []
  commission.tags = []
  commission.acceptedOn = null
  ceLog(commission, CE_OFFICER.name, 'Created brief and assigned it to ' + brief.consultant.name,
    { text: 'View brief', href: CE + '/brief' })
  res.redirect(CE + '/brief-sent')
})

router.get(CE + '/brief-sent', (req, res) => {
  if (getCommission(req).stage === 'not-started') return res.redirect(CE + '/create-brief')
  renderCommissionPage(req, res, 'brief-sent', 'brief')
})

router.get(CE + '/brief', (req, res) => {
  if (getCommission(req).stage === 'not-started') return res.redirect(CE + '/create-brief')
  renderCommissionPage(req, res, 'brief', 'brief')
})

// --- The consultant's screens (external user) ---

function renderConsultantPage (req, res, view, locals) {
  const commission = getCommission(req)
  const errors = ceTakeErrors(req)
  const report = commission.report
  res.render('evidence/commissioned/consultant/' + view, Object.assign({
    commission,
    viewer: commission.brief.consultant ? commission.brief.consultant.name : 'the consultant',
    errors,
    errorList: ceErrorList(errors),
    // The seed holds the report as paragraphs only, so rebuild the text box's contents from them.
    reportContent: report.content || report.paragraphs.map(paragraph => paragraph.text).join('\n\n'),
    notesFromCouncil: commission.notes.filter(note => note.sentToConsultant).slice().reverse()
  }, locals))
}

router.get(CE + '/consultant/submit-report', (req, res) => {
  renderConsultantPage(req, res, 'submit-report')
})

router.post(CE + '/consultant/submit-report', (req, res) => {
  const commission = getCommission(req)
  if (commission.stage === 'not-started' || commission.status === 'accepted') {
    return res.redirect(CE + '/consultant/submit-report')
  }
  const report = commission.report
  report.title = ceText(req.body._reportTitle)
  report.content = typeof req.body._reportContent === 'string' ? req.body._reportContent.trim() : ''
  const file = ceText(req.body._file)
  if (file && !report.files.includes(file)) report.files.push(file)

  if (req.body._action === 'add-link') {
    const link = ceText(req.body._linkUrl)
    if (!link) {
      ceSetErrors(req, { linkUrl: 'Enter a URL to add' })
    } else if (!report.links.includes(link)) {
      report.links.push(link)
    }
    return res.redirect(CE + '/consultant/submit-report#add-links')
  }

  const errors = {}
  if (!report.title) errors.reportTitle = 'Enter a title for your report'
  if (!report.content) errors.reportContent = 'Enter your report content'
  if (Object.keys(errors).length) {
    ceSetErrors(req, errors)
    return res.redirect(CE + '/consultant/submit-report')
  }

  // A blank line starts a new paragraph. Comments keep their paragraph by position, and any
  // whose paragraph has gone become general comments.
  report.paragraphs = report.content.split(/\n\s*\n/)
    .map(text => text.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map((text, index) => ({ id: 'p' + (index + 1), text }))
  const ids = report.paragraphs.map(paragraph => paragraph.id)
  commission.comments.forEach(comment => {
    if (comment.anchor && !ids.includes(comment.anchor)) comment.anchor = null
  })
  const revised = Boolean(report.submittedAt)
  report.submittedAt = ceNow()
  commission.stage = 'submitted'
  ceLog(commission, commission.brief.consultant.name, revised ? 'Submitted revised draft report' : 'Submitted draft report',
    { text: 'View version', href: CE + '/review' })
  res.redirect(CE + '/consultant/submitted')
})

router.get(CE + '/consultant/submitted', (req, res) => {
  if (getCommission(req).stage !== 'submitted') return res.redirect(CE + '/consultant/submit-report')
  renderConsultantPage(req, res, 'submitted')
})

// --- Add GIS layers ---
//
// The officer connects the GIS service holding the evidence's spatial data and brings layers
// in. They join the shared gisLayers collection tagged Evidence, with the origin
// 'commissioned', and can be switched to Plan from here or anywhere else they are listed.

function renderCommissionLayers (req, res) {
  const commission = getCommission(req)
  if (commission.stage === 'not-started') return res.redirect(CE + '/create-brief')
  const layers = commissionLayers(req)
  renderCommissionPage(req, res, 'layers', 'layers', {
    layers,
    gis: gisConnectLocals(req, {
      action: CE + '/layers',
      connection: commission.gisConnection,
      catalogue: GIS.catalogueFor(commission.gisConnection, 'evidence'),
      addedIds: layers.map(layer => layer.id),
      intro: 'Connect the GIS service that holds the spatial data for this evidence, such as the consultant\'s or your own. You can then choose which of its layers to bring in. They are added as Evidence layers.'
    })
  })
}

router.get(CE + '/layers', renderCommissionLayers)

router.post(CE + '/layers/connect', (req, res) => {
  const commission = getCommission(req)
  const result = readGisConnection(req.body)
  if (result.errors) {
    setGisErrors(req, result.errors, result.values)
    return res.redirect(CE + '/layers#gis-connect')
  }
  commission.gisConnection = result.connection
  ceLog(commission, CE_OFFICER.name, 'Connected a GIS service')
  res.redirect(CE + '/layers#gis-layers')
})

// Disconnecting keeps the layers already added.
router.post(CE + '/layers/disconnect', (req, res) => {
  getCommission(req).gisConnection = null
  res.redirect(CE + '/layers#gis-connect')
})

router.post(CE + '/layers/layers', (req, res) => {
  const commission = getCommission(req)
  if (!commission.gisConnection) return res.redirect(CE + '/layers')
  const catalogue = GIS.getCatalogue(GIS.catalogueFor(commission.gisConnection, 'evidence'))
  const selected = asArray(req.body._layers).map(id => catalogue.find(layer => layer.id === id)).filter(Boolean)
  if (!selected.length) {
    setGisErrors(req, { layers: 'Select at least one layer to add' })
    return res.redirect(CE + '/layers#gis-layers')
  }
  selected.forEach(layer => addGisLayer(req, layer.id, 'evidence', 'commissioned'))
  ceLog(commission, CE_OFFICER.name, 'Added GIS layers: ' + selected.map(layer => layer.name).join(', '))
  res.redirect(CE + '/layers#added-layers')
})

router.post(CE + '/layers/:layerId/remove', (req, res) => {
  removeGisLayerOrigin(req, req.params.layerId, 'commissioned')
  res.redirect(CE + '/layers#added-layers')
})


router.get(CE + '/review', (req, res) => {
  const commission = getCommission(req)
  if (commission.stage === 'not-started') return res.redirect(CE + '/create-brief')
  const numbered = numberCommission(commission)
  renderCommissionPage(req, res, 'review', 'review', {
    paragraphs: numbered.paragraphs,
    comments: numbered.comments,
    openCount: commission.comments.filter(comment => !comment.resolved).length,
    history: commission.history.slice().reverse()
  })
})

router.post(CE + '/review/comments', (req, res) => {
  const commission = getCommission(req)
  const text = ceText(req.body._comment)
  if (!text) {
    ceSetErrors(req, { comment: 'Enter a comment' })
    return res.redirect(CE + '/review#add-comment')
  }
  const index = commission.report.paragraphs.findIndex(paragraph => paragraph.id === req.body._anchor)
  const comment = {
    id: ceNextId('c', commission.comments),
    author: CE_OFFICER.name,
    at: ceNow(),
    anchor: index >= 0 ? commission.report.paragraphs[index].id : null,
    section: index >= 0 ? 'Paragraph ' + (index + 1) : 'General comment',
    text,
    replies: [],
    resolved: false
  }
  commission.comments.push(comment)
  ceLog(commission, CE_OFFICER.name,
    index >= 0 ? 'Added comment on Paragraph ' + (index + 1) : 'Added general comment',
    { text: 'View comment', href: CE + '/review#comment-' + comment.id })
  res.redirect(CE + '/review#comment-' + comment.id)
})

router.post(CE + '/review/comments/:commentId/reply', (req, res) => {
  const commission = getCommission(req)
  const comment = commission.comments.find(candidate => candidate.id === req.params.commentId)
  if (!comment) return res.redirect(CE + '/review')
  const text = ceText(req.body._reply)
  if (!text) {
    ceSetErrors(req, { ['reply-' + comment.id]: 'Enter a reply' })
    return res.redirect(CE + '/review#comment-' + comment.id)
  }
  comment.replies.push({ author: CE_OFFICER.name, at: ceNow(), text })
  ceLog(commission, CE_OFFICER.name, 'Replied to comment on ' + ceCommentLabel(comment),
    { text: 'View comment', href: CE + '/review#comment-' + comment.id })
  res.redirect(CE + '/review#comment-' + comment.id)
})

// Resolving is offered on both Review and Manage source, so it goes back to wherever it came from.
router.post(CE + '/comments/:commentId/resolve', (req, res) => {
  const commission = getCommission(req)
  const comment = commission.comments.find(candidate => candidate.id === req.params.commentId)
  const back = req.body._returnTo === 'source' ? CE + '/source' : CE + '/review'
  if (comment && !comment.resolved) {
    comment.resolved = true
    ceLog(commission, CE_OFFICER.name, 'Resolved comment on ' + ceCommentLabel(comment),
      { text: 'View comment', href: CE + '/review#comment-' + comment.id })
  }
  res.redirect(back + (comment ? '#comment-' + comment.id : ''))
})

router.post(CE + '/review/resolve-all', (req, res) => {
  const commission = getCommission(req)
  const open = commission.comments.filter(comment => !comment.resolved)
  if (open.length) {
    open.forEach(comment => { comment.resolved = true })
    ceLog(commission, CE_OFFICER.name, 'Resolved all comments (' + open.length + ')')
  }
  res.redirect(CE + '/review')
})

// --- Notes ---

router.get(CE + '/notes', (req, res) => {
  const commission = getCommission(req)
  if (commission.stage === 'not-started') return res.redirect(CE + '/create-brief')
  renderCommissionPage(req, res, 'notes', 'review', { notes: commission.notes.slice().reverse() })
})

router.post(CE + '/notes', (req, res) => {
  const commission = getCommission(req)
  const text = ceText(req.body._note)
  if (!text) {
    ceSetErrors(req, { note: 'Enter a note' })
    return res.redirect(CE + '/notes')
  }
  const sentToConsultant = req.body._send === 'consultant'
  commission.notes.push({
    id: ceNextId('n', commission.notes),
    text,
    date: ceTimeZoneFormat({ day: 'numeric', month: 'short', year: 'numeric' }),
    time: ceTimeZoneFormat({ hour: '2-digit', minute: '2-digit' }),
    by: CE_OFFICER.name,
    sentToConsultant
  })
  ceLog(commission, CE_OFFICER.name,
    sentToConsultant ? 'Sent a note to ' + commission.brief.consultant.name : 'Added an internal note',
    { text: 'View notes', href: CE + '/notes' })
  res.redirect(CE + '/notes')
})

// --- Accept and save ---

router.get(CE + '/accept', (req, res) => {
  const commission = getCommission(req)
  if (commission.stage !== 'submitted') return res.redirect(CE + '/review')
  // Until someone has chosen tags, start from the themes the brief asked about.
  const selectedTags = commission.status === 'accepted' || commission.tags.length
    ? commission.tags
    : commission.brief.themes
  renderCommissionPage(req, res, 'accept', 'accept', {
    selectedTags,
    openCount: commission.comments.filter(comment => !comment.resolved).length
  })
})

router.post(CE + '/accept', (req, res) => {
  const commission = getCommission(req)
  if (commission.stage !== 'submitted') return res.redirect(CE + '/review')
  commission.tags = ceThemes(req.body._tags)
  if (commission.status === 'accepted') {
    ceLog(commission, CE_OFFICER.name, 'Updated tags')
  } else {
    commission.status = 'accepted'
    commission.acceptedOn = ceToday()
    ceLog(commission, CE_OFFICER.name, 'Accepted document and added it to the evidence library',
      { text: 'View version', href: CE + '/review' })
  }
  res.redirect(CE + '/source')
})

// --- Manage source ---

router.get(CE + '/source', (req, res) => {
  const commission = getCommission(req)
  if (commission.status !== 'accepted') return res.redirect(CE + '/accept')
  const numbered = numberCommission(commission)
  const report = commission.report
  const slug = (report.title || commission.brief.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  renderCommissionPage(req, res, 'source', 'source', {
    comments: numbered.comments,
    openCount: commission.comments.filter(comment => !comment.resolved).length,
    history: commission.history.slice().reverse(),
    file: report.file || { name: (slug || 'report') + '.pdf', meta: 'Generated from the submitted report' },
    summary: commission.summary || (report.paragraphs[0] && report.paragraphs[0].text) || '',
    layers: commissionLayers(req)
  })
})

// --- Viewing and structuring evidence ---
//
// Linked screens built from Figma frames, with no session state: every page is static content
// from app/data/viewing-structuring-evidence.js, looked up by id.
//   /evidence/viewing-structuring                      - landing page
//   /evidence/viewing-structuring/documents/:id        - a document, with its tagged passages
//   /evidence/viewing-structuring/hearings/:id         - a hearing transcript, the same way
//   /evidence/viewing-structuring/evidence-items/:id   - an evidence item's report card
//   /evidence/viewing-structuring/lists/:id            - an officer's list of evidence items
//   /evidence/viewing-structuring/policy/:id           - a policy citing evidence items
//
// Save, Edit, Remove, Export, Share and the Create links are inert placeholders from the design.
// An unknown id goes back to the landing page.

const VSE = '/evidence/viewing-structuring'

const {
  TYPES: VSE_TYPES,
  POLICY_AREAS: VSE_POLICY_AREAS,
  POLICY_SECTIONS: VSE_POLICY_SECTIONS,
  EVIDENCE_ITEMS: VSE_EVIDENCE_ITEMS,
  getSource: getVseSource,
  getEvidenceItem: getVseEvidenceItem,
  getList: getVseList,
  getPolicy: getVsePolicy,
  getPassages: getVsePassages,
  getListSummaries: getVseListSummaries
} = require('./data/viewing-structuring-evidence.js')

// Every screen but the policy sits in the Offices policy area. The other areas have no content,
// so they lead back to the landing page.
function vseAreaSidebar () {
  return [{
    heading: 'Policy areas',
    items: VSE_POLICY_AREAS.map(area => ({ text: area.text, href: VSE, active: area.id === 'offices' }))
  }]
}

function vsePolicySidebar (current) {
  return [{
    heading: 'Policy sections',
    items: VSE_POLICY_SECTIONS.map(section => ({
      text: section.text,
      href: getVsePolicy(section.id) ? VSE + '/policy/' + section.id : VSE,
      active: section.id === current
    }))
  }]
}

function renderVse (res, template, locals) {
  res.render('evidence/viewing-structuring/' + template, Object.assign({
    vse: VSE,
    types: VSE_TYPES,
    evidenceItems: VSE_EVIDENCE_ITEMS,
    sidebarSections: vseAreaSidebar()
  }, locals))
}

router.get(VSE, (req, res) => {
  renderVse(res, 'index', {})
})

for (const kind of ['document', 'hearing']) {
  router.get(VSE + '/' + kind + 's/:id', (req, res) => {
    const source = getVseSource(kind, req.params.id)
    if (!source) return res.redirect(VSE)
    renderVse(res, 'source', {
      source,
      passages: getVsePassages(source),
      evidenceItem: getVseEvidenceItem(source.evidenceItem),
      assignOptions: Object.values(VSE_EVIDENCE_ITEMS).map(item => ({
        value: item.id,
        text: item.ref + ': ' + item.title,
        selected: item.id === source.evidenceItem
      }))
    })
  })
}

router.get(VSE + '/evidence-items/:id', (req, res) => {
  const item = getVseEvidenceItem(req.params.id)
  if (!item) return res.redirect(VSE)
  renderVse(res, 'evidence-item', { item, lists: getVseListSummaries() })
})

router.get(VSE + '/lists/:id', (req, res) => {
  const list = getVseList(req.params.id)
  if (!list) return res.redirect(VSE)
  renderVse(res, 'list', {
    list,
    items: list.items.map(getVseEvidenceItem),
    lists: getVseListSummaries()
  })
})

router.get(VSE + '/policy/:id', (req, res) => {
  const policy = getVsePolicy(req.params.id)
  if (!policy) return res.redirect(VSE)
  renderVse(res, 'policy', {
    // The policy is drafted in the Policy writer, so the header says so, as in the design.
    activeSection: 'policy-writing',
    policy,
    references: policy.clauses.filter(clause => clause.evidence).map(clause => ({
      item: getVseEvidenceItem(clause.evidence),
      type: clause.type
    })),
    sidebarSections: vsePolicySidebar(policy.id)
  })
})

// --- Policy writing prototype ---
//
// Session-backed, three-phase journey, in two independent variants (see PW_VARIANTS) so a user
// can experience either starting from realistic example data ("prefilled") or from a blank
// slate ("blank") — /policy-writing links to both. Every route below is namespaced under
// /policy-writing/:variant/... so the two never share state:
//   /policy-writing/:variant/starting-points/:step   - 7-step "starting points" wizard
//   /policy-writing/:variant/topics/...              - aggregate view + create/review topics
//   /policy-writing/:variant/write/:topicId          - policy writer drafting workspace
//
// Starting point items are stored in req.session.data.policyStartingPointItems[variant], an
// object keyed by step slug. Topics are stored in req.session.data.policyTopics[variant]. The
// Sources panel in the writer workspace uses static seed data in
// req.session.data.policyWriterSources — shared across both variants since it's read-only
// reference data, never mutated by any route, so there's nothing for the two variants to leak
// into each other. The starting-point-items and topics accessors follow the same
// lazy-deep-clone-on-first-touch pattern as getEvidenceItems above (one clone per variant,
// tracked by a per-variant flag), since the kit merges session-data-defaults.js into a new
// session with a shallow Object.assign.

const PW_VARIANTS = ['prefilled', 'blank']

// Runs before any /policy-writing/:variant/... route, so a mistyped or old-bookmarked variant
// segment falls back to the prototype's landing page rather than 404ing or reading undefined
// session data.
router.param('variant', (req, res, next, variant) => {
  if (!PW_VARIANTS.includes(variant)) return res.redirect('/policy-writing')
  next()
})

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
    slug: 'existing-plan-layers',
    group: 'now',
    navLabel: 'Add existing plan layers',
    hint: 'Connect your GIS system to bring in the layers on your adopted plan\'s policies map, such as conservation areas, site allocations or protected views.',
    itemLabel: 'Plan layer',
    sourceLabel: 'Existing plan layer',
    // Layers come from a connected GIS system rather than being typed in: step.html shows the
    // connection form instead of the usual add box. See app/data/gis-layers.js.
    gis: true
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

// --- GIS layers: one shared collection across the application ---
//
// Layers are added in the starting points (tagged Plan by default) and in Managing commissioned
// evidence (tagged Evidence by default), and can be sources in Policy drafting with starting
// points. Each is stored once in `gisLayers`, keyed by its catalogue id, with the places it was
// added from as `origins`. Removing it from one place removes that origin; the layer goes when
// none are left. Its tag can be switched from anywhere it is listed, through one route. The
// connection itself is simulated — see app/data/gis-layers.js.

const GIS = require('./data/gis-layers.js')
const GIS_LAYERS_SCHEMA_VERSION = 6

function getGisLayers (req) {
  if (req.session.data.gisLayersSchemaVersion !== GIS_LAYERS_SCHEMA_VERSION) {
    req.session.data.gisLayers = JSON.parse(JSON.stringify(sessionDataDefaults.gisLayers))
    req.session.data.gisLayersOwned = true
    req.session.data.gisLayersSchemaVersion = GIS_LAYERS_SCHEMA_VERSION
  }
  if (!req.session.data.gisLayersOwned) {
    req.session.data.gisLayers = JSON.parse(JSON.stringify(req.session.data.gisLayers || []))
    req.session.data.gisLayersOwned = true
  }
  return req.session.data.gisLayers
}

function findGisLayer (req, id) {
  return getGisLayers(req).find(layer => layer.id === id)
}

// Adds a catalogue layer, or records another place it was added from if it's already in the
// collection. An existing layer keeps the tag it has: someone may have switched it.
function addGisLayer (req, id, type, origin) {
  const source = GIS.getCatalogueLayer(id)
  if (!source) return null
  const layers = getGisLayers(req)
  let layer = layers.find(candidate => candidate.id === id)
  if (!layer) {
    layer = Object.assign({}, source, { type, origins: [] })
    layers.push(layer)
  }
  if (!layer.origins.includes(origin)) layer.origins.push(origin)
  return layer
}

function removeGisLayerOrigin (req, id, origin) {
  const layers = getGisLayers(req)
  const index = layers.findIndex(layer => layer.id === id)
  if (index === -1) return
  layers[index].origins = layers[index].origins.filter(candidate => candidate !== origin)
  if (!layers[index].origins.length) layers.splice(index, 1)
}

// What templates show for a layer: its tag, the tag it would switch to, and where it came from.
function gisLayerView (layer) {
  const type = GIS.LAYER_TYPES[layer.type] || GIS.LAYER_TYPES.evidence
  return Object.assign({}, layer, {
    typeLabel: type.label,
    otherType: type.other,
    otherLabel: GIS.LAYER_TYPES[type.other].label,
    originLabels: layer.origins.map(GIS.describeOrigin)
  })
}

// Validates the "Connect your GIS system" form. The API key is never kept, only whether one
// was given.
function readGisConnection (body) {
  const serviceType = GIS.getGisServiceType(body._serviceType) ? body._serviceType : ''
  const endpoint = (body._endpoint || '').trim()
  const errors = {}
  if (!serviceType) errors.serviceType = 'Select the type of GIS service'
  if (!endpoint) {
    errors.endpoint = 'Enter the endpoint URL for your GIS service'
  } else {
    let url = null
    try { url = new URL(endpoint) } catch (error) {}
    if (!url) errors.endpoint = 'Enter the endpoint URL in the correct format, like https://gis.example.gov.uk/arcgis/rest/services/PoliciesMap/MapServer'
    else if (url.protocol !== 'https:') errors.endpoint = 'The endpoint URL must start with https://'
  }
  if (Object.keys(errors).length) return { errors, values: { serviceType, endpoint } }
  return {
    connection: {
      serviceType,
      endpoint,
      hasApiKey: Boolean((body._apiKey || '').trim()),
      connectedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London' })
    }
  }
}

// Errors from the connect and add forms survive the redirect in session data, cleared once shown.
function setGisErrors (req, errors, values) {
  req.session.data.gisErrors = { errors, values: values || {} }
}

// Everything partials/gis/macro.njk's gisConnect needs, for a page that adds layers from
// `catalogue`. `addedIds` are the layers this place has already added, shown ticked.
function gisConnectLocals (req, { action, connection, catalogue, addedIds, intro }) {
  const stored = req.session.data.gisErrors || { errors: {}, values: {} }
  delete req.session.data.gisErrors
  return {
    action,
    intro,
    connection,
    serviceType: connection ? GIS.getGisServiceType(connection.serviceType) : null,
    serviceTypes: GIS.GIS_SERVICE_TYPES,
    layers: connection ? GIS.getCatalogue(catalogue).map(layer => Object.assign({ added: addedIds.includes(layer.id) }, layer)) : [],
    // The same layers in their folders, as the source map groups them, for the checkbox lists.
    groups: connection ? gisGroupLayers(GIS.getCatalogue(catalogue).map(layer => Object.assign({ added: addedIds.includes(layer.id) }, layer))) : [],
    errors: stored.errors,
    errorList: Object.keys(stored.errors).map(id => ({ text: stored.errors[id], href: '#' + id })),
    values: stored.values
  }
}

function gisGroupLayers (layers) {
  const groups = []
  layers.forEach(layer => {
    let group = groups.find(candidate => candidate.name === layer.group)
    if (!group) groups.push(group = { name: layer.group, layers: [] })
    group.layers.push(layer)
  })
  return groups
}

// Only a path on this site, so a crafted form can't send someone elsewhere.
function gisReturnTo (value, fallback) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : fallback
}

// --- Map data ---
//
// A layer's features as GeoJSON, for the map component (partials/gis/map.njk, initGisMap).
// Only catalogue layers are served, so this never fetches an address someone typed in. A real
// COMPASS layer is fetched from the City's ArcGIS server once and kept in memory for the life of
// the process, simplified a little for drawing; an invented layer gets generated, illustrative
// shapes. Proxying rather than fetching in the browser works from wherever the prototype is
// deployed, and saves every page view re-downloading large layers.
const gisGeoJSONCache = new Map()

// How far a simplified line may stray, in degrees, scaled to how far the layer reaches: about
// 2m for City layers, invisible at that scale; about 40m for London-wide boundaries and 150m for
// national ones, which are otherwise megabytes (Local Authorities is 15MB unsimplified).
const GIS_NATIONAL_LAYERS = ['compass-boundaryline-2', 'compass-boundaryline-5', 'compass-boundaryline-7']

function gisSimplification (layer) {
  if (GIS_NATIONAL_LAYERS.includes(layer.id)) return '0.002'
  if (layer.group === 'Boundaries') return '0.0005'
  if (layer.features > 400) return '0.00005'
  return '0.00002'
}

function gisQueryUrl (layer) {
  const params = new URLSearchParams({
    where: '1=1',
    outFields: '*',
    outSR: '4326',
    f: 'geojson',
    geometryPrecision: '6',
    maxAllowableOffset: gisSimplification(layer)
  })
  return layer.url + '/query?' + params.toString()
}

router.get('/gis-layers/:layerId/geojson', async (req, res) => {
  const layer = GIS.getCatalogueLayer(req.params.layerId)
  if (!layer) return res.status(404).json({ error: 'No such layer' })
  if (!layer.url) return res.json(GIS.generateIllustrativeGeoJSON(layer))

  if (gisGeoJSONCache.has(layer.id)) return res.json(gisGeoJSONCache.get(layer.id))
  try {
    const response = await fetch(gisQueryUrl(layer), { signal: AbortSignal.timeout(20000) })
    if (!response.ok) throw new Error('Map server responded ' + response.status)
    const data = await response.json()
    if (!data || data.type !== 'FeatureCollection') throw new Error('Map server returned no features')
    gisGeoJSONCache.set(layer.id, data)
    res.json(data)
  } catch (error) {
    console.error('Could not load map layer ' + layer.id + ':', error.message)
    res.status(502).json({ error: 'The City of London map server could not be reached' })
  }
})

// What a map's checkbox list shows for each layer: everything gisLayerView gives, plus whether
// its shapes are made up.
function gisMapRows (layers) {
  return layers.map(layer => Object.assign(gisLayerView(Object.assign({ origins: [] }, layer)), {
    illustrative: !layer.url
  }))
}

// Switch a layer between Plan and Evidence, from wherever it is listed.
router.post('/gis-layers/:layerId/type', (req, res) => {
  const layer = findGisLayer(req, req.params.layerId)
  if (layer && GIS.LAYER_TYPES[req.body._type]) layer.type = req.body._type
  res.redirect(gisReturnTo(req.body._returnTo, '/'))
})


// --- GIS layer library ---
//
// /evidence/gis-layers: every layer in the shared gisLayers collection, as Policy layers (tag
// `plan`) or Evidence base layers (tag `evidence`), with a map preview and metadata. Layers added
// here have the origin 'library'; layers added in the starting points or commissioned evidence
// show up here too, because there is one collection. A layer's linked policies are `policyRefs`
// on the layer itself. Descriptions and versions come from GIS.LAYER_DETAILS (invented) or, for a
// layer added from an external source, from the layer. "Add to Local Plan timetable stage" and
// "See connected consultation responses" are inert placeholders from the sketch.
const GL = '/evidence/gis-layers'
const GL_TABS = {
  policy: { slug: 'policy', type: 'plan', title: 'Policy layers', other: 'evidence' },
  evidence: { slug: 'evidence', type: 'evidence', title: 'Evidence base layers', other: 'policy' }
}
const GL_PLAN = 'City Plan 2040'
const GL_NOT_PUBLISHED = 'Not yet published'

router.param('glTab', (req, res, next, glTab) => {
  if (!GL_TABS[glTab]) return res.redirect(GL + '/policy')
  next()
})

function glTabForType (type) {
  return type === 'evidence' ? GL_TABS.evidence : GL_TABS.policy
}

function glFormatDate (iso) {
  if (!iso) return 'Not recorded'
  return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London' })
}

function glToday () {
  return new Date().toISOString().slice(0, 10)
}

// The plan's chapters (policy areas), in plan order.
function glChapterNames () {
  return Array.from(new Set(POLICIES.map(policy => policy.policyArea)))
}

// A connection as a form value: `chapter:<policy area>` or `policy:<ref>`.
function glReadLink (value) {
  const match = /^(chapter|policy):(.+)$/.exec(String(value || ''))
  if (!match) return null
  if (match[1] === 'chapter') return glChapterNames().includes(match[2]) ? { kind: 'chapter', ref: match[2] } : null
  return POLICIES.some(policy => policy.ref === match[2]) ? { kind: 'policy', ref: match[2] } : null
}

// The library's connection to a GIS database, kept apart from the starting points' and the
// commission's. Starts unconnected.
function getGisLibraryConnection (req) {
  return req.session.data.gisLibraryConnection || null
}

// Everything a library card shows for a layer.
function glLayerView (layer) {
  const details = GIS.LAYER_DETAILS[layer.id] || {}
  const versions = (layer.versions || details.versions || [{ version: '1.0.0', created: layer.addedAt || null, publishedWith: null }])
    .map(version => Object.assign({}, version, {
      createdLabel: glFormatDate(version.created),
      publishedLabel: version.publishedWith || GL_NOT_PUBLISHED
    }))
  const policies = (layer.policyRefs || []).map(ref => {
    const policy = POLICIES.find(candidate => candidate.ref === ref)
    return { ref, title: policy ? policy.title : '', area: policy ? policy.policyArea : '' }
  })
  const wholeChapters = layer.chapters || []
  // What the layer is connected with, by chapter in plan order: the whole chapter, single
  // policies in it, or both.
  const connections = glChapterNames()
    .filter(name => wholeChapters.includes(name) || policies.some(policy => policy.area === name))
    .map(name => ({
      chapter: name,
      whole: wholeChapters.includes(name),
      policies: policies.filter(policy => policy.area === name)
    }))
  return Object.assign(gisLayerView(Object.assign({ origins: [] }, layer)), {
    description: layer.description || details.description || '',
    current: versions[0],
    previous: versions.slice(1),
    policies,
    connections,
    plan: GL_PLAN,
    // Only catalogue layers have shapes to preview; a layer from an external source has none.
    hasPreview: Boolean(GIS.getCatalogueLayer(layer.id)),
    illustrative: !layer.url,
    sourceLabel: layer.external ? 'External source' + (layer.source ? ': ' + layer.source : '') : (layer.origins || []).map(GIS.describeOrigin).join(', ')
  })
}

// The "Layer type" checkboxes, `glTypes`, are a sticky kit field. Unset means both. The form's
// hidden `_unchecked` lets unticking one be stored; unticking both makes the kit delete the field,
// so it falls back to both, as a filter with nothing selected usually does.
function glTypes (req) {
  const stored = req.session.data.glTypes
  if (stored === undefined) return Object.keys(GIS.LAYER_TYPES)
  return asArray(stored).filter(type => GIS.LAYER_TYPES[type])
}

function glFilters (req) {
  return {
    types: glTypes(req),
    year: req.session.data.glYear || '',
    published: req.session.data.glPublished || '',
    policy: req.session.data.glPolicy || ''
  }
}

function glMatches (view, filters) {
  if (!filters.types.includes(view.type)) return false
  if (filters.year && !(view.current.created || '').startsWith(filters.year)) return false
  if (filters.published && view.current.publishedLabel !== filters.published) return false
  if (filters.policy === 'none') return !view.connections.length
  const link = glReadLink(filters.policy)
  if (link && link.kind === 'chapter' && !view.connections.some(connection => connection.chapter === link.ref)) return false
  if (link && link.kind === 'policy' && !view.policies.some(policy => policy.ref === link.ref)) return false
  return true
}

function glSelectItems (values, selected, allLabel) {
  return [{ value: '', text: allLabel, selected: !selected }].concat(values.map(value => ({
    value: value.value, text: value.text, selected: value.value === selected
  })))
}

// Where a layer's card is, to come back to after acting on it.
function glLayerHref (layer) {
  return GL + '#layer-' + layer.id
}

// The old per-type addresses: show just that type.
router.get(GL + '/:glTab', (req, res) => {
  req.session.data.glTypes = [GL_TABS[req.params.glTab].type]
  res.redirect(GL)
})

router.get(GL, (req, res) => {
  const all = getGisLayers(req).map(glLayerView)

  // The year and policy options come from every layer, so ticking a layer type never removes the
  // option that is selected. A stored value no layer has any more is ignored.
  const years = Array.from(new Set(all.map(view => (view.current.created || '').slice(0, 4)).filter(Boolean))).sort().reverse()
  // Each chapter any layer is connected with, followed by the single policies in it that are.
  const linkedRefs = Array.from(new Set([].concat(...all.map(view => view.policies.map(policy => policy.ref)))))
  const linkedChapters = Array.from(new Set([].concat(...all.map(view => view.connections.map(connection => connection.chapter)))))
  const policyOptions = [].concat(...glChapterNames().filter(name => linkedChapters.includes(name)).map(name =>
    [{ value: 'chapter:' + name, text: name + ' chapter' }].concat(POLICIES
      .filter(policy => policy.policyArea === name && linkedRefs.includes(policy.ref))
      .map(policy => ({ value: 'policy:' + policy.ref, text: policy.ref + ' ' + policy.title })))
  )).concat([{ value: 'none', text: 'Not connected to any' }])
  const filters = glFilters(req)
  if (!years.includes(filters.year)) filters.year = ''
  if (!policyOptions.some(option => option.value === filters.policy)) filters.policy = ''
  const layers = all.filter(view => glMatches(view, filters))

  // With one type ticked, new layers are added as that type; otherwise as policy layers.
  const addTab = filters.types.length === 1 ? glTabForType(filters.types[0]) : GL_TABS.policy

  res.render('evidence/gis-layers/index', {
    layers,
    total: all.length,
    filters,
    filtered: filters.types.length !== Object.keys(GIS.LAYER_TYPES).length || Boolean(filters.year || filters.published || filters.policy),
    typeItems: Object.keys(GL_TABS).map(slug => ({
      value: GL_TABS[slug].type, text: GL_TABS[slug].title, checked: filters.types.includes(GL_TABS[slug].type)
    })),
    yearItems: glSelectItems(years.map(year => ({ value: year, text: year })), filters.year, 'Any year'),
    publishedItems: glSelectItems(GIS.PUBLISHED_WITH.concat([GL_NOT_PUBLISHED]).map(stage => ({ value: stage, text: stage })), filters.published, 'Any stage'),
    policyItems: glSelectItems(policyOptions, filters.policy, 'Any policy or chapter'),
    addTab,
    returnTo: GL
  })
})

// --- Add from a GIS database ---
// Under the tab it was started from, so layers come in with that tab's tag. The tab is in the
// path because the shared gisConnect forms post to `action` + /connect etc. with no extra fields.

function glAddGisHref (tab) {
  return GL + '/' + tab.slug + '/add/gis'
}

router.get(GL + '/:glTab/add/gis', (req, res) => {
  const tab = GL_TABS[req.params.glTab]
  const connection = getGisLibraryConnection(req)
  res.render('evidence/gis-layers/add-gis', {
    tab,
    otherTab: GL_TABS[tab.other],
    gis: gisConnectLocals(req, {
      action: glAddGisHref(tab),
      connection,
      catalogue: GIS.catalogueFor(connection, 'compass'),
      addedIds: getGisLayers(req).map(layer => layer.id),
      intro: 'Connect the GIS system that holds your plan\'s spatial data. You can then choose which of its layers to bring into the library.'
    })
  })
})

router.post(GL + '/:glTab/add/gis/connect', (req, res) => {
  const tab = GL_TABS[req.params.glTab]
  const result = readGisConnection(req.body)
  if (result.errors) {
    setGisErrors(req, result.errors, result.values)
    return res.redirect(glAddGisHref(tab) + '#gis-connect')
  }
  req.session.data.gisLibraryConnection = result.connection
  res.redirect(glAddGisHref(tab) + '#gis-layers')
})

router.post(GL + '/:glTab/add/gis/disconnect', (req, res) => {
  req.session.data.gisLibraryConnection = null
  res.redirect(glAddGisHref(GL_TABS[req.params.glTab]) + '#gis-connect')
})

router.post(GL + '/:glTab/add/gis/layers', (req, res) => {
  const tab = GL_TABS[req.params.glTab]
  const connection = getGisLibraryConnection(req)
  if (!connection) return res.redirect(glAddGisHref(tab))
  const catalogue = GIS.getCatalogue(GIS.catalogueFor(connection, 'compass'))
  const selected = asArray(req.body._layers).map(id => catalogue.find(layer => layer.id === id)).filter(Boolean)
  if (!selected.length) {
    setGisErrors(req, { layers: 'Select at least one layer to add' })
    return res.redirect(glAddGisHref(tab) + '#gis-layers')
  }
  selected.forEach(source => {
    const layer = addGisLayer(req, source.id, tab.type, 'library')
    if (layer && !layer.addedAt) layer.addedAt = glToday()
  })
  res.redirect(GL)
})

// --- Add from an external source ---
// Uploads keep only the file name: the form isn't multipart and nothing is stored.

router.get(GL + '/:glTab/add/external', (req, res) => {
  const stored = req.session.data.glExternalErrors || { errors: {}, values: {} }
  delete req.session.data.glExternalErrors
  const tab = GL_TABS[req.params.glTab]
  res.render('evidence/gis-layers/add-external', {
    tab,
    errors: stored.errors,
    errorList: Object.keys(stored.errors).map(id => ({ text: stored.errors[id], href: '#' + id })),
    values: Object.assign({ type: tab.type }, stored.values)
  })
})

router.post(GL + '/:glTab/add/external', (req, res) => {
  const tab = GL_TABS[req.params.glTab]
  const values = {
    name: (req.body._name || '').trim(),
    description: (req.body._description || '').trim(),
    type: GIS.LAYER_TYPES[req.body._type] ? req.body._type : '',
    file: (req.body._file || '').trim(),
    url: (req.body._url || '').trim()
  }
  const errors = {}
  if (!values.name) errors.name = 'Enter a name for the layer'
  if (!values.type) errors.type = 'Select whether this is a policy layer or an evidence base layer'
  if (!values.file && !values.url) errors.file = 'Upload a file or enter the address of the data'
  if (values.url) {
    let url = null
    try { url = new URL(values.url) } catch (error) {}
    if (!url || url.protocol !== 'https:') errors.url = 'Enter an address that starts with https://'
  }
  if (Object.keys(errors).length) {
    req.session.data.glExternalErrors = { errors, values }
    return res.redirect(GL + '/' + tab.slug + '/add/external')
  }
  getGisLayers(req).push({
    id: 'external-' + Date.now(),
    name: values.name,
    group: 'External source',
    geometry: 'Unknown',
    features: null,
    type: values.type,
    origins: ['library'],
    external: true,
    source: values.file || values.url,
    description: values.description,
    policyRefs: [],
    chapters: [],
    addedAt: glToday(),
    versions: [{ version: '1.0.0', created: glToday(), publishedWith: null }]
  })
  res.redirect(GL)
})

// --- Add to a policy or chapter ---
// A layer can be connected with a whole chapter (`chapters`, policy area names) or with single
// policies (`policyRefs`). The form value is `chapter:<area>` or `policy:<ref>`. The page follows
// Policy drafting's "Add sources": the existing connections, then a keyword search with filters
// whose results are ticked and added together.
const GL_LINK_RESULTS_PER_PAGE = 10
const GL_LINK_KINDS = [
  { value: 'chapter', text: 'Whole chapter' },
  { value: 'policy', text: 'Policy' }
]

// Everything a layer can be connected with: each chapter, followed by its policies, in plan order.
function glLinkCandidates () {
  return [].concat(...glChapterNames().map(name => [{
    value: 'chapter:' + name,
    kind: 'chapter',
    kindLabel: 'Whole chapter',
    ref: '',
    name: name + ' chapter',
    chapter: name,
    haystack: (name + ' chapter').toLowerCase()
  }].concat(POLICIES.filter(policy => policy.policyArea === name).map(policy => ({
    value: 'policy:' + policy.ref,
    kind: 'policy',
    kindLabel: 'Policy',
    ref: policy.ref,
    name: policy.title,
    chapter: name,
    haystack: (policy.ref + ' ' + policy.title + ' ' + name).toLowerCase()
  })))))
}

// The same AND-of-words rule as the library search, then the chapter and type filters.
function glSearchLinks (filters) {
  const words = String(filters.query || '').toLowerCase().split(/\s+/).filter(Boolean)
  return glLinkCandidates().filter(candidate =>
    words.every(word => candidate.haystack.includes(word)) &&
    (!filters.chapter || candidate.chapter === filters.chapter) &&
    (!filters.kind || candidate.kind === filters.kind))
}

// Type-ahead terms (initSuggestSearch). Chapters are 'Topic's so they're offered first.
let glLinkTerms = null
function glLinkSearchTerms () {
  if (!glLinkTerms) {
    glLinkTerms = glChapterNames().map(name => ({ term: name, kind: 'Topic', label: 'Chapter' }))
      .concat(POLICIES.map(policy => ({ term: policy.ref + ' ' + policy.title, kind: 'Policy', label: 'Policy' })))
  }
  return glLinkTerms
}

function glIsLinked (layer, value) {
  const link = glReadLink(value)
  if (!link) return false
  return ((link.kind === 'chapter' ? layer.chapters : layer.policyRefs) || []).includes(link.ref)
}

function glLinkPageUrl (layer, page, extra) {
  const params = []
  const pageNumber = parseInt(page, 10)
  if (pageNumber > 1) params.push('_page=' + pageNumber)
  if (extra) params.push(extra)
  return GL + '/layers/' + layer.id + '/policy' + (params.length ? '?' + params.join('&') : '')
}

// Search and filters are sticky (glLink*, kept apart from the library's own glPolicy filter); the
// page number is "_page" so a new search starts from the first page.
router.get(GL + '/layers/:layerId/policy', (req, res) => {
  const layer = findGisLayer(req, req.params.layerId)
  if (!layer) return res.redirect(GL)
  const session = req.session.data
  const chapters = glChapterNames()
  const filters = {
    query: session.glLinkSearch || '',
    chapter: chapters.includes(session.glLinkChapter) ? session.glLinkChapter : '',
    kind: GL_LINK_KINDS.some(kind => kind.value === session.glLinkKind) ? session.glLinkKind : ''
  }
  const searched = Object.values(filters).some(Boolean)
  const results = searched ? glSearchLinks(filters) : []
  const pageCount = Math.max(1, Math.ceil(results.length / GL_LINK_RESULTS_PER_PAGE))
  const page = Math.min(pageCount, Math.max(1, parseInt(req.query._page, 10) || 1))
  const start = (page - 1) * GL_LINK_RESULTS_PER_PAGE

  const view = glLayerView(layer)
  // The connections table: a chapter connected as a whole, then any single policies in it.
  const existing = [].concat(...view.connections.map(connection =>
    (connection.whole ? [{ value: 'chapter:' + connection.chapter, kindLabel: 'Whole chapter', ref: '', name: connection.chapter + ' chapter', chapter: connection.chapter }] : [])
      .concat(connection.policies.map(policy => ({ value: 'policy:' + policy.ref, kindLabel: 'Policy', ref: policy.ref, name: policy.title, chapter: connection.chapter })))))

  res.render('evidence/gis-layers/policy', {
    layer: view,
    existing,
    filters,
    searched,
    results: results.slice(start, start + GL_LINK_RESULTS_PER_PAGE)
      .map(result => Object.assign({ added: glIsLinked(layer, result.value) }, result)),
    resultCount: results.length,
    firstResult: results.length ? start + 1 : 0,
    lastResult: Math.min(start + GL_LINK_RESULTS_PER_PAGE, results.length),
    page,
    pageCount,
    chapters,
    kinds: GL_LINK_KINDS,
    searchTermsJson: JSON.stringify(glLinkSearchTerms()),
    addedCount: parseInt(req.query._added, 10) || 0,
    pageUrl: glLinkPageUrl(layer),
    backHref: glLayerHref(layer)
  })
})

// "Add selected": every ticked result in one go. Anything already connected is skipped, so the
// banner's count is what was actually added.
router.post(GL + '/layers/:layerId/policy', (req, res) => {
  const layer = findGisLayer(req, req.params.layerId)
  if (!layer) return res.redirect(GL)
  let added = 0
  asArray(req.body._links).forEach(value => {
    const link = glReadLink(value)
    if (!link || glIsLinked(layer, value)) return
    const key = link.kind === 'chapter' ? 'chapters' : 'policyRefs'
    if (!layer[key]) layer[key] = []
    layer[key].push(link.ref)
    added++
  })
  res.redirect(glLinkPageUrl(layer, req.body._page, added ? '_added=' + added : ''))
})

// Used from the library card and from the add page, so it goes back to whichever sent it.
router.post(GL + '/layers/:layerId/links/remove', (req, res) => {
  const layer = findGisLayer(req, req.params.layerId)
  if (!layer) return res.redirect(GL)
  const link = glReadLink(req.body._link)
  if (link) {
    const key = link.kind === 'chapter' ? 'chapters' : 'policyRefs'
    layer[key] = (layer[key] || []).filter(ref => ref !== link.ref)
  }
  res.redirect(gisReturnTo(req.body._returnTo, glLayerHref(layer)))
})

const EXISTING_DOCUMENTS = [
  'SHLAA 2025', 'Brownfield register v2.0', 'Housing needs assessment study',
  'Strategic Flood Risk Assessment', 'Employment Land Review'
]

function findStartingPointStep (slug) {
  return STARTING_POINT_STEPS.find(step => step.slug === slug)
}

// The kit merges session-data-defaults.js under any *existing* session data
// (Object.assign({}, sessionDataDefaults, req.session.data)), so a browser session that started
// before the policy-writing prototype had prefilled/blank variants still has
// policyStartingPointItems/policyTopics in the old flat (non-variant) shape — the top-level key
// already exists, so the fresh nested defaults never get merged in. Detect that legacy/malformed
// shape here and reseed from the current defaults, rather than silently reading `undefined` off
// the old shape (which otherwise renders as "no content" for every variant).
// A structural presence check (e.g. "does .prefilled exist?") isn't reliable here: an earlier,
// narrower version of this repair could itself leave behind a *truthy but empty* .prefilled/
// .blank object (e.g. `{}`, added onto an old flat-shaped session by code that blindly did
// `current[variant] || {}`), which then passes any "does it exist" check forever without ever
// containing real seed data. An explicit schema version sidesteps that whole class of bug:
// anything not stamped with the current version is fully reseeded, no structural guessing.
const POLICY_WRITING_SESSION_SCHEMA_VERSION = 2
// Starting points are versioned on their own, so adding a step (and its seed) reseeds them
// without also throwing away the topics a tester has built. 3 added existing plan layers; 4 their
// GIS connection, which is reset with them because the layers come from it; 5 the real COMPASS
// layers.
const POLICY_STARTING_POINTS_SCHEMA_VERSION = 7

function ensureStartingPointItemsShape (req) {
  if (req.session.data.policyStartingPointItemsSchemaVersion !== POLICY_STARTING_POINTS_SCHEMA_VERSION) {
    req.session.data.policyStartingPointItems = JSON.parse(JSON.stringify(sessionDataDefaults.policyStartingPointItems))
    req.session.data.policyStartingPointItemsOwned = { prefilled: true, blank: true }
    req.session.data.policyGisConnection = JSON.parse(JSON.stringify(sessionDataDefaults.policyGisConnection))
    req.session.data.policyGisConnectionOwned = { prefilled: true, blank: true }
    req.session.data.policyStartingPointItemsSchemaVersion = POLICY_STARTING_POINTS_SCHEMA_VERSION
  }
}

// The GIS connection for a variant, or null. Shares the starting points' schema stamp, and is
// deep-cloned on first touch like every other seeded object.
function getGisConnection (req, variant) {
  ensureStartingPointItemsShape(req)
  if (!req.session.data.policyGisConnectionOwned) req.session.data.policyGisConnectionOwned = {}
  if (!req.session.data.policyGisConnection) req.session.data.policyGisConnection = {}
  if (!req.session.data.policyGisConnectionOwned[variant]) {
    const seeded = req.session.data.policyGisConnection[variant]
    req.session.data.policyGisConnection[variant] = seeded ? JSON.parse(JSON.stringify(seeded)) : null
    req.session.data.policyGisConnectionOwned[variant] = true
  }
  return req.session.data.policyGisConnection[variant]
}

function setGisConnection (req, variant, connection) {
  getGisConnection(req, variant)
  req.session.data.policyGisConnection[variant] = connection
}

function ensurePolicyTopicsShape (req) {
  if (req.session.data.policyTopicsSchemaVersion !== POLICY_WRITING_SESSION_SCHEMA_VERSION) {
    req.session.data.policyTopics = JSON.parse(JSON.stringify(sessionDataDefaults.policyTopics))
    req.session.data.policyTopicsOwned = { prefilled: true, blank: true }
    req.session.data.policyTopicsSchemaVersion = POLICY_WRITING_SESSION_SCHEMA_VERSION
  }
}

function getStartingPointItems (req, variant, stepSlug) {
  ensureStartingPointItemsShape(req)
  if (!req.session.data.policyStartingPointItemsOwned) {
    req.session.data.policyStartingPointItemsOwned = {}
  }
  if (!req.session.data.policyStartingPointItemsOwned[variant]) {
    req.session.data.policyStartingPointItems[variant] = JSON.parse(JSON.stringify(req.session.data.policyStartingPointItems[variant] || {}))
    req.session.data.policyStartingPointItemsOwned[variant] = true
  }
  if (!req.session.data.policyStartingPointItems[variant][stepSlug]) {
    req.session.data.policyStartingPointItems[variant][stepSlug] = []
  }
  return req.session.data.policyStartingPointItems[variant][stepSlug]
}

function getPolicyTopics (req, variant) {
  ensurePolicyTopicsShape(req)
  if (!req.session.data.policyTopicsOwned) {
    req.session.data.policyTopicsOwned = {}
  }
  if (!req.session.data.policyTopicsOwned[variant]) {
    req.session.data.policyTopics[variant] = JSON.parse(JSON.stringify(req.session.data.policyTopics[variant] || []))
    req.session.data.policyTopicsOwned[variant] = true
  }
  return req.session.data.policyTopics[variant]
}

function getTopic (req, variant, topicId) {
  return getPolicyTopics(req, variant).find(topic => topic.id === topicId)
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
function buildStartingPointsSidebar (req, variant, activeHref) {
  const base = '/policy-writing/' + variant

  const stepNavItem = step => {
    const href = base + '/starting-points/' + step.slug
    const complete = getStartingPointItems(req, variant, step.slug).length > 0
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
        { text: 'Review starting points', href: base + '/topics/review-starting-points', active: activeHref === base + '/topics/review-starting-points' },
        { text: 'Create topics', href: base + '/topics/new', active: activeHref === base + '/topics/new' },
        { text: 'Review topics', href: base + '/topics', active: activeHref === base + '/topics' }
      ]
    }
  ]
}

// --- Starting points wizard: one shared set of handlers for all 8 steps ---
//
// The wizard runs in two places: the policy-writing variants, and Make your plan's scoping
// activities. A `journey` is either a variant or SCOPING_JOURNEY, and says where the items are
// kept, where the GIS connection is kept and which URL the steps live under. Each place
// registers its own routes onto the handlers below and renders its own page shell around
// policy-writing/starting-points/partials/step-body.html.

const SCOPING_JOURNEY = 'scoping'

function spBase (journey) {
  return journey === SCOPING_JOURNEY ? PM + '/scoping-activities' : '/policy-writing/' + journey + '/starting-points'
}

// Make your plan keeps its starting points in projectManagement, so its statuses can be derived
// from that one object like every other task's.
function spItems (req, journey, stepSlug) {
  if (journey !== SCOPING_JOURNEY) return getStartingPointItems(req, journey, stepSlug)
  const state = getProjectManagement(req)
  if (!state.startingPoints[stepSlug]) state.startingPoints[stepSlug] = []
  return state.startingPoints[stepSlug]
}

function spConnection (req, journey) {
  return journey === SCOPING_JOURNEY ? getProjectManagement(req).gisConnection : getGisConnection(req, journey)
}

function spSetConnection (req, journey, connection) {
  if (journey === SCOPING_JOURNEY) getProjectManagement(req).gisConnection = connection
  else setGisConnection(req, journey, connection)
}

// Everything the step body needs, for either page shell. Null for an unknown step.
function spStepLocals (req, journey, slug) {
  const step = findStartingPointStep(slug)
  if (!step) return null
  const items = spItems(req, journey, step.slug)
  return Object.assign({
    step,
    items,
    editItem: req.query.edit ? items.find(item => item.id === req.query.edit) : null,
    spBase: spBase(journey)
  }, step.gis ? gisStepLocals(req, journey, items) : {})
}

router.get('/policy-writing/:variant/starting-points/:step', (req, res) => {
  const { variant } = req.params
  const locals = spStepLocals(req, variant, req.params.step)
  if (!locals) return res.redirect(spBase(variant) + '/' + STARTING_POINT_STEPS[0].slug)

  res.render('policy-writing/starting-points/step', Object.assign(locals, {
    variant,
    continueHref: '/policy-writing/' + variant + '/topics/review-starting-points',
    backHref: '/policy-writing',
    sidebarSections: buildStartingPointsSidebar(req, variant, spBase(variant) + '/' + locals.step.slug)
  }))
})

// --- Existing plan layers: the (simulated) GIS connection ---
//
// Layers added here go into the shared gisLayers collection, tagged Plan, with the origin
// 'starting-points:<journey>'; each is also a starting point item carrying its layerId.

const GIS_STEP = 'existing-plan-layers'

function gisStepHref (journey) {
  return spBase(journey) + '/' + GIS_STEP
}

function gisStepLocals (req, journey, items) {
  const layers = {}
  getGisLayers(req).forEach(layer => { layers[layer.id] = gisLayerView(layer) })
  return {
    gis: gisConnectLocals(req, {
      action: gisStepHref(journey),
      connection: spConnection(req, journey),
      catalogue: GIS.catalogueFor(spConnection(req, journey), 'compass'),
      addedIds: items.map(item => item.layerId).filter(Boolean),
      intro: 'Connect the GIS system that holds your adopted plan\'s policies map. You can then choose which of its layers to bring in as starting points. They are added as Plan layers.'
    }),
    gisLayerById: layers,
    gisReturnTo: gisStepHref(journey) + '#added-layers'
  }
}

function spConnect (req, res, journey) {
  const result = readGisConnection(req.body)
  if (result.errors) {
    setGisErrors(req, result.errors, result.values)
    return res.redirect(gisStepHref(journey) + '#gis-connect')
  }
  spSetConnection(req, journey, result.connection)
  res.redirect(gisStepHref(journey) + '#gis-layers')
}

// Disconnecting keeps the layers already added: they are starting points now, not live data.
function spDisconnect (req, res, journey) {
  spSetConnection(req, journey, null)
  res.redirect(gisStepHref(journey) + '#gis-connect')
}

function spAddLayers (req, res, journey) {
  const connection = spConnection(req, journey)
  if (!connection) return res.redirect(gisStepHref(journey))
  const items = spItems(req, journey, GIS_STEP)
  const catalogue = GIS.getCatalogue(GIS.catalogueFor(connection, 'compass'))
  const selected = asArray(req.body._layers).map(id => catalogue.find(layer => layer.id === id)).filter(Boolean)
  if (!selected.length) {
    setGisErrors(req, { layers: 'Select at least one layer to add' })
    return res.redirect(gisStepHref(journey) + '#gis-layers')
  }
  selected.forEach(layer => {
    addGisLayer(req, layer.id, 'plan', 'starting-points:' + journey)
    if (items.some(item => item.layerId === layer.id)) return
    items.push({ id: 'psp-' + Date.now() + '-' + layer.id, text: layer.name, layerId: layer.id })
  })
  res.redirect(gisStepHref(journey) + '#added-layers')
}

function spSaveItem (req, res, journey) {
  const step = findStartingPointStep(req.params.step)
  if (!step) return res.redirect(spBase(journey) + '/' + STARTING_POINT_STEPS[0].slug)

  const items = spItems(req, journey, step.slug)
  const text = (req.body.itemText || '').trim()

  if (text) {
    if (req.body.itemId) {
      const existing = items.find(item => item.id === req.body.itemId)
      if (existing) existing.text = text
    } else {
      items.push({ id: 'psp-' + Date.now(), text })
    }
  }

  res.redirect(spBase(journey) + '/' + step.slug)
}

function spRemoveItem (req, res, journey) {
  const step = findStartingPointStep(req.params.step)
  if (step) {
    const items = spItems(req, journey, step.slug)
    const index = items.findIndex(item => item.id === req.params.itemId)
    if (index !== -1) {
      // A layer leaves the shared collection only if nowhere else added it too.
      if (items[index].layerId) removeGisLayerOrigin(req, items[index].layerId, 'starting-points:' + journey)
      items.splice(index, 1)
    }
  }
  res.redirect(spBase(journey) + '/' + req.params.step)
}

router.post('/policy-writing/:variant/starting-points/' + GIS_STEP + '/connect', (req, res) => spConnect(req, res, req.params.variant))
router.post('/policy-writing/:variant/starting-points/' + GIS_STEP + '/disconnect', (req, res) => spDisconnect(req, res, req.params.variant))
router.post('/policy-writing/:variant/starting-points/' + GIS_STEP + '/layers', (req, res) => spAddLayers(req, res, req.params.variant))
router.post('/policy-writing/:variant/starting-points/:step', (req, res) => spSaveItem(req, res, req.params.variant))
router.post('/policy-writing/:variant/starting-points/:step/:itemId/remove', (req, res) => spRemoveItem(req, res, req.params.variant))

// --- Review starting points: aggregate table across all 8 steps ---

router.get('/policy-writing/:variant/topics/review-starting-points', (req, res) => {
  const { variant } = req.params
  const rows = []
  STARTING_POINT_STEPS.forEach(step => {
    getStartingPointItems(req, variant, step.slug).forEach(item => {
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
    variant,
    rows,
    sidebarSections: buildStartingPointsSidebar(req, variant, '/policy-writing/' + variant + '/topics/review-starting-points')
  })
})

router.post('/policy-writing/:variant/topics/review-starting-points/:sourceStep/:itemId/remove', (req, res) => {
  const { variant } = req.params
  const step = findStartingPointStep(req.params.sourceStep)
  if (step) {
    const items = getStartingPointItems(req, variant, step.slug)
    const index = items.findIndex(item => item.id === req.params.itemId)
    if (index !== -1) items.splice(index, 1)
  }
  res.redirect('/policy-writing/' + variant + '/topics/review-starting-points')
})

// --- Topics list ---

router.get('/policy-writing/:variant/topics', (req, res) => {
  const { variant } = req.params
  res.render('policy-writing/topics/index', {
    variant,
    topics: getPolicyTopics(req, variant),
    sidebarSections: buildStartingPointsSidebar(req, variant, '/policy-writing/' + variant + '/topics')
  })
})

// --- Create topics ---

router.get('/policy-writing/:variant/topics/new', (req, res) => {
  const { variant } = req.params
  res.render('policy-writing/topics/new', {
    variant,
    startingPointGroups: STARTING_POINT_STEPS.map(step => ({
      step,
      items: getStartingPointItems(req, variant, step.slug)
    })),
    sidebarSections: buildStartingPointsSidebar(req, variant, '/policy-writing/' + variant + '/topics/new')
  })
})

router.post('/policy-writing/:variant/topics/new', (req, res) => {
  const { variant } = req.params
  const topics = getPolicyTopics(req, variant)
  const name = (req.body.topicName || '').trim()

  if (name) {
    const selectedRefs = asArray(req.body.startingPoints)
    const sources = selectedRefs.map(ref => {
      const [stepSlug, itemId] = ref.split('::')
      const step = findStartingPointStep(stepSlug)
      const item = step && getStartingPointItems(req, variant, stepSlug).find(candidate => candidate.id === itemId)
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

  res.redirect('/policy-writing/' + variant + (req.body.action === 'add-another' ? '/topics/new' : '/topics'))
})

// --- Review topics: single-topic detail ---

router.get('/policy-writing/:variant/topics/:topicId', (req, res) => {
  const { variant } = req.params
  const topic = getTopic(req, variant, req.params.topicId)
  if (!topic) return res.redirect('/policy-writing/' + variant + '/topics')

  res.render('policy-writing/topics/show', {
    variant,
    topic,
    existingDocuments: EXISTING_DOCUMENTS,
    sidebarSections: buildStartingPointsSidebar(req, variant, '/policy-writing/' + variant + '/topics')
  })
})

router.post('/policy-writing/:variant/topics/:topicId', (req, res) => {
  const { variant } = req.params
  const topic = getTopic(req, variant, req.params.topicId)
  if (topic) {
    topic.name = (req.body.topicName || topic.name).trim()
    topic.brief = req.body.brief || ''
    topic.desiredImpact = req.body.desiredImpact || ''
    topic.evidenceNotes = req.body.evidenceNotes || ''
    topic.additionalEvidenceNeeds = req.body.additionalEvidenceNeeds || ''
  }
  res.redirect('/policy-writing/' + variant + '/topics/' + req.params.topicId)
})

router.get('/policy-writing/:variant/topics/:topicId/assigned-to', (req, res) => {
  const { variant } = req.params
  const topic = getTopic(req, variant, req.params.topicId)
  if (!topic) return res.redirect('/policy-writing/' + variant + '/topics')
  res.render('policy-writing/topics/assigned-to', { variant, topic })
})

router.post('/policy-writing/:variant/topics/:topicId/assigned-to', (req, res) => {
  const { variant } = req.params
  const topic = getTopic(req, variant, req.params.topicId)
  if (topic) topic.assignedTo = (req.body.assignedTo || '').trim()
  res.redirect('/policy-writing/' + variant + '/topics/' + req.params.topicId)
})

router.post('/policy-writing/:variant/topics/:topicId/sources', (req, res) => {
  const { variant } = req.params
  const topic = getTopic(req, variant, req.params.topicId)
  const label = (req.body.sourceLabel || '').trim()
  if (topic && label) {
    topic.sources.push({ id: 'src-' + Date.now(), label })
  }
  res.redirect('/policy-writing/' + variant + '/topics/' + req.params.topicId)
})

router.post('/policy-writing/:variant/topics/:topicId/sources/:sourceId/remove', (req, res) => {
  const { variant } = req.params
  const topic = getTopic(req, variant, req.params.topicId)
  if (topic) {
    topic.sources = topic.sources.filter(source => source.id !== req.params.sourceId)
  }
  res.redirect('/policy-writing/' + variant + '/topics/' + req.params.topicId)
})

router.post('/policy-writing/:variant/topics/:topicId/example-policies', (req, res) => {
  const { variant } = req.params
  const topic = getTopic(req, variant, req.params.topicId)
  const label = (req.body.examplePolicyLabel || '').trim()
  if (topic && label) {
    topic.examplePolicies.push({ id: 'ep-' + Date.now(), label })
  }
  res.redirect('/policy-writing/' + variant + '/topics/' + req.params.topicId)
})

router.post('/policy-writing/:variant/topics/:topicId/example-policies/:policyId/remove', (req, res) => {
  const { variant } = req.params
  const topic = getTopic(req, variant, req.params.topicId)
  if (topic) {
    topic.examplePolicies = topic.examplePolicies.filter(policy => policy.id !== req.params.policyId)
  }
  res.redirect('/policy-writing/' + variant + '/topics/' + req.params.topicId)
})

// Evidence can be linked either by picking an existing document from the dropdown, or by
// choosing a file to upload. The prototype kit's default body parser doesn't process file
// uploads, so — consistent with the "Policy writer" workspace's decorative rich-text toolbar —
// the file input is present but not wired up; only the "link to existing document" path
// actually records a linked-evidence entry.
router.post('/policy-writing/:variant/topics/:topicId/linked-evidence', (req, res) => {
  const { variant } = req.params
  const topic = getTopic(req, variant, req.params.topicId)
  const label = (req.body.existingDocument || '').trim()
  if (topic && label) {
    topic.linkedEvidence.push({ id: 'le-' + Date.now(), label })
  }
  res.redirect('/policy-writing/' + variant + '/topics/' + req.params.topicId)
})

// --- Policy writer workspace ---

router.get('/policy-writing/:variant/write/:topicId', (req, res) => {
  const { variant } = req.params
  const topic = getTopic(req, variant, req.params.topicId)
  if (!topic) return res.redirect('/policy-writing/' + variant + '/topics')

  const sources = getPolicyWriterSources(req)
  const requestedKinds = asArray(req.query.sourceType)
  const activeKinds = requestedKinds.length ? requestedKinds : ['policy', 'evidence', 'comment']

  res.render('policy-writing/write/index', {
    variant,
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

router.post('/policy-writing/:variant/write/:topicId', (req, res) => {
  const { variant } = req.params
  const topic = getTopic(req, variant, req.params.topicId)
  if (topic) saveWorkspaceFields(topic, req.body)
  res.redirect('/policy-writing/' + variant + '/write/' + req.params.topicId)
})

router.post('/policy-writing/:variant/write/:topicId/policy-blocks', (req, res) => {
  const { variant } = req.params
  const topic = getTopic(req, variant, req.params.topicId)
  if (topic) {
    saveWorkspaceFields(topic, req.body)
    topic.policyBlocks.push({ id: 'block-' + Date.now(), title: '', detail: '' })
  }
  res.redirect('/policy-writing/' + variant + '/write/' + req.params.topicId)
})

// --- Examination - inspector view prototype ---
//
// An external (non-LPA-staff) view of the submitted Local Plan for an independent planning
// inspector: a sidebar showing the plan's chapters (policy areas) and policies, and a
// paragraph-by-paragraph viewer for each policy's text with its related evidence, consultation
// representations and NPPF/SDS policy references. See app/data/plan-paragraphs.js for the
// paragraph and NPPF/SDS content this prototype adds on top of policies.js and
// evidence-excerpts.js.

// One sidebar section per chapter (policy area), each policy in it linking to its first
// paragraph. activePolicyRef highlights whichever policy the current page belongs to.
// Housing comes first: it is the worked example, so it is where an inspector should start.
// Only the sidebar is reordered; the plan's own order (POLICY_AREAS) is unchanged elsewhere.
const EXAMINATION_SIDEBAR_AREAS = ['Housing'].concat(POLICY_AREAS.filter(area => area !== 'Housing'))

function buildLocalPlanSidebarSections (activePolicyRef) {
  return EXAMINATION_SIDEBAR_AREAS.map(area => ({
    heading: area,
    items: getPoliciesForArea(area).map(policy => ({
      text: policy.ref + ' ' + policy.title,
      href: '/examination-inspector-view/paragraphs/' + policy.ref.toLowerCase() + '-1',
      active: policy.ref === activePolicyRef
    }))
  }))
}

// Related evidence, consultation representations and NPPF/SDS references for a policy,
// normalised into one shape so the right-hand resource panel doesn't need to know which kind
// it's showing. Content is at policy level, not paragraph level, since none of the underlying
// data (evidence-excerpts.js, policies.js's consultationResponses, plan-paragraphs.js) is
// broken down any finer than that. Returned as separate lists (rather than one flat list the
// template would need to group by kind) plus "all" for the resource panel, which doesn't care
// which kind an item is.
function buildRelatedResources (policy, paragraphId) {
  // officerComment reuses the same commentary Gateway 2 progress check shows under a source/
  // evidence item (app/data/gateway-2-progress.js) — one officer's read of an evidence item
  // shouldn't read differently depending which prototype it's viewed from. Only evidence has
  // one today; representations and NPPF/SDS references fall back to "No officer comment" in
  // the template.
  //
  // A policy with its own lists in POLICY_RESOURCES (plan-paragraphs.js) uses those instead.
  const curated = POLICY_RESOURCES[policy.ref] || {}
  const fromCurated = (items, prefix) => items.map((item, index) => ({
    id: prefix + index,
    title: item.title,
    meta: item.ref || '',
    text: item.text,
    caveat: item.caveat,
    officerComment: item.officerComment
  }))

  const evidence = curated.evidence ? fromCurated(curated.evidence, 'evidence-') : EVIDENCE_EXCERPTS
    .filter(excerpt => excerpt.policyRefs.includes(policy.ref))
    .map((excerpt, index) => ({
      id: 'evidence-' + index,
      title: excerpt.source,
      meta: excerpt.ref,
      text: excerpt.text,
      officerComment: getEvidenceOfficerNote(excerpt)
    }))

  // Grouped by theme rather than shown as individual representations — each theme carries the
  // total representations count (policies.js's themeCount) plus the individual comments sample
  // for it, shown when the theme is opened in the resource viewer.
  const responsesByTheme = new Map()
  ;(curated.representations || policy.consultationResponses || []).forEach(response => {
    if (!responsesByTheme.has(response.theme)) {
      responsesByTheme.set(response.theme, { theme: response.theme, count: response.themeCount, responses: [] })
    }
    responsesByTheme.get(response.theme).responses.push(response)
  })

  const representations = Array.from(responsesByTheme.values()).map((group, index) => {
    const id = 'representation-' + index
    return {
      id,
      title: group.theme,
      meta: group.count + (group.count === 1 ? ' representation' : ' representations'),
      responses: group.responses,
      href: '/examination-inspector-view/paragraphs/' + paragraphId + '/representations/' + id
    }
  })

  const nationalPolicy = curated.nationalPolicy ? fromCurated(curated.nationalPolicy, 'national-policy-') : NATIONAL_POLICY_REFERENCES
    .filter(reference => reference.policyRefs.includes(policy.ref))
    .map((reference, index) => ({
      id: 'national-policy-' + index,
      title: reference.source,
      meta: reference.ref,
      text: reference.text
    }))

  return {
    evidence,
    representations,
    nationalPolicy,
    // Only items with something to show get a panel in the resource viewer.
    all: evidence.concat(representations, nationalPolicy).filter(item => item.text || item.responses)
  }
}

router.get('/examination-inspector-view', (req, res) => {
  res.render('examination-inspector-view/index.html', {
    sidebarSections: buildLocalPlanSidebarSections()
  })
})

router.get('/examination-inspector-view/paragraphs/:id', (req, res) => {
  const index = PLAN_PARAGRAPHS.findIndex(paragraph => paragraph.id === req.params.id)
  if (index === -1) return res.redirect('/examination-inspector-view')

  const paragraph = PLAN_PARAGRAPHS[index]
  const policy = POLICIES.find(policy => policy.ref === paragraph.policyRef)

  res.render('examination-inspector-view/paragraphs/show.html', {
    paragraph,
    previousParagraph: PLAN_PARAGRAPHS[index - 1] || null,
    nextParagraph: PLAN_PARAGRAPHS[index + 1] || null,
    relatedResources: buildRelatedResources(policy, paragraph.id),
    sidebarSections: buildLocalPlanSidebarSections(paragraph.policyRef),
    // A fixed set of the City's COMPASS layers for the policy's area (MAP_LAYERS_BY_AREA).
    mapLayers: gisMapRows(GIS.getMapLayersForArea(paragraph.policyArea))
  })
})

// A theme's full representations list — reached via "See all representations" from the
// paragraph's resource viewer. Representations are policy-level data (like the rest of
// buildRelatedResources), but the route is nested under the paragraph the user came from so
// the back link returns them to exactly where they were reading.
router.get('/examination-inspector-view/paragraphs/:id/representations/:themeId', (req, res) => {
  const index = PLAN_PARAGRAPHS.findIndex(paragraph => paragraph.id === req.params.id)
  if (index === -1) return res.redirect('/examination-inspector-view')

  const paragraph = PLAN_PARAGRAPHS[index]
  const policy = POLICIES.find(policy => policy.ref === paragraph.policyRef)
  const theme = buildRelatedResources(policy, paragraph.id).representations
    .find(representation => representation.id === req.params.themeId)

  if (!theme) return res.redirect('/examination-inspector-view/paragraphs/' + paragraph.id)

  res.render('examination-inspector-view/representations/show.html', {
    paragraph,
    theme,
    sidebarSections: buildLocalPlanSidebarSections(paragraph.policyRef)
  })
})

// The v2 landing page would otherwise be file-routed. It needs a route only so the user
// stories can be read from app/data/user-stories.js rather than copied into the template.
router.get('/policy-writing-v2', (req, res) => {
  res.render('policy-writing-v2/index', {
    userStories: getUserStories(['POUS3', 'POUS4', 'POUS5'])
  })
})

// --- Policy writer v2 ---
//
// A second take on the drafting workspace: evidence and the policy draft side by side on a
// wider page, with a draggable divider between them. See CLAUDE.md.
//
// Slug note: this lives at /policy-writing-v2, NOT nested under /policy-writing/. Nested, the
// "v2" segment would be captured by router.param('variant', ...) above and bounced back to the
// policy-writing landing page. As a sibling path it is still caught by the activeSection
// middleware's startsWith('/policy-writing') branch at the top of this file, which is what we
// want — v2 sits under "Policy writing" in the nav rather than adding a fifth nav item.

const POLICY_WRITER_V2_SCHEMA_VERSION = 6

// Same reasoning as ensurePolicyTopicsShape above: the kit merges session-data-defaults.js into
// a session with a shallow Object.assign, so an existing session whose top-level key is already
// present never picks up changes to the nested seed. The version stamp repairs those sessions
// outright rather than trying to patch them field by field.
function ensurePolicyWriterV2Shape (req) {
  if (req.session.data.policyWriterV2SchemaVersion !== POLICY_WRITER_V2_SCHEMA_VERSION) {
    req.session.data.policyWriterV2Chapter =
      JSON.parse(JSON.stringify(sessionDataDefaults.policyWriterV2Chapter))
    req.session.data.policyWriterV2ChapterOwned = true
    req.session.data.policyWriterV2SchemaVersion = POLICY_WRITER_V2_SCHEMA_VERSION
  }
}

// Deep-clone-on-first-touch, as everywhere else in this file. The sentinel is a plain boolean
// rather than the per-variant object getPolicyTopics uses, because v2 has no blank/prefilled
// split — there is only one journey.
function getV2Chapter (req) {
  ensurePolicyWriterV2Shape(req)
  if (!req.session.data.policyWriterV2ChapterOwned) {
    req.session.data.policyWriterV2Chapter =
      JSON.parse(JSON.stringify(req.session.data.policyWriterV2Chapter || {}))
    req.session.data.policyWriterV2ChapterOwned = true
  }
  return req.session.data.policyWriterV2Chapter
}

function getV2Policies (req) {
  return getV2Chapter(req).policies || []
}

function getV2Policy (req, policyId) {
  return getV2Policies(req).find(policy => policy.id === policyId)
}

const v2PolicyUrl = policyId => '/policy-writing-v2/chapter/' + policyId

// The chapter's policies as a sidebar, using the shared side navigation component so status
// icons and the active-item treatment match the other prototypes (see CLAUDE.md).
function buildV2Sidebar (req, activePolicyId) {
  const chapter = getV2Chapter(req)

  return [
    {
      heading: 'Policies in this chapter',
      items: (chapter.policies || []).map(policy => ({
        text: (policy.ref ? policy.ref + ' ' : '') + (policy.title || 'Untitled policy'),
        href: v2PolicyUrl(policy.id),
        active: policy.id === activePolicyId,
        status: policy.status
      }))
    }
  ]
}

// Shared by every POST submitted from the draft form, so that "Add a policy block" and
// "Insert template" don't silently discard whatever the user has just typed — same reason
// saveWorkspaceFields exists for v1. The typeof guards mean a future button can submit a
// subset of the fields without blanking the rest.
function saveV2DraftFields (policy, body) {
  if (typeof body.policyRef === 'string') policy.ref = body.policyRef.trim()
  if (typeof body.policyTitle === 'string') policy.title = body.policyTitle.trim()
  if (typeof body.draftText === 'string') policy.draft = body.draftText
  if (policy.draft && policy.draft.trim() && policy.status === 'Not started') {
    policy.status = 'In progress'
  }
}

router.get('/policy-writing-v2/chapter', (req, res) => {
  const policies = getV2Policies(req)
  if (!policies.length) return res.render('policy-writing-v2/chapter/index', { chapter: getV2Chapter(req), policy: null })
  res.redirect(v2PolicyUrl(policies[0].id))
})

// Declared before /chapter/:policyId would ever see it — but it's a sibling path, not a child,
// so it could never be captured by that route anyway.
router.get('/policy-writing-v2/chapter-preview', (req, res) => {
  const chapter = getV2Chapter(req)
  const policies = chapter.policies || []
  res.render('policy-writing-v2/chapter-preview/index', {
    chapter,
    draftedCount: policies.filter(policy => policy.draft && policy.draft.trim()).length,
    sourceCount: policies.reduce((total, policy) => total + (policy.sources || []).length, 0)
  })
})

router.get('/policy-writing-v2/chapter/:policyId', (req, res) => {
  const chapter = getV2Chapter(req)
  const policy = getV2Policy(req, req.params.policyId)
  if (!policy) return res.redirect('/policy-writing-v2/chapter')

  const sources = policy.sources || []
  // Which source the middle pane is showing. Read from the query string so each row in the
  // sources rail can be a plain link, and so the choice survives a POST-redirect-GET.
  const selectedSource =
    sources.find(source => source.id === req.query.source) || sources[0] || null

  res.render('policy-writing-v2/chapter/index', {
    chapter,
    policy,
    selectedSource,
    selectedDocument: getEvidenceDocument(selectedSource),
    // The drag-to-view path renders client-side, so it needs the extracts too — attached here
    // rather than in the session, which holds only what the user actually owns.
    sourcesJson: JSON.stringify(sources.map(source => Object.assign({}, source, {
      document: getEvidenceDocument(source)
    }))),
    sidebarSections: buildV2Sidebar(req, policy.id),
    templates: POLICY_TEMPLATES,
    draftedCount: (chapter.policies || []).filter(item => item.draft && item.draft.trim()).length,
    // Serialised once and shared by both the search modal and the draft check — it's the
    // largest thing on the page, so don't emit it twice. Note getSearchableEvidence folds in
    // whatever the user has tagged in the evidence prototype, so this corpus varies with that
    // prototype's session state.
    searchableEvidenceJson: JSON.stringify(getSearchableEvidence(getEvidenceItems(req))),
    searchTermsJson: JSON.stringify(getSearchTerms())
  })
})

router.post('/policy-writing-v2/chapter/:policyId/details', (req, res) => {
  const chapter = getV2Chapter(req)
  chapter.title = req.body.chapterTitleV2 || ''
  chapter.explanatoryText = req.body.explanatoryTextV2 || ''
  res.redirect(v2PolicyUrl(req.params.policyId))
})

router.post('/policy-writing-v2/chapter/:policyId/draft', (req, res) => {
  const policy = getV2Policy(req, req.params.policyId)
  if (policy) saveV2DraftFields(policy, req.body)
  res.redirect(v2PolicyUrl(req.params.policyId))
})

router.post('/policy-writing-v2/chapter/:policyId/policies', (req, res) => {
  const policy = getV2Policy(req, req.params.policyId)
  if (policy) saveV2DraftFields(policy, req.body)

  const newPolicy = {
    id: 'pw2-policy-' + Date.now(),
    ref: '',
    title: '',
    status: 'Not started',
    draft: '',
    sources: [],
    notes: []
  }
  getV2Policies(req).push(newPolicy)
  res.redirect(v2PolicyUrl(newPolicy.id))
})

router.post('/policy-writing-v2/chapter/:policyId/template', (req, res) => {
  const policy = getV2Policy(req, req.params.policyId)
  const template = getPolicyTemplate(req.body.templateId)
  if (policy && template) {
    saveV2DraftFields(policy, req.body)
    policy.draft = policy.draft && policy.draft.trim()
      ? policy.draft.replace(/\s+$/, '') + '\n\n' + template.text
      : template.text
    if (policy.status === 'Not started') policy.status = 'In progress'
  }
  res.redirect(v2PolicyUrl(req.params.policyId))
})

// Handles both ways a source can arrive: the search modal's multi-select payload, and a single
// manual add. The modal's fields are named _selected[...] because the kit's session middleware
// skips anything starting with "_" — so a payload of full evidence excerpts never ends up
// duplicated into req.session.data, while Express still parses it into req.body.
router.post('/policy-writing-v2/chapter/:policyId/sources', (req, res) => {
  const policy = getV2Policy(req, req.params.policyId)
  if (policy) {
    if (!policy.sources) policy.sources = []
    const incoming = []

    const selected = req.body._selected
    if (selected) {
      Object.keys(selected).forEach(key => {
        const entry = selected[key] || {}
        if (entry.text) {
          incoming.push({
            text: entry.text,
            source: entry.source || '',
            ref: entry.ref || '',
            policyRefs: (entry.policyRefs || '').split(',').map(ref => ref.trim()).filter(Boolean)
          })
        }
      })
    }

    if ((req.body.sourceText || '').trim()) {
      incoming.push({
        text: req.body.sourceText.trim(),
        source: (req.body.sourceTitle || '').trim(),
        ref: (req.body.sourceRef || '').trim(),
        policyRefs: []
      })
    }

    incoming.forEach((entry, index) => {
      // De-duplicate on the excerpt text, which is what identifies a passage across the
      // corpus — the same paragraph can arrive with different ids from different routes.
      const alreadyAdded = policy.sources.some(source => source.text === entry.text)
      if (!alreadyAdded) {
        policy.sources.push(Object.assign({ id: 'pw2-src-' + Date.now() + '-' + index }, entry))
      }
    })
  }
  res.redirect(v2PolicyUrl(req.params.policyId))
})

router.post('/policy-writing-v2/chapter/:policyId/sources/:sourceId/remove', (req, res) => {
  const policy = getV2Policy(req, req.params.policyId)
  if (policy && policy.sources) {
    policy.sources = policy.sources.filter(source => source.id !== req.params.sourceId)
  }
  res.redirect(v2PolicyUrl(req.params.policyId))
})

router.post('/policy-writing-v2/chapter/:policyId/notes', (req, res) => {
  const policy = getV2Policy(req, req.params.policyId)
  const text = (req.body.noteText || '').trim()
  if (policy && text) {
    if (!policy.notes) policy.notes = []
    policy.notes.push({
      id: 'pw2-note-' + Date.now(),
      author: 'You',
      date: 'Just now',
      text
    })
  }
  res.redirect(v2PolicyUrl(req.params.policyId))
})

router.post('/policy-writing-v2/chapter/:policyId/notes/:noteId/remove', (req, res) => {
  const policy = getV2Policy(req, req.params.policyId)
  if (policy && policy.notes) {
    policy.notes = policy.notes.filter(note => note.id !== req.params.noteId)
  }
  res.redirect(v2PolicyUrl(req.params.policyId))
})


// A single evidence excerpt on its own page, for reading alongside the workspace in a second
// window. A GET at /source/ (singular) so it can't collide with the /sources/ POST routes.
router.get('/policy-writing-v2/chapter/:policyId/source/:sourceId', (req, res) => {
  const chapter = getV2Chapter(req)
  const policy = getV2Policy(req, req.params.policyId)
  if (!policy) return res.redirect('/policy-writing-v2/chapter')

  const source = (policy.sources || []).find(item => item.id === req.params.sourceId)
  if (!source) return res.redirect(v2PolicyUrl(policy.id))

  res.render('policy-writing-v2/source/index', {
    chapter,
    policy,
    source,
    document: getEvidenceDocument(source)
  })
})

// --- Gateway 2 progress check prototype ---
//
// A second, standalone view for planning inspectors, alongside Examination - inspector view but
// independent of it: a "Plan Progress" page listing every chapter (policy area) and every
// evidence base document with its current status, each with a "View" link through to a page for
// that item. Reuses the same chapters (policies.js's policy areas) and evidence base
// (documents.js) as Examination - inspector view rather than a second plan structure — status
// values themselves are illustrative content added by gateway-2-progress.js, since neither
// existing data source carries one. Like Examination - inspector view, this has no
// `activeSection` wiring: it's an external-viewer prototype with no standard site nav, just the
// title-only appExternalHeader.

// Verified against GOV.UK Frontend's actual govuk-tag modifiers (grey, green, purple, red,
// orange, teal, magenta, yellow, turquoise, pink, plus default/blue via no modifier) — same
// rendering pattern as the existing tagColours[tag] usage elsewhere (e.g. evidence-card.html).
// 'Completed' (as opposed to 'Complete') is the chapter detail table's standardised-vocabulary
// wording for the same underlying colour, reusing this map rather than adding a second one.
const CHAPTER_STATUS_COLOURS = {
  'Not started': 'grey',
  'Brief prepared': '',
  'In progress': 'turquoise',
  Drafted: 'purple',
  Complete: 'green',
  Completed: 'green'
}
const EVIDENCE_STATUS_COLOURS = {
  'Not yet procured': 'grey',
  'In procurement': '',
  'Draft received': 'turquoise',
  'Accepted version': 'green'
}

// Hrefs are pre-encoded here, not with a Nunjucks urlencode filter, for the same reason
// POLICY_AREA_LINKS is pre-encoded above.
router.get('/gateway-2-progress-check', (req, res) => {
  const chapters = POLICY_AREAS.map(area => ({
    name: area,
    status: getChapterStatus(area),
    href: '/gateway-2-progress-check/chapters/' + encodeURIComponent(area)
  }))

  const evidence = Object.keys(DOCUMENTS).map(source => ({
    name: source,
    status: getEvidenceStatus(source),
    lastUpdated: DOCUMENTS[source].date,
    href: '/gateway-2-progress-check/evidence/' + encodeURIComponent(source)
  }))

  res.render('gateway-2-progress-check/index.html', {
    chapters,
    evidence,
    chapterStatusColours: CHAPTER_STATUS_COLOURS,
    evidenceStatusColours: EVIDENCE_STATUS_COLOURS,
    planTimeline: getPlanTimeline()
  })
})

// The chapter's Sources/Evidence/Responses/Policy Text sections, built entirely from data and
// helpers already used elsewhere in this file rather than a second, chapter-specific corpus.
// Hrefs are pre-encoded/pre-resolved here rather than in the template, same reason as elsewhere
// in this file (POLICY_AREA_LINKS, the index route above) — an evidence excerpt's source isn't
// always one of documents.js's DOCUMENTS, so its href is null when there's nothing to link to.
function buildChapterResources (area) {
  const policies = getPoliciesForArea(area)
  const policyRefs = policies.map(policy => policy.ref)

  const sources = Object.values(DOCUMENTS)
    .filter(doc => doc.policyArea === area)
    .map(doc => Object.assign({
      href: '/gateway-2-progress-check/evidence/' + encodeURIComponent(doc.source),
      officerNote: getSourceOfficerNote(doc.source)
    }, doc))

  const evidence = EVIDENCE_EXCERPTS
    .filter(excerpt => excerpt.policyRefs.some(ref => policyRefs.includes(ref)))
    .map(excerpt => Object.assign({
      href: DOCUMENTS[excerpt.source]
        ? '/gateway-2-progress-check/evidence/' + encodeURIComponent(excerpt.source)
        : null,
      officerNote: getEvidenceOfficerNote(excerpt)
    }, excerpt))

  // Grouped into themes the same way as Examination - inspector view (buildRelatedResources,
  // reused per policy below) rather than a second, independent grouping — a theme should look
  // the same wherever an inspector encounters it. policyRef/policyTitle are added here because
  // this list spans every policy in the chapter, unlike buildRelatedResources's single-policy
  // callers, which don't need to say which policy a theme belongs to.
  const representations = policies.flatMap(policy =>
    buildRelatedResources(policy, policy.ref.toLowerCase() + '-1').representations
      .map(theme => Object.assign({ policyRef: policy.ref, policyTitle: policy.title }, theme)))

  const paragraphs = PLAN_PARAGRAPHS.filter(paragraph => paragraph.policyArea === area)

  // Each policy's full wording, where POLICY_TEXT (plan-paragraphs.js) has it — currently the
  // Housing chapter. The template shows these as expandable sections in place of `paragraphs`.
  const policyTexts = policies
    .filter(policy => POLICY_TEXT[policy.ref])
    .map(policy => ({ ref: policy.ref, title: policy.title, isStrategic: policy.isStrategic, body: POLICY_TEXT[policy.ref] }))

  // A chapter written out in full in gateway-2-progress.js (CHAPTER_CONTENT) replaces the
  // derived lists. Its evidence is grouped by document (`extracts` plus one officer note), so
  // the template checks for `extracts` to tell the two shapes apart.
  const content = getChapterContent(area)
  const policyTitles = {}
  policies.forEach(policy => { policyTitles[policy.ref] = policy.title })

  return {
    sources: content.sources || sources,
    evidence: content.evidence || evidence,
    representations: content.representations
      ? content.representations.map(theme => Object.assign({
        policyTitle: policyTitles[theme.policyRef],
        meta: theme.count + ' representations'
      }, theme))
      : representations,
    paragraphs,
    policyTexts
  }
}

router.get('/gateway-2-progress-check/chapters/:area', (req, res) => {
  const area = req.params.area
  if (!POLICY_AREAS.includes(area)) return res.redirect('/gateway-2-progress-check')

  const status = getChapterStatus(area)
  const policies = getPoliciesForArea(area)

  const policyStatuses = {}
  policies.forEach(policy => {
    policyStatuses[policy.ref] = getPolicyStatus(status, policy.hasSummary)
  })

  res.render('gateway-2-progress-check/chapters/show.html', {
    area,
    status,
    statusColours: CHAPTER_STATUS_COLOURS,
    policies,
    policyStatuses,
    officers: getChapterOfficers(area),
    brief: getChapterBrief(area),
    auditLog: getChapterAuditLog(area),
    stageStatuses: getStageStatuses(status),
    resources: buildChapterResources(area),
    // A fixed set of the City's COMPASS layers for this chapter (MAP_LAYERS_BY_AREA).
    mapLayers: gisMapRows(GIS.getMapLayersForArea(area))
  })
})

router.get('/gateway-2-progress-check/evidence/:source', (req, res) => {
  const source = req.params.source
  if (!DOCUMENTS[source]) return res.redirect('/gateway-2-progress-check')

  res.render('gateway-2-progress-check/evidence/show.html', {
    document: getDocument(source),
    status: getEvidenceStatus(source),
    statusColours: EVIDENCE_STATUS_COLOURS
  })
})

// --- Statement of compliance prototype ---
//
// For the local planning authority (not an external viewer, unlike Examination - inspector
// view and Gateway 2 progress check, so this carries the standard site nav): a checklist of the
// legislative requirements a statement of compliance must evidence, each with a status and a
// link through to that requirement's evidence (an audit log of what's been done, via the
// shared appTimeline partial — see app/data/statement-of-compliance.js for the status/history
// model this prototype shares with Gateway 2's audit logs).
//
// Two variants, same pattern as policy-writing (see CLAUDE.md's "Parallel journey variants"):
// "draft" (not everything met yet, each requirement's page shows Planned activities) and
// "completed" (everything Fully met, no further action required). Deliberately a DIFFERENT
// param name from policy-writing's :variant — router.param registers per parameter name across
// the whole router, not per route, so reusing :variant here would also run PW_VARIANTS'
// ['prefilled', 'blank'] check against 'draft'/'completed' and bounce every request to
// /policy-writing.
const SOC_VARIANTS = ['draft', 'completed']

router.param('socVariant', (req, res, next, socVariant) => {
  if (!SOC_VARIANTS.includes(socVariant)) return res.redirect('/statement-of-compliance')
  next()
})

const STATEMENT_STATUS_COLOURS = {
  'Not yet met': 'grey',
  'Partially met': 'yellow',
  'Fully met': 'green'
}

router.get('/statement-of-compliance', (req, res) => {
  res.render('statement-of-compliance/index.html')
})

router.get('/statement-of-compliance/:socVariant', (req, res) => {
  const variant = req.params.socVariant

  const requirements = getRequirements().map(requirement => ({
    ref: requirement.ref,
    title: requirement.title,
    status: getRequirementStatus(requirement.ref, variant),
    href: '/statement-of-compliance/' + variant + '/requirements/' + encodeURIComponent(requirement.ref)
  }))

  res.render('statement-of-compliance/checklist.html', {
    variant,
    requirements,
    statusColours: STATEMENT_STATUS_COLOURS
  })
})

router.get('/statement-of-compliance/:socVariant/requirements/:ref', (req, res) => {
  const variant = req.params.socVariant
  const requirement = getRequirement(req.params.ref)
  if (!requirement) return res.redirect('/statement-of-compliance/' + variant)

  res.render('statement-of-compliance/requirements/show.html', {
    variant,
    requirement,
    status: getRequirementStatus(requirement.ref, variant),
    statusColours: STATEMENT_STATUS_COLOURS,
    history: getRequirementHistory(requirement.ref, variant),
    plannedActivity: getPlannedActivity(requirement.ref, variant)
  })
})

// A placeholder viewer for the materials linked from the audit log (the notice, a consultation
// summary, the self-assessment, and so on) — there's no real document behind any of them, so
// this renders the title only rather than pretending to show real content.
router.get('/statement-of-compliance/documents/:title', (req, res) => {
  if (!isKnownDocument(req.params.title)) return res.redirect('/statement-of-compliance')

  res.render('statement-of-compliance/documents/show.html', {
    title: req.params.title
  })
})
// --- Policy drafting with starting points ---
//
// Built from the Figma designs for this journey (see CLAUDE.md). Two phases:
//   /policy-writing-drafting/starting-points      - review starting points (include/remove)
//   /policy-writing-drafting/chapters             - chapters made from them, and their briefs
//   /policy-writing-drafting/chapters/:id/<step>  - per-chapter steps, in CHAPTER_STEPS order
//
// Slug note: a sibling of /policy-writing rather than nested in it, for the same reason as
// policy-writing-v2 — nested, the segment would be caught by router.param('variant', ...).
//
// Everything the user changes is in req.session.data.policyDrafting, read only through
// getPolicyDrafting. Static reference content (officers, evidence library, viewer extracts) is in
// app/data/policy-drafting.js. Form fields holding free text are named with a leading "_" so
// the kit's session middleware doesn't copy them into the top level of session data as well.

const {
  OFFICERS,
  NPPF_URL,
  getRequirementsForChapter,
  LIBRARY_STATUS_COLOURS,
  SOURCE_TYPES,
  PLANNING_DESIGNATIONS,
  SITES,
  getLibrarySource,
  searchLibrary,
  getLibrarySearchTerms,
  getViewerContent,
  getConsultationsForChapter,
  getSuggestedPolicyAreas
} = require('./data/policy-drafting.js')

const PD = '/policy-writing-drafting'
const POLICY_DRAFTING_SCHEMA_VERSION = 2
const PD_RESULTS_PER_PAGE = 10

function ensurePolicyDraftingShape (req) {
  if (req.session.data.policyDraftingSchemaVersion !== POLICY_DRAFTING_SCHEMA_VERSION) {
    req.session.data.policyDrafting = JSON.parse(JSON.stringify(sessionDataDefaults.policyDrafting))
    req.session.data.policyDraftingOwned = true
    req.session.data.policyDraftingSchemaVersion = POLICY_DRAFTING_SCHEMA_VERSION
  }
}

function getPolicyDrafting (req) {
  ensurePolicyDraftingShape(req)
  if (!req.session.data.policyDraftingOwned) {
    req.session.data.policyDrafting = JSON.parse(JSON.stringify(req.session.data.policyDrafting))
    req.session.data.policyDraftingOwned = true
  }
  return req.session.data.policyDrafting
}

// The per-chapter steps, in sidebar order. `done` decides the step's status icon, and together
// they decide the chapter's status on the chapters list.
const CHAPTER_STEPS = [
  { slug: 'officers', label: 'Assign officers', done: chapter => chapter.officers.length > 0 },
  { slug: 'explanatory-text', label: 'Add explanatory text', done: chapter => Boolean(chapter.explanatoryText.trim()) },
  { slug: 'sources', label: 'Add sources', done: chapter => chapter.sources.length > 0 },
  { slug: 'policies', label: 'Manage policies', done: chapter => Boolean(chapter.policiesConfirmed) },
  { slug: 'draft', label: 'Draft policy', done: chapter => Object.keys(chapter.drafts).length > 0 },
  { slug: 'export', label: 'Share and publish', done: chapter => chapter.exports.length > 0 }
]

const pdChapterUrl = (chapter, step) => PD + '/chapters/' + chapter.id + '/' + step

function chapterStatus (chapter) {
  const done = CHAPTER_STEPS.filter(step => step.done(chapter)).length
  if (done === 0) return 'Not started'
  return done === CHAPTER_STEPS.length ? 'Completed' : 'In progress'
}

function newChapter (id, name, startingPointIds) {
  return {
    id,
    name,
    startingPointIds,
    brief: '',
    officers: [],
    explanatoryText: '',
    sources: [],
    policyAreas: null,
    drafts: {},
    exports: []
  }
}

function uniqueChapterId (data, base) {
  const slug = String(base).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'chapter'
  let id = slug
  let n = 2
  while (data.chapters.some(chapter => chapter.id === id)) id = slug + '-' + n++
  return id
}

// Keeps the chapters in step with the starting points once they're reviewed: an included
// starting point with no chapter gets one, and a chapter left with none of its starting points
// is removed — unless work has started on it, which is never thrown away. Chapters added by hand
// (never had a starting point) are left alone.
function syncChaptersWithStartingPoints (data) {
  const included = data.startingPoints.filter(point => point.included)
  const includedIds = included.map(point => point.id)

  data.chapters = data.chapters.filter(chapter => {
    const hadStartingPoints = chapter.startingPointIds.length > 0
    chapter.startingPointIds = chapter.startingPointIds.filter(id => includedIds.includes(id))
    const orphaned = hadStartingPoints && chapter.startingPointIds.length === 0
    return !(orphaned && chapterStatus(chapter) === 'Not started' && !chapter.brief)
  })

  included.forEach(point => {
    const covered = data.chapters.some(chapter => chapter.startingPointIds.includes(point.id))
    if (!covered) data.chapters.push(newChapter(uniqueChapterId(data, point.name), point.name, [point.id]))
  })
}

// Materialises the suggested policy areas the first time a chapter's policies are touched, so
// editing or adding one has a list to change.
function ensurePolicyAreas (chapter) {
  if (!Array.isArray(chapter.policyAreas)) {
    chapter.policyAreas = getSuggestedPolicyAreas(chapter.name).map(area => ({
      id: area.ref.toLowerCase(),
      ref: area.ref,
      name: area.name,
      selected: true
    }))
  }
  return chapter.policyAreas
}

function selectedPolicyAreas (chapter) {
  return (chapter.policyAreas || []).filter(area => area.selected)
}

function pdTimestamp () {
  return new Date().toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/London' })
}

// Sidebar: the starting points phase, then every chapter, with the current chapter's steps
// nested under it (the shared side navigation's `children`).
//
// The chapters only appear once "Manage chapters" is complete — until then there are no
// settled chapters to list. The exception is a page inside a chapter (reached from the landing
// page's shortcut, say), which still needs its own steps to navigate by.
function buildDraftingSidebar (data, active) {
  const everyChapterHasBrief = data.chapters.length > 0 && data.chapters.every(chapter => chapter.brief.trim())
  const firstWithoutBrief = data.chapters.find(chapter => !chapter.brief.trim())

  const phaseItem = (key, text, href, done) => ({
    text,
    href,
    active: active.page === key,
    status: done ? 'Completed' : (active.page === key ? 'In progress' : 'Not started')
  })

  const sections = [
    {
      heading: 'Starting points',
      items: [
        phaseItem('review', 'Review starting points', PD + '/starting-points', data.reviewed),
        phaseItem('chapters', 'Manage chapters', PD + '/chapters', data.chaptersConfirmed),
        phaseItem('briefs', 'Add briefs',
          firstWithoutBrief ? pdChapterUrl(firstWithoutBrief, 'brief') : PD + '/chapters',
          everyChapterHasBrief)
      ]
    }
  ]

  if (!data.chaptersConfirmed && !active.chapterId) return sections

  sections.push({
    heading: 'Chapters',
    items: data.chapters.map(chapter => {
      const item = { text: chapter.name, href: pdChapterUrl(chapter, CHAPTER_STEPS[0].slug) }
      if (chapter.id === active.chapterId) {
        item.children = CHAPTER_STEPS.map(step => {
          const isActive = step.slug === active.step
          return {
            text: step.label,
            href: pdChapterUrl(chapter, step.slug),
            active: isActive,
            status: step.done(chapter) ? 'Completed' : (isActive ? 'In progress' : 'Not started')
          }
        })
      }
      return item
    })
  })
  return sections
}

// Every chapter page needs the chapter, the sidebar and the breadcrumb root.
function renderChapterPage (req, res, view, step, locals) {
  const data = getPolicyDrafting(req)
  const chapter = req.pdChapter
  res.render('policy-writing-drafting/' + view, Object.assign({
    chapter,
    sidebarSections: buildDraftingSidebar(data, { chapterId: chapter.id, step, page: step === 'brief' ? 'briefs' : null })
  }, locals))
}

// Loads the chapter for every /chapters/:pdChapterId/... route, and sends anything stale
// (a merged or removed chapter) back to the list.
router.param('pdChapterId', (req, res, next, id) => {
  const chapter = getPolicyDrafting(req).chapters.find(candidate => candidate.id === id)
  if (!chapter) return res.redirect(PD + '/chapters')
  req.pdChapter = chapter
  next()
})

router.get(PD, (req, res) => {
  res.render('policy-writing-drafting/index', {
    userStories: getUserStories(['POUS1', 'POUS3', 'POUS4'])
  })
})

// --- Starting points ---

router.get(PD + '/starting-points', (req, res) => {
  const data = getPolicyDrafting(req)
  res.render('policy-writing-drafting/starting-points/index', {
    startingPoints: data.startingPoints,
    sidebarSections: buildDraftingSidebar(data, { page: 'review' })
  })
})

router.post(PD + '/starting-points', (req, res) => {
  const data = getPolicyDrafting(req)
  data.reviewed = true
  syncChaptersWithStartingPoints(data)
  res.redirect(PD + '/chapters')
})

router.post(PD + '/starting-points/:pointId/toggle', (req, res) => {
  const point = getPolicyDrafting(req).startingPoints.find(candidate => candidate.id === req.params.pointId)
  if (point) point.included = !point.included
  res.redirect(PD + '/starting-points')
})

const STARTING_POINT_SOURCES = ['Adopted plan', 'New need', 'NPPF/SDS']

router.get(PD + '/starting-points/new', (req, res) => {
  const data = getPolicyDrafting(req)
  res.render('policy-writing-drafting/starting-points/new', {
    sources: STARTING_POINT_SOURCES,
    sidebarSections: buildDraftingSidebar(data, { page: 'review' })
  })
})

router.post(PD + '/starting-points/new', (req, res) => {
  const data = getPolicyDrafting(req)
  const name = (req.body._startingPointName || '').trim()
  if (name) {
    data.startingPoints.push({
      id: 'sp-' + Date.now(),
      name,
      source: STARTING_POINT_SOURCES.includes(req.body._startingPointSource) ? req.body._startingPointSource : 'New need',
      included: true
    })
  }
  res.redirect(PD + '/starting-points')
})

// --- Chapters and briefs ---

router.get(PD + '/chapters', (req, res) => {
  const data = getPolicyDrafting(req)
  res.render('policy-writing-drafting/chapters/index', {
    chapters: data.chapters.map(chapter => Object.assign({ status: chapterStatus(chapter) }, chapter)),
    sidebarSections: buildDraftingSidebar(data, { page: 'chapters' })
  })
})

router.post(PD + '/chapters', (req, res) => {
  const data = getPolicyDrafting(req)
  data.chaptersConfirmed = true
  const next = data.chapters.find(chapter => !chapter.brief.trim()) || data.chapters[0]
  res.redirect(next ? pdChapterUrl(next, 'brief') : PD + '/chapters')
})

router.get(PD + '/chapters/new', (req, res) => {
  const data = getPolicyDrafting(req)
  res.render('policy-writing-drafting/chapters/new', {
    sidebarSections: buildDraftingSidebar(data, { page: 'chapters' })
  })
})

router.post(PD + '/chapters/new', (req, res) => {
  const data = getPolicyDrafting(req)
  const name = (req.body._chapterName || '').trim()
  if (name) data.chapters.push(newChapter(uniqueChapterId(data, name), name, []))
  res.redirect(PD + '/chapters')
})

router.get(PD + '/chapters/:pdChapterId/brief', (req, res) => {
  const data = getPolicyDrafting(req)
  renderChapterPage(req, res, 'chapters/brief', 'brief', {
    chapters: data.chapters,
    requirements: getRequirementsForChapter(req.pdChapter.name),
    nppfUrl: NPPF_URL
  })
})

// Saving the brief can also move the chapter into another one ("Assign to chapter"): its
// starting points and brief go to the target, and this chapter is removed.
router.post(PD + '/chapters/:pdChapterId/brief', (req, res) => {
  const data = getPolicyDrafting(req)
  const chapter = req.pdChapter
  chapter.brief = (req.body._brief || '').trim().slice(0, 500)

  const target = data.chapters.find(candidate => candidate.id === req.body._assignTo)
  if (target && target !== chapter) {
    target.startingPointIds = target.startingPointIds.concat(chapter.startingPointIds)
    if (chapter.brief) target.brief = [target.brief, chapter.brief].filter(Boolean).join('\n\n').slice(0, 500)
    data.chapters = data.chapters.filter(candidate => candidate !== chapter)
  }
  res.redirect(PD + '/chapters')
})

// --- Chapter steps ---

router.get(PD + '/chapters/:pdChapterId/officers', (req, res) => {
  const chapter = req.pdChapter
  renderChapterPage(req, res, 'chapter/officers', 'officers', {
    assigned: chapter.officers.map(id => OFFICERS.find(officer => officer.id === id)).filter(Boolean),
    available: OFFICERS.filter(officer => !chapter.officers.includes(officer.id))
  })
})

router.post(PD + '/chapters/:pdChapterId/officers', (req, res) => {
  const chapter = req.pdChapter
  if (req.body._action === 'continue') return res.redirect(pdChapterUrl(chapter, 'explanatory-text'))

  const officer = OFFICERS.find(candidate => candidate.id === req.body._officer)
  if (officer && !chapter.officers.includes(officer.id)) chapter.officers.push(officer.id)
  res.redirect(pdChapterUrl(chapter, 'officers'))
})

router.post(PD + '/chapters/:pdChapterId/officers/:officerId/remove', (req, res) => {
  const chapter = req.pdChapter
  chapter.officers = chapter.officers.filter(id => id !== req.params.officerId)
  res.redirect(pdChapterUrl(chapter, 'officers'))
})

router.get(PD + '/chapters/:pdChapterId/explanatory-text', (req, res) => {
  renderChapterPage(req, res, 'chapter/explanatory-text', 'explanatory-text', {
    requirements: getRequirementsForChapter(req.pdChapter.name),
    nppfUrl: NPPF_URL
  })
})

router.post(PD + '/chapters/:pdChapterId/explanatory-text', (req, res) => {
  const chapter = req.pdChapter
  chapter.explanatoryText = (req.body._explanatoryText || '').trim()
  res.redirect(pdChapterUrl(chapter, 'sources'))
})

// GIS layers as sources. A chapter's sources are library ids, or 'gis-<layer id>' for a layer
// from the shared gisLayers collection, so a layer's tag is always read live: switching it
// anywhere shows here too. A layer that has since been removed simply drops out.
const PD_LAYER_PREFIX = 'gis-'
const PD_LAYER_SOURCE_TYPE = 'GIS layer'

function pdLayerSource (layer) {
  const view = gisLayerView(layer)
  return {
    id: PD_LAYER_PREFIX + layer.id,
    name: layer.name,
    type: view.typeLabel,
    status: null,
    layer: view
  }
}

function pdSource (req, id) {
  if (typeof id !== 'string') return null
  if (id.startsWith(PD_LAYER_PREFIX)) {
    const layer = findGisLayer(req, id.slice(PD_LAYER_PREFIX.length))
    return layer ? pdLayerSource(layer) : null
  }
  return getLibrarySource(id)
}

// Layers matching a search, by the same AND-of-words rule as searchLibrary, over the layer's
// name, its tag and "gis layer map". Layers have no policy area, designation or site, so any of
// those filters leaves them out, as does a source type other than "GIS layer".
function pdSearchLayers (req, filters) {
  if (filters.type && filters.type !== PD_LAYER_SOURCE_TYPE) return []
  if (filters.area || filters.designation || filters.site) return []
  const words = String(filters.query || '').toLowerCase().split(/\s+/).filter(Boolean)
  return getGisLayers(req).map(pdLayerSource).filter(source => {
    const haystack = (source.name + ' ' + source.type + ' gis layer map spatial').toLowerCase()
    return words.every(word => haystack.includes(word))
  })
}

// Search and filters are sticky in session (the kit stores req.query there), named pd* so they
// can't collide with the evidence library's own evidenceSearch filter. The page number is
// "_page" so it isn't sticky: a new search should start from the first page.
router.get(PD + '/chapters/:pdChapterId/sources', (req, res) => {
  const chapter = req.pdChapter
  const session = req.session.data
  const filters = {
    query: session.pdSearch || '',
    type: session.pdSourceType || '',
    area: session.pdPolicyArea || '',
    designation: session.pdDesignation || '',
    site: session.pdSite || ''
  }
  const searched = Object.values(filters).some(Boolean)
  const results = searched ? searchLibrary(filters).concat(pdSearchLayers(req, filters)) : []
  const pageCount = Math.max(1, Math.ceil(results.length / PD_RESULTS_PER_PAGE))
  const page = Math.min(pageCount, Math.max(1, parseInt(req.query._page, 10) || 1))
  const start = (page - 1) * PD_RESULTS_PER_PAGE

  renderChapterPage(req, res, 'chapter/sources', 'sources', {
    chapterSources: chapter.sources.map(id => pdSource(req, id)).filter(Boolean),
    filters,
    searched,
    results: results.slice(start, start + PD_RESULTS_PER_PAGE),
    resultCount: results.length,
    firstResult: results.length ? start + 1 : 0,
    lastResult: Math.min(start + PD_RESULTS_PER_PAGE, results.length),
    page,
    pageCount,
    statusColours: LIBRARY_STATUS_COLOURS,
    searchTermsJson: JSON.stringify(getLibrarySearchTerms()),
    // Set after "Add selected sources", for the confirmation banner.
    addedCount: parseInt(req.query._added, 10) || 0,
    sourceTypes: SOURCE_TYPES.concat([PD_LAYER_SOURCE_TYPE]),
    pdLayerReturnTo: pdChapterUrl(chapter, 'sources') + '#pd-existing',
    policyAreas: POLICY_AREAS,
    designations: PLANNING_DESIGNATIONS,
    sites: SITES
  })
})

// Adding or removing keeps the user on the page of results they were on.
function sourcesReturnUrl (chapter, page, extra) {
  const params = []
  const pageNumber = parseInt(page, 10)
  if (pageNumber > 1) params.push('_page=' + pageNumber)
  if (extra) params.push(extra)
  return pdChapterUrl(chapter, 'sources') + (params.length ? '?' + params.join('&') : '')
}

// "Add selected sources": every ticked result in one go. Anything already on the chapter is
// skipped, so the banner's count is what was actually added.
router.post(PD + '/chapters/:pdChapterId/sources/add', (req, res) => {
  const chapter = req.pdChapter
  const incoming = asArray(req.body._sourceIds)
    .filter(id => pdSource(req, id) && !chapter.sources.includes(id))
    .filter((id, index, all) => all.indexOf(id) === index)
  chapter.sources.push(...incoming)
  res.redirect(sourcesReturnUrl(chapter, req.body._page, incoming.length ? '_added=' + incoming.length : ''))
})

router.post(PD + '/chapters/:pdChapterId/sources/:sourceId/remove', (req, res) => {
  const chapter = req.pdChapter
  chapter.sources = chapter.sources.filter(id => id !== req.params.sourceId)
  res.redirect(sourcesReturnUrl(chapter, req.body._page))
})

router.get(PD + '/chapters/:pdChapterId/policies', (req, res) => {
  renderChapterPage(req, res, 'chapter/policies', 'policies', {
    policyAreas: ensurePolicyAreas(req.pdChapter)
  })
})

router.post(PD + '/chapters/:pdChapterId/policies', (req, res) => {
  const chapter = req.pdChapter
  const selected = asArray(req.body._policyAreas)
  ensurePolicyAreas(chapter).forEach(area => { area.selected = selected.includes(area.id) })
  chapter.policiesConfirmed = true
  res.redirect(pdChapterUrl(chapter, 'draft'))
})

// One form for both editing a policy area and adding a policy.
router.get(PD + '/chapters/:pdChapterId/policies/new', (req, res) => {
  renderChapterPage(req, res, 'chapter/policy-area', 'policies', { policyArea: null })
})

router.get(PD + '/chapters/:pdChapterId/policies/:areaId/edit', (req, res) => {
  const policyArea = ensurePolicyAreas(req.pdChapter).find(area => area.id === req.params.areaId)
  if (!policyArea) return res.redirect(pdChapterUrl(req.pdChapter, 'policies'))
  renderChapterPage(req, res, 'chapter/policy-area', 'policies', { policyArea })
})

router.post(PD + '/chapters/:pdChapterId/policies/new', (req, res) => {
  const chapter = req.pdChapter
  const ref = (req.body._policyRef || '').trim()
  const name = (req.body._policyName || '').trim()
  if (name) {
    ensurePolicyAreas(chapter).push({
      id: 'pa-' + Date.now(),
      ref,
      name,
      selected: true
    })
  }
  res.redirect(pdChapterUrl(chapter, 'policies'))
})

router.post(PD + '/chapters/:pdChapterId/policies/:areaId/edit', (req, res) => {
  const chapter = req.pdChapter
  const policyArea = ensurePolicyAreas(chapter).find(area => area.id === req.params.areaId)
  if (policyArea) {
    policyArea.ref = (req.body._policyRef || '').trim() || policyArea.ref
    policyArea.name = (req.body._policyName || '').trim() || policyArea.name
  }
  res.redirect(pdChapterUrl(chapter, 'policies'))
})

// The sources the evidence viewer can show: the chapter's own, plus any consultation summary
// that covers this chapter.
function viewerSourcesFor (req, chapter) {
  return chapter.sources
    .concat(getConsultationsForChapter(chapter.name))
    .filter((id, index, all) => all.indexOf(id) === index)
    .map(id => pdSource(req, id))
    .filter(Boolean)
}

function viewerLocals (req, chapter, sourceId) {
  const viewerSources = viewerSourcesFor(req, chapter)
  const viewerSource = viewerSources.find(source => source.id === sourceId) || viewerSources[0] || null
  return {
    viewerSources,
    viewerSource,
    viewerContent: viewerSource ? getViewerContent(viewerSource.id) : null,
    // Every layer on the chapter, for the map the viewer shows when a layer is open.
    viewerLayers: gisMapRows(viewerSources.filter(source => source.layer).map(source => source.layer))
  }
}

router.get(PD + '/chapters/:pdChapterId/draft', (req, res) => {
  const chapter = req.pdChapter
  const areas = selectedPolicyAreas(chapter)
  const policyArea = areas.find(area => area.id === req.query._policy) || areas[0] || null

  renderChapterPage(req, res, 'chapter/draft', 'draft', Object.assign({
    policyAreas: areas,
    policyArea,
    draft: (policyArea && chapter.drafts[policyArea.id]) || {}
  }, viewerLocals(req, chapter, req.query._source)))
})

router.post(PD + '/chapters/:pdChapterId/draft/:areaId', (req, res) => {
  const chapter = req.pdChapter
  const policyArea = selectedPolicyAreas(chapter).find(area => area.id === req.params.areaId)
  if (policyArea) {
    chapter.drafts[policyArea.id] = {
      title: (req.body._policyTitle || '').trim(),
      context: (req.body._policyContext || '').trim(),
      detail: (req.body._policyDetail || '').trim(),
      strategic: req.body._strategic === 'yes',
      savedAt: pdTimestamp()
    }
  }
  const query = '?_policy=' + encodeURIComponent(req.params.areaId) +
    (req.body._source ? '&_source=' + encodeURIComponent(req.body._source) : '')
  res.redirect(pdChapterUrl(chapter, 'draft') + query)
})

// The evidence viewer on a page of its own, for "Open in new window".
router.get(PD + '/chapters/:pdChapterId/viewer', (req, res) => {
  res.render('policy-writing-drafting/chapter/viewer', Object.assign({
    chapter: req.pdChapter
  }, viewerLocals(req, req.pdChapter, req.query._source)))
})

// What can be viewed or exported: each drafted-for policy in this chapter, the chapter, or the
// whole plan. Values are "<scope>:<id>" so one select or radio can carry both.
function exportOptions (data, chapter) {
  return selectedPolicyAreas(chapter).map(area => ({
    value: 'policy:' + chapter.id + ':' + area.id,
    text: area.ref + ': ' + area.name
  })).concat([
    { value: 'chapter:' + chapter.id, text: chapter.name + ' (full chapter)' },
    { value: 'plan', text: 'The whole draft plan' }
  ])
}

router.get(PD + '/chapters/:pdChapterId/export', (req, res) => {
  const data = getPolicyDrafting(req)
  const chapter = req.pdChapter
  renderChapterPage(req, res, 'chapter/export', 'export', {
    chapters: data.chapters,
    policyAreas: selectedPolicyAreas(chapter),
    exportOptions: exportOptions(data, chapter),
    exported: req.query._exported ? chapter.exports[chapter.exports.length - 1] : null
  })
})

// The content a view or an export covers, as plain copies, so an export's snapshot stays as it
// was when later drafting changes the chapter. scope is 'policy', 'chapter' or 'plan'.
function buildDraftContent (data, scope, chapterId, policyId) {
  const chapter = data.chapters.find(candidate => candidate.id === chapterId)
  const chapters = scope !== 'plan' && chapter ? [chapter] : data.chapters

  return JSON.parse(JSON.stringify({
    scope,
    chapters: chapters.map(item => ({
      chapter: { name: item.name, explanatoryText: item.explanatoryText },
      policyAreas: selectedPolicyAreas(item)
        .filter(area => scope !== 'policy' || area.id === policyId)
        .map(area => ({
          ref: area.ref,
          name: area.name,
          strategic: Boolean(area.strategic),
          draft: item.drafts[area.id] || null
        }))
    }))
  }))
}

// Export option values are "policy:<chapter>:<policy area>", "chapter:<chapter>" or "plan".
function parseExportOption (value) {
  const [scope, chapterId, policyId] = String(value).split(':')
  return { scope, chapterId, policyId }
}

// No file is produced — the prototype records the export in the chapter's audit log, with a
// snapshot of what was exported so that version can be viewed later.
router.post(PD + '/chapters/:pdChapterId/export', (req, res) => {
  const data = getPolicyDrafting(req)
  const chapter = req.pdChapter
  const option = exportOptions(data, chapter).find(candidate => candidate.value === req.body._what)
  const format = req.body._format === 'word' ? 'Word' : 'PDF'
  if (option) {
    const { scope, chapterId, policyId } = parseExportOption(option.value)
    chapter.exports.push({
      id: 'export-' + Date.now(),
      what: option.text,
      format,
      at: pdTimestamp(),
      by: 'You',
      snapshot: buildDraftContent(data, scope, chapterId, policyId)
    })
    return res.redirect(pdChapterUrl(chapter, 'export') + '?_exported=1')
  }
  res.redirect(pdChapterUrl(chapter, 'export'))
})

// One exported version from the audit log, opened in a new window.
router.get(PD + '/chapters/:pdChapterId/export/:exportId', (req, res) => {
  const chapter = req.pdChapter
  const entry = chapter.exports.find(candidate => candidate.id === req.params.exportId)
  if (!entry || !entry.snapshot) return res.redirect(pdChapterUrl(chapter, 'export'))
  res.render('policy-writing-drafting/preview', Object.assign({ version: entry }, entry.snapshot))
})

// The read-only draft, opened in a new window from "View in new window". _scope is policy,
// chapter or plan.
router.get(PD + '/preview', (req, res) => {
  const data = getPolicyDrafting(req)
  const scope = ['policy', 'chapter', 'plan'].includes(req.query._scope) ? req.query._scope : 'plan'
  res.render('policy-writing-drafting/preview',
    buildDraftContent(data, scope, req.query._chapter, req.query._policy))
})

// --- Managing consultation responses ---
//
// An officer imports a consultation's representations, responds to them — in bulk by theme, or
// one by one — and sends the finished responses for review:
//   /consultations/managing-responses                  - landing page, one link per pathway
//   .../import                                          - upload a CSV (only the name is kept)
//   .../view, .../view/themes                           - View and respond, by consultee or theme
//   .../themes/:crThemeId                               - a theme, and its standard response
//   .../consultees/:crConsulteeId                       - a consultee's representations over time
//   .../templates                                       - every standard response
//   .../check                                           - filter, mark ready and send for review
//   .../review                                          - placeholder: no design yet
// The alternative pathway compares a representation with the same respondent's earlier one:
//   .../officer                                         - the policy officer drafts a response
//   .../inspector                                       - the inspector comments (external user)
//
// Representations themselves are static (app/data/consultation-responses.js). Session data holds
// only what changes, in one object read through getConsultationResponses: uploads, the standard
// response for each theme, and each representation's officer, status and response. A response is
// either { templateId } — so editing a standard response changes every representation it's
// assigned to, as the templates page promises — or { text } written for that one representation.

const CR = '/consultations/managing-responses'
const CONSULTATION_RESPONSES_SCHEMA_VERSION = 2
const CR_PAGE_SIZE = 10
const CR_SIDE_BY_SIDE_PAGE_SIZE = 4

const {
  CURRENT_CONSULTATION: CR_CONSULTATION,
  CONSULTATIONS: CR_CONSULTATIONS,
  TOTAL_RESPONDENTS: CR_TOTAL_RESPONDENTS,
  CURRENT_OFFICER: CR_OFFICER,
  INSPECTOR: CR_INSPECTOR,
  RESPONDENT_TYPES: CR_RESPONDENT_TYPES,
  COMMENT_TYPES: CR_COMMENT_TYPES,
  POLICIES: CR_POLICIES,
  THEMES: CR_THEMES,
  CONSULTEES: CR_CONSULTEES,
  getTheme: getCrTheme,
  getConsultee: getCrConsultee,
  getRepresentations: getCrRepresentations,
  getRepresentation: getCrRepresentation,
  consulteeDocument: crConsulteeDocument,
  startingState: crStartingState
} = require('./data/consultation-responses.js')

function getConsultationResponses (req) {
  if (req.session.data.consultationResponsesSchemaVersion !== CONSULTATION_RESPONSES_SCHEMA_VERSION) {
    req.session.data.consultationResponses = JSON.parse(JSON.stringify(sessionDataDefaults.consultationResponses))
    req.session.data.consultationResponsesOwned = true
    req.session.data.consultationResponsesSchemaVersion = CONSULTATION_RESPONSES_SCHEMA_VERSION
  }
  if (!req.session.data.consultationResponsesOwned) {
    req.session.data.consultationResponses = JSON.parse(JSON.stringify(req.session.data.consultationResponses))
    req.session.data.consultationResponsesOwned = true
  }
  return req.session.data.consultationResponses
}

const CR_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const CR_LONG_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December']

// '2026-03-18' -> '18 Mar 2026', or '18 March 2026' with long.
function crDate (iso, long) {
  if (!iso) return ''
  const [year, month, day] = iso.split('-').map(Number)
  return day + ' ' + (long ? CR_LONG_MONTHS : CR_MONTHS)[month - 1] + ' ' + year
}

function crToday () {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' })
}

function crText (value) {
  return typeof value === 'string' ? value.trim() : ''
}

function crPick (value, allowed) {
  return allowed.includes(value) ? value : ''
}

function crPageNumber (value, pageCount) {
  const page = parseInt(value, 10)
  if (!page || page < 1) return 1
  return Math.min(page, Math.max(pageCount, 1))
}

// Messages and errors survive the redirect in session data and are cleared once shown.
function crFlash (req, text) {
  req.session.data.consultationResponsesFlash = text
}

function crSetErrors (req, errors, values) {
  req.session.data.consultationResponsesErrors = { errors, values: values || {} }
}

function crTake (req, key) {
  const value = req.session.data[key]
  delete req.session.data[key]
  return value
}

// How a response status reads on screen. A representation with no response yet is a draft
// with a note saying what's missing, as in the check-and-send design.
const CR_STATUS = {
  draft: { label: 'Draft', colour: 'grey' },
  ready: { label: 'Ready for review', colour: 'green' },
  changes: { label: 'Needs changes', colour: 'orange' },
  'in-review': { label: 'In review', colour: 'blue' }
}

const CR_COMMENT_COLOURS = { Support: 'green', Objection: 'red', Neutral: 'blue' }

// One representation, static content and session state together, ready to render.
function crRepView (data, rep) {
  const state = data.reps[rep.id]
  const template = state.response && state.response.templateId ? data.templates[state.response.templateId] : null
  let responseText = ''
  if (template) responseText = template.text
  else if (state.response && state.response.text) responseText = state.response.text
  const hasResponse = Boolean(responseText)

  const missing = []
  if (!state.officer) missing.push('Officer')
  if (!hasResponse) missing.push('response')
  let missingNote = ''
  if (missing.length === 2) missingNote = 'Officer and response required'
  else if (missing.length) missingNote = missing[0].charAt(0).toUpperCase() + missing[0].slice(1) + ' required'

  const status = hasResponse ? state.status : 'draft'
  return Object.assign({}, rep, {
    officer: state.officer,
    status,
    statusLabel: CR_STATUS[status].label,
    statusColour: CR_STATUS[status].colour,
    commentColour: CR_COMMENT_COLOURS[rep.commentType],
    hasResponse,
    responseText,
    responseSource: template ? 'template' : (hasResponse ? 'own' : null),
    templateId: template ? state.response.templateId : null,
    missingNote,
    // Ready to send means ready and nothing missing; anything else that isn't already with the
    // reviewers is outstanding and won't be sent.
    outstanding: status !== 'in-review' && !(status === 'ready' && state.officer),
    updated: state.updated,
    inspectorReviewed: state.inspectorReviewed,
    inspectorComments: state.inspectorComments
  })
}

function crRepViews (data) {
  return getCrRepresentations().map(rep => crRepView(data, rep))
}

function crNewestFirst (a, b) {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1
  return a.id < b.id ? 1 : -1
}

function crReadiness (views) {
  const total = views.length
  const ready = views.filter(view => view.status === 'ready' && view.officer).length
  const inReview = views.filter(view => view.status === 'in-review').length
  const changes = views.filter(view => view.status === 'changes').length
  const incomplete = views.filter(view => view.status === 'draft').length
  const unassigned = views.filter(view => !view.officer && view.status !== 'in-review').length
  const outstanding = views.filter(view => view.outstanding).length
  return {
    total,
    ready,
    inReview,
    changes,
    incomplete,
    unassigned,
    outstanding,
    done: ready + inReview,
    percent: total ? Math.round((ready + inReview) / total * 100) : 0
  }
}

// Sidebar statuses follow from the data, using the shared status vocabulary.
function buildCrSidebar (data, active, options) {
  const views = crRepViews(data)
  const total = views.length
  const withResponse = views.filter(view => view.hasResponse).length
  const templates = Object.values(data.templates)
  const finals = templates.filter(template => template.status === 'final').length
  const inReview = views.filter(view => view.status === 'in-review').length
  const started = views.filter(view => ['ready', 'in-review'].includes(view.status)).length

  function progress (done, any, all) {
    if (done === all) return 'Completed'
    return any ? 'In progress' : 'Not started'
  }

  const steps = [
    { key: 'import', text: 'Import consultation', href: CR + '/import', status: data.uploads.length ? 'Completed' : 'Not started' },
    { key: 'view', text: 'View and respond', href: (options && options.viewHref) || CR + '/view', status: progress(withResponse, withResponse, total) },
    { key: 'templates', text: 'Manage response templates', href: CR + '/templates', status: progress(finals, templates.length, CR_THEMES.length) },
    { key: 'check', text: 'Check and send for review', href: CR + '/check', status: progress(inReview, started, total) },
    { key: 'review', text: 'Review responses', href: CR + '/review', status: inReview ? 'Not started' : 'Cannot start' }
  ]
  return [{
    items: steps.map(step => ({ text: step.text, href: step.href, status: step.status, active: step.key === active }))
  }]
}

function renderCr (req, res, view, active, locals) {
  const data = getConsultationResponses(req)
  const failed = crTake(req, 'consultationResponsesErrors') || { errors: {}, values: {} }
  res.render('consultations/managing-responses/' + view, Object.assign({
    data,
    consultation: CR_CONSULTATION,
    crDate,
    flash: crTake(req, 'consultationResponsesFlash'),
    errors: failed.errors,
    values: failed.values,
    errorList: Object.keys(failed.errors).map(id => ({ text: failed.errors[id], href: '#' + id })),
    sidebarSections: buildCrSidebar(data, active, locals && locals.sidebarOptions)
  }, locals))
}

function crConsulteesInTheme (views, themeId) {
  const ids = new Set(views.filter(view => view.themeId === themeId).map(view => view.consulteeId))
  return CR_CONSULTEES.filter(consultee => ids.has(consultee.id))
}

router.post(CR + '/reset', (req, res) => {
  getConsultationResponses(req)
  req.session.data.consultationResponses = crStartingState()
  req.session.data.crTheme = 'heritage'
  req.session.data.crPolicy = 'HE1'
  req.session.data.crRespondentType = ''
  req.session.data.crCommentType = ''
  res.redirect(CR + (req.body._to === 'import' ? '/import' : ''))
})

// --- Import consultation ---

router.get(CR + '/import', (req, res) => {
  renderCr(req, res, 'import', 'import')
})

// The form isn't multipart, so the browser sends only the file's name. That's all we keep.
router.post(CR + '/import', (req, res) => {
  const data = getConsultationResponses(req)
  const fileName = crText(req.body._file).split(/[\\/]/).pop()
  if (!fileName) {
    crSetErrors(req, { file: 'Select a CSV file to upload' })
  } else if (!/\.csv$/i.test(fileName)) {
    crSetErrors(req, { file: 'The selected file must be a CSV' })
  } else {
    data.uploads.unshift({
      id: 'upload-' + Date.now().toString(36),
      title: fileName.replace(/\.csv$/i, ''),
      size: (0.5 + (fileName.length % 30) / 10).toFixed(1) + ' MB',
      date: crToday()
    })
    crFlash(req, fileName + ' has been uploaded')
  }
  res.redirect(CR + '/import')
})

router.post(CR + '/import/:uploadId/remove', (req, res) => {
  const data = getConsultationResponses(req)
  const upload = data.uploads.find(candidate => candidate.id === req.params.uploadId)
  if (upload) {
    data.uploads = data.uploads.filter(candidate => candidate !== upload)
    crFlash(req, upload.title + ' has been removed')
  }
  res.redirect(CR + '/import')
})

// --- View and respond ---

router.get(CR + '/view', (req, res) => {
  const data = getConsultationResponses(req)
  const views = crRepViews(data)
  const search = crText(req.session.data.crConsulteeSearch)
  const rows = CR_CONSULTEES
    .filter(consultee => !search || consultee.name.toLowerCase().includes(search.toLowerCase()))
    .map(consultee => {
      const reps = views.filter(view => view.consulteeId === consultee.id)
      return { consultee, total: reps.length, assigned: reps.filter(view => view.hasResponse).length }
    })
  const pageCount = Math.ceil(rows.length / CR_PAGE_SIZE)
  const page = crPageNumber(req.query._page, pageCount)
  renderCr(req, res, 'view-consultees', 'view', {
    search,
    rows: rows.slice((page - 1) * CR_PAGE_SIZE, page * CR_PAGE_SIZE),
    resultCount: rows.length,
    page,
    pageCount
  })
})

router.get(CR + '/view/themes', (req, res) => {
  renderCr(req, res, 'view-themes', 'view', { themes: CR_THEMES, totalRespondents: CR_TOTAL_RESPONDENTS })
})

router.param('crThemeId', (req, res, next, id) => {
  req.crTheme = getCrTheme(id)
  if (!req.crTheme) return res.redirect(CR + '/view/themes')
  next()
})

router.get(CR + '/themes/:crThemeId', (req, res) => {
  const data = getConsultationResponses(req)
  const theme = req.crTheme
  const views = crRepViews(data).filter(view => view.themeId === theme.id)
  renderCr(req, res, 'theme', 'view', {
    theme,
    template: data.templates[theme.id] || null,
    consultees: crConsulteesInTheme(views, theme.id),
    totalRespondents: CR_TOTAL_RESPONDENTS,
    percent: (theme.respondents / CR_TOTAL_RESPONDENTS * 100).toFixed(1),
    repCount: views.length,
    assignedCount: views.filter(view => view.responseSource === 'template').length,
    ownCount: views.filter(view => view.responseSource === 'own').length,
    unassignedCount: views.filter(view => !view.hasResponse).length
  })
})

// "Assign this response to theme" is the bulk response: the standard response becomes final
// and is assigned to every representation on the theme that doesn't have a response yet.
// Representations with a response written for them keep it.
router.post(CR + '/themes/:crThemeId', (req, res) => {
  const data = getConsultationResponses(req)
  const theme = req.crTheme
  const text = crText(req.body._response)
  const back = CR + '/themes/' + theme.id + '#standard-response'
  if (!text) {
    crSetErrors(req, { response: 'Enter a standard response for this theme' })
    return res.redirect(back)
  }
  const existing = data.templates[theme.id]
  const today = crToday()

  if (req.body._action === 'assign') {
    data.templates[theme.id] = { text, status: 'final', updated: today }
    let count = 0
    const consultees = new Set()
    getCrRepresentations().filter(rep => rep.themeId === theme.id).forEach(rep => {
      const state = data.reps[rep.id]
      if (state.response) return
      state.response = { templateId: theme.id }
      state.status = 'draft'
      state.officer = state.officer || CR_OFFICER
      state.updated = today
      consultees.add(rep.consulteeId)
      count++
    })
    crFlash(req, count
      ? 'Standard response assigned to ' + count + ' representation' + (count === 1 ? '' : 's') + ' from ' + consultees.size + ' consultee' + (consultees.size === 1 ? '' : 's')
      : 'Standard response saved. Every representation on this theme already had a response, so nothing new was assigned')
  } else {
    data.templates[theme.id] = { text, status: existing ? existing.status : 'draft', updated: today }
    crFlash(req, existing && existing.status === 'final' ? 'Standard response updated for every representation it is assigned to' : 'Draft standard response saved')
  }
  res.redirect(back)
})

router.param('crConsulteeId', (req, res, next, id) => {
  req.crConsultee = getCrConsultee(id)
  if (!req.crConsultee) return res.redirect(CR + '/view')
  next()
})

router.get(CR + '/consultees/:crConsulteeId', (req, res) => {
  const data = getConsultationResponses(req)
  const consultee = req.crConsultee
  const reps = crRepViews(data).filter(view => view.consulteeId === consultee.id).sort(crNewestFirst)
  const allInReview = reps.length && reps.every(view => view.status === 'in-review')
  const rounds = CR_CONSULTATIONS
    .filter(round => round.id === CR_CONSULTATION.id || consultee.earlier.includes(round.id))
    .map(round => {
      const current = round.id === CR_CONSULTATION.id
      return {
        id: round.id,
        title: round.title,
        date: current ? reps[0].date : round.date,
        fileName: crConsulteeDocument(consultee, round.id).fileName,
        current,
        statusLabel: current ? (allInReview ? 'In review' : 'Pending response') : 'Response sent',
        statusClass: current ? (allInReview ? 'dlp-cr-status--blue' : 'dlp-cr-status--orange') : 'dlp-cr-status--green'
      }
    })
    .reverse()
  const showResponses = req.query._view === 'responses'
  const selected = rounds.find(round => round.id === req.query._doc) || rounds[0]
  renderCr(req, res, 'consultee', 'view', {
    consultee,
    rounds,
    selected,
    document: crConsulteeDocument(consultee, selected.id),
    showResponses,
    reps
  })
})

// --- Manage response templates ---

router.get(CR + '/templates', (req, res) => {
  const data = getConsultationResponses(req)
  const views = crRepViews(data)
  const rows = []
  const missing = []
  CR_THEMES.forEach(theme => {
    const template = data.templates[theme.id]
    if (!template) return missing.push(theme)
    const themeViews = views.filter(view => view.themeId === theme.id)
    const consultees = crConsulteesInTheme(themeViews, theme.id)
    const assigned = consultees.filter(consultee =>
      themeViews.some(view => view.consulteeId === consultee.id && view.templateId === theme.id))
    rows.push({ theme, template, assigned: assigned.length, consultees: consultees.length })
  })
  renderCr(req, res, 'templates', 'templates', { rows, missing })
})

// --- Check and send for review ---

const CR_CHECK_STATUSES = [
  { value: 'outstanding', text: 'Not ready to send' },
  { value: 'draft', text: 'Draft' },
  { value: 'ready', text: 'Ready for review' },
  { value: 'changes', text: 'Needs changes' },
  { value: 'in-review', text: 'In review' }
]
const CR_REVIEW_STATUSES = [
  { value: 'not-sent', text: 'Not sent for review' },
  { value: 'sent', text: 'Sent for review' }
]
const CR_SORTS = [
  { value: 'updated', text: 'Recently updated' },
  { value: 'respondent', text: 'Respondent (A to Z)' },
  { value: 'policy', text: 'Policy' }
]

function crCheckFilters (sessionData) {
  return {
    search: crText(sessionData.crcSearch),
    theme: crPick(sessionData.crcTheme, CR_THEMES.map(theme => theme.id)),
    policy: crPick(sessionData.crcPolicy, CR_POLICIES.map(policy => policy.ref)),
    respondentType: crPick(sessionData.crcRespondentType, CR_RESPONDENT_TYPES),
    commentType: crPick(sessionData.crcCommentType, CR_COMMENT_TYPES),
    status: crPick(sessionData.crcStatus, CR_CHECK_STATUSES.map(status => status.value)),
    review: crPick(sessionData.crcReview, CR_REVIEW_STATUSES.map(status => status.value)),
    sort: crPick(sessionData.crcSort, CR_SORTS.map(sort => sort.value)) || 'updated'
  }
}

function crMatchesCheck (view, filters) {
  if (filters.theme && view.themeId !== filters.theme) return false
  if (filters.policy && view.policyRef !== filters.policy) return false
  if (filters.respondentType && view.respondentType !== filters.respondentType) return false
  if (filters.commentType && view.commentType !== filters.commentType) return false
  if (filters.status === 'outstanding' && !view.outstanding) return false
  if (filters.status && filters.status !== 'outstanding' && view.status !== filters.status) return false
  if (filters.review === 'sent' && view.status !== 'in-review') return false
  if (filters.review === 'not-sent' && view.status === 'in-review') return false
  if (filters.search) {
    const haystack = [view.consulteeName, view.id, view.text, view.responseText].join(' ').toLowerCase()
    if (!haystack.includes(filters.search.toLowerCase())) return false
  }
  return true
}

const CR_SORTERS = {
  updated: (a, b) => (a.updated === b.updated ? (a.id < b.id ? -1 : 1) : (a.updated < b.updated ? 1 : -1)),
  respondent: (a, b) => a.consulteeName.localeCompare(b.consulteeName) || (a.id < b.id ? -1 : 1),
  policy: (a, b) => a.policyRef.localeCompare(b.policyRef, 'en', { numeric: true }) || (a.id < b.id ? -1 : 1)
}

router.get(CR + '/check', (req, res) => {
  const data = getConsultationResponses(req)
  const views = crRepViews(data)
  const filters = crCheckFilters(req.session.data)
  const byTheme = req.query._view === 'themes'
  const matching = views.filter(view => crMatchesCheck(view, filters)).sort(CR_SORTERS[filters.sort])
  const pageCount = Math.ceil(matching.length / CR_PAGE_SIZE)
  const page = crPageNumber(req.query._page, pageCount)
  const themeRows = CR_THEMES.map(theme => {
    const readiness = crReadiness(views.filter(view => view.themeId === theme.id))
    return Object.assign({ theme }, readiness)
  })
  renderCr(req, res, 'check', 'check', {
    filters,
    byTheme,
    readiness: crReadiness(views),
    themeCount: CR_THEMES.length,
    themeRows,
    results: matching.slice((page - 1) * CR_PAGE_SIZE, page * CR_PAGE_SIZE),
    resultCount: matching.length,
    page,
    pageCount,
    options: crFilterOptions(),
    statuses: CR_CHECK_STATUSES,
    reviewStatuses: CR_REVIEW_STATUSES,
    sorts: CR_SORTS,
    lastUpdated: crDate(crToday(), true)
  })
})

// Marks the ticked responses ready. Only a response with an officer and some wording can be;
// the rest are left alone and the message says how many and why.
router.post(CR + '/check/mark-ready', (req, res) => {
  const data = getConsultationResponses(req)
  const ids = [].concat(req.body._repIds || [])
  let marked = 0
  let skipped = 0
  ids.forEach(id => {
    const rep = getCrRepresentation(id)
    if (!rep) return
    const view = crRepView(data, rep)
    if (view.status === 'in-review') return
    if (!view.hasResponse || !view.officer) { skipped++; return }
    data.reps[id].status = 'ready'
    data.reps[id].updated = crToday()
    marked++
  })
  let message = marked + ' response' + (marked === 1 ? '' : 's') + ' marked ready for review'
  if (skipped) message += '. ' + skipped + ' could not be marked because ' + (skipped === 1 ? 'it has' : 'they have') + ' no officer or no response yet'
  crFlash(req, message)
  res.redirect(CR + '/check' + (req.body._page ? '?_page=' + encodeURIComponent(req.body._page) : ''))
})

router.post(CR + '/check/send', (req, res) => {
  const data = getConsultationResponses(req)
  let sent = 0
  crRepViews(data).forEach(view => {
    if (view.status === 'ready' && view.officer) {
      data.reps[view.id].status = 'in-review'
      data.reps[view.id].updated = crToday()
      sent++
    }
  })
  crFlash(req, sent
    ? sent + ' response' + (sent === 1 ? '' : 's') + ' sent to the Planning Policy review team'
    : 'There were no ready responses to send')
  res.redirect(CR + '/check')
})

router.get(CR + '/review', (req, res) => {
  renderCr(req, res, 'review', 'review')
})

// --- Side-by-side views (alternative pathway) ---
//
// Both list the representations matching four sticky filters (crTheme, crPolicy,
// crRespondentType, crCommentType — the kit stores them from the query string) and show the
// selected one beside the same respondent's earlier representation and the LPA's published
// reply to it. The officer drafts a response; the inspector comments.

// Select options for the filters, as { value, text }.
function crFilterOptions () {
  return {
    themes: CR_THEMES.map(theme => ({ value: theme.id, text: theme.title })),
    policies: CR_POLICIES.map(policy => ({ value: policy.ref, text: policy.ref + ' — ' + policy.title })),
    respondentTypes: CR_RESPONDENT_TYPES.map(type => ({ value: type, text: type })),
    commentTypes: CR_COMMENT_TYPES.map(type => ({ value: type, text: type }))
  }
}

function crSideBySideFilters (sessionData) {
  return {
    theme: crPick(sessionData.crTheme, CR_THEMES.map(theme => theme.id)),
    policy: crPick(sessionData.crPolicy, CR_POLICIES.map(policy => policy.ref)),
    respondentType: crPick(sessionData.crRespondentType, CR_RESPONDENT_TYPES),
    commentType: crPick(sessionData.crCommentType, CR_COMMENT_TYPES)
  }
}

function crSideBySide (req, data) {
  const filters = crSideBySideFilters(req.session.data)
  const matching = crRepViews(data).filter(view => crMatchesCheck(view, filters)).sort(crNewestFirst)
  const pageCount = Math.ceil(matching.length / CR_SIDE_BY_SIDE_PAGE_SIZE)
  let selected = matching.find(view => view.id === req.query._rep) || null
  // A representation linked to directly is shown even if the filters have moved on since.
  if (!selected && req.query._rep) {
    const rep = getCrRepresentation(req.query._rep)
    if (rep) selected = crRepView(data, rep)
  }
  const selectedIndex = selected ? matching.findIndex(view => view.id === selected.id) : -1
  const page = req.query._page
    ? crPageNumber(req.query._page, pageCount)
    : (selectedIndex >= 0 ? Math.floor(selectedIndex / CR_SIDE_BY_SIDE_PAGE_SIZE) + 1 : 1)
  const pageItems = matching.slice((page - 1) * CR_SIDE_BY_SIDE_PAGE_SIZE, page * CR_SIDE_BY_SIDE_PAGE_SIZE)
  if (!selected) selected = pageItems[0] || null

  const theme = getCrTheme(filters.theme)
  const policy = CR_POLICIES.find(candidate => candidate.ref === filters.policy)
  const summary = [theme ? theme.title : 'All themes', policy ? policy.ref + ' — ' + policy.title : 'All policies']
  return {
    filters,
    filterSummary: summary.join(' · '),
    matching,
    pageItems,
    page,
    pageCount,
    firstItem: matching.length ? (page - 1) * CR_SIDE_BY_SIDE_PAGE_SIZE + 1 : 0,
    lastItem: (page - 1) * CR_SIDE_BY_SIDE_PAGE_SIZE + pageItems.length,
    selected,
    options: crFilterOptions()
  }
}

router.get(CR + '/officer', (req, res) => {
  const data = getConsultationResponses(req)
  const view = crSideBySide(req, data)
  const templateOptions = CR_THEMES
    .filter(theme => data.templates[theme.id])
    .map(theme => ({ id: theme.id, title: theme.title, text: data.templates[theme.id].text, status: data.templates[theme.id].status }))
  renderCr(req, res, 'officer', 'view', Object.assign(view, {
    templateOptions,
    preview: req.query._preview === '1',
    sidebarOptions: { viewHref: CR + '/officer' }
  }))
})

// Save, mark ready or preview. A response whose wording is still exactly the chosen template's is
// stored as that template, so it keeps following edits to it; anything changed is the officer's own.
router.post(CR + '/officer/:repId', (req, res) => {
  const data = getConsultationResponses(req)
  const rep = getCrRepresentation(req.params.repId)
  if (!rep) return res.redirect(CR + '/officer')
  const state = data.reps[rep.id]
  const templateId = crPick(req.body._template, Object.keys(data.templates))
  const template = templateId ? data.templates[templateId] : null
  let text = crText(req.body._response)
  if (!text && template) text = template.text
  const action = ['save', 'ready', 'preview'].includes(req.body._action) ? req.body._action : 'save'
  const back = CR + '/officer?_rep=' + rep.id + (req.body._page ? '&_page=' + encodeURIComponent(req.body._page) : '')

  if (!text) {
    crSetErrors(req, { response: 'Enter an LPA response, or choose a template to start from' }, { template: templateId })
    return res.redirect(back + '#lpa-response')
  }
  state.response = template && text === template.text ? { templateId } : { text }
  state.officer = state.officer || CR_OFFICER
  state.updated = crToday()
  if (action === 'ready') {
    state.status = 'ready'
    crFlash(req, 'Response to ' + rep.id + ' marked ready for review')
  } else {
    state.status = 'draft'
    crFlash(req, action === 'preview' ? '' : 'Draft response to ' + rep.id + ' saved')
  }
  res.redirect(back + (action === 'preview' ? '&_preview=1#preview' : ''))
})

router.get(CR + '/inspector', (req, res) => {
  const data = getConsultationResponses(req)
  const view = crSideBySide(req, data)
  renderCr(req, res, 'inspector', 'inspector', Object.assign(view, {
    reviewedCount: view.matching.filter(rep => rep.inspectorReviewed).length,
    inspector: CR_INSPECTOR
  }))
})

router.post(CR + '/inspector/:repId', (req, res) => {
  const data = getConsultationResponses(req)
  const rep = getCrRepresentation(req.params.repId)
  if (!rep) return res.redirect(CR + '/inspector')
  const state = data.reps[rep.id]
  const back = CR + '/inspector?_rep=' + rep.id + (req.body._page ? '&_page=' + encodeURIComponent(req.body._page) : '')
  const text = crText(req.body._comment)

  if (req.body._action === 'reviewed') {
    state.inspectorReviewed = !state.inspectorReviewed
    if (text) state.inspectorComments.push({ author: CR_INSPECTOR, date: crToday(), text })
    crFlash(req, rep.id + (state.inspectorReviewed ? ' marked as reviewed' : ' marked as not reviewed'))
    return res.redirect(back)
  }
  if (!text) {
    crSetErrors(req, { comment: 'Enter a comment' })
    return res.redirect(back + '#inspector-comment')
  }
  state.inspectorComments.push({ author: CR_INSPECTOR, date: crToday(), text })
  crFlash(req, 'Comment saved on ' + rep.id)
  res.redirect(back + '#inspector-comments')
})

// --- Make your plan (project management) ---
//
// /project-management/make-your-plan, built from the Figma frames in the git-ignored
// `Figma screenshots/Project management/` folder. An officer works through the first tasks of
// plan-making: the timetable, the Project Initiation Documentation (PID) and the notice of
// intention to commence.
//
//   /                          landing page, with a reset per entry point
//   /overview                  "Make your plan": every task, its status and progress
//   /timetable                 the timetable's three steps
//   /timetable/milestones      add or change plan milestones (?_milestone=<id>)
//   /timetable/committee       schedule milestones for committee (?_timeline=open for the panel)
//   /timetable/check           check and publish timetable
//   /timetable/preview         the published timetable on its own, for a new tab
//   /timetable/export.csv      the timetable in its data format
//   /pid, /pid/:section        the PID and its sections; /pid/approval(/send) to sign it off
//   /notice(/preview)          publish the notice of intention to commence
//
// Everything is one object, req.session.data.projectManagement, read only through
// getProjectManagement. Free-text fields are named `_…` so the kit doesn't copy them into
// session data. Every status is derived from that object by pmStatuses, never stored.

const PM = '/project-management/make-your-plan'
// 2 added scoping activities' starting points and GIS connection.
const PROJECT_MANAGEMENT_SCHEMA_VERSION = 2
const PMD = require('./data/project-management.js')

function getProjectManagement (req) {
  if (req.session.data.projectManagementSchemaVersion !== PROJECT_MANAGEMENT_SCHEMA_VERSION) {
    req.session.data.projectManagement = JSON.parse(JSON.stringify(sessionDataDefaults.projectManagement))
    req.session.data.projectManagementOwned = true
    req.session.data.projectManagementSchemaVersion = PROJECT_MANAGEMENT_SCHEMA_VERSION
  }
  if (!req.session.data.projectManagementOwned) {
    req.session.data.projectManagement = JSON.parse(JSON.stringify(req.session.data.projectManagement))
    req.session.data.projectManagementOwned = true
  }
  return req.session.data.projectManagement
}

const PM_STARTS = {
  start: { build: PMD.startingState, redirect: PM + '/overview' },
  midway: { build: PMD.midwayState, redirect: PM + '/overview', scoping: true }
}

// Part way through, the scoping consultation is under way, so the starting points due before it
// are done. They are the policy-writing prefilled variant's, copied; its plan layers are added
// to the shared collection as this journey's too, through the same connection.
function pmSeedScoping (req, state) {
  const prefilled = sessionDataDefaults.policyStartingPointItems.prefilled
  STARTING_POINT_STEPS.filter(step => step.group === 'now').forEach(step => {
    state.startingPoints[step.slug] = JSON.parse(JSON.stringify(prefilled[step.slug] || []))
  })
  state.gisConnection = JSON.parse(JSON.stringify(sessionDataDefaults.policyGisConnection.prefilled))
  state.startingPoints[GIS_STEP].forEach(item => addGisLayer(req, item.layerId, 'plan', 'starting-points:' + SCOPING_JOURNEY))
}

// Layers added in scoping activities leave with the state that added them.
function pmClearScopingLayers (req) {
  const origin = 'starting-points:' + SCOPING_JOURNEY
  getGisLayers(req).filter(layer => layer.origins.includes(origin))
    .forEach(layer => removeGisLayerOrigin(req, layer.id, origin))
}

// The starting points wizard's steps as Make your plan shows them: a step is done once it has
// anything in it, as in the policy-writing sidebar.
function pmScopingSteps (state) {
  return STARTING_POINT_STEPS.map(step => {
    const count = (state.startingPoints[step.slug] || []).length
    return {
      slug: step.slug,
      group: step.group,
      title: step.navLabel,
      description: count ? count + ' added' : step.hint,
      status: count ? 'Completed' : 'Not started',
      href: PM + '/scoping-activities/' + step.slug
    }
  })
}

// Events after the proposed plan consultation can't be dated yet, so a timetable is complete
// without them. The timeline shows them as "Date needed".
const PM_LATER_STAGES = ['gateway-3', 'examination', 'adopted']

const PM_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December']

function pmText (value) {
  return typeof value === 'string' ? value.trim() : ''
}

function pmToday () {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' })
}

// "2027-02-01" → "1 February 2027". Anything else comes back empty.
function pmFormatDate (iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '')
  if (!match) return ''
  return Number(match[3]) + ' ' + PM_MONTHS[Number(match[2]) - 1] + ' ' + match[1]
}

function pmDateParts (iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '')
  return match ? { day: String(Number(match[3])), month: String(Number(match[2])), year: match[1] } : {}
}

// Reads a GOV.UK date input posted as `<name>-day` etc. An empty date is allowed (`iso: ''`);
// callers decide whether it's required.
function pmReadDate (body, name) {
  const day = pmText(body[name + '-day'])
  const month = pmText(body[name + '-month'])
  const year = pmText(body[name + '-year'])
  const parts = { day, month, year }
  if (!day && !month && !year) return { iso: '', parts }
  const d = Number(day)
  const m = Number(month)
  const y = Number(year)
  const date = new Date(Date.UTC(y, m - 1, d))
  const valid = /^\d{1,2}$/.test(day) && /^\d{1,2}$/.test(month) && /^\d{4}$/.test(year) &&
    date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
  if (!valid) return { iso: '', parts, invalid: true }
  return { iso: year + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0'), parts }
}

function pmMoney (value) {
  const cleaned = pmText(value).replace(/[£,\s]/g, '')
  return cleaned
}

function pmNextId (prefix) {
  return prefix + Date.now().toString(36) + Math.floor(Math.random() * 1000)
}

// Errors, and what was typed into the form that caused them, survive the redirect in session
// data and are cleared as soon as they're shown. A flash message works the same way.
function pmSetErrors (req, errors, values) {
  req.session.data.projectManagementErrors = { errors, values: values || {} }
}

function pmTakeErrors (req) {
  const stored = req.session.data.projectManagementErrors || { errors: {}, values: {} }
  delete req.session.data.projectManagementErrors
  return stored
}

function pmFlash (req, text) {
  req.session.data.projectManagementFlash = text
}

function pmTakeFlash (req) {
  const text = req.session.data.projectManagementFlash
  delete req.session.data.projectManagementFlash
  return text || ''
}

function pmErrorList (errors) {
  return Object.keys(errors).map(id => ({ text: errors[id], href: '#' + id }))
}

function pmLabelForMilestone (item) {
  const type = PMD.getEventType(item.event)
  return type ? type.label : (item.reference || 'New milestone')
}

function pmMilestoneRequired (item) {
  const type = PMD.getEventType(item.event)
  return !type || !PM_LATER_STAGES.includes(type.stage)
}

function pmCommittee (id) {
  return PMD.COMMITTEES.find(committee => committee.id === id)
}

function pmCommitteeLabel (committee) {
  return committee.name + ' - ' + pmFormatDate(committee.date)
}

// --- Statuses ---
//
// Every status and progress bar comes from here, so the overview, the sidebar and each task's
// own page can't disagree. Progress is the share of a task's steps that are done.

function pmCountStatus (done, total) {
  if (total && done >= total) return 'Completed'
  if (done > 0) return 'In progress'
  return 'Not started'
}

function pmFilled (pid, fields) {
  return fields.filter(field => pmText(pid[field])).length
}

const PM_GOVERNANCE_FIELDS = ['governanceSummary', 'councilLeadName', 'councilLeadEmail', 'sponsorName', 'sponsorEmail', 'seniorEngagement']
const PM_NOTICE_FIELDS = ['area', 'timetableLink', 'addresses', 'updates']

function pmTimetableSteps (state) {
  const required = state.milestones.filter(pmMilestoneRequired)
  const dated = required.filter(item => item.eventDate).length
  const assigned = state.committeeItems.filter(item => item.committee).length
  const timetable = state.timetable
  return [
    {
      key: 'milestones',
      title: 'Add or change plan milestones',
      description: 'Enter the planned date for each event in your timetable.',
      href: PM + '/timetable/milestones',
      status: pmCountStatus(dated, required.length)
    },
    {
      key: 'committee',
      title: 'Schedule milestones for committee',
      description: 'Link events from your timetable to your committee dates.',
      href: PM + '/timetable/committee',
      status: pmCountStatus(assigned, state.committeeItems.length)
    },
    {
      key: 'check',
      title: 'Check and publish timetable',
      description: 'Add a publication statement, check how the timetable will look and publish it.',
      href: PM + '/timetable/check',
      status: timetable.published ? 'Completed' : (timetable.statementSaved ? 'In progress' : 'Not started')
    }
  ]
}

function pmBudgetStatus (pid) {
  const filled = PMD.BUDGET_CATEGORIES.filter(category =>
    PMD.BUDGET_YEARS.some(year => pmText(pid.budget[category.key + '-' + year]))).length
  return pmCountStatus(filled, PMD.BUDGET_CATEGORIES.length)
}

// The PID's sections, in the order the design lists them. `link` sections live elsewhere.
const PM_PID_SECTIONS = [
  {
    slug: 'about',
    title: 'About the plan',
    status: pid => pmText(pid.planTitle) ? 'Completed' : (pid.lastUpdated ? 'In progress' : 'Not started')
  },
  {
    slug: 'timetable',
    title: 'Timetable',
    link: PM + '/timetable-placeholder',
    linkText: 'Go to timetable',
    status: (pid, state) => state.timetable.published ? 'Completed' : pmCountStatus(
      pmTimetableSteps(state).filter(step => step.status !== 'Not started').length ? 1 : 0, 2)
  },
  {
    slug: 'governance',
    title: 'Governance',
    status: pid => pmCountStatus(pmFilled(pid, PM_GOVERNANCE_FIELDS), PM_GOVERNANCE_FIELDS.length)
  },
  {
    slug: 'staff',
    title: 'Staff resource and management',
    crumb: 'Staff resource',
    status: pid => (pid.saved.staff && pid.staff.length && pid.teamLead)
      ? 'Completed'
      : (pid.staff.length || pmText(pid.supportNeeds) ? 'In progress' : 'Not started')
  },
  {
    slug: 'evidence',
    title: 'Evidence',
    link: '/evidence',
    linkText: 'Go to evidence summary',
    // Lives in the Evidence prototype, which records no progress this one can read.
    status: () => 'Not started'
  },
  {
    slug: 'related',
    title: 'Related strategies, papers and documentation',
    crumb: 'Related documentation',
    status: pid => pid.saved.related ? 'Completed' : (pid.related.length ? 'In progress' : 'Not started')
  },
  {
    slug: 'stakeholder',
    title: 'Stakeholder engagement',
    status: pid => pmText(pid.engagementApproach) ? 'Completed' : 'Not started'
  },
  {
    slug: 'budget',
    title: 'Budget',
    status: pid => pmBudgetStatus(pid)
  },
  {
    slug: 'risks',
    title: 'Risks and mitigations',
    crumb: 'Risks',
    status: pid => (pid.saved.risks && pid.risks.length) ? 'Completed' : (pid.risks.length ? 'In progress' : 'Not started')
  },
  {
    slug: 'approval',
    title: 'Approve this PID',
    crumb: 'Approval',
    status: pid => pid.approval.approved ? 'Completed' : (pid.approval.sent ? 'In progress' : 'Not started')
  }
]

function pmPidSection (slug) {
  return PM_PID_SECTIONS.find(section => section.slug === slug)
}

function pmPidSections (state) {
  return PM_PID_SECTIONS.map(section => Object.assign({}, section, {
    status: section.status(state.pid, state),
    href: section.link || PM + '/pid/' + section.slug
  }))
}

// Sections that must be finished before the PID can go for approval: everything this
// prototype can record, which leaves out Evidence (in another prototype) and approval itself.
function pmPidOutstanding (state) {
  return pmPidSections(state).filter(section =>
    !['evidence', 'approval'].includes(section.slug) && section.status !== 'Completed')
}

function pmStatuses (state) {
  const steps = pmTimetableSteps(state)
  const timetableDone = Boolean(state.timetable.published)
  const stepsDone = steps.filter(step => step.status === 'Completed').length
  const timetableStarted = steps.some(step => step.status !== 'Not started')

  const sections = pmPidSections(state).filter(section => !section.link)
  const pidDone = Boolean(state.pid.approval.approved)
  const pidCompleted = sections.filter(section => section.status === 'Completed').length
  const pidStarted = sections.some(section => section.status !== 'Not started')

  const notice = state.notice
  const noticeFilled = PM_NOTICE_FIELDS.filter(field => pmText(notice[field])).length
  let noticeStatus = 'Not started'
  if (notice.published) noticeStatus = 'Completed'
  else if (!pidDone && (timetableDone || noticeFilled)) noticeStatus = 'Blocked'
  else if (noticeFilled) noticeStatus = 'In progress'

  const scopingSteps = pmScopingSteps(state)
  const scopingDone = scopingSteps.filter(step => step.status === 'Completed').length

  return {
    timetable: {
      status: timetableDone ? 'Completed' : (timetableStarted ? 'In progress' : 'Not started'),
      progress: timetableDone ? 1 : stepsDone / steps.length
    },
    pid: {
      status: pidDone ? 'Completed' : (pidStarted ? 'In progress' : 'Not started'),
      progress: pidDone ? 1 : pidCompleted / sections.length
    },
    notice: {
      status: noticeStatus,
      progress: notice.published ? 1 : noticeFilled / (PM_NOTICE_FIELDS.length + 1),
      blockedReason: noticeStatus === 'Blocked' ? 'The Project Initiation Documentation must be approved before you publish the notice.' : ''
    },
    scopingActivities: {
      status: scopingDone === scopingSteps.length ? 'Completed' : (scopingDone ? 'In progress' : 'Not started'),
      progress: scopingDone / scopingSteps.length
    },
    scopingConsultation: {
      status: state.scopingConsultationStarted ? 'In progress' : 'Not started',
      progress: null
    }
  }
}

// The overview's cards, in the design's order. `start` is how a not-started task is begun: a
// link, or (for the scoping consultation, which lives in another prototype) a form that records
// it was started on the way there.
function pmTasks (state) {
  const statuses = pmStatuses(state)
  const team = PMD.TEAM
  return [
    {
      key: 'timetable',
      title: 'Timetable',
      description: 'Create and publish your timetable',
      href: PM + '/timetable-placeholder',
      assignees: [team.dd, team.sm]
    },
    {
      key: 'notice',
      title: 'Publish timetable and notice',
      description: 'Publish your timetable and notification to start the plan making process',
      href: PM + '/notice',
      assignees: [team.dd, team.rk]
    },
    {
      key: 'pid',
      title: 'Project Initiation Documentation',
      description: 'Decide how you will manage and govern the plan making as a project',
      href: PM + '/pid',
      assignees: [team.sm, team.dd, team.jo]
    },
    {
      key: 'scopingActivities',
      title: 'Scoping activities',
      description: 'Scope your plan-making and set a vision',
      href: PM + '/scoping-activities',
      assignees: [team.jo]
    },
    {
      key: 'scopingConsultation',
      title: 'Scoping consultation',
      description: 'Manage public engagement on the scope of the local plan',
      href: PM + '/scoping-consultation',
      startAction: PM + '/scoping-consultation/start',
      assignees: [team.rk, team.dd]
    }
  ].map(task => Object.assign(task, statuses[task.key], {
    progressPercent: statuses[task.key].progress === null ? null : Math.round(statuses[task.key].progress * 100)
  }))
}

// On a scoping activities page its steps are nested under it, with `activeStep` current.
function buildPmSidebar (state, active, activeStep) {
  const statuses = pmStatuses(state)
  const items = [
    { key: 'timetable', text: 'Create and publish timetable', href: PM + '/timetable-placeholder' },
    { key: 'pid', text: 'Project Initiation Documentation', href: PM + '/pid' },
    { key: 'scopingActivities', text: 'Scoping activities', href: PM + '/scoping-activities' },
    { key: 'scopingConsultation', text: 'Scoping consultation', href: PM + '/scoping-consultation' },
    { key: 'notice', text: 'Publish notice of plan-making', href: PM + '/notice' }
  ]
  return [{
    items: items.map(item => ({
      text: item.text,
      href: item.href,
      active: item.key === active && !activeStep,
      status: statuses[item.key].status,
      children: item.key === 'scopingActivities' && active === item.key
        ? pmScopingSteps(state).map(step => ({ text: step.title, href: step.href, active: step.slug === activeStep, status: step.status }))
        : undefined
    }))
  }]
}

function renderPm (req, res, view, active, locals) {
  const state = getProjectManagement(req)
  const stored = pmTakeErrors(req)
  res.render('project-management/make-your-plan/' + view, Object.assign({
    pm: state,
    pmBase: PM,
    statuses: pmStatuses(state),
    timetableSteps: pmTimetableSteps(state),
    errors: stored.errors,
    values: stored.values,
    errorList: pmErrorList(stored.errors),
    flash: pmTakeFlash(req),
    formatDate: pmFormatDate,
    dateParts: pmDateParts,
    guidanceUrl: PMD.GUIDANCE_URL,
    guidanceSearchUrl: PMD.GUIDANCE_SEARCH_URL,
    sidebarSections: buildPmSidebar(state, active, locals && locals.step ? locals.step.slug : null)
  }, locals))
}

router.post(PM + '/reset', (req, res) => {
  const start = PM_STARTS[req.body._stage] || PM_STARTS.start
  getProjectManagement(req)
  pmClearScopingLayers(req)
  req.session.data.projectManagement = start.build()
  req.session.data.projectManagementOwned = true
  if (start.scoping) pmSeedScoping(req, req.session.data.projectManagement)
  delete req.session.data.projectManagementErrors
  delete req.session.data.projectManagementFlash
  res.redirect(start.redirect)
})

// --- Overview ---

router.get(PM + '/overview', (req, res) => {
  const state = getProjectManagement(req)
  const tasks = pmTasks(state)
  renderPm(req, res, 'overview', null, {
    tasks,
    anyStarted: tasks.some(task => task.status !== 'Not started'),
    currentTasks: tasks.filter(task => task.status !== 'Completed'),
    completedTasks: tasks.filter(task => task.status === 'Completed')
  })
})

// The scoping consultation isn't built yet. Starting it here records that it has begun, so the
// overview can say so, and then goes to its placeholder.
router.post(PM + '/scoping-consultation/start', (req, res) => {
  getProjectManagement(req).scopingConsultationStarted = true
  res.redirect(PM + '/scoping-consultation')
})

router.get(PM + '/scoping-consultation', (req, res) => {
  renderPm(req, res, 'not-designed', 'scopingConsultation', {
    title: 'Scoping consultation',
    text: 'This section of the prototype has not been built yet.',
    standIn: false
  })
})

// --- Scoping activities: the policy starting points wizard ---
//
// The same steps, handlers and step body as /policy-writing/:variant/starting-points (see
// SCOPING_JOURNEY), inside Make your plan's own page shell and sidebar.

router.get(PM + '/scoping-activities', (req, res) => {
  const steps = pmScopingSteps(getProjectManagement(req))
  renderPm(req, res, 'scoping-activities/index', 'scopingActivities', {
    groups: [
      { heading: 'Policy starting points – now', steps: steps.filter(step => step.group === 'now') },
      { heading: 'Policy starting points – next', steps: steps.filter(step => step.group === 'next') }
    ]
  })
})

router.get(PM + '/scoping-activities/:step', (req, res) => {
  const locals = spStepLocals(req, SCOPING_JOURNEY, req.params.step)
  if (!locals) return res.redirect(PM + '/scoping-activities')
  renderPm(req, res, 'scoping-activities/step', 'scopingActivities', Object.assign(locals, {
    continueHref: PM + '/scoping-activities',
    backHref: PM + '/scoping-activities'
  }))
})

router.post(PM + '/scoping-activities/' + GIS_STEP + '/connect', (req, res) => spConnect(req, res, SCOPING_JOURNEY))
router.post(PM + '/scoping-activities/' + GIS_STEP + '/disconnect', (req, res) => spDisconnect(req, res, SCOPING_JOURNEY))
router.post(PM + '/scoping-activities/' + GIS_STEP + '/layers', (req, res) => spAddLayers(req, res, SCOPING_JOURNEY))
router.post(PM + '/scoping-activities/:step', (req, res) => spSaveItem(req, res, SCOPING_JOURNEY))
router.post(PM + '/scoping-activities/:step/:itemId/remove', (req, res) => spRemoveItem(req, res, SCOPING_JOURNEY))

router.get(PM + '/readiness-checker', (req, res) => {
  renderPm(req, res, 'not-designed', null, {
    title: 'Readiness checker',
    text: 'The readiness checker, which would tell you whether you are ready to move to the next stage of plan-making, has not been designed yet.'
  })
})

// --- Timetable ---

// The timetable's entry points (overview card, sidebar, PID) go here while its coded prototype
// is rebuilt. The flow below is still reachable by URL.
router.get(PM + '/timetable-placeholder', (req, res) => {
  renderPm(req, res, 'not-designed', 'timetable', {
    title: 'Timetable',
    text: 'Coded prototype is being built for this flow.',
    standIn: false
  })
})

router.get(PM + '/timetable', (req, res) => {
  renderPm(req, res, 'timetable/index', 'timetable')
})

function pmMilestoneView (item) {
  return Object.assign({}, item, { label: pmLabelForMilestone(item) })
}

function pmMilestoneSummary (state) {
  const required = state.milestones.filter(pmMilestoneRequired)
  return required.filter(item => item.eventDate).length + ' of ' + required.length + ' milestones have dates entered.'
}

router.get(PM + '/timetable/milestones', (req, res) => {
  const state = getProjectManagement(req)
  const isNew = req.query._milestone === 'new'
  const selected = isNew
    ? Object.assign(PMD.milestone(''), { id: 'new', reference: '', entryDate: pmToday() })
    : (state.milestones.find(item => item.id === req.query._milestone) || state.milestones[0])
  renderPm(req, res, 'timetable/milestones', 'timetable', {
    milestones: state.milestones.map(pmMilestoneView),
    selected: pmMilestoneView(selected),
    isNew,
    eventTypes: PMD.EVENT_TYPES,
    today: pmToday(),
    stepStatus: pmTimetableSteps(state)[0].status
  })
})

router.post(PM + '/timetable/milestones/:id', (req, res) => {
  const state = getProjectManagement(req)
  const isNew = req.params.id === 'new'
  const existing = state.milestones.find(item => item.id === req.params.id)
  if (!isNew && !existing) return res.redirect(PM + '/timetable/milestones')
  const back = PM + '/timetable/milestones?_milestone=' + encodeURIComponent(req.params.id)

  const reference = pmText(req.body._reference)
  const plan = pmText(req.body._plan)
  const event = PMD.getEventType(req.body._event) ? req.body._event : ''
  const eventDate = pmReadDate(req.body, '_eventDate')
  const actualDate = pmReadDate(req.body, '_actualDate')
  const entryDate = pmReadDate(req.body, '_entryDate')
  const notes = pmText(req.body._notes)

  const errors = {}
  if (!reference) errors.reference = 'Enter a reference for this event'
  else if (state.milestones.some(item => item.reference === reference && item.id !== req.params.id)) {
    errors.reference = 'Another milestone already has this reference. Give each event a unique reference'
  }
  if (!plan) errors.plan = 'Enter the reference of the plan this event belongs to'
  if (!event) errors.event = 'Select the type of plan event'
  if (eventDate.invalid) errors.eventDate = 'Planned date must be a real date, for example 1 4 2027'
  if (actualDate.invalid) errors.actualDate = 'Actual date must be a real date, for example 1 4 2027'
  if (entryDate.invalid) errors.entryDate = 'Entry date must be a real date, for example 20 7 2026'
  if (Object.keys(errors).length) {
    pmSetErrors(req, errors, {
      reference, plan, event, notes,
      eventDate: eventDate.parts, actualDate: actualDate.parts, entryDate: entryDate.parts
    })
    return res.redirect(back)
  }

  const item = existing || { id: pmNextId('m') }
  Object.assign(item, {
    reference,
    plan,
    event,
    eventDate: eventDate.iso,
    actualDate: actualDate.iso,
    entryDate: entryDate.iso || pmToday(),
    notes
  })
  if (!existing) state.milestones.push(item)
  // Changing a published timetable means publishing it again.
  state.timetable.published = ''
  pmFlash(req, pmLabelForMilestone(item) + ' saved successfully. ' + pmMilestoneSummary(state))
  if (req.body._action === 'add-another') return res.redirect(PM + '/timetable/milestones?_milestone=new')
  res.redirect(PM + '/timetable/milestones?_milestone=' + encodeURIComponent(item.id))
})

// The timeline panel: every milestone, then every committee item, in the order the design
// shows them. A milestone that has happened is Completed; one with a date is Upcoming.
function pmTimeline (state) {
  const milestones = state.milestones.map(item => {
    let status = 'Date needed'
    if (item.actualDate) status = 'Completed'
    else if (item.eventDate) status = 'Upcoming'
    return {
      title: pmLabelForMilestone(item),
      href: PM + '/timetable/milestones?_milestone=' + encodeURIComponent(item.id),
      date: pmFormatDate(item.actualDate || item.eventDate),
      status,
      sortDate: item.actualDate || item.eventDate || '9999'
    }
  })
  const committeeItems = state.committeeItems.map(item => {
    const committee = pmCommittee(item.committee)
    return {
      title: item.title,
      href: PM + '/timetable/committee#item-' + item.id,
      date: committee ? pmFormatDate(committee.date) : '',
      status: committee ? 'Scheduled' : 'Not yet assigned',
      committee: committee ? committee.name : '',
      sortDate: committee ? committee.date : '9999'
    }
  })
  return milestones.concat(committeeItems).sort((a, b) => a.sortDate < b.sortDate ? -1 : (a.sortDate > b.sortDate ? 1 : 0))
}

router.get(PM + '/timetable/committee', (req, res) => {
  const state = getProjectManagement(req)
  const items = state.committeeItems
  renderPm(req, res, 'timetable/committee', 'timetable', {
    unassigned: items.filter(item => !pmCommittee(item.committee)),
    committees: PMD.COMMITTEES.map(committee => ({
      id: committee.id,
      label: pmCommitteeLabel(committee),
      items: items.filter(item => item.committee === committee.id)
    })),
    committeeOptions: PMD.COMMITTEES.map(committee => ({ value: committee.id, text: pmCommitteeLabel(committee) })),
    committeeDatesUrl: PMD.COMMITTEE_DATES_URL,
    timelineOpen: req.query._timeline === 'open',
    timeline: pmTimeline(state),
    stepStatus: pmTimetableSteps(state)[1].status
  })
})

router.post(PM + '/timetable/committee', (req, res) => {
  const state = getProjectManagement(req)
  state.committeeItems.forEach(item => {
    const value = req.body['_committee-' + item.id]
    if (value === undefined) return
    item.committee = pmCommittee(value) ? value : ''
  })
  const assigned = state.committeeItems.filter(item => item.committee).length
  pmFlash(req, 'Committee schedule saved. ' + assigned + ' of ' + state.committeeItems.length + ' items are assigned to a committee date.')
  res.redirect(PM + '/timetable/committee')
})

router.post(PM + '/timetable/committee/items', (req, res) => {
  const state = getProjectManagement(req)
  const title = pmText(req.body._title)
  const description = pmText(req.body._description)
  if (!title) {
    pmSetErrors(req, { itemTitle: 'Enter a name for the item' }, { title, description })
    return res.redirect(PM + '/timetable/committee#add-item')
  }
  const item = { id: pmNextId('ci'), title, description, committee: '' }
  state.committeeItems.push(item)
  pmFlash(req, title + ' added to events to schedule.')
  res.redirect(PM + '/timetable/committee#item-' + item.id)
})

// The timetable as the authority's website would show it: stages, with a consultation's end
// date as the date representations must be received by.
function buildPublishedTimetable (state) {
  return PMD.PUBLISHED_STAGES.map((stage, index) => {
    const items = state.milestones.filter(item => {
      const type = PMD.getEventType(item.event)
      return type && type.stage === stage.stage
    })
    const start = items.find(item => (PMD.getEventType(item.event).part || 'start') === 'start')
    const end = items.find(item => PMD.getEventType(item.event).part === 'end')
    return Object.assign({}, stage, {
      number: index + 1,
      date: start ? pmFormatDate(start.eventDate) : '',
      endDate: end ? pmFormatDate(end.eventDate) : '',
      hasEnd: Boolean(end),
      editHref: start ? PM + '/timetable/milestones?_milestone=' + encodeURIComponent(start.id) : PM + '/timetable/milestones'
    })
  })
}

router.get(PM + '/timetable/check', (req, res) => {
  const state = getProjectManagement(req)
  renderPm(req, res, 'timetable/check', 'timetable', {
    published: buildPublishedTimetable(state),
    checkAndProvideUrl: PMD.CHECK_AND_PROVIDE_URL,
    stepStatus: pmTimetableSteps(state)[2].status
  })
})

router.post(PM + '/timetable/check', (req, res) => {
  const state = getProjectManagement(req)
  const statement = pmText(req.body._statement)
  const timetable = state.timetable
  if (!statement) {
    pmSetErrors(req, { statement: 'Enter a statement confirming that the timetable is to have effect' }, { statement })
    return res.redirect(PM + '/timetable/check')
  }
  if (statement !== timetable.statement) timetable.published = ''
  timetable.statement = statement
  timetable.statementSaved = true

  if (req.body._action !== 'publish') {
    pmFlash(req, 'Statement saved.')
    return res.redirect(PM + '/timetable/check')
  }
  // Only what can be dated now: events after the proposed plan consultation may stay blank.
  const undated = state.milestones.filter(pmMilestoneRequired).filter(item => !item.eventDate)
  if (undated.length) {
    pmSetErrors(req, {
      milestones: 'Enter a planned date for every milestone up to the proposed plan consultation before you publish the timetable. ' +
        pmMilestoneSummary(state).replace(/\.$/, '') + ', so ' + undated.length + ' still need one.'
    })
    return res.redirect(PM + '/timetable/check')
  }
  timetable.published = pmToday()
  pmFlash(req, 'Your timetable has been published.')
  res.redirect(PM + '/timetable')
})

router.get(PM + '/timetable/preview', (req, res) => {
  const state = getProjectManagement(req)
  res.render('project-management/make-your-plan/timetable/preview', {
    pm: state,
    published: buildPublishedTimetable(state)
  })
})

function pmCsvCell (value) {
  const text = String(value || '')
  return /[",\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text
}

router.get(PM + '/timetable/export.csv', (req, res) => {
  const state = getProjectManagement(req)
  const header = ['reference', 'plan', 'plan-event', 'event-date', 'actual-date', 'entry-date', 'notes']
  const rows = state.milestones.map(item =>
    [item.reference, item.plan, item.event, item.eventDate, item.actualDate, item.entryDate, item.notes].map(pmCsvCell).join(','))
  res.set('Content-Type', 'text/csv; charset=utf-8')
  res.set('Content-Disposition', 'attachment; filename="local-plan-timetable.csv"')
  res.send([header.join(',')].concat(rows).join('\n') + '\n')
})

// --- Project Initiation Documentation ---

router.get(PM + '/pid', (req, res) => {
  renderPm(req, res, 'pid/index', 'pid', { sections: pmPidSections(getProjectManagement(req)) })
})

function pmPidStaffView (pid) {
  return pid.staff.map(member => Object.assign({}, member, { lead: member.id === pid.teamLead }))
}

// The approval check-your-answers rows, section by section, each with a Change link back to it.
function pmPidSummary (state) {
  const pid = state.pid
  const show = value => pmText(value) || '—'
  const money = value => pmText(value) ? '£' + Number(value).toLocaleString('en-GB') : ''
  const lead = pid.staff.find(member => member.id === pid.teamLead)
  const href = slug => PM + '/pid/' + slug
  return [
    {
      title: 'About the plan',
      rows: [
        { key: 'Plan title', value: show(pid.planTitle), href: href('about') },
        { key: 'Role of the plan', value: show(pid.roleOfPlan), href: href('about') },
        { key: 'Summary of the scope of the plan', value: 'A summary of the scope of the plan will appear here when the scoping activities have been completed.', href: PM + '/scoping-activities' }
      ]
    },
    {
      title: 'Governance',
      rows: [
        { key: 'Summary of governance', value: show(pid.governanceSummary), href: href('governance') },
        { key: 'Council Lead (Portfolio Holder) — Name', value: show(pid.councilLeadName), href: href('governance') },
        { key: 'Council Lead (Portfolio Holder) — Email', value: show(pid.councilLeadEmail), href: href('governance') },
        { key: 'Local Plan Sponsor (Lead Officer) — Name', value: show(pid.sponsorName), href: href('governance') },
        { key: 'Local Plan Sponsor (Lead Officer) — Email', value: show(pid.sponsorEmail), href: href('governance') },
        { key: 'Senior officer engagement approach', value: show(pid.seniorEngagement), href: href('governance') }
      ]
    },
    {
      title: 'Staff resource and management',
      rows: [
        {
          key: 'Staff members',
          value: pid.staff.length ? pid.staff.map(member => member.jobTitle + (member.name ? ' (' + member.name + ')' : ' (vacant)')).join(', ') : 'None added',
          href: href('staff')
        },
        { key: 'Team lead', value: lead ? (lead.name || lead.jobTitle) : '—', href: href('staff/team') },
        { key: 'Additional corporate support needs', value: show(pid.supportNeeds), href: href('staff/team') }
      ]
    },
    {
      title: 'Related strategies, papers and documentation',
      rows: [
        { key: 'Related documents', value: pid.related.length ? pid.related.map(doc => doc.name).join(', ') : 'None added', href: href('related') }
      ]
    },
    {
      title: 'Stakeholder engagement',
      rows: [{ key: 'Engagement approach', value: show(pid.engagementApproach), href: href('stakeholder') }]
    },
    {
      title: 'Budget',
      rows: PMD.BUDGET_CATEGORIES.map(category => {
        const years = PMD.BUDGET_YEARS
          .map(year => ({ year, value: money(pid.budget[category.key + '-' + year]) }))
          .filter(entry => entry.value)
        return {
          key: category.label,
          value: years.length ? years.map(entry => 'Year ' + entry.year + ': ' + entry.value).join(', ') : '—',
          href: href('budget')
        }
      }).concat([{
        key: 'Budget review date(s)',
        value: pid.budgetReviews.length ? pid.budgetReviews.map(pmFormatDate).join(', ') : '—',
        href: href('budget')
      }])
    },
    {
      title: 'Risks and mitigations',
      rows: [{ key: 'Risks', value: pid.risks.length ? pid.risks.map(risk => risk.risk).join(', ') : 'None added', href: href('risks') }]
    }
  ]
}

function pmApprovers (state) {
  const pid = state.pid
  const status = pid.approval.approved ? 'Approved' : (pid.approval.sent ? 'Awaiting approval' : '-')
  return [
    { role: 'Political lead', name: pmText(pid.councilLeadName) || 'Not yet named', status },
    { role: 'Chief Executive', name: PMD.CHIEF_EXECUTIVE, status },
    { role: 'Sponsor', name: pmText(pid.sponsorName) || 'Not yet named', status }
  ]
}

router.get(PM + '/pid/approval', (req, res) => {
  renderPm(req, res, 'pid/approval', 'pid', { summary: pmPidSummary(getProjectManagement(req)) })
})

router.get(PM + '/pid/approval/send', (req, res) => {
  const state = getProjectManagement(req)
  renderPm(req, res, 'pid/approval-send', 'pid', {
    outstanding: pmPidOutstanding(state),
    approvers: pmApprovers(state)
  })
})

router.post(PM + '/pid/approval/send', (req, res) => {
  const state = getProjectManagement(req)
  if (pmPidOutstanding(state).length) return res.redirect(PM + '/pid/approval/send')
  state.pid.approval.sent = pmToday()
  state.pid.lastUpdated = pmToday()
  pmFlash(req, 'Project Initiation Documentation sent for approval.')
  res.redirect(PM + '/pid/approval/send')
})

// Prototype only: stands in for the three approvers signing it off in the real service.
router.post(PM + '/pid/approval/approve', (req, res) => {
  const state = getProjectManagement(req)
  if (!state.pid.approval.sent) return res.redirect(PM + '/pid/approval/send')
  state.pid.approval.approved = pmToday()
  pmFlash(req, 'Project Initiation Documentation approved.')
  res.redirect(PM + '/pid')
})

router.get(PM + '/pid/staff/team', (req, res) => {
  const state = getProjectManagement(req)
  renderPm(req, res, 'pid/staff-team', 'pid', {
    section: pmPidSection('staff'),
    staffOptions: state.pid.staff.map(member => ({
      value: member.id,
      text: member.name ? member.name + ' (' + member.jobTitle + ')' : member.jobTitle + ' (vacant)'
    }))
  })
})

router.post(PM + '/pid/staff/team', (req, res) => {
  const pid = getProjectManagement(req).pid
  pid.teamLead = pid.staff.some(member => member.id === req.body._teamLead) ? req.body._teamLead : ''
  pid.supportNeeds = pmText(req.body._supportNeeds)
  pid.saved.staff = true
  pid.lastUpdated = pmToday()
  pmFlash(req, 'Staff resource and management saved.')
  res.redirect(PM + '/pid')
})

router.get(PM + '/pid/:section', (req, res) => {
  const section = pmPidSection(req.params.section)
  if (!section) return res.redirect(PM + '/pid')
  if (section.link) return res.redirect(section.link)
  if (section.slug === 'approval') return res.redirect(PM + '/pid/approval')
  const pid = getProjectManagement(req).pid
  renderPm(req, res, 'pid/' + section.slug, 'pid', {
    section,
    staff: pmPidStaffView(pid),
    levels: PMD.LEVELS,
    budgetCategories: PMD.BUDGET_CATEGORIES,
    budgetYears: PMD.BUDGET_YEARS
  })
})

// Each section's form. List sections (staff, related, risks, budget reviews) post an `_action`
// of add / remove, which come back to the same page, or save / next, which move on.
const PM_PID_HANDLERS = {
  about (req, pid) {
    pid.planTitle = pmText(req.body._planTitle)
    pid.roleOfPlan = pmText(req.body._roleOfPlan)
  },
  governance (req, pid) {
    PM_GOVERNANCE_FIELDS.forEach(field => { pid[field] = pmText(req.body['_' + field]) })
  },
  stakeholder (req, pid) {
    pid.engagementApproach = pmText(req.body._engagementApproach)
  },
  staff (req, pid) {
    const action = req.body._action || ''
    if (action.startsWith('remove:')) {
      const id = action.slice('remove:'.length)
      pid.staff = pid.staff.filter(member => member.id !== id)
      if (pid.teamLead === id) pid.teamLead = ''
      return '#staff'
    }
    if (action !== 'add') return PM + '/pid/staff/team'
    const values = {
      jobTitle: pmText(req.body._jobTitle),
      name: pmText(req.body._name),
      fte: pmText(req.body._fte),
      postStatus: ['Filled', 'Vacant'].includes(req.body._postStatus) ? req.body._postStatus : '',
      timeOnPlan: pmText(req.body._timeOnPlan).replace(/%$/, '')
    }
    const errors = {}
    if (!values.jobTitle) errors.jobTitle = 'Enter a job title'
    if (!values.fte) errors.fte = 'Enter the full-time equivalent, for example 1 or 0.6'
    else if (!/^\d*\.?\d+$/.test(values.fte) || Number(values.fte) <= 0 || Number(values.fte) > 1) errors.fte = 'Full-time equivalent must be a number between 0.1 and 1'
    if (!values.postStatus) errors.postStatus = 'Select whether the post is filled or vacant'
    if (values.timeOnPlan && (!/^\d+$/.test(values.timeOnPlan) || Number(values.timeOnPlan) > 100)) errors.timeOnPlan = 'Percentage of time must be a whole number between 0 and 100'
    if (Object.keys(errors).length) return { errors, values, anchor: '#add-staff' }
    pid.staff.push(Object.assign({ id: pmNextId('s') }, values))
    return '#staff'
  },
  related (req, pid) {
    const action = req.body._action || ''
    if (action.startsWith('remove:')) {
      const id = action.slice('remove:'.length)
      pid.related = pid.related.filter(doc => doc.id !== id)
      return '#related'
    }
    if (action !== 'add') {
      pid.saved.related = true
      return null
    }
    const values = { name: pmText(req.body._docName), link: pmText(req.body._docLink), file: pmText(req.body._docFile) }
    if (!values.name) return { errors: { docName: 'Enter the name of the strategy, paper or document' }, values, anchor: '#add-related' }
    pid.related.push(Object.assign({ id: pmNextId('d') }, values))
    return '#related'
  },
  risks (req, pid) {
    const action = req.body._action || ''
    if (action.startsWith('remove:')) {
      const id = action.slice('remove:'.length)
      pid.risks = pid.risks.filter(risk => risk.id !== id)
      return '#risks'
    }
    if (action !== 'add') {
      pid.saved.risks = true
      return null
    }
    const values = {
      risk: pmText(req.body._risk),
      likelihood: PMD.LEVELS.includes(req.body._likelihood) ? req.body._likelihood : '',
      impact: PMD.LEVELS.includes(req.body._impact) ? req.body._impact : '',
      mitigation: pmText(req.body._mitigation)
    }
    const errors = {}
    if (!values.risk) errors.risk = 'Describe the risk'
    if (!values.likelihood) errors.likelihood = 'Select how likely the risk is'
    if (!values.impact) errors.impact = 'Select the potential impact'
    if (!values.mitigation) errors.mitigation = 'Describe how the risk will be mitigated'
    if (Object.keys(errors).length) return { errors, values, anchor: '#add-risk' }
    pid.risks.push(Object.assign({ id: pmNextId('r') }, values))
    return '#risks'
  },
  budget (req, pid) {
    const errors = {}
    const values = {}
    PMD.BUDGET_CATEGORIES.forEach(category => PMD.BUDGET_YEARS.forEach(year => {
      const key = category.key + '-' + year
      const value = pmMoney(req.body['_budget-' + key])
      values[key] = value
      if (value && !/^\d+(\.\d{1,2})?$/.test(value)) errors['budget-' + key] = category.label + ', year ' + year + ' must be an amount in pounds, like 25000'
    }))
    if (Object.keys(errors).length) return { errors, values: { budget: values }, anchor: '' }
    pid.budget = values

    const action = req.body._action || ''
    if (action.startsWith('remove:')) {
      const date = action.slice('remove:'.length)
      pid.budgetReviews = pid.budgetReviews.filter(review => review !== date)
      return '#reviews'
    }
    if (action === 'add-review') {
      const review = pmReadDate(req.body, '_review')
      if (!review.iso) {
        return {
          errors: { review: review.invalid ? 'Budget review date must be a real date' : 'Enter a budget review date' },
          values: { budget: values, review: review.parts },
          anchor: '#reviews'
        }
      }
      if (!pid.budgetReviews.includes(review.iso)) pid.budgetReviews.push(review.iso)
      pid.budgetReviews.sort()
      return '#reviews'
    }
    return null
  }
}

router.post(PM + '/pid/:section', (req, res) => {
  const section = pmPidSection(req.params.section)
  const handler = section && PM_PID_HANDLERS[section.slug]
  if (!handler) return res.redirect(PM + '/pid')
  const pid = getProjectManagement(req).pid
  const page = PM + '/pid/' + section.slug
  const outcome = handler(req, pid)
  if (outcome && outcome.errors) {
    pmSetErrors(req, outcome.errors, outcome.values)
    return res.redirect(page + (outcome.anchor || ''))
  }
  pid.lastUpdated = pmToday()
  // A string is where to go next: an anchor on this page, or another page.
  if (typeof outcome === 'string') return res.redirect(outcome.startsWith('#') ? page + outcome : outcome)
  pmFlash(req, section.title + ' saved.')
  res.redirect(PM + '/pid')
})

// --- Publish notice of intention to commence ---

function pmNoticeLocals (state) {
  return {
    noticeStatus: pmStatuses(state).notice,
    timetablePublished: Boolean(state.timetable.published),
    pidApproved: Boolean(state.pid.approval.approved),
    scoping: buildPublishedTimetable(state).find(stage => stage.stage === 'scoping')
  }
}

router.get(PM + '/notice', (req, res) => {
  const state = getProjectManagement(req)
  renderPm(req, res, 'notice/index', 'notice', pmNoticeLocals(state))
})

router.post(PM + '/notice', (req, res) => {
  const notice = getProjectManagement(req).notice
  PM_NOTICE_FIELDS.forEach(field => { notice[field] = pmText(req.body['_' + field]) })
  res.redirect(PM + '/notice/preview')
})

router.get(PM + '/notice/preview', (req, res) => {
  const state = getProjectManagement(req)
  renderPm(req, res, 'notice/preview', 'notice', Object.assign(pmNoticeLocals(state), {
    organisationName: appConfig.organisationName,
    missing: PM_NOTICE_FIELDS.filter(field => !pmText(state.notice[field]))
  }))
})

router.post(PM + '/notice/publish', (req, res) => {
  const state = getProjectManagement(req)
  const errors = {}
  if (PM_NOTICE_FIELDS.some(field => !pmText(state.notice[field]))) errors.notice = 'Fill in every detail of the notice before you publish it'
  if (!state.timetable.published) errors.timetable = 'Publish your timetable before or at the same time as this notice'
  if (!state.pid.approval.approved) errors.pid = 'The Project Initiation Documentation must be approved before you publish the notice'
  if (Object.keys(errors).length) {
    pmSetErrors(req, errors)
    return res.redirect(PM + '/notice/preview')
  }
  state.notice.published = pmToday()
  pmFlash(req, 'Notice of intention to commence published.')
  res.redirect(PM + '/overview')
})

// --- Publish plan versions (project management) ---
//
// Built from the Figma frames in `Figma screenshots/Versioning/`. An officer looks back through
// the plan's published versions, compares two side by side, and publishes or shares the current
// draft internally, which adds a timestamped entry to the history:
//   /project-management/publish-plan-versions               - landing page, with a reset
//   /project-management/publish-plan-versions/history       - step 1: version history and compare
//   /project-management/publish-plan-versions/versions/:id  - one version, read-only, with its layers
//   /project-management/publish-plan-versions/compare       - two versions side by side (?_v=a&_v=b)
//   /project-management/publish-plan-versions/share         - step 2: what to include, and why
//   /project-management/publish-plan-versions/preview       - step 3: preview, then download or share
//
// Everything is one object, req.session.data.planVersions, read only through getPlanVersions.
// A new version is a snapshot (its content and, when published, the shared GIS layers as they
// were), so viewing or comparing it later shows what went out, not the current draft.

const PPV = '/project-management/publish-plan-versions'
const PLAN_VERSIONS_SCHEMA_VERSION = 3
const PV = require('./data/plan-versions.js')

function getPlanVersions (req) {
  if (req.session.data.planVersionsSchemaVersion !== PLAN_VERSIONS_SCHEMA_VERSION) {
    req.session.data.planVersions = PV.startingState()
    req.session.data.planVersionsSchemaVersion = PLAN_VERSIONS_SCHEMA_VERSION
  }
  return req.session.data.planVersions
}

function ppvNow () {
  const now = new Date()
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(now).map(part => [part.type, part.value]))
  return {
    short: parts.day + ' ' + parts.month + ' ' + parts.year + ', ' + parts.hour + ':' + parts.minute,
    long: new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', day: 'numeric', month: 'long', year: 'numeric' }).format(now)
  }
}

function ppvAsArray (value) {
  if (value === undefined || value === null || value === '') return []
  return Array.isArray(value) ? value : [value]
}

// A layer as shown on a version: seeded layers carry only an id, type, version and date, so
// their name and shape come from the GIS catalogue; snapshotted layers carry everything.
function ppvLayerView (layer) {
  const catalogue = GIS.getCatalogueLayer(layer.id) || {}
  const type = GIS.LAYER_TYPES[layer.type] || GIS.LAYER_TYPES.evidence
  return {
    id: layer.id,
    name: layer.name || catalogue.name || layer.id,
    typeLabel: type.label,
    version: layer.version,
    created: layer.created,
    geometry: layer.geometry || catalogue.geometry,
    features: layer.features !== undefined ? layer.features : catalogue.features,
    hasPreview: Boolean(GIS.getCatalogueLayer(layer.id))
  }
}

// The shared GIS layers as they are now, frozen into a published version.
function ppvSnapshotLayers (req) {
  return getGisLayers(req).map(layer => {
    const view = glLayerView(layer)
    const catalogue = GIS.getCatalogueLayer(layer.id) || {}
    return {
      id: layer.id,
      name: view.name,
      type: layer.type,
      version: view.current.version,
      created: view.current.createdLabel || 'Not recorded',
      geometry: layer.geometry || catalogue.geometry,
      features: layer.features !== undefined ? layer.features : catalogue.features
    }
  })
}

// What a share or publish includes, in words: "Full local plan", or the chosen chapters.
function ppvIncluded (pending) {
  if (pending.scope === 'full') return 'Full local plan'
  const names = pending.chapters.map(id => {
    const chapter = PV.getChapter(id)
    return chapter.short || chapter.title
  })
  if (names.length <= 3) return names.length === 1 ? names[0] : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1]
  return names.slice(0, 2).join(', ') + ' and ' + (names.length - 2) + ' more chapters'
}

// Compares two versions' content. Chapters are matched by id and paragraphs by their position in
// the chapter, since numbering can differ between versions (the draft's Housing is chapter 4, the
// published excerpts' is chapter 3). Each column lists every chapter in either version, with a
// note where a chapter is missing from that side.
function ppvDiff (earlier, later) {
  const leftChapters = earlier.content.chapters
  const rightChapters = later.content.chapters
  const ids = leftChapters.map(c => c.id).concat(rightChapters.map(c => c.id).filter(id => !leftChapters.some(c => c.id === id)))
  let changes = 0

  function column (own, other, mark) {
    return ids.map(id => {
      const chapter = own.find(c => c.id === id)
      const counterpart = other.find(c => c.id === id)
      if (!chapter) return { heading: counterpart.heading, missing: true, paragraphs: [] }
      return {
        heading: chapter.heading,
        missing: false,
        paragraphs: chapter.paragraphs.map((paragraph, index) => {
          const match = counterpart && counterpart.paragraphs[index]
          const changed = !match || match.text !== paragraph.text
          if (changed) changes++
          return Object.assign({}, paragraph, { mark: changed ? mark : null })
        })
      }
    })
  }

  const left = column(leftChapters, rightChapters, 'removed')
  const right = column(rightChapters, leftChapters, 'added')
  return { left, right, changes }
}

// Preview and export has no item of its own: it can only be reached from Share or publish, so
// that item stays current while previewing.
function ppvSteps (current) {
  return [{
    items: [
      { text: 'View and compare version history', href: PPV + '/history', active: current === 'history' },
      { text: 'Share or publish', href: PPV + '/share', active: current === 'share' || current === 'preview' }
    ]
  }]
}

function renderPpv (req, res, template, current, locals) {
  res.render('project-management/publish-plan-versions/' + template, Object.assign({
    ppv: PPV,
    planTitle: PV.PLAN_TITLE,
    draft: PV.DRAFT,
    sidebarSections: ppvSteps(current)
  }, locals))
}

router.get(PPV, (req, res) => {
  renderPpv(req, res, 'index', null, {})
})

router.post(PPV + '/reset', (req, res) => {
  req.session.data.planVersions = PV.startingState()
  req.session.data.planVersionsSchemaVersion = PLAN_VERSIONS_SCHEMA_VERSION
  res.redirect(PPV + '/history')
})

router.get(PPV + '/history', (req, res) => {
  const state = getPlanVersions(req)
  const flash = state.flash
  state.flash = null
  renderPpv(req, res, 'history', 'history', {
    versions: state.versions,
    flash,
    compareError: req.query._error === 'compare'
  })
})

router.get(PPV + '/versions/:id', (req, res) => {
  const version = getPlanVersions(req).versions.find(v => v.id === req.params.id)
  if (!version) return res.redirect(PPV + '/history')
  renderPpv(req, res, 'version', 'history', {
    version,
    layers: version.layers.map(ppvLayerView)
  })
})

router.get(PPV + '/compare', (req, res) => {
  const versions = getPlanVersions(req).versions
  const chosen = ppvAsArray(req.query._v)
  const picked = versions.filter(v => chosen.includes(v.id))
  if (picked.length !== 2) return res.redirect(PPV + '/history?_error=compare#compare')
  // The history is oldest first, so the first picked is the earlier version.
  const [earlier, later] = picked
  renderPpv(req, res, 'compare', 'history', {
    earlier,
    later,
    diff: ppvDiff(earlier, later)
  })
})

function ppvShareView (req, res, values, errors) {
  renderPpv(req, res, 'share', 'share', {
    values,
    errors,
    // Each error links to its field's first input, which is where the macros put the id.
    errorList: Object.keys(errors).map(key => ({ text: errors[key], href: '#' + key })),
    chapterItems: PV.CHAPTERS.map(chapter => ({
      value: chapter.id,
      text: chapter.title,
      checked: values.chapters.includes(chapter.id)
    })),
    milestoneItems: PV.MILESTONES.map(milestone => ({
      value: milestone,
      text: milestone,
      selected: milestone === values.milestone
    }))
  })
}

router.get(PPV + '/share', (req, res) => {
  const state = getPlanVersions(req)
  ppvShareView(req, res, state.pending || {
    scope: '',
    chapters: PV.CHAPTERS.map(c => c.id),
    purpose: '',
    milestone: PV.MILESTONES[0]
  }, {})
})

router.post(PPV + '/share', (req, res) => {
  const values = {
    scope: ['full', 'selected'].includes(req.body._scope) ? req.body._scope : '',
    chapters: ppvAsArray(req.body._chapters).filter(id => PV.getChapter(id)),
    purpose: ['publish', 'share'].includes(req.body._purpose) ? req.body._purpose : '',
    milestone: PV.MILESTONES.includes(req.body._milestone) ? req.body._milestone : ''
  }
  const errors = {}
  if (!values.scope) errors.scope = 'Select what to share'
  else if (values.scope === 'selected' && !values.chapters.length) errors.chapters = 'Select at least one chapter'
  if (!values.purpose) errors.purpose = 'Select whether to publish the draft or share it internally'
  else if (values.purpose === 'publish' && !values.milestone) errors.milestone = 'Select a milestone'
  if (Object.keys(errors).length) return ppvShareView(req, res, values, errors)

  getPlanVersions(req).pending = values
  res.redirect(PPV + '/preview')
})

function ppvPreviewLocals (pending) {
  return {
    pending,
    included: ppvIncluded(pending),
    content: PV.draftContent(pending.scope === 'full' ? [] : pending.chapters)
  }
}

router.get(PPV + '/preview', (req, res) => {
  const pending = getPlanVersions(req).pending
  if (!pending) return res.redirect(PPV + '/share')
  renderPpv(req, res, 'preview', 'preview', ppvPreviewLocals(pending))
})

router.get(PPV + '/preview/document', (req, res) => {
  const pending = getPlanVersions(req).pending
  if (!pending) return res.redirect(PPV + '/share')
  renderPpv(req, res, 'document', 'preview', ppvPreviewLocals(pending))
})

router.post(PPV + '/preview', (req, res) => {
  const state = getPlanVersions(req)
  const pending = state.pending
  if (!pending) return res.redirect(PPV + '/share')
  const method = req.body._action === 'share' ? 'share' : 'download'
  const publish = pending.purpose === 'publish'
  const now = ppvNow()
  const included = ppvIncluded(pending)
  const version = {
    id: 'v' + state.nextId++,
    title: publish ? pending.milestone : 'Internal review: ' + included,
    versionDate: PV.DRAFT.versionDate,
    published: publish ? now.short : null,
    publishedLong: publish ? now.long : null,
    sharedAt: now.short,
    exportedBy: PV.OFFICER,
    status: publish ? 'published' : 'shared',
    method,
    included,
    content: PV.draftContent(pending.scope === 'full' ? [] : pending.chapters),
    layers: publish ? ppvSnapshotLayers(req) : []
  }
  state.versions.push(version)
  state.pending = null
  state.flash = {
    title: publish ? 'Published: ' + version.title : 'Shared for internal review: ' + included,
    text: method === 'share'
      ? 'The internal team would get an email with a link to view it. It has been added to the version history.'
      : 'The file pack of PDFs and images would download now (the prototype doesn’t produce a file). It has been added to the version history.',
    id: version.id
  }
  res.redirect(PPV + '/history')
})
