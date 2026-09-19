# TripHub — Final Tech Stack

*This is the definitive stack. Every prior "open item" from the Supabase spec is resolved below.*

---

## Frontend
- **React (Vite) + TypeScript**
- Deployed as a static site on **Vercel** or **Netlify** — mobile-optimized web app, not a native build
- Talks directly to Supabase for all standard CRUD (trips, itinerary, wardrobe, profile) — no custom backend needed for these
- Calls Supabase Edge Functions only for the two AI/scheduled-logic pieces below

## Backend
- **Supabase** — Postgres database, Auth, Storage, and Edge Functions, all in one project
- **Auth:** Phone + OTP via Supabase's Phone provider, connected to Twilio for SMS delivery
- **Storage:** private `wardrobe-images` bucket, one folder per user
- **No separate Node/Express server** — Edge Functions (Deno, TypeScript) cover the few things that need custom logic or a secret key

## AI — Anthropic Claude API (TypeScript SDK), used for two things
1. **Itinerary generation** — `generate-itinerary` Edge Function, web search tool enabled, grounds suggestions in current information
2. **Wardrobe categorization** — closes the open item from the Supabase spec. Uses Claude's vision capability: the uploaded photo is sent directly to the Claude API with a prompt asking it to classify the item into the fixed category set (Casual / Beachwear / Evening / Workwear / Nightwear / etc.). Reuses the same API key and infrastructure as itinerary generation — no separate ML service needed.

## Weather data — OpenWeatherMap
- Closes the open item on weather API choice
- Free tier supports hourly forecast granularity, which the significance-threshold logic needs
- Called from the `check-weather` scheduled Edge Function

## Push notifications — deferred for now
- **Not part of the current build.** Nudges still get created normally by `check-weather` and still populate the in-app notifications icon — that part doesn't depend on push at all, per the earlier product decision that the icon works regardless of push permission status.
- What's cut for now is only the *push delivery channel* (a phone buzzing while the app is closed) — OneSignal, VAPID keys, service workers, none of that needs to be touched yet.
- Revisit OneSignal later, once the core platform (auth, trips, wardrobe, itinerary generation, in-app nudges) is actually working end to end.

## Weather engine — starting significance threshold
- Closes the open item on threshold values
- **Starting rule (tune after real use, not fixed forever):** trigger a nudge if precipitation probability exceeds 50% during an outdoor entry's scheduled time window, **or** temperature swings more than 8°C from what the itinerary was originally planned against
- This is a deliberate first guess, not a validated number — expect to adjust once the app is actually used against real trips

---

## Full stack, one line each

| Layer | Choice |
|---|---|
| Frontend | React (Vite) + TypeScript |
| Hosting (frontend) | Vercel or Netlify |
| Database | Supabase (Postgres) |
| Auth | Supabase Phone/OTP + Twilio |
| Storage | Supabase Storage |
| Backend logic | Supabase Edge Functions (Deno/TypeScript) |
| AI (itinerary + categorization) | Claude API |
| Weather data | OpenWeatherMap |
| Push notifications | Deferred — in-app icon only for now |

**One language throughout: TypeScript** — frontend, Edge Functions, and all API calls.

---

## Nothing left open. Ready to move into actual setup:
1. Create the Supabase project, run the schema SQL, configure Phone auth + Twilio
2. Set up the Vite + React project, connect the Supabase client
3. Build onboarding end-to-end against real auth (proves the riskiest piece first)
4. Layer in Trips CRUD, then Wardrobe, then the two Edge Functions last
