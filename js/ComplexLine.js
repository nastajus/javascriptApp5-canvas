/**
 * Created by Ian Nastajus on 7/22/2017.
 */


/**
 * Create a line, using an array of parameters of θ (thetas), e.g. y = θ_0 * x_0 + θ_1 * x_1
 * @param {[Number]} thetas - the weighted parameters
 */
function ComplexLine(model) {

    //y=mx + b
    //y_hat = b0 + b1 * x;
    //y_hat = y_intercept + slope * (x);
    // y = 3 + 1/2 * x;

    //hθ(x) = θ_0 + θ_1 * x
    //y_intercept = θ_0, thus θ_0 = 0
    //slope = θ_1

    //hθ(x) = θ_0 * x_0 + θ_1 * x_1 + ... + θ_n * x_n


    //this.thetas = [];
    this.name = "";

    /**
     * EvaluateY y over all dimensions of x.  e.g. y = x_0 * θ_0 + x_1 * θ_1 + ... + x_n * θ_n
     *
     * @param xs Array of x values
     * (implicit) param [thetas] Array Thetas
     * @returns {number} Value of y on line at given xs(x_0, x_1, x_2 ... x_n)
     */
    this.EvaluateY = (xs) => {

        let smallerArrayLength = (model.thetas.length < xs.length) ? model.thetas.length : xs.length;

        let y = 0;

        for (let i = 0; i < smallerArrayLength; i++) {
            let x = xs[i];
            let θ = model.thetas[i];
            y += x * θ;
        }

        return y;
    };

    this.EvaluateGradientDescentStep = (thetas, points) => {

        let smallerArrayLength = (model.thetas.length < points[0].xs.length) ? model.thetas.length : points[0].xs.length;

        let m = points.length;
        let thetasNext = new Array(model.thetas.length);

        for (let t = 0; t < smallerArrayLength; t++) {

            let summation = 0;

            for (let i = 0; i < m; i++) {
                let p = points[i];
                summation += (model.thetas[i] * p.xs[i] - p.y) * p.xs[i];
            }

            //return summation;

            thetasNext[t] = model.thetas[t] - (1/m) * summation;
        }

        return {thetas: model.thetas, thetasNext: thetasNext};
    };
}
