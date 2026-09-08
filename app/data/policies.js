//
// Example policies for the "View policy summary" prototype.
//
// Policy references and titles are taken from the City of London's City Plan
// 2040 so the examples read like real local plan policies:
// https://www.cityoflondon.gov.uk/services/planning/planning-policy/city-plan-2040
//
// EVERYTHING ELSE HERE IS INVENTED PROTOTYPE CONTENT — the summaries,
// evidence links, consultation figures and notes are illustrative only and
// are not the City of London's material. Don't quote any of it as real.
//

const POLICIES = [
  {
    ref: 'HL1',
    title: 'Inclusive Buildings and Spaces',
    policyArea: 'Health, inclusion and safety',
    summary: 'Requires development to be designed so that everyone can use buildings and public spaces independently and with dignity, going beyond minimum accessibility standards where the evidence supports it.',
    tags: ['Need', 'Capacity', 'Design'],
    evidenceSummary: 'Access audits and engagement with disabled residents and workers consistently found step-free routes and legible wayfinding to be the two biggest barriers. Evidence supports setting a requirement above the national minimum.',
    evidenceSources: [
      { title: 'Inclusive Design Access Audit', ref: 'Paragraph 4.12', summary: 'Step-free access and wayfinding barriers across 40 audited sites' },
      { title: 'Stakeholder feedback', ref: 'Session 3', summary: 'Accessibility panel on independent use of buildings' }
    ],
    consultationSummary: 'Broad support for a stronger inclusive design requirement. Developers questioned how the standard would be evidenced at application stage; access groups asked for wayfinding to be explicitly covered.',
    consultationResponseCount: 46,
    consultationResponses: [
      { respondent: 'Inclusive Access Panel', ref: 'Paragraphs 8, 14', comment: 'Wayfinding should be named in the policy itself, not just the supporting text — signage and legibility are as much a barrier as steps.' },
      { respondent: 'Guide Dogs', ref: 'Paragraph 5', comment: 'Supports going beyond minimum standards, but asks that tactile paving and level thresholds be treated as baseline rather than optional enhancements.' }
    ],
    notes: [
      { author: 'Policy team', date: '3 April 2024', text: 'Access panel asked for wayfinding to be named explicitly in the policy wording, not just the supporting text.' }
    ]
  },
  {
    ref: 'HS1',
    title: 'Location of New Housing',
    policyArea: 'Housing',
    summary: 'Directs new housing to locations where it will not compromise business functions, with particular regard to residential amenity, noise and servicing in a dense mixed-use environment.',
    tags: ['Need', 'Capacity', 'Site Allocations'],
    evidenceSummary: 'The housing needs evidence shows household growth outpacing supply over the plan period, with delivery constrained by brownfield availability and infrastructure capacity. Demand is concentrated around the best-connected areas.',
    evidenceSources: [
      { title: 'Local Housing Needs Assessment', ref: 'Chapter 3', summary: 'Household growth outpacing existing housing supply' },
      { title: 'Housing Topic Paper', ref: 'Paragraph 2.8', summary: 'Supply and delivery trajectory over the plan period' },
      { title: 'Stakeholder feedback', ref: 'March 2024', summary: 'Residents on infrastructure keeping pace with growth' }
    ],
    consultationSummary: 'Residents supported more housing but doubted infrastructure would keep pace. Several respondents asked for clearer protection of residential amenity where housing adjoins late-night uses.',
    consultationResponseCount: 132,
    consultationResponses: [
      { respondent: 'Residents\' Association', ref: 'Paragraphs 12, 19', comment: 'Supports more housing but doubts infrastructure will keep pace with the delivery trajectory.' },
      { respondent: 'Home Builders Federation', ref: 'Paragraph 31', comment: 'Asks for the amenity requirements to be expressed as clear thresholds so schemes can be designed against them.' }
    ],
    notes: [
      { author: 'Policy team', date: '12 March 2024', text: 'Cross-check the delivery trajectory against the infrastructure evidence before the next draft.' },
      { author: 'Housing team', date: '28 March 2024', text: 'Amenity wording needs to work alongside the noise policy — flagged at the joint session.' }
    ]
  },
  {
    ref: 'IN1',
    title: 'Infrastructure provision and connection',
    policyArea: 'Infrastructure',
    summary: 'Requires utility infrastructure and connections to be designed into development from the outset and integrated with it, including connections to existing decentralised energy networks where feasible.',
    tags: ['Capacity', 'Infrastructure'],
    evidenceSummary: 'The infrastructure evidence identifies constrained capacity in parts of the network and a pattern of connections being retrofitted late in the development process, at greater cost and disruption.',
    evidenceSources: [
      { title: 'Infrastructure Delivery Plan 2024', ref: 'Paragraph 5.2', summary: 'Capacity and phasing of utility connections' },
      { title: 'Local Housing Needs Assessment', ref: 'Chapter 3', summary: 'Infrastructure delivery as a constraint on supply' }
    ],
    consultationSummary: 'Utility providers welcomed earlier engagement. Developers asked for clarity on what "designed in from the outset" means in practice at each application stage.',
    consultationResponseCount: 38,
    consultationResponses: [
      { respondent: 'Thames Water', ref: 'Paragraphs 6, 11', comment: 'Welcomes earlier engagement, and asks that connection capacity be confirmed before layouts are fixed.' },
      { respondent: 'UK Power Networks', ref: 'Paragraph 9', comment: 'Supports integration from the outset; requests clarity on what evidence is expected at each application stage.' }
    ],
    notes: [
      { author: 'Infrastructure team', date: '18 April 2024', text: 'Utility providers offered to help draft the supporting text on early engagement.' }
    ]
  },
  {
    ref: 'IN2',
    title: 'Infrastructure Capacity',
    policyArea: 'Infrastructure',
    summary: 'Expects development to demonstrate that sufficient infrastructure capacity exists or will be provided in step with the development it serves.',
    tags: ['Capacity'],
    evidenceSummary: 'Capacity assessments show headroom varies sharply across the area, with the tightest constraints where the most growth is planned.',
    evidenceSources: [
      { title: 'Infrastructure Delivery Plan 2024', ref: 'Appendix B', summary: 'Network headroom assessment by area' }
    ],
    consultationSummary: 'Support in principle, with requests for the capacity evidence to be published and kept current so applicants can rely on it.',
    consultationResponseCount: 21,
    consultationResponses: [
      { respondent: 'Thames Water', ref: 'Paragraph 4', comment: 'Asks that the capacity evidence be published and refreshed annually so applicants can rely on it.' },
      { respondent: 'London Borough neighbours', ref: 'Paragraph 17', comment: 'Requests cross-boundary capacity to be considered where growth straddles the boundary.' }
    ],
    notes: []
  },
  {
    ref: 'DE1',
    title: 'Sustainable Design',
    policyArea: 'Design',
    summary: 'Requires a retrofit-first approach, with options for retention and retrofit explored before redevelopment, and whole life-cycle carbon emissions assessed and minimised on major development.',
    tags: ['Conservation', 'Capacity'],
    evidenceSummary: 'Whole life-cycle carbon assessments show retention and retrofit outperforming redevelopment in most of the cases sampled, though viability varies with building type and condition.',
    evidenceSources: [
      { title: 'Whole Life-Cycle Carbon Study', ref: 'Paragraph 6.4', summary: 'Retrofit outperforming redevelopment across 25 sampled schemes' },
      { title: 'Heritage and Conservation Study', ref: 'Paragraph 2.11', summary: 'Retention of existing fabric in conservation areas' }
    ],
    consultationSummary: 'Strong support from environmental groups. Some developers argued the assessment requirement should be proportionate to scheme size, and questioned the evidence for smaller buildings.',
    consultationResponseCount: 97,
    consultationResponses: [
      { respondent: 'Environment Agency', ref: 'Paragraphs 23, 27', comment: 'Supports the retrofit-first approach and asks that whole life-cycle carbon assessment explicitly account for flood resilience measures.' },
      { respondent: 'British Property Federation', ref: 'Paragraph 35', comment: 'Argues the assessment requirement should be proportionate to scheme size, with a clear threshold for smaller buildings.' }
    ],
    notes: [
      { author: 'Design team', date: '22 February 2024', text: 'Need a clear threshold for what counts as "major" here — currently inconsistent with the transport policy.' }
    ]
  },
  {
    ref: 'OF1',
    title: 'Office Development',
    policyArea: 'Offices',
    summary: 'Supports the provision and modernisation of office floorspace, protecting the area\'s primary business function while allowing for changing patterns of workplace use.',
    tags: ['Office', 'Need', 'Capacity'],
    evidenceSummary: 'Employment evidence points to sustained demand for high-quality, well-connected office space alongside a surplus of older stock that is difficult to let without substantial upgrade.',
    evidenceSources: [
      { title: 'Employment Land Review', ref: 'Paragraph 3.7', summary: 'Demand for high-quality space against a surplus of older stock' },
      { title: 'Scoping Consultation 2024', ref: 'Response 41', summary: 'Early engagement on flexible office space for small businesses' }
    ],
    consultationSummary: 'Business respondents supported the emphasis on modernisation. A minority argued for greater flexibility to convert surplus older stock to other uses.',
    consultationResponseCount: 74,
    consultationResponses: [
      { respondent: 'London Chamber of Commerce', ref: 'Paragraphs 7, 12', comment: 'Supports the emphasis on modernisation of older stock rather than wholesale redevelopment.' },
      { respondent: 'Small Business Forum', ref: 'Paragraph 21', comment: 'Asks for explicit support for flexible and affordable workspace for smaller occupiers.' }
    ],
    notes: [
      { author: 'Policy team', date: '15 February 2024', text: 'Scoping responses flagged demand for flexible office space for small businesses — check this is reflected.' }
    ]
  },
  {
    ref: 'RE1',
    title: 'Principal Shopping Centres',
    policyArea: 'Retail',
    summary: 'Protects and enhances the identified principal shopping centres as the focus for retail activity, resisting changes of use that would undermine their retail function.',
    tags: ['Need', 'Capacity'],
    evidenceSummary: 'Retail evidence shows footfall recovering unevenly, with the designated centres performing more strongly than dispersed frontages.',
    evidenceSources: [
      { title: 'Retail and Leisure Needs Study', ref: 'Paragraph 4.3', summary: 'Footfall and vacancy analysis across designated centres' }
    ],
    consultationSummary: 'Centre managers supported continued protection. Some landlords asked for more flexibility on upper floors where retail demand has fallen away.',
    consultationResponseCount: 29,
    consultationResponses: [
      { respondent: 'Centre Management', ref: 'Paragraph 5', comment: 'Supports continued protection of the designated centres as the focus for retail activity.' },
      { respondent: 'Retail Property Owners Group', ref: 'Paragraphs 14, 18', comment: 'Requests more flexibility on upper floors where retail demand has fallen away.' }
    ],
    notes: []
  },
  {
    ref: 'CV1',
    title: 'Protection of Existing Cultural Infrastructure, and Leisure, Recreation and Visitor Arts and Cultural Facilities',
    policyArea: 'Culture and visitors',
    summary: 'Resists the loss of existing cultural, leisure and visitor facilities unless replacement provision of equivalent quality is made, recognising their role in the area\'s identity and evening economy.',
    tags: ['Heritage', 'Need'],
    evidenceSummary: 'The cultural infrastructure audit records a net loss of smaller venues over the last decade, with affordability and lease insecurity the most cited causes.',
    evidenceSources: [
      { title: 'Cultural Infrastructure Audit', ref: 'Paragraph 3.2', summary: 'Net loss of smaller venues over the last decade' },
      { title: 'Stakeholder feedback', ref: 'Roundtable 2', summary: 'Cultural sector on affordability and lease insecurity' }
    ],
    consultationSummary: 'Cultural organisations strongly supported the protection. Questions were raised about what counts as "equivalent quality" replacement provision.',
    consultationResponseCount: 61,
    consultationResponses: [
      { respondent: 'Music Venue Trust', ref: 'Paragraphs 9, 16', comment: 'Strongly supports protection, and asks that \'equivalent quality\' replacement provision be defined in the supporting text.' },
      { respondent: 'Theatres Trust', ref: 'Paragraph 22', comment: 'Asks that lease insecurity be recognised as a cause of venue loss, not just redevelopment.' }
    ],
    notes: [
      { author: 'Culture team', date: '9 April 2024', text: 'Define "equivalent quality" in supporting text — raised repeatedly at the roundtable.' }
    ]
  },
  {
    ref: 'HE1',
    title: 'Managing Change to the Historic Environment',
    policyArea: 'Heritage and Tall Buildings',
    summary: 'Sets a positive strategy for the historic environment, supporting changes of use consistent with long-term conservation and paying particular attention to historic routes, spaces and roofscapes.',
    tags: ['Heritage', 'Conservation'],
    evidenceSummary: 'The conservation evidence identifies constraints on the scale and design of new development in and around conservation areas, and highlights historic routes as an under-protected asset.',
    evidenceSources: [
      { title: 'Heritage and Conservation Study', ref: 'Chapter 4', summary: 'Constraints on scale and design near conservation areas' },
      { title: 'Historic Routes and Spaces Review', ref: 'Paragraph 1.9', summary: 'Historic routes as an under-protected asset' }
    ],
    consultationSummary: 'Amenity societies welcomed the emphasis on routes and roofscapes. Developers sought clarity on how the policy interacts with the tall buildings policy.',
    consultationResponseCount: 88,
    consultationResponses: [
      { respondent: 'Historic England', ref: 'Paragraphs 11, 15', comment: 'Welcomes the emphasis on historic routes and roofscapes, and asks for clearer criteria for assessing harm to setting.' },
      { respondent: 'Amenity Society', ref: 'Paragraph 28', comment: 'Asks how the policy is intended to interact with the tall buildings policy where the two pull in different directions.' }
    ],
    notes: [
      { author: 'Heritage team', date: '30 January 2024', text: 'Interaction with tall buildings policy needs resolving before submission.' }
    ]
  },
  {
    ref: 'OS1',
    title: 'Protection and provision of open spaces',
    policyArea: 'Open Spaces and Green Infrastructure',
    summary: 'Protects existing open space and requires new provision or improvement where development would increase pressure on it, with green infrastructure treated as a network rather than isolated sites.',
    tags: ['Green Belt', 'AONB', 'Need'],
    evidenceSummary: 'Open space assessment finds provision well below the local standard in the most densely developed areas, with the greatest deficiency where the most growth is planned.',
    evidenceSources: [
      { title: 'Open Space Assessment', ref: 'Paragraph 2.4', summary: 'Provision below the local standard in the densest areas' },
      { title: 'Green Belt Assessment', ref: 'Paragraph 7.1', summary: 'Boundary review conclusions on exceptional circumstances' }
    ],
    consultationSummary: 'Widespread support for stronger protection. Several respondents asked for the green infrastructure network to be mapped in the plan rather than described.',
    consultationResponseCount: 115,
    consultationResponses: [
      { respondent: 'Natural England', ref: 'Paragraphs 13, 20', comment: 'Supports treating green infrastructure as a network, and asks that the network be mapped in the plan rather than described.' },
      { respondent: 'Sport England', ref: 'Paragraph 24', comment: 'Asks that provision standards distinguish between formal recreation space and incidental green space.' }
    ],
    notes: [
      { author: 'Open spaces team', date: '6 March 2024', text: 'Mapping request came up in almost every session — worth a decision before the next draft.' }
    ]
  },
  {
    ref: 'CR1',
    title: 'Overheating and Urban Heat Island Effect',
    policyArea: 'Climate Resilience',
    summary: 'Requires development to reduce overheating risk and avoid adding to the urban heat island effect, following the cooling hierarchy and prioritising passive measures.',
    tags: ['Flood Risk', 'Capacity'],
    evidenceSummary: 'Climate risk modelling projects a marked increase in days exceeding overheating thresholds, with the effect most pronounced in the densest, least vegetated areas.',
    evidenceSources: [
      { title: 'Climate Risk and Overheating Study', ref: 'Paragraph 5.6', summary: 'Projected days above overheating thresholds to 2050' },
      { title: 'Open Space Assessment', ref: 'Paragraph 6.2', summary: 'Tree canopy cover and shading in the urban heat island' }
    ],
    consultationSummary: 'Support for the cooling hierarchy. Some respondents wanted mechanical cooling ruled out more firmly; others warned this would be unworkable for some building types.',
    consultationResponseCount: 53,
    consultationResponses: [
      { respondent: 'Environment Agency', ref: 'Paragraphs 23, 27', comment: 'Supports the cooling hierarchy and asks that overheating and surface water flood risk be assessed together rather than separately.' },
      { respondent: 'Chartered Institution of Building Services Engineers', ref: 'Paragraph 30', comment: 'Warns that ruling out mechanical cooling entirely would be unworkable for some building types.' }
    ],
    notes: []
  },
  {
    ref: 'VT1',
    title: 'The Impacts of Development on Transport',
    policyArea: 'Transport',
    summary: 'Requires development to assess and mitigate its transport impacts, with particular regard to pedestrian comfort, servicing and the capacity of the surrounding network.',
    tags: ['Capacity', 'Need'],
    evidenceSummary: 'Transport evidence shows pedestrian comfort levels already under strain at peak times on several key routes, and identifies servicing as a growing source of conflict.',
    evidenceSources: [
      { title: 'National Planning policy', ref: 'TR3', summary: 'Locating development in sustainable locations' },
      { title: 'Transport Capacity Study', ref: 'Paragraph 3.11', summary: 'Pedestrian comfort levels under strain at peak times' },
      { title: 'Local Housing Needs Assessment', ref: 'Chapter 3', summary: 'Public transport capacity around strategic growth areas' }
    ],
    consultationSummary: 'Transport bodies supported the approach. Businesses raised concerns about servicing restrictions and asked for consolidation to be encouraged rather than required.',
    consultationResponseCount: 67,
    consultationResponses: [
      { respondent: 'Transport for London', ref: 'Paragraphs 10, 18', comment: 'Supports the approach to pedestrian comfort, and asks that servicing consolidation be encouraged through the policy.' },
      { respondent: 'City Business Group', ref: 'Paragraph 26', comment: 'Raises concern that servicing restrictions could affect daily operations, and asks for consolidation to be encouraged rather than required.' }
    ],
    notes: [
      { author: 'Transport team', date: 'March 2024', text: 'Officers raised concerns that public transport capacity may not keep pace with planned housing delivery.' }
    ]
  }
]

// Terms offered by the evidence search's type-ahead: every policy title,
// plus the themes officers commonly search the evidence base for.
const COMMON_SEARCH_TERMS = [
  'accessibility',
  'affordable housing',
  'brownfield land',
  'conservation area',
  'daylight and sunlight',
  'flood risk',
  'green infrastructure',
  'household growth',
  'infrastructure capacity',
  'office floorspace',
  'overheating',
  'pedestrian comfort',
  'public transport',
  'retrofit',
  'servicing',
  'tall buildings',
  'viability',
  'wayfinding',
  'whole life-cycle carbon'
]

function getSearchTerms () {
  return POLICIES.map(policy => ({ term: policy.title, kind: 'Policy' }))
    .concat(COMMON_SEARCH_TERMS.map(term => ({ term, kind: 'Topic' })))
}

function getPoliciesForArea (policyArea) {
  return policyArea ? POLICIES.filter(policy => policy.policyArea === policyArea) : []
}

function getPolicy (ref) {
  return POLICIES.find(policy => policy.ref === ref) || null
}

module.exports = { POLICIES, COMMON_SEARCH_TERMS, getSearchTerms, getPoliciesForArea, getPolicy }
