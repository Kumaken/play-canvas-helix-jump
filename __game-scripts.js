var Rotate=pc.createScript("plane_rotate");Rotate.attributes.add("cameraEntity",{type:"entity",title:"Camera Entity"}),Rotate.attributes.add("orbitSensitivity",{type:"number",default:.3,title:"Orbit Sensitivity",description:"How fast the camera moves around the orbit. Higher is faster"}),Rotate.prototype.initialize=function(){this.app.mouse.on(pc.EVENT_MOUSEMOVE,this.onMouseMove,this),this.lastTouchPoint=new pc.Vec2,this.app.touch&&(this.app.touch.on(pc.EVENT_TOUCHSTART,this.onTouchStart,this),this.app.touch.on(pc.EVENT_TOUCHMOVE,this.onTouchMove,this))},Rotate.horizontalQuat=new pc.Quat,Rotate.prototype.rotate=function(t,o){var e=Rotate.horizontalQuat,i=new pc.Vec3(0,1,0);e.setFromAxisAngle(i,t*this.orbitSensitivity),e.mul(this.entity.getRotation(),i),this.entity.setRotation(e)},Rotate.prototype.onTouchStart=function(t){var o=t.touches[0];this.lastTouchPoint.set(o.x,o.y)},Rotate.prototype.onTouchMove=function(t){var o=t.touches[0],e=o.x-this.lastTouchPoint.x;this.rotate(e,0),this.lastTouchPoint.set(o.x,0)},Rotate.prototype.onMouseMove=function(t){this.app.mouse.isPressed(pc.MOUSEBUTTON_LEFT)&&this.rotate(t.dx,t.dy)};// helixPartController.js
function generateRandomNumbers(n, ceil){
    const numbers = Array(ceil-1).fill().map((_, index) => index);
    numbers.sort(() => Math.random() - 0.5);
    var result = [];
    // var result =  numbers.slice(0, n);
    numbers.slice(0, n).forEach((idx) => {
        result.push(idx, idx+1);
    });
    // console.log(result);
    return result;
}

var helixPartController = pc.createScript('helixPartController');

// Script attributes:
helixPartController.attributes.add(
    'HelixPart', 
    { type: 'asset', assetType: 'template'}
);

helixPartController.attributes.add(
    'HelixPartDanger', 
    { type: 'asset', assetType: 'model'}
);

helixPartController.attributes.add(
    'HelixPartDangerMaterial', 
    { type: 'asset', assetType: 'material'}
);

// initialize code called once per entity
helixPartController.prototype.initialize = function() {
    // var templates = this.app.root.findByName('Templates');
    // var helixPart = this.app.root..findByName('HelixPart');
    
    var templateAsset = this.HelixPart;
    var angle = 30;
    var helixCount = Math.ceil(360/angle);
    
    var holes = generateRandomNumbers(3, helixCount-1);
    var dangers = generateRandomNumbers(2, helixCount-1);
    // holes.push(holes[0]+1);
    // console.log("holes", holes);
    for(var i = 0; i<helixCount; ++i){
        if(holes.includes(i))
            continue;
        var instance = templateAsset.resource.instantiate();
        // console.log(instance.children);
        var child = instance.children[0];
        // child.model.asset = this.HelixPartDanger;
        // Assign the material to all the mesh instances in the model
        // 
        // Change the color to red if danger!
        if(dangers.includes(i)){
            var meshInstances = child.model.meshInstances;
            meshInstances[0].material = this.HelixPartDangerMaterial.resource; 
            instance.findByName('HelixPartEntity').tags.add('Danger');
        }

        instance.position = new pc.Vec3(1.324, 0, -0.818);
        instance.rotate(0,angle*i,0);
        this.entity.addChild(instance);
    }
    
    // var entity = helixPart.clone();
//     var entity = new pc.Entity();
//     entity.addComponent("model", {
//         type: 'asset',
//         asset: 'HelixPart.glb'
//     });
    
    // Add it to the Entity hierarchy
   
};

// update code called every frame
helixPartController.prototype.update = function(dt) {
    
};

// swap method called for script hot-reloading
// inherit your script state here
// helixPartController.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

