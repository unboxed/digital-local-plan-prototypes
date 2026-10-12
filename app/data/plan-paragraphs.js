//
// Paragraph-level content for the Examination - inspector view prototype.
//
// Nothing in policies.js breaks a policy's own wording into paragraphs — it only carries a
// one-line summary — so this file adds that layer for the prototype's paragraph-by-paragraph
// viewer. ALL PARAGRAPH TEXT AND NPPF/SDS REFERENCES HERE ARE INVENTED ILLUSTRATIVE CONTENT,
// not real plan or national policy wording.
//
// The exception is S3 Housing, which carries the City Plan 2040's own policy wording as a
// structured `body` (from POLICY_TEXT below) so the viewer can show it as the plan sets it out,
// and its `explanatoryText`, shown above it. S3's evidence, representations and NPPF/SDS lists
// are given in POLICY_RESOURCES below rather than derived.
//
// POLICY_PARAGRAPHS is authored only for the 12 policies in policies.js that already have a
// full summary (hasFullSummary(policy) — see policies.js), since those are the only policies
// with evidence/consultation content rich enough to make a paragraph viewer worth
// demonstrating. getParagraphsForPolicy() falls back to the policy's existing one-line summary
// for every other policy, so the whole plan stays navigable even though most policies don't
// have authored paragraph text.
//

