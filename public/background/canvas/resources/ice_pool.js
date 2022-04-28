// This function defines the Gem module.
// - `ctx` - A canvas context for drawing
// - `x` - The initial x position of the gem
// - `y` - The initial y position of the gem
const Ice_pool = function(ctx, x, y) {

    const sequences = { direction: 0, x: 0, y: 0, width: 80, height: 80, count: 1, timing: 200, loop: false};

    // This is the sprite object of the gem created from the Sprite module.
    const sprite = Sprite(ctx, x, y);

    // The sprite object is configured for the gem sprite here.
    sprite.setSequence(sequences)
          .setScale(1.5)//720/12/40
        //   .setShadowScale({ x: 0.75, y: 0.2 })
          .useSheet("./resources/ice_pool.png");

    

    // The methods are returned as an object here.
    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        getBoundingBox: sprite.getBoundingBox,
        draw: sprite.draw,
        update: sprite.update
    };
};