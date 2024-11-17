import requests

TMDB_API_KEY = 'b71e51bd3f242fbc97a771bcce0f9944'
TMDB_BASE_URL = 'https://api.themoviedb.org/3'
TMDB_IMG_URL = 'https://image.tmdb.org/t/p/w500'

def fetch_movie_details(movie_id):
    # Fetch movie details from TMDB API
    url = f'{TMDB_BASE_URL}/movie/{movie_id}?api_key={TMDB_API_KEY}'
    response = requests.get(url)
    return response.json()

def fetch_movie_poster(poster_path):
    return f'{TMDB_IMG_URL}/{poster_path}'

# Get recommendations for the user from your trained model
recommended_movie_ids = [1, 2, 3, 4, 5]  # Example IDs from the AI model

print("Top 5 movie recommendations for you:")
for movie_id in recommended_movie_ids:
    details = fetch_movie_details(movie_id)
    print(f"Title: {details['title']}")
    print(f"Genres: {', '.join([genre['name'] for genre in details['genres']])}")
    print(f"Poster URL: {fetch_movie_poster(details['poster_path'])}")
    print(f"Overview: {details['overview']}")
    print()
