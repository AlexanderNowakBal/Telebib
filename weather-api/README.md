# Weather API Application

This project is a simple Weather API application that retrieves weather forecasts from external weather services. It is built using C# and ASP.NET Core.

## Project Structure

- **src/WeatherApi**: Contains the main application code.
  - **Controllers**: Contains the API controllers.
    - `WeatherController.cs`: Handles HTTP requests for weather forecasts.
  - **Services**: Contains the business logic.
    - `WeatherService.cs`: Interacts with external weather APIs to fetch weather data.
  - **Models**: Contains data models.
    - `WeatherForecast.cs`: Defines the structure of weather data.
  - **Properties**: Contains application settings.
    - `launchSettings.json`: Configuration for launching the application.
  - `Program.cs`: Entry point of the application.
  - `Startup.cs`: Configures services and the request pipeline.
  - `appsettings.json`: Configuration settings for the application.
  - `WeatherApi.csproj`: Project file specifying dependencies and settings.

- **tests/WeatherApi.Tests**: Contains unit tests for the application.
  - `WeatherServiceTests.cs`: Tests for the `WeatherService` class.
  - `WeatherApi.Tests.csproj`: Project file for the test project.

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd weather-api
   ```

3. Restore the dependencies:
   ```
   dotnet restore
   ```

4. Run the application:
   ```
   dotnet run --project src/WeatherApi/WeatherApi.csproj
   ```

## Usage

Once the application is running, you can access the weather forecasts by sending a GET request to the following endpoint:
```
GET /weatherforecast
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.