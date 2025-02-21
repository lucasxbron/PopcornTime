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

export async function getHomepageContent(): Promise<HomepageContent> {
  const [trending, upcoming, topRated] =
    await Promise.all([
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

function setupEventListeners() {
  const sections = ["trending", "upcoming", "top-rated"];
  sections.forEach((section) => {
    const showMoreButton = document.getElementById(`show-more-${section}`);
    let currentPage = 1;
    let itemsPerLoad = getInitialItemCount() * 2;

    showMoreButton?.addEventListener("click", async () => {
      currentPage++;
      let endpoint = '';
      
      if (section === "trending") {
        endpoint = `/trending/all/day?page=${currentPage}`;
      } else if (section === "upcoming") {
        endpoint = `/movie/upcoming?page=${currentPage}`;
      } else if (section === "top-rated") {
        endpoint = `/movie/top_rated?page=${currentPage}`;
      }

      const moreItems = await fetchTMDBData(endpoint);
      const itemsContainer = document.getElementById(
        `${section}-items-container`
      );
      if (itemsContainer) {
        itemsContainer.innerHTML += moreItems.results
          .slice(0, itemsPerLoad)
          .map((item: MediaItem) => renderMediaCard(item))
          .join("");
      }
    });
  });
}
