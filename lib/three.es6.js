/**
 * @file THREE ES6
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import THREE from "./three.js";


var Matrix3 = THREE.Matrix3;
var Matrix4 = THREE.Matrix4;
var Vector2 = THREE.Vector2;
var Vector3 = THREE.Vector3;
var Quaternion = THREE.Quaternion;
var Box3 = THREE.Box3;
var Color = THREE.Color;

var FrontSide = THREE.FrontSide;
var BackSide = THREE.BackSide;
var DoubleSide = THREE.DoubleSide;
var VertexColors = THREE.VertexColors;
var NormalBlending = THREE.NormalBlending;
var AdditiveBlending = THREE.AdditiveBlending;
var SmoothShading = THREE.SmoothShading;
var FlatShading = THREE.FlatShading;
var NearestFilter = THREE.NearestFilter;
var RGBAFormat = THREE.RGBAFormat;
var FloatType = THREE.FloatType;
var HalfFloatType = THREE.HalfFloatType;
var UnsignedByteType = THREE.UnsignedByteType;

var BufferGeometry = THREE.BufferGeometry;
var BufferAttribute = THREE.BufferAttribute;

var UniformsUtils = THREE.UniformsUtils;
var UniformsLib = THREE.UniformsLib;
var Uniform = THREE.Uniform;

var Scene = THREE.Scene;
var Group = THREE.Group;
var LineSegments = THREE.LineSegments;
var Points = THREE.Points;
var Mesh = THREE.Mesh;
var Line = THREE.Line;
var LineSegments = THREE.LineSegments;
var Geometry = THREE.Geometry;
var Face3 = THREE.Face3;

var ShaderChunk = THREE.ShaderChunk;
var ShaderMaterial = THREE.ShaderMaterial;
var LineBasicMaterial = THREE.LineBasicMaterial;
var MeshPhongMaterial = THREE.MeshPhongMaterial;

var CylinderGeometry = THREE.CylinderGeometry;
var IcosahedronGeometry = THREE.IcosahedronGeometry;
var PlaneGeometry = THREE.PlaneGeometry;

var DataTexture = THREE.DataTexture;
var CanvasTexture = THREE.CanvasTexture;

var EventDispatcher = THREE.EventDispatcher;
var DefaultLoadingManager = THREE.DefaultLoadingManager;
var XHRLoader = THREE.XHRLoader;

var OrthographicCamera = THREE.OrthographicCamera;
var PerspectiveCamera = THREE.PerspectiveCamera;

var WebGLRenderer = THREE.WebGLRenderer;
var WebGLRenderTarget = THREE.WebGLRenderTarget;

var Fog = THREE.Fog;
var SpotLight = THREE.SpotLight;
var AmbientLight = THREE.AmbientLight;


// import {
//     Matrix3,
//     Matrix4,
//     Vector2,
//     Vector3,
//     Quaternion,
//     Box3,
//     Color,

//     FrontSide,
//     BackSide,
//     DoubleSide,
//     VertexColors,
//     NormalBlending,
//     AdditiveBlending,
//     SmoothShading,
//     FlatShading,
//     NearestFilter,
//     RGBAFormat,
//     FloatType,
//     HalfFloatType,
//     UnsignedByteType,

//     BufferGeometry,
//     BufferAttribute,

//     UniformsUtils,
//     UniformsLib,
//     Uniform,

//     Scene,
//     Group,
//     Points,
//     Mesh,
//     Line,
//     LineSegments,
//     Geometry,
//     Face3,

//     ShaderChunk,
//     ShaderMaterial,
//     LineBasicMaterial,
//     MeshPhongMaterial,

//     CylinderGeometry,
//     IcosahedronGeometry,
//     PlaneGeometry,

//     DataTexture,
//     CanvasTexture,

//     EventDispatcher,
//     DefaultLoadingManager,
//     XHRLoader,

//     OrthographicCamera,
//     PerspectiveCamera,

//     WebGLRenderer,
//     WebGLRenderTarget,

//     Fog,
//     SpotLight,
//     AmbientLight
// } from "../../three-jsnext/src/index.js";


export {
	Matrix3,
    Matrix4,
    Vector2,
    Vector3,
    Quaternion,
    Box3,
    Color,

    FrontSide,
    BackSide,
    DoubleSide,
    VertexColors,
    NormalBlending,
    AdditiveBlending,
    SmoothShading,
    FlatShading,
    NearestFilter,
    RGBAFormat,
    FloatType,
    HalfFloatType,
    UnsignedByteType,

    BufferGeometry,
    BufferAttribute,

    UniformsUtils,
    UniformsLib,
    Uniform,

    Scene,
    Group,
    Points,
    Mesh,
    Line,
    LineSegments,
    Geometry,
    Face3,

    ShaderChunk,
    ShaderMaterial,
    LineBasicMaterial,
    MeshPhongMaterial,

    CylinderGeometry,
    IcosahedronGeometry,
    PlaneGeometry,

    DataTexture,
    CanvasTexture,

    EventDispatcher,
    DefaultLoadingManager,
    XHRLoader,

    OrthographicCamera,
    PerspectiveCamera,

    WebGLRenderer,
    WebGLRenderTarget,

    Fog,
    SpotLight,
    AmbientLight
};
