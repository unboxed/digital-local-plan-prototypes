//
// User stories from the value proposition framework.
//
// Only entries with a US-style reference (E1US2 and so on) are listed here.
// Other references in that framework — prototype ideas (E1P1), assumptions
// (E1.1) and hypotheses (H2) — are deliberately excluded.
//
// Text is transcribed verbatim from the framework, including its own typos
// and query marks, so this page stays a faithful mirror of the source rather
// than a re-edit of it.
//

const USER_STORY_THEMES = [
  {
    theme: 'Evidence',
    subTheme: 'E1 Evidence gathering and specifying what we need (ingest and structure)',
    stories: [
      { ref: 'E1US1', text: 'As a policy officer I need to procure evidence in a standard format so that I can spend less time analysing it' },
      { ref: 'E1US2', text: 'As a policy officer I need to know if we already have or are procuring evidence I need so that I can avoid duplicating effort' },
      { ref: 'E1US3', text: 'As a policy officer I need to see all the needs for evidence across the team so that I can effectively procure responses' },
      { ref: 'E1US4', text: 'As a policy officer I need to directly view and use the latest most relevant sections of the NPPF' },
      { ref: 'E1US5', text: 'As a policy officer I need to store all my evidence in one place so I can access, export and track it' }
    ]
  },
  {
    theme: 'Evidence',
    subTheme: 'E2 Using evidence and connecting to policy (finding and using)',
    stories: [
      { ref: 'E2US1', text: 'As a policy officer I need to make sure that I\'m meeting national requirements for evidence as stated in the NPPF' },
      { ref: 'E2US2', text: 'As a policy officer I need to access and export evidence in the format I need, which might vary depending on the situation' },
      { ref: 'E2US3', text: 'As policy officer I need to highlight or select specific insights from evidence so I can search for and group all insights relating to a specific topic or request for evidence' },
      { ref: 'E2US4', text: 'As a policy officer I want to name evidence in a standard way so I can search it more easily later' },
      { ref: 'E2US5', text: 'As a policy officer I need to share and publish evidence for key stakeholders so that they can use it' }
    ]
  },
  {
    theme: 'Evidence',
    subTheme: 'E3 Keeping evidence up to date',
    stories: [
      { ref: 'E3US1', text: 'As a policy team leader (?) I need to monitor live evidence so I can see where there are gaps' },
      { ref: 'E3US2', text: 'As a policy team leader (?) I need to monitor the effectiveness of policy in relation to evidence so that we can improve policy in the next round of plan-making' },
      { ref: 'E3US3', text: 'As a policy officer I need to maintain live evidence base so I can export this and reference within policy with the most up to date data' }
    ]
  },
  {
    theme: 'Evidence',
    subTheme: 'E4 Reviewing evidence',
    stories: [
      { ref: 'E4US1', text: 'As a policy team leader/ officer I need to know what evidence was useful/used and what wasn\'t from previous procurement so that I can make better and more targeted choices about commissioning new evidence' },
      { ref: 'E4US2', text: 'As a policy officer I need to see how consutlation responses were used in relation to policy and how effectively they were addressed in plan-making so that we can improve our process' }
    ]
  }
]

function getUserStoryCount () {
  return USER_STORY_THEMES.reduce((total, theme) => total + theme.stories.length, 0)
}

module.exports = { USER_STORY_THEMES, getUserStoryCount }
