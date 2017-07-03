var context;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 300;
const CANVAS_SCALE = 30;
const POINT_RADIUS = 5;

var gridPoints = [];
var dataPoints = [];
var dataPointsContainer = [];
var hypothesisLinePoints = [];
var potentialCorrectLinePoints =[];

function Point (x, y) {
    this.x = x;
    this.y = y;

    this.canvasX = x * CANVAS_SCALE;
    this.canvasY = CANVAS_HEIGHT - (y * CANVAS_SCALE);

    Point.prototype.toString = function () {
        return "(" + this.x + "," + this.y + ")";
    };
}

function init () {

    //initTrapezoidPoints();
    //initRandomDataPoints();
    //initRandomDataPointsContainer();
    initSpreadPoints();
    initLinearAlgebraLine(hypothesisLinePoints, 3, 1/2);
    initLinearAlgebraLine(potentialCorrectLinePoints, -2, 1/3);

}

function initTrapezoidPoints() {
    dataPoints.push(new Point(3,1));
    dataPoints.push(new Point(1,5));
    dataPoints.push(new Point(8,8));
    dataPoints.push(new Point(10,2));
}

function initRandomDataPoints() {
    const minX = 1, maxX = 19;
    const minY = 1, maxY = 9;

    for (var i = 0; i < 10; i++) {
        var randX = Math.floor(Math.random() * (maxX - minX)) + minX;
        var randY = Math.floor(Math.random() * (maxY - minY)) + minY;
        dataPoints.push(new Point (randX, randY));
    }
}

function initRandomDataPointsContainer() {
    dataPointsContainer.push(new Point(2,9));
    dataPointsContainer.push(new Point(1,8));
    dataPointsContainer.push(new Point(5,5));
    dataPointsContainer.push(new Point(13,1));
    dataPointsContainer.push(new Point(19,2));
    dataPointsContainer.push(new Point(16,6));
}

// function initRandomDataPointsContained(){
//
// }

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

function renderCanvas() {
    window.onload = function () {
        var canvas = document.getElementById("canvas");
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        context = canvas.getContext("2d");
        //context.font = "20px Georgia";

        initGridPoints(gridPoints, "lightgray");
        drawPoints(gridPoints, "lightgray");

        //drawLinesBetweenPoints(dataPoints);
        drawPoints(dataPoints, "darkred", true);

        drawLinesBetweenPoints(hypothesisLinePoints, "darkred");
        drawLinesBetweenPoints(potentialCorrectLinePoints, "black");
    }
}

function drawLinesBetweenPoints(points, fillStyle) {
    var pNext;
    for (var p = 0; p < points.length; p++) {
        pNext = (p + 1) % points.length;
        drawLine(points[p], points[pNext], fillStyle);
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

function initLinearAlgebraLine(linePoints, b0, b1) {
    //y=mx + b
    //y_hat = b0 + b1 * x;
    //y_hat = y_intercept + slope * (x);
    // y = 3 + 1/2 * x;

    var y_axis_interecept = new Point(0, b0);
    var slope = b1; //unused

    var x_max = CANVAS_WIDTH / CANVAS_SCALE;
    var canvas_right_side_intercept = new Point(x_max, b0 + b1 * x_max);

    linePoints.push(y_axis_interecept);
    linePoints.push(canvas_right_side_intercept);

}

init();
renderCanvas();
