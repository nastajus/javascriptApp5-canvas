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

        drawLines();
        drawPoints();

        initAndDrawGrid();

    }
}

function drawPoints() {
    for (var p = 0; p < points.length; p++) {
        drawPoint(points[p]);
        console.log (points[p].toString());
    }
}

function drawLines() {
    var pNext;
    for (var p = 0; p < points.length; p++) {
        pNext = (p + 1) % points.length;
        drawLine(points[p], points[pNext]);
    }
}

function drawLine(pointBegin, pointEnd) {
    context.beginPath();
    var x1 = pointBegin.canvasX;
    var x2 = pointEnd.canvasX;
    var y1 = pointBegin.canvasY;
    var y2 = pointEnd.canvasY;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
}

function drawPoint(point) {
    context.beginPath();
    context.arc(point.canvasX, point.canvasY, POINT_RADIUS, 0, Math.PI*2, true);
    context.closePath();
    context.fill();
}

function initAndDrawGrid() {

}

init();
renderCanvas();
