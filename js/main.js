/*
 * Note the design limitation is:
 *      drawing calls are dependant on initialization calls.
 *
 */

let graphs = [];

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;
const CANVAS_SCALE = 30;
const POINT_RADIUS = 5;
const CANVAS_TEXT_OFFSET_COORD = 10;
const CANVAS_TEXT_OFFSET_MAGNI = 5;
const GRAPH_DECIMALS_ACCURACY = 1;
const CLICK_DISTANCE_ACCURACY_TO_POINT = 1/2;

function Graph(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");

    this.cartesianAxes = [];
    this.cartesianAxesArrowHeads = [];
    this.cartesianGraphPoints = [];
    this.dataPoints = [];
    this.highlightPoints = [];
    this.hypothesisLine = {};
}

/**
 * Creates new point for graphing.
 *
 * @param {Number} x
 * @param {Number} y
 */
function Point(x, y) {
    this.x = round(x, 1);
    this.y = round(y, 1);

    this.canvasX = x * CANVAS_SCALE;
    this.canvasY = CANVAS_HEIGHT - (y * CANVAS_SCALE);

    this.customString;
    this.textOffsetX = CANVAS_TEXT_OFFSET_COORD;
    this.textOffsetY = CANVAS_TEXT_OFFSET_COORD;

    Point.maxX = Math.ceil((CANVAS_WIDTH / CANVAS_SCALE) / CANVAS_SCALE) * CANVAS_SCALE;
    Point.maxY = Math.ceil((CANVAS_HEIGHT / CANVAS_SCALE) / CANVAS_SCALE) * CANVAS_SCALE;
}

Point.prototype.toString = function () {
    const result = (this.customString === undefined) ? printPoint(this) : this.customString;
    return result;
};

Point.prototype.setString = function (customString) {
    this.customString = customString;
};

Point.prototype.setTextOffset = function (textOffsetX, textOffsetY) {
    this.textOffsetX = textOffsetX;
    this.textOffsetY = textOffsetY;
};


function initGraphs() {
    graphs.push(initGraph("canvas1")); //regression line graph
    graphs.push(initGraph("canvas2")); //contour plot graph
}

/**
 *
 * @param canvasId
 * @returns {{canvas: (Element|*), context: (CanvasRenderingContext2D|WebGLRenderingContext|*)}}
 */
function initGraph(canvasId) {

    let canvas = document.getElementById(canvasId);
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    canvas.oncontextmenu = (e) => e.preventDefault();
    //canvas.onclick = onClick;
    canvas.onmouseup = onClick;  //try passing variable here of `graph`
    canvas.onmousemove = onMove; //try passing variable here of `graph`

    return new Graph(canvas);
}

function buildCanvasContents() {
    for (let i = 0; i < graphs.length; i++) {
        buildCanvasContent(graphs[i]);
    }
}

function buildCanvasContent(graph) {

    buildCartesianGraphPoints(cartesianGraphPoints);

    buildAxes(cartesianAxes);

    buildSampleDataPoints(graph);

    buildSampleHypothesisLines(graph); //if applicable

    buildErrorLinesBetween(graph.dataPoints, graph.hypothesisLine);

}

function buildSampleDataPoints(graph) {
    graph.dataPoints.push(new Point(1, 1));
    graph.dataPoints.push(new Point(3, 4));
    graph.dataPoints.push(new Point(2, 5));
    graph.dataPoints.push(new Point(3, 6));
    graph.dataPoints.push(new Point(5, 5));
    graph.dataPoints.push(new Point(5, 9));
    graph.dataPoints.push(new Point(6, 4));
    graph.dataPoints.push(new Point(7, 7));
    graph.dataPoints.push(new Point(7, 8));
    graph.dataPoints.push(new Point(8, 7));
    graph.dataPoints.push(new Point(9, 9));
    graph.dataPoints.push(new Point(12, 8));
    graph.dataPoints.push(new Point(13, 9));
    graph.dataPoints.push(new Point(14, 7));
    //graph.dataPoints.push(new Point(18, 8));
}

