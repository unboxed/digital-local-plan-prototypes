// Static content for the Public view prototypes (/public-view), seen by members of the public
// rather than LPA staff. Southampton is the example authority. The dates, chapters, areas and
// postcodes are invented for the prototype and are not taken from Southampton's real local plan.
// Nothing here is stored in session data.

const AUTHORITY = 'Southampton City Council'

// The plan-making milestones, in order, as a member of the public reads them. `codes` are the
// plan-event codes behind each one (EVENT_TYPES in project-management.js; the optional
// consultations have no event type there yet). Consultation names are the new system's, never
// "Regulation 18/19" — see CLAUDE.md. `status` is one of completed | current | upcoming | optional.
const SOUTHAMPTON_MILESTONES = [
  {
    key: 'notice',
    codes: ['publish-notice-intention-commence'],
    title: 'Notice of intention to start',
    description: 'We told people we were starting work on a new local plan.',
    date: '2026-01-19',
    status: 'completed'
  },
  {
    key: 'scoping',
    codes: ['scoping-consultation-start', 'scoping-consultation-end'],
    title: 'Scoping consultation',
    description: 'We asked what the plan should cover and what matters most to you.',
    date: '2026-03-02',
    endDate: '2026-04-13',
    status: 'completed'
  },
  {
    key: 'gateway-1',
    codes: ['gateway-1-self-assessment'],
    title: 'Gateway 1 self-assessment',
    description: 'We checked we were ready and published a summary. This started the 30-month plan-making period.',
    date: '2026-06-15',
    status: 'completed'
  },
  {
    key: 'plan-content',
    codes: ['plan-content-consultation-start', 'plan-content-consultation-end'],
    title: 'Consultation on the proposed plan content and evidence',
    description: 'We are asking for your views on our draft vision, where development should go, and the evidence behind it.',
    date: '2026-10-05',
    endDate: '2026-11-16',
    status: 'current'
  },
  {
    key: 'gateway-2',
    codes: ['gateway-2-advice-sought'],
    title: 'Gateway 2 assessment',
    description: 'We ask the Planning Inspectorate for advice on our progress.',
    date: '2027-03-01',
    precision: 'month',
    status: 'upcoming'
  },
  {
    key: 'proposed-plan',
    codes: ['proposed-plan-consultation-start', 'proposed-plan-consultation-end'],
    title: 'Consultation on the proposed local plan',
    description: 'You can comment on the near-final plan for at least 8 weeks.',
    date: '2027-06-01',
    endDate: '2027-08-01',
    precision: 'month',
    status: 'upcoming'
  },
  {
    key: 'gateway-3',
    codes: ['gateway-3-advice-sought'],
    title: 'Gateway 3 assessment',
    description: 'The Planning Inspectorate advises whether the plan is ready for examination.',
    date: '2027-10-01',
    precision: 'month',
    status: 'upcoming'
  },
  {
    key: 'examination',
    codes: ['examination-submitted'],
    title: 'Submission for examination',
    description: 'We send the plan and its evidence to an independent inspector to examine.',
    date: '2027-12-01',
    precision: 'month',
    status: 'upcoming'
  },
  {
    key: 'adopted',
    codes: ['adopted'],
    title: 'Plan adoption',
    description: 'The council formally adopts the plan. It is then used to decide planning applications.',
    date: '2028-11-01',
    precision: 'month',
    status: 'upcoming'
  },
  {
    key: 'additional',
    codes: [],
    title: 'Extra consultations',
    description: 'We may hold more consultations if we need to. We will add the dates here if we do.',
    status: 'optional'
  }
]

// The milestone shown in the call to action box.
function getCurrentMilestone () {
  return SOUTHAMPTON_MILESTONES.find(milestone => milestone.status === 'current')
}

