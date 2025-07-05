#!/bin/bash

# Development script to run both PocketBase and SvelteKit concurrently

echo "Starting MyRecipeBox development environment..."

# Function to cleanup background processes
cleanup() {
    echo "Shutting down services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap Ctrl+C and cleanup
trap cleanup SIGINT

# Start PocketBase in the background
echo "Starting PocketBase..."
cd pocketbase
./pocketbase serve --dev &
POCKETBASE_PID=$!

# Wait a moment for PocketBase to start
sleep 2

# Return to root directory
cd ..

# Start SvelteKit dev server
echo "Starting SvelteKit dev server..."
npm run dev

# If SvelteKit exits, cleanup
cleanup