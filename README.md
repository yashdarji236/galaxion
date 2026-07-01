# Galaxion — Lunar Subsurface Ice Detection Mission Planning Console

Galaxion is a full-stack MERN (MongoDB, Express, React, Node) application developed for **ISRO's Bharatiya Antariksh Hackathon 2026 (Problem Statement PS-08)**. It serves as a Lunar Subsurface Ice Detection Mission Planning Dashboard to assist mission operators in evaluating Permanently Shadowed Regions (PSRs) at the lunar South Pole, optimizing radar thresholds, identifying landing sites, and planning rover traverse routes.

---

## 🛰️ Key Features

1. **Secure Access Portal (`/login`)**: Built-in starfield twinkle canvas animation. Protects all telemetry dashboard panels using JWT token-based auth.
2. **Interactive Lunar Crater Overlay (`/dashboard`)**: Full-screen interactive Leaflet.js map utilizing CartoDB Dark Matter tile layers, rendering Concentric Ice Probability Zones dynamically based on Circular Polarization Ratio (CPR) and Degree of Polarization (DOP).
3. **Dynamic Traverse Profile Charting**: Shows the planned rover traverse path descending from the safe landing zone into the crater floor using Recharts.
4. **Interactive Weight Score Modulator**: Real-time slider weights ($w_1, w_2, w_3$) to recalculate candidate landing scores under the formula: `score = w₁(ice) + w₂(slope) + w₃(solar)`.
5. **Simulated Radar Re-run Classifier**: Contacts the backend using a 2-second timeout, recalculating and returning updated ice boundaries, terrain slope profiles, roughness logs, and estimated water volumes ($10^6 \text{ m}^3$).
6. **Centralized Log Manager & Export**: Allows users to save telemetry runs to MongoDB or export the parameters instantly as a downloaded JSON file.
7. **Comprehensive Catalogue (`/craters`)**: Lists and searches all catalogued PSR targets (Faustini and Shackleton).

---

## 🛠️ Technology Stack

- **Frontend**: React.js, Leaflet.js, Recharts, Axios, React Router DOM, Vanilla CSS (futuristic space console styling)
- **Backend**: Node.js, Express.js (REST API)
- **Database**: MongoDB & Mongoose
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs

---

## 🚀 Getting Started

### 1. Database Requirements
Ensure **MongoDB** is running locally on your system at:
`mongodb://127.0.0.1:27017/galaxion`

### 2. Environment Configuration
Create or verify the `.env` file at the root of the `galaxion/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/galaxion
JWT_SECRET=galaxion_secret_key_2026_isro_bah_ps08
```

### 3. Running the Server (Backend)
Navigate to `/server`, install dependencies, run the database seed (automatic on server start, or manually run seed), and start the server:
```bash
cd server
npm install
npm run seed     # (Optional) Manual database seeding
npm start
```
The server will start at `http://localhost:5000`.

### 4. Running the Client (Frontend)
Navigate to `/client`, install dependencies, and start the development server:
```bash
cd client
npm install
npm run dev
```
Open your browser and navigate to the local URL (usually `http://localhost:5173`).

---

## 🔐 Credentials
To bypass authorization, login with:
* **Operator ID**: `admin@galaxion.dev`
* **Access Passphrase**: `galaxion2026`
