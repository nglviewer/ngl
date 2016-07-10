/**
 * @file THREE import
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */


import THREE from "./three.js";


var Matrix3 = THREE.Matrix3;
var Matrix4 = THREE.Matrix4;
var Vector2 = THREE.Vector2;
var Vector3 = THREE.Vector3;
var Quaternion = THREE.Quaternion;
var Sphere = THREE.Sphere;
var Box3 = THREE.Box3;
var Color = THREE.Color;

var OrthographicCamera = THREE.OrthographicCamera;
var PerspectiveCamera = THREE.PerspectiveCamera;

var EventDispatcher = THREE.EventDispatcher;
var BufferGeometry = THREE.BufferGeometry;
var BufferAttribute = THREE.BufferAttribute;
var Geometry = THREE.Geometry;
var Face3 = THREE.Face3;
var Uniform = THREE.Uniform;

var CylinderGeometry = THREE.CylinderGeometry;
var CylinderBufferGeometry = THREE.CylinderBufferGeometry;
var ConeGeometry = THREE.ConeGeometry;
var ConeBufferGeometry = THREE.ConeBufferGeometry;
var IcosahedronGeometry = THREE.IcosahedronGeometry;
var PlaneGeometry = THREE.PlaneGeometry;

var Group = THREE.Group;
var LineSegments = THREE.LineSegments;
var Points = THREE.Points;
var Mesh = THREE.Mesh;
var Line = THREE.Line;
var LineSegments = THREE.LineSegments;

var SpotLight = THREE.SpotLight;
var AmbientLight = THREE.AmbientLight;

var ShaderMaterial = THREE.ShaderMaterial;

var WebGLRenderTarget = THREE.WebGLRenderTarget;
var WebGLRenderer = THREE.WebGLRenderer;

var ShaderChunk = THREE.ShaderChunk;
var UniformsUtils = THREE.UniformsUtils;
var UniformsLib = THREE.UniformsLib;

var Fog = THREE.Fog;
var Scene = THREE.Scene;

var DataTexture = THREE.DataTexture;
var CanvasTexture = THREE.CanvasTexture;

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


export {
    Matrix3,
    Matrix4,
    Vector2,
    Vector3,
    Quaternion,
    Sphere,
    Box3,
    Color,

    OrthographicCamera,
    PerspectiveCamera,

    EventDispatcher,
    BufferGeometry,
    BufferAttribute,
    Geometry,
    Face3,
    Uniform,

    CylinderGeometry,
    CylinderBufferGeometry,
    ConeGeometry,
    ConeBufferGeometry,
    IcosahedronGeometry,
    PlaneGeometry,

    SpotLight,
    AmbientLight,

    ShaderMaterial,

    Group,
    Points,
    Mesh,
    LineSegments,
    Line,

    WebGLRenderTarget,
    WebGLRenderer,

    ShaderChunk,
    UniformsUtils,
    UniformsLib,

    Fog,
    Scene,

    DataTexture,
    CanvasTexture,

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
    UnsignedByteType
};
