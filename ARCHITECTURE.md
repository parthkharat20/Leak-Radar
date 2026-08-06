# 📐 LeakRadar System Architecture & Data Flow

This document details the high-level architecture, module dependencies, data processing pipeline, and deployment setup for **LeakRadar**.

---

## 🏗️ High-Level System Architecture Diagram

```mermaid
graph TD
    %% Styling
    classDef client fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#0369a1
    classDef security fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#b45309
    classDef core fill:#f3e8ff,stroke:#9333ea,stroke-width:2px,color:#6b21a8
    classDef ai fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#15803d
    classDef storage fill:#ffe4e6,stroke:#e11d48,stroke-width:2px,color:#9f1239
    classDef external fill:#f1f5f9,stroke:#475569,stroke-width:2px,color:#334155

    subgraph Client ["🖥️ Client Layer (Vite + React)"]
        UI["LeakRadar Dashboard UI"]
        Upload["File Dropzone / Text Ingestion"]
        DemoBtn["Load Demo Mode"]
        ActionModal["Cancellation & Negotiation Modals"]
    end

    subgraph Security ["🛡️ Security & Parsing Engine"]
        Parser["Multi-Strategy Document Parser<br/>(pdfplumber / pypdf / pytesseract OCR)"]
        PII["Local PII Redaction Engine<br/>(Scrub Cards, PAN, Phone, Email)"]
    end

    subgraph Backend ["⚡ Serverless Backend (FastAPI Python)"]
        AnalyzeEndpoint["/api/analyze & /api/upload"]
        Extractor["Transaction Extractor"]
        Detector["Subscription Detector & Cycle Math"]
        Scorer["Leak Scoring Engine (0-100)"]
        DemoSeeder["Demo Auto-Seeder (/api/demo/seed)"]
    end

    subgraph AI ["🧠 AI Intelligence (Groq LLaMA 3.3)"]
        GroqLLM["Groq LLaMA 3.3 Inference API"]
        RegexFallback["Heuristic Regex Fallback Parser"]
        EmailDrafter["AI Cancellation Email Drafter"]
        NegotiationBot["AI Negotiation Assistant"]
    end

    subgraph DataAction ["🗄️ Persistence & Dispatch"]
        SQLite[("SQLite Audit Vault<br/>(SQLAlchemy Models)")]
        SMTP["SMTP Gmail Dispatch Engine"]
    end

    subgraph External ["🌐 External Services"]
        VendorEmail["Vendor Customer Support"]
    end

    %% Flow Connections
    Upload --> Parser
    Parser --> PII
    DemoBtn --> DemoSeeder
    PII --> AnalyzeEndpoint
    AnalyzeEndpoint --> Extractor
    Extractor --> GroqLLM
    GroqLLM -- Fallback on offline/error --> RegexFallback
    Extractor --> Detector
    Detector --> Scorer
    Scorer --> SQLite
    DemoSeeder --> SQLite
    SQLite --> UI

    ActionModal --> EmailDrafter
    EmailDrafter --> GroqLLM
    ActionModal --> SMTP
    SMTP --> VendorEmail
    ActionModal --> NegotiationBot
    NegotiationBot --> GroqLLM

    class UI,Upload,DemoBtn,ActionModal client
    class Parser,PII security
    class AnalyzeEndpoint,Extractor,Detector,Scorer,DemoSeeder core
    class GroqLLM,RegexFallback,EmailDrafter,NegotiationBot ai
    class SQLite,SMTP storage
    class VendorEmail external
```

---

