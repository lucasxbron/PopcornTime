import { notFoundPage } from "../404";
import { displayHomepage, getHomepageContent } from "../home";
import { displayPopularMedia, getPopularMedia } from "../popularMedia";

export function navigateTo(url: string) {
  history.pushState(null, "", url);
  clearSearchInput();
  renderPageContent(url);
}

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

export function loadPageContent() {
  const currentPage = window.location.pathname;

  if (currentPage === "/") {
    getHomepageContent().then((content) => displayHomepage(content));
  } else if (currentPage === "/movies") {
    getPopularMedia("movie").then((items) => displayPopularMedia("movie", items));
  } else if (currentPage === "/tv-shows") {
    getPopularMedia("tv").then((items) => displayPopularMedia("tv", items));
  } else {
    notFoundPage();
  }
}

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

function clearSearchInput() {
  const searchInput = document.getElementById("search-input") as HTMLInputElement;
  if (searchInput) {
    searchInput.value = "";
  }
}