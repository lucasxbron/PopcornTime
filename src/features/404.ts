export function notFoundPage() {
  const appEl = document.getElementById("app");
  if (appEl) {
    appEl.innerHTML = `
            <div class="text-white text-center mt-12">
            <h1 class="text-4xl font-bold">404 - Page Not Found</h1>
            <p class="mt-4 text-lg">Sorry, the page you are looking for does not exist.</p>
            <a href="/" id="home-link" class="mt-6 inline-block text-blue-500 hover:underline">Go back to the homepage</a>
            </div>
        `;

    const homeLink = document.getElementById("home-link");
    if (homeLink) {
      homeLink.addEventListener("click", (event) => {
        event.preventDefault();
        history.pushState(null, "", "/");
        window.dispatchEvent(new PopStateEvent("popstate"));
      });
    }
  }
}
