import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * The chat composer used to be a single-line input. Anything wider than the box
 * — which every dictated sentence is — got scrolled to the caret, so the start
 * of the message was invisible and the user sent something other than what they
 * believed they had written. The textarea is the fix, and it is easy to
 * "simplify" back, so it is pinned here.
 */

const read = (path: string) => readFileSync(path, "utf8");

describe("Milo's composer", () => {
  it("grows with the text instead of scrolling the start out of view", () => {
    const source = read("components/milo-chat.tsx");
    expect(source).toMatch(/<Textarea/);
    expect(source, "a single-line input hides the beginning of a long message").not.toMatch(/<Input\b/);
  });

  it("caps its height so a long message cannot push the chat off screen", () => {
    const source = read("components/milo-chat.tsx");
    expect(source).toMatch(/max-h-/);
  });

  it("measures its height before paint, so it does not flicker one line per keystroke", () => {
    const text = read("components/ui/input.tsx");
    expect(text).toMatch(/useLayoutEffect/);
    expect(text).toMatch(/scrollHeight/);
  });
});
