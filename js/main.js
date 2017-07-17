/*
 * Note the design limitation is:
 *      - drawing calls are dependant on initialization calls.
 *      - onMove redraws entire canvas.
 *
 */

let graphs = [];
let controlRows = [];

const GRAPH_TYPES = {
    REGRESSION: "REGRESSION",
    CONTOUR: "CONTOUR"
};

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;
const CANVAS_SCALE = 30;
const POINT_RADIUS = 5;
const CANVAS_TEXT_OFFSET_COORD = 10;
const CANVAS_TEXT_OFFSET_MAGNI = 5;
const GRAPH_DECIMALS_ACCURACY = 1;
const CLICK_DISTANCE_ACCURACY_TO_POINT = 1 / 2;


/**
 * MVC = View
 *
 * @param template
 * @returns {ControlRow}
 */
function ControlRow(template) {

    //external variable
    this.element = document.importNode(template, true);

    //external methods
    // Callback called when control changes
    this.OnControlChange = null;

    this.GetValue = () => value;

    this.SetValue = (newValue) => {
        let parsedValue = parseFloat(newValue);
        value = (isNaN(parsedValue) ? value : parsedValue);
        textbox.value = round(value, 2);

    };

    this.GetSymbol = () => symbol.textContent;
    this.SetSymbol = (symbol) => {
        symbol.textContent = symbol;
    };

    this.GetTitle = () => title.textContent;
    this.SetTitle = (title) => {
        title.textContent = title;
    };

    //internal state
    let value = 0;

    let checkbox = this.element.querySelector(".control-checkbox");
    let symbol = this.element.querySelector(".control-symbol");
    let title = this.element.querySelector(".control-title");
    let buttonDecrementSmall = this.element.querySelector(".control-lt-small");
    let buttonDecrementMedium = this.element.querySelector(".control-lt-medium");
    let buttonDecrementLarge = this.element.querySelector(".control-lt-large");
    let buttonIncrementSmall = this.element.querySelector(".control-gt-small");
    let buttonIncrementMedium = this.element.querySelector(".control-gt-medium");
    let buttonIncrementLarge = this.element.querySelector(".control-gt-large");
    let textbox = this.element.querySelector(".control-textbox");


    //internal methods
    //for subscribers (utility function so we don'thave to check for null everytime)
    const invokeChanged = () => {
        if (this.OnControlChange)
            this.OnControlChange();
    };

    const incrementValue = (delta) => {
        this.SetValue(this.GetValue() + delta);
        invokeChanged();
    };

    //init logic
    buttonDecrementSmall.onclick = () => incrementValue(-.1);
    buttonDecrementMedium.onclick = () => incrementValue(-1);
    buttonDecrementLarge.onclick = () => incrementValue(-10);

    buttonIncrementSmall.onclick = () => incrementValue(.1);
    buttonIncrementMedium.onclick = () => incrementValue(1);
    buttonIncrementLarge.onclick = () => incrementValue(10);

    checkbox.onchange = invokeChanged;
    textbox.onchange = () => {
        this.SetValue(textbox.value);
        invokeChanged();
    };

    return this;
}

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

    Object.defineProperty(this, 'dataPoints', {
        get: getDataPointsCallback
    });
    Object.defineProperty(this, 'hypothesisLine', {
        get: () => model.hypothesisLine,
        set: (newHypothesisLine) => model.hypothesisLine = newHypothesisLine
    });

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

        let xs_sample = complexLine.thetas.slice();
        xs_sample[0]= 1;

        for (let i = 1; i<xs_sample.length;i++){
            xs_sample[i] = 0;
        }

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

/**
 * MVC = Model
 */
