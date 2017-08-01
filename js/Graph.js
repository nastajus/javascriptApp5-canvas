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
    // this.axisLines = [];
    // this.axisLinesArrows = [];
    this.highlightPoints = [];
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.planeOriginToCanvasOriginShift = {x:25, y:66};  // {x:1, y:0};
    this.canvas.oncontextmenu = (e) => e.preventDefault();
    this.dimensionXSelected = 1;
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
    //Graph.prototype.IsValidDimensionChange = function (dimension, attemptToggleValue) {
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
        this.drawAxisLine("x");
        this.drawAxisLine("y");

        //drawArrowHeads(graph, graph.axisLinesArrows, "black", 5);
        this.drawAxisScale({x: CANVAS_SCALE, y: CANVAS_SCALE});

        this.drawHighlightPoints(this.highlightPoints);
        //removeArrayFromArrayOnce();

        this.drawComplexLine(model.hypothesisLine, 1, "black");
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
        let cp1 = pointBegin.GetDataToCanvas(dimensionX, this);
        let cp2 = pointEnd.GetDataToCanvas(dimensionX, this);
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
     * Draws simple line based off SimplePoint points
     *
     * @param {Line} line
     * @param strokeStyle
     * @param lineWidth
     */
    this.drawSimpleLine = (line, strokeStyle, lineWidth) => {
        // let pointBegin = line.p1;
        // let pointEnd = line.p2;
        let pointBegin = Graph.GetPlaneToCanvas(line.p1, false);
        let pointEnd = Graph.GetPlaneToCanvas(line.p2, false);

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
    };


    /**
     * Lines are defined with two SimplePoint in Plane pixel units.
     *
     * @param {String} graphDimension
     */
    this.drawAxisLine = (graphDimension) => {

        this.p1 = {};
        this.p2 = {};
        // this.a1 = [];
        // this.a2 = [];

        if (graphDimension === "x") {
            /**
             * only works occasionally on first invocation from IDE, usually failing, and always failing on all subsequent refreshes.
             * suspect a problem with understanding involving any of: SimplePoint instantiation, this, context, new, bind, etc.
             */

            // this.p1 = SimplePoint.Add(new SimplePoint(0, 0), graph.planeOriginToCanvasOriginShift);
            // this.p2 = SimplePoint.Add(new SimplePoint(SimplePoint.maxCanvasX, 0), graph.planeOriginToCanvasOriginShift);

            this.p1 = new SimplePoint(0, 0);
            this.p2 = new SimplePoint(SimplePoint.maxCanvasX, 0);


            // this.a1.push(new AxisArrows(this.p1, "left"));
            // this.a2.push(new AxisArrows(this.p2, "right"));
        }
        else if (graphDimension === "y") {
            // this.p1 = SimplePoint.Add(new SimplePoint(0, 0), graph.planeOriginToCanvasOriginShift);
            // this.p2 = SimplePoint.Add(new SimplePoint(0, SimplePoint.maxCanvasY), graph.planeOriginToCanvasOriginShift);

            this.p1 = new SimplePoint(0, 0);
            this.p2 = new SimplePoint(0, SimplePoint.maxCanvasY);

            // this.a1.push(new AxisArrows(this.p1, "down"));
            // this.a2.push(new AxisArrows(this.p2, "up"));

        }

        this.drawSimpleLine(new Line(this.p1, this.p2), "black", 5);

        //Line.call(this, this.p1, this.p2);

        // /**
        //  *
        //  * @param point
        //  * @param arrowDirection
        //  */
        // function AxisArrows(point, arrowDirection) {
        //
        //     let off = [[1 / 2, 1 / 2], [1 / 2, 1 / 2]]; //offset
        //     let dir; //direction
        //
        //     switch (arrowDirection) {
        //         case "right":
        //             dir = [[-1, 1], [-1, -1]];
        //             break;
        //
        //         case "left":
        //             dir = [[1, 1], [1, -1]];
        //             break;
        //
        //         case "up":
        //             dir = [[1, -1], [-1, -1]];
        //             break;
        //
        //         case "down":
        //             dir = [[1, 1], [-1, 1]];
        //             break;
        //     }

        // this.pTip = point;
        // this.p1 = new SimplePoint(point.x + off[0][0] * dir[0][0], point.y + off[0][1] * dir[0][1]);
        // this.p2 = new SimplePoint(point.x + off[0][0] * dir[0][0], point.y + off[0][1] * dir[0][1]);

        //this.arrowTipBranch1 = new Line(this.pTip, this.p1);

        //this.arrowTipBranch2 = new Line(this.pTip, this.p2);

        //this.p1 = new Point(pTip.x + offset1x, pTip.y + offset1y);
        //this.p2 = new Point(pTip.x + offset2x, pTip.y + offset2y);
        //this.p2 = new Point(pTip.x + offset2x, pTip.y + offset2y);

        //if (arrowDirection === "")
        // }
    };


    /**
     * Draw tick lines & values respective to dimension shown, Plane pixel units, at the intervalCanvasUnits sampling rate.
     *
     * @param intervalCanvasUnits
     */
    this.drawAxisScale = (intervalCanvasUnits) => {

        for (let x = 0; x < CANVAS_WIDTH + intervalCanvasUnits.x ; x += intervalCanvasUnits.x) {

            //create tick mark
            this.drawSimpleLine(new Line(
                new SimplePoint(x, TICK_SIZE),
                new SimplePoint(x, -TICK_SIZE))
            );

            let simplePoint = new SimplePoint(x, 0);
            let planeCoordinates = Graph.GetPlaneToCanvas({x: simplePoint.x, y: simplePoint.y}, false);

            this.drawCanvasPointText(planeCoordinates, {x: -3, y: +20}, round(x / PLANE_TO_MODEL_RATIO.x, 0), "black");

        }

        for (let y = 0; y < CANVAS_WIDTH + intervalCanvasUnits.y ; y += intervalCanvasUnits.y) {

            //create tick mark
            this.drawSimpleLine(new Line(
                new SimplePoint(TICK_SIZE, y),
                new SimplePoint(-TICK_SIZE, y))
            );

            let simplePoint = new SimplePoint(0, y);
            let planeCoordinates = Graph.GetPlaneToCanvas({x: simplePoint.x, y: simplePoint.y}, false);

            this.drawCanvasPointText(planeCoordinates, {x: -20, y: +3}, round(y / PLANE_TO_MODEL_RATIO.y, 0), "black");
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
        let canvasPoint = point.GetDataToCanvas(dimensionX, this);
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
        let canvasPoint = point.GetDataToCanvas(dimensionX, this);
        this.context.fillText(text, canvasPoint.x + textOffset.x, canvasPoint.y + textOffset.y);
        this.context.fillStyle = originalFillStyle;
    };

    this.drawCanvasPointText = (point, pointOffset, text, fillStyle) => {
        pointOffset = (!pointOffset) ? {x:0, y:0} : pointOffset;
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

        let dimension_n = this.dimensionXSelected;

        //would start at negative numbers later
        xs_sample[dimension_n] = 0;
        let prevPoint = new DataPoint(xs_sample, complexLine.Evaluate(xs_sample));

        //iterate for every value of x_n, modify xs such that ALL of it's values are set to ZERO,
        //except x_0 (which is 1) and x_n.
        for (let x_n_i = -this.planeOriginToCanvasOriginShift.x; x_n_i < CANVAS_WIDTH / CANVAS_SCALE + CANVAS_SCALE + this.planeOriginToCanvasOriginShift.x; x_n_i += sampleRate) {
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
            x: this.planeOriginToCanvasOriginShift.x % CANVAS_SCALE,
            y: this.planeOriginToCanvasOriginShift.y % CANVAS_SCALE
        };

        let startX = 0 - this.planeOriginToCanvasOriginShift.x + subOriginScaleShift.x;
        let endX = CANVAS_WIDTH - this.planeOriginToCanvasOriginShift.x;
        let startY = CANVAS_HEIGHT + this.planeOriginToCanvasOriginShift.y - subOriginScaleShift.y;
        let endY = this.planeOriginToCanvasOriginShift.y;

        for (let canvasX = startX; canvasX <= endX; canvasX += CANVAS_SCALE) {
            for (let canvasY = startY; canvasY >= endY; canvasY -= CANVAS_SCALE) {
                this.drawCanvasPoint(canvasX + this.planeOriginToCanvasOriginShift.x, canvasY - this.planeOriginToCanvasOriginShift.y, fillStyle);
                if (drawText) {
                    let canvasPoint = new SimplePoint(canvasX,canvasY);
                    this.drawCanvasPointText(canvasPoint, {x:5, y:15}, canvasPoint.toString(), fillStyle);
                }
            }
        }
    };

    this.toString = () => {
        return this.graphType.toUpperCase().substring(0, 1) + this.graphType.toLowerCase().substring(1, this.graphType.length);
    };


    /**
     * Convert from raw Canvas pixel system (without offset) to Plane pixel system (including offset).
     * Reverses vertical dimension.
     *
     * Input is {100,100}, Output is {75, 375}
     *
     * Example:
     *      init:
     *      canvas initialized with 500 x 500 pixels.
     *      origin offset by 25 x 25 pixels (bottom left).
     *
     *      steps:
     *      input canvas position: 100 pixel, 100 pixel (top left).
     *      intermediate position: 100 pixel, 400 pixel (y reversed).
     *      output plane position:  75 pixel, 375 pixel (offset).
     *
     * @param {{x: number, y: number}} canvasCoordinates
     * @param {Boolean} logThis
     * @return {{x: number, y: number}}
     */
    //Graph.prototype.GetCanvasToPlane = function (canvasCoordinates, logThis) {
    Graph.GetCanvasToPlane = (canvasCoordinates, logThis) => {

        let flippedY = CANVAS_HEIGHT - canvasCoordinates.y;

        let planeCoordinates =  {
            x: canvasCoordinates.x - this.planeOriginToCanvasOriginShift.x,
            y: flippedY - this.planeOriginToCanvasOriginShift.y
        };

        if (logThis){
            console.log("planeCoordinates: " + JSON.stringify(planeCoordinates));
        }

        return planeCoordinates;

    };

    /**
     * Convert from Plane pixel system (including offset) to Canvas pixel system (without offset).
     * Reverses vertical dimension.
     *
     * Input is {125, 375}, Output is {100,100}
     *
     * @param {{x: number, y: number}} planeCoordinates
     * //param {{SimplePoint}} planeCoordinates  //TODO: combine?
     * @param {Boolean} logThis
     * @return {{x: number, y: number}}
     */
    Graph.GetPlaneToCanvas = (planeCoordinates, logThis) => {

        let flippedY = CANVAS_HEIGHT - planeCoordinates.y;

        let canvasCoordinates = {
            x: planeCoordinates.x + this.planeOriginToCanvasOriginShift.x,
            y: flippedY - this.planeOriginToCanvasOriginShift.y
        };

        // let canvasCoordinates = {
        //     x: planeCoordinates.x + this.planeOriginToCanvasOriginShift.x,
        //     y: planeCoordinates.y - this.planeOriginToCanvasOriginShift.y
        // };
        //
        // let flippedY = CANVAS_HEIGHT - planeCoordinates.y;
        //
        // canvasCoordinates = {
        //     x: canvasCoordinates.x,
        //     y: flippedY
        // };

        if (logThis) {
            console.log("canvasCoordinates: " + JSON.stringify(canvasCoordinates));
        }

        return canvasCoordinates;
    };
}