function buildSampleHypothesisLines(graph) {
    graph.hypothesisLine = new StraightLine(0, 1);
    graph.hypothesisLine.name = "the hypothesis line";
}

function renderCanvases(){
    for (let i = 0; i < graphs.length; i++) {
        renderCanvas(graphs[i]);
    }
}

function renderCanvas(graph) {

    //doesn't work
    graph.context.clearRect(0, 0, graph.canvas.width, graph.canvas.height);

    //works.
    graph.canvas.width = graph.canvas.width;

    drawPoints(graph.cartesianGraphPoints, "lightgray");

    drawPoints(graph.dataPoints, "darkred", true);

    drawLinesBetweenPoints(graph.hypothesisLine.endPoints(), "black");

    drawEachLine(graph.hypothesisLine.errorLines, "forestgreen");
    drawEachLineText(graph.hypothesisLine.errorLines, "forestgreen");

    drawEachLine(graph.cartesianAxes, "black", 5);
    //drawArrowHeads(graph.cartesianAxesArrowHeads, "black", 5);

    //drawPoints(graph.errorLines.endPoints(), "forestgreen");

    drawHighlightPoints(graph.highlightPoints);
    removeHighlightPoints();
}

function drawLinesBetweenPoints(points, fillStyle) {
    let pNext;
    for (let p = 0; p < points.length; p++) {
        pNext = (p + 1) % points.length;
        drawLine(points[p], points[pNext], fillStyle);
    }
}

function drawEachLine(lines, fillStyle, lineWidth) {
    if (lines === undefined) {
        throw new ReferenceError("Cannot draw lines, lines is undefined");
    }
    for (let l = 0; l < lines.length; l++) {
        drawLine(lines[l].p1, lines[l].p2, fillStyle, lineWidth);
    }
}

function drawEachLineText(lines, fillStyle) {
    if (lines === undefined) {
        throw new ReferenceError("Cannot draw line text, lines is undefined");
    }
    for (let l = 0; l < lines.length; l++) {
        drawPointText(lines[l].midpoint, fillStyle);
    }
}

function drawLine(pointBegin, pointEnd, strokeStyle, lineWidth) {
    const originalStrokeStyle = context.strokeStyle;
    const originalLineWidth = context.lineWidth;
    context.beginPath();
    context.moveTo(pointBegin.canvasX, pointBegin.canvasY);
    context.lineTo(pointEnd.canvasX, pointEnd.canvasY);

    if (strokeStyle !== undefined) {
        context.strokeStyle = strokeStyle;
    }

    if (lineWidth !== undefined) {
        context.lineWidth = lineWidth;
    }

    context.stroke();
    context.strokeStyle = originalStrokeStyle;
    context.lineWidth = originalLineWidth;
}

function drawPoints(points, fillStyle, drawText) {
    for (let p = 0; p < points.length; p++) {
        drawPoint(points[p], fillStyle);
        if (drawText) {
            drawPointText(points[p], fillStyle);
        }
    }
}

function drawPoint(point, fillStyle, pointRadius) {
    const originalFillStyle = context.fillStyle;
    context.beginPath();
    context.arc(point.canvasX, point.canvasY, (pointRadius) ? pointRadius : POINT_RADIUS, 0, Math.PI * 2, true);
    context.closePath();
    context.fillStyle = fillStyle;
    context.fill();
    context.fillStyle = originalFillStyle;
}

function drawPointText(point, fillStyle) {
    const originalFillStyle = context.fillStyle;
    context.fillStyle = fillStyle;
    context.fillText(point.toString(), point.canvasX + point.textOffsetX, point.canvasY + point.textOffsetY);
    context.fillStyle = originalFillStyle;
}

function drawHighlightPoints(hightlightPoints) {
    for (let i = 0; i < hightlightPoints.length; i++) {
        drawHighlight(hightlightPoints[i]);
    }
}

