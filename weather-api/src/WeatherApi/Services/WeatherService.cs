using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WeatherApi.Models;

namespace WeatherApi.Services
{
    public class WeatherService
    {
        // Static dataset of ~100 global locations with sensible temperatures.
        private static readonly Dictionary<string, WeatherForecast> _data = CreateSeedData();

        public WeatherService()
        {
        }

        // Return all seeded forecasts
        public Task<IEnumerable<WeatherForecast>> FetchWeatherData()
        {
            var copy = _data.Values.Select(w => new WeatherForecast
            {
                Date = w.Date,
                TemperatureC = w.TemperatureC,
                Summary = w.Summary,
                PrecipitationChance = w.PrecipitationChance
            });

            return Task.FromResult(copy);
        }

        // Return single location forecast (best-effort match)
        public Task<WeatherForecast> FetchWeatherData(string location)
        {
            if (string.IsNullOrWhiteSpace(location))
                return Task.FromResult<WeatherForecast>(null);

            if (_data.TryGetValue(location, out var forecast))
            {
                return Task.FromResult(new WeatherForecast
                {
                    Date = forecast.Date,
                    TemperatureC = forecast.TemperatureC,
                    Summary = forecast.Summary,
                    PrecipitationChance = forecast.PrecipitationChance
                });
            }

            // fallback: try contains match
            var match = _data.FirstOrDefault(kv => kv.Key.IndexOf(location, StringComparison.OrdinalIgnoreCase) >= 0).Value;
            if (match != null)
            {
                return Task.FromResult(new WeatherForecast
                {
                    Date = match.Date,
                    TemperatureC = match.TemperatureC,
                    Summary = match.Summary,
                    PrecipitationChance = match.PrecipitationChance
                });
            }

            return Task.FromResult(new WeatherForecast
            {
                Date = DateTime.UtcNow,
                TemperatureC = 0,
                Summary = "Unknown location",
                PrecipitationChance = 0
            });
        }

        private static Dictionary<string, WeatherForecast> CreateSeedData()
        {
            var now = DateTime.UtcNow;
            var entries = new (string name, int temp)[]
            {
                ("New York, USA", 15), ("Los Angeles, USA", 20), ("Chicago, USA", 8), ("Houston, USA", 25), ("Phoenix, USA", 33),
                ("Philadelphia, USA", 14), ("San Antonio, USA", 26), ("San Diego, USA", 19), ("Dallas, USA", 22), ("San Jose, USA", 18),
                ("Austin, USA", 27), ("Jacksonville, USA", 23), ("Fort Worth, USA", 21), ("Columbus, USA", 12), ("San Francisco, USA", 16),
                ("Charlotte, USA", 17), ("Indianapolis, USA", 13), ("Seattle, USA", 12), ("Denver, USA", 12), ("Washington, D.C., USA", 14),
                ("Boston, USA", 11), ("El Paso, USA", 24), ("Detroit, USA", 10), ("Nashville, USA", 19), ("Portland, USA", 13),
                ("Oklahoma City, USA", 20), ("Las Vegas, USA", 30), ("Memphis, USA", 22), ("Louisville, USA", 15), ("Baltimore, USA", 14),
                ("Milwaukee, USA", 9), ("Albuquerque, USA", 18), ("Tucson, USA", 28), ("Fresno, USA", 25), ("Sacramento, USA", 19),
                ("Kansas City, USA", 14), ("Long Beach, USA", 18), ("Mesa, USA", 29), ("Atlanta, USA", 20), ("Colorado Springs, USA", 11),
                ("London, UK", 12), ("Paris, France", 13), ("Berlin, Germany", 10), ("Madrid, Spain", 20), ("Rome, Italy", 18),
                ("Milan, Italy", 17), ("Barcelona, Spain", 19), ("Lisbon, Portugal", 19), ("Amsterdam, Netherlands", 11), ("Brussels, Belgium", 12),
                ("Vienna, Austria", 11), ("Prague, Czechia", 9), ("Budapest, Hungary", 12), ("Warsaw, Poland", 8), ("Stockholm, Sweden", 7),
                ("Oslo, Norway", 6), ("Copenhagen, Denmark", 9), ("Helsinki, Finland", 3), ("Dublin, Ireland", 10), ("Zurich, Switzerland", 10),
                ("Athens, Greece", 23), ("Istanbul, Turkey", 17), ("Moscow, Russia", 5), ("St Petersburg, Russia", 4), ("Ankara, Turkey", 16),
                ("Cairo, Egypt", 28), ("Casablanca, Morocco", 20), ("Johannesburg, South Africa", 16), ("Cape Town, South Africa", 18), ("Lagos, Nigeria", 28),
                ("Accra, Ghana", 26), ("Nairobi, Kenya", 20), ("Addis Ababa, Ethiopia", 15), ("Khartoum, Sudan", 33), ("Algiers, Algeria", 22),
                ("Tunis, Tunisia", 24), ("Tehran, Iran", 24), ("Dubai, UAE", 35), ("Abu Dhabi, UAE", 34), ("Riyadh, Saudi Arabia", 36),
                ("Mumbai, India", 30), ("Delhi, India", 32), ("Bangalore, India", 25), ("Chennai, India", 29), ("Kolkata, India", 31),
                ("Kathmandu, Nepal", 18), ("Dhaka, Bangladesh", 30), ("Bangkok, Thailand", 29), ("Yangon, Myanmar", 28), ("Hanoi, Vietnam", 26),
                ("Ho Chi Minh City, Vietnam", 28), ("Kuala Lumpur, Malaysia", 29), ("Singapore, Singapore", 30), ("Jakarta, Indonesia", 28), ("Manila, Philippines", 27),
                ("Hong Kong, China", 26), ("Shanghai, China", 19), ("Beijing, China", 14), ("Seoul, South Korea", 17), ("Tokyo, Japan", 18)
            };

            var dict = new Dictionary<string, WeatherForecast>(StringComparer.OrdinalIgnoreCase);

            foreach (var (name, temp) in entries)
            {
                var summary = SummaryForTemp(temp);
                var precip = Math.Abs(name.GetHashCode()) % 60; // 0-59% chance

                dict[name] = new WeatherForecast
                {
                    Date = now,
                    TemperatureC = temp,
                    Summary = summary,
                    PrecipitationChance = precip
                };
            }

            return dict;
        }

        private static string SummaryForTemp(int tempC)
        {
            if (tempC <= 0) return "Snow";
            if (tempC <= 10) return "Cold";
            if (tempC <= 15) return "Cool";
            if (tempC <= 22) return "Mild";
            if (tempC <= 28) return "Warm";
            return "Hot";
        }
    }
}