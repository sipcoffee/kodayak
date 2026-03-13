# PWA Scoping Plan: Camera-Only PWA

## Status: ✅ IMPLEMENTED

## What Was Done

### Option A: Scoped PWA with Conditional Registration
Implemented as the primary approach.

### Option 2: Separate Client App Flow
Added mobile client app at `/m/` routes.

---

## Implementation Summary

### New Files Created

| File | Purpose |
|------|---------|
| `public/camera-manifest.json` | PWA manifest for camera (scope: `/c/`) |
| `public/app-manifest.json` | PWA manifest for client app (scope: `/m/`) |
| `public/camera-sw.js` | Service worker for camera with offline photo queue |
| `public/app-sw.js` | Service worker for client app with caching |
| `components/pwa/pwa-head.tsx` | Reusable PWA registration component |
| `app/m/layout.tsx` | Mobile client app layout |
| `app/m/page.tsx` | Mobile dashboard with shots remaining |
| `app/m/events/[id]/page.tsx` | Mobile event details page |

### Modified Files

| File | Change |
|------|--------|
| `public/manifest.json` | Reduced to minimal manifest (display: browser) - no PWA prompts |
| `app/layout.tsx` | Removed PWA meta tags and manifest link |
| `app/c/layout.tsx` | Added PWAHead component for camera PWA |

---

## How It Works Now

### Camera PWA (`/c/*`)
- **Manifest**: `/camera-manifest.json` with scope `/c/`
- **Service Worker**: `/camera-sw.js` with offline photo upload queue
- **Features**: Installable, offline support, photo queueing
- **Install prompt**: Only shows on `/c/[slug]` routes

### Client Mobile App (`/m/*`)
- **Manifest**: `/app-manifest.json` with scope `/m/`
- **Service Worker**: `/app-sw.js` with basic caching
- **Features**: Installable, caching for faster loads
- **Pages**:
  - `/m` - Dashboard with films, stats, active events
  - `/m/events/[id]` - Event details with shots remaining

### Main Site (`/`, `/pricing`, `/dashboard`, etc.)
- **Manifest**: Minimal `/manifest.json` with `display: browser`
- **No PWA prompts**: Users won't see "Add to Home Screen"
- **Regular web app**: Works as standard responsive website

---

## User Experience

### Guest (Event Attendee)
1. Scans QR code → lands on `/c/[event-slug]`
2. Sees "Add to Home Screen" prompt on mobile
3. Installs "Kodayak Camera" PWA
4. Camera app opens in standalone mode
5. Photos queue offline if connection drops

### Client (Event Organizer)
1. Logs in to regular website
2. Can access `/m` on mobile for quick access
3. Sees "Add to Home Screen" prompt for "Kodayak Manager"
4. Installs manager app for quick event monitoring
5. Dashboard shows films, shots remaining, active events

---

## Routes Overview

```
/ ............................ Marketing site (no PWA)
/pricing ..................... Pricing page (no PWA)
/dashboard ................... Full web dashboard (no PWA)
/events ...................... Events list (no PWA)
/events/[id] ................. Event details (no PWA)
/films ....................... Films inventory (no PWA)

/c/[slug] .................... Camera interface (PWA)
/c/[slug]/gallery ............ Gallery view (PWA)

/m ........................... Mobile dashboard (PWA)
/m/events/[id] ............... Mobile event details (PWA)
```
