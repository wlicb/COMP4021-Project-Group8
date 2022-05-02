// This function defines the Gem module.
// - `ctx` - A canvas context for drawing
// - `x` - The initial x position of the gem
// - `y` - The initial y position of the gem
const Box = function(ctx, x, y) {

    const sequences = { direction: 0, x: 0, y: 10, width: 40, height: 40, count: 1, timing: 200, loop: false};

    // This is the sprite object of the gem created from the Sprite module.
    const sprite = Sprite(ctx, x, y);

    // The sprite object is configured for the gem sprite here.
    sprite.setSequence(sequences)
          .setScale(1.5)//720/12/40
        //   .setShadowScale({ x: 0.75, y: 0.2 })
          .useSheet("boxes.png");

    

    // The methods are returned as an object here.
    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        getBoundingBox: sprite.getBoundingBox,
        draw: sprite.draw,
        update: sprite.update
    };
};
