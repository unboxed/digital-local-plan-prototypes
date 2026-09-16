---
name: visual-plan
description: Render design/UI direction proposals as real mockups in a private artifact before asking the user to choose — the user is visual and cannot pick between text descriptions. Use when about to present two or more visual or layout directions (during planning or otherwise), or when the user asks to "see" options.
---

# Visual plan

The user decides visual directions by looking, not by reading. Before asking
them to choose between UI/design options, show every option rendered.

## Process

1. **Ground in the project's design language.** Read the project's design
   source of truth if it has one (e.g. `DESIGN.md`, the token layer in
   `src/index.css`, an existing canonical screen) and reproduce its tokens,
   typeface, spacing and component grammar inline in the mockups. No design
   source → a clean neutral style. The mockup page is throwaway rendering, not
   project code — hardcoding token values inline there is correct (artifacts
   must be self-contained anyway).
2. **Build one HTML file in the scratchpad** (one file per planning session —
   reuse it across rounds so the URL stays stable). Load the `artifact-design`
   skill before writing it. For each option: a section labeled (A, B, C…) with
   a short name, the rendered mockup at realistic size with realistic content
   (real field names, plausible data — never lorem ipsum), and a one-line
   argument for it from the project's design principles. Show light AND dark
   when the project supports both.
3. **Publish with the Artifact tool** (private by default) and give the user
   the URL. If plan mode blocks the scratchpad write, say so in one line and
   offer: approve this one write, or the artifact publishes immediately after
   plan approval — then continue; never skip the visual step silently.
4. **Then ask.** Use AskUserQuestion with options matching the artifact's
   labels (A/B/C + short name). The question follows the artifact, never
   replaces it.
5. **Iterate in place.** When the user reacts, update the same file and
   republish — same URL, new version. Keep the favicon stable.

Done = the user picked a direction while looking at rendered options, and the
chosen label is recorded in the plan/conversation.
