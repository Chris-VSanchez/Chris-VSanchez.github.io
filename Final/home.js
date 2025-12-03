// Get the area where the Pokédex is displayed
const pokedex = document.getElementById("pokedex");

// Corrected Pokémon names
const correctedNames =
{
    745: "Lycanroc",
    784: "Kommo-o",
    1002: "Chien-Pao",
};

// List Favorite Pokémon by Id
const favorites = [6, 38, 59, 151, 157, 229, 249, 335, 405, 418, 448, 494, 503, 
    571, 655, 727, 745, 773, 784, 791, 807, 880, 888, 889, 893, 908, 1002];

// Store all Pokémon data
const pokemonData = {};
const pokemonExtraData = {};

// Current Pokémon and Forms (if Any) in focus
let currentPokemon;
let isShiny = false;

// Instantiate the modal
const pokemonModal = new bootstrap.Modal(document.getElementById("pokemonModal"), { focus: false });

// Store all modal elements (to avoid repeat DOM requests)
const modalElements = 
{
    name: document.getElementById("pokemonName"),
    dropdown: document.getElementById("formDropdown"),
    forms: document.getElementById("pokemonForms"),
    id: document.getElementById("pokemonId"),
    sprite: document.getElementById("pokemonImage"),
    description: document.getElementById("pokemonDescription"),
    shiny: document.getElementById("shinyToggler"),
    height: document.getElementById("pokemonHeight"),
    category: document.getElementById("pokemonCategory"),
    weight: document.getElementById("pokemonWeight"),
    abilities: document.getElementById("pokemonAbilities"),
    types: document.getElementById("pokemonTypes")
};

