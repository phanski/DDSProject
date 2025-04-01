document.getElementById("ChangePassword").addEventListener("click", () => {
    document.location.pathname = "/Account/ChangePassword/changepassword.html"
})

document.getElementById("StartRun").addEventListener("click", () => {
    sessionStorage.setItem("GameState", JSON.stringify({
        energy: 100,
        time: 0,
        userName: sessionStorage.getItem('LoggedInUser'), 
        roomID: 5,
        inventory: []
    }))
    window.location.pathname = "/Game/Room5/room.html"
})


document.getElementById("Username").textContent = sessionStorage.getItem("LoggedInUser")

document.getElementById("ReturnHome").addEventListener("click", () => {
    document.location.pathname = "/WEBSITE/menu.html"
})