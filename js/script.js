var BodyType = {
    Earth: 1,
    Meteor: 2,
    Satellite: 3,
    Bullet: 4
}

function body(mass, x, y, type, src) {
    var img = window.document.createElement("img");

    img.setAttribute('src', src);
    img.setAttribute('style', 'position: absolute;');


    return {
        Mass: mass,
        x: x,
        y: y,
        DirectionX: 0,
        DirectionY: 0,
        Type: type,
        Update: null,
        Dom: img,
        Forces: [],
        ForceFactors: [],
        Distance: function (object) {
            var distanceX = this.DistanceX(object);
            var distanceY = this.DistanceY(object);
            return Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));
        },

        DistanceY: function (object) {
            return Math.abs(Math.abs(this.y) - Math.abs(object.y));
        },

        DistanceX: function (object) {
            return Math.abs(Math.abs(this.x) - Math.abs(object.x));
        },

        OnCollision: function (object) {
            //If two meteors collide
            if (this.Type == BodyType.Meteor && object.Type == BodyType.Meteor) {
                this.ForceFactors.push(object.Mass);

            } //if a bullet hits a meteor 
            else if (this.Type == BodyType.Meteor && object.Type == BodyType.Bullet ||
                        this.Type == BodyType.Bullet && object.Type == BodyType.Meteor) {

                if (this.Dom) window.document.body.removeChild(this.Dom);
                if (object.Dom) window.document.body.removeChild(object.Dom);

                object.Dom = null;
                this.Dom = null;
                engine.CreateMeteors();

            } //If a meteor his the earth
            else if (this.Type == BodyType.Meteor && object.Type == BodyType.Earth ||
                        this.Type == BodyType.Earth && object.Type == BodyType.Meteor) {
                engine.GameOver();

            } //If a meteor hits the satellite
            else if (this.Type == BodyType.Meteor && object.Type == BodyType.Satellite ||
                        this.Type == BodyType.Satellite && object.Type == BodyType.Meteor) {
                engine.GameOver();
            }
        },

        ForcesX: function () {
            var x = 0;
            for (var i = 0; i < this.Forces.length; i++) {
                var force = this.Forces[i];
                x += force.x;
            }
            return x;
        },

        ForcesY: function () {
            var y = 0;
            for (var i = 0; i < this.Forces.length; i++) {
                var force = this.Forces[i];
                y += force.y;
            }
            return y;
        },

        UpdatePosition: function () {
            var x = this.ForcesX();
            var y = this.ForcesY();

            this.DirectionX = x / Math.abs(x);
            this.DirectionY = y / Math.abs(y);

            this.x = this.x + x;
            this.y = this.y + y;
        },

        DetectCollision: function () {
            for (var i = 0; i < engine.SpaceObjects.length; i++) {
                var object = engine.SpaceObjects[i];
                var collided = false;

                if (this.Type == BodyType.Satellite && object.Type == BodyType.Earth
                    || this.Type == BodyType.Earth && object.Type == BodyType.Satellite) {
                    continue;
                }


                if (this.Type == BodyType.Earth) {
                    collided = engine.Collided(this, object, 20);
                }
                else if (object.Type == BodyType.Earth) {
                    collided = engine.Collided(object, this, 20);
                }
                else
                    collided = engine.Collided(object, this, 20);

                if (collided) {
                    this.OnCollision(object);
                    object.OnCollision(this);
                }
            }
        }
    }
}