function Model() {

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

    this.buildSampleDataPoints = () => {
        this.dataPoints.push(new Point([0, 1], 1));
        this.dataPoints.push(new Point([0, 3], 4));
        this.dataPoints.push(new Point([0, 2], 5));
        this.dataPoints.push(new Point([0, 3], 6));
        this.dataPoints.push(new Point([0, 5], 5));
        this.dataPoints.push(new Point([0, 5], 9));
        this.dataPoints.push(new Point([0, 6], 4));
        this.dataPoints.push(new Point([0, 7], 7));
        this.dataPoints.push(new Point([0, 7], 8));
        this.dataPoints.push(new Point([0, 8], 7));
        this.dataPoints.push(new Point([0, 9], 9));
        this.dataPoints.push(new Point([0, 12], 8));
        this.dataPoints.push(new Point([0, 13], 9));
        this.dataPoints.push(new Point([0, 14], 7));
    };

    this.buildSampleHypothesisLines = () => {
        this.hypothesisLine = new ComplexLine([0, 1]);
        this.hypothesisLine.name = "the hypothesis line";
    };

    this.buildContourRing = () => {

    };
}

/**
 * Creates new point for graphing.
 *
 * @param {[Number]} xs
 * @param {Number} y
 */
function Point(xs, y) {

    if (!Array.isArray(xs)) {
        throw new TypeError("XS is not an array.");
    }

    this.xs = xs;
    this.y = y;

    this.customString;

    Point.maxX = Math.ceil((CANVAS_WIDTH / CANVAS_SCALE) / CANVAS_SCALE) * CANVAS_SCALE;
    Point.maxY = Math.ceil((CANVAS_HEIGHT / CANVAS_SCALE) / CANVAS_SCALE) * CANVAS_SCALE;

    //poorly designed counter for rapid disambiguation for debugging
    // Point.counter = (Point.counter === undefined) ? 0 : ++Point.counter;
    // this.count = Point.counter;
}

Point.prototype.toString = function () {
    const result = (this.customString === undefined) ? printPoint(this) : this.customString;
    return /*"[" + this.count + "] " + */ result;
};

function initGraphs() {
    graphs.push(new Graph("canvas1", GRAPH_TYPES.REGRESSION, () => model.dataPoints));
    graphs.push(new Graph("canvas2", GRAPH_TYPES.CONTOUR, () => model.derivativePoints));

    //graphs[0].canvas.onclick = onClickCanvas;
    graphs[0].canvas.onmouseup = onClickCanvas;  //try passing variable here of `graph`
    graphs[0].canvas.onmousemove = onMoveCanvas; //try passing variable here of `graph`
}

function renderCanvases() {
    for (let i = 0; i < graphs.length; i++) {
        renderCanvas(graphs[i])
    }
}

function renderCanvas(graph) {
    
    //doesn't work
    graph.context.clearRect(0, 0, graph.canvas.width, graph.canvas.height);

    //works.
    graph.canvas.width = graph.canvas.width;
    //doesn't work
    graph.context.clearRect(0, 0, graph.canvas.width, graph.canvas.height);

    //works.
    graph.canvas.width = graph.canvas.width;

    graph.drawCartesianGraphPoints();
    graph.drawDataPoints(graph.dataPoints, 1, "darkred", true);
    graph.drawLine(graph.cartesianAxes[0].p1, graph.cartesianAxes[0].p2, 1, "black", 5);
    graph.drawLine(graph.cartesianAxes[1].p1, graph.cartesianAxes[1].p2, 1, "black", 5);

    //drawArrowHeads(graph, graph.cartesianAxesArrowHeads, "black", 5);

    graph.drawHighlightPoints(graph.highlightPoints);
    //removeHighlightPoints();

    graph.drawComplexLine(graph.hypothesisLine, 1, "black");

    //drawEachLine(graph, graph.hypothesisLine.errorLines, "forestgreen");
    //drawEachLineText(graph, graph.hypothesisLine.errorLines, "forestgreen");
}

function buildAxes() {
    for (let i = 0; i < graphs.length; i++) {
        graphs[i].cartesianAxes.push(new AxisLine("x"));
        graphs[i].cartesianAxes.push(new AxisLine("y"));
    }
}

/**
 * Basic Line concept, defined as only between two end points.
 */
function Line(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
}

/**
 * Create a line, using an array of parameters of θ (thetas), e.g. y = θ_0 * x_0 + θ_1 * x_1
 * @param {[Number]} thetas
 */
