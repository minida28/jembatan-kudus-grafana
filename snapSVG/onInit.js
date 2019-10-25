function precise_round(num, dec){
 
    if ((typeof num !== 'number') || (typeof dec !== 'number')) 
        return false; 

    var num_sign = num >= 0 ? 1 : -1;
    
    return (Math.round((num*Math.pow(10,dec))+(num_sign*0.0001))/Math.pow(10,dec)).toFixed(dec);
}


// Properties of a line 
// I:  - pointA (array) [x,y]: coordinates
//     - pointB (array) [x,y]: coordinates
// O:  - (object) { length: l, angle: a }: properties of the line
const line = (pointA, pointB) => {
    const lengthX = pointB[0] - pointA[0];
    const lengthY = pointB[1] - pointA[1];
    return {
        length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
        angle: Math.atan2(lengthY, lengthX)
    };
};

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
    return `<path d="${d}" fill="none" stroke="grey" />`
    // return `${d}`
}


//------ Start of Script

// console.log("onInit DATA POINTS", ctrl.series);
// console.log("label", ctrl.series[0].label);

var settleVal = [null,null,null];
    
var settleTimestamp = [];
    
var lvdtVal = [null,null];
    
var lvdtTimestamp = [];


// var i = 0;
// for (i = 0; i < ctrl.series.length; i++) {
//     label = ctrl.series[i].label;
//     count = ctrl.series[i].stats.count;
//     // current_value = ctrl.series[i].stats.current;
//     // current_value = ctrl.series[i].stats.current;
//     // current_value = ctrl.series[i].datapoints[0];
//     len = ctrl.series[i].datapoints.length;
//     last_value = ctrl.series[i].datapoints[len-1][0];
//     timestamp = ctrl.series[i].datapoints[len-1][1];
//     if (label === 'A2_P2') {
//         settleVal[0] = last_value;
//         settleTimestamp[0] = timestamp;
//     } else if (label === 'TENGAH') {
//         settleVal[1] = last_value;
//         settleTimestamp[1] = timestamp;
//     } else if (label === 'P1_A1') {
//         settleVal[2] = last_value;
//         settleTimestamp[2] = timestamp;
//     } else if (label === 'A2') {
//         lvdtVal[0] = last_value;
//         lvdtTimestamp[0] = timestamp;
//     } else if (label === 'A1') {
//         lvdtVal[1] = last_value;
//         lvdtTimestamp[1] = timestamp;
//     }
// }

// console.log('onInit', val0[0], val1[0], val2[0], val3[0], val4[0])
console.log('onInit settleVal', settleVal[0], settleVal[1], settleVal[2]);
console.log('onInit lvdtVal', lvdtVal[0], lvdtVal[0]);

// The smoothing ratio
const smoothing = 0.2

// var xStart = 100;
// var yStart = 600;
// var bridgeLength = 1700;
// var leftSpanLength = 450;
// var midSpanLength = 800;
// var rightSpanLength = 450;

// var curve_dyn;
var dotArray = [];

var curveShiftPoints = [0, -13.78, -25, -33.07, -25, -13.78, 0];
var pointsInit = new Array(7);
var points = [];

var lvdtVals = [0, 0];

var lvdtValArray = [
    // [xStart + 46, yStart + 266],
    // [pointsInit[6][0], pointsInit[6][1]]
]

var s = Snap("#kudus_svg");
// var s = Snap(svgnode);

Snap.load("https://minida28.github.io/jembatan-kudus-grafana/svg/kudus_inkscape.svg", onSVGLoaded);
// Snap.load("svg/kudus_plain.svg", onSVGLoaded);
// Snap.load("http://galaxi.duckdns.org:8000/kudus_plain.svg", onSVGLoaded);
// Snap.load("https://kenoleon.github.io/Front-End-Web-Dev-UI-UX/assets/images/truck.svg", onSVGLoaded);

var tumpuan_P1, tumpuan_P2;

