# Design Guidelines: Marketing AI ENS Platform

## Design Approach

**Selected Approach:** Design System - Modern SaaS Productivity
**Primary References:** Linear, Vercel Dashboard, Notion
**Justification:** This is a utility-focused, information-dense B2B marketing platform requiring efficiency, clarity, and professional credibility. The design system approach ensures consistency across complex workflows while maintaining high usability.

**Core Principles:**
- Clarity over decoration
- Information hierarchy through typography and spacing
- Purposeful whitespace in dense interfaces
- Immediate feedback on AI operations
- Professional, trustworthy aesthetic

---

## Typography System

**Font Stack:**
- Primary: Inter (Google Fonts) - for UI, body text, data displays
- Monospace: JetBrains Mono - for technical data, IDs, timestamps

**Hierarchy:**
- Page Titles: text-3xl font-semibold
- Section Headers: text-xl font-semibold
- Subsection Headers: text-lg font-medium
- Body Text: text-base font-normal
- Small Text/Labels: text-sm font-medium
- Captions/Metadata: text-xs font-normal

**Line Heights:**
- Headings: leading-tight
- Body: leading-relaxed
- Dense data: leading-snug

---

## Layout System

**Spacing Primitives:**
Use Tailwind units: **2, 4, 6, 8, 12, 16** exclusively
- Micro-spacing (gaps, padding): p-2, gap-4
- Standard spacing: p-6, mb-8
- Section spacing: py-12, mt-16

**Grid Structure:**
- Dashboard layout: Sidebar (280px fixed) + Main content area (flex-1)
- Content max-width: max-w-7xl mx-auto
- Card grids: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 with gap-6

**Responsive Breakpoints:**
- Mobile: Full-width cards, stacked navigation
- Tablet (md:): 2-column grids, persistent sidebar
- Desktop (lg:+): 3-column grids, expanded data tables

---

## Component Library

### Navigation & Structure

**Sidebar Navigation:**
- Fixed left sidebar with logo at top
- Navigation items with icons (Heroicons) + labels
- Active state: subtle background treatment
- Sections: Dashboard, Campaigns, AI Tools, Analytics
- User profile at bottom with avatar + name

**Top Bar:**
- Campaign context indicator when inside campaign
- Breadcrumb navigation for deep pages
- Action buttons (New Campaign, etc.) aligned right
- Search functionality for campaigns/leads

### Data Display Components

**Campaign Cards:**
- Compact header: Title + Status badge + Menu
- Key metrics in 3-column grid (Leads, Actions, Progress)
- Date range with calendar icon
- Footer: Last updated + Quick actions

**Data Tables:**
- Sticky headers with sort indicators
- Row hover states
- Action column (right-aligned) with icon buttons
- Pagination controls at bottom
- Empty states with helpful CTAs

**Analytics Dashboard:**
- Stat cards in 4-column grid: Large number + label + trend indicator
- Charts placeholder with descriptive titles
- Time period selector (Last 7/30/90 days)

### Forms & Input

**Campaign Creation Form:**
- Multi-step wizard with progress indicator
- Step 1: Basic Info (Name, Modality, Course dropdown, Dates)
- Step 2: Goals (Leads target, Budget, Messaging)
- Step 3: Review + Create
- Form fields: Full-width labels above inputs
- Input sizing: h-10 for text inputs, h-32 for textareas
- Date pickers with calendar icon
- Validation states inline with error messages

**AI Assistant Interface:**
- Chat-style layout with message bubbles
- User messages: Aligned right, rounded-2xl, p-4
- AI responses: Aligned left with loading skeleton
- Input area: Fixed bottom with h-12 textarea, Send button
- Action cards for generated content (SWOT, Personas) with "Save to Campaign" button

### Buttons & Actions

**Primary Buttons:**
- Height: h-10
- Padding: px-6
- Border radius: rounded-lg
- Font: text-sm font-medium
- States: Default, Hover (subtle), Active, Disabled, Loading (spinner)

**Secondary/Ghost Buttons:**
- Same dimensions as primary
- Border treatment for secondary
- No background for ghost

**Icon Buttons:**
- Size: w-9 h-9
- Rounded: rounded-lg
- Center aligned icon

### Cards & Containers

**Standard Card:**
- Border radius: rounded-xl
- Padding: p-6
- Border: border with subtle treatment
- Shadow: Very subtle, only on interactive cards

**Modal Dialogs:**
- Overlay with backdrop blur
- Modal: rounded-2xl, max-w-2xl, p-8
- Header with title (text-xl font-semibold) + close button
- Content area with scrollable overflow
- Footer with Cancel + Primary action buttons

### Status & Feedback

**Status Badges:**
- Inline-flex, px-3, py-1, rounded-full, text-xs font-medium
- States: Active, Draft, Completed, Scheduled

**Loading States:**
- AI operations: Skeleton loaders matching content shape
- Buttons: Inline spinner (w-4 h-4) + "Generating..." text
- Page loads: Centered spinner with backdrop

**Toast Notifications:**
- Fixed top-right position
- Rounded-lg, p-4, shadow-lg
- Icon + Message + Close button
- Auto-dismiss after 5s

---

## Page-Specific Layouts

### /Campaigns (List View)
- Header: Page title + "New Campaign" button
- Filters bar: Status dropdown, Search, Date range
- Campaign cards in grid-cols-1 md:grid-cols-2 gap-6
- Empty state: Centered illustration + "Create your first campaign" CTA

### /Campaigns/:id (Detail View)
- Hero section: Campaign name, status, dates (py-8)
- Tabs: Overview, Actions, Personas, SWOT, Leads
- Overview tab: Stats grid + Recent activity timeline
- Actions tab: Calendar view option + List view with filters

### /AIAssistant
- Split layout: Conversation (60%) + Context panel (40%)
- Context panel: Active campaign info, quick actions
- Conversation scrollable with messages
- Fixed input at bottom

### /Analytics
- Dashboard grid layout
- KPI cards at top (4-column)
- Charts section below (2-column grid)
- Filters sidebar (collapsible on mobile)

---

## Animations

**Minimal, purposeful animations only:**
- Page transitions: None (instant)
- Modal entry: Simple fade + slight scale (200ms)
- Loading spinners: Smooth rotation
- **No scroll animations, parallax, or decorative motion**

---

## Icons

**Library:** Heroicons (outline for navigation, solid for emphasis)
**CDN:** Via unpkg or jsDelivr
**Common icons:** ChartBarIcon, PlusIcon, SparklesIcon (AI), UserGroupIcon (Personas), LightBulbIcon (Ideas)

---

## Images

**No hero images needed** - this is a productivity tool, not a marketing site.

**Images used:**
- Empty state illustrations (simple, minimal SVG placeholders)
- User avatars (circular, w-10 h-10)
- Optional: Campaign thumbnails if user uploads course imagery

---

## Accessibility

- All interactive elements: min-h-10 (touch target)
- Focus rings: ring-2 ring-offset-2 on all focusable elements
- Labels: Visible labels for all form inputs
- ARIA labels for icon-only buttons
- Semantic HTML throughout (nav, main, article, aside)