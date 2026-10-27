# Voyage AI guidelines

> **This is your file.** Each section below is about one AI feature in the app. Under **Guidance** you'll find
> instructions the AI follows. Edit them, delete them, or add your own bullets, in plain English.
>
> - Lines that start with `>` (like this one) are notes for you. They are never sent to the AI.
> - Write under **Your notes** in each section for anything extra you'd like the AI to know.
> - The AI treats this as house guidelines. They can't override the required reply format, the safety rules,
>   the traveller's daily hours, or the regeneration limits.
> - Don't put passwords, keys, or personal details in this file.
> - Changes only take effect after you apply them. The commands are at the very bottom.

## For every AI feature

> Applies to everything below.

### Guidance

- Write for travellers in India: Indian place names, prices in rupees, and local customs in mind.
- Prefer real, specific, named places over generic suggestions.
- If you are not sure a place is open or still exists, leave it out instead of guessing.
- Keep titles short and plain. No hype, no emojis.

### Your notes

- (add yours here)

## Itinerary planning

> What the AI already does (built in; changing these needs a code change): it researches the destination on the web,
> keeps every plan inside the traveller's start and end times, respects the pace they chose (relaxed, balanced,
> packed), marks each plan indoor or outdoor (this drives weather alerts), includes the travel day between two
> cities, and makes sure every day has at least one plan.

### Guidance

- Mix famous sights with one or two local-favourite experiences (food, markets, crafts) every day or two.
- In hot months, put outdoor sightseeing early in the morning or late in the afternoon, and use midday for indoor stops or rest.
- Only list a meal as a plan when it's a notable place. Don't list every meal.
- Allow realistic travel time between stops, and avoid more than about two hours of driving on a day with several stops.
- Respect opening days (many museums close one day a week) and religious timings.
- Keep the last day light if the traveller is leaving that day.
- Match the traveller type. Couples: sunset spots and quiet places. Families: easy walks and short distances. Solo: social, easy-to-join experiences. Friends: lively places.

### Your notes

- (add yours here)

## Outfit suggestions for each day

> What the AI already does: it picks one of the traveller's saved outfits for each day, based on that day's plans,
> the city and the season. It only fills days that have no outfit yet, and never overwrites one you chose.
> It can only choose from outfits that already exist.

### Guidance

- Temple and sacred-site days: choose modest, covered clothing (shoulders and knees), and something easy to wear with shoes that come off.
- Beach or water days: light, quick-drying outfits.
- Hot, humid places such as Kerala, Goa and Mumbai: breathable fabrics. Cool mountain places such as Leh and Darjeeling: warm layers, especially mornings and evenings.
- Long walking days: pick the most comfortable outfit.
- Dinners and evening plans: a smarter outfit if there is one.
- Avoid repeating the same outfit on back-to-back days unless nothing else fits.

### Your notes

- (add yours here)

## Weather alerts

> Not built yet. When it is, the AI writes the short reason and the indoor swap shown on the Home nudge card.

### Guidance

- Say what is changing and why in two short sentences: the forecast first, then the specific adjustment.
- Name the plan that is affected and its time.
- Suggest an indoor alternative in the same city that fits the same interest, for example a museum instead of a long walk.
- Suggest one clothing tweak when it helps, such as a light rain jacket.
- Keep the tone calm and practical. Never alarming.

### Your notes

- (add yours here)

## Spotting the type of a piece from its photo

> Not built yet. When it is, the AI suggests a type for each uploaded piece and you confirm it.

### Guidance

- Choose only from the types in the traveller's own list. If nothing fits, choose Other.
- Traditional Indian clothing: kurtas and shirts count as Tops, dupattas and scarves as Accessories, juttis and sandals as Shoes. Use the traveller's own type (for example Sarees) if they have created one.
- If a photo shows several items, go by the most prominent one.
- If it is unclear, don't guess. Leave the type for the traveller to choose.

### Your notes

- (add yours here)

## Outfit combinations from your wardrobe

> Not built yet. When it is, the AI proposes outfits from the pieces the traveller owns.

### Guidance

- Combine pieces that make sense together: a top with trousers or a skirt, plus shoes if there are any, or a dress on its own or with shoes.
- Suggest outfits that suit different occasions, using the occasions and tags the traveller has set.
- Prefer comfortable, practical combinations for travel, and get variety by mixing pieces.
- Never suggest a piece the traveller doesn't own.

### Your notes

- (add yours here)

## Local picks when adding an entry

> Not built yet. When it is, this is the short suggestion chip shown while adding a plan.

### Guidance

- Suggest one specific, well-regarded local place or experience near the day's other plans.
- Prefer locally owned places over chains.
- Keep it to one short line.

### Your notes

- (add yours here)

> ## How to apply your changes
>
> 1. Save this file.
> 2. In a terminal, from the project folder, run `npm run guidelines`. This turns the file into something the AI function can read.
> 3. Redeploy the function: `supabase functions deploy generate-itinerary`.
>
> If you'd rather not run these yourself, just tell Claude "I've updated the guidelines" and it will do it.
