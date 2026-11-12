//
// Statement of general conformity with the spatial development strategy (SDS), for the Statement
// of compliance prototype (/plan/view/statement-of-compliance/spatial-development-strategy). It is the
// evidence for Regulation 28: the local plan must be in general conformity with the operative SDS
// for its area.
//
// The example SDS is the London Plan 2021, which really is the operative SDS for the City of
// London, whose City Plan 2040 is the local plan throughout this project. Its chapters, policy
// references and titles are the published ones, which is why the list below is complete rather
// than a selection.
//
// EVERYTHING ELSE IS INVENTED PROTOTYPE CONTENT: which City Plan policies each London Plan policy
// is linked to, the authority comments, and the evidence extracts (including the titles and
// paragraph numbers of the documents they come from). Don't quote any of it as the City
// Corporation's own assessment.
//

const SDS = {
  name: 'The London Plan 2021',
  shortName: 'London Plan',
  author: 'Mayor of London',
  published: 'March 2021',
  url: 'https://www.london.gov.uk/programmes-strategies/planning/london-plan/london-plan-2021'
}

const CHAPTERS = [
  {
    number: 1,
    title: 'Planning London\'s Future (Good Growth Policies)',
    policies: [
      ['GG1', 'Building strong and inclusive communities'],
      ['GG2', 'Making the best use of land'],
      ['GG3', 'Creating a healthy city'],
      ['GG4', 'Delivering the homes Londoners need'],
      ['GG5', 'Growing a good economy'],
      ['GG6', 'Increasing efficiency and resilience']
    ]
  },
  {
    number: 2,
    title: 'Spatial Development Patterns',
    policies: [
      ['SD1', 'Opportunity Areas'],
      ['SD2', 'Collaboration in the Wider South East'],
      ['SD3', 'Growth locations in the Wider South East and beyond'],
      ['SD4', 'The Central Activities Zone (CAZ)'],
      ['SD5', 'Offices, other strategic functions and residential development in the CAZ'],
      ['SD6', 'Town centres and high streets'],
      ['SD7', 'Town centres: development principles and Development Plan Documents'],
      ['SD8', 'Town centre network'],
      ['SD9', 'Town centres: Local partnerships and implementation'],
      ['SD10', 'Strategic and local regeneration']
    ]
  },
  {
    number: 3,
    title: 'Design',
    policies: [
      ['D1', 'London\'s form, character and capacity for growth'],
      ['D2', 'Infrastructure requirements for sustainable densities'],
      ['D3', 'Optimising site capacity through the design-led approach'],
      ['D4', 'Delivering good design'],
      ['D5', 'Inclusive design'],
      ['D6', 'Housing quality and standards'],
      ['D7', 'Accessible housing'],
      ['D8', 'Public realm'],
      ['D9', 'Tall buildings'],
      ['D10', 'Basement development'],
      ['D11', 'Safety, security and resilience to emergency'],
      ['D12', 'Fire safety'],
      ['D13', 'Agent of Change'],
      ['D14', 'Noise']
    ]
  },
  {
    number: 4,
    title: 'Housing',
    policies: [
      ['H1', 'Increasing housing supply'],
      ['H2', 'Small sites'],
      ['H3', 'Meanwhile use as housing'],
      ['H4', 'Delivering affordable housing'],
      ['H5', 'Threshold approach to applications'],
      ['H6', 'Affordable housing tenure'],
      ['H7', 'Monitoring of affordable housing'],
      ['H8', 'Loss of existing housing and estate redevelopment'],
      ['H9', 'Ensuring the best use of stock'],
      ['H10', 'Housing size mix'],
      ['H11', 'Build to Rent'],
      ['H12', 'Supported and specialised accommodation'],
      ['H13', 'Specialist older persons housing'],
      ['H14', 'Gypsy and Traveller accommodation'],
      ['H15', 'Purpose-built student accommodation'],
      ['H16', 'Large-scale purpose-built shared living']
    ]
  },
  {
    number: 5,
    title: 'Social Infrastructure',
    policies: [
      ['S1', 'Developing London\'s social infrastructure'],
      ['S2', 'Health and social care facilities'],
      ['S3', 'Education and childcare facilities'],
      ['S4', 'Play and informal recreation'],
      ['S5', 'Sports and recreation facilities'],
      ['S6', 'Public toilets'],
      ['S7', 'Burial space']
    ]
  },
  {
    number: 6,
    title: 'Economy',
    policies: [
      ['E1', 'Offices'],
      ['E2', 'Providing suitable business space'],
      ['E3', 'Affordable workspace'],
      ['E4', 'Land for industry, logistics and services to support London\'s economic function'],
      ['E5', 'Strategic Industrial Locations (SIL)'],
      ['E6', 'Locally Significant Industrial Sites'],
      ['E7', 'Industrial intensification, co-location and substitution'],
      ['E8', 'Sector growth opportunities and clusters'],
      ['E9', 'Retail, markets and hot food takeaways'],
      ['E10', 'Visitor infrastructure'],
      ['E11', 'Skills and opportunities for all']
    ]
  },
  {
    number: 7,
    title: 'Heritage and Culture',
    policies: [
      ['HC1', 'Heritage conservation and growth'],
      ['HC2', 'World Heritage Sites'],
      ['HC3', 'Strategic and Local Views'],
      ['HC4', 'London View Management Framework'],
      ['HC5', 'Supporting London\'s culture and creative industries'],
      ['HC6', 'Supporting the night-time economy'],
      ['HC7', 'Protecting public houses']
    ]
  },
  {
    number: 8,
    title: 'Green Infrastructure and Natural Environment',
    policies: [
      ['G1', 'Green infrastructure'],
      ['G2', 'London\'s Green Belt'],
      ['G3', 'Metropolitan Open Land'],
      ['G4', 'Open space'],
      ['G5', 'Urban greening'],
      ['G6', 'Biodiversity and access to nature'],
      ['G7', 'Trees and woodlands'],
      ['G8', 'Food growing'],
      ['G9', 'Geodiversity']
    ]
  },
  {
    number: 9,
    title: 'Sustainable Infrastructure',
    policies: [
      ['SI1', 'Improving air quality'],
      ['SI2', 'Minimising greenhouse gas emissions'],
      ['SI3', 'Energy infrastructure'],
      ['SI4', 'Managing heat risk'],
      ['SI5', 'Water infrastructure'],
      ['SI6', 'Digital connectivity infrastructure'],
      ['SI7', 'Reducing waste and supporting the circular economy'],
      ['SI8', 'Waste capacity and net waste self-sufficiency'],
      ['SI9', 'Safeguarded waste sites'],
      ['SI10', 'Aggregates'],
      ['SI11', 'Hydraulic fracturing (Fracking)'],
      ['SI12', 'Flood risk management'],
      ['SI13', 'Sustainable drainage'],
      ['SI14', 'Waterways – strategic role'],
      ['SI15', 'Water transport'],
      ['SI16', 'Waterways – use and enjoyment'],
      ['SI17', 'Protecting and enhancing London\'s waterways']
    ]
  },
  {
    number: 10,
    title: 'Transport',
    policies: [
      ['T1', 'Strategic approach to transport'],
      ['T2', 'Healthy Streets'],
      ['T3', 'Transport capacity, connectivity and safeguarding'],
      ['T4', 'Assessing and mitigating transport impacts'],
      ['T5', 'Cycling'],
      ['T6', 'Car parking'],
      ['T6.1', 'Residential parking'],
      ['T6.2', 'Office parking'],
      ['T6.3', 'Retail parking'],
      ['T6.4', 'Hotel and leisure uses parking'],
      ['T6.5', 'Non-residential disabled persons parking'],
      ['T7', 'Deliveries, servicing and construction'],
      ['T8', 'Aviation'],
      ['T9', 'Funding transport infrastructure through planning']
    ]
  },
  {
    number: 11,
    title: 'Funding the London Plan',
    policies: [
      ['DF1', 'Delivery of the Plan and Planning Obligations']
    ]
  },
  {
    number: 12,
    title: 'Monitoring',
    policies: [
      ['M1', 'Monitoring']
    ]
  }
].map(chapter => ({
  number: chapter.number,
  title: chapter.title,
  policies: chapter.policies.map(([ref, title]) => ({ ref, title, chapter: chapter.number }))
}))

