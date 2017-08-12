/**
 * Created by Ian Nastajus on 7/24/2017.
 */

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
    this.GetDataToCanvas = (graph) => (
        graph.GetPlaneToCanvas(graph.GetDataToPlane({x: this.x, y: this.y}, 4, false), false)
    );
    // function GetDataToCanvas (graph) {
    //     let planeCoordinates = Model.GetDataToPlane({x: this.x, y: this.y}, 4, false);
    //     let canvasCoordinates = this.GetPlaneToCanvas(planeCoordinates, false);
    //     return canvasCoordinates;
    // }


    //Todo: understand root cause of intermittent issue: Uncaught TypeError: SimplePoint.Add is not a function.
    //SimplePoint.prototype.Add = function (p1, p2){
    SimplePoint.Add = (p1, p2) => {
        return new SimplePoint(p1.x + p2.x, p1.y + p2.y);
    };
}