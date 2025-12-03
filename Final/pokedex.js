// Get the area where the Pokédex is displayed
const pokedex = document.getElementById("pokedex");

// Store all Pokémon data
const pokemonData = {};
const pokemonExtraData = {};

// Current Pokémon and Forms (if Any) in focus
let currentPokemon;
let isShiny = false;

// All Regions and Pokédex Ranges
const regionRanges = 
{
    national: [1 , 1025],
    kanto: [1 , 151],
    johto: [152 , 251],
    hoenn: [252 , 386],
    sinnoh: [387 , 493],
    unova: [494 , 649],
    kalos: [650 , 721],
    alola: [722 , 809],
    galar_hisui: [810 , 905],
    paldea: [906 , 1025]
}

// Corrected Pokémon names
const correctedNames =
{
    29: "Nidoran♀",
    32: "Nidoran♂",
    83: "Farfetch'd",
    122: "Mr. Mime",
    250: "Ho-Oh",
    386: "Deoxys",
    413: "Wormadam",
    439: "Mime Jr.",
    474: "Porygon-Z",
    487: "Giratina",
    492: "Shaymin",
    550: "Basculin",
    555: "Darmanitan",
    641: "Tornadus",
    642: "Thundurus",
    645: "Landorus",
    647: "Keldeo",
    648: "Meloetta",
    669: "Flabébé",
    678: "Meowstic",
    681: "Aegislash",
    710: "Pumpkaboo",
    711: "Gourgeist",
    718: "Zygarde",
    741: "Oricorio",
    745: "Lycanroc",
    746: "Wishiwashi",
    772: "Type: Null",
    774: "Minior",
    778: "Mimikyu",
    782: "Jangmo-o",
    783: "Hakamo-o",
    784: "Kommo-o",
    849: "Toxtricity",
    865: "Sirfetch'd",
    866: "Mr. Rime",
    875: "Eiscue",
    876: "Indeedee",
    877: "Morpeko",
    892: "Urshifu",
    902: "Basculegion",
    905: "Enamorus",
    916: "Oinkologne",
    925: "Maushold",
    931: "Squawkabilly",
    964: "Palafin",
    978: "Tatsugiri",
    982: "Dudunsparce",
    1001: "Wo-Chien",
    1002: "Chien-Pao",
    1003: "Ting-Lu",
    1004: "Chi-Yu"
};

// Instantiate the modal
const pokemonModal = new bootstrap.Modal(document.getElementById("pokemonModal"), { focus: false });

// Store all modal elements (to avoid repeat DOM requests)
const modalElements = 
{
    name: document.getElementById("pokemonName"),
    dropdown: document.getElementById("formDropdown"),
    previousBtn: document.getElementById("buttonPrevious"),
    previousPkmn: document.getElementById("previousPokemon"),
    nextBtn: document.getElementById("buttonNext"),
    nextPkmn: document.getElementById("nextPokemon"),
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

// Format Text for Searching
function normalizeText(text)
{
    return text
        .toLowerCase()
        .replace(/♀/g, "f")
        .replace(/♂/g, "m")
        .replace(/[\s\.\-\'']/g, "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

// Load the data for all Pokémon
async function loadPokemon() 
{
    // Can be changed for any amount of desired entries
    const limit = 1025;

    // Amount of requests per batch
    const batchSize = 50;

//Create a "card" for every Pokémon

    // For every batch
    for( let start = 1; start <= limit; start += batchSize)
    {
        // Make a batch
        const batch = [];

        // Fetch the data for every Pokémon in the batch
        for( let pokemonId = start; pokemonId < start + batchSize && pokemonId <= limit; pokemonId++)
        {
            batch.push
            (
                fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/`)
                    .then( result => result.ok ? result.json() : null)
                    .catch(() => null)
            );
        }
        
        // Wait for the batch to finish
        const pokemonList = await Promise.all(batch);

        // Store every Pokémon from the batch and create a "card" for it
        pokemonList.forEach((pokemon, index) =>
        {
            if( pokemon)
            {
                const pokemonId = start + index;
                pokemonData[pokemonId] = pokemon;
                createPokemonCard(pokemon);
            }
        });
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

// Update the previous and next Entries
function updateAdjacentEntries(pokemonId)
{
    // Get the adjacent IDs (with wrap-around)
    const previousId = pokemonId === 1 ? 1025 : pokemonId - 1 ;
    const nextId = pokemonId === 1025 ? 1 : pokemonId + 1;

    // Get the adjacent Pokémon
    const previousPokemon = pokemonData[previousId];
    const nextPokemon = pokemonData[nextId];

    // Update the header
    modalElements.previousPkmn.innerHTML = 
        `<span class = "pokemon-id">#${previousId.toString().padStart(4, "0")}</span>
        <span class = "pokemon-name">${formatName(previousPokemon)}</span>`;

    modalElements.nextPkmn.innerHTML = 
        `<span class = "pokemon-name">${formatName(nextPokemon)}</span>
        <span class = "pokemon-id">#${nextId.toString().padStart(4, "0")}</span>`;

    // Add onClick behavior
    modalElements.previousBtn.onclick = () => createPokemonModal(previousId);
    modalElements.nextBtn.onclick = () => createPokemonModal(nextId);
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

    // Adjacent Entries
    updateAdjacentEntries(pokemon.id);

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
    
    // Special case for Pikachu
    if( pokemonId === 25)
    {
        forms = forms.filter(formId => 
            {
                const form = pokemonData[formId].name;
                return form === "pikachu" || form === "pikachu-gmax";
            });
    }

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

// Display a desired region's Pokédex
function regionFilter(region)
{
    // Get the range for the desired region
    const range = regionRanges[region]
    if( !range)
        return;

    const [start, end] = range;

    // Display all Pokémon from that Region
    const cards = document.querySelectorAll(".pokemon-card");
    cards.forEach(card =>
    {
        const pokemonId = Number(card.dataset.id);
        card.style.display = (start <= pokemonId && pokemonId <= end) ? "block" : "none";
    });

    // Update Region Displayed on Dropdown
    document.getElementById("regionDropdown").textContent = 
    region === "galar_hisui" ? "Galar / Hisui Pokédex" : `${formatText(region)} Pokédex`;
}

// Pokémon Search Bar
function searchPokemon(input)
{
    // Check if the search bar is empty
    if( !input)
    {
        window.alert("Please enter a value.");
        return;
    }

    let formattedInput = normalizeText(input);

    // If the input is a number
    if( !isNaN(formattedInput))
    {
        const pokemonId = Number(formattedInput);

        if( pokemonData[pokemonId])
            createPokemonModal(pokemonId);

        else
            window.alert("No such ID exists.");

        return;
    }

    // Special case for both Nidoran M and F
    if( formattedInput === "nidoran")
    {
        window.alert("Specify Nidoran M or F.");
        return;
    }

    // If the input is a name
    const pokemonId = Object.keys(pokemonData).find( id => normalizeText(pokemonData[id].name) === formattedInput );

    if( pokemonId)
        createPokemonModal(Number(pokemonId))

    else
        window.alert("No such Pokémon exists.")

    return;
}

// Load all Pokémon automatically
loadPokemon();