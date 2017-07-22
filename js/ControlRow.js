/**
 * Created by Ian Nastajus on 7/22/2017.
 */

/**
 * MVC = View
 *
 * @param template
 * @returns {ControlRow}
 */
function ControlRow() {

    //external variable
    this.element = null;

    //external methods
    // Callback called when control changes
    this.OnRowChange = null;

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

    //internal state

    let template = document.querySelector("#control-template").content;
    this.element = document.importNode(template, true);
    let value = 0;

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
        if (this.OnRowChange)
            this.OnRowChange();
    };

    const incrementValue = (delta) => {
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
    textbox.onchange = () => {
        this.SetValue(textbox.value);
        invokeChanged();
    };

    return this;
}