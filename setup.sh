#!/bin/bash

# Exit on error
set -e

echo "Setting up Indii Music Baby Robots project..."

# Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ORIGINS=http://localhost:3000
EOF
fi

# Setup git hooks
if [ -d .git ]; then
    echo "Setting up git hooks..."
    # Add pre-commit hook for linting
    cat > .git/hooks/pre-commit << EOF
#!/bin/bash
# Run Python linting
flake8 backend/
# Run frontend linting
npm run lint
EOF
    chmod +x .git/hooks/pre-commit
fi

echo "Setup complete! Next steps:"
echo "1. Update .env with your configuration"
echo "2. Start the backend: uvicorn backend.main:app --reload"
echo "3. Start the frontend: npm run dev"
