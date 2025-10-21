#!/bin/bash

echo "🎨 Starting CSS watcher..."

# Function to rebuild CSS
rebuild_css() {
    echo "🔄 Rebuilding CSS..."
    npx tailwindcss -i ./src/styles/tailwind.css -o ./src/styles/build.css --minify
    if [ $? -eq 0 ]; then
        echo "✅ CSS rebuilt successfully"
    else
        echo "❌ CSS build failed"
    fi
}

# Initial build
rebuild_css

# Watch for changes using inotifywait (Linux) or fswatch (macOS)
if command -v fswatch &> /dev/null; then
    echo "👀 Watching for changes with fswatch..."
    fswatch -o src/**/*.{ts,tsx,html} src/styles/tailwind.css | while read; do
        rebuild_css
    done
elif command -v inotifywait &> /dev/null; then
    echo "👀 Watching for changes with inotifywait..."
    while inotifywait -e modify -r src/; do
        rebuild_css
    done
else
    echo "⚠️  No file watcher found. Please install fswatch (macOS) or inotify-tools (Linux)"
    echo "   Or run 'pnpm build:css' manually when you add new classes"
    exit 1
fi