// Full policy wording for the Housing chapter, as `{ intro?, clauses: [{ text, items? }] }`:
// numbered clauses, each with optional lettered sub-clauses. Shared by the Examination view (S3's
// page) and Gateway 2 progress check (the Housing chapter's Policy Text), rendered by
// partials/policy-text/macro.njk.
//
// S3 is the City Plan 2040's own wording. HS1–HS8 are written for this prototype from each
// policy's summary in policies.js, in the plan's style — they are not the plan's wording.
const POLICY_TEXT = {
  S3: {
    intro: 'The City Corporation will protect existing housing and amenity and encourage additional housing concentrated in or near the identified residential areas to meet the City’s needs by:',
    clauses: [
      {
        text: 'Making provision for a minimum of 1,706 net additional dwellings between 2025/26 and 2039/40:',
        items: [
          'Encouraging new housing development on appropriate sites in or near identified residential areas;',
          'Within identified residential areas, prioritising the delivery of affordable housing, co-living, build to rent, hostels, sheltered and extra-care housing, while recognising that for sale market housing would be likely in some instances to have a role to play in making housing development viable;',
          'Protecting existing housing where it is of a suitable quality and in a suitable location;',
          'Exceptionally, allowing the loss of isolated residential units where there is a poor level of amenity; and',
          'Refusing new housing where it would prejudice the primary business function of the City or be contrary to Policy OF2.'
        ]
      },
      {
        text: 'Ensuring sufficient affordable housing is provided. Incentivising affordable housing delivery to meet the City’s housing need and contributing to London’s wider housing needs by:',
        items: [
          'ensuring the delivery of applying the Mayor’s threshold approach of a minimum of 35% affordable housing and a minimum of 50% affordable housing on public sector land;',
          'requiring residential developments with the potential for 10 or more units to provide a minimum of 35% affordable housing on-site. Exceptionally, new affordable housing may be provided off-site, or through an equivalent cash in lieu payment, if evidence is provided to the City Corporation’s satisfaction that on-site provision cannot be satisfactorily delivered and is not viable; and',
          'providing an appropriate mix of affordable tenures, addressing identified need in the City of London, including social or London affordable rented housing and where appropriate intermediate housing (living rent, shared ownership or other genuinely affordable products) for rent or sale.'
        ]
      },
      {
        text: 'Requiring a publicly accessible viability and feasibility assessment to be submitted to justify any proposals that do not meet on-site or off-site affordable housing requirements in this policy. Where policy targets are not able to be met when an application is decided, the City Corporation will require an upwards only review mechanism to be applied to ensure that the benefits of any subsequent uplift in values or reduction in costs are reflected in affordable housing contributions.'
      },
      {
        text: 'Ensuring that other new land uses within identified residential areas are compatible with residential amenity.'
      },
      {
        text: 'Requiring at least 10% of new dwellings to meet Building Regulation requirement M4(3) ‘wheelchair user dwellings’ and all other new dwellings to meet Building Regulation requirement M4(2) ‘accessible and adaptable dwellings’.'
      }
    ]
  },
  HS1: {
    clauses: [
      {
        text: 'New housing will be supported on suitable sites in or near the identified residential areas shown on the Policies Map, where it would not:',
        items: [
          'prejudice the primary business function of the City;',
          'be contrary to Policy OF2; or',
          'expose future residents to unacceptable levels of noise, disturbance or poor air quality.'
        ]
      },
      { text: 'Proposals for housing must include a noise and amenity assessment where the site adjoins a late-night use or a servicing yard, and must not prejudice the continued operation of an existing lawful business use on an adjoining site.' },
      { text: 'Housing outside the identified residential areas will be resisted where it would compromise the delivery of office floorspace or the operation of neighbouring businesses.' }
    ]
  },
  HS2: {
    clauses: [
      {
        text: 'The net loss of existing housing, including through the amalgamation of units, will be resisted unless:',
        items: [
          'the accommodation has a poor level of residential amenity that cannot reasonably be improved;',
          'the units do not have a separate entrance from commercial premises in the same building; or',
          'outside the identified residential areas, the loss would enable beneficial business development.'
        ]
      },
      { text: 'Where a loss of housing is accepted, any replacement provision should be of at least equivalent floorspace and quality, located in or near an identified residential area.' }
    ]
  },
  HS3: {
    clauses: [
      {
        text: 'The amenity of existing and future residents will be protected by:',
        items: [
          'resisting development that would cause unacceptable noise, fumes, smells or vehicle and pedestrian disturbance;',
          'requiring development to be designed to minimise overlooking of existing homes and to protect their daylight and sunlight; and',
          'requiring construction, servicing and deliveries to be managed so that disturbance to residents is minimised, particularly at night.'
        ]
      },
      { text: 'New housing must be designed so that its residents are not exposed to unacceptable noise or disturbance from existing uses nearby.' }
    ]
  },
  HS4: {
    intro: 'All new housing must:',
    clauses: [
      { text: 'meet or exceed the London Plan internal space standards and provide private outdoor amenity space in line with London Plan standards;' },
      { text: 'achieve Secured by Design certification;' },
      { text: 'maximise communal open and leisure space, including roof gardens and terraces, where this would not harm the amenity of neighbouring occupiers; and' },
      { text: 'be dual aspect wherever possible, and avoid single aspect north-facing homes.' }
    ]
  },
  HS5: {
    clauses: [
      { text: 'The short-term letting of permanent residential premises for more than 90 nights in a calendar year will be resisted.' },
      { text: 'Short-term letting for commercial purposes will not be permitted in buildings where it would be mixed with permanent residential accommodation.' }
    ]
  },
  HS6: {
    clauses: [
      {
        text: 'New purpose-built student accommodation and hostels will be permitted only where they:',
        items: [
          'meet high standards of design and provide good quality, well-managed accommodation;',
          'are well connected by public transport, walking and cycling to the higher education institutions they serve;',
          'do not prejudice the primary business function of the City or the amenity of nearby residents; and',
          'are supported by a management plan covering security, servicing and the behaviour of occupiers.'
        ]
      },
      { text: 'Purpose-built student accommodation must provide at least 35% of bedrooms as affordable student accommodation, and be secured for students through a nominations agreement with one or more higher education providers.' }
    ]
  },
  HS7: {
    clauses: [
      { text: 'A minimum of 86 net additional dwellings for older people will be sought between 2023 and 2040.' },
      { text: 'Accessible housing that enables older people to live independently, including sheltered and extra-care housing, will be supported in or near the identified residential areas.' },
      { text: 'The net loss of existing housing for older people will be resisted unless it is replaced by accommodation of equivalent or better quality that meets identified need.' }
    ]
  },
  HS8: {
    clauses: [
      { text: 'The provision of self and custom build housing units will be encouraged within large residential schemes, having regard to the demand shown on the City Corporation’s self-build register.' }
    ]
  }
}

