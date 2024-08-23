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
    if (authed) {
        await populate();
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

async function populate() {
    let res = await fetch(url + "/menuItems", {
        method: 'GET',
        body: null,
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(response => response.json())
    console.log(res[0].allergies);
    let itemList = document.getElementById("menuItems");
    for (let index = 0; index < res.length; index++) {
        let container = document.createElement("div");
        let subcontainer1 = document.createElement("div");
        let subcontainer2 = document.createElement("div");
        let name = document.createElement("h4");
        let price = document.createElement("p");
        let description = document.createElement("p");
        let allergies = document.createElement("p")
        let image = document.createElement("img");
        let btn = document.createElement("button");
        btn.innerHTML = "Show Full";
        btn.addEventListener("click", function(){display(this)});
        if (res[index].image != "no image")  {
            image.innerHTML = res[index].image;
        }
        else {
            let image = document.createElement("p");
            image.innerHTML = res[index].image;
        }
        name.innerHTML = res[index].name;
        description.innerHTML = res[index].description;
        price.innerHTML = res[index].price;
        if (res[index].allergies != "no allergies") {
            for (let index = 0; index < res[index].allergies.length; index++) {
                allergies.innerHTML += res[index].allergies;
            }
        }
        else {
            allergies.innerHTML = res[0].allergies
        }

        subcontainer1.append(image);
        subcontainer2.append(name);
        subcontainer2.append(description);
        subcontainer2.append(allergies);
        subcontainer2.append(price);
        subcontainer2.append(btn);
        container.append(subcontainer1);
        container.append(subcontainer2);
        itemList?.append(container);
    }
}

function display(obj: HTMLElement): any {
    let element = obj.parentElement?.parentElement;
    let copy = element?.cloneNode(true);
    let preview = document.getElementById("preview");
    while(preview?.children[0]) {
        preview?.removeChild(preview.lastChild as HTMLElement);
    }
    preview?.append(copy!);
    return;
}

