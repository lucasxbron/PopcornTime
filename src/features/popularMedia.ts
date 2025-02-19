import { displayError } from "./displayError";
import { getGenreName } from "./genreName";

const apiToken = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
const appEl = document.getElementById("app");

let currentPage = 1;

export async function getPopularMedia(type: "movie" | "tv", page = 1) {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
  };
  const url = `https://api.themoviedb.org/3/${type}/popular?language=en-US&page=${page}`;

  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Failed to fetch popular ${type}s. Please reload the page.`);
    const data = await response.json();
    console.log(data.results.slice(0, 20));
    return data.results.slice(0, 20);
  } catch (error: any) {
    console.error(error.message);
    displayError(error.message);
    return [];
  }
}

export function displayPopularMedia(type: "movie" | "tv", popularItems: any) {
  if (!appEl) return;

  const itemsHtml = popularItems
    .map(
      (item: any) => `
      <div class="card bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-101">
        <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="${
        item.title || item.name
      }" class="w-full h-auto object-cover">
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
    .join("");

  if (currentPage === 1) {
    appEl.innerHTML = `
      <h2 class="text-2xl text-white text-center font-bold mb-8 mt-8">Top Trending ${type === "movie" ? "Movies" : "TV Shows"}</h2>
      <div id="items-container" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      ${itemsHtml}
      </div>
      <div class="flex justify-center mt-4">
      <button id="show-more" class="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer">Show More</button>
      </div>
    `;
  } else {
    const itemsContainer = document.getElementById("items-container");
    if (itemsContainer) {
      itemsContainer.innerHTML += itemsHtml;
    }
  }

  const newShowMoreButton = document.getElementById("show-more");
  newShowMoreButton?.addEventListener("click", async () => {
    currentPage++;
    const moreItems = await getPopularMedia(type, currentPage);
    displayPopularMedia(type, moreItems);
  });
}