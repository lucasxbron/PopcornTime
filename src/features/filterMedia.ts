export function filterMedia() {
    const genreFilter = (document.getElementById("genre-filter") as HTMLSelectElement).value.toLowerCase();
    const mediaTypeFilter = (document.getElementById("media-type-filter") as HTMLSelectElement).value.toLowerCase();
    const mediaItems = document.querySelectorAll("#media-container .card");
  
    const availableGenres = new Set<string>();
  
    mediaItems.forEach((item) => {
      const itemGenres = (item.getAttribute("data-genre") || "").split(", ").map((genre) => genre.trim()).filter(Boolean);
      const itemMediaType = (item.getAttribute("data-media-type") || "").toLowerCase();
  
      const matchesGenre = !genreFilter || itemGenres.map((genre) => genre.toLowerCase()).includes(genreFilter);
      const matchesMediaType = !mediaTypeFilter || itemMediaType === mediaTypeFilter;
  
      if (matchesGenre && matchesMediaType) {
        (item as HTMLElement).style.display = "";
        itemGenres.forEach((genre) => availableGenres.add(genre));
      } else {
        (item as HTMLElement).style.display = "none";
      }
    });
  
    updateGenreFilter(Array.from(availableGenres));
  }
  
  function updateGenreFilter(genres: string[]) {
    const genreFilter = document.getElementById("genre-filter") as HTMLSelectElement;
    const currentGenre = genreFilter.value;
  
    genreFilter.innerHTML = `
      <option value="">All Genres</option>
      ${genres.map((genre) => `<option value="${genre}">${genre}</option>`).join("")}
    `;
  
    genreFilter.value = currentGenre;
  }