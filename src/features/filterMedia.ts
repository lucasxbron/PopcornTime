import { allGenres, movieGenres, tvGenres } from "./searchMedia";

export function filterMedia() {
  const genreFilter = (
    document.getElementById("genre-filter") as HTMLSelectElement
  ).value.toLowerCase();
  const mediaTypeFilter = (
    document.getElementById("media-type-filter") as HTMLSelectElement
  ).value.toLowerCase();
  const mediaItems = document.querySelectorAll("#media-container .card");

  const availableGenres = new Set<string>();

  mediaItems.forEach((item) => {
    const itemGenres = (item.getAttribute("data-genre") || "")
      .split(", ")
      .map((genre) => genre.trim())
      .filter(Boolean);
    const itemMediaType = (
      item.getAttribute("data-media-type") || ""
    ).toLowerCase();

    const matchesGenre =
      !genreFilter ||
      itemGenres.map((genre) => genre.toLowerCase()).includes(genreFilter);
    const matchesMediaType =
      !mediaTypeFilter || itemMediaType === mediaTypeFilter;

    if (matchesGenre && matchesMediaType) {
      (item as HTMLElement).style.display = "";
      itemGenres.forEach((genre) => availableGenres.add(genre));
    } else {
      (item as HTMLElement).style.display = "none";
    }
  });

  let genresToShow = allGenres;
  if (mediaTypeFilter === "movie") {
    genresToShow = movieGenres;
  } else if (mediaTypeFilter === "tv") {
    genresToShow = tvGenres;
  }

  updateGenreFilter(genresToShow);
}
export function updateGenreFilter(genres: string[]) {
  const genreFilterElement = document.getElementById(
    "genre-filter"
  ) as HTMLSelectElement;
  if (!genreFilterElement) {
    console.error("Genre filter element not found");
    return;
  }

  const currentValue = genreFilterElement.value;

  genreFilterElement.innerHTML = `
    <option value="">All Genres</option>
    ${genres
      .map(
        (genre) =>
          `<option value="${genre.toLowerCase()}" ${
            currentValue === genre.toLowerCase() ? "selected" : ""
          }>${genre}</option>`
      )
      .join("")}
  `;
}
