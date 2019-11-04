/*

Mary Festa
Project 2: Intérieur au Violon, Henri Matisse
------ code adapted from labs 6 and 7 ------

*/

"use strict";


const VERTCOMP = 2;  //(x,y)     working in 2D so constant for this program
const COLORCOMP = 4;  //(r,g,b,a)

const PALETTE = {
  darkbrown: adjustRGBA([61,52,44,255]),
  white: [1,1,1,1],
  black: [0,0,0,1],
  tan: adjustRGBA([220, 185, 143, 255]),
  bluesky: adjustRGBA([105, 168, 210, 255]),
  babyblue: adjustRGBA([125, 157, 185, 255]),
  lightestblue: adjustRGBA([201, 232, 255, 255]),
  ashbrown: adjustRGBA([139, 116, 103, 255]),
  lightgrey: adjustRGBA([195, 195, 195, 255]),
  burntorange:adjustRGBA([178, 70, 48, 255]),
  darkerorange: adjustRGBA([112, 49, 35, 255]),
  mustard: adjustRGBA([205, 126, 65, 255]),
  chestnut: adjustRGBA([97, 52, 42, 255]),
  darkchestnut: adjustRGBA([75,66,57,255]),
  caseblue: adjustRGBA([72, 130, 181, 255]),
  violinbody: adjustRGBA([152, 73, 48, 255]),
  darkgrey: adjustRGBA([95, 90, 85, 255]),
  navygrey: adjustRGBA([98,98,89,255]),
  beige: adjustRGBA([163, 132, 94, 255]),
  offwhite: adjustRGBA([244, 240, 219, 255]),
  green: adjustRGBA([86, 122, 90, 255])
};

function adjustRGBA(rgba_values){
  // takes in an array of rgb values [R,G,B,alpha] with 0 to 255 and
  // adjusts it for the 0 to 1 range
  var adjustedRGBA = rgba_values.slice(0);
  for (var i = 0; i < adjustedRGBA.length; i++){
    adjustedRGBA[i] = adjustedRGBA[i]/255;
  }
  return adjustedRGBA;
}

function adjustAlpha(color, newalpha){
  return color.slice(0,3).concat(newalpha);
}

//About performance with array
//https://javascript.info/array
function extendArrayWithDuplicate(arr, nbElements, nbComponents) {
   var len = arr.length;

   var larger = [];
   //console.log(nbElements * nbComponents);
   larger.length = nbElements * nbComponents;

   for (var i = 0; i < larger.length; i++)
      larger[i] = arr[i % len];

   return larger;
}


function create2DBuffer(gl, data) {

   var aBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
   //send the data  (could be STATIC_DRAW)
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STREAM_DRAW);
   return aBuffer;
}


function create2DShape(gl, draw_mode, vertices, colors, mat) {

   var vertexBuf = create2DBuffer(gl, vertices);

   // correcting for one color
   if (colors.length/COLORCOMP != vertices.length/VERTCOMP) {
      // console.log("let's do something");
      colors = extendArrayWithDuplicate(colors, vertices.length/VERTCOMP, COLORCOMP);
      // console.log(colors);
   }

   var colorBuf = create2DBuffer(gl, colors);


   // Setup properties for vertexAttribPointer (see drawShape)
   //https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
   var shape = {
      vertexBuffer: vertexBuf,
      vertComponent: VERTCOMP,
      nVerts:   vertices.length/VERTCOMP,
      drawMode: draw_mode,
      colorBuffer: colorBuf,
      colorComponent: COLORCOMP,
      // default values
      stride: 0,
      offset: 0,
      isNormalized: false,
      transform: mat,
   };
   return shape;
}


function drawShape(gl, aShape) {

   // console.log("WebGL Error: " + checkWebGLError(gl));
   // console.log("WebGL " + vertexAttributeLocation);
   // console.log("WebGL " + colorAttributeLocation);

   gl.uniformMatrix3fv(coordUniformLocation, false, aShape.transform.getMat3());


   gl.bindBuffer(gl.ARRAY_BUFFER, aShape.vertexBuffer);

   //tell the attribute how to get data out of vertexAttributeBuffer (ARRAY_BUFFER)
   gl.vertexAttribPointer(vertexAttributeLocation,  aShape.vertComponent,
                       gl.FLOAT, aShape.isNormalized, aShape.stride, aShape.offset);

   //set its color buffer
   gl.bindBuffer(gl.ARRAY_BUFFER, aShape.colorBuffer);

   gl.vertexAttribPointer(colorAttributeLocation,  aShape.colorComponent,
                       gl.FLOAT, aShape.isNormalized, aShape.stride, aShape.offset);

   //draw the object
   gl.drawArrays(aShape.drawMode, 0, aShape.nVerts);

}

/*----------------------- Current transform and transform stack --------------*/


// Current AffineTransform2D, initially the identity.
var transform = new AffineTransform2D();

// An array to serve as the transform stack.
var transformStack = [];

/**
 *  Push a copy of the current transform onto the transform stack.
 */
function pushTransform() {
    transformStack.push( new AffineTransform2D(transform) );
}

/**
 *  Remove the top item from the transform stack, and set it to be the current
 *  transform.  If the stack is empty, nothing is done (and no error is generated).
 */
function popTransform() {
    if (transformStack.length > 0) {
        transform = transformStack.pop();
    }
}

/*------------------------------------- BASIC SHAPES -----------------------------------------*/

// straight line starting at the origin with height 10
function straightLine(gl, colors, mat){
  let vertices = [0,0, 0,-10];
  return create2DShape(gl, gl.LINES, vertices, colors, mat);
}

// squares of size 10 with top left coordinate at the origin
function filledSquare(gl, colors, mat){
  let vertices = [0,0, 0,-10, 10,-10, 10,0];
  return create2DShape(gl, gl.TRIANGLE_FAN, vertices, colors, mat);
}

function openSquare(gl, colors, mat){
  let sq = filledSquare(gl, colors, mat);
  sq.drawMode = gl.LINE_LOOP;
  return sq;
}

