const X = 0;
const Y = 1;


//This code is based on
//https://webglfundamentals.org/webgl/lessons/webgl-3d-geometry-lathe.html



function getPointOnBezierCurve(points, offset, t) {

   var invT = (1 - t);
   var invT2 = invT * invT;
   var invT3 = invT * invT * invT;

   //console.log("inv", invT, points);

   // x part (x0,y0, x1,y1, x2,y2, x3,y3)
   var p_x =  points[offset]   * invT3 +
          3 * points[offset+2] * invT2 * t +
          3 * points[offset+4] * invT  * t * t +
              points[offset+6]         * t * t * t;

   var p_y =  points[offset+1] * invT3 +
          3 * points[offset+3] * invT2 * t +
          3 * points[offset+5] * invT  * t * t +
              points[offset+7]         * t * t * t;

   return [p_x, p_y];
}


// Need an header:
//
//4 control points
function getPointsOnBezierCurve(points, offset, numPoints, closed) {

   //console.log("bezier");
   var curve_pts = [];

   if (closed){ curve_pts.push(points[X], points[Y]); }

   var curr_slice = 0;
   for (let j = 0; j < points.length; j++){
     for (var i = 0; i < numPoints; ++i) {
        var t = i / (numPoints - 1);
        var aPt = getPointOnBezierCurve(points.slice(curr_slice), offset, t);

        curve_pts.push(aPt[X], aPt[Y]);
     }
       curr_slice += 6;
   }

   // curve_pts.push(points[X], points[Y]);
   // for (var i = 0; i < numPoints; ++i) {
   //    var t = i / (numPoints - 1);
   //    var aPt = getPointOnBezierCurve(points.slice(6), offset, t);
   //
   //    curve_pts.push(aPt[X], aPt[Y]);
   // }

   //console.log(curve_pts);
   return curve_pts;
}
