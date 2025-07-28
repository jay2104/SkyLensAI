# Product Requirements Document: SkyLensAI (Corrected Version)

## **1. Goals and Background Context**

**Background Context**

The current landscape of drone log analysis tools for Ardupilot and PX4 systems consists of free, developer-focused utilities that are powerful but not user-friendly. Users without deep technical expertise struggle to gain actionable insights, leading to extensive time spent on forums and trial-and-error diagnostics. This project aims to create a new category of tool that leverages AI to provide immediate, synthesized, and expert-level analysis for hobbyists, R&D professionals, and manufacturers alike, turning raw log data into clear, actionable solutions.

**Goals**

* Develop a "Virtual Expert" AI capable of diagnosing complex hardware and software issues from log data and other public sources.
* Create the best-in-class log visualization tool that is intuitive, fast, and superior to existing free alternatives.
* Build a trusted, value-led product that makes its premium AI features feel like an indispensable upgrade.
* Establish a system that can learn and improve over time by incorporating user feedback and new data.
* Generate a new revenue stream by offering a paid tool that provides value no free alternative can match.

**Change Log**

| Date | Version | Description | Author |
| :--- | :--- | :--- | :--- |
| 2025-07-27 | 1.1 | Corrected Epic 1 based on PO Checklist | John, PM |
| 2025-07-27 | 1.0 | Initial PRD draft creation | John, PM |

## **2. Requirements**

### **Functional Requirements**

* **FR1**: The system must allow users to upload Ardupilot and PX4 log files in their standard formats.
* **FR2**: The system must parse and display key flight data on a fast, interactive, and user-friendly set of graphs.
* **FR3**: The system must use an AI engine to analyze uploaded logs against a knowledge base derived from public data sources (forums, GitHub, docs, etc.).
* **FR4**: The system must present AI-generated insights to the user, including a confidence score for each diagnosis.
* **FR5**: The system must provide a clear and simple pathway for users to upgrade to a paid plan to access the full suite of AI analysis features.
* **FR6**: The system must allow users to create and manage an account.

### **Non-Functional Requirements**

* **NFR1**: The visualization interface must be significantly more responsive and intuitive than existing free tools.
* **NFR2**: The initial cloud infrastructure must be designed for low operational cost to support a free tier and validate market demand.
* **NFR3**: The architecture must be scalable to handle a significant increase in users and data processing post-product-market fit.
* **NFR4**: The AI's analysis and recommendations must be presented in a way that is trustworthy and easy for non-technical users to understand.
* **NFR5**: The system must be designed for high availability and reliability.

## **3. User Interface Design Goals**

### **Overall UX Vision**
The user experience must be clean, intuitive, and professional, designed to build trust with a technical audience. The primary goal is to transform complex log data into easily understandable insights. The UI should feel like a helpful expert partner, not a complex engineering tool.

### **Key Interaction Paradigms**
* **Guided Analysis:** The user journey is simple: upload a log, see a beautiful visualization, and receive clear insights.
* **Progressive Disclosure & Expert Views:** The default view is simple, with advanced views available for experts.
* **Trust Through Transparency:** AI insights are presented with confidence scores and source links.
* **Seamless Pro Experience:** Instead of gating a "report," paying users will "supercharge" the entire tool. Pro features will be integrated contextually throughout the interface—as new graph overlays, advanced analysis options, or deeper diagnostic tabs—which can be unlocked to transform the tool into its full-power mode.

## **4. Technical Assumptions**

### **Repository Structure: Monorepo**
We will use a single "monorepo" to house both the frontend and backend code.
* **Rationale**: This approach is ideal for a full-stack application as it simplifies sharing code (like data types and validation logic) between the frontend and backend, ensuring consistency and speeding up development.

### **Service Architecture: Serverless**
The backend will be built using a serverless architecture (e.g., Vercel Functions, AWS Lambda, or similar).
* **Rationale**: This directly supports your critical constraint of minimizing initial costs. With a serverless model, you only pay for the computation time you use, which is close to zero when there are few users. It also scales automatically as your user base grows, eliminating the need to manage servers.

### **Testing Requirements: Full Testing Pyramid**
We will implement a comprehensive testing strategy that includes unit, integration, and end-to-end (E2E) tests.
* **Rationale**: To build the trust required for a paid tool, the application must be exceptionally reliable. A full testing pyramid ensures quality at every level, from individual functions to complete user journeys.

## **5. Prerequisites & User Responsibilities**

Before development on Epic 1 can begin, the following accounts must be created and their credentials (API keys, environment variables) must be securely provided to the development team:

* **Supabase Account:** A new project must be created on Supabase to provide the PostgreSQL database and File Storage.
* **Stripe / Razorpay Accounts:** Accounts should be created to acquire the necessary API keys for future development of billing features.

## **The Product Roadmap**

This section outlines the high-level epics that will take us from initial launch to the grander vision.

### **Epic 1: The Premium Visualizer & The Pro AI Teaser**
**Epic Goal:** Launch the product by establishing it as the undisputed best free log visualizer on the market, while seamlessly presenting the AI Analyst as a compelling, must-have upgrade for users who need to solve problems, not just view data.