// circles of diameter 10 centered at the origin
function circle(gl, colors, mat, filled){
  let vertices = [0,0];
  let center_x = 0;
  let center_y = 0;
  let numLines = 35;
  let radius = 5;
  for (let i = 0; i <= numLines; i++){
    vertices.push(
          center_x+radius*Math.cos(i*2*Math.PI/numLines),
          center_y+radius*Math.sin(i*2*Math.PI/numLines)
      );
  }
  let dm;
  if (filled) { dm = gl.TRIANGLE_FAN; }
  else {
    vertices = vertices.slice(2);
    dm = gl.LINE_LOOP;
  }
  return create2DShape(gl, dm, vertices, colors, mat);
}

// right triangle of height 10 with right angle at the origin
function filledTriangle(gl, colors, mat){
  let vertices = [0,0, 10,0, 0,10];
  return create2DShape(gl, gl.TRIANGLE_FAN, vertices, colors, mat);
}

// SLIGHTLY MORE COMPLICATED SHAPES

function taperedSquare(gl, colors, mat){
  let vertices = [0,-1.5, 0,-8.5, 10,-10, 10,0];
  return create2DShape(gl, gl.TRIANGLE_FAN, vertices, colors, mat);
}

function smallCurve(gl, colors, obj, outlined){
  // useful for bottom of window
  let control_polygon = [0,0, 0,0, 10,8, 20,8, 30,0];
  let curve_pts = getPointsOnBezierCurve(control_polygon, VERTCOMP, 28, true);
  pushTransform();
    obj.push(create2DShape(gl, gl.TRIANGLE_FAN, curve_pts, colors, transform.scale(1)));
    if (outlined){ obj.push(create2DShape(gl, gl.LINE_STRIP, curve_pts, PALETTE.darkgrey, transform.scale(1))); }
  popTransform();
}

function violinSquiggles(gl, obj){
  // let control_polygon = [ 0,0, 0,0, -10,10, -20,0, -20,-10,
  //                                   -10,-30, 10,-30, 20,-10,
  //                                    25,0, 35,0, 40,-10,
  //                                    37,-15, 33,-20, 30,-15,
  //
  //                                    32,-20, 38,-22, 40,-20,
  //                                    45,-20, 50,-15, 50,-10,
  //                                    40,10, 20,10, 10,-10,
  //                                    5,-20, -5,-20, -10,-10,
  //                                    -7,-5, -3,0, 0,0 ];

  let elements = [];
  // top
  let s1 = [-10,0, -10,-8, -7,-5, -3,0, 0,-5, -2,0, -8,0, -10,0, -15,0, -20,-5, -20,-10];
  elements.push(getPointsOnBezierCurve(s1, VERTCOMP, 28, true).concat(-20,-10,-10,-10));
  // middle top
  let s2 = getPointsOnBezierCurve([0,-25, -20,-10, -10,-30, 10,-30, 20,-10], VERTCOMP, 28, true);
    s2 = s2.concat(20,-10, 10,-10);
    s2 = s2.concat(getPointsOnBezierCurve([0,-25, 10,-10, 5,-20, -5,-20, -10,-10], VERTCOMP, 28, true));
    s2 = s2.concat(-10,-10, -20,-10);
  elements.push(s2);

  // middle bottom
  let s3 = getPointsOnBezierCurve([30,5, 20,-10, 25,0, 35,0, 40,-10], VERTCOMP, 28, true);
    s3 = s3.concat(40,-10, 50,-10);
    s3 = s3.concat(getPointsOnBezierCurve([50,-10, 50,-10, 40,10, 20,10, 10,-10], VERTCOMP, 28, true));
    s3 = s3.concat(10,-10, 20,-10);
  elements.push(s3);

  // bottom
  let s4 = [40,-15, 40,-10, 37,-15, 33,-20, 30,-15, 32,-20, 38,-22, 40,-20, 45,-20, 50,-15, 50,-10];
  elements.push(getPointsOnBezierCurve(s4, VERTCOMP, 28, true).concat(50,-10, 40,-10));

  pushTransform();
    for (let i = 0; i < elements.length; i++){
      obj.push(create2DShape(gl, gl.TRIANGLE_FAN, elements[i], PALETTE.black, transform.scale(1)));
    }
  popTransform();
}

function leaf(gl, obj, color){
  let verts = [0,0, -30,0, -10,8, 10,8, 30,0,
                            10,-8, -10,-8, -30,0];

  let curve_pts = getPointsOnBezierCurve(verts, VERTCOMP, 28, true);
  pushTransform();
    obj.push(create2DShape(gl, gl.TRIANGLE_FAN, curve_pts, color, transform.scale(1)));
  popTransform();
}

function violinScroll(gl, obj){
  pushTransform();
    transform.rotate(radians(-10));
    obj.push(circle(gl, PALETTE.violinbody, transform.scale(1,2), true));
  popTransform();

  let top_curve = getPointsOnBezierCurve([10,0, 0,0, 5,5, 15,10, 20,10], VERTCOMP, 28, true);

  let bottom_curve = getPointsOnBezierCurve([20,0, 15,0, 5,-5, 0,-10], 0, 28, false);

  let total_shape = top_curve.concat(20,10, 20,0).concat(bottom_curve).concat(0,-10, 0,0);

  pushTransform();
    obj.push(create2DShape(gl, gl.TRIANGLE_FAN, total_shape, PALETTE.violinbody, transform.scale(1)));
  popTransform();
}

function bean(gl, obj, color){
  // for clouds, texture of cabinet thing
  let control_polygon = [0,-20, 0,0, -10,-10, -10,-30, 0,-40,
                                      5,-45, 15,-45, 20,-40,
                                      10,-30, 10,-10, 20,0,
                                      15,5, 5,5, 0,0];
  let curve_pts = getPointsOnBezierCurve(control_polygon, VERTCOMP, 28, true);
  pushTransform();
    obj.push(create2DShape(gl, gl.TRIANGLE_FAN, curve_pts, color, transform.scale(1)));
  popTransform();
}

