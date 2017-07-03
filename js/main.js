var context;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 300;
const CANVAS_SCALE = 30;
const POINT_RADIUS = 5;
const CANVAS_TEXT_OFFSET_COORD = 10;
const CANVAS_TEXT_OFFSET_MAGNI = 5;

var gridPoints = [];
var dataPoints = [];
var goodHypothesisLine;
var badHypothesisLine;

function Point (x, y) {
    this.x = x;
    this.y = y;

    this.canvasX = x * CANVAS_SCALE;
    this.canvasY = CANVAS_HEIGHT - (y * CANVAS_SCALE);

    this.customString;
    this.textOffsetX = CANVAS_TEXT_OFFSET_COORD;
    this.textOffsetY = CANVAS_TEXT_OFFSET_COORD;

    Point.prototype.toString = function () {
        var result = (this.customString === undefined) ? "(" + this.x + "," + this.y + ")" : this.customString;
        return result;
    };

    Point.prototype.setString = function (customString) {
        this.customString = customString;
    };

    Point.prototype.setTextOffset = function (textOffsetX, textOffsetY) {
        this.textOffsetX = textOffsetX;
        this.textOffsetY = textOffsetY;
    };

}

function init () {

    initSpreadPoints();

    initLines();

    //getTotalError(goodHypothesisLine);
    //getTotalError(badHypothesisLine);

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
    goodHypothesisLine = new Line(3, 1/2);
    goodHypothesisLine.name = "good line";

    badHypothesisLine = new Line(-2, 1/3);
    badHypothesisLine.name = "bad line";
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

        drawLinesBetweenPoints(goodHypothesisLine.endPoints(), "darkred");
        drawLinesBetweenPoints(badHypothesisLine.endPoints(), "black");

        goodHypothesisLine.drawEachLine("forestgreen");

        // drawEachLine(goodHypothesisLine.errorLines, "forestgreen");
        // drawEachLineText(goodHypothesisLine.errorLines, "forestgreen");
        //
        // drawEachLine(badHypothesisLine.errorLines, "forestgreen");
        // drawEachLineText(badHypothesisLine.errorLines, "forestgreen");

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



function drawLine(pointBegin, pointEnd, strokeStyle) {
    var originalStrokeStyle = context.strokeStyle;
    context.beginPath();
    context.moveTo(pointBegin.canvasX, pointBegin.canvasY);
    context.lineTo(pointEnd.canvasX, pointEnd.canvasY);
    context.strokeStyle = strokeStyle;
    context.stroke();
    context.strokeStyle = originalStrokeStyle;
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
    var originalFillStyle = context.fillStyle;
    context.beginPath();
    context.arc(point.canvasX, point.canvasY, POINT_RADIUS, 0, Math.PI*2, true);
    context.closePath();
    context.fillStyle = fillStyle;
    context.fill();
    context.fillStyle = originalFillStyle;
}

function drawPointText(point, fillStyle) {
    var originalFillStyle = context.fillStyle;
    context.fillStyle = fillStyle;
    context.fillText(point.toString(), point.canvasX + point.textOffsetX, point.canvasY + point.textOffsetY);
    context.fillStyle = originalFillStyle;
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
    this.name;
    this.errorLines;
    this.totalError = [];

    const x_max = CANVAS_WIDTH / CANVAS_SCALE;
    var y_at_x_max = this.y_intercept_y_value + this.slope * x_max;

    this.p1 = new Point (0, this.y_intercept_y_value); //y-intercept
    this.p2 = new Point (x_max, y_at_x_max);

    // //initErrorLines(dataPoints, goodHypothesisLine);
    // initErrorLines(dataPoints, badHypothesisLine);

    Line.prototype.endPoints = function() {
        return [this.p1, this.p2];
    };

    Line.prototype.setName = function(name) {
        this.name = name;
    };

    // Line.prototype.initErrorLines = initErrorLines (dataPoints, this);

    Line.prototype.initErrorLines = function (points, line) {

        //y = mx + b

        var m = line.slope;
        var b = line.y_intercept_y_value;
        var errorLines = [];

        for (var p = 0; p < points.length; p++) {
            var x = points[p].x;
            var y = m * x + b;

            var p1 = points[p];
            var p2 = new Point(x, y);    //find a point on a line


            var errorLine = new ErrorLine(p1, p2);
            errorLine.midpoint.setString(errorLine.magnitude);
            errorLine.midpoint.setTextOffset(CANVAS_TEXT_OFFSET_MAGNI, 0);
            errorLines.push(errorLine);
        }
        this.errorLines = errorLines;

    }(dataPoints, this);

    Line.prototype.getTotalError = function(hypothesisLine) {
        var errorLines = this.errorLines;
        var totalError = 0;
        var magnitudes = [];

        if (errorLines === undefined) {
            throw new Error("Cannot get total error, errorLines is undefined in " + this.name);
        }

        for (var i = 0; i < errorLines.length; i++) {
            totalError += errorLines[i].magnitude;
            magnitudes.push(" " + errorLines[i].magnitude);
        }
        totalError = round(totalError, 2);
        this.totalError = totalError;
        console.log (this.name);
        console.log ("Each error: " + magnitudes.toString());
        console.log ("Total error: " + totalError);
        //return totalError;
    }(this);

    // Line.prototype.setErrorLines = function(errorLines) {
    //     this.errorLines = errorLines;
    // };

    Line.prototype.setTotalError = function(totalError) {
        this.totalError = totalError;
    };

    Line.prototype.drawEachLine = function (fillStyle) {
        if (this.errorLines === undefined) {
            throw new ReferenceError("Cannot draw lines, lines is undefined");
        }
        for (var l = 0; l < this.errorLines.length; l++) {
            drawLine(this.errorLines[l].p1, this.errorLines[l].p2, fillStyle);
        }
    }(this);

    Line.prototype.drawEachLineText = function (lines, fillStyle) {
        if (lines === undefined) {
            throw new ReferenceError("Cannot draw line text, lines is undefined");
        }
        for (var l = 0; l < lines.length; l++) {
            drawPointText(lines[l].midpoint, fillStyle);
        }
    };
}

function ErrorLine(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;

    var x = (p1.x + p2.x) / 2;
    var y = (p1.y + p2.y) / 2;

    this.midpoint = new Point(x, y);
    this.magnitude = (p1.y < p2.y) ? round(p2.y - p1.y, 2) : round(p1.y - p2.y, 2);

    ErrorLine.prototype.endPoints = function() {
        return [this.p1, this.p2];
    };

    // ErrorLine.prototype.toString = function() {
    //     return this.magnitude;
    // }

}

// function initErrorLines(points, line) {
//
//     //y = mx + b
//
//     var m = line.slope;
//     var b = line.y_intercept_y_value;
//     var errorLines = [];
//
//     for (var p = 0; p < points.length; p++) {
//         var x = points[p].x;
//         var y = m * x + b;
//
//         var p1 = points[p];
//         var p2 = new Point(x, y);    //find a point on a line
//
//
//         var errorLine = new ErrorLine(p1, p2);
//         errorLine.midpoint.setString(errorLine.magnitude);
//         errorLine.midpoint.setTextOffset(CANVAS_TEXT_OFFSET_MAGNI, 0);
//         errorLines.push(errorLine);
//     }
//     Line.prototype.setErrorLines(errorLines);
// }



function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

init();
renderCanvas();
