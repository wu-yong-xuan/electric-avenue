// Function to update the city name and show the game text
function updateCityName() {
    const cityName = document.getElementById('cityName').value;
    sessionStorage.cityName = cityName
    if (cityName) {
        document.getElementById('cityNameDisplay').innerText = cityName;
        document.getElementById('cityNameDisplay2').innerText = cityName;
        document.getElementById('gameText').classList.remove('hidden');
    }
}

// Event listener for the "Enter" button click
document.getElementById('enterButton').addEventListener('click', updateCityName);

// Event listener for the "Enter" key press
document.getElementById('cityName').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        updateCityName();
    }
});

// Event listener for the "START" button click
document.getElementById('startButton').addEventListener('click', function() {
    window.location.href = 'electric-avenue.html';
});
