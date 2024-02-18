const weatherDataFetcher = require("./weather-data-fetcher");
const soilMoistureEstimator = require("./soil-moisture-estimator");
const irrigationNotifier = require("./irrigation-notifier");

const DEFAULT_LOCATION = "40.7128,-74.0060"; // New York City

async function runIrrigation() {
  try {
    const weatherData = await weatherDataFetcher.getWeatherData(
      DEFAULT_LOCATION
    );
    const soilMoisture = await soilMoistureEstimator.estimateSoilMoisture(
      weatherData
    );
    const needsIrrigation = soilMoisture < 0.6;

    if (needsIrrigation) {
      const duration = 0.5 * (1 - soilMoisture) ** 2;
      await irrigationNotifier.notifyIrrigation(duration);
      console.log(`Irrigation started for ${duration} hours.`);
    } else {
      console.log("No irrigation needed at this time.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

runIrrigation();
setInterval(runIrrigation, 6 * 60 * 60 * 1000);