function drawHighlight(highlightPoint) {
    drawFatterPoint(highlightPoint);
}

function drawFatterPoint(point) {
    drawPoint(point, "darkyellow", 10);
}

/**
 * Create cartesian graph visualization aid, by making a grid of Points, spaced apart consistently.
 * @param {[Point]} graphPoints
 */

function buildCartesianGraphPoints(graphPoints) {

    //this is not easy to read easily. refactor to be most readable possible:
    for (let x = 0; x <= CANVAS_WIDTH; x += CANVAS_SCALE) {
        for (let y = 0; y <= CANVAS_HEIGHT; y += CANVAS_SCALE) {
            graphPoints.push(new Point(x / CANVAS_SCALE, y / CANVAS_SCALE));
        }
    }
}

function buildAxes(graphLines) {
    graphLines.push(new AxisLine("x"));
    graphLines.push(new AxisLine("y"));
}

/**
 * Basic Line concept, defined as only between two end points.
 */
function Line(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
}

/**
 * Create a straight line, according to math formula y = mx + b, also known as y = b1x + b0.
 * @param {Number} b0
 * @param {Number} b1
 * @constructor
 */
function StraightLine(b0, b1) {

    //y=mx + b
    //y_hat = b0 + b1 * x;
    //y_hat = y_intercept + slope * (x);
    // y = 3 + 1/2 * x;

    this.y_intercept_y_value = b0;
    this.slope = b1;
    this.name = "";
    this.errorLines = [];
    this.totalError = [];

    const x_max = CANVAS_WIDTH / CANVAS_SCALE;
    const y_at_x_max = this.y_intercept_y_value + this.slope * x_max;

    this.p1 = new Point(0, this.y_intercept_y_value); //y-intercept
    this.p2 = new Point(x_max, y_at_x_max);

    Line.call(this, this.p1, this.p2);
}

StraightLine.prototype.endPoints = function () {
    return [this.p1, this.p2];
};

