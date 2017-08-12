/**
 * Created by Ian Nastajus on 8/11/2017.
 */

function DataSet(dataPoints, featureLabels) {

    if (dataPoints[0].xs.length !== featureLabels.length) {
        throw new RangeError("number of feature labels doesn't equal number of XS features in data set. Cannot create DataSet.")
    }

    this.dataPoints = dataPoints;
    this.featureLabels = featureLabels;

}