const SDS_POLICIES = CHAPTERS.flatMap(chapter => chapter.policies)

// Evidence an authority comment can point to, mostly to show why a London Plan policy needs no
// policy of its own in the local plan. Invented, as the header says.
const EVIDENCE = [
  {
    id: 'gla-statement-of-common-ground',
    title: 'Statement of common ground with the Greater London Authority',
    ref: 'Paragraph 3.1',
    text: 'The Greater London Authority and the City Corporation agree that collaboration with authorities in the Wider South East, and growth locations beyond London, are strategic matters for the Mayor. They are addressed through the London Plan itself and need no policy in the City Plan.'
  },
  {
    id: 'housing-topic-paper-meanwhile',
    title: 'Housing Topic Paper',
    ref: 'Paragraph 5.6',
    text: 'Meanwhile housing is not expected to make a meaningful contribution in the City. Vacant sites are few and short-lived, and most meanwhile opportunities are in office buildings between lettings, where Policy OF3 already supports temporary uses that keep the office stock available.'
  },
  {
    id: 'shma-gypsy-traveller',
    title: 'Strategic Housing Market Assessment',
    ref: 'Paragraph 8.4',
    text: 'The assessment found no existing Gypsy and Traveller sites in the City, and no current or projected need for pitches or plots over the plan period. Need arising from households with links to the City would be met through the sub-regional assessment led by neighbouring boroughs.'
  },
  {
    id: 'idp-burial',
    title: 'Infrastructure Delivery Plan 2024',
    ref: 'Paragraph 7.2',
    text: 'There are no burial grounds in active use in the City. Burial need is met at the City of London Cemetery and Crematorium, which the City Corporation owns and runs outside the Square Mile, and which has capacity beyond the plan period.'
  },
  {
    id: 'elr-industrial-land',
    title: 'Employment Land Review',
    ref: 'Paragraph 5.4',
    text: 'The City contains no Strategic Industrial Locations or Locally Significant Industrial Sites, and almost no industrial floorspace. No industrial land in the City is identified for protection, intensification or substitution, and last-mile logistics needs are addressed through the freight and servicing evidence.'
  },
  {
    id: 'green-belt-assessment',
    title: 'Green Belt Assessment',
    ref: 'Paragraph 2.1',
    text: 'There is no Green Belt within the City of London, and none adjoins its boundary. No release or alteration of Green Belt is proposed or needed to meet the City\'s development requirements.'
  },
  {
    id: 'open-space-mol',
    title: 'Open Space Assessment',
    ref: 'Paragraph 3.2',
    text: 'No open space in the City is designated as Metropolitan Open Land. The City\'s open spaces are small gardens, churchyards and plazas, which are protected and enhanced through Policy OS1.'
  },
  {
    id: 'biodiversity-geodiversity',
    title: 'Biodiversity and Urban Greening Study',
    ref: 'Paragraph 6.5',
    text: 'No Sites of Geological Importance or Regionally Important Geological Sites are identified within the City, so there are no geodiversity features for development to protect or enhance.'
  },
  {
    id: 'waste-study-minerals',
    title: 'Circular Economy and Waste Study',
    ref: 'Paragraph 6.2',
    text: 'The City has no workable mineral resources, aggregate wharves or railheads, and lies outside any area licensed for onshore oil and gas. Policies on aggregates supply and hydraulic fracturing therefore have no application to development in the City.'
  }
]

