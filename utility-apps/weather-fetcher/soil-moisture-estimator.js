function estimateSoilMoisture(weatherData) {
  const temperature = weatherData.main.temp;
  const humidity = weatherData.main.humidity;

  const soilMoisture = Math.max(
    0,
    Math.min(1, (humidity / 100) * (1 - (temperature - 273.15) / 100))
  );
  return soilMoisture;
}

module.exports = { estimateSoilMoisture };
