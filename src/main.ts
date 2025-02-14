import "./styles/index.css";
const apiKey = import.meta.env.VITE_OMDB_API_KEY;
const formEl = document.querySelector("form");
const messageEl = document.getElementById("message");
const movieEl = document.getElementById("movie-data");
const posterEl = document.getElementById("movie-poster");

formEl?.addEventListener("submit", searchMovie);

async function searchMovie(event: Event) {
  event.preventDefault();
  const movie = getMovie(event);
  const sanitizedMovie = sanitizeMovie(movie);
  const isValidMovie = isMovieValid(sanitizedMovie);
  console.log('sanitizedMovie:',sanitizedMovie);

  if (!isValidMovie) {
    console.log('isValidMovie:',isValidMovie);
    return;
  } await getMovieData(sanitizedMovie)
}

function getMovie(event: Event): string {
  const formData = new FormData(event.target as HTMLFormElement);
  const formInputs = Object.fromEntries(formData.entries());
  const movieValue = formInputs.movie as string;
  return movieValue;
}

function sanitizeMovie(movieValue: string): string {
  const movieValueSanitized = movieValue.trim().toLowerCase();
  return movieValueSanitized;
}

function isMovieValid(movieValueSanitized: string): boolean {
  const isMovieValid =
  movieValueSanitized.length >= 1 && movieValueSanitized.length <= 100
      ? true
      : false;
  return isMovieValid;
}

async function getMovieData(movie: string) {
  const url = `http://www.omdbapi.com/?apikey=${apiKey}&t=${movie}`;
  const response = await fetch(url);
  const data = await response.json();
  console.log(data);
}

// async function getMovieData(movie: string) {
//   const url = `http://www.omdbapi.com/?apikey=${apiKey}&t=${movie}`;
//   try {
//     const response = await fetch(url);
//     if (!response.ok) throw new Error("City not found. Please try again.");
//     const data = await response.json();
//     console.log(data);
//     // displayMovieData(data);
//     // localStorage.setItem(

//     // );
//     return data;
//   } catch (error: any) {
//     console.error(error.message);
//     displayError(error.message);
//     return null;
//   }
// }

// function displayError(message: string) {
//   if (!messageEl) return;
//   messageEl.classList.remove("hidden");
//   messageEl.innerHTML = `
//         <div class="mt-6 rounded-lg p-6 text-black">
//                 <p class="text-lg">${message}</p>
//         </div>
//     `;
// }


// function displayMovieData(movieData: any) {
//   if (!movieEl) return;
//   movieEl.innerHTML = `
//     <div class="mt-6 shadow-md rounded-lg p-6 text-white bg-blue-500">
//         <h2 class="text-2xl font-bold mb-2">${cityName}</h2>
//         <p class="text-lg"><span class="inline-block w-8 text-center"><i class="fas fa-thermometer-half"></i></span> Temperature: ${tempCelsius.toFixed(
//           1
//         )}°C</p>
//         <p class="text-lg"><span class="inline-block w-8 text-center"><i class="fas fa-cloud"></i></span> Weather: ${
//           todayWeather.weather[0].description
//         }</p>
//         <p class="text-lg"><span class="inline-block w-8 text-center"><i class="fas fa-tint"></i></span> Humidity: ${
//           todayWeather.main.humidity
//         }%</p>
//         <p class="text-lg"><span class="inline-block w-8 text-center"><i class="fas fa-wind"></i></span> Wind Speed: ${
//           todayWeather.wind.speed
//         } m/s</p>
//     </div>
// `;
// }