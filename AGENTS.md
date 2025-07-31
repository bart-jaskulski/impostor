# AGENTS.md: Fremo Project

_Last updated: 2025-07-19_

> **Purpose** – This file is the onboarding manual for every AI assistant (Claude, Cursor, GPT, etc.) and every human who edits this repository.
> It encodes our coding standards, architectural principles, and workflow to ensure high-quality, maintainable code.

---

## Project Overview

Fremo is a Progressive Web App (PWA) for real-time, collaborative photo sharing at events. It allows event organizers to create a dedicated gallery and share it with guests via a simple QR code or link. Guests can upload photos directly from their phones without needing to install an app or create an account.

Our project is currently in an early stage of development and prototyping, so moving fast and breaking things is often an acceptable way of improving the product.

**Key Components:**

- **Frontend**: Next.js 15 (App Router) application built with React 19, TypeScript, and Tailwind CSS.
- **Backend**: Next.js Server Actions handle all business logic.
- **Database**: PostgreSQL
- **Real-time Layer**: A custom Node.js server (`server.ts`) with Socket.IO for live updates to gallery.
- **File Storage**: Cloudflare R2 with signed URLs
- **Authentication**: `better-auth` for user authentication with magic link login after event creation. Participants are created on the fly and associated with the browser.

**Golden Rule**: When unsure about implementation details, architectural choices, or requirements, **ALWAYS consult the developer** rather than making assumptions.

---

## Non-negotiable Golden Rules

| #:  | AI _may_ do                                                                                                                                         | AI _must NOT_ do                                                                                                                                      |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| G-0 | Whenever unsure about something that's related to the project, ask the developer for clarification before making changes.                           | ❌ Write changes or use tools when you are not sure about something project specific, or if you don't have context for a particular feature/decision. |
| G-1 | Generate code **only inside** relevant source directories (`app/`, `components/`, `lib/`, `db/`, `hooks/`, `context/`) or explicitly pointed files. | ❌ Touch `drizzle.config.ts`, `next.config.mjs`, or any files inside the `drizzle/` directory. These are managed by tooling.                          |
| G-2 | Add/update **`AIDEV-NOTE:` anchor comments** near non-trivial edited code.                                                                          | ❌ Delete or mangle existing `AIDEV-` comments.                                                                                                       |
| G-3 | Follow existing code style and formatting. Use `prettier` and `eslint` as configured in the project.                                                | ❌ Re-format code to any other style.                                                                                                                 |
| G-4 | For changes >300 LOC or >5 files, **ask for confirmation** before proceeding.                                                                       | ❌ Refactor large modules or core architectural patterns (like the auth flow or event bus) without human guidance.                                    |
| G-5 | Stay within the current task context. Inform the developer if it would be better to start afresh.                                                   | ❌ Continue work from a prior prompt after "new task" – start a fresh session.                                                                        |

---

## Structured Feature Development Workflow

For any non-trivial feature or change, we use a structured, two-phase workflow. This ensures clarity, alignment, and high-quality implementation. There are two distinct AI roles: the **Planner** and the **Implementer**.

All planning and summary documents for a single feature are grouped together in a dedicated directory within `adr/`, following the naming convention `adr/<yyyymmdd>_feature_name/`. For example: `adr/20250716_user_profiles/`.

### Phase 1: Planning & Design (with the Planner AI)

The goal of this phase is to collaborate with the developer to transform a high-level idea into a concrete, actionable plan. This is an interactive process.

**Step 1: Brainstorming & Idea Formalization (`idea.md`)**
-   **Process**: The developer will describe an idea. The AI assistant must then enter a **clarification loop**, asking targeted questions **one at a time** to resolve all ambiguities regarding scope, goals, and constraints. The AI must not proceed to the next step or generate the `idea.md` file until the developer explicitly signals that the brainstorming phase is complete (e.g., "Okay, that's enough, let's formalize the idea").
-   **Output**: Once the idea is clear and the developer has given the signal to proceed, the AI will create an `idea.md` file summarizing the concept, the problem it solves, and the proposed solution within the new feature directory.

**Step 2: Defining Requirements (`requirements.md`)**
-   **Process**: Based on the `idea.md`, the AI will work with the developer to define specific, verifiable requirements.
-   **Output**: A `requirements.md` file is created in the feature directory. Using a structured format like EARS (Event-Action-Response-State) is encouraged for clarity.

