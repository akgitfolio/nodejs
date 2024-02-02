// Import required modules
const https = require("node:https");
const dotenv = require("dotenv");

// Load API key from .env file
dotenv.config();
const apiKey = process.env.OPENWEATHERMAP_API_KEY;

// Set API endpoint and query parameters
const city = "London";
const endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

// Make HTTPS request
https
  .get(endpoint, (res) => {
    let data = "";

    // Collect response data
    res.on("data", (chunk) => {
      data += chunk;
    });

    // Parse JSON response and log weather data
    res.on("end", () => {
      const weatherData = JSON.parse(data);
      console.log(`Current weather in ${city}:`);
      console.log(`- Temperature: ${weatherData.main.temp}°C`);
      console.log(`- Description: ${weatherData.weather[0].description}`);
    });
  })
  .on("error", (err) => {
    console.error("Error:", err.message);
  });
