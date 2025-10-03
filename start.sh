#!/bin/bash

echo "🎬 Starting CineHub Development Server..."
echo ""
echo "Choose your preferred server:"
echo "1. Python HTTP Server (Port 8000)"
echo "2. Node.js Live Server (Port 3000) - Requires: npm install -g live-server"
echo "3. Open directly in browser"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "Starting Python server on http://localhost:8000"
        python3 -m http.server 8000 2>/dev/null || python -m http.server 8000
        ;;
    2)
        echo "Starting Live Server on http://localhost:3000"
        live-server --port=3000 --open=/index.html
        ;;
    3)
        echo "Opening index.html in default browser..."
        if command -v xdg-open > /dev/null; then
            xdg-open index.html
        elif command -v open > /dev/null; then
            open index.html
        else
            echo "Please open index.html manually in your browser"
        fi
        ;;
    *)
        echo "Invalid choice. Opening in browser..."
        if command -v xdg-open > /dev/null; then
            xdg-open index.html
        elif command -v open > /dev/null; then
            open index.html
        else
            echo "Please open index.html manually in your browser"
        fi
        ;;
esac