// The adopted plan. `areas` are PLAN_AREAS keys; 'all' means the chapter applies everywhere, so
// it is suggested for any place searched.
const ADOPTED_PLAN = {
  title: 'Southampton Local Plan 2025 to 2042',
  adopted: '2025-11-14',
  chapters: [
    { number: 1, slug: 'introduction', title: 'Introduction and how to use this plan', summary: 'What the plan is for, how it fits with national policy and how decisions are made using it.', keywords: ['introduction', 'how to use', 'national policy', 'decisions', 'planning applications'], areas: ['all'] },
    { number: 2, slug: 'vision', title: 'Vision and spatial strategy', summary: 'Our vision for Southampton in 2042 and where new homes, jobs and services will go.', keywords: ['vision', 'strategy', 'growth', 'where development goes', 'spatial strategy'], areas: ['all'] },
    { number: 3, slug: 'homes', title: 'Homes', summary: 'How many homes we need, affordable housing, family homes, student housing and houses in multiple occupation.', keywords: ['housing', 'homes', 'affordable housing', 'HMO', 'houses in multiple occupation', 'student accommodation', 'flats', 'extensions'], areas: ['all'] },
    { number: 4, slug: 'city-centre', title: 'City centre', summary: 'Shops, offices, culture and new homes in the city centre, including the Old Town and Bargate.', keywords: ['city centre', 'shops', 'retail', 'Bargate', 'Old Town', 'nightlife', 'culture'], areas: ['city-centre'] },
    { number: 5, slug: 'economy', title: 'Economy and jobs', summary: 'Protecting employment land, supporting new businesses and skills.', keywords: ['jobs', 'economy', 'employment', 'business', 'offices', 'industry', 'skills'], areas: ['all'] },
    { number: 6, slug: 'port-waterfront', title: 'Port and waterfront', summary: 'Supporting the port and opening up the waterfront to people.', keywords: ['port', 'docks', 'waterfront', 'cruise', 'marine', 'Itchen', 'Test'], areas: ['port', 'itchen-waterfront', 'city-centre'] },
    { number: 7, slug: 'design-heritage', title: 'Design, tall buildings and heritage', summary: 'Good design, where tall buildings can go, and protecting listed buildings, the city walls and conservation areas.', keywords: ['design', 'tall buildings', 'heritage', 'listed buildings', 'conservation areas', 'city walls', 'character'], areas: ['all'] },
    { number: 8, slug: 'green-spaces', title: 'Green spaces, nature and the Common', summary: 'Parks, trees and wildlife, including Southampton Common and biodiversity net gain.', keywords: ['parks', 'green space', 'trees', 'nature', 'wildlife', 'biodiversity', 'Common', 'open space'], areas: ['common', 'shirley', 'bitterne'] },
    { number: 9, slug: 'climate-flooding', title: 'Climate change and flooding', summary: 'Reducing carbon, energy-efficient buildings and managing flood risk from the sea and rivers.', keywords: ['climate change', 'flooding', 'flood risk', 'carbon', 'energy', 'net zero', 'sea level', 'drainage'], areas: ['all'] },
    { number: 10, slug: 'transport', title: 'Transport and travel', summary: 'Walking, cycling, buses, parking and air quality.', keywords: ['transport', 'traffic', 'parking', 'cycling', 'walking', 'buses', 'air quality', 'roads'], areas: ['all'] },
    { number: 11, slug: 'centres', title: 'Town, district and local centres', summary: 'Keeping Shirley, Bitterne, Portswood and other local centres lively and useful.', keywords: ['local centres', 'high street', 'Shirley', 'Bitterne', 'Portswood', 'shops', 'cafes'], areas: ['shirley', 'bitterne'] },
    { number: 12, slug: 'communities', title: 'Health, communities and facilities', summary: 'Schools, health centres, community buildings and places to meet.', keywords: ['schools', 'health', 'GP', 'community', 'facilities', 'libraries', 'sport'], areas: ['all'] },
    { number: 13, slug: 'site-allocations', title: 'Site allocations', summary: 'The specific sites where we expect new homes, jobs or other development.', keywords: ['sites', 'site allocations', 'development sites', 'brownfield', 'regeneration'], areas: ['city-centre', 'itchen-waterfront', 'port', 'bitterne'] },
    { number: 14, slug: 'infrastructure', title: 'Infrastructure and delivery', summary: 'How we will pay for and deliver roads, schools and services, and how we will monitor the plan.', keywords: ['infrastructure', 'CIL', 'developer contributions', 'section 106', 'delivery', 'monitoring'], areas: ['all'] }
  ]
}

