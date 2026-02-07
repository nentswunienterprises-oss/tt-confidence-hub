# Brain Memory — Architecture

Answer these questions to document the long-term technical architecture and system design of your project.

## 1. System Overview

- **Draw or describe the high-level system architecture in text.** (What are the main components? How do they talk to each other?)
- **Is the system monolithic, microservices, serverless, or hybrid?**
- **What are the key data flows?**
- **What are the boundary lines between components?**

## 2. Backend

- **What language(s) and runtime(s) does the backend use?**
- **What framework(s) or libraries are core to the backend?**
- **How is the code organized?** (by domain, by layer, by service?)
- **What are the main services or modules?**
- **How do services communicate?** (API, message queue, direct calls, etc.)
- **What are the critical paths or hot spots?**
- **How is error handling and logging done?**

## 3. Database & Storage

- **What database(s) are used?** (relational, document, graph, cache, etc.)
- **How is the schema organized?**
- **Are there multiple databases or read/write replicas?**
- **How is data backed up and recovered?**
- **What are the data retention policies?**
- **How is sensitive data handled?** (encryption, hashing, etc.)
- **What are the current database bottlenecks or scaling challenges?**

## 4. Frontend

- **What framework(s) or libraries are used?** (React, Vue, Svelte, vanilla JS, etc.)
- **How is the UI organized?** (component tree, state management, routing)
- **What styling approach?** (CSS, SCSS, CSS-in-JS, Tailwind, etc.)
- **How is state managed?** (Redux, Vuex, Context, local state, etc.)
- **What are the main UI flows or journeys?**
- **How is the frontend built and deployed?**

## 5. APIs & Integrations

- **What APIs does your project expose?** (REST, GraphQL, WebSocket, gRPC, etc.)
- **Are there versioning strategies?**
- **What external APIs or services do you depend on?**
- **How are API authentication and authorization handled?**
- **What are the API rate limits and quotas?**
- **How is API documentation maintained?**

## 6. Infrastructure & Deployment

- **Where does the project run?** (cloud provider, on-prem, hybrid)
- **What deployment strategy is used?** (blue-green, canary, rolling, etc.)
- **How is infrastructure defined and managed?** (Infrastructure as Code, cloud console, etc.)
- **What CI/CD pipelines exist?**
- **What environments exist?** (dev, staging, production, etc.)
- **How are secrets and configuration managed?**
- **What monitoring and alerting is in place?**

## 7. Security

- **What are the main security concerns?**
- **How is authentication handled?** (OAuth, JWT, session-based, etc.)
- **How is authorization enforced?** (RBAC, ABAC, etc.)
- **Are there known vulnerabilities or pending security reviews?**
- **How is sensitive data encrypted in transit and at rest?**
- **What security testing is done?** (penetration testing, SAST, DAST, etc.)

## 8. Performance & Scalability

- **What are the performance targets?** (latency, throughput, etc.)
- **Where are the bottlenecks currently?**
- **How does the system scale?** (horizontal, vertical, caching, CDN, etc.)
- **What load testing has been done?**
- **Are there capacity limits?**
- **How is performance monitored and tracked?**

## 9. Testing Strategy

- **What types of tests exist?** (unit, integration, e2e, performance, security, etc.)
- **What is the test coverage?**
- **How are tests organized and run?**
- **What CI checks must pass before merge?**
- **How is test data managed?**
- **Are there known flaky tests or gaps in coverage?**

## 10. Disaster Recovery & Backup

- **What is the Recovery Time Objective (RTO)?**
- **What is the Recovery Point Objective (RPO)?**
- **How often are backups taken?**
- **Where are backups stored?**
- **When was the last recovery test?**
- **What is the incident response process?**