var Player=pc.createScript("player");Player.prototype.initialize=function(){this.app.on("game:gameOver",function(){this.entity.rigidbody.linearVelocity=pc.Vec3.ZERO,this.entity.rigidbody.angularVelocity=pc.Vec3.ZERO;var t=this.entity.getPosition();this.entity.rigidbody.teleport(new pc.Vec3(t.x,10,t.z))},this),this.entity.collision.on("collisionstart",this.onCollisionStart,this),this.entity.rigidbody&&this.entity.rigidbody.on("collisionstart",this.onCollisionStart,this)},Player.prototype.update=function(t){},Player.prototype.onCollisionStart=function(t){t.other.tags.has("Danger")&&(console.log("GameOver!!"),this.app.fire("game:gameOver",!0))};var Trigger=pc.createScript("trigger");Trigger.prototype.initialize=function(){this.entity.collision.on("triggerenter",this.onTriggerEnter,this)},Trigger.prototype.onTriggerEnter=function(r){r.tags.has("Ball")&&(console.log("PASSED!"),this.app.fire("score:incrementScore"))};// helixController.js
var HelixController = pc.createScript('helixController');

// Script attributes:
HelixController.attributes.add(
    'HelixLayer', 
    { type: 'asset', assetType: 'template'}
);

HelixController.attributes.add(
    'LoopTrigger', 
    { type: 'asset', assetType: 'template'}
);

// initialize code called once per entity
HelixController.prototype.initialize = function() {
    var upperHelix = [];
    var lowerHelix = [];
    var loopTriggers = [];
    this.verticalGap = -5;
    this.tags = {
        upper: 'Upper',
        lower: 'Lower'
    };
    // this.helix1 = null;
    // this.helix2 = null;
    // this.loopTrigger = null;

    var generateHelix = function(offset, tag) {
        var helixes = [];
        for(var i=0; i<2; i++){
            var helix = this.HelixLayer.resource.instantiate();
            helix.setPosition(new pc.Vec3(0, offset + i*this.verticalGap, 0));
            this.entity.addChild(helix);
            helixes.push(helix);
        }
        
        var loopTrigger =  this.LoopTrigger.resource.instantiate();
        loopTrigger.setPosition(new pc.Vec3(0, offset+this.verticalGap, 0));
        loopTrigger.findByName('LoopTrigger').tags.add(tag);
        this.entity.addChild(loopTrigger);
        helixes.push(loopTrigger);
        return helixes;
    };
    
    var resetHelix = function(helixes){
        helixes.forEach((entity) => {
            entity.destroy();
        });
        return [];
    };
    
    var resetHelixes = function () {
        upperHelix = resetHelix.call(this,upperHelix); // cannot use this.upperHelix? why??
        lowerHelix = resetHelix.call(this,lowerHelix);
        initializeHelix.call(this);
    };
    
    var loopHelix = function(offset, tag) {
        offset += this.verticalGap * 3;
        if(tag == this.tags.upper){
            resetHelix.call(this, upperHelix);
            upperHelix = generateHelix.call(this, offset, tag);
        }
        else {
            resetHelix.call(this, lowerHelix);
            lowerHelix = generateHelix.call(this, offset, tag);
        }
    };

    var initializeHelix = function(){
        upperHelix = generateHelix.call(this, 0, this.tags.upper); // pass this context (or u can use arrow funcs)
        lowerHelix = generateHelix.call(this, this.verticalGap*2, this.tags.lower);
    };

    initializeHelix.call(this);
    
    // listen for events:
    this.app.on('game:loop', loopHelix, this);
    this.app.on('game:gameOver', resetHelixes, this);
};

// update code called every frame
HelixController.prototype.update = function(dt) {
    
};

// swap method called for script hot-reloading
// inherit your script state here
// HelixController.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

var ScoreController=pc.createScript("scoreController");ScoreController.prototype.initialize=function(){this.score=0;this.app.on("score:incrementScore",function(){this.score+=1,this.entity.element.text=this.score},this),this.app.on("game:gameOver",function(){this.score=0,this.entity.element.text=this.score},this)},ScoreController.prototype.update=function(t){};var LoopTrigger=pc.createScript("loopTrigger");LoopTrigger.prototype.initialize=function(){this.entity.collision.on("triggerenter",this.onTriggerEnter,this)},LoopTrigger.prototype.onTriggerEnter=function(t){t.tags.has("Ball")&&(console.log("Looping Helix!"),console.log(this.entity.tags),this.entity.tags.has("Upper")?this.app.fire("game:loop",this.entity.getPosition().y,"Upper"):this.app.fire("game:loop",this.entity.getPosition().y,"Lower"))};var HelixCore=pc.createScript("helixCore");HelixCore.prototype.initialize=function(){this.coreOffset=-20;this.app.on("game:loop",function(t,e){if("Lower"==e){console.log("CoreOffset",t,this.coreOffset);var i=this.entity.getPosition();this.entity.rigidbody.teleport(new pc.Vec3(i.x,t+this.coreOffset,i.z))}},this),this.app.on("game:gameOver",function(){var t=this.entity.getPosition();this.entity.rigidbody.teleport(new pc.Vec3(t.x,0,t.z))},this)},HelixCore.prototype.update=function(t){};