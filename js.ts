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
    console.log(res);
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
        let btn2 = document.createElement("button");
        let btn3 = document.createElement("button");
        let id = document.createElement("span");
        id.style.display = "none";
        id.innerHTML = res[index]._id;
        btn.innerHTML = "Show Full";
        btn2.innerHTML = "Edit";
        btn3.innerHTML = "Delete";
        btn.addEventListener("click", function(){display(this)});
        btn2.addEventListener("click", function(){editItem(this)});
        btn3.addEventListener("click", function(){deleteItem(this)});
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
            allergies.innerHTML = res[0].allergies;
        }

        subcontainer1.append(image);
        subcontainer2.append(name);
        subcontainer2.append(description);
        subcontainer2.append(allergies);
        subcontainer2.append(price);
        subcontainer2.append(btn);
        subcontainer2.append(btn2);
        subcontainer2.append(btn3);
        subcontainer2.append(id);
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

function newItem(obj: HTMLFormElement) {
    console.log(obj);
}
function editItem(obj: HTMLButtonElement) {
    let element = obj.parentElement;
    let edit = document.getElementById("edit");
    let preview = document.getElementById("previewItems");
    console.log(preview?.children[0]);
    
    console.log(edit![0]);
    console.log(element);
    edit![1].value = element![0];
    edit![2].value = element![3];
    edit![3].value = element![1];
    edit![4].value = element![3];
    preview!.children[0].innerHTML = element![0];
    preview!.children[1].innerHTML = element![3];
    preview!.children[2].innerHTML = element![1];
    preview!.children[3].innerHTML = element![3];
}

async function deleteItem(obj: HTMLButtonElement) {
    let element = obj.parentElement;
    
    let res = await fetch(url + "/managment/removeMenuItem", {
        method: 'DELETE',
        body: JSON.stringify({"id": element?.children[7].innerHTML}),
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(response => response.json())
    console.log(res);
    location.reload();
}

async function removeCall() {
}