function moon(gl, obj){
  let control_polygon = [20,-20, 0,0, 12,-10, 12,-30, 0,-40,
                                      28,-35, 28,-5, 0,0];
  let curve_pts = getPointsOnBezierCurve(control_polygon, VERTCOMP, 28, true);
  pushTransform();
    obj.push(create2DShape(gl, gl.TRIANGLE_FAN, curve_pts, PALETTE.white, transform.scale(1)));
  popTransform();
}

/*------------------------------- TEXTURES ------------------------------------*/
function crackedPainting(gl, obj, numIterationsX, numIterationsY){
  for (let i = 0; i < numIterationsX; i++){
    let rx = -265 + Math.floor((Math.random() * 560));
    let ry = -135 - Math.floor((Math.random() * 320));
    let scale = 5 * Math.floor((Math.random() * 5));
    pushTransform();
      transform.translate(rx, ry);
      transform.rotate(radians(90));
      obj.push(straightLine(gl, adjustAlpha(PALETTE.tan,0.1), transform.scale(scale)));
    popTransform();
  }

  for (let i = 0; i < numIterationsY; i++){
    let rx = -265 + Math.floor((Math.random() * 560));
    let ry = -135 - Math.floor((Math.random() * 100));
    let scale = 5 * Math.floor((Math.random() * 10));
    pushTransform();
      transform.translate(rx, ry);
      obj.push(straightLine(gl, adjustAlpha(PALETTE.tan,0.05), transform.scale(scale)));
    popTransform();
  }
}

function randomLineTexture(gl, obj, color, numIterations, square, xscale, yscale){
  for (let i = 0; i < numIterations; i++){
    let rx;
    if (square) { rx = Math.floor((Math.random() * (xscale*10-10))); }
    else { rx = Math.floor((Math.random() * (xscale*10))); }
    pushTransform();
      transform.translate(rx, 0);
      if (square) { obj.push(filledSquare(gl, color, transform.scale(1,yscale))); }
      else { obj.push(straightLine(gl, color, transform.scale(yscale))); }
    popTransform();
  }
}

function randomCircleTexture(gl, obj, color, numIterations, radius, width, height){
  for (let i = 0; i < numIterations; i++){
    let rx = radius/2 + Math.floor((Math.random() * (width-radius)));
    let ry = radius/2 + Math.floor((Math.random() * (height-radius)));
    pushTransform();
      transform.translate(rx, -ry);
      obj.push(circle(gl, color, transform.scale(radius/10), true));
    popTransform();
  }
}

function randomBeanTexture(gl, obj, color, numIterations, scale, width, height){
  for (let i = 0; i < numIterations; i++){
    let rx = Math.floor((Math.random() * (width-20*scale)) + 2);
    let ry = Math.floor((Math.random() * (height-45*scale)) + 2);
    pushTransform();
      transform.translate(rx, -ry);
      transform.scale(scale);
      bean(gl, obj, color);
    popTransform();
  }
}

function clouds(gl, obj, color, numIterations, width){
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < numIterations; i++){
    pushTransform();
      transform.translate(dx,dy);
      transform.rotate(radians(35));
      transform.scale(0.36);
      bean(gl, obj, color);
    popTransform();
    dx += width/numIterations;
    dy += 1;
  }
}

/*------------------------------------- PUSHING TRANSFORMS -----------------------------------------*/


function leftWindow(gl, obj){
  // large outline
  pushTransform();
    transform.translate(-185,345);
    obj.push(openSquare(gl, PALETTE.tan, transform.scale(13,26)));
  popTransform();

  // smaller outline
  pushTransform();
    transform.translate(-165,315);
    obj.push(openSquare(gl, PALETTE.tan, transform.scale(9,20)));
  popTransform();

  // shades
  let shadeY = 305
  for (let i = 0; i < 8; i++){
    pushTransform();
      transform.translate(-155,shadeY);
      obj.push(filledSquare(gl, PALETTE.tan, transform.scale(7,1)));
    popTransform();
    shadeY -= 20;
  }

  // larger shade
  pushTransform();
    transform.translate(-155,145);
    obj.push(filledSquare(gl, PALETTE.tan, transform.scale(7,2)));
  popTransform();

}


function rightWindow(gl, obj, day){
  // background
  let sky_color;
  if (day){ sky_color = PALETTE.bluesky; }
  else{ sky_color = PALETTE.black; }

  pushTransform();
    transform.translate(-35,315);
    obj.push(filledSquare(gl, sky_color, transform.scale(10,23)));
  popTransform();

  if (day){
    let dy = 155;
    for (let i = 0; i < 4; i++){
      pushTransform();
        transform.translate(-35,dy);
        clouds(gl, obj, adjustAlpha(PALETTE.darkbrown,0.25), 18, 100);
      popTransform();
      dy += 30;
    }
  }

  else{
    for (let i = 0; i < 4; i++){
      pushTransform();
        transform.translate(-35,315);
        randomCircleTexture(gl, obj, PALETTE.white, 40, 3, 100, 230);
      popTransform();
    }

    pushTransform();
    transform.translate(28, 225);
    transform.scale(1.2);
    transform.rotate(radians(-10));
    moon(gl, obj);
    popTransform();
  }
  // right side
  pushTransform();
    transform.translate(55,315);
    obj.push(filledSquare(gl, PALETTE.lightgrey, transform.scale(1,23)));
  popTransform();

  // shudders
  pushTransform();
    let rightShudderVerts = [ -35,315, 60,315, 5,175, -35,175 ];
    let m = transform.scale(1);
    obj.push(create2DShape(gl, gl.TRIANGLE_FAN, rightShudderVerts, PALETTE.tan, m));
    obj.push(create2DShape(gl, gl.LINE_LOOP, rightShudderVerts, PALETTE.darkbrown, m));
  popTransform();

  let shadeY = 295;
  let width = 7.5;
  for (let i = 0; i < 5; i++){
    pushTransform();
      transform.translate(-35, shadeY)
      obj.push(filledSquare(gl, sky_color, transform.scale(width, 1)));
      obj.push(openSquare(gl, PALETTE.darkbrown, transform.scale(1)));
    popTransform();
    shadeY -= 22;
    width -= .8;
  }

  pushTransform();
    transform.translate(40, 295);
    transform.rotate(radians(-21));
    obj.push(filledSquare(gl, PALETTE.tan, transform.scale(1,12)));
  popTransform();

  let edgeX = 40;
  let edgeY = 295;
    for (let i = 0; i < 5; i++){
      pushTransform();
        transform.translate(edgeX,edgeY);
        obj.push(straightLine(gl, PALETTE.darkbrown, transform.rotate(radians(-21))));
      popTransform();
      edgeX -= 8.4;
      edgeY -= 22;
    }

    // land
    let sand = [ -35,125, -35,85, 55,85, 55,145 ];
    pushTransform();
      obj.push(create2DShape(gl, gl.TRIANGLE_FAN, sand, PALETTE.tan, transform.scale(1)));
    popTransform();

    pushTransform();
      transform.translate(-35,135);
      transform.yshear(.2);
      obj.push(filledSquare(gl, PALETTE.babyblue, transform.scale(9,1)));
    popTransform();

    pushTransform();
      transform.translate(-35,125);
      transform.rotate(radians(102));
      obj.push(straightLine(gl, PALETTE.black, transform.scale(9.2)));
    popTransform();
}