// The chapters most people look for, shown as the homepage's "Popular" links.
const POPULAR_CHAPTERS = ['homes', 'city-centre', 'green-spaces', 'design-heritage', 'climate-flooding', 'transport']

// Rough areas of the city, as GeoJSON polygons in [longitude, latitude]. Drawn for the
// prototype, not real policy boundaries.
const PLAN_AREAS = [
  { key: 'city-centre', name: 'City centre', polygon: [[-1.412, 50.897], [-1.395, 50.897], [-1.395, 50.912], [-1.412, 50.912]] },
  { key: 'port', name: 'Western Docks and port', polygon: [[-1.452, 50.894], [-1.413, 50.894], [-1.413, 50.906], [-1.440, 50.910], [-1.452, 50.905]] },
  { key: 'itchen-waterfront', name: 'Itchen waterfront', polygon: [[-1.394, 50.893], [-1.378, 50.893], [-1.376, 50.912], [-1.394, 50.912]] },
  { key: 'common', name: 'Southampton Common', polygon: [[-1.418, 50.918], [-1.401, 50.918], [-1.400, 50.933], [-1.417, 50.934]] },
  { key: 'shirley', name: 'Shirley', polygon: [[-1.446, 50.914], [-1.422, 50.914], [-1.421, 50.930], [-1.445, 50.931]] },
  { key: 'bitterne', name: 'Bitterne', polygon: [[-1.375, 50.909], [-1.345, 50.909], [-1.344, 50.926], [-1.374, 50.926]] }
]

const CITY_CENTRE = { lat: 50.909, lng: -1.404, zoom: 13 }

