//Color library in progress, using Allegra's code: borrow from it, add to it.
const R = 0;
const G = 1;
const B = 2;
const A = 3;




//assuming color with same number of component
function gradientColorIncrement(sColor, eColor, iterations) {
   var incColor = [];

   for (var i=0; i<sColor.length; i++)
     incColor[i] = (eColor[i]-sColor[i])/iterations;

   return incColor;

}




//may be used with HSLA too...
function add(aColor, inc) {
   return [
        aColor[R]+inc[R],
        aColor[G]+inc[G],
        aColor[B]+inc[B],
        aColor[A]+inc[A]
          ];
}






function huetoRGB(p, q, t) {
   if (t < 0) t += 1;
   else if (t > 1) t -= 1;

   if (t < 1/6) return p + (q - p) * 6 * t;
   else if (t < 1/2) return q;
   else if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;

   return p;
}





//Conversion reference code:   http://lodev.org/cgtutor/color.html
//Equations  https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_RGB
//Param color: h, s, and b are  [0, 1]
//Output: r, g, b are [0, 1]    (a stays the same_
function convertHSLtoRGB(color) {
   var hue = color[R];
   var saturation = color[G];
   var brightness = color[B];

   var r, g, b;
    //if saturation is 0, the color is a shade of gray
    if(saturation === 0)
       r = g = b = brightness;

    //saturation > 0
    else {
       var q = brightness < 0.5 ? brightness * (1 + saturation) :
                                  brightness + saturation - brightness * saturation;
       var p = 2 * brightness - q;

       r = huetoRGB(p, q, hue + 1/3);
       g = huetoRGB(p, q, hue);
       b = huetoRGB(p, q, hue - 1/3);
    }

    return [r, g, b, color[A]];
}












//INCOMPLETE... you have to do a vertical gradient!
function create2DGradientShape(gl, bounds, sColor, eColor, isHorizontal, isHSL, mat) {

   var vertices = [];
   var colors = [];

//DEBUGGING code
//console.log(" HERE len", bounds.length, hsb);

   if (isHorizontal) {

      var theColor = [sColor[0], sColor[1], sColor[2], sColor[3]];

      var delta = 0.3;
      var steps = Math.abs(bounds[0]-bounds[1])/delta;

      var colorInc = gradientColorIncrement(sColor, eColor, steps);
      //console.log("color info really", steps, colorInc, isHSL);

      // !!!! IMPORTANT  !!!!  +=0.3 because you need to draw lines very close
      //Try to change to +1 you will see an artifact  --> COSC201 floating point representation
      //for (var i =  bounds[0]; i <  bounds[1]; i+=0.3) {
      for (var i =  bounds[0]; i <  bounds[1]; i+=delta) {
                   //x_i,      ymin, x_i,    ymax
         vertices.push(i, bounds[2],   i,    bounds[3]);

         var color = theColor;

         if (isHSL !== undefined && isHSL)
            color = convertHSLtoRGB(theColor);

         colors.push(color[R], color[G], color[B], color[A]);   //for each vertex of line
         colors.push(color[R], color[G], color[B], color[A]);

         theColor = add(theColor, colorInc);
      }

//DEBUGGING code
/*
console.log("\n color end", theColor[0]);
console.log("\n bf of lines", vertices.length/4);

console.log("line1", vertices[0], vertices[1], "to", vertices[2], vertices[3]);
console.log("linen", vertices[vertices.length-4], vertices[vertices.length-3], "to",
                     vertices[vertices.length-2], vertices[vertices.length-1]);
*/

     return create2DShape(gl, gl.LINES, vertices, colors, mat);

   } else {
     var theColor = [sColor[0], sColor[1], sColor[2], sColor[3]];

     var delta = 0.3;
     var steps = Math.abs(bounds[2]-bounds[3])/delta;

     var colorInc = gradientColorIncrement(sColor, eColor, steps);
     //console.log("color info really", steps, colorInc, isHSL);

     // !!!! IMPORTANT  !!!!  +=0.3 because you need to draw lines very close
     //Try to change to +1 you will see an artifact  --> COSC201 floating point representation
     //for (var i =  bounds[0]; i <  bounds[1]; i+=0.3) {
     for (var i =  bounds[2]; i <  bounds[3]; i+=delta) {
                  //x_i,      ymin, x_i,    ymax
        vertices.push(bounds[0], i,   bounds[1],    i);

        var color = theColor;

        if (isHSL !== undefined && isHSL)
           color = convertHSLtoRGB(theColor);

        colors.push(color[R], color[G], color[B], color[A]);   //for each vertex of line
        colors.push(color[R], color[G], color[B], color[A]);

        theColor = add(theColor, colorInc);
     }

//DEBUGGING code
/*
console.log("\n color end", theColor[0]);
console.log("\n bf of lines", vertices.length/4);

console.log("line1", vertices[0], vertices[1], "to", vertices[2], vertices[3]);
console.log("linen", vertices[vertices.length-4], vertices[vertices.length-3], "to",
                    vertices[vertices.length-2], vertices[vertices.length-1]);
*/

    return create2DShape(gl, gl.LINES, vertices, colors, mat);
   }
}
