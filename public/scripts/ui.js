const SignInForm = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Populate the avatar selection
        Avatar.populate($("#register-avatar"));
        
        // Hide it
        $("#signin-overlay").hide();

        // Submit event for the signin form
        $("#signin-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#signin-username").val().trim();
            const password = $("#signin-password").val().trim();

            // Send a signin request
            Authentication.signin(username, password,
                () => {
                    hide();
                    UserPanel.update(Authentication.getUser());
                    UserPanel.show();

                    Socket.connect();
                },
                (error) => { $("#signin-message").text(error); }
            );
        });

        // Submit event for the register form
        $("#register-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#register-username").val().trim();
            const avatar   = $("#register-avatar").val();
            const name     = $("#register-name").val().trim();
            const password = $("#register-password").val().trim();
            const confirmPassword = $("#register-confirm").val().trim();

            // Password and confirmation does not match
            if (password != confirmPassword) {
                $("#register-message").text("Passwords do not match.");
                return;
            }

            // Send a register request
            Registration.register(username, avatar, name, password,
                () => {
                    $("#register-form").get(0).reset();
                    $("#register-message").text("You can sign in now.");
                },
                (error) => { $("#register-message").text(error); }
            );
        });
    };

    // This function shows the form
    const show = function() {
        $("#signin-overlay").fadeIn(500);
    };

    // This function hides the form
    const hide = function() {
        $("#signin-form").get(0).reset();
        $("#signin-message").text("");
        $("#register-message").text("");
        $("#signin-overlay").fadeOut(500);
    };

    return { initialize, show, hide };
})();

const UserPanel = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Hide it
        $("#user-panel").hide();

        // Click event for the signout button
        $("#signout-button").on("click", () => {
            // Send a signout request
            Authentication.signout(
                () => {
                    Socket.disconnect();

                    hide();
                    SignInForm.show();
                }
            );
        });
    };

    // This function shows the form with the user
    const show = function(user) {
        $("#user-panel").show();
    };

    // This function hides the form
    const hide = function() {
        $("#user-panel").hide();
    };

    // This function updates the user panel
    const update = function(user) {
        if (user) {
            $("#user-panel .user-avatar").html(Avatar.getCode(user.avatar));
            $("#user-panel .user-name").text(user.name);
        }
        else {
            $("#user-panel .user-avatar").html("");
            $("#user-panel .user-name").text("");
        }
    };

    return { initialize, show, hide, update };
})();

const NewRoomPanel = (function() {
    // This function initializes the UI
    const initialize = function() {
        $("#new-room-button").on("click", () => {
            if ($("#room-name-input").val()) {
                const room = {name: $("#room-name-input").val(), map: $("#room-map-input").val(), 
                user1: Authentication.getUser().name, user2: "-" };
                Rooms.createRoom(room, (rooms) => {
                    RoomPanel.update(rooms);
                },
                (error) => {
                    $("#new-room-message").text(error);
                }, 
                () => {
                    $("#new-room-message").text("You are already in another room!");
                });
            } else {
                $("#new-room-message").text("Please enter the room name");
            }
        });
    };


    // This function adds a user in the panel
	const addUser = function(user) {
        const onlineUsersArea = $("#online-users-area");
		
		// Find the user
		const userDiv = onlineUsersArea.find("#username-" + user.username);
		
		// Add the user
		if (userDiv.length == 0) {
			onlineUsersArea.append(
				$("<div id='username-" + user.username + "'></div>")
					.append(UI.getUserDisplay(user))
			);
		}
	};

    // This function removes a user from the panel
	const removeUser = function(user) {
        const onlineUsersArea = $("#online-users-area");
		
		// Find the user
		const userDiv = onlineUsersArea.find("#username-" + user.username);
		
		// Remove the user
		if (userDiv.length > 0) userDiv.remove();
	};

    return { initialize, addUser, removeUser };
})();

const RoomPanel = (function() {
	// This stores the chat area
    let roomArea = null;

    // This function initializes the UI
    const initialize = function() {
		// Set up the room area
        roomArea = $("#room-area");
 	};

    // This function updates the chatroom area
    const update = function(rooms) {
        // Clear the room area
        roomArea.empty();

        // Add the rooms one-by-one
        for (const room of rooms) {
            console.log(room);
			addRoom(room);
        }
    };

    // This function adds a new message at the end of the chatroom
    const addRoom = function(room) {
        roomArea.append(
            $("<div class='room-content-panel row' id='room" + room.name + "'></div>")
            .append($("<div class='field-content row shadow'></div>")
                .append($("<span id='room-name" + room.name + "' class='col'><b>Name: </b>" + room.name + "</span>"))
                .append($("<span id='map" + room.name + "' class='col'><b>Map: </b>" + room.map + "</span>"))
                .append($("<span id='user-name1-" + room.name + "' class='col'><b>User 1: </b>" + room.user1 + "</span>"))
                .append($("<span id='user-name2-" + room.name + "' class='col'><b>User 2: </b>" + room.user2 + "</span>"))
                .append($("<button id='leave-room" + room.name + "'>Leave</button>"))
                .append($("<button id='join-room" + room.name + "'>Join</button>"))
            )
        );
        roomArea.scrollTop(roomArea[0].scrollHeight);

        $("#leave-room" + room.name + "").on("click", () => {
            Rooms.leaveRoom(room, 
                (rooms) => {
                    update(rooms);
                },
                (error) => {
                    $("#new-room-message").text(error);
                });
        });

        $("#join-room" + room.name + "").on("click", () => {
            Rooms.joinRoom(room, 
                (rooms) => {
                    update(rooms);
                },
                (error) => {
                    $("#new-room-message").text(error);
                },
                () => {
                    $("#new-room-message").text("You are already in another room!");
                });
        });
    };

    // const joinRoom = function(room) {
    //     const roomElement = $("#room-" + room.name + "");
    //     const user1 = roomElement.find($("#user-name1"));
    //     if (user1 != "-") {
    //         room.user1 = Authentication.getUser().name;
    //         user1.text(Authentication.getUser().name);
    //     } else if (user2) {

    //     }
    // }
    const removeRoom = function(room) {
        $("#room" + room.name + "").remove();
    }
    

    return { initialize, update, addRoom, removeRoom };
})();

const UI = (function() {
    // This function gets the user display
    const getUserDisplay = function(user) {
        return $("<div class='field-content row shadow'></div>")
            .append($("<span class='user-name'>" + user.name + "</span>"));
    };

    // The components of the UI are put here
    const components = [SignInForm, UserPanel, NewRoomPanel, RoomPanel];

    // This function initializes the UI
    const initialize = function() {
        // Initialize the components
        for (const component of components) {
            component.initialize();
        }
    };

    return { getUserDisplay, initialize };
})();