function ComplexLine(thetas) {

    //y=mx + b
    //y_hat = b0 + b1 * x;
    //y_hat = y_intercept + slope * (x);
    // y = 3 + 1/2 * x;

    //hθ(x) = θ_0 + θ_1 * x
    //y_intercept = θ_0, thus θ_0 = 0
    //slope = θ_1

    //hθ(x) = θ_0 * x_0 + θ_1 * x_1 + ... + θ_n * x_n


    this.thetas = thetas;
    this.name = "";

    /**
     * Evaluate y over all dimensions of x.  e.g. y = x_0 * θ_0 + x_1 * θ_1 + ... + x_n * θ_n
     *
     * @param xs Array of x values
     * @returns {number} Value of y on line at given xs(x_0, x_1, x_2 ... x_n)
     */
    this.Evaluate = (xs) => {

        if (this.thetas.length !== xs.length) {
            throw new RangeError("Amount of θ (thetas) does not match amount of X parameters. Cannot evaluate.")
        }

        let hypo_y = 0;

        for (let i = 0; i < xs.length; i++) {
            let x = xs[i];
            let θ = this.thetas[i];
            hypo_y += x * θ;
        }

        return hypo_y;

        //return this.slope * x + this.y_intercept_y_value;
    }
}

function AxisLine(graphDimension) {
    this.p1 = {};
    this.p2 = {};
    this.a1 = [];
    this.a2 = [];

    if (graphDimension === "x") {
        this.p1 = new Point([0, 0], 0);
        this.p2 = new Point([0, Point.maxX], 0);

        this.a1.push(new AxisArrows(this.p1, "left"));
        this.a2.push(new AxisArrows(this.p2, "right"));
    }
    else if (graphDimension === "y") {
        this.p1 = new Point([0, 0], 0);
        this.p2 = new Point([0, 0], Point.maxY);

        this.a1.push(new AxisArrows(this.p1, "down"));
        this.a2.push(new AxisArrows(this.p2, "up"));

    }
    Line.call(this, this.p1, this.p2);
}

function AxisArrows(point, arrowDirection) {

    let off = [[1 / 2, 1 / 2], [1 / 2, 1 / 2]]; //offset
    let dir; //direction

    switch (arrowDirection) {
        case "right":
            dir = [[-1, 1], [-1, -1]];
            break;

        case "left":
            dir = [[1, 1], [1, -1]];
            break;

        case "up":
            dir = [[1, -1], [-1, -1]];
            break;

        case "down":
            dir = [[1, 1], [-1, 1]];
            break;
    }

    this.pTip = point;
    this.p1 = new Point([0, point.x + off[0][0] * dir[0][0]], point.y + off[0][1] * dir[0][1]);
    this.p2 = new Point([0, point.x + off[0][0] * dir[0][0]], point.y + off[0][1] * dir[0][1]);

    this.arrowTipBranch1 = new Line(this.pTip, this.p1);

    //this.arrowTipBranch2 = new Line(this.pTip, this.p2);

    //this.p1 = new Point(pTip.x + offset1x, pTip.y + offset1y);
    //this.p2 = new Point(pTip.x + offset2x, pTip.y + offset2y);
    //this.p2 = new Point(pTip.x + offset2x, pTip.y + offset2y);

    //if (arrowDirection === "")
}

/**
 * Limit number of decimal places for a float realValue
 * @param {Number} value
 * @param {Integer} decimals
 * @returns {number}
 */
function round(value, decimals) {
    if (decimals === undefined) {
        throw new TypeError("Cannot round to nearest decimal, as number of decimal places isn't specified.");
    }

    //assumes 1d array
    if (Array.isArray(value)) {
        let result = [];
        for (let x of value) {
            result.push(Number(Math.round(x + 'e' + decimals) + 'e-' + decimals));
        }
        return result;
    }
    else if (!isNaN(value)) {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }
    else {
        throw new TypeError("Cannot round, not a number, for value: " + value);
    }

}

function onClickCanvas(e) {
    let element = graphs[0].canvas; //for now just hard-code
    let graph = graphs[0];
    let offsetX = 0, offsetY = 0;

    if (element.offsetParent) {
        do {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
        } while ((element = element.offsetParent));
    }

    let canvasX = e.pageX - offsetX;
    let canvasY = e.pageY - offsetY;

    let btnCode = e.button;

    switch (btnCode) {
        case 0:
            console.log("Left button clicked, in graph: " + graph + ", attempting To Add point, at (canvasX: " + canvasX + ", canvasY: " + canvasY + ").");
            addPoint(graph, canvasX, canvasY);
            break;

        case 1:
            console.log("Middle button clicked, in graph: " + graph + ", unimplemented.");
            break;

        case 2:
            console.log("Right button clicked, in graph: " + graph + ", attempting To Remove point, at (canvasX: " + canvasX + ", canvasY: " + canvasY + ").");
            removePoint(graph, canvasX, canvasY);
            break;

        default:
            console.log('Unexpected button code from click: ' + btnCode);
    }
}

