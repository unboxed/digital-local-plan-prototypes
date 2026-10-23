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

// '2025-10-08T09:00' → { short: '8 Oct 2025', long: '8 October 2025',
//   longTime: '8 October 2025', time: '09:00', stamp: '2025-10-08' }
// Published items show their date only (times were removed by request).
function formatDate (iso) {
  const [date, time] = iso.split('T')
  const [year, month, day] = date.split('-').map(Number)
  const longMonth = MONTHS[month - 1]
  return {
    // Dates only on screen, by request: the time stays in the data, where it orders versions
    // published on the same day, but isn't shown.
    short: day + ' ' + longMonth.slice(0, 3) + ' ' + year,
    long: day + ' ' + longMonth + ' ' + year,
    longTime: day + ' ' + longMonth + ' ' + year,
    time,
    stamp: date
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
        kind: 'Document',
        summary: 'The Inspectors’ report on the examination of the City Plan 2040, as submitted to the City of London Corporation.',
        report: true,
        // Published on the report's date, after the hearings (EX-04) and six weeks' consultation
        // on the main modifications.
        versions: [{
          version: '1.0',
          published: '2025-12-12T10:00',
          changes: 'Report published as submitted to the City of London Corporation.',
          by: 'Sarah Mitchell and Tom Asante, Inspectors'
        }]
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

// The Inspectors' report (EX-01), as submitted to the City of London Corporation. Its structure,
// paragraph numbering and substance are modelled on the Planning Inspectorate's published report
// on the City Plan 2040 (REPORT.sourceUrl), summarised rather than quoted, with only some sections
// reproduced. The Inspectors' names, the dates, the file reference and the document references are
// invented, and fitted to this prototype's timeline: submitted 3 October 2025 with the rest of the
// library, hearings 14 to 16 October 2025 (EX-04), and the report after six weeks' consultation on
// the main modifications. By request the page reads as the submitted document, with no prototype
// note; sourceUrl is kept here only as a record of what it was modelled on.
const REPORT = {
  title: 'Report to the City of London Corporation from the Planning Inspectorate',
  sourceUrl: 'https://www.cityoflondon.gov.uk/assets/Services-Environment/City-of-London-Report-Final-Oct-2026.pdf',
  authors: [
    'Sarah Mitchell BA(Hons) MA MRTPI',
    'Tom Asante BSc(Hons) MPlan MRTPI'
  ],
  authorsShort: 'Sarah Mitchell and Tom Asante',
  appointment: 'Inspectors appointed by the Secretary of State',
  date: '12 December 2025',
  legislation: 'Planning and Compulsory Purchase Act 2004 (as amended), Section 20',
  subtitle: 'Report on the Examination of the City of London City Plan 2040',
  submitted: '3 October 2025',
  hearings: '14 and 16 October 2025',
  fileRef: 'PINS/K5030/LP/0425',
  sections: [
    {
      id: 'summary',
      heading: 'Non-Technical Summary',
      blocks: [
        { text: 'This report concludes that the City Plan 2040 provides an appropriate basis for planning the City of London, provided that a number of main modifications [MMs] are made to it. The City of London Corporation asked us to recommend any MMs needed for the Plan to be adopted.' },
        { text: 'Following the hearings, the Corporation prepared schedules of proposed modifications and, where necessary, carried out sustainability appraisal and habitats regulations assessment of them. The MMs were consulted on for six weeks. In some cases we have amended their detailed wording or added consequential modifications.' },
        { text: 'In summary, the Main Modifications:' },
        { list: [
          'expand and refine the tall buildings strategy',
          'strengthen and clarify heritage protection, including settings and views',
          'set clearer office floorspace requirements and give stronger protection to office stock',
          'strengthen housing delivery and monitoring, and alignment with the London Plan',
          'make a number of other changes so the Plan is positively prepared, justified, effective and consistent with national policy'
        ] }
      ]
    },
    {
      id: 'introduction',
      heading: 'Introduction',
      blocks: [
        { number: '1', text: 'This report assesses the City of London City Plan 2040 under Section 20(5) of the Planning and Compulsory Purchase Act 2004, as applied by the transitional arrangements for plans examined under the previous system. It considers whether the Plan meets the relevant legal requirements, including the Town and Country Planning (Local Planning) (England) Regulations 2012, and whether it is sound.' },
        { number: '2', text: 'Under the transitional arrangements in Annex 1 of the National Planning Policy Framework (NPPF) 2024, we have examined the Plan against the NPPF of December 2023. Paragraph 35 of that document advises that, to be sound, a Local Plan should be positively prepared, justified, effective and consistent with national policy.' },
        { number: '3', text: 'The starting point is the assumption that the Corporation has submitted what it considers a sound plan. The City Plan 2040, submitted on 3 October 2025 [LP-01], is the basis for our examination. It is the same document as was published for consultation on 20 September 2025.' },
        { subheading: 'Procedural matter' },
        { number: '4', text: 'The final hearing session, on 16 October 2025, considered Historic England’s alternative proposal for the City Cluster tall buildings contours against those in Figure 15 of the Plan, and which strikes the better balance between protecting the Tower of London World Heritage Site and not unduly restricting economic growth. Our conclusions on it are set out in this report.' },
        { subheading: 'Main modifications' },
        { number: '5', text: 'In accordance with section 20(7C) of the 2004 Act, the Corporation asked us to recommend any MMs necessary to make the Plan sound and capable of adoption. The MMs are referenced in bold in the form MM1, MM2 and so on, and are set out in full in the Appendix.' },
        { number: '6', text: 'The schedule of proposed MMs was consulted on for six weeks. We have taken account of the responses and amended the detailed wording of some modifications. None of the amendments significantly alters the modifications as published for consultation.' },
        { subheading: 'Policies map' },
        { number: '7', text: 'The submission policies map comprises the plans identified as Policies Map City Plan 2040 [LP-02]. The policies map is not a development plan document, so we cannot recommend main modifications to it.' },
        { number: '10', text: 'When the Plan is adopted, the Corporation will need to update the adopted policies map to include all the changes in LP-02 and the further changes published alongside the MMs [Appendix 4 Atlas of Change: City Plan 2040].' }
      ]
    },
    {
      id: 'context',
      heading: 'Context of the Plan',
      blocks: [
        { number: '11', text: 'The City’s unique historic and economic significance is the essential context for the Plan. The Square Mile reflects nearly two thousand years of development, and has more than 600 listed buildings, extensive conservation areas and a rich network of streets, spaces and alleyways.' },
        { number: '12', text: 'As a globally important business centre, the City accommodates around 676,000 workers. The Plan sets a minimum target of 1.2 million sqm of net additional office floorspace by 2040, so this ambition for growth must be carefully balanced with protecting heritage assets and delivering design excellence.' },
        { number: '14', text: 'On adoption, the City Plan 2040 will replace the Local Plan 2015. Together with the London Plan, it will form the full development plan for the City of London.' }
      ]
    },
    {
      id: 'legal-compliance',
      heading: 'Public Sector Equality Duty and legal compliance',
      blocks: [
        { number: '15', text: 'The Corporation carried out an Equality Impact Assessment of the Plan’s policies. In reaching our conclusions we have had due regard to the aims in section 149(1) of the Equality Act 2010.' },
        { number: '17', text: 'The Plan has been prepared in accordance with the Corporation’s Local Development Scheme, and consultation on the Plan and the MMs complied with its Statement of Community Involvement [LP-05].' },
        { number: '19', text: 'A Sustainability Appraisal [LP-03] was published with the Plan in September 2025 and updated to assess the main modifications.' },
        { number: '22', text: 'The Habitats Regulations Assessment [LP-04] identified likely significant effects on several European sites, and the Appropriate Assessment concluded that mitigation in other Plan policies is sufficient to avoid adverse effects on their integrity. We consider the assessment robust and proportionate. Natural England raised no objections.' },
        { number: '25', text: 'The Plan is in general conformity with the London Plan 2021, and complies with all other relevant legal requirements, including the 2004 Act and the 2012 Regulations.' }
      ]
    },
    {
      id: 'spatial-strategy',
      heading: 'Issue 1 – Spatial Strategy',
      blocks: [
        { number: '27', text: 'Taking account of the representations, the written evidence and the hearing discussions, we have identified two main issues on which the soundness of the Plan depends: the spatial strategy, and the policies.' },
        { number: '29', text: 'The Plan sets out a coordinated approach to managing growth across the Square Mile, with the greatest development focused in the Key Areas of Change. With few vacant sites and no hinterland to expand into, the strategy must identify the most suitable locations for new buildings at height. Tall buildings will be concentrated in the City Cluster and other identified tall building areas, with important views and heritage assets protected.' },
        { number: '30', text: 'The Plan provides for at least 1.2 million sqm NIA of new office space, mostly in the City Cluster, Fleet Street and Ludgate, and around Liverpool Street, while new homes will mainly be provided in and around existing residential areas.' },
        { number: '32', text: 'To show the Plan has been positively prepared, MM2 adds the new Broadgate Tall Building Site to the Key Diagram and MM3 adds it to the Spatial Strategy.' },
        { number: '40', text: 'Subject to the MMs, the Spatial Strategy is justified by proportionate and robust evidence, consistent with national policy and in general conformity with the London Plan, and is expected to be effective in delivering the Plan’s objectives.' }
      ]
    },
    {
      id: 'housing',
      heading: 'Issue 2 – Policies: Housing (Strategic Policy S3 and Policies HS1 to HS8)',
      omitted: 'Paragraphs 41 to 56, on Health, Inclusion and Safety, are not reproduced here.',
      blocks: [
        { number: '57', text: 'The Housing chapter sets the City’s housing requirement of 1,706 net additional dwellings for the plan period. While housing is important to a mixed and sustainable City, it is necessarily secondary to the City’s principal role as a national and international business centre.' },
        { number: '58', text: 'With highly constrained land and competing commercial demands, there is limited scope for site allocations, so new housing is expected to come forward largely through windfall development.' },
        { number: '62', text: 'Strategic Policy S3 carries the requirement beyond the London Plan’s ten-year period using the standard method: 146 dwellings per annum from 2025/26 to 2028/29, then 102 per annum from 2029/30 to 2039/40, giving 1,706 net additional dwellings.' },
        { number: '63', text: 'To support effective monitoring, MM10 and MM11 add supporting text and housing delivery and trajectory tables. MM12 confirms that the minimum of 102 dwellings per annum remains appropriate, and commits the Corporation to working with the Mayor of London to identify further capacity.' },
        { number: '64', text: 'MM8 strengthens the incentives for affordable housing in Policy S3 and confirms the Mayor’s threshold approach, including a minimum of 35% affordable housing, ensuring general conformity with the London Plan.' },
        { number: '66', text: 'Policy HS1 directs new housing to suitable sites in or near residential areas, supports mixed-use development and safeguards the City’s primary business function.' },
        { number: '71', text: 'For effectiveness, MM16 clarifies in Policy HS6 that purpose-built student accommodation should be secured through a nominations agreement with a further or higher education institution in the City or the Central Activities Zone.' },
        { number: '74', text: 'Subject to the MMs, the Housing policies are based on robust evidence, are in general conformity with the London Plan and are positively prepared in a way that is aspirational but deliverable. They are likely to be effective in delivering 1,706 net additional dwellings within the plan period.' }
      ]
    },
    {
      id: 'implementation',
      heading: 'Implementation and Monitoring',
      omitted: 'Paragraphs 75 to 201, on the Plan’s other chapters, are not reproduced here.',
      blocks: [
        { number: '202', text: 'The Implementation chapter sets out how the impacts of development will be managed, through the Community Infrastructure Levy and through planning conditions and Section 106 obligations.' },
        { number: '203', text: 'To ensure Strategic Policy S26 is effective, MM67 requires affordable housing and essential public transport improvements to be prioritised when seeking planning obligations, in line with London Plan Policy DF1.' },
        { number: '205', text: 'The monitoring framework commits the Corporation to at least annual monitoring, with partial or full reviews triggered where evidence, changing circumstances or national reforms indicate this is needed.' }
      ]
    },
    {
      id: 'conclusion',
      heading: 'Overall Conclusion and Recommendation',
      blocks: [
        { number: '206', text: 'The Plan has several deficiencies in respect of soundness, for the reasons set out above, which mean that we recommend non-adoption of it as submitted, in accordance with Section 20(7A) of the 2004 Act.' },
        { number: '207', text: 'The Corporation has requested that we recommend MMs to make the Plan sound and capable of adoption. We conclude that, with the recommended main modifications set out in the Appendix, the City of London City Plan 2040 satisfies the requirements of Section 20(5)(a) of the 2004 Act and is sound.' }
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
  const date = formatDate(version.published)
  return item.ref + ' ' + item.title + ', version ' + version.version + ', published ' + date.long
}

// Items whose current version was published after the library was first published: an update
// has `from`, a newly published item (the Inspector's report) has none.
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
