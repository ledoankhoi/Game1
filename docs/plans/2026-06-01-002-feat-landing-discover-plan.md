# Plan: 3D Landing Page "Khám Phá Ngay" for MathQuest

- **Type:** feat
- **Created:** 2026-06-01
- **Status:** active

## Problem Frame

MathQuest needs an engaging landing page that introduces new users to the platform with a 3D puzzle-solving experience. The existing Home page is a game lobby, and About page is text-heavy. A dedicated "Khám Phá Ngay" (Discover Now) landing page with interactive 3D elements will serve as an immersive introduction.

## Scope Boundaries

### In Scope
- New route `/discover` for the landing page
- 3D animated scene using Three.js (floating geometric puzzle pieces)
- GSAP scroll-triggered animations
- Hero section with animated 3D geometry + tagline
- Feature showcase section (3 core features with icons)
- CTA section with "Khám Phá Ngay" button linking to game registration
- Full-screen immersive design with dark theme
- Responsive layout

### Deferred to Follow-Up Work
- Multi-language support (currently Vietnamese only)
- Video background instead of 3D scene
- A/B testing variants
- Analytics tracking

## Key Technical Decisions

1. **Route**: `/discover` — new route in App.jsx, not replacing existing pages
2. **3D**: Use `three` directly (already in deps) with a React wrapper — lightweight, no Spline needed for this
3. **Styling**: Tailwind CSS with CSS modules for 3D canvas sizing, matching the dark theme from Header/Footer
4. **Layout**: Full-viewport sections with scroll-based reveal animations via GSAP ScrollTrigger
5. **No extra dependencies**: All required packages (three, gsap, @gsap/react) are already installed

## Implementation Units

### U1. Create Discover page component

- **Goal:** Build the main Discover page with 3D scene, hero content, feature cards, and CTA
- **Files:** `game-frontend/src/pages/Discover.jsx`, `game-frontend/src/assets/css/discover.css`
- **Approach:**
  - Hero: Full-screen viewport with Three.js canvas as background (floating 3D geometric shapes — tetrahedrons, octahedrons, icosahedrons — rotating slowly with mouse parallax)
  - Overlay text: "KHÁM PHÁ" large title, "MathQuest — Nơi tư duy trở thành thử thách" subtitle
  - Feature section: 3-column grid with glass-morphism cards (icon + title + description)
    - "Thử thách tư duy" — Brain-teasing puzzles
    - "Hệ thống RPG" — Coins, EXP, Levels
    - "Cộng đồng" — Friends, Guilds, Chat
  - CTA: "Bắt đầu hành trình" button → triggers auth modal
  - Footer: Minimal dark footer with MathQuest brand
- **Patterns to follow:** About.jsx for section layout and animation patterns, Home.jsx for game card grid styling
- **Test scenarios:**
  - Page renders without errors
  - 3D canvas loads and shows floating geometries
  - All sections are visible on scroll
  - CTA button triggers auth modal
  - Responsive: works on mobile (768px), tablet (1024px), desktop (1920px)

### U2. Add route and navigation integration

- **Goal:** Register `/discover` route in App.jsx, add nav link in Header
- **Files:** `game-frontend/src/App.jsx`, `game-frontend/src/components/Header.jsx`
- **Approach:**
  - Add `import Discover from './pages/Discover'` to App.jsx
  - Add `<Route path="/discover" element={<Discover />} />` to the Routes
  - Add "Khám Phá" link in Header navigation between Shop and Social
  - The page should have its own full-viewport layout (like About page) — no Header/Footer wrapper for immersive feel, or minimal overlay Header
- **Test scenarios:**
  - Navigating to `/discover` renders the page
  - Header nav link navigates to `/discover`
  - Back navigation works

### U3. Scroll-triggered animations with GSAP

- **Goal:** Smooth scroll-based reveal animations for sections
- **Files:** `game-frontend/src/pages/Discover.jsx`
- **Approach:**
  - Use `useGSAP` hook with ScrollTrigger plugin
  - Hero: fade-in on load
  - Feature cards: stagger reveal when scrolled into view
  - CTA section: slide-up with scale effect
- **Patterns to follow:** About.jsx `reveal-up` pattern using IntersectionObserver approach, or GSAP ScrollTrigger for more control

## Dependencies

- U1 → U2 (page must exist before routing)
- U1 → U3 (animations added after page structure)

## Verification

- Code compiles without errors
- `npm run lint` passes
- Page renders correctly at `/discover`
- 3D scene is visible and interactive
- All sections display on scroll
- CTA button works
