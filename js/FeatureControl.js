/**
 * Created by Ian Nastajus on 7/22/2017.
 */

const MATH_FUNCTIONS = {
    linear: function(x) {return x},
    squared: function(x) {return x ^ 2;},
    logarithm: function(x) {return Math.log(x);},
    fractionalPower: function(x,c) {
        if (c => 1 || c <= 0) {
            throw new RangeError("Invalid fractional power, must be 0<c<1");
        }
        return x ^ c;
    },
    factorial: function(x) {return Math.factorial(x);}
};



/**
 * MVC = Controller
 *
 * @returns {FeatureControl}
 */
function FeatureControl(which) {

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

    this.GetSymbol = () => symbol.textContent;
    this.SetSymbol = (_symbol) => {
        symbol.textContent = _symbol;
    };

    this.GetSymbolSubscript = () => subscript.textContent;
    this.SetSymbolSubscript = (_subscript) => {
        subscript.textContent = _subscript;
    };

    this.GetTitle = () => title.textContent;
    this.SetTitle = (_title) => {
        title.textContent = _title;
    };

    this.GetEnabled = () => checkbox.checked;
    this.SetEnabled = (_enabled) => {
        if (Graph.SetShownDimensions(dimension, _enabled)) {
            checkbox.checked = _enabled;
            //lighten control row colors
        }
        else {
            //darken control row colors
        }
    };

    this.GetMathFunction = () => {mathFunction;};
    this.SetMathFunction = (_mathFunction) => {
        mathFunction = _mathFunction;
    };

    //internal state

    let template = document.querySelector("#" + which).content;
    this.element = document.importNode(template, true);
    let value = 0;
    let dimension;
    let mathFunction;

    let checkbox = this.element.querySelector(".control-checkbox");
    let symbol = this.element.querySelector(".control-symbol").querySelector("span");
    let subscript = this.element.querySelector(".control-symbol").querySelector("sub");
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

    checkbox.onchange = () => {
         if (Graph.IsValidDimensionChange(dimension, checkbox.checked)) {
            this.SetEnabled(checkbox.checked);
            invokeChanged();
         }
         else {
             //prevent change checkbox... perhaps ugly to reverse logic? maybe disable native checking instead?
             checkbox.checked = false;
             console.log("Invalid to enable checkbox for dimension " + dimension + "."); // " for " + this.GetSymbol() + "_" + this.GetSymbolSubscript());
         }
    };
    textbox.onchange = () => {
        this.SetValue(textbox.value);
        invokeChanged();
    };

    return this;
}



function FeatureControl2(which) {

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

    // this.GetSymbol = () => symbol.textContent;
    // this.SetSymbol = (_symbol) => {
    //     symbol.textContent = _symbol;
    // };
    //
    // this.GetSymbolSubscript = () => subscript.textContent;
    // this.SetSymbolSubscript = (_subscript) => {
    //     subscript.textContent = _subscript;
    // };
    //
    // this.GetTitle = () => title.textContent;
    // this.SetTitle = (_title) => {
    //     title.textContent = _title;
    // };
    //
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

    this.GetMathFunction = () => {mathFunction;};
    this.SetMathFunction = (_mathFunction) => {
        mathFunction = _mathFunction;
    };

    //internal state

    let template = document.querySelector("#" + which).content;
    this.element = document.importNode(template, true);
    let value = 0;
    let dimension;
    let mathFunction;

    // let checkbox = this.element.querySelector(".control-checkbox");
    // let symbol = this.element.querySelector(".control-symbol").querySelector("span");
    // let subscript = this.element.querySelector(".control-symbol").querySelector("sub");
    // let title = this.element.querySelector(".control-title");
    // let buttonDecrementSmall = this.element.querySelector(".control-lt-small");
    // let buttonDecrementMedium = this.element.querySelector(".control-lt-medium");
    // let buttonDecrementLarge = this.element.querySelector(".control-lt-large");
    // let buttonIncrementSmall = this.element.querySelector(".control-gt-small");
    // let buttonIncrementMedium = this.element.querySelector(".control-gt-medium");
    // let buttonIncrementLarge = this.element.querySelector(".control-gt-large");
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
    // buttonDecrementSmall.onclick = () => modifyValueBy(-.1);
    // buttonDecrementMedium.onclick = () => modifyValueBy(-1);
    // buttonDecrementLarge.onclick = () => modifyValueBy(-10);
    //
    // buttonIncrementSmall.onclick = () => modifyValueBy(.1);
    // buttonIncrementMedium.onclick = () => modifyValueBy(1);
    // buttonIncrementLarge.onclick = () => modifyValueBy(10);

    // checkbox.onchange = () => {
    //     if (Graph.IsValidDimensionChange(dimension, checkbox.checked)) {
    //         this.SetEnabled(checkbox.checked);
    //         invokeChanged();
    //     }
    //     else {
    //         //prevent change checkbox... perhaps ugly to reverse logic? maybe disable native checking instead?
    //         checkbox.checked = false;
    //         console.log("Invalid to enable checkbox for dimension " + dimension + "."); // " for " + this.GetSymbol() + "_" + this.GetSymbolSubscript());
    //     }
    // };
    // textbox.onchange = () => {
    //     this.SetValue(textbox.value);
    //     invokeChanged();
    // };

    return this;
}