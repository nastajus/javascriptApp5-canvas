/*
 * Note the design limitation is:
 *      drawing calls are dependant on initialization calls.
 *
 */

const canvas = document.getElementById("canvas");
let context;
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 900;
const CANVAS_SCALE = 30;
const POINT_RADIUS = 5;
const CANVAS_TEXT_OFFSET_COORD = 10;
const CANVAS_TEXT_OFFSET_MAGNI = 5;

const gridPoints = [];
const dataPoints = [];
let sampleHypothesisLineGood;
var sampleHypothesisLineBad;


/**
 * Creates new point for graphing.
 *
 * @param {Number} x
 * @param {Number} y
 */
function Point (x, y) {
    this.x = round(x, 1);
    this.y = round(y, 1);

    this.canvasX = x * CANVAS_SCALE;
    this.canvasY = CANVAS_HEIGHT - (y * CANVAS_SCALE);

    this.customString;
    this.textOffsetX = CANVAS_TEXT_OFFSET_COORD;
    this.textOffsetY = CANVAS_TEXT_OFFSET_COORD;
}

Point.prototype.toString = function () {
    const result = (this.customString === undefined) ? "(" + this.x + ", " + this.y + ")" : this.customString;
    return result;
};

Point.prototype.setString = function (customString) {
    this.customString = customString;
};

Point.prototype.setTextOffset = function (textOffsetX, textOffsetY) {
    this.textOffsetX = textOffsetX;
    this.textOffsetY = textOffsetY;
};


function initCanvas() {
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    context = canvas.getContext("2d");
    canvas.oncontextmenu = (e) => e.preventDefault();
    //canvas.onclick = onClick;
    canvas.onmouseup = onClick;

}

function buildCanvasContent () {

    buildSampleDataPoints();

    buildSampleHypothesisLines();

    //buildErrorLinesBetween(dataPoints, sampleHypothesisLineGood);
    buildErrorLinesBetween(dataPoints, sampleHypothesisLineBad);

}

function buildSampleDataPoints() {
    dataPoints.push(new Point(1,1));
    dataPoints.push(new Point(3,4));
    dataPoints.push(new Point(2,5));
    dataPoints.push(new Point(3,6));
    dataPoints.push(new Point(5,5));
    dataPoints.push(new Point(5,9));
    dataPoints.push(new Point(6,4));
    dataPoints.push(new Point(7,7));
    dataPoints.push(new Point(7,8));
    dataPoints.push(new Point(8,7));
    dataPoints.push(new Point(9,9));
    dataPoints.push(new Point(12,8));
    dataPoints.push(new Point(13,9));
    dataPoints.push(new Point(14,7));
    dataPoints.push(new Point(18,8));
}

function buildSampleHypothesisLines() {
    sampleHypothesisLineGood = new Line(3, 1/2);
    sampleHypothesisLineGood.name = "good line";

    sampleHypothesisLineBad = new Line(-2, 1/3);
    sampleHypothesisLineBad.name = "bad line";
}

function renderCanvas() {

    //doesn't work
    context.clearRect(0, 0, canvas.width, canvas.height);

    //works.
    canvas.width = canvas.width;

    initGridPoints(gridPoints, "lightgray");
    drawPoints(gridPoints, "lightgray");

    drawPoints(dataPoints, "darkred", true);

    drawLinesBetweenPoints(sampleHypothesisLineGood.endPoints(), "darkred");
    drawLinesBetweenPoints(sampleHypothesisLineBad.endPoints(), "black");

    drawEachLine(sampleHypothesisLineGood.errorLines, "forestgreen");
    drawEachLineText(sampleHypothesisLineGood.errorLines, "forestgreen");

    drawEachLine(sampleHypothesisLineBad.errorLines, "forestgreen");
    drawEachLineText(sampleHypothesisLineBad.errorLines, "forestgreen");

    //drawPoints(errorLines.endPoints(), "forestgreen");
}

function drawLinesBetweenPoints(points, fillStyle) {
    let pNext;
    for (let p = 0; p < points.length; p++) {
        pNext = (p + 1) % points.length;
        drawLine(points[p], points[pNext], fillStyle);
    }
}

