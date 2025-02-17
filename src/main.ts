import "./styles/index.css";
import { displayPopularMovies, getPopularMovies } from "./features/popularMovies";
import { displayMovieData, searchMovie } from "./features/searchMovie";
import "./styles/index.css";

getPopularMovies().then(displayPopularMovies);
const event = new Event('submit');
searchMovie(event).then(displayMovieData);

