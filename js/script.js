// Function to close the alert
function closeAlert() {
  customAlert.style.display = 'none';
}
// Function to close the alert

// Custom Alert Base //
function showAlert(message, type = 'info', allowHtml = false) {
  const customAlert = document.getElementById('customAlert');
  const alertMessage = document.getElementById('alertMessage');

  if (allowHtml) {
    alertMessage.innerHTML = message;
  } else {
    alertMessage.textContent = message;
  }

  customAlert.className = 'netlifyalert';
  customAlert.classList.add(`alert-${type}`);
  customAlert.style.display = 'block';
}
document.addEventListener('click', event => {
  const closeButton = event.target.closest('.close');
  const customAlert = document.getElementById('customAlert');
  
  if (closeButton || event.target === customAlert) {
    closeAlert();
  }
});
// Custom Alert Base //

//Main Functions Base //
function searchMovies(query) {
    fetch(`https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${query}`)
        .then(response => response.json())
        .then(data => {
            if (data.results.length === 0) {
                //alert('No results found. Try again!');
                showAlert('No results found. Try again!<br><br><b>Click anywhere to close box!</b>', 'error', true);
            } else {
                displayMovies(data.results);
            }
        })
        .catch(error => console.log('Error fetching data:', error));
}
//Display Movies works
function displayMovies(results) {
    const movieResults = document.getElementById('movieResults');
    movieResults.innerHTML = '';

    results.forEach(result => {
        if (result.poster_path) {
            const movieElement = document.createElement('div');
            movieElement.classList.add('movie');
            movieElement.innerHTML = `<img src="https://image.tmdb.org/t/p/w500${result.poster_path}" alt="${result.title}">`;
            movieElement.addEventListener('click', () => {
                if (result.media_type === 'tv') selectedShowId = result.id, openSeasonsModal();
                else playMovie(result.title);
            });
            movieResults.appendChild(movieElement);

        }
    });
    displayRandomPictures();
}
//Display Random Boxart works
function displayRandomPictures() {
    const randomPicturesContainer = document.getElementById('randomPictures');
    randomPicturesContainer.innerHTML = '';

    fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&include_adult=false&page=1`)
        .then(response => response.json())
        .then(data => {
            const randomSelection = data.results.filter(result => result.poster_path).sort(() => 0.5 - Math.random()).slice(0, 3);
            randomSelection.forEach(result => {
                const randomPicture = document.createElement('div');
                randomPicture.classList.add('random-picture');
                randomPicture.innerHTML = `<img src="https://image.tmdb.org/t/p/w500${result.poster_path}" alt="${result.title}">`;
                randomPicture.addEventListener('click', () => playMovie(result.title));
                randomPicturesContainer.appendChild(randomPicture);
            });
        })
        .catch(error => console.log('Error fetching random movies:', error));
}
//Open Season Menu works
function openSeasonsModal() {
  const modal = document.getElementById('myModal');
  const seasonDropdown = document.getElementById('seasonDropdown');
  seasonDropdown.innerHTML = '';
  modal.style.display = 'block';
  document.getElementById('seasonBox').textContent = 'Season Box';

  fetchSeasons(selectedShowId)
    .then(seasons => {
      seasons.forEach(season => {
        if (season.season_number !== 0) {
          const seasonButton = document.createElement('button');
          seasonButton.textContent = `Season ${season.season_number}`;
          seasonButton.addEventListener('click', () => openEpisodesModal(season.season_number));
          seasonDropdown.appendChild(seasonButton);
        }
      });
    })
    .catch(error => console.log('Error fetching seasons:', error));
}
// Fetch Season works
async function fetchSeasons(showId) {
    const response = await fetch(`https://api.themoviedb.org/3/tv/${showId}?api_key=${apiKey}`);
    return (await response.json()).seasons;
}
//Dark Mode Toggle works/ Fixed
document.addEventListener('DOMContentLoaded', () => {
  const darkModeToggle = document.getElementById('darkModeToggle');
  const body = document.querySelector('body');

  const darkModeEnabled = localStorage.getItem('darkModeEnabled') === 'true';
  darkModeToggle.checked = darkModeEnabled;
  body.dataset.theme = darkModeEnabled ? 'dark' : 'light';

  darkModeToggle.addEventListener('change', () => {
    const darkModeEnabled = darkModeToggle.checked;
    body.dataset.theme = darkModeEnabled ? 'dark' : 'light';
    localStorage.setItem('darkModeEnabled', darkModeEnabled);
  });
});
//Random Boxart works
document.addEventListener('DOMContentLoaded', () => fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&page=1&vote_count.gte=100&include_adult=false`)
    .then(response => response.json())
    .then(data => displayMovies(data.results.sort(() => 0.5 - Math.random()).slice(0, 6)))
.catch(error => console.log('Error fetching data:', error)));

//Episodes menu works
async function openEpisodesModal(seasonNumber) {
    const modal = document.getElementById('myModal');
    const episodeDropdown = document.getElementById('episodeDropdown');
    episodeDropdown.innerHTML = '';
    try {
        const episodes = await fetchEpisodes(selectedShowId, seasonNumber);
        episodes.forEach(episode => {
            const episodeButton = document.createElement('button');
            episodeButton.textContent = `Episode ${episode.episode_number}: ${episode.name}`;
            episodeButton.addEventListener('click', () => playEpisode(selectedShowId, seasonNumber, episode.episode_number));
            episodeDropdown.appendChild(episodeButton);
        });
        episodeDropdown.style.display = 'block';
    } catch (error) {
        console.log('Error fetching episodes:', error);
    }
}
async function fetchEpisodes(showId, seasonNumber) {
    const response = await fetch(`https://api.themoviedb.org/3/tv/${showId}/season/${seasonNumber}?api_key=${apiKey}`);
    const data = await response.json();
    return data.episodes;
}
//playEpisode Works
function playEpisode(showId, seasonNumber, episodeNumber) {
    window.location.href = `html/videoplayer.html?embedUrl=${encodeURIComponent(`https://vidsrc.to/embed/tv/${showId}/${seasonNumber}/${episodeNumber}`)}`;
}
//playMovie Works
function playMovie(title) {
    addToWatched(title);
    fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}`)
        .then(response => response.json())
        .then(data => {
            const movieId = data?.results?.[0]?.id;
            if (movieId) window.location.href = `html/videoplayer.html?embedUrl=${encodeURIComponent(`https://vidsrc.to/embed/movie/${movieId}`)}`;
            else alert("Movie not found.");
        })
        .catch(error => console.log('Error fetching data:', error));
}
//addToWatched Works
function addToWatched(item) {
    let watchedList = JSON.parse(localStorage.getItem('watchedList') || '[]');
    const isAlreadyWatched = watchedList.some(watchedItem => 
        (item.type === 'movie' && watchedItem.type === 'movie' && watchedItem.title === item.title) ||
        (item.type === 'episode' && watchedItem.type === 'episode' && watchedItem.id === item.id && watchedItem.season === item.season && watchedItem.episode === item.episode)
    );
    if (!isAlreadyWatched) {
        watchedList.push(item);
        localStorage.setItem('watchedList', JSON.stringify(watchedList));
    }
}
//close Season Menu works
function closeModal() {
    const modal = document.getElementById('myModal');
    modal.style.display = 'none';
    const episodeDropdown = document.getElementById('episodeDropdown');
    episodeDropdown.style.display = 'none';
 }

document.addEventListener('DOMContentLoaded', () => {
    const movieSearchInput = document.getElementById('movieSearch');
    const searchIcon = document.getElementById('searchIcon');

    function performSearch() {
        const inputValue = movieSearchInput.value.trim();
        if (inputValue.length >= 3) {
            searchMovies(inputValue);
        } else {
            //alert('Please enter at least 3 characters.');
            showAlert('Please enter at least 3 characters.<br><br><b>Click anywhere to close box!</b>', 'error', true);
        }
    }

    movieSearchInput.addEventListener('input', () => {
        if (movieSearchInput.value.trim().length >= 3) {
            searchIcon.classList.add('active');
        } else {
            searchIcon.classList.remove('active');
        }
    });

    searchIcon.addEventListener('click', performSearch);

    movieSearchInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
});

