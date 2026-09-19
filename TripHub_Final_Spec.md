# TripHub — Final Build Spec (Bolt-Accurate)

*Supersedes all earlier spec docs. Everything marked "AS BUILT" is taken directly from Bolt screenshots. Everything marked "EXTRAPOLATED" follows the same design tokens/patterns but hasn't been visually confirmed in Bolt — flag these if Claude Code needs to match Bolt exactly rather than build fresh.*

---

## 1. Core mechanic (unchanged)

The app reacts to weather shifts affecting outdoor itinerary entries, surfacing a specific adjustment with reasoning — not a full replan, not silence.

## 2. Design tokens — AS BUILT

| Token | Observed value | Usage |
|---|---|---|
| Background | Light cool gray (`#F6F7F9`-ish) | App background |
| Surface | White | Cards, inputs |
| Ink | Near-black | Primary text, primary buttons |
| Slate | Mid-gray | Secondary text |
| Hairline | Light gray | Borders |
| Amber (nudge only) | Muted gold/tan wash + solid amber button | **Confirmed: appears exclusively on the nudge card and its primary action button. No other screen uses it.** |
| Deep blue | Used for active nav icon, links (e.g., "Assign outfit", "+ Add"), indoor/outdoor badges | |
| Red | Delete actions, error states, Log out | |

**Typography:** Serif display face (Fraunces or close match) for headlines/names, clean sans for body/UI — confirmed consistent across every screenshot.

---

## 3. Navigation — AS BUILT

- **No nav bar during onboarding** — confirmed across all 8 onboarding screens (phone entry through first-trip prompt).
- Nav appears for the first time on landing at Home: 4 icons — Home, Trips, Wardrobe, Profile.

---

## 4. Onboarding — AS BUILT, full flow confirmed