// Layers the public can turn on over a place's map, after planning.data.gov.uk's map. Grouped
// like its layer list; each has a colour and a dash pattern so colour isn't the only difference.
// The shapes are rough and invented for the prototype (the listed buildings are real, their
// positions approximate). `chapter` links a layer to the chapter that governs it. Points are
// [lng, lat], like the polygons.
const MAP_LAYERS = [
  {
    key: 'plan-areas',
    group: 'Local plan',
    name: 'Local plan areas',
    description: 'Parts of the city with their own policies',
    colour: '#505a5f',
    dash: '4 4',
    chapter: 'vision',
    features: PLAN_AREAS.map(area => ({ name: area.name, polygon: area.polygon }))
  },
  {
    key: 'site-allocations',
    group: 'Local plan',
    name: 'Site allocations',
    description: 'Sites set aside for new homes, jobs or other development',
    colour: '#4c2c92',
    chapter: 'site-allocations',
    features: [
      { name: 'SA1 Bargate Quarter', detail: 'About 400 homes, shops and public space', polygon: [[-1.4045, 50.9030], [-1.4010, 50.9030], [-1.4010, 50.9055], [-1.4045, 50.9055]] },
      { name: 'SA2 West Quay Road', detail: 'About 650 homes and leisure', polygon: [[-1.4135, 50.9045], [-1.4095, 50.9045], [-1.4095, 50.9075], [-1.4135, 50.9075]] },
      { name: 'SA3 Station Quarter', detail: 'Offices, homes and a new station square', polygon: [[-1.4160, 50.9065], [-1.4120, 50.9065], [-1.4120, 50.9095], [-1.4160, 50.9095]] },
      { name: 'SA4 Chapel Riverside', detail: 'About 300 homes and a riverside walk', polygon: [[-1.3935, 50.9020], [-1.3900, 50.9020], [-1.3900, 50.9060], [-1.3935, 50.9060]] },
      { name: 'SA5 Woolston Riverside', detail: 'About 250 homes and marine employment', polygon: [[-1.3850, 50.8960], [-1.3800, 50.8960], [-1.3800, 50.8995], [-1.3850, 50.8995]] },
      { name: 'SA6 Bitterne Precinct', detail: 'Mixed use renewal of the district centre', polygon: [[-1.3640, 50.9150], [-1.3590, 50.9150], [-1.3590, 50.9180], [-1.3640, 50.9180]] }
    ]
  },
  {
    key: 'tall-buildings',
    group: 'Local plan',
    name: 'Tall buildings zone',
    description: 'Where buildings taller than the surroundings may be allowed',
    colour: '#f47738',
    dash: '8 4',
    chapter: 'design-heritage',
    features: [
      { name: 'City centre tall buildings zone', polygon: [[-1.4140, 50.9010], [-1.3990, 50.9010], [-1.3990, 50.9100], [-1.4140, 50.9100]] }
    ]
  },
  {
    key: 'local-centres',
    group: 'Local plan',
    name: 'Town, district and local centres',
    description: 'High streets and shopping parades',
    colour: '#d53880',
    chapter: 'centres',
    features: [
      { name: 'Shirley town centre', point: [-1.4300, 50.9222] },
      { name: 'Bitterne district centre', point: [-1.3615, 50.9165] },
      { name: 'Portswood district centre', point: [-1.3940, 50.9245] },
      { name: 'Woolston district centre', point: [-1.3790, 50.8985] },
      { name: 'Lordshill district centre', point: [-1.4560, 50.9375] },
      { name: 'Swaythling local centre', point: [-1.3870, 50.9370] }
    ]
  },
  {
    key: 'conservation-areas',
    group: 'Heritage',
    name: 'Conservation areas',
    description: 'Areas of special historic or architectural interest',
    colour: '#b58840',
    chapter: 'design-heritage',
    features: [
      { name: 'Old Town conservation area', polygon: [[-1.4085, 50.8955], [-1.4005, 50.8955], [-1.4005, 50.9045], [-1.4085, 50.9045]] },
      { name: 'Oxford Street conservation area', polygon: [[-1.4015, 50.8975], [-1.3975, 50.8975], [-1.3975, 50.9005], [-1.4015, 50.9005]] },
      { name: 'Banister Park conservation area', polygon: [[-1.4120, 50.9140], [-1.4050, 50.9140], [-1.4050, 50.9190], [-1.4120, 50.9190]] },
      { name: 'Portswood Residents\' Gardens conservation area', polygon: [[-1.3960, 50.9200], [-1.3900, 50.9200], [-1.3900, 50.9250], [-1.3960, 50.9250]] }
    ]
  },
  {
    key: 'listed-buildings',
    group: 'Heritage',
    name: 'Listed buildings',
    description: 'Buildings of national importance',
    colour: '#801650',
    chapter: 'design-heritage',
    features: [
      { name: 'Bargate', detail: 'Grade I', point: [-1.4040, 50.9036] },
      { name: 'Tudor House', detail: 'Grade I', point: [-1.4060, 50.8986] },
      { name: 'God\'s House Tower', detail: 'Grade I', point: [-1.4027, 50.8960] },
      { name: 'St Michael\'s Church', detail: 'Grade I', point: [-1.4050, 50.8988] },
      { name: 'Medieval Merchant\'s House', detail: 'Grade I', point: [-1.4045, 50.8972] },
      { name: 'Civic Centre', detail: 'Grade II*', point: [-1.4065, 50.9085] }
    ]
  },
  {
    key: 'green-spaces',
    group: 'Environment',
    name: 'Protected green spaces',
    description: 'Parks and open spaces protected from development',
    colour: '#00703c',
    chapter: 'green-spaces',
    features: [
      { name: 'Southampton Common', polygon: [[-1.4170, 50.9200], [-1.4020, 50.9200], [-1.4010, 50.9320], [-1.4160, 50.9330]] },
      { name: 'Central Parks', polygon: [[-1.4050, 50.9060], [-1.3980, 50.9060], [-1.3970, 50.9120], [-1.4040, 50.9120]] },
      { name: 'Mayflower Park', polygon: [[-1.4120, 50.8985], [-1.4085, 50.8985], [-1.4085, 50.9000], [-1.4120, 50.9000]] },
      { name: 'Riverside Park', polygon: [[-1.3840, 50.9250], [-1.3780, 50.9250], [-1.3770, 50.9350], [-1.3830, 50.9360]] },
      { name: 'Peartree Green', polygon: [[-1.3850, 50.8990], [-1.3800, 50.8990], [-1.3800, 50.9030], [-1.3850, 50.9030]] }
    ]
  },
  {
    key: 'tree-preservation',
    group: 'Environment',
    name: 'Tree preservation orders',
    description: 'Trees you need permission to cut down or prune',
    colour: '#85994b',
    chapter: 'green-spaces',
    features: [
      { name: 'TPO 412: oaks on The Avenue', point: [-1.4110, 50.9240] },
      { name: 'TPO 388: beech group, Hill Lane', point: [-1.4180, 50.9150] },
      { name: 'TPO 297: cedar, Bitterne Road', point: [-1.3700, 50.9200] },
      { name: 'TPO 455: limes, Highfield Road', point: [-1.3950, 50.9300] },
      { name: 'TPO 301: pines, Shirley Road', point: [-1.4380, 50.9050] }
    ]
  },
  {
    key: 'flood-risk',
    group: 'Environment',
    name: 'Flood risk zones',
    description: 'Land at high risk of flooding from the sea or rivers',
    colour: '#1d70b8',
    dash: '2 4',
    chapter: 'climate-flooding',
    features: [
      { name: 'River Itchen, west bank', polygon: [[-1.3920, 50.8930], [-1.3860, 50.8930], [-1.3840, 50.9250], [-1.3890, 50.9250]] },
      { name: 'River Test and Western Docks', polygon: [[-1.4520, 50.8940], [-1.4130, 50.8940], [-1.4130, 50.8990], [-1.4520, 50.8990]] },
      { name: 'Ocean Village', polygon: [[-1.3980, 50.8930], [-1.3920, 50.8930], [-1.3920, 50.8980], [-1.3980, 50.8980]] }
    ]
  },
  {
    key: 'article-4',
    group: 'Planning permission',
    name: 'Article 4 directions',
    description: 'Where you need permission to turn a house into shared housing (an HMO)',
    colour: '#0b0c0c',
    dash: '10 4 2 4',
    chapter: 'homes',
    features: [
      { name: 'Houses in multiple occupation: Portswood, Highfield and Bevois', polygon: [[-1.4050, 50.9120], [-1.3850, 50.9120], [-1.3850, 50.9350], [-1.4050, 50.9350]] }
    ]
  }
]