**Step 3: Architectural Design (`design.md`)**
-   **Process**: With the idea and requirements defined, the AI will propose an architectural and technical design.
    -   **Crucially, the design should prioritize visual representations like Mermaid diagrams (sequence, component, entity-relationship) or ASCII flowcharts over raw code snippets.** The goal is to illustrate architecture, not to pre-write the implementation.
-   **Output**: A `design.md` file detailing the technical approach, also located in the feature directory.

**Step 4: Creating the Implementation Plan (`todo.md`)**
-   **Process**: This is the final step of the planning phase. The AI synthesizes all previous documents into a detailed, step-by-step implementation plan.
-   **Output**: A `todo.md` file with a checklist of granular, sequential tasks.

**Conclusion of Phase 1:**
-   **Upon creation of `todo.md`, the Planner AI's role is complete.** The AI must stop, explicitly state that the planning phase is finished, and await a new, separate instruction from the developer to begin Phase 2. **It must not attempt to start implementation.**

### Phase 2: Implementation (with the Implementer AI)

The goal of this phase is to execute the plan defined in Phase 1. This is a separate session, initiated by the developer, with a new AI instance given the planning documents as context.

**Step 1: Task Execution**
-   **Process**: The Implementer AI must read and understand all planning documents from the feature's `adr/` directory. It will then execute the tasks in `todo.md` sequentially.

**Step 2: Summarizing the Work (`implemented.md`)**
-   **Process**: After all tasks in `todo.md` are completed and verified, the AI's final action is to create a summary of the work performed.
-   **Output**: An `implemented.md` file, added to the feature's `adr/` directory.

**Step 3: Proposing the Commit**
-   **Process**: As the final action, the AI must prepare a Git commit. This involves staging all the new and modified files (including the `adr/...` documents).
-   **Output**: The AI will present a final proposed commit to the developer for approval. The proposal **must** include:
    1.  A list of all staged files.
    2.  A well-formed commit message that adheres to the **Commit Discipline** section (e.g., `feat: implement user profiles [AI]`).

---

## Build, Test & Utility Commands

Use `pnpm` scripts to ensure consistency.

```bash
pnpm format

pnpm lint
```

---

## Coding Standards

- **Framework**: Next.js 15+ (App Router), React 19, TypeScript.
- **Styling**: Tailwind CSS with `clsx` and `tailwind-merge` for utility class composition. Eslint with extensions: "next/core-web-vitals", "next/typescript".
- **Database**: Drizzle ORM for all database interactions. Use inferred types from the schema.
- **Typing**: Strict TypeScript. Use `PascalCase` for types and interfaces.
- **Naming**: `camelCase` for functions/variables, `PascalCase` for components/classes/types, `SCREAMING_SNAKE_CASE` for constants.
- **Error Handling**: Use `try/catch` blocks.
- **Documentation**: Use JSDoc for public functions, components, and hooks.
- **State Management**:
  - For local component state, use standard hooks like `useState` and `useEffect`.
  - For forms and mutations that call Server Actions, use the `useActionState` hook to manage state transitions (pending, error, success) and the `useFormStatus` hook for submit buttons.
  - For complex, self-contained logic (like camera controls or socket connections), encapsulate it within a custom hook (e.g., `useCamera`, `useSocket`).

---

## Brand Voice, Tone, and Design Principles

To ensure a consistent and high-quality user experience, all contributions must align with the following principles.

### Core Brand Persona: The Effortless Memory-Maker

Fremo's voice is **friendly, encouraging, and approachable**. It’s the tech-savvy friend at an event who makes it easy for everyone to share and see memories. The brand is built on three pillars: **instant, collaborative, and simple**.

### Dual-Audience Tone

We speak to two main audiences, and our tone adapts accordingly:

1.  **The Event Organizer ("The Planner")**:
    *   **Context**: Homepage, event creation, admin panels.
    *   **Tone**: **Clear, confident, and benefit-oriented.** Reassuring and professional, focusing on how Fremo solves their problems.
    *   **Keywords**: *Manage, Create, Engage, Secure, Simple, Instant Gallery.*

2.  **The Event Guest ("The Participant")**:
    *   **Context**: Event gallery, photo upload interface.
    *   **Tone**: **Simple, direct, and enthusiastic.** The language is minimal and action-oriented to get them to the fun part quickly.
    *   **Keywords**: *Scan, Snap, Share, Join, See Photos, Live.*

### Copywriting Guidelines

-   **Voice**: Use an active, positive, and concise voice. Speak directly to the user with "you" and "your."
-   **Clarity Over Cleverness**: Avoid technical jargon. The goal is instant understanding.
    -   **Good**: "Your event gallery is live!"
    -   **Bad**: "Photo stream aggregation has been initiated."
