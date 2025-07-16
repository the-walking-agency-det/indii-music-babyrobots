# Development Guide

## Setup

1. Create and activate virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Unix or MacOS
.venv\Scripts\activate     # On Windows
```

2. Install dependencies:
```bash
pip install -e ".[dev,test]"
```

3. Install pre-commit hooks:
```bash
pre-commit install
```

## Development Workflow

1. Create a new branch for your feature/fix:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes, following our code style guidelines:
- Use Black for code formatting
- Sort imports with isort
- Follow PEP 8 style guide
- Add type hints and docstrings

3. Run tests and linting:
```bash
# Run tests
pytest tests/

# Run linting tools
black .
isort .
flake8 .
mypy src/
```

4. Commit your changes:
```bash
git add .
git commit -m "Description of your changes"
```

5. Push your changes and create a pull request:
```bash
git push origin feature/your-feature-name
```

## Code Style Guidelines

- Use descriptive variable names
- Add docstrings to all public functions/classes
- Keep functions focused and single-purpose
- Write unit tests for new functionality
- Use type hints for better code clarity

## Pre-commit Hooks

We use pre-commit hooks to ensure code quality. These run automatically when you commit and include:
- Black (code formatting)
- isort (import sorting)
- flake8 (linting)
- mypy (type checking)
- Various file checks
