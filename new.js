//TMDB 


const API_KEY = 'api_key=b71e51bd3f242fbc97a771bcce0f9944';
const BASE_URL = 'https://api.themoviedb.org/3';
const API_URL = BASE_URL + '/discover/movie?sort_by=popularity.desc&'+API_KEY;
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const searchURL = BASE_URL + '/search/movie?'+API_KEY;

const genres = [
    {
      "id": 28,
      "name": "Action"
    },
    {
      "id": 12,
      "name": "Adventure"
    },
    {
      "id": 16,
      "name": "Animation"
    },
    {
      "id": 35,
      "name": "Comedy"
    },
    {
      "id": 80,
      "name": "Crime"
    },
    {
      "id": 99,
      "name": "Documentary"
    },
    {
      "id": 18,
      "name": "Drama"
    },
    {
      "id": 10751,
      "name": "Family"
    },
    {
      "id": 14,
      "name": "Fantasy"
    },
    {
      "id": 36,
      "name": "History"
    },
    {
      "id": 27,
      "name": "Horror"
    },
    {
      "id": 10402,
      "name": "Music"
    },
    {
      "id": 9648,
      "name": "Mystery"
    },
    {
      "id": 10749,
      "name": "Romance"
    },
    {
      "id": 878,
      "name": "Science Fiction"
    },
    {
      "id": 10770,
      "name": "TV Movie"
    },
    {
      "id": 53,
      "name": "Thriller"
    },
    {
      "id": 10752,
      "name": "War"
    },
    {
      "id": 37,
      "name": "Western"
    }
  ]
  function toggleTags() {
    const tagsDiv = document.getElementById("tags");
    tagsDiv.style.display = tagsDiv.style.display === "block" ? "none" : "block";
  }
  
  const genreLink = document.querySelector("li a");
  genreLink.addEventListener("click", toggleTags);
const main = document.getElementById('main');
const form =  document.getElementById('form');
const search = document.getElementById('search');
const tagsEl = document.getElementById('tags');
const recommendationsDiv = document.getElementById('recommendations');

const prev = document.getElementById('prev')
const next = document.getElementById('next')
const current = document.getElementById('current')

var currentPage = 1;
var nextPage = 2;
var prevPage = 3;
var lastUrl = '';
var totalPages = 100;

var selectedGenre = []
setGenre();
function setGenre() {
    tagsEl.innerHTML= '';
    genres.forEach(genre => {
        const t = document.createElement('div');
        t.classList.add('tag');
        t.id=genre.id;
        t.innerText = genre.name;
        t.addEventListener('click', () => {
            if(selectedGenre.length == 0){
                selectedGenre.push(genre.id);
            }else{
                if(selectedGenre.includes(genre.id)){
                    selectedGenre.forEach((id, idx) => {
                        if(id == genre.id){
                            selectedGenre.splice(idx, 1);
                        }
                    })
                }else{
                    selectedGenre.push(genre.id);
                }
            }
            console.log(selectedGenre)
            getMovies(API_URL + '&with_genres='+encodeURI(selectedGenre.join(',')))
            highlightSelection()
        })
        tagsEl.append(t);
    })
}
const searchHistory = [];

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const searchTerm = search.value;
    selectedGenre = [];
    setGenre();

    if (searchTerm) {
        // Add the searched term to the history
        if (!searchHistory.includes(searchTerm)) {
            searchHistory.push(searchTerm);
            // Optional: You can display search history on the UI or in the console
            console.log("Search History:", searchHistory);
        }
        
        getMovies(searchURL + '&query=' + searchTerm);
    } else {
        getMovies(API_URL);
    }
});

