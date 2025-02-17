const movieEl = document.getElementById("movie-data");

export function displayError(message: string) {
    if (!movieEl) return;
    movieEl.innerHTML = `
            <div class="text-2xl text-white text-center font-bold mb-8 mt-24">
                    <p class="text-lg">${message}</p>
            </div>
        `;
  }