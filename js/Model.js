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
    this.dataSets = [];
    this.activeFeatureLabels = [];
    this.activeDataPoints = [];
    this.activeDataSet = {};
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
        const y = this.hypothesisLine.EvaluateY(point.xs);
        return new DataPoint(point.xs, y);
    };

    /**
     * Display scalar amount of cost.
     *
     * @returns {number} cost
     */
    this.Cost = () => {

        let cost = 0;

        //m = activeDataPoints.length
        for (let point of this.activeDataSet.dataPoints) {

            //shadow = hθ( point i )
            let shadow = this.CalculateShadowPoint(point);

            let errorSquared = Math.pow(shadow.y - point.y, 2);

            //Σ from i=1 to m
            cost += errorSquared;
        }
        return cost;
    };

    /**
     * Gradient Descent step
     */
    this.CostStep = () => {

    };

    this.BuildSampleDataPoints = () => {
        let basicDataPoints = [];

        basicDataPoints.push(new DataPoint([1, 1], 1));
        basicDataPoints.push(new DataPoint([1, 3], 4));
        basicDataPoints.push(new DataPoint([1, 2], 5));
        basicDataPoints.push(new DataPoint([1, 3], 6));
        basicDataPoints.push(new DataPoint([1, 5], 5));
        basicDataPoints.push(new DataPoint([1, 5], 9));
        basicDataPoints.push(new DataPoint([1, 6], 4));
        basicDataPoints.push(new DataPoint([1, 7], 7));
        basicDataPoints.push(new DataPoint([1, 7], 8));
        basicDataPoints.push(new DataPoint([1, 8], 7));
        basicDataPoints.push(new DataPoint([1, 9], 9));
        basicDataPoints.push(new DataPoint([1, 12], 8));
        basicDataPoints.push(new DataPoint([1, 13], 9));
        basicDataPoints.push(new DataPoint([1, 14], 7));

        //this.activeDataPoints = basicDataPoints;

        let basicDataSet = new DataSet(basicDataPoints, ["bias", "data values"]);
        this.dataSets.push(basicDataSet);
        this.activeDataSet = basicDataSet;
    };

    this.BuildSampleHypothesisLines = () => {
        this.hypothesisLine = new ComplexLine();
        this.hypothesisLine.name = "the hypothesis line";
    };

    this.BuildSampleContour = () => {

    };

    this.BuildContourRing = () => {

    };

    this.SetActiveDataPointIndices = (dataPointIndices) => {
        let dataPoints = [];
        for (let index of dataPointIndices) {
            dataPoints.push(this.dataSets[0][index]);
        }
        this.activeDataSet.dataPoints = dataPoints;
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

        let foundPoints = this.activeDataSet.dataPoints.filter(entry =>
            targetDataPosition.x > entry.xs[dimensionX] - accuracyDataDistance &&
            targetDataPosition.x <= entry.xs[dimensionX] + accuracyDataDistance &&
            targetDataPosition.y > entry.y - accuracyDataDistance &&
            targetDataPosition.y <= entry.y + accuracyDataDistance
        );

        return foundPoints;
    };

    /**
     * Add point by adding to array.
     *
     * @param {Number} planeX
     * @param {Number} dimensionX
     * @param {Number} planeY
     */
    //AddPoint(scalarX, xDimension, scalarY) //returns the new Point //These are in cartesianCoordinates
    this.AddPoint = (planeX, dimensionX, planeY, logThis) => {

        //Todo: Review semantics
        let newXs = this.hypothesisLine.thetas.slice();
        newXs[0]= 1;

        for (let i = 1; i<newXs.length;i++){
            newXs[i] = 0;
        }

        //let graphPosition = GetPlaneToData(planeX, planeY, DATA_DECIMALS_ACCURACY);
        newXs[dimensionX] = planeX;
        let dataPosition = new DataPoint(newXs, planeY);

        this.activeDataSet.dataPoints.push(dataPosition);
        if (logThis){
            console.log("Added point, at dataPosition: " + JSON.stringify(dataPosition));
        }

        return dataPosition;
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
    this.RemovePoint = (canvasX, dimensionX, canvasY, logThis) => {
        let foundPoints = model.findClosestDataPoints({x: canvasX, y: canvasY}, dimensionX, CLICK_DISTANCE_ACCURACY_TO_POINT);
        for (let i = 0; i < foundPoints.length; i++) {
            let firstMatchPointIndex = model.activeDataSet.dataPoints.indexOf(foundPoints[i]); //index of on references

            let removedPoints = model.activeDataSet.dataPoints.splice(firstMatchPointIndex, 1);
            let removedPoint = removedPoints[0];

            if (logThis){
                console.log("Removed point, at dataPosition " + JSON.stringify(removedPoint));
            }
        }
    };
}