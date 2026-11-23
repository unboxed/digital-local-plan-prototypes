//
// For guidance on how to create filters see:
// https://prototype-kit.service.gov.uk/docs/filters
//

const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter

// Add your filters here


// Links mentions of legislation in plain text to legislation.gov.uk: escapes the text, then
// wraps each "section 15C(3)" or "section 15CA(6)" (and the like) in a link to the section. Used
// by the Statement of compliance, whose requirement descriptions, tables and audit log cite the
// 2004 Act. Add to LEGISLATION_LINKS to link more references; each pattern must match only text
// it should link (15C's needs the bracket straight after "15C", so it never matches 15CA).
const LEGISLATION_LINKS = [
  { pattern: /section 15C\(\d+\)(\([a-z]\))?/g, href: 'https://www.legislation.gov.uk/ukpga/2004/5/section/15C' },
  { pattern: /section 15CA\(\d+\)(\([a-z]\))?/g, href: 'https://www.legislation.gov.uk/ukpga/2004/5/section/15CA' }
]

function escapeHtml (text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

addFilter('legislationLinks', text => {
  let html = escapeHtml(text == null ? '' : text)
  LEGISLATION_LINKS.forEach(link => {
    html = html.replace(link.pattern, match =>
      '<a class="govuk-link" href="' + link.href + '" target="_blank" rel="noopener noreferrer">' + match +
      '<span class="govuk-visually-hidden"> (opens in a new tab)</span></a>')
  })
  return html
}, { renderAsHtml: true })