function onSVGLoaded(data) {

    s.append(data);

    for (var i = 0; i < pointsInit.length; i++) {
        verLineStr = '#verLine_' + i;
        verLine = s.select(verLineStr);
        horLine = s.select('#horLine_0');

        x = verLine.getBBox().x
        y = horLine.getBBox().y

        var temp = []
        temp[0] = x
        temp[1] = y + curveShiftPoints[i];

        pointsInit[i] = temp;

        // points[i] = temp;
        // points.push(temp)
    }

    // Copy the array to change later
    // Note I use JSON.parse & JSON.stringify to clone the array
    // I do not use push or indexing method to coy the value, because
    // the new arrays will still reference to the old array and changing one will affect the other
    // see https://stackoverflow.com/a/45813800

    points = JSON.parse(JSON.stringify(pointsInit))



    curve_initial = s.path(svgPath(points, bezierCommand));
    // svg.innerHTML = curve;
    curve_initial.attr({
        fill: "none",
        stroke: "grey",
        strokeWidth: 5
    });
    
    // points[1][1] = pointsInit[1][1] - val0[0];
    // points[3][1] = pointsInit[3][1] - val1[0];
    // points[5][1] = pointsInit[5][1] - val2[0];
    
    points[1][1] = pointsInit[1][1] - settleVal[0];
    points[3][1] = pointsInit[3][1] - settleVal[1];
    points[5][1] = pointsInit[5][1] - settleVal[2];
    
    // points[1][1] = pointsInit[1][1];
    // points[3][1] = pointsInit[3][1];
    // points[5][1] = pointsInit[5][1];

    curve_dyn = s.path(svgPath(points, bezierCommand));
    // svg.innerHTML = curve;
    curve_dyn.attr({
        fill: "none",
        stroke: "red",
        strokeWidth: 5,
        id: 'curve_dyn'
    });


    tumpuan_A2 = s.select("#tumpuan_A2")
    tumpuan_P2 = s.select("#tumpuan_P2")
    tumpuan_P1 = s.select("#tumpuan_P1")
    tumpuan_A1 = s.select("#tumpuan_A1")

    var t = new Snap.Matrix();

    // set posisi tumpuan
    horLine = s.select('#horLine_0');
    var y = points[2][1] - horLine.getBBox().y;
    tumpuan_P2.animate({
        transform: 's1, t' + 0 + ',' + y + ', r0'
    }, 1000, mina.bounce);

    tumpuan_P1.animate({
        transform: 's1, t' + 0 + ',' + y + ', r0'
    }, 1000, mina.bounce);


    var i = 0;
    points.forEach(function (val, index) {

        if (index == 1 || index == 3 || index == 5) {
            
            
            var dot = s.circle(val[0], val[1], 5);

            dot.attr({
                // fill: "#bada55",
                stroke: "red",
                strokeWidth: 4,
                id: 'dot_' + i // create shape with id dot_i
            });


            //----- Print Settlement Values
            var dateStr = 'test';
            
            if (index == 1) {
                v = settleVal[0];
                t = settleTimestamp[0];
            }
            else if (index == 3) {
                v = settleVal[1];
                t = settleTimestamp[1];
            }
            else if (index == 5) {
                v = settleVal[2];
                t = settleTimestamp[2];
            }
            
            
            if (v == null || v == undefined) {
                v = 'null';
            } else {
                v = precise_round(v,2) + ' mm';
            };
            
            txt = s.text(val[0], val[1] - 10, v);
            dateStr = new Date(t);

            txt.attr({
                fill: 'blue',
                fillOpacity: 0.8,
                textAnchor: "middle",
                font: 'bold 24px monospace, Verdana, Helvetica, Arial, sans-serif',
                // font: 'italic 24px sans-serif',
                stroke: 'none',
                id: 'txt_' + i // create shape with id
            })

            i++;
        }
    });

    // Create text LVDT Value                
    for (var i = 0; i < lvdtVals.length; i++) {
        horLine = s.select("#horLine_1")

        if (i == 0) {
            verLine = s.select("#verLine_0")
            bridgeSection = s.select("#bridgeSectionA2")
            x = (verLine.getBBox().x + bridgeSection.getBBox().x) / 2
        }
        else if (i == 1) {
            verLine = s.select("#verLine_6")
            bridgeSection = s.select("#bridgeSectionA1")
            x = (bridgeSection.getBBox().x2 + verLine.getBBox().x) / 2
        }

        // x = verLine.getBBox().x + lvdtTxtShiftPos[i]

        y = horLine.getBBox().y;
        
        v = lvdtVal[0];
        t = lvdtTimestamp[0];

        
        if (v == null || v == undefined) {
            v = 'null';
        } else {
            v = precise_round(v,2) + ' mm';
        };
        
        var txt = s.text(x, y, v)

        txt.attr({
            fill: 'blue',
            fillOpacity: 0.8,
            textAnchor: "middle",
            font: 'bold 24px monospace, Verdana, Helvetica, Arial, sans-serif',
            // font: 'italic 24px sans-serif',
            stroke: 'none',
            id: 'lvdtTxt_' + i // create shape with id
        })
    }
    
    
    //------ Update timestamp text
    timestamp = s.select("#timestamp");
    
    dateStr = new Date(lvdtTimestamp[0]);
    
    console.log(dateStr)
    var options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        // timeZoneName: 'short'
    };
    dateStr = dateStr.toLocaleString('jv-JV', options)
    
    console.log(dateStr)
    
    timestamp.attr({
        fill: 'blue',
        // fillOpacity: 0.8,
        // textAnchor: "middle",
        font: 'bold 24px monospace, Verdana, Helvetica, Arial, sans-serif',
        // font: 'italic 22px monospace',
        // font: 'monospace',
        stroke: 'none',
        text: dateStr,
    })
    
    timestamp.node.onclick = function () {
        // timestamp.attr("fill", "red");
        window.open("https://minida28.grafana.net/d/SOHB13NZz/iqbals-sandbox?orgId=1&refresh=2s&from=1565203330195&to=1565203340196&panelId=11&fullscreen");
    };
}
