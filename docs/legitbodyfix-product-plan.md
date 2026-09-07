# LegitBodyFix: a clear starting point for movement learning

## Audience and positioning

Primary audience hypothesis: active adults and desk workers who want to understand a movement limitation and find a manageable place to start. This is a product hypothesis, not a claim backed by user interviews.

Secondary audience: returning customers opening their purchased sessions. The owner creates and maintains educational articles through the existing Recipe editor.

Product promise: choose an area, understand the available options, and take a clear next step. Educational navigation is not a clinical assessment or diagnosis.

## Scenarios

- First-time visitor: choose shoulder and arm, choose independent learning, open the region's resources.
- Visitor seeking structure: choose an area, choose guided programs, review an available program's existing sales page before purchasing.
- Area without a listed program: receive an explicit explanation and a useful learning destination.
- Returning customer: open My library directly; no need to repeat discovery.
- Owner: update articles in the existing CMS, preview, and publish.

## Required features, in order

1. Clear homepage with a primary discovery action and secondary program browsing action.
2. Three-stage discovery: area, learning preference, relevant destination.
3. Visible progress, accessible choices, back controls, reload-safe URLs.
4. Results using existing region and program data, without invented prices or personalization scores.
5. Existing Learn, sales, checkout, and library destinations remain the continuation of the journey.

## Screen structure

Home: value proposition → start or browse → body regions → programs → method.

Start: header → progress → one question or results → change selection → educational scope note.

Learn: existing region overview → articles and anatomy references → related programs.

Sales: existing program details and price → existing checkout.

Library: existing purchased-content access.

## User flow

Home → Start → choose area → choose approach → learning resources or available program details.

Program details → existing payment flow → existing library. Payment and authentication logic are outside this prototype's modifications.

Selections are encoded in the URL so reload, direct entry, and browser back preserve navigation. Invalid areas return to area selection.

## Design

Retain the site's warm neutral background, black type, lime primary actions, and restrained borders. Use a responsive six-option grid, visible three-step progress, descriptive text, and minimum 44px controls. Prefer explicit action labels over icon-only navigation. The area selector uses text so it remains usable without remote images.

## Copy

- Home: “Move better. Start here.”
- Primary action: “Find my starting point.”
- Area: “Where would you like to start?”
- Approach: “How would you like to explore?”
- Choices: “Learn at my own pace” / “Follow a guided program.”
- Results: “View program details” / “Explore this area.”
- Returning customer: “Already own a program? Open your library.”

## Prototype boundary and follow-up

This iteration implements discovery and homepage entry in the real application. Results use the existing region catalog. That catalog is editorial data rather than an automatic query of the latest published programs; keeping it aligned with the live catalog remains necessary.

Before production launch, verify existing program destinations and availability. A subsequent iteration should consolidate the multiple legacy Learn URLs and static catalog with the current CMS. Do not invent unavailable articles or claim that navigation constitutes a movement assessment.

Success signals to measure later: discovery completion, selected result clicks, program detail-to-checkout transitions, and returning library use. No analytics integration or tracking consent changes are introduced here.

## Verification performed

- Browser: homepage primary CTA opens /start.
- Browser: shoulder area → guided approach → shoulder program and related neck program links.
- Browser: reload preserves selected area and approach.
- Browser: mobile 390×844 shows readable progress, result card, and controls.
- Browser: knee without an available program offers learning resources.
- Browser: change approach → free learning → actual knee region page.
- Browser: back navigation restores the selected result.
- Browser: invalid region resets to area selection.
- Local environment initially lacked public Supabase configuration; the dev process was restarted using existing public configuration without writing secrets to the repository.
- No console errors were captured for the configured localhost session during the tested flow.
- Production build completed. Actual payment transactions and purchase fulfillment were not exercised.

Manual validation is limited to the journeys above; it is not a full audit of every pre-existing article, legacy sales URL, or entitlement.
