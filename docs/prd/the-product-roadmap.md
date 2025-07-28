# **The Product Roadmap**

This section outlines the high-level epics that will take us from initial launch to the grander vision.

## **Epic 1: The Premium Visualizer & The Pro AI Teaser**
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

## **Epic 2: Building the Scalable "Virtual Expert" Pipeline**
**Epic Goal:** To build the core, scalable data processing and analysis engine, and to prime it with a massive initial dataset. This epic focuses on creating the powerful "brain" of the product and integrating the user feedback mechanism from the outset.

**Stories:**
* **Story 2.1:** As a developer, I want to build a robust, scalable pipeline to ingest and process text, images, and video from all target data sources (forums, GitHub, docs, etc.).
* **Story 2.2:** As a developer, I want to run the pipeline on an initial, massive batch of data to create the foundational Knowledge Graph.
* **Story 2.3:** As a Pro user, I want the AI Analyst to perform a deep, holistic assessment of my log file against its entire knowledge graph, so it can identify any number of potential issues, both common and rare.
* **Story 2.4:** As a Pro user, I want a simple button to indicate if an AI's proposed solution worked for me, so that I can help the system learn.
* **Story 2.5:** As a developer, I want the AI's confidence score to be influenced by the positive and negative user feedback we collect.

## **Epic 3: Advanced Tooling & The Pro User Experience**
**Epic Goal:** To build the suite of sophisticated features that cater to the needs of our professional and power users, making the Pro experience indispensable.

**Stories:**
* **Story 3.1:** As a Pro user, I want to be able to upload and compare two or more log files side-by-side to diagnose issues that occur across multiple flights.
* **Story 3.2:** As a Pro user, I want an "Advanced Query" interface with powerful filters (e.g., by hardware, software version, component), so I can perform deep research.
* **Story 3.3:** As a Pro user, I want a historical analysis view for a single vehicle to track the trend of key health metrics and identify degrading performance over time.
* **Story 3.4:** As a Pro user, I want to receive proactive alerts about potential issues found in my logs, even before I start looking for them.
* **Story 3.5:** As a Pro user, I want a "Simulation Mode" to test the potential impact of parameter changes before applying them to my vehicle.
* **Story 3.6:** As a Pro user, I want the AI to help me identify the root cause of an issue by correlating log data with my vehicle's specific software version and hardware components.

## **Future Vision: The "Enterprise" Tier**
**Epic Goal:** To deliver game-changing value for manufacturers and enterprise clients by providing tools for managing entire fleets of drones. This represents a distinct product tier beyond "Pro."

**Potential Features:**
* A private, secure dashboard for uploading logs from an entire fleet.
* Aggregate analytics and trends to identify common failure modes across products.
* Correlation of failures with specific hardware batches or software versions.
* Role-based access control for enterprise teams.
