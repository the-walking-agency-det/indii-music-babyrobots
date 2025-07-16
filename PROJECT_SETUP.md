# Indii Music Baby Robots Project Setup Guide

## Overview

This document outlines the setup process and development guidelines for the Indii Music Baby Robots project.

## Prerequisites

- Node.js (v18+)
- Python (3.11+)
- FastAPI
- Uvicorn
- React + Three.js/R3F stack

## Development Environment Setup

### 1. Backend Setup
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install backend dependencies
pip install "uvicorn[standard]" fastapi python-dotenv

# Start development server
uvicorn main:app --reload --env-file .env
```

### 2. Frontend Setup
```bash
# Install frontend dependencies
npm install
npm install @react-three/fiber @react-three/drei three

# Start development server
npm run dev
```

## Project Structure
```
├── backend/
│   ├── main.py
│   ├── agents/
│   │   ├── crew_runtime.py
│   │   └── art_agent.py
│   └── tools/
│       ├── mastering_mcp.py
│       └── art_mcp.py
├── frontend/
│   ├── main.html
│   ├── scripts/
│   │   └── toggle-pane.js
│   └── styles.css
├── setup.sh
├── README.md
└── requirements.txt
```

## Configuration
1. Copy `.env.example` to `.env`
2. Update environment variables with your local configuration
3. Never commit `.env` file (it's in .gitignore)

## Development Guidelines

### Backend (FastAPI)
- Follow PEP 8 style guide
- Use type hints consistently
- Implement error handling using FastAPI's HTTPException
- Document API endpoints using FastAPI's built-in Swagger

### Frontend (React + R3F)
- Use TypeScript for all new components
- Follow component-based architecture
- Implement responsive design using modern CSS features
- Use React Three Fiber (R3F) for 3D elements

### Testing
- Write tests for all new features
- Use pytest for backend testing
- Use React Testing Library for frontend testing
- Implement E2E tests using Playwright

### Security
- Follow Secure Vibe Coding principles
- Implement proper authentication/authorization
- Sanitize all inputs
- Use HTTPS in production
- Follow OWASP security guidelines

## Development Workflow
1. Create feature branch from main
2. Implement changes
3. Write/update tests
4. Run linting and formatting
5. Submit PR for review
6. Merge after approval

## Production Deployment
- Use Uvicorn in production with proper worker configuration
- Implement rate limiting and security headers
- Use proper SSL/TLS configuration
- Monitor performance and errors
- Implement proper logging

## Tooling
- Python formatter (black)
- ESLint + Prettier for frontend
- Git hooks for pre-commit checks

## Documentation
- Keep this setup guide updated
- Document all APIs
- Maintain component documentation
- Update README.md with new features

## Support
For questions or issues:
1. Check existing documentation
2. Review closed issues
3. Open new issue with detailed description

## License
[Add License Information]
