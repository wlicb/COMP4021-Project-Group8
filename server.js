const express = require("express");

const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");
const { json } = require("express");

const onlineUsers = {};

const typingUsers = [];


// Create the Express app
const app = express();

//
// ***** Please insert your Lab 6 code here *****
//
const { createServer } = require("http");
const { Server } = require("socket.io");
const { clear } = require("console");
const httpServer = createServer(app);
const io = new Server(httpServer);

io.use((socket, next) => {
    chatSession(socket.request, {}, next);
});

// Use the 'public' folder to serve static files
app.use(express.static("public"));

// Use the json middleware to parse JSON data
app.use(express.json());

// Use the session middleware to maintain sessions
const chatSession = session({
    secret: "game",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 300000 }
});
app.use(chatSession);

// This helper function checks whether the text only contains word characters
function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

// Handle the /register endpoint
app.post("/register", (req, res) => {
    // Get the JSON data from the body
    const { username, avatar, name, password } = req.body;

    //
    // D. Reading the users.json file
    //
    let users = JSON.parse(fs.readFileSync("./data/users.json"));
    // console.log(users);
    //
    // E. Checking for the user data correctness
    //
    if (username == "") {
        res.json({ error: "Please enter username"});
        return;
    } else if (avatar == "") {
        res.json({ error: "Please enter avatar"});
        return;
    } else if (name == "") {
        res.json({ error: "Please enter name"});
        return;
    } else if (password == "") {
        res.json({ error: "Please enter password"});
        return;
    } else if (!containWordCharsOnly(username)) {
        res.json({ error: "Invalid username"});
        return;
    } else if (username in users) {
        res.json({ error: "Username has already been used"});
        return;
    }
    //
    // G. Adding the new user account
    //
    const hash = bcrypt.hashSync(password, 10);
    users[username] = { avatar : avatar, name : name, password : hash };

    //
    // H. Saving the users.json file
    //
    fs.writeFileSync("./data/users.json", JSON.stringify(users, null, " "));
    //
    // I. Sending a success response to the browser
    //
    res.json({ status: "success" });

});

// Handle the /signin endpoint
app.post("/signin", (req, res) => {
    // Get the JSON data from the body
    const { username, password } = req.body;

    //
    // D. Reading the users.json file
    //
    const users = JSON.parse(fs.readFileSync("./data/users.json"));
    //
    // E. Checking for username/password
    //
    //
    // G. Sending a success response with the user account
    //
 
    if (username in users) {
        const hashedPassword = users[username].password;
        if (!bcrypt.compareSync(password, hashedPassword)) {
            /* Passwords are not the same */
            res.json({ error: "Incorrect username/password."});
            return;
        } else {
            const avatar = users[username].avatar;
            const name = users[username].name;
            req.session.user = { username, avatar, name };
            res.json({ status: "success",
                        user: { username, avatar, name }});
            return;
        }
    } else {
        res.json({ error: "Incorrect username/password."});
        return;
    }
});

// Handle the /validate endpoint
app.get("/validate", (req, res) => {

    //
    // B. Getting req.session.user
    //
    const currentUser = req.session.user;
    //
    // D. Sending a success response with the user account
    //
    if (currentUser) {
        const username = currentUser.username;
        const avatar = currentUser.avatar;
        const name = currentUser.name;
        res.json({status: "success", user: {username, avatar, name}});
        return;
    } else {
        res.json({status: "error", error: "session out"});
        return;
    }
});

// Handle the /signout endpoint
app.get("/signout", (req, res) => {

    //
    // Deleting req.session.user
    //
    req.session.destroy();
    //
    // Sending a success response
    //
    res.json({status: "success"});
});


app.post("/newRoom", (req, res) => {
    const room = req.body;
    const rooms = JSON.parse(fs.readFileSync("./data/rooms.json"));

    for (const r of rooms) {
        if (r.name == room.name) {
            res.json({status: "error", 
                error: "Room name has been used."});
            return;
        }
    }
    // console.log(rooms);
    rooms.push(room);
    fs.writeFileSync("./data/rooms.json", JSON.stringify(rooms, null, " "));
    // console.log(rooms);
    io.emit("show room", rooms);
    res.json({status: "success", rooms: rooms});

});


app.post("/leaveRoom", (req, res) => {
    const room = req.body.room;
    const user = req.body.user;
    const rooms = JSON.parse(fs.readFileSync("./data/rooms.json"));

    for (const r of rooms) {
        if (r.name == room.name) {
            if (r.user1 == user)
                r.user1 = "-";
            else if (r.user2 == user)
                r.user2 = "-";
            else {
                res.json({status: "error", 
                    error: "You are not in this room!"});
                // console.log(r);
                return;
            }
        }
        if ((r.user1 == "-") && (r.user2 == "-")) {
            rooms.splice(rooms.indexOf(r), 1);
        }
    }
    fs.writeFileSync("./data/rooms.json", JSON.stringify(rooms, null, " "));
    io.emit("show room", rooms);
    res.json({status: "success", rooms: rooms});
});

