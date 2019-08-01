console.log("DATA POINTS", ctrl);

var val0 = ctrl.series[0].datapoints[0][0];
// val0 = Number(val0.toFixed(2));

console.log(val0);

var val1 = ctrl.series[1].datapoints[0][0];
// val1 = Number(val1.toFixed(2))/2;

var val2 = ctrl.series[2].datapoints[0][0];
// val2 = Number(val2.toFixed(2))/2;

// console.log("DATA POINTS",ctrl.series[0].datapoints);
// console.log("DATA POINTS",ctrl);

console.log(val0, val1, val2);

var svg = Snap(svgnode);
var curve_dyn = svg.select("#curve_dyn");
// console.log("kudus",svg.select("#kudus"));
console.log(curve_dyn);

curve_dyn.attr({
    // fill: "#bada55",
    stroke: "#000",
    strokeWidth: 0.2
});

// The smoothing ratio
const smoothing = 0.2

var xStart = 7.13;
var yStart = 60;

const points = [
    [xStart + 0, yStart + 0],
    [xStart + 22.5, yStart + val0 / 7],
    [xStart + 45, yStart - 4],
    [xStart + 85, yStart + (val1 / 7) * -1 - 8],
    [xStart + 125, yStart - 4],
    [xStart + 147.5, yStart + val2 / 7],
    [xStart + 170, yStart + 0]
]


// Position of a control point 
// I:  - current (array) [x, y]: current point coordinates
//     - previous (array) [x, y]: previous point coordinates
//     - next (array) [x, y]: next point coordinates
//     - reverse (boolean, optional): sets the direction
// O:  - (array) [x,y]: a tuple of coordinates
const controlPoint = (current, previous, next, reverse) => {

    // When 'current' is the first or last point of the array
    // 'previous' or 'next' don't exist.
    // Replace with 'current'
    const p = previous || current
    const n = next || current

    // Properties of the opposed-line
    const o = line(p, n)

    // If is end-control-point, add PI to the angle to go backward
    const angle = o.angle + (reverse ? Math.PI : 0)
    const length = o.length * smoothing

    // The control point position is relative to the current point
    const x = current[0] + Math.cos(angle) * length
    const y = current[1] + Math.sin(angle) * length
    return [x, y]
}

// Create the bezier curve command 
// I:  - point (array) [x,y]: current point coordinates
//     - i (integer): index of 'point' in the array 'a'
//     - a (array): complete array of points coordinates
// O:  - (string) 'C x2,y2 x1,y1 x,y': SVG cubic bezier C command
const bezierCommand = (point, i, a) => {

    // start control point
    const cps = controlPoint(a[i - 1], a[i - 2], point)

    // end control point
    const cpe = controlPoint(point, a[i - 1], a[i + 1], true)
    return `C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${point[0]},${point[1]}`
}

// Render the svg <path> element 
// I:  - points (array): points coordinates
//     - command (function)
//       I:  - point (array) [x,y]: current point coordinates
//           - i (integer): index of 'point' in the array 'a'
//           - a (array): complete array of points coordinates
//       O:  - (string) a svg path command
// O:  - (string): a Svg <path> element
const svgPath = (points, command) => {
    // build the d attributes by looping over the points
    const d = points.reduce((acc, point, i, a) => i === 0
        ? `M ${point[0]},${point[1]}`
        : `${acc} ${command(point, i, a)}`
        , '')
    // return `<path d="${d}" fill="none" stroke="grey" />`
    return `${d}`
}

const svg = document.querySelector('.svg');

// svg.attr({
//     fill: "#bada55",
//     stroke: "#000",
//     strokeWidth: 5
// });

// svg.innerHTML = svgPath(points, bezierCommand);
// var s = "\"" + svgPath(points, bezierCommand) + "\"";
var s = svgPath(points, bezierCommand);
// snap.append(s);
console.log("bezierCommand Result:", s);
// svgnode.append(s);

// kudus.node.getAttribute('d') = s;
// Snap.animate(from, to, setter, duration, [easing], [callback])
var kudusPoints = kudus.node.getAttribute('d');
// kudus.animate({ d: kudusPoints }, 10, mina.backout, toFancy);

var toFancy = function () {
    //   kudus.animate({ d: s }, 1, mina.backout);  
    kudus.attr({
        d: s,
    });
}

kudus.attr({
    d: s,
});

if (0) {
    var curve = snap.path("M 10,60 C 14,61 22,65 30,65 C 38,65 38,65 50,60 C 62,55 74,40 90,40 C 106,40 118,50 130,60 C 142,70 142,90 150,90 C 158,90 166,66 170,60");
    curve.attr({
        fill: "#bada55",
        stroke: "#000",
        strokeWidth: 5
    });
    // snap.append(curve);
}

points.forEach(function (val) {
    // var dot = snap.circle(val[0], val[1], 1);

    // dot.attr({
    //     fill: "#bada55",
    //     stroke: "#000",
    //     strokeWidth: 1
    // });
});