1. **Phone entry** — logo + "Your trips, weather-aware." tagline, phone input, "Send code" button.
2. **OTP entry** — 6-digit input, auto-focus/blue border on active state, "Verify" button, "Resend code (30s)" countdown link.
3. **OTP error state** — red border on input, inline error text "That code didn't match. Try again or resend."
4. **Notification permission** — bell icon, "Get told the moment your plans need a tweak.", "Allow notifications" (primary) + "Skip for now" (secondary, doesn't block progress).
5. **Persona capture** — "What's your travel style?", optional age input, travel tags as toggle chips (Adventurous / Chill / Pilgrimage / Family), "Continue" button (appears disabled/gray until a selection is made).
6. **First-trip prompt** — "Have a trip in mind?", two large tap targets: "Yes, plan a trip" and "Skip for now — Explore first, plan later." Tapping "Yes" expands the same screen inline to reveal Destination + "How many days?" fields and a "Start planning" button — **no navigation to a new screen, just inline expansion.** Tapping "Skip" instead reveals a "Take me to Home" button.

---

## 5. Home

### 5.1 Explore state — AS BUILT
- Header: "Hey there" + notification bell (top right, currently non-functional per your note — icon only for now)
- Search bar: "Search destinations" — **confirmed scope: searches a destination database by city or region, returns multiple matching results** (broader than just the curated seed list originally spec'd)
- "Picked for you" — 2-column image cards (destination photo, name, country, one-line description)
- "Coming up nearby" — event/festival cards (image, name, location, date)

### 5.2 Destination detail — AS BUILT (new screen, not in original spec)
- Hero image with destination name + country overlay
- Description paragraph
- Two info cards: "Best time to visit" and "Vibe" (shows matching persona tags, e.g., "Pilgrimage, Chill")
- "Highlights" bullet list
- "+ Add this to my trip" button (primary)
- "Plan a new trip here" link (secondary)

### 5.3 Add-to-trip bottom sheet — AS BUILT (new, not in original spec)
- Triggered from "Add this to my trip"
- Lists existing trips (name, day count, status) as tappable rows
- "+ Create a new trip instead" link at the bottom

### 5.4 Mid-planning state — EXTRAPOLATED
Not yet screenshotted. Should follow the same card pattern as other Home states: a card surfacing the incomplete trip with a "Continue planning" action. **Definition confirmed in conversation:** a trip counts as fully planned only when every itinerary day has entries *and* an outfit assigned — anything short of that is "Planning" status and should trigger this state.

### 5.5 Today state with nudge — AS BUILT
- Nudge card, amber wash, appears above the day's plan
- Weather icon + "Weather shift in [location]" title
- Reasoning paragraph (specific: names the affected activity, the suggested swap, and the outfit tweak)
- **Two preview chips shown before the user acts:** "Swap to: [suggested activity]" and "[Outfit tweak, e.g. Light layer added]" — a nice touch not in the original spec: shows exactly what *would* change before committing
- Two buttons: **"Dismiss"** (white/outline) and **"Accept adjustment"** (solid amber, primary) — note actual copy differs slightly from earlier spec draft ("Swap it"/"Keep as is"), use this copy going forward
- Below: "Your plan for today" — itinerary entries (time, title, indoor/outdoor badge), unchanged until the nudge is accepted

---

## 6. Trips — AS BUILT

### 6.1 Trip list
- "Your trips" header + circular "+" button
- Trip card: name, date range, status badge (e.g., "Ready"), **inline "Delete" link directly on the card** (not behind a menu) — confirmed this should route through a standard confirm/cancel modal before deleting (pattern, not custom per-screen)

### 6.2 New trip form
- Destination input
- "Multi-city trip" toggle — when on, reveals "Second destination" + "Start day for second city" fields inline (confirmed structure: continuous single itinerary, city changes per day range, not separate chapters)
- Start date / End date (YYYY-MM-DD format inputs)
- Budget — labeled "optional, helps us tailor suggestions"
- Travel tags (same chip component as onboarding)
- "Generate my itinerary" button (appears disabled/gray until required fields are filled)

### 6.3 Trip detail / itinerary
- Header: trip name + date range, chevron (implies a tappable expand/switch — behavior not yet confirmed, treat as the trip-switcher sheet from earlier spec unless corrected)
- Day tabs (Day 1, Day 2, ...), active day highlighted in deep blue
- City name shown above entries for the active day
- Entry card: time, title, indoor/outdoor badge, "Edit" link, trash/delete icon
- "+ Add entry" (dashed border button)
- "Outfit for Day X" card — empty state: shirt icon, "No outfit assigned for this day.", "Assign outfit" link
- "Regenerate" button
- "Share as PDF" button
- "Confirm, I'm ready" button (black, checkmark icon) — moves trip to Ready status, only meaningfully enabled once every day has entries + an outfit (per the mid-planning rule above)

### 6.4 Assign outfit picker — EXTRAPOLATED
Not yet screenshotted. **Confirmed behavior:** pulls from Wardrobe's already-saved outfit sets — a simple list/grid to pick from, no new outfit assembly happens here.

---

## 7. Wardrobe

### 7.1 Empty state — AS BUILT
- "Wardrobe" header + "+" button
- Shirt icon, "Add a few pieces to get outfit suggestions" (pieces = clothing item photos), "Add pieces" button

### 7.2 Populated state, upload flow — EXTRAPOLATED
Not yet screenshotted. Per spec: bulk upload capped at 4–6 images, fully automatic categorization (no manual picking), review step showing auto-assigned categories before confirming.

---

## 8. Profile — AS BUILT

- "Profile" header
- Avatar placeholder + "Add your name" / "Add your age" — **inline edit confirmed** (pencil icons, edit in place, no separate screen)
- "Travel tags" — **single flat list, freehand hashtag entry via "+ Add"** — confirmed this is simpler than the originally spec'd two-tier (locked persona vs. custom) system. One thing worth just being aware of, not a blocker: if a user removes their onboarding persona tags entirely and keeps only custom hashtags, there's nothing left for the recommendation engine to filter on — not fixing now, just flagging for later.
- "Preferences" — Dark mode toggle, Notifications toggle (**paused per your instruction — icon/toggle present, no functionality behind it yet**)
- "Account" — Log out (red text)

---

## 9. Still not screenshotted — extrapolate consistently, flag as non-Bolt-verified

- Wardrobe populated + upload flow
- Assign-outfit picker
- Notification bell tapped open
- Search results screen
- Any delete/edit confirmation modal (standard confirm/cancel pattern, not custom)
- Trip header chevron behavior (trip switcher, assumed)

---

## 10. Explicitly out of scope

- Meet fellow travelers
- Photo gallery / shared photo drive
- Live shareable itinerary links (PDF export only)
- Real expense/budget tracking (input signal only)
- Individual wardrobe piece-matching AI (saved outfit sets only)
- Email-based signup/login
- Notification granularity settings (paused, icon-only for now)
