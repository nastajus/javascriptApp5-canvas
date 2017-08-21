/*
 * Note the design limitation is:
 *      - drawing calls are dependant on initialization calls.
 *      - onMove redraws entire canvas.
 *
 */

let graphs = {};
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
    graphs.regression = new Graph("canvas1", GRAPH_TYPES.REGRESSION, {x:40, y:200}, () => model.activeDataPoints);
    graphs.contour = new Graph("canvas2", GRAPH_TYPES.CONTOUR, null, () => model.derivativePoints);

    Graph.InitShownDimensions();

    //event bindings
    graphs.regression.canvas.addEventListener("mouseup", onClickCanvas, true);  //try passing variable here of `graph`
    graphs.regression.canvas.addEventListener("mousemove", onMoveCanvas, true); //try passing variable here of `graph`
    graphs.regression.canvas.addEventListener("wheel", onScrollCanvas, true);

    document.addEventListener("keypress", onKeyPressDocument, true);

    graphs.regression.Render = () => {
        graphs.regression.context.clearRect(0, 0, graphs.regression.canvas.width, graphs.regression.canvas.height);
        graphs.regression.drawReferencePoints("lightgray", false);
        graphs.regression.drawDataPoints(model.activeDataSet.dataPoints, 1, ["darkred", "forestgreen"], true);
        graphs.regression.drawAxisLine("x");
        graphs.regression.drawAxisLine("y");
        graphs.regression.drawAxisScale({x: CANVAS_SCALE, y: CANVAS_SCALE});
        graphs.regression.drawHighlightPoints(graphs.regression.highlightPoints);
        graphs.regression.drawComplexLine(model.hypothesisLine, 1, "black");
    };

    graphs.contour.Render = () => {
        graphs.contour.drawReferencePoints("lightgray", false);
    };

}

function renderCanvases() {

    graphs.regression.Render();
    graphs.contour.Render();

    let costNode = document.querySelector("#cost");
    costNode.textContent = round(model.Cost(), 0);

    console.log("Gradient Descent Step ([thetas]): " + JSON.stringify(model.hypothesisLine.EvaluateGradientDescentStep(model.hypothesisLine.thetas, model.activeDataSet.dataPoints)));
}

function onClickCanvas(e) {
    let element = graphs.regression.canvas; //for now just hard-code
    let graph = graphs.regression;
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
            graph.Render();
            addDataPointOption(dataPoint);
            break;

        case 1:
            console.log("Middle button clicked, in graph: " + graph + ", unimplemented.");
            break;

        case 2:
            console.log("Right button clicked, in graph: " + graph + ".");
            //console.log("Attempting To Remove point.");
            model.RemovePoint(dataCoordinates.x, Graph.dimensionXSelected, dataCoordinates.y, true);
            graph.Render();
            //removeDataPointOption();
            break;

        default:
            console.log('Unexpected button code from click: ' + btnCode);
    }
}

function onMoveCanvas(e) {
    let element = graphs.regression.canvas; //for now just hard-code
    let graph = graphs.regression;
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
    let graph = graphs.regression;

    let changeSign = 0;

    //determine change direction to apply
    if (e.deltaY > 0) {
        changeSign = 1;
    }
    else if (e.deltaY < 0) {
        changeSign = -1;
    }

    let value = graph.GetOriginShift();
    let changeDistance = graph.axesControl.GetTranslateLarge();

    //cause translation vertically
    if (e.shiftKey) {
        console.log("SHIFT BUTTON HELD");
        graph.SetOriginShift({
            x: value.x,
            y: value.y + changeSign * changeDistance
        });
    }

    //cause translation horizontally
    if (e.ctrlKey) {
        console.log("CONTROL BUTTON HELD");
        graph.SetOriginShift({
            x: value.x + changeSign * changeDistance,
            y: value.y
        });
    }

    graph.Render();

    if (e.shiftKey || e.ctrlKey) {
        return;
    }

    //cause zoom change
    graph.SetZoomFactor(round(graph.GetZoomFactor() + changeSign * ZOOM_INCREMENT, 1));
    console.log("zoom factor: " + graph.GetZoomFactor());
    graph.Render();
}

function onKeyPressDocument(e) {

    let key = e.key.toLowerCase();
    let graph = graphs.regression;
    let value = graph.GetOriginShift();
    let changeDistance = graph.axesControl.GetTranslateLarge();

    //left
    if (key === "a") {
        graph.SetOriginShift({
            x: value.x - changeDistance,
            y: value.y
        });
    }
    //right
    if (key === "d") {
        graph.SetOriginShift({
            x: value.x + changeDistance,
            y: value.y
        });
    }
    //up
    if (key === "w") {
        graph.SetOriginShift({
            x: value.x,
            y: value.y + changeDistance
        });
    }
    //down
    if (key === "s") {
        graph.SetOriginShift({
            x: value.x,
            y: value.y - changeDistance
        });
    }
    //in
    if (key === "q") {
        graph.SetZoomFactor(round(graph.GetZoomFactor() + ZOOM_INCREMENT, 1));
    }
    //out
    if (key === "e") {
        graph.SetZoomFactor(round(graph.GetZoomFactor() - ZOOM_INCREMENT, 1));
    }

    graph.Render();
}

