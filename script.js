const APIKey = "60f9be3ac9fd332094230a7eb9bb1481";
// Personal API key
const lsKey = "weatherSearches"
    // local storage key
const searchesDiv = $("#searches");
const searchInput = $("#searchInput");
const searchButton = $("#searchBtn");
const currentWeatherDiv = $("#currentWeather");
const forecastDiv = $("#forecast");
const clearBtn = $("#clear");
var storedSearches = JSON.parse(localStorage.getItem(lsKey));
//create searchedcity object
var addedCity = newCity();
//unit variables
const metricUnits = { deg: "C", speed: "KPH" };
const impUnits = { deg: "F", speed: "MPH" };
var units = metricUnits;
// functions help make things eaiser
function newCity(city, country) {
    return { city: city, country: country };
}

function correctCase(str) {
    return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}
init();

function init() {

    //enable tooltips
    $(function() {
        $('[data-toggle="tooltip"]').tooltip()
    });


    displaySearchHistory();
    // get weather if there is nothing in storage
    if (storedSearches != null) {
        getWeather(storedSearches[0]);
    }

    searchInput.on("keyup", function(event) {
        // when pressing the enter key, search
        if (event.key === "Enter") {
            searchButtonClicked();
        }
    });

    searchButton.on("click", searchButtonClicked); // when clicking, search as well
    clearBtn.on("click", clearSearches); // clear everything when clicking the clear button
}

function displaySearchHistory() {

    searchesDiv.empty();
    // empty searchesDiv variable
    // if there is data stored in local storage
    if (storedSearches != null) {
        //push each element to searchesDiv variable and add a button to each searched city
        storedSearches.forEach(element => {
            searchesDiv.append(
                $("<button>")
                .text(correctCase(element.city) + ", " + element.country.toUpperCase())
                .addClass("btn btnCitySearch")
                .on("click", function() {
                    getWeather(element);
                })
            );
        });
    }
}

function searchButtonClicked() {

    let cityVal = searchInput.val().trim(); // eliminate spaces in user's input, assign to cityVal
    let city = newCity(cityVal, null);
    getWeather(city);
    //clear the value once the search is activated
    searchInput.val("");
}
// call
function getWeather(city) {
    addedCity = city;
    let queryURLCurrent = "";
    let queryURLForecast = "";

    if (city.country == null) {
        queryURLCurrent = "https://api.openweathermap.org/data/2.5/weather?q=" + city.city + "&units=metric&appid=" + APIKey;
        queryURLForecast = "https://api.openweathermap.org/data/2.5/forecast?q=" + city.city + "&units=metric&appid=" + APIKey;
    } else {
        queryURLCurrent = "https://api.openweathermap.org/data/2.5/weather?q=" + city.city + "," + city.country + "&units=metric&appid=" + APIKey;
        queryURLForecast = "https:////api.openweathermap.org/data/2.5/forecast?q=" + city.city + "," + city.country + "&units=metric&appid=" + APIKey;
    }

    performAPIGETCall(queryURLCurrent, displayCurrentWeather);
    performAPIGETCall(queryURLForecast, displayForecastWeather);
}


function displayCurrentWeather(data) {
    console.log(data);
    if (data != null) {
        console.log(units, data.wind.speed, data.main.temp, data.main.humidity);
        currentWeatherDiv.empty();
        currentWeatherDiv.append(
            // first letter upper case, other lower case for cities, all upper case for countries
            $("<h3>").text(correctCase(data.name) + ", " +
                data.sys.country.toUpperCase()), $("<h4>").text(moment.unix(data.dt).format("dddd, MMM Do YYYY"))
            .append($("<img>").attr("src", "https://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png")
                .addClass("currentWeatherImg")
                .attr("data-toggle", "tooltip")
                .attr("data-placement", "right")
                .attr("title", data.weather[0].description)
                .tooltip()),
            $("<p>").text("Temperature: " +
                Math.round(data.main.temp) + "°" + units.deg),
            $("<p>").text("Humidity: " +
                data.main.humidity + "%"),
            $("<p>").text("Feels Like:" + " " + data.main.feels_like + "°"),
            $("<p>").text("Wind Speed: " +
                (Math.round((units === metricUnits) ? (data.wind.speed * 3.6) : data.wind.speed)) + " " +
                units.speed),
            $("<p>").text("UV Index: ").append($("<div>").attr("id", "UVIndex"),


            )
        );
        // convert units
        let UVqueryURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + data.coord.lat + "&lon=" + data.coord.lon;

        performAPIGETCall(UVqueryURL, displayUV);

        if (addedCity.country == null) {
            addedCity.country = data.sys.country;
            addedCity.city = data.name;
            addNewSearch(addedCity);
            addedCity = null;
        }

    } else {
        alert("Something went wrong getting current weather data, please try again");
    }
}

