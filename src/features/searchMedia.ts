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
  appEl.innerHTML = `
    <h2 class="text-2xl text-white text-center font-bold mb-8 mt-12">Search Results</h2>
    <div id="media-container" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      ${mediaData.results
        .map(
          (item: any) => `
          <div class="card bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-101 mb-4">
            <img src="https://image.tmdb.org/t/p/w500${
              item.poster_path
            }" alt="${item.title || item.name}" class="w-full h-auto object-cover">
            <div class="p-4 text-white">
              <h3 class="text-xl font-bold mb-2">${item.title || item.name}</h3>
              <p class="text-sm mb-2">Release Date: ${item.release_date || item.first_air_date}</p>
              <p class="text-sm mb-2">Genres: ${item.genre_ids
                .map((id: number) => getGenreName(id))
                .join(", ")}</p>
              <p class="text-sm">${item.overview}</p>
            </div>
          </div>
        `
        )
        .join("")}
    </div>
  `;
}