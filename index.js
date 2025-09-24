// index.js
const API_KEY = "1f51cfe6"   // your key
const searchInput = document.getElementById("search-input")
const searchBtn = document.getElementById("search-btn")
const moviesContainer = document.getElementById("movies-container")
const statusEl = document.getElementById("status")

// keep a map of last search details so add button can save full object
let lastSearchMap = {}

// helper to fetch JSON safely
async function fetchJson(url){
  const res = await fetch(url)
  if (!res.ok) throw new Error("Network error")
  return res.json()
}

async function searchMovies(){
  const query = searchInput.value.trim()
  if (!query){
    statusEl.textContent = "Type a movie to search for."
    moviesContainer.innerHTML = ""
    return
  }

  statusEl.textContent = "Searching..."
  moviesContainer.innerHTML = ""
  lastSearchMap = {}

  const encoded = encodeURIComponent(query)
  const searchUrl = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encoded}&type=movie`

  try {
    const data = await fetchJson(searchUrl)
    if (data.Response === "False"){
      statusEl.textContent = data.Error || "No results found"
      return
    }

    // fetch full details for each result (so we can show rating, runtime, plot)
    const detailPromises = data.Search.map(item =>
      fetchJson(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${item.imdbID}&plot=short`)
    )

    const details = await Promise.all(detailPromises)
    // build lastSearchMap
    details.forEach(d => lastSearchMap[d.imdbID] = d)
    renderMovies(details)
    statusEl.textContent = ""
  } catch (err) {
    console.error(err)
    statusEl.textContent = "Error searching movies. Check console for details."
  }
}

function renderMovies(movies){
  if (!movies || movies.length === 0){
    moviesContainer.innerHTML = "<p>No results found</p>"
    return
  }

  moviesContainer.innerHTML = movies.map(m => {
    const poster = (m.Poster && m.Poster !== "N/A") ? m.Poster : "https://via.placeholder.com/100x150?text=No+Image"
    const rating = m.imdbRating && m.imdbRating !== "N/A" ? `★ ${m.imdbRating}` : ""
    const runtime = m.Runtime && m.Runtime !== "N/A" ? m.Runtime : ""
    const genre = m.Genre && m.Genre !== "N/A" ? m.Genre.split(",")[0] : ""
    const plot = m.Plot && m.Plot !== "N/A" ? m.Plot : ""
    return `
      <article class="movie-card" data-id="${m.imdbID}">
        <div class="poster"><img src="${poster}" alt="${escapeHtml(m.Title)} poster" /></div>
        <div class="meta">
          <div class="title-row">
            <h3 class="movie-title">${escapeHtml(m.Title)} <span class="small-muted">★ ${m.imdbRating}</span></h3>
            <div class="actions">
              <button class="btn watch" data-imdb="${m.imdbID}">+ Watchlist</button>
            </div>
          </div>
          <div class="movie-sub">${runtime} ${runtime && genre ? "•" : ""} ${genre}</div>
          <p class="plot">${escapeHtml(plot)}</p>
        </div>
      </article>
    `
  }).join("")
}

// handle clicks for add-to-watchlist using event delegation
moviesContainer.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-imdb]")
  if (!btn) return
  const id = btn.getAttribute("data-imdb")
  addToWatchlist(id)
})

function addToWatchlist(imdbID){
  const movie = lastSearchMap[imdbID]
  if (!movie) {
    alert("Movie data not available to save.")
    return
  }
  const key = "watchlistMovies"
  const list = JSON.parse(localStorage.getItem(key)) || []
  // prevent duplicates
  if (list.some(m => m.imdbID === imdbID)){
    alert("Already in watchlist")
    return
  }
  list.push(movie)
  localStorage.setItem(key, JSON.stringify(list))
  alert("Added to watchlist")
}

// small escape helper for templating
function escapeHtml(str = ""){
  return str.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
}

// Enter key triggers search
searchInput.addEventListener("keydown", (e)=>{
  if (e.key === "Enter") searchMovies()
})
searchBtn.addEventListener("click", searchMovies)
