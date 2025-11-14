import { create } from "xmlbuilder2";
import type { SkmItem } from "./types.js";

export interface FeedConfig {
  id: string;
  title: string;
  description: string;
  link: string;
  language: string;
}

function mapItemToRss(item: SkmItem) {
  const pubDate = new Date(item.date || item.createDate).toUTCString();
  return {
    title: item.title,
    link: item.url,
    guid: item.gId || item.id,
    pubDate,
    description: item.description || item.seoDescription || "",
  };
}

export function buildRss2(feed: FeedConfig, items: SkmItem[]): string {
  const sortedItems = [...items].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
  );
  const channelItems = sortedItems.map(mapItemToRss).map((i) => ({ item: i }));

  const root = create({
    version: "1.0",
    encoding: "UTF-8",
  })
    .ele("rss", { version: "2.0" })
    .ele("channel")
    .ele("title")
    .txt(feed.title)
    .up()
    .ele("link")
    .txt(feed.link)
    .up()
    .ele("description")
    .txt(feed.description)
    .up()
    .ele("language")
    .txt(feed.language)
    .up();

  for (const itm of channelItems) {
    const item = root.ele("item");
    item.ele("title").txt(itm.item.title).up();
    item.ele("link").txt(itm.item.link).up();
    item.ele("guid").txt(itm.item.guid).up();
    item.ele("pubDate").txt(itm.item.pubDate).up();
    if (itm.item.description) {
      item.ele("description").txt(itm.item.description).up();
    }
    item.up();
  }

  return root.end({ prettyPrint: true });
}

export function buildAtom(feed: FeedConfig, items: SkmItem[]): string {
  const sortedItems = [...items].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
  );

  const updated =
    sortedItems[0]?.updateDate || sortedItems[0]?.date || new Date().toISOString();

  const root = create({ version: "1.0", encoding: "UTF-8" })
    .ele("feed", { xmlns: "http://www.w3.org/2005/Atom" })
    .ele("id")
    .txt(feed.id)
    .up()
    .ele("title")
    .txt(feed.title)
    .up()
    .ele("updated")
    .txt(updated)
    .up()
    .ele("link", { href: feed.link })
    .up();

  for (const item of sortedItems) {
    const entry = root.ele("entry");
    entry
      .ele("id")
      .txt(item.gId || item.id)
      .up();
    entry.ele("title").txt(item.title).up();
    entry
      .ele("updated")
      .txt(item.updateDate || item.date)
      .up();
    entry.ele("link", { href: item.url }).up();
    if (item.description || item.seoDescription) {
      entry
        .ele("summary")
        .txt(item.description || item.seoDescription)
        .up();
    }
    entry.up();
  }

  return root.end({ prettyPrint: true });
}