// Ticked when a place's map opens.
const DEFAULT_MAP_LAYERS = ['plan-areas', 'site-allocations']

// A few postcodes for testing. Any other Southampton postcode (SO14 to SO19) finds the outward
// code below, and anything else isn't in Southampton.
const POSTCODES = {
  SO147DU: { lat: 50.9045, lng: -1.4035, area: 'city-centre' },
  SO151AG: { lat: 50.9010, lng: -1.4300, area: 'port' },
  SO157LP: { lat: 50.9225, lng: -1.4330, area: 'shirley' },
  SO171BJ: { lat: 50.9255, lng: -1.4085, area: 'common' },
  SO185AA: { lat: 50.9170, lng: -1.3600, area: 'bitterne' },
  SO199AA: { lat: 50.9010, lng: -1.3850, area: 'itchen-waterfront' }
}

const OUTWARD_CODES = {
  SO14: 'city-centre',
  SO15: 'shirley',
  SO16: 'shirley',
  SO17: 'common',
  SO18: 'bitterne',
  SO19: 'itchen-waterfront'
}

function getArea (key) {
  return PLAN_AREAS.find(area => area.key === key)
}

function getChapter (slug) {
  return ADOPTED_PLAN.chapters.find(chapter => chapter.slug === slug)
}

function areaCentre (area) {
  const lngs = area.polygon.map(point => point[0])
  const lats = area.polygon.map(point => point[1])
  return {
    lat: (Math.min(...lats) + Math.max(...lats)) / 2,
    lng: (Math.min(...lngs) + Math.max(...lngs)) / 2
  }
}

