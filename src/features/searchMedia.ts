import { displayError } from "./displayError";
import { displayMediaData } from "./displaySearchedMedia";
import { getGenreName } from "./genreName";
import { isCacheValid } from "./utils";

const apiToken = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
const formEl = document.querySelector("form");
const appEl = document.getElementById("app");

interface CachedData {
  data: any;
  timestamp: number;
}

export let movieGenres: string[] = [];
export let tvGenres: string[] = [];
export let allGenres: string[] = [];

formEl?.addEventListener("submit", (event) => searchMedia(event));

/**
 * Searches for media based on the provided event or string input.
 *
 * @param event - The event object or a string representing the search query.
 *
 * If the event is not a string, it prevents the default action of the event.
 * Clears the content of the app element if it exists.
 * Sanitizes the user input and validates it.
 * If the input is valid, updates the URL with the search query and performs the search.
 *
 * @returns A promise that resolves when the search is complete.
 */
export async function searchMedia(event: Event | string) {
  if (typeof event !== "string") {
    event.preventDefault();
  }

  if (appEl) {
    appEl.innerHTML = "";
  }

  const sanitizedUserInput =
    typeof event === "string"
      ? sanitizeUserInput(event)
      : sanitizeUserInput(getMedia(event));

  if (!validateUserInput(sanitizedUserInput)) {
    return;
  }

  const newUrl = `/?search=${encodeURIComponent(sanitizedUserInput)}`;
  history.pushState(null, "", newUrl);

  await performSearch(sanitizedUserInput);
}

/**
 * Performs a search for media data (movies and TV shows) based on the sanitized user input.
 * It fetches movie and TV data concurrently, combines the results, and processes the genres.
 * If no results are found, an error message is displayed.
 * Otherwise, it extracts and filters unique genres for movies and TV shows, and displays the media data.
 *
 * @param {string} sanitizedUserInput - The sanitized input string from the user for searching media.
 * @returns {Promise<void>} A promise that resolves when the search operation is complete.
 */
async function performSearch(sanitizedUserInput: string) {
  const [movieData, tvData] = await Promise.all([
    getMediaData("movie", sanitizedUserInput),
    getMediaData("tv", sanitizedUserInput),
  ]);

  const combinedData = {
    results: [
      ...(movieData?.results || []).map((item: any) => ({
        ...item,
        media_type: "movie",
      })),
      ...(tvData?.results || []).map((item: any) => ({
        ...item,
        media_type: "tv",
      })),
    ],
  };

  if (combinedData.results.length === 0) {
    displayError("No results found. Please try a different search term.");
  } else {
    movieGenres = Array.from(
      new Set(
        combinedData.results
          .filter((item) => item.media_type === "movie")
          .flatMap((item) =>
            item.genre_ids
              ? item.genre_ids.map((id: number) => getGenreName(id).trim())
              : []
          )
      )
    ).filter(Boolean);

    tvGenres = Array.from(
      new Set(
        combinedData.results
          .filter((item) => item.media_type === "tv")
          .flatMap((item) =>
            item.genre_ids
              ? item.genre_ids.map((id: number) => getGenreName(id).trim())
              : []
          )
      )
    ).filter(Boolean);

    allGenres = Array.from(new Set([...movieGenres, ...tvGenres]));
    displayMediaData(combinedData); // Remove updateGenreFilter call here
  }
}

/**
 * Extracts the media input value from a form submission event.
 *
 * @param event - The form submission event.
 * @returns The media input value as a string.
 */
function getMedia(event: Event): string {
  const formData = new FormData(event.target as HTMLFormElement);
  const formInputs = Object.fromEntries(formData.entries());
  return formInputs.media as string;
}

function sanitizeUserInput(UserInputValue: string): string {
  return UserInputValue.trim().toLowerCase();
}

function isUserInputValid(userInputValueSanitized: string): boolean {
  return (
    userInputValueSanitized.length >= 1 && userInputValueSanitized.length <= 100
  );
}

function validateUserInput(userInputValueSanitized: string): boolean {
  const isValidUserInput = isUserInputValid(userInputValueSanitized);
  console.log("isValidUserInput:", isValidUserInput);

  if (!isValidUserInput) {
    displayError("Invalid input. Please enter a valid search term.");
  }

  return isValidUserInput;
}

/**
 * Fetches media data from The Movie Database (TMDB) API based on the specified media type and query.
 * Utilizes local storage to cache results and avoid redundant API calls.
 *
 * @param mediaType - The type of media to search for, either "movie" or "tv".
 * @param query - The search query string.
 * @returns A promise that resolves to the fetched media data or null if an error occurs.
 *
 * @throws Will throw an error if the fetch request fails.
 */
async function getMediaData(mediaType: "movie" | "tv", query: string) {
  const cacheKey = `tmdb_search_${mediaType}_${query}`;

  // Check for cached data
  const cachedContent = localStorage.getItem(cacheKey);
  if (cachedContent) {
    const cached: CachedData = JSON.parse(cachedContent);
    if (isCacheValid(cached.timestamp)) {
      console.log(`Using cached data for ${mediaType} search: ${query}`);
      return cached.data;
    } else {
      // Cache expired, remove it
      localStorage.removeItem(cacheKey);
    }
  }

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
    if (!response.ok)
      throw new Error(`Failed to fetch results. Please try again.`);
    const data = await response.json();

    // Cache the new data
    const cacheData: CachedData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));

    console.log(data);
    return data;
  } catch (error: any) {
    console.error(error.message);
    displayError(error.message);
    return null;
  }
}