function AxisLine(graphDimension) {
    this.p1 = {};
    this.p2 = {};
    this.a1 = [];
    this.a2 = [];

    if (graphDimension === "x") {
        this.p1 = new Point(0, 0);
        this.p2 = new Point(Point.maxX, 0);

        this.a1.push(new AxisArrows(this.p1, "left"));
        this.a2.push(new AxisArrows(this.p2, "right"));
    }
    else if (graphDimension === "y") {
        this.p1 = new Point(0, 0);
        this.p2 = new Point(0, Point.maxY);

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
    this.p1 = new Point(point.x + off[0][0] * dir[0][0], point.y + off[0][1] * dir[0][1]);
    this.p2 = new Point(point.x + off[0][0] * dir[0][0], point.y + off[0][1] * dir[0][1]);

    this.arrowTipBranch1 = new Line(this.pTip, this.p1);

    //this.arrowTipBranch2 = new Line(this.pTip, this.p2);

    //this.p1 = new Point(pTip.x + offset1x, pTip.y + offset1y);
    //this.p2 = new Point(pTip.x + offset2x, pTip.y + offset2y);
    //this.p2 = new Point(pTip.x + offset2x, pTip.y + offset2y);

    //if (arrowDirection === "")
}

/**
 * An error line goes between 2 points.
 * @param p1
 * @param p2
 * @constructor
 */
function ErrorLine(p1, p2, dataPoint) {
    this.p1 = p1;
    this.p2 = p2;

    const x = (p1.x + p2.x) / 2;
    const y = (p1.y + p2.y) / 2;

    this.midpoint = new Point(x, y);
    this.magnitude = (p1.y < p2.y) ? round(p2.y - p1.y, 2) : round(p1.y - p2.y, 2);

    this.dataPoint = dataPoint;
}

ErrorLine.prototype.toString = function() {
    return printPoint(this.dataPoint) + " with size: " + this.magnitude;
};

ErrorLine.prototype.endPoints = function () {
    return [this.p1, this.p2];
};

/**
 * Create error lines, going vertically from p1 (sample data point) and p2 (intersecting point on hypothesis line)
 *
 * @param {[Point]} additionalSamplePoints
 * @param {StraightLine} hypothesisLine
 */
function buildErrorLinesBetween(additionalSamplePoints, hypothesisLine) {

    //find a point on a line
    //y = mx + b

    const m = hypothesisLine.slope;
    const b = hypothesisLine.y_intercept_y_value;

    for (let p = 0; p < additionalSamplePoints.length; p++) {
        const x = additionalSamplePoints[p].x;
        const y = m * x + b;

        const p1 = additionalSamplePoints[p];
        const p2 = new Point(x, y);

        const errorLine = new ErrorLine(p1, p2, additionalSamplePoints[p]);
        errorLine.midpoint.setString(errorLine.magnitude);
        errorLine.midpoint.setTextOffset(CANVAS_TEXT_OFFSET_MAGNI, 0);

        hypothesisLine.errorLines.push(errorLine);
    }
    getTotalError(hypothesisLine);
}

/**
 * Display scalar amount of error.
 * @param {StraightLine} hypothesisLine
 * @returns {Number} {number}
 */
function getTotalError(hypothesisLine) {
    const errorLines = hypothesisLine.errorLines;
    let totalError = 0;
    const magnitudes = [];

    if (errorLines === undefined) {
        throw new Error("Cannot get total error, errorLines is undefined in " + hypothesisLine.name);
    }

    for (let i = 0; i < errorLines.length; i++) {
        totalError += errorLines[i].magnitude;
        magnitudes.push(" " + errorLines[i].magnitude);
    }
    totalError = round(totalError, 2);
    hypothesisLine.totalError = totalError;
    console.log(hypothesisLine.name);
    console.log("Each error: " + magnitudes.toString());
    console.log("Total error: " + totalError);
    return totalError;
}

/**
 * Limit number of decimal places for a float value
 * @param {Number} value
 * @param {Integer} decimals
 * @returns {number}
 */
function round(value, decimals) {
    if (decimals === undefined) {
        throw new TypeError("Cannot round to nearest decimal, as number of decimal places isn't specified.");
    }
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function onClick(e) {
    let element = graphs[0].canvas; //for now just hard-code
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
            console.log('Left button clicked, Adding point, at (canvasX: ' + canvasX + ", canvasY: " + canvasY + ").");
            addPoint(element, canvasX, canvasY);
            break;

        case 1:
            console.log('Middle button clicked, unimplemented');
            break;

        case 2:
            console.log('Right button clicked, Removing point, at (canvasX: ' + canvasX + ", canvasY: " + canvasY + ").");
            removePoint(element, canvasX, canvasY);
            break;

        default:
            console.log('Unexpected button code from click: ' + btnCode);
    }

    //tasks
    /*
     - 2 html sliders(b0, b1) to control the (line).
     - add a second canvas to plot b0, b1
     - move axes to show negatives plz (at least some way to scale)
     - as you modify b0,b1 (with a button), plot a point a point on the second canvas
     where it's color represents the total error (lerp).
     (ties nicely into gradient descent as is).
     */
}

function onMove(e) {
    let element = graphs[0].canvas; //for now just hard-code
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

    let closestDataPoints = findClosestDataPoints(graphPosition, CLICK_DISTANCE_ACCURACY_TO_POINT)

    addHighlightPoints(closestDataPoints, element.highlightPoints);

    let diff = arrayDifference (element.dataPoints, closestDataPoints);

    removeHighlightPoints(diff, element.highlightPoints);

    renderCanvas(element);
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
    return "(" + point.x + ", " + point.y + ")";
}

/**
 * Add point by
 *      (A) adapting click position to cartesian system
 *      (B) adding to array
 *      (C) triggering redraw of canvas
 * @param canvasX
 * @param canvasY
 */
function addPoint(graph, canvasX, canvasY) {
    let graphPosition = convertCanvasToGraph(canvasX, canvasY, GRAPH_DECIMALS_ACCURACY);
    let clickPoint = new Point(graphPosition.cartesianX, graphPosition.cartesianY);

    graph.dataPoints.push(clickPoint);
    buildErrorLinesBetween([clickPoint], graph.hypothesisLine);
    //buildCanvasContent();
    renderCanvas();
}

/**
 * Remove point by
 *      (A) finding nearby point to click position
 *      (B) removing from array
 *      (C) triggering redraw of canvas
 * @param canvasX
 * @param canvasY
 */
function removePoint(graph, canvasX, canvasY) {
    let graphPosition = convertCanvasToGraph(canvasX, canvasY, GRAPH_DECIMALS_ACCURACY);
    let foundPoints = findClosestDataPoints(graphPosition, CLICK_DISTANCE_ACCURACY_TO_POINT);
    for (let i = 0; i < foundPoints.length; i++) {
        let firstMatchPoint = graph.dataPoints.indexOf(foundPoints[i]); //index of on references

        //remove related error line before removing the data point
        removeErrorLine(graph.dataPoints[firstMatchPoint], graph.hypothesisLine);

        console.log("Removing point at : " + printPoint(graph.dataPoints[firstMatchPoint]));
        let removedPoint = graph.dataPoints.splice(firstMatchPoint, 1);
    }
    renderCanvas();
}

function removeErrorLine(dataPoint, hypothesisLine) {

    for (let i = 0; i < hypothesisLine.errorLines.length; i++) {
        if (dataPoint === hypothesisLine.errorLines[i].dataPoint) {
            console.log("Removing error line at: " + hypothesisLine.errorLines[i]);
            let removedErrorLine = hypothesisLine.errorLines.splice(i, 1);
        }
    }
}

/**
 * Find nearest element (for now just data points) within a range of 1 cartesian unit, based on mouse hover position.
 * @param {{cartesianX: {Number}, cartesianY: {Number}}} targetGraphPosition
 * @param {Number} accuracyDistance
 * @returns {Array.<*>} foundPoints
 */
function findClosestDataPoints(targetGraphPosition, accuracyDistance) {

    let foundPoints = dataPoints.filter(function (entry) {
        let foo = targetGraphPosition.cartesianX > entry.x + - accuracyDistance && targetGraphPosition.cartesianX < entry.x + accuracyDistance &&
            targetGraphPosition.cartesianY > entry.y + - accuracyDistance && targetGraphPosition.cartesianY < entry.y + accuracyDistance;
        return foo;
    });

    return foundPoints;
}

function addHighlightPoints (sourceArray, targetArray) {
    addArrayToArrayOnce(sourceArray, targetArray);
}

function addArrayToArrayOnce(sourceArray, targetArray) {
    for (let i = 0; i < sourceArray.length; i++) {
        if (!targetArray.includes(sourceArray[i])) {
            targetArray.push(sourceArray[i]);
        }
    }
}

function removeHighlightPoints (sourceArray, targetArray) {
    removeArrayFromArrayOnce(sourceArray, targetArray);
} 

function removeArrayFromArrayOnce(sourceArray, targetArray) {
    for (let i = 0; i < sourceArray.length; i++) {
        if (targetArray.includes(sourceArray[i])) {
            targetArray.splice(sourceArray[i], 1);
        }
    }
}

function arrayDifference (arrayA, arrayB) {
    let diff = arrayA.filter(function(x) { return arrayB.indexOf(x) < 0; });
    return diff;
}


initGraphs();
buildCanvasContents();
renderCanvases();


// setTimeout(() => {
//     const point = new Point(10, 10);
//     dataPoints.push(point);
//     buildCanvasContent();
//     renderCanvas();
// }, 3000);


//window.onload = renderCanvas;

