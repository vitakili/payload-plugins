#!/bin/bash

# This script shows you exactly what needs to be fixed in your Next.js app
# after upgrading to @kilivi-dev/payloadcms-theme-management@0.1.9

echo "🔍 Searching for imports that need to be updated..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Find all files importing ServerThemeInjector from the wrong entry point
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Files that need to be updated:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Search for incorrect imports
grep -r "from '@kilivi-dev/payloadcms-theme-management'" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.js" . 2>/dev/null | \
grep "ServerThemeInjector" | \
while IFS=: read -r file line; do
  echo -e "${RED}❌ $file${NC}"
  echo "   Line: $line"
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "How to Fix:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Replace this:"
echo -e "${RED}import { ServerThemeInjector } from '@kilivi-dev/payloadcms-theme-management'${NC}"
echo ""
echo "With this:"
echo -e "${GREEN}import { ServerThemeInjector } from '@kilivi-dev/payloadcms-theme-management/server'${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Other exports you might need to update:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "These are now in /server entry:"
echo "  • ServerThemeInjector"
echo "  • getThemeCriticalCSS"
echo "  • getThemeCSS"
echo "  • getThemeCSSPath (deprecated)"
echo "  • generateThemePreloadLinks (deprecated)"
echo "  • createFallbackCriticalCSS"
echo ""
echo "These remain in main entry:"
echo "  • resolveThemeConfiguration ✅"
echo "  • generateThemeColorsCss ✅"
echo "  • generateThemeCSS ✅"
echo "  • getThemeStyles ✅"
echo "  • ThemeProvider ✅"
echo "  • fetchThemeConfiguration ✅"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Quick Fix Command:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Run this to automatically fix imports:"
echo ""
echo -e "${YELLOW}find . -type f \\( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.js' \\) -exec sed -i \"s|from '@kilivi-dev/payloadcms-theme-management'|from '@kilivi-dev/payloadcms-theme-management/server'|g\" {} + && grep -l ServerThemeInjector{}${NC}"
echo ""
echo "⚠️  WARNING: Review changes before committing!"
echo ""