function displayUV(data) {
    if (data != null) {

        let UVIndex = data.value;
        let UVDiv = $("#UVIndex").attr("data-toggle", "tooltip");
        let severity = "";
        let UVbg = null;
        let textColor = null;
        let borderColor = null;

        //determine severity of UV Index for color coding
        if (UVIndex < 2) {
            UVbg = "rgb(60,179,113)";
            textColor = "white";
            severity = "Low";
            borderColor = "rgb(60,179,113)";
        } else if (UVIndex < 6) {
            UVbg = "rgb(189,183,107)";
            severity = "Moderate";
            borderColor = "rgb(189,183,107)";
        } else if (UVIndex < 8) {
            UVbg = "rgb(255,140,0)";
            severity = "High";
            borderColor = "rgb(255,140,0)";
        } else if (UVIndex < 11) {

            UVbg = "rgb(205,92,92)";
            textColor = "white";
            severity = "Very high";
            borderColor = "rgb(205,92,92)";
        } else {
            UVbg = "rgb(219,112,147)";
            severity = "Extreme";
            borderColor = "rgb(219,112,147)";
        }
        UVDiv.attr("title", severity)
            .attr("data-placement", "right")
            .tooltip()
            .css("backgroundColor", UVbg)
            .css("borderColor", borderColor);

        if (textColor != null) {
            UVDiv.css("color", textColor);
        }
        UVDiv.text(UVIndex);
    } else {
        alert("Something went wrong getting UV data, please try again");
    }
}

function displayForecastWeather(data) {
    if (data != null) {

        forecastDiv.empty();

        let dayCardContainer = $("<div>").attr("id", "dayCardContainer").addClass("row")

        forecastDiv.append($("<h3>").text("5-Day Forecast:"), dayCardContainer);
        dailyData = parseDailyData(data);

        dailyData.forEach(element => {
            dayCardContainer.append(displayForecastCard(element));
        });

    } else {
        alert("Something went wrong getting forecast data, please try again");
    }
}

function parseDailyData(data) {

    let dailyData = [];
    //increments by 8 due to 8 * 3 hours = 1 day
    for (var i = 5; i < data.list.length; i += 8) {

        let dataList = data.list[i];
        dailyData.push({
            date: dataList.dt,
            icon: dataList.weather[0].icon,
            description: dataList.weather[0].description,
            temp: dataList.main.temp,
            humidity: dataList.main.humidity
        });
    }
    return dailyData;

}

function displayForecastCard(day) {
    let dayCard = $("<div>").attr("class", "dayCard col-12 col-md-5 col-lg-2");

    dayCard.append(
        $("<label>").text(moment.unix(parseInt(day.date)).format('dddd')),
        $("<label>").text(moment.unix(day.date).format("MMM Do YYYY")),
        // add image icon for day card for diff city and each day
        $("<img>").attr("src", "https://openweathermap.org/img/wn/" + day.icon + ".png")
        .attr("data-toggle", "tooltip")
        .attr("data-placement", "right")
        .attr("title", day.description)
        .tooltip(),
        $("<p>").text("Temperature: " + Math.round(day.temp) + "°" + units.deg),
        $("<p>").text("Humidity: " + day.humidity + "%")
    );

    return dayCard;
}

function addNewSearch(city) {
    console.log(city, storedSearches);
    if (storedSearches == null) {
        storedSearches = [];
    }
    //put the newest city at the top
    storedSearches.unshift(city);

    localStorage.setItem(lsKey, JSON.stringify(storedSearches));

    displaySearchHistory();
}

function clearSearches() {

    localStorage.removeItem(lsKey);
    searchesDiv.empty();
    storedSearches = null;
}

function performAPIGETCall(queryURL, callbackFunction) {
    $.ajax({
        url: queryURL,
        method: "GET",
        error: function() {
            alert("The city name is not valid! Please enter again.");
        }
    }).then(function(response) {
        callbackFunction(response);
    });
}