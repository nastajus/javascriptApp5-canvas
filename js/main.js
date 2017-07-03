var context;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 300;
const CANVAS_SCALE = 30;
const POINT_RADIUS = 5;

var gridPoints = [];
var dataPoints = [];
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

    initSpreadPoints();

    //initLinearAlgebraLine(hypothesisLinePoints, 3, 1/2);
    hypothesisLinePoints = new Line(3, 1/2).endPoints();

    //initLinearAlgebraLine(potentialCorrectLinePoints, -2, 1/3);
    potentialCorrectLinePoints = new Line(-2, 1/3).endPoints();

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

function renderCanvas() {
    window.onload = function () {
        var canvas = document.getElementById("canvas");
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        context = canvas.getContext("2d");

        initGridPoints(gridPoints, "lightgray");
        drawPoints(gridPoints, "lightgray");

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

function Line(b0, b1) {

    this.y_intercept_y_value = b0;
    this.slope = b1;

    Line.prototype.endPoints = function() {
        const x_max = CANVAS_WIDTH / CANVAS_SCALE;
        var y_at_x_max = this.y_intercept_y_value + this.slope * x_max;

        var p1 = new Point (0, this.y_intercept_y_value); //y-intercept
        var p2 = new Point (x_max, y_at_x_max);
        return [p1, p2];
    };

    //y=mx + b
    //y_hat = b0 + b1 * x;
    //y_hat = y_intercept + slope * (x);
    // y = 3 + 1/2 * x;
}

init();
renderCanvas();
