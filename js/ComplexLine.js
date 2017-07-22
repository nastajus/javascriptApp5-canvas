/**
 * Created by Ian Nastajus on 7/22/2017.
 */


/**
 * Create a line, using an array of parameters of θ (thetas), e.g. y = θ_0 * x_0 + θ_1 * x_1
 * @param {[Number]} thetas
 */
function ComplexLine(thetas) {

    //y=mx + b
    //y_hat = b0 + b1 * x;
    //y_hat = y_intercept + slope * (x);
    // y = 3 + 1/2 * x;

    //hθ(x) = θ_0 + θ_1 * x
    //y_intercept = θ_0, thus θ_0 = 0
    //slope = θ_1

    //hθ(x) = θ_0 * x_0 + θ_1 * x_1 + ... + θ_n * x_n


    this.thetas = thetas;
    this.name = "";

    /**
     * Evaluate y over all dimensions of x.  e.g. y = x_0 * θ_0 + x_1 * θ_1 + ... + x_n * θ_n
     *
     * @param xs Array of x values
     * @returns {number} Value of y on line at given xs(x_0, x_1, x_2 ... x_n)
     */
    this.Evaluate = (xs) => {

        if (this.thetas.length !== xs.length) {
            throw new RangeError("Amount of θ (thetas) does not match amount of X parameters. Cannot evaluate.")
        }

        let hypo_y = 0;

        for (let i = 0; i < xs.length; i++) {
            let x = xs[i];
            let θ = this.thetas[i];
            hypo_y += x * θ;
        }

        return hypo_y;

        //return this.slope * x + this.y_intercept_y_value;
    }
}
