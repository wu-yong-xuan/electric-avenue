
// Function to update the city name and show the game text
const cityName = sessionStorage.cityName 
if (cityName) {
    document.getElementById('cityNameDisplay').innerText = cityName;
}

document.getElementById('startButton').addEventListener('click', function() {
    window.location.href = 'index.html';
});





