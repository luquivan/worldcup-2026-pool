# Project State

Current base branch: `main`

Active feature branch: `feat/scoring-help`

What is already in the repo:

- Mobile app foundation with Expo, Firebase Auth/Realtime Database, and React Navigation.
- League flows: create, join, detail, selector, standings, and invite sharing.
- Auth hardening: email or username login, password reset, session persistence, neutral errors.
- Matches UX: next-match focus, team search, accent-insensitive search, localized team names.
- Scoring help entry: `?` button in the app header opens a modal with the current scoring rules.
- League admin UX: league detail can edit name and description, show members, copy/share invite, transfer ownership, remove members, delete/leave league.
- Current open note: the invite panel in league detail is now collapsible to avoid taking over the whole screen.

Important scoring rule currently documented in code and UI:

- Exact score: 6 points
- Close result: 3 points
- Correct winner or draw: 2 points
- Wrong result: 0 points
- Knockout penalty winner bonus: +1 point

Files to check first when resuming:

- `mobile/src/screens/app/LeagueDetailScreen.tsx`
- `mobile/src/navigation/AppNavigator.tsx`
- `mobile/src/screens/app/ScoringHelpScreen.tsx`
- `mobile/src/screens/app/LeagueSelectorScreen.tsx`
- `mobile/src/services/leagueService.ts`
- `functions/src/index.ts`

Validation already used successfully:

- `cd mobile && npx tsc --noEmit`
- `cd web && npm run build`
- Android Metro bundle responded `200`

Notes:

- `PROJECT_STATE.md` is the handoff checkpoint for continuing this work later.
- `mobile/TODO_GENERAL_FIXES.md` keeps the broader technical backlog and deployment notes.
