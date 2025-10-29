async function showInfo()
{
// Hide button to display facts
    document.getElementById("showInfo").style.display = "none";

// Show facts and "hide" button
    document.getElementById("catFacts").style.display = "block";
    document.getElementById("hideInfo").style.display = "block"; 

// First time only
    if( !catInfo)
    {
    // GET the information as JSON
        const response = await fetch('https://brianobruno.github.io/cats.json', { method: 'GET' });
        const result = await response.text();
        catInfo = JSON.parse(result);

    // Sort the facts in order
        catInfo.facts.sort((a, b) => a.factId - b.factId);

    // Display the facts
        const infoDisplay = document.getElementById("catFacts");

        for( const fact of catInfo.facts)
        {
            const li = document.createElement("li");
            li.textContent = fact.text;
            infoDisplay.appendChild(li);
            infoDisplay.appendChild(document.createElement("br"));
        }

    // Also show "Show Real Cat" Button
        document.getElementById("showReal").style.display = "block";   
    }
}

function hideInfo()
{
// Hide facts and "hide" button
    document.getElementById("catFacts").style.display = "none";
    document.getElementById("hideInfo").style.display = "none";

// Show button to display facts
    document.getElementById("showInfo").style.display = "block";
}

function showReal()
{
// Display the photo from the API and change description and alt text
    let displayedImage = document.getElementById("catImage");
    displayedImage.src = catInfo.catPhoto;
    displayedImage.alt = "An image of a real tabby cat."
    document.getElementById("imageDescription").innerHTML = "This is an image of a real cat!";

// Hide "Show Real Cat" button
    document.getElementById("showReal").style.display = "none";

// Show "Show Pixel Art" button
    document.getElementById("showDrawing").style.display = "block";
}

function showDrawing()
{
// Display the default photo and change description and alt text
    let displayedImage = document.getElementById("catImage");
    displayedImage.src = "CS Image.png";
    displayedImage.alt = "Cats drawn using pixel art.";
    document.getElementById("imageDescription").innerHTML = "This is a pixel art image of two cats!";

// Hide "Show Pixel Art" button
    document.getElementById("showDrawing").style.display = "none";

// Show "Show Real Cat" button
    document.getElementById("showReal").style.display = "block";
}

var catInfo = null;