function onChangeDroplist(e) {
    console.log(e + " working");
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

/**
 * Note that the "bias control" is a limited subset.
 *
 */
function addFeatureControl(fullFeature) {


    let parentContainer = document.querySelector('.container-column');
    let control = new FeatureControl("control-template-old", fullFeature);

    let droplist = {};
    if (fullFeature) {
        droplist = addMathFunctionOptionToTemplate(control.element);
    }

    let i = model.numDimensions;

    control.OnControlChange = () => {
        //update the thetas in the ComplexLine
        //model.hypothesisLine.thetas[i] = control.GetValue();
        model.thetas[i] = control.GetValue();
        console.log(droplist.value);
        control.SetMathFunction(droplist.value);
        //console.log(control.GetMathFunction());


        renderCanvases();
    };
    featureControls.push(control);
    control.SetValue(i);
    control.SetDimension(i);
    control.SetWeightSymbol("θ");
    control.SetWeightSubscript(i);
    control.SetXSubscript(i);
    control.SetMathFunction(MATH_FUNCTIONS.linear);
    parentContainer.appendChild(control.element);

    // featureControls[i].SetEnabled(true);
    featureControls[i].SetTitle(model.activeDataSet.featureLabels[i]);

    //initial thetas
    //model.hypothesisLine.thetas[i] = control.GetValue();
    model.thetas[i] = control.GetValue();

    model.numDimensions++;

}

function bindAxesControls() {
    let graph = graphs.regression;
    let axesControl = new AxesControlPair();

    graph.axesControl = axesControl;
    axesControl.graph = graph;

    axesControl.SetValue(graph.planeOriginToCanvasOriginShift);
    axesControl.OnControlChange = () => {
        graph.planeOriginToCanvasOriginShift = axesControl.GetValue();
        renderCanvases();
    };
    axesControl.SetTranslateSmall(CANVAS_SCALE/4);
    axesControl.SetTranslateLarge(CANVAS_SCALE);
    axesControl.SetZoomFactor(graph.GetZoomFactor());
}


function initDataPointOptions() {
    //initialize the data select list section to appear
    let templateContents = document.querySelector("#data-template").content;
    let template = document.importNode(templateContents, true);
    let parentContainer = document.querySelector('.container');
    parentContainer.appendChild(template);

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

/**
 *
 * @param targetElement
 */
function addMathFunctionOptionToTemplate(targetElement) {
    //let selectorNode = document.querySelector(".math-functions");
    let templateContent = document.querySelector("#control-template-new").content;
    let template = document.importNode(templateContent, true);
    let selectorNode = template.querySelector(".math-functions");

    Object.keys(MATH_FUNCTIONS).forEach(function(key,index) {
        // key: the name of the object key
        // index: the ordinal position of the key within the object

        let option = document.createElement("option");
        let textNode = document.createTextNode(key);
        option.appendChild(textNode);
        option.setAttribute("value", index.toString());
        selectorNode.appendChild(option);
    });

    let parentContainer = targetElement.querySelector(".control-row:last-child");
    parentContainer.appendChild(selectorNode);

    //selectorNode.AddEventListener("onchange", onChangeDroplist, true);
    return selectorNode;
    //return selectorNode.content;
}

let model = new Model();
model.BuildSampleDataPoints();
model.BuildSampleHypothesisLines();
model.BuildSampleContour();

initGraphs();
addFeatureControl(false);
addFeatureControl(true);
addFeatureControl(true);
bindAxesControls();
initDataPointOptions();
renderCanvases();


//tasks
/*
 - as you modify b0,b1 (with a button), plot a point a point on the second canvas
 where it's color represents the total error (lerp).
 (ties nicely into gradient descent as is).
 */

//tasks redux
/*
 - create DataPoints with an array of x's and separate my concerns with drawing and data points.
 - bind the controls so they actually affect the line. (fix bitch)    in addFeatureControl in the call to
 "newRow.OnControlChange", update the thetas in the ComplexLine, e.g. can make a property to access (from the model)
 (and rerender the canvas)
 */


//tasks ++
/*
 - consider consolidation of model.dimensionXSelected vs. Graph.dimensionXSelected...
 - consider refactoring to more carefully chosen public (this.foo) & private (let bar) designs in my original function 'classes', like Graph.
*/