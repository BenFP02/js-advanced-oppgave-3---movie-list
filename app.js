const movieForm = document.querySelector("#movieForm");
const titleInput = document.querySelector("#titleInput");
const yearInput = document.querySelector("#yearInput");
const directorInput = document.querySelector("#directorInput");
const starsInput = document.querySelector("#starsInput");
const movieList = document.querySelector("#movieList");
const filterInput = document.querySelector("#filterInput");
const sortSelect = document.querySelector("#sortSelect");
const clearMoviesBtn = document.querySelector("#clearMoviesBtn");
const ratingInput = document.querySelector("#ratingInput");
const starRating = document.querySelector("#starRating");

let movies = JSON.parse(localStorage.getItem("movies")) || [];

// Update star visuals
const updateStars = (rating) => {
  return [...Array(5)].map((_, i) => (i < rating ? "★" : "☆")).join("");
};

// Star rating selection for the form
starRating.addEventListener("click", (event) => {
  const rect = starRating.getBoundingClientRect();
  const starWidth = rect.width / 5;
  const selectedRating = Math.ceil((event.clientX - rect.left) / starWidth);

  ratingInput.value = selectedRating; // Save selection
  starRating.textContent = updateStars(selectedRating); // Update UI with stars
});

// Save movies to localStorage
const saveMoviesToStorage = () => {
  localStorage.setItem("movies", JSON.stringify(movies));
};

// Calculate average rating
const getAverageRating = () => {
  if (movies.length === 0) return "N/A";
  const total = movies.reduce((sum, { rating }) => sum + Number(rating), 0);
  return (total / movies.length).toFixed(1);
};

// Filter movies by title, director, or stars based on a query
const filterMovies = (moviesArray, query) => {
  return moviesArray.filter(
    ({ title, director, stars }) =>
      title.toLowerCase().includes(query.toLowerCase()) ||
      director.toLowerCase().includes(query.toLowerCase()) ||
      stars.toLowerCase().includes(query.toLowerCase())
  );
};

// Sort movies based on criteria ("year", "rating", or "title")
const sortMovies = (moviesArray, criteria) => {
  return [...moviesArray].sort((a, b) => {
    if (criteria === "year") return a.year - b.year;
    if (criteria === "rating") return b.rating - a.rating;
    if (criteria === "title") return a.title.localeCompare(b.title);
    return 0;
  });
};

const renderMovies = () => {
  // Create a working array that adds the original movie index.
  let displayedMovies = movies.map((movie, index) => ({
    ...movie,
    originalIndex: index,
  }));

  // Apply filtering if there is a search query.
  if (filterInput.value.trim() !== "") {
    displayedMovies = filterMovies(displayedMovies, filterInput.value);
  }

  // Apply sorting if a criteria is selected.
  if (sortSelect.value) {
    displayedMovies = sortMovies(displayedMovies, sortSelect.value);
  }

  movieList.innerHTML = "";

  displayedMovies.forEach(
    ({ title, year, director, stars, rating, favorite, originalIndex }) => {
      const li = document.createElement("li");

      // Create editable fields.
      const titleField = document.createElement("input");
      titleField.type = "text";
      titleField.value = title;
      titleField.disabled = true;

      const yearField = document.createElement("input");
      yearField.type = "number";
      yearField.value = year;
      yearField.disabled = true;

      const directorField = document.createElement("input");
      directorField.type = "text";
      directorField.value = director;
      directorField.disabled = true;

      const starsField = document.createElement("input");
      starsField.type = "text";
      starsField.value = stars;
      starsField.disabled = true;

      // Create a rating container that displays the stars.
      let ratingContainer = document.createElement("div");
      ratingContainer.innerHTML = updateStars(rating);
      ratingContainer.classList.add("rating");

      // Let the user click on the rating container to change stars.
      ratingContainer.addEventListener("click", (event) => {
        const rect = ratingContainer.getBoundingClientRect();
        const starWidth = rect.width / 5;
        const selectedRating = Math.ceil(
          (event.clientX - rect.left) / starWidth
        );

        movies[originalIndex].rating = selectedRating;
        saveMoviesToStorage();
        ratingContainer.innerHTML = updateStars(selectedRating);
      });

      // Create and handle the favorite marker.
      const favoriteBtn = document.createElement("button");
      favoriteBtn.textContent = favorite ? "★ Favorite" : "☆ Mark as Favorite";
      favoriteBtn.addEventListener("click", () => {
        movies[originalIndex].favorite = !movies[originalIndex].favorite;
        saveMoviesToStorage();
        renderMovies();
      });

      // Edit button toggles between Edit and Save.
      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.addEventListener("click", () => {
        // When in "Edit" mode, enable input fields.
        const isEditing = editButton.textContent === "Edit";

        titleField.disabled = !isEditing;
        yearField.disabled = !isEditing;
        directorField.disabled = !isEditing;
        starsField.disabled = !isEditing;

        if (isEditing) {
          editButton.textContent = "Save";
        } else {
          // Save updated values.
          movies[originalIndex] = {
            title: titleField.value,
            year: Number(yearField.value),
            director: directorField.value,
            stars: starsField.value,
            rating: movies[originalIndex].rating, // keep updated rating
            favorite: movies[originalIndex].favorite,
          };
          saveMoviesToStorage();
          editButton.textContent = "Edit";
        }
      });

      // Delete button to remove the movie.
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => {
        movies.splice(originalIndex, 1);
        saveMoviesToStorage();
        renderMovies();
      });

      // Append all elements to the list item.
      li.append(
        titleField,
        yearField,
        directorField,
        starsField,
        ratingContainer,
        favoriteBtn,
        editButton,
        deleteButton
      );
      movieList.appendChild(li);
    }
  );
};

// Delete all movies
clearMoviesBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all movies?")) {
    movies = [];
    saveMoviesToStorage();
    renderMovies();
  }
});

// Handle form submission
movieForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const year = Number(yearInput.value);
  const director = directorInput.value.trim();
  const stars = starsInput.value.trim();
  const rating = Number(ratingInput.value) || 0;

  if (!title || !year || !director || !stars || !rating)
    return alert("All fields must be filled!");

  movies.push({ title, year, director, stars, rating, favorite: false });
  saveMoviesToStorage();
  renderMovies();
  movieForm.reset();
});

// Event listeners for filtering and sorting.
filterInput.addEventListener("input", renderMovies);
sortSelect.addEventListener("change", renderMovies);

// Initial render.
renderMovies();
