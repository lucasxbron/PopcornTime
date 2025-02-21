import { displayError } from "./displayError";
import { getGenreName } from "./genreName";
import { isCacheValid } from "./utils";

const apiToken = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
const appEl = document.getElementById("app");

interface CachedData {
  data: any;
  timestamp: number;
}

let currentPage = 1;

/**
 * Fetches popular media (movies or TV shows) from the TMDB API.
 * 
 * This function first checks if the data is available in the local storage cache.
 * If cached data is found and is still valid, it returns the cached data.
 * Otherwise, it fetches the data from the TMDB API, caches it, and then returns it.
 * 
 * @param type - The type of media to fetch, either "movie" or "tv".
 * @param page - The page number to fetch, defaults to 1.
 * @returns A promise that resolves to an array of popular media items.
 * 
 * @throws Will throw an error if the fetch operation fails.
 */
export async function getPopularMedia(type: "movie" | "tv", page = 1) {
  const cacheKey = `tmdb_${type}_popular_page${page}`;
  
  // Check for cached data
  const cachedContent = localStorage.getItem(cacheKey);
  if (cachedContent) {
    const cached: CachedData = JSON.parse(cachedContent);
    if (isCacheValid(cached.timestamp)) {
      console.log(`Using cached data for popular ${type}s page ${page}`);
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
  const url = `https://api.themoviedb.org/3/${type}/popular?language=en-US&page=${page}`;

  try {
    const response = await fetch(url, options);
    if (!response.ok)
      throw new Error(
        `Failed to fetch popular ${type}s. Please reload the page.`
      );
    const data = await response.json();
    const results = data.results.slice(0, 20);
    
    // Cache the new data
    const cacheData: CachedData = {
      data: results,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    
    console.log(results);
    return results;
  } catch (error: any) {
    console.error(error.message);
    displayError(error.message);
    return [];
  }
}

/**
 * Displays popular media items (movies or TV shows) on the web page.
 *
 * @param type - The type of media to display, either "movie" or "tv".
 * @param popularItems - An array of popular media items to display.
 *
 * This function generates HTML content for the provided popular media items and inserts it into the DOM.
 * If the current page is the first page, it creates a new container with a header and a "Show More" button.
 * If the current page is not the first page, it appends the new items to the existing container.
 *
 * The "Show More" button, when clicked, fetches more popular media items and displays them.
 */
export function displayPopularMedia(type: "movie" | "tv", popularItems: any) {
  if (!appEl) return;

  const itemsHtml = popularItems
    .map(
      (item: any) => `
      <div class="card bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-103 transition-transform duration-300">
        <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="${
        item.title || item.name
      }" class="w-full h-auto object-cover">
        <div class="p-4 text-white">
          <h3 class="text-xl font-bold mb-2">${item.title || item.name}</h3>
          <p class="text-sm mb-2">Release Date: ${
            item.release_date || item.first_air_date
          }</p>
          <p class="text-sm mb-2">Genres: ${item.genre_ids
            .map((id: number) => getGenreName(id))
            .join(", ")}</p>
          <p class="text-sm line-clamp-3">${item.overview}</p>
        </div>
      </div>
    `
    )
    .join("");

  if (currentPage === 1) {
    appEl.innerHTML = `
           <div class="flex items-center justify-center mt-4 mb-8 animate-fade-in">
            <hr class="flex-grow border-gray-500">
            <h2 class="text-2xl text-white text-center font-bold mx-4">Top Trending ${
              type === "movie" ? "Movies" : "TV Shows"
            }</h2>
            <hr class="flex-grow border-gray-500">
        </div>
      
      <div id="items-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-5 animate-fade-in">
      ${itemsHtml}
      </div>
      <div class="flex justify-center mt-8">
      <button id="show-more" class="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded cursor-pointer">Show More</button>
      </div>
    `;
  } else {
    const itemsContainer = document.getElementById("items-container");
    if (itemsContainer) {
      itemsContainer.innerHTML += itemsHtml;
    }
  }

  const showMoreButton = document.getElementById("show-more");
  if (showMoreButton) {
    const newShowMoreButton = showMoreButton.cloneNode(true);
    showMoreButton.parentNode?.replaceChild(newShowMoreButton, showMoreButton);
    
    newShowMoreButton.addEventListener("click", async () => {
      currentPage++;
      const moreItems = await getPopularMedia(type, currentPage);
      displayPopularMedia(type, moreItems);
    });
  }
}
