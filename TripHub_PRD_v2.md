# PRD: TripHub

**Status:** Draft v2 — supersedes the earlier 4-tab (Trips/Plan/Today/Photos) PRD and JTBD docs. Core mechanic (weather-reactive nudging) is unchanged; screen structure and several features have expanded.
**Owner:** [Your name]
**Last updated:** [Date]

---

## 1. Problem

Trip planning is fragmented, static, and puts too much on the user to remember.

- Most travelers juggle 5+ apps per trip; almost nobody uses a single place for everything.
- Packing and outfit decisions are disconnected from the actual day's plan or weather.
- Existing itinerary tools don't adapt — once set, they don't react when conditions change (weather, disruption). The user has to notice and fix it themselves.

## 2. Core mechanic (unchanged from v1)

The app reacts. When weather shifts enough to matter, it surfaces a small, specific adjustment (a layer, a swapped activity) with its reasoning shown — not a full replan, not silence. This is still the product's central differentiator; every screen below is either feeding this mechanic or built around it.

## 3. Target user

Solo or small-group travelers, 24–30, leaning adventurous — someone who already plans their own trips and wants one place to hold the plan, the packing, and the day-to-day adjustments together.

## 4. Screens & scope

### 4.1 Onboarding
- Phone number + OTP only — **no mandatory email anywhere in the product**
- Notification permission request
- Age + persona tags (adventurous / chill / pilgrimage / family) — no cap on tags, editable anytime from Profile
- Optional first-trip prompt (destination + duration) to avoid a blank first screen

### 4.2 Home — adaptive, three states
1. **No active or planned trip:** explore prompt — destination suggestions (curated, persona-tagged seed list), upcoming festivals/events, search scoped to that seed list.
2. **Trip planning started but unfinished:** a nudge to continue — "pick up where you left off."
3. **Trip active (including the evening before):**
   - **Day-ahead preview** (evening before a trip day): shows the next day's planned outfit and itinerary items, so prep happens the night before.
   - **Live today view** (once that day arrives): today's itinerary, today's outfit, and the weather-reactive nudge (auto-expanded with reasoning, Accept/Dismiss) when one fires.
   - Discovery content (suggestions, festivals) stays present but secondary — below trip status.
   - Trigger for switching into this state is **automatic**, based on the trip's stored dates — not a manual toggle.

   **Open question, not yet resolved:** if a second trip is being planned while one is active, does Home show only the active trip, or the active trip plus a smaller discovery/planning nudge for the upcoming one underneath?

### 4.3 Trips
- Trip list — Planning / Ready / Active / Completed
- Create trip — destination(s), dates, multi-city toggle, optional budget, preferences
- **Multi-city structure:** one continuous itinerary; city is a field per day/day-range (e.g., City 1 = days 1–3, City 2 = days 4–6), not separate itinerary "chapters."
- **Starter itinerary — real AI generation, not a curated seed list.** Built using the Claude API with web search enabled, so suggestions are grounded in current, real information rather than guessed from training data alone.
  - Flow: user enters trip details → loading state while generating → lands on an **editable draft**, not a final answer.
  - **Regenerate** is available, capped (e.g., 3 regenerations per trip) to control API cost — exact cap TBD at build time.
  - Budget is optional and only used as an input signal to the generation (e.g., suggest budget-appropriate spots) — **not** a real expense-tracking feature. Explicitly out of scope beyond that.
- Day-by-day itinerary — add/edit/delete entries, indoor/outdoor tag (required — feeds the weather engine)
- Outfit per day — pulled from Wardrobe (complete saved outfits, see below)
- **Share itinerary as a PDF export** for v1 — not a live shareable link (link-based sharing deferred)
- **All edits and deletes require a confirmation step** — deliberate friction to prevent accidental changes

### 4.4 Wardrobe
- **Bulk upload, capped at 4–6 images per upload action**
- **Fully automatic categorization** (workwear, casual, beach, summer, nightwear, etc.) — no manual category picking by the user
- **Suggestions are complete saved outfits** — the user assembles and saves outfit sets themselves; the app rotates/suggests from those sets. **Not** individual piece-matching (no "does this top go with these pants" AI) — deliberately kept out of scope as a harder, lower-value problem for v1.
- Edits/deletes require the same confirmation step as Trips
- Feeds directly into Trips' outfit assignment and Home's nudges

### 4.5 Profile
- Name, optional email, age — **inline edit**, no separate edit screen
- Persona tags — no cap, editable anytime
- Dark/light mode toggle
- Notification settings — **granularity still undecided** (single on/off vs. per-type control), intentionally parked, not blocking v1 build

---

## 5. Explicitly parked (not v1)

- **Meet fellow travelers** — matching/chat with other users by activity or profile. Real feature, real complexity (matching, chat, safety/moderation) — confirmed deferred.
- **Photo gallery / shared photo drive** — confirmed parked for a later version.
- **Live shareable itinerary links** — v1 ships PDF export only.
- **Notification granularity** — single open toggle question, not yet decided.

---

## 6. Technical notes

- **Itinerary generation uses the Claude API with the web search tool enabled**, so generated suggestions are grounded in current information rather than purely generated from training data. This meaningfully reduces (does not eliminate) the risk of confidently suggesting something inaccurate (e.g., a closed venue) — the editable-draft step is the safety net on top of that.
- Regeneration should be rate-limited per trip to control API token cost.
- Weather engine remains backend-only, no dedicated UI — same as originally scoped.

---

## 7. Open items before this is fully build-ready

1. Home's behavior with two overlapping trips (active + planning).
2. Notification granularity (single toggle vs. per-type).
3. Exact regeneration cap for starter itineraries.
4. Confirmation-step UI pattern — inline "are you sure" vs. a modal — same pattern should be reused everywhere it's needed (Trips and Wardrobe edits/deletes).

---

## 8. Next steps

1. Resolve the four open items above.
2. Data model: Trip, ItineraryDay (with city field), WardrobeItem, SavedOutfit, WeatherTrigger.
3. Design the generation prompt strategy for the Claude API call (what's fed in: persona tags, destination, dates, budget, preferences).
4. Wireframe the three Home states and the day-ahead preview specifically, since it's new since the last design pass.
5. Pick tech stack for the actual build.
