//
// Reference policy structures a drafter can pull into their draft as a starting point.
//
// Static reference content, so it lives here rather than in session-data-defaults.js — there
// is nothing per-user about it and nothing ever mutates it.
//
// The square-bracket placeholders are deliberate. Inserting a template and then running
// "Check references" immediately flags them, which is an honest demonstration of both
// features: a template is a skeleton, not a finished policy.
//

const POLICY_TEMPLATES = [
  {
    id: 'strategic-growth',
    name: 'Strategic growth policy',
    description: 'Directs growth to named locations with indicative capacities, and sets what proposals there must demonstrate.',
    text: 'Growth will be directed to the following locations:\n\n1. [Location] – approximately [insert figure] homes and [insert figure] sqm of employment floorspace\n2. [Location] – approximately [insert figure] homes and [insert figure] sqm of employment floorspace\n\nDevelopment in these locations will be expected to:\n\na. make efficient use of land at a density appropriate to its accessibility;\nb. demonstrate that the infrastructure needed to support it is in place or will be delivered alongside it; and\nc. contribute to the character and function of the area as set out in [related policy].'
  },
  {
    id: 'housing-delivery',
    name: 'Housing delivery and affordable housing policy',
    description: 'Sets a housing requirement, an affordable housing threshold, and the mix proposals must deliver.',
    text: 'The Council will make provision for at least [insert figure] new homes over the plan period.\n\nOn sites capable of delivering [insert figure] or more homes, at least [insert figure]% of homes will be affordable, unless it is demonstrated through a viability assessment prepared in accordance with [related policy] that this cannot be achieved.\n\nProposals will be expected to deliver a mix of dwelling sizes and tenures that responds to the need identified in [evidence source], with particular weight given to [identified priority].'
  },
  {
    id: 'climate-resilience',
    name: 'Climate resilience and flood risk policy',
    description: 'Sets requirements for overheating, drainage and flood risk, with a clear order of preference.',
    text: 'Development must be designed to remain safe and comfortable over its intended lifetime under the climate projections set out in [evidence source].\n\nProposals must:\n\na. manage overheating risk through passive measures — orientation, shading, glazing ratio and thermal mass — before any mechanical cooling is proposed;\nb. incorporate sustainable drainage that reduces surface water run-off to no more than [insert figure] litres per second per hectare; and\nc. direct the most vulnerable uses away from areas at risk of surface water and fluvial flooding, as identified in [evidence source].\n\nWhere requirement [insert reference] cannot be met, the applicant must demonstrate why, and what alternative has been adopted.'
  }
]

function getPolicyTemplate (id) {
  return POLICY_TEMPLATES.find(template => template.id === id) || null
}

module.exports = {
  POLICY_TEMPLATES,
  getPolicyTemplate
}