fetch('./similarity.json')
    .then(res => {
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }
        return res.json();
    })
    .then(similarityData => {
        console.log('Similarity Data:', similarityData); // Log to check data
        fetch('./movies.json')
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(moviesData => {
                console.log('Movies Data:', moviesData); // Log to check data
                // Your existing logic here...
            })
            .catch(err => {
                console.error('Error fetching movies:', err);
            });
    })
    .catch(err => {
        console.error('Error fetching similarity:', err);
    });

    // Update search history and fetch recommendations
    function updateSearchHistory(searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      if (!searchHistory.includes(lowerSearchTerm)) {
          searchHistory.push(lowerSearchTerm);
      }
      if (searchHistory.length > 5) {
          searchHistory.shift(); // Remove the oldest search term
      }
      getRecommendations(lowerSearchTerm); // Pass the search term for recommendations
  }
  
  // Fetch recommendations based on the last search from similarity.json and movies.json
 // Fetch recommendations based on the last search from similarity.json and movies.json
function getRecommendations(lastSearch) {
  recommendationsDiv.innerHTML = '<h2>Recommendations:</h2>';
  fetch('./similarity.json')
      .then(res => res.json())
      .then(similarityData => {
          fetch('movies.json')
              .then(res => res.json())
              .then(moviesData => {
                  // Convert the search term to lowercase for case-insensitive comparison
                  const searchTermLower = lastSearch.toLowerCase();

                  // First, try to find a direct match
                  let searchedMovie = moviesData.find(movie => movie.title.toLowerCase() === searchTermLower);

                  // If no exact match is found, try partial matching (first letters)
                  if (!searchedMovie) {
                      searchedMovie = moviesData.find(movie => movie.title.toLowerCase().startsWith(searchTermLower));
                  }

                  // If still no match, try matching by genre
                  if (!searchedMovie) {
                      const selectedGenres = selectedGenre.map(genreId => genres.find(genre => genre.id === genreId).name);
                      searchedMovie = moviesData.find(movie => movie.genre_ids.some(genreId => selectedGenres.includes(genres.find(genre => genre.id === genreId).name)));
                  }

                  // If a matching movie is found, fetch its recommendations
                  if (searchedMovie) {
                      const similarMovieIDs = similarityData[searchedMovie.id] || [];
                      showRecommendations(moviesData.filter(movie => similarMovieIDs.includes(movie.id)));
                  } else {
                      recommendationsDiv.innerHTML = '<p>No recommendations available based on your search.</p>';
                  }
              });
      })
      .catch(err => {
          console.error('Error fetching recommendations:', err);
      });
}

  
  // New function to find the closest matching movie based on various criteria
  function findClosestMovie(moviesData, searchTerm) {
      const exactMatch = moviesData.find(movie => movie.title.toLowerCase() === searchTerm);
      
      // If exact match is found, return it
      if (exactMatch) return exactMatch;
  
      // Try to find a partial match (movie title contains the search term)
      const partialMatch = moviesData.find(movie => movie.title.toLowerCase().includes(searchTerm));
      
      // If a partial match is found, return it
      if (partialMatch) return partialMatch;
  
      // If no partial match, check for movies with a matching genre or starting letters
      const genreMatch = moviesData.find(movie => {
          return movie.genre_ids.some(genreID => {
              const genre = genres.find(g => g.id === genreID);
              return genre && genre.name.toLowerCase().includes(searchTerm);
          });
      });
  
      // If a genre match is found, return it
      if (genreMatch) return genreMatch;
  
      // If no genre match, return movies that start with the same letters as the search term
      const firstLetterMatch = moviesData.find(movie => movie.title.toLowerCase().startsWith(searchTerm));
      
      return firstLetterMatch || null; // Return closest match or null if nothing is found
  }
  
  // Show recommended movies
  function showRecommendations(movies) {
      recommendationsDiv.innerHTML = ''; // Clear previous recommendations
      if (movies.length === 0) {
          recommendationsDiv.innerHTML = '<p>No recommendations available.</p>';
          return;
      }
  
      movies.forEach(movie => {
          const { title, poster_path, id } = movie;
          const movieEl = document.createElement('div');
          movieEl.classList.add('movie');
          movieEl.innerHTML = `
              <img src="${poster_path ? IMG_URL + poster_path : 'http://via.placeholder.com/1080x1580'}" alt="${title}">
              <h3>${title}</h3>
              <button class="know-more" id="rec-${id}">Know More</button>
          `;
          recommendationsDiv.appendChild(movieEl);
  
          // Add event listener for "Know More" button in recommendations
          document.getElementById(`rec-${id}`).addEventListener('click', () => {
              openNav(movie);
          });
      });
  }

