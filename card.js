const sliderContainer = document.getElementById('slider-container');
const movieCards = document.querySelectorAll('.movie-card');
let currentIndex = 2; // Starting with the third card as the center one
const totalCards = movieCards.length;
let currentMovies = []; // To store the currently displayed movies

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNzFlNTFiZDNmMjQyZmJjOTdhNzcxYmNjZTBmOTk0NCIsIm5iZiI6MTcyNzQyNTM2Mi4yNjIwNDYsInN1YiI6IjY2ZjI1OTQxNmMzYjdhOGQ2NDhlMGY3MSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.7y4gNGWWrkS1GeGQhUwvIfHODbzChy6lELRiMbaAMMk'
  }
};

// Function to get a random page number based on total pages available
function getRandomPage(totalPages) {
  return Math.floor(Math.random() * totalPages) + 1; // Random page from 1 to totalPages
}

// Function to fetch new movies and update the movie cards
async function fetchMovieData() {
  try {
    const totalPagesResponse = await fetch('https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1', options);
    const totalPagesResult = await totalPagesResponse.json();
    const totalPages = totalPagesResult.total_pages; // Get the total pages

    // Get a random page
    const randomPage = getRandomPage(totalPages);

    // Fetch movies from the random page
    const response = await fetch(`https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=${randomPage}`, options);
    const result = await response.json();
    currentMovies = result.results.slice(0, totalCards); // Store only as many movies as we have cards

    // Update each movie card with data from the API
    movieCards.forEach((card, index) => {
      const imgElement = card.querySelector('img');
      const titleElement = card.querySelector('.movie-title');

      // Update the card with the corresponding movie data
      imgElement.src = `https://image.tmdb.org/t/p/w500${currentMovies[index].poster_path}`;
      titleElement.innerText = currentMovies[index].title;
    });

  } catch (error) {
    console.error('Error fetching movie data:', error);
  }
}

function updateSlider() {
  // Remove classes from all cards
  movieCards.forEach(card => {
    card.classList.remove('left', 'center', 'right');
  });

  // Add 'center' class to current card, 'left' and 'right' to adjacent ones
  const prevIndex = (currentIndex - 1 + totalCards) % totalCards;
  const nextIndex = (currentIndex + 1) % totalCards;

  movieCards[currentIndex].classList.add('center');
  movieCards[prevIndex].classList.add('left');
  movieCards[nextIndex].classList.add('right');
}

function autoSlide() {
  currentIndex = (currentIndex + 1) % totalCards; // Loop through the cards
  updateSlider();
}

// Function to update movie data every 30 seconds
function refreshMovies() {
  fetchMovieData(); // Fetch new movie data from API
}

// Initialize the first view
updateSlider();
fetchMovieData(); // Fetch movie data and update cards

// Auto-slide every 3 seconds
setInterval(autoSlide, 3000);

// Refresh the movie data every 30 seconds
setInterval(refreshMovies, 30000); // 30 seconds = 30000 milliseconds
