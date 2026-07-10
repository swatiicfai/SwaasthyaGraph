# 🩺 SwaasthyaGraph – Multilingual Family Health & Drug Interaction Network

> **HACKHAZARDS '26 Submission**

## 📌 Problem Statement

In India and across developing regions, families often manage chronic conditions across generations — diabetes in a parent, cardiac issues in a grandparent, hypertension in another. Drug interactions between medications taken by family members sharing a household are a **silent, dangerous risk**. Language barriers further prevent rural and semi-urban patients from accurately logging symptoms or understanding prescriptions.

**SwaasthyaGraph** solves this by building a **graph-powered, multilingual health intelligence network** that models familial health relationships, detects dangerous drug-drug interactions, and enables voice-based symptom logging in regional languages.

## 🎯 Theme(s)

- **03. HealthTech & Bio Platforms** — Core theme
- **01. Human Experience & Productivity** — Accessibility and personal health management

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **Mobile Frontend** | Expo (React Native) | Mobile-first patient interface |
| **Web Dashboard** | HTML, CSS, Vanilla JS | Interactive demo and graph visualizer |
| **Backend** | Node.js + Express | REST API server |
| **Database** | Neo4j AuraDB | Graph database for patient-drug-symptom relationships |
| **AI/NLP** | Sarvam AI APIs | Multilingual voice transcription and entity extraction |
| **Orchestration** | Render Workflows | Durable background pipelines for health analysis |
| **Prototyping** | Base44 | Rapid prototype flow configuration |

## 🏗️ Sponsored Tracks

- ✅ **Expo Track** — Mobile-first React Native application
- ✅ **Neo4j Track** — AuraDB as primary graph database
- ✅ **Sarvam Track** — Multilingual voice AI integration
- ✅ **Render Workflows Track** — Durable workflow orchestration
- ✅ **Base44 Track** — Prototype flow built with Base44

## ✨ Key Features

1. **Family Health Graph** — Visualizes patients, their familial relationships (parent/child/grandparent), active medications, and symptoms as an interactive graph.
2. **Drug Interaction Detection** — Automatically flags dangerous drug-drug interactions (e.g., Aspirin + Warfarin) when a new medication is added to any family member's record.
3. **Multilingual Voice Logging** — Speak in Hindi, Tamil, Telugu, or other regional languages to log symptoms and medications. Sarvam AI transcribes and extracts structured entities.
4. **Hereditary Risk Paths** — Graph traversal identifies inherited conditions across generations (e.g., grandfather's cardiac condition → father's diabetes → self's risk profile).
5. **Durable Health Workflows** — Background pipelines on Render Workflows periodically scan the family graph for emerging contraindication risks and generate health summaries.

## 📸 Screenshots

_Add screenshots of the working application here_

## 🎥 Demo Video

_Add public link to your demo video (under 5 minutes)_

## 🔗 Deployment Link

_Add deployment URL or APK download link here_

## 📊 Presentation

_Add link to your PPT (max 6 slides)_

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+)
- npm

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/swatiicfai/SwaasthyaGraph.git
cd SwaasthyaGraph

# 2. Install dependencies
npm install

# 3. Start the server
npm start

# 4. Open in browser
# Navigate to http://localhost:3000
```

## 🧑‍💻 Team

| Name | Role | GitHub | LinkedIn |
|:-----|:-----|:-------|:---------|
| Swati | Full Stack Developer | [@swatiicfai](https://github.com/swatiicfai) | [LinkedIn](https://linkedin.com/) |

## 🏆 What Makes This a Strong Submission

- **Real-world problem**: Drug interactions across family members is an underserved, high-impact health safety issue.
- **Graph-native architecture**: The problem is fundamentally about relationships — between people, drugs, symptoms, and conditions. A graph database is the natural fit.
- **Multilingual accessibility**: Voice input in regional languages removes literacy and language barriers for healthcare data entry.
- **Durable orchestration**: Background health analysis pipelines demonstrate production-grade reliability patterns.
- **Multi-track integration**: Meaningfully integrates Expo, Neo4j AuraDB, Sarvam AI, Render Workflows, and Base44.

---

### Made with ❤️ for HACKHAZARDS '26
