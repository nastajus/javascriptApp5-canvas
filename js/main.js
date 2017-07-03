var context;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 300;
const CANVAS_SCALE = 30;
const POINT_RADIUS = 5;

var gridPoints = [];
var dataPoints = [];
var hypothesisLine;
var potentialCorrectLine;
var errorLines = [];

function Point (x, y) {
    this.x = x;
    this.y = y;
    //this.errorLine;

    this.canvasX = x * CANVAS_SCALE;
    this.canvasY = CANVAS_HEIGHT - (y * CANVAS_SCALE);

    Point.prototype.toString = function () {
        return "(" + this.x + "," + this.y + ")";
    };


    // Point.prototype.getErrorLine = function () {
    //     return this.errorLine;
    // };
    //
    // Point.prototype.setErrorLine = function (errorLine) {
    //     this.errorLine = errorLine;
    // };

}

function init () {

    initSpreadPoints();

    initLines();

    initErrorLines(dataPoints, hypothesisLine);

}

function initSpreadPoints() {
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

function initLines() {
    //initLinearAlgebraLine(hypothesisLinePoints, 3, 1/2);
    hypothesisLine = new Line(3, 1/2);

    //initLinearAlgebraLine(potentialCorrectLinePoints, -2, 1/3);
    potentialCorrectLine = new Line(-2, 1/3);
}

function renderCanvas() {
    window.onload = function () {
        var canvas = document.getElementById("canvas");
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        context = canvas.getContext("2d");

        initGridPoints(gridPoints, "lightgray");
        drawPoints(gridPoints, "lightgray");

        drawPoints(dataPoints, "darkred", true);

        drawLinesBetweenPoints(hypothesisLine.endPoints(), "darkred");
        drawLinesBetweenPoints(potentialCorrectLine.endPoints(), "black");

        drawEachLine(errorLines, "forestgreen");
        //drawEachLineText(errorLines, "forestgreen");
        //drawPoints(errorLines.endPoints(), "forestgreen");
    }
}

function drawLinesBetweenPoints(points, fillStyle) {
    var pNext;
    for (var p = 0; p < points.length; p++) {
        pNext = (p + 1) % points.length;
        drawLine(points[p], points[pNext], fillStyle);
    }
}

function drawEachLine(lines, fillStyle) {
    for (var l = 0; l < lines.length; l++) {
        drawLine(lines[l].p1, lines[l].p2, fillStyle);
    }
}

function drawEachLineText(lines, fillStyle) {
    for (var l = 0; l < lines.length; l++) {
        drawPointText(lines[l].midpoint, fillStyle);
    }
}

function drawLine(pointBegin, pointEnd, strokeStyle) {
    context.beginPath();
    context.moveTo(pointBegin.canvasX, pointBegin.canvasY);
    context.lineTo(pointEnd.canvasX, pointEnd.canvasY);
    context.strokeStyle = (strokeStyle === null) ? context.strokeStyle : strokeStyle;
    context.stroke();
}

function drawPoints(points, fillStyle, drawText) {
    for (var p = 0; p < points.length; p++) {
        drawPoint(points[p], fillStyle);
        if (drawText) {
            drawPointText(points[p], fillStyle);
        }
    }
}

function drawPoint(point, fillStyle) {
    context.beginPath();
    context.arc(point.canvasX, point.canvasY, POINT_RADIUS, 0, Math.PI*2, true);
    context.closePath();
    context.fillStyle = (fillStyle === null) ? context.fillStyle : fillStyle;
    context.fill();
}

function drawPointText(point, fillStyle) {
    const CANVAS_TEXT_OFFSET = 10;
    context.fillStyle = (fillStyle === null) ? context.fillStyle : fillStyle;
    context.fillText(point.toString(), point.canvasX + CANVAS_TEXT_OFFSET, point.canvasY + CANVAS_TEXT_OFFSET);
}

function initGridPoints(gridPoints) {
    const GRID_SQUARE_SIZE = 30;

    //this is not easy to read easily. refactor to be most readable possible:
    for (var x = 0; x <= CANVAS_WIDTH; x += GRID_SQUARE_SIZE ) {
        for (var y = 0; y <= CANVAS_HEIGHT; y += GRID_SQUARE_SIZE ) {
            gridPoints.push(new Point(x / GRID_SQUARE_SIZE, y / GRID_SQUARE_SIZE));
        }
    }
}

function Line(b0, b1) {

    //y=mx + b
    //y_hat = b0 + b1 * x;
    //y_hat = y_intercept + slope * (x);
    // y = 3 + 1/2 * x;

    this.y_intercept_y_value = b0;
    this.slope = b1;

    const x_max = CANVAS_WIDTH / CANVAS_SCALE;
    var y_at_x_max = this.y_intercept_y_value + this.slope * x_max;

    this.p1 = new Point (0, this.y_intercept_y_value); //y-intercept
    this.p2 = new Point (x_max, y_at_x_max);

    Line.prototype.endPoints = function() {
        return [this.p1, this.p2];
    };
}

function LineOfPoints(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;

    var x = (p1.x + p2.x) / 2;
    var y = (p1.y + p2.y) / 2;

    this.midpoint = new Point(x, y);
    this.magnitude = x;

    LineOfPoints.prototype.endPoints = function() {
        return [this.p1, this.p2];
    };

    // LineOfPoints.prototype.toString = function() {
    //     return this.magnitude;
    // }

}

function initErrorLines(points, line) {

    //find a point on a line
    //y = mx + b

    var m = line.slope;
    var b = line.y_intercept_y_value;


    //var lines = [];
    for (var p = 0; p < points.length; p++) {
        var x = points[p].x;
        var y = m * x + b;

        var p1 = points[p];
        var p2 = new Point(x, y);

        var errorLine = new LineOfPoints(p1, p2);
        errorLines.push(errorLine);
        // points[p].setErrorLine(errorLine);
    }
    var d;
    //return lines;
    //errorLines;
}

function getLineIntercept() {

}

init();
renderCanvas();
