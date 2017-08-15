/*
 * Note the design limitation is:
 *      - drawing calls are dependant on initialization calls.
 *      - onMove redraws entire canvas.
 *
 */

let graphs = [];
let featureControls = [];
//let axesControls = [];

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
    graphs.push(new Graph("canvas1", GRAPH_TYPES.REGRESSION, () => model.activeDataPoints));
    graphs.push(new Graph("canvas2", GRAPH_TYPES.CONTOUR, () => model.derivativePoints));
    Graph.InitShownDimensions();

    //graphs[0].canvas.onclick = onClickCanvas;
    graphs[0].canvas.onmouseup = onClickCanvas;  //try passing variable here of `graph`
    graphs[0].canvas.onmousemove = onMoveCanvas; //try passing variable here of `graph`
    graphs[0].canvas.addEventListener("wheel", onScrollCanvas, true);

}

function renderCanvases() {
    for (let i = 0; i < graphs.length; i++) {
        graphs[i].RenderCanvas();
    }
    let costNode = document.querySelector("#cost");
    costNode.textContent = round(model.Cost(), 0);

    console.log("Gradient Descent Step ([thetas]): " + JSON.stringify(model.hypothesisLine.EvaluateGradientDescentStep(model.hypothesisLine.thetas, model.activeDataSet.dataPoints)));
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

    //console.log("canvasCoordinates: " + JSON.stringify(canvasCoordinates));

    canvasCoordinates = {x: canvasCoordinates.x / graph.GetZoomFactor(), y: canvasCoordinates.y / graph.GetZoomFactor()};

    let planeCoordinates = graph.GetCanvasToPlane(canvasCoordinates, true);

    let dataCoordinates = graph.GetPlaneToData(planeCoordinates, DATA_DECIMALS_ACCURACY, true);

    let btnCode = e.button;

    switch (btnCode) {
        case 0:
            console.log("Left button clicked, in graph: " + graph + ".");
            //console.log("Attempting To Add point.");
            let dataPoint = model.AddPoint(dataCoordinates.x, Graph.dimensionXSelected, dataCoordinates.y, true);
            graph.RenderCanvas();
            addDataPointOption(dataPoint);
            break;

        case 1:
            console.log("Middle button clicked, in graph: " + graph + ", unimplemented.");
            break;

        case 2:
            console.log("Right button clicked, in graph: " + graph + ".");
            //console.log("Attempting To Remove point.");
            model.RemovePoint(dataCoordinates.x, Graph.dimensionXSelected, dataCoordinates.y, true);
            graph.RenderCanvas();
            //removeDataPointOption();
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

    let planeCoordinates = graph.GetCanvasToPlane(canvasCoordinates, false);

    let dataPosition = graph.GetPlaneToData(planeCoordinates, DATA_DECIMALS_ACCURACY, false);

    let closestDataPoints = model.findClosestDataPoints(dataPosition, Graph.dimensionXSelected, CLICK_DISTANCE_ACCURACY_TO_POINT);

    addHighlightPoints(closestDataPoints, graph.highlightPoints);

    let diff = arrayDifference(model.activeDataSet.dataPoints, closestDataPoints);

    //remove highlight
    removeArrayFromArrayOnce(diff, graph.highlightPoints);

    //graph.RenderCanvas();
}

function onScrollCanvas(e) {
    e.preventDefault();
    let graph = graphs[0];

    let changeSign = 0;

    //determine change direction to apply
    if (e.deltaY > 0) {
        changeSign = 1;
    }
    else if (e.deltaY < 0) {
        changeSign = -1;
    }

    let value = graph.axesControl.GetValue();
    let change = graph.axesControl.GetChangeLarge();

    //cause translation vertically
    if (e.shiftKey) {
        console.log("SHIFT BUTTON HELD");
        graph.axesControl.SetValue({
            x: value.x,
            y: value.y + changeSign * change
        });
    }

    //cause translation horizontally
    if (e.ctrlKey) {
        console.log("CONTROL BUTTON HELD");
        graph.axesControl.SetValue({
            x: value.x + changeSign * change,
            y: value.y
        });
    }

    if (e.shiftKey || e.ctrlKey) {
        return;
    }

    //cause zoom change
    //graph.zoomFactor = round(graph.zoomFactor + changeSign * ZOOM_INCREMENT, 1);
    graph.SetZoomFactor(round(graph.GetZoomFactor() + changeSign * ZOOM_INCREMENT, 1));
    console.log("zoom factor: " + graph.GetZoomFactor());
    graph.RenderCanvas();
}

function onClickList(e) {
    //console.log(document.getElementById("data-points").options);
    //console.log(this.options);

    let selectedIndices = getSelectedOptionsIndices(this);
    model.SetActiveDataPointIndices(selectedIndices);
    renderCanvases();

}

function addHighlightPoints(sourceArray, targetArray) {
    addArrayToArrayOnce(sourceArray, targetArray);
}

function initFeatureControls() {

    addMathFunctionOptionToTemplate();

    let parentContainer = document.querySelector('.container-column');

    for (let i = 0; i < model.numDimensions; i++) {

        let control = new FeatureControl("control-template");

        control.OnControlChange = () => {
            //update the thetas in the ComplexLine
            model.hypothesisLine.thetas[i] = control.GetValue();
            renderCanvases();
        };
        featureControls.push(control);
        control.SetValue(i);
        control.SetDimension(i);
        control.SetSymbol("θ");
        control.SetSymbolSubscript(i);
        parentContainer.appendChild(control.element);

        featureControls[i].SetEnabled(true);
        featureControls[i].SetTitle(model.activeDataSet.featureLabels[i]);

        //initial thetas
        model.hypothesisLine.thetas[i] = control.GetValue();
    }
}

function bindAxesControls() {
    let graph = graphs[0];
    let axesControl = new AxesControlPair();
    //axesControls.push(axesControl);
    graph.axesControl = axesControl;
    axesControl.SetValue(graph.planeOriginToCanvasOriginShift);
    axesControl.OnControlChange = () => {
        graph.planeOriginToCanvasOriginShift = axesControl.GetValue();
        renderCanvases();
    };
    axesControl.SetChangeSmall(CANVAS_SCALE/4);
    axesControl.SetChangeLarge(CANVAS_SCALE);
}

function initDataPointOptions() {
    //initialize the data select list section to appear
    let template = document.querySelector("#data-template").content;
    let node = document.importNode(template, true);
    let parentContainer = document.querySelector('.container');
    parentContainer.appendChild(node);

    //populate the data point list
    let selectorNode = document.querySelector("#data-points");

    for (let dataPoint of model.activeDataSet.dataPoints) {
        let element = document.createElement("option");
        let textNode = document.createTextNode(dataPoint.PrintFull());
        element.appendChild(textNode);
        element.setAttribute("value", dataPoint.xs[Graph.dimensionXSelected] + "," + dataPoint.y);
        element.setAttribute("selected", "selected");
        selectorNode.appendChild(element);
    }

    //todo: consider moving this somewhere better
    //document.getElementById("data-points").addEventListener("click", onClickList, true);
}

function addDataPointOption(dataPoint) {
    let selectorNode = document.querySelector("#data-points");
    let element = document.createElement("option");
    let textNode = document.createTextNode(dataPoint.PrintFull());
    element.appendChild(textNode);
    element.setAttribute("value", dataPoint.xs[Graph.dimensionXSelected] + "," + dataPoint.y);
    element.setAttribute("selected", "selected");
    selectorNode.appendChild(element);
}

function removeDataPointOption(dataPoint) {
    //...
}

function addMathFunctionOptionToTemplate() {
    //let selectorNode = document.querySelector(".math-functions");
    let template = document.querySelector("#feature-template").content;
    let node = document.importNode(template, true);
    let selectorNode = node.querySelector(".math-functions");


    //const initMathFunctionList = () => {
        // for (let property in MATH_FUNCTIONS) {
        //     if (object.hasOwnProperty(property)) {
        //         // do stuff
        //     }
        // }

        Object.keys(MATH_FUNCTIONS).forEach(function(key,index) {
            // key: the name of the object key
            // index: the ordinal position of the key within the object

            let element = document.createElement("option");
            let textNode = document.createTextNode(index + ": " + key);
            element.appendChild(textNode);
            element.setAttribute("value", index.toString());
            selectorNode.appendChild(element);
        });

    //};
    
    let parentContainer = document.querySelector(".container-column");
    parentContainer.appendChild(selectorNode);
}

/**
 * Intended to replace existing paradigm used in: function initFeatureControls.
 * Will likely cause that one to be deprecated.
 *
 * Create a new row in the page.
 *
 */
function addFeature(title) {
    let parentContainer = document.querySelector('.container-column');

    let numThetas = model.hypothesisLine.thetas.length;

    let control = new FeatureControl2("feature-template");

    control.OnControlChange = () => {
        //update the thetas in the ComplexLine
        model.hypothesisLine.thetas[numThetas] = control.GetValue();
        renderCanvases();
    };

    //featureControls.push(control);
    //control.SetValue(i);
    control.SetDimension(numThetas);

            //control.SetSymbol("θ");
            //control.SetSymbolSubscript(numThetas);

    //featureControls[numThetas].;
            //control.SetEnabled(true);
    //featureControls[numThetas].;
            //control.SetTitle(title);

    control.SetMathFunction(MATH_FUNCTIONS.squared);

    parentContainer.appendChild(control.element);

    //initial thetas
    ///////model.hypothesisLine.thetas[i] = control.GetValue();

}

let model = new Model(2);
model.BuildSampleDataPoints();
model.BuildSampleHypothesisLines();
model.BuildSampleContour();

initGraphs();
initFeatureControls();
bindAxesControls();
initDataPointOptions();
renderCanvases();

addFeature("pickles");

//tasks
/*
 - as you modify b0,b1 (with a button), plot a point a point on the second canvas
 where it's color represents the total error (lerp).
 (ties nicely into gradient descent as is).
 */

//tasks redux
/*
 - create DataPoints with an array of x's and separate my concerns with drawing and data points.
 - bind the controls so they actually affect the line. (fix bitch)    in initFeatureControls in the call to
 "newRow.OnControlChange", update the thetas in the ComplexLine, e.g. can make a property to access (from the model)
 (and rerender the canvas)
 */


//tasks ++
/*
 - consider consolidation of model.dimensionXSelected vs. Graph.dimensionXSelected...
 - consider refactoring to more carefully chosen public (this.foo) & private (let bar) designs in my original function 'classes', like Graph.
*/