function highlightSelection() {
    const tags = document.querySelectorAll('.tag');
    tags.forEach(tag => {
        tag.classList.remove('highlight')
    })
    clearBtn()
    if(selectedGenre.length !=0){   
          re.forEach(id => {
            const hightlightedTag = document.getElementById(id);
            hightlightedTag.classList.add('highlight');
        })
    }

}

function clearBtn(){
    let clearBtn = document.getElementById('clear');
    if(clearBtn){
        clearBtn.classList.add('highlight')
    }else{
            
        let clear = document.createElement('div');
        clear.classList.add('tag','highlight');
        clear.id = 'clear';
        clear.innerText = 'Clear x';
        clear.addEventListener('click', () => {
            selectedGenre = [];
            setGenre();            
            getMovies(API_URL);
        })
        tagsEl.append(clear);
    }
    
}

getMovies(API_URL);

function getMovies(url) {
  lastUrl = url;
    fetch(url).then(res => res.json()).then(data => {
        console.log(data.results)
        if(data.results.length !== 0){
            showMovies(data.results);
            currentPage = data.page;
            nextPage = currentPage + 1;
            prevPage = currentPage - 1;
            totalPages = data.total_pages;

            current.innerText = currentPage;

            if(currentPage <= 1){
              prev.classList.add('disabled');
              next.classList.remove('disabled')
            }else if(currentPage>= totalPages){
              prev.classList.remove('disabled');
              next.classList.add('disabled')
            }else{
              prev.classList.remove('disabled');
              next.classList.remove('disabled')
            }

            tagsEl.scrollIntoView({behavior : 'smooth'})

        }else{
            main.innerHTML= `<h1 class="no-results">No Results Found</h1>`
        }
       
    })

}


function showMovies(data) {
  main.innerHTML = '';

  data.forEach(movie => {
      const {title, poster_path, vote_average, overview, id} = movie;
      const movieEl = document.createElement('div');
      movieEl.classList.add('movie');
      movieEl.innerHTML = `
          <img src="${poster_path ? IMG_URL + poster_path : "http://via.placeholder.com/1080x1580"}" alt="${title}">

          <div class="movie-info">
              <h3>${title}</h3>
              <span class="${getColor(vote_average)}">${vote_average}</span>
          </div>

          <div class="overview">
              <h3>Overview</h3>
              ${overview}
              <br/> 
              <button class="know-more" id="${id}">Know More</button>
              <button class="heart-btn" id="heart-${id}" title="Add to Favorites">❤️</button>
          </div>
      `;

      main.appendChild(movieEl);

      // Add event listener for "Know More" button
      document.getElementById(id).addEventListener('click', () => {
          openNav(movie);
      });

      // Add event listener for heart button
      document.getElementById(`heart-${id}`).addEventListener('click', () => {
          // Add the title to the search history if it's not already there
          if (!searchHistory.includes(title)) {
              searchHistory.push(title);
              console.log("Updated Search History:", searchHistory);
                // Animate the heart button
          const heartButton = document.getElementById(`heart-${id}`);
          heartButton.classList.add('pressed'); // Add pressed class for animation

  // Remove the class after animation
          setTimeout(() => {
          heartButton.classList.remove('pressed');
          }, 300); // Duration matches the CSS transition
      ;
          }
      });
  });
}




