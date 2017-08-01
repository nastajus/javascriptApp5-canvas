/**
 * Created by Ian Nastajus on 7/22/2017.
 */

const CANVAS_SCALE = 30;
let PLANE_TO_MODEL_RATIO;

/**
 * MVC = Model
 */
function Model(numDimensions) {

    this.numDimensions = numDimensions;
    this.dataPoints = [];
    this.hypothesisLine = {};
    this.derivativePoints = [];

    PLANE_TO_MODEL_RATIO = {x: CANVAS_SCALE, y: CANVAS_SCALE};

    /**
     * Determine secondary point on same y coordinate
     *
     * @param {DataPoint} point
     * @returns {DataPoint} point
     */
    this.CalculateShadowPoint = (point) => {
        const y = this.hypothesisLine.Evaluate(point.xs);
        return new DataPoint(point.xs, y);
    };

    /**
     * Display scalar amount of error.
     * @returns {number} totalError
     */
    this.GetTotalError = () => {

        let totalError = 0;

        for (let point of this.dataPoints) {
            let shadow = this.CalculateShadowPoint(point);
            let magnitude = Math.abs(shadow.y - point.y);
            totalError += magnitude;
        }
        return totalError;
    };

    this.BuildSampleDataPoints = () => {
        this.dataPoints.push(new DataPoint([1, 1], 1));
        // this.dataPoints.push(new DataPoint([1, 3], 4));
        // this.dataPoints.push(new DataPoint([1, 2], 5));
        // this.dataPoints.push(new DataPoint([1, 3], 6));
        // this.dataPoints.push(new DataPoint([1, 5], 5));
        // this.dataPoints.push(new DataPoint([1, 5], 9));
        // this.dataPoints.push(new DataPoint([1, 6], 4));
        // this.dataPoints.push(new DataPoint([1, 7], 7));
        // this.dataPoints.push(new DataPoint([1, 7], 8));
        // this.dataPoints.push(new DataPoint([1, 8], 7));
        // this.dataPoints.push(new DataPoint([1, 9], 9));
        // this.dataPoints.push(new DataPoint([1, 12], 8));
        // this.dataPoints.push(new DataPoint([1, 13], 9));
        // this.dataPoints.push(new DataPoint([1, 14], 7));
    };

    this.BuildSampleHypothesisLines = () => {
        this.hypothesisLine = new ComplexLine([0, 1]);
        this.hypothesisLine.name = "the hypothesis line";
    };

    this.BuildContourRing = () => {

    };


    /**
     * Find nearest element (for now just data points) within a range of 1 cartesian unit.
     *
     * @param {{x: Number, y: Number}} targetDataPosition
     * @param {Number} dimensionX
     * @param {Number} accuracyDataDistance
     * @returns {Array.<*>} foundPoints
     */
    this.findClosestDataPoints = (targetDataPosition, dimensionX, accuracyDataDistance) => {

        let foundPoints = this.dataPoints.filter(entry =>
            targetDataPosition.x > entry.xs[dimensionX] - accuracyDataDistance &&
            targetDataPosition.x <= entry.xs[dimensionX] + accuracyDataDistance &&
            targetDataPosition.y > entry.y - accuracyDataDistance &&
            targetDataPosition.y <= entry.y + accuracyDataDistance
        );

        return foundPoints;
    };

    /**
     * Converts from Plane pixel system, into the effective Data point scale system.
     * TODO: Deprecate entirely the ratio conversion approach, replace with some new way for real data.
     *
     * @param {{x: number, y: number}} planeCoordinates
     * @param {Number} graphDecimalsAccuracy
     * @param {Boolean} logThis
     * @returns {{x: number, y: number}} dataCoordinates
     */
    Model.GetPlaneToData = (planeCoordinates, graphDecimalsAccuracy, logThis) => {

        let dataPosition = {
            x: (planeCoordinates.x / PLANE_TO_MODEL_RATIO.x),
            y: (planeCoordinates.y / PLANE_TO_MODEL_RATIO.y)
        };

        dataPosition = (graphDecimalsAccuracy) ? {
            x: round(dataPosition.x, graphDecimalsAccuracy),
            y: round(dataPosition.y, graphDecimalsAccuracy)
        } : dataPosition;

        //Todo: enhance to display axis names
        if (logThis){
            console.log("dataPosition: " + JSON.stringify(dataPosition));
        }

        return dataPosition;
    };

    /**
     * Converts from Plane pixel system, into the effective Data point scale system.
     * TODO: Deprecate entirely the ratio conversion approach, replace with some new way for real data.
     *
     * @param {{x: number, y: number}} dataCoordinates
     * @param {Number} graphDecimalsAccuracy
     * @param {Boolean} logThis
     * @returns {{x: number, y: number}} planeCoordinates
     */
    Model.GetDataToPlane = (dataCoordinates, graphDecimalsAccuracy, logThis) => {
        let planeCoordinates = {
            x: (dataCoordinates.x * PLANE_TO_MODEL_RATIO.x),
            y: (dataCoordinates.y * PLANE_TO_MODEL_RATIO.y)
        };

        planeCoordinates = (graphDecimalsAccuracy) ? {
            x: round(planeCoordinates.x, graphDecimalsAccuracy),
            y: round(planeCoordinates.y, graphDecimalsAccuracy)
        } : planeCoordinates;

        //Todo: enhance to display axis names
        if (logThis){
            console.log("planeCoordinates: " + JSON.stringify(planeCoordinates));
        }

        return planeCoordinates;
    };

    /**
     * Add point by adding to array.
     *
     * @param {Number} planeX
     * @param {Number} dimensionX
     * @param {Number} planeY
     */
    //AddPoint(scalarX, xDimension, scalarY) //returns the new Point //These are in cartesianCoordinates
    this.AddPoint = (planeX, dimensionX, planeY) => {

        //Todo: Review semantics
        let newXs = this.hypothesisLine.thetas.slice();
        newXs[0]= 1;

        for (let i = 1; i<newXs.length;i++){
            newXs[i] = 0;
        }

        //let graphPosition = GetPlaneToData(planeX, planeY, DATA_DECIMALS_ACCURACY);
        newXs[dimensionX] = planeX;
        let clickPoint = new DataPoint(newXs, planeY);

        this.dataPoints.push(clickPoint);
        //console.log("In graph: " + this + ", Added point at : " + model.dataPoints[clickPoint]);
        //console.log("In graph: " + graph + ", Added point, at (cartesianX: " + planeX + ", cartesianY: " + planeY + ").");

        if (this.graphType === GRAPH_TYPES.REGRESSION) {
            //buildErrorLinesBetween([clickPoint], model.hypothesisLine);
            //buildCanvasContent();
        }
    };

    /**
     * Remove point by
     *      (A) finding nearby point
     *      (B) removing from array
     * @param {Number} canvasX
     * @param {Number} dimensionX
     * @param {Number} canvasY
     */
    //RemovePoint(point)
    this.RemovePoint = (canvasX, dimensionX, canvasY) => {
        let foundPoints = model.findClosestDataPoints({x: canvasX, y: canvasY}, dimensionX, CLICK_DISTANCE_ACCURACY_TO_POINT);
        for (let i = 0; i < foundPoints.length; i++) {
            let firstMatchPointIndex = model.dataPoints.indexOf(foundPoints[i]); //index of on references

            let removedPoints = model.dataPoints.splice(firstMatchPointIndex, 1);
            let removedPoint = removedPoints[0];

            console.log("In graph: " + this + ", Removed point at : " + removedPoint);
        }
    };

}