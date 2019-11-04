
/* A minimal implementation of affine transformations in 2D, supporting rotation,
   scaling, and translation.  An affine transform is represented as an object
   of type AffineTransform2D.  No error checking of parameter vaues is done! */

/**
 *  Create a 2D affine transform object representing the transform from (x,y)
 *  to ( a*x + c*y + e, b*x + d*y + e ).  If exaclty one parameter is passed
 *  and it is of type AffineTransform2D, then a copy is made of the paramter.
 *  Otherwise, parameters should be numeric.  Missing parameter values are
 *  taken from the identity transform.  If no parameters are passed, the
 *  result is the identity transform.
 */

function radians( degrees ) {
   return degrees * Math.PI / 180.0;
}


function AffineTransform2D() {

// console.log("THIS ONE");

   if (arguments.length == 0) {
       this.a = 1;
       this.b = 0;
       this.c = 0;
       this.d = 1;
       this.e = 0;
       this.f = 0;
   }
   else if (arguments.length == 1 && arguments[0] instanceof AffineTransform2D) {
       this.a = arguments[0].a;
       this.b = arguments[0].b;
       this.c = arguments[0].c;
       this.d = arguments[0].d;
       this.e = arguments[0].e;
       this.f = arguments[0].f;
   }
   else {
      var src = (arguments.length == 1 && arguments[0] instanceof Array) ?
                                          arguments[0] : arguments;
      this.a = src.length > 0 ? Number(src[0]) : 1;
      this.b = src.length > 1 ? Number(src[1]) : 0;
      this.c = src.length > 2 ? Number(src[2]) : 0;
      this.d = src.length > 3 ? Number(src[3]) : 1;
      this.e = src.length > 4 ? Number(src[4]) : 0;
      this.f = src.length > 5 ? Number(src[5]) : 0;
   }

   var stack = new Array();

   this.push = function() {
      stack.push( [this.a, this.b, this.c, this.d, this.e, this.f ]);
   }

   this.pop = function() {
      var x = stack.pop();
      this.a = x[0];
      this.b = x[1];
      this.c = x[2];
      this.d = x[3];
      this.e = x[4];
      this.f = x[5];
   }
}

/**
 *  Returns an array of 9 numbers representing this transform as a 3-by-3 matrix,
 *  in column-major order.
 */
AffineTransform2D.prototype.getMat3 = function() {
    return [
        this.a, this.b, 0,
        this.c, this.d, 0,
        this.e, this.f, 1
    ];
}




/**
 * Multiply this transform on the right by a rotation transform.  Angle is given in radians.
 * Replaces this transform with the modified transform, and returns the modified transform.
 */
AffineTransform2D.prototype.rotate = function(radians) {
    var sin = Math.sin(radians);
    var cos = Math.cos(radians);
    var temp = this.a*cos + this.c*sin;
    this.c = this.a*(-sin) + this.c*cos;
    this.a = temp;
    temp = this.b*cos + this.d*sin;
    this.d = this.b*(-sin) + this.d*cos;
    this.b = temp;
    return this;
}



AffineTransform2D.prototype.rotateAbout = function( /* Number */ x, /* Number */ y,
                                                    /* Number */ degrees ) {
   this.translate(x,y);
   this.rotate(degrees);
   this.translate(-x,-y);
   return this;
}

/**
 * Multiply this transform on the right by a translation transform.
 * Replaces this transform with the modified transform, and returns the modified transform.
 */
AffineTransform2D.prototype.translate = function(dx, dy) {
    this.e += this.a*dx + this.c*dy;
    this.f += this.b*dx + this.d*dy;
    return this;
}

/**
 * Multiply this transform on the right by a scaling transform. If only one parameter is
 * passed, does a uniform scaling.
 * Replaces this transform with the modified transform, and returns the modified transform.
 */
AffineTransform2D.prototype.scale = function(sx,sy) {
    if (sy === undefined) {
        sy = sx;
    }
    this.a *= sx;
    this.b *= sx;
    this.c *= sy;
    this.d *= sy;
    return this;
}

AffineTransform2D.prototype.scaleAbout = function( /* Number */ x, /* Number */ y,
                                    /* Number */ sx, /* optional Number */ sy) {
   this.translate(x,y);
   this.scale(sx,sy);
   this.translate(-x,-y);
   return this;
}


AffineTransform2D.prototype.xshear = function( /* Number */ shear) {
   this.c += this.a*shear;
   this.d += this.b*shear;
   return this;
}

AffineTransform2D.prototype.yshear = function( /* Number */ shear) {
   this.a += this.c*shear;
   this.b += this.d*shear;
   return this;
}

AffineTransform2D.prototype.times = function( /* AffineTransform2D */ that ) {
   var a = this.a*that.a + this.c*that.b;
   var b = this.b*that.a + this.d*that.b;
   var c = this.a*that.c + this.c*that.d;
   var d = this.b*that.c + this.d*that.d;
   var e = this.a*that.e + this.c*that.f + this.e;
   var f = this.b*that.e + this.d*that.f + this.f;

   this.a = a;
   this.b = b;
   this.c = c;
   this.d = d;
   this.e = e;
   this.f = f;
   return this;
}


AffineTransform2D.prototype.toString = function() {
   return "AffineTransform2D(" +
           this.a + "," + this.b + "," +
           this.c + "," + this.d + "," +
           this.e + "," + this.f + ")";
}
