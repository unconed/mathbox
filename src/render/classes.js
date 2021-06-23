import { ArrayBuffer_ } from "./buffer/arraybuffer";
import { Arrow } from "./meshes/arrow";
import { Atlas } from "./buffer/atlas";
import { DataBuffer } from "./buffer/databuffer";
import { Debug } from "./meshes/debug";
import { Face } from "./meshes/face";
import { Line } from "./meshes/line";
import { MatrixBuffer } from "./buffer/matrixbuffer";
import { Memo } from "./buffer/memo";
import { MemoScreen } from "./meshes/memoscreen";
import { Point } from "./meshes/point";
import { PushBuffer } from "./buffer/pushbuffer";
import { Readback } from "./buffer/readback";
import { RenderToTexture } from "./buffer/rendertotexture";
import { Scene } from "./scene";
import { Screen } from "./meshes/screen";
import { Sprite } from "./meshes/sprite";
import { Strip } from "./meshes/strip";
import { Surface } from "./meshes/surface";
import { TextAtlas } from "./buffer/textatlas";
import { VoxelBuffer } from "./buffer/voxelbuffer";

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
