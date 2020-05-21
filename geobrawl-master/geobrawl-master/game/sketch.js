// TODO: - Fix bullet angle >> turn velocity added from wind into speed and emit at the mouseAngle?
//       - Remove bullets after a given amount of time (or else they'll eventually slow it down) - https://www.youtube.com/watch?v=4HsVCLakjtQ
//       -

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");

var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Events = Matter.Events,
    Composites = Matter.Composites,
    Composite = Matter.Composite,
    Common = Matter.Common,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Vector = Matter.Vector,
    Bounds = Matter.Bounds,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    keys = [],
    boxes = [],
    speed = [],
    // players = [],
    players = {};

var winds,
    windsDir,
    xWind = 0,
    yWind = 0;

document.body.addEventListener("keydown", function(e) {
   keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function(e) {
    keys[e.keyCode] = false;
});

//var currentColor = 'green'; // default is '#6C6C6C' | red = '#ff0000' | green = 'green' (all work)

// function Circle(playerID, x, y, r) {
function Circle(x, y, r) {
    var options = {
        friction: 0,
        restitution: .15,
        mass: 2,
        render: {
            fillStyle: color(),
            lineWidth: 10
        }
    }
    //console.log('here',color());
    this.body = Bodies.circle(x, y, r, options);
    this.r = r;
    // this.id = playerID;
    this.body.force = { x: 0, y: 0 };
    World.add(world, this.body);

    this.keymove = function (){
        if (keys[87] || keys[38]) {                                   // if 'w' or up is pressed
            Body.setVelocity(players[socket.id].body, {x: players[socket.id].body.velocity.x, y: -5});
        }
        if (keys[83] || keys[40]) {                                   // if 's' or down is pressed
            Body.setVelocity(players[socket.id].body, {x: players[socket.id].body.velocity.x, y: 5});
        }
        if (keys[65] || keys[37]) {                                   // if 'a' or left is pressed
            Body.setVelocity(players[socket.id].body, {x: -5, y: players[socket.id].body.velocity.y});
        }
        if (keys[68] || keys[39]) {                                   // if 'd' or right is pressed
            Body.setVelocity(players[socket.id].body, {x: 5, y: players[socket.id].body.velocity.y});
        }
        if (!keys[87] && !keys[38] && !keys[83] && !keys[40] && !keys[65] && !keys[37] && !keys[68] && !keys[39]) {
            Body.setVelocity(players[socket.id].body, {x:0, y:0});
        }
    }
}


function Boundary(x, y, w, h, a) {
  var options = {
    friction: 0.1,
    restitution: 1,
    angle: a,
    isStatic: true,
    render: {
      fillStyle: 'grey',
      lineWidth: 0
    }
  }
  this.body = Bodies.rectangle(x, y, w, h, options);
  this.w = w;
  this.h = h;
  World.add(world, this.body);
}

// create engine
var engine = Engine.create(),
    world = engine.world;

// create renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    canvas: canvas,
    options: {
        width: window.innerWidth*0.8,
        height: window.innerHeight,
        hasBounds: true,
        wireframes: false,
        showAngleIndicator: false,
        showBounds: false,
        background: '#262626'
        }
    });


Render.run(render);

// create runner
var runner = Runner.create();
Runner.run(runner, engine);

// remove gravity
engine.world.gravity.y = 0;

// add mouse control
var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });

World.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;

// declare bodies
// todo: make circle, boundary arrays eventually
var self,
    upperBoundary,
    lowerBoundary,
    leftBoundary,
    rightBoundary;

Events.on(mouseConstraint, 'mousedown', function(e) {
        var posx = players[socket.id].body.position.x;
        var posy = players[socket.id].body.position.y;
        var mousex = mouse.position.x;
        var mousey = mouse.position.y;
        vx = mousex - posx;
        vy = mousey - posy;
        var dist = Math.sqrt(vx*vx + vy*vy);
        var dx = vx/dist;
        var dy = vy/dist;
        var opp = mousey - posy;
        var adj = mousex - posx;

        //Checking for wind direction | North is negative, West is negative
        if(windsDir <= 90){
            xWind = Math.sin(windsDir) * winds;
            yWind = Math.cos(windsDir) * winds;
            // console.log("here1");
        }
        if(windsDir > 90 && windsDir <= 180){
            xWind = Math.sin(windsDir) * winds;
            yWind = -(Math.cos(windsDir) * winds);
            // console.log("here2");
        }
        if(windsDir > 180 && windsDir <= 270){
            xWind = -(Math.sin(windsDir) * winds);
            yWind = -(Math.cos(windsDir) * winds);
            // console.log("here3");
        }
        if(windsDir > 270){
            xWind = -(Math.sin(windsDir) * winds);
            yWind = Math.cos(windsDir) * winds;
            // console.log("here4");
        }
        while(Math.abs(xWind) >= .3){
            xWind = xWind/5;
            // console.log("here5");
        }
        while(Math.abs(yWind) >= .3){
            yWind = yWind/5;
            // console.log("here6");
        }
        ////////////////////////////////////////////////////////////////////


        // console.log("wind speed =", winds );
        // console.log("wind direction =", windsDir );
        // console.log("xwind speed =", xWind );
        // console.log("ywind speed =", yWind );
        // console.log("dx =", dx*.5 );
        // console.log("dy =", dy*.5 );
        dx = dx*0.5 + xWind; //change this for speed(winds/20)
        dy = dy*0.5 + yWind;


        boxy = new Box(posx+dx*70, posy+dy*70, 6, 16, players[socket.id].body.angle);// how the projectiles come out change later
        boxes.push(boxy);
        speed.push([dx,dy]);
    });

