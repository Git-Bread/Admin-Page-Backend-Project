//local url
let url = "http://127.0.0.1:3000";
let authed = false;


//making sure its all loaded before running
window.onload = async function() {
    await checkLogin();
    if (document.getElementById("login")) {
        let logBtn = document.getElementById("logBtn");
        if (logBtn != null) {
            logBtn?.addEventListener("click", () => log());   
        }   
    }
    if (authed && !document.getElementById("index")) {
        location.href = "index.html"
    }
    else if(!authed && !document.getElementById("login")) {
        location.href = "login.html"
    }
}

//log in handler
async function log() {
    let obj = {
        "username": (<HTMLInputElement>document.getElementById("username")).value,
        "password": (<HTMLInputElement>document.getElementById("password")).value
    }
    //sends object with info
    let res = await fetch(url + "/managment/adminLoginPage", {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json())
    //error handling
    if (res.error) {
        errLog(res);
        return;
    }
    else {
        localStorage.setItem("token", res.token);
         location.href = "index.html"
    }
}


//error manager that shoves all errors into an div which will then display the errors
function errLog(objArr: any) {
    let container = document.getElementById("error");
    clearErr();
    let element = document.createElement("p");
    element.innerHTML = objArr.error;
    container?.append(element);     
}

//clears errors
function clearErr() {
    let container = document.getElementById("error");
    while (container?.children[0]) {
        container?.removeChild(container.lastChild as HTMLElement);
    }
}

//Checks login status
async function checkLogin() {
    let val = localStorage.getItem("token");
    if (val != "") {
        let res = await fetch(url + "/management/adminCheck", {
            method: 'POST',
            body: null,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + val as string
            }
        }).then(response => response.json())
        console.log(res);
        //if logged in
        if (res) {
            authed = true;
            return;
        }
        //otherwise remove "old" token
        else {
            console.log("ran");
            localStorage.removeItem("token");
        }
    }
}