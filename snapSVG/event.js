//--------- Helper Functions
function precise_round(num, dec){
 
    if ((typeof num !== 'number') || (typeof dec !== 'number')) 
        return false; 

    var num_sign = num >= 0 ? 1 : -1;
    
    return (Math.round((num*Math.pow(10,dec))+(num_sign*0.0001))/Math.pow(10,dec)).toFixed(dec);
}


//------ Start of Script

// console.log("DATA POINTS", ctrl);
// console.log("label", ctrl.series[0].label);

var val0 = [null,null];
var val1 = [null,null];
var val2 = [null,null];
var val3 = [null,null];
var val4 = [null,null];


var i = 0;
for (i = 0; i < ctrl.series.length; i++) {
    label = ctrl.series[i].label;
    count = ctrl.series[i].stats.count;
    // current_value = ctrl.series[i].stats.current;
    current_value = ctrl.series[i].datapoints[count-1];
    // current_value = ctrl.series[i].datapoints[0];
    if (label === 'A2_P2') {
         val0 = current_value;
      } else if (label === 'TENGAH') {
          val1 = current_value;
      } else if (label === 'P1_A1') {
          val2 = current_value;
      } else if (label === 'A2') {
          val3 = current_value;
      } else if (label === 'A1') {
          val4 = current_value;
      }
}

console.log(val0, val1, val2, val3, val4)




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
    const p = previous || current;
    const n = next || current;

    // Properties of the opposed-line
    const o = line(p, n);

    // If is end-control-point, add PI to the angle to go backward
    const angle = o.angle + (reverse ? Math.PI : 0);
    const length = o.length * smoothing;

    // The control point position is relative to the current point
    const x = current[0] + Math.cos(angle) * length;
    const y = current[1] + Math.sin(angle) * length;
    return [x, y];
};

// Create the bezier curve command 
// I:  - point (array) [x,y]: current point coordinates
//     - i (integer): index of 'point' in the array 'a'
//     - a (array): complete array of points coordinates
// O:  - (string) 'C x2,y2 x1,y1 x,y': SVG cubic bezier C command
const bezierCommand = (point, i, a) => {

    // start control point
    const cps = controlPoint(a[i - 1], a[i - 2], point);

    // end control point
    const cpe = controlPoint(point, a[i - 1], a[i + 1], true);
    return `C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${point[0]},${point[1]}`;
};

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
        , '');
    return `<path d="${d}" fill="none" stroke="grey" />`;
    // return `${d}`
};



// The smoothing ratio
const smoothing = 0.18;

// var xStart = 100;
// var yStart = 600;
// var bridgeLength = 1700;
// var leftSpanLength = 450;
// var midSpanLength = 800;
// var rightSpanLength = 450;

var curve_dyn;
var dotArray = [];

var curveShiftPoints = [0, -13.78, -25, -33.07, -25, -13.78, 0];
var pointsInit = new Array(7);
var points = [];

var lvdtVals = [0, 0];

var lvdtValArray = [
    // [xStart + 46, yStart + 266],
    // [pointsInit[6][0], pointsInit[6][1]]
];


var s = Snap("#kudus_svg");

var main_svg = s.select('#main_svg');

