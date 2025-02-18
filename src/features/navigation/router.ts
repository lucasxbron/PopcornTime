import { notFoundPage } from "../404";
import { displayPopularMedia, getPopularMedia } from "../popularMedia";

export function navigateTo(url: string) {
  history.pushState(null, "", url);
  loadContent(url);
}

function loadContent(url: string) {
  console.log(`Loading content for: ${url}`);
  const appElement = document.getElementById("app");
  if (appElement) {
    appElement.innerHTML = "";
    initializePageLogic();
  } else {
    console.error("App element not found");
  }
}

export function initializePageLogic() {
  const currentPage = window.location.pathname;

  if (currentPage === "/") {
    getPopularMedia("movie").then((items) => displayPopularMedia("movie", items));
  } else if (currentPage === "/movies") {
    getPopularMedia("movie").then((items) => displayPopularMedia("movie", items));
  } else if (currentPage === "/tv-shows") {
    getPopularMedia("tv").then((items) => displayPopularMedia("tv", items));
  } else {
    notFoundPage();
  }
}

export function setupNavigation() {
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
    loadContent(window.location.pathname);
  });
}
