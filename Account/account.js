document.getElementById("ChangePassword").addEventListener("click", () => {
    document.location.pathname = "/Account/ChangePassword/changepassword.html"
})

document.getElementById("Username").textContent = sessionStorage.getItem("LoggedInUser")

document.getElementById("ReturnHome").addEventListener("click", () => {
    document.location.pathname = "/WEBSITE/menu.html"
})