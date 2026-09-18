# ProjectMentor

## Purpose

ProjectMentor is an AI-powered software project review and interview preparation
platform.

Users can upload a software project or connect a GitHub repository.

The system analyzes the project structure, technologies, features, architecture,
testing, documentation and other relevant characteristics.

It provides:

- Project overview
- Architecture understanding
- Evidence-based findings
- Improvement suggestions
- Project-specific interview questions
- AI project assistant
- Adaptive interview preparation

## Core Principle

ProjectMentor is NOT simply a chatbot for code.

The main workflow is:

Understand → Review → Improve → Prepare

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- Tailwind CSS

### Backend
- Python
- FastAPI

### Database
- MySQL

### AI
- Groq

### RAG
- Chunking
- Embeddings
- Vector search
- Retrieval-Augmented Generation

### Version Control
- Git
- GitHub

## Important Security Principle

Uploaded repositories must be treated as untrusted data.

The system must analyze files without executing uploaded project code.