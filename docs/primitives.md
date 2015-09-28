### MathBox.Primitives

#### `data/area`

*2D area*
 * *axes* = [1, 2] (swizzle(2) axis) - Axis pair
 * *bufferHeight* = 1 (number) - Matrix buffer height
 * *bufferWidth* = 1 (number) - Matrix buffer width
 * *channels* = 4 (number) - Number of channels
 * *classes* = [] (string array) - Node classes
 * *data* = null (nullable object) - Data array
 * *expr* = null (nullable emitter) - Data emitter expression
 * *fps* = null (nullable number) - Frames-per-second update rate
 * *height* = 1 (nullable number) - Matrix height
 * *history* = 1 (number) - Matrix history
 * *hurry* = 5 (number) - Maximum frames to hurry per frame
 * *id* = null (nullable string) - Unique ID
 * *items* = 4 (number) - Number of items
 * *limit* = 60 (number) - Maximum frames to track
 * *live* = true (bool) - Update continuously
 * *magFilter* = "nearest" (filter) - Texture magnification filtering
 * *minFilter* = "nearest" (filter) - Texture minification filtering
 * *observe* = false (bool) - Pass clock time to data
 * *realtime* = false (bool) - Run on real time, not clock time
 * *type* = "float" (type) - Texture data type
 * *width* = 1 (nullable number) - Matrix width

#### `data/array`

*1D array*
 * *bufferLength* = 1 (number) - Array buffer length
 * *channels* = 4 (number) - Number of channels
 * *classes* = [] (string array) - Node classes
 * *data* = null (nullable object) - Data array
 * *expr* = null (nullable emitter) - Data emitter expression
 * *fps* = null (nullable number) - Frames-per-second update rate
 * *history* = 1 (number) - Array history
 * *hurry* = 5 (number) - Maximum frames to hurry per frame
 * *id* = null (nullable string) - Unique ID
 * *items* = 4 (number) - Number of items
 * *length* = 1 (nullable number) - Array length
 * *limit* = 60 (number) - Maximum frames to track
 * *live* = true (bool) - Update continuously
 * *magFilter* = "nearest" (filter) - Texture magnification filtering
 * *minFilter* = "nearest" (filter) - Texture minification filtering
 * *observe* = false (bool) - Pass clock time to data
 * *realtime* = false (bool) - Run on real time, not clock time
 * *type* = "float" (type) - Texture data type

#### `draw/axis`

