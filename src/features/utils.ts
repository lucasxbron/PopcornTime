import { loadPageContent } from "./navigation/router";

/**
 * Sets up the clear search button functionality.
 *
 * This function adds a click event listener to the button with the ID "clear-search".
 * When the button is clicked, it clears the value of the search input field with the ID "search-input",
 * updates the browser history to the root URL, and calls the `loadPageContent` function to refresh the page content.
 */
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

/**
 * Checks if the cache is still valid based on the given timestamp.
 *
 * @param timestamp - The timestamp to check against the current time.
 * @returns `true` if the cache is valid (i.e., the timestamp is within the last 24 hours), otherwise `false`.
 */
export function isCacheValid(timestamp: number): boolean {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  return Date.now() - timestamp < ONE_DAY;
}

/**
 * Determines the initial number of items to display based on the current viewport width.
 *
 * The function uses `window.matchMedia` to check the viewport width and returns the
 * corresponding number of items to display.
 *
 * @returns {number} The initial number of items to display based on the viewport width.
 */
export function getInitialItemCount(): number {
  if (window.matchMedia("(min-width: 1920px)").matches) return 6; // 3xl:grid-cols-6
  if (window.matchMedia("(min-width: 1536px)").matches) return 5; // 2xl:grid-cols-5
  if (window.matchMedia("(min-width: 1280px)").matches) return 4; // xl:grid-cols-4
  if (window.matchMedia("(min-width: 1024px)").matches) return 3; // lg:grid-cols-3
  if (window.matchMedia("(min-width: 640px)").matches) return 4; // sm:grid-cols-2
  return 2; // default grid-cols-1
}

/**
 * Clears the value of the search input field.
 *
 * This function selects the HTML input element with the ID "search-input"
 * and sets its value to an empty string, effectively clearing any text
 * that was previously entered in the search input field.
 */
export function clearSearchInput() {
  const searchInput = document.getElementById(
    "search-input"
  ) as HTMLInputElement;
  if (searchInput) {
    searchInput.value = "";
  }
}


/**
 * Toggles footer classes based on the current URL.
 *
 * This function checks the current URL and adds specific classes to the footer element
 * when the URL is not "/", "/movies", or "/tv-shows". It removes those classes when
 * the URL matches any of those paths.
 */
export function toggleFooterClasses() {
  const footer = document.querySelector("footer");
  if (!footer) return;

  const currentPath = window.location.pathname;
  const shouldAddClasses = !["/", "/movies", "/tv-shows"].includes(currentPath);
  const classesToToggle = ["fixed", "bottom-0", "w-full"];

  if (shouldAddClasses) {
    footer.classList.add(...classesToToggle);
  } else {
    footer.classList.remove(...classesToToggle);
  }
}