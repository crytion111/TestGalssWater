// author: http://lamyoung.com/


import MyPhysicsCollider from "./MyPhysicsCollider";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {

    @property(cc.Camera)
    camera_water: cc.Camera = null;

    @property(cc.Sprite)
    sp_water_show: cc.Sprite = null;

    @property(cc.Node)
    node_water_layer: cc.Node = null

    @property(cc.Node)
    node_generate: cc.Node = null

    @property(cc.Prefab)
    prefab_water: cc.Node = null;


    private _water_pool: cc.Node[] = [];
    private _water_pool_active: cc.Node[] = [];

    touchStartPoint: cc.Vec2 = null;
    bIsTouchMoved: boolean = false;

    @property(cc.Prefab)
    graphicsNode: cc.Prefab = null;

    line_point: cc.Vec2[] = [];

    curGrNode: cc.Node = null;
    AllGrNodeArr: cc.Node[] = [];

    onLoad()
    {

        cc.director.getPhysicsManager().enabled = true;
        // cc.director.getPhysicsManager().debugDrawFlags = 1;

        const texture = new cc.RenderTexture();
        texture.initWithSize(this.sp_water_show.node.width, this.sp_water_show.node.height);
        const spriteFrame = new cc.SpriteFrame();
        spriteFrame.setTexture(texture);
        this.camera_water.targetTexture = texture;
        this.sp_water_show.spriteFrame = spriteFrame;

        this.bIsTouchMoved = false;
        this.CreatAGrNode();

        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    private _waterGenrateCount = 0;

    private generateWater()
    {
        this.resetWater();
        for (let index = 0; index < 1000; index++)
        {
            let node_water = this._water_pool.shift();
            if (!node_water)
            {
                node_water = cc.instantiate(this.prefab_water);
                this.node_water_layer.addChild(node_water);
            }
            node_water.active = false;
            node_water.scale = 0.5;
            node_water.x = Math.random() * 10 - 5 + this.node_generate.x;
            node_water.y = this.node_generate.y;
            node_water.getComponent(cc.RigidBody).linearVelocity = cc.v2();
            this._water_pool_active.push(node_water);
        }
        this._waterGenrateCount = 0;
        this.schedule(this.scheduleWater, 0.02, this._water_pool_active.length - 1);
    }

    private scheduleWater()
    {
        this._water_pool_active[this._waterGenrateCount++].active = true;
    }

    private resetWater()
    {
        this.unschedule(this.scheduleWater);
        this._water_pool_active.forEach((v) =>
        {
            v.active = false;
            this._water_pool.push(v)
        })
        this._water_pool_active = [];
    }

    ResetGame()
    {
        this.resetWater();

        this.AllGrNodeArr.forEach((node)=>{
            node.removeFromParent();
            node.destroy();
        })
        this.AllGrNodeArr = [];
        this.CreatAGrNode();
    }

    onTouchStart(touch: cc.Touch)
    {
        let touchPos = touch.getLocation();
        this.touchStartPoint = this.node_water_layer.convertToNodeSpaceAR(touchPos)
        this.line_point = [];
        this.curGrNode.getComponent(cc.Graphics).clear();
        this.curGrNode.getComponent(cc.Graphics).moveTo(this.touchStartPoint.x, this.touchStartPoint.y);
        this.line_point.push(cc.v2(this.touchStartPoint.x, this.touchStartPoint.y));
    }

    onTouchMove(touch: cc.Touch)
    {
        if (!this.touchStartPoint)
        {
            return;
        }
        this.bIsTouchMoved = true;
        let touchPos = this.node_water_layer.convertToNodeSpaceAR(touch.getLocation());

        this.curGrNode.getComponent(cc.Graphics).lineTo(touchPos.x, touchPos.y);
        this.line_point.push(cc.v2(touchPos.x, touchPos.y));
        this.curGrNode.getComponent(cc.Graphics).stroke();
    }

    onTouchEnd(touch: cc.Touch)
    {
        if (!this.touchStartPoint)
        {
            return;
        }
        if (!this.bIsTouchMoved)
        {
            return;
        }

        this.DrawPathOver();
        this.bIsTouchMoved = false;

        this.CreatAGrNode();
    }

    // 把本次划过的路线做成物理节点
    DrawPathOver()
    {
        let rigibodyLogic = this.curGrNode.addComponent(cc.RigidBody);
        rigibodyLogic.gravityScale = 2;

        let physicsLine = this.curGrNode.addComponent(MyPhysicsCollider);
        // physicsLine.lineWidth = 10;
        physicsLine.lineWidth = this.curGrNode.getComponent(cc.Graphics).lineWidth;
        physicsLine.points = this.line_point;
        physicsLine.friction = 0.2;
        physicsLine.density = 1;
        physicsLine.apply();
    }

    CreatAGrNode()
    {
        this.curGrNode = cc.instantiate(this.graphicsNode);
        this.node_water_layer.addChild(this.curGrNode)

        this.AllGrNodeArr.push(this.curGrNode);
    }
}
