/*
 * Note the design limitation is:
 *      - drawing calls are dependant on initialization calls.
 *      - onMove redraws entire canvas.
 *
 */

let graphs = [];
let featureControls = [];
let axesControls = [];

const GRAPH_TYPES = {
    REGRESSION: "REGRESSION",
    CONTOUR: "CONTOUR"
};

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;
const POINT_RADIUS = 5;
const TICK_SIZE = 10;
const CANVAS_TEXT_OFFSET_COORD = 10;
const CANVAS_TEXT_OFFSET_MAGNI = 5;
const DATA_DECIMALS_ACCURACY = 1;
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

    let canvasCoordinates = {
        x: e.pageX - offsetX,
        y: e.pageY - offsetY
    };

    console.log("canvasCoordinates: " + JSON.stringify(canvasCoordinates));

    let planeCoordinates = Graph.GetCanvasToPlane(canvasCoordinates, false);

    let dataCoordinates = Model.GetPlaneToData(planeCoordinates, DATA_DECIMALS_ACCURACY, false);

    let btnCode = e.button;

    switch (btnCode) {
        case 0:
            console.log("Left button clicked, in graph: " + graph + ", attempting To Add point, at (plane x: " + dataCoordinates.x + ", plane y: " + dataCoordinates.y + ").");
            model.AddPoint(dataCoordinates.x, graph.dimensionXSelected, dataCoordinates.y);
            graph.RenderCanvas();
            break;

        case 1:
            console.log("Middle button clicked, in graph: " + graph + ", unimplemented.");
            break;

        case 2:
            console.log("Right button clicked, in graph: " + graph + ", attempting To Remove point, at (plane x: " + dataCoordinates.x + ", plane y: " + dataCoordinates.y + ").");
            model.RemovePoint(dataCoordinates.x, graph.dimensionXSelected, dataCoordinates.y);
            graph.RenderCanvas();
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

    let canvasCoordinates = {
        x: e.pageX - offsetX,
        y: e.pageY - offsetY
    };

    let planeCoordinate = Graph.GetCanvasToPlane(canvasCoordinates, false);

    let dataPosition = Model.GetPlaneToData(planeCoordinate, DATA_DECIMALS_ACCURACY, false);

    let closestDataPoints = model.findClosestDataPoints(dataPosition, graph.dimensionXSelected, CLICK_DISTANCE_ACCURACY_TO_POINT);

    addHighlightPoints(closestDataPoints, graph.highlightPoints);

    let diff = arrayDifference(model.dataPoints, closestDataPoints);

    //remove highlight
    removeArrayFromArrayOnce(diff, graph.highlightPoints);

    graph.RenderCanvas();
}

function addHighlightPoints(sourceArray, targetArray) {
    addArrayToArrayOnce(sourceArray, targetArray);
}

function addFeatureControls() {

    let parentContainer = document.querySelector('.container-column');

    for (let i = 0; i < model.numDimensions; i++) {

        let control = new FeatureControl();
        control.OnControlChange = () => {
            //update the thetas in the ComplexLine
            model.hypothesisLine.thetas[i] = control.GetValue();
            renderCanvases();
        };
        featureControls.push(control);
        control.SetValue(model.hypothesisLine.thetas[i]);
        control.SetDimension(i);
        control.SetSymbol("θ");
        control.SetSymbolSubscript(i);
        parentContainer.appendChild(control.element);
    }

    featureControls[0].SetEnabled(false);
    featureControls[1].SetEnabled(true);
    featureControls[0].SetTitle("hidden base cartesian value");
    featureControls[1].SetTitle("cartesian values to ~" + round(CANVAS_WIDTH / CANVAS_SCALE, 0));
}

function bindAxesControls() {
    let axesControl = new AxesControlPair(graphs[0]);
    axesControls.push(axesControl);
    axesControl.SetValue(graphs[0].canvasOriginShift);
    axesControl.OnControlChange = () => {
        graphs[0].canvasOriginShift = axesControl.GetValue();
        renderCanvases();
    };
    axesControl.SetChangeSmall(CANVAS_SCALE/4);
    axesControl.SetChangeLarge(CANVAS_SCALE);
}

let model = new Model(2);
model.BuildSampleDataPoints();
model.BuildSampleHypothesisLines();

initGraphs();
buildAxes();
renderCanvases();
addFeatureControls();
bindAxesControls();


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
 - bind the controls so they actually affect the line. (fix bitch)    in addFeatureControls in the call to
 "newRow.OnControlChange", update the thetas in the ComplexLine, e.g. can make a property to access (from the model)
 (and rerender the canvas)
 */


//tasks ++
/*
 - consider consolidation of model.dimensionXSelected vs. graphs[0].dimensionXSelected...
 - consider refactoring to more carefully chosen public (this.foo) & private (let bar) designs in my original function 'classes', like Graph.
*/