function plantOrig(gl, obj){
  let dxo = -2;
  let dyo = 2;
  let rotationo = 90;
  for (let i = 0; i < 5; i++){
    pushTransform();
      transform.translate(dxo,dyo);
      transform.rotate(radians(rotationo));
      transform.scale(1.05);
      leaf(gl, obj, adjustAlpha(PALETTE.mustard,0.7));
    popTransform();
    dxo += 10;
    dyo-=2;
    rotationo -= 15;
  }

  let dx = -40;
  let dy = -8;
  let rotation = 150;
  for (let i = 0; i < 9; i++){
    pushTransform();
      transform.translate(dx,dy);
      transform.rotate(radians(rotation));
      leaf(gl, obj, adjustAlpha(PALETTE.green,0.9));
    popTransform();
    dx += 10;
    if (i < 4){ dy+=2; }
    else { dy-=2; }
    rotation -= 15;
  }

}

function plant(gl, obj){
  pushTransform();
    transform.translate(15,105);
    transform.scale(1,1.8);
    transform.rotate(radians(10));
    plantOrig(gl, obj);
  popTransform();

  pushTransform();
    transform.translate(-65,155);
    obj.push(filledSquare(gl, PALETTE.darkbrown, transform.scale(3,9)));
  popTransform();

  pushTransform();
    transform.translate(-50,85);
    obj.push(filledSquare(gl, PALETTE.darkbrown, transform.scale(12,5)));
  popTransform();

  pushTransform();
    transform.translate(65,155);
    obj.push(filledSquare(gl, PALETTE.darkbrown, transform.scale(3,9)));
  popTransform();

  pushTransform();
    transform.translate(55,285);
    obj.push(filledSquare(gl, PALETTE.lightgrey, transform.scale(1,20)));
  popTransform();
}


function cabinetBelowWindow(gl, obj){
  // cabinet lines
  pushTransform();
    transform.translate(-165,55);
    transform.rotate(radians(90));
    obj.push(straightLine(gl, PALETTE.ashbrown, transform.scale(32)));
  popTransform();

  pushTransform();
    transform.translate(-165,35);
    transform.rotate(radians(90));
    obj.push(straightLine(gl, PALETTE.ashbrown, transform.scale(33)));
  popTransform();

  pushTransform();
    transform.translate(-185,55);
    obj.push(filledSquare(gl, adjustAlpha(PALETTE.ashbrown, 0.5), transform.scale(2,6)))
  popTransform();

  pushTransform();
    transform.translate(-185,85);
    transform.yshear(-1.5);
    obj.push(filledSquare(gl, PALETTE.ashbrown, transform.scale(2,6)));
  popTransform();

}


function detailBehindCube(gl, obj){
  // weird reflection thing next to box
  pushTransform();
    transform.translate(-50,-105);
    obj.push(filledSquare(gl, PALETTE.navygrey, transform.scale(15,2)));
  popTransform();

  pushTransform();
    transform.translate(-20,-105);
    obj.push(filledSquare(gl, adjustAlpha(PALETTE.chestnut,0.8), transform.scale(7,2)));
  popTransform();

  pushTransform();
    transform.translate(-7.5,-105);
    obj.push(filledSquare(gl, adjustAlpha(PALETTE.burntorange,0.2), transform.scale(4.5,2)));
  popTransform();

  pushTransform();
    transform.translate(-25,-98);
    obj.push(taperedSquare(gl, adjustAlpha(PALETTE.white,0.15), transform.scale(6,2.8)))
  popTransform();

  pushTransform();
    transform.translate(-5,-105);
    obj.push(filledSquare(gl, adjustAlpha(PALETTE.mustard,0.6), transform.scale(4,2)));
  popTransform();

  pushTransform();
    transform.translate(5,-105);
    obj.push(filledSquare(gl, PALETTE.mustard, transform.scale(2)));
  popTransform();
}


function openWindowBackground(gl, obj){
  // background
  pushTransform();
    transform.translate(95,375);
    transform.yshear(-.5);
    obj.push(filledSquare(gl, PALETTE.tan, transform.scale(6,29)));
  popTransform();

  // pushTransform();
  //   transform.translate(155,345);
  //   obj.push(filledSquare(gl, PALETTE.tan, transform.scale(8,29)));
  // popTransform();

  pushTransform();
    obj.push(create2DGradientShape(gl,
              //geo
             [  155,   235.0,    //minx, maxx
               55.0,  345.0 ],  //miny, maxy
             PALETTE.tan, adjustAlpha(PALETTE.offwhite,0.15),
             true,    // isHorizontal
             false,    // isHSL
             transform.scale(1)));
  popTransform();

  // blue rectangle
  // pushTransform();
  //   transform.translate(155,105);
  //   obj.push(filledSquare(gl, PALETTE.white, transform.scale(6,17)));
  // popTransform();

  pushTransform();
    transform.translate(155,105);
    obj.push(create2DGradientShape(gl,
              //geo
             [  0,   60.0,    //minx, maxx
               -170.0,  0.0 ],  //miny, maxy
             PALETTE.babyblue, PALETTE.lightestblue,
             false,    // isHorizontal
             false,    // isHSL
             transform.scale(1)));
  popTransform();
}


