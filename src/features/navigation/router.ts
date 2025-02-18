import { notFoundPage } from "../404";
import { displayPopularMovies, getPopularMovies } from "../popularMovies";

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
    getPopularMovies().then(displayPopularMovies);
  } else if (currentPage === "/movies") {
    getPopularMovies().then(displayPopularMovies);
  } else if (currentPage === "/tv-shows") {
    getPopularMovies().then(displayPopularMovies);
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
