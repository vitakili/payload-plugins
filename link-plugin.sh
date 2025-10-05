#!/bin/bash

# Local Link Script for Theme Configuration Plugin
# This script helps you link the plugin to a local Payload project for testing

set -e

echo "🔗 Theme Configuration Plugin - Local Link Helper"
echo "=================================================="
echo ""

# Get the current directory
PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/packages/theme-management"

# Function to build the plugin
build_plugin() {
    echo "📦 Building the plugin..."
    cd "$PLUGIN_DIR"
    pnpm build
    echo "✅ Plugin built successfully!"
    echo ""
}

# Function to link the plugin globally
link_plugin() {
    echo "🔗 Linking plugin globally..."
    cd "$PLUGIN_DIR"
    pnpm link --global
    echo "✅ Plugin linked globally!"
    echo ""
    echo "📝 To use in your project, run:"
    echo "   cd /path/to/your/payload-project"
    echo "   pnpm link --global @payloadcms-plugins/theme-management"
    echo ""
}

# Function to unlink the plugin
unlink_plugin() {
    echo "🔓 Unlinking plugin..."
    cd "$PLUGIN_DIR"
    pnpm unlink --global
    echo "✅ Plugin unlinked!"
}

# Main menu
echo "What would you like to do?"
echo "1) Build and link the plugin"
echo "2) Just build the plugin"
echo "3) Just link the plugin (must be built first)"
echo "4) Unlink the plugin"
echo "5) Exit"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        build_plugin
        link_plugin
        ;;
    2)
        build_plugin
        ;;
    3)
        link_plugin
        ;;
    4)
        unlink_plugin
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo "✨ Done!"
