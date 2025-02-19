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