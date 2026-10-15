// GIS layers: one shared collection across the application.
//
// Layers are added from a (simulated) GIS connection in two places: the policy-writing
// prototype's "Add existing plan layers" starting point, and the "Add GIS layers" step of
// Managing commissioned evidence. Every layer carries a tag, Plan or Evidence, which can be
// switched wherever it is listed, and any layer can be added as a source in Policy drafting with
// starting points. The collection lives in session data as `gisLayers`, read only through
// getGisLayers in app/routes.js.
//
// The connection is simulated: nothing is requested from the endpoint the user enters. Any
// https URL "connects" and returns a catalogue (catalogueFor below):
// - COMPASS_LAYERS are REAL: the City of London's COMPASS map
//   (https://www.mapping.cityoflondon.gov.uk/geocortex/mapping/?viewer=compass), from its
//   "City Plan 2040 - Draft Policies", "Local Plan Supplementary Guidance", "Historic
//   Environment" and "Boundaries" folders. Names, groups, geometry types and the ArcGIS REST
//   addresses are as published; feature counts were read from each layer on 15 October 2026 and
//   are not kept up to date. Each layer's `url` is its live ArcGIS REST layer.
// - The 'evidence' catalogue is invented: a consultant's study data for commissioned evidence.

const GIS_SERVICE_TYPES = [
  { value: 'arcgis', text: 'ArcGIS REST service', hint: 'For example, https://…/arcgis/rest/services/PoliciesMap/MapServer' },
  { value: 'ogc-features', text: 'OGC API – Features', hint: 'For example, https://…/ogcapi/collections' },
  { value: 'wfs', text: 'Web Feature Service (WFS)', hint: 'For example, https://…/geoserver/wfs' }
]

const LAYER_TYPES = {
  plan: { value: 'plan', label: 'Plan layer', other: 'evidence' },
  evidence: { value: 'evidence', label: 'Evidence layer', other: 'plan' }
}

const COMPASS_SERVICES = 'https://www.mapping.cityoflondon.gov.uk/arcgis/rest/services'
const COMPASS_HOST = 'www.mapping.cityoflondon.gov.uk'

