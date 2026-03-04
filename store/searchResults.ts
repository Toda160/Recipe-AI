type Subscriber = (v: { query: string; results: any[] } | null) => void;

let cache: { query: string; results: any[] } | null = null;
const subs = new Set<Subscriber>();

export function setSearchResults(query: string, results: any[]) {
  cache = { query, results };
  for (const s of subs) s(cache);
}

export function getSearchResults() {
  return cache;
}

export function subscribeSearchResults(fn: Subscriber) {
  subs.add(fn);
  return () => subs.delete(fn);
}

export default {
  setSearchResults,
  getSearchResults,
  subscribeSearchResults,
};
