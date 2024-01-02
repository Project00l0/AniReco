# AniReco
This platform provides suggestions based on the anime/manga title you input. It searches for recommendations within the same genre and ratings as your entered title.


>>The recommendation system of AniReco is still undergoing optimization, so we appreciate your patience as we work on further updates.

# Documentation

## Overview:
This Node.js application utilizes Express.js to create a web server that interacts with the MyAnimeList (MAL) API through the `mal-scraper` library. The application allows users to search for anime and manga recommendations based on specified genres and score ranges.

## Dependencies:
- **express**: A web framework for Node.js.
- **express-session**: Middleware for session management.
- **body-parser**: Parses incoming request bodies.
- **cors**: Enables Cross-Origin Resource Sharing.
- **fs**: File system module for reading files.
- **mal-scraper**: Library for scraping information from MyAnimeList.

## Middleware:
- **cors**: Enables Cross-Origin Resource Sharing to handle requests from different domains.
- **body-parser**: Parses JSON and URL-encoded request bodies.
- **express.static**: Serves static files from the "public" directory.
- **express-session**: Manages user sessions.

## Configuration:
- The application listens on port 3000.
- Session secret is set to 'gensco'.
- The `mal-scraper` is used to interact with the MyAnimeList API.

## Functions:

### 1. `convertGenresToCodes(sessGenre)`
- **Input**: Array of genre names.
- **Output**: Converts an array of genre names to an array of corresponding genre codes based on the predefined mapping.

### 2. `compareByScore(anime1, anime2)`
- **Input**: Two anime objects.
- **Output**: Comparison function to sort anime objects by score in descending order.

## Routes:

### 1. `/search` and `/searchManga`
- **Method**: POST
- **Purpose**: Handles user input for anime or manga search.
- **Functionality**: Clears session data, fetches genre information for the provided title, and redirects to the respective recommendation page.

### 2. `/Manga_recommendations` and `/recommendations`
- **Method**: GET
- **Purpose**: Displays anime or manga recommendations based on user input.
- **Functionality**: Retrieves genre information from the session, performs a search, and dynamically generates HTML content for recommended titles. Supports pagination with "Next Page" links.

### 3. `/nextMangaPage` and `/nextAniPage`
- **Method**: GET
- **Purpose**: Handles pagination for manga and anime recommendations.
- **Functionality**: Adjusts score ranges and redirects to the respective recommendation page.

### 4. `/`
- **Method**: GET
- **Purpose**: Redirects the root URL to the main HTML page.

## HTML Templates:
- The application utilizes HTML templates located in the "public/html" directory.

## Note:
- The application has error handling for various scenarios.
- Session variables are used to persist user input and recommendations across routes.
- The application supports both anime and manga recommendations.
- Pagination is implemented to allow users to navigate through multiple pages of recommendations.
