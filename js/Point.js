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
    //     return "(" + this.xs[graphs[0].dimensionXSelected] + ", " + this.y + ")";
    // };

    DataPoint.prototype.Print = (decimals) => {
        if (decimals) {
            return "P" + /*counter +*/ "(" + round(this.xs[graphs[0].dimensionXSelected], decimals) + ", " + round(this.y, decimals) + ")";
        }
        return "(" + this.xs[graphs[0].dimensionXSelected] + ", " + this.y + ")";
    };

    // DataPoint.counter = DataPoint.counter || 0;
    // let counter = ++DataPoint.counter;


    /**
     * Convert from Cartesian point system to Canvas pixel system, and while incorporating which x dimension is used.
     * Reverses vertical dimension.
     *
     * @param dimension
     * @returns {{x: number, y: number}}
     * @param graph
     */
    this.GetCanvasPoint = (dimension, graph) => (
        Graph.GetPlaneToCanvas(Model.GetDataToPlane({x: this.xs[dimension], y: this.y}, DATA_DECIMALS_ACCURACY, false), false)
    );

}

/**
 * Creates new simple point, e.g. for graphing.
 *
 * @param {Number} x - simple x scalar
 * @param {Number} y - simple y scalar
 */
function SimplePoint(x, y) {

    if (Array.isArray(x)) {
        throw new TypeError("X cannot be an array.");
    }

    this.x = x;
    this.y = y;

    SimplePoint.maxCanvasX = Math.ceil((CANVAS_WIDTH / CANVAS_SCALE) / CANVAS_SCALE) * CANVAS_WIDTH;
    SimplePoint.maxCanvasY = Math.ceil((CANVAS_HEIGHT / CANVAS_SCALE) / CANVAS_SCALE) * CANVAS_HEIGHT;

    // this.PrintPoint = () => {
    //     return "(" + this.x + ", " + this.y + ")";
    // };

    SimplePoint.prototype.toString = (decimals) => {
        if (decimals) {
            return "(" + round(this.x, decimals) + ", " + round(this.y, decimals) + ")";
        }
        return "(" + this.x + ", " + this.y + ")";
    };

    /**
     * Convert from Simple point system to Canvas pixel system, and while incorporating which x dimension is used.
     * Reverses vertical dimension.
     *
     * @returns {{x: number, y: number}}
     */
    this.GetCanvasPoint = (graph) => (
        Graph.GetPlaneToCanvas(Model.GetDataToPlane({x: this.x, y: this.y}, DATA_DECIMALS_ACCURACY, false), false)
    );


    SimplePoint.Add = (p1, p2) => {
        return new SimplePoint(p1.x + p2.x, p1.y + p2.y);
    };
}