app.post("/joinRoom", (req, res) => {
    const room = req.body.room;
    const user = req.body.user;
    const rooms = JSON.parse(fs.readFileSync("./data/rooms.json"));

    for (const r of rooms) {
        if (r.name == room.name) {
            if ((r.user1 == user) || (r.user2 == user)) {
                res.json({status: "error", 
                    error: "You are already in this room!"});
            }
            if (r.user1 == "-")
                r.user1 = user;
            else if (r.user2 == "-")
                r.user2 = user;
            else {
                res.json({status: "error", 
                    error: "Room is Full!"});
                // console.log(r);
                return;
            }
        }
    }
    fs.writeFileSync("./data/rooms.json", JSON.stringify(rooms, null, " "));
    io.emit("show room", rooms);
    res.json({status: "success", rooms: rooms});
});



io.on("connection", (socket) => {
    if (socket.request.session.user) {
        onlineUsers[socket.request.session.user.username] = { avatar: socket.request.session.user.avatar, 
        name: socket.request.session.user.name };
        io.emit("add user", JSON.stringify({ username: socket.request.session.user.username, 
            avatar: socket.request.session.user.avatar, name: socket.request.session.user.name }));
    }
    // console.log(onlineUsers);

    socket.on("disconnect", () => {
        delete onlineUsers[socket.request.session.user.username];
        // console.log(onlineUsers);
        io.emit("remove user", JSON.stringify({ username: socket.request.session.user.username, 
            avatar: socket.request.session.user.avatar, name: socket.request.session.user.name }));
    });

    socket.on("get users", () => {
        // Send the online users to the browser
        socket.emit("users", JSON.stringify(onlineUsers));
    });


    socket.on("update room", (room) => {
        const rooms = JSON.parse(fs.readFileSync("./data/rooms.json", "utf-8"));
        rooms.push(room);
        fs.writeFileSync("./data/rooms.json", JSON.stringify(rooms, null, " "));
        io.emit("show room", rooms);
    });

    socket.on("initialize rooms", () => {
        const rooms = JSON.parse(fs.readFileSync("./data/rooms.json", "utf-8"));
        socket.emit("show initial rooms", rooms);
    });

    socket.on("start game", (room) => {
        // console.log(room);
        const roomStatus = JSON.parse(fs.readFileSync("./data/roomStatus.json", "utf-8"));
        // const ready = 0;
        const newRoom = { 
            name: room.name, 
            ready1: 0, 
            ready2: 0,
            timeRemaining: 60,
            user1Gem: 0,
            user2Gem: 0,
            user1HP: 3,
            user2HP: 3
            // gemLocationX: 0,
            // gemLocationY: 0
        }
        roomStatus.push(newRoom);
        fs.writeFileSync("./data/roomStatus.json", JSON.stringify(roomStatus, null, " "));
        io.emit("get into game", room);
    });

    socket.on("update player", (info) => {
        io.emit("move player", info);
    });

    socket.on("ready", (info) => {
        const roomStatus = JSON.parse(fs.readFileSync("./data/roomStatus.json", "utf-8"));
        console.log("123344565");
        for (var r of roomStatus) {
            if (r.name == info.room) {
                if (info.user == "1")
                    r.ready1++;
                else if (info.user == "2")
                    r.ready2++;
                if ((r.ready1 >= 1) && (r.ready2 >= 1)) {
                    io.emit("all ready", info.room);
                    console.log("34224");
                }
            }
            
        }
        fs.writeFileSync("./data/roomStatus.json", JSON.stringify(roomStatus, null, " "));
    });

    socket.on("update gem", (info) => {
        // const roomStatus = JSON.parse(fs.readFileSync("./data/roomStatus.json", "utf-8"));
        // for (var r of roomStatus) {
        //     if (r.name == room) {
        //         r.gemLocationX = info.x;
        //         r.gemLocationY = info.y;
        //     }
        // }
        // fs.writeFileSync("./data/roomStatus.json", JSON.stringify(roomStatus, null, " "));
        io.emit("move gem", info);
    });

    socket.on("speed up", (info) => {
        console.log("aafdsfdsffdsf");
        io.emit("speed up player", info);
    });
    socket.on("update banana", (info) => {
        io.emit("move banana", info);
    });
    socket.on("update bomb", (info) => {
        io.emit("move bomb", info);
    });
});

// Use a web server to listen at port 8000
httpServer.listen(8000, () => {
    console.log("The chat server has started...");
});

