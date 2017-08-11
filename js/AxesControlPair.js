/**
 * Created by Ian Nastajus on 7/24/2017.
 */

/**
 * MVC = View
 *
 * @returns {AxesControlPair}
 */
function AxesControlPair() {

    //external variable
    this.element = null;

    // Callback called when control changes
    this.OnControlChange = null;

    this.GetValue = () => value;
    this.SetValue = (_value) => {
        value = _value;
    };

    this.GetChangeLarge = () => changeLarge;
    this.SetChangeLarge = (_changeLarge) => {
        changeLarge = _changeLarge;
    };

    this.GetChangeSmall = () => changeSmall;
    this.SetChangeSmall = (_changeSmall) => {
        changeSmall = _changeSmall;
    };

    //internal state
    this.element = document.querySelector(".container-column");
    let value = {x: 0, y: 0};
    let changeSmall;
    let changeLarge;

    let buttonVerticalIncrementLarge = this.element.querySelector(".axis-vg-large");
    let buttonVerticalIncrementSmall = this.element.querySelector(".axis-vg-small");
    let buttonVerticalDecrementSmall = this.element.querySelector(".axis-vl-small");
    let buttonVerticalDecrementLarge = this.element.querySelector(".axis-vl-large");

    let buttonHorizontalIncrementLarge = this.element.querySelector(".axis-hg-large");
    let buttonHorizontalIncrementSmall = this.element.querySelector(".axis-hg-small");
    let buttonHorizontalDecrementSmall = this.element.querySelector(".axis-hl-small");
    let buttonHorizontalDecrementLarge = this.element.querySelector(".axis-hl-large");

    //internal methods
    //for subscribers (utility functions so don't have to check for null every time)

    const invokeChanged = () => {
        if (this.OnControlChange) {
            this.OnControlChange();
        }
    };

    const modifyValueBy = (axisDelta) => {
        if (axisDelta.x) {
            this.SetValue(
                {
                    x: round(this.GetValue().x + axisDelta.x, 1),
                    y: this.GetValue().y
                });
        }
        if (axisDelta.y) {
            this.SetValue(
                {
                    x: this.GetValue().x,
                    y: round(this.GetValue().y + axisDelta.y, 1)
                });
        }
        invokeChanged();
    };

    //init logic
    buttonVerticalDecrementSmall.onclick = () => modifyValueBy({y: -changeSmall});
    buttonVerticalDecrementLarge.onclick = () => modifyValueBy({y: -changeLarge});
    buttonVerticalIncrementSmall.onclick = () => modifyValueBy({y: changeSmall});
    buttonVerticalIncrementLarge.onclick = () => modifyValueBy({y: changeLarge});

    buttonHorizontalDecrementSmall.onclick = () => modifyValueBy({x: -changeSmall});
    buttonHorizontalDecrementLarge.onclick = () => modifyValueBy({x: -changeLarge});
    buttonHorizontalIncrementSmall.onclick = () => modifyValueBy({x: changeSmall});
    buttonHorizontalIncrementLarge.onclick = () => modifyValueBy({x: changeLarge});

}