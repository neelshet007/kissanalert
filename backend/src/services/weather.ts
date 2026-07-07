import axios from 'axios';

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  advisory: string;
  warning?: string;
}

export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m&daily=rain_sum&timezone=auto`;
    const response = await axios.get(url);
    const current = response.data.current;
    
    const temperature = current.temperature_2m ?? 28;
    const humidity = current.relative_humidity_2m ?? 70;
    const rainfall = current.rain ?? 0;
    const windSpeed = current.wind_speed_10m ?? 12;

    // Generate weather advisories programmatically
    let advisory = 'Weather conditions are optimal for normal crop operations.';
    let warning = '';

    if (rainfall > 10) {
      advisory = 'Heavy rainfall detected. Suspend irrigation and fertilizer applications immediately. Ensure proper drainage in fields.';
      warning = 'Heavy Rain Alert';
    } else if (temperature > 38) {
      advisory = 'High temperature alert. Increase irrigation frequency, particularly in morning or evening hours to avoid heat stress.';
      warning = 'Heat Wave Warning';
    } else if (humidity > 85) {
      advisory = 'High humidity levels. Monitor crops closely for pest outbreaks or fungal diseases like powdery mildew.';
    } else if (windSpeed > 25) {
      advisory = 'High wind speeds. Avoid pesticide spraying or high-pressure spray treatments today.';
      warning = 'Strong Winds';
    }

    return {
      temperature,
      humidity,
      rainfall,
      windSpeed,
      advisory,
      warning: warning || undefined
    };
  } catch (error) {
    console.error('Failed to fetch weather data from Open-Meteo:', error);
    // Return standard fallback weather data
    return {
      temperature: 30.5,
      humidity: 65,
      rainfall: 0,
      windSpeed: 10,
      advisory: 'Normal weather. Recommended to proceed with planned sowing and light watering.'
    };
  }
}
