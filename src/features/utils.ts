import { loadPageContent } from "./navigation/router";

export function setupClearSearchButton() {
  const clearSearchButton = document.getElementById("clear-search");
  const searchInput = document.getElementById(
    "search-input"
  ) as HTMLInputElement;

  clearSearchButton?.addEventListener("click", () => {
    searchInput.value = "";
    history.pushState(null, "", "/");
    loadPageContent();
  });
}

export function isCacheValid(timestamp: number): boolean {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  return Date.now() - timestamp < ONE_DAY;
}

export function getInitialItemCount(): number {
  if (window.matchMedia('(min-width: 1920px)').matches) return 6; // 3xl:grid-cols-6
  if (window.matchMedia('(min-width: 1536px)').matches)  return 5; // 2xl:grid-cols-5
  if (window.matchMedia('(min-width: 1280px)').matches) return 4; // xl:grid-cols-4
  if (window.matchMedia('(min-width: 1024px)').matches) return 3; // lg:grid-cols-3
  if (window.matchMedia('(min-width: 640px)').matches) return 4;  // sm:grid-cols-2
  return 2; // default grid-cols-1
}