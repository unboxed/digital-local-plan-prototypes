// The site's structure, after the proposed service: a plan maker home (the personal dashboard)
// and its sections. Each section lists the service's features. A feature either links to the
// prototypes that explore it or, if none has been built, to a "not built yet" page at
// /plan/<section>/<slug> (or /plan/<slug> for the dashboard's own features).
//
// Drives the header nav (partials/service-header), the plan maker home and every section page
// (plan/section.html). See CLAUDE.md, "Site structure".

const PLAN_TYPES = [
  { value: 'local-plan', text: 'Local Plan', hint: 'A plan for one local planning authority.' },
  { value: 'joint-local-plan', text: 'Joint Local Plan', hint: 'A plan made by two or more local planning authorities together.' },
  { value: 'spatial-development-strategy', text: 'Spatial Development Strategy', hint: 'A strategic plan for a wider area, made by a strategic planning authority.' }
]

// The plan everything in the prototypes is about.
const PLAN_NAME = 'City Plan 2040'

// The dashboard's own features (the plan maker home), none built yet.
const DASHBOARD_FEATURES = [
  { slug: 'timeline', title: 'Live timeline and progress bar', description: 'Where the plan is in the 30 month process, and what is due next.' },
  { slug: 'task-tracker', title: 'Task tracker', description: 'Every task across the plan and how far each has got.' },
  { slug: 'assigned-tasks', title: 'Your assigned tasks', description: 'The tasks assigned to you, and when they are due.' },
  // Not a dashboard feature of its own: the Account section, which the dashboard links to
  // (so it isn't repeated among the plan's sections below it).
  { title: 'Account', description: 'Manage users, admin settings and permissions, and connect to other services.', href: '/plan/account', isSection: true }
]

