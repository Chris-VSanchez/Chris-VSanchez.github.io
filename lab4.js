function createOrder()
{
// Check if order is successful:
    let orderSuccessful = false;

// Get the user's name:
    let userName;
    userName = window.prompt("Please enter your name: ", userName);

// Get the user's time:
    let currentDate = new Date();
    let currentTime = currentDate.getHours();

// Get the user's selection:
    let itemNumber;
    itemNumber = window.prompt("Select the item you would like to purchase! \nPlease select an entry between 1 and 3:");

    // Input Validation:
    if( itemNumber === null || !itemNumber.trim())
            window.alert("Order cancelled.");

    else
    {
        itemNumber = Number(itemNumber);

        while( itemNumber < 1 || 3 < itemNumber || isNaN(itemNumber))
        {
            itemNumber = window.prompt("Invalid entry received! \nPlease select an entry between 1 and 3:");

            if( itemNumber === null || !itemNumber.trim())
                {
                    window.alert("Order cancelled.");
                    break;
                }

            itemNumber = Number(itemNumber);
        }
    }

// Get the user's quantity:
    let itemQuantity;
    if( itemNumber)
        itemQuantity = window.prompt("Select the quantity you would like to purchase! \nPlease select an entry between 1 and 99:");

    else
    {
        itemQuantity = null;
        displayOrder(userName, currentTime, itemNumber, itemQuantity, orderSuccessful);
        return;
    }

    // Input Validation:
    if( itemQuantity === null || !itemQuantity.trim())
        window.alert("Order cancelled.");

    else
    {
        itemQuantity = Number(itemQuantity);

        while( itemQuantity < 1 || 99 < itemQuantity || isNaN(itemQuantity))
        {
            itemQuantity = window.prompt("Invalid entry received! \nPlease select an entry between 1 and 99:");

            if( itemQuantity === null || !itemQuantity.trim())
                {
                    window.alert("Order cancelled.");
                    break;
                }

            itemQuantity = Number(itemQuantity);
        }

        orderSuccessful = true;
    }

// Display the user's name and order with the right time:
    displayOrder(userName, currentTime, itemNumber, itemQuantity, orderSuccessful);
}

function displayOrder(userName, currentTime, itemNumber, itemQuantity, orderSuccessful)
{
// Message to display to the user:
    let message;

// Determine the user's time of day:
    if( currentTime < 12)
        message = "Good morning";

    else if( currentTime < 18)
        message = "Good afternoon";

    else
        message = "Good evening";

// Formatting for if the user has or has not entered a name:
    if( !userName || !userName.trim())
        message += "!";

    else
        message += (", " + userName + "!");

// Determine if order was succesful:
    if( !orderSuccessful)
    {
        message += (" You did not successfully place an order. Click the \"Place Order\" button to try again.");
        document.getElementById("Order Confirmation").innerHTML = message;
    }

    else
    {
        // Display the item quantity:
        message += (" Your order of " + itemQuantity + " ")
        
        // Display the ordered item:
        if( itemNumber == 1)
            message += "Dog Biscuits (10 pack)";

        else if( itemNumber == 2)
            message += "Plush Squeaky Toy(s)";

        else
            message += "Personalized Pet Collar(s)";

        message += " has been placed!"

        // Set expected arrival date:
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 7);
        message += (" You should expect to receive your delivery on: " + deliveryDate.toDateString());

        // Display order information:
        document.getElementById("Order Confirmation").innerHTML = message;
    }
}

window.alert("Welcome to Chris' Dog Supplies!");