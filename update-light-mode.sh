#!/bin/bash

# Script to update dark containers to be light-mode responsive
# Replaces: bg-gradient-to-br from-slate-900 to-black
# With: bg-white/80 dark:bg-gradient-to-br dark:from-slate-900 dark:to-black

# Also updates borders and text colors to be responsive

files=(
  "resources/js/pages/admin/rekap-kehadiran.tsx"
  "resources/js/pages/admin/fraud-detection.tsx"
  "resources/js/pages/admin/notification-center.tsx"
  "resources/js/pages/admin/bulk-import.tsx"
  "resources/js/pages/admin/audit.tsx"
  "resources/js/pages/admin/activity-log.tsx"
)

for file in "${files[@]}"; do
  echo "Processing $file..."
  
  # Update container backgrounds (not header)
  # Stats cards, filter sections, tables
  sed -i '' 's/bg-gradient-to-br from-slate-900 to-black p-6/bg-white\/80 dark:bg-gradient-to-br dark:from-slate-900 dark:to-black p-6/g' "$file"
  
  # Update borders
  sed -i '' 's/border-slate-800\/50/border-slate-200\/70 dark:border-slate-800\/50/g' "$file"
  
  # Update text colors in containers
  sed -i '' 's/text-white">/text-slate-900 dark:text-white">/g' "$file"
  sed -i '' 's/text-slate-400/text-slate-600 dark:text-slate-400/g' "$file"
  
  echo "Done with $file"
done

echo "All files updated!"
