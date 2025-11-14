import { promises as fs } from "node:fs";
import path from "node:path";
import url from "node:url";
import { fetchSkmItems } from "./fetchSkm.js";
import { type FeedConfig, buildAtom, buildRss2 } from "./rss.js";

export async function generateFeeds(
  itemsOverride?: import("./types.js").SkmItem[],
  userOverride?: string,
) {
  const items = itemsOverride ?? (await fetchSkmItems());

  const baseUrl =
    userOverride ? `https://${userOverride}.github.io/skatteministeriet-nyheder-rss` :
    "https://<your-user>.github.io/skatteministeriet-nyheder-rss";

  const feedConfig: FeedConfig = {
    id: `${baseUrl}/atom.xml`,
    title: "Skatteministeriet – Nyheder",
    description: "Automatisk genereret feed fra skm.dk indexSearch",
    link: `${baseUrl}/rss.xml`,
    language: "da-dk",
  };

  const rssXml = buildRss2(feedConfig, items);
  const atomXml = buildAtom(feedConfig, items);

  const outDir = path.resolve("public");
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, "rss.xml"), rssXml, "utf8");
  await fs.writeFile(path.join(outDir, "atom.xml"), atomXml, "utf8");

  console.log(`Generated ${items.length} items to ${outDir}`);
}

if (process.argv[1] === url.fileURLToPath(import.meta.url)) {
  const [, , maybeBaseUrl] = process.argv;

  generateFeeds(undefined, maybeBaseUrl).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
