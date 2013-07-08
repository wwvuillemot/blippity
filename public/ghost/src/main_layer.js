// 1
var audioEngine = cc.AudioEngine.getInstance();

var MainLayer = cc.LayerColor.extend({
    _projectiles:[],
    _monsters:[],
    _player:null,
    _monstersDestroyed:0,
    // 2
    ctor:function() {
        this._super();
 
        // 3
        cc.associateWithNative( this, cc.LayerColor );
    },
 
    // 4
    onEnter:function () {
        this._super();
        
        if( 'touches' in sys.capabilities ) {
            this.setTouchEnabled(true);
        }
        if( 'mouse' in sys.capabilities ) {
            this.setMouseEnabled(true);
        }
 
        // 5
        this._player = cc.Sprite.create(res_player);
 
        // 6
        this._player.setPosition(this._player.getContentSize().width / 2, winSize.height / 2);
 
        // 7
        this.addChild(this._player);
        this.schedule(this.gameLogic, 3);
        this.scheduleUpdate();
        audioEngine.playMusic(snd_bgMusic, true);
    },
    
    addMonster:function() {
 
        var monster = cc.Sprite.create(res_monster);
 
        // Determine where to spawn the monster along the Y axis
        var minY = monster.getContentSize().height / 2;
        var maxY = winSize.height - monster.getContentSize().height / 2;
        var rangeY = maxY - minY;
        var actualY = (Math.random() * rangeY) + minY; // 1
 
        // Create the monster slightly off-screen along the right edge,
        // and along a random position along the Y axis as calculated above
        monster.setPosition(winSize.width + monster.getContentSize().width/2, actualY);
        this.addChild(monster); // 2
 
        // Determine speed of the monster
        var minDuration = 2.0;
        var maxDuration = 4.0;
        var rangeDuration = maxDuration - minDuration;
        var actualDuration = (Math.random() % rangeDuration) + minDuration;
 
        // Create the actions
        var actionMove = cc.MoveTo.create(actualDuration, cc.p(-monster.getContentSize().width/2, actualY)); // 3
        var actionMoveDone = cc.CallFunc.create(function(node) { // 4
            cc.ArrayRemoveObject(this._monsters, node); // 5
            node.removeFromParent();
            var scene = GameOver.scene(false);
            cc.Director.getInstance().replaceScene(scene);
        }, this); 
        monster.runAction(cc.Sequence.create(actionMove, actionMoveDone));
 
        // Add to array
        monster.setTag(1);
        this._monsters.push(monster); // 6
 
    },
    
    gameLogic:function(dt) {
        this.addMonster();
    },
    
    locationTapped:function(location) {
        // Set up initial location of the projectile
        var projectile = cc.Sprite.create(res_projectile);
        projectile.setPosition(20, winSize.height/2);
 
        // Determine offset of location to projectile
        var offset = cc.pSub(location, projectile.getPosition()); // 1
 
        // Bail out if you are shooting down or backwards
        if (offset.x <= 0) return;
 
        // Ok to add now - we've double checked position
        this.addChild(projectile);
 
        
        // Figure out final destination of projectile
        var realX = winSize.width + (projectile.getContentSize().width / 2);
        var ratio = offset.y / offset.x;
        var realY = (realX * ratio) + projectile.getPosition().y;
        var realDest = cc.p(realX, realY);
        
        // Determine the length of how far you're shooting
        var offset = cc.pSub(realDest, projectile.getPosition());
        var length = cc.pLength(offset);
        var velocity = 480.0;
        var realMoveDuration = length / velocity;
 
        // Determine angle to face
        var angleRadians = Math.atan( offset.y / offset.x );
        var angleDegrees = angleRadians * 180.0 / Math.PI;
        var cocosAngle = -1 * angleDegrees;
        //this._player.setRotation( cocosAngle );     
        var duration = 0.1;  
        
        var rotateDegreesPerSecond = 180 / 0.5; // Would take 0.5 seconds to rotate 180 degrees, or half a circle
        var degreesDiff    = this._player.getRotation() - cocosAngle;
        var rotateDuration = Math.abs(degreesDiff / rotateDegreesPerSecond);

        // Move projectile to actual endpoint
        projectile.runAction(cc.Sequence.create( // 2
            cc.MoveTo.create(realMoveDuration, realDest),
            cc.CallFunc.create(function(node) {
                cc.ArrayRemoveObject(this._projectiles, node);
                node.removeFromParent();
            }, this)
        ));
                
        this._player.runAction(cc.Sequence.create(
          cc.RotateTo.create( rotateDuration, cocosAngle),
          cc.CallFunc.create( function(node) {
            projectile.setTag(2);
            this._projectiles.push(projectile);
            audioEngine.playEffect(snd_shootEffect);
          }, this)
        ));
        
        // Add to array
    },
 
    onMouseUp:function (event) {
        var location = event.getLocation();
        this.locationTapped(location);
    },
 
    onTouchesEnded:function (touches, event) {
        if (touches.length <= 0)
            return;
        var touch = touches[0];
        var location = touch.getLocation();
        this.locationTapped(location);
    },
    
    update:function (dt) {
        for (var i = 0; i < this._projectiles.length; i++) {
            var projectile = this._projectiles[i];
            for (var j = 0; j < this._monsters.length; j++) {
                var monster = this._monsters[j];
                var projectileRect = projectile.getBoundingBox();
                var monsterRect = monster.getBoundingBox();
                if (cc.rectIntersectsRect(projectileRect, monsterRect)) {
                    cc.log("collision!");
                    cc.ArrayRemoveObject(this._projectiles, projectile);
                    projectile.removeFromParent();
                    cc.ArrayRemoveObject(this._monsters, monster);
                    monster.removeFromParent();  
                    this._monstersDestroyed++;
                    if (this._monstersDestroyed >= 2) {
                        var scene = GameOver.scene(true);
                        cc.Director.getInstance().replaceScene(scene);
                    }              
                }
            }
        }
    }    
 
});

// 1
MainLayer.create = function () {
    var sg = new MainLayer();
    if (sg && sg.init(cc.c4b(255, 255, 255, 255))) {
        return sg;
    }
    return null;
};
 
// 2
MainLayer.scene = function () {
    var scene = cc.Scene.create();
    var layer = MainLayer.create();
    scene.addChild(layer);
    return scene;
};