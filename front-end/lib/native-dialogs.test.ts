import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const files = [
  "features/events/components/events-page.tsx",
  "features/news/components/news-page.tsx",
];

describe("browser dialogs", () => {
  it.each(files)("uses SweetAlert2 instead of native dialogs in %s", (file) => {
    const source = readFileSync(resolve(process.cwd(), file), "utf8");

    expect(source).toContain('import Swal from "sweetalert2"');
    expect(source).toContain("await Swal.fire(");
    expect(source).toContain("result.isConfirmed");
    expect(source).not.toMatch(/\b(?:alert|confirm|prompt)\s*\(/);
  });
});
