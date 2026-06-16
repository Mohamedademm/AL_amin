# Project Structure

This file provides a high-level overview of the project's file organization. It must be updated whenever files or directories are added, removed, or moved.

## Directory Map

- `client/`: Frontend application (Vite + React + Tailwind)
  - `src/`: Source code
    - `assets/`: Static assets and images
    - `components/`: Reusable UI components (organized by feature: ui, common, layout, forms, etc.)
    - `context/`: React context providers for global state (e.g., Auth)
    - `hooks/`: Custom React hooks
    - `pages/`: Page-level components (organized by user role: owner, worker, employee, public)
    - `routes/`: Route definitions and guards (e.g., ProtectedRoute)
    - `services/`: API clients and external service integrations (includes axios config)
    - `types/`: TypeScript type definitions
    - `utils/`: Helper functions and utility libraries
  - `public/`: Static assets
- `server/`: Backend application (Node.js + Prisma + Express)
  - `src/`: Source code
    - `config/`: Environment and DB config
    - `lib/`: Third-party library setups
    - `middleware/`: Express middlewares (auth, error handling)
    - `modules/`: Domain-driven logic (separated by entity: auth, product, inventory, etc.)
    - `types/`: Server-side type definitions
    - `utils/`: Helper functions
- `docs/`: Project documentation
  - `sprint-1-plan.md`: Planned tasks for the first sprint
- `CLAUDE.md`: Project guidelines and behavioral skills
- `STRUCTURE.md`: This map
- `MEMORY.md`: (Internal) Project memory index
