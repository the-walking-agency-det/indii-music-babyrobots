# Indii Music Platform - Master To-Do List

This document consolidates all "to-do" items found across the Markdown files in the `docs` directory. It is organized by the original file and relevant sections to provide context for each task.

## Task Status Legend:
- [ ] To Do (Not Started)
- [~] In Progress
- [x] Done

---

## 📄 Related Documentation
- [UI/UX Design Concepts](UI_DESIGN_CONCEPTS.md)

---

##  CORE RING (Absolute Foundation)
- [x] Chat-style interface input component (text + optional voice) - Implemented in Shell.tsx
- [x] Basic shell layout with placeholder panes (left/main/right) - Implemented in Shell.tsx
- [x] Toggle logic for showing/hiding nested panes - Implemented in Shell.tsx
- [x] Universal user type detection (artist, listener, manager) - Implemented in Shell.tsx with a dropdown
- [x] Minimal theme scaffold (dark/light, padding, font scale) - Basic dark theme applied via Tailwind CSS

---

##  FIRST GROWTH RING (Modular Pane System)
- [~] Resizable pane component (open, collapse, expand) - Basic show/hide toggle implemented
- [x] Agent summoning interface (button + auto-suggest trigger) - Placeholder added in Shell.tsx
- [x] Pane context switcher (breadcrumbs / back-forward nav) - Implemented in Shell.tsx - Implemented in Shell.tsx
- [x] Pane memory store (persist state across sessions) - Implemented in Shell.tsx using localStorage
- [~] Visual framework styles (border, tone, active/inactive states) - Added borders to panes in Shell.tsx

---

##  SECOND GROWTH RING (User-Specific Workspace Basics)

###  Artist
- [x] Creative dashboard pane (song notes, ideas, ref boards) - Placeholder component created (ArtistWorkspace.tsx)
- [x] Track manager stub (add, edit, organize songs) - Implemented in src/components/music/TrackManager.tsx
- [x] Release planner kanban placeholder - Implemented in src/components/music/ReleasePlannerKanban.tsx

###  Listener
- [x] Mood explorer pane (tagged music tiles or cards) - Placeholder component created (ListenerWorkspace.tsx)
- [x] Listening queue system (drag, reorder, tag) - Implemented in src/components/music/ListeningQueueSystem.tsx
- [x] Music moodboard stub (save to board + reactions) - Implemented in src/components/music/MusicMoodboard.tsx

###  Manager
- [x] Licensing QuickScan pane (genre/mood/audio card grid) - Placeholder component created (ManagerWorkspace.tsx)
- [ ] Project Playlists (multi-track select + notes)
- [ ] Metadata preview modal (hover/focus → details)

---

##  OUTER RING (Smart Interaction + System Features)
- [~] Context-aware agent behavior logic
  - Created ContextAwareAgent class extending BaseAgent
  - Added initial test suite
  - Configured with Google Gemini API integration
  - BLOCKED: Needs completion of memory system integration
- [~] System-wide memory graph (lightweight, indexed by user type)
  - Basic infrastructure set up
  - Environment configured with necessary API keys
  - PENDING: Implementation of graph relationships
- [ ] Tabbed workspace logic (multi-workspaces per user)
- [ ] Simple command-palette for jumping around UI
- [ ] Support pane (feedback / help / user notes)

### Recent Technical Updates:
- [x] Fixed test parameter mismatches in IndiiAgent tests
- [x] Implemented dependency injection for Prisma client in IndiiAgent
- [x] Set up environment configuration (.env) with required API keys
- [x] Added mock implementations for memory modules in test environment

---

##  IMAGE PROTOTYPE PREP
- [ ] Layout wireframe for artist view
- [ ] Layout wireframe for listener view
- [ ] Layout wireframe for manager view
- [ ] Agent interaction mockups (hover vs full chat)
- [ ] Nested pane behavior examples (3-layer deep)

**Note from Gemini:** The core UI layout (Shell.tsx) with dynamic user workspaces and agent interaction zone placeholders has been implemented. Dependencies for the frontend (Next.js, Babel presets, Heroicons, class-variance-authority, TailwindCSS PostCSS plugin) have been added and configured. The UI is currently unstyled, awaiting further design integration.