type Subscriber = (r: any | null) => void;

let selected: any | null = null;
const subs = new Set<Subscriber>();

export function setSelectedRecipe(r: any | null) {
  selected = r;
  for (const s of subs) s(selected);
}

export function getSelectedRecipe() {
  return selected;
}

export function subscribeSelectedRecipe(fn: Subscriber) {
  subs.add(fn);
  return () => subs.delete(fn);
}

export default {
  setSelectedRecipe,
  getSelectedRecipe,
  subscribeSelectedRecipe,
};
