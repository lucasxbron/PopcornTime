import { notFoundPage } from "../404";
import { displayHomepage, getHomepageContent } from "../home";
import { displayPopularMedia, getPopularMedia } from "../popularMedia";
import { clearSearchInput } from "../utils";

/**
 * Navigates to the specified URL by updating the browser's history state,
 * clearing the search input, and rendering the page content for the new URL.
 *
 * @param url - The URL to navigate to.
 */
export function navigateTo(url: string) {
  history.pushState(null, "", url);
  clearSearchInput();
  renderPageContent(url);
}

/**
 * Renders the content of a page based on the provided URL.
 *
 * This function logs the URL to the console, finds the HTML element with the ID "app",
 * and if found, clears its inner HTML and loads the new page content. If the element
 * is not found, it logs an error message to the console.
 *
 * @param {string} url - The URL of the page to load content for.
 */
function renderPageContent(url: string) {
  console.log(`Loading content for: ${url}`);
  const appElement = document.getElementById("app");
  if (appElement) {
    appElement.innerHTML = "";
    loadPageContent();
  } else {
    console.error("App element not found");
  }
}

/**
 * Loads the content of the current page based on the URL path.
 *
 * This function determines the current page by examining the `window.location.pathname`
 * and loads the appropriate content by calling specific functions for each page type.
 *
 * @returns {void}
 */
export function loadPageContent() {
  const currentPage = window.location.pathname;

  if (currentPage === "/") {
    getHomepageContent().then((content) => displayHomepage(content));
  } else if (currentPage === "/movies") {
    getPopularMedia("movie").then((items) =>
      displayPopularMedia("movie", items)
    );
  } else if (currentPage === "/tv-shows") {
    getPopularMedia("tv").then((items) => displayPopularMedia("tv", items));
  } else {
    notFoundPage();
  }
}

/**
 * Initializes the navigation by setting up event listeners on all anchor tags within the navigation element.
 * Prevents the default link behavior and uses a custom navigation function instead.
 * Also handles browser back/forward button events to render the appropriate page content.
 */
export function initializeNavigation() {
  document.querySelectorAll("nav a").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const url = link.getAttribute("href");
      if (url) {
        navigateTo(url);
      }
    });
  });

  // Handle browser back/forward buttons
  window.addEventListener("popstate", () => {
    renderPageContent(window.location.pathname);
  });
}
