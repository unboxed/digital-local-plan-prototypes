// Static content for the Examination library journey in Publish plan versions
// (/project-management/publish-plan-versions/examination-library). Built from the idea frames
// "Local Plan Examination Library" and "Inspector's report — illustrative reading page" in the
// git-ignored `Figma screenshots/Versioning/` folder.
//
// Everything here is illustrative: no report, finding or decision is represented as issued.
// Dates are aligned with the "Examination: proposed local plan" version in the version history
// (published 3 Oct 2025, 16:45), which the Submitted Local Plan entry links to.

const LIBRARY_PUBLISHED = '2025-10-03T16:45'
const OWNER = 'City of London planning team'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

// '2025-10-08T09:00' → { short: '8 Oct 2025, 09:00', long: '8 October 2025', stamp: '2025-10-08_0900' }
function formatDate (iso) {
  const [date, time] = iso.split('T')
  const [year, month, day] = date.split('-').map(Number)
  const longMonth = MONTHS[month - 1]
  return {
    short: day + ' ' + longMonth.slice(0, 3) + ' ' + year + ', ' + time,
    long: day + ' ' + longMonth + ' ' + year,
    stamp: date + '_' + time.replace(':', '')
  }
}

// A version published with the rest of the library, unchanged since.
function first (changes) {
  return [{ version: '1.0', published: LIBRARY_PUBLISHED, changes: changes || 'Published for examination.', by: OWNER }]
}

