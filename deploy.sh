#!/bin/bash

# Remove git lock if exists
rm -f .git/index.lock

# Add modified files
git add src/pages/Settings.tsx
git add src/components/tickets/TicketDetail.tsx
git add src/components/tickets/TicketList.tsx
git add src/lib/api.ts

# Commit with message
git commit -m "feat: Widget settings and ticket priority UI

- Widget Title & Subtitle in Settings
- Ticket Priority change dropdown
- API update method for tickets"

# Push to GitHub
git push origin main

echo "✅ Deploy completato!"
