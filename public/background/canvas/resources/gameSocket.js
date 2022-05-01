const GameSocket = (function() {
    // This stores the current Socket.IO socket
    let socket = null;

    // This function gets the socket from the module
    const getSocket = function() {
        return socket;
    };

    // This function connects the server and initializes the socket
    const connect = function() {


        socket = io();

        // Wait for the socket to connect successfully
        socket.on("connect", () => {
            // // Get the online user list
            // socket.emit("get users");

            // // Get the room info
            // socket.emit("initialize rooms");
        });
    }
 

    // This function disconnects the socket from the server
    const disconnect = function() {
        socket.disconnect();
        socket = null;
    };

    const updatePlayer = function(room, direction, type, user, XY) {
        // console.log("b");
        const info = { room, direction, type, user, XY };
        socket.emit("update player", info);
    }

    const listenPlayer = function(player) {
        socket.on("move player", (info) =>{
            // console.log("c");
            const { room, direction, type, user, XY } = info;
            const cookies = document.cookie.split(";");
            // console.log(document.cookie);
            const cookieElement = {};
            for (var i = 0; i < cookies.length; i++) {
                const parts = cookies[i].split("=");
                let name = parts[0];
                if (i != 0)
                    name = parts[0].split(" ")[1];
                const content = parts[1];
                cookieElement[name] = content;
                // console.log(name);
            }
            const currentUser = cookieElement["player"];
            const currentRoom = cookieElement["room"];
            if ((room == currentRoom) && (user != currentUser)) {
            // if (room == currentRoom) {
                // console.log("d");
                if (type == 0) {
                    player.move(direction);
                    player.setXY(XY.x, XY.y);
                }
                else {
                    player.stop(direction);
                    player.setXY(XY.x, XY.y);
                }

                // console.log(XY);
                // console.log(XY.x);
                // console.log(XY.y);

                // player.updateWithoutBoundary(now);
            }
        });

    }

    const updateGem = function(room, x, y) {
        const info = { room, x, y };
        socket.emit("update gem", info);
    }
    const updateBanana = function(room, x, y) {
        const info = { room, x, y };
        socket.emit("update banana", info);
    }
    const updateBomb = function(room, x, y) {
        const info = { room, x, y };
        socket.emit("update bomb", info);
    }

    const ready = function(room, user) {
        const info = { room, user };
        socket.emit("ready", info);
    };

    const speedUp = function(room, user, type) {
        const info = { room, user, type };
        socket.emit("speed up", info);
    };

    const listenSpeedUp = function(player) {
        socket.on("speed up player", (info) =>{
            // console.log("alaalalala");
            // console.log("c");
            const { room, user, type } = info;
            const cookies = document.cookie.split(";");
            // console.log(document.cookie);
            const cookieElement = {};
            for (var i = 0; i < cookies.length; i++) {
                const parts = cookies[i].split("=");
                let name = parts[0];
                if (i != 0)
                    name = parts[0].split(" ")[1];
                const content = parts[1];
                cookieElement[name] = content;
                // console.log(name);
            }
            const currentUser = cookieElement["player"];
            const currentRoom = cookieElement["room"];
            if ((room == currentRoom) && (user != currentUser)) {
                // console.log("d");
                if (type == 0)
                    player.speedUp();
                else
                    player.slowDown();
                // player.updateWithoutBoundary(now);
            }
        });

    };

    const updateScore = function(user, value, room) {
        const info = { user, value, room };
        socket.emit("update score", info);
    };

    const updateHP = function(user, value, room) {
        const info = { user, value, room };
        socket.emit("update hp", info);
    };



    return { getSocket, connect, disconnect, updatePlayer, listenPlayer, 
        updateGem, updateBanana, updateBomb, ready, speedUp, listenSpeedUp, updateScore, updateHP };

})();
