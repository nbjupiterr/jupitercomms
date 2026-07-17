# Commission Queue — Implementation Plan

## Current State

- Next.js 16 + React 19 + Tailwind 4 + Supabase JS + Framer Motion + Lucide icons
- Currently a portfolio site ("Jupiter") with Hero/About/Gallery/Contact/Footer
- Dark glassmorphism theme (purple accent, glass utilities)
- Supabase project linked: `xmtyjjqdigstqmyqucum`
- Supabase client exists at `lib/supabase.ts` (basic client-side only)

## Transformation Strategy

Gutting the portfolio components. Replacing with the Commission Queue app structure. Keeping the existing theme/design tokens and extending them.

---

## Phase 1: Database Schema & RLS

Create all tables via Supabase MCP `apply_migration`:

### Tables

1. **artists** — extends Supabase auth.users
   - id (uuid, FK auth.users), display_name, username (unique), profile_image_url, bio, contact_url, availability_status (enum), availability_message, available_slots, created_at, updated_at

2. **clients**
   - id, artist_id (FK artists), display_name, email, contact_handle, preferred_contact_method, private_notes, created_at, updated_at

3. **commissions**
   - id, artist_id (FK artists), client_id (FK clients), title, public_title, description, commission_type, status (enum), progress_percentage (0-100), queue_order, priority, requested_deadline, estimated_start_date, estimated_completion_date, price, currency, payment_status (enum), public_tracking_enabled, tracking_token (unique), created_at, updated_at, archived_at

4. **commission_notes**
   - id, commission_id (FK commissions), artist_id (FK artists), title, content, visibility (enum: private/public), progress_percentage, preview_image_url, created_at, updated_at

5. **commission_milestones**
   - id, commission_id (FK commissions), title, description, order_index, is_completed, completed_at, is_public

6. **references**
   - id, commission_id (FK commissions), label, url, file_url, created_at

### Enums

- `availability_status`: open, limited, waitlist, closed, unavailable
- `commission_status`: inquiry, awaiting_payment, queued, in_progress, client_review, revision, paused, completed, cancelled
- `payment_status`: unpaid, deposit_paid, paid, refunded
- `note_visibility`: private, public

### RLS Policies

- Artists: full CRUD on own rows only (auth.uid() = id)
- Clients: artist can CRUD where artist_id = auth.uid()
- Commissions: artist CRUD where artist_id = auth.uid(); public SELECT via tracking_token for public tracking page (only public fields)
- Notes: artist CRUD where artist_id = auth.uid(); public SELECT (visibility = 'public') via commission tracking_token join
- Milestones: artist CRUD via commission ownership; public SELECT (is_public = true) via tracking join
- References: artist CRUD via commission ownership

### Database Functions

- `get_public_commission(token text)` — returns only public-safe fields for client tracking page
- `get_queue_position(commission_id uuid)` — returns position among active commissions for same artist

---

## Phase 2: Auth & Supabase Client Setup

1. Replace `lib/supabase.ts` with proper SSR-compatible Supabase setup:
   - `lib/supabase/server.ts` (server component client)
   - `lib/supabase/client.ts` (browser client)
   - `lib/supabase/middleware.ts` (session refresh)
2. Add `middleware.ts` at project root for auth session management
3. Create auth pages:
   - `app/(auth)/login/page.tsx`
   - `app/(auth)/signup/page.tsx`
   - `app/(auth)/forgot-password/page.tsx`
   - `app/auth/callback/route.ts` (OAuth/magic link callback)

---

## Phase 3: App Structure & Routing

```
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── forgot-password/page.tsx
├── (dashboard)/
│   ├── layout.tsx           — sidebar nav, auth guard
│   ├── page.tsx             — dashboard overview
│   ├── commissions/
│   │   ├── page.tsx         — commission list
│   │   ├── new/page.tsx     — create commission
│   │   └── [id]/page.tsx    — commission detail/edit
│   ├── queue/page.tsx       — drag-drop queue manager
│   ├── clients/
│   │   ├── page.tsx         — client list
│   │   └── [id]/page.tsx    — client detail
│   ├── availability/page.tsx
│   └── settings/page.tsx
├── track/[token]/page.tsx   — public client tracking (no auth)
├── layout.tsx
├── globals.css
└── favicon.ico
```

---

## Phase 4: Core Features (ordered by dependency)

### 4a: Dashboard Layout & Navigation
- Sidebar with nav links
- Auth guard (redirect if not logged in)
- Artist profile in sidebar

### 4b: Client Management
- CRUD clients
- Search/filter

### 4c: Commission CRUD
- Create/edit form with all fields
- Status management
- Link to client

### 4d: Queue Management
- Drag-and-drop reorder (use existing framer-motion or add dnd-kit)
- Auto queue position calculation
- Only queued/in_progress shown

### 4e: Notes & Progress
- Private notes vs public updates (visually distinct)
- Milestone tracking
- Manual progress percentage

### 4f: Public Tracking Page
- Token-based access (no auth)
- Queue position display
- Status, progress, public updates
- Mobile-first design

### 4g: Availability Management
- Status selector
- Slot count
- Custom message

---

## Phase 5: Polish & Verification

- Responsive design pass (mobile-first tracking page)
- Build verification (`next build`)
- RLS verification (no private data leaks on public pages)
- Generate types: `supabase gen types --linked > lib/supabase/types.ts`

---

## Dependencies to Add

- `@supabase/ssr` — SSR auth helpers for Next.js
- `@dnd-kit/core` + `@dnd-kit/sortable` — drag-and-drop queue (lightweight, accessible)

## Files to Delete

All current portfolio components:
- `components/Hero.tsx`
- `components/About.tsx`
- `components/Gallery.tsx`
- `components/Contact.tsx`
- `components/Footer.tsx`
- `components/Navbar.tsx`

---

## Execution Order

1. Schema + RLS (Supabase MCP)
2. Install deps (`@supabase/ssr`, `@dnd-kit/core`, `@dnd-kit/sortable`)
3. Supabase client refactor (server/client/middleware)
4. Auth pages
5. Dashboard layout
6. Delete old components, update root page
7. Client CRUD
8. Commission CRUD
9. Queue manager
10. Notes/milestones
11. Public tracking page
12. Availability
13. Type generation + build verification
