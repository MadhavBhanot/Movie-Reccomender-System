let movies = [];
let similarity = [];

// Fetch the movie and similarity data
async function loadData() {
    try {
        const movieResponse = await fetch('movies.json');
        const similarityResponse = await fetch('similarity.json');
        movies = await movieResponse.json();
        similarity = await similarityResponse.json();
        populateMovieDropdown();  // Populate datalist for search suggestions
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Populate datalist for searchable dropdown
function populateMovieDropdown() {
    const movieTitles = document.getElementById('movieTitles'); // Datalist element
    movies.forEach(movie => {
        const option = document.createElement('option');
        option.value = movie.title;
        movieTitles.appendChild(option);
    });
}

// Fetch movie poster using The Movie DB API
async function fetchPoster(movie_id) {
    const url = `https://api.themoviedb.org/3/movie/${movie_id}?api_key=b71e51bd3f242fbc97a771bcce0f9944&language=en-US`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.poster_path ? `https://image.tmdb.org/t/p/w500/${data.poster_path}` : null;
    } catch (error) {
        console.error('Error fetching poster:', error);
        return null;
    }
}

// Recommend movies based on the current search
async function recommend(movieTitle) {
    const recommendationsDiv = document.getElementById('recommendations');
    recommendationsDiv.innerHTML = ''; // Clear previous recommendations

    const movieIndex = movies.findIndex(movie => movie.title === movieTitle);

    // Ensure the movie exists in the dataset
    if (movieIndex === -1) {
        alert('Movie not found.');
        return;
    }

    const distances = similarity[movieIndex]
        .map((sim, idx) => [idx, sim])
        .sort((a, b) => b[1] - a[1]);

    const recommendedMovies = [];
    for (let i = 1; i < Math.min(6, distances.length); i++) { // Get up to 5 recommended movies
        const movieData = movies[distances[i][0]];
        const poster = await fetchPoster(movieData.movie_id);
        if (poster) {
            recommendedMovies.push({ poster, title: movieData.title });
        }
    }

    displayRecommendations(recommendedMovies.slice(0, 5)); // Limit to 5 recommendations
}

// Display the recommended movies
function displayRecommendations(recommendedMovies) {
    const recommendationsDiv = document.getElementById('recommendations');

    if (recommendedMovies.length === 0) {
        const noResultsMessage = document.createElement('p');
        noResultsMessage.textContent = 'No recommendations found.';
        recommendationsDiv.appendChild(noResultsMessage);
        return;
    }

    recommendedMovies.forEach(movie => {
        const movieDiv = document.createElement('div');
        movieDiv.classList.add('movie');
        
        const moviePoster = document.createElement('img');
        moviePoster.src = movie.poster;
        moviePoster.alt = movie.title;

        const movieTitle = document.createElement('p');
        movieTitle.textContent = movie.title;

        movieDiv.appendChild(moviePoster);
        movieDiv.appendChild(movieTitle);
        recommendationsDiv.appendChild(movieDiv);
    });
}

// Add event listener to the search button
document.getElementById('searchBtn').addEventListener('click', async () => {
    const searchedMovie = document.getElementById('movieSearch').value.trim();
    document.getElementById('movieSearch').value = '';  // Clear the search bar

    if (searchedMovie) {
        await recommend(searchedMovie);  // Ensure that recommend() completes
    }
});

// Load data on page load
window.onload = loadData;
