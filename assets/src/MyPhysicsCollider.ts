// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class MyPhysicsCollider extends cc.PhysicsPolygonCollider {

    lineWidth: number = 10;

    _createShape()
    {
        let shapes = [];

        let polys = this.points;
        let offset = this.offset;
        let polyIdx = 0;
        for (let i = 0; i < polys.length - 1; i++)
        {
            let posBegin = polys[i];
            let posEnd = polys[i + 1];
            let linelen = posBegin.sub(posEnd).mag();
            let angle = Math.atan2(posEnd.y - posBegin.y, posEnd.x - posBegin.x) - Math.PI / 2;
            let midPos = posBegin.add(posEnd).mul(0.5);

            // @ts-ignore
            let shape = new b2.PolygonShape();

            if (shape)
            {
                // @ts-ignore
                shape.SetAsBox(this.lineWidth / 2 / 32, linelen / 2 / 32, new b2.Vec2(midPos.x / 32, midPos.y / 32), angle);
                shapes.push(shape);
            }
        }

        return shapes;
    }
}