function openWindowOrig(gl, obj){
  pushTransform();
    transform.translate(20,0);
    obj.push(filledSquare(gl, adjustAlpha(PALETTE.white,0.5), transform.scale(6,28)));
  popTransform();

  // window texture
  pushTransform();
    transform.translate(20,0);
    randomLineTexture(gl, obj, adjustAlpha(PALETTE.bluesky,0.15), 3, true, 6, 28);
    randomLineTexture(gl, obj, adjustAlpha(PALETTE.white,0.25), 20, true, 6, 28);
    randomLineTexture(gl, obj, adjustAlpha(PALETTE.ashbrown,0.3), 3, false, 6, 28);
  popTransform();

  // frame
  pushTransform();
    transform.translate(-10,-270);
    transform.rotate(radians(45));
    transform.scale(1.3);
    smallCurve(gl, PALETTE.lightgrey, obj, true);
  popTransform();

  pushTransform();
    obj.push(filledSquare(gl, PALETTE.lightgrey, transform.scale(2,25)));
    obj.push(straightLine(gl, PALETTE.darkgrey, transform.scale(1)));
  popTransform();

  pushTransform();
    transform.translate(80,0);
    obj.push(filledSquare(gl, PALETTE.lightgrey, transform.scale(2,29)));
    obj.push(straightLine(gl, PALETTE.darkgrey, transform.scale(1)));
  popTransform();

  pushTransform();
    transform.translate(20,-50);
    obj.push(filledSquare(gl, PALETTE.lightgrey, transform.scale(6.5,2)));
  popTransform();

  // lining frame
  pushTransform();
    transform.translate(100,0);
    obj.push(straightLine(gl, PALETTE.black, transform.scale(29)));
  popTransform();

  pushTransform();
    transform.translate(20,-70);
    obj.push(straightLine(gl, PALETTE.black, transform.scale(20)));
  popTransform();

  pushTransform();
    transform.translate(20,-250);
    transform.rotate(radians(90));
    transform.xshear(.45);
    obj.push(straightLine(gl, PALETTE.darkbrown, transform.scale(6)));
  popTransform();

  pushTransform();
    transform.translate(-10,-270);
    transform.rotate(radians(66));
    obj.push(filledSquare(gl, PALETTE.lightgrey, transform.scale(3,9)));
  popTransform();

  pushTransform();
    transform.translate(100,-307);
    transform.rotate(radians(90));
    obj.push(filledTriangle(gl, PALETTE.darkgrey, transform.scale(2.8)));
  popTransform();

  pushTransform();
    transform.translate(73,-307);
    transform.rotate(radians(45));
    transform.scale(1.3);
    smallCurve(gl, PALETTE.darkgrey, obj);
  popTransform();

  pushTransform();
    transform.translate(-10,-270);
    transform.rotate(radians(66));
    obj.push(straightLine(gl, PALETTE.darkbrown, transform.scale(9)));
  popTransform();

}

function openWindow(gl, obj){
  pushTransform();
    transform.translate(115,345);
    openWindowOrig(gl, obj);
  popTransform();
}


function sceneLeft(gl, obj){
  pushTransform();
    transform.translate(-220,315);
    transform.yshear(1);
    obj.push(filledSquare(gl, adjustAlpha(PALETTE.tan,0.8), transform.scale(2.5,26)));
  popTransform();

  pushTransform();
    transform.translate(-210,155);
    transform.yshear(1);
    obj.push(filledSquare(gl, adjustAlpha(PALETTE.babyblue,0.75), transform.scale(1.5,22)));
  popTransform();

  pushTransform();
    transform.translate(-185,40);
    transform.rotate(radians(90));
    obj.push(filledTriangle(gl, PALETTE.green, transform.scale(40,0.8)));
  popTransform();

  pushTransform();
    transform.translate(-192,345);
    transform.rotate(radians(-90));
    obj.push(filledTriangle(gl, adjustAlpha(PALETTE.tan,0.9), transform.scale(30,0.8)));
  popTransform();

  pushTransform();
    transform.translate(-193,85);
    transform.rotate(radians(-84.5));
    obj.push(filledTriangle(gl, adjustAlpha(PALETTE.tan,0.5), transform.scale(7.5,0.9)));
  popTransform();
}


function leftCurtainsOrig(gl, obj){
  pushTransform();
    transform.rotate(radians(-20));
    obj.push(filledSquare(gl, PALETTE.beige, transform.scale(8,22)));
  popTransform();

  pushTransform();
    transform.rotate(radians(-20));
    randomLineTexture(gl, obj, adjustAlpha(PALETTE.white,0.4), 5, true, 8, 22);
    randomLineTexture(gl, obj, adjustAlpha(PALETTE.babyblue,0.2), 5, true, 8, 22);
    randomLineTexture(gl, obj, adjustAlpha(PALETTE.lightgrey,0.25), 15, true, 8, 22);
  popTransform();

  pushTransform();
    transform.rotate(radians(6));
    transform.translate(-65,-260);
    obj.push(filledSquare(gl, PALETTE.darkgrey, transform.scale(4,24)));
  popTransform();

  pushTransform();
    transform.rotate(radians(6));
    transform.translate(-65,-260);
    randomCircleTexture(gl, obj, adjustAlpha(PALETTE.lightgrey,0.1), 50, 20, 40, 240);
  popTransform();
}

function leftCurtains(gl, obj){
  pushTransform();
    transform.translate(-265,375);
    leftCurtainsOrig(gl, obj);
  popTransform();
}


