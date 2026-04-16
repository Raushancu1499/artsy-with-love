# Artsy With Love | Premium Boutique E-Commerce Platform

**Artsy With Love** is a high-end, full-stack artisanal marketplace designed for luxury crochet gifting. The platform features an editorial-style design, a robust administrative backend, and containerized deployment infrastructure.

---

## 🚀 Quick Start Guide

### 1. Local Development (Standard)
**Backend:**
```bash
cd backend
npm install
npm start
```
**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 2. Running with Docker (Containerized)
The entire stack (Frontend + Backend) can be launched with a single command:
```bash
docker-compose up --build
```
- Access Frontend: `http://localhost:80`
- Access Backend API: `http://localhost:5000`

---

## 🛠 Technical Stack & Architecture

### **Frontend: Modern Editorial UI**
- **Framework**: React 19 + Vite (for ultra-fast HMR and building).
- **Styling**: Vanilla CSS with **Glassmorphism** effects and an **Editorial Design System** (mixing Serif/Sans-serif typography).
- **State Management**: React Context API for Cart and UI states.
- **Optimization**: Multi-stage Docker builds using **Nginx** for high-performance static file serving.

### **Backend: Robust API & Logic**
- **Server**: Node.js & Express.
- **Database**: MongoDB Atlas using Mongoose ODM.
- **Media**: Cloudinary Integration for handling custom order image uploads.
- **Payments**: Razorpay Integration (Test Mode) for secure artisanal transactions.

---

## 💎 Interviewer "Pro-Tips" (Technical Talk)

If an interviewer asks about the technical aspects, here are the key highlights to mention:

1. **"Cloud-Aware" Architecture**: 
   - *Explain*: "I implemented a dynamic API configuration utility that automatically detects if the app is running on `localhost` or a live production server like Render. This ensures zero-configuration deployments."

2. **Editorial Design Philosophy**: 
   - *Explain*: "The UI was built with a 'Boutique-First' mindset. I focused on left-aligned content (a luxury standard), generous whitespace (gutters), and a sophisticated color palette to differentiate it from generic e-commerce sites."

3. **Multi-Stage Dockerization**: 
   - *Explain*: "I used Docker multi-stage builds to keep the production images lean. The frontend is built in a Node environment but served via an Nginx container for maximum performance and security."

4. **Security & Data Integrity**: 
   - *Explain*: "I implemented strict environment variable management (using `.gitignore` and secret groups on Render) to ensure critical keys like MongoDB URIs and Razorpay secrets are never exposed to the public."

---

## 📝 Environment Variables
Create a `.env` file in the `backend` folder with the following:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
RAZORPAY_KEY_ID=your_id
RAZORPAY_KEY_SECRET=your_secret
```

---

## 📐 Project Structure
```text
├── frontend/             # React + Vite application
│   ├── src/config/api.js # Dynamic API environment logic
│   └── vercel.json       # Vercel Deployment Config
├── backend/              # Node.js + Express API
│   ├── models/           # Mongoose Schemas
│   └── Dockerfile        # Production Backend Image
├── docker-compose.yml    # Full-stack Orchestration
└── render.yaml           # Render Cloud Blueprint
```

---
**Developed with ❤️ for Artsy With Love.**