-   **Action-Oriented Language**: Use strong verbs for CTAs (e.g., "Create Your Event," "Add Your Photos").
-   **Pattern Consistency**: Follow existing copy patterns for new features (e.g., "Catchy Title -> Simple Subtitle -> 3 Steps" for feature descriptions).

### Visual Design Principles

-   **Aesthetic**: Clean, modern, and focused. The design should "get out of the way" and let the photos be the main attraction.
-   **Iconography**: Use the **`lucide-react`** library exclusively for icons to maintain a consistent and clean visual language.
-   **Emphasis**: Use colored backgrounds on icon containers to draw attention to key features or actions, following the pattern seen in the "How It Works" section.
-   **Modularity**: Build components to be small, focused, and reusable.

---

## Project Layout & Core Components

| Directory | Description |
| :--- | :--- |
| `app/` | Core application routes. Most routes are nested under `app/[locale]/` to support i18n. |
| `app/[locale]/` | Locale-prefixed routes for internationalization. |
| `components/` | Reusable React components (`ui/` for shadcn, others for features). |
| `db/` | Drizzle ORM schema (`schema.ts`), client instance, and config. |
| `drizzle/` | **(DO NOT EDIT)** Auto-generated database migration files. |
| `hooks/` | Custom React hooks (e.g., `useSocket`, `useAuth`). |
| `i18n.ts` | Configuration for `next-intl` (locales, message loading). |
| `lib/` | Shared utilities: `s3Client`, `socket`, `email`, `bus`. |
| `lib/actions` | Common server actions. |
| `messages/` | Stores `[locale].json` files for `next-intl` translations. |
| `middleware.ts` | Handles locale-based routing using `next-intl`. |
| `public/` | Static assets like images, icons, and `manifest.json`. |
| `server.ts` | Custom Node.js server. Runs Next.js and the Socket.IO instance. Handles both direct client socket events and events from the internal message bus. |

**Key Domain Models** (defined in `db/schema.ts`):

- **User**: Represents an application user, identified by email. Can be an event manager.
- **Participant**: Represents an event participant, may be a guest or an organizer.
- **Event**: The central entity. Contains settings, a manager, and a unique `slug`.
- **Photo**: An image uploaded to an event, linked to S3 storage.

---

## Key Architectural Concepts

Understand these core patterns before writing code.

### 1. Just-in-Time (JIT) Participant Identity

-   **Concept**: Users (guests) do not need to sign up to participate. A persistent identity is created for them "just-in-time" when they first interact with an event.
-   **Mechanism**:
    -   A public, long-lived `guestId` is generated using `nanoid` and stored in the browser's `localStorage` (`fremo_guest_id`).
    -   When an action requires a secure ID (like uploading a photo), the `getOrCreateGuestParticipant` server action is called with this public `guestId`.
    -   This action finds or creates a corresponding secure, server-side participant record (with a UUID) in the `participants` table.
    -   The secure participant UUID is then returned to the client and stored in `sessionStorage` for the duration of the session.
-   **Implication**: Client-side code should use the `useParticipant` hook to orchestrate this flow. Server actions that need an author ID must receive the secure participant UUID.

### 2. Real-time Architecture: Two Core Patterns

The application uses two different patterns for real-time communication. Choose the correct one based on the use case.

| | **Pattern A: Server Action-Driven (Durable)** | **Pattern B: Direct Client-to-Socket (Low-Latency)** |
| :--- | :--- | :--- |
| **Flow** | Client -> Server Action -> DB -> Event Bus -> Socket Server -> All Clients | Client -> Socket Server -> All Clients (and maybe async DB update) |
| **Use When** | The action is a critical, transactional state change that **must** be persisted durably before notifying other clients. | The action is a frequent, low-stakes UI update where perceived speed is more important than guaranteed transactional durability. |
| **Characteristics** | - Higher latency<br>- Inherently secure (uses Server Action auth)<br>- Guarantees data is saved before broadcast | - Very low latency<br>- Requires custom auth logic on the socket server<br>- Optimistic updates (broadcasts before or during DB save) |
| **Example Use Cases** | - Uploading a new photo<br>- Deleting a photo<br>- Changing event settings | - Liking a photo<br>- Live participant cursors/reactions<br>- Typing indicators |

