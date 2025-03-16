// TODO: clean sql to prevent injection
function CleanSQL(Input) {
    return Input
    
}


window.addEventListener('load', () => {
    document.getElementById('Login').addEventListener('click', () => {
        Login(document.getElementById("Username").value, document.getElementById("Password").value).then((loginResult) => {
            if (loginResult) {
                document.location.pathname = "/Account/account.html"
            } else {
                // TODO: Better alert for failed login when the login page is created
                alert ("Invalid Login")
            }
        })
    })
})


window.addEventListener('load', () => {
    document.getElementById('Register').addEventListener('click', () => {
        let Username = document.getElementById("Username").value
        let Password = document.getElementById("Password").value
        let ConfirmPassword = document.getElementById("ConfirmPassword").value

        if (Password !== ConfirmPassword) {
            // TODO: Better alert when register page is ready
            alert("Password doesn't match")
            return
        }

        Register(Username, Password).then((RegisterResult) => {
            if (RegisterResult) {
                // TODO: Replace to actual login page
                document.location.pathname = "/Login/login.html"
            } else {
                // TODO: Better alert for failed login when the login page is created
                alert ("Username is already taken")
            }
        })
    })
})


/**
 * Takes a Username and password for a new user and attempts to register their account.
 * Only Validates to ensure Username is not duplicated and valid
 * Validation for confirming password etc is to be done by caller
 * @param {String} Username 
 * @param {String} Password 
 */
async function Register(Username, Password) {
    Username = CleanSQL(Username)
    Password = CleanSQL(Password)


    const RegisterQuery = `INSERT INTO User VALUES Username = "${Username} Password = "${Password}";`
    executeDatabaseQuery(RegisterQuery).then((result) => {
        return result.success
    })
}

/**
 * Takes a username and password and attempts to log the user in with the provided details
 * @param {string} Username 
 * @param {string} Password 
 */
async function Login(Username, Password) {
    Username = CleanSQL(Username)
    Password = CleanSQL(Password)

    const LoginQuery = `SELECT Username FROM User WHERE Username = "${Username}" AND Password = "${Password}";`
    executeDatabaseQuery(LoginQuery).then((result) => {
        if (result.data.length > 0) {
            sessionStorage.setItem('LoggedInUser', Username)
            return true
        } else {
            return false
        }
    })
}

const DatabaseConnectionData = {
    url: 'https://phanisek01.webhosting1.eeecs.qub.ac.uk/dbConnector.php',
    hostname: "localhost",
    username: "phanisek01", // ! Enter own username
    password: "nDKM7BtMSYYxWc9F",// ! Enter own password
    database: "phanisek01", // ! Change to group DB when uploading
}

/**
 * Sends a SQL query to the database defined at the start of the file
 * @param {string} SQLQuery 
 * @returns Promise. Successful if SQL query succeeds, Rejects if there is error at any part of the request
 */
async function executeDatabaseQuery(SQLQuery) {
    let params = new URLSearchParams();
    params.append('hostname', DatabaseConnectionData.hostname);
    params.append('username', DatabaseConnectionData.username);
    params.append('password', DatabaseConnectionData.password);
    params.append('database', DatabaseConnectionData.database);
    params.append('query', SQLQuery);

    const DBPromise = new Promise((resolve, reject) => {
        try {
            let fetchPromise = fetch(DatabaseConnectionData.url, {
                method: 'POST',
                body: params
            }); 
    
            fetchPromise.then((result) => {
                result.json().then((jsonResult) => {
                    if (jsonResult.error) {
                        console.log(jsonResult.error.toString());
                        // Passes result directly to not complicate handling result
                        reject(jsonResult)
                    }
                    else if (jsonResult.data) {
                        // Passes result directly to not complicate handling result
                        resolve(jsonResult)
                    }
                    else {
                        if (jsonResult.affected_rows !== undefined) {
                            resolve({
                                success: jsonResult.success,
                                affected_rows: jsonResult.affected_rows
                            })
                        } else {   
                            resolve({
                                success: jsonResult.success,
                            })
                        }
                    }
                }) 
            }) 
        } catch (error) {
            console.error('Error parsing JSON:', error);
            reject({
                error: true,
                errorReason: error
            })
        }
    })

    return DBPromise
}