// In the COMPASS viewer's own folder order, and its layer order within each folder. Two layers
// are both called "Smoke Control Orders", in different folders, so lists show the group too.
const COMPASS_LAYERS = [
    { id: 'compass-draft-policy-4', name: "Fleet Street Valley - Tall Building Contours", group: "City Plan 2040 - Draft Policies", geometry: 'Line', features: 16, url: COMPASS_SERVICES + '/COMPASS_Planning_Draft_Policy/MapServer/4' },
    { id: 'compass-draft-policy-5', name: "Highways Hierarchy", group: "City Plan 2040 - Draft Policies", geometry: 'Line', features: 73, url: COMPASS_SERVICES + '/COMPASS_Planning_Draft_Policy/MapServer/5' },
    { id: 'compass-draft-policy-6', name: "Processional Route", group: "City Plan 2040 - Draft Policies", geometry: 'Line', features: 1, url: COMPASS_SERVICES + '/COMPASS_Planning_Draft_Policy/MapServer/6' },
    { id: 'compass-draft-policy-7', name: "Proposed Improvements to TfL Road Network", group: "City Plan 2040 - Draft Policies", geometry: 'Line', features: 2, url: COMPASS_SERVICES + '/COMPASS_Planning_Draft_Policy/MapServer/7' },
    { id: 'compass-draft-policy-8', name: "Proposed Walking Improvements", group: "City Plan 2040 - Draft Policies", geometry: 'Line', features: 5, url: COMPASS_SERVICES + '/COMPASS_Planning_Draft_Policy/MapServer/8' },
    { id: 'compass-draft-policy-9', name: "Riverside Walkway", group: "City Plan 2040 - Draft Policies", geometry: 'Line', features: 1, url: COMPASS_SERVICES + '/COMPASS_Planning_Draft_Policy/MapServer/9' },
    { id: 'compass-draft-policy-10', name: "Tower of London World Heritage Site", group: "City Plan 2040 - Draft Policies", geometry: 'Polygon', features: 1, url: COMPASS_SERVICES + '/COMPASS_Planning_Draft_Policy/MapServer/10' },
    { id: 'compass-draft-policy-12', name: "Fleet Street Valley - Tall Building Areas", group: "City Plan 2040 - Draft Policies", geometry: 'Polygon', features: 3, url: COMPASS_SERVICES + '/COMPASS_Planning_Draft_Policy/MapServer/12' },
    { id: 'compass-draft-policy-13', name: "Identified Residential Areas", group: "City Plan 2040 - Draft Policies", geometry: 'Polygon', features: 10, url: COMPASS_SERVICES + '/COMPASS_Planning_Draft_Policy/MapServer/13' },
    { id: 'compass-draft-policy-14', name: "Key Areas of Change", group: "City Plan 2040 - Draft Policies", geometry: 'Polygon', features: 7, url: COMPASS_SERVICES + '/COMPASS_Planning_Draft_Policy/MapServer/14' },
    { id: 'compass-draft-policy-15', name: "London Plan Legal Cluster", group: "City Plan 2040 - Draft Policies", geometry: 'Polygon', features: 1, url: COMPASS_SERVICES + '/COMPASS_Planning_Draft_Policy/MapServer/15' },
    { id: 'compass-draft-policy-16', name: "London View Management Framework - Protected Silhouettes", group: "City Plan 2040 - Draft Policies", geometry: 'Polygon', features: 3, url: COMPASS_SERVICES + '/COMPASS_Planning_Draft_Policy/MapServer/16' },
    { id: 'compass-draft-policy-17', name: "Principal Shopping Centres", group: "City Plan 2040 - Draft Policies", geometry: 'Polygon', features: 4, url: COMPASS_SERVICES + '/COMPASS_Planning_Draft_Policy/MapServer/17' },
    { id: 'compass-draft-policy-18', name: "Tall Buildings Policy Area", group: "City Plan 2040 - Draft Policies", geometry: 'Polygon', features: 3, url: COMPASS_SERVICES + '/COMPASS_Planning_Draft_Policy/MapServer/18' },
    { id: 'compass-draft-policy-21', name: "Immediate Setting of Bevis Marks Synagogue", group: "City Plan 2040 - Draft Policies", geometry: 'Polygon', features: 1, url: COMPASS_SERVICES + '/COMPASS_Planning_Draft_Policy/MapServer/21' },
    { id: 'compass-draft-policy-3', name: "Cycleways", group: "City Plan 2040 - Draft Policies", geometry: 'Line', features: 155, url: COMPASS_SERVICES + '/COMPASS_Planning_Draft_Policy/MapServer/3' },
    { id: 'compass-local-plan-supp-guidance-0', name: "Open Space Audit", group: "Local Plan Supplementary Guidance", geometry: 'Polygon', features: 575, url: COMPASS_SERVICES + '/COMPASS_Planning_Local_Plan_Supp_Guidance/MapServer/0' },
    { id: 'compass-local-plan-supp-guidance-1', name: "St Pauls Depth", group: "Local Plan Supplementary Guidance", geometry: 'Polygon', features: 7, url: COMPASS_SERVICES + '/COMPASS_Planning_Local_Plan_Supp_Guidance/MapServer/1' },
    { id: 'compass-local-plan-supp-guidance-2', name: "Protected Squares", group: "Local Plan Supplementary Guidance", geometry: 'Polygon', features: 3, url: COMPASS_SERVICES + '/COMPASS_Planning_Local_Plan_Supp_Guidance/MapServer/2' },
    { id: 'compass-local-plan-supp-guidance-3', name: "Smoke Control Orders", group: "Local Plan Supplementary Guidance", geometry: 'Polygon', features: 14, url: COMPASS_SERVICES + '/COMPASS_Planning_Local_Plan_Supp_Guidance/MapServer/3' },
    { id: 'compass-local-plan-supp-guidance-4', name: "Tall Buildings", group: "Local Plan Supplementary Guidance", geometry: 'Polygon', features: 98, url: COMPASS_SERVICES + '/COMPASS_Planning_Local_Plan_Supp_Guidance/MapServer/4' },
    { id: 'compass-local-plan-supp-guidance-5', name: "Barbican and Golden Lane Neighbourhood Area", group: "Local Plan Supplementary Guidance", geometry: 'Polygon', features: 1, url: COMPASS_SERVICES + '/COMPASS_Planning_Local_Plan_Supp_Guidance/MapServer/5' },
    { id: 'compass-historic-environment-0', name: "Protected Trees", group: "Historic Environment", geometry: 'Point', features: 34, url: COMPASS_SERVICES + '/COMPASS_Planning_Historic_Environment/MapServer/0' },
    { id: 'compass-historic-environment-4', name: "Listed Buildings", group: "Historic Environment", geometry: 'Polygon', features: 614, url: COMPASS_SERVICES + '/COMPASS_Planning_Historic_Environment/MapServer/4' },
    { id: 'compass-historic-environment-5', name: "Scheduled Ancient Monuments", group: "Historic Environment", geometry: 'Polygon', features: 50, url: COMPASS_SERVICES + '/COMPASS_Planning_Historic_Environment/MapServer/5' },
    { id: 'compass-historic-environment-2', name: "Conservation Areas", group: "Historic Environment", geometry: 'Polygon', features: 28, url: COMPASS_SERVICES + '/COMPASS_Planning_Historic_Environment/MapServer/2' },
    { id: 'compass-historic-environment-1', name: "Smoke Control Orders", group: "Historic Environment", geometry: 'Polygon', features: 14, url: COMPASS_SERVICES + '/COMPASS_Planning_Historic_Environment/MapServer/1' },
    { id: 'compass-historic-environment-3', name: "Historic Parks Gardens", group: "Historic Environment", geometry: 'Polygon', features: 5, url: COMPASS_SERVICES + '/COMPASS_Planning_Historic_Environment/MapServer/3' },
    { id: 'compass-historic-environment-6', name: "Tower of London WHS Local Setting Area", group: "Historic Environment", geometry: 'Polygon', features: 1, url: COMPASS_SERVICES + '/COMPASS_Planning_Historic_Environment/MapServer/6' },
    { id: 'compass-boundaryline-1', name: "City of London Ward Boundaries", group: "Boundaries", geometry: 'Polygon', features: 25, url: COMPASS_SERVICES + '/COMPASS_Boundaryline/MapServer/1' },
    { id: 'compass-boundaryline-2', name: "Wards outside London", group: "Boundaries", geometry: 'Polygon', features: 341, url: COMPASS_SERVICES + '/COMPASS_Boundaryline/MapServer/2' },
    { id: 'compass-boundaryline-3', name: "London Wards", group: "Boundaries", geometry: 'Polygon', features: 657, url: COMPASS_SERVICES + '/COMPASS_Boundaryline/MapServer/3' },
    { id: 'compass-boundaryline-5', name: "Parliament constituencies outside London", group: "Boundaries", geometry: 'Polygon', features: 25, url: COMPASS_SERVICES + '/COMPASS_Boundaryline/MapServer/5' },
    { id: 'compass-boundaryline-6', name: "Parliamentary Constituencies GL", group: "Boundaries", geometry: 'Polygon', features: 73, url: COMPASS_SERVICES + '/COMPASS_Boundaryline/MapServer/6' },
    { id: 'compass-boundaryline-7', name: "Local Authorities", group: "Boundaries", geometry: 'Polygon', features: 363, url: COMPASS_SERVICES + '/COMPASS_Boundaryline/MapServer/7' },
    { id: 'compass-boundaryline-8', name: "Greater London", group: "Boundaries", geometry: 'Polygon', features: 1, url: COMPASS_SERVICES + '/COMPASS_Boundaryline/MapServer/8' }
]