const POLICY_PARAGRAPHS = {
  S3: [
    {
      sectionTitle: 'Policy text',
      explanatoryText: 'Housing is vital for the City’s future economy and its communities. A shortage of housing, particularly affordable housing, is one of the main barriers to future business and community growth in the City and across London. High quality, affordable housing is also essential to meet the housing needs of those of the City’s communities on lower incomes.',
      body: POLICY_TEXT.S3
    }
  ],
  HL1: [
    {
      sectionTitle: 'Policy intent',
      text: 'Development must be designed so that everyone, regardless of age, disability or circumstance, can use buildings and public spaces independently and with dignity. Where the evidence supports it, schemes are expected to go beyond minimum accessibility standards rather than treat them as a ceiling.'
    },
    {
      sectionTitle: 'Requirements',
      text: 'Applications for major development must demonstrate step-free access to all principal entrances and routes through a site, legible wayfinding that does not rely on signage alone, and at least one changing places facility where the development includes public-facing floorspace above a threshold set out in the supporting text.'
    },
    {
      sectionTitle: 'Reasoned justification',
      text: 'Access audits and engagement with disabled residents and workers consistently identified step-free routes and legible wayfinding as the two biggest barriers, supporting a requirement above the national minimum. Consultation showed broad support for a stronger standard, though developers asked how it would be evidenced at application stage and access groups asked for wayfinding to be named explicitly rather than left to supporting text.'
    }
  ],
  HS1: [
    {
      sectionTitle: 'Policy intent',
      text: 'New housing is directed to locations where it will not compromise the area’s business function, with particular regard to residential amenity, noise and servicing in a dense mixed-use environment.'
    },
    {
      sectionTitle: 'Requirements',
      text: 'Proposals for housing must include a noise and amenity assessment where the site adjoins a late-night use or a servicing yard, and must not prejudice the continued operation of an existing lawful business use on an adjoining site.'
    },
    {
      sectionTitle: 'Reasoned justification',
      text: 'Housing needs evidence shows household growth outpacing supply over the plan period, with delivery constrained by brownfield availability and infrastructure capacity, and demand concentrated around the best-connected areas. Consultation respondents supported more housing but doubted infrastructure would keep pace, and several asked for clearer protection of residential amenity where housing adjoins late-night uses.'
    }
  ],
  OF1: [
    {
      sectionTitle: 'Policy intent',
      text: 'The provision and modernisation of office floorspace is supported, protecting the area’s primary business function while allowing for changing patterns of workplace use.'
    },
    {
      sectionTitle: 'Requirements',
      text: 'Proposals that would result in a net loss of office floorspace must demonstrate that the space is no longer viable for modern business occupation, having regard to its condition, configuration and marketing history.'
    },
    {
      sectionTitle: 'Reasoned justification',
      text: 'Employment evidence points to sustained demand for high-quality, well-connected office space alongside a surplus of older stock that is difficult to let without substantial upgrade. Business respondents supported the emphasis on modernisation, though a minority argued for greater flexibility to convert surplus older stock to other uses.'
    }
  ],
  RE1: [
    {
      sectionTitle: 'Policy intent',
      text: 'The identified principal shopping centres are protected and enhanced as the focus for retail activity, and changes of use that would undermine their retail function are resisted.'
    },
    {
      sectionTitle: 'Requirements',
      text: 'Within a principal shopping centre, ground floor units must remain in a retail or town-centre use unless the applicant demonstrates the unit has been actively marketed for retail use for a continuous period without a viable offer.'
    },
    {
      sectionTitle: 'Reasoned justification',
      text: 'Retail evidence shows footfall recovering unevenly, with the designated centres performing more strongly than dispersed frontages. Centre managers supported continued protection, while some landlords asked for more flexibility on upper floors where retail demand has fallen away.'
    }
  ],
  CV1: [
    {
      sectionTitle: 'Policy intent',
      text: 'The loss of existing cultural, leisure and visitor facilities is resisted unless replacement provision of equivalent quality is made, recognising their role in the area’s identity and evening economy.'
    },
    {
      sectionTitle: 'Requirements',
      text: 'Where the loss of a cultural or leisure facility is proposed, the applicant must demonstrate that replacement provision of equivalent quality, capacity and accessibility has been secured, or that the facility is no longer viable despite reasonable efforts to sustain it.'
    },
    {
      sectionTitle: 'Reasoned justification',
      text: 'The cultural infrastructure audit records a net loss of smaller venues over the last decade, with affordability and lease insecurity the most cited causes. Cultural organisations strongly supported the protection, though questions were raised in consultation about what counts as "equivalent quality" replacement provision.'
    }
  ],
  IN1: [
    {
      sectionTitle: 'Policy intent',
      text: 'Utility infrastructure and connections must be designed into development from the outset and integrated with it, including connections to existing decentralised energy networks where feasible.'
    },
    {
      sectionTitle: 'Requirements',
      text: 'Applications for major development must include a utilities statement at the point of submission, setting out how the scheme connects to existing networks and, where a decentralised energy network is within a reasonable connection distance, how the scheme will connect to it.'
    },
    {
      sectionTitle: 'Reasoned justification',
      text: 'The infrastructure evidence identifies constrained capacity in parts of the network and a pattern of connections being retrofitted late in the development process, at greater cost and disruption. Utility providers welcomed earlier engagement, while developers asked for clarity on what "designed in from the outset" means in practice at each application stage.'
    }
  ],
  IN2: [
    {
      sectionTitle: 'Policy intent',
      text: 'Development must demonstrate that sufficient infrastructure capacity exists, or will be provided in step with the development it serves.'
    },
    {
      sectionTitle: 'Requirements',
      text: 'Where capacity evidence shows a constraint relevant to the development, the applicant must set out how and when the necessary capacity will be delivered, and phasing conditions may be used to align occupation with that delivery.'
    },
    {
      sectionTitle: 'Reasoned justification',
      text: 'Capacity assessments show headroom varies sharply across the area, with the tightest constraints where the most growth is planned. Consultation showed support in principle, with requests for the capacity evidence to be published and kept current so applicants can rely on it.'
    }
  ],
  DE1: [
    {
      sectionTitle: 'Policy intent',
      text: 'A retrofit-first approach is required, with options for retention and retrofit explored before redevelopment, and whole life-cycle carbon emissions assessed and minimised on major development.'
    },
    {
      sectionTitle: 'Requirements',
      text: 'Applications for major development involving demolition must include a retrofit options appraisal and a whole life-cycle carbon assessment, both submitted alongside the planning application rather than as a later condition.'
    },
    {
      sectionTitle: 'Reasoned justification',
      text: 'Whole life-cycle carbon assessments show retention and retrofit outperforming redevelopment in most of the cases sampled, though viability varies with building type and condition. Environmental groups gave strong support in consultation, while some developers argued the assessment requirement should be proportionate to scheme size.'
    }
  ],
  VT1: [
    {
      sectionTitle: 'Policy intent',
      text: 'Development must assess and mitigate its transport impacts, with particular regard to pedestrian comfort, servicing and the capacity of the surrounding network.'
    },
    {
      sectionTitle: 'Requirements',
      text: 'Major development must submit a transport assessment addressing pedestrian comfort at peak times on the surrounding network and a servicing management plan where the development generates regular deliveries.'
    },
    {
      sectionTitle: 'Reasoned justification',
      text: 'Transport evidence shows pedestrian comfort levels already under strain at peak times on several key routes, and identifies servicing as a growing source of conflict. Transport bodies supported the approach, while businesses raised concerns about servicing restrictions and asked for consolidation to be encouraged rather than required.'
    }
  ],
  HE1: [
    {
      sectionTitle: 'Policy intent',
      text: 'A positive strategy for the historic environment is set out, supporting changes of use consistent with long-term conservation and paying particular attention to historic routes, spaces and roofscapes.'
    },
    {
      sectionTitle: 'Requirements',
      text: 'Applications affecting a conservation area or a designated heritage asset must include a heritage statement assessing the significance of the asset and the effect of the proposal on historic routes, spaces and roofscapes, not just the building itself.'
    },
    {
      sectionTitle: 'Reasoned justification',
      text: 'The conservation evidence identifies constraints on the scale and design of new development in and around conservation areas, and highlights historic routes as an under-protected asset. Amenity societies welcomed the emphasis on routes and roofscapes, while developers sought clarity on how the policy interacts with the tall buildings policy.'
    }
  ],
  OS1: [
    {
      sectionTitle: 'Policy intent',
      text: 'Existing open space is protected, and new provision or improvement is required where development would increase pressure on it, with green infrastructure treated as a network rather than isolated sites.'
    },
    {
      sectionTitle: 'Requirements',
      text: 'Development that would result in a net increase in population must demonstrate how it contributes to meeting the local open space standard, either on site or through a financial contribution to improving open space within the network it falls within.'
    },
    {
      sectionTitle: 'Reasoned justification',
      text: 'The open space assessment finds provision well below the local standard in the most densely developed areas, with the greatest deficiency where the most growth is planned. Consultation showed widespread support for stronger protection, with several respondents asking for the green infrastructure network to be mapped in the plan rather than described.'
    }
  ],
  CR1: [
    {
      sectionTitle: 'Policy intent',
      text: 'Development must reduce overheating risk and avoid adding to the urban heat island effect, following the cooling hierarchy and prioritising passive measures.'
    },
    {
      sectionTitle: 'Requirements',
      text: 'Major development must demonstrate, through an overheating assessment, that passive design measures have been exhausted before active cooling is relied upon, in line with the cooling hierarchy set out in the supporting text.'
    },
    {
      sectionTitle: 'Reasoned justification',
      text: 'Climate risk modelling projects a marked increase in days exceeding overheating thresholds, with the effect most pronounced in the densest, least vegetated areas. Consultation showed support for the cooling hierarchy, though some respondents wanted mechanical cooling ruled out more firmly while others warned this would be unworkable for some building types.'
    }
  ]
}

