#!/bin/bash

echo "====================================="
echo "Git Config Fix Script"
echo "====================================="
echo ""

# Remove the bad config value
echo "Removing corrupted git config..."
git config --global --unset core.longpaths
echo "Done!"
echo ""

# Navigate to project
cd /c/Users/coldt/Downloads/venice-chronicles

# Check if we're in a git repo
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
fi

# Add files
echo "Adding files to git..."
git add .

# Commit
echo "Creating commit..."
git commit -m "Initial commit: Venice Chronicles story generator"

echo ""
echo "====================================="
echo "Next steps:"
echo "1. Create repository on GitHub: https://github.com/new"
echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/venice-chronicles.git"
echo "3. Run: git branch -M main"
echo "4. Run: git push -u origin main"
echo "====================================="