-   **Implementation for Pattern A**: The Server Action emits an event to `lib/bus.js`. The `server.js` file listens to the bus and broadcasts the corresponding Socket.IO event.
-   **Implementation for Pattern B**: The client emits a Socket.IO event directly. The `server.js` file must have a listener for this event (`socket.on(...)`) that handles the logic, including any necessary authorization checks, and then broadcasts to the room.

---

## Anchor Comments

Use specially formatted comments to leave inline knowledge that can be easily found with `grep`.

### Guidelines:

- Use `AIDEV-NOTE:`, `AIDEV-TODO:`, or `AIDEV-QUESTION:` (all-caps prefix).
- Keep them concise (≤ 120 chars).
- **Update relevant anchors** when modifying associated code.
- **Do not remove `AIDEV-NOTE`s** without explicit human instruction.
- Add anchor comments when code is complex, critical, or potentially confusing.

---

## Commit Discipline

- **Granular commits**: One logical change per commit.
- **Tag AI-generated commits**: e.g., `feat: implement password reset flow [AI]`.
- **Clear commit messages**: Explain the why; link to issues if applicable.
- **Review AI-generated code**: Never merge code you don't understand.

---

## Security Considerations

-   **Authorization in Server Actions**: Always verify that the user has the right to perform an action. For manager-only actions, check the session user's ID against the `managerId` of the resource (e.g., the event). Do not trust that the client will only show the UI to authorized users.
-   **Input Validation**: All data from the client (form data, parameters) must be validated on the server using Zod schemas before being processed. This is already a pattern in the `lib/actions` files.
-   **Data Exposure**: Be mindful of the data returned to the client. Only return the fields necessary for the UI. For example, when fetching photos, the `objectKey` from S3 is not sent to the client; a signed URL is generated instead.

---

## Database & API Schema Management

- The **single source of truth** for the database schema is `db/schema.ts`.
- To modify the database schema:
  1.  Edit the table definitions in `db/schema.ts`.
  2.  Run `pnpm db:generate` to create a new migration file in the `drizzle/` directory.
  3.  Run `pnpm db:migrate` to apply the migration to your database.
- **Do NOT manually edit** files in the `drizzle/` directory. They are auto-generated.
- API definitions are located in `app/api/`. There is no separate API spec language; the TypeScript code and Drizzle schema are the source of truth.

---

## Internationalization (i18n)

- **Library**: We use `next-intl` for internationalization.
- **Configuration**:
    - `i18n.ts`: Defines supported locales (`en`, `pl`, `es`, `fr`, `de`) and loads translation messages.
    - `middleware.ts`: Handles locale-based routing.
- **Translations**:
    - All translation strings are stored in JSON files in the `messages/` directory at the project root.
    - To add or update translations, edit the corresponding `messages/[locale].json` file.
- **Usage**:
    - **Client Components**: Use the `useTranslations('Namespace')` hook from `next-intl`.
    - **Server Components**: Use `await getTranslations('Namespace')` from `next-intl/server`.
- **Routing**:
    - Most routes are prefixed with the locale (e.g., `/en/about`). The structure is `app/[locale]/...`.
    - **Exception**: Event pages under `/e/` are **not** prefixed to maintain clean, shareable links. The middleware is configured to handle this.
- **Adding New Strings**:
    1.  Add the new key and its English translation to `messages/en.json`.
    2.  Use the appropriate hook (`useTranslations` or `getTranslations`) in your component to access the string.
    3.  (Optional but recommended) Add translations for other languages in their respective JSON files.

---

## Common Pitfalls

- **Library Version**: We are using Next.js 15, which provides route parameters and cookies as asynchronous functions. This in API routes we need to use `await` to get the parameters, and in fronted components we need `use` react hook to get the parameters. Similarly, we use React 19 with new hooks.
- **i18n**: When adding new user-facing strings, they must be added to `messages/en.json` and accessed via `useTranslations` or `getTranslations` hooks. Avoid hardcoding text.
- **Socket.IO Rooms**: Forgetting to have clients `join-event` or ensuring the server emits to the correct `event-ID` room.
- **Client vs. Server Components**: Correctly use the `"use client"` and `"use server"` directives. Authentication checks and data fetching from the DB should be in server-side code (API routes, Server Components), while interactivity requires client components.
- **Prop drilling**: Avoid prop drilling in components. Instead use server actions.

---

## Files to NOT Modify

These files control project configuration and auto-generated assets. Do not modify them without explicit instruction.

- `drizzle/` (all files)
- `drizzle.config.ts`
- `next.config.mjs`
- `pnpm-lock.yaml`
- `.next/`
- `node_modules/`