function rightCurtainsOrig(gl, obj){

  pushTransform();
    transform.rotate(radians(32));
    obj.push(create2DGradientShape(gl,
              //geo
             [  0,   70.0,    //minx, maxx
               -200.0,  0.0 ],  //miny, maxy
             PALETTE.lightgrey, PALETTE.beige,
             true,    // isHorizontal
             false,    // isHSL
             transform.scale(1)));
  popTransform();

  pushTransform();
    transform.rotate(radians(32));
    obj.push(straightLine(gl, PALETTE.darkbrown, transform.scale(7,20)));
  popTransform();

  pushTransform();
    transform.rotate(radians(32));
    randomLineTexture(gl, obj, adjustAlpha(PALETTE.babyblue,0.15), 5, true, 7, 20);
    randomLineTexture(gl, obj, adjustAlpha(PALETTE.tan,0.25), 10, true, 7, 20);
  popTransform();

  pushTransform();
    transform.translate(55,-90);
    obj.push(filledSquare(gl, PALETTE.lightgrey, transform.scale(2,30)));
  popTransform();

  pushTransform();
    transform.translate(55,-90);
    randomLineTexture(gl, obj, adjustAlpha(PALETTE.darkgrey,0.25), 5, true, 2, 30);
    randomLineTexture(gl, obj, adjustAlpha(PALETTE.babyblue,0.15), 3, true, 2, 30);
    randomLineTexture(gl, obj, adjustAlpha(PALETTE.tan,0.25), 3, true, 2, 30);
  popTransform();

  pushTransform();
    transform.translate(55,-90);
    obj.push(filledSquare(gl, PALETTE.ashbrown, transform.scale(2)));
  popTransform();
}

function rightCurtains(gl, obj){
  pushTransform();
    transform.translate(195,345);
    rightCurtainsOrig(gl, obj);
  popTransform();
}


function box(gl, obj){
  // brown box
  pushTransform();
    transform.translate(-20,10);
    transform.yshear(-0.5);
    obj.push(filledSquare(gl, PALETTE.darkchestnut, transform.scale(2,10)));
  popTransform();

  pushTransform();
    transform.translate(-20,10);
    transform.xshear(-2);
    obj.push(filledSquare(gl, PALETTE.darkchestnut, transform.scale(10,1)));
  popTransform();

  pushTransform();
    obj.push(create2DGradientShape(gl,
              //geo
             [  0,   100.0,    //minx, maxx
               -100.0,  0.0 ],  //miny, maxy
             PALETTE.chestnut, adjustAlpha(PALETTE.chestnut,0.02),
             false,    // isHorizontal
             false,    // isHSL
             transform.scale(1)));
  popTransform();

  pushTransform();
    // obj.push(filledSquare(gl, PALETTE.chestnut, transform.scale(10)));
    obj.push(openSquare(gl, adjustAlpha(PALETTE.black,0.5), transform.scale(10)));
  popTransform();

  pushTransform();
    randomLineTexture(gl, obj, adjustAlpha(PALETTE.black,0.05), 15, true, 10, 10);
  popTransform();
}

function brownBox(gl, obj){
  pushTransform();
    transform.translate(85,-25);
    transform.rotate(radians(-5));
    box(gl, obj);
  popTransform();
}


function dresser(gl, obj){

  pushTransform();
    transform.translate(195,-305);
    obj.push(filledSquare(gl, PALETTE.burntorange, transform.scale(2,5)));
    obj.push(openSquare(gl, PALETTE.black, transform.scale(1)));
  popTransform();

  pushTransform();
    transform.translate(195,-305);
    randomLineTexture(gl, obj, adjustAlpha(PALETTE.black,0.2), 10, false, 2, 5);
  popTransform();

  pushTransform();
    transform.translate(155,-125);
    transform.rotate(radians(8));
    transform.yshear(3);
    obj.push(create2DGradientShape(gl,
              //geo
             [  0,   35.0,    //minx, maxx
               -180.0,  0.0 ],  //miny, maxy
             PALETTE.burntorange, PALETTE.darkerorange,
             false,    // isHorizontal
             false,    // isHSL
             transform.scale(1)));
  popTransform();

  pushTransform();
    transform.translate(155,-125);
    transform.rotate(radians(8));
    transform.yshear(3);
    // obj.push(filledSquare(gl, PALETTE.darkerorange, transform.scale(3.5,18)));
    obj.push(openSquare(gl, PALETTE.black, transform.scale(3.5,18)));
  popTransform();

  pushTransform();
    transform.translate(175,-15);
    transform.rotate(radians(6));
    obj.push(filledSquare(gl, PALETTE.burntorange, transform.scale(20)));
    obj.push(openSquare(gl, PALETTE.black, transform.scale(1)));
  popTransform();

  pushTransform();
    transform.translate(175,-15);
    transform.rotate(radians(6));
    randomBeanTexture(gl, obj, adjustAlpha(PALETTE.mustard,0.25), 8, 0.8, 100, 200);
  popTransform();

  pushTransform();
    transform.translate(195,-205);
    transform.xshear(0.15);
    obj.push(filledSquare(gl, PALETTE.burntorange, transform.scale(10)));
    obj.push(openSquare(gl, PALETTE.black, transform.scale(1)));
  popTransform();

  pushTransform();
    transform.translate(195,-205);
    randomBeanTexture(gl, obj, adjustAlpha(PALETTE.mustard,0.25), 8, 0.8, 100, 100);
  popTransform();

  pushTransform();
    transform.translate(245,-85);
    obj.push(circle(gl, PALETTE.mustard, transform.scale(9), true));
    obj.push(circle(gl, PALETTE.black, transform.scale(1), false));
  popTransform();

}


function behindCaseOrig(gl, obj){
  // main box
  pushTransform();
    obj.push(filledSquare(gl, PALETTE.beige, transform.scale(12, 8)));
  popTransform();

  // cross pattern
  let patterncolor = PALETTE.offwhite;
  pushTransform();
    transform.translate(10,-10);
    obj.push(filledSquare(gl, patterncolor, transform.scale(10, 6)))
  popTransform();

  pushTransform();
    transform.translate(0,-30);
    obj.push(filledSquare(gl, patterncolor, transform.scale(12, 2)));
  popTransform();

  pushTransform();
    transform.translate(30,0);
    obj.push(filledSquare(gl, patterncolor, transform.scale(6, 8)));
  popTransform();

  // side
  pushTransform();
    transform.translate(-20,-10);
    transform.yshear(0.5);
    obj.push(filledSquare(gl, PALETTE.darkchestnut, transform.scale(2,8)));
  popTransform();
}

