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
    const lengthX = pointB[0] - pointA[0]
    const lengthY = pointB[1] - pointA[1]
    return {
        length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
        angle: Math.atan2(lengthY, lengthX)
    }
}

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

console.log("Event DATA POINTS", ctrl.series);
// console.log("label", ctrl.series[0].label);

var settleVal = [null,null,null];
    
var settleTimestamp = [];
    
var lvdtVal = [null,null];
    
var lvdtTimestamp = [];


var i = 0;
for (i = 0; i < ctrl.series.length; i++) {
    label = ctrl.series[i].label;
    count = ctrl.series[i].stats.count;
    // current_value = ctrl.series[i].stats.current;
    // current_value = ctrl.series[i].stats.current;
    // current_value = ctrl.series[i].datapoints[0];
    len = ctrl.series[i].datapoints.length;
    last_value = ctrl.series[i].datapoints[len-1][0];
    timestamp = ctrl.series[i].datapoints[len-1][1];
    if (label === 'A2_P2') {
        settleVal[0] = last_value;
        settleTimestamp[0] = timestamp;
    } else if (label === 'TENGAH') {
        settleVal[1] = last_value;
        settleTimestamp[1] = timestamp;
    } else if (label === 'P1_A1') {
        settleVal[2] = last_value;
        settleTimestamp[2] = timestamp;
    } else if (label === 'A2') {
        lvdtVal[0] = last_value;
        lvdtTimestamp[0] = timestamp;
    } else if (label === 'A1') {
        lvdtVal[1] = last_value;
        lvdtTimestamp[1] = timestamp;
    }
    
    console.log(timestamp)
}

// console.log('onInit', val0[0], val1[0], val2[0], val3[0], val4[0])
console.log('Event settleVal:', settleVal[0], settleVal[1], settleVal[2]);
console.log('Event lvdtVal:', lvdtVal[0], lvdtVal[0]);
console.log('Event lvdtTimestamp:', lvdtTimestamp[0], lvdtTimestamp[0]);


// The smoothing ratio
const smoothing = 0.2

// // var xStart = 100;
// // var yStart = 600;
// // var bridgeLength = 1700;
// // var leftSpanLength = 450;
// // var midSpanLength = 800;
// // var rightSpanLength = 450;

// // var curve_dyn;
// var dotArray = [];

var curveShiftPoints = [0, -13.78, -25, -33.07, -25, -13.78, 0];
var pointsInit = new Array(curveShiftPoints.length);
var points = [];



// Load the already loaded svg node
var s = Snap(svgnode);

Snap.load(s.node, onSVGLoaded);

function onSVGLoaded(data) {
    
    // s.append(data);
    
    // Demonstrate that we can manipulate using HTML DOM
    // or using Snap SVG Select utility
    console.log('Event onSVGLoaded data', data);
    
    test = document.getElementById('verLine_0')
    console.log(test);
    test = s.select("#verLine_0");
    // test = document.getElementById('verLine_0')
    console.log(test);
    // End of Demonstration
    
    
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

    points = JSON.parse(JSON.stringify(pointsInit));
    
    
    points[1][1] = pointsInit[1][1] - settleVal[0];
    points[3][1] = pointsInit[3][1] - settleVal[1];
    points[5][1] = pointsInit[5][1] - settleVal[2];
    
    d = svgPath(points, bezierCommand);
    
    var res = d.slice(4, -3);
    
    var animate = true;
    var t_Animate = 1000;
    var anim_effect = mina.easein


    curve_dyn = s.select("#curve_dyn");

    if (animate) {
        curve_dyn.animate({ d: d }, t_Animate, anim_effect);
    } else {
        curve_dyn.attr({
            d: d,
        });
    }
    
    var i = 0;
    points.forEach(function (el, index) {

        if (index == 1 || index == 3 || index == 5) {

            // DOTS
            var yLast = points[index][1];

            var yDot;

            str = '#dot_' + i;
            var dot = s.select(str);

            if (animate)
                dot.animate({ cy: yLast }, t_Animate, anim_effect);
            else
                dot.attr({ cy: yLast });


            // TEXT SETTLEMENT
            strTxt = '#txt_' + i;
            var txt = s.select(strTxt);

            var txtHeight = txt.getBBox().y2 - txt.getBBox().y;
            // console.log('txtHeight', txtHeight)

            var yTxt = 0;
            var dotHeight = (dot.getBBox().y2 - dot.getBBox().y);
            if (points[index][1] <= pointsInit[index][1]) {
                yTxt = yLast - dotHeight / 2 - 10;
            } else {
                yTxt = yLast + dotHeight / 2 + 0 + txtHeight;
            }

            
            if (index == 1)
                txtVal = settleVal[0];
            else if (index == 3)
                txtVal = settleVal[1];
            else if (index == 5)
                txtVal = settleVal[2];
                
            // Add 'mm' if value is not null
            if (txtVal === null) {
                txtVal = 'null';
            } else {
                txtVal = precise_round(txtVal, 2) + ' mm';
            }
            
            console.log(txtVal)
            
            // change the text attribute
            txt.attr({
                // text: (pointsInit[index][1] - points[index][1]) + 'mm'
                text: txtVal
            });

            if (animate)
                txt.animate({ y: yTxt }, t_Animate, anim_effect);
            else
                txt.attr({ y: yTxt });

            i++;
        }
    });
    
    
    //-------- TEXT LVDT Value
    lvdtVal.forEach(function (el, index) {

        // Add 'mm' if value is not null
        if (el === null) {
            txtVal = 'null';
        } else {
            txtVal = precise_round(el, 1) + ' mm';
        }
        
        var txt = s.select('#lvdtTxt_' + index);

        txt.attr({
            // text: (pointsInit[index][1] - points[index][1]) + 'mm'
            text: txtVal
        });
    });
    

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
        text: dateStr,
    })
    
    timestamp.node.onclick = function () {
        // timestamp.attr("fill", "red");
        window.open("https://minida28.grafana.net/d/SOHB13NZz/iqbals-sandbox?orgId=1&refresh=2s&from=1565203330195&to=1565203340196&panelId=11&fullscreen");
    };
    
}
