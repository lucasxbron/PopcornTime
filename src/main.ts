import "./styles/index.css";
import { initializeNavigation, loadPageContent } from "./features/navigation/router";
import "./features/searchMedia";
import { setupClearSearchButton } from "./features/utils";

initializeNavigation();
loadPageContent();
setupClearSearchButton();