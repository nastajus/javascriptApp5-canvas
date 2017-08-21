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
    this.graph = null;

    // Callback called when control changes
    this.OnControlChange = null;

    this.GetValue = () => value;
    this.SetValue = (_value) => {
        value = _value;
    };

    this.GetTranslateLarge = () => translateLarge;
    this.SetTranslateLarge = (_translateLarge) => {
        translateLarge = _translateLarge;
    };

    this.GetTranslateSmall = () => translateSmall;
    this.SetTranslateSmall = (_translateSmall) => {
        translateSmall = _translateSmall;
    };

    this.GetZoomFactor = () => this.graph.GetZoomFactor();
    this.SetZoomFactor = (zoomFactor) => {
        this.graph.SetZoomFactor(zoomFactor);
    };

    //internal state
    this.element = document.querySelector(".container-column");
    let value = {x: 0, y: 0};
    let translateSmall;
    let translateLarge;

    let buttonVerticalIncrementLarge = this.element.querySelector(".axis-vg-large");
    let buttonVerticalIncrementSmall = this.element.querySelector(".axis-vg-small");
    let buttonVerticalDecrementSmall = this.element.querySelector(".axis-vl-small");
    let buttonVerticalDecrementLarge = this.element.querySelector(".axis-vl-large");

    let buttonHorizontalIncrementLarge = this.element.querySelector(".axis-hg-large");
    let buttonHorizontalIncrementSmall = this.element.querySelector(".axis-hg-small");
    let buttonHorizontalDecrementSmall = this.element.querySelector(".axis-hl-small");
    let buttonHorizontalDecrementLarge = this.element.querySelector(".axis-hl-large");

    let buttonZoomHorizontalIn = this.element.querySelector(".axis-hm");
    let buttonZoomHorizontalOut = this.element.querySelector(".axis-hp");
    let buttonZoomVerticalIn = this.element.querySelector(".axis-vm");
    let buttonZoomVerticalOut = this.element.querySelector(".axis-vp");

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

    const modifyZoomBy = (zoomFactor) => {
        this.SetZoomFactor(zoomFactor);
        invokeChanged();
    };

    //init logic
    buttonVerticalDecrementSmall.onclick = () => modifyValueBy({y: -translateSmall});
    buttonVerticalDecrementLarge.onclick = () => modifyValueBy({y: -translateLarge});
    buttonVerticalIncrementSmall.onclick = () => modifyValueBy({y: translateSmall});
    buttonVerticalIncrementLarge.onclick = () => modifyValueBy({y: translateLarge});

    buttonHorizontalDecrementSmall.onclick = () => modifyValueBy({x: -translateSmall});
    buttonHorizontalDecrementLarge.onclick = () => modifyValueBy({x: -translateLarge});
    buttonHorizontalIncrementSmall.onclick = () => modifyValueBy({x: translateSmall});
    buttonHorizontalIncrementLarge.onclick = () => modifyValueBy({x: translateLarge});

    buttonZoomHorizontalIn.onclick = () => modifyZoomBy(round(this.graph.GetZoomFactor() - ZOOM_INCREMENT, 1));
    buttonZoomHorizontalOut.onclick = () => modifyZoomBy(round(this.graph.GetZoomFactor() + ZOOM_INCREMENT, 1));
    buttonZoomVerticalIn.onclick = () => modifyZoomBy(round(this.graph.GetZoomFactor() - ZOOM_INCREMENT, 1));
    buttonZoomVerticalOut.onclick = () => modifyZoomBy(round(this.graph.GetZoomFactor() + ZOOM_INCREMENT, 1));


    // flow of execution of public & private methods
    // stage 1: an onclick event fires
    // stage 2: that triggers modifyValueBy(...)
    // stage 3: that triggers invokeChanged(...)
    // stage 4: the body of invokeChanged verifies OnControlChange is bound to anything, and if so, executes it.

}