function drawEachLine(lines, fillStyle) {
    if (lines === undefined) {
        throw new ReferenceError("Cannot draw lines, lines is undefined");
    }
    for (let l = 0; l < lines.length; l++) {
        drawLine(lines[l].p1, lines[l].p2, fillStyle);
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

function drawLine(pointBegin, pointEnd, strokeStyle) {
    const originalStrokeStyle = context.strokeStyle;
    context.beginPath();
    context.moveTo(pointBegin.canvasX, pointBegin.canvasY);
    context.lineTo(pointEnd.canvasX, pointEnd.canvasY);
    context.strokeStyle = strokeStyle;
    context.stroke();
    context.strokeStyle = originalStrokeStyle;
}

function drawPoints(points, fillStyle, drawText) {
    for (let p = 0; p < points.length; p++) {
        drawPoint(points[p], fillStyle);
        if (drawText) {
            drawPointText(points[p], fillStyle);
        }
    }
}

function drawPoint(point, fillStyle) {
    const originalFillStyle = context.fillStyle;
    context.beginPath();
    context.arc(point.canvasX, point.canvasY, POINT_RADIUS, 0, Math.PI*2, true);
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

/**
 * Create cartesian graph visualization aid, by making a grid of Points, spaced apart consistently.
 * @param {[Point]} gridPoints
 */

function initGridPoints(gridPoints) {

    //this is not easy to read easily. refactor to be most readable possible:
    for (let x = 0; x <= CANVAS_WIDTH; x += CANVAS_SCALE ) {
        for (let y = 0; y <= CANVAS_HEIGHT; y += CANVAS_SCALE ) {
            gridPoints.push(new Point(x / CANVAS_SCALE, y / CANVAS_SCALE));
        }
    }
}

/**
 * Create a line, according to math formula y = mx + b, also known as y = b1x + b0.
 * @param {Number} b0
 * @param {Number} b1
 * @constructor
 */
function Line(b0, b1) {

    //y=mx + b
    //y_hat = b0 + b1 * x;
    //y_hat = y_intercept + slope * (x);
    // y = 3 + 1/2 * x;

    this.y_intercept_y_value = b0;
    this.slope = b1;
    this.name;
    this.errorLines;
    this.totalError = [];

    const x_max = CANVAS_WIDTH / CANVAS_SCALE;
    const y_at_x_max = this.y_intercept_y_value + this.slope * x_max;

    this.p1 = new Point (0, this.y_intercept_y_value); //y-intercept
    this.p2 = new Point (x_max, y_at_x_max);
}

Line.prototype.endPoints = function() {
    return [this.p1, this.p2];
};

Line.prototype.setName = function(name) {
    this.name = name;
};

Line.prototype.setErrorLines = function(errorLines) {
    this.errorLines = errorLines;
};

Line.prototype.setTotalError = function(totalError) {
    this.totalError = totalError;
};


/**
 * An error line goes between 2 points.
 * @param p1
 * @param p2
 * @constructor
 */
function ErrorLine(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;

    const x = (p1.x + p2.x) / 2;
    const y = (p1.y + p2.y) / 2;

    this.midpoint = new Point(x, y);
    this.magnitude = (p1.y < p2.y) ? round(p2.y - p1.y, 2) : round(p1.y - p2.y, 2);

    // ErrorLine.prototype.toString = function() {
    //     return this.magnitude;
    // }
}

ErrorLine.prototype.endPoints = function() {
    return [this.p1, this.p2];
};

/**
 * Create error lines, going vertically from p1 (sample data point) and p2 (intersecting point on hypothesis line)
 *
 * @param {[Point]} additionalSamplePoints
 * @param {Line} hypothesisLine
 */
function buildErrorLinesBetween(additionalSamplePoints, hypothesisLine) {

    //find a point on a line
    //y = mx + b

    const m = hypothesisLine.slope;
    const b = hypothesisLine.y_intercept_y_value;
    const errorLines = [];

    for (let p = 0; p < additionalSamplePoints.length; p++) {
        const x = additionalSamplePoints[p].x;
        const y = m * x + b;

        const p1 = additionalSamplePoints[p];
        const p2 = new Point(x, y);

        const errorLine = new ErrorLine(p1, p2);
        errorLine.midpoint.setString(errorLine.magnitude);
        errorLine.midpoint.setTextOffset(CANVAS_TEXT_OFFSET_MAGNI, 0);
        errorLines.push(errorLine);
    }
    Line.prototype.setErrorLines(errorLines);
    getTotalError(hypothesisLine);
}

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
    console.log (hypothesisLine.name);
    console.log ("Each error: " + magnitudes.toString());
    console.log ("Total error: " + totalError);
    return totalError;
}

/**
 * Limit number of decimal places for a float value
 * @param {Number} value
 * @param {Integer} decimals
 * @returns {number}
 */
function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function onClick(e) {
    let element = canvas;
    let offsetX = 0, offsetY = 0;

    if (element.offsetParent) {
        do {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
        } while ((element = element.offsetParent));
    }

    let pageX = e.pageX - offsetX;
    let pageY = e.pageY - offsetY;
    console.log ("  " + pageX + " " + pageY);

    let btnCode = e.button;

    switch (btnCode) {
        case 0:
            console.log('Left button clicked.');
            break;

        case 1:
            console.log('Middle button clicked.');
            break;

        case 2:
            console.log('Right button clicked.');
            break;

        default:
            console.log('Unexpected code: ' + btnCode);
    }

    let graphPosition = convertCanvasToGraph(pageX, pageY);
    let clickPoint = new Point(graphPosition.cartesianX, graphPosition.cartesianY);

    dataPoints.push(clickPoint);
    //buildCanvasContent();
    //buildErrorLinesBetween(clickPoint, sampleHypothesisLineGood);
    buildErrorLinesBetween(clickPoint, sampleHypothesisLineBad);
    renderCanvas();

    //tasks
    /*
    - make a pixels to ___ conversion function
    - add points (lclick)
    - delete points (rclick)
    - 2 html sliders(b0, b1) to control the (line).
    - add a second canvas to plot b0, b1
    - move axes to show negatives plz (at least some way to scale)
    - as you modify b0,b1 (with a button), plot a point a point on the second canvas
        where it's color represents the total error (lerp).
            (ties nicely into gradient descent as is).
     */
}

/**
 * Converts X and Y page positions, into the graphing cartesian system.
 * Note these are already offset by the canvas' position within the page.
 *
 * @param {Number} pageX
 * @param {Number} pageY
 * @returns {{cartesianX: {Number} number, cartesianY: {Number} number}}
 */
function convertCanvasToGraph(pageX, pageY) {
    return { cartesianX : (pageX / CANVAS_SCALE), cartesianY: ((CANVAS_HEIGHT - pageY) / CANVAS_SCALE) }
}


initCanvas();
buildCanvasContent();
renderCanvas();


// setTimeout(() => {
//     const point = new Point(10, 10);
//     dataPoints.push(point);
//     buildCanvasContent();
//     renderCanvas();
// }, 3000);


//window.onload = renderCanvas;

