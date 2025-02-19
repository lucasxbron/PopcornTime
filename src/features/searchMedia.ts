import { displayError } from "./displayError";
import { getGenreName } from "./genreName";

const apiToken = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
const formEl = document.querySelector("form");
const appEl = document.getElementById("app");

formEl?.addEventListener("submit", searchMedia);

export async function searchMedia(event: Event) {
  event.preventDefault();
  if (appEl) {
    appEl.innerHTML = "";
  }
  const media = getMedia(event);
  const sanitizedUserInput = sanitizeUserInput(media);
  const isValidUserInput = isUserInputValid(sanitizedUserInput);
  console.log("sanitizedUserInput:", sanitizedUserInput);

  if (!isValidUserInput) {
    console.log("isValidUserInput:", isValidUserInput);
    return;
  }

  const newUrl = `/?search=${encodeURIComponent(sanitizedUserInput)}`;
  history.pushState(null, "", newUrl);

  await performSearch(sanitizedUserInput);
}

export async function searchMediaByQuery(query: string) {
  if (appEl) {
    appEl.innerHTML = "";
  }
  const sanitizedUserInput = sanitizeUserInput(query);
  const isValidUserInput = isUserInputValid(sanitizedUserInput);
  console.log("sanitizedUserInput:", sanitizedUserInput);

  if (!isValidUserInput) {
    console.log("isValidUserInput:", isValidUserInput);
    return;
  }

  await performSearch(sanitizedUserInput);
}

async function performSearch(sanitizedUserInput: string) {
  const [movieData, tvData] = await Promise.all([
    getMediaData("movie", sanitizedUserInput),
    getMediaData("tv", sanitizedUserInput),
  ]);

  const combinedData = {
    results: [...(movieData?.results || []), ...(tvData?.results || [])],
  };

  displayMediaData(combinedData);
}

function getMedia(event: Event): string {
  const formData = new FormData(event.target as HTMLFormElement);
  const formInputs = Object.fromEntries(formData.entries());
  const UserInputValue = formInputs.media as string;
  return UserInputValue;
}

function sanitizeUserInput(UserInputValue: string): string {
  const userInputValueSanitized = UserInputValue.trim().toLowerCase();
  return userInputValueSanitized;
}

function isUserInputValid(userInputValueSanitized: string): boolean {
  const isUserInputValid =
    userInputValueSanitized.length >= 1 && userInputValueSanitized.length <= 100
      ? true
      : false;
  return isUserInputValid;
}

async function getMediaData(mediaType: "movie" | "tv", query: string) {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
  };

  const url = `https://api.themoviedb.org/3/search/${mediaType}?api_key=${apiToken}&query=${query}`;

  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Failed to fetch ${mediaType} results. Please try again.`);
    const data = await response.json();
    if (data.results.length === 0) throw new Error(`${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} not found. Please try again.`);
    console.log(data);
    return data;
  } catch (error: any) {
    console.error(error.message);
    displayError(error.message);
    return null;
  }
}

export function displayMediaData(mediaData: any) {
  if (!appEl) return;

  const genres = Array.from(new Set(mediaData.results.flatMap((item: any) => item.genre_ids.map((id: number) => getGenreName(id).trim())))).filter(Boolean);

  appEl.innerHTML = `
    <h2 class="text-2xl text-white text-center font-bold mb-8 mt-12">Search Results</h2>
    <div class="flex justify-center mb-4">
      <select id="genre-filter" class="mr-4 p-2 bg-gray-700 text-white rounded focus:outline-none">
        <option value="">All Genres</option>
        ${genres.map((genre) => `<option value="${genre}">${genre}</option>`).join("")}
      </select>
      <select id="media-type-filter" class="py-2 px-3 bg-gray-700 text-white rounded focus:outline-none">
        <option value="">Movies & TV Shows</option>
        <option value="movie">Movies</option>
        <option value="tv">TV Shows</option>
      </select>
    </div>
    <div id="media-container" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      ${mediaData.results
        .map(
          (item: any) => `
          <div class="card bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-101 mb-4" data-genre="${item.genre_ids.map((id: number) => getGenreName(id).trim()).join(", ")}" data-media-type="${item.media_type || (item.title ? 'movie' : 'tv')}">
            <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="${item.title || item.name}" class="w-full h-auto object-cover">
            <div class="p-4 text-white">
              <h3 class="text-xl font-bold mb-2">${item.title || item.name}</h3>
              <p class="text-sm mb-2">Release Date: ${item.release_date || item.first_air_date}</p>
              <p class="text-sm mb-2">Genres: ${item.genre_ids.map((id: number) => getGenreName(id).trim()).join(", ")}</p>
              <p class="text-sm">${item.overview}</p>
            </div>
          </div>
        `
        )
        .join("")}
    </div>
  `;

  const genreFilter = document.getElementById("genre-filter") as HTMLSelectElement;
  const mediaTypeFilter = document.getElementById("media-type-filter") as HTMLSelectElement;

  genreFilter.addEventListener("change", filterMedia);
  mediaTypeFilter.addEventListener("change", () => {
    genreFilter.value = ""; // Reset genre filter to "All Genres"
    filterMedia();
  });
}

function filterMedia() {
  const genreFilter = (document.getElementById("genre-filter") as HTMLSelectElement).value.toLowerCase();
  const mediaTypeFilter = (document.getElementById("media-type-filter") as HTMLSelectElement).value.toLowerCase();
  const mediaItems = document.querySelectorAll("#media-container .card");

  const availableGenres = new Set<string>();

  mediaItems.forEach((item) => {
    const itemGenres = (item.getAttribute("data-genre") || "").split(", ").map((genre) => genre.trim()).filter(Boolean);
    const itemMediaType = (item.getAttribute("data-media-type") || "").toLowerCase();

    const matchesGenre = !genreFilter || itemGenres.map((genre) => genre.toLowerCase()).includes(genreFilter);
    const matchesMediaType = !mediaTypeFilter || itemMediaType === mediaTypeFilter;

    if (matchesGenre && matchesMediaType) {
      (item as HTMLElement).style.display = "";
      itemGenres.forEach((genre) => availableGenres.add(genre));
    } else {
      (item as HTMLElement).style.display = "none";
    }
  });

  updateGenreFilter(Array.from(availableGenres));
}

function updateGenreFilter(genres: string[]) {
  const genreFilter = document.getElementById("genre-filter") as HTMLSelectElement;
  const currentGenre = genreFilter.value;

  genreFilter.innerHTML = `
    <option value="">All Genres</option>
    ${genres.map((genre) => `<option value="${genre}">${genre}</option>`).join("")}
  `;

  genreFilter.value = currentGenre;
}