// Format Hyphenated Text
function formatText(text) 
{
    // Split every word by hyphen, capitalize every word, and join them by spaces
    return text
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Format Pokémon Names
function formatName(pokemon)
{
    // If the Pokémon has a corrected name, use that name
    if( pokemon.id && correctedNames[pokemon.id])
        return correctedNames[pokemon.id];

    // Else, format the name normally
    return formatText(pokemon.name);
}

// Load the data for all Pokémon
async function loadPokemon() 
{
    //Create a "card" for every Pokémon
    for( let pokemonId of favorites)
    {
        // Error Handling
        try
        {
            // Fetch every Id and store it in "pokemon"
            const result = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
            const pokemon = await result.json();

            // Store every Pokémon's information and create a card for it
            pokemonData[pokemonId] = pokemon;
            createPokemonCard(pokemon);
        }

        catch( error)
        {
            console.warn("Error loading Pokémon # " + pokemonId);
        }
    }

}

// Display the data for all Pokémon
function createPokemonCard(pokemon) 
{
    // Create <button class = "pokemon-card" type = "button"></button>
    const card = document.createElement("button");
    card.classList.add("pokemon-card");

    // Give every card its own Id
    card.dataset.id = pokemon.id;

    // Add onClick to display the Pokémon modal
    card.type = "button";
    card.setAttribute("onclick", `createPokemonModal(${pokemon.id})`);

    // Format every Pokémon's id as a string with leading zeros
    const pokemonId = `#${pokemon.id.toString().padStart(4, "0")}`;

    // Format every Pokémon's name
    const name = formatName(pokemon);

    // Use the official artwork for every Pokémon
    const sprite = pokemon.sprites.other["official-artwork"].front_default;

    /* Create a span for each Pokémon type and combine them into a string
    <span class = "type-badge (type)">(type)</span> */
    const types = pokemon.types
        .map(t => `<span class = "type-badge ${t.type.name}">${formatText(t.type.name)}</span>`)
        .join("");

    // Create the layout for every "card"
    card.innerHTML = 
    `   <img class = "pokemon-img" src = "${sprite}" alt = "${name}" loading = "lazy">
        <div class = "pokemon-id">${pokemonId}</div>
        <p class = "pokemon-name">${name}</p>
        <div class = "pokemon-types">${types}</div> `;

    // Add every "card" to the grid
    pokedex.appendChild(card);
}

// Fetch or retrieve extra information
async function getExtraInformation(pokemonId) 
{ 
    // If the extra data for a Pokémon has not been fetched, fetch the extra data for that Pokémon
    if( !pokemonExtraData[pokemonId])
    {
        // Error Handling
        try
        {
            // Await the response and read the json into "extraData"
            const result = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
            if( !result.ok)
                return {};
            
            const extraData = await result.json();
            if( !extraData)
                return {};

            // Store each pokemon's extra data for reuse
            pokemonExtraData[pokemonId] = extraData;

        // Fetch the json for every Pokémon form

            // Get the form IDs
            const forms = extraData.varieties
                .map(v => v.pokemon.url.match(/(\d+)\/?$/))
                .filter(match => match)
                .map(match => Number(match[1]));
            
            // Make an API call for every form
            for( const form of forms)
            {
                // Avoid repeat API calls
                if( pokemonData[form])
                    continue;

                // Error Handling
                try
                {
                    // Await the response and read the json into "pokemon"
                    const result = await fetch(`https://pokeapi.co/api/v2/pokemon/${form}`);
                    if( !result.ok)
                        continue;

                    const pokemon = await result.json();
                    if( !pokemon)
                        continue;

                    // Store each pokemon's data for reuse
                    pokemonData[pokemon.id] = pokemon;
                }

                catch( error)
                {
                    console.warn("Error loading Pokémon #", form, error);
                }
            }
        }

        catch( error)
        {
            console.warn("Error loading extra information for Pokémon #", pokemonId, error);
            return {};
        }
    }

    // Return the extra data for the desired Pokémon
    return pokemonExtraData[pokemonId];
}

// Update the current Pokémon, active button, and modal
function selectForm(pokemonId)
{
    // Update current Pokémon
    currentPokemon = pokemonData[pokemonId];
    if( !currentPokemon)
        return;

    // Update active button
    Array.from(modalElements.forms.children).forEach
        ( btn =>{ btn.classList.toggle("active", Number(btn.dataset.id) === pokemonId); });

// Update modal
    
    // Dropdown
    const formattedName = formatName(currentPokemon);
    modalElements.dropdown.innerText = formattedName;

    // Reset Shiny Button and State
    isShiny = false;
    modalElements.shiny.src = "Menu Icons/Shiny (Off).svg";
    
    const hasShiny = currentPokemon.sprites.other["official-artwork"].front_shiny !== null;
    modalElements.shiny.parentElement.style.display = hasShiny ? "block" : "none";

    // Pokémon Image and Alt
    modalElements.sprite.src = currentPokemon.sprites.other["official-artwork"].front_default;
    modalElements.sprite.alt =  formattedName;

    // Height
    modalElements.height.textContent = `${(currentPokemon.height / 10).toFixed(1)} m`;

    // Weight and Abilities
    modalElements.weight.textContent = `${(currentPokemon.weight / 10).toFixed(1)} kg`;
    modalElements.abilities.innerHTML = currentPokemon.abilities
        .map(a => `<div>${formatText(a.ability.name)}</div>`)
        .join("");
    
    // Pokémon Types
    modalElements.types.innerHTML = currentPokemon.types
        .map(t => `<span class = "type-badge ${t.type.name}">${formatText(t.type.name)}</span>`)
        .join("");
}

// Create a modal for the desired Pokémon
async function createPokemonModal(pokemonId)
{
    // Get Pokémon from memory
    const pokemon = pokemonData[pokemonId];
    if( !pokemon)
        return;

    // Update current Pokémon
    currentPokemon = pokemon;

    // Get or fetch extra Pokémon information
    const extraInformation = await getExtraInformation(pokemonId) || {};

    // Update the modal
    const modal = modalElements;

// Fill the Modal
    // Pokémon Name and Id
    const formattedName = formatName(pokemon);
    modal.name.textContent = formattedName;
    modal.id.textContent = `#${pokemon.id.toString().padStart(4, "0")}`;

// Pokémon Forms
    // Clear form buttons
    modal.forms.innerHTML = '';

    // Get the form IDs and filter out forms without information
    let forms = extraInformation.varieties
        .map(v => v.pokemon.url.match(/(\d+)\/?$/))
        .filter(match => match)
        .map(match => Number(match[1]))
        .filter(id => 
            {
                const form = pokemonData[id];
                return form && form.sprites.other["official-artwork"].front_default !== null;
            });

    // Create a dropdown for Pokémon with more than one form
    modal.dropdown.parentElement.style.display = forms.length > 1 ? "block" : "none";

    // Create an entry for every form
    for( const form of forms)
    {
        const newForm = pokemonData[form];
        if( !newForm)
            continue;

        // Fill the dropdown
        const formEntry = document.createElement("li");

        // Add a new field to the dropdown
        formEntry.innerHTML = `
            <button class = "dropdown-item" data-id = "${form}" type = "button">
                ${formatName(newForm)}
            </button>`;

        // Add onClick behavior
        formEntry.querySelector("button").onclick = () =>
        {
            selectForm(form);
            modal.dropdown.textContent = formatName(pokemonData[form]);
        };

        modal.forms.appendChild(formEntry);
    }

    modal.dropdown.textContent = formattedName;

    // Reset Shiny Button and State
    isShiny = false;
    modal.shiny.src = "Menu Icons/Shiny (Off).svg";

    const hasShiny = currentPokemon.sprites.other["official-artwork"].front_shiny !== null;
    modal.shiny.parentElement.style.display = hasShiny ? "block" : "none";

    // Pokémon Image and Alt
    modal.sprite.src = pokemon.sprites.other["official-artwork"].front_default;
    modal.sprite.alt =  formattedName;

    // Pokémon Description
    const flavorText = extraInformation.flavor_text_entries
        .filter(l => l.language.name === 'en')
        .pop();
    modal.description.textContent = flavorText.flavor_text.replace(/[\n\f]/g, ' ');

    // Height and Category
    modal.height.textContent = `${(pokemon.height / 10).toFixed(1)} m`;
    const pokemonCategory = extraInformation.genera
        .filter(l => l.language.name === 'en');
    modal.category.textContent = pokemonCategory[0].genus.replace(" Pokémon", '');

    // Weight and Abilities
    modal.weight.textContent = `${(pokemon.weight / 10).toFixed(1)} kg`;
    modal.abilities.innerHTML = pokemon.abilities
        .map(a => `<div>${formatText(a.ability.name)}</div>`)
        .join("");
    
    // Pokémon Types
    modal.types.innerHTML = pokemon.types
        .map(t => `<span class = "type-badge ${t.type.name}">${formatText(t.type.name)}</span>`)
        .join("");

    // Show the Modal
    pokemonModal.show();
}

function toggleShiny()
{
    // Error Handling
    if( !currentPokemon)
        return;

    // Format Pokémon name
    const formattedName = formatName(currentPokemon);

    // Swap shiny state
    isShiny = !isShiny;

    // Swap shiny button and Pokémon sprite
    if( isShiny)
    {
        modalElements.shiny.src = "Menu Icons/Shiny (On).svg"
        modalElements.sprite.src = currentPokemon.sprites.other["official-artwork"].front_shiny;
        modalElements.sprite.alt = "Shiny " + formattedName;
    }

    else
    {
        modalElements.shiny.src = "Menu Icons/Shiny (Off).svg"
        modalElements.sprite.src = currentPokemon.sprites.other["official-artwork"].front_default;
        modalElements.sprite.alt = formattedName;
    }
}

// Load all Pokémon automatically
loadPokemon();