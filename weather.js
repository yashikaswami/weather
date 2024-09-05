const apiKey = "538b9a05877db4c849fda2a3f5e3454b";
const apiURL = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const countryAPIURL = "https://restcountries.com/v3.1/alpha/";
const countryListAPIURL = "https://restcountries.com/v3.1/all";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");
const body = document.querySelector("body");
const countryElement = document.querySelector(".country");
const capitalElement = document.querySelector(".capital");
const continentElement = document.querySelector(".continent");
const currencyElement = document.querySelector(".currency");
const languagesElement = document.querySelector(".languages");
const bordersElement = document.querySelector(".borders");
const landlockedElement = document.querySelector(".landlocked");


// Call checkWeather with default location: Just Unhide This


const defaultLocation = 'Mohali';
checkWeather(defaultLocation);






// Function to get country names from their codes
async function getCountryNames(codes) {
    try {
        const response = await fetch(countryListAPIURL);
        if (!response.ok) {
            throw new Error('Country list fetch failed');
        }
        const countries = await response.json();
        const countryMap = countries.reduce((map, country) => {
            map[country.cca3] = country.name.common;
            return map;
        }, {});
        return codes.map(code => countryMap[code] || 'Unknown');
    } catch (error) {
        console.error(error);
        return codes.map(() => 'Unknown');
    }
}

// Function to get country details from the country code
async function getCountryDetails(countryCode) {
    try {
        const response = await fetch(`${countryAPIURL}${countryCode}`);
        if (!response.ok) {
            throw new Error('Country data fetch failed');
        }
        const data = await response.json();
        const countryData = data[0];
        const countryName = countryData.name.common;
        const capital = countryData.capital ? countryData.capital[0] : 'Unknown';
        const continent = countryData.continents ? countryData.continents[0] : 'Unknown';
        const currency = countryData.currencies ? Object.values(countryData.currencies)[0] : { name: 'Unknown', symbol: 'N/A' };
        const languages = countryData.languages ? Object.values(countryData.languages).join(', ') : 'Unknown';
        const borders = countryData.borders ? await getCountryNames(countryData.borders) : ['None'];
        const landlocked = countryData.landlocked ? 'Yes' : 'No';
        return { 
            countryName, 
            capital, 
            continent, 
            currencyName: currency.name, 
            currencySymbol: currency.symbol || 'N/A',
            languages,
            borders: borders.length > 0 ? borders.join(', ') : 'None',
            landlocked
        };
    } catch (error) {
        console.error(error);
        return { 
            countryName: 'Unknown', 
            capital: 'Unknown', 
            continent: 'Unknown', 
            currencyName: 'Unknown', 
            currencySymbol: 'N/A', 
            languages: 'Unknown', 
            borders: 'None', 
            landlocked: 'Unknown' 
        };
    }
}

async function checkWeather(city) {
    try {
        const response = await fetch(apiURL + city + `&appid=${apiKey}`);

        if (response.status === 404) {
            document.querySelector(".error").style.display = "block";
            document.querySelector(".weather").style.display = "none";
            return;
        }

        const data = await response.json();

        console.log(data);

        document.querySelector(".city").innerHTML = `<span style="text-align:center">${data.name}</span>`;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = data.wind.speed + "Km/h";
        document.querySelector(".map").innerHTML = `<a href="https://www.google.com/maps/?q=${data.coord.lat},${data.coord.lon}" target="_blank">Click Here to Explore City on Map</a>`;

        // Get country details and update UI
        const { countryName, capital, continent, currencyName, currencySymbol, languages, borders, landlocked } = await getCountryDetails(data.sys.country);
        countryElement.innerHTML = `<span>Country</span>: ${countryName}`;
        capitalElement.innerHTML = `<span>Capital</span>: ${capital}`;
        continentElement.innerHTML = `<span>Continent</span>: ${continent}`;
        currencyElement.innerHTML = `<span>Currency</span> ${currencyName} (${currencySymbol})`;
        languagesElement.innerHTML = `<span>Languages</span>: ${languages}`;
        bordersElement.innerHTML = `<span>Borders</span>: ${borders}`;
        landlockedElement.innerHTML = `<span>Landlocked</span>: ${landlocked}`;

        document.querySelector(".weather").style.display = "block";
        document.querySelector(".error").style.display = "none";
    } catch (error) {
        console.error('Weather data fetch failed:', error);
        document.querySelector(".error").style.display = "block";
        document.querySelector(".weather").style.display = "none";
    }
}

searchBtn.addEventListener("click", () => {
    const city = searchBox.value;
    checkWeather(city);
});

searchBox.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        const city = searchBox.value;
        checkWeather(city);
    }
});