function onMoveCanvas(e) {
    let element = graphs[0].canvas; //for now just hard-code
    let graph = graphs[0];
    let offsetX = 0, offsetY = 0;

    if (element.offsetParent) {
        do {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
        } while ((element = element.offsetParent));
    }

    let canvasX = e.pageX - offsetX;
    let canvasY = e.pageY - offsetY;

    let graphPosition = convertCanvasToGraph(canvasX, canvasY, GRAPH_DECIMALS_ACCURACY);

    let closestDataPoints = findClosestDataPoints(graph, graphPosition, CLICK_DISTANCE_ACCURACY_TO_POINT)

    addHighlightPoints(closestDataPoints, graph.highlightPoints);

    let diff = arrayDifference(graph.dataPoints, closestDataPoints);

    removeHighlightPoints(diff, graph.highlightPoints);

    renderCanvas(graph);
}

/**
 * Converts X and Y page positions, into the graphing cartesian system.
 * Note these are already offset by the canvas' position within the page.
 *
 * @param {Number} canvasX
 * @param {Number} canvasY
 * @param {Number} graphDecimalsAccuracy
 * @returns {{cartesianX: {Number}, cartesianY: {Number}}}
 */
function convertCanvasToGraph(canvasX, canvasY, graphDecimalsAccuracy) {

    let graphPosition = {cartesianX: (canvasX / CANVAS_SCALE), cartesianY: ((CANVAS_HEIGHT - canvasY) / CANVAS_SCALE)};

    graphPosition = (graphDecimalsAccuracy) ? {
        cartesianX: round(graphPosition.cartesianX, graphDecimalsAccuracy),
        cartesianY: round(graphPosition.cartesianY, graphDecimalsAccuracy)
    } : graphPosition;

    return graphPosition;
}

function printPoint(point) {
    return "(" + point.xs[graphs[0].currentlySelectedDimension] + ", " + point.y + ")";
}

/**
 * Add point by
 *      (A) adapting click position to cartesian system
 *      (B) adding to array
 *      (C) triggering redraw of canvas
 * @param graph
 * @param canvasX
 * @param canvasY
 */
function addPoint(graph, canvasX, canvasY) {

    //Todo: Review semantics
    let newXs = model.hypothesisLine.thetas.slice();
    newXs[0]= 1;

    for (let i = 1; i<newXs.length;i++){
        newXs[i] = 0;
    }

    let graphPosition = convertCanvasToGraph(canvasX, canvasY, GRAPH_DECIMALS_ACCURACY);
    newXs[graph.currentlySelectedDimension] = graphPosition.cartesianX;
    let clickPoint = new Point(newXs, graphPosition.cartesianY);

    graph.dataPoints.push(clickPoint);
    //console.log("In graph: " + graph + ", Added point at : " + printPoint(graph.dataPoints[clickPoint]));
    console.log("In graph: " + graph + ", Added point, at (cartesianX: " + graphPosition.cartesianX + ", cartesianY: " + graphPosition.cartesianY + ").");

    if (graph.graphType === GRAPH_TYPES.REGRESSION) {
        //buildErrorLinesBetween([clickPoint], graph.hypothesisLine);
        //buildCanvasContent();
    }
    renderCanvas(graph);
}

/**
 * Remove point by
 *      (A) finding nearby point to click position
 *      (B) removing from array
 *      (C) triggering redraw of canvas
 * @param graph
 * @param canvasX
 * @param canvasY
 */
