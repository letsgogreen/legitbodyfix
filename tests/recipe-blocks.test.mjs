import test from "node:test";
import assert from "node:assert/strict";
import {
  blocksFromLegacyInstructions,
  blocksToPlainText,
  normalizeRecipeBlocks,
  validateRecipeBlocks,
  youtubeEmbedUrl,
} from "../src/lib/recipe-blocks.ts";
import { parseRecipeBlocks } from "../src/lib/recipe-blocks.schema.ts";

test("legacy instructions become headings, toggles, paragraphs, and lists without losing text", () => {
  const blocks = blocksFromLegacyInstructions(
    `## Pathogenesis {toggle="true" color="orange"}\nFirst explanation.<br>Second explanation.\n\n## Steps\n- Breathe slowly\n- Reassess [the guide](https://example.com/guide)`,
  );
  assert.deepEqual(
    blocks.map((block) => block.type),
    ["toggle", "heading", "list"],
  );
  assert.equal(blocks[0].title, "Pathogenesis");
  assert.match(blocks[0].text, /First explanation/);
  assert.match(blocks[0].text, /Second explanation/);
  assert.match(blocksToPlainText(blocks), /Reassess \[the guide\]/);
  assert.equal(
    blocksFromLegacyInstructions("same")[0].id,
    blocksFromLegacyInstructions("same")[0].id,
  );
});

test("YouTube URL normalization accepts intended formats and rejects other hosts", () => {
  const expected = "https://www.youtube-nocookie.com/embed/abcdefghijk";
  assert.equal(youtubeEmbedUrl("https://www.youtube.com/watch?v=abcdefghijk"), expected);
  assert.equal(youtubeEmbedUrl("https://youtu.be/abcdefghijk"), expected);
  assert.equal(youtubeEmbedUrl("https://youtube.com/shorts/abcdefghijk"), expected);
  assert.equal(youtubeEmbedUrl("https://www.youtube-nocookie.com/embed/abcdefghijk"), expected);
  assert.equal(youtubeEmbedUrl("https://example.com/watch?v=abcdefghijk"), null);
});

test("malformed and unknown blocks are omitted without breaking valid content", () => {
  const blocks = normalizeRecipeBlocks([
    { id: "good", type: "paragraph", text: "Kept" },
    { id: "unknown", type: "script", text: "Rejected" },
    { id: "bad", type: "heading", level: 9, text: "Rejected" },
  ]);
  assert.deepEqual(blocks, [{ id: "good", type: "paragraph", text: "Kept" }]);
  assert.deepEqual(
    parseRecipeBlocks([
      { id: "good", type: "paragraph", text: "Kept" },
      { id: "bad", type: "heading", level: 9, text: "Rejected" },
    ]),
    blocks,
  );
});

test("plain text fallback includes meaningful block content", () => {
  const blocks = normalizeRecipeBlocks([
    { id: "h", type: "heading", level: 2, text: "Heading" },
    { id: "l", type: "list", style: "bullet", items: ["One", "Two"] },
    { id: "b", type: "button", label: "Read more", url: "https://example.com" },
  ]);
  assert.equal(
    blocksToPlainText(blocks),
    "Heading\n\nOne\n\nTwo\n\nRead more\n\nhttps://example.com",
  );
  assert.deepEqual(validateRecipeBlocks([{ id: "y", type: "youtube", url: "bad", caption: "" }]), [
    { blockId: "y", message: "Enter a valid YouTube URL." },
  ]);
});

test("Notion export control tokens are hidden while useful section labels remain", () => {
  const blocks = blocksFromLegacyInstructions(`
## Tight muscles
---
unknown url="https://app.notion.com/p/example" alt="button"/
details
summaryFunctions/summary
- Hip flexion
/details
[Notion image — replace in admin]
details summaryInsertion & Origin/summary - Origin: ASIS /details
synced_block_reference url="https://app.notion.com/p/reference" /synced_block_reference
`);
  const text = blocksToPlainText(blocks);
  assert.match(text, /Tight muscles/);
  assert.match(text, /Functions/);
  assert.match(text, /Hip flexion/);
  assert.match(text, /Insertion & Origin/);
  assert.match(text, /Origin: ASIS/);
  assert.doesNotMatch(text, /unknown|app\.notion|details|Notion image/i);
  assert.ok(blocks.some((block) => block.type === "divider"));
});