const COMPASS_GROUPS = ['City Plan 2040 - Draft Policies', 'Local Plan Supplementary Guidance', 'Historic Environment', 'Boundaries']

// What a connection returns. Ids are unique across catalogues, because a layer is stored once in
// the shared collection, keyed by its id.
const CATALOGUES = {
  compass: COMPASS_LAYERS,
  // A consultant's study data: what the commissioned evidence step offers by default. Invented.
  evidence: [
    { id: 'housing-completions', name: 'Housing completions 2020–2025', group: 'Housing delivery assessment', geometry: 'Point', features: 148 },
    { id: 'housing-capacity-sites', name: 'Housing capacity sites', group: 'Housing delivery assessment', geometry: 'Polygon', features: 36 },
    { id: 'infrastructure-capacity', name: 'Infrastructure capacity areas', group: 'Housing delivery assessment', geometry: 'Polygon', features: 9 },
    { id: 'surface-water-flood-risk', name: 'Surface water flood risk', group: 'Housing delivery assessment', geometry: 'Polygon', features: 212 },
    { id: 'air-quality-focus-areas', name: 'Air quality focus areas', group: 'Housing delivery assessment', geometry: 'Polygon', features: 6 }
  ]
}

// Which catalogue a connection returns: COMPASS for any address on the City's mapping server,
// otherwise the place's own default (COMPASS for the starting points, the consultant's data for
// commissioned evidence).
function catalogueFor (connection, fallback) {
  if (!connection) return fallback
  try {
    if (new URL(connection.endpoint).host === COMPASS_HOST) return 'compass'
  } catch (error) {}
  return fallback
}

