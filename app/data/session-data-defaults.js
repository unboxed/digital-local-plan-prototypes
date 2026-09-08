module.exports = {

  evidenceItems: [
    {
      id: 'evidence-seed-1',
      type: 'passage',
      sourceType: 'document',
      text: 'Projected household growth over the next 15 years will place significant pressure on existing housing supply.',
      source: 'Local Housing Needs Assessment',
      chapter: 'Chapter 3: Housing need',
      tags: ['Need', 'Capacity'],
      customTags: [],
      policyAreas: ['Housing'],
      policyReference: 'H1'
    },
    {
      id: 'evidence-seed-2',
      type: 'note',
      sourceType: 'note',
      text: 'Officers raised concerns at the March infrastructure meeting that public transport capacity around the strategic growth areas may not keep pace with planned housing delivery.',
      source: 'Local Housing Needs Assessment',
      chapter: 'Chapter 3: Housing need',
      tags: ['Capacity'],
      customTags: ['Public transport'],
      policyAreas: ['Transport'],
      policyReference: 'T2'
    },
    {
      id: 'evidence-seed-3',
      type: 'note',
      sourceType: 'consultation-response',
      text: 'Residents raised concerns at the consultation event that planned growth will not be matched by sufficient infrastructure or local services.',
      source: 'Stakeholder feedback',
      chapter: '',
      tags: ['Need'],
      customTags: ['Community engagement'],
      policyAreas: ['Housing'],
      policyReference: 'H1'
    },
    {
      id: 'evidence-seed-4',
      type: 'passage',
      sourceType: 'document',
      text: 'In several parts of the borough, the evidence suggests that housing demand is concentrated in areas with stronger public transport links and better access to services.',
      source: 'Local Housing Needs Assessment',
      chapter: 'Chapter 3: Housing need',
      tags: ['Site Allocations'],
      customTags: [],
      policyAreas: ['Housing'],
      policyReference: 'H2'
    },
    {
      id: 'evidence-seed-5',
      type: 'passage',
      sourceType: 'document',
      text: 'Several conservation areas within the town centre place constraints on the scale and design of new development.',
      source: 'Heritage and Conservation Study',
      chapter: '',
      tags: ['Heritage', 'Conservation'],
      customTags: [],
      policyAreas: ['Heritage and Tall Buildings'],
      policyReference: 'HE1'
    },
    {
      id: 'evidence-seed-6',
      type: 'note',
      sourceType: 'note',
      text: 'The Green Belt boundary review meeting concluded that limited exceptional circumstances exist to justify releasing land at the western edge of the borough.',
      source: 'Green Belt Assessment',
      chapter: '',
      tags: ['Green Belt'],
      customTags: [],
      policyAreas: ['Open Spaces and Green Infrastructure'],
      policyReference: 'GB1'
    },
    {
      id: 'evidence-seed-7',
      type: 'note',
      sourceType: 'scoping-consultation-response',
      text: 'Early engagement respondents highlighted a need for additional flexible office space to support small business growth in the town centre.',
      source: 'Scoping Consultation 2024',
      chapter: '',
      tags: ['Need'],
      customTags: ['Office space'],
      policyAreas: ['Offices'],
      policyReference: 'EMP1'
    }
  ],

  // --- Policy writing prototype ---

  policyStartingPointItems: {
    'adopted-plan-chapters': [
      { id: 'apc-1', text: 'Strategic priorities' },
      { id: 'apc-2', text: 'Spatial strategies' },
      { id: 'apc-3', text: 'Health, Inclusion & Safety' },
      { id: 'apc-4', text: 'Housing' },
      { id: 'apc-5', text: 'Offices' },
      { id: 'apc-6', text: 'Retail' },
      { id: 'apc-7', text: 'Culture and visitors' },
      { id: 'apc-8', text: 'Infrastructure' },
      { id: 'apc-9', text: 'Design' },
      { id: 'apc-10', text: 'Transport' },
      { id: 'apc-11', text: 'Heritage and Tall buildings' },
      { id: 'apc-12', text: 'Open Spaces and Green Infrastructure' },
      { id: 'apc-13', text: 'Climate Resilience' },
      { id: 'apc-14', text: 'The Temple, the Thames Policy Area & the Key Areas of Change' },
      { id: 'apc-15', text: 'Implementation' }
    ],
    'existing-data-sources': [
      { id: 'eds-1', text: 'Housing Needs Assessment 2020-2040' },
      { id: 'eds-2', text: 'Strategic Flood Risk Assessment' },
      { id: 'eds-3', text: 'Employment Land Review' },
      { id: 'eds-4', text: 'Retail and Town Centres Study' }
    ],
    'current-trends': [
      { id: 'ct-1', text: 'Brownfield reuse strategy' },
      { id: 'ct-2', text: 'Declining school age population adaption' },
      { id: 'ct-3', text: 'London Green corridor' },
      { id: 'ct-4', text: 'New Thames crossings' }
    ],
    'scoping-consultation-themes': [
      { id: 'sct-1', text: 'Housing affordability' },
      { id: 'sct-2', text: 'Town centre vitality' },
      { id: 'sct-3', text: 'Climate adaptation' },
      { id: 'sct-4', text: 'Infrastructure capacity' }
    ],
    'political-priorities': [
      { id: 'pp-1', text: 'Delivering affordable housing' },
      { id: 'pp-2', text: 'Protecting green spaces' },
      { id: 'pp-3', text: 'Supporting local high streets' }
    ],
    'other-plans-policies-strategies': [
      { id: 'opps-1', text: 'London Plan 2021' },
      { id: 'opps-2', text: 'Local Transport Strategy' },
      { id: 'opps-3', text: 'Economic Growth Strategy 2030' }
    ],
    'nppf-sds-requirements': [
      { id: 'nsr-1', text: 'Central London Economic Opportunity Zone' },
      { id: 'nsr-2', text: 'Station density' },
      { id: 'nsr-3', text: 'Grey belt release' }
    ]
  },

  policyTopics: [
    {
      id: 'topic-1',
      name: 'Housing needs',
      assignedTo: 'Pauline Perrot',
      brief: 'We need to:\n- Meet housing needs as set out in the Strategic Housing Land Availability Assessment (SHLAA)\n- Ensure we comply with the changes to housing supply calculations in the new NPPF\n- Reassess our housing mix against London Plan goals, given the specific nature of the city’s current housing stock',
      desiredImpact: 'We intend to deliver homes that support our goals and grow our economy. Of particular concern is how we provide homes for the young people currently growing up within the key residential estates within the city.',
      sources: [
        { id: 'src-1', label: 'Housing (Adopted plan)' },
        { id: 'src-2', label: 'Housing Needs Assessment 2020-2040 (Existing data source)' },
        { id: 'src-3', label: 'Grey belt release (NPPF/SDS)' }
      ],
      examplePolicies: [
        { id: 'ep-1', label: 'Manchester - City centre homes - H2.1' },
        { id: 'ep-2', label: 'Tower Hamlets - Start homes policy - R11.2' }
      ],
      evidenceNotes: 'We have already a good basis of information as per standard requirements. This work is based on annual monitoring and 2024’s strategic reports.',
      linkedEvidence: [
        { id: 'le-1', label: 'SHLAA 2025' },
        { id: 'le-2', label: 'Brownfield register v2.0' },
        { id: 'le-3', label: 'Housing needs assessment study' }
      ],
      additionalEvidenceNeeds: 'Outstanding: Updated Strategic Flood Risk Assessment (SFRA) Stage 2 required for northern allocations.',
      chapterTitle: 'Spatial Strategy for Wollington',
      explanatoryText: 'The Spatial Strategy for Wollington sets a clear and co-ordinated approach to managing growth over the plan period (2029–2044).\n\nIt responds to the city’s unique challenges and opportunities—from addressing housing needs which includes acute housing affordability needs and infrastructure deficits to environmental protection and heritage conservation—and provides a framework for delivering high-quality, sustainable places.\n\nThe strategy makes sufficient provision of homes, employment, retail, infrastructure and community facilities by promoting development which will primarily be focused on the city centre, town, district and local centres and transport corridors and hubs.',
      policyBlocks: [
        {
          id: 'block-1',
          title: 'S1 Strategic Growth Areas',
          detail: 'A high proportion of housing and employment growth will be directed to the city’s most sustainable locations including:\n\n1. The City Centre – circa X homes, circa X employment\n2. Town and District Centres - circa X homes, circa X employment\n3. Transport corridors and hubs - circa X homes, circa X employment\n\nThese areas will be expected to accommodate a high level of mixed-use development, supported by existing and future infrastructure.'
        }
      ],
      policyHistory: [
        { id: 'ph-1', type: 'Comment', description: 'Reviewed and approved', status: 'Done', statusColour: 'green' },
        { id: 'ph-2', type: 'Discussion', description: 'Team alignment confirmed', status: 'Done', statusColour: 'green' },
        { id: 'ph-3', type: 'Note', description: 'Recorded for reference', status: 'Done', statusColour: 'green' },
        { id: 'ph-4', type: 'Note', description: 'Pending review', status: '', statusColour: '' }
      ],
      latestNote: {
        description: 'Draft housing policy section updated. Awaiting sign-off from planning team before publication.',
        timestamp: 'Updated 2 hours ago'
      }
    }
  ],

  policyWriterSources: [
    { id: 'pws-1', kind: 'policy', title: 'National Planning Policy - Para 85', snippet: 'Planning policies and decisions should help create the conditions in which businesses can invest, expand and adapt' },
    { id: 'pws-2', kind: 'policy', title: 'National Planning Policy - Para 86a', snippet: 'Sets out a clear economic vision and strategy which positively and proactively encourages sustainable economic growth' },
    { id: 'pws-3', kind: 'comment', title: 'Public aspiration for high street amenities', snippet: 'Businesses have requested prioritising of local warehousing and distribution needs' },
    { id: 'pws-4', kind: 'evidence', title: 'Housing Needs Assessment', snippet: 'Statistical analysis of housing demand 2020-2040' },
    { id: 'pws-5', kind: 'evidence', title: 'Site Allocation - Graveney estate', snippet: 'Proposed development sites and green belt boundaries' },
    { id: 'pws-6', kind: 'evidence', title: 'Transport Strategy - Sec 3.4', snippet: 'Connectivity and infrastructure planning report' }
  ]

}
