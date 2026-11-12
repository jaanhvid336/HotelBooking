# Project Guidelines

## Project structure
- `frontend/` contains the React + TypeScript application.
- `backend/` contains the Java 17 + Spring Boot REST API.
- MySQL schema and sample data are managed by append-only Flyway migrations in `backend/src/main/resources/db/migration/`.

## Security
- Never commit passwords, tokens, private keys, or other credentials.
- Read database credentials from environment variables; do not put real values in tracked files, logs, or command output.
- Keep local `.env` files and other machine-specific configuration untracked.

## Build and validation
- Frontend: run `npm.cmd run build` and `npm.cmd run lint` from `frontend/`.
- Backend: run `mvn test` from `backend/` when Maven is available.
- Validate database changes with the project's Flyway migrations against a local MySQL instance when available.
- Report checks that could not be run and why.

## Implementation conventions
- Keep controllers, business logic, and persistence responsibilities separate.
- Validate booking rules on the backend; never trust client-provided totals or availability.
- Preserve existing behavior and keep changes scoped to the requested phase.
