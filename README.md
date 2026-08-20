# Movement System Hub

PROMPT START

Build a single-page marketing website homepage for a fitness/movement-coaching brand called LegitBodyFix (parent brand concept: "Movement System"). Use React + Tailwind CSS. Make it fully responsive, clean, and premium — think a mix of a sports-science lab and an athletic training app, NOT a medical/clinical site.

Brand mood

Scientific, not clinical

Strong, not aggressive

Honest, not fearful

Athletic, not gym-bro

Premium but accessible

Color system

Base: ivory/off-white (#F5F3EE or similar) background

Primary text: near-black (#111111)

Accent: lime green (#C6FF3D or similar) — used ONLY for CTAs, active states, highlighted step in the process diagram, and small tag labels

Use a monospace font (e.g. "JetBrains Mono", "Space Mono") for data points, step labels, and program stats

Use a bold, condensed sans-serif (e.g. "Inter", "Archivo") for headlines

Site structure (build these sections in order)

1. Sticky Nav Logo "LegitBodyFix" (left), nav links: Movement Check / Programs / Method / Pricing, CTA button on right: "Take the Free Movement Check" (lime button).

2. Hero Section

Eyebrow tag (small, monospace, lime): "MOVEMENT SYSTEM"

Headline (large, bold): "BUILD MORE WAYS TO MOVE."

Subheadline: "Assess what's limiting you, restore the movement you need, and rebuild the strength to return to training with confidence."

Two CTA buttons: primary lime "Take the Free Movement Check", secondary outline "Explore Movement Reset"

Trust line below buttons (small, muted): "Evidence-informed · Built for active adults · No recurring subscription required"

Right side or background: placeholder for a real-person training image (use a placeholder image div, not anatomy imagery)

3. Problem / Relatable Situations Section Headline: "Sound familiar?" Grid of 5 short situation cards (icon + text), each a common pain point:

"My hips feel locked up every time I squat."

"My lower back stays stiff after deadlifts."

"My shoulder bothers me overhead."

"I'm nervous about getting back into running."

"Sitting all day makes everything feel stuck before I even start training."

4. The System Section (ASSESS → RESTORE → REBUILD → APPLY) Headline: "A system, not a guess." Horizontal 4-step process diagram (monospace step numbers 01/02/03/04, lime highlight on hover/active):

ASSESS — Find out what's actually limiting you.

RESTORE — Rebuild the mobility, breathing, and control you need.

REBUILD — Restore strength, stability, and load tolerance.

APPLY — Bring it back into squats, hinges, overhead work, or running.

5. USP Section Headline: "More than mobility. A system for returning movement to real activity." Sub-copy: "YouTube gives you exercises. LegitBodyFix gives you the order, progression, and context to use them." 6 feature cards (icon + short title + 1-line description):

Assess before exercise — "We find your starting point instead of giving everyone the same routine."

Restore, then rebuild — "We don't stop at mobility — we progress into control, strength, and load."

Apply to real movement — "Everything connects back to your squat, hinge, overhead work, or running."

Education without overwhelm — "We give you what you need to know, not a full anatomy course."

Clear progression — "You'll always know when to advance, modify, or stop."

Mid-priced personalization — "More structure than free videos. More affordable than 1:1 coaching."

6. Free Movement Check CTA Section (highlighted, lime or dark background block) Headline: "FIND WHAT'S LIMITING YOUR MOVEMENT." Sub-copy: "A five-minute check to help you choose a better starting point. No diagnosis — just clear movement guidance." Single big CTA button: "Take the Free Movement Check" Below it, 5 small selectable tag chips representing entry paths (visual only, non-functional is fine): Squat & Hip / Hinge & Low Back / Shoulder & Overhead / Run & Return / Desk & Daily Life

7. Product Ladder / Pricing Section Headline: "Start small. Go deeper when you're ready." Pricing table/cards, in this order, with name, one-line description, and price:

ProductDescriptionPrice5-Minute Movement CheckFree starting-point assessment$07-Day Movement ResetShort intro program$124-Week Movement ResetCore program (highlight this card as "Most Popular", lime border)$598-Week Build & ReturnExtended progression$129Video Form ReviewPersonal 1:1 video feedback$69Complete Movement SystemFull bundle$179Movement LibraryOngoing monthly access$24/mo

Make the "4-Week Movement Reset" card visually featured/larger than the others.

8. Core Program Highlight Section Headline: "ASSESS. RESTORE. REBUILD. APPLY." Sub-copy: "A four-week system for turning movement limitations into a structured return-to-training plan." Show 5 selectable "path" cards the user can pick from within the program: Squat & Hip / Hinge & Low Back / Shoulder & Overhead / Run & Return / Desk & Daily Life. Each card: short icon, title, 1-line description of who it's for.

9. Content / Education Teaser Section Headline: "Understand your body without the overwhelm." 3-column preview of article/content cards with placeholder titles like:

"Why your squat feels tight"

"A simple overhead reach check"

"How to add load after mobility work" Small CTA link: "Explore the Movement Library →"

10. Final CTA / Closing Section Headline: "STOP GUESSING. MOVE WITH A PLAN." Sub-copy: "Don't stop training. Change how you rebuild." Big lime CTA button: "Take the Free Movement Check"

11. Footer Logo, short brand tagline: "Build more movement options.", nav links repeated, small print: "Educational content only. Not a substitute for medical diagnosis or treatment.", social icon placeholders, copyright line.

Copy tone rules

Confident, direct, short sentences.

Never use fear-based or diagnostic language (no "fix your posture," no "you're damaged").

Always frame around returning to activity/training, not correcting appearance.

Technical notes

Use placeholder images (not real stock photo URLs) for hero and content cards — solid color blocks or Unsplash placeholder pattern is fine.

Keep the anatomy/muscle-diagram visual style OUT of the homepage — that belongs to a separate "Muscle Atlas" page, not this landing page.

Make all CTA buttons link to a /movement-check route (can be a placeholder page).

Fully responsive: stack sections vertically on mobile, collapse nav into a hamburger menu.

PROMPT END

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://move-system-landing.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2639c5d6-fdcc-4722-b56e-97a5b0d9dd4c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
