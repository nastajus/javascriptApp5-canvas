/**
 * Created by Ian Nastajus on 7/22/2017.
 */


/**
 * Basic Line concept, defined as only between two end points.
 */
function Line(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
}

/**
 * Lines are defined with two SimplePoint in Canvas pixel units.
 *
 * @param {Graph} graph
 * @param {String} graphDimension
 */
function AxisLine (graph, graphDimension) {

    this.p1 = {};
    this.p2 = {};
    // this.a1 = [];
    // this.a2 = [];

    if (graphDimension === "x") {
        /**
         * only works occasionally on first invocation from IDE, usually failing, and always failing on all subsequent refreshes.
         * suspect a problem with understanding involving any of: SimplePoint instantiation, this, context, new, bind, etc.
         */

        // this.p1 = SimplePoint.Add(new SimplePoint(0, 0), graph.canvasOriginShift);
        // this.p2 = SimplePoint.Add(new SimplePoint(SimplePoint.maxCanvasX, 0), graph.canvasOriginShift);

        this.p1 = new SimplePoint(0 + graph.canvasOriginShift.x, 0 + graph.canvasOriginShift.y);
        this.p2 = new SimplePoint(SimplePoint.maxCanvasX + graph.canvasOriginShift.x, 0 + graph.canvasOriginShift.y);


        // this.a1.push(new AxisArrows(this.p1, "left"));
        // this.a2.push(new AxisArrows(this.p2, "right"));
    }
    else if (graphDimension === "y") {
        // this.p1 = SimplePoint.Add(new SimplePoint(0, 0), graph.canvasOriginShift);
        // this.p2 = SimplePoint.Add(new SimplePoint(0, SimplePoint.maxCanvasY), graph.canvasOriginShift);

        this.p1 = new SimplePoint(0 + graph.canvasOriginShift.x, 0 + graph.canvasOriginShift.y);
        this.p2 = new SimplePoint(0 + graph.canvasOriginShift.x, SimplePoint.maxCanvasY + graph.canvasOriginShift.y);

        // this.a1.push(new AxisArrows(this.p1, "down"));
        // this.a2.push(new AxisArrows(this.p2, "up"));

    }
    Line.call(this, this.p1, this.p2);




    // /**
    //  *
    //  * @param point
    //  * @param arrowDirection
    //  */
    // function AxisArrows(point, arrowDirection) {
    //
    //     let off = [[1 / 2, 1 / 2], [1 / 2, 1 / 2]]; //offset
    //     let dir; //direction
    //
    //     switch (arrowDirection) {
    //         case "right":
    //             dir = [[-1, 1], [-1, -1]];
    //             break;
    //
    //         case "left":
    //             dir = [[1, 1], [1, -1]];
    //             break;
    //
    //         case "up":
    //             dir = [[1, -1], [-1, -1]];
    //             break;
    //
    //         case "down":
    //             dir = [[1, 1], [-1, 1]];
    //             break;
    //     }

    // this.pTip = point;
    // this.p1 = new SimplePoint(point.x + off[0][0] * dir[0][0], point.y + off[0][1] * dir[0][1]);
    // this.p2 = new SimplePoint(point.x + off[0][0] * dir[0][0], point.y + off[0][1] * dir[0][1]);

    //this.arrowTipBranch1 = new Line(this.pTip, this.p1);

    //this.arrowTipBranch2 = new Line(this.pTip, this.p2);

    //this.p1 = new Point(pTip.x + offset1x, pTip.y + offset1y);
    //this.p2 = new Point(pTip.x + offset2x, pTip.y + offset2y);
    //this.p2 = new Point(pTip.x + offset2x, pTip.y + offset2y);

    //if (arrowDirection === "")
    // }
}