var engine = (function (win, interval) {
    var bag = [];
    var collided = function (Object1, Object2, threshold) {
        /*
        dot1-----dot2
        |        |
        |        |
        dot3-----dot4
        
        */
        var dot11 = { x: Object1.x, y: Object1.y };
        var dot12 = { x: Object1.x + threshold, y: Object1.y };
        var dot13 = { x: Object1.x, y: Object1.y + threshold };
        var dot14 = { x: Object1.x + threshold, y: Object1.y + threshold };

        var dot21 = { x: Object2.x, y: Object2.y };
        var dot22 = { x: Object2.x + threshold, y: Object2.y };
        var dot23 = { x: Object2.x, y: Object2.y + threshold };
        var dot24 = { x: Object2.x + threshold, y: Object2.y + threshold };

        //Collision 1
        var collision1 = dot11.x >= dot21.x && dot11.x >= dot23.x
                        && dot11.x <= dot22.x && dot11.x <= dot24.x
                        && dot11.y >= dot21.y && dot11.y >= dot22.y
                        && dot11.y <= dot23.y && dot11.y <= dot24.y;

        //Collision 2
        var collision2 = dot12.x >= dot21.x && dot12.x >= dot23.x
                        && dot12.x <= dot22.x && dot12.x <= dot24.x
                        && dot12.y >= dot21.y && dot12.y >= dot22.y
                        && dot12.y <= dot23.y && dot12.y <= dot24.y;

        //Collision 3
        var collision3 = dot13.x >= dot21.x && dot13.x >= dot23.x
                        && dot13.x <= dot22.x && dot13.x <= dot24.x
                        && dot13.y >= dot21.y && dot13.y >= dot22.y
                        && dot13.y <= dot23.y && dot13.y <= dot24.y;

        //Collision 4
        var collision4 = dot14.x >= dot21.x && dot14.x >= dot23.x
                        && dot14.x <= dot22.x && dot14.x <= dot24.x
                        && dot14.y >= dot21.y && dot14.y >= dot22.y
                        && dot14.y <= dot23.y && dot14.y <= dot24.y;


        return collision1 || collision2 || collision3 || collision4;
    };

    win.document.onkeydown = function (evt) {
        for (var i = 0; i < bag.length; i++) {
            if (bag[i].OnKeyDown) {
                bag[i].OnKeyDown(evt);
            }
        }
    };

    return {
        Collided: collided,
        CenterX: function () { return (this.ScreenWidth() / 2); },
        CenterY: function () { return (this.ScreenHeight() / 2); },
        RefreshRate: interval,
        GameOver: function () {
            this.Stop();
            this.SetTitle("Game over");
        },

        //Raws a body in the space
        Draw: function (b) {
            if (!b.Dom) return;
            b.Dom.style.top = b.y + "px";
            b.Dom.style.left = b.x + "px";
        },

        //Screen width
        ScreenWidth: function () { return parseInt(win.document.documentElement.clientWidth); },

        //Screen heigth
        ScreenHeight: function () { return parseInt(win.document.documentElement.clientHeight); },

        //Add a new object to the bag
        AddObject: function (object) {
            bag.push(object);
            win.document.body.appendChild(object.Dom);
            this.Draw(object);
        },

        GarbageCollect: function () {
            var newObjects = [];
            for (var i = 0; i < bag.length; i++) {
                if (bag[i].Dom) newObjects.push(bag[i]);
            }
            bag = newObjects;
            this.SpaceObjects = bag;
        },

        //Thread that updates the postion obj every object in the bag
        Start: function (levels) {
            this.Levels = levels;
            this.LevelCounter = 0;
            this.PlayLevel();
        },

        SetTitle: function (message) {
            var title = win.document.getElementsByTagName("h1")[0];
            title.innerText = message;
        },

        PlayLevel: function () {
            this.CurrentLevel = this.Levels[this.LevelCounter++];
            this.SetTitle(this.CurrentLevel.Name);

            for (var i = 0; i < this.CurrentLevel.Initial; i++) {
                this.CreateMeteor(this.CurrentLevel);
            }

            this.Interval = setInterval(function () {
                for (var i = 0; i < bag.length; i++) {
                    if (bag[i].Type == BodyType.Meteor) {
                        engine.GravitateMeteor(bag[i]);
                    }

                    if (bag[i].Update)
                        bag[i].Update(this);

                    engine.Draw(bag[i]);
                }

                if (engine.CurrentLevel.Counter >= engine.CurrentLevel.Max) {
                    console.log("Level completed");
                    //Delete all the meteors
                    for (var i = 0; i < bag.length; i++) {
                        if (bag[i].Type == BodyType.Meteor) {
                            if (bag[i].Dom) win.document.body.removeChild(bag[i].Dom);
                            bag[i].Dom = null;
                        }
                    }
                }
                engine.GarbageCollect();

            }, interval);
        },

        //Instance of the interval created in the method Start()
        Interval: null,

        //Stops the game
        Stop: function () {
            clearInterval(this.Interval);
            engine.Interval = null;
        },

        SpaceObjects: bag,

        GravitateMeteor: function (meteor) {
            var meteorForces = [];

            //Forces by meteors
            for (var i = 0; i < engine.SpaceObjects.length; i++) {
                var object = engine.SpaceObjects[i];
                var distanceX = meteor.DistanceX(object);
                var distanceY = meteor.DistanceY(object);
                var distanceTotal = meteor.Distance(object);

                if (distanceTotal == 0) continue;

                var force = (meteor.Mass * object.Mass) / distanceTotal;

                //Determines how big will be the hop for the current meteor
                var hop = force / meteor.Mass;

                var directionX = 0;
                var directionY = 0;

                if (object.x > meteor.x)
                    directionX = 1;
                else if (object.x < meteor.x)
                    directionX = -1

                if (object.y > meteor.y)
                    directionY = 1;
                else if (object.y < meteor.y)
                    directionY = -1;

                meteorForces.push({
                    x: hop * directionX,
                    y: hop * directionY,
                    Source: "Meteor"
                });
            }

            //Forces by other factors
            for (var i = 0; i < meteor.ForceFactors.length; i++) {

                var factor = meteor.ForceFactors[i];
                if (factor <= 0) continue;

                var hop = factor / meteor.Mass;

                var directionX = meteor.DirectionX;
                var directionY = meteor.DirectionY;

                meteor.ForceFactors[i] -= hop;

                meteorForces.push({
                    x: hop * directionX * -1,
                    y: hop * directionY * -1,
                    Source: "Other"
                });
            }

            meteor.Forces = meteorForces; //new set of forces
            meteor.UpdatePosition();
            meteor.DetectCollision();
        },

        CreateMeteor: function (level) {
            var mass = 10 + parseInt(Math.floor(Math.random() * 20));
            var x = engine.CenterX() - parseInt(Math.floor(Math.random() * parseInt(engine.ScreenWidth())));
            var y = engine.CenterY() - parseInt(Math.floor(Math.random() * parseInt(engine.ScreenHeight())));
            var meteor = new body(mass, x, y, BodyType.Meteor, "./img/Meteor.gif");

            engine.AddObject(meteor);
            level.Counter += 1;
        },

        CreateMeteors: function () {
            for (var i = 0; i < this.CurrentLevel.Step; i++) {
                if (this.CurrentLevel.Counter <= this.CurrentLevel.Max)
                    this.CreateMeteor(this.CurrentLevel);
            }
        }

    } //end return

})(window, 10);

