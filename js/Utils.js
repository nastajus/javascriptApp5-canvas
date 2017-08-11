/**
 * Created by Ian Nastajus on 7/22/2017.
 */

/**
 * Limit number of decimal places for a float realValue
 * @param {Number} value
 * @param {Integer} decimals
 * @returns {number}
 */
function round(value, decimals) {
    if (decimals === undefined) {
        throw new TypeError("Cannot round to nearest decimal, as number of decimal places isn't specified.");
    }

    //assumes 1d array
    if (Array.isArray(value)) {
        let result = [];
        for (let x of value) {
            result.push(Number(Math.round(x + 'e' + decimals) + 'e-' + decimals));
        }
        return result;
    }
    else if (!isNaN(value)) {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }
    else {
        throw new TypeError("Cannot round, not a number, for value: " + value);
    }
}

function roundNearest(n, roundTo) {
    if (n > 0)
        return Math.ceil(n/roundTo) * roundTo.toFixed();
    else if (n < 0)
        return Math.floor(n/roundTo) * roundTo.toFixed();
    else
        return roundTo;
}

function addArrayToArrayOnce(sourceArray, targetArray) {
    for (let i = 0; i < sourceArray.length; i++) {
        if (!targetArray.includes(sourceArray[i])) {
            targetArray.push(sourceArray[i]);
        }
    }
}

function removeArrayFromArrayOnce(sourceArray, targetArray) {
    for (let i = 0; i < sourceArray.length; i++) {
        if (targetArray.includes(sourceArray[i])) {
            targetArray.splice(sourceArray[i], 1);
        }
    }
}

function arrayDifference(arrayA, arrayB) {
    let diff = arrayA.filter(function (x) {
        return arrayB.indexOf(x) < 0;
    });
    return diff;
}
