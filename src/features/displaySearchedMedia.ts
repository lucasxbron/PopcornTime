import { filterMedia } from "./filterMedia";
import { getGenreName } from "./genreName";
import { allGenres } from "./searchMedia";

const appEl = document.getElementById("app");

export function displayMediaData(mediaData: any) {
  if (!appEl) return;

  appEl.innerHTML = `
        <div class="flex items-center justify-center mt-4 mb-8 animate-fade-in">
      <hr class="flex-grow border-gray-500">
      <h2 class="text-2xl text-white text-center font-bold mx-4 ">Search Results</h2>
      <hr class="flex-grow border-gray-500">
    </div>
    <div class="flex flex-col sm:flex-row justify-center mb-6 animate-fade-in">
      <select id="media-type-filter" class="mb-2 sm:mb-0 sm:mr-4 py-2 px-3 bg-gray-700 text-white rounded focus:outline-none">
        <option value="">Movies & TV Shows</option>
        <option value="movie">Movies</option>
        <option value="tv">TV Shows</option>
      </select>
      <select id="genre-filter" class="mb-2 sm:mb-0 p-2 bg-gray-700 text-white rounded focus:outline-none">
        <option value="">All Genres</option>
        ${allGenres
          .map((genre) => `<option value="${genre}">${genre}</option>`)
          .join("")}
      </select>
      <button id="reset-filters" class="ml-0 sm:ml-4 p-2 bg-accent hover:bg-accent-hover text-white rounded focus:outline-none cursor-pointer">Reset Filters</button>
    </div>
    <div id="media-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-5 animate-fade-in">
      ${mediaData.results
        .map(
          (item: any) => `
          <div class="card bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-103 transition-transform duration-300" data-genre="${
            item.genre_ids
              ? item.genre_ids
                  .map((id: number) => getGenreName(id).trim())
                  .join(", ")
              : ""
          }" data-media-type="${item.media_type}">
            <img src="https://image.tmdb.org/t/p/w500${
              item.poster_path
            }" alt="${
            item.title || item.name
          }" class="w-full h-auto object-cover">
            <div class="p-4 text-white">
              <h3 class="text-xl font-bold mb-2">${item.title || item.name}</h3>
              <p class="text-sm mb-2">Release Date: ${
                item.release_date || item.first_air_date
              }</p>
              <p class="text-sm mb-2">Genres: ${
                item.genre_ids
                  ? item.genre_ids
                      .map((id: number) => getGenreName(id).trim())
                      .join(", ")
                  : "N/A"
              }</p>
              <p class="text-sm line-clamp-3">${item.overview}</p>
            </div>
          </div>
        `
        )
        .join("")}
    </div>
  `;

  setupFilterEventListeners();
}

/**
 * Sets up event listeners for filter elements on the media display page.
 *
 * This function attaches event listeners to the genre filter, media type filter,
 * and reset filters button. When the genre filter changes, the media is filtered
 * accordingly. When the media type filter changes, the genre filter is reset and
 * the media is filtered. When the reset filters button is clicked, both filters
 * are reset and the media is filtered.
 *
 * @remarks
 * If any of the filter elements are not found in the DOM, an error is logged to the console.
 *
 * @returns {void}
 */
function setupFilterEventListeners() {
  const genreFilter = document.getElementById(
    "genre-filter"
  ) as HTMLSelectElement;
  const mediaTypeFilter = document.getElementById(
    "media-type-filter"
  ) as HTMLSelectElement;
  const resetFiltersButton = document.getElementById(
    "reset-filters"
  ) as HTMLButtonElement;

  if (!genreFilter || !mediaTypeFilter || !resetFiltersButton) {
    console.error("Filter elements not found");
    return;
  }

  genreFilter.addEventListener("change", filterMedia);
  mediaTypeFilter.addEventListener("change", () => {
    genreFilter.value = "";
    filterMedia();
  });
  resetFiltersButton.addEventListener("click", () => {
    genreFilter.value = "";
    mediaTypeFilter.value = "";
    filterMedia();
  });
}
