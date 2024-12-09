const apiKey = "88553256532578fcff8c33a3e4e61b1e";
const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const cityInput = document.getElementById("cityInput");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const weatherIcon = document.getElementById("weatherIcon");
const loader = document.getElementById("loader");
const weatherInfo = document.getElementById("weatherInfo");
const favoritesContainer = document.getElementById("favorites");

// Fetch weather by location (latitude & longitude)
async function getWeatherByLocation(lat, lon) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
  console.log("API URL:", apiUrl); // Debug the API URL
  await fetchWeather(apiUrl);
}

// Fetch weather for a city
async function getWeatherByCity(city) {
  showLoader();
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;
  await fetchWeather(apiUrl);
  await getWeatherForecast(city);
}

// Store a city as favorite in LocalStorage
function saveFavoriteCity(city) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (!favorites.includes(city)) {
    favorites.push(city);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    displayFavoriteCities();
  }
}

// Display favorite cities as buttons
function displayFavoriteCities() {
  favoritesContainer.innerHTML = ""; // Clear previous buttons
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  favorites.forEach((city) => {
    // Create a container for the city and remove button
    const cityWrapper = document.createElement("div");
    cityWrapper.classList.add("favorite-city-wrapper");

    // Create the smaller city button
    const cityButton = document.createElement("button");
    cityButton.textContent = city;
    cityButton.classList.add("city-button");
    cityButton.addEventListener("click", () => getWeatherByCity(city));

    // Create the larger remove button
    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.classList.add("remove-button");
    removeButton.addEventListener("click", () => removeFavoriteCity(city));

    // Add both buttons to the wrapper
    cityWrapper.appendChild(removeButton); // Place remove button first
    cityWrapper.appendChild(cityButton); // Place city button second

    // Add the wrapper to the favorites container
    favoritesContainer.appendChild(cityWrapper);
  });
}

function removeFavoriteCity(city) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.filter((fav) => fav !== city); // Remove the city
  localStorage.setItem("favorites", JSON.stringify(favorites)); // Update storage
  displayFavoriteCities(); // Refresh the list
}

// Display the weather info
function displayWeather(data) {
  const existingButton = weatherInfo.querySelector(".save-favorite-btn");
  if (existingButton) existingButton.remove();

  cityName.textContent = data.name;
  temperature.textContent = `Temperature: ${data.main.temp.toFixed(1)}°F`;
  description.textContent = `Weather: ${data.weather[0].description}`;

  const iconCode = data.weather[0].icon;
  weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  weatherIcon.alt = data.weather[0].description;
  weatherIcon.style.display = "block";

  const timezoneOffset = data.timezone; // Offset in seconds
  const utcTime = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
  const localTime = new Date(utcTime + timezoneOffset * 1000);

  const formattedTime = localTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const localTimeElement = document.getElementById("localTime");
  localTimeElement.textContent = `Local Time: ${formattedTime}`;

  weatherInfo.classList.remove("hidden");

  const saveButton = document.createElement("button");
  saveButton.textContent = "Save as Favorite";
  saveButton.classList.add("save-favorite-btn");
  saveButton.addEventListener("click", () => saveFavoriteCity(data.name));
  weatherInfo.appendChild(saveButton);

  hideLoader();

  const hour = localTime.getUTCHours();
  const isNightTime = hour >= 18 || hour < 6;
  updateBackground(data.weather[0].main.toLowerCase(), isNightTime);
}

// Fetch weather data from the API
async function fetchWeather(apiUrl) {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (response.ok) {
      displayWeather(data);
    } else {
      alert(`Error: ${data.message}`);
    }
  } catch (error) {
    console.error("Fetch Error:", error);
    alert("Something went wrong. Please try again.");
  } finally {
    hideLoader();
  }
}

function updateBackground(weatherMain, isNightTime) {
  if (isNightTime) {
    console.log("Setting starry night background"); // Debug log
    document.body.style.backgroundImage = "url('./images/starry_night.jpg')";
  } else {
    switch (weatherMain) {
      case "clear":
        document.body.style.background =
          "linear-gradient(to right, #4facfe, #00f2fe)";
        break;
      case "clouds":
        document.body.style.background =
          "linear-gradient(to right, #757f9a, #d7dde8)";
        break;
      case "rain":
      case "drizzle":
        document.body.style.background =
          "linear-gradient(to right, #00c6ff, #0072ff)";
        break;
      case "thunderstorm":
        document.body.style.background =
          "linear-gradient(to right, #373b44, #4286f4)";
        break;
      case "snow":
        document.body.style.background =
          "linear-gradient(to right, #e6e9f0, #eef1f5)";
        break;
      case "mist":
      case "fog":
        document.body.style.background =
          "linear-gradient(to right, #3e5151, #decba4)";
        break;
      default:
        document.body.style.background =
          "linear-gradient(to right, #fbc2eb, #a6c1ee)";
    }
  }

  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
}

// Show the loader
function showLoader() {
  loader.style.display = "block";
  weatherInfo.classList.add("hidden");
}

// Hide the loader
function hideLoader() {
  loader.style.display = "none";
  weatherInfo.classList.remove("hidden");
}

// Display favorite cities on page load
window.onload = displayFavoriteCities;

// Search button event listener
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) getWeatherByCity(city);
});

// Geolocation button event listener
geoBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    geoBtn.disabled = true; // Disable the button after clicking
    showLoader(); // Show loader while fetching location

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`); // Debug log
        getWeatherByLocation(latitude, longitude); // Fetch weather by location
      },
      (error) => {
        console.error("Geolocation Error:", error); // Log any errors
        alert("Unable to retrieve location.");
        hideLoader();
        geoBtn.disabled = false; // Re-enable button if error occurs
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
});