if (main_svg) {

    for (var i = 0; i < pointsInit.length; i++) {
        verLineStr = '#verLine_' + i;
        verLine = s.select(verLineStr);
        horLine = s.select('#horLine_0');

        x = verLine.getBBox().x;
        y = horLine.getBBox().y;

        var temp = [];
        temp[0] = x;
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

    // Math.floor(Math.random() * 100)
    // randArray = [rand(0, 100), rand(0, 100), rand(0, 100)]
    points[1][1] = pointsInit[1][1] - val0[0];
    points[3][1] = pointsInit[3][1] - val1[0];
    points[5][1] = pointsInit[5][1] - val2[0];


    // console.log(settle_1, settle_2, settle_3);

    var s = Snap("#kudus_svg");

    // curve_dyn = s.path(svgPath(points, bezierCommand));
    d = svgPath(points, bezierCommand);
    // console.log(d);
    // console.log(d.length, d);
    // console.log(d.splice(4, 10))
    var res = d.slice(4, -3);
    // console.log(res)

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
                txtVal = val0[0];
            else if (index == 3)
                txtVal = val1[0];
            else if (index == 5)
                txtVal = val2[0];
                
            // Add 'mm' if value is not null
            if (txtVal === null) {
                txtVal = 'Unknown';
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



    // TEXT LVDT Value
    lvdtVals.forEach(function (el, index) {
        strTxt = '#lvdtTxt_' + index;
        var txt = s.select(strTxt);

        if (index == 0)
            txtVal = val3[0];
        else 
            txtVal = val4[0];

            
        // Add 'mm' if value is not null
        if (txtVal === null) {
            txtVal = 'Unknown';
        } else {
            txtVal = precise_round(txtVal, 1) + ' mm';
        }

        txt.attr({
            // text: (pointsInit[index][1] - points[index][1]) + 'mm'
            text: txtVal
        });
    });

    // Update timestamp text
    timestamp = s.select("#timestamp");
    
    dateStr = new Date(val4[1])
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
    
    timestamp.attr({
        fill: 'blue',
        // fillOpacity: 0.8,
        // textAnchor: "middle",
        // font: 'bold 24px monospace, Verdana, Helvetica, Arial, sans-serif',
        font: 'italic 22px monospace',
        // font: 'monospace',
        stroke: 'none',
        text: dateStr,
    })
    timestamp.node.onclick = function () {
        // timestamp.attr("fill", "red");
        window.open("https://minida28.grafana.net/d/SOHB13NZz/iqbals-sandbox?orgId=1&refresh=2s&from=1565203330195&to=1565203340196&panelId=11&fullscreen");
    };
    // timestamp.attr("xlink:href", "http://google.com");
//     var xlinkns = "http://www.w3.org/1999/xlink";
//     var myLink = document.getElementById("timestamp");
// myLink.setAttributeNS(xlinkns, "href", "http://google.com");
// s.append(timestamp)
// alert(myLink.getAttributeNS(xlinkns, "href"));
    // link = `<a xlink:href="https://www.w3.org/TR/SVG/" target="_blank">`
    // var xlinkns = "http://www.w3.org/1999/xlink";
    // timestamp.setAttributeNS(xlinkns, "href", "http://google.com");
    // timestamp.append(link)
    // moment().format('MMMM Do YYYY, h:mm:ss a');

}
else if (main_svg === undefined) {

    // The smoothing ratio
    const smoothing = 0.2

    // var xStart = 100;
    // var yStart = 600;
    // var bridgeLength = 1700;
    // var leftSpanLength = 450;
    // var midSpanLength = 800;
    // var rightSpanLength = 450;

    var curve_dyn;
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

    // Snap.load("https://minida28.github.io/jembatan-kudus-grafana/svg/kudus.svg", onSVGLoaded);

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

        curve_dyn = s.path(svgPath(points, bezierCommand));
        // svg.innerHTML = curve;
        curve_dyn.attr({
            fill: "none",
            stroke: "red",
            strokeWidth: 5
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
        }, 1000, anim_effect);

        tumpuan_P1.animate({
            transform: 's1, t' + 0 + ',' + y + ', r0'
        }, 1000, anim_effect);


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

                var txt = s.text(val[0], val[1] - 10, '0.0 mm')

                txt.attr({
                    fill: 'blue',
                    fillOpacity: 0.8,
                    textAnchor: "middle",
                    // font: 'bold 24px monospace, Verdana, Helvetica, Arial, sans-serif',
                    font: 'italic 24px sans-serif',
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

            y = horLine.getBBox().y

            var txt = s.text(x, y, '0.0 mm')
            // var txt = s.text(146, 866, '666 mm')
            // console.log("txt", txt)

            txt.attr({
                fill: 'blue',
                fillOpacity: 0.8,
                textAnchor: "middle",
                // font: 'bold 24px monospace, Verdana, Helvetica, Arial, sans-serif',
                font: 'italic 24px sans-serif',
                stroke: 'none',
                id: 'lvdtTxt_' + i // create shape with id
            })
        }
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


}



rand = function (min, max) {
    if (min === null && max === null)
        return 0;

    if (max === null) {
        max = min;
        min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
};