function removePoint(graph, canvasX, canvasY) {
    let graphPosition = convertCanvasToGraph(canvasX, canvasY, GRAPH_DECIMALS_ACCURACY);
    let foundPoints = findClosestDataPoints(graph, graphPosition, CLICK_DISTANCE_ACCURACY_TO_POINT);
    for (let i = 0; i < foundPoints.length; i++) {
        let firstMatchPointIndex = graph.dataPoints.indexOf(foundPoints[i]); //index of on references

        let removedPoints = graph.dataPoints.splice(firstMatchPointIndex, 1);
        let removedPoint = removedPoints[0];

        console.log("In graph: " + graph + ", Removed point at : " + printPoint(removedPoint));
    }
    renderCanvas(graph);
}

/**
 * Find nearest element (for now just data points) within a range of 1 cartesian unit, based on mouse hover position.
 * @param graph
 * @param {{cartesianX: {Number}, cartesianY: {Number}}} targetGraphPosition
 * @param {Number} accuracyDistance
 * @returns {Array.<*>} foundPoints
 */
function findClosestDataPoints(graph, targetGraphPosition, accuracyDistance) {

    let foundPoints = graph.dataPoints.filter(function (entry) {
        let foo = targetGraphPosition.cartesianX > entry.x + -accuracyDistance && targetGraphPosition.cartesianX < entry.x + accuracyDistance &&
            targetGraphPosition.cartesianY > entry.y + -accuracyDistance && targetGraphPosition.cartesianY < entry.y + accuracyDistance;
        return foo;
    });

    return foundPoints;
}

function addHighlightPoints(sourceArray, targetArray) {
    addArrayToArrayOnce(sourceArray, targetArray);
}

function addArrayToArrayOnce(sourceArray, targetArray) {
    for (let i = 0; i < sourceArray.length; i++) {
        if (!targetArray.includes(sourceArray[i])) {
            targetArray.push(sourceArray[i]);
        }
    }
}

function removeHighlightPoints(sourceArray, targetArray) {
    removeArrayFromArrayOnce(sourceArray, targetArray);
}

function removeArrayFromArrayOnce(sourceArray, targetArray) {
    for (let i = 0; i < sourceArray.length; i++) {
        if (targetArray.includes(sourceArray[i])) {
            targetArray.splice(sourceArray[i], 1);
        }
    }
}

function arrayDifference(arrayA, arrayB) {
    let diff = arrayA.filter(function (x) {
        return arrayB.indexOf(x) < 0;
    });
    return diff;
}

function injectTemplateControls() {

    let numXparams = model.dataPoints[0].xs.length;
    
    let controlTemplateElementContent = document.querySelector("#control-template");
    controlTemplateElementContent = controlTemplateElementContent.content;

    for (let i = 0; i < numXparams; i++) {
        let newRow = new ControlRow(controlTemplateElementContent);
        newRow.OnControlChange = () => {
            model.hypothesisLine.thetas[i] = newRow.GetValue();
            renderCanvases();
        };
        controlRows.push(newRow);
        let targetContainer = document.querySelector('.container_column');
        targetContainer.appendChild(newRow.element);
        // newRow.element.attributes.id += i;
        let controlSymbolSub = targetContainer.querySelector(".control-symbol").querySelector("sub");
        console.log(controlSymbolSub);
    }
}

let model = new Model();
model.buildSampleDataPoints();
model.buildSampleHypothesisLines();

initGraphs();
buildAxes();
renderCanvases();
injectTemplateControls();

console.log(model.GetTotalError());


//tasks
/*
 - move axes to show negatives plz (at least some way to scale)
 - as you modify b0,b1 (with a button), plot a point a point on the second canvas
 where it's color represents the total error (lerp).
 (ties nicely into gradient descent as is).
 */

//tasks redux
/*
 - create DataPoints with an array of x's and separate my concerns with drawing and data points.
 - refactor existing sample points to accept arrays of data points, e.g. 1x2 arrays, where every x0=0, and x1=
 (before value).
 - .toCanvas or  Graph.drawPoint  can be made, which can accept a dimension parameter
 - make more control rows appear, at least 2.
 - bind the controls so they actually affect the line. (fix bitch)    in injectTemplateControls in the call to
 "newRow.OnControlChange", update the thetas in the ComplexLine, e.g. can make a property to access (from the model)
 (and rerender the canvas)
 - all my *graph* functions can be refactored to operate from the Graph function... emphasizing the MVC model mroe.
 */