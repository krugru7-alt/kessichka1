export async function GET() {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=53.9045" +
    "&longitude=27.5615" +
    "&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m" +
    "&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
    "&timezone=Europe%2FMinsk";

  try {
    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Weather API error");
    }

    const weather = await response.json();

    return Response.json({
      city: "Минск",
      temperature: weather.current.temperature_2m,
      feelsLike: weather.current.apparent_temperature,
      wind: weather.current.wind_speed_10m,
      weatherCode: weather.current.weather_code,
      max: weather.daily.temperature_2m_max[0],
      min: weather.daily.temperature_2m_min[0],
      rainChance:
        weather.daily.precipitation_probability_max[0],
    });
  } catch (error) {
    return Response.json(
      {
        error: "Не удалось получить погоду",
      },
      {
        status: 500,
      }
    );
  }
}
