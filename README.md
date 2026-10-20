# 🦥 SlothOS — The AI That Works While You Don't

> **A local-first, privacy-respecting automation and anti-burnout assistant.**  
> *Built for Hacktoberfest Open-Source AI Challenge Week 3 ("Slow and Steady").*

[![Version](https://img.shields.io/badge/version-1.0.0-emerald.svg?style=flat-square)](file:///./frontend/package.json)
[![Python](https://img.shields.io/badge/python-3.10+-3776AB.svg?style=flat-square&logo=python&logoColor=white)](file:///./backend/requirements.txt)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat-square&logo=fastapi&logoColor=white)](file:///./backend/app/main.py)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg?style=flat-square&logo=react&logoColor=black)](file:///./frontend/package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg?style=flat-square&logo=typescript&logoColor=white)](file:///./frontend/tsconfig.json)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?style=flat-square&logo=tailwind-css&logoColor=white)](file:///./frontend/tailwind.config.js)
[![Ollama](https://img.shields.io/badge/Ollama-Local_SLM-black.svg?style=flat-square)](https://ollama.ai)
[![Privacy](https://img.shields.io/badge/Privacy-100%25_Local_Inference-2ea44f.svg?style=flat-square)](#-privacy--security-model)
[![Tests](https://img.shields.io/badge/tests-18%2F18_passed-brightgreen.svg?style=flat-square)](#-testing)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](file:///./LICENSE)

---

## 📖 Table of Contents

- [The Sloth Philosophy](#-the-sloth-philosophy)
- [Key Features](#-key-features)
  - [🦥 Anti-Burnout Dashboard](#-anti-burnout-dashboard)
  - [📁 Sloth Inbox File Cleaner](#-sloth-inbox-file-cleaner)
  - [☕ Lazy Morning Briefing](#-lazy-morning-briefing)
  - [🛋️ Procrastination Crusher & Starter Generator](#️-procrastination-crusher--starter-generator)
  - [📑 Local Document Assistant](#-local-document-assistant)
  - [🤖 Human-in-the-Loop Autopilot Queue](#-human-in-the-loop-autopilot-queue)
  - [📜 Activity History & Privacy Audit](#-activity-history--privacy-audit)
  - [⚙️ Dual-Engine Architecture & Offline Fallback](#-dual-engine-architecture--offline-fallback)
- [System Architecture](#-system-architecture)
- [Repository Structure](#-repository-structure)
- [Quick Start Guide](#-quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
  - [3. Local LLM Setup (Optional)](#3-local-llm-setup-optional)
- [Testing](#-testing)
- [API Reference](#-api-reference)
- [Privacy & Security Model](#-privacy--security-model)
- [Demo Workspace](#-demo-workspace)
- [🌐 Community Wisdom](#-community-wisdom)
- [License](#-license)

---

## 🌿 The Sloth Philosophy

Modern productivity tools weaponize urgency: streak counters, red badge notifications, gamified guilt, and cloud servers continuously indexing your private documents. 

**SlothOS flips the script.** Inspired by nature's master of energy conservation, SlothOS operates on three core principles:

1. **Friction is the Enemy, Not Laziness**: People don't abandon tasks because they are lazy; they abandon them because starting has too much cognitive friction. SlothOS decomposes daunting tasks into bite-sized 2-to-8-minute micro-actions and creates 50% ready starter drafts so you never face a terrifying blank screen.
2. **100% Local-First (Zero Cloud Leaks)**: Your messy downloads, bank invoices, meeting transcripts, and code snippets stay on your machine. All inference runs locally via [Ollama](https://ollama.ai) or our built-in deterministic heuristic engine. No API tokens, no telemetry, no monthly subscriptions.
3. **Calm, Human-in-the-Loop Control**: AI should propose, not impose. SlothOS features safety dry-runs, non-destructive collision avoidance, strict path sandboxing, and complete 1-click SQLite undo manifests.

---

## 🚀 Key Features

### 🦥 Anti-Burnout Dashboard
- **Live Productivity Metrics**: Tracks tasks completed, estimated hours/minutes of cognitive friction saved, files organized, and pending approvals.
- **Ambient Forest Aesthetics**: Bespoke dark and light modes styled with soothing sage greens, warm creams, and glassmorphism cards.
- **Instant Actions**: One-click jumps to clean messy downloads, generate morning digests, or review queued autopilot suggestions.

### 📁 Sloth Inbox File Cleaner
- **Smart Semantic Categorization**: Automatically categorizes chaotic directories into organized folders (`Finance`, `Academic`, `Code`, `Images`, `Documents`, and `Miscellaneous`).
- **Junk Tag Stripper**: Cleans redundant filename clutter (`final_v2_NEW`, `temp`, `copy`) and normalizes messy camera codes (`DSC_0912` $\to$ `Image_Vacation.jpg`).
- **Collision Avoidance**: Auto-increments duplicate targets (`invoice_1.pdf`, `invoice_2.pdf`) so no file is ever overwritten.
- **Dry-Run Preview**: Simulates the exact move and rename operations before writing to disk.
- **1-Click Undo Manifest**: Every execution writes an undo manifest to SQLite. Click "Undo" to restore all files to their original directories and safely prune created empty folders.
- **Strict Path Sandboxing**: Validates directories against root drives (`C:\`), system folders (`System32`, `etc`, `bin`), and blocks path traversal attempts.

### ☕ Lazy Morning Briefing
- **Multi-Source Synthesis**: Ingests messy notes, PDF reports (via PyPDF), and Slack/Discord chat exports.
- **Cognitive Load Protection**: Limits executive takeaways to a maximum of 5 high-impact bullet points.
- **Urgency-Scored Deadlines**: Parses upcoming commitments and marks urgent vs. low-priority items.
- **Unresolved Question Extraction**: Surfaces ambiguities needing clarification before your morning standup.

### 🛋️ Procrastination Crusher & Starter Generator
- **Anti-Guilt Decomposition**: Transforms intimidating projects ("File tax returns", "Write 20-page thesis chapter") into low-friction 2-to-8-minute micro-steps.
- **Gentle Behavioral Strategies**: Implements proven low-effort techniques like *"The Permission to Stop"*, *"The Three Bullets and a Cup of Tea"*, and *"Lowest Viable Diff"*.
- **Starter Asset Generation**: One-click generation of initial markdown skeletons, email drafts, or code scaffolds so you start with 50% of the work already done.

### 📑 Local Document Assistant
- **Local PDF & Text Processing**: Parse and transform documents directly from your workspace.
- **4 Focused Modes**:
  - `Summarize`: Generates concise executive summaries.
  - `Extract Deadlines`: Discovers dates, deliverables, and milestones.
  - `Convert to Checklist`: Turns unstructured bullet points into actionable `- [ ]` markdown checkboxes.
  - `Clean Markdown`: Formats messy fragments into well-structured, readable notes.

### 🤖 Human-in-the-Loop Autopilot Queue
- **Passive Automation**: Suggests routine maintenance tasks (cleaning bloated download folders, compiling weekly digests).
- **Review & Approve**: Every action requires explicit user authorization before execution. Nothing runs behind your back.

### 📜 Activity History & Privacy Audit
- **Transparent Local Ledger**: SQLite-backed history tracking all completed tasks, files moved, and seconds saved.
- **1-Click Ledger Purge**: Wipe history at any time for total privacy hygiene.

### ⚙️ Dual-Engine Architecture & Offline Fallback
- **Primary Engine**: Local open-weight LLMs served via Ollama (`qwen2.5-coder:7b`, `llama3.2`, `mistral`, `deepseek-r1`, etc.).
- **Zero-Dependency Fallback Engine**: If Ollama is not installed or offline, SlothOS switches to a deterministic heuristic NLP engine. All features (file sorting, briefing extraction, task crushing, and checklists) continue functioning without errors.

---

## 🏛 System Architecture

```mermaid
graph TD
    User([User / Browser]) <-->|HTTP / REST JSON| Frontend[React 18 + Vite + Tailwind CSS]
    
    subgraph Backend [FastAPI Application]
        Router[API Router /api]
        Router --> HealthAPI[/health & /stats]
        Router --> FilesAPI[/files: scan, propose, execute, undo]
        Router --> BriefingAPI[/briefing: generate]
        Router --> CrusherAPI[/crusher: crush, starter]
        Router --> DocsAPI[/documents: process]
        Router --> AutopilotAPI[/autopilot: queue, action]
        Router --> HistoryAPI[/history: view, clear]
        
        Sandbox[Path Sandboxing & Security]
        FilesAPI --> Sandbox
        
        Orchestrator[Service Orchestration Layer]
        FilesAPI & BriefingAPI & CrusherAPI & DocsAPI & AutopilotAPI --> Orchestrator
        
        subgraph Inference [Dual-Mode Intelligence]
            Ollama[Ollama Client :11434<br/>Open-Weight SLMs: Qwen 2.5 / Llama 3.2]
            Fallback[Deterministic Fallback Engine<br/>Regex Heuristics & Rule Extractors]
            Orchestrator -->|Online| Ollama
            Orchestrator -->|Offline / Timeout| Fallback
        end
        
        subgraph Storage [Local Persistence]
            DB[(SQLite Database<br/>slothos.db)]
            FS[(Local Sandboxed Filesystem<br/>Workspace & User Dirs)]
            Orchestrator --> DB
            Sandbox --> FS
        end
    end
```

---

## 📂 Repository Structure

```text
DEV3 challenge/
├── README.md                      # Comprehensive project documentation
├── pytest.ini                     # Pytest configuration and warning filters
├── create_samples.py              # Script to generate sample files in demo_workspace
├── demo_workspace/                # Safe sandboxed testing environment
│   ├── Messy_Downloads/          # Pre-seeded disorganized files (receipts, code, images, docs)
│   └── Notes_and_Chats/          # Sample team meeting logs, slack exports, and notes
├── backend/                       # FastAPI application & local services
│   ├── conftest.py                # Python test harness & sys.path configuration
│   ├── requirements.txt           # Python dependencies (FastAPI, Uvicorn, PyPDF, etc.)
│   ├── run.py                     # Convenience backend runner
│   ├── app/
│   │   ├── main.py                # FastAPI app initialization, CORS, lifespan
│   │   ├── config.py              # Application settings, path sandboxing rules
│   │   ├── database.py            # SQLite schema initialization (tasks, undo manifests)
│   │   ├── api/
│   │   │   ├── router.py          # Unified APIRouter
│   │   │   └── endpoints/         # Modular endpoint handlers
│   │   │       ├── health.py      # Health checks, runtime metrics, model switching
│   │   │       ├── files.py       # Scan, proposal, execution, and rollback
│   │   │       ├── briefing.py    # Multi-source briefing synthesis
│   │   │       ├── crusher.py     # Micro-task decomposition & starters
│   │   │       ├── documents.py   # PDF extraction & text processors
│   │   │       ├── autopilot.py   # Background queue management
│   │   │       └── history.py     # Task history and ledger purge
│   │   ├── models/
│   │   │   └── schemas.py         # Pydantic v2 validation models
│   │   └── services/
│   │       ├── file_organizer.py  # Path validation, category mapping, rename logic
│   │       ├── undo_manager.py    # Transaction rollback and directory restoration
│   │       ├── briefing_service.py# Multi-file parsing & summarization
│   │       ├── task_crusher.py    # Procrastination breakdown service
│   │       ├── document_assistant.py # Document processing service
│   │       ├── autopilot_service.py # Background task proposal & execution
│   │       ├── ollama_client.py   # Async HTTP client for Ollama LLM API
│   │       └── fallback_engine.py # Deterministic heuristic fallback engine
│   └── tests/                     # Automated test suite (18 unit & integration tests)
│       ├── test_api_endpoints.py  # FastAPI endpoint integration tests
│       ├── test_fallback_engine.py# Heuristic engine verification
│       ├── test_file_organizer.py # Scanning, collision resolution, dry-run safety
│       ├── test_path_traversal.py # Security sandbox validation
│       └── test_undo_manifest.py  # Move execution and rollback cycle verification
└── frontend/                      # React 18 + Vite + Tailwind CSS Single Page App
    ├── package.json               # Frontend dependencies & scripts
    ├── tsconfig.json              # TypeScript configuration
    ├── vite.config.ts             # Vite bundler settings
    ├── tailwind.config.js         # Custom palette (emerald, forest, cream)
    ├── public/                    # Static assets & illustrations
    │   ├── sloth_mascot.jpg       # Friendly sloth companion mascot
    │   └── sloth_sleep.jpg        # Sloth relaxing in hammock hero artwork
    └── src/
        ├── main.tsx               # React entry point
        ├── App.tsx                # App shell, navigation, dark mode provider
        ├── types/                 # Shared TypeScript interfaces
        ├── services/
        │   └── api.ts             # Typed REST API client
        ├── components/
        │   ├── Navbar.tsx         # Top navigation bar with status indicator
        │   └── PrivacyNotice.tsx  # Persistent local privacy guarantee badge
        └── views/
            ├── DashboardView.tsx         # HQ overview, stats, and fast actions
            ├── FileOrganizerView.tsx     # Inbox cleaner with dry-run and undo
            ├── MorningBriefingView.tsx   # Morning digest synthesizer
            ├── ProcrastinationView.tsx   # Anti-burnout micro-step planner
            ├── DocumentAssistantView.tsx # Local document intelligence tool
            ├── AutopilotView.tsx         # Human-in-the-loop task review queue
            ├── ActivityHistoryView.tsx   # SQLite audit trail & time saved
            └── SettingsView.tsx          # Ollama model manager & sandbox bounds
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Python**: Version `3.10` or higher installed
- **Node.js**: Version `18.0` or higher (with `npm`)
- **Ollama** *(Optional, recommended for AI features)*: Download and install from [ollama.ai](https://ollama.ai)

---

### 1. Backend Setup

Open a terminal in the project root:

```bash
# 1. Navigate to backend directory
cd backend

# 2. (Optional) Create and activate a Python virtual environment
python -m venv venv

# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On macOS / Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start the FastAPI server
python run.py
```

The backend server starts at **`http://127.0.0.1:8000`**.  
Interactive API Swagger documentation is available at **`http://127.0.0.1:8000/docs`**.

---

### 2. Frontend Setup

In a new terminal window:

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Start the Vite development server
npm run dev
```

Open your browser at **`http://localhost:5173`** to access SlothOS.

---

### 3. Local LLM Setup (Optional)

SlothOS is built to communicate natively with **Ollama**.

```bash
# 1. Start the Ollama background daemon (if not already running)
ollama serve

# 2. Pull a recommended small language model (e.g., Qwen 2.5 Coder or Llama 3.2)
ollama pull qwen2.5-coder:7b
# or:
ollama pull llama3.2

# 3. SlothOS will automatically detect the model on http://127.0.0.1:11434!
```

> **Note on Offline Operation**: If you do not have Ollama installed or running, SlothOS **automatically** activates its built-in **Deterministic Fallback Engine**. You can explore every single feature immediately with zero setup.

---

## 🧪 Testing

The test suite validates path security, file organization, collision resolution, undo manifests, API contracts, and fallback engines.

Run all tests from the repository root:

```bash
# Run pytest across the backend test suite
python -m pytest -v
```

### Test Coverage Highlights:
- **`test_path_traversal.py`**: Ensures root drives (`C:\`), empty paths, and protected OS directories (`Windows`, `System32`, `etc`) are blocked by the safety sandbox.
- **`test_file_organizer.py`**: Verifies folder scanning, duplicate collision resolution (`report.pdf` $\to$ `report_1.pdf` $\to$ `report_2.pdf`), and dry-run disk safety.
- **`test_undo_manifest.py`**: Confirms end-to-end file organization execution, SQLite undo tracking, file restoration to original locations, and automatic removal of empty category folders.
- **`test_fallback_engine.py`**: Tests deterministic heuristic file classification, briefing extraction, and micro-task generation.
- **`test_api_endpoints.py`**: Full HTTP integration testing with FastAPI `TestClient`.

---

## 🔌 API Reference

All API routes are prefixed under `/api`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check, active model, available Ollama models, and latency |
| `POST` | `/api/models/switch` | Dynamically switch active local LLM |
| `GET` | `/api/stats` | Aggregated metrics (completed tasks, minutes saved, files organized) |
| `POST` | `/api/files/scan` | Scan folder and list files with metadata |
| `POST` | `/api/files/propose` | Generate organization proposals with categorization and clean names |
| `POST` | `/api/files/execute` | Execute file moves and renames (supports `dry_run: true`) |
| `POST` | `/api/files/undo` | Revert file moves using SQLite undo manifest |
| `POST` | `/api/briefing/generate` | Synthesize key points, action items, and deadlines from text/files |
| `POST` | `/api/crusher/crush` | Break down overwhelming tasks into 2–8 minute micro-steps |
| `POST` | `/api/crusher/starter` | Generate 50% ready starter templates and code skeletons |
| `POST` | `/api/documents/process` | Process documents (summarize, extract deadlines, checklist, markdown) |
| `GET` | `/api/autopilot/queue` | Retrieve suggested background tasks awaiting user review |
| `POST` | `/api/autopilot/action` | Review autopilot task (`approve`, `reject`, or `execute`) |
| `GET` | `/api/history` | List task execution history and time savings |
| `DELETE`| `/api/history/clear` | Purge all task history for total privacy |

---

## 🛡️ Privacy & Security Model

SlothOS is built from the ground up for strict privacy and data preservation:

- **Zero Cloud Outbound Calls**: The application makes zero external API requests. All prompt tokens are processed locally on `127.0.0.1:11434` or via local Python code.
- **Filesystem Boundary Sandboxing**: The `FileOrganizerService` validates every target directory before scanning or moving files. Root drives (`C:\`, `/`) and critical operating system folders (`Windows`, `System32`, `Program Files`, `/bin`, `/etc`) are hard-blocked.
- **Non-Destructive Guarantee**: Files are moved rather than deleted. When a filename collision occurs, SlothOS calculates an incremented suffix (`file_1.ext`) to prevent overwriting existing data.
- **Transaction-Like Undo**: Operations log both original and target paths to the SQLite database. Any action can be reversed with a single click.

---

## 🧪 Demo Workspace

To test SlothOS without touching your real Downloads or Desktop folders, a pre-configured sandbox is provided in [`demo_workspace/`](file:///./demo_workspace):

- [`demo_workspace/Messy_Downloads/`](file:///./demo_workspace/Messy_Downloads): Contains sample messy receipts, code files, vacation photos, and draft documents.
- [`demo_workspace/Notes_and_Chats/`](file:///./demo_workspace/Notes_and_Chats): Contains realistic meeting notes, Slack chat exports, and client feedback.

To generate or refresh the demo files, run:
```bash
python create_samples.py
```

You can point the **File Organizer** or **Morning Briefing** directly to the relative or absolute path of `demo_workspace/Messy_Downloads` to see SlothOS in action immediately.

---

## 🌐 Community Wisdom

When building local-first, offline-capable AI applications with FastAPI and Ollama, developer experiences across the open-source community highlight several essential design patterns:

1. **Graceful Fallbacks for Local Daemon Availability**: As noted in community architectural discussions such as [*Building a Local LLM API Server with Ollama and FastAPI* on DEV](https://dev.to), local model runners can experience latency spikes, hardware memory constraints, or service outages. Implementing explicit timeouts (`httpx.AsyncClient(timeout=...)`) coupled with a deterministic heuristic fallback engine ensures that the application never freezes or shows dead spinners when Ollama is offline.
2. **Deterministic Rules for Structured Tasks**: Community guides on local AI agents emphasize separating high-risk unstructured generation from deterministic business logic. SlothOS follows this by combining AI-assisted categorization proposals with strict rule-based collision resolution and transactional SQLite undo manifests, ensuring zero data loss.
3. **Transparent Model Switching**: Providing real-time latency indicators and dynamic model hot-swapping enables users to easily switch between lightweight models (such as `qwen2.5-coder:7b` or `llama3.2`) based on their available VRAM and battery constraints.

---

## 📜 License

SlothOS is open-source software licensed under the **[MIT License](file:///./LICENSE)**.  
Built with ☕, patience, and minimum necessary effort for **Hacktoberfest Open-Source AI Challenge Week 3 ("Slow and Steady")**.
