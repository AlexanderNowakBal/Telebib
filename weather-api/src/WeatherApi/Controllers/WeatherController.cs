using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WeatherApi.Models;
using WeatherApi.Services;

namespace WeatherApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WeatherController : ControllerBase
    {
        private readonly WeatherService _weatherService;

        public WeatherController(WeatherService weatherService)
        {
            _weatherService = weatherService;
        }

        [HttpGet]
        [Route("forecast")]
        public async Task<ActionResult> GetWeatherForecast([FromQuery] string location = null)
        {
            if (string.IsNullOrWhiteSpace(location))
            {
                var forecasts = await _weatherService.FetchWeatherData();
                return Ok(forecasts);
            }

            var forecast = await _weatherService.FetchWeatherData(location);

            // Treat null result or explicit unknown summary as not found
            if (forecast == null || string.Equals(forecast.Summary, "Unknown location", StringComparison.OrdinalIgnoreCase))
            {
                return NotFound(new { message = $"Location '{location}' not found." });
            }

            return Ok(forecast);
        }
    }
}