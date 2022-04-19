import arrowposition from "./glsl/arrow.position";
import axisposition from "./glsl/axis.position";
import cartesian4position from "./glsl/cartesian4.position";
import cartesianposition from "./glsl/cartesian.position";
import clampposition from "./glsl/clamp.position";
import coloropaque from "./glsl/color.opaque";
import faceposition from "./glsl/face.position";
import facepositionnormal from "./glsl/face.position.normal";
import floatencode from "./glsl/float.encode";
import floatindexpack from "./glsl/float.index.pack";
import floatstretch from "./glsl/float.stretch";
import fragmentclipdashed from "./glsl/fragment.clip.dashed";
import fragmentclipdotted from "./glsl/fragment.clip.dotted";
import fragmentclipends from "./glsl/fragment.clip.ends";
import fragmentclipproximity from "./glsl/fragment.clip.proximity";
import fragmentcolor from "./glsl/fragment.color";
import fragmentmaprgba from "./glsl/fragment.map.rgba";
import fragmentsolid from "./glsl/fragment.solid";
import fragmenttransparent from "./glsl/fragment.transparent";
import gridposition from "./glsl/grid.position";
import growposition from "./glsl/grow.position";
import joinposition from "./glsl/join.position";
import labelalpha from "./glsl/label.alpha";
import labelmap from "./glsl/label.map";
import labeloutline from "./glsl/label.outline";
import layerposition from "./glsl/layer.position";
import lerpdepth from "./glsl/lerp.depth";
import lerpheight from "./glsl/lerp.height";
import lerpitems from "./glsl/lerp.items";
import lerpwidth from "./glsl/lerp.width";
import lineposition from "./glsl/line.position";
import map2ddata from "./glsl/map.2d.data";
import map2ddatawrap from "./glsl/map.2d.data.wrap";
import mapxyzw2dv from "./glsl/map.xyzw.2dv";
import mapxyzwalign from "./glsl/map.xyzw.align";
import mapxyzwtexture from "./glsl/map.xyzw.texture";
import meshfragmentcolor from "./glsl/mesh.fragment.color";
import meshfragmentmap from "./glsl/mesh.fragment.map";
import meshfragmentmask from "./glsl/mesh.fragment.mask";
import meshfragmentmaterial from "./glsl/mesh.fragment.material";
import meshfragmentshaded from "./glsl/mesh.fragment.shaded";
import meshfragmenttexture from "./glsl/mesh.fragment.texture";
import meshgammain from "./glsl/mesh.gamma.in";
import meshgammaout from "./glsl/mesh.gamma.out";
import meshmapuvwo from "./glsl/mesh.map.uvwo";
import meshposition from "./glsl/mesh.position";
import meshvertexcolor from "./glsl/mesh.vertex.color";
import meshvertexmask from "./glsl/mesh.vertex.mask";
import meshvertexposition from "./glsl/mesh.vertex.position";
import moveposition from "./glsl/move.position";
import objectmaskdefault from "./glsl/object.mask.default";
import pointalphacircle from "./glsl/point.alpha.circle";
import pointalphacirclehollow from "./glsl/point.alpha.circle.hollow";
import pointalphageneric from "./glsl/point.alpha.generic";
import pointalphagenerichollow from "./glsl/point.alpha.generic.hollow";
import pointedge from "./glsl/point.edge";
import pointfill from "./glsl/point.fill";
import pointmaskcircle from "./glsl/point.mask.circle";
import pointmaskdiamond from "./glsl/point.mask.diamond";
import pointmaskdown from "./glsl/point.mask.down";
import pointmaskleft from "./glsl/point.mask.left";
import pointmaskright from "./glsl/point.mask.right";
import pointmasksquare from "./glsl/point.mask.square";
import pointmaskup from "./glsl/point.mask.up";
import pointposition from "./glsl/point.position";
import pointsizeuniform from "./glsl/point.size.uniform";
import pointsizevarying from "./glsl/point.size.varying";
import polarposition from "./glsl/polar.position";
import projectposition from "./glsl/project.position";
import projectreadback from "./glsl/project.readback";
import rawpositionscale from "./glsl/raw.position.scale";
import repeatposition from "./glsl/repeat.position";
import resamplepadding from "./glsl/resample.padding";
import resamplerelative from "./glsl/resample.relative";
import revealmask from "./glsl/reveal.mask";
import reverseposition from "./glsl/reverse.position";
import rootposition from "./glsl/root.position";
import sample2d from "./glsl/sample.2d";
import scaleposition from "./glsl/scale.position";
import screenmapstpq from "./glsl/screen.map.stpq";
import screenmapxy from "./glsl/screen.map.xy";
import screenmapxyzw from "./glsl/screen.map.xyzw";
import screenpassuv from "./glsl/screen.pass.uv";
import screenposition from "./glsl/screen.position";
import sliceposition from "./glsl/slice.position";
import sphericalposition from "./glsl/spherical.position";
import splitposition from "./glsl/split.position";
import spreadposition from "./glsl/spread.position";
import spritefragment from "./glsl/sprite.fragment";
import spriteposition from "./glsl/sprite.position";
import stereographic4position from "./glsl/stereographic4.position";
import stereographicposition from "./glsl/stereographic.position";
import stpqsample2d from "./glsl/stpq.sample.2d";
import stpqxyzw2d from "./glsl/stpq.xyzw.2d";
import strippositionnormal from "./glsl/strip.position.normal";
import stylecolor from "./glsl/style.color";
import subdividedepth from "./glsl/subdivide.depth";
import subdividedepthlerp from "./glsl/subdivide.depth.lerp";
import subdivideheight from "./glsl/subdivide.height";
import subdivideheightlerp from "./glsl/subdivide.height.lerp";
import subdivideitems from "./glsl/subdivide.items";
import subdivideitemslerp from "./glsl/subdivide.items.lerp";
import subdividewidth from "./glsl/subdivide.width";
import subdividewidthlerp from "./glsl/subdivide.width.lerp";
import surfacemaskhollow from "./glsl/surface.mask.hollow";
import surfaceposition from "./glsl/surface.position";
import surfacepositionnormal from "./glsl/surface.position.normal";
import surfacepositionshaded from "./glsl/surface.position.shaded";
import ticksposition from "./glsl/ticks.position";
import transform3position from "./glsl/transform3.position";
import transform4position from "./glsl/transform4.position";
import viewposition from "./glsl/view.position";

