# **4. Technical Assumptions**

## **Repository Structure: Monorepo**
We will use a single "monorepo" to house both the frontend and backend code.
* **Rationale**: This approach is ideal for a full-stack application as it simplifies sharing code (like data types and validation logic) between the frontend and backend, ensuring consistency and speeding up development.

## **Service Architecture: Serverless**
The backend will be built using a serverless architecture (e.g., Vercel Functions, AWS Lambda, or similar).
* **Rationale**: This directly supports your critical constraint of minimizing initial costs. With a serverless model, you only pay for the computation time you use, which is close to zero when there are few users. It also scales automatically as your user base grows, eliminating the need to manage servers.

## **Testing Requirements: Full Testing Pyramid**
We will implement a comprehensive testing strategy that includes unit, integration, and end-to-end (E2E) tests.
* **Rationale**: To build the trust required for a paid tool, the application must be exceptionally reliable. A full testing pyramid ensures quality at every level, from individual functions to complete user journeys.