*Axis*
 * *axis* = 1 (axis) - Axis
 * *blending* = "normal" (blending) - Blending mode ('no, normal, add, subtract, multiply)
 * *classes* = [] (string array) - Node classes
 * *closed* = false (bool) - Close line
 * *color* = "rgb(128, 128, 128)" (color) - Color
 * *crossed* = true (bool) - UVWO map on matching axis
 * *depth* = 1 (number) - Depth scaling
 * *detail* = 1 (number) - Geometric detail
 * *end* = true (bool) - Draw end arrow
 * *id* = null (nullable string) - Unique ID
 * *opacity* = 1 (positive number) - Opacity
 * *origin* = [0, 0, 0, 0] (vec4) - 4D Origin
 * *proximity* = null (nullable number) - Proximity threshold
 * *range* = [-1, 1] (vec2) - Range on axis
 * *size* = 3 (number) - Arrow size
 * *start* = true (bool) - Draw start arrow
 * *stroke* = solid (stroke) - Line stroke (solid, dotted, dashed)
 * *visible* = true (bool) - Visibility for rendering
 * *zBias* = 0 (positive number) - Z-Bias (3D stacking)
 * *zIndex* = 0 (positive int) - Z-Index (2D stacking)
 * *zOrder* = null (nullable number) - Z-Order (drawing order)
 * *zTest* = true (bool) - Test Z buffer
 * *zWrite* = true (bool) - Write Z buffer

#### `camera/camera`

*Camera interface*
 * *classes* = [] (string array) - Node classes
 * *eulerOrder* = "xyz" (swizzle) - 3D Euler order
 * *fov* = null (nullable number) - Field-of-view (degrees)
 * *id* = null (nullable string) - Unique ID
 * *lookAt* = null (nullable vec3) - 3D Look at
 * *position* = null (nullable vec3) - 3D Position
 * *proxy* = false (bool) - Re-use existing camera
 * *quaternion* = null (nullable quat) - 3D Quaternion
 * *rotation* = null (nullable vec3) - 3D Euler rotation
 * *up* = null (nullable vec3) - 3D Up

#### `view/cartesian`

*Cartesian*
 * *classes* = [] (string array) - Node classes
 * *eulerOrder* = xyz (swizzle) - Euler order
 * *id* = null (nullable string) - Unique ID
 * *pass* = view (vertexPass) - Vertex pass (data, view, world, eye)
 * *position* = [0, 0, 0] (vec3) - 3D Position
 * *quaternion* = [0, 0, 0, 1] (quat) - 3D Quaternion
 * *range* = [[-1, 1], [-1, 1], [-1, 1], [-1, 1]] (array vec2) - 4D range in view
 * *rotation* = [0, 0, 0] (vec3) - 3D Euler rotation
 * *scale* = 1,1,1 (vec3) - 3D Scale
 * *visible* = true (bool) - Visibility for rendering

#### `view/cartesian4`

*4D cartesian*
 * *classes* = [] (string array) - Node classes
 * *id* = null (nullable string) - Unique ID
 * *pass* = view (vertexPass) - Vertex pass (data, view, world, eye)
 * *position* = [0, 0, 0, 0] (vec4) - 4D Position
 * *range* = [[-1, 1], [-1, 1], [-1, 1], [-1, 1]] (array vec2) - 4D range in view
 * *scale* = [1, 1, 1, 1] (vec4) - 4D Scale
 * *visible* = true (bool) - Visibility for rendering

#### `time/clock`

*Relative clock*
 * *classes* = [] (string array) - Node classes
 * *delay* = 0 (number) - Play delay
 * *from* = 0 (number) - Play from
 * *id* = null (nullable string) - Unique ID
 * *loop* = false (bool) - Loop
 * *pace* = 1 (number) - Play pace
 * *realtime* = false (bool) - Run on real time, not clock time
 * *seek* = null (nullable number) - Seek to time
 * *speed* = 1 (number) - Play speed
 * *to* = Infinity (number) - Play until

#### `rtt/compose`

*Compose pass*
 * *alpha* = false (bool) - Compose with alpha
 * *blending* = "normal" (blending) - Blending mode ('no, normal, add, subtract, multiply)
 * *classes* = [] (string array) - Node classes
 * *color* = "rgb(128, 128, 128)" (color) - Color
 * *id* = null (nullable string) - Unique ID
 * *opacity* = 1 (positive number) - Opacity
 * *source* = "<" (select) - Input source
 * *visible* = true (bool) - Visibility for rendering
 * *zBias* = 0 (positive number) - Z-Bias (3D stacking)
 * *zIndex* = 0 (positive int) - Z-Index (2D stacking)
 * *zOrder* = null (nullable number) - Z-Order (drawing order)
 * *zTest* = true (bool) - Test Z buffer
 * *zWrite* = true (bool) - Write Z buffer

#### `overlay/dom`

*DOM injector*
 * *attributes* = null (nullable object) - HTML attributes
 * *classes* = [] (string array) - Node classes
 * *color* = "rgb(255, 255, 255)" (color) - Color
 * *depth* = 0 (number) - Depth scaling
 * *html* = "<" (select) - HTML data source
 * *id* = null (nullable string) - Unique ID
 * *offset* = [0, -20] (vec2) - 2D offset
 * *opacity* = undefined (1) - Opacity
 * *outline* = 2 (number) - Outline size
 * *pointerEvents* = false (bool) - Allow pointer events
 * *points* = "<" (select) - Points data source
 * *size* = 16 (number) - Text size
 * *snap* = false (bool) - Snap to pixel
 * *visible* = true (bool) - Visibility for rendering
 * *zIndex* = 0 (positive int) - Z-Index (2D stacking)
 * *zoom* = 1 (number) - HTML zoom

#### `draw/face`

*Polygon face*
 * *blending* = "normal" (blending) - Blending mode ('no, normal, add, subtract, multiply)
 * *classes* = [] (string array) - Node classes
 * *closed* = false (bool) - Close line
 * *color* = "rgb(128, 128, 128)" (color) - Color
 * *colors* = null (nullable select) - Colors data source
 * *depth* = 1 (number) - Depth scaling
 * *fill* = true (bool) - Fill mesh
 * *id* = null (nullable string) - Unique ID
 * *line* = false (bool) - Draw line
 * *map* = null (nullable select) - Texture map
 * *opacity* = 1 (positive number) - Opacity
 * *points* = < (select) - Points data source
 * *proximity* = null (nullable number) - Proximity threshold
 * *shaded* = false (bool) - Shade mesh
 * *size* = 2 (positive number) - Line width
 * *stroke* = solid (stroke) - Line stroke (solid, dotted, dashed)
 * *visible* = true (bool) - Visibility for rendering
 * *zBias* = 0 (positive number) - Z-Bias (3D stacking)
 * *zIndex* = 0 (positive int) - Z-Index (2D stacking)
 * *zOrder* = null (nullable number) - Z-Order (drawing order)
 * *zTest* = true (bool) - Test Z buffer
 * *zWrite* = true (bool) - Write Z buffer

#### `text/format`

*Source formatter*
 * *classes* = [] (string array) - Node classes
 * *data* = null (nullable array) - Array of labels
 * *detail* = 24 (number) - Font detail
 * *digits* = null (nullable positive number) - Digits of precision
 * *expand* = 5 (number) - SDF expansion
 * *expr* = null (nullable function) - Label formatter expression
 * *font* = sans-serif (font) - Font family
 * *id* = null (nullable string) - Unique ID
 * *live* = true (bool) - Update continuously
 * *magFilter* = "nearest" (filter) - Texture magnification filtering
 * *minFilter* = "nearest" (filter) - Texture minification filtering
 * *source* = "<" (select) - Input source
 * *style* =  (string) - Font style
 * *type* = "float" (type) - Texture data type
 * *variant* =  (string) - Font variant
 * *weight* =  (string) - Font weight

#### `transform/fragment`

*Fragment pass*
 * *classes* = [] (string array) - Node classes
 * *id* = null (nullable string) - Unique ID
 * *pass* = light (fragmentPass) - Fragment pass (color, light, rgba)
 * *shader* = "<" (select) - Shader to use

#### `draw/grid`

*2D line grid*
 * *axes* = [1, 2] (swizzle(2) axis) - Axis pair
 * *blending* = "normal" (blending) - Blending mode ('no, normal, add, subtract, multiply)
 * *classes* = [] (string array) - Node classes
 * *closed* = false (bool) - Close line
 * *closedX* = false (bool) - Close X lines
 * *closedY* = true (bool) - Close Y lines
 * *color* = "rgb(128, 128, 128)" (color) - Color
 * *crossed* = true (bool) - UVWO map on matching axis
 * *depth* = 1 (number) - Depth scaling
 * *id* = null (nullable string) - Unique ID
 * *lineX* = true (bool) - Draw X lines
 * *lineY* = true (bool) - Draw Y lines
 * *opacity* = 1 (positive number) - Opacity
 * *origin* = [0, 0, 0, 0] (vec4) - 4D Origin
 * *proximity* = null (nullable number) - Proximity threshold
 * *size* = 2 (positive number) - Line width
 * *stroke* = solid (stroke) - Line stroke (solid, dotted, dashed)
 * *visible* = true (bool) - Visibility for rendering
 * *zBias* = 0 (positive number) - Z-Bias (3D stacking)
 * *zIndex* = 0 (positive int) - Z-Index (2D stacking)
 * *zOrder* = null (nullable number) - Z-Order (drawing order)
 * *zTest* = true (bool) - Test Z buffer
 * *zWrite* = true (bool) - Write Z buffer

#### `base/group`

*Group*
 * *active* = true (bool) - Updates continuously
 * *classes* = [] (string array) - Node classes
 * *id* = null (nullable string) - Unique ID
 * *visible* = true (bool) - Visibility for rendering

#### `operator/grow`

*Grow data*
 * *classes* = [] (string array) - Node classes
 * *depth* = null (nullable anchor) - Depth alignment
 * *height* = null (nullable anchor) - Height alignment
 * *id* = null (nullable string) - Unique ID
 * *items* = null (nullable anchor) - Items alignment
 * *scale* = 1 (number) - Scale factor
 * *source* = "<" (select) - Input source
 * *width* = null (nullable anchor) - Width alignment

#### `overlay/html`

*HTML source*
 * *bufferDepth* = 1 (number) - Voxel buffer depth
 * *bufferHeight* = 1 (number) - Voxel buffer height
 * *bufferWidth* = 1 (number) - Voxel buffer width
 * *channels* = 4 (number) - Number of channels
 * *classes* = [] (string array) - Node classes
 * *data* = null (nullable object) - Data array
 * *depth* = 1 (nullable number) - Voxel depth
 * *expr* = null (nullable emitter) - Data emitter expression
 * *fps* = null (nullable number) - Frames-per-second update rate
 * *height* = 1 (nullable number) - Voxel height
 * *hurry* = 5 (number) - Maximum frames to hurry per frame
 * *id* = null (nullable string) - Unique ID
 * *items* = 4 (number) - Number of items
 * *limit* = 60 (number) - Maximum frames to track
 * *live* = true (bool) - Update continuously
 * *observe* = false (bool) - Pass clock time to data
 * *realtime* = false (bool) - Run on real time, not clock time
 * *width* = 1 (nullable number) - Voxel width

#### `base/inherit`

*Inherit trait*
 * *classes* = [] (string array) - Node classes
 * *id* = null (nullable string) - Unique ID

#### `data/interval`

*1D interval*
 * *axis* = 1 (axis) - Axis
 * *bufferLength* = 1 (number) - Array buffer length
 * *centered* = false (bool) - Centered instead of corner sampling
 * *channels* = 4 (number) - Number of channels
 * *classes* = [] (string array) - Node classes
 * *data* = null (nullable object) - Data array
 * *expr* = null (nullable emitter) - Data emitter expression
 * *fps* = null (nullable number) - Frames-per-second update rate
 * *history* = 1 (number) - Array history
 * *hurry* = 5 (number) - Maximum frames to hurry per frame
 * *id* = null (nullable string) - Unique ID
 * *items* = 4 (number) - Number of items
 * *length* = 1 (nullable number) - Array length
 * *limit* = 60 (number) - Maximum frames to track
 * *live* = true (bool) - Update continuously
 * *magFilter* = "nearest" (filter) - Texture magnification filtering
 * *minFilter* = "nearest" (filter) - Texture minification filtering
 * *observe* = false (bool) - Pass clock time to data
 * *padding* = 0 (number) - Number of samples padding
 * *range* = [-1, 1] (vec2) - Range on axis
 * *realtime* = false (bool) - Run on real time, not clock time
 * *type* = "float" (type) - Texture data type

#### `operator/join`

*Join rows*
 * *axis* = null (nullable axis) - Axis to join
 * *classes* = [] (string array) - Node classes
 * *id* = null (nullable string) - Unique ID
 * *order* = "wxyz" (transpose) - Axis order
 * *overlap* = 1 (number) - Tuple overlap
 * *source* = "<" (select) - Input source

#### `text/label`

*GL label*
 * *background* = "rgb(255, 255, 255)" (color) - Outline background
 * *blending* = "normal" (blending) - Blending mode ('no, normal, add, subtract, multiply)
 * *classes* = [] (string array) - Node classes
 * *color* = "rgb(128, 128, 128)" (color) - Color
 * *colors* = null (nullable select) - Colors data source
 * *depth* = 0 (number) - Depth scaling
 * *expand* = 0 (number) - Expand glyphs
 * *id* = null (nullable string) - Unique ID
 * *offset* = [0, -20] (vec2) - 2D offset
 * *opacity* = 1 (positive number) - Opacity
 * *outline* = 2 (number) - Outline size
 * *points* = < (select) - Points data source
 * *size* = 16 (number) - Text size
 * *snap* = false (bool) - Snap to pixel
 * *text* = "<" (select) - Text source
 * *visible* = true (bool) - Visibility for rendering
 * *zBias* = 0 (positive number) - Z-Bias (3D stacking)
 * *zIndex* = 0 (positive int) - Z-Index (2D stacking)
 * *zOrder* = null (nullable number) - Z-Order (drawing order)
 * *zTest* = true (bool) - Test Z buffer
 * *zWrite* = true (bool) - Write Z buffer

#### `transform/layer`

*Layer*
 * *classes* = [] (string array) - Node classes
 * *depth* = 1 (number) - 3D Depth
 * *fit* = y (fit) - Fit to (contain, cover, x, y)
 * *id* = null (nullable string) - Unique ID
 * *pass* = view (vertexPass) - Vertex pass (data, view, world, eye)

#### `operator/lerp`

*Linear interpolation*
 * *classes* = [] (string array) - Node classes
 * *depth* = null (nullable number) - Lerp to depth
 * *height* = null (nullable number) - Lerp to height
 * *id* = null (nullable string) - Unique ID
 * *items* = null (nullable number) - Lerp to items
 * *source* = "<" (select) - Input source
 * *width* = null (nullable number) - Lerp to width

#### `draw/line`

*Line*
 * *blending* = "normal" (blending) - Blending mode ('no, normal, add, subtract, multiply)
 * *classes* = [] (string array) - Node classes
 * *closed* = false (bool) - Close line
 * *color* = "rgb(128, 128, 128)" (color) - Color
 * *colors* = null (nullable select) - Colors data source
 * *depth* = 1 (number) - Depth scaling
 * *end* = true (bool) - Draw end arrow
 * *id* = null (nullable string) - Unique ID
 * *opacity* = 1 (positive number) - Opacity
 * *points* = < (select) - Points data source
 * *proximity* = null (nullable number) - Proximity threshold
 * *size* = 3 (number) - Arrow size
 * *start* = true (bool) - Draw start arrow
 * *stroke* = solid (stroke) - Line stroke (solid, dotted, dashed)
 * *visible* = true (bool) - Visibility for rendering
 * *zBias* = 0 (positive number) - Z-Bias (3D stacking)
 * *zIndex* = 0 (positive int) - Z-Index (2D stacking)
 * *zOrder* = null (nullable number) - Z-Order (drawing order)
 * *zTest* = true (bool) - Test Z buffer
 * *zWrite* = true (bool) - Write Z buffer

#### `data/matrix`

*2D matrix*
 * *bufferHeight* = 1 (number) - Matrix buffer height
 * *bufferWidth* = 1 (number) - Matrix buffer width
 * *channels* = 4 (number) - Number of channels
 * *classes* = [] (string array) - Node classes
 * *data* = null (nullable object) - Data array
 * *expr* = null (nullable emitter) - Data emitter expression
 * *fps* = null (nullable number) - Frames-per-second update rate
 * *height* = 1 (nullable number) - Matrix height
 * *history* = 1 (number) - Matrix history
 * *hurry* = 5 (number) - Maximum frames to hurry per frame
 * *id* = null (nullable string) - Unique ID
 * *items* = 4 (number) - Number of items
 * *limit* = 60 (number) - Maximum frames to track
 * *live* = true (bool) - Update continuously
 * *magFilter* = "nearest" (filter) - Texture magnification filtering
 * *minFilter* = "nearest" (filter) - Texture minification filtering
 * *observe* = false (bool) - Pass clock time to data
 * *realtime* = false (bool) - Run on real time, not clock time
 * *type* = "float" (type) - Texture data type
 * *width* = 1 (nullable number) - Matrix width

#### `operator/memo`

*Memoize*
 * *classes* = [] (string array) - Node classes
 * *id* = null (nullable string) - Unique ID
 * *magFilter* = "nearest" (filter) - Texture magnification filtering
 * *minFilter* = "nearest" (filter) - Texture minification filtering
 * *source* = "<" (select) - Input source
 * *type* = "float" (type) - Texture data type

#### `present/move`

*Move transition*
 * *classes* = [] (string array) - Node classes
 * *delay* = 0 (number) - Transition delay
 * *delayEnter* = null (nullable number) - Transition enter delay
 * *delayExit* = null (nullable number) - Transition exit delay
 * *duration* = 0.3 (number) - Transition duration
 * *durationEnter* = 0.3 (number) - Transition enter duration
 * *durationExit* = 0.3 (number) - Transition exit duration
 * *enter* = null (nullable number) - Enter state
 * *exit* = null (nullable number) - Exit state
 * *from* = [0, 0, 0, 0] (vec4) - Enter from
 * *id* = null (nullable string) - Unique ID
 * *pass* = view (vertexPass) - Vertex pass (data, view, world, eye)
 * *stagger* = [0, 0, 0, 0] (vec4) - Stagger dimensions
 * *to* = [0, 0, 0, 0] (vec4) - Exit to

#### `time/now`

*Absolute time*
 * *classes* = [] (string array) - Node classes
 * *id* = null (nullable string) - Unique ID
 * *now* = null (nullable timestamp) - Current moment
 * *pace* = 1 (number) - Time pace
 * *seek* = null (nullable number) - Seek to time
 * *speed* = 1 (number) - Time speed

#### `present/play`

*Play animation*
 * *classes* = [] (string array) - Node classes
 * *delay* = 0 (number) - Play delay
 * *ease* = "cosine" (ease) - Animation ease
 * *from* = 0 (number) - Play from
 * *id* = null (nullable string) - Unique ID
 * *loop* = false (bool) - Loop
 * *pace* = 1 (number) - Play pace
 * *realtime* = false (bool) - Run on real time, not clock time
 * *script* = [object Object] (object) - Animation script
 * *speed* = 1 (number) - Play speed
 * *target* = "<" (select) - Animation target
 * *to* = Infinity (number) - Play until
 * *trigger* = 1 (nullable number) - Trigger on step

#### `draw/point`

*Point*
 * *blending* = "normal" (blending) - Blending mode ('no, normal, add, subtract, multiply)
 * *classes* = [] (string array) - Node classes
 * *color* = "rgb(128, 128, 128)" (color) - Color
 * *colors* = null (nullable select) - Colors data source
 * *depth* = 1 (number) - Depth scaling
 * *fill* = true (bool) - Fill shape
 * *id* = null (nullable string) - Unique ID
 * *opacity* = 1 (positive number) - Opacity
 * *optical* = true (bool) - Optical or exact sizing
 * *points* = < (select) - Points data source
 * *shape* = "circle" (shape) - Point shape (circle, square, diamond, up, down, left, right)
 * *size* = 4 (positive number) - Point size
 * *visible* = true (bool) - Visibility for rendering
 * *zBias* = 0 (positive number) - Z-Bias (3D stacking)
 * *zIndex* = 0 (positive int) - Z-Index (2D stacking)
 * *zOrder* = null (nullable number) - Z-Order (drawing order)
 * *zTest* = true (bool) - Test Z buffer
 * *zWrite* = true (bool) - Write Z buffer

#### `view/polar`

*Polar*
 * *bend* = 1 (number) - Amount of polar bend
 * *classes* = [] (string array) - Node classes
 * *eulerOrder* = xyz (swizzle) - Euler order
 * *helix* = 0 (number) - Expand into helix
 * *id* = null (nullable string) - Unique ID
 * *pass* = view (vertexPass) - Vertex pass (data, view, world, eye)
 * *position* = [0, 0, 0] (vec3) - 3D Position
 * *quaternion* = [0, 0, 0, 1] (quat) - 3D Quaternion
 * *range* = [[-1, 1], [-1, 1], [-1, 1], [-1, 1]] (array vec2) - 4D range in view
 * *rotation* = [0, 0, 0] (vec3) - 3D Euler rotation
 * *scale* = 1,1,1 (vec3) - 3D Scale
 * *visible* = true (bool) - Visibility for rendering

#### `present/present`

*Present slides*
 * *classes* = [] (string array) - Node classes
 * *directed* = true (bool) - Apply directional transitions
 * *id* = null (nullable string) - Unique ID
 * *index* = 1 (number) - Present slide number
 * *length* = 0 (number) - Presentation length (computed)

#### `operator/repeat`

*Repeat*
 * *classes* = [] (string array) - Node classes
 * *depth* = 1 (number) - Repeat depth
 * *height* = 1 (number) - Repeat height
 * *id* = null (nullable string) - Unique ID
 * *items* = 1 (number) - Repeat items
 * *source* = "<" (select) - Input source
 * *width* = 1 (number) - Repeat width

#### `operator/resample`

*Resample*
 * *channels* = 4 (number) - Resample channels
 * *classes* = [] (string array) - Node classes
 * *depth* = null (nullable number) - Resample factor depth
 * *height* = null (nullable number) - Resample factor height
 * *id* = null (nullable string) - Unique ID
 * *indices* = 4 (number) - Resample indices
 * *items* = null (nullable number) - Resample factor items
 * *sample* = "relative" (mapping) - Source sampling (relative, absolute)
 * *shader* = "<" (select) - Shader to use
 * *size* = "absolute" (mapping) - Scaling mode (relative, absolute)
 * *source* = "<" (select) - Input source
 * *width* = null (nullable number) - Resample factor width

#### `text/retext`

*Text reformatter*
 * *channels* = 4 (number) - Resample channels
 * *classes* = [] (string array) - Node classes
 * *depth* = null (nullable number) - Resample factor depth
 * *detail* = 24 (number) - Font detail
 * *expand* = 5 (number) - SDF expansion
 * *font* = sans-serif (font) - Font family
 * *height* = null (nullable number) - Resample factor height
 * *id* = null (nullable string) - Unique ID
 * *indices* = 4 (number) - Resample indices
 * *items* = null (nullable number) - Resample factor items
 * *sample* = "relative" (mapping) - Source sampling (relative, absolute)
 * *shader* = "<" (select) - Shader to use
 * *size* = "absolute" (mapping) - Scaling mode (relative, absolute)
 * *source* = "<" (select) - Input source
 * *style* =  (string) - Font style
 * *variant* =  (string) - Font variant
 * *weight* =  (string) - Font weight
 * *width* = null (nullable number) - Resample factor width

#### `present/reveal`

*Reveal transition*
 * *classes* = [] (string array) - Node classes
 * *delay* = 0 (number) - Transition delay
 * *delayEnter* = null (nullable number) - Transition enter delay
 * *delayExit* = null (nullable number) - Transition exit delay
 * *duration* = 0.3 (number) - Transition duration
 * *durationEnter* = 0.3 (number) - Transition enter duration
 * *durationExit* = 0.3 (number) - Transition exit duration
 * *enter* = null (nullable number) - Enter state
 * *exit* = null (nullable number) - Exit state
 * *id* = null (nullable string) - Unique ID
 * *stagger* = [0, 0, 0, 0] (vec4) - Stagger dimensions

#### `base/root`

*Root*
 * *camera* = "[camera]" (select) - Active camera
 * *classes* = [] (string array) - Node classes
 * *focus* = 1 (nullable number) - Camera focus distance in world units
 * *fov* = null (nullable number) - (Vertical) Field-of-view to calibrate units for (degrees)
 * *id* = null (nullable string) - Unique ID
 * *pass* = view (vertexPass) - Vertex pass (data, view, world, eye)
 * *scale* = null (nullable number) - (Vertical) Reference scale of viewport in pixels
 * *speed* = 1 (number) - Global speed

#### `rtt/rtt`

*Render to texture*
 * *camera* = "[camera]" (select) - Active camera
 * *classes* = [] (string array) - Node classes
 * *height* = null (nullable number) - RTT height
 * *history* = 1 (number) - RTT history
 * *id* = null (nullable string) - Unique ID
 * *magFilter* = "nearest" (filter) - Texture magnification filtering
 * *minFilter* = "nearest" (filter) - Texture minification filtering
 * *pass* = view (vertexPass) - Vertex pass (data, view, world, eye)
 * *speed* = 1 (number) - Global speed
 * *type* = "float" (type) - Texture data type
 * *width* = null (nullable number) - RTT width

#### `data/scale`

*Scale*
 * *axis* = 1 (axis) - Axis
 * *base* = 10 (number) - Power base for sub/super units
 * *classes* = [] (string array) - Node classes
 * *divide* = 10 (number) - Number of divisions
 * *end* = true (bool) - Include end
 * *factor* = 1 (positive number) - Scale factor
 * *id* = null (nullable string) - Unique ID
 * *mode* = "linear" (scale) - Scale type
 * *nice* = true (bool) - Snap to nice numbers
 * *origin* = [0, 0, 0, 0] (vec4) - 4D Origin
 * *range* = [-1, 1] (vec2) - Range on axis
 * *start* = true (bool) - Include start
 * *unit* = 1 (number) - Reference unit
 * *zero* = true (bool) - Include zero

#### `shader/shader`

*Shader snippet*
 * *classes* = [] (string array) - Node classes
 * *code* =  (string) - Shader code
 * *id* = null (nullable string) - Unique ID
 * *language* = "glsl" (string) - Shader language
 * *sources* = null (nullable select) - Sampler sources
 * *uniforms* = null (nullable object) - Shader uniform objects

#### `operator/slice`

*Slice rows*
 * *classes* = [] (string array) - Node classes
 * *depth* = null (nullable vec2) - Slice from, to depth
 * *height* = null (nullable vec2) - Slice from, to height
 * *id* = null (nullable string) - Unique ID
 * *items* = null (nullable vec2) - Slice from, to items
 * *source* = "<" (select) - Input source
 * *width* = null (nullable vec2) - Slice from, to width

#### `present/slide`

*Presentation slide*
 * *classes* = [] (string array) - Node classes
 * *early* = 0 (number) - Appear early steps
 * *from* = null (nullable number) - Appear from step
 * *id* = null (nullable string) - Unique ID
 * *late* = 0 (number) - Stay late steps
 * *order* = 0 (nullable number) - Slide order
 * *steps* = 1 (number) - Slide steps
 * *to* = null (nullable number) - Disappear on step

#### `view/spherical`

*Spherical*
 * *bend* = 1 (number) - Amount of spherical bend
 * *classes* = [] (string array) - Node classes
 * *eulerOrder* = xyz (swizzle) - Euler order
 * *id* = null (nullable string) - Unique ID
 * *pass* = view (vertexPass) - Vertex pass (data, view, world, eye)
 * *position* = [0, 0, 0] (vec3) - 3D Position
 * *quaternion* = [0, 0, 0, 1] (quat) - 3D Quaternion
 * *range* = [[-1, 1], [-1, 1], [-1, 1], [-1, 1]] (array vec2) - 4D range in view
 * *rotation* = [0, 0, 0] (vec3) - 3D Euler rotation
 * *scale* = 1,1,1 (vec3) - 3D Scale
 * *visible* = true (bool) - Visibility for rendering

#### `operator/split`

*Split rows*
 * *axis* = null (nullable axis) - Axis to split
 * *classes* = [] (string array) - Node classes
 * *id* = null (nullable string) - Unique ID
 * *length* = 1 (number) - Tuple length
 * *order* = "wxyz" (transpose) - Axis order
 * *overlap* = 1 (number) - Tuple overlap
 * *source* = "<" (select) - Input source

#### `operator/spread`

*Spread rows*
 * *alignDepth* = 0 (anchor) - Depth alignment
 * *alignHeight* = 0 (anchor) - Height alignment
 * *alignItems* = 0 (anchor) - Items alignment
 * *alignWidth* = 0 (anchor) - Width alignment
 * *classes* = [] (string array) - Node classes
 * *depth* = null (nullable vec4) - Depth offset
 * *height* = null (nullable vec4) - Height offset
 * *id* = null (nullable string) - Unique ID
 * *items* = null (nullable vec4) - Items offset
 * *source* = "<" (select) - Input source
 * *unit* = "relative" (mapping) - Spread per item (absolute) or array (relative)
 * *width* = null (nullable vec4) - Width offset

#### `present/step`

*Step through animation*
 * *classes* = [] (string array) - Node classes
 * *delay* = 0 (number) - Step delay
 * *duration* = 0.3 (number) - Step duration
 * *ease* = "cosine" (ease) - Animation ease
 * *id* = null (nullable string) - Unique ID
 * *pace* = 0 (number) - Step pace
 * *playback* = "linear" (ease) - Playhead ease
 * *realtime* = false (bool) - Run on real time, not clock time
 * *rewind* = 2 (number) - Step rewind factor
 * *script* = [object Object] (object) - Animation script
 * *skip* = true (bool) - Speed up through skips
 * *speed* = 1 (number) - Step speed
 * *stops* = null (nullable number array) - Playhead stops
 * *target* = "<" (select) - Animation target
 * *trigger* = 1 (nullable number) - Trigger on step

#### `view/stereographic`

*Stereographic*
 * *bend* = 1 (number) - Amount of stereographic bend
 * *classes* = [] (string array) - Node classes
 * *eulerOrder* = xyz (swizzle) - Euler order
 * *id* = null (nullable string) - Unique ID
 * *pass* = view (vertexPass) - Vertex pass (data, view, world, eye)
 * *position* = [0, 0, 0] (vec3) - 3D Position
 * *quaternion* = [0, 0, 0, 1] (quat) - 3D Quaternion
 * *range* = [[-1, 1], [-1, 1], [-1, 1], [-1, 1]] (array vec2) - 4D range in view
 * *rotation* = [0, 0, 0] (vec3) - 3D Euler rotation
 * *scale* = 1,1,1 (vec3) - 3D Scale
 * *visible* = true (bool) - Visibility for rendering

#### `view/stereographic4`

*4D stereographic*
 * *bend* = 1 (number) - Amount of stereographic bend
 * *classes* = [] (string array) - Node classes
 * *id* = null (nullable string) - Unique ID
 * *pass* = view (vertexPass) - Vertex pass (data, view, world, eye)
 * *position* = [0, 0, 0, 0] (vec4) - 4D Position
 * *range* = [[-1, 1], [-1, 1], [-1, 1], [-1, 1]] (array vec2) - 4D range in view
 * *scale* = [1, 1, 1, 1] (vec4) - 4D Scale
 * *visible* = true (bool) - Visibility for rendering

#### `draw/strip`

*Triangle strip*
 * *blending* = "normal" (blending) - Blending mode ('no, normal, add, subtract, multiply)
 * *classes* = [] (string array) - Node classes
 * *closed* = false (bool) - Close line
 * *color* = "rgb(128, 128, 128)" (color) - Color
 * *colors* = null (nullable select) - Colors data source
 * *depth* = 1 (number) - Depth scaling
 * *fill* = true (bool) - Fill mesh
 * *id* = null (nullable string) - Unique ID
 * *line* = false (bool) - Draw line
 * *map* = null (nullable select) - Texture map
 * *opacity* = 1 (positive number) - Opacity
 * *points* = < (select) - Points data source
 * *proximity* = null (nullable number) - Proximity threshold
 * *shaded* = false (bool) - Shade mesh
 * *size* = 2 (positive number) - Line width
 * *stroke* = solid (stroke) - Line stroke (solid, dotted, dashed)
 * *visible* = true (bool) - Visibility for rendering
 * *zBias* = 0 (positive number) - Z-Bias (3D stacking)
 * *zIndex* = 0 (positive int) - Z-Index (2D stacking)
 * *zOrder* = null (nullable number) - Z-Order (drawing order)
 * *zTest* = true (bool) - Test Z buffer
 * *zWrite* = true (bool) - Write Z buffer

#### `draw/surface`

*Surface*
 * *blending* = "normal" (blending) - Blending mode ('no, normal, add, subtract, multiply)
 * *classes* = [] (string array) - Node classes
 * *closed* = false (bool) - Close line
 * *closedX* = false (bool) - Close X lines
 * *closedY* = true (bool) - Close Y lines
 * *color* = "rgb(128, 128, 128)" (color) - Color
 * *colors* = null (nullable select) - Colors data source
 * *crossed* = true (bool) - UVWO map on matching axis
 * *depth* = 1 (number) - Depth scaling
 * *fill* = true (bool) - Fill mesh
 * *id* = null (nullable string) - Unique ID
 * *lineX* = true (bool) - Draw X lines
 * *lineY* = true (bool) - Draw Y lines
 * *map* = null (nullable select) - Texture map
 * *opacity* = 1 (positive number) - Opacity
 * *points* = < (select) - Points data source
 * *proximity* = null (nullable number) - Proximity threshold
 * *shaded* = false (bool) - Shade mesh
 * *size* = 2 (positive number) - Line width
 * *stroke* = solid (stroke) - Line stroke (solid, dotted, dashed)
 * *visible* = true (bool) - Visibility for rendering
 * *zBias* = 0 (positive number) - Z-Bias (3D stacking)
 * *zIndex* = 0 (positive int) - Z-Index (2D stacking)
 * *zOrder* = null (nullable number) - Z-Order (drawing order)
 * *zTest* = true (bool) - Test Z buffer
 * *zWrite* = true (bool) - Write Z buffer

#### `operator/swizzle`

*Swizzle data*
 * *classes* = [] (string array) - Node classes
 * *id* = null (nullable string) - Unique ID
 * *order* = xyzw (swizzle) - Swizzle order
 * *source* = "<" (select) - Input source

#### `text/text`

*Text source*
 * *bufferDepth* = 1 (number) - Voxel buffer depth
 * *bufferHeight* = 1 (number) - Voxel buffer height
 * *bufferWidth* = 1 (number) - Voxel buffer width
 * *channels* = 4 (number) - Number of channels
 * *classes* = [] (string array) - Node classes
 * *data* = null (nullable object) - Data array
 * *depth* = 1 (nullable number) - Voxel depth
 * *detail* = 24 (number) - Font detail
 * *expand* = 5 (number) - SDF expansion
 * *expr* = null (nullable emitter) - Data emitter expression
 * *font* = sans-serif (font) - Font family
 * *fps* = null (nullable number) - Frames-per-second update rate
 * *height* = 1 (nullable number) - Voxel height
 * *hurry* = 5 (number) - Maximum frames to hurry per frame
 * *id* = null (nullable string) - Unique ID
 * *items* = 4 (number) - Number of items
 * *limit* = 60 (number) - Maximum frames to track
 * *live* = true (bool) - Update continuously
 * *magFilter* = "nearest" (filter) - Texture magnification filtering
 * *minFilter* = "nearest" (filter) - Texture minification filtering
 * *observe* = false (bool) - Pass clock time to data
 * *realtime* = false (bool) - Run on real time, not clock time
 * *style* =  (string) - Font style
 * *type* = "float" (type) - Texture data type
 * *variant* =  (string) - Font variant
 * *weight* =  (string) - Font weight
 * *width* = 1 (nullable number) - Voxel width

#### `draw/ticks`

*Ticks*
 * *blending* = "normal" (blending) - Blending mode ('no, normal, add, subtract, multiply)
 * *classes* = [] (string array) - Node classes
 * *closed* = false (bool) - Close line
 * *color* = "rgb(128, 128, 128)" (color) - Color
 * *colors* = null (nullable select) - Colors data source
 * *depth* = 1 (number) - Depth scaling
 * *epsilon* = 0.0001 (number) - Tick epsilon
 * *id* = null (nullable string) - Unique ID
 * *normal* = true (bool) - Normal for reference plane
 * *opacity* = 1 (positive number) - Opacity
 * *points* = < (select) - Points data source
 * *proximity* = null (nullable number) - Proximity threshold
 * *size* = 10 (number) - Tick size
 * *stroke* = solid (stroke) - Line stroke (solid, dotted, dashed)
 * *visible* = true (bool) - Visibility for rendering
 * *zBias* = 0 (positive number) - Z-Bias (3D stacking)
 * *zIndex* = 0 (positive int) - Z-Index (2D stacking)
 * *zOrder* = null (nullable number) - Z-Order (drawing order)
 * *zTest* = true (bool) - Test Z buffer
 * *zWrite* = true (bool) - Write Z buffer

#### `transform/transform`

*3D transform*
 * *classes* = [] (string array) - Node classes
 * *eulerOrder* = xyz (swizzle) - 3D Euler order
 * *id* = null (nullable string) - Unique ID
 * *matrix* = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] (mat4) - 3D Projective Matrix
 * *pass* = view (vertexPass) - Vertex pass (data, view, world, eye)
 * *position* = [0, 0, 0] (vec3) - 3D Position
 * *quaternion* = [0, 0, 0, 1] (quat) - 3D Quaternion
 * *rotation* = [0, 0, 0] (vec3) - 3D Euler rotation
 * *scale* = 1,1,1 (vec3) - 3D Scale

#### `transform/transform4`

*4D transform*
 * *classes* = [] (string array) - Node classes
 * *id* = null (nullable string) - Unique ID
 * *matrix* = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] (mat4) - 4D Affine Matrix
 * *pass* = view (vertexPass) - Vertex pass (data, view, world, eye)
 * *position* = [0, 0, 0, 0] (vec4) - 4D Position
 * *scale* = [1, 1, 1, 1] (vec4) - 4D Scale

#### `operator/transpose`

*Transpose*
 * *classes* = [] (string array) - Node classes
 * *id* = null (nullable string) - Unique ID
 * *order* = xyzw (transpose) - Transpose order
 * *source* = "<" (select) - Input source

#### `base/unit`

*Unit calibration*
 * *classes* = [] (string array) - Node classes
 * *focus* = 1 (nullable number) - Camera focus distance in world units
 * *fov* = null (nullable number) - (Vertical) Field-of-view to calibrate units for (degrees)
 * *id* = null (nullable string) - Unique ID
 * *scale* = null (nullable number) - (Vertical) Reference scale of viewport in pixels

#### `draw/vector`

*Vector*
 * *blending* = "normal" (blending) - Blending mode ('no, normal, add, subtract, multiply)
 * *classes* = [] (string array) - Node classes
 * *closed* = false (bool) - Close line
 * *color* = "rgb(128, 128, 128)" (color) - Color
 * *colors* = null (nullable select) - Colors data source
 * *depth* = 1 (number) - Depth scaling
 * *end* = true (bool) - Draw end arrow
 * *id* = null (nullable string) - Unique ID
 * *opacity* = 1 (positive number) - Opacity
 * *points* = < (select) - Points data source
 * *proximity* = null (nullable number) - Proximity threshold
 * *size* = 3 (number) - Arrow size
 * *start* = true (bool) - Draw start arrow
 * *stroke* = solid (stroke) - Line stroke (solid, dotted, dashed)
 * *visible* = true (bool) - Visibility for rendering
 * *zBias* = 0 (positive number) - Z-Bias (3D stacking)
 * *zIndex* = 0 (positive int) - Z-Index (2D stacking)
 * *zOrder* = null (nullable number) - Z-Order (drawing order)
 * *zTest* = true (bool) - Test Z buffer
 * *zWrite* = true (bool) - Write Z buffer

#### `transform/vertex`

*Vertex pass*
 * *classes* = [] (string array) - Node classes
 * *id* = null (nullable string) - Unique ID
 * *pass* = view (vertexPass) - Vertex pass (data, view, world, eye)
 * *shader* = "<" (select) - Shader to use

#### `view/view`

*View*
 * *classes* = [] (string array) - Node classes
 * *id* = null (nullable string) - Unique ID
 * *pass* = view (vertexPass) - Vertex pass (data, view, world, eye)
 * *range* = [[-1, 1], [-1, 1], [-1, 1], [-1, 1]] (array vec2) - 4D range in view
 * *visible* = true (bool) - Visibility for rendering

#### `data/volume`

*3D volume*
 * *axes* = [1, 2, 3] (swizzle(3) axis) - Axis triplet
 * *bufferDepth* = 1 (number) - Voxel buffer depth
 * *bufferHeight* = 1 (number) - Voxel buffer height
 * *bufferWidth* = 1 (number) - Voxel buffer width
 * *channels* = 4 (number) - Number of channels
 * *classes* = [] (string array) - Node classes
 * *data* = null (nullable object) - Data array
 * *depth* = 1 (nullable number) - Voxel depth
 * *expr* = null (nullable emitter) - Data emitter expression
 * *fps* = null (nullable number) - Frames-per-second update rate
 * *height* = 1 (nullable number) - Voxel height
 * *hurry* = 5 (number) - Maximum frames to hurry per frame
 * *id* = null (nullable string) - Unique ID
 * *items* = 4 (number) - Number of items
 * *limit* = 60 (number) - Maximum frames to track
 * *live* = true (bool) - Update continuously
 * *magFilter* = "nearest" (filter) - Texture magnification filtering
 * *minFilter* = "nearest" (filter) - Texture minification filtering
 * *observe* = false (bool) - Pass clock time to data
 * *realtime* = false (bool) - Run on real time, not clock time
 * *type* = "float" (type) - Texture data type
 * *width* = 1 (nullable number) - Voxel width

#### `data/voxel`

*3D voxel*
 * *bufferDepth* = 1 (number) - Voxel buffer depth
 * *bufferHeight* = 1 (number) - Voxel buffer height
 * *bufferWidth* = 1 (number) - Voxel buffer width
 * *channels* = 4 (number) - Number of channels
 * *classes* = [] (string array) - Node classes
 * *data* = null (nullable object) - Data array
 * *depth* = 1 (nullable number) - Voxel depth
 * *expr* = null (nullable emitter) - Data emitter expression
 * *fps* = null (nullable number) - Frames-per-second update rate
 * *height* = 1 (nullable number) - Voxel height
 * *hurry* = 5 (number) - Maximum frames to hurry per frame
 * *id* = null (nullable string) - Unique ID
 * *items* = 4 (number) - Number of items
 * *limit* = 60 (number) - Maximum frames to track
 * *live* = true (bool) - Update continuously
 * *magFilter* = "nearest" (filter) - Texture magnification filtering
 * *minFilter* = "nearest" (filter) - Texture minification filtering
 * *observe* = false (bool) - Pass clock time to data
 * *realtime* = false (bool) - Run on real time, not clock time
 * *type* = "float" (type) - Texture data type
 * *width* = 1 (nullable number) - Voxel width

