//
// Document content and metadata for the Evidence prototype.
//
// This is static reference content, not session data — it never changes as a
// user works, so it deliberately lives outside session-data-defaults.js
// (which is deep-cloned into every session).
//
// Only the Local Housing Needs Assessment has full body text and an AI
// summary today; the others carry metadata only and fall back to showing the
// extracts already tagged from them.
//

const DOCUMENT_SOURCE = 'Local Housing Needs Assessment'
const DOCUMENT_CHAPTER = 'Chapter 3: Housing need'

// The full, uninterrupted document body. Users highlight any part of this
// directly. Summary quotes below must be exact substrings of a single
// paragraph here — see the note on `quote`.
const DOCUMENT_PARAGRAPHS = [
  'Local population growth has increased demand for homes in the borough over the last decade. Forecasts suggest that households will continue to form at a faster rate than previously expected, leading to pressure on both the private rented and affordable housing markets.',
  'The council has a strategic objective to provide enough homes for future residents, while also ensuring that new development is delivered in a way that supports transport capacity, local services and environmental protection.',
  'Projected household growth over the next 15 years will place significant pressure on existing housing supply.',
  'Existing housing supply is heavily constrained by the availability of brownfield land, infrastructure delivery constraints and limited capacity in some strategic growth areas. These issues are likely to shape the authority\'s future development trajectory and the level of intervention required through the local plan.',
  'In several parts of the borough, the evidence suggests that housing demand is concentrated in areas with stronger public transport links and better access to services. This means that future growth may need to be planned carefully to maintain the balance between housing provision and local amenity.'
]

// Tables of figures, placed in the document after the paragraph at index `afterParagraph`.
// Invented for the prototype, like the rest of this document; the figures add up. Table 3.1
// has two header rows and Table 3.2 two header columns, so a highlighted table shows both kinds
// of header being merged into one (see app/data/evidence-tables.js). Keep commas out of titles
// and headers: a reference separates its parts with commas.
const DOCUMENT_TABLES = [
  {
    id: 'lhna-table-3-1',
    title: 'Table 3.1: Projected households by area (2024 to 2039)',
    afterParagraph: 2,
    note: 'Source: household projections, Housing Research Consultants analysis.',
    headerRows: 2,
    headerCols: 1,
    rows: [
      [{ text: 'Area', rowspan: 2 }, { text: 'Households', colspan: 2 }, { text: 'Change (2024 to 2039)', colspan: 2 }],
      ['2024', '2039', 'Number', 'Per cent'],
      ['North', '18,400', '21,300', '2,900', '15.8%'],
      ['Central', '24,100', '28,900', '4,800', '19.9%'],
      ['South', '15,700', '17,200', '1,500', '9.6%'],
      ['Borough total', '58,200', '67,400', '9,200', '15.8%']
    ]
  },
  {
    id: 'lhna-table-3-2',
    title: 'Table 3.2: Annual need for affordable homes by tenure',
    afterParagraph: 4,
    note: 'Need per year over the plan period, rounded to the nearest 5 homes.',
    headerRows: 1,
    headerCols: 2,
    rows: [
      [{ text: 'Tenure', colspan: 2 }, 'Homes needed per year', 'Share of need'],
      [{ text: 'Affordable housing for rent', rowspan: 2 }, 'Social rent', '310', '48%'],
      ['Affordable rent', '150', '23%'],
      [{ text: 'Affordable home ownership', rowspan: 2 }, 'Shared ownership', '120', '19%'],
      ['First Homes', '65', '10%'],
      [{ text: 'Total', colspan: 2 }, '645', '100%']
    ]
  }
]

