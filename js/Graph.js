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
    this.axisLines = [];
    this.axisLinesArrows = [];
    this.highlightPoints = [];
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.canvasOriginShift = {x:25, y:66};  // {x:1, y:0};
    this.canvas.oncontextmenu = (e) => e.preventDefault();
    this.currentlySelectedDimension = 1;
    let shownDimensions = new Array(model.numDimensions);

    Graph.InitShownDimensions = () => {
        for (let i = 0; i < shownDimensions.length; i++){
            shownDimensions[i] = false;
        }
    };

    Graph.GetShownDimensions = () => shownDimensions;
    Graph.SetShownDimensions = (dimension, attemptToggleValue) => {
        if(Graph.IsValidDimensionChange(dimension, attemptToggleValue)){
            shownDimensions[dimension] = attemptToggleValue;
            return true;
        }
        return false;
    };


    /**
     * Evaluates state of pending dimension change, determining whether new visualization is permitted or not.
     *
     * @param {Number} dimension
     * @param {boolean} attemptToggleValue
     * @returns {boolean} dimensionChangeValid
     */
    Graph.IsValidDimensionChange = (dimension, attemptToggleValue) => {

        if (typeof dimension !== 'number') {
            throw new TypeError ("Cannot validate dimension change, variable dimension: " + dimension + " is not a number as expected." );
        }

        if (typeof attemptToggleValue !== 'boolean') {
            throw new TypeError ("Cannot validate dimension change, variable attemptToggleValue: " + attemptToggleValue + " is not a boolean as expected." );
        }

        if (dimension < 0 || dimension > shownDimensions.length) {
            throw new RangeError ("Cannot validate dimension change, variable dimension: " + dimension + " is beyond range of initialized dimensions." );
        }


        /// ... actual logic goes here ...

        let MAX_DIMENSIONS_VISIBLE = 1;

        //rule draft attempt:
        //max 1 dimension allowed at a time.
        let dimensionChangeValid = true;
        let countEnabled = 0;
        for (let i = 0; i <= shownDimensions.length; i++) {
            if (shownDimensions[i] === true){
                countEnabled++;
            }
            if (attemptToggleValue === true && dimension !== i && countEnabled >= MAX_DIMENSIONS_VISIBLE) {
                dimensionChangeValid = false;
                console.log("Invalid to visualize dimension " + dimension + ", would exceed maximum of " + MAX_DIMENSIONS_VISIBLE + " dimensions that can be visualized.");
                break;
            }
        }

        return dimensionChangeValid;
    };

    this.RenderCanvas = () => {

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawCanvasPoints("lightgray", false);
        this.drawDataPoints(model.dataPoints, 1, ["darkred", "forestgreen"], true);
        this.drawAxisLines(this.axisLines, "black", 5);
        //drawArrowHeads(graph, graph.axisLinesArrows, "black", 5);

        this.drawHighlightPoints(this.highlightPoints);
        //removeArrayFromArrayOnce();

        this.drawComplexLine(model.hypothesisLine, 1, "black");
    };

    /**
     * Add point by
     *      (A) adapting click position to cartesian system
     *      (B) adding to array
     *      (C) triggering redraw of canvas
     * @param {Number} canvasX
     * @param {Number} canvasY
     */

    //AddPoint(scalarX, xDimension, scalarY) //returns the new Point //These are in cartesianCoordinates
    this.AddPoint = (canvasX, canvasY) => {

        //Todo: Review semantics
        let newXs = model.hypothesisLine.thetas.slice();
        newXs[0]= 1;

        for (let i = 1; i<newXs.length;i++){
            newXs[i] = 0;
        }

        let graphPosition = convertCanvasToGraph(canvasX, canvasY, GRAPH_DECIMALS_ACCURACY);
        newXs[this.currentlySelectedDimension] = graphPosition.cartesianX;
        let clickPoint = new DataPoint(newXs, graphPosition.cartesianY);

        model.dataPoints.push(clickPoint);
        //console.log("In graph: " + this + ", Added point at : " + model.dataPoints[clickPoint]);
        console.log("In graph: " + this + ", Added point, at (cartesianX: " + graphPosition.cartesianX + ", cartesianY: " + graphPosition.cartesianY + ").");

        if (this.graphType === GRAPH_TYPES.REGRESSION) {
            //buildErrorLinesBetween([clickPoint], model.hypothesisLine);
            //buildCanvasContent();
        }
        this.RenderCanvas(this);
    };

    /**
     * Remove point by
     *      (A) finding nearby point to click position
     *      (B) removing from array
     *      (C) triggering redraw of canvas
     * @param canvasX
     * @param canvasY
     */
    //RemovePoint(point)
    this.RemovePoint = (canvasX, canvasY) => {
        let graphPosition = convertCanvasToGraph(canvasX, canvasY, GRAPH_DECIMALS_ACCURACY);
        let foundPoints = findClosestDataPoints(graphPosition, CLICK_DISTANCE_ACCURACY_TO_POINT);
        for (let i = 0; i < foundPoints.length; i++) {
            let firstMatchPointIndex = model.dataPoints.indexOf(foundPoints[i]); //index of on references

            let removedPoints = model.dataPoints.splice(firstMatchPointIndex, 1);
            let removedPoint = removedPoints[0];

            console.log("In graph: " + this + ", Removed point at : " + removedPoint);
        }
        this.RenderCanvas();
    };

    /**
     * Draws line based off DataPoint points
     *
     * @param {DataPoint} pointBegin
     * @param {DataPoint} pointEnd
     * @param {Number} dimensionX
     * @param strokeStyle
     * @param lineWidth
     */
    this.drawLine = (pointBegin, pointEnd, dimensionX, strokeStyle, lineWidth) => {
        const originalStrokeStyle = this.context.strokeStyle;
        const originalLineWidth = this.context.lineWidth;
        this.context.beginPath();
        let cp1 = pointBegin.GetCanvasPoint(dimensionX, this);
        let cp2 = pointEnd.GetCanvasPoint(dimensionX, this);
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

    /**
     * Draws axis line based off SimplePoint points
     *
     * @param {[AxisLine]} axisLines
     * @param strokeStyle
     * @param lineWidth
     */
    this.drawAxisLines = (axisLines, strokeStyle, lineWidth) => {
        for (let i = 0; i < axisLines.length; i++)
        {
            let pointBegin = axisLines[i].p1.GetCanvasPoint(this);
            let pointEnd = axisLines[i].p2.GetCanvasPoint(this);

            const originalStrokeStyle = this.context.strokeStyle;
            const originalLineWidth = this.context.lineWidth;
            this.context.beginPath();
            this.context.moveTo(pointBegin.x, pointBegin.y);
            this.context.lineTo(pointEnd.x, pointEnd.y);

            if (strokeStyle !== undefined) {
                this.context.strokeStyle = strokeStyle;
            }

            if (lineWidth !== undefined) {
                this.context.lineWidth = lineWidth;
            }

            this.context.stroke();
            this.context.strokeStyle = originalStrokeStyle;
            this.context.lineWidth = originalLineWidth;
        }

    };

    /**
     * Draws DataPoint set
     *
     * @param {[DataPoint]} points
     * @param {Number} dimensionX
     * @param fillStyle
     * @param drawText
     */
    this.drawDataPoints = (points, dimensionX, fillStyle, drawText) => {
        for (let p = 0; p < points.length; p++) {

            let p1 = points[p];
            let p2 = model.CalculateShadowPoint(points[p]);

            this.drawPoint(p1, dimensionX, (fillStyle instanceof Array) ? fillStyle[0] : fillStyle);

            // draw error line
            this.drawLine(p1, p2, dimensionX, (fillStyle instanceof Array) ? fillStyle[1] : fillStyle);

            // calculate midpoint
            let diff = p2.y - p1.y;
            let magnitude = round(Math.abs(diff), 2);
            let midpoint = new DataPoint(p1.xs, p1.y + diff / 2);

            if (drawText) {
                this.drawDataPointText(p1, dimensionX, {x:8, y:2}, p1.Print(2), (fillStyle instanceof Array) ? fillStyle[0] : fillStyle);
                this.drawDataPointText(midpoint, dimensionX, null, magnitude, (fillStyle instanceof Array) ? fillStyle[1] : fillStyle);
            }
        }
    };

    this.drawPoint = (point, dimensionX, fillStyle, pointRadius) => {
        let canvasPoint = point.GetCanvasPoint(dimensionX, this);
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

    this.drawDataPointText = (point, dimensionX, textOffset, text, fillStyle) => {
        textOffset = (!textOffset) ? {x:0, y:0} : textOffset;
        const originalFillStyle = this.context.fillStyle;
        this.context.fillStyle = fillStyle;
        let canvasPoint = point.GetCanvasPoint(dimensionX, this);
        this.context.fillText(text, canvasPoint.x + textOffset.x, canvasPoint.y + textOffset.y);
        this.context.fillStyle = originalFillStyle;
    };

    this.drawCanvasPointText = (point, pointOffset, text, fillStyle) => {
        const originalFillStyle = this.context.fillStyle;
        this.context.fillStyle = fillStyle;
        this.context.fillText(text, point.x + pointOffset.x, point.y + pointOffset.y);
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
     * Draws over the graph's currently selected dimension of X, by iterating over segments of the canvas at sample rate.
     *
     * @param complexLine
     * @param sampleRate
     * @param fillStyle
     */
    this.drawComplexLine = (complexLine, sampleRate, fillStyle) => {

        //xs = [1 , 0]
        let xs_sample = [];
        xs_sample.push(1);
        xs_sample.push(0);
        //new Array(model.numDimensions);

        let dimension_n = this.currentlySelectedDimension;

        //would start at negative numbers later
        xs_sample[dimension_n] = 0;
        let prevPoint = new DataPoint(xs_sample, complexLine.Evaluate(xs_sample));

        //iterate for every value of x_n, modify xs such that ALL of it's values are set to ZERO,
        //except x_0 (which is 1) and x_n.
        for (let x_n_i = -this.canvasOriginShift.x; x_n_i < CANVAS_WIDTH / CANVAS_SCALE + CANVAS_SCALE + this.canvasOriginShift.x; x_n_i += sampleRate) {
            //sampling the line  at x_n = x_n_i
            xs_sample[dimension_n] = x_n_i;
            //Todo: I hate javascript
            let newPoint = new DataPoint(xs_sample.slice(), complexLine.Evaluate(xs_sample));
            this.drawLine(prevPoint, newPoint, 1, fillStyle);
            prevPoint = newPoint;
        }
    };

    /**
     * Draw cartesian graph visualization aid, by making a grid of Points, spaced apart consistently.
     */
    this.drawCanvasPoints = (fillStyle, drawText) => {

        let subOriginScaleShift = {
            x: this.canvasOriginShift.x % CANVAS_SCALE,
            y: this.canvasOriginShift.y % CANVAS_SCALE
        };

        let startX = 0 - this.canvasOriginShift.x + subOriginScaleShift.x;
        let endX = CANVAS_WIDTH - this.canvasOriginShift.x;
        let startY = CANVAS_HEIGHT + this.canvasOriginShift.y - subOriginScaleShift.y;
        let endY = this.canvasOriginShift.y;

        for (let canvasX = startX; canvasX <= endX; canvasX += CANVAS_SCALE) {
            for (let canvasY = startY; canvasY >= endY; canvasY -= CANVAS_SCALE) {
                this.drawCanvasPoint(canvasX + this.canvasOriginShift.x, canvasY - this.canvasOriginShift.y, fillStyle);
                if (drawText) {
                    let canvasPoint = new SimplePoint(canvasX,canvasY);
                    this.drawCanvasPointText(canvasPoint, {x:5, y:15}, canvasPoint.toString(), fillStyle);
                }
            }
        }
    };

    Graph.prototype.toString = () => {
        return this.graphType.toUpperCase().substring(0, 1) + this.graphType.toLowerCase().substring(1, this.graphType.length);
    };
}
