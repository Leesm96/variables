# Architecture Overview

## Frontend/Backend Selection
- **Frontend (FE):** React with TypeScript, bundled by Vite for fast development and SSR readiness. The project structure lives under `frontend/` and targets a static asset build suitable for CDN delivery.
- **Backend (BE):** Node.js with Express in TypeScript under `backend/`. It provides RESTful APIs, lightweight server-rendering hooks, and integrates with shared schemas for validation and typing.

## Deployment Approach
- **Mode:** Containerized single-server deployment for both FE asset serving and BE API hosting. The backend container serves API traffic and can proxy to CDN-hosted static assets. This simplifies operational overhead while supporting horizontal scaling via container orchestration (e.g., Kubernetes) if needed.
- **Alternative:** The architecture remains compatible with a serverless API layer (e.g., AWS Lambda) by reusing the shared request/response contracts in `shared/`, but the default target is a single long-running service for predictable performance and local development parity.

## Shared Contracts
- Common request/response interfaces live in `shared/schema.ts` and are imported by both `frontend/` and `backend/` codebases. These contracts back runtime validation on the server and typed client calls in the frontend.
