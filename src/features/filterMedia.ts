import { allGenres, movieGenres, tvGenres } from "./searchMedia";

/**
 * Filters media items based on selected genre and media type.
 *
 * This function retrieves the selected genre and media type from the respective
 * dropdown elements, then iterates over all media items to determine which items
 * match the selected filters. Matching items are displayed, while non-matching
 * items are hidden. Additionally, it updates the available genres based on the
 * filtered media items and updates the genre filter options accordingly.
 *
 * @remarks
 * - The genre filter and media type filter values are converted to lowercase for
 *   case-insensitive comparison.
 * - Media items are expected to have `data-genre` and `data-media-type` attributes
 *   for filtering purposes.
 * - The function updates the genre filter options based on the selected media type.
 */
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

/**
 * Updates the genre filter dropdown with the provided genres.
 *
 * This function updates the options of a select element with the id "genre-filter".
 * It sets the options based on the provided genres array and retains the current
 * selected value if it exists in the new options.
 *
 * @param genres - An array of genre strings to populate the dropdown options.
 */
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
