/*
 * Note the design limitation is:
 *      - drawing calls are dependant on initialization calls.
 *      - onMove redraws entire canvas.
 *
 */

let graphs = [];
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


function getSliderValue(realValue, min, max) {
    //assumption:
    //min is negative... gracefully revert when not negative

    //min -10, max 50, realValue: 10.
    //how do? range = 60. desired result is 20

    //input is negative..
    //output is positive equivalent

    let range = Math.abs(min) + Math.abs(max);
    let sliderValue;

    if (min >= 0 && max < 0) {
        sliderValue = realValue;
    }
    else if (min < 0 && max > 0) {
        sliderValue = range - (range - (Math.abs(realValue) + Math.abs(min)));
        //e.g. 60 - (60 - (10 + 10)) = 20
    }
    else if (max < 0 && min > 0) {
        sliderValue = range - (range - (Math.abs(realValue) + Math.abs(max)));
    }
    else {
        throw new RangeError("Unexpected range error in getSliderValue().");
    }

    return sliderValue;
}

function getRealValue(sliderValue, min, max) {
    //sliderValue: 20, min: -10, max: 50
    //realValue: 10

    let range = Math.abs(min) + Math.abs(max);
    let realValue;

    // if (min >= 0 && max < 0) {
    //     realValue = sliderValue;
    // }
    //else if (min < 0 && max > 0) {
    realValue = -range + Math.abs(min) + parseFloat(sliderValue);
    //e.g. 60 - 10 + 20 = 10
    // }
    // else if (max < 0 && min > 0) {
    //     realValue = range - (range -(Math.abs(sliderValue) + Math.abs(max)));
    // }
    // else {
    //     throw new RangeError("Unexpected range error in getRealValue().");
    // }

    return realValue;

}

function getAdjustedStepValue(stepValue, sliderValue, min, max) {

    // stepValue = parseFloat(stepValue);
    sliderValue = round(parseFloat(sliderValue), 2);

    let adj;

    //tread lightly
    if (sliderValue < 5 && stepValue >= 0.01) {
        adj = round(stepValue - 0.01, 2);
        console.log("LOW) adj: " + adj + ", sliderValue: " + sliderValue);
    }
    else if (sliderValue < 50 && stepValue >= 0.1) {
        adj = round(stepValue - 0.1, 2);
        console.log("MED) adj: " + adj + ", sliderValue: " + sliderValue);
    }
    else {
        adj = 1;
        console.log("HIGH) adj: " + adj + ", sliderValue: " + sliderValue);
    }

    return adj;
}

let exampleobj = {

    data1: "val1",
    giveme: () => {
        console.log("sup dude");
        return "something";
    }
}