engine.AddObject(new body(200, engine.CenterX(), engine.CenterY(), BodyType.Earth, "./img/Earth.gif"));

var myShip = new body(10, engine.CenterX() + 7, engine.CenterY() + 7, BodyType.Satellite, "./img/Satellite.gif");
myShip.Angle = 0;
myShip.AngularSpeed = 5; //10° per second

myShip.Update = function (container) {
    this.Angle += (this.AngularSpeed * (engine.RefreshRate / 1000));
    this.x = engine.CenterX() + 100 * Math.cos(this.Angle);
    this.y = engine.CenterY() + 100 * Math.sin(this.Angle);
}

myShip.Shot = function () {
    var x = this.x;
    var y = this.y;
    var r = 100;
    var angle = this.Angle;

    var bullet = new body(1, x, y, BodyType.Bullet, "./img/Bullet.gif");

    var F = bullet.Mass * Math.pow(this.AngularSpeed, 2) * r;

    bullet.ForceFactors.push(F);
    
    bullet.Update = function (container) {
        var factor = this.ForceFactors[0];
        if (factor <= 0) {
            if (this.Dom) window.document.body.removeChild(this.Dom);
            this.Dom = null;
            return;
        }
        r += 4;
        this.ForceFactors[0] -= 1;
        this.x = engine.CenterX() + r * Math.cos(angle); ;
        this.y = engine.CenterY() + r * Math.sin(angle); ;
    }

    engine.AddObject(bullet);
}

myShip.OnKeyDown = function (evt) {
    switch (evt.keyCode) {
        case 32: //Space bar
            this.Shot();
            break;
    }
}

engine.AddObject(myShip);

engine.Start([
    { Name: "Warming up!", Initial: 110, Max: 120, Step: 1, Counter: 0 },
    { Name: "Suck it bitch!", Initial: 1, Max: 3, Step: 1, Counter: 0 },
    { Name: "Holly shit!!!", Initial: 1, Max: 3, Step: 1, Counter: 0 }
]);
