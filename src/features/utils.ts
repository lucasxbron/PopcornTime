import { loadPageContent } from "./navigation/router";

export function setupClearSearchButton() {
  const clearSearchButton = document.getElementById("clear-search");
  const searchInput = document.getElementById("search-input") as HTMLInputElement;

  clearSearchButton?.addEventListener("click", () => {
    searchInput.value = "";
    history.pushState(null, "", "/");
    loadPageContent();
  });
}