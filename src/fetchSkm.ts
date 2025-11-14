import fetch from "node-fetch";
import type { IndexSearchResponse, SkmItem } from "./types.js";

const INDEX_SEARCH_URL = "https://skm.dk/api/indexSearch";

const DEFAULT_REQUEST_BODY = {
  index: "skm-da",
  parentGId: "51a17242-83c9-426d-a86a-277c0d1359e9",
  query: "*",
  tags: null,
  types: null,
  operatorForTagsAndTypes: "and",
  sort: "date",
  lang: "da",
};

export async function fetchSkmItems(): Promise<SkmItem[]> {
  const res = await fetch(INDEX_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(DEFAULT_REQUEST_BODY),
  });

  if (!res.ok) {
    throw new Error(`indexSearch request failed: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as IndexSearchResponse;

  const items: SkmItem[] = Array.isArray(json)
    ? json.filter((item) => item && typeof item.url === "string" && item.url.length > 0)
    : [];

  // Sort newest first by date
  items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return items;
}
