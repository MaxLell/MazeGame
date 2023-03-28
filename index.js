/**
 * defines
 */
const cellsHorizontal = 15;
const cellsVertical = 10;
const width = window.innerWidth;
const height = window.innerHeight;
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;


/**
 * Boilerplate code for Matter.js
 */
const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;
const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width,
        height
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);

/**
 * Surrounding walls
 * This prevents the non static elements to fall out of the canvas
 */
const walls = [
    Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
    Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
    Bodies.rectangle(width, height / 2, 2, height, { isStatic: true })
];
World.add(world, walls);

/**
 * Maze generation
 */
const shuffle = arr => {
    /**
     * This function shuffles an array
     */
    let counter = arr.length;
    while (counter > 0) {
        const index = Math.floor(Math.random() * counter);
        counter--;
        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }
    return arr;
};

/**
 * The maze is composed of three arrays:
 * 1. grid: keeps track of which cells have been visited
 * 2. verticals: contains the vertical walls
 * 3. horizontals: contains the horizontal walls
 */
const grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

const verticalWalls = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontalWalls = Array(cellsVertical - 1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

/**
 * This function recursively steps through the cells
 * and removes the walls between them at random
 * 
 * This algorithm is called Eller's algorithm. However
 * the current implementation is not the original one.
 * This algorithm follows a subtractive approach, meaning
 * that it starts with a complete maze and removes walls
 * 
 * Source: http://www.neocomputer.org/projects/eller.html
 * 
 * Since this algorithm is recursive, only a maze of limited
 * size can be generated. This is because the call stack
 * has a limited size. For larger mazes, a different algorithm
 * should be used, which does not rely on recursion.
 */
const stepThroughCell = (row, column) => {
    /**
     * If the cell has already been visited, return immediately
     * This is furthermore the base case for the recursion
     */
    if (grid[row][column]) {
        return;
    }
    /**
     * Mark the current cell as being visited
     * in the grid array
     */
    grid[row][column] = true;

    /**
     * Figure the neighbors of the current cell
     * and shuffle them. The shuffle function
     * does only shuffle in 1 dimension
     * 
     */
    const neighbors = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ]);

    for (let neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor;

        // See if that neighbor is out of bounds
        if (
            nextRow < 0 ||
            nextRow >= cellsVertical ||
            nextColumn < 0 ||
            nextColumn >= cellsHorizontal
        ) {
            /**
             * continue skips the rest of the loop
             * and goes to the next iteration
             */
            continue;
        }

        /**
         * If this neighbor has already been visited,
         * skip the rest of the loop and go to the next iteration
         */
        if (grid[nextRow][nextColumn]) {
            continue;
        }

        // Remove a wall from either horizontals or verticals
        switch (direction) {
            case 'left':
                verticalWalls[row][column - 1] = true;
                break;
            case 'right':
                verticalWalls[row][column] = true;
                break;
            case 'up':
                horizontalWalls[row - 1][column] = true;
                break;
            case 'down':
                horizontalWalls[row][column] = true;
                break;
            default:
                break;
        }
        stepThroughCell(nextRow, nextColumn);
    }
};

/**
 * Start the maze generation from a random cell
 * in the grid
 */
const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);
stepThroughCell(startRow, startColumn);

/**
 * Drawing the maze on the canvas
 */
horizontalWalls.forEach(
    (row, rowIndex) => {
        row.forEach(
            (open, columnIndex) => {
                if (open) {
                    return;
                }
                const wall = Bodies.rectangle(
                    columnIndex * unitLengthX + unitLengthX / 2,
                    rowIndex * unitLengthY + unitLengthY,
                    unitLengthX,
                    5,
                    {
                        label: 'wall',
                        isStatic: true,
                        render: {
                            fillStyle: 'white'
                        }
                    }
                );
                World.add(world, wall);
            });
    });

verticalWalls.forEach(
    (row, rowIndex) => {
        row.forEach(
            (open, columnIndex) => {
                if (open) {
                    return;
                }
                const wall = Bodies.rectangle(
                    columnIndex * unitLengthX + unitLengthX,
                    rowIndex * unitLengthY + unitLengthY / 2,
                    5,
                    unitLengthY,
                    {
                        label: 'wall',
                        isStatic: true,
                        render: {
                            fillStyle: 'white'
                        }
                    }
                );
                World.add(world, wall);
            });
    });

/**
 * Render the goal
 */
const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * 0.7,
    unitLengthY * 0.7,
    {
        label: 'goal',
        isStatic: true,
        render: {
            fillStyle: 'teal'
        }
    }
);
World.add(world, goal);

/**
 * Render the ball
 */
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
    label: 'ball',
    render: {
        fillStyle: 'orange'
    }
});
World.add(world, ball);

/**
 * Add key controls
 */
document.addEventListener('keydown', event => {
    const { x, y } = ball.velocity;

    switch (event.keyCode) {
        case 38: // Arrow key up
            Body.setVelocity(ball, { x, y: y - 5 });
            break;
        case 39: // Arrow key right
            Body.setVelocity(ball, { x: x + 5, y });
            break;
        case 40: // Arrow key down
            Body.setVelocity(ball, { x, y: y + 5 });
            break;
        case 37: // Arrow key left
            Body.setVelocity(ball, { x: x - 5, y });
            break;
        default:
            // Do nothing for all other keys
            break;
    }
});
/**
 * Win condition:
 * When the ball touches the goal the game is won.
 */
Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach(collision => {
        const labels = ['ball', 'goal'];

        if (
            labels.includes(collision.bodyA.label) &&
            labels.includes(collision.bodyB.label)
        ) {
            /**
             * Display the winner message
             * Enable gravity - so that the entire maze and the ball
             * fall down
             */
            document.querySelector('.winner').classList.remove('hidden');
            world.gravity.y = 1;
            world.bodies.forEach(body => {
                if (body.label === 'wall') {
                    Body.setStatic(body, false);
                }
            });
        }
    });
});