// Every other policy falls back to its existing one-line summary as a single paragraph, so
// the whole plan stays navigable even though most policies don't have authored paragraph text.
function getParagraphsForPolicy (policy) {
  const authored = POLICY_PARAGRAPHS[policy.ref]
  if (authored) return authored

  return [{ sectionTitle: 'Policy summary', text: policy.summary }]
}

// Illustrative NPPF and London Plan (Spatial Development Strategy) references, in the same
// shape as EVIDENCE_EXCERPTS (see evidence-excerpts.js) so both can be handled the same way
// when building a paragraph's related resources. Authored only for the 12 full-summary
// policies, for the same reason as POLICY_PARAGRAPHS above.
//
// NPPF entries cite the restructured NPPF, which replaced the old version's continuously
// numbered paragraphs with named policies (e.g. "Policy DP3"), each numbered from 1 — matching
// how the London Plan entries alongside them already cite "Policy E1" rather than a paragraph
// number. See evidence-excerpts.js for the same convention applied to its own NPPF entries.
const NATIONAL_POLICY_REFERENCES = [
  {
    text: 'To create well-designed places, development proposals should include spaces that are safe, secure, inclusive and accessible for all ages and abilities.',
    source: 'NPPF',
    ref: 'Policy DP3',
    policyRefs: ['HL1']
  },
  {
    text: 'The development plan should set out policies to address the housing needs of different groups in the community, including through affordable housing requirements and specialist types of accommodation.',
    source: 'NPPF',
    ref: 'Policy HO5',
    policyRefs: ['HS1']
  },
  {
    text: 'Boroughs should protect and intensify the use of land for industrial, storage, distribution, and other business, including modern and flexible office space.',
    source: 'London Plan (Spatial Development Strategy)',
    ref: 'Policy E1',
    policyRefs: ['OF1']
  },
  {
    text: 'Development plans should set out a hierarchy of centres and support the long-term vitality and viability of town centres, including the scope to accommodate additional floorspace and a broader mix of uses.',
    source: 'NPPF',
    ref: 'Policy TC1',
    policyRefs: ['RE1']
  },
  {
    text: 'Development Plans should support the provision of cultural facilities that reflect the diverse needs of communities, and resist their loss other than in exceptional circumstances.',
    source: 'London Plan (Spatial Development Strategy)',
    ref: 'Policy HC5',
    policyRefs: ['CV1']
  },
  {
    text: 'The development plan should make provision for development required for new or enhanced renewable and low carbon energy, electricity network infrastructure, water supply, drainage and wastewater infrastructure.',
    source: 'NPPF',
    ref: 'Policy W1',
    policyRefs: ['IN1', 'IN2']
  },
  {
    text: 'Development proposals should generally be supported where the infrastructure needed to support them is either in place or capable of being provided in a timely manner.',
    source: 'London Plan (Spatial Development Strategy)',
    ref: 'Policy T1',
    policyRefs: ['IN2']
  },
  {
    text: 'A net zero-carbon approach should be taken, reflecting the mayoral energy hierarchy, prioritising reductions in energy demand ahead of low or zero carbon energy supply.',
    source: 'London Plan (Spatial Development Strategy)',
    ref: 'Policy SI2',
    policyRefs: ['DE1']
  },
  {
    text: 'Applications should demonstrate whether retention and refurbishment of existing buildings has been considered, and reasons for the approach taken should be set out.',
    source: 'London Plan (Spatial Development Strategy)',
    ref: 'Policy D3',
    policyRefs: ['DE1']
  },
  {
    text: 'Transport considerations should be integral to the design of development, giving priority first to walking, wheeling and cycle movements, and second to facilitating easy access to high quality public transport.',
    source: 'NPPF',
    ref: 'Policy TR4',
    policyRefs: ['VT1']
  },
  {
    text: 'When considering the potential effect of a development proposal on the significance of a designated heritage asset, substantial weight should be given to the asset’s conservation, irrespective of whether the effect amounts to harm or a positive effect.',
    source: 'NPPF',
    ref: 'Policy HE6',
    policyRefs: ['HE1']
  },
  {
    text: 'Development plans should identify wider opportunities to promote good health and support social interaction, and should attach considerable importance to community facilities and recreational land.',
    source: 'NPPF',
    ref: 'Policy HC1',
    policyRefs: ['OS1']
  },
  {
    text: 'Major development proposals should demonstrate how the design and layout minimise adverse impacts on the local microclimate, including overheating and the urban heat island effect.',
    source: 'London Plan (Spatial Development Strategy)',
    ref: 'Policy SI4',
    policyRefs: ['CR1']
  }
]

