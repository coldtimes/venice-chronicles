# Git Setup - Fixed Instructions

## Problem: Bad Git Config Value

Your Git config has a corrupted value. Let's fix it!

## Solution:

### Step 1: Fix the Config
In Git Bash, run this command:
```bash
git config --global --unset core.longpaths
```

This removes the bad 'truee' value.

### Step 2: Navigate to Your Project
```bash
cd /c/Users/coldt/Downloads/venice-chronicles
```

### Step 3: Initialize Git (if not done)
```bash
git init
```

### Step 4: Add Files (Without node_modules)
Since node_modules is causing issues, and it's already in .gitignore:
```bash
git add .
```

### Step 5: Commit
```bash
git commit -m "Initial commit: Venice Chronicles story generator"
```

### Step 6: Add Remote (Replace YOUR_USERNAME)
```bash
git remote add origin https://github.com/YOUR_USERNAME/venice-chronicles.git
```

### Step 7: Push
```bash
git branch -M main
git push -u origin main
```

---

## If You Still Get Errors

Try this alternative approach - manually specify what to add:

```bash
git add *.tsx *.ts *.js *.json *.md *.css *.html *.bat
git add components/ hooks/ services/ electron/
git commit -m "Initial commit: Venice Chronicles story generator"
git remote add origin https://github.com/YOUR_USERNAME/venice-chronicles.git
git branch -M main
git push -u origin main
```

This avoids any problematic files.
