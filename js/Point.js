/**
 * Created by Ian Nastajus on 7/22/2017.
 */

/**
 * Creates new data point for graphing. These are composed of multidimensional xs (features), not just one x value.
 *
 * @param {[Number]} xs - the features; independent variables
 * @param {Number} y - the known cost; labeled variable;
 */
function DataPoint(xs, y) {

    if (!Array.isArray(xs)) {
        throw new TypeError("XS features is not an array.");
    }

    this.xs = xs;
    this.y = y;

    // this.PrintPoint = () => {
    //     return "(" + this.xs[graphs[0].currentlySelectedDimension] + ", " + this.y + ")";
    // };

    DataPoint.prototype.toString = (decimals) => {
        if (decimals) {
            return "P"+ counter +"(" + round(this.xs[graphs[0].currentlySelectedDimension], decimals) + ", " + round(this.y, decimals) + ")";
        }
        return "(" + this.xs[graphs[0].currentlySelectedDimension] + ", " + this.y + ")";
    };

    //DataPoint.counter = !DataPoint.counter ? 0 : ++DataPoint.counter;
    DataPoint.counter = DataPoint.counter || 0;
    let counter = ++DataPoint.counter;
}

/**
 * Creates new simple grid point for graphing.
 *
 * @param {Number} x - simple x scalar
 * @param {Number} y - simple y scalar
 */
function CanvasPoint(x, y) {

    if (Array.isArray(x)) {
        throw new TypeError("X cannot be an array.");
    }

    this.x = x;
    this.y = y;

    CanvasPoint.maxX = Math.ceil((CANVAS_WIDTH / CANVAS_SCALE) / CANVAS_SCALE) * CANVAS_SCALE;
    CanvasPoint.maxY = Math.ceil((CANVAS_HEIGHT / CANVAS_SCALE) / CANVAS_SCALE) * CANVAS_SCALE;

    // this.PrintPoint = () => {
    //     return "(" + this.x + ", " + this.y + ")";
    // };

    CanvasPoint.prototype.toString = (decimals) => {
        if (decimals) {
            return "(" + round(this.x, decimals) + ", " + round(this.y, decimals) + ")";
        }
        return "(" + this.x + ", " + this.y + ")";
    };
}