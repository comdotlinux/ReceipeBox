#!/bin/bash

# Clear Database Script for Recipe Box
# This script clears all data from PocketBase for a fresh start

echo "🗑️  Clearing PocketBase database..."

# Check if PocketBase is running
if pgrep -f "pocketbase serve" > /dev/null; then
    echo "⚠️  PocketBase is currently running. Please stop it first."
    echo "   You can stop it with: pkill -f 'pocketbase serve'"
    echo "   Or press Ctrl+C in the terminal where it's running"
    exit 1
fi

# Remove the database file and related data
if [ -d "pocketbase/data" ]; then
    echo "📁 Removing database files..."
    rm -rf pocketbase/data/*
    echo "✅ Database cleared successfully!"
    echo ""
    echo "🚀 You can now restart PocketBase with:"
    echo "   npm run pocketbase"
    echo ""
    echo "🔧 After starting PocketBase, create your admin user at:"
    echo "   http://localhost:8090/_/"
else
    echo "❌ PocketBase data directory not found."
    echo "   Make sure you're in the project root directory."
    exit 1
fi