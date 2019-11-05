# graphics_project2

**Piece Name:** *Intérieur au Violon*

**Artist:** *Henri Matisse*

**Year:** *1918*

**Description:**
* General
  * I had a set of colors within a single palette which encompassed all the colors in my image.
  * I created a set of basic shapes which would be transformed into different areas of the picture to create the geometry of the full image. These included:
    * Straight line
    * Square (filled, open)
    * Circle (filled, open)
    * Triangle (filled)
  * I also had a set of more complicated assorted shapes, which were normally for much more specific sections of the painting, which needed to be repeated but were more complex than basic geometry.
  * I separated the painting up into functions for each object (for example: left window, right window, violin case, violin, etc.) and called them when the code is initialized, in order of what should be furthest from the foreground to what should be in the foreground.

* What I am most proud of
  * My attention to detail. I put a lot of time and effort into making sure this project got as close to the picture as I felt I possibly could, as this assignment really sparked joy for me. I kept losing track of time because I was so immersed in coding it, and I feel that my result is a pretty good replication of the original painting within the context of this project.
  * I am very proud of the way the violin came out. It is entirely composed of bezier curves, which were an entirely new concept and can be a bit difficult to control at times. I was able to use this shape repeatedly for both the case and the violin itself.

* What I might like to rework
  * I would like to implement an animation from the day (original) mode to the night mode. I struggled with incorporating      animation in the context of having a random element. Animating the code as I have it would re-draw the entire scene each frame, and this creates a problem for randomly generated textures. A new random() is calculated each frame, and the textures I have would not be reasonable to have changing each frame.
  * I believe that my random textures may be able to be combined into one function which accepts different shapes or is more customizable; I just felt as though I already had too many parameters for each function, and combining them would only add more.
  * The S shape of the holes in the violin seems very inefficient, as it involved hard coding multiple segments, so I would like to rework this.

* References
  * I used the code from labs 6 and 7 as a base for my code
  * for bezier curves: 
    * https://webglfundamentals.org/webgl/lessons/webgl-3d-geometry-lathe.html
  * for randomness:
    * https://www.w3schools.com/js/js_random.asp
  * for color: 
    * https://www.rapidtables.com/web/color/RGB_Color.html
    * https://lodev.org/cgtutor/color.html
