# Project Guidelines

## Behavioral Skills
### Grill with Docs
This is a rigorous interrogation process used during the design phase to stress-test plans against the project's documented decisions and actual code.

**Process:**
1. **Sequential Interrogation:** Ask singular questions one by one. Provide suggested answers to accelerate the process.
2. **Domain Awareness:** Refer to and maintain `CONTEXT.md` (a glossary of canonical terms) and ADRs (Architecture Decision Records).
3. **Term Precision:** Challenge any terminology that conflicts with the glossary. Replace vague language with precise canonical terms.
4. **Boundary Testing:** Apply specific scenarios to test the verify the boundaries of domain concepts.
5. **Verification:** Verify user claims against the actual codebase.
6. **Lazy Documentation:** 
   - Update `CONTEXT.md` immediately after resolving a term. It must be devoid of implementation details.
   - Create ADRs only for decisions that are hard to reverse, surprising, or involve significant trade-offs.
7. **Convergence:** Continue until a "shared understanding" is reached before proceeding to implementation.

### Write a Skill
A structured process for creating new, reusable skills to extend the agent's capabilities.
**Process:**
1. **Gather Requirements:** Define the skill's purpose, the specific problem it solves, and the desired outcome.
2. **Draft the Skill:** 
   - Create a `SKILL.md` launder under 100 lines.
   - Use `REFERENCE.md` or `scripts/` folder for deterministic operations or extensive documentation.
   - Write a concise third-person description (max 1024 characters) that clearly states the "capability this skill provides" and "Use when [specific triggers]".
3. **Review with User:** Review the draft with the user.

## Visual Identity (Cyber Serif Style)
The project follows the "Cyber Serif" design system. This blends classical editorial typography with futuristic tech elements.

**Design Tokens:**
- **Colors:**
  - Background: `#050505`
  - Accent: `#10b981` (Surgical accent)
  - Text: `#EBEBEB`
- **Typography:**
  - Headlines: `Newsreader` (Serif, stark styling, tight tracking)
  - Body: `Inter` (Sans)
  - Labels: `Space Grotesk` (All-caps, high-tracking)
- **UI Elements:**
  - Glassmorphism: 12px blur
  - Borders: Shimmer borders
  - Lighting: Radial-gradient spotlights and mouse-based spotlight tracking.
  - Radii: `3xl` or full-pill shapes for buttons.
- **Layout:**
  - Max-width: `7xl` (approx 1280px), 24px padding.
- **Motion:**
  - Weighted cubic-bezier animations for scroll reveals.

## Code Standards & Interaction
These rules apply to every code modification and interaction:
1. **Requirement Clarity:** Thoroughly analyze prompts. If any part is not 100% clear, ask clarifying questions before implementing.
2. **Professional Quality:** Code must be optimized, efficient, and professional.
3. **Function Documentation:** Every function must be preceded by a simple, one-line comment explaining its role and the necessity of its existence.
4. **API Documentation:** Any new or modified API endpoints (CRUD operations) must be documented in the project's `.md` files.
5. **Concise Communication:** Keep responses as short as possible. Avoid fluff, filler, or "nonsense" text.
6. **Structure Maintenance:** The `STRUCTURE.md` file must be updated immediately whenever the project's file or directory structure changes.
