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

    this.Print = (decimals) => {
        if (decimals) {
            return "P" + /*counter +*/ "(" + round(this.xs[Graph.dimensionXSelected], decimals) + ", " + round(this.y, decimals) + ")";
        }
        return "(" + this.xs[Graph.dimensionXSelected] + ", " + this.y + ")";
    };

    this.PrintFull = (decimals) => {
        let rs = "[";
        for (let x of xs) {
            if (decimals) {
                rs += round(x, decimals) + ", ";
            }
            else {
                rs += x + ", ";
            }
        }
        rs = rs.substr(0, rs.lastIndexOf(", ")) + "]";

        return "(" + rs + ", " + this.y + ")";
    };

    /**
     * Convert from Cartesian point system to Canvas pixel system, and while incorporating which x dimension is used.
     * Reverses vertical dimension.
     *
     * @param dimension
     * @returns {{x: number, y: number}}
     * @param graph
     */
    this.GetDataToCanvas = (dimension, graph) => (
        graph.GetPlaneToCanvas(graph.GetDataToPlane({x: this.xs[dimension], y: this.y}, DATA_DECIMALS_ACCURACY, false), false)
    );

}