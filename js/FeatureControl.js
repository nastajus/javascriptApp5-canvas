/**
 * Created by Ian Nastajus on 7/22/2017.
 */

const MATH_FUNCTIONS = {
    linear: function(x) {return x},
    squared: function(x) {return x ^ 2;},
    // logarithm: function(x) {return Math.log(x);},
    // fractionalPower: function(x,c) {
    //     if (c => 1 || c <= 0) {
    //         throw new RangeError("Invalid fractional power, must be 0<c<1");
    //     }
    //     return x ^ c;
    // },
    // factorial: function(x) {return Math.factorial(x);}
};



/**
 * MVC = Controller
 *
 * @returns {FeatureControl}
 */
function FeatureControl(id, fullFeature) {

    //external variable
    this.element = null;

    //external methods
    // Callback called when control changes
    this.OnControlChange = null;

    this.GetDimension = () => dimension;
    this.SetDimension = (_dimension) => {
        dimension = _dimension;
    };

    this.GetValue = () => value;
    this.SetValue = (newValue) => {
        let parsedValue = parseFloat(newValue);
        value = (isNaN(parsedValue) ? value : parsedValue);
        textbox.value = round(value, 2);
    };

    this.GetWeightSymbol = () => thetaSymbol.textContent;
    this.SetWeightSymbol = (_symbol) => {
        thetaSymbol.textContent = _symbol;
    };

    this.GetWeightSubscript = () => thetaSubscript.textContent;
    this.SetWeightSubscript = (_subscript) => {
        thetaSubscript.textContent = _subscript;
    };

    this.GetXSubscript = () => xSubscript.textContent;
    this.SetXSubscript = (_subscript) => {
        xSubscript.textContent = _subscript;
    };

    this.GetXSuperscript = () => xSuperscript.textContent;
    this.SetXSuperscript = (_superscript) => {
        xSuperscript.textContent = _superscript;
    };

    this.GetTitle = () => title.textContent;
    this.SetTitle = (_title) => {
        title.textContent = _title;
    };

    // this.GetEnabled = () => checkbox.checked;
    // this.SetEnabled = (_enabled) => {
    //     if (Graph.SetShownDimensions(dimension, _enabled)) {
    //         checkbox.checked = _enabled;
    //         //lighten control row colors
    //     }
    //     else {
    //         //darken control row colors
    //     }
    // };

    this.GetMathFunction = () => mathFunction;
    this.SetMathFunction = (_mathFunction) => {
        if (MATH_FUNCTIONS[_mathFunction]) {
            mathFunction = _mathFunction;
        }
    };

    //internal state

    let template = document.querySelector("#" + id).content;
    this.element = document.importNode(template, true);
    let value = 0;
    let dimension;
    let mathFunction;

    // let checkbox = this.element.querySelector(".control-checkbox");
    let thetaSymbol = this.element.querySelector(".control-symbol-theta").querySelector("span");
    let thetaSubscript = this.element.querySelector(".control-symbol-theta").querySelector("sub");
    //let xSymbol
    let xSubscript = this.element.querySelector(".control-symbol-x").querySelector("sub");
    let xSuperscript = this.element.querySelector(".control-symbol-x").querySelector("sup");
    let title = this.element.querySelector(".control-title");
    let buttonDecrementSmall = this.element.querySelector(".control-lt-small");
    let buttonDecrementMedium = this.element.querySelector(".control-lt-medium");
    let buttonDecrementLarge = this.element.querySelector(".control-lt-large");
    let buttonIncrementSmall = this.element.querySelector(".control-gt-small");
    let buttonIncrementMedium = this.element.querySelector(".control-gt-medium");
    let buttonIncrementLarge = this.element.querySelector(".control-gt-large");
    //let droplistFunction = this.element.querySelector(".math-functions");
    let textbox = this.element.querySelector(".control-textbox");

    //internal methods
    //for subscribers (utility function so we don'thave to check for null everytime)
    const invokeChanged = () => {
        if (this.OnControlChange)
            this.OnControlChange();
    };

    const modifyValueBy = (delta) => {
        this.SetValue(this.GetValue() + delta);
        invokeChanged();
    };

    //init logic
    buttonDecrementSmall.onclick = () => modifyValueBy(-.1);
    buttonDecrementMedium.onclick = () => modifyValueBy(-1);
    buttonDecrementLarge.onclick = () => modifyValueBy(-10);

    buttonIncrementSmall.onclick = () => modifyValueBy(.1);
    buttonIncrementMedium.onclick = () => modifyValueBy(1);
    buttonIncrementLarge.onclick = () => modifyValueBy(10);

    //droplistFunction.onclick = () => invokeChanged();

    // checkbox.onchange = () => {
    //      if (Graph.IsValidDimensionChange(dimension, checkbox.checked)) {
    //         this.SetEnabled(checkbox.checked);
    //         invokeChanged();
    //      }
    //      else {
    //          //prevent change checkbox... perhaps ugly to reverse logic? maybe disable native checking instead?
    //          checkbox.checked = false;
    //          console.log("Invalid to enable checkbox for dimension " + dimension + "."); // " for " + this.GetWeightSymbol() + "_" + this.GetWeightSubscript());
    //      }
    // };
    textbox.onchange = () => {
        this.SetValue(textbox.value);
        invokeChanged();
    };

    return this;
}