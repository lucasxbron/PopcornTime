import { displayError } from "./displayError";
import { getGenreName } from "./genreName";

const apiToken = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
const formEl = document.querySelector("form");
const appEl = document.getElementById("app");

formEl?.addEventListener("submit", searchMovie);

export async function searchMovie(event: Event) {
  event.preventDefault();
  if (appEl) {
    appEl.innerHTML = "";
  }
  const movie = getMovie(event);
  const sanitizedMovie = sanitizeMovie(movie);
  const isValidMovie = isMovieValid(sanitizedMovie);
  console.log("sanitizedMovie:", sanitizedMovie);

  if (!isValidMovie) {
    console.log("isValidMovie:", isValidMovie);
    return;
  }
  await getMovieData(sanitizedMovie);
}

function getMovie(event: Event): string {
  const formData = new FormData(event.target as HTMLFormElement);
  const formInputs = Object.fromEntries(formData.entries());
  const movieValue = formInputs.movie as string;
  return movieValue;
}

function sanitizeMovie(movieValue: string): string {
  const movieValueSanitized = movieValue.trim().toLowerCase();
  return movieValueSanitized;
}

function isMovieValid(movieValueSanitized: string): boolean {
  const isMovieValid =
    movieValueSanitized.length >= 1 && movieValueSanitized.length <= 100
      ? true
      : false;
  return isMovieValid;
}

async function getMovieData(movie: string) {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
  };

  const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiToken}&query=${movie}`;

  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error("Failed to fetch results. Please try again.");
    const data = await response.json();
    if (data.results.length === 0) throw new Error("Movie not found. Please try again.");
    console.log(data);
    displayMovieData(data);
    return data;
  } catch (error: any) {
    console.error(error.message);
    displayError(error.message);
    return null;
  }
}

export function displayMovieData(movieData: any) {
  if (!appEl) return;
  appEl.innerHTML = `
    <h2 class="text-2xl text-white text-center font-bold mb-8 mt-12">Search Results</h2>
    <div id="movies-container" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      ${movieData.results
        .map(
          (movie: any) => `
          <div class="card bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-101 mb-4">
            <img src="https://image.tmdb.org/t/p/w500${
              movie.poster_path
            }" alt="${movie.title}" class="w-full h-auto object-cover">
            <div class="p-4 text-white">
              <h3 class="text-xl font-bold mb-2">${movie.title}</h3>
              <p class="text-sm mb-2">Release Date: ${movie.release_date}</p>
              <p class="text-sm mb-2">Genres: ${movie.genre_ids
                .map((id: number) => getGenreName(id))
                .join(", ")}</p>
              <p class="text-sm">${movie.overview}</p>
            </div>
          </div>
        `
        )
        .join("")}
    </div>
  `;
}