// Returns { postcode, lat, lng, area } for a Southampton postcode, or { error } explaining why
// not. `postcode` is formatted with its space.
function lookupPostcode (input) {
  const compact = String(input || '').toUpperCase().replace(/\s+/g, '')
  if (!compact) return { error: 'Enter a postcode' }
  if (!/^[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}$/.test(compact)) {
    return { error: 'Enter a real postcode, like SO14 7DU' }
  }
  const postcode = compact.slice(0, -3) + ' ' + compact.slice(-3)
  const known = POSTCODES[compact]
  if (known) return { postcode, lat: known.lat, lng: known.lng, area: getArea(known.area) }
  const areaKey = OUTWARD_CODES[compact.slice(0, -3)]
  if (!areaKey) return { error: postcode + ' is not in Southampton. Enter a Southampton postcode, like SO14 7DU' }
  const area = getArea(areaKey)
  return { postcode, ...areaCentre(area), area }
}

// Chapters matching a search term: title or keyword matches first, then summary matches.
function searchChapters (query) {
  const words = String(query || '').toLowerCase().split(/\s+/).filter(word => word.length > 1)
  if (!words.length) return []
  return ADOPTED_PLAN.chapters
    .map(chapter => {
      const strong = (chapter.title + ' ' + chapter.keywords.join(' ')).toLowerCase()
      const weak = chapter.summary.toLowerCase()
      const score = words.reduce((total, word) => total + (strong.includes(word) ? 3 : weak.includes(word) ? 1 : 0), 0)
      return { chapter, score }
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score || a.chapter.number - b.chapter.number)
    .map(result => result.chapter)
}

// Chapters for one or more areas: those specific to the areas first, then the city-wide ones.
function chaptersForAreas (areaKeys) {
  const specific = ADOPTED_PLAN.chapters.filter(chapter => chapter.areas.some(key => areaKeys.includes(key)))
  const citywide = ADOPTED_PLAN.chapters.filter(chapter => chapter.areas.includes('all'))
  return { specific, citywide }
}

function bounds (points) {
  const lngs = points.map(point => point[0])
  const lats = points.map(point => point[1])
  return { west: Math.min(...lngs), east: Math.max(...lngs), south: Math.min(...lats), north: Math.max(...lats) }
}

// The areas a drawn shape overlaps. A bounding-box test is enough for a prototype; the same test
// runs in the browser for the map-led variant's live results (initPublicPlanMap).
function areasOverlapping (points) {
  const drawn = bounds(points)
  return PLAN_AREAS.filter(area => {
    const box = bounds(area.polygon)
    return box.west < drawn.east && box.east > drawn.west && box.south < drawn.north && box.north > drawn.south
  })
}

// How many of each layer's features fall in a place: its bounding box (`shapes`, a list of point
// lists) — the same overlap test as areasOverlapping. Shown beside each layer, so people know
// which are worth turning on.
function layerCountsFor (shapes) {
  const boxes = shapes.filter(shape => shape.length).map(bounds)
  function inPlace (feature) {
    const box = feature.point
      ? { west: feature.point[0], east: feature.point[0], south: feature.point[1], north: feature.point[1] }
      : bounds(feature.polygon)
    return boxes.some(place => box.west < place.east && box.east > place.west && box.south < place.north && box.north > place.south)
  }
  const counts = {}
  MAP_LAYERS.forEach(layer => { counts[layer.key] = layer.features.filter(inPlace).length })
  return counts
}

// Things people search for that the local plan doesn't cover, with where to go instead. Shown on
// the search results page (and offered in the suggestions) so a search for "noise" explains
// itself rather than just finding nothing. `terms` are matched as whole words; `plural` makes the
// heading read "aren't". The council pages are placeholders, not real links.
const NOT_COVERED = [
  {
    topic: 'Noise',
    terms: ['noise', 'noisy', 'loud music', 'barking'],
    explanation: 'The local plan can make sure new buildings are designed so noise is kept down, but it doesn\'t deal with noise from neighbours, businesses or events.',
    linkText: 'Report a noise problem'
  },
  {
    topic: 'Bins and recycling',
    plural: true,
    terms: ['bin', 'bins', 'recycling', 'rubbish', 'fly-tipping', 'fly tipping', 'litter'],
    explanation: 'The local plan doesn\'t cover bin collections, recycling or litter.',
    linkText: 'Bins, recycling and street cleaning'
  },
  {
    topic: 'Parking permits',
    plural: true,
    terms: ['parking permit', 'parking permits', 'parking fine', 'parking ticket', 'residents parking'],
    explanation: 'The local plan sets parking standards for new developments, but it doesn\'t cover parking permits, fines or on-street parking.',
    linkText: 'Parking permits and fines'
  },
  {
    topic: 'Roads and potholes',
    plural: true,
    terms: ['pothole', 'potholes', 'street light', 'street lights', 'pavement', 'road repairs'],
    explanation: 'The local plan doesn\'t cover repairs to roads, pavements or street lights.',
    linkText: 'Report a problem with a road or pavement'
  },
  {
    topic: 'Building regulations',
    plural: true,
    terms: ['building regulations', 'building control', 'fire safety', 'dangerous building'],
    explanation: 'Building regulations make sure buildings are safe and energy efficient. They are separate from planning and the local plan.',
    linkText: 'Building control'
  },
  {
    topic: 'Licensing',
    terms: ['licence', 'license', 'licensing', 'alcohol', 'pub opening hours', 'taxi'],
    explanation: 'The local plan doesn\'t cover licences for pubs, alcohol, taxis or events.',
    linkText: 'Licensing'
  },
  {
    topic: 'Council tax',
    terms: ['council tax', 'business rates'],
    explanation: 'The local plan doesn\'t cover council tax or business rates.',
    linkText: 'Council tax'
  }
]

function findNotCovered (query) {
  const text = ' ' + String(query || '').toLowerCase().replace(/[^a-z0-9-]+/g, ' ').trim() + ' '
  return NOT_COVERED.find(item => item.terms.some(term => text.includes(' ' + term + ' ')))
}

// The suggestion list for initSuggestSearch. Topics (every chapter keyword, once) run a search
// and say how many chapters they're in; chapters open their page (`hrefFor`). initSuggestSearch
// lists terms starting with what was typed first, then Topics before chapters.
function searchTerms (hrefFor) {
  const topics = {}
  ADOPTED_PLAN.chapters.forEach(chapter => {
    chapter.keywords.forEach(keyword => {
      const key = keyword.toLowerCase()
      if (key === chapter.title.toLowerCase()) return
      topics[key] = topics[key] || { term: keyword.charAt(0).toUpperCase() + keyword.slice(1), chapters: 0 }
      topics[key].chapters++
    })
  })
  const topicTerms = Object.values(topics).map(topic => ({
    term: topic.term,
    kind: 'Topic',
    label: topic.chapters === 1 ? 'Topic' : 'Topic in ' + topic.chapters + ' chapters'
  }))
  const chapterTerms = ADOPTED_PLAN.chapters.map(chapter => ({
    term: chapter.title,
    kind: 'Chapter',
    label: 'Chapter ' + chapter.number,
    href: hrefFor(chapter)
  }))
  // Not covered topics are suggested too, so people find out before they search.
  const notCoveredTerms = NOT_COVERED.map(item => ({
    term: item.topic,
    kind: 'Not covered',
    label: 'Not in the local plan',
    search: item.topic + ' ' + item.terms.join(' ')
  }))
  return topicTerms.concat(chapterTerms, notCoveredTerms)
}

module.exports = {
  AUTHORITY,
  SOUTHAMPTON_MILESTONES,
  ADOPTED_PLAN,
  POPULAR_CHAPTERS,
  PLAN_AREAS,
  CITY_CENTRE,
  MAP_LAYERS,
  DEFAULT_MAP_LAYERS,
  layerCountsFor,
  getCurrentMilestone,
  getArea,
  getChapter,
  lookupPostcode,
  searchChapters,
  findNotCovered,
  chaptersForAreas,
  areasOverlapping,
  searchTerms
}
