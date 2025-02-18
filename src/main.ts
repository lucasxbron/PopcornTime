import "./styles/index.css";
// import { displayPopularMedia, getPopularMedia } from "./features/popularMedia";
import { displayMovieData, searchMovie } from "./features/searchMovie";
import { setupNavigation, initializePageLogic } from "./features/navigation/router";

setupNavigation();
initializePageLogic();

// getPopularMedia("movie").then((items) => displayPopularMedia("movie", items));
const event = new Event('submit');
searchMovie(event).then(displayMovieData);

