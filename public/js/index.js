var socket = io();

let messages = document.querySelector("#messages");
let form = document.querySelector("#form");
let input = document.querySelector("#input");

let modal = document.querySelector("#modal-container");
let userForm = document.querySelector("#user-form");
let nicknameInput = document.querySelector("#nickname-input");

let LoggedAs;

let userList = [];
let messageList = [];

let tip = document.querySelector(".tip");
let tipMessage = document.querySelector(".tip p");
let typingTimer = 0;

let onlineUsersButton = document.querySelector("#online-users-btn");

let onlineUsersModal = document.querySelector("#online-users-modal");
let onlineUsersUlModal = document.querySelector("#online-users-modal ul");

form.addEventListener('submit', (event) => {
    event.preventDefault();
    if(input.value) {
        socket.emit("chat message", {author: LoggedAs, msg: input.value});

        const d = new Date();
        addNewLineOnChat({author: LoggedAs, msg: input.value, createdAt: d});
        
        input.value = '';
    }
});

userForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if(nicknameInput.value) {
        if(LoggedAs){
            socket.disconnect();
            socket.connect();
        }

        socket.emit("new nickname", nicknameInput.value);
        LoggedAs = nicknameInput.value;
        nicknameInput.value = '';
        renderOnlineUsers();
    }
});


input.addEventListener('keyup', () => {
    socket.emit("user is typing");
});

onlineUsersButton.addEventListener("click", (event) => {
    onlineUsersModal.hidden = !onlineUsersModal.hidden;
});

socket.on("chat message", (data) => {
    addNewLineOnChat(data);
});

socket.on("chat event", (data) => {
    addNewLineOnChat(data);
})

socket.on("message list", (data) => {
    messageList = data.messageList;
    renderMessageList();
});

socket.on("user is typing", (data) => {
    handleTip(`${data.nickname} is typing...`);
});

socket.on("update userList", (data) => {
    updateUserList(data);
    renderOnlineUsers();
});

function renderMessageList() {
    messages.innerHTML = "";
    messageList.map(message => {
        addNewLineOnChat(message);
    });
}

function addNewLineOnChat(content) {
    let item = document.createElement('li');
    const d = new Date(content.createdAt);
    const month = d.getMonth();
    const day = d.getDate();
    const h = d.getHours();
    const m = d.getMinutes();

    const now = `${h}:${m}`;
    
    item.textContent = content.author ? `${content.author}: ${content.msg} - ${now}` : `Mensagem "${content.msg}" Não enviada - ${now}`;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
}

function updateUserList(users) {
    userList = [];
    users.map(user => {
        userList.push(user.nickname);
    });
}

function setTipMessage(message) {
    tipMessage.innerHTML = "";
    tipMessage.innerHTML = message;
}

async function handleTip(message) {
    clearTimeout(typingTimer);

    setTipMessage(message);

    startTipAnimation();

    typingTimer = setTimeout(() => {
        endTipAnimation();
    }, 1000);
}

function startTipAnimation() {
    if(tip.classList.contains("end-animation")){
        tip.classList.remove("end-animation");
    }
    tip.hidden = false;
    tip.classList.add("start-animation");
}

function endTipAnimation() {
    if(tip.classList.contains("start-animation")) {
        tip.classList.remove("start-animation");
    }
    tip.classList.add("end-animation");
    setTimeout(() => {
        tip.hidden = true;
    }, 200);
}

function renderOnlineUsers() {
    onlineUsersUlModal.innerHTML = "";
    let liElement;

    userList.map((userName) => {
        liElement = document.createElement('li');
        liElement.textContent = userName;
        onlineUsersUlModal.appendChild(liElement);
    });
}