**Stories:**
* **Story 1.0 (New): Foundational Project Setup**
    * **As a** developer, **I want** to scaffold the new SkyLensAI project using the T3 Stack and connect it to our Supabase database, **so that** we have a solid, version-controlled foundation before building any features.
    * **Acceptance Criteria:**
        1.  The project is initialized using the `npx create-t3-app` command.
        2.  The initial project code is pushed to a new GitHub repository.
        3.  The Prisma schema is initialized and successfully pushed to the Supabase database, creating the initial tables.
        4.  The application can be run locally.

* **Story 1.1 (Formerly 1.1): Multi-Modal Data Input**
    * **As a** new user, **I want** a simple, browser-based interface to either upload a log file or type in my issue in plain text, **so that** I can begin my analysis using whatever information I have available.

* **Story 1.2 (Formerly 1.2): The "Vehicle Health" Premium Dashboard & Full Visualizer**
    * **As a** user who has uploaded a log, **I want** an exquisitely designed and performant dashboard of my vehicle's critical health indicators, with the full power to plot any data I choose, **so that** I can immediately assess my flight's performance with a tool that feels professional-grade.

* **Story 1.3 (Formerly 1.3): The Integrated "AI Analyst" Upgrade Path**
    * **As a** user of the free visualizer, **I want** to be made aware of the powerful AI analysis capabilities in a professional manner, **so that** I can choose to upgrade when I need to solve a specific, difficult problem.

* **Story 1.4 (Formerly 1.4): "Query the Virtual Expert" as a Pro Feature**
    * **As a** user, **I want** to ask the Virtual Expert a question in plain text, **so that** I can get a synthesized, expert-level answer without hunting through forums.

### **Epic 2: Building the Scalable "Virtual Expert" Pipeline**
**Epic Goal:** To build the core, scalable data processing and analysis engine, and to prime it with a massive initial dataset. This epic focuses on creating the powerful "brain" of the product and integrating the user feedback mechanism from the outset.

**Stories:**
* **Story 2.1:** As a developer, I want to build a robust, scalable pipeline to ingest and process text, images, and video from all target data sources (forums, GitHub, docs, etc.).
* **Story 2.2:** As a developer, I want to run the pipeline on an initial, massive batch of data to create the foundational Knowledge Graph.
* **Story 2.3:** As a Pro user, I want the AI Analyst to perform a deep, holistic assessment of my log file against its entire knowledge graph, so it can identify any number of potential issues, both common and rare.
* **Story 2.4:** As a Pro user, I want a simple button to indicate if an AI's proposed solution worked for me, so that I can help the system learn.
* **Story 2.5:** As a developer, I want the AI's confidence score to be influenced by the positive and negative user feedback we collect.

### **Epic 3: Advanced Tooling & The Pro User Experience**
**Epic Goal:** To build the suite of sophisticated features that cater to the needs of our professional and power users, making the Pro experience indispensable.

**Stories:**
* **Story 3.1:** As a Pro user, I want to be able to upload and compare two or more log files side-by-side to diagnose issues that occur across multiple flights.
* **Story 3.2:** As a Pro user, I want an "Advanced Query" interface with powerful filters (e.g., by hardware, software version, component), so I can perform deep research.
* **Story 3.3:** As a Pro user, I want a historical analysis view for a single vehicle to track the trend of key health metrics and identify degrading performance over time.
* **Story 3.4:** As a Pro user, I want to receive proactive alerts about potential issues found in my logs, even before I start looking for them.
* **Story 3.5:** As a Pro user, I want a "Simulation Mode" to test the potential impact of parameter changes before applying them to my vehicle.
* **Story 3.6:** As a Pro user, I want the AI to help me identify the root cause of an issue by correlating log data with my vehicle's specific software version and hardware components.

### **Future Vision: The "Enterprise" Tier**
**Epic Goal:** To deliver game-changing value for manufacturers and enterprise clients by providing tools for managing entire fleets of drones. This represents a distinct product tier beyond "Pro."

**Potential Features:**
* A private, secure dashboard for uploading logs from an entire fleet.
* Aggregate analytics and trends to identify common failure modes across products.
* Correlation of failures with specific hardware batches or software versions.
* Role-based access control for enterprise teams.

## **7. Checklist Results Report**

* **Previous Status:** CONDITIONAL GO
* **Current Status:** All critical issues identified in the PO Checklist report have been addressed in this corrected version of the PRD. The plan is now considered **APPROVED**.

## **8. Next Steps**

This PRD now serves as the foundational input for the next phases of development. Below are the official handoff prompts for the next specialists.

### **UX Expert Prompt**

"Sally (UX Expert), please take this completed Product Requirements Document as your input. Your task is to create the detailed UI/UX Specification. Pay close attention to the 'User Interface Design Goals' section and the detailed user stories within Epic 1 to guide your design of the wireframes, user flows, and component library for the 'Superior Baseline' experience."

### **Architect Prompt**

"Winston (Architect), please take this completed Product Requirements Document as your input. Your task is to create the comprehensive Architecture Document. The 'Technical Assumptions' section provides your high-level strategic direction (Serverless, Monorepo, TypeScript). Use the functional requirements and the detailed stories in Epic 1 to design the full system architecture, including the data models, service architecture, and a definitive tech stack."