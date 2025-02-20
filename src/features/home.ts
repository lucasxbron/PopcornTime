import { getGenreName } from "./genreName";

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
  popularMovies: MediaItem[];
  popularTVShows: MediaItem[];
  upcomingReleases: MediaItem[];
  topRated: MediaItem[];
}

export async function getHomepageContent(): Promise<HomepageContent> {
  const [trending, popularMovies, popularTV, upcoming, topRated] =
    await Promise.all([
      fetchTMDBData("/trending/all/day"),
      fetchTMDBData("/movie/popular"),
      fetchTMDBData("/tv/popular"),
      fetchTMDBData("/movie/upcoming"),
      fetchTMDBData("/movie/top_rated"),
    ]);

  return {
    trendingNow: trending.results,
    popularMovies: popularMovies.results,
    popularTVShows: popularTV.results,
    upcomingReleases: upcoming.results,
    topRated: topRated.results,
  };
}

async function fetchTMDBData(endpoint: string) {
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
    return await response.json();
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
  return `
    <section class="mt-4 animate-fade-in">
       <div class="flex items-center justify-center mb-8">
            <hr class="flex-grow border-gray-500">
            <h2 class="text-2xl text-white text-center font-bold mx-4">${title}</h2>
            <hr class="flex-grow border-gray-500">
        </div>
      <div id="${type}-items-container" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        ${items
          .slice(0, 5)
          .map((item) => renderMediaCard(item))
          .join("")}
      </div>
      <div class="flex justify-center mt-8">
        <button id="show-more-${type}" class="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer">Show More</button>
      </div>
    </section>
  `;
}

function renderMediaCard(item: MediaItem): string {
  return `
    <div class="card bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 animate-fade-in">
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

    showMoreButton?.addEventListener("click", async () => {
      currentPage++;
      let moreItems;
      if (section === "trending") {
        moreItems = await fetchTMDBData(
          `/trending/all/day?page=${currentPage}`
        );
      } else if (section === "upcoming") {
        moreItems = await fetchTMDBData(`/movie/upcoming?page=${currentPage}`);
      } else if (section === "top-rated") {
        moreItems = await fetchTMDBData(`/movie/top_rated?page=${currentPage}`);
      }
      const itemsContainer = document.getElementById(
        `${section}-items-container`
      );
      if (itemsContainer) {
        itemsContainer.innerHTML += moreItems.results
          .map((item: MediaItem) => renderMediaCard(item))
          .join("");
      }
    });
  });
}
