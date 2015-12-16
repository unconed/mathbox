# Glossary

## DOM
* DOM - Document Object Model. In general, refers to the HTML on the page. In MathBox, refers to the virtual DOM of nodes and their hierarchical structure.
* Node - An instance of a primitive, inserted into the MathBox DOM.
* Primitive - One of the basic building blocks of MathBox.
* Prop or Property - An individual value set on a node. Collectively *props*.
* Selection - A subset of the DOM. Can be the entire DOM or all nodes matching a selector.

## Graphics
* RTT - Render To Texture. Rather than drawing directly to the screen, renders to an image that can be processed further.
* Shader - A program written in GLSL that runs on the GPU. GLSL syntax is similar to C++.
* ShaderGraph - A component/dependency of MathBox that dynamically compiles small GLSL functions (snippets) into a single shader.
* WebGL - JavaScript API for rendering 3D scenes, used by MathBox.

## Data
* `expr` - A prop on data primitives that expects a function, whose arguments are:
  * `emit` - Another function. When called, its arguments become data.
  * `x, y, z` - Up to three numbers indicating the location of the current point. Interval (1D), Area (2D), and Volume (3D) will evenly sample the current view for these coordinates. If you don't need them, use Array, Matrix, or Voxel, which omit these arguments.
  * `i, j, k` - One to three indices of the current point.
  * `t` - Time elapsed since program start, in seconds.
  * `d` - Time delta since last frame, in seconds.
* Width - The size of the data in the *x* direction, i.e. the number of rows. (For arrays, the term *length* is used, but this will likely be changed soon.)
* Height - The size of the data in the *y* direction, i.e. the number of columns.
* Depth - The size of the data in the *z* direction, i.e. the number of stacks.
* Items - The size of the data in the *w* direction, i.e. the number of data points per spatial location. The number of times `emit` is called in the `expr` function.
* Channels - How many numbers are associated with a data point. The number of arguments passed to `emit`. This is not an array dimension; it is how many numbers make up one array element.
* History - The process of storing previous 1D or 2D data in an unused dimension.