## 🔄 End-to-End Execution Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as React UI
    participant Redaction as PII Redactor
    participant FastAPI as FastAPI Backend
    participant Groq as Groq AI (LLaMA 3.3)
    participant DB as SQLite DB
    participant SMTP as SMTP Mailer

    User->>Frontend: Upload Bank Statement (PDF/CSV/Text)
    Frontend->>Redaction: Scrub Sensitive Data (Cards, PAN, Phone, Email)
    Redaction-->>Frontend: Cleaned Statement Payload
    Frontend->>FastAPI: POST /api/upload or /api/analyze
    FastAPI->>Groq: Prompt: Extract Recurring Transactions JSON
    alt Groq API Available
        Groq-->>FastAPI: JSON Array of Subscription Transactions
    else API Timeout / Rate Limit
        FastAPI->>FastAPI: Fallback Regex & Brand Keyword Matcher
    end
    FastAPI->>FastAPI: Detect Frequency, Price Hikes & Calculate Leak Score (0-100)
    FastAPI->>DB: Store Scored Subscriptions & Audit History
    DB-->>Frontend: Return Dashboard Stats & Action Recommendations
    Frontend-->>User: Render Interactive Leak Matrix & Cashflow Projections

    opt User Actions: Automated Email Cancellation
        User->>Frontend: Request Cancellation Draft
        Frontend->>FastAPI: GET /api/subscriptions/:id/draft-cancellation
        FastAPI->>Groq: Generate Professional Cancellation Email
        Groq-->>Frontend: Draft Email Body & Vendor Email
        User->>Frontend: Confirm Send
        Frontend->>FastAPI: POST /api/subscriptions/:id/send-cancellation
        FastAPI->>SMTP: Dispatch Email via Gmail SMTP
        SMTP-->>FastAPI: Delivery Confirmation
        FastAPI->>DB: Update Subscription Status to "Canceled"
        FastAPI-->>Frontend: Updated Savings & Dashboard Metrics
    end
```

---

## 🧩 Architectural Components Breakdown

### 1. **Client Layer (`frontend/`)**
- Built with **Vite + React 18**, **TailwindCSS**, and **Framer Motion**.
- State is managed via lightweight state hooks with responsive views:
  - **Landing View**: Hero, Feature Breakdown, Instant Demo Launcher.
  - **Dashboard View**: Financial Leak Overview, Savings Counter, Category Distribution, Cashflow Shock Projections, and Interactive Action Matrix.
  - **Modals**: Upload Modal, Cancellation Email Modal, AI Negotiation Chat Modal, and Downgrade Options Modal.

### 2. **Security & Ingestion Layer (`backend/utils.py` & `backend/main.py`)**
- **Multi-Strategy File Parsing**: Supports native PDF text extraction (`pdfplumber` layout-aware parsing + `pypdf` + `pdfminer`) and scanned image OCR (`pytesseract`).
- **Client-Side PII Scrubbing**: Redacts sensitive financial indicators before LLM processing:
  - 13–16 digit credit/debit card numbers
  - PAN cards (Indian tax identification)
  - Account & phone numbers
  - Non-whitelisted personal email addresses

### 3. **AI Intelligence Engine (`backend/extract.py` & `backend/score.py`)**
- **Groq LLaMA 3.3 Instant Model**: Converts unstructured financial text into structured JSON transaction objects.
- **Fail-safe Fallback Parser**: Heuristic regex engine that parses transaction lines if external API limits are exceeded.
- **Deterministic Leak Scoring Algorithm**:
  $$\text{Leak Score} = \text{Base} + \text{Price Hike Penalty} + \text{Duplicate Category Penalty} + \text{Unused Penalty}$$
  Ranging from 0 (Sealed Leak) to 100 (Critical Financial Waste).

### 4. **Persistence & Action Execution (`backend/database.py` & `models.py`)**
- **SQLite Database**: Lightweight persistent relational store mapped using SQLAlchemy ORM.
- **SMTP Email Dispatcher**: Automated SMTP integration for direct delivery of cancellation notices to vendors.

---

## ☁️ Serverless Deployment Architecture (Vercel)

- **Frontend Build**: Static SPA bundle deployed to Vercel CDN.
- **Backend API**: Python FastAPI application mounted via Vercel Serverless Functions (`backend/test_vercel.py` using `@vercel/python`).
- **Rewrite Rules** in `vercel.json` route `/api/*` requests directly to the FastAPI serverless instance.
