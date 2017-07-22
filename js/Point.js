/**
 * Created by Ian Nastajus on 7/22/2017.
 */

/**
 * Creates new point for graphing.
 *
 * @param {[Number]} xs
 * @param {Number} y
 */
function Point(xs, y) {

    if (!Array.isArray(xs)) {
        throw new TypeError("XS is not an array.");
    }

    this.xs = xs;
    this.y = y;

    this.customString;

    Point.maxX = Math.ceil((CANVAS_WIDTH / CANVAS_SCALE) / CANVAS_SCALE) * CANVAS_SCALE;
    Point.maxY = Math.ceil((CANVAS_HEIGHT / CANVAS_SCALE) / CANVAS_SCALE) * CANVAS_SCALE;

    //poorly designed counter for rapid disambiguation for debugging
    // Point.counter = (Point.counter === undefined) ? 0 : ++Point.counter;
    // this.count = Point.counter;
}

Point.prototype.toString = function () {
    const result = (this.customString === undefined) ? printPoint(this) : this.customString;
    return /*"[" + this.count + "] " + */ result;
};