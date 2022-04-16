const Rooms = (function() {
    // This stores the current room that the user is in
    let currentRoom = null;

    const getRoom = function() {
        return room;
    }

    const createRoom = function(room, onSuccess, onError, onAlreadyIn) {
        if (currentRoom == null) {
            fetch("/newRoom", {
                method: "POST",
                headers: {"Content-Type": 
                "application/json"},
                body: JSON.stringify(room)
            }).then((res) => res.json() )
            .then((json) => {
                if (json.status == "success") {
                    onSuccess(json.rooms);
                    currentRoom = room;
                }
                else if (onError) onError(json.error);
                
            })
            .catch((err) => {
                console.log("Error!");
            });
        } else {
            onAlreadyIn();
        }
    };

    const leaveRoom = function(room, onSuccess, onError) {
        fetch("/leaveRoom", {
            method: "POST",
            headers: {"Content-Type": 
            "application/json"},
            body: JSON.stringify({ room: room, user: Authentication.getUser().name})
        }).then((res) => res.json() )
        .then((json) => {
            if (json.status == "success") {
                onSuccess(json.rooms);
                currentRoom = null;
            }
            else if (onError) onError(json.error);
            
        })
        .catch((err) => {
            console.log("Error!");
            console.log(err);
        });
    }
    
    const joinRoom = function(room, onSuccess, onError, onAlreadyIn) {
        if (currentRoom == null) {
            fetch("/joinRoom", {
                method: "POST",
                headers: {"Content-Type": 
                "application/json"},
                body: JSON.stringify({ room: room, user: Authentication.getUser().name})
            }).then((res) => res.json() )
            .then((json) => {
                if (json.status == "success") {
                    onSuccess(json.rooms);
                    currentRoom = room;
                }
                else if (onError) onError(json.error);
                
            })
            .catch((err) => {
                console.log("Error!");
                console.log(err);
            });
        } else {
            onAlreadyIn();
        }
    }

    return { getRoom, createRoom, leaveRoom, joinRoom };
})();
