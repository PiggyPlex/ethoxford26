import * as z from "zod";
import { tool } from "langchain";
import { Effect, pipe } from "effect";

export const getWeather = tool(
  async ({ city }) => {
    const program = pipe(
      Effect.tryPromise({
        try: async () => {
          const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
          );
          const geoData = await geoResponse.json();
          
          if (!geoData.results || geoData.results.length === 0) {
            throw new Error(`City "${city}" not found`);
          }
          
          const { latitude, longitude, name, country } = geoData.results[0];
          
          const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m`
          );
          const weatherData = await weatherResponse.json();
          
          const current = weatherData.current;
          return `Weather in ${name}, ${country}: ${current.temperature_2m}°C, Wind: ${current.wind_speed_10m} km/h, Humidity: ${current.relative_humidity_2m}%`;
        },
        catch: (error) => new Error(`Weather fetch failed: ${error}`),
      })
    );
    
    return Effect.runPromise(program);
  },
  {
    name: "get_weather",
    description: "Get the current weather for a given city",
    schema: z.object({
      city: z.string().describe("The city name to get weather for"),
    }),
  }
);