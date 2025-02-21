import { getGenreName } from "./genreName";
import { getInitialItemCount, isCacheValid } from "./utils";

const apiToken = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
const appEl = document.getElementById("app");

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  media_type: "movie" | "tv";
  genre_ids: number[];
  release_date?: string;
  first_air_date?: string;
  poster_path: string;
  overview: string;
}

interface HomepageContent {
  trendingNow: MediaItem[];
  upcomingReleases: MediaItem[];
  topRated: MediaItem[];
}

interface CachedData {
  data: any;
  timestamp: number;
}

interface SectionData {
  allItems: MediaItem[];
  currentPage: number;
}

const sectionData: { [key: string]: SectionData } = {
  trending: { allItems: [], currentPage: 1 },
  upcoming: { allItems: [], currentPage: 1 },
  "top-rated": { allItems: [], currentPage: 1 },
};

/**
 * Fetches and returns the homepage content including trending, upcoming, and top-rated movies.
 *
 * @returns {Promise<HomepageContent>} A promise that resolves to an object containing arrays of trending, upcoming, and top-rated movies.
 */
export async function getHomepageContent(): Promise<HomepageContent> {
  const [trending, upcoming, topRated] = await Promise.all([
    fetchTMDBData("/trending/all/day"),
    fetchTMDBData("/movie/upcoming"),
    fetchTMDBData("/movie/top_rated"),
  ]);

  return {
    trendingNow: trending.results,
    upcomingReleases: upcoming.results,
    topRated: topRated.results,
  };
}

/**
 * Fetches data from The Movie Database (TMDB) API with caching support.
 *
 * This function attempts to retrieve data from the local storage cache first.
 * If the cached data is not available or has expired, it fetches new data from the TMDB API.
 * The fetched data is then cached in local storage for future use.
 *
 * @param {string} endpoint - The TMDB API endpoint to fetch data from.
 * @returns {Promise<any>} - A promise that resolves to the fetched data.
 *
 * @throws {Error} - Throws an error if the fetch operation fails.
 */
async function fetchTMDBData(endpoint: string) {
  const cacheKey = `tmdb_${endpoint}`;

  // Check if we have cached data
  const cachedContent = localStorage.getItem(cacheKey);
  if (cachedContent) {
    const cached: CachedData = JSON.parse(cachedContent);
    if (isCacheValid(cached.timestamp)) {
      console.log(`Using cached data for ${endpoint}`);
      return cached.data;
    } else {
      // Cache expired, remove it
      localStorage.removeItem(cacheKey);
    }
  }

  // If no cache or expired, fetch new data
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
  };

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3${endpoint}`,
      options
    );
    if (!response.ok)
      throw new Error(`Failed to fetch ${endpoint}. Please try again.`);

    const data = await response.json();

    // Cache the new data
    const cacheData: CachedData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));

    return data;
  } catch (error) {
    console.error(error);
    return { results: [] };
  }
}

export function displayHomepage(content: HomepageContent) {
  if (!appEl) return;

  appEl.innerHTML = `
    <div class="">
      ${renderSection("Trending Now", content.trendingNow, "trending")}
      <div class="mb-12"></div>
      ${renderSection("Coming Soon", content.upcomingReleases, "upcoming")}
      <div class="mb-12"></div>
      ${renderSection("Top Rated", content.topRated, "top-rated")}
    </div>
  `;

  setupEventListeners();
}

function renderSection(
  title: string,
  items: MediaItem[],
  type: string
): string {
  const itemCount = getInitialItemCount();

  // Initialize or update section data
  if (sectionData[type].currentPage === 1) {
    sectionData[type].allItems = items;
  }

  return `
    <section class="mt-4 animate-fade-in">
       <div class="flex items-center justify-center mb-8">
            <hr class="flex-grow border-gray-500">
            <h2 class="text-2xl text-white text-center font-bold mx-4">${title}</h2>
            <hr class="flex-grow border-gray-500">
        </div>
      <div id="${type}-items-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-5">
        ${items
          .slice(0, itemCount)
          .map((item) => renderMediaCard(item))
          .join("")}
      </div>
      <div class="flex justify-center mt-8">
        <button id="show-more-${type}" class="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded cursor-pointer">Show More</button>
      </div>
    </section>
  `;
}

function renderMediaCard(item: MediaItem): string {
  return `
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
  `;
}

/**
 * Sets up event listeners for the "Show More" buttons in the trending, upcoming, and top-rated sections.
 * When a "Show More" button is clicked, it fetches additional items from the TMDB API and appends them to the respective section.
 *
 * The sections handled are:
 * - trending
 * - upcoming
 * - top-rated
 *
 * The function performs the following steps:
 * 1. Iterates over the predefined sections.
 * 2. For each section, it retrieves the "Show More" button element.
 * 3. Adds a click event listener to the button.
 * 4. On button click, increments the current page number.
 * 5. Determines the appropriate API endpoint based on the section.
 * 6. Fetches additional items from the TMDB API.
 * 7. Appends the fetched items to the respective section's container.
 *
 * @function
 * @name setupEventListeners
 */
function setupEventListeners() {
  const sections = ["trending", "upcoming", "top-rated"];
  sections.forEach((section) => {
    const showMoreButton = document.getElementById(`show-more-${section}`);
    const itemCount = getInitialItemCount();
    const itemsPerLoad = itemCount * 2;

    showMoreButton?.addEventListener("click", async () => {
      sectionData[section].currentPage++;
      let endpoint = "";

      if (section === "trending") {
        endpoint = `/trending/all/day?page=${sectionData[section].currentPage}`;
      } else if (section === "upcoming") {
        endpoint = `/movie/upcoming?page=${sectionData[section].currentPage}`;
      } else if (section === "top-rated") {
        endpoint = `/movie/top_rated?page=${sectionData[section].currentPage}`;
      }

      const moreItems = await fetchTMDBData(endpoint);
      if (moreItems.results) {
        // Add new items to collection
        sectionData[section].allItems = [
          ...sectionData[section].allItems,
          ...moreItems.results,
        ];

        const itemsContainer = document.getElementById(
          `${section}-items-container`
        );
        if (itemsContainer) {
          // Show all items up to the current page
          itemsContainer.innerHTML = sectionData[section].allItems
            .slice(0, itemsPerLoad * sectionData[section].currentPage)
            .map((item: MediaItem) => renderMediaCard(item))
            .join("");
        }
      }
    });
  });
}
