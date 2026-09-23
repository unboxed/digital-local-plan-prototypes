//
// Illustrative progress status for the Gateway 2 progress check prototype.
//
// Neither the chapters (policies.js's policy areas) nor the evidence base (documents.js) carry
// a status of their own, so this file adds one on top of each, the same way plan-paragraphs.js
// adds paragraph content on top of policies.js for the Examination - inspector view prototype.
// ALL STATUS VALUES HERE ARE INVENTED ILLUSTRATIVE CONTENT.
//

// Keyed by the same policy area strings as routes.js's POLICY_AREAS. One of:
// 'Not started' | 'Brief prepared' | 'In progress' | 'Drafted' | 'Complete'
const CHAPTER_PROGRESS = {
  'Health, inclusion and safety': 'Complete',
  Housing: 'Drafted',
  Infrastructure: 'In progress',
  Design: 'In progress',
  Offices: 'Drafted',
  Retail: 'Brief prepared',
  'Culture and visitors': 'Brief prepared',
  'Heritage and Tall Buildings': 'Not started',
  'Open Spaces and Green Infrastructure': 'Not started',
  'Climate Resilience': 'In progress',
  Transport: 'Drafted'
}

// Keyed by the same document names as documents.js's DOCUMENTS. One of:
// 'Not yet procured' | 'In procurement' | 'Draft received' | 'Accepted version'
const EVIDENCE_PROGRESS = {
  'Local Housing Needs Assessment': 'Accepted version',
  'Heritage and Conservation Study': 'Draft received',
  'Green Belt Assessment': 'In procurement',
  'Stakeholder feedback': 'Accepted version',
  'Scoping Consultation 2024': 'Draft received'
}

function getChapterStatus (area) {
  return CHAPTER_PROGRESS[area] || 'Not started'
}

function getEvidenceStatus (source) {
  return EVIDENCE_PROGRESS[source] || 'Not yet procured'
}

module.exports = {
  CHAPTER_PROGRESS,
  EVIDENCE_PROGRESS,
  getChapterStatus,
  getEvidenceStatus
}
