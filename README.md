# 🚀 LeakRadar: The Ultimate AI-Powered Subscription Manager

![LeakRadar Banner](https://img.shields.io/badge/LeakRadar-AI_Financial_Command_Center-6366f1?style=for-the-badge&logo=rocket)
![Status](https://img.shields.io/badge/Status-Live_on_Vercel-success?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

Welcome to **LeakRadar**, the most intelligent and beautifully designed subscription management platform! LeakRadar uses state-of-the-art AI (Groq LLaMA 3) to automatically scan your bank statements, find hidden subscriptions, detect price hikes, and send automated cancellation emails so you never waste money on dead subscriptions again. 💸✨

---

## 🌍 Live Demo
**Check out the live deployed project here:** 
👉 **[https://leakradar-eight.vercel.app/](https://leakradar-eight.vercel.app/)**

---

## ✨ Key Features
- **🤖 AI-Powered Extraction**: Upload any bank statement (PDF, CSV, or raw text) and our AI instantly extracts recurring charges, ignoring one-off purchases.
- **🛡️ Enterprise-Grade Privacy**: Built with a strict PII Redaction Pipeline. Your sensitive data (Card numbers, Phone numbers, account IDs) is securely scrubbed *before* it ever touches the AI.
- **📉 Intelligent Leak Scoring**: Get a unified "Leak Score" out of 100 based on unused services, overlap (e.g., Netflix + Amazon Prime), and recent price hikes. 
- **📧 AI Cancellation Drafter**: LeakRadar automatically drafts professional cancellation emails to vendors on your behalf and sends them directly via SMTP!
- **🔮 Cashflow Forecasting**: View beautiful, dynamic 30-day projections of your upcoming subscription renewals.
- **💎 Premium Glassmorphism UI**: A stunning, animated, responsive dark-mode interface built with React, Vite, and TailwindCSS.

---

## 🛠️ Tech Stack
### **Frontend**
- **React.js (Vite)** ⚛️ - Blazing fast frontend framework.
- **TailwindCSS** 🎨 - Utility-first styling for that premium glassmorphic look.
- **Lucide React** 💠 - Beautiful, consistent iconography.
- **Recharts** 📊 - Dynamic SVG charts for cashflow visualization.

### **Backend**
- **FastAPI (Python)** ⚡ - High-performance asynchronous backend API.
- **Groq AI (LLaMA 3)** 🧠 - Lightning-fast LLM for unstructured data processing.
- **SQLAlchemy** 🗄️ - SQLite database management for caching subscriptions.
- **PDFPlumber & PyTesseract** 📄 - Advanced OCR and PDF parsing.

### **Deployment**
- **Vercel** ▲ - Serverless deployment for both the Vite Frontend and Python FastAPI backend (using `@vercel/python`).

---

## 🚀 Getting Started (Local Development)

### 1. Clone the Repository
```bash
git clone https://github.com/parthkharat20/Innovex_R1.git
cd Innovex_R1/leakradar
```

### 2. Set Up the Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
Create a `.env` file inside the `backend` folder:
```env
GROQ_API_KEY=your_groq_api_key_here
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_google_app_password
```
Start the FastAPI server:
```bash
uvicorn main:app --reload
```

### 3. Set Up the Frontend
Open a new terminal window:
```bash
cd leakradar/frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173` in your browser! 🎉

---

## ☁️ Vercel Deployment Notes
This project is configured to run entirely on Vercel's serverless infrastructure via the `vercel.json` file.
- The **Frontend** is served statically from `frontend/dist`.
- The **Backend** is served as a Python Serverless Function from `backend/test_vercel.py`.
- **Environment Variables**: Make sure `GROQ_API_KEY`, `SMTP_EMAIL`, and `SMTP_PASSWORD` are added directly in your Vercel Project Settings across all environments!

---

## 🤝 Contributing
Feel free to fork the repository, make improvements, and submit a pull request! We are always looking for ways to make LeakRadar even better.

## 📝 License
This project is licensed under the MIT License. Built with ❤️ by the LeakRadar team.
