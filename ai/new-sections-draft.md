# Draft: extra guideline sections and additions

> **This file is a draft. The AI never reads it.** I put it here, separate from `ai/guidelines.md`, so we don't overwrite
> each other while you're editing that file.
>
> **How to use it:**
> 1. Read it, change anything you disagree with.
> 2. Copy a whole section (from its `##` heading down to just before the next `##`) into `ai/guidelines.md`.
>    The heading must stay exactly as written, because the heading is how the app knows which feature it's for.
> 3. For the "Additions" at the bottom, copy the bullets under the matching existing section's **Guidance**.
> 4. Run `npm run guidelines`, then redeploy.
>
> The numbers in the weather and forecast sections (heat, cold) are guidance for the AI's wording. The actual alert
> thresholds live in the code and we'll set them when the weather feature is built.

---

## Destination guides

> Not built yet. When it is: someone searches for an Indian place we don't have, the AI researches it on the web and
> writes the page (description, best time, highlights, things to do). It's saved once and shared with everyone.

### Guidance

- Write about real places in India only. If you can't confirm the place exists, say so instead of writing a guide.
- The description is two or three warm, concrete sentences: what the place feels like, what it's known for, and who it suits. No hype or clichés such as "hidden gem", "must-visit" or "paradise".
- Best time to visit: give the months and a one-line reason (weather, a festival, crowds). Be honest about monsoon, extreme heat and cold.
- Highlights: four to six specific, named places or experiences, not categories like "temples".
- Things to do: group by interest (food, history, nature, spiritual, shopping) when it helps, and include one or two lesser-known local options.
- Add practical notes only when you're sure: how to get around, permits for protected areas, dress codes at sacred sites, weekly closing days.
- Use only facts found in the search results. If sources disagree or look old, leave the detail out or say "check locally".
- Never invent opening hours, prices or distances. Use rough ranges ("about two hours by road") only when confident.
- Stay neutral and respectful about religion, communities and regions. No stereotypes.
- Keep every guide a similar length and shape so they feel like one app.

### Your notes

- (add yours here)

## Describing a piece from its photo

> Not built yet. When it is: once, when a photo is uploaded, the AI writes a short description that is saved with the
> piece. Outfit combinations and outfit picks then work from that text, which is cheaper and better than re-reading photos.

### Guidance

- Write one short line, under ten words: colour first, then fabric if it's clearly visible, then the garment, then the style. For example "Navy cotton kurta, casual".
- Name the main colour plainly (navy, rust, off-white). Mention a pattern only if it's obvious (floral, striped, block print).
- Say how formal the piece is: casual, smart casual, festive or formal.
- Use familiar words for Indian clothing: kurta, kurti, saree, dupatta, salwar, lehenga, sherwani, juttis.
- Describe only the clothing. Ignore people, faces and backgrounds. Never comment on bodies or guess who someone is.
- Don't guess brands, prices or sizes.
- If the photo is too blurry or unclear, write "unclear" instead of guessing.

### Your notes

- (add yours here)

## Forecast-based outfit refresh

> Not built yet. When it is: a few days before the trip, the real weather forecast is checked and the day's outfit pick is
> adjusted if needed. Forecasts only exist for the next few days, so this runs close to the trip, not when you first plan.

### Guidance

- Only use outfits the traveller already has. Never suggest buying something.
- Change an outfit only when the forecast really calls for it (rain, strong heat, real cold, strong wind in the mountains). Otherwise leave it alone.
- Explain the change in one short line, for example "Rain expected from 2pm, so we picked your quick-drying outfit."
- Heat: the lightest, most breathable outfit. Cold: the warmest, most layered. Rain: quick-drying, and an outfit with a jacket if there is one.
- Keep the modesty rules for sacred sites even in hot weather.
- If no outfit suits, say what to pack from what they own, or say nothing.
- Keep the tone calm and practical. Never alarming.

### Your notes

- (add yours here)

---

# Suggested additions to the sections you already have

> Copy any of these bullets under **Guidance** in the matching section of `ai/guidelines.md`.

## Add under "For every AI feature"

- Be honest about uncertainty. Say less rather than invent something.
- Respect religion and local customs. No stereotypes, and no assumptions about someone's age or gender.
- Mention safety only where it matters (for example, avoid suggesting isolated places late at night), and keep it brief.
- When the traveller mentions children, older relatives or mobility needs, prefer easier, more accessible options.
- Give prices in rupees, as rough rounded ranges.
- Use simple, friendly English with the common spelling of local names.

## Add under "Itinerary planning"

- Treat the budget as the total for the whole trip. Mix free or low-cost plans with the paid ones, and say when one plan uses up a large share.
- With children or older travellers, plan shorter days, fewer stairs and regular rest breaks.
- If a festival falls during the trip, include it as a plan or warn about crowds and closures.
- On a relaxed pace, leave real free time. Don't fill every gap.
- Don't plan long transfers on the first or last day unless the route needs it.
- Put the traveller's own wishes in first, then fill around them.

## Add under "Outfit combinations from your wardrobe"

- Each outfit is one top and one bottom (or a dress or one-piece), with optional outerwear, shoes and accessories.
- Pair neutral pieces with one colourful piece. Avoid clashing patterns and keep the formality consistent.
- Give each suggestion a short, descriptive name such as "Easy beach day" or "Temple morning".
- Suggest three to six, each for a different occasion.
- For cold or wet places, think in layers.

## Add under "Weather alerts"

- Alert only when the weather really changes a plan, and never repeat the same alert for the same plan.
- Include the time window, such as "from 2pm to 6pm".
- If there is no good indoor alternative, suggest moving the plan to a better time of day.

## Add under "Local picks when adding an entry"

- Give the reason in under eight words.
- Stay close to the day's other plans, within about fifteen minutes.
- No promotions or sponsored places.

## Add under "Spotting the type of a piece from its photo"

- If a piece fits two types (such as a kurta set), pick the type the traveller already uses most. If still unsure, leave it for them.