function getEvidence (id) {
  return EVIDENCE.find(item => item.id === id) || null
}

function getSdsPolicy (ref) {
  return SDS_POLICIES.find(policy => policy.ref === ref) || null
}

function getChapter (number) {
  return CHAPTERS.find(chapter => chapter.number === Number(number)) || null
}

// The statement as the authority has it part-way through: most policies linked and commented,
// the policies with no place in the City justified with evidence, and some still to do, so every
// status shows. Each entry is { links: [City Plan refs], comment, evidence: [evidence ids] };
// a policy with no entry hasn't been started.
const SEED = {
  GG1: [['S1', 'HL1', 'HL5'], 'Policy S1 sets the City\'s approach to a healthy and inclusive City, supported by inclusive design (HL1) and the protection of social and community facilities (HL5).'],
  GG2: [['S4', 'S8', 'S12'], 'The plan makes the best use of land by intensifying office development (S4), through the design-led approach (S8) and by directing tall buildings to the City Cluster and Fleet Valley (S12).'],
  GG3: [['S1', 'HL2', 'HL9', 'S10'], 'Health is embedded across the plan, with Health Impact Assessments required for major development (HL9), air quality standards (HL2) and Healthy Streets (S10).'],
  GG4: [['S3', 'HS1'], 'Policy S3 sets the City\'s housing target and affordable housing requirements, and HS1 directs new homes to the identified residential areas.'],
  GG5: [['S4', 'OF1', 'S5'], 'The plan supports the City\'s role as a global business centre through office growth (S4, OF1) and a diverse retail and leisure offer (S5).'],
  GG6: [['S15', 'DE1', 'S16'], 'Resilience and efficiency are addressed through climate resilience (S15), sustainable design and whole life-cycle carbon (DE1) and the circular economy (S16).'],
  SD2: [[], 'Collaboration in the Wider South East is a strategic matter for the Mayor and is not addressed in the City Plan. The Greater London Authority agrees.', ['gla-statement-of-common-ground']],
  SD3: [[], 'Growth locations beyond London are identified and progressed by the Mayor with authorities in the Wider South East. No City Plan policy is needed.', ['gla-statement-of-common-ground']],
  SD4: [['S4', 'OF1', 'S6'], 'The whole of the City lies within the CAZ. The plan protects and grows its strategic functions: offices (S4, OF1) and culture and visitors (S6).'],
  SD5: [['S4', 'OF2', 'HS1'], 'Offices are given priority across the City. Residential development is directed to the identified residential areas (HS1) so it doesn\'t compromise office provision (OF2).'],
  SD6: [['S5', 'RE1'], 'The City\'s Principal Shopping Centres are identified and protected in Policy RE1, within the wider retail strategy of S5.'],
  SD7: [['S5', 'RE1', 'RE2'], 'Town centre uses are directed to the Principal Shopping Centres (RE1), and active frontages are required along the main retail streets (RE2).'],
  SD8: [['RE1'], 'The Principal Shopping Centres in RE1 correspond to the CAZ retail clusters shown in the London Plan\'s town centre network.'],
  SD9: [[], 'Town centre partnerships are run by the City\'s Business Improvement Districts rather than through planning policy. Evidence to be added.'],
  D1: [['S8', 'DE2'], 'Policy S8 and DE2 require development to respond to the City\'s form and character, informed by the characterisation in the Conservation Area Character Appraisals.'],
  D2: [['S7', 'IN2'], 'Infrastructure capacity must be demonstrated for major development (IN2), in line with the Infrastructure Delivery Plan (S7).'],
  D3: [['S8', 'DE2'], 'Site capacity is optimised through the design-led approach set out in S8 and DE2, with design review for major schemes.'],
  D4: [['DE2'], 'Policy DE2 requires the highest standards of design, tested through the City\'s Design Review Panel.'],
  D5: [['HL1'], 'Policy HL1 requires inclusive design to the highest standards, beyond the national minimum.'],
  D6: [['HS3', 'HS4'], 'Housing quality, internal space standards and amenity are set out in HS3 and HS4, which apply the London Plan standards.'],
  D7: [['HS4'], 'Policy HS4 requires accessible and adaptable homes, and wheelchair user dwellings, in line with D7.'],
  D8: [['DE3', 'AT1'], 'Public realm quality is required by DE3, and permeability and wayfinding by AT1.'],
  D9: [['S12'], 'Policy S12 defines where tall buildings are appropriate and the heights they may reach, as required by D9.'],
  D10: [[], 'Basement development is less of an issue in the City than in residential boroughs. We are checking whether DE1 and DE2 cover it before deciding whether a policy is needed.'],
  D11: [['S2', 'SA1', 'SA3'], 'Safety and security are addressed through S2, with requirements for publicly accessible locations (SA1) and designing in security (SA3).'],
  D12: [['DE2'], ''],
  D13: [['HL3', 'CV5'], 'The Agent of Change principle is applied to noise (HL3) and to the evening and night-time economy (CV5).'],
  D14: [['HL3'], 'Policy HL3 requires development to manage noise and protect the City\'s quieter areas.'],
  H1: [['S3', 'HS1'], 'Policy S3 plans to meet the London Plan\'s ten-year housing target for the City of 1,460 homes.'],
  H2: [['S3'], 'Small sites contribute to the overall housing supply in S3. They are counted in the housing trajectory rather than given a separate policy.'],
  H3: [[], 'Meanwhile housing is not expected to contribute in the City, where temporary vacancies are mostly in office buildings.', ['housing-topic-paper-meanwhile']],
  H4: [['S3'], 'Policy S3 sets the affordable housing requirement for residential development, with provision on site wherever possible.'],
  H5: [['S3'], 'The threshold approach is applied through S3, with schemes meeting the threshold following the fast track route.'],
  H6: [['S3'], 'The tenure split in S3 follows the London Plan\'s preferred split between low cost rented and intermediate homes.'],
  H7: [[], 'Affordable housing is monitored through the Authority Monitoring Report. Policy link to be confirmed.'],
  H8: [['HS2'], 'Policy HS2 resists the loss of existing housing.'],
  H9: [['HS5'], 'Policy HS5 controls short-term residential letting so that homes stay in permanent residential use.'],
  H13: [['HS7'], 'Policy HS7 supports specialist older persons\' housing in the residential areas.'],
  H14: [[], 'There are no Gypsy and Traveller sites in the City and no identified need for pitches or plots, so no allocation or policy is needed.', ['shma-gypsy-traveller']],
  H15: [['HS6'], 'Policy HS6 sets the criteria for purpose-built student accommodation.'],
  H16: [['HS6'], 'Large-scale purpose-built shared living is considered under HS6, which covers hostels and other forms of shared accommodation.'],
  S1: [['HL5'], 'Policy HL5 protects existing social and community facilities and supports new ones where there is a need.'],
  S2: [['HL5', 'HL9'], 'Health facilities are protected under HL5, and health impacts assessed under HL9.'],
  S3: [['HL5'], 'Education and childcare facilities are protected and supported as community facilities under HL5.'],
  S4: [['HL8'], 'Policy HL8 requires play space in residential development and protects existing play areas.'],
  S5: [['HL7'], 'Policy HL7 protects and supports sport and recreation facilities.'],
  S6: [['HL6'], 'Policy HL6 requires publicly accessible toilets in large developments.'],
  S7: [[], 'There are no burial grounds in active use in the City. Need is met at the City of London Cemetery and Crematorium outside the Square Mile.', ['idp-burial']],
  E1: [['S4', 'OF1', 'OF2'], 'The plan provides for office growth (S4, OF1) and protects existing office floorspace (OF2), in line with E1\'s approach for the CAZ.'],
  E2: [['OF1'], 'Policy OF1 requires a range of office sizes, including space suitable for small and medium-sized enterprises.'],
  E3: [['OF1'], 'Affordable workspace is sought in major office schemes through OF1.'],
  E4: [['VT2', 'CE1'], 'The City has no industrial land. Last-mile logistics and servicing are addressed through freight consolidation (VT2) and sustainable waste facilities (CE1).'],
  E5: [[], 'There are no Strategic Industrial Locations in the City.', ['elr-industrial-land']],
  E6: [[], 'There are no Locally Significant Industrial Sites in the City.', ['elr-industrial-land']],
  E7: [[], 'With no industrial land in the City, there is nothing to intensify, co-locate or substitute.', ['elr-industrial-land']],
  E8: [['S4', 'OF1'], 'The City\'s financial, professional and technology clusters are supported through S4 and OF1.'],
  E9: [['S5', 'RE3', 'RE4'], 'Retail is addressed by S5, specialist retail clusters by RE3 and markets by RE4.'],
  E10: [['CV3', 'CV4'], 'Visitor facilities are supported by CV3, and hotels by CV4.'],
  E11: [[], 'Skills and employment are secured through planning obligations. To be linked once the planning contributions policy is drafted.'],
  HC1: [['S11', 'HE1', 'HE2'], 'The historic environment is conserved through S11, HE1 and, for archaeology, HE2.'],
  HC2: [['HE3'], 'Policy HE3 protects the setting of the Tower of London World Heritage Site.'],
  HC3: [['S13'], 'Policy S13 protects strategic and local views, including the City\'s own views of St Paul\'s Cathedral.'],
  HC4: [['S13'], 'Policy S13 applies the London View Management Framework to development in the City.'],
  HC5: [['S6', 'CV1', 'CV2'], 'Culture is supported by S6, with existing cultural facilities protected (CV1) and new ones provided (CV2).'],
  HC6: [['CV5'], 'Policy CV5 supports the evening and night-time economy while managing its impacts.'],
  G1: [['S14'], 'Policy S14 sets the City\'s approach to green infrastructure.'],
  G2: [[], 'There is no Green Belt in the City.', ['green-belt-assessment']],
  G3: [[], 'No open space in the City is designated as Metropolitan Open Land. Its open spaces are protected through OS1 instead.', ['open-space-mol']],
  G4: [['OS1'], 'Policy OS1 protects existing open spaces and seeks new publicly accessible space.'],
  G5: [['OS2'], 'Policy OS2 applies the Urban Greening Factor to major development.'],
  G6: [['OS3', 'OS4'], 'Biodiversity is protected and enhanced through OS3, and biodiversity net gain required through OS4.'],
  G7: [['OS5'], 'Policy OS5 protects existing trees and requires new planting.'],
  G9: [[], 'There are no geodiversity sites in the City.', ['biodiversity-geodiversity']],
  SI1: [['HL2'], 'Policy HL2 requires development to be at least air quality neutral.'],
  SI2: [['DE1'], 'Policy DE1 sets net zero carbon and whole life-cycle carbon requirements.'],
  SI3: [['IN1'], 'Energy infrastructure and connection to heat networks are required through IN1.'],
  SI4: [['CR1'], 'Policy CR1 requires development to reduce overheating and the urban heat island effect.'],
  SI5: [['IN1', 'IN2'], 'Water infrastructure capacity is addressed through IN1 and IN2.'],
  SI6: [['IN1'], 'Policy IN1 requires digital connectivity infrastructure in new development.'],
  SI7: [['S16', 'CE1'], 'The circular economy and waste reduction are addressed through S16 and CE1.'],
  SI8: [['CE1', 'CE2'], 'The City meets its London Plan waste apportionment through CE1 and CE2, and through joint working with other waste planning authorities.'],
  SI9: [['CE2'], 'Policy CE2 safeguards existing waste sites, including Walbrook Wharf.'],
  SI10: [[], 'The City has no mineral resources, aggregate wharves or railheads.', ['waste-study-minerals']],
  SI11: [[], 'The City lies outside any area licensed for onshore oil and gas.', ['waste-study-minerals']],
  SI12: [['S15', 'CR2', 'CR4'], 'Flood risk is managed through S15, CR2 and the flood defence requirements of CR4.'],
  SI13: [['CR3'], 'Policy CR3 requires sustainable drainage systems in all major development.'],
  SI14: [[], 'The Thames is addressed in the plan\'s Thames Policy Area chapter, which is not yet linked in this statement.'],
  SI15: [['VT4'], 'Policy VT4 supports river transport, including passenger piers and freight.'],
  T1: [['S9', 'S10'], 'Transport and servicing (S9) and active travel (S10) set the City\'s strategic approach.'],
  T2: [['S10', 'AT1'], 'The Healthy Streets Approach is applied through S10 and AT1.'],
  T3: [['VT1'], 'Transport capacity and safeguarding are addressed through VT1.'],
  T4: [['VT1'], 'Policy VT1 requires transport impacts to be assessed and mitigated.'],
  T5: [['AT2', 'AT3'], 'Cycling is supported by AT2, and cycle parking required by AT3 to at least London Plan standards.'],
  T6: [['VT3'], 'Policy VT3 requires development in the City to be car-free.'],
  'T6.1': [['VT3'], 'Residential development is car-free under VT3, except for disabled persons\' parking.'],
  'T6.2': [['VT3'], 'Office development is car-free under VT3.'],
  'T6.3': [['VT3'], ''],
  T7: [['VT2'], 'Deliveries, servicing and construction logistics are managed through VT2.'],
  T8: [['VT5'], 'Policy VT5 restricts aviation landing facilities such as helipads.']
}

