import { ArrayBuffer_ } from "./buffer/arraybuffer.js";
import { Arrow } from "./meshes/arrow.js";
import { Atlas } from "./buffer/atlas.js";
import { DataBuffer } from "./buffer/databuffer.js";
import { Debug } from "./meshes/debug.js";
import { Face } from "./meshes/face.js";
import { Line } from "./meshes/line.js";
import { MatrixBuffer } from "./buffer/matrixbuffer.js";
import { Memo } from "./buffer/memo.js";
import { MemoScreen } from "./meshes/memoscreen.js";
import { Point } from "./meshes/point.js";
import { PushBuffer } from "./buffer/pushbuffer.js";
import { Readback } from "./buffer/readback.js";
import { RenderToTexture } from "./buffer/rendertotexture.js";
import { Scene } from "./scene.js";
import { Screen } from "./meshes/screen.js";
import { Sprite } from "./meshes/sprite.js";
import { Strip } from "./meshes/strip.js";
import { Surface } from "./meshes/surface.js";
import { TextAtlas } from "./buffer/textatlas.js";
import { VoxelBuffer } from "./buffer/voxelbuffer.js";

export const Classes = {
  sprite: Sprite,
  point: Point,
  line: Line,
  surface: Surface,
  face: Face,
  strip: Strip,
  arrow: Arrow,
  screen: Screen,
  memoScreen: MemoScreen,
  debug: Debug,
  dataBuffer: DataBuffer,
  arrayBuffer: ArrayBuffer_,
  matrixBuffer: MatrixBuffer,
  voxelBuffer: VoxelBuffer,
  pushBuffer: PushBuffer,
  renderToTexture: RenderToTexture,
  memo: Memo,
  readback: Readback,
  atlas: Atlas,
  textAtlas: TextAtlas,
  scene: Scene,
};
