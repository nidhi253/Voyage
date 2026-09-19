# TripHub — Screen-by-Screen Build Checklist

*What actually needs to get built on each screen, reflecting every decision made — including deferred items (push notifications, photos).*

---

## Onboarding
- [ ] **Temporary for dev only:** email/password sign-in used to unblock building everything else — swap this out for real Phone/OTP before considering onboarding done, not before
- [ ] Phone number input screen
- [ ] `supabase.auth.signInWithOtp()` call on submit
- [ ] OTP entry screen (6-digit input) + error state (wrong code) + resend with 30s cooldown
- [ ] `supabase.auth.verifyOtp()` on submit
- [ ] On first successful verification: insert a row into `profiles` if one doesn't exist yet
- [ ] Notification permission prompt (browser permission dialog only — no OneSignal wiring, that's deferred)
- [ ] Persona capture screen: age input + persona tag selection → writes to `profiles.persona_tags`
- [ ] First-trip prompt: inline-expanding destination + duration fields → creates a `trips` row and calls `generate-itinerary` if "Yes, plan a trip" is chosen

## Home

**Explore state**
- [ ] Fetch curated destination suggestions (needs a seed data source — decide: hardcoded list, or a small `destinations` table)
- [ ] Fetch upcoming festivals/events (same seed source)
- [ ] Search bar → queries a destination database, returns multiple results by city/region
- [ ] Destination detail page (hero, description, best time, vibe tags, highlights)
- [ ] "Add to trip" bottom sheet → lists existing trips or creates a new one

**Mid-planning state**
- [ ] Query trips where `status = 'planning'`
- [ ] Show "continue planning" card → links into that trip's detail screen

**Today state**
- [ ] Query the active trip (`status = 'active'`, today within date range) or the next upcoming day for the day-ahead preview
- [ ] Fetch today's/tomorrow's itinerary entries + assigned outfit
- [ ] Fetch pending nudges for this trip from `nudges` table
- [ ] Render nudge card (auto-expanded) if one exists
- [ ] "Accept adjustment" → update the linked `itinerary_entries` row, update `outfit_assignments`, set nudge status to `accepted`
- [ ] "Dismiss" → set nudge status to `dismissed`, no further prompt
- [ ] Notifications icon → simple list of nudges regardless of status, so nothing's lost if push isn't set up

## Trips

**Trip list**
- [ ] Fetch and display user's trips with status badges
- [ ] Inline delete → confirm/cancel modal → delete row on confirm

**New trip form**
- [ ] Destination, multi-city toggle (reveals second destination + start-day fields), start/end dates, optional budget, persona tags (defaults from profile, editable per-trip)
- [ ] "Generate my itinerary" → calls `generate-itinerary` Edge Function, loading state while it runs
- [ ] On success, land on Trip Detail with the editable draft

**Trip detail**
- [ ] Day tabs, city label per day (for multi-city trips)
- [ ] Itinerary entry CRUD: add, edit, delete — each edit/delete behind a confirm/cancel modal
- [ ] Indoor/outdoor tag required on every entry
- [ ] Local-suggestion chip while adding an entry (same curated source as Home)
- [ ] Outfit assignment per day → picks from `saved_outfits`
- [ ] "Regenerate" button → re-calls `generate-itinerary`, capped (decide exact number, e.g. 3 per trip)
- [ ] "Share as PDF" → generates a PDF export of the itinerary
- [ ] "Confirm, I'm ready" → validates every day has entries + an outfit, then updates trip status to `ready` (or `active` if start date has arrived)

## Wardrobe
- [ ] Empty state with "Add pieces" CTA
- [ ] Upload flow: select up to 6 images → upload to `wardrobe-images` storage bucket → call Claude API (vision) to auto-categorize → insert `wardrobe_items` rows
- [ ] Browse items by category
- [ ] Create a saved outfit: select items from wardrobe, name it, save to `saved_outfits`
- [ ] Edit/delete items and outfits — same confirm/cancel modal pattern as Trips

## Profile
- [ ] Inline edit name/age → update `profiles`
- [ ] Travel tags: freehand add/remove pills → update `profiles.persona_tags` / `custom_tags`
- [ ] Dark mode toggle → update `profiles.dark_mode`, apply theme in the UI
- [ ] Notifications toggle → UI only for now, no backend behavior yet (push is deferred)
- [ ] Log out → `supabase.auth.signOut()`

---

## Explicitly not built in this pass
- Push notification delivery (OneSignal) — nudges still work in-app, just no phone-buzzing delivery yet
- Photo gallery / shared photo drive
- Meet fellow travelers
- Live shareable itinerary links (PDF only)
