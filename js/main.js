var points = [];
var context;

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 300;
const CANVAS_SCALE = 30;

function Point (x, y) {
    this.x = x;
    this.y = y;

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
    var x1 = CANVAS_SCALE * pointBegin.x;
    var x2 = CANVAS_SCALE * pointEnd.x;
    var y1 = CANVAS_SCALE * pointBegin.y;
    var y2 = CANVAS_SCALE * pointEnd.y;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
}

init();
renderCanvas();