const overlayContent = document.getElementById('overlay-content');
/* Open when someone clicks on the span element */
function openNav(movie) {
  let id = movie.id;
  fetch(BASE_URL + '/movie/'+id+'/videos?'+API_KEY).then(res => res.json()).then(videoData => {
    console.log(videoData);
    if(videoData){
      document.getElementById("myNav").style.width = "100%";
      if(videoData.results.length > 0){
        var embed = [];
        var dots = [];
        videoData.results.forEach((video, idx) => {
          let {name, key, site} = video

          if(site == 'YouTube'){
              
            embed.push(`
              <iframe width="560" height="315" src="https://www.youtube.com/embed/${key}" title="${name}" class="embed hide" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          
          `)

            dots.push(`
              <span class="dot">${idx + 1}</span>
            `)
          }
        })
        
        var content = `
        <h1 class="no-results">${movie.original_title}</h1>
        <br/>
        
        ${embed.join('')}
        <br/>

        <div class="dots">${dots.join('')}</div>
        
        `
        overlayContent.innerHTML = content;
        activeSlide=0;
        showVideos();
      }else{
        overlayContent.innerHTML = `<h1 class="no-results">No Results Found</h1>`
      }
    }
  })
}

/* Close when someone clicks on the "x" symbol inside the overlay */
function closeNav() {
  document.getElementById("myNav").style.width = "0%";
}

var activeSlide = 0;
var totalVideos = 0;

function showVideos(){
  let embedClasses = document.querySelectorAll('.embed');
  let dots = document.querySelectorAll('.dot');

  totalVideos = embedClasses.length; 
  embedClasses.forEach((embedTag, idx) => {
    if(activeSlide == idx){
      embedTag.classList.add('show')
      embedTag.classList.remove('hide')

    }else{
      embedTag.classList.add('hide');
      embedTag.classList.remove('show')
    }
  })

  dots.forEach((dot, indx) => {
    if(activeSlide == indx){
      dot.classList.add('active');
    }else{
      dot.classList.remove('active')
    }
  })
}

const leftArrow = document.getElementById('left-arrow')
const rightArrow = document.getElementById('right-arrow')

leftArrow.addEventListener('click', () => {
  if(activeSlide > 0){
    activeSlide--;
  }else{
    activeSlide = totalVideos -1;
  }

  showVideos()
})

rightArrow.addEventListener('click', () => {
  if(activeSlide < (totalVideos -1)){
    activeSlide++;
  }else{
    activeSlide = 0;
  }
  showVideos()
})


function getColor(vote) {
    if(vote>= 8){
        return 'green'
    }else if(vote >= 5){
        return "orange"
    }else{
        return 'red'
    }
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const searchTerm = search.value;
    selectedGenre=[];
    setGenre();
    if(searchTerm) {
        getMovies(searchURL+'&query='+searchTerm)
    }else{
        getMovies(API_URL);
    }

})

prev.addEventListener('click', () => {
  if(prevPage > 0){
    pageCall(prevPage);
  }
})

next.addEventListener('click', () => {
  if(nextPage <= totalPages){
    pageCall(nextPage);
  }
})

function pageCall(page){
  let urlSplit = lastUrl.split('?');
  let queryParams = urlSplit[1].split('&');
  let key = queryParams[queryParams.length -1].split('=');
  if(key[0] != 'page'){
    let url = lastUrl + '&page='+page
    getMovies(url);
  }else{
    key[1] = page.toString();
    let a = key.join('=');
    queryParams[queryParams.length -1] = a;
    let b = queryParams.join('&');
    let url = urlSplit[0] +'?'+ b
    getMovies(url);
  }
}

function toggleTags() {
  var tagsDiv = document.getElementById("tags");
  if (tagsDiv.style.display === "none") {
      tagsDiv.style.display = "block"; // Show the tags
  } else {
      tagsDiv.style.display = "none";  // Hide the tags
  }
}



// Store search history in local storage
