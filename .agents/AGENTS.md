# Pulse — Project Rules

## Mobile-First Responsive Design (MANDATORY)
- Every page, component, layout, and UI element MUST be fully responsive and mobile-screen compatible at all times.
- Use a mobile-first approach: design for small screens first, then scale up with breakpoints (`sm:`, `md:`, `lg:`, `xl:`).
- Never create desktop-only layouts. Sidebars must collapse on mobile, tables must stack or scroll, modals must be full-screen on small devices.
- This is a permanent, non-negotiable rule. It should never need to be mentioned again.

## Dark and Light Mode Compatibility (MANDATORY)
- The application supports both Dark and Light themes via `next-themes` and Tailwind's `dark:` modifier.
- Every new UI component, page layout, and styling update MUST explicitly support both modes.
- Avoid hardcoding static bright/dark colors unless semantically necessary (like badges). Use `dark:` variants for backgrounds, borders, texts, and elevations to ensure perfect contrast in both themes.
