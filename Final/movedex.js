// Get the area where the moves are displayed
const movedex = document.getElementById("movedex");

// Store all move data
const moveData = {};

// Format Hyphenated Text
function formatText(text) 
{
    // Split every word by hyphen, capitalize every word, and join them by spaces
    return text
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Format Text for Searching
function normalizeText(text)
{
    return text
        .toLowerCase()
        .replace(/[\s\.\-\'']/g, "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

// Load the data for all moves
async function loadMoves()
{
    // Can be changed for any amount of desired entries
    const limit = 919;

    // Amount of requests per batch
    const batchSize = 50;

// Create an entry for every move
    
    // For every batch
    for( let start = 1; start <= limit; start += batchSize)
    {
        // Make a batch
        const batch = [];

        // Fetch the data for every move in the batch
        for( let moveId = start; moveId < start + batchSize && moveId <= limit; moveId++)
        {
            batch.push
            (
                fetch(`https://pokeapi.co/api/v2/move/${moveId}/`)
                    .then( result => result.ok ? result.json() : null)
                    .catch(() => null)
            );
        }
        
        // Wait for the batch to finish
        const moves = await Promise.all(batch);

        // Store every move from the batch and create an entry for it
        moves.forEach((move, index) => 
        {
            if( move)
            {
                const moveId = start + index;
                moveData[moveId] = move;
                createMoveEntry(move);
            }
        });
    }
}

function createMoveEntry(move)
{
    // Create <button class = "move-entry"></button>
    const entry = document.createElement("button");
    entry.classList.add("move-entry");
    
    // Give every entry its own Id
    entry.dataset.id = move.id;

    const name = formatText(move.name);
    const type = move.type.name;
    const damage_class = move.damage_class.name;
    const power = move.power ?? 0;
    const pp = move.pp

    // Create the layout for every entry
    entry.innerHTML = 
    `   <div class = "left-side">
            <span class = "move-name">${name}</span>
        </div>

        <div class = "right-side">

            <div class = "move-images">
                <img class = "type-image" src = "Pokemon Move Icons/${type}.svg" alt = "${formatText(type)}">
                <img class = "damage-image" src = "Pokemon Move Icons/${damage_class} move.png" alt = "${formatText(damage_class)} Move">
            </div>
        
            <div class = "move-stat">
                <span class = "move-information">Power:</span>
                <span class = "move-value">${power}</span>
            </div>

            <div class = "move-stat">
                <span class = "move-information">PP:</span>
                <span class = "move-value">${pp}</span>
            </div> 

        </div> `;

    // Add every entry to the list
    movedex.appendChild(entry);
}

// Movedex Search Bar
function searchMoves(input)
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
        const moveId = Number(formattedInput);

        if( moveData[moveId])
        {
            const entry = document.querySelector(`.move-entry[data-id="${moveId}"]`);

            if( entry) 
            {
                entry.scrollIntoView({ behavior: "smooth", block: "center" });
                flashEntry(entry);
            }
        }

        else
            window.alert("No such ID exists.");

        return;
    }

    // If the input is a name
    const moveId = Object.keys(moveData).find( id => normalizeText(moveData[id].name) === formattedInput );

    if( moveId)
    {
        const entry = document.querySelector(`.move-entry[data-id="${moveId}"]`);

            if( entry) 
            {
                entry.scrollIntoView({ behavior: "smooth", block: "center" });
                flashEntry(entry);
            }
    }

    else
        window.alert("No such move exists.")

    return;
}

function flashEntry(entry) 
{
    entry.classList.remove("flash");

    // Highlight an entry after the scrolling finishes
    setTimeout(() => { entry.classList.add("flash"); } , 300);
}   

loadMoves();