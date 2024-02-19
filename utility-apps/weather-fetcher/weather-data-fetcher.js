const fetch = require("node-fetch");

const apiKey = "YOUR_API_KEY";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather";

async function getWeatherData(location) {
  try {
    const response = await fetch(
      `${apiUrl}?lat=${location.split(",")[0]}&lon=${
        location.split(",")[1]
      }&appid=${apiKey}`
    );
    if (!response.ok) {
      throw new Error("Unable to fetch weather data.");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
}

module.exports = { getWeatherData };
