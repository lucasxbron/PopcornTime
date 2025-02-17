import { displayError } from "./displayError";
import { getGenreName } from "./genreName";

const apiToken = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
const movieEl = document.getElementById("movie-data");

let currentPage = 1;

export async function getPopularMovies(page = 1) {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
  };
  const url = `https://api.themoviedb.org/3/movie/popular?language=en-US&page=${page}`;

  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error("Failed to fetch popular movies. Please reload the page.");
    const data = await response.json();
    console.log(data.results.slice(0, 20));
    return data.results.slice(0, 20);
  } catch (error: any) {
    console.error(error.message);
    displayError(error.message);
    return [];
  }
}

export function displayPopularMovies(popularMovies: any) {
  if (!movieEl) return;

  const moviesHtml = popularMovies
    .map(
      (movie: any) => `
      <div class="card bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-101">
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${
        movie.title
      }" class="w-full h-auto object-cover">
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
    .join("");

  if (currentPage === 1) {
    movieEl.innerHTML = `
      <h2 class="text-2xl text-white text-center font-bold mb-8 mt-24">Top Trending Movies</h2>
      <div id="movies-container" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      ${moviesHtml}
      </div>
      <div class="flex justify-center mt-4">
      <button id="show-more" class="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer">Show More</button>
      </div>
    `;
  } else {
    const moviesContainer = document.getElementById("movies-container");
    if (moviesContainer) {
      moviesContainer.innerHTML += moviesHtml;
    }
  }

  const newShowMoreButton = document.getElementById("show-more");
  newShowMoreButton?.addEventListener("click", async () => {
    currentPage++;
    const moreMovies = await getPopularMovies(currentPage);
    displayPopularMovies(moreMovies);
  });
}
