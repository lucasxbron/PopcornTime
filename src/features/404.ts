/**
 * Renders a 404 Not Found page inside the element with the ID "app".
 *
 * This function updates the inner HTML of the "app" element to display a 404 error message
 * and a link to return to the homepage. It also sets up an event listener on the link to
 * handle navigation without reloading the page.
 *
 * The 404 page includes:
 * - A heading with the text "404 - Page Not Found"
 * - A paragraph with a message indicating the page does not exist
 * - A link to return to the homepage
 *
 * The link's click event is intercepted to use the History API for navigation, preventing
 * a full page reload and dispatching a "popstate" event to update the application state.
 */
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
