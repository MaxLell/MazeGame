/**
 * Matter.js Boiler Plate
 */
const { Engine, Render, Runner, World, Bodies, MouseConstraint, Mouse } = Matter;
const engine = Engine.create();
const { world } = engine;

const width = 1000;
const height = 600;

const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width,
        height,
        wireframes: false
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);
World.add(world, MouseConstraint.create(engine, {
    mouse: Mouse.create(render.canvas)
}))

/**
 * Walls 
 * The canvas is limited by rectangles, which are placed 
 * at its perimeter
 */
const walls = [
    Bodies.rectangle(width / 2, 0, width, 40, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, 40, { isStatic: true }),
    Bodies.rectangle(0, height / 2, 40, height, { isStatic: true }),
    Bodies.rectangle(width, height / 2, 40, height, { isStatic: true }),
];
World.add(world, walls);

/**
 * Random Shapes
 */
const createRandomValueWithinBounds = (min, max) => {
    let value;
    do {
        value = Math.floor(Math.random() * max)
    } while (value < min);
    return value;
}

for (let i = 0; i < 300; i++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    const sizeX = createRandomValueWithinBounds(10, 50);
    const sizeY = createRandomValueWithinBounds(10, 50);

    if (Math.random() > 0.5) {
        // Create a rectangle
        World.add(world, Bodies.rectangle(x, y, sizeX, sizeY));
    } else {
        const r = createRandomValueWithinBounds(10, 30);
        World.add(
            world,
            Bodies.circle(x, y, r)
        )
    }

}

