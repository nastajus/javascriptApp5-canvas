/**
 * Created by Ian Nastajus on 7/22/2017.
 */

/**
 * Creates new point for graphing.
 *
 * @param {[Number]} xs - the features; independent variables
 * @param {Number} y - the known cost; labeled variable;
 */
function Point(xs, y) {

    if (!Array.isArray(xs)) {
        throw new TypeError("XS features is not an array.");
    }

    this.xs = xs;
    this.y = y;

    Point.maxX = Math.ceil((CANVAS_WIDTH / CANVAS_SCALE) / CANVAS_SCALE) * CANVAS_SCALE;
    Point.maxY = Math.ceil((CANVAS_HEIGHT / CANVAS_SCALE) / CANVAS_SCALE) * CANVAS_SCALE;

    //poorly designed counter for rapid disambiguation for debugging
    // Point.counter = (Point.counter === undefined) ? 0 : ++Point.counter;
    // this.count = Point.counter;
}

Point.prototype.toString = function () {
    return printPoint(this);
};