// A canned "AI" summary. Each section carries both the paraphrase shown to
// the user (`text`) and the verbatim `quote` it came from.
//
// `quote` is load-bearing: accepting a suggestion saves it as the evidence
// item's text, which is what the document view later searches for when
// drawing highlights. It must be an exact substring of a SINGLE paragraph
// above, and must not overlap another quote or a seeded passage — once one
// highlight wraps text in a <mark>, the text node splits and any overlapping
// quote can no longer be found. These failures are silent.
//
// Paragraph 3 and the first sentence of paragraph 5 are already taken by
// evidence-seed-1 and evidence-seed-4 in session-data-defaults.js.
const HOUSING_NEEDS_SUMMARY = {
  generatedLabel: 'Generated from the full document',
  caveat: 'AI generated — check each suggestion against the source before using it.',
  overview: 'The assessment finds that household formation is outpacing supply, that delivery is constrained by land availability and infrastructure, and that demand is concentrated around well-connected areas.',
  keyPoints: [
    'Demand for homes has risen over the last decade and is forecast to keep rising',
    'Supply is constrained by brownfield land availability and infrastructure capacity',
    'Demand is concentrated where public transport and services are strongest'
  ],
  sections: [
    {
      id: 'lhna-1',
      heading: 'Demand has risen over the last decade',
      text: 'Population growth has pushed up demand for homes, and households are forecast to form faster than previously expected.',
      quote: 'Local population growth has increased demand for homes in the borough over the last decade.',
      suggestedTags: ['Need'],
      suggestedPolicyAreas: ['Housing'],
      suggestedPolicyReference: 'H1',
      confidence: 'high'
    },
    {
      id: 'lhna-2',
      heading: 'Growth is balanced against infrastructure and environment',
      text: 'The council intends to meet future housing need while protecting transport capacity, local services and the environment.',
      quote: 'The council has a strategic objective to provide enough homes for future residents',
      suggestedTags: ['Need', 'Capacity'],
      suggestedPolicyAreas: ['Housing', 'Infrastructure'],
      suggestedPolicyReference: 'H2',
      confidence: 'medium'
    },
    {
      id: 'lhna-3',
      heading: 'Supply is constrained by land and infrastructure',
      text: 'Brownfield availability, infrastructure delivery and limited capacity in strategic growth areas all restrict how much can be built.',
      quote: 'Existing housing supply is heavily constrained by the availability of brownfield land, infrastructure delivery constraints and limited capacity in some strategic growth areas.',
      suggestedTags: ['Capacity', 'Site Allocations'],
      suggestedPolicyAreas: ['Housing'],
      suggestedPolicyReference: 'SA1',
      confidence: 'high'
    },
    {
      id: 'lhna-4',
      heading: 'Growth may need careful spatial planning',
      text: 'Future growth may need to be planned carefully to hold the balance between housing provision and local amenity.',
      quote: 'This means that future growth may need to be planned carefully to maintain the balance between housing provision and local amenity.',
      suggestedTags: ['Capacity'],
      suggestedPolicyAreas: ['Transport', 'Infrastructure'],
      suggestedPolicyReference: 'T1',
      confidence: 'low'
    }
  ]
}

const DOCUMENTS = {
  [DOCUMENT_SOURCE]: {
    source: DOCUMENT_SOURCE,
    chapter: DOCUMENT_CHAPTER,
    date: '12 March 2024',
    author: 'Housing Research Consultants',
    policyArea: 'Housing',
    paragraphs: DOCUMENT_PARAGRAPHS,
    tables: DOCUMENT_TABLES,
    summary: HOUSING_NEEDS_SUMMARY
  },
  'Heritage and Conservation Study': {
    source: 'Heritage and Conservation Study',
    chapter: '',
    date: '4 September 2023',
    author: 'Heritage and Design Consultants',
    policyArea: 'Heritage and Tall Buildings',
    paragraphs: [],
    tables: [],
    summary: null
  },
  'Green Belt Assessment': {
    source: 'Green Belt Assessment',
    chapter: '',
    date: '18 January 2024',
    author: 'Land and Environment Consultants',
    policyArea: 'Open Spaces and Green Infrastructure',
    paragraphs: [],
    tables: [],
    summary: null
  },
  'Stakeholder feedback': {
    source: 'Stakeholder feedback',
    chapter: '',
    date: '2 May 2024',
    author: 'Planning Policy Team',
    policyArea: 'Housing',
    paragraphs: [],
    tables: [],
    summary: null
  },
  'Scoping Consultation 2024': {
    source: 'Scoping Consultation 2024',
    chapter: '',
    date: '15 February 2024',
    author: 'Planning Policy Team',
    policyArea: 'Offices',
    paragraphs: [],
    tables: [],
    summary: null
  }
}

function getDocument (source) {
  return DOCUMENTS[source] || {
    source,
    chapter: '',
    date: 'Not recorded',
    author: 'Not recorded',
    policyArea: '',
    paragraphs: [],
    tables: [],
    summary: null
  }
}

module.exports = {
  DOCUMENT_SOURCE,
  DOCUMENT_CHAPTER,
  DOCUMENT_PARAGRAPHS,
  DOCUMENTS,
  getDocument
}
