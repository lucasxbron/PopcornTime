import "./styles/index.css";
import { initializeNavigation, loadPageContent } from "./features/navigation/router";
import "./features/searchMedia";
import { setupClearSearchButton, toggleFooterClasses } from "./features/utils";

initializeNavigation();
loadPageContent();
setupClearSearchButton();
toggleFooterClasses();