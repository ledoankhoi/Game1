---
title: 3D Landing Page with Three.js and GSAP
date: 2026-06-01
category: design-patterns
module: game-frontend
problem_type: design_pattern
component: frontend_stimulus
severity: low
applies_when:
  - Building immersive full-screen landing pages
  - Integrating Three.js 3D scenes with React
  - Adding scroll-triggered animations with GSAP
tags: [threejs, gsap, 3d, landing-page, react, scroll-animations]
---

# 3D Landing Page with Three.js and GSAP

## Context

MathQuest needed an engaging "Khám Phá Ngay" (Discover Now) landing page that introduces the platform with a 3D puzzle-solving aesthetic. The existing Home page is a game lobby, and the About page is text-heavy. A dedicated immersive landing page with floating geometric 3D shapes and scroll animations was required.

## Guidance

### 1. Route Architecture for Full-Screen Pages

Pages that need their own full-screen layout (no Header/Footer) should use a conditional early return in `App.jsx`:

```jsx
const isDiscoverPage = location.pathname === '/discover';

if (isDiscoverPage) {
  return (
    <Routes>
      <Route path="/discover" element={<Discover />} />
    </Routes>
  );
}
```

This pattern (matching the existing About page approach) avoids wrapping the immersive page in the app's header/footer.

### 2. Three.js Scene in React

Create a dedicated `ThreeScene` component that manages its own lifecycle inside a `useEffect`:

- Use a `containerRef` div for the renderer
- Clean up on unmount: dispose geometries, materials, renderer, and remove event listeners
- Use `useRef` for mutable data (mouse position, shapes) to avoid re-renders
- Track mouse position on `window` for parallax effects

### 3. GSAP Scroll Animations

Use `useGSAP` from `@gsap/react` with `ScrollTrigger` for scroll-based reveals:

- Register ScrollTrigger once at module level: `gsap.registerPlugin(ScrollTrigger)`
- Use `ScrollTrigger.create({ once: true })` for one-time animations on enter
- Stagger child elements with `delay: i * 0.15` pattern
- Separate `useGSAP` hooks for independent animation sequences (hero, features, CTA)

### 4. Dark Theme Glass-morphism Cards

Feature cards use `backdrop-blur-xl` with `bg-white/5` for a glass-morphism effect on dark backgrounds, with hover transitions for interactivity.

## Why This Matters

A well-crafted 3D landing page creates a strong first impression and communicates the product's identity before the user interacts with the game lobby. Separating the landing page from the app shell (Header/Footer) gives full creative control over the visual experience.

## When to Apply

- When creating a marketing/landing page that needs full-screen immersion
- When existing pages use Three.js/GSAP and you want consistency
- When the page should render without the main app layout (Header/Footer)

## Examples

**Discover page structure:**
```
/route:/discover
- ThreeScene (background 3D canvas)
  - Floating geometries: tetrahedron, octahedron, icosahedron, dodecahedron, torus knot
  - Mouse parallax + auto-rotation
  - Dark theme (#0a0a0f)
- Hero overlay (title, subtitle, CTA buttons)
- Features section (3 glass-morphism cards)
- CTA section (gradient card with button)
- Footer (minimal brand footer)
```

**Three.js setup with React:**
```jsx
useEffect(() => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, w/h, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  // ... add lights, shapes, animation loop
  
  return () => {
    // cleanup: dispose, remove listeners, cancel animation frame
  };
}, []);
```

## Related

- `docs/plans/2026-06-01-002-feat-landing-discover-plan.md`
- `game-frontend/src/pages/Discover.jsx`
- `game-frontend/src/App.jsx`
- `docs/solutions/design-patterns/`
