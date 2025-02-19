import { displayError } from "./displayError";
import { displayMediaData } from "./displayMedia";

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

  if (!validateUserInput(sanitizedUserInput)) {
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

  if (!validateUserInput(sanitizedUserInput)) {
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

  if (combinedData.results.length === 0) {
    displayError("No results found. Please try a different search term.");
  } else {
    displayMediaData(combinedData);
  }
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
  return userInputValueSanitized.length >= 1 && userInputValueSanitized.length <= 100;
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
    if (!response.ok) throw new Error(`Failed to fetch results. Please try again.`);
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error: any) {
    console.error(error.message);
    displayError(error.message);
    return null;
  }
}