// A fresh copy of the seed, in the shape the statement keeps in session data.
function startingState () {
  const policies = {}
  Object.keys(SEED).forEach(ref => {
    const [links, comment, evidence] = SEED[ref]
    policies[ref] = { links: links.slice(), comment, evidence: (evidence || []).slice() }
  })
  return { policies }
}

// A policy's status is derived from what has been recorded against it, never stored, so the
// tag can't disagree with the links, comment and evidence shown beside it.
//   Addressed                 linked to local plan policies, with a comment
//   Not addressed: justified  no links, but a comment and evidence for why none are needed
//   In progress               something recorded, but not yet either of the above
//   Not started               nothing recorded
const STATUSES = ['Addressed', 'Not addressed: justified', 'In progress', 'Not started']

const STATUS_COLOURS = {
  Addressed: 'green',
  'Not addressed: justified': 'blue',
  'In progress': 'yellow',
  'Not started': 'grey'
}

function getStatus (entry) {
  const links = (entry && entry.links) || []
  const comment = ((entry && entry.comment) || '').trim()
  const evidence = (entry && entry.evidence) || []
  if (links.length && comment) return 'Addressed'
  if (!links.length && comment && evidence.length) return 'Not addressed: justified'
  if (links.length || comment || evidence.length) return 'In progress'
  return 'Not started'
}

// What an "In progress" policy still needs, in the words shown under its tag.
function getNextStep (entry) {
  const links = (entry && entry.links) || []
  const comment = ((entry && entry.comment) || '').trim()
  const evidence = (entry && entry.evidence) || []
  if (getStatus(entry) !== 'In progress') return ''
  if (!comment) return 'Add an authority comment'
  if (!links.length && !evidence.length) return 'Link a local plan policy, or add evidence that none is needed'
  return ''
}

module.exports = {
  SDS,
  CHAPTERS,
  SDS_POLICIES,
  EVIDENCE,
  STATUSES,
  STATUS_COLOURS,
  getEvidence,
  getSdsPolicy,
  getChapter,
  getStatus,
  getNextStep,
  startingState
}
