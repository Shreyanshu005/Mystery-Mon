const pokemonCount = 1025;
var pokedex = {};
var id = Math.floor((Math.random() * pokemonCount) + 1);
var naam;
var guessTimer;
var timerInterval;
var isPaused = false;

window.onload = async function () {
    showLoadingScreen();
    await getPokemon(id);
    console.log(pokedex);
    startGuessTimer();
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
    pokemonDes = pokemonDes["flavor_text_entries"].find(entry => entry.language.name === 'en').flavor_text;

    pokedex[num] = {
        "name": pokemonName,
        "types": pokemonType,
        "description": pokemonDes,
        "image": pokemonImage
    };

    const imgElement = document.getElementById('pokemon-image');
    imgElement.style.display = 'none';
    imgElement.src = pokemonImage;
    imgElement.onload = function () {
        hideLoadingScreen();
        imgElement.style.display = 'block';
        document.querySelector('.reveal').disabled = false;
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
    progressBar.style.width = '0%';

    let interval = 100;
    let totalTime = timeLeft * 1000;
    let elapsedTime = 0;

    timerInterval = setInterval(function () {
        if (!isPaused) {
            elapsedTime += interval;
            let percentage = (elapsedTime / totalTime) * 100;
            progressBar.style.width = `${percentage}%`;

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
                linkElement.href = `https://pokepedia-graphql.netlify.app/pokemon/` + naam;

                document.getElementById('welcome').style.display = 'none';
                resetStreak();
            }

            if (elapsedTime % 1000 === 0) {
                timeLeft--;
                document.getElementById('timer-clock').innerText = timeLeft;
            }
        }
    }, interval);
}

function revealPokemon() {
    const imgElement = document.getElementById('pokemon-image');
    imgElement.style.display = 'block';
    imgElement.classList.add('brightened');

    if (imgElement.classList.contains('brightened')) {
        imgElement.classList.add('up-down');
    }

    document.getElementById('correct').innerText = 'The Pokémon is ' + naam;

    const infoDiv = document.querySelector('.info');
    if (pokedex[id].types && pokedex[id].description) {
        infoDiv.classList.add('has-content');
        typeText(document.getElementById('pokemon-type'), 'Type : ' + pokedex[id].types);
      
        typeDescription('Description : ' + pokedex[id].description);
    }

    const inputField = document.getElementById('guessPokemon');
    inputField.disabled = true;
    inputField.style.display = 'none';
}

function typeText(element, text) {
    element.innerHTML = '';
    element.classList.remove('typing');
    setTimeout(() => {
        element.innerHTML = text;
        element.classList.add('typing');
    }, 100);
}

let currentStreak = localStorage.getItem('currentStreak') ? parseInt(localStorage.getItem('currentStreak')) : 0;
    let highestStreak = localStorage.getItem('highestStreak') ? parseInt(localStorage.getItem('highestStreak')) : 0;
    updateStreakDisplay(currentStreak, highestStreak);
function updateStreakDisplay(currentStreak, highestStreak) {
    document.getElementById('current-streak').innerText = 'Current Streak : ' + currentStreak;
    document.getElementById('highest-streak').innerText = 'Highest Streak : ' + highestStreak;
}

function resetStreak() {
    currentStreak = 0;
    localStorage.setItem('currentStreak', currentStreak);
    updateStreakDisplay(currentStreak, highestStreak);
}
function incrementStreak() {
    currentStreak += 1;
    if (currentStreak > highestStreak) {
        highestStreak = currentStreak;
        localStorage.setItem('highestStreak', highestStreak);
    }
    localStorage.setItem('currentStreak', currentStreak);
    updateStreakDisplay(currentStreak, highestStreak);
}

function typeDescription(description) {
    const descriptionElement = document.getElementById('pokemon-description');
    let index = 0;

    descriptionElement.innerText = '';

    function displayNextLetter() {
        if (index < description.length) {
            descriptionElement.innerText += description[index];
            index++;
            setTimeout(displayNextLetter, 50); // Adjust the delay between letters as needed
        }
    }

    displayNextLetter();
}



const inputField = document.getElementById('guessPokemon');
inputField.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        const userInput = inputField.value.trim().toLowerCase();
        if (userInput === naam.toLowerCase()) {
            clearInterval(timerInterval);
            const imgElement = document.getElementById('pokemon-image');
            imgElement.style.display = 'block';
            imgElement.classList.add('brightened');
            document.getElementById('correct').innerText = 'You nailed it ! The Pokémon is ' + naam;
            document.getElementById('who').style.display = 'none';
            document.querySelector('.boxImg').style.marginBottom = '70px';
            document.querySelector('.link').style.display = 'flex';
            const linkElement = document.getElementById('linkto');
            linkElement.style.display = 'block';
            linkElement.href = `https://pokepedia-graphql.netlify.app/pokemon/` + naam;

            document.getElementById('welcome').style.display = 'none';
            const infoDiv = document.querySelector('.info');
            if (pokedex[id].types && pokedex[id].description) {
                infoDiv.classList.add('has-content');
                typeText(document.getElementById('pokemon-type'), 'Type: ' + pokedex[id].types);
                typeDescription('Description : ' + pokedex[id].description);
            }

            inputField.disabled = true;
            inputField.style.display = 'none';
            document.querySelector('.progress-bar-container').style.display = 'none';
            document.querySelector('.reveal').style.display = 'none';
            incrementStreak();
        } else {
            document.getElementById('who').innerText = 'Oops! Try Again';
           

        }
    }
});




document.querySelector('.again').addEventListener('click', async function () {
    clearInterval(timerInterval);
    location.reload();

    const infoDiv = document.querySelector('.info');
    infoDiv.classList.remove('has-content');
    document.querySelector('.reveal').disabled = true;

    inputField.disabled = false;
    inputField.style.display = 'block';
});

document.querySelector('.reveal').addEventListener('click', function () {
    clearInterval(timerInterval);
    revealPokemon();
    document.querySelector('.progress-bar-container').style.display = 'none';
    document.querySelector('.reveal').style.display = 'none';
    document.getElementById('who').style.display = 'none';
    document.querySelector('.link').style.display = 'flex';
    document.getElementById('welcome').style.display = 'none';
    const linkElement = document.getElementById('linkto');
    linkElement.style.display = 'block';
    
    
    resetStreak();
    linkElement.href = `https://pokepedia-graphql.netlify.app/pokemon/` + naam;
});


document.querySelector('.pause').addEventListener('click', function () {
    isPaused = !isPaused;
    this.innerText = isPaused ? 'Resume' : 'Pause';
});



document.querySelector('.again').addEventListener('click', async function () {
    clearInterval(timerInterval);
    location.reload();

    const infoDiv = document.querySelector('.info');
    infoDiv.classList.remove('has-content');
    document.querySelector('.reveal').disabled = true;

    inputField.disabled = false;
    inputField.style.display = 'block';
});
