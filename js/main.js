var points = [];
var context;

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 300;
const CANVAS_SCALE = 30;
const POINT_RADIUS = 5;

function Point (x, y) {
    this.x = x;
    this.y = y;

    this.canvasX = x * CANVAS_SCALE;
    this.canvasY = y * CANVAS_SCALE;

    Point.prototype.toString = function () {
        return "(" + this.x + "," + this.y + ")";
    };
}

function Rectangle(width, height, rotation) {

}

function init () {

    initSamplePoints();


//     var color = "lightblue";
//     initLinesBetweenPoints(points, color);
}

function initSamplePoints() {
    points.push(new Point(1,1));
    points.push(new Point(4,4));
    points.push(new Point(8,8));
    points.push(new Point(9,9));
    console.log (points);
}

function renderCanvas() {
    window.onload = function () {
        var canvas = document.getElementById("canvas");
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        context = canvas.getContext("2d");
        //context.font = "20px Georgia";

        initAndDrawGrid();

        drawLines();
        drawPoints();

    }
}

function drawLines(fillStyle) {
    var pNext;
    for (var p = 0; p < points.length; p++) {
        pNext = (p + 1) % points.length;
        drawLine(points[p], points[pNext], fillStyle);
    }
}

function drawLine(pointBegin, pointEnd, fillStyle) {
    context.beginPath();
    context.moveTo(pointBegin.canvasX, pointBegin.canvasY);
    context.lineTo(pointEnd.canvasX, pointEnd.canvasY);
    context.fillStyle = (fillStyle === undefined) ? "#000000" : fillStyle;
    context.stroke();
}

function drawPoints(fillStyle) {
    for (var p = 0; p < points.length; p++) {
        drawPoint(points[p], fillStyle);
        //console.log (points[p].toString());
        drawPointText(points[p], fillStyle);
    }
}

function drawPoint(point, fillStyle) {
    context.beginPath();
    context.arc(point.canvasX, point.canvasY, POINT_RADIUS, 0, Math.PI*2, true);
    context.closePath();
    context.fillStyle = (fillStyle === undefined) ? "#000000" : fillStyle;
    context.fill();
}

function drawPointText(point, fillStyle) {
    const CANVAS_TEXT_OFFSET = 10;
    context.fillStyle = (fillStyle === undefined) ? "#000000" : fillStyle;
    context.fillText(point.toString(), point.canvasX + CANVAS_TEXT_OFFSET, point.canvasY + CANVAS_TEXT_OFFSET);
}

function initAndDrawGrid() {
    var gridPoints = [];
    const GRID_SQUARE_SIZE = 30;

    //this is not easy to read easily. refactor to be most readable possible:
    for (var x = 0; x <= CANVAS_WIDTH; x += GRID_SQUARE_SIZE ) {
        for (var y = 0; y <= CANVAS_HEIGHT; y += GRID_SQUARE_SIZE ) {
            gridPoints.push(new Point(x / GRID_SQUARE_SIZE, y / GRID_SQUARE_SIZE));
        }
    }

    for (var g = 0; g < gridPoints.length; g++) {
        drawPoint(gridPoints[g], "lightgray");
    }
}

init();
renderCanvas();
