# Linear Regression Plotter

<img src="https://raw.githubusercontent.com/nastajus/javascriptApp5-canvas/master/docs/img1.png" width="350" /> <img src="https://raw.githubusercontent.com/nastajus/javascriptApp5-canvas/master/docs/img2.png" width="350" />

### Purpose:

Inspired by the Andrew Ng's [Machine Learning](https://www.coursera.org/learn/machine-learning/) online course, I made my own [linear regression](https://en.wikipedia.org/wiki/Linear_regression) plotter in vanilla JavaScript in ECMA6. The library [mathjs](http://mathjs.org/) was added but hasn't been used. Suffice it to say I learned plenty through this project of how JavaScript works and how mathematics works.

[//]: # "Comment:  this subsection targets math people or is meant to show off, but I worry it intimidates the layman... 
So I have mixed deires to push away from top of page... hmm... Choosing to leave for the time being." 

##### Next Steps:
If continued, the project will add support especially contour plots, and gradient descent, and ancillarily any dataset scale, n dimensions of data, and selecting dimension shown.

### Setup: 

Download and just run. 

### A Taste Of The Code:
Defined in [these Coursera notes](https://www.coursera.org/learn/machine-learning/resources/JXWWS), the mathematical cost function `J` here: 

[//]: # "Comment equation in Latex:   J(\theta_0, \theta_1)=\frac{1}{2m}\sum_{i=1}^{m} (\hat{y}_i - y_i)^{2}=\frac{1}{2m}\sum_{i=1}^{m} (h_\theta(x_i) - y_i)_{i}^{2}"
[//]: # "Comment equation in remote-rendering failed ![equation](http://www.sciweavers.org/tex2img.php?eq=J%28%5Ctheta_0%2C%20%5Ctheta_1%29%3D%5Cfrac%7B1%7D%7B2m%7D%5Csum_%7Bi%3D1%7D%5E%7Bm%7D%20%28%5Chat%7By%7D_i%20-%20y_i%29%5E%7B2%7D%3D%5Cfrac%7B1%7D%7B2m%7D%5Csum_%7Bi%3D1%7D%5E%7Bm%7D%20%28h_%5Ctheta%28x_i%29%20-%20y_i%29_%7Bi%7D%5E%7B2%7D&bc=White&fc=Black&im=jpg&fs=12&ff=arev&edit=)"
[//]: # "Comment stack overflow how to post ... https://stackoverflow.com/questions/11256433/how-to-show-math-equations-in-general-githubs-markdownnot-githubs-blog"
![equation](https://raw.githubusercontent.com/nastajus/javascriptApp5-canvas/master/docs/equation-costing-function.png)

is adapted to the javascript function `EvaluateY` below: 

```javascript 1.7
    /**
     * Evaluate y over all dimensions of x.  e.g. y = x_0 * θ_0 + x_1 * θ_1 + ... + x_n * θ_n
     *
     * @param xs Array of x values
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
```

Which can begin a detailed conversation of differences applying the math-world to the js-world. 