// add bodies
// delay because it takes time to get socket id, so it was initiating self with undefined
setTimeout(function(){
    self = socket.id;
    World.add(world, [
        // circle
        // self = new Circle(socket.id, 600, 500, 50),
        players[socket.id] = new Circle(600, 500, 30),
        // players.push(self),
        // walls
        upperBoundary = new Boundary(600, 50, 1050, 50, 0),  // (x, y, w, h, angle)
        lowerBoundary = new Boundary(600, 950, 1050, 50, 0),
        leftBoundary = new Boundary(100, 500, 50, 950, 0),
        rightBoundary = new Boundary(1100, 500, 50, 950, 0),
    ]);

socket.on('newPlayer', function(data){
    if (socket.id == data.newID){   // create existing circles (only) if you're the new player
        var i;
        for (i = 0; i < Object.keys(data.playersData).length; i++){
            var curr = Object.keys(data.playersData)[i];
            if (curr != socket.id){
                console.log("Creating a new circle at: ", data.playersData[curr].x, data.playersData[curr].y);
                World.add(world, [
                    players[curr] = new Circle(data.playersData[curr].x, data.playersData[curr].y, 50)
                ]);
            }
        }
    }
});

socket.on('updateAll', function(playerInfo){
    if (socket.id){
        // console.log(playerInfo);
        if (playerInfo.id != socket.id){
            var i;
            for (i = 0; i < Object.keys(players).length; i++){
                var curr = Object.keys(players)[i];
                if (curr == playerInfo.id){
                    console.log(playerInfo, 'x: ', playerInfo.x, 'y: ', playerInfo.y)
                    Body.setPosition(players[curr].body, { x: playerInfo.x, y: playerInfo.y });
                    Body.setAngle(players[curr].body, playerInfo.angle);
                    // players[curr].body.position.x = playerInfo.x;
                    // players[curr].body.position.y = playerInfo.y;
                    // players[curr].body.angle = playerInfo.angle;
                }
            }
        }
    }
});

// get the centre of the map
var mapCentre = {
    x: 600,
    y: 500
};

// make the world bounds a little bigger than the render bounds
world.bounds.min.x = -300;
world.bounds.min.y = -300;
world.bounds.max.x = 3000;
world.bounds.max.y = 3000;

// keep track of current bounds scale (view zoom)
var boundsScaleTarget = 1,
    boundsScale = {
        x: 1,
        y: 1
    };


// use the engine tick event to control our view
Events.on(engine, 'beforeTick', function() {
    var world = engine.world,
        mouse = mouseConstraint.mouse;

    players[socket.id].body.angle = Math.atan2(mouse.position.y-players[socket.id].body.position.y, mouse.position.x-players[socket.id].body.position.x) + 1.18;
    players[socket.id].keymove();// center view at player

    Bounds.shift(render.bounds,
    {
        x: players[socket.id].body.position.x - window.innerWidth / 2,
        y: players[socket.id].body.position.y - window.innerHeight / 2
    });

    // try two ways:
    // 1) emit only self movement
    // 2) emit all movement (physics between objects?)
    if (players[socket.id].oldPosition && (players[socket.id].body.position.x != players[socket.id].oldPosition.x || players[socket.id].body.position.y != players[socket.id].oldPosition.y || players[socket.id].body.angle != players[socket.id].oldPosition.angle )){
        socket.emit('playerUpdate', {id: socket.id, x: players[socket.id].body.position.x, y: players[socket.id].body.position.y, angle: players[socket.id].body.angle});
    }

    players[socket.id].oldPosition = {
      x: players[socket.id].body.position.x,
      y: players[socket.id].body.position.y,
      angle: players[socket.id].body.angle
    };

    //show projectiles
    for (var i = 0; i<boxes.length; i++) {
        boxes[i].body.position.x += speed[i][0];
        boxes[i].body.position.y += speed[i][1];
        World.add(world, boxes[i]);
    }
});

async function windSpeed(){
    try{
      // console.log('calling');
      const api_url = '/weather';
      const response = await fetch(api_url);
      const json = await response.json();
      winds = json.speed;
      windsDir = json.direction;
    }
    catch (error) {
      console.error(error);
    }
  }
  windSpeed();



}, 200);

socket.on('playerConnect', function(playerID){
    if (self && (self != playerID)){     // if a new player connects
        console.log("newUser:", playerID, 'self', self);
        World.add(world, [
            players[playerID] = new Circle(600, 500, 50)
        ]);
    }
});

socket.on('playerDisconnect', function(playerID){
    var i;
    for (i = 0; i < Object.keys(players).length; i++){
        var curr = Object.keys(players)[i];
        if (curr == playerID){
            // delete circle from world
            World.remove(world, players[curr].body); // or players[i].body?
            // remove from dict of current players
            console.log('deleting player: ', playerID)
            delete players[playerID];
        }
    }
});






