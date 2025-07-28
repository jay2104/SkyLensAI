# **4. Data Models**

## **User**

  * **Purpose:** Represents an individual who has signed up for the application. This model will handle identity and subscription status.
  * **Key Attributes:**
      * `id`: (String) - Unique Identifier
      * `email`: (String) - User's email address, used for login
      * `name`: (String) - User's display name
      * `subscriptionTier`: (Enum: `FREE`, `PRO`, `ENTERPRISE`) - The user's current payment plan
      * `createdAt`: (DateTime) - Timestamp of account creation
      * `updatedAt`: (DateTime) - Timestamp of last update
  * **Relationships:**
      * A `User` can have many `LogFiles`.
      * A `User` can have many `AnalysisResults`.

## **LogFile**

  * **Purpose:** Represents a single drone log file uploaded by a user for analysis.
  * **Key Attributes:**
      * `id`: (String) - Unique Identifier
      * `fileName`: (String) - The original name of the uploaded file
      * `fileType`: (Enum: `BIN`, `LOG`, `TLOG`, `ULG`) - The detected format of the log
      * `uploadStatus`: (Enum: `PENDING`, `UPLOADED`, `PROCESSED`, `ERROR`) - The status of the file in our system
      * `fileSize`: (Integer) - File size in bytes
  * **Relationships:**
      * A `LogFile` belongs to one `User`.
      * A `LogFile` can have one `AnalysisResult`.

## **AnalysisResult**

  * **Purpose:** Stores the output of the AI analysis for a specific log file.
  * **Key Attributes:**
      * `id`: (String) - Unique Identifier
      * `status`: (Enum: `PENDING`, `COMPLETE`, `ERROR`) - The status of the AI analysis job
      * `healthScore`: (Integer) - An overall health score (e.g., 1-100) for the flight, if applicable.
      * `summary`: (String) - A high-level, human-readable summary of the findings.
      * `detailedFindings`: (JSON) - A structured JSON object containing all the detailed checks, their outcomes, and evidence.
  * **Relationships:**
      * An `AnalysisResult` belongs to one `LogFile`.
