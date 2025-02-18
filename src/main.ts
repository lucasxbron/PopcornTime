import "./styles/index.css";
import { displayPopularMovies, getPopularMovies } from "./features/popularMovies";
import { displayMovieData, searchMovie } from "./features/searchMovie";
import { setupNavigation, initializePageLogic } from "./features/navigation/router";

setupNavigation();

initializePageLogic();

// getPopularMovies().then(displayPopularMovies);
// const event = new Event('submit');
// searchMovie(event).then(displayMovieData);