function boxBehindCase(gl, obj){
  pushTransform();
    transform.translate(-215,-25);
    transform.scale(1.2);
    transform.rotate(radians(8));
    behindCaseOrig(gl, obj);
  popTransform();
}


function cabinetBelowCaseOrig(gl, obj){
  // main geometry
  pushTransform();
    obj.push(filledSquare(gl, PALETTE.beige, transform.scale(12,14)));
  popTransform();

  pushTransform();
    transform.translate(-40,0);
    obj.push(filledSquare(gl, PALETTE.beige, transform.scale(4,6)));
  popTransform();

  let left_shape = getPointsOnBezierCurve([0,-60, -40,-60, -20,-70, 0,-100, 0,-120], VERTCOMP, 28, true);
  pushTransform();
    obj.push(create2DShape(gl, gl.TRIANGLE_FAN, left_shape, PALETTE.beige, transform.scale(1)));
  popTransform();

  let right_shape = getPointsOnBezierCurve([120,0, 120,-60, 120,-40, 135,0, 150,0], VERTCOMP, 28, true);
  pushTransform();
    obj.push(create2DShape(gl, gl.TRIANGLE_FAN, right_shape, PALETTE.beige, transform.scale(1)));
  popTransform();

  // line details
  pushTransform();
    transform.translate(0,-120);
    transform.yshear(0.1);
    obj.push(filledSquare(gl, adjustAlpha(PALETTE.darkbrown, 0.75), transform.scale(12,0.5)));
  popTransform();

  let left_curve = getPointsOnBezierCurve([0,-120, 10,-100, 10,-20, 0,0], 0, 28, false);
  pushTransform();
    obj.push(create2DShape(gl, gl.LINE_STRIP, left_curve, PALETTE.darkbrown, transform.scale(1)));
  popTransform();

  let right_curve = getPointsOnBezierCurve([120,-60, 80,-40, 75,-20, 70,0], 0, 28, false);
  pushTransform();
    obj.push(create2DShape(gl, gl.LINE_STRIP, right_curve, PALETTE.darkbrown, transform.scale(1)));
  popTransform();

  // behind the violin part
  pushTransform();
    transform.translate(-40,70);
    obj.push(filledSquare(gl, PALETTE.beige, transform.scale(14,7)));
  popTransform();

  // texture
  pushTransform();
    transform.translate(25,-15);
    transform.rotate(radians(10));
    obj.push(circle(gl, adjustAlpha(PALETTE.darkbrown,0.2), transform.scale(16,10), true));
  popTransform();

  pushTransform();
    transform.translate(20,10);
    transform.rotate(radians(10));
    obj.push(filledSquare(gl, adjustAlpha(PALETTE.violinbody,0.5), transform.scale(5,7)));
  popTransform();

  pushTransform();
    transform.translate(-50,10);
    transform.rotate(radians(5));
    randomLineTexture(gl, obj, adjustAlpha(PALETTE.darkbrown,0.1), 20, true, 15, 9);
  popTransform();

  pushTransform();
    transform.translate(-50,10);
    // transform.rotate(radians(5));
    randomLineTexture(gl, obj, adjustAlpha(PALETTE.darkbrown,0.1), 20, true, 20, 25);
  popTransform();

  pushTransform();
    transform.translate(30,10);
    transform.rotate(radians(10));
    randomLineTexture(gl, obj, adjustAlpha(PALETTE.violinbody,0.4), 5, true, 4.5, 7);
    randomLineTexture(gl, obj, adjustAlpha(PALETTE.violinbody,0.25), 5, true, 3, 9);
    randomLineTexture(gl, obj, adjustAlpha(PALETTE.darkbrown,0.2), 3, true, 4.5, 7);
  popTransform();

}

function cabinetBelowCase(gl, obj){
  pushTransform();
    transform.translate(-155,-190);
    transform.scale(1,1.1);
    cabinetBelowCaseOrig(gl, obj);
  popTransform();
}

// ----- VIOLIN -----
function violinMain(gl, obj, color, outline){
  let polygon_main =  [50,-30, 0,0, 10,8, 30,8, 40,0,
                                    46,-5, 54,-5, 60,0,
                                    70,8, 90,8, 100,0,

                                    110,-14, 110,-28, 100,-42,

                                    90,-50, 70,-50, 60,-42,
                                    54,-37, 46,-37, 40,-42,
                                    30,-50, 10,-50, 0,-42,

                                    -10,-28, -10,-14, 0,0

                                    ];

  let main_pts = getPointsOnBezierCurve(polygon_main, VERTCOMP, 28, true);

  pushTransform();
    obj.push(create2DShape(gl, gl.TRIANGLE_FAN, main_pts, color, transform.scale(1)));
  popTransform();

  // if (outline){
  //   pushTransform();
  //     obj.push(create2DShape(gl, gl.LINE_LOOP, main_pts.slice(2), PALETTE.black, transform.scale(1)));
  //   popTransform();
  // }
}

function violinCaseOrig(gl, obj, color){
  pushTransform();
    // violinMain(gl, obj, PALETTE.caseblue, true);
    violinMain(gl, obj, color, true);
  popTransform();

  pushTransform();
    transform.translate(-60,-6);
    obj.push(filledSquare(gl, color, transform.scale(7,3)));
    // obj.push(openSquare(gl, PALETTE.black, transform.scale(1)));
  popTransform();

  let polygon_neck = [ -59,-6, -60,-6, -80,-10, -80,-32, -59,-36 ];
  let neck_pts = getPointsOnBezierCurve(polygon_neck, VERTCOMP, 28, true);

  pushTransform();
    obj.push(create2DShape(gl, gl.TRIANGLE_FAN, neck_pts, color, transform.scale(1)));
    // obj.push(create2DShape(gl, gl.LINE_STRIP, neck_pts.slice(2), PALETTE.black, transform.scale(1)));
  popTransform();

  // eliminate neck outline bleeding into case
  // pushTransform();
  //   transform.translate(1,0);
  //   transform.scale(0.98);
  //   violinMain(gl, obj, PALETTE.caseblue, false);
  // popTransform();

}

