🏥 TriagePro - Intelligent Hospital Resource Allocation System
Modex Assessment Submission | Candidate: [Your Name] | Project Type: Innovative Healthcare-Focused Backend & Frontend
🚀 Project Overview (The Innovation)
TriagePro is not a basic slot booking system; it is a Risk and Priority-Aware Triage System designed to dynamically manage hospital resources and prevent overcrowding. It addresses the challenge of high concurrency in a healthcare context where not all "seats" (time slots) are equal.
Key Innovations:
Priority Queue with Aging Algorithm: Patients are sorted by a score: (Severity * 10) + (Hours Waited * 2). This ensures critical cases are fast-tracked, while low-priority patients are guaranteed service through an "Aging Factor."
Atomic Concurrency Control: Uses PostgreSQL Transactions and Row-Level Locking (FOR UPDATE) to prevent double-dispatch of critical resources (e.g., Ambulances).
Departmental Routing: Patients are automatically routed to the correct specialization (Cardiology, Orthopedics, etc.) based on symptom analysis.
🛠️ Tech Stack
Component	Stack	Rationale
Backend	Node.js, Express.js (TypeScript), PostgreSQL	Node.js for high-concurrency event loop; Postgres for robust ACID properties and transactions.
Frontend	React.js (TypeScript), Tailwind CSS, Axios, React Router	React/TS for performance and type safety; Tailwind for professional UI/UX design.
Deployment	Render (Backend/DB), Vercel/Netlify (Frontend)	Chosen for ease of continuous deployment (CI/CD).
📦 Deliverables & Setup Instructions
The project is structured as a Monorepo containing two main directories:
triage-pro-backend/
triage-pro-frontend/
1. Local Setup
Prerequisites: Node.js (v18+), PostgreSQL, Git.
Clone the Repository:
code
Bash
git clone [YOUR-GITHUB-LINK]
cd [YOUR-REPO-NAME]
Database Setup:
Create a local PostgreSQL database named triage_db.
Run the schema/seed script provided in triage-pro-backend/database.sql to create all tables (doctors, patients, bookings, etc.).
Backend Setup:
code
Bash
cd triage-pro-backend
npm install
# Create a .env file with your local DB connection string (e.g., DATABASE_URL=...)
npm run dev
# Backend runs on http://localhost:5000
Frontend Setup:
code
Bash
cd ../triage-pro-frontend
npm install
# In src/services/api.ts, ensure API_URL is set to 'http://localhost:5000'
npm run dev
# Frontend runs on http://localhost:5173
2. Live Deployment Details
Component	Platform	Live URL
Backend API	Render	https://triageatdawn.onrender.com
Frontend App	Vercel/Netlify	[YOUR FINAL FRONTEND URL]
The Frontend is configured to communicate with the live Render Backend via the base URL: https://triageatdawn.onrender.com.
🧠 API Documentation (Swagger/Postman Collection Preferred)
All APIs are available at the base URL: [YOUR LIVE RENDER URL]
A. Patient Triage (The Main Endpoint)
Method	Endpoint	Description
POST	/triage	Primary Triage Submission. Registers patient, calculates severity_level, checks ambulance availability using FOR UPDATE lock, and adds patient to the correct department's priority queue.
Request Body Example:
code
JSON
{
  "name": "John Doe",
  "age": 45,
  "email": "john.doe@email.com",
  "history": "Hypertension",
  "symptoms": "severe chest pain and tightness" 
}
Response Body (includes Queue Transparency):
code
JSON
{
  "message": "Triage Complete",
  "specialization": "Cardiology",
  "severityLevel": 5,
  "ambulance": "Unit AMB-01 Dispatched",
  "queueDetails": {
    "position": 1,
    "estimatedWaitMins": 15,
    "availableAmbulances": 2
  }
}
B. Doctor Operations
Method	Endpoint	Description
GET	/doctor/queue	Priority Queue View. Fetches all QUEUED patients for a specific doctor, sorted by the Priority Score. Automatically refreshes every 5 seconds on the frontend (polling).
Request Query Params:
doctorId: [1, 2, or 3] (e.g., ?doctorId=2 for Dr. Hart - Cardiology)
C. Admin Operations (Minimal)
Method	Endpoint	Description
POST	/admin/shifts	Creates a Doctor's shift and automatically generates 15-minute slots in the database.
🛑 Assumptions & Known Limitations
Doctor Capacity: For simplicity, the Estimated Wait Time is calculated assuming a constant 15 minutes per patient, not factoring in actual doctor load/complexity (future feature).
Authentication: Basic mock authentication is assumed; no real JWT/Session management is implemented.
Slot Booking: The system is Queue-first (triage), not Slot-first (RedBus). The old /bookings and /shifts endpoints are kept for technical compliance but are not part of the core innovative Triage flow.
