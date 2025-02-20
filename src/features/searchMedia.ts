import { displayError } from "./displayError";
import { displayMediaData } from "./displayMedia";
import { getGenreName } from "./genreName";

const apiToken = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
const formEl = document.querySelector("form");
const appEl = document.getElementById("app");

export let movieGenres: string[] = [];
export let tvGenres: string[] = [];
export let allGenres: string[] = [];

formEl?.addEventListener("submit", (event) => searchMedia(event));

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
    if (!response.ok)
      throw new Error(`Failed to fetch results. Please try again.`);
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error: any) {
    console.error(error.message);
    displayError(error.message);
    return null;
  }
}
