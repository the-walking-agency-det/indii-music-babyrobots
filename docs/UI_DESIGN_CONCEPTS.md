## INDII Music Platform - UI/UX Design Concepts

This document consolidates the core UI/UX design principles and layout skeleton for the INDII Music Platform, as provided by the user.

### Core UI/UX Principles

1.  **Progressive Disclosure**
    - Only shows essential information or tools initially.
    - Reveals more complexity or functionality as needed.
    - Core to keeping interfaces clean while still powerful.

2.  **Nested Panes / Stacked UI / Drawers**
    - Think of "windows inside windows" — panels, sidebars, or modals that expand contextually.
    - Used in IDEs like Cursor, VS Code, Notion, Replit, etc.
    - Often implemented using sliding panels, tabs, or layered modals.
    - Also known as "Multi-layered Workspace" or "Contextual UI".

3.  **Agent-Driven Interface / Just-In-Time Interface**
    - Interface elements (e.g., agents, tools) appear only when summoned or relevant.
    - Inspired by AI copilots, chat agents, and adaptive UIs.

### Similar Aesthetic Labels / Systems:
- "Minimalist Workspace UI"
- "Multi-Pane IDE UI"
- "Dynamic Modular Interface"
- "On-Demand Interface"
- "Just-In-Time UI"

### Layout Skeleton

1.  **Primary Workspace Pane**
    - Starts minimal: search, prompt, or “start exploring” CTA
    - Think: command bar, voice input, or single text field

2.  **Contextual Side Pane (on demand)**
    - Appears when selecting an artist, playlist, or mood
    - Slides in like Notion or Linear
    - Contains: artist bio, music player, visual identity

3.  **Threaded Exploration Pane (right-side nested)**
    - Every “deep dive” opens a pane — lyrics, collaborators, influence map, discography
    - Each pane can be closed or stacked
    - Inspired by dev tools & “breadcrumbs with depth”

4.  **Agent Interaction Zone (floating or pinned)**
    - Agents appear when needed: suggest artists, generate playlists, explain lyrics
    - Maybe: “Curator,” “Archivist,” “Explorer,” etc.
    - These are modular & summonable via chat/voice/button

5.  **Bottom Dock (optional)**
    - Timeline of interactions / music queue / mood board

### UX Behavior (Progressive Disclosure)
- Starts with a single interaction surface (command/search)
- New areas reveal as you explore deeper
- No hard nav; everything flows contextually
- Users feel like they’re peeling back layers of music history

### INDII Core UI Framework

1.  **Universal Shell (All User Types)**
    - **Progressive Interface Core**
        - Starts with a chat-style command/input bar → reveals workspace components on demand
        - (like Cursor, Replit, or ChatGPT with agents)
    - **Resizable Modular Panes**
        - Users can open/close, resize, or layer context panes
        - (artist workspace, licensing board, listening queue, etc.)
    - **Persistent Context Bar**
        - Left or top-aligned: user identity, active project, quick switcher

2.  **User-Specific Workspaces**
    - **Artists**
        - Creative Stack: songwriting board, DAW integrations, visual branding tools
        - Publishing Tools: track manager, album art editor, release planner
        - Social + Community: audience insights, feedback, posts
    - **Listeners**
        - Discovery Flow: mood-based explorers, playlist generators, artist trees
        - Listening Queue: draggable, saveable, mood-tagged queue
        - Vibe Boards: customizable music moodboards with memory/feedback
    - **Managers/Licensers**
        - QuickScan View: rapid-access grid of genres/moods with licensing tags
        - Project Playlists: drag & drop candidate tracks into project folders
        - Track Metadata Inspector: quick-view of rights, credits, and license types

3.  **Optional Secondary Views**
    - Kanban-style Workflow Board
        - For release planning, promo tracking, licensing projects
        - (especially useful for artists and managers)
    - Floating Agents/Assistants
        - Smart assistants for all user types — curators, coaches, scouts, etc.

4.  **Visual + UX Style**
    - Borderline IDE aesthetic — clean, dark/light toggle, focus-first
    - Sliding & Nested Panes — for layered work & exploration
    - Minimal at first, rich on demand — true progressive disclosure
