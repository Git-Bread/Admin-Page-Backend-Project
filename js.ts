//local url
let url = "http://127.0.0.1:3000";

//authentication check
let authed = false;

//holds last id for editing purpose, since it dosent move the id to a new element
let lastId= "";


//making sure its all loaded before running, startup script
window.onload = async function() {
    await checkLogin();

    //if login page
    if (document.getElementById("login")) {
        let logBtn = document.getElementById("logBtn");
        if (logBtn != null) {
            logBtn?.addEventListener("click", () => log());   
        }   
    }

    //if logged in default to admin page
    if (authed && !document.getElementById("index")) {
        location.href = "index.html"
    }

    //if not shove to login
    else if(!authed && !document.getElementById("login")) {
        location.href = "login.html"
    }

    //only populate if authed
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
    //sends login object with info
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

    //localstorage for persistent login
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

        //sends auth token in header
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

//generate all objects
async function populate() {
    //get
    let res = await fetch(url + "/menuItems", {
        method: 'GET',
        body: null,
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(response => response.json())

    //create all objects
    let itemList = document.getElementById("menuItems");
    for (let index = 0; index < res.length; index++) {

        let container = document.createElement("div");
        let subcontainer2 = document.createElement("div");
        let name = document.createElement("h4");
        let price = document.createElement("p");
        let description = document.createElement("p");
        let allergies = document.createElement("p")
        let btn = document.createElement("button");
        let btn2 = document.createElement("button");
        let btn3 = document.createElement("button");
        let id = document.createElement("span");

        id.style.display = "none";
        id.innerHTML = res[index]._id;
        btn.innerHTML = "Show Full";
        btn2.innerHTML = "Edit";
        btn3.innerHTML = "Delete";

        //event listeners for functionality
        btn.addEventListener("click", function(){display(this)});
        btn2.addEventListener("click", function(){editItem(this)});
        btn3.addEventListener("click", function(){deleteItem(this)});

        name.innerHTML = res[index].name;
        description.innerHTML = res[index].description;
        price.innerHTML = "Price: " + res[index].price + " (EUR)";

        //allows no input to be valid input
        if (res[index].allergies != "no allergies") {
            allergies.innerHTML = "Allergies: ";
            for (let yndex = 0; yndex < res[index].allergies.length; yndex++) {
                allergies.innerHTML += res[index].allergies[yndex];
            }
        }
        else {
            allergies.innerHTML = "Allergies: " + res[0].allergies;
        }

        //the append of all appends
        subcontainer2.append(name);
        subcontainer2.append(description);
        subcontainer2.append(allergies);
        subcontainer2.append(price);
        subcontainer2.append(btn);
        subcontainer2.append(btn2);
        subcontainer2.append(btn3);
        subcontainer2.append(id);
        container.append(subcontainer2);
        itemList?.append(container);
    }
}

//preview functtionality
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

//push new item to database
async function newItem(form: HTMLFormElement) {
    let allergies: String;
    allergies = "no allergies";
    if (form?.getElementsByTagName("input")[2].value != "") {
        allergies = form?.getElementsByTagName("input")[2].value;
    }

    let newItem = ({
        name: form?.getElementsByTagName("input")[0].value,
        description: form?.getElementsByTagName("textarea")[0].value,
        price: form?.getElementsByTagName("input")[1].value,
        allergies: allergies
    });  

    let res = await fetch(url + "/managment/addMenuItem", {
        method: 'POST',
        body: JSON.stringify(newItem),
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(response => response.json())
    
    if (res.error) {
        errLog(res);
        return;
    }
    location.reload();
}

//edit item in the editor
function editItem(obj: HTMLButtonElement) {

    let element = obj.parentElement;
    let edit = document.getElementById("edit");
    let preview = document.getElementById("previewItems");
    console.log(preview?.children[0]);

    //gets all the stuff from a menu item and pastes to edit and preview 
    edit![0].value = element!.children[0].innerHTML;
    edit![1].value = element!.children[3].innerHTML.replace(/[^0-9]/g, '');
    edit![2].value = element!.children[2].innerHTML.slice(11);
    edit![3].value = element!.children[1].innerHTML;
    preview!.children[0].innerHTML = element!.children[0].innerHTML;
    preview!.children[1].innerHTML = element!.children[2].innerHTML;
    preview!.children[2].innerHTML = element!.children[3].innerHTML;
    preview!.children[3].innerHTML = element!.children[1].innerHTML;

    //gets id to send to database
    lastId = element!.getElementsByTagName("span")[0].innerHTML;

    let create = document.getElementById('create')
    let check: HTMLInputElement;
    check = document.getElementById("modeCheck") as HTMLInputElement;
    check.checked = true;
    create!.style.display = 'none'
    edit!.style.display = 'block'

    //event listeners for live update to preview
    edit![0].addEventListener("change", () => {
        preview!.children[0].innerHTML = edit![0].value;
    });
    edit![1].addEventListener("change", () => {
        preview!.children[2].innerHTML = "Price: " + edit![1].value + " (EUR)";
    });
    edit![2].addEventListener("change", () => {
        preview!.children[1].innerHTML = edit![2].value;
    });
    edit![3].addEventListener("change", () => {
        preview!.children[3].innerHTML = edit![3].value;
    });
}

//sends object id to delete it
async function deleteItem(obj: HTMLButtonElement) {
    let element = obj.parentElement;
    
    let res = await fetch(url + "/managment/removeMenuItem", {
        method: 'DELETE',
        body: JSON.stringify({"id": element?.children[7].innerHTML}),
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(response => response.json())

    if (res.error) {
        errLog(res);
        return;
    }

    console.log(res);
    location.reload();
}

//sends id and new values to update item
async function updateItem(form: HTMLFormElement) {
    let allergies: String;
    allergies = "no allergies";
    if (form?.getElementsByTagName("input")[2].value != "") {
        allergies = form?.getElementsByTagName("input")[2].value;
    }
    let newItem = ({
        name: form?.getElementsByTagName("input")[0].value,
        description: form?.getElementsByTagName("textarea")[0].value,
        price: form?.getElementsByTagName("input")[1].value,
        allergies: allergies,
        id: lastId
    });  

    let res = await fetch(url + "/managment/editMenuItem", {
        method: 'PUT',
        body: JSON.stringify(newItem),
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(response => response.json())

    if (res.error) {
        errLog(res);
        return;
    }
    location.reload();
}
