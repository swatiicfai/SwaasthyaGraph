# SwaasthyaGraph 🩺

[![Live Demo](https://img.shields.io/badge/Live-Demo-00ffff?style=for-the-badge&logo=vercel&logoColor=black)](https://swaasthyagraph.vercel.app/)
[![YouTube Demo](https://img.shields.io/badge/YouTube-Video_Pitch-ff0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/UkmfzeHTyqI)

> **Built for HACKHAZARDS '26**  
> *Every family deserves a health safety net. SwaasthyaGraph builds it — one graph at a time.*

---

## 📖 Overview

**SwaasthyaGraph** is a multilingual family health and drug interaction network built to protect families from dangerous medical oversights. 

In rural and semi-urban areas, fragmented medical records lead to adverse drug events. A grandfather might be prescribed Warfarin, and later given Aspirin by a different doctor, causing a severe bleeding risk. **SwaasthyaGraph** solves this by modeling the entire family's health data as a live graph database.

By allowing users to log symptoms and medications via **native language voice input** (Hindi, Tamil, Telugu), we remove the literacy and language barriers to entry. Background pipelines instantly analyze the data, traverse the family graph to find dangerous drug-drug interactions or hereditary risks, and dispatch SMS alerts.

## 🚀 Features

* 🕸️ **Live Family Graph**: Visualizes parents, children, and grandparents as nodes, linked to their medications and symptoms.
* 🗣️ **Multilingual Voice Logging**: Users simply speak in their native tongue (e.g., *"Mujhe sir dard hai"*). The AI automatically transcribes, translates to English, extracts the medical entities, and injects them into the graph.
* ⚠️ **Drug Interaction Engine**: Traverses the graph to find conflicting medications across the family history.
* ⚙️ **Durable Async Pipelines**: Background jobs ensure that complex ancestral risk checks and SMS dispatching never fail.
* 📱 **Mobile-First Client**: Built natively to feel like an app for end-users, while administrators view the rich dashboard.

---

## 🛠️ Tech Stack & Architecture (Hackathon Tracks)

This project was specifically architected to leverage the power of four phenomenal partner technologies:

### 1. Neo4j AuraDB (Database Track)
Neo4j acts as the core intelligence engine. Traditional relational databases struggle with complex, multi-generational medical inheritance queries. We use Neo4j AuraDB to natively model `CHILD_OF`, `PRESCRIBED`, and `EXPERIENCING` relationships. Cypher queries can traverse the graph in milliseconds to find active drug contraindications.

### 2. Sarvam AI (AI/NLP Track)
To make healthcare accessible in India, English typing cannot be the default. We integrated Sarvam AI to handle the end-to-end voice pipeline: speech-to-text -> translation -> entity extraction (identifying symptoms vs. drugs).

### 3. Render Workflows (Orchestration Track)
Medical alerts cannot fail. When new symptoms are logged, a webhook triggers a durable 4-step Render Workflow:
1. Analyze patient health metrics.
2. Scan the Neo4j graph for active drug conflicts.
3. Check ancestral hereditary risk paths.
4. Compile a clinical summary and dispatch an SMS alert.

### 4. Expo & React Native (Mobile Track)
The entire client side is built using Expo for cross-platform availability. The dashboard features an embedded Expo web simulator to demonstrate the native mobile feel of the patient-facing application.

### 5. Base44 (Prototyping)
Used for rapid API routing configurations to link Sarvam AI output triggers to Neo4j graph mutations.

---

## 💻 Running Locally

### Prerequisites
* Node.js (v18+)
* Neo4j AuraDB instance
* Sarvam AI API Key
* Render account

### Installation
```bash
# Clone the repository
git clone https://github.com/swatiicfai/SwaasthyaGraph.git
cd SwaasthyaGraph

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 🏆 HACKHAZARDS '26
This project was built with ❤️ over the course of the hackathon by Swati Gupta. We proudly submit this to the **HealthTech & Bio Platforms** and **Human Experience & Productivity** themes.
