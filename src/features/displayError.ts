const appEl = document.getElementById("app");

export function displayError(message: string) {
    if (!appEl) return;
    appEl.innerHTML = `
            <div class="text-2xl text-white text-center font-bold mb-8 mt-24">
                    <p class="text-lg">${message}</p>
            </div>
        `;
  }