function ControlRow(template) {
    
    //external variable
    this.element =  document.importNode(template, true);

    //external methods
    // Callback called when control changes
    this.OnControlChange = null;

    this.GetValue = () => value;

    this.SetValue = (newValue) => {
        let parsedValue = parseFloat(newValue);
        value = (isNaN(parsedValue) ? value : parsedValue) ;
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
        if(this.OnControlChange)
            this.OnControlChange();
    };

    const incrementValue = (delta) =>
    {
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
    textbox.onchange = ()=> {
        this.SetValue(textbox.value);
        invokeChanged();
    };

    return this;
}


function Graph(canvasId, graphType, getDataPointsCallback) {

    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext("2d");
    this.graphType = graphType;
    this.cartesianAxes = [];
    this.cartesianAxesArrowHeads = [];
    this.cartesianGraphPoints = [];
    this.highlightPoints = [];
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.canvas.oncontextmenu = (e) => e.preventDefault();

    Object.defineProperty(this, 'dataPoints', {
        get: getDataPointsCallback
    });
    Object.defineProperty(this, 'hypothesisLine', {
        get: () => model.hypothesisLine,
        set: (newHypothesisLine) => model.hypothesisLine = newHypothesisLine
    });


    Graph.prototype.toString = function () {
        return this.graphType.toUpperCase().substring(0, 1) + this.graphType.toLowerCase().substring(1, this.graphType.length);
    };
}

function Model() {

    this.dataPoints = [];
    this.hypothesisLine = {};
    this.derivativePoints = [];

    buildSampleDataPoints(this);
    buildSampleHypothesisLines(this); //if applicable
    //buildErrorLinesBetween(this.dataPoints, this.hypothesisLine);

    this.CalculateShadowPoint = (p) => {
        const m = this.hypothesisLine.slope;
        const b = this.hypothesisLine.y_intercept_y_value;
        const x = p.x;
        const y = m * x + b;

        const p1 = p;
        const p2 = new Point(x, y);

        return p2;

        // const errorLine = new ErrorLine(p1, p2, p);
        // errorLine.midpoint.setString(errorLine.magnitude);
        // errorLine.midpoint.setTextOffset(CANVAS_TEXT_OFFSET_MAGNI, 0);
    }

    /**
     * Display scalar amount of error.
     * @param {ComplexLine} hypothesisLine
     * @returns {Number} {number}
     */
    this.GetTotalError = () => {

        let totalError = 0;

        for(let point of this.dataPoints){
            let shadow = this.CalculateShadowPoint(point);
            let magnitude = Math.abs(shadow.y-point.y);
            totalError += magnitude;
        }
        return totalError;
    }

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

    //poorly designed counter for rapid disambiguation for debugging
    // Point.counter = (Point.counter === undefined) ? 0 : ++Point.counter;
    // this.count = Point.counter;
}

Point.prototype.toString = function () {
    const result = (this.customString === undefined) ? printPoint(this) : this.customString;
    return /*"[" + this.count + "] " + */ result;
};
//
// Point.prototype.setString = function (customString) {
//     this.customString = customString;
// };

Point.prototype.setTextOffset = function (textOffsetX, textOffsetY) {
    this.textOffsetX = textOffsetX;
    this.textOffsetY = textOffsetY;
};

function initGraphs() {
    //let controls = injectTemplateControls();
    graphs.push(new Graph("canvas1", GRAPH_TYPES.REGRESSION, () => model.dataPoints));
    graphs.push(new Graph("canvas2", GRAPH_TYPES.CONTOUR, () => model.derivativePoints));

    //graphs[0].canvas.onclick = onClickCanvas;
    graphs[0].canvas.onmouseup = onClickCanvas;  //try passing variable here of `graph`
    graphs[0].canvas.onmousemove = onMoveCanvas; //try passing variable here of `graph`
    
    

}

function buildCanvasContents() {
    for (let i = 0; i < graphs.length; i++) {
        buildCanvasContent(graphs[i]);
    }
}

function buildCanvasContent(graph) {

    buildCartesianGraphPoints(graph);
    buildAxes(graph);

    if (graph.graphType === GRAPH_TYPES.REGRESSION) {
        //appendSlider(graph);
    }
    else if (graph.graphType === GRAPH_TYPES.CONTOUR) {
        //buildContourRing(graph);
    }
    else {
        throw new TypeError("Cannot build graph: " + graph + ", unknown GRAPH_TYPE: " + graph.graphType + ".");
    }

}

function buildSampleDataPoints(model) {
    model.dataPoints.push(new Point(1, 1));
    model.dataPoints.push(new Point(3, 4));
    model.dataPoints.push(new Point(2, 5));
    model.dataPoints.push(new Point(3, 6));
    model.dataPoints.push(new Point(5, 5));
    model.dataPoints.push(new Point(5, 9));
    model.dataPoints.push(new Point(6, 4));
    model.dataPoints.push(new Point(7, 7));
    model.dataPoints.push(new Point(7, 8));
    model.dataPoints.push(new Point(8, 7));
    model.dataPoints.push(new Point(9, 9));
    model.dataPoints.push(new Point(12, 8));
    model.dataPoints.push(new Point(13, 9));
    model.dataPoints.push(new Point(14, 7));
    //model.dataPoints.push(new Point(18, 8));
}

function buildSampleHypothesisLines(model) {
    model.hypothesisLine = new ComplexLine(0, 1);
    model.hypothesisLine.name = "the hypothesis line";
}

function buildContourRing(graph) {

}

function renderCanvases() {
    for (let i = 0; i < graphs.length; i++) {
        renderCanvas(graphs[i]);
    }
}

function renderCanvas(graph) {

    //doesn't work
    graph.context.clearRect(0, 0, graph.canvas.width, graph.canvas.height);

    //works.
    graph.canvas.width = graph.canvas.width;


    for(let p of graph.cartesianGraphPoints){
        drawPoint(graph,p,"lightgray")
    }

    drawDataPoints(graph, graph.dataPoints, "darkred", true);

    drawLine(graph, graph.cartesianAxes[0].p1, graph.cartesianAxes[0].p2, "black", 5);
    drawLine(graph, graph.cartesianAxes[1].p1, graph.cartesianAxes[1].p2, "black", 5);

    //drawArrowHeads(graph, graph.cartesianAxesArrowHeads, "black", 5);
    //drawPoints(graph, graph.errorLines.endPoints(), "forestgreen");

    drawHighlightPoints(graph, graph.highlightPoints);
    //removeHighlightPoints();

    if (graph.graphType === GRAPH_TYPES.REGRESSION) {
        drawComplexLine(graph, graph.hypothesisLine, 1, "black");

        //drawEachLine(graph, graph.hypothesisLine.errorLines, "forestgreen");
        //drawEachLineText(graph, graph.hypothesisLine.errorLines, "forestgreen");
    }

}

function drawComplexLine(graph, complexLine, sampleRate, fillStyle) {

    for (let x = 0; x < CANVAS_WIDTH / CANVAS_SCALE; x += sampleRate) {
        let nextX = (x + sampleRate);
        let p1 = new Point(x, complexLine.Evaluate(x));
        let p2 = new Point(nextX, complexLine.Evaluate(nextX));
        drawLine(graph, p1, p2, fillStyle);
    }
}

// function drawEachLine(graph, lines, fillStyle, lineWidth) {
//     if (lines === undefined) {
//         throw new ReferenceError("Cannot draw lines, lines is undefined");
//     }
//     for (let l = 0; l < lines.length; l++) {
//         drawLine(graph, lines[l].p1, lines[l].p2, fillStyle, lineWidth);
//     }
// }

// function drawEachLineText(graph, lines, fillStyle) {
//     if (lines === undefined) {
//         throw new ReferenceError("Cannot draw line text, lines is undefined");
//     }
//     for (let l = 0; l < lines.length; l++) {
//         drawPointText(graph, lines[l].midpoint, fillStyle);
//     }
// }

function drawLine(graph, pointBegin, pointEnd, strokeStyle, lineWidth) {
    const originalStrokeStyle = graph.context.strokeStyle;
    const originalLineWidth = graph.context.lineWidth;
    graph.context.beginPath();
    graph.context.moveTo(pointBegin.canvasX, pointBegin.canvasY);
    graph.context.lineTo(pointEnd.canvasX, pointEnd.canvasY);

    if (strokeStyle !== undefined) {
        graph.context.strokeStyle = strokeStyle;
    }

    if (lineWidth !== undefined) {
        graph.context.lineWidth = lineWidth;
    }

    graph.context.stroke();
    graph.context.strokeStyle = originalStrokeStyle;
    graph.context.lineWidth = originalLineWidth;
}

function drawDataPoints(graph, points, fillStyle, drawText) {
    for (let p = 0; p < points.length; p++) {


        let p1 = points[p];
        let p2 = model.CalculateShadowPoint(points[p]);

        drawPoint(graph, p1, fillStyle);

        // draw error line
        drawLine(graph, p1, p2, fillStyle);

        // draw error text.... or somethign
        let diff = p2.y - p1.y;
        let magnitude = Math.abs(diff);
        let midpoint = new Point(p1.x, p1.y + diff/2);

        if (drawText) {

            drawPointText(graph, midpoint, magnitude, fillStyle);
            drawPointText(graph, p1, p1.toString(), fillStyle);
        }
    }
}

function drawPoint(graph, point, fillStyle, pointRadius) {
    const originalFillStyle = graph.context.fillStyle;
    graph.context.beginPath();
    graph.context.arc(point.canvasX, point.canvasY, (pointRadius) ? pointRadius : POINT_RADIUS, 0, Math.PI * 2, true);
    graph.context.closePath();
    graph.context.fillStyle = fillStyle;
    graph.context.fill();
    graph.context.fillStyle = originalFillStyle;
}

function drawPointText(graph, point, text, fillStyle) {
    const originalFillStyle = graph.context.fillStyle;
    graph.context.fillStyle = fillStyle;
    graph.context.fillText(text, point.canvasX + point.textOffsetX, point.canvasY + point.textOffsetY);
    graph.context.fillStyle = originalFillStyle;
}

function drawHighlightPoints(graph, highlightPoints) {
    for (let i = 0; i < highlightPoints.length; i++) {
        drawHighlight(graph, highlightPoints[i]);
    }
}

function drawHighlight(graph, highlightPoint) {
    drawFatterPoint(graph, highlightPoint);
}

function drawFatterPoint(graph, point) {
    drawPoint(graph, point, "darkyellow", 10);
}

/**
 * Create cartesian graph visualization aid, by making a grid of Points, spaced apart consistently.
 * @param graph
 * @param {[Point]} graphPoints
 */

function buildCartesianGraphPoints(graph) {

    let graphPoints = graph.cartesianGraphPoints;
    //this is not easy to read easily. refactor to be most readable possible:
    for (let x = 0; x <= CANVAS_WIDTH; x += CANVAS_SCALE) {
        for (let y = 0; y <= CANVAS_HEIGHT; y += CANVAS_SCALE) {
            graphPoints.push(new Point(x / CANVAS_SCALE, y / CANVAS_SCALE));
        }
    }
}

function buildAxes(graph) {
    let graphLines = graph.cartesianAxes;
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
function ComplexLine(b0, b1) {

    //y=mx + b
    //y_hat = b0 + b1 * x;
    //y_hat = y_intercept + slope * (x);
    // y = 3 + 1/2 * x;

    this.y_intercept_y_value = b0;
    this.slope = b1;
    this.name = "";


    this.Evaluate = (x) =>  {
        return this.slope * x + this.y_intercept_y_value;
    }
}

ComplexLine.prototype.endPoints = function () {
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
 * @param dataPoint
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

ErrorLine.prototype.toString = function () {
    return "data point: " + printPoint(this.dataPoint) + " with size: " + this.magnitude;
};

ErrorLine.prototype.endPoints = function () {
    return [this.p1, this.p2];
};

/**
 * Create error lines, going vertically from p1 (sample data point) and p2 (intersecting point on hypothesis line)
 *
 * @param {[Point]} additionalSamplePoints
 * @param {ComplexLine} hypothesisLine
 */
// function buildErrorLinesBetween(additionalSamplePoints, hypothesisLine) {
//
//     //find a point on a line
//     //y = mx + b
//
//
//     for (let p = 0; p < additionalSamplePoints.length; p++) {
//         calculateShadowPoint();
//         hypothesisLine.errorLines.push(errorLine);
//     }
//     getTotalError(hypothesisLine);
// }



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
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
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

    //tasks
    /*
     - 2 html sliders(b0, b1) to control the (line).
     - move axes to show negatives plz (at least some way to scale)
     - as you modify b0,b1 (with a button), plot a point a point on the second canvas
     where it's color represents the total error (lerp).
     (ties nicely into gradient descent as is).
     */
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

function onChangeSlider(e) {

    let match = {
        realMin: e.srcElement.realMin,
        realMax: e.srcElement.realMax,
        textboxElement: e.srcElement.element,
        sliderElement: e.srcElement.element
    };

    let realValue = getRealValue(this.value, match.realMin, match.realMax);

    //console.log("Slider value (positive only): " + this.value + " , Mathematical value (- to +): " + realValue);

    match.textboxElement.value = realValue;

    match.sliderElement.step = getAdjustedStepValue(match.sliderElement.step, realValue, match.realMin, match.realMax);

    updateLine( null, realValue);

}

function onChangeTextbox(e) {
    console.log(this.value);
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
 * @param graph
 * @param canvasX
 * @param canvasY
 */
function addPoint(graph, canvasX, canvasY) {
    let graphPosition = convertCanvasToGraph(canvasX, canvasY, GRAPH_DECIMALS_ACCURACY);
    let clickPoint = new Point(graphPosition.cartesianX, graphPosition.cartesianY);

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

        //remove related error line before removing the data point
        removeErrorLine(graph, graph.dataPoints[firstMatchPointIndex]);

        let removedPoints = graph.dataPoints.splice(firstMatchPointIndex, 1);
        let removedPoint = removedPoints[0];

        console.log("In graph: " + graph + ", Removed point at : " + printPoint(removedPoint));
        //console.log("In graph: " + graph + ", Removed point at : " + printPoint(firstMatchPointIndex));
        //console.log("In graph: " + graph + ", Removed point at : " + printPoint(removedErrorLine.dataPoint));
        //console.log("In graph: " + graph + ", Removed point, at (cartesianX: " + graphPosition.cartesianX + ", cartesianY: " + graphPosition.cartesianY + ").");
    }
    renderCanvas(graph);
}

function removeErrorLine(graph, matchingDataPoint) {

    for (let i = 0; i < graph.hypothesisLine.errorLines.length; i++) {
        if (matchingDataPoint === graph.hypothesisLine.errorLines[i].dataPoint) {
            let removedErrorLine = graph.hypothesisLine.errorLines.splice(i, 1);
            console.log("In graph: " + graph + ", Removed error line at: " + removedErrorLine);
            return removedErrorLine;
        }
    }
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
let controlRows = [];
function injectTemplateControls() {

    let controlTemplateElementContent = document.querySelector("#control-template");
    controlTemplateElementContent = controlTemplateElementContent.content;

    let newRow = new ControlRow(controlTemplateElementContent);
    newRow.OnControlChange = () => console.log("Sup dawg");
    controlRows.push(newRow);


    let targetContainer = document.querySelector('#controls');
    targetContainer.appendChild(controlRows[0].element);


}

// function updateControls() {
//
// }

function updateLine(b0, b1) {
    let hyp = graphs[0].hypothesisLine;
    graphs[0].hypothesisLine = new ComplexLine(hyp.y_intercept_y_value, b1);
    renderCanvases()
}

let model = new Model();

initGraphs();
buildCanvasContents();
renderCanvases();
// updateControls();
injectTemplateControls();

console.log(model.GetTotalError());

// setTimeout(() => {
//     const point = new Point(10, 10);
//     dataPoints.push(point);
//     buildCanvasContent();
//     renderCanvas();
// }, 3000);


//window.onload = renderCanvas;

