const Socket = (function() {
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
            // Get the online user list
            socket.emit("get users");

            // Get the room info
            socket.emit("initialize rooms");
        });


        socket.on("show room", (rooms) => {
            RoomPanel.update(rooms);
        });

        socket.on("show initial rooms", (rooms) => {
            // console.log(rooms);
            RoomPanel.update(rooms);
        });

        socket.on("get into game", (room) => {
            if (Rooms.getRoom().name == room.name) {
                if (room.user1 == Authentication.getUser().name) {
                    document.cookie = "player=1; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    document.cookie = "player=2; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    document.cookie = "room=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    document.cookie = "map=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    document.cookie = "name1=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    document.cookie = "name2=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    document.cookie = "room=" + room.name + "; Path=/;";
                    document.cookie = "player=1; Path=/;";
                    document.cookie = "name1=" + room.user1 + "; Path=/;";
                    document.cookie = "name2=" + room.user2 + "; Path=/;";
                    document.cookie = "map=" + room.map + "; Path=/;";
                }
                else if (room.user2 == Authentication.getUser().name) {
                    document.cookie = "player=1; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    document.cookie = "player=2; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    document.cookie = "room=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    document.cookie = "map=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    document.cookie = "name1=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    document.cookie = "name2=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    document.cookie = "room=" + room.name + "";
                    document.cookie = "player=2; Path=/;";
                    document.cookie = "name1=" + room.user1 + "; Path=/;";
                    document.cookie = "name2=" + room.user2 + "; Path=/;";
                    document.cookie = "map=" + room.map + "; Path=/;";
                }
                document.location.href = "/background/canvas/canvas.html";
            }
        });
    };

    // This function disconnects the socket from the server
    const disconnect = function() {
        socket.disconnect();
        socket = null;
    };

    // This function sends a post message event to the server
    const postMessage = function(content) {
        if (socket && socket.connected) {
            socket.emit("post message", content);
        }
    };

    // This function reports to the server if someone is typing
    const reportTyping = function() {
        socket.emit("typing");
    };

    const stopTyping = function() {
        socket.emit("stop typing");
    };

    const updateRoom = function(room) {
        socket.emit("update room", room);
    };

    const startGame = function(room) {
        socket.emit("start game", room);
    };


    return { getSocket, connect, disconnect, postMessage, reportTyping, stopTyping, updateRoom, startGame };
})();
