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
    <div class="flex justify-center mb-6 animate-fade-in">
    <select id="media-type-filter" class="mr-4 py-2 px-3 bg-gray-700 text-white rounded focus:outline-none">
      <option value="">Movies & TV Shows</option>
      <option value="movie">Movies</option>
      <option value="tv">TV Shows</option>
    </select>
      <select id="genre-filter" class="p-2 bg-gray-700 text-white rounded focus:outline-none">
        <option value="">All Genres</option>
        ${allGenres
          .map((genre) => `<option value="${genre}">${genre}</option>`)
          .join("")}
      </select>
      <button id="reset-filters" class="ml-4 p-2 bg-blue-500 text-white rounded focus:outline-none cursor-pointer">Reset Filters</button>
    </div>
    <div id="media-container" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      ${mediaData.results
        .map(
          (item: any) => `
          <div class="card bg-gray-800 rounded-lg overflow-hidden shadow-lg mb-4 hover:scale-105 transition-transform duration-300 animate-fade-in" data-genre="${
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
