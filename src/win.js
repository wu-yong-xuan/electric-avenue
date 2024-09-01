// Function to update the city name and show the game text
const cityName = sessionStorage.cityName 
if (cityName) {
    document.getElementById('cityNameDisplay').innerText = cityName;
}

function sendEmail() {
    const email = document.getElementById('email').value;
    /*
    Email.send({
        Host: "smtp.gmail.com",
        Username: "sender@email_address.com",
        Password: "Enter your password",
        To: email,
        From: "sender@email_address.com",
        Subject: "Electric Avenue Invite",
        Body: "The mayor of your hometown put you in charge of building the city's electrical grid network. It's an honor, and you are ready for it. Add power plants, substations and transformers to connect all neighborhoods to power. Send service crews to fix power outages, and keep track of your budget. As the seasons change and the city grows, adjust your grid to meet changing demands. Can you take it higher? Which network will give your customers the most uptime at the lowest possible cost? If you figure it all out, you can retire early, but if you fail, you will be fired. Good luck and get down to Electric Avenue. https://wu-yong-xuan.github.io/index.html"
    })
        .then(function (message) {
            alert("mail sent")
        });
        */

    
    // Pre-defined subject and body for the email
    const subject = encodeURIComponent('Electric Avenue Invite');
    const body = encodeURIComponent("The mayor of your hometown put you in charge of building the city's electrical grid network. It's an honor, and you are ready for it. Add power plants, substations and transformers to connect all neighborhoods to power. Send service crews to fix power outages, and keep track of your budget. As the seasons change and the city grows, adjust your grid to meet changing demands. Can you take it higher? Which network will give your customers the most uptime at the lowest possible cost? If you figure it all out, you can retire early, but if you fail, you will be fired. Good luck and get down to Electric Avenue. https://wu-yong-xuan.github.io/index.html");

    // Create the mailto link
    const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;

    // Open the mailto link in a new window to open the user's email client
    //window.location.href = mailtoLink;
    window.open(mailtoLink)
}



// Event listener for the "Enter" button click
document.getElementById('enterButton').addEventListener('click', sendEmail);

// Event listener for the "Enter" key press
document.getElementById('email').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        sendEmail();
    }
});

