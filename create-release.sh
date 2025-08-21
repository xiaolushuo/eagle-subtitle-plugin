#!/bin/bash

# GitHub Release Script for Eagle Subtitle Plugin

echo "🚀 Creating GitHub release..."

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first."
    echo "Visit: https://cli.github.com/"
    exit 1
fi

# Check if user is logged in
if ! gh auth status &> /dev/null; then
    echo "❌ Please login to GitHub first:"
    echo "gh auth login"
    exit 1
fi

# Variables
VERSION="1.0.0"
TITLE="Eagle 字幕插件 v$VERSION"
FILES=(dist/*.js dist/*.html dist/*.css dist/*.json dist/*.md)

# Create release
echo "📦 Creating release v$VERSION..."
gh release create "v$VERSION" \
    --title "$TITLE" \
    --notes-file "RELEASE_NOTES.md" \
    "${FILES[@]}"

echo "✅ Release created successfully!"
echo "🔗 View release at: https://github.com/yourusername/eagle-subtitle-plugin/releases/tag/v$VERSION"
