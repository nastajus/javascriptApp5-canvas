/**
 * Created by Ian Nastajus on 7/22/2017.
 */

/**
 * MVC = View
 *
 * @param canvasId
 * @param graphType
 * @param getDataPointsCallback
 */
function Graph(canvasId, graphType, getDataPointsCallback) {

    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext("2d");
    this.graphType = graphType;
    this.cartesianAxes = [];
    this.cartesianAxesArrowHeads = [];
    this.highlightPoints = [];
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.canvas.oncontextmenu = (e) => e.preventDefault();
    this.currentlySelectedDimension = 1;

    /**
     * Convert from Cartesian point system to Canvas pixel system, and while incorporating which x dimension is used.
     *
     * @param point
     * @param dimension
     * @returns {{x: number, y: number}}
     */
    this.canvasPoint = (point, dimension) => ({
        x: point.xs[dimension] * CANVAS_SCALE,
        y: CANVAS_HEIGHT - (point.y * CANVAS_SCALE) + CANVAS_TEXT_OFFSET_COORD
    });

    this.renderCanvas = () => {

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawCartesianGraphPoints();
        this.drawDataPoints(model.dataPoints, 1, "darkred", true);
        this.drawLine(this.cartesianAxes[0].p1, this.cartesianAxes[0].p2, 1, "black", 5);
        this.drawLine(this.cartesianAxes[1].p1, this.cartesianAxes[1].p2, 1, "black", 5);

        //drawArrowHeads(graph, graph.cartesianAxesArrowHeads, "black", 5);

        this.drawHighlightPoints(this.highlightPoints);
        //removeArrayFromArrayOnce();

        this.drawComplexLine(model.hypothesisLine, 1, "black");

        //drawEachLine(graph, model.hypothesisLine.errorLines, "forestgreen");
        //drawEachLineText(graph, model.hypothesisLine.errorLines, "forestgreen");
    };

    /**
     * Add point by
     *      (A) adapting click position to cartesian system
     *      (B) adding to array
     *      (C) triggering redraw of canvas
     * @param graph
     * @param canvasX
     * @param canvasY
     */
    this.addPoint = (canvasX, canvasY) => {

        //Todo: Review semantics
        let newXs = model.hypothesisLine.thetas.slice();
        newXs[0]= 1;

        for (let i = 1; i<newXs.length;i++){
            newXs[i] = 0;
        }

        let graphPosition = convertCanvasToGraph(canvasX, canvasY, GRAPH_DECIMALS_ACCURACY);
        newXs[this.currentlySelectedDimension] = graphPosition.cartesianX;
        let clickPoint = new Point(newXs, graphPosition.cartesianY);

        model.dataPoints.push(clickPoint);
        //console.log("In graph: " + this + ", Added point at : " + printPoint(model.dataPoints[clickPoint]));
        console.log("In graph: " + this + ", Added point, at (cartesianX: " + graphPosition.cartesianX + ", cartesianY: " + graphPosition.cartesianY + ").");

        if (this.graphType === GRAPH_TYPES.REGRESSION) {
            //buildErrorLinesBetween([clickPoint], model.hypothesisLine);
            //buildCanvasContent();
        }
        this.renderCanvas(this);
    };

    /**
     * Remove point by
     *      (A) finding nearby point to click position
     *      (B) removing from array
     *      (C) triggering redraw of canvas
     * @param graph
     * @param canvasX
     * @param canvasY
     */
    this.removePoint = (canvasX, canvasY) => {
        let graphPosition = convertCanvasToGraph(canvasX, canvasY, GRAPH_DECIMALS_ACCURACY);
        let foundPoints = findClosestDataPoints(graphPosition, CLICK_DISTANCE_ACCURACY_TO_POINT);
        for (let i = 0; i < foundPoints.length; i++) {
            let firstMatchPointIndex = model.dataPoints.indexOf(foundPoints[i]); //index of on references

            let removedPoints = model.dataPoints.splice(firstMatchPointIndex, 1);
            let removedPoint = removedPoints[0];

            console.log("In graph: " + this + ", Removed point at : " + printPoint(removedPoint));
        }
        this.renderCanvas();
    };

    this.drawLine = (pointBegin, pointEnd, dimensionX, strokeStyle, lineWidth) => {
        const originalStrokeStyle = this.context.strokeStyle;
        const originalLineWidth = this.context.lineWidth;
        this.context.beginPath();
        let cp1 = this.canvasPoint(pointBegin, dimensionX);
        let cp2 = this.canvasPoint(pointEnd, dimensionX);
        this.context.moveTo(cp1.x, cp1.y);
        this.context.lineTo(cp2.x, cp2.y);

        if (strokeStyle !== undefined) {
            this.context.strokeStyle = strokeStyle;
        }

        if (lineWidth !== undefined) {
            this.context.lineWidth = lineWidth;
        }

        this.context.stroke();
        this.context.strokeStyle = originalStrokeStyle;
        this.context.lineWidth = originalLineWidth;
    };

    this.drawDataPoints = (points, dimensionX, fillStyle, drawText) => {
        for (let p = 0; p < points.length; p++) {

            let p1 = points[p];
            let p2 = model.CalculateShadowPoint(points[p]);

            this.drawPoint(p1, dimensionX, fillStyle);

            // draw error line
            this.drawLine(p1, p2, dimensionX, fillStyle);

            // draw error text.... or something
            let diff = p2.y - p1.y;
            let magnitude = round(Math.abs(diff), 2);

            let midpoint = new Point(p1.xs, p1.y + diff / 2);

            if (drawText) {
                this.drawPointText(midpoint, dimensionX, magnitude, fillStyle);
                this.drawPointText(p1, dimensionX, p1.toString(), fillStyle);
            }
        }
    };

    this.drawPoint = (point, dimensionX, fillStyle, pointRadius) => {
        let canvasPoint = this.canvasPoint(point, dimensionX);
        this.drawCanvasPoint(canvasPoint.x, canvasPoint.y, fillStyle, pointRadius);
    };

    this.drawCanvasPoint = (x, y, fillStyle, pointRadius) => {
        const originalFillStyle = this.context.fillStyle;
        this.context.beginPath();
        this.context.arc(x, y, (pointRadius) ? pointRadius : POINT_RADIUS, 0, Math.PI * 2, true);
        this.context.closePath();
        this.context.fillStyle = fillStyle;
        this.context.fill();
        this.context.fillStyle = originalFillStyle;
    };

    this.drawPointText = (point, dimensionX, text, fillStyle) => {
        const originalFillStyle = this.context.fillStyle;
        this.context.fillStyle = fillStyle;
        let canvasPoint = this.canvasPoint(point, dimensionX);
        this.context.fillText(text, canvasPoint.x, canvasPoint.y);
        this.context.fillStyle = originalFillStyle;
    };

    this.drawHighlightPoints = (highlightPoints) => {
        for (let i = 0; i < highlightPoints.length; i++) {
            this.drawFatterPoint(highlightPoints[i]);
        }
    };

    this.drawFatterPoint = (point) => {
        this.drawPoint(point, 1, "darkyellow", 10);
    };

    /**
     * Draws over the graph's currently selected dimension of X.
     *
     * @param complexLine
     * @param sampleRate
     * @param fillStyle
     */
    this.drawComplexLine = (complexLine, sampleRate, fillStyle) => {

        let xs_sample = new Array(model.numDimensions);
        for (let i = 0; i < xs_sample.length; i++){
            //Todo: Experiment
            xs_sample[i] = 0;
        }
        xs_sample[0]= 1;


        //xs = [1 , 0]

        let dimension_n = this.currentlySelectedDimension;

        //would start at negative numbers later
        xs_sample[dimension_n] = 0;
        let prevPoint = new Point(xs_sample, complexLine.Evaluate(xs_sample));

        //iterate for every value of x_n, modify xs such that ALL of it's values are set to ZERO,
        //except x_0 (which is 1) and x_n.
        for (let x_n_i = 0; x_n_i < CANVAS_WIDTH / CANVAS_SCALE; x_n_i += sampleRate) {
            //sampling the line  at x_n = x_n_i
            xs_sample[dimension_n] = x_n_i;
            //Todo: I hate javascript
            let newPoint = new Point(xs_sample.slice(), complexLine.Evaluate(xs_sample));
            this.drawLine(prevPoint, newPoint, 1, fillStyle);
            prevPoint = newPoint;
        }
    };

    /**
     * Draw cartesian graph visualization aid, by making a grid of Points, spaced apart consistently.
     */
    this.drawCartesianGraphPoints = () => {

        //this is not easy to read easily. refactor to be most readable possible:
        for (let x = 0; x <= CANVAS_WIDTH; x += CANVAS_SCALE) {
            for (let y = 0; y <= CANVAS_HEIGHT; y += CANVAS_SCALE) {
                this.drawCanvasPoint(x, y, "lightgray")
            }
        }
    };

    Graph.prototype.toString = function () {
        return this.graphType.toUpperCase().substring(0, 1) + this.graphType.toLowerCase().substring(1, this.graphType.length);
    };
}