const ALL_CATALOGUE_LAYERS = CATALOGUES.compass.concat(CATALOGUES.evidence)

function getGisServiceType (value) {
  return GIS_SERVICE_TYPES.find(type => type.value === value)
}

function getCatalogue (name) {
  return CATALOGUES[name] || []
}

function getCatalogueLayer (id) {
  return ALL_CATALOGUE_LAYERS.find(layer => layer.id === id)
}

// Where a layer was added from, as people read it. An origin is a short code so it can be
// added and removed without duplicating text: 'starting-points:<variant>' or 'commissioned'.
function describeOrigin (origin) {
  if (origin === 'starting-points:prefilled') return 'Starting points (pre-filled)'
  if (origin === 'starting-points:blank') return 'Starting points (blank)'
  if (origin === 'commissioned') return 'Commissioned evidence'
  return origin
}

function seedLayer (id, type, origin) {
  return Object.assign({}, getCatalogueLayer(id), { type, origins: [origin] })
}

// The collection's starting state: the five COMPASS layers the pre-filled starting points bring
// in, and two from the housing delivery assessment the commissioned evidence prototype opens on.
const PREFILLED_PLAN_LAYERS = [
  'compass-historic-environment-2',
  'compass-draft-policy-14',
  'compass-draft-policy-17',
  'compass-draft-policy-18',
  'compass-draft-policy-16'
]

function startingGisLayers () {
  return PREFILLED_PLAN_LAYERS.map(id => seedLayer(id, 'plan', 'starting-points:prefilled'))
    .concat([
      seedLayer('housing-completions', 'evidence', 'commissioned'),
      seedLayer('housing-capacity-sites', 'evidence', 'commissioned')
    ])
}

// The ids startingGisLayers gives the commissioned evidence, so its reset can put them back.
const COMMISSIONED_SEED_LAYERS = ['housing-completions', 'housing-capacity-sites']

module.exports = {
  COMPASS_SERVICES,
  COMPASS_GROUPS,
  PREFILLED_PLAN_LAYERS,
  catalogueFor,
  GIS_SERVICE_TYPES,
  LAYER_TYPES,
  getGisServiceType,
  getCatalogue,
  getCatalogueLayer,
  describeOrigin,
  startingGisLayers,
  COMMISSIONED_SEED_LAYERS
}

// --- Maps --------------------------------------------------------------------------------
//
// The inspector screens (Gateway 2 progress check, Examination – inspector view) show a fixed
// set of COMPASS layers for each policy area, chosen for this prototype. They are static: they
// don't come from the session's shared collection, so what testers add elsewhere doesn't change
// them. Each carries its own Plan/Evidence tag.
const MAP_LAYERS_BY_AREA = {
  'Health, inclusion and safety': [
    ['compass-boundaryline-1', 'evidence'],
    ['compass-draft-policy-13', 'plan'],
    ['compass-local-plan-supp-guidance-0', 'evidence'],
    ['compass-local-plan-supp-guidance-3', 'plan']
  ],
  Housing: [
    ['compass-draft-policy-13', 'plan'],
    ['compass-draft-policy-14', 'plan'],
    ['compass-local-plan-supp-guidance-5', 'plan'],
    ['compass-boundaryline-1', 'evidence']
  ],
  Infrastructure: [
    ['compass-draft-policy-5', 'plan'],
    ['compass-draft-policy-7', 'plan'],
    ['compass-draft-policy-14', 'plan'],
    ['compass-boundaryline-1', 'evidence']
  ],
  Design: [
    ['compass-local-plan-supp-guidance-4', 'evidence'],
    ['compass-draft-policy-4', 'plan'],
    ['compass-historic-environment-2', 'plan'],
    ['compass-local-plan-supp-guidance-2', 'plan']
  ],
  Offices: [
    ['compass-draft-policy-15', 'plan'],
    ['compass-draft-policy-14', 'plan'],
    ['compass-draft-policy-18', 'plan']
  ],
  Retail: [
    ['compass-draft-policy-17', 'plan'],
    ['compass-draft-policy-14', 'plan']
  ],
  'Culture and visitors': [
    ['compass-draft-policy-6', 'plan'],
    ['compass-draft-policy-9', 'plan'],
    ['compass-draft-policy-10', 'plan'],
    ['compass-historic-environment-3', 'evidence']
  ],
  'Heritage and Tall Buildings': [
    ['compass-historic-environment-2', 'plan'],
    ['compass-historic-environment-4', 'evidence'],
    ['compass-historic-environment-5', 'evidence'],
    ['compass-draft-policy-18', 'plan'],
    ['compass-draft-policy-16', 'plan'],
    ['compass-draft-policy-10', 'plan'],
    ['compass-draft-policy-12', 'plan'],
    ['compass-local-plan-supp-guidance-1', 'plan']
  ],
  'Open Spaces and Green Infrastructure': [
    ['compass-local-plan-supp-guidance-0', 'evidence'],
    ['compass-local-plan-supp-guidance-2', 'plan'],
    ['compass-historic-environment-3', 'evidence'],
    ['compass-historic-environment-0', 'evidence']
  ],
  'Climate Resilience': [
    ['compass-local-plan-supp-guidance-3', 'plan'],
    ['compass-local-plan-supp-guidance-0', 'evidence'],
    ['compass-draft-policy-9', 'plan']
  ],
  Transport: [
    ['compass-draft-policy-3', 'plan'],
    ['compass-draft-policy-5', 'plan'],
    ['compass-draft-policy-7', 'plan'],
    ['compass-draft-policy-8', 'plan'],
    ['compass-draft-policy-6', 'plan']
  ]
}

function getMapLayersForArea (area) {
  return (MAP_LAYERS_BY_AREA[area] || [])
    .map(([id, type]) => {
      const layer = getCatalogueLayer(id)
      return layer ? Object.assign({}, layer, { type }) : null
    })
    .filter(Boolean)
}

// Made-up shapes for the invented layers, which have no real data. Deterministic, so a layer
// looks the same every time: a small seeded generator (mulberry32) places points, or small
// rectangles for polygon layers, inside the City. Every feature says it is illustrative.
const CITY_BOUNDS = { west: -0.1120, east: -0.0745, south: 51.5085, north: 51.5215 }

function seededRandom (text) {
  let seed = 0
  for (let index = 0; index < text.length; index++) seed = (seed * 31 + text.charCodeAt(index)) | 0
  return function () {
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function generateIllustrativeGeoJSON (layer) {
  const random = seededRandom(layer.id)
  const width = CITY_BOUNDS.east - CITY_BOUNDS.west
  const height = CITY_BOUNDS.north - CITY_BOUNDS.south
  const features = []
  for (let index = 0; index < layer.features; index++) {
    const x = CITY_BOUNDS.west + random() * width
    const y = CITY_BOUNDS.south + random() * height
    let geometry
    if (layer.geometry === 'Point') {
      geometry = { type: 'Point', coordinates: [round(x), round(y)] }
    } else {
      const w = 0.0006 + random() * 0.0018
      const h = 0.0004 + random() * 0.0012
      geometry = {
        type: 'Polygon',
        coordinates: [[[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]].map(([a, b]) => [round(a), round(b)])]
      }
    }
    features.push({
      type: 'Feature',
      id: index + 1,
      geometry,
      properties: { name: layer.name + ' ' + (index + 1), illustrative: true }
    })
  }
  return { type: 'FeatureCollection', illustrative: true, features }
}

function round (value) {
  return Math.round(value * 1e6) / 1e6
}

module.exports.getMapLayersForArea = getMapLayersForArea
module.exports.generateIllustrativeGeoJSON = generateIllustrativeGeoJSON
