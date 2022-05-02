// This function defines the Player module.
// - `ctx` - A canvas context for drawing
// - `x` - The initial x position of the player
// - `y` - The initial y position of the player
// - `gameArea` - The bounding box of the game area
const Player_red = function(ctx, x, y, gameArea) {

    // This is the sprite sequences of the player facing different directions.
    // It contains the idling sprite sequences `idleLeft`, `idleUp`, `idleRight` and `idleDown`,
    // and the moving sprite sequences `moveLeft`, `moveUp`, `moveRight` and `moveDown`.
    const sequences = {
        /* Idling sprite sequences for facing different directions */
        idleLeft:  { direction: 0, x: 368, y: 60, width: 65, height: 66, count: 1, timing: 2000, loop: false },
        idleUp:    { direction: 1, x: 368, y: 60, width: 65, height: 66, count: 1, timing: 2000, loop: false },
        idleRight: { direction: 0, x: 368, y: 60, width: 65, height: 66, count: 1, timing: 2000, loop: false },
        idleDown:  { direction: 1, x: 368, y: 60, width: 65, height: 66, count: 1, timing: 2000, loop: false },

        /* Moving sprite sequences for facing different directions */
        moveLeft:  { direction: 0, x: 210, y: 130, width: 68, height: 66, count: 4, timing: 50, loop: true },
        moveUp:    { direction: 1, x: 70,  y: 130, width: 68, height: 70, count: 4, timing: 50, loop: true },
        moveRight: { direction: 0, x: 210, y: 200, width: 68, height: 66, count: 4, timing: 50, loop: true },
        moveDown:  { direction: 1, x: 140, y: 130, width: 68, height: 70, count: 4, timing: 50, loop: true }
    };

    // This is the sprite object of the player created from the Sprite module.
    const sprite = Sprite(ctx, x, y);

    // The sprite object is configured for the player sprite here.
    sprite.setSequence(sequences.idleDown)
          .setScale(0.6)
          .setShadowScale({ x: 0.5, y: 0.1 })
          .useSheet("./resources/unit_red.png");

    // This is the moving direction, which can be a number from 0 to 4:
    // - `0` - not moving
    // - `1` - moving to the left
    // - `2` - moving up
    // - `3` - moving to the right
    // - `4` - moving down
    let direction = 0;

    // This is the moving speed (pixels per second) of the player
    let speed = 150;

    // This function sets the player's moving direction.
    // - `dir` - the moving direction (1: Left, 2: Up, 3: Right, 4: Down)
    const move = function(dir) {
        if (dir >= 1 && dir <= 4 && dir != direction) {
            switch (dir) {
                case 1: sprite.setSequence(sequences.moveLeft); break;
                case 2: sprite.setSequence(sequences.moveUp); break;
                case 3: sprite.setSequence(sequences.moveRight); break;
                case 4: sprite.setSequence(sequences.moveDown); break;
            }
            direction = dir;
        }
    };

    // This function stops the player from moving.
    // - `dir` - the moving direction when the player is stopped (1: Left, 2: Up, 3: Right, 4: Down)
    const stop = function(dir) {
        if (direction == dir) {
            switch (dir) {
                case 1: sprite.setSequence(sequences.idleLeft); break;
                case 2: sprite.setSequence(sequences.idleUp); break;
                case 3: sprite.setSequence(sequences.idleRight); break;
                case 4: sprite.setSequence(sequences.idleDown); break;
            }
            direction = 0;
        }
    };

    // This function speeds up the player.
    const speedUp = function() {
        speed = 250;
    };

    // This function slows down the player.
    const slowDown = function() {
        speed = 150;
    };

    // This function updates the player depending on his movement.
    // - `time` - The timestamp when this function is called
    const update = function(time, boxes, length) {
        /* Update the player if the player is moving */
        if (direction != 0) {
            let { x, y } = sprite.getXY();
            let oX = x;
            let oY = y;
            /* Move the player */
            switch (direction) {
                case 1: x -= speed / 60; break;
                case 2: y -= speed / 60; break;
                case 3: x += speed / 60; break;
                case 4: y += speed / 60; break;
            }
            sprite.setXY(x, y);
            /* Set the new position if it is within the game area */
            if (!((gameArea.isPointInBox(x, y)) && (!checkOverlap(sprite, boxes, length)))) {
                sprite.setXY(oX, oY);
            }
        }
        /* Update the sprite object */
        sprite.update(time);
    };

    const checkOverlap = function(sprite, boxes, length) {
        for (var i = 0; i < length; i++) {
            if (sprite.getBoundingBox().intersect(boxes[i].getBoundingBox())) {        
                return true;
            }
        }
        return false;
    }

    // The methods are returned as an object here.
    return {
        move: move,
        stop: stop,
        speedUp: speedUp,
        slowDown: slowDown,
        getBoundingBox: sprite.getBoundingBox,
        draw: sprite.draw,
        update: update,
        setXY: sprite.setXY,
        getXY: sprite.getXY
    };
};
