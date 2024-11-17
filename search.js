let searchHistory = [];

function handleSearch(event) {
    event.preventDefault(); // Prevent form submission
    const searchInput = document.getElementById('search').value;

    if (searchInput) {
        searchHistory.push(searchInput); // Add the search term to the history array
        console.log('Search History:', searchHistory);
    }
    
    // Clear the search input after adding it to the array
    document.getElementById('search').value = '';
}