const SECTIONS = [
  {
    id: 'manage',
    title: 'Manage your plan',
    summary: 'Set up and run the plan-making project: getting ready, tasks, and publishing versions of the plan.',
    note: 'What you can see and do here depends on your permissions.',
    features: [
      {
        title: 'Getting ready',
        description: 'The activities before the 30 month process starts: the timetable, the Project Initiation Documentation (PID) and checking you are ready.',
        prototypes: [
          {
            title: 'Getting ready to make your plan',
            href: '/plan/manage/getting-ready',
            description: 'Create and publish the Local Plan timetable, schedule its milestones for committee, write and approve the Project Initiation Documentation, publish the notice of intention to commence, and gather the policy starting points.'
          }
        ]
      },
      {
        slug: 'assign-tasks',
        title: 'Assign tasks',
        description: 'Give tasks to people in the team and see who is doing what.'
      },
      {
        title: 'Publishing and versions',
        description: 'Share or publish versions of the plan and supporting documents, and get approval to publish.',
        prototypes: [
          {
            title: 'Publish plan versions',
            href: '/plan/manage/versions',
            description: 'Publish the whole plan with its images and layers, view versions side by side, share chapters or a draft internally, send a version for publishing approval and preview it as it will be published. Includes the examination library.'
          }
        ]
      }
    ]
  },
  {
    id: 'make',
    title: 'Make your plan',
    summary: 'Write the plan: draft policy connected to its evidence, prepare for the gateways, and work with others on it.',
    features: [
      {
        title: 'Policy drafting, connected to evidence',
        description: 'We tested several concepts around policy drafting workflows, including how policies are viewed with and connected to evidence.',
        prototypes: [
          {
            title: 'Policy drafting with starting points',
            href: '/plan/make/policy-drafting',
            description: 'Turn the starting points for a new plan into chapters, give each a brief and officers, gather its sources and choose its policies, then draft them with the evidence and consultation responses open alongside.'
          },
          {
            title: 'View policy summary',
            href: '/plan/make/policy-writing/policy-summary',
            description: 'Browse policies by policy area and see a summary of each one: what it says, the evidence behind it, what consultation responses said, and the team’s notes.'
          },
          {
            title: 'Policy drafting: side by side policy and evidence',
            href: '/plan/make/policy-side-by-side',
            description: 'Evidence and the policy draft side by side, with a divider you can drag between them and a check on whether the draft uses its sources.'
          },
          {
            title: 'Write policy with starting points pre-filled',
            href: '/plan/make/policy-writing/prefilled/starting-points/adopted-plan-chapters',
            description: 'Work through the starting points for a new policy, gather its sources and draft it, starting from example data.'
          },
          {
            title: 'Write policy without starting points',
            href: '/plan/make/policy-writing/blank/starting-points/adopted-plan-chapters',
            description: 'The same journey from a blank slate.'
          }
        ]
      },
      {
        slug: 'gateway-preparation',
        title: 'Gateway preparation',
        description: 'Prepare for each gateway, including creating the documents it needs.'
      },
      {
        slug: 'share-and-collaborate',
        title: 'Share and collaborate',
        description: 'Work on the plan with others, including seeing comments from the Planning Inspectorate (PINS).'
      },
      {
        slug: 'mods-and-miqs',
        title: 'Manage MODs and MIQs',
        description: 'Manage main modifications (MODs) and the inspector’s matters, issues and questions (MIQs).'
      }
    ]
  },
  {
    id: 'sources',
    title: 'Manage sources',
    summary: 'Gather, view and tag the evidence behind the plan, and connect it to policy.',
    features: [
      {
        title: 'Structure and manage evidence and GIS layers',
        description: 'Bring evidence and spatial data into one place, read and tag it, and connect it to policy.',
        prototypes: [
          {
            title: 'Review evidence',
            href: '/plan/sources/review',
            description: 'Review a document and its details, tag it by hand or from an automatic summary with suggested tags, and add tagged notes alongside it.'
          },
          {
            title: 'Managing commissioned evidence',
            href: '/plan/sources/commissioned',
            description: 'Brief an external consultant, receive their report, review it with comments and notes, and accept it into the evidence library. Includes the consultant’s own screen.'
          },
          {
            title: 'GIS layer library',
            href: '/plan/sources/gis-layers',
            description: 'All the spatial data for the plan in one place, as policy layers and evidence base layers, with a map preview, version and the consultation each was published with.'
          },
          {
            title: 'Tagging',
            href: '/plan/sources/document-tagging',
            description: 'Read a document, highlight any passage and tag it, or record a tagged note about a conversation or meeting.'
          },
          {
            title: 'Evidence library',
            href: '/plan/sources/library',
            description: 'Browse evidence documents by policy area, filter tagged evidence by tag and policy reference, and export a filtered set.'
          },
          {
            title: 'Viewing and structuring evidence',
            href: '/plan/sources/viewing-structuring',
            description: 'Ideas for how officers can view evidence sources and connect specific insights to policies as they draft.'
          }
        ]
      }
    ]
  },
  {
    id: 'consultation',
    title: 'Consultation',
    summary: 'Manage the representations made to a consultation on the plan, and connect them to policy.',
    features: [
      {
        title: 'Manage consultation responses',
        description: 'Sort, respond to and check the representations made to a consultation.',
        prototypes: [
          {
            title: 'Managing consultation responses',
            href: '/plan/consultation/managing-responses',
            description: 'Import a consultation’s representations, respond to common issues in bulk by theme, check responses with better filtering and sorting, and compare a respondent’s representation with what they said before.'
          }
        ]
      },
      {
        slug: 'connect-to-policy',
        title: 'Connect to policy',
        description: 'Link what people said to the policies it is about.'
      }
    ]
  },
  {
    id: 'view',
    title: 'View the plan',
    summary: 'A searchable view of the plan for wider stakeholders, such as the Planning Inspectorate and the public, made available at specific points.',
    note: 'These prototypes are seen by people outside the council, so they use their own headers.',
    features: [
      {
        title: 'The public’s view',
        description: 'What residents, businesses and community groups see, while the plan is being made and once it is adopted. Southampton is the example authority.',
        prototypes: [
          {
            title: 'A local plan being made',
            href: '/plan/view/plan-making',
            description: 'The council’s local plan page during plan-making: a timeline of the key milestones, what you can do now, and what a local plan is.'
          },
          {
            title: 'An adopted local plan: search-led',
            href: '/plan/view/adopted-plan',
            description: 'A front door to an adopted plan, with a big search box first and place search and chapters below.'
          },
          {
            title: 'An adopted local plan: map-led',
            href: '/plan/view/adopted-plan/map-first',
            description: 'The same plan, with a map first and results that update as you draw.'
          },
          {
            title: 'An adopted plan’s policy page',
            href: '/plan/view/adopted-plan/policies/ho3-affordable-housing',
            description: 'A policy’s summary and full text, with the map, evidence, consultation and examination alongside.'
          }
        ]
      },
      {
        title: 'The Planning Inspectorate’s view',
        description: 'What an inspector sees of the plan, from checking its progress to examining it.',
        prototypes: [
          {
            title: 'Gateway 2 progress check',
            href: '/plan/view/gateway-2-progress-check',
            description: 'Check the progress of the plan’s chapters and evidence base.'
          },
          {
            title: 'Examination: inspector view',
            href: '/plan/view/examination',
            description: 'Examine a submitted plan paragraph by paragraph, with its evidence, comments and national policy alongside.'
          },
          {
            title: 'Examination library',
            href: '/plan/manage/versions/examination-library',
            description: 'The public library of the submitted plan and its examination documents, designed so readers can be sure which version they’re looking at.'
          },
          {
            title: 'Review consultation responses',
            href: '/plan/consultation/managing-responses/inspector',
            description: 'Compare representations with the authority’s responses to them, and record comments for the examination.'
          }
        ]
      },
      {
        title: 'Statement of compliance',
        description: 'Show which legal and procedural requirements have been met during plan preparation, and the evidence for each one.',
        prototypes: [
          {
            title: 'Statement of compliance',
            href: '/plan/view/statement-of-compliance',
            description: 'A draft statement for Gateway 2, and the completed statement as it would stand once the plan is adopted.'
          }
        ]
      }
    ]
  },
  {
    id: 'account',
    title: 'Account',
    summary: 'Manage who can use the service and what they can do, and connect it to other services.',
    features: [
      { slug: 'users', title: 'Add and manage users', description: 'Invite people to the plan and manage their accounts.' },
      { slug: 'admin-settings', title: 'Admin settings', description: 'Settings for the authority and its plans.' },
      { slug: 'permissions', title: 'Permissions', description: 'Decide what each person can see and do.' },
      { slug: 'api', title: 'API', description: 'Connect the plan to the Planning Inspectorate and to the authority’s website.' }
    ]
  }
]

// Each section's href, and each not-built feature's href, worked out once.
SECTIONS.forEach(section => {
  section.href = '/plan/' + section.id
  section.features.forEach(feature => {
    if (feature.slug) feature.href = section.href + '/' + feature.slug
  })
})
DASHBOARD_FEATURES.forEach(feature => {
  if (feature.slug) feature.href = '/plan/' + feature.slug
})

function getSection (id) {
  return SECTIONS.find(section => section.id === id) || null
}

// A feature with no prototype, by its section ('dashboard' for the plan maker home) and slug.
function getNotBuiltFeature (sectionId, slug) {
  const features = sectionId === 'dashboard' ? DASHBOARD_FEATURES : (getSection(sectionId) || { features: [] }).features
  return features.find(feature => feature.slug === slug) || null
}

module.exports = {
  PLAN_TYPES,
  PLAN_NAME,
  DASHBOARD_FEATURES,
  SECTIONS,
  getSection,
  getNotBuiltFeature
}
