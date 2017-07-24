/*
 * Note the design limitation is:
 *      - drawing calls are dependant on initialization calls.
 *      - onMove redraws entire canvas.
 *
 */

let graphs = [];
let controls = [];

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

function initGraphs() {
    graphs.push(new Graph("canvas1", GRAPH_TYPES.REGRESSION, () => model.dataPoints));
    graphs.push(new Graph("canvas2", GRAPH_TYPES.CONTOUR, () => model.derivativePoints));
    Graph.InitShownDimensions();

    //graphs[0].canvas.onclick = onClickCanvas;
    graphs[0].canvas.onmouseup = onClickCanvas;  //try passing variable here of `graph`
    graphs[0].canvas.onmousemove = onMoveCanvas; //try passing variable here of `graph`
}

function renderCanvases() {
    for (let i = 0; i < graphs.length; i++) {
        graphs[i].RenderCanvas();
    }
    console.log("Total error: " + model.GetTotalError());
}

function buildAxes() {
    for (let i = 0; i < graphs.length; i++) {
        graphs[i].axisLines.push(new AxisLine("x"));
        graphs[i].axisLines.push(new AxisLine("y"));
    }
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
            graph.AddPoint(canvasX, canvasY);
            break;

        case 1:
            console.log("Middle button clicked, in graph: " + graph + ", unimplemented.");
            break;

        case 2:
            console.log("Right button clicked, in graph: " + graph + ", attempting To Remove point, at (canvasX: " + canvasX + ", canvasY: " + canvasY + ").");
            graph.RemovePoint(canvasX, canvasY);
            //Todo: fix
            break;

        default:
            console.log('Unexpected button code from click: ' + btnCode);
    }
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

    let closestDataPoints = findClosestDataPoints(graphPosition, CLICK_DISTANCE_ACCURACY_TO_POINT);

    addHighlightPoints(closestDataPoints, graph.highlightPoints);

    let diff = arrayDifference(model.dataPoints, closestDataPoints);

    //remove highlight
    removeArrayFromArrayOnce(diff, graph.highlightPoints);

    graph.RenderCanvas();
}

/**
 * Find nearest element (for now just data points) within a range of 1 cartesian unit, based on mouse hover position.
 * @param graph
 * @param {{cartesianX: Number, cartesianY: Number}} targetGraphPosition
 * @param {Number} accuracyDistance
 * @returns {Array.<*>} foundPoints
 */
function findClosestDataPoints(targetGraphPosition, accuracyDistance) {

    let foundPoints = model.dataPoints.filter(function (entry) {
        let foo = targetGraphPosition.cartesianX > entry.x + -accuracyDistance && targetGraphPosition.cartesianX < entry.x + accuracyDistance &&
            targetGraphPosition.cartesianY > entry.y + -accuracyDistance && targetGraphPosition.cartesianY < entry.y + accuracyDistance;
        return foo;
    });

    return foundPoints;
}

function addHighlightPoints(sourceArray, targetArray) {
    addArrayToArrayOnce(sourceArray, targetArray);
}

function injectTemplateControls() {

    let parentContainer = document.querySelector('.container-column');

    for (let i = 0; i < model.numDimensions; i++) {

        let control = new ControlRow();
        control.OnRowChange = () => {
            //update the thetas in the ComplexLine
            model.hypothesisLine.thetas[i] = control.GetValue();
            renderCanvases();
        };
        controls.push(control);
        control.SetValue(model.hypothesisLine.thetas[i]);
        control.SetDimension(i);
        control.SetSymbol("θ");
        control.SetSymbolSubscript(i);
        control.SetTitle("sample test data");
        parentContainer.appendChild(control.element);
    }

    controls[0].SetEnabled(false);
    controls[1].SetEnabled(true);
}

let model = new Model(2);
model.BuildSampleDataPoints();
model.BuildSampleHypothesisLines();

initGraphs();
buildAxes();
renderCanvases();
injectTemplateControls();



//tasks
/*
 - move axes to show negatives plz (at least some way to scale)
 - as you modify b0,b1 (with a button), plot a point a point on the second canvas
 where it's color represents the total error (lerp).
 (ties nicely into gradient descent as is).
 */

//tasks redux
/*
 - create DataPoints with an array of x's and separate my concerns with drawing and data points.
 - refactor existing sample points to accept arrays of data points, e.g. 1x2 arrays, where every x0=0, and x1=
 (before value).
 - bind the controls so they actually affect the line. (fix bitch)    in injectTemplateControls in the call to
 "newRow.OnRowChange", update the thetas in the ComplexLine, e.g. can make a property to access (from the model)
 (and rerender the canvas)
 */


//tasks ++
/*
 - fix world offset bug on vertical axis.
 - fix both offsets of printed descriptions, to A) to not collide coordinate text with large points, and B) not place
   magnitude text so close to the line that it's touching.

 - consider consolidation of model.currentlySelectedDimension vs. graphs[0].currentlySelectedDimension...
 - consider refactoring to more carefully chosen public (this.foo) & private (let bar) designs in my original function 'classes', like Graph.
*/