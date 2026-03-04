let currentQuery = "";

export function setSearchQuery(q: string) {
  currentQuery = q;
}

export function getSearchQuery() {
  return currentQuery;
}

export function clearSearchQuery() {
  currentQuery = "";
}