// Evidence and NPPF/SDS lists given item by item for a policy, in place of the ones
// buildRelatedResources derives from evidence-excerpts.js and NATIONAL_POLICY_REFERENCES.
// Only an item with `text` opens in the resource viewer; the rest are listed by name.
//
// `representations` lists individual representations in the consultations prototype's format
// (consultee, respondent type, a summary, and Support/Objection/Neutral), in place of the
// theme groups derived from policies.js. Consultees are the ones in consultation-responses.js.
const POLICY_RESOURCES = {
  S3: {
    evidence: [
      {
        title: 'Strategic Housing Market Assessment',
        ref: 'Paragraph 2.3',
        text: 'Although local planning authorities in London are not required to undertake individual housing needs assessments, the City Corporation has assessed the level of need using the national standard methodology to provide a context for the London Plan targets. The national standard method of calculation of need is updated annually once affordability ratios are released by the government. Through this current method the target for the City of London has been assessed as 102 new homes annually. This figure is lower than the London Plan target of 146, so the target for the City of London is set at 146 annually until further review by the GLA or DLUHC, which may amend it.',
        officerComment: 'The London Plan annual target expires in 2028/29, we will use the Standard Method derived Local Housing Need figures for 2029/30 onwards.'
      },
      { title: 'Strategic Housing Land Availability Assessment', ref: 'Paragraph 4.6' },
      { title: 'Housing Topic Paper', ref: 'Paragraph 3.2' },
      { title: 'Gypsy and Traveller Accommodation Needs Assessment', ref: 'Paragraph 5.1' },
      { title: 'Viability Study', ref: 'Paragraph 6.4' }
    ],
    representations: [
      { id: 'REP-1063', consultee: 'Greater London Authority', type: 'Statutory consultee', commentType: 'Support', summary: 'Supports the 1,706 home target as consistent with the London Plan, and the 35% threshold approach with 50% on public sector land.' },
      { id: 'REP-1071', consultee: 'Berkeley Group', type: 'Developer', commentType: 'Objection', summary: 'The 35% on-site affordable housing requirement will make schemes on small, constrained City sites unviable. Asks for off-site provision and payments in lieu to be accepted more readily.' },
      { id: 'REP-1078', consultee: 'Golden Lane Estate Residents Association', type: 'Community organisation', commentType: 'Support', summary: 'Welcomes the protection of existing housing and the priority given to social rented homes, but wants a firmer commitment to delivering them inside the City rather than elsewhere.' },
      { id: 'REP-1084', consultee: 'City Property Forum', type: 'Developer', commentType: 'Objection', summary: 'Housing in or near residential areas risks prejudicing office development in the City Cluster. Policy OF2 should take precedence where the two conflict.' },
      { id: 'REP-1092', consultee: 'Barbican Association', type: 'Community organisation', commentType: 'Neutral', summary: 'Asks how the policy will protect residential amenity where co-living, hostels and build to rent are prioritised within identified residential areas.' },
      { id: 'REP-1097', consultee: 'Civic Planning Ltd', type: 'Planning consultant', commentType: 'Objection', summary: 'Publishing viability assessments in full and applying an upwards only review mechanism will deter investment. Asks for commercially sensitive information to be redacted.' },
      { id: 'REP-1103', consultee: 'Jane Smith', type: 'Member of the public', commentType: 'Support', summary: 'Supports more affordable housing so that key workers can live near their jobs in the City.' },
      { id: 'REP-1110', consultee: 'Ludgate Planning LLP', type: 'Planning consultant', commentType: 'Neutral', summary: 'Asks for clarity on how the 10% wheelchair user dwellings requirement applies to conversions of existing buildings.' }
    ],
    nationalPolicy: [
      { title: 'Increasing Housing Supply', ref: 'SDS Policy H1' },
      { title: 'Delivering affordable housing', ref: 'SDS Policy H4' },
      { title: 'Threshold approach to major applications', ref: 'SDS Policy H5' },
      { title: 'Assessing the need for homes', ref: 'NPPF Policy HO1' },
      { title: 'Setting requirement figures for homes', ref: 'NPPF Policy HO2' },
      { title: 'Providing land for homes', ref: 'NPPF Policy HO3' }
    ]
  }
}

module.exports = {
  POLICY_TEXT,
  POLICY_PARAGRAPHS,
  POLICY_RESOURCES,
  getParagraphsForPolicy,
  NATIONAL_POLICY_REFERENCES
}
