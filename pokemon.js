const pokemonCount = 1025;
var pokedex = {};
var id = Math.floor((Math.random() * pokemonCount) + 1);
var naam;
var guessTimer;
var timerInterval;
var isPaused = false; // Variable to track if the timer is paused

window.onload = async function() {
    showLoadingScreen();
    await getPokemon(id);
    console.log(pokedex);
    startGuessTimer(); // Start the timer after loading the Pokémon
}

async function getPokemon(num) {
    let url = 'https://pokeapi.co/api/v2/pokemon/' + num;
    let res = await fetch(url);
    let pokemon = await res.json();
    console.log(pokemon);

    let pokemonName = pokemon["name"];
    naam = pokemonName;
    let pokemonType = pokemon["types"].map(typeInfo => typeInfo.type.name).join(', ');
    let pokemonImage = pokemon["sprites"]["front_default"];
    res = await fetch(pokemon["species"]["url"]);
    let pokemonDes = await res.json();
    pokemonDes = pokemonDes["flavor_text_entries"][0]["flavor_text"];

    pokedex[num] = {
        "name": pokemonName,
        "types": pokemonType,
        "description": pokemonDes,
        "image": pokemonImage
    };

    const imgElement = document.getElementById('pokemon-image');
    imgElement.style.display = 'none'; // Hide the image initially
    imgElement.src = pokemonImage;
    imgElement.onload = function() {
        hideLoadingScreen();
        imgElement.style.display = 'block'; // Show the image once it has loaded
        document.querySelector('.reveal').disabled = false; // Enable the reveal button
    };
   
}

function showLoadingScreen() {
    document.getElementById('loading-screen').style.display = 'block';
}

function hideLoadingScreen() {
    document.getElementById('loading-screen').style.display = 'none';
}

function startGuessTimer() {
    let timeLeft = 10;
    document.getElementById('timer-clock').innerText = timeLeft;
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = '0%'; // Reset progress bar

    let interval = 100; // Update every 100 milliseconds
    let totalTime = timeLeft * 1000; // Total time in milliseconds
    let elapsedTime = 0;

    timerInterval = setInterval(function() {
        if (!isPaused) { // Check if the timer is not paused
            elapsedTime += interval;
            let percentage = (elapsedTime / totalTime) * 100;
            progressBar.style.width = `${percentage}%`; // Update progress bar

            if (elapsedTime >= totalTime) {
                clearInterval(timerInterval);
                revealPokemon();
                document.querySelector('.progress-bar-container').style.display = 'none'; 
                document.querySelector('.reveal').style.display = 'none';
                document.getElementById('who').style.display = 'none';
                document.querySelector('.boxImg').style.marginBottom = '70px';
                document.querySelector('.link').style.display = 'flex';
                const linkElement = document.getElementById('linkto');
                linkElement.style.display = 'block';
                linkElement.href = `https://pokepedia-graphql.netlify.app/pokemon/`+naam;
                
            }

            // Update the timer display every second
            if (elapsedTime % 1000 === 0) {
                timeLeft--;
                document.getElementById('timer-clock').innerText = timeLeft;
            }
        }
    }, interval);
}

function revealPokemon() {
    const imgElement = document.getElementById('pokemon-image');
    imgElement.style.display = 'block'; // Ensure the image is displayed
    imgElement.classList.add('brightened'); 

    // Add the up-down class when the brightness is set to 1
    if (imgElement.classList.contains('brightened')) {
        imgElement.classList.add('up-down');
    }

    document.getElementById('correct').innerText = 'The Pokémon is ' + naam;

    // Add border class to info div
    const infoDiv = document.querySelector('.info');
    if (pokedex[id].types && pokedex[id].description) {
        infoDiv.classList.add('has-content');
        typeText(document.getElementById('pokemon-type'), 'Type : ' + pokedex[id].types);
        typeText(document.getElementById('pokemon-description'), 'Description : ' + pokedex[id].description);
    }

    // Disable and hide the input field
    const inputField = document.getElementById('guessPokemon');
    inputField.disabled = true;
    inputField.style.display = 'none';
}

function typeText(element, text) {
    element.innerHTML = ''; // Clear existing content
    element.classList.remove('typing'); // Remove the typing class to reset the animation
    setTimeout(() => {
        element.innerHTML = text; // Set the text content
        element.classList.add('typing'); // Add the typing class to start the animation
    }, 100); // Small delay to ensure the animation restarts
}

const inputField = document.getElementById('guessPokemon');
inputField.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const userInput = inputField.value.trim().toLowerCase(); // Get user input and normalize it
        if (userInput === naam.toLowerCase()) {
            clearInterval(timerInterval); // Stop the timer
            const imgElement = document.getElementById('pokemon-image');
            imgElement.style.display = 'block'; // Ensure the image is displayed
            imgElement.classList.add('brightened');
            document.getElementById('correct').innerText = 'You nailed it ! The Pokémon is ' + naam;
            document.getElementById('who').style.display = 'none';
            document.querySelector('.boxImg').style.marginBottom = '70px';
            document.querySelector('.link').style.display = 'flex';
            const linkElement = document.getElementById('linkto');
            linkElement.style.display = 'block';
            linkElement.href = `https://pokepedia-graphql.netlify.app/pokemon/`+naam;

            // Add border class to info div
            const infoDiv = document.querySelector('.info');
            if (pokedex[id].types && pokedex[id].description) {
                infoDiv.classList.add('has-content');
                typeText(document.getElementById('pokemon-type'), 'Type: ' + pokedex[id].types);
                typeText(document.getElementById('pokemon-description'), 'Description: ' + pokedex[id].description);
            }

            // Disable and hide the input field
            inputField.disabled = true;
            inputField.style.display = 'none';
            document.querySelector('.progress-bar-container').style.display = 'none'; // Hide progress bar
            document.querySelector('.reveal').style.display = 'none';
        } else {
            document.getElementById('correct').innerText = 'Oops! Try Again';
        }
    }
});

document.querySelector('.again').addEventListener('click', async function() {
    clearInterval(timerInterval); // Clear the previous timer
    location.reload(); 

    // Remove border class from info div
    const infoDiv = document.querySelector('.info');
    infoDiv.classList.remove('has-content');
    document.querySelector('.reveal').disabled = true; // Disable the reveal button

    // Enable and show the input field
    inputField.disabled = false;
    inputField.style.display = 'block';
});

document.querySelector('.reveal').addEventListener('click', function() {
    clearInterval(timerInterval); // Clear the timer if the user clicks reveal
    revealPokemon();
    document.querySelector('.progress-bar-container').style.display = 'none'; // Hide progress bar
    document.querySelector('.reveal').style.display = 'none';
    document.getElementById('who').style.display = 'none';
    document.querySelector('.boxImg').style.marginBottom = '70px';
    document.querySelector('.link').style.display = 'flex';
    const linkElement = document.getElementById('linkto');
    linkElement.style.display = 'block';
    linkElement.href = `https://pokepedia-graphql.netlify.app/pokemon/`+naam;
});

document.querySelector('.pause').addEventListener('click', function() {
    isPaused = !isPaused; // Toggle the pause state
    this.innerText = isPaused ? 'Resume' : 'Pause'; // Update button text
});