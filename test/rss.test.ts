import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { generateFeeds } from "../src/index.js";
import { type FeedConfig, buildAtom, buildRss2 } from "../src/rss.js";
import type { SkmItem } from "../src/types.js";

function loadFixture(fileName: string): SkmItem[] {
  const p = path.resolve(`test/fixtures/${fileName}`);
  const json = JSON.parse(fs.readFileSync(p, "utf8")) as Record<string, SkmItem>[];
  const items: SkmItem[] = [];
  for (const el of json) {
    for (const key of Object.keys(el)) {
      items.push(el[key]);
    }
  }
  return items;
}

describe("RSS and Atom generation", () => {
  it("generates valid RSS 2.0 with items from sample response", () => {
    const items = loadFixture("sample-response.json");
    expect(items.length).toBeGreaterThan(0);

    const feed: FeedConfig = {
      id: "https://example.com/atom.xml",
      title: "Test feed",
      description: "Test description",
      link: "https://example.com/rss.xml",
      language: "da-dk",
    };

    const xml = buildRss2(feed, items);

    expect(xml).toContain("<rss");
    expect(xml).toContain("<channel>");
    expect(xml).toContain("<item>");
    expect(xml).toContain("Motionister skal kunne trække en del af motionsregningen fra i skat");
  });

  it("generates valid Atom feed with entries from sample response", () => {
    const items = loadFixture("sample-response.json");
    expect(items.length).toBeGreaterThan(0);

    const feed: FeedConfig = {
      id: "https://example.com/atom.xml",
      title: "Test feed",
      description: "Test description",
      link: "https://example.com/rss.xml",
      language: "da-dk",
    };

    const xml = buildAtom(feed, items);

    expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom"');
    expect(xml).toContain("<entry>");
    expect(xml).toContain("Motionister skal kunne trække en del af motionsregningen fra i skat");
  });

  it("can generate full RSS and Atom feeds from full-response", () => {
    const items = loadFixture("full-response.json");
    expect(items.length).toBeGreaterThan(0);

    const feed: FeedConfig = {
      id: "https://example.com/atom.xml",
      title: "Full feed",
      description: "Full response feed test",
      link: "https://example.com/rss.xml",
      language: "da-dk",
    };

    const rssXml = buildRss2(feed, items);
    const atomXml = buildAtom(feed, items);

    // Structure checks
    expect(rssXml).toContain("<rss");
    expect(rssXml).toContain("<channel>");
    expect(rssXml).toContain("<item>");

    expect(atomXml).toContain('<feed xmlns="http://www.w3.org/2005/Atom"');
    expect(atomXml).toContain("<entry>");

    // Sanity: the number of items should roughly match
    const rssItemCount = (rssXml.match(/<item>/g) || []).length;
    const atomEntryCount = (atomXml.match(/<entry>/g) || []).length;
    expect(rssItemCount).toBeGreaterThan(0);
    expect(atomEntryCount).toBeGreaterThan(0);
  });

  it("can run the full generator pipeline with full-response into public/rss.xml and atom.xml", async () => {
    const items = loadFixture("full-response.json");
    expect(items.length).toBeGreaterThan(0);

    // Use a temp output directory to avoid clobbering real public/ during tests
    const originalCwd = process.cwd();
    const tmpOutDir = path.resolve(".vitest-tmp");
    await fs.promises.rm(tmpOutDir, { recursive: true, force: true });
    await fs.promises.mkdir(tmpOutDir, { recursive: true });
    process.chdir(tmpOutDir);

    try {
      await generateFeeds(items);

      const rssPath = path.resolve("public/rss.xml");
      const atomPath = path.resolve("public/atom.xml");

      expect(fs.existsSync(rssPath)).toBe(true);
      expect(fs.existsSync(atomPath)).toBe(true);

      const rssXml = fs.readFileSync(rssPath, "utf8");
      const atomXml = fs.readFileSync(atomPath, "utf8");

      expect(rssXml).toContain("<rss");
      expect(rssXml).toContain("<item>");
      expect(atomXml).toContain('<feed xmlns="http://www.w3.org/2005/Atom"');
      expect(atomXml).toContain("<entry>");
    } finally {
      process.chdir(originalCwd);
      await fs.promises.rm(tmpOutDir, { recursive: true, force: true });
    }
  });
});
