import arrowposition from "./glsl/arrow.position.glsl";
import axisposition from "./glsl/axis.position.glsl";
import cartesian4position from "./glsl/cartesian4.position.glsl";
import cartesianposition from "./glsl/cartesian.position.glsl";
import clampposition from "./glsl/clamp.position.glsl";
import coloropaque from "./glsl/color.opaque.glsl";
import faceposition from "./glsl/face.position.glsl";
import facepositionnormal from "./glsl/face.position.normal.glsl";
import floatencode from "./glsl/float.encode.glsl";
import floatindexpack from "./glsl/float.index.pack.glsl";
import floatstretch from "./glsl/float.stretch.glsl";
import fragmentclipdashed from "./glsl/fragment.clip.dashed.glsl";
import fragmentclipdotted from "./glsl/fragment.clip.dotted.glsl";
import fragmentclipends from "./glsl/fragment.clip.ends.glsl";
import fragmentclipproximity from "./glsl/fragment.clip.proximity.glsl";
import fragmentcolor from "./glsl/fragment.color.glsl";
import fragmentmaprgba from "./glsl/fragment.map.rgba.glsl";
import fragmentsolid from "./glsl/fragment.solid.glsl";
import fragmenttransparent from "./glsl/fragment.transparent.glsl";
import gridposition from "./glsl/grid.position.glsl";
import growposition from "./glsl/grow.position.glsl";
import joinposition from "./glsl/join.position.glsl";
import labelalpha from "./glsl/label.alpha.glsl";
import labelmap from "./glsl/label.map.glsl";
import labeloutline from "./glsl/label.outline.glsl";
import layerposition from "./glsl/layer.position.glsl";
import lerpdepth from "./glsl/lerp.depth.glsl";
import lerpheight from "./glsl/lerp.height.glsl";
import lerpitems from "./glsl/lerp.items.glsl";
import lerpwidth from "./glsl/lerp.width.glsl";
import lineposition from "./glsl/line.position.glsl";
import map2ddata from "./glsl/map.2d.data.glsl";
import map2ddatawrap from "./glsl/map.2d.data.wrap.glsl";
import mapxyzw2dv from "./glsl/map.xyzw.2dv.glsl";
import mapxyzwalign from "./glsl/map.xyzw.align.glsl";
import mapxyzwtexture from "./glsl/map.xyzw.texture.glsl";
import meshfragmentcolor from "./glsl/mesh.fragment.color.glsl";
import meshfragmentmap from "./glsl/mesh.fragment.map.glsl";
import meshfragmentmask from "./glsl/mesh.fragment.mask.glsl";
import meshfragmentmaterial from "./glsl/mesh.fragment.material.glsl";
import meshfragmentshaded from "./glsl/mesh.fragment.shaded.glsl";
import meshfragmenttexture from "./glsl/mesh.fragment.texture.glsl";
import meshgammain from "./glsl/mesh.gamma.in.glsl";
import meshgammaout from "./glsl/mesh.gamma.out.glsl";
import meshmapuvwo from "./glsl/mesh.map.uvwo.glsl";
import meshposition from "./glsl/mesh.position.glsl";
import meshvertexcolor from "./glsl/mesh.vertex.color.glsl";
import meshvertexmask from "./glsl/mesh.vertex.mask.glsl";
import meshvertexposition from "./glsl/mesh.vertex.position.glsl";
import moveposition from "./glsl/move.position.glsl";
import objectmaskdefault from "./glsl/object.mask.default.glsl";
import pointalphacircle from "./glsl/point.alpha.circle.glsl";
import pointalphacirclehollow from "./glsl/point.alpha.circle.hollow.glsl";
import pointalphageneric from "./glsl/point.alpha.generic.glsl";
import pointalphagenerichollow from "./glsl/point.alpha.generic.hollow.glsl";
import pointedge from "./glsl/point.edge.glsl";
import pointfill from "./glsl/point.fill.glsl";
import pointmaskcircle from "./glsl/point.mask.circle.glsl";
import pointmaskdiamond from "./glsl/point.mask.diamond.glsl";
import pointmaskdown from "./glsl/point.mask.down.glsl";
import pointmaskleft from "./glsl/point.mask.left.glsl";
import pointmaskright from "./glsl/point.mask.right.glsl";
import pointmasksquare from "./glsl/point.mask.square.glsl";
import pointmaskup from "./glsl/point.mask.up.glsl";
import pointposition from "./glsl/point.position.glsl";
import pointsizeuniform from "./glsl/point.size.uniform.glsl";
import pointsizevarying from "./glsl/point.size.varying.glsl";
import polarposition from "./glsl/polar.position.glsl";
import projectposition from "./glsl/project.position.glsl";
import projectreadback from "./glsl/project.readback.glsl";
import rawpositionscale from "./glsl/raw.position.scale.glsl";
import repeatposition from "./glsl/repeat.position.glsl";
import resamplepadding from "./glsl/resample.padding.glsl";
import resamplerelative from "./glsl/resample.relative.glsl";
import revealmask from "./glsl/reveal.mask.glsl";
import rootposition from "./glsl/root.position.glsl";
import sample2d from "./glsl/sample.2d.glsl";
import scaleposition from "./glsl/scale.position.glsl";
import screenmapstpq from "./glsl/screen.map.stpq.glsl";
import screenmapxy from "./glsl/screen.map.xy.glsl";
import screenmapxyzw from "./glsl/screen.map.xyzw.glsl";
import screenpassuv from "./glsl/screen.pass.uv.glsl";
import screenposition from "./glsl/screen.position.glsl";
import sliceposition from "./glsl/slice.position.glsl";
import sphericalposition from "./glsl/spherical.position.glsl";
import splitposition from "./glsl/split.position.glsl";
import spreadposition from "./glsl/spread.position.glsl";
import spritefragment from "./glsl/sprite.fragment.glsl";
import spriteposition from "./glsl/sprite.position.glsl";
import stereographic4position from "./glsl/stereographic4.position.glsl";
import stereographicposition from "./glsl/stereographic.position.glsl";
import stpqsample2d from "./glsl/stpq.sample.2d.glsl";
import stpqxyzw2d from "./glsl/stpq.xyzw.2d.glsl";
import strippositionnormal from "./glsl/strip.position.normal.glsl";
import stylecolor from "./glsl/style.color.glsl";
import subdividedepth from "./glsl/subdivide.depth.glsl";
import subdividedepthlerp from "./glsl/subdivide.depth.lerp.glsl";
import subdivideheight from "./glsl/subdivide.height.glsl";
import subdivideheightlerp from "./glsl/subdivide.height.lerp.glsl";
import subdivideitems from "./glsl/subdivide.items.glsl";
import subdivideitemslerp from "./glsl/subdivide.items.lerp.glsl";
import subdividewidth from "./glsl/subdivide.width.glsl";
import subdividewidthlerp from "./glsl/subdivide.width.lerp.glsl";
import surfacemaskhollow from "./glsl/surface.mask.hollow.glsl";
import surfaceposition from "./glsl/surface.position.glsl";
import surfacepositionnormal from "./glsl/surface.position.normal.glsl";
import ticksposition from "./glsl/ticks.position.glsl";
import transform3position from "./glsl/transform3.position.glsl";
import transform4position from "./glsl/transform4.position.glsl";
import viewposition from "./glsl/view.position.glsl";

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
  "ticks.position": ticksposition,
  "transform3.position": transform3position,
  "transform4.position": transform4position,
  "view.position": viewposition,
};

export * from "./factory.js";
