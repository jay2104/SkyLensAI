# **6. Components**

Our application can be understood as a system of five primary, interconnected components.

## **Web Application (Frontend)**

  * **Responsibility:** To provide the entire user interface, including the premium dashboard, data visualizations, and interactive elements.
  * **Technology Stack:** Next.js, React, Tailwind CSS, Shadcn/UI.

## **API Layer (Backend)**

  * **Responsibility:** To handle all incoming requests from the Web Application. It orchestrates business logic, validates data, and communicates with the database and other services.
  * **Technology Stack:** Next.js, tRPC, Prisma.

## **AI Analysis Service**

  * **Responsibility:** To perform the computationally intensive analysis of log files.
  * **Technology Stack:** Python, with libraries like Pandas, Scikit-learn, or PyTorch/TensorFlow.

## **Database Service**

  * **Responsibility:** To reliably store and retrieve all application data.
  * **Technology Stack:** Supabase (PostgreSQL).

## **File Storage Service**

  * **Responsibility:** To securely store and provide access to large, user-uploaded log files.
  * **Technology Stack:** Supabase Storage.