const SECTIONS = [
  {
    id: 'examination-documents',
    title: 'Examination documents',
    intro: 'Information pages and document registers for the examination. Select a title to read its content and version details.',
    items: [
      {
        ref: 'EX-01',
        title: 'Inspector’s report',
        kind: 'Live content',
        summary: 'Illustrative example; no report or findings have been issued.',
        report: true,
        versions: first('Opened. No report has been issued.')
      },
      {
        ref: 'EX-02',
        title: 'Modifications',
        kind: 'Live content',
        // Modifications are still being proposed during the examination, so this item's
        // current version is shown as In progress rather than Current.
        status: 'In progress',
        summary: 'Example register structure only; no modifications proposed.',
        content: { type: 'register', empty: 'No modifications have been proposed.' },
        versions: first('Register opened.')
      },
      {
        ref: 'EX-03',
        title: 'Post-hearing letters',
        kind: 'Document',
        summary: 'Example only; no correspondence is included.',
        content: { type: 'paragraphs', paragraphs: ['No post-hearing correspondence has been issued.'] },
        versions: first()
      },
      {
        ref: 'EX-04',
        title: 'Hearings timetable',
        kind: 'Live content',
        summary: 'Illustrative schedule of hearing sessions, with attendance information.',
        versions: [
          {
            version: '1.1',
            published: '2025-10-08T09:00',
            changes: 'Session times added and attendance information clarified. No examination conclusions.',
            by: OWNER,
            content: {
              type: 'sessions',
              intro: 'Illustrative schedule for the City of London Local Plan. These example sessions are not confirmed hearing dates.',
              sessions: [
                { date: '14 Oct 2025', time: '10:00–12:30', topic: 'Plan strategy', format: 'Example session' },
                { date: '15 Oct 2025', time: '10:00–12:30', topic: 'Homes and communities', format: 'Example session' },
                { date: '16 Oct 2025', time: '10:00–12:30', topic: 'Environment and design', format: 'Example session' }
              ],
              attendance: 'In a live library, this page would include joining instructions, venue details and any changes to session times. None are confirmed in this example.'
            }
          },
          {
            version: '1.0',
            published: LIBRARY_PUBLISHED,
            changes: 'Initial example timetable.',
            by: OWNER,
            content: {
              type: 'sessions',
              intro: 'Illustrative schedule for the City of London Local Plan. These example sessions are not confirmed hearing dates.',
              sessions: [
                { date: '14 Oct 2025', time: 'To be confirmed', topic: 'Plan strategy', format: 'Example session' },
                { date: '15 Oct 2025', time: 'To be confirmed', topic: 'Homes and communities', format: 'Example session' },
                { date: '16 Oct 2025', time: 'To be confirmed', topic: 'Environment and design', format: 'Example session' }
              ],
              attendance: 'Attendance information will be added before the hearings.'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'local-plan',
    title: 'Local Plan',
    intro: 'The submitted plan and accompanying material. Each title opens its record, including publication and version details.',
    items: [
      {
        ref: 'LP-01',
        title: 'Submitted Local Plan',
        kind: 'Document',
        summary: 'The plan as submitted for examination.',
        content: { type: 'planVersion', versionId: 'examination' },
        versions: first('Submitted for examination.')
      },
      {
        ref: 'LP-02',
        title: 'Policies map (GIS)',
        kind: 'GIS content',
        summary: 'Map access opens the GIS view; the PDF is a version-stamped map snapshot and layer summary.',
        pdfLabel: 'Download PDF summary',
        content: { type: 'layers', versionId: 'examination' },
        versions: first('Layers published with the submitted plan.')
      },
      {
        ref: 'LP-03',
        title: 'Sustainability appraisal',
        kind: 'Document',
        summary: 'How the plan’s policies and alternatives perform against social, economic and environmental objectives.',
        content: { type: 'paragraphs', paragraphs: ['The sustainability appraisal assesses each policy and reasonable alternative against the appraisal framework, and records how the findings shaped the submitted plan.'] },
        versions: first()
      },
      {
        ref: 'LP-04',
        title: 'Habitats Regulation Assessment',
        kind: 'Document',
        summary: 'Screening of the plan’s likely effects on protected habitat sites.',
        content: { type: 'paragraphs', paragraphs: ['The assessment screens the plan for likely significant effects on European sites, alone and in combination with other plans and projects.'] },
        versions: first()
      },
      {
        ref: 'LP-05',
        title: 'Consultation statement',
        kind: 'Document',
        summary: 'Who was consulted, how, and the main issues raised at each stage.',
        content: { type: 'paragraphs', paragraphs: ['The statement summarises each consultation on the plan, the main issues raised and how they have been taken into account.'] },
        links: [{ href: '/consultations/managing-responses/inspector', text: 'View the representations', note: 'Opens the consultation record, with each representation and the authority’s response.' }],
        versions: first()
      }
    ]
  },
  {
    id: 'evidence-base',
    title: 'Evidence base',
    intro: 'Search the policy and evidence database. Policy records link to the evidence that supports them.'
  },
  {
    id: 'compliance',
    title: 'Compliance and soundness',
    intro: 'Example supporting records only. Inclusion in this library does not indicate a compliance or soundness conclusion.',
    items: [
      {
        ref: 'CS-01',
        title: 'Statement of compliance',
        kind: 'Document',
        summary: 'The legal and procedural requirements met during plan preparation, and the evidence for each.',
        // The Statement of compliance prototype's completed statement, shown in the record page.
        content: { type: 'compliance', variant: 'completed' },
        versions: first()
      },
      {
        ref: 'CS-02',
        title: 'Gateway 3 completion statement',
        kind: 'Document',
        summary: 'Confirms the plan is ready to be examined.',
        content: { type: 'paragraphs', paragraphs: ['The statement sets out how the authority has completed the steps required before the plan is examined.'] },
        versions: first()
      },
      {
        ref: 'CS-03',
        title: 'Statements of common ground',
        kind: 'Live content',
        summary: 'Agreed positions with neighbouring authorities and statutory bodies.',
        versions: [
          {
            version: '1.1',
            published: '2025-10-06T14:00',
            changes: 'Statement of common ground with Historic England added.',
            by: OWNER,
            content: {
              type: 'register',
              entries: [
                { title: 'Transport for London', note: 'Signed 1 October 2025' },
                { title: 'Historic England', note: 'Signed 6 October 2025' }
              ]
            }
          },
          {
            version: '1.0',
            published: LIBRARY_PUBLISHED,
            changes: 'Register opened with the Transport for London statement.',
            by: OWNER,
            content: {
              type: 'register',
              entries: [{ title: 'Transport for London', note: 'Signed 1 October 2025' }]
            }
          }
        ]
      }
    ]
  },
  {
    id: 'plan-administration',
    title: 'Plan administration',
    intro: 'Administrative material and an indicative programme. All milestones below are illustrative, not confirmed events.',
    items: [
      {
        ref: 'PA-01',
        title: 'Timetable',
        kind: 'Live content',
        summary: 'The plan’s published timetable, from Make your plan.',
        content: { type: 'paragraphs', paragraphs: ['The timetable is created and published in Make your plan. This record is the version published with the examination library.'] },
        // Every timetable link in Make your plan goes to its placeholder while the flow is rebuilt.
        listLink: { href: '/project-management/make-your-plan/timetable-placeholder', text: 'View the plan timetable', note: 'Opens Create and publish timetable in Make your plan.' },
        links: [{ href: '/project-management/make-your-plan/timetable-placeholder', text: 'View the plan timetable', note: 'Opens Create and publish timetable in Make your plan.' }],
        versions: first()
      },
      {
        ref: 'PA-02',
        title: 'Covering letter',
        kind: 'Document',
        summary: 'The letter submitting the plan to the Planning Inspectorate.',
        content: { type: 'paragraphs', paragraphs: ['The letter submits the plan and its supporting documents for independent examination.'] },
        versions: first()
      },
      {
        ref: 'PA-03',
        title: 'Pre-examination checklist',
        kind: 'Document',
        summary: 'The documents and steps checked before submission.',
        content: { type: 'paragraphs', paragraphs: ['The checklist confirms that each submission document is in place.'] },
        versions: first()
      },
      {
        ref: 'PA-04',
        title: 'Environmental Impact Assessment',
        kind: 'Document',
        summary: 'Screening of whether the plan requires environmental impact assessment.',
        content: { type: 'paragraphs', paragraphs: ['The screening records why the plan does or does not require environmental impact assessment.'] },
        versions: first()
      }
    ]
  }
]

// The Inspector's report reading page (EX-01). An illustrative sample, not an issued report.
const REPORT = {
  title: 'Report on the Examination of the City of London City Plan 2040',
  frontMatter: [
    'Inspector: to be confirmed',
    'The Plan was submitted for examination on 3 October 2025',
    'The examination hearings were held between 14 and 16 October 2025',
    'File Ref: PINS/K5030/429/4'
  ],
  version: '1.0',
  published: 'To be confirmed',
  note: 'Initial reading-layout example. No report has been issued.',
  sections: [
    {
      id: 'purpose',
      heading: '1. Purpose and scope',
      paragraphs: [
        'This sample describes how examination material could be presented as a readable document in the City of London Local Plan Examination Library. It demonstrates the structure of a full-text page, rather than summarising or reproducing an actual Inspector’s report.',
        'The scope is limited to explaining the examination process, the role of evidence and how readers can follow the record. No policies have been assessed here. This example makes no recommendation about the plan and should not be relied upon for planning decisions.'
      ]
    },
    {
      id: 'process',
      heading: '2. Examination process',
      paragraphs: [
        'An examination provides a framework for considering a submitted plan and the material supporting it. Written representations, questions and hearing discussions can help identify matters requiring clarification. This description is general guidance on the reading layout, not a record of events that have taken place.',
        'In a live examination library, procedural correspondence and hearing information would be recorded separately so that readers could trace each stage. Dates, participants and instructions would need to be checked against the relevant published record. No hearings or procedural steps are confirmed by this sample.'
      ]
    },
    {
      id: 'evidence',
      heading: '3. Evidence and references',
      paragraphs: [
        'Supporting evidence can include technical studies, policy material, consultation records and maps. A document reference helps readers identify the material being discussed. Its version and publication details help distinguish the text viewed from any other edition of the same material.',
        'In a live report, references would point to the particular documents considered and explain their relevance to the topic. This example does not cite or evaluate any evidence. The illustrative reference EX-01 identifies this demonstration only; it is not evidence that a report has been issued.'
      ]
    },
    {
      id: 'reading',
      heading: '4. Reading the record',
      paragraphs: [
        'Use the contents navigation to locate a section and use its paragraph number when referring to the text. Version details are displayed alongside the document so that a reader can record exactly which example they are viewing. The full sample is shown on this page from beginning to end.',
        'The PDF option represents a snapshot of this displayed example. Its stamp repeats the reference, version and example publication timestamp. A saved copy remains a snapshot; it does not change when a different version is viewed and is not a substitute for checking a live examination record.'
      ]
    },
    {
      id: 'next-steps',
      heading: '5. Next steps',
      paragraphs: [
        'Return to the examination library to browse other example records and their version details. In a live service, readers would use the published procedural information to understand any next steps. This sample sets no deadlines, requests no action and confirms no future examination events.',
        'This completes the illustrative text. An actual Inspector’s report, if issued, would be a separately verified examination document with its own authorship and publication information. Nothing in this reading example indicates that the City of London Local Plan has been approved or found sound.'
      ]
    }
  ]
}

function allItems () {
  return SECTIONS.flatMap(section => (section.items || []).map(item => Object.assign({ section }, item)))
}

function getItem (ref) {
  return allItems().find(item => item.ref.toLowerCase() === String(ref).toLowerCase()) || null
}

function currentVersion (item) {
  return item.versions[0]
}

function slug (text) {
  return text.toLowerCase().replace(/’/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function pdfFilename (item, version) {
  return item.ref + '_' + slug(item.title) + '_v' + version.version + '_' + formatDate(version.published).stamp + '.pdf'
}

function citation (item, version) {
  return item.ref + ' ' + item.title + ', version ' + version.version + ', published ' + formatDate(version.published).long
}

// Items whose current version was published after the library was first published.
function changesSince () {
  return allItems()
    .filter(item => currentVersion(item).published > LIBRARY_PUBLISHED)
    .map(item => ({ item, from: item.versions[1], to: currentVersion(item) }))
    .sort((a, b) => b.to.published.localeCompare(a.to.published))
}

function lastUpdated () {
  return allItems().map(item => currentVersion(item).published).sort().pop()
}

module.exports = {
  LIBRARY_PUBLISHED,
  OWNER,
  SECTIONS,
  REPORT,
  formatDate,
  allItems,
  getItem,
  currentVersion,
  pdfFilename,
  citation,
  changesSince,
  lastUpdated
}