export const Snippets = {
  "arrow.position": arrowposition,
  "axis.position": axisposition,
  "cartesian.position": cartesianposition,
  "cartesian4.position": cartesian4position,
  "clamp.position": clampposition,
  "color.opaque": coloropaque,
  "face.position": faceposition,
  "face.position.normal": facepositionnormal,
  "float.encode": floatencode,
  "float.index.pack": floatindexpack,
  "float.stretch": floatstretch,
  "fragment.clip.dashed": fragmentclipdashed,
  "fragment.clip.dotted": fragmentclipdotted,
  "fragment.clip.ends": fragmentclipends,
  "fragment.clip.proximity": fragmentclipproximity,
  "fragment.color": fragmentcolor,
  "fragment.map.rgba": fragmentmaprgba,
  "fragment.solid": fragmentsolid,
  "fragment.transparent": fragmenttransparent,
  "grid.position": gridposition,
  "grow.position": growposition,
  "join.position": joinposition,
  "label.alpha": labelalpha,
  "label.map": labelmap,
  "label.outline": labeloutline,
  "layer.position": layerposition,
  "lerp.depth": lerpdepth,
  "lerp.height": lerpheight,
  "lerp.items": lerpitems,
  "lerp.width": lerpwidth,
  "line.position": lineposition,
  "map.2d.data": map2ddata,
  "map.2d.data.wrap": map2ddatawrap,
  "map.xyzw.2dv": mapxyzw2dv,
  "map.xyzw.align": mapxyzwalign,
  "map.xyzw.texture": mapxyzwtexture,
  "mesh.fragment.color": meshfragmentcolor,
  "mesh.fragment.map": meshfragmentmap,
  "mesh.fragment.mask": meshfragmentmask,
  "mesh.fragment.material": meshfragmentmaterial,
  "mesh.fragment.shaded": meshfragmentshaded,
  "mesh.fragment.texture": meshfragmenttexture,
  "mesh.gamma.in": meshgammain,
  "mesh.gamma.out": meshgammaout,
  "mesh.map.uvwo": meshmapuvwo,
  "mesh.position": meshposition,
  "mesh.vertex.color": meshvertexcolor,
  "mesh.vertex.mask": meshvertexmask,
  "mesh.vertex.position": meshvertexposition,
  "move.position": moveposition,
  "object.mask.default": objectmaskdefault,
  "point.alpha.circle": pointalphacircle,
  "point.alpha.circle.hollow": pointalphacirclehollow,
  "point.alpha.generic": pointalphageneric,
  "point.alpha.generic.hollow": pointalphagenerichollow,
  "point.edge": pointedge,
  "point.fill": pointfill,
  "point.mask.circle": pointmaskcircle,
  "point.mask.diamond": pointmaskdiamond,
  "point.mask.down": pointmaskdown,
  "point.mask.left": pointmaskleft,
  "point.mask.right": pointmaskright,
  "point.mask.square": pointmasksquare,
  "point.mask.up": pointmaskup,
  "point.position": pointposition,
  "point.size.uniform": pointsizeuniform,
  "point.size.varying": pointsizevarying,
  "polar.position": polarposition,
  "project.position": projectposition,
  "project.readback": projectreadback,
  "raw.position.scale": rawpositionscale,
  "repeat.position": repeatposition,
  "resample.padding": resamplepadding,
  "resample.relative": resamplerelative,
  "reveal.mask": revealmask,
  "reverse.position": reverseposition,
  "root.position": rootposition,
  "sample.2d": sample2d,
  "scale.position": scaleposition,
  "screen.map.stpq": screenmapstpq,
  "screen.map.xy": screenmapxy,
  "screen.map.xyzw": screenmapxyzw,
  "screen.pass.uv": screenpassuv,
  "screen.position": screenposition,
  "slice.position": sliceposition,
  "spherical.position": sphericalposition,
  "split.position": splitposition,
  "spread.position": spreadposition,
  "sprite.fragment": spritefragment,
  "sprite.position": spriteposition,
  "stereographic.position": stereographicposition,
  "stereographic4.position": stereographic4position,
  "stpq.sample.2d": stpqsample2d,
  "stpq.xyzw.2d": stpqxyzw2d,
  "strip.position.normal": strippositionnormal,
  "style.color": stylecolor,
  "subdivide.depth": subdividedepth,
  "subdivide.depth.lerp": subdividedepthlerp,
  "subdivide.height": subdivideheight,
  "subdivide.height.lerp": subdivideheightlerp,
  "subdivide.items": subdivideitems,
  "subdivide.items.lerp": subdivideitemslerp,
  "subdivide.width": subdividewidth,
  "subdivide.width.lerp": subdividewidthlerp,
  "surface.mask.hollow": surfacemaskhollow,
  "surface.position": surfaceposition,
  "surface.position.normal": surfacepositionnormal,
  "surface.position.shaded": surfacepositionshaded,
  "ticks.position": ticksposition,
  "transform3.position": transform3position,
  "transform4.position": transform4position,
  "view.position": viewposition,
};

export * from "./factory.js";