function violinCase(gl, obj){

  // outline
  pushTransform();
    transform.translate(-175,-108);
    transform.rotate(radians(30));
    transform.scale(1.02);
    violinCaseOrig(gl, obj, PALETTE.black);
  popTransform();

  pushTransform();
  transform.translate(-155,-143);
  transform.rotate(radians(20));
  transform.scale(1.02);
  violinCaseOrig(gl, obj, PALETTE.black);
  popTransform();

  // main case
  pushTransform();
    transform.translate(-172,-109);
    transform.rotate(radians(30));
    transform.scale(0.97, 0.90);
    violinCaseOrig(gl, obj, PALETTE.caseblue);
  popTransform();

  pushTransform();
    transform.translate(-153,-146);
    transform.rotate(radians(20));
    transform.scale(0.97, 0.90);
    violinCaseOrig(gl, obj, PALETTE.caseblue);
  popTransform();
}

function violinOrig(gl, obj){
 pushTransform();
  violinMain(gl, obj, PALETTE.violinbody, false);
 popTransform();

 // top half of fret board
 pushTransform();
  transform.translate(-50,-15);
  transform.rotate(radians(3));
  obj.push(taperedSquare(gl, PALETTE.black, transform.scale(12,1.5)));
 popTransform();

 // bottom half
 pushTransform();
  transform.translate(106,-20);
  transform.rotate(radians(180));
  obj.push(taperedSquare(gl, PALETTE.black, transform.scale(1.8,1)));
 popTransform();

 pushTransform();
  transform.translate(78,-10);
  obj.push(filledSquare(gl, PALETTE.black, transform.scale(0.4,1.2)));
 popTransform();

 // strings
 let stringY = -12;
 for (let i = 0; i < 4; i++){
   pushTransform();
    transform.translate(60,stringY);
    transform.rotate(radians(93));
    obj.push(straightLine(gl, PALETTE.black, transform.scale(3)));
   popTransform();
   stringY -= 3;
 }

 // squiggly holes
 pushTransform();
  transform.translate(70,-28);
  transform.scale(0.35, 0.24);
  violinSquiggles(gl, obj);
 popTransform();

 pushTransform();
  transform.translate(68,-3);
  transform.scale(0.28,0.18);
  violinSquiggles(gl, obj);
 popTransform();

 // scroll
 pushTransform();
  transform.translate(-67,-27.4);
  transform.scale(1.08);
  violinScroll(gl, obj);
 popTransform();
}

function violin(gl, obj){
   // main body
   pushTransform();
    transform.translate(-145,-145);
    transform.rotate(radians(20.5));
    transform.scale(0.9);
    violinOrig(gl, obj);
   popTransform();
 }

function blackCaseBottom(gl, obj){
  pushTransform();
    transform.translate(-215,-194);
    transform.rotate(radians(15));
    obj.push(taperedSquare(gl, PALETTE.black, transform.scale(18,2)));
  popTransform();

  pushTransform();
    transform.translate(-47.5,-160);
    transform.rotate(radians(-11));
    obj.push(filledTriangle(gl, PALETTE.black, transform.scale(1,2.5)));
  popTransform();

  pushTransform();
    transform.translate(-210,-210);
    transform.rotate(radians(25));
    obj.push(filledTriangle(gl, PALETTE.black, transform.scale(1,2)));
  popTransform();
}

function violinInCase(gl, obj){
  pushTransform();
    transform.translate(60,20);
    transform.rotate(radians(-5));
    transform.scale(1.28);
    violinCase(gl, obj);
    violin(gl, obj);
    blackCaseBottom(gl, obj);
  popTransform();
}

function nightMode(gl, obj){
  pushTransform();
    transform.translate(-265,345);
    obj.push(filledSquare(gl, adjustAlpha(PALETTE.black,0.2), transform.scale(56,69)));
  popTransform();
}

// ----------------------------------------------------------------------------------------

//
function makeScene(gl, day) {

   var obj = [];

   crackedPainting(gl, obj, 20, 50);
   rightWindow(gl, obj, day);
   plant(gl, obj);
   leftWindow(gl, obj);
   cabinetBelowWindow(gl, obj);
   sceneLeft(gl, obj);
   leftCurtains(gl, obj);
   detailBehindCube(gl, obj);
   brownBox(gl, obj);
   openWindowBackground(gl, obj);
   openWindow(gl, obj);
   rightCurtains(gl, obj);
   dresser(gl, obj);
   boxBehindCase(gl, obj);
   cabinetBelowCase(gl, obj);
   violinInCase(gl, obj);
   if (!day) { nightMode(gl, obj); }



   return obj;
}


function initScene(gl, day) {
   gl.clearColor(PALETTE.darkbrown[0], PALETTE.darkbrown[1], PALETTE.darkbrown[2], 1);
   gl.blendFuncSeparate( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA,
                             gl.ZERO, gl.ONE );
   gl.enable(gl.BLEND);
   return makeScene(gl, day);
}


function drawScene(gl, prog, shapes) {

   gl.clear(gl.COLOR_BUFFER_BIT);
   // gl.enable(gl.BLEND);

   //set shader to use
   gl.useProgram(prog);


   // as before but separate from model transform (check vertex shader program)
   var viewTrans = setViewportTransform( -265.0, 265.0, -345.0, 345.0, false, gl);
   gl.uniformMatrix3fv(viewUniformLocation, false, viewTrans);

   // console.log(shapes[0]);
   for (var i = 0; i < shapes.length; i++)
      drawShape(gl, shapes[i]);

   // console.log("any webGL error", checkWebGLError(gl));

}

// TODO: add a moon in the rightWindow
// TODO: line the little bezier curve in the bottom of the openWindow
