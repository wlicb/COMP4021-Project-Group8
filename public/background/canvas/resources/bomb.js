// This function defines the Gem module.
// - `ctx` - A canvas context for drawing
// - `x` - The initial x position of the gem
// - `y` - The initial y position of the gem
// - `color` - The colour of the gem
const Bomb = function(ctx, x, y, color) {

    // This is the sprite sequences of the gem of four colours
    // `green`, `red`, `yellow` and `purple`.
    const sequences = {
        green:  { direction: 0, x: 0, y:  0, width: 38, height: 38, count: 1, timing: 200, loop: false },
        red:    { direction: 0, x: 0, y:  0, width: 38, height: 38, count: 1, timing: 200, loop: false },
        yellow: { direction: 0, x: 0, y:  0, width: 38, height: 38, count: 1, timing: 200, loop: false },
        purple: { direction: 0, x: 0, y:  0, width: 38, height: 38, count: 1, timing: 200, loop: false }
    };

    // This is the sprite object of the gem created from the Sprite module.
    const sprite = Sprite(ctx, x, y);
    
    // The sprite object is configured for the gem sprite here.
    sprite.setSequence(sequences[color])
          .setScale(1)
          .setShadowScale({ x: 0.75, y: 0.2 })
          .useSheet("./resources/bomb.png");

    // This is the birth time of the gem for finding its age.
    let birthTime = performance.now();

    // This function sets the color of the gem.
    // - `color` - The colour of the gem which can be
    // `"green"`, `"red"`, `"yellow"` or `"purple"`
    const setColor = function(color) {
        sprite.setSequence(sequences[color]);
        birthTime = performance.now();
    };

    // This function gets the age (in millisecond) of the gem.
    // - `now` - The current timestamp
    const getAge = function(now) {
        return now - birthTime;
    };

    // This function randomizes the gem colour and position.
    // - `area` - The area that the gem should be located in.
    const randomize = function(area, boxes, length) {
        /* Randomize the color */
        const colors = ["green", "red", "yellow", "purple"];
        setColor(colors[Math.floor(Math.random() * 4)]);

        while (true) {
            /* Randomize the position */
            const {x, y} = area.randomPoint();
            sprite.setXY(x, y);
            let overlap = false;
            for (var i = 0; i < length; i++) {
                if (sprite.getBoundingBox().intersect(boxes[i].getBoundingBox())) {        
                    overlap = true;
                    // console.log("here");
                    break;
                }
            }
            if (!overlap)
                break;
        }
    };

    // The methods are returned as an object here.
    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        setColor: setColor,
        getAge: getAge,
        getBoundingBox: sprite.getBoundingBox,
        randomize: randomize,
        draw: sprite.draw,
        update: sprite.update
    };
};
