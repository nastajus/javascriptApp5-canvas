/**
 * Created by Ian Nastajus on 7/22/2017.
 */

/**
 * MVC = Model
 */
function Model(numDimensions) {

    this.numDimensions = numDimensions;
    this.dataPoints = [];
    this.hypothesisLine = {};
    this.derivativePoints = [];

    /**
     * Determine secondary point on same y coordinate
     *
     * @param {Point} point
     * @returns {Point} point
     */
    this.CalculateShadowPoint = (point) => {
        const y = this.hypothesisLine.Evaluate(point.xs);
        return new Point(point.xs, y);
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
        this.dataPoints.push(new Point([1, 1], 1));
        this.dataPoints.push(new Point([1, 3], 4));
        this.dataPoints.push(new Point([1, 2], 5));
        this.dataPoints.push(new Point([1, 3], 6));
        this.dataPoints.push(new Point([1, 5], 5));
        this.dataPoints.push(new Point([1, 5], 9));
        this.dataPoints.push(new Point([1, 6], 4));
        this.dataPoints.push(new Point([1, 7], 7));
        this.dataPoints.push(new Point([1, 7], 8));
        this.dataPoints.push(new Point([1, 8], 7));
        this.dataPoints.push(new Point([1, 9], 9));
        this.dataPoints.push(new Point([1, 12], 8));
        this.dataPoints.push(new Point([1, 13], 9));
        this.dataPoints.push(new Point([1, 14], 7));
    };

    this.BuildSampleHypothesisLines = () => {
        this.hypothesisLine = new ComplexLine([0, 1]);
        this.hypothesisLine.name = "the hypothesis line";
    };

    this.BuildContourRing = () => {

    };


}