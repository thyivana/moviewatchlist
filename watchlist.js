// watchlist.js
const key = "watchlistMovies"
const container = document.getElementById("watchlist-container")
const emptyEl = document.getElementById("watchlist-empty")

function loadWatchlist(){
  const list = JSON.parse(localStorage.getItem(key)) || []
  if (list.length === 0){
    container.innerHTML = ""
    emptyEl.textContent = "Your watchlist is empty."
    return
  }
  emptyEl.textContent = ""
  container.innerHTML = list.map(m => {
    const poster = (m.Poster && m.Poster !== "N/A") ? m.Poster : "https://via.placeholder.com/100x150?text=No+Image"
    return `
      <article class="movie-card" data-id="${m.imdbID}">
        <div class="poster"><img src="${poster}" alt="${m.Title} poster" /></div>
        <div class="meta">
          <div class="title-row">
            <h3 class="movie-title">${m.Title} <span class="small-muted">★ ${m.imdbRating}</span></h3>
            <div class="actions">
              <button class="btn remove" data-remove="${m.imdbID}">Remove</button>
            </div>
          </div>
          <div class="movie-sub">${m.Runtime} ${m.Runtime && m.Genre ? "•" : ""} ${m.Genre}</div>
          <p class="plot">${m.Plot}</p>
        </div>
      </article>
    `
  }).join("")
}

container.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-remove]")
  if (!btn) return
  const id = btn.getAttribute("data-remove")
  removeFromWatchlist(id)
})

function removeFromWatchlist(imdbID){
  let list = JSON.parse(localStorage.getItem(key)) || []
  list = list.filter(m => m.imdbID !== imdbID)
  localStorage.setItem(key, JSON.stringify(list))
  loadWatchlist()
}

loadWatchlist()