function validateForm(event)
{
// Prevent page refresh
    event.preventDefault();

// Get form and form entries
    let form = document.getElementById("signupForm");
    let firstName = document.getElementById("firstName");
    let lastName = document.getElementById("lastName");
    let email = document.getElementById("email");
    let password = document.getElementById("password");
    let dateOfBirth = document.getElementById("dateOfBirth");
    let result = document.getElementById("formResult");

// Create a user using form entries
    let user = {
    firstName: firstName.value.trim(),
    lastName: lastName.value.trim(),
    email: email.value.trim(),
    password: password.value.trim(),
    dateOfBirth: dateOfBirth.value
    };

// Assume the form has been filled
    let valid = { isValid:true };

// Validate every entry
    if( !user.firstName)
        invalidate(firstName, valid);
    else
        validate(firstName);

    if( !user.lastName)
        invalidate(lastName, valid);
    else
        validate(lastName);

    if( !user.email || !user.email.includes("@"))
        invalidate(email, valid);
    else
        validate(email);

    if( !user.password || !hasSpecialCharacters(user.password))
        invalidate(password, valid);
    else
        validate(password);

    if( !user.dateOfBirth)
        invalidate(dateOfBirth, valid);
    else
        validate(dateOfBirth);

// Validate the form
    if( !valid.isValid)   
        {
        // Display unsuccessful text
            result.innerHTML = `
        <div class = "text-center mt-2 text-danger">
            Please correct the highlighted fields and try again.
        </div>`;
            
            return false;
        }

    else
    {       
    // Display successful text
        result.innerHTML = `
        <div class = "text-center mt-2 text-success">
            Signup successful!
        </div>`;

    // Add modal with user info
        let modalSuccess = new bootstrap.Modal(document.getElementById("modalSuccess"));
        
        let infoDisplay = document.getElementById("infoDisplay");
        let hiddenPassword = "*".repeat(user.password.length);
        
        infoDisplay.innerHTML = `
        First Name: ${user.firstName}<br>
        Last Name: ${user.lastName}<br>
        Email Address: ${user.email}<br>
        Password: ${hiddenPassword}<br>
        Date of Birth ${user.dateOfBirth}`;
        modalSuccess.show();

        return true;
    }
}


// Form validation helper functions
function validate(field)
{
    field.classList.add("is-valid");
    field.classList.remove("is-invalid");
}

function invalidate(field, validity)
{
    field.classList.add("is-invalid");
    field.classList.remove("is-valid");
    validity.isValid = false;
}

function hasSpecialCharacters(str)
{
    return /[^a-zA-Z0-9]/.test(str);
}

// Toggle password visibility
function toggleVisibility()
{
    let password = document.getElementById("password");
    let icon = document.getElementById("eyeIcon");

    if( password.type === "password")
    {
        password.type = "text";
        icon.classList.add("bi-eye-slash");
        icon.classList.remove("bi-eye");
        icon.style.color = "dodgerblue";
    }

    else
    {
        password.type = "password";
        icon.classList.add("bi-eye");
        icon.classList.remove("bi-eye-slash");
        icon.style.color = "grey";
    }

    password.focus();
}