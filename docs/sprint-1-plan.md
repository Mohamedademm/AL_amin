# Sprint 1 Plan

## Goal
Build the initial foundation for the Al Amine Management System by implementing secure user authentication, role-based access control, inventory CRUD operations, database setup, and JWT security.

## Scope
- Authentication flows for login, registration, and session validation
- Role management with role-aware permissions
- Inventory CRUD (create, read, update, delete) for products and stock items
- Database schema and migration support for users, roles, products, inventory, and related entities
- JWT-based authentication and authorization for protected backend APIs

## Deliverables
1. Database schema and initial seed data
2. Backend authentication APIs
3. Backend role management middleware
4. Backend inventory APIs
5. JWT token generation and validation
6. Protected routes for authenticated and role-restricted access

## Sprint 1 Backlog

### 1. Database Setup
- Define Prisma/PostgreSQL schema for:
  - User
  - Role
  - Product
  - InventoryBatch
  - Order (basic placeholder if needed)
- Configure database connection and environment variables
- Create migration files
- Add initial seed data for default roles and admin user

### 2. Authentication
- Implement `/api/auth/register`
- Implement `/api/auth/login`
- Implement `/api/auth/me`
- Implement `/api/auth/logout` or token invalidation pattern
- Use secure password hashing (bcrypt)
- Add validation for email, password, and required fields

### 3. JWT Security
- Generate JWT access tokens on login
- Store JWT secret in environment variables
- Validate tokens on protected routes
- Add token expiration and refresh strategy if desired
- Implement error handling for invalid or expired tokens

### 4. Role Management
- Define roles: `owner`, `worker`, `employee`, `visitor`
- Assign role on registration or via admin endpoint
- Create authorization middleware to check user role
- Protect inventory and admin routes based on role

### 5. Inventory CRUD
- Implement inventory endpoints:
  - `GET /api/products`
  - `GET /api/products/:id`
  - `POST /api/products`
  - `PUT /api/products/:id`
  - `DELETE /api/products/:id`
- Ensure only authorized roles can create, update, delete
- Add basic validation for inventory fields
- Return consistent JSON responses and errors

## Acceptance Criteria
- Database connects successfully and migrations run without errors
- User can register and login with valid credentials
- JWT is issued on login and verified on protected endpoints
- `/api/auth/me` returns the authenticated user and role
- Inventory endpoints work for authorized users
- Role-based middleware blocks unauthorized access
- Passwords are stored hashed
- Environment variables are used for sensitive settings

## Suggested Task Breakdown
1. `DB-001` Setup database connection and schema
2. `DB-002` Create migrations and seed default roles
3. `AUTH-001` Build registration endpoint with hashing
4. `AUTH-002` Build login endpoint and JWT issuance
5. `AUTH-003` Build current-user endpoint and token validation
6. `SEC-001` Implement JWT auth middleware
7. `ROLE-001` Implement role guard middleware
8. `INV-001` Build product listing and retrieval endpoints
9. `INV-002` Build product create/update/delete endpoints
10. `QA-001` Test protected routes and unauthorized access

## Notes
- Keep JWT secret and database credentials out of source control
- Start with backend functionality first, then wire frontend as needed
- Reuse shared middleware for auth and error handling
- Keep API payloads simple and consistent to support frontend integration

## Estimated Timeline
- Database + schema: 1 day
- Authentication + JWT: 1 day
- Role management: 0.5 day
- Inventory CRUD: 1 day
- Tests / validation / cleanup: 0.5 day

## Risks
- Missing role definitions can cause permission gaps
- JWT refresh support is not in this sprint unless needed
- Database migration issues may delay setup

## Recommended Next Step
- Implement backend auth and inventory endpoints first, then connect frontend forms and routes in later sprints.
