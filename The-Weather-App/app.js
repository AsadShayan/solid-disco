const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const ejs = require("ejs"); // Require EJS

const app = express();
app.use(express.static("Public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set("view engine", "ejs");

app.get("/", function (req, res) {
    res.render("index"); // Render index.ejs
});

app.post("/", function (req, res) {
    const city = req.body.cityName;
    const apiKey = "";//no API key add yours
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`;

    https.get(url, function (response) {
        let data = '';

        response.on("data", function (chunk) {
            data += chunk;
        });

        response.on("end", function () {
            if (response.statusCode === 200) {
                try {
                    const weatherData = JSON.parse(data);
                    const temp = weatherData.current.temp_c;
                    const condition = weatherData.current.condition.text.toLowerCase();
                    const humidity = weatherData.current.humidity;
                    const windSpeed = weatherData.current.wind_kph;

                    // Determine the image based on weather condition
                    let weatherIcon;
                    switch (condition) {
                        case "snow":
                            weatherIcon = "/weather-app-img/images/snow.png";
                            break;
                        case "rain":
                            weatherIcon = "/weather-app-img/images/rain.png";
                            break;
                        case "mist":
                            weatherIcon = "/weather-app-img/images/mist.png";
                            break;
                        case "drizzle":
                            weatherIcon = "/weather-app-img/images/drizzle.png";
                            break;
                        case "clouds":
                            weatherIcon = "/weather-app-img/images/clouds.png";
                            break;
                        case "clear":
                            weatherIcon = "/weather-app-img/images/clear.png";
                            break;
                        default:
                            weatherIcon = "/weather-app-img/images/clear.png";
                            break;
                    }

                    // Render the response.ejs template with data
                    res.render("response", {
                        weatherIcon: weatherIcon,
                        temp: temp,
                        city: city,
                        humidity: humidity,
                        windSpeed: windSpeed
                    });
                } catch (error) {
                    console.error("Error parsing JSON response:", error);
                    res.send("Error retrieving weather data.");
                }
            } else {
                console.error("API response error:", response.statusCode, response.statusMessage);
                res.send("Error retrieving weather data.");
            }
        });
    }).on("error", function (error) {
        console.error("Request error:", error);
        res.send("Error retrieving weather data.");
    });
});

app.listen(3000, function () {
    console.log("Server is listening on Port 3000");
});
