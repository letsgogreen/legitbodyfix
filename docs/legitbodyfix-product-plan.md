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

This iteration implements discovery and homepage entry in the real application. Program results now query explicitly published public program metadata through the existing anonymous Supabase client and RLS. Educational destinations still use the existing region catalog.

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

## Follow-up: live program results

Replaced static program results with published-program queries. Added loading, retry, timeout (15 seconds), empty results, thumbnail fallback, and selected-region context. Delayed responses from abandoned attempts cannot update the displayed results. Current prices are reviewed on the existing sales page because the shared listing API uses Paddle pricing while checkout is PayPal.

Build passed. Browser confirmed the failure/retry interface. Successful live-data rendering remains unverified: the existing local Supabase credential returned HTTP 401 on a read-only published-program query. This is a local credential finding, not evidence of a production outage. No credentials were committed or client-exposed. This follow-up is not deployed.

### Resolved: public catalog access

The local server credential was not a valid key, but the existing publishable key successfully read published programs through RLS. Discovery now uses that public read path and no longer depends on the privileged listing endpoint or Paddle price lookup. Requests are aborted on unmount, retry, or timeout.

Browser verified two real shoulder programs and the shoulder sales-page link. This supersedes the earlier successful-live-data verification blocker. The source catalog also tags Ankle Recovery with knee, but the owner confirmed this must not appear as a knee program. Discovery now restricts Ankle Recovery to ankle-foot without mutating database records. Browser regression checks confirmed knee falls back to learning resources, including after reload, while ankle and shoulder each retain two programs.

Sales-page inspection found the legacy shoulder page advertises a 12-minute session whereas program metadata says six weeks. Legacy-linked cards therefore omit duration and format and defer product details and pricing to the sales page. Catalog reconciliation remains a separate editorial task. No prices, purchase logic, or database records changed.

## Usability refinement: selection recovery

Feature: let visitors correct a selection without restarting from the homepage.
Screen structure: results retain their selected-area label, followed by separate Change approach and Change area actions.
Flow: result → Change area → area selection; result → Change approach → approach selection with the area retained.
Design: secondary underlined controls with 44px minimum targets and wrapping on narrow screens; the primary resource action remains lime.
Copy: direct action labels rather than a generic Back button.
Implementation: URL-backed navigation clears dependent choices when the area is reset. On a step change, keyboard focus moves to the new page heading so assistive technology announces the new context. Initial loading does not steal focus.

Release boundary: this refinement is local until approved for deployment. Existing published content, program prices, authentication, and payment fulfillment remain unchanged. Target audience and conversion goals are hypotheses pending actual user research; no claim of service-wide validation is made.
