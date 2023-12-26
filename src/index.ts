import { glMatrix, mat4, vec3 } from "gl-matrix";
import {
  createProgram,
  createStaticVertexBuffer,
  createStaticIndexBuffer,
  CUBOID_VERTICES,
  CUBOID_INDICES,
  createPositionColorVAO,
} from "./gl";
import { Cuboid } from "./cuboid";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

(() => {
  const canvas = document.getElementById("canvas");
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
    throw new Error("Cannot get canvas element");
  }

  const gl = canvas.getContext("webgl2");
  if (!gl) {
    throw new Error("WebGL2 is not supported");
  }

  const cuboidVertexBuffer = createStaticVertexBuffer(gl, CUBOID_VERTICES);
  const cuboidIndexBuffer = createStaticIndexBuffer(gl, CUBOID_INDICES);

  const program = createProgram(gl, vertexShader, fragmentShader);

  const positionAttrib = gl.getAttribLocation(program, "vertexPosition");
  if (positionAttrib < 0) {
    throw new Error("Cannot get gl position attrib");
  }

  const colorAttrib = gl.getAttribLocation(program, "vertexColor");
  if (colorAttrib < 0) {
    throw new Error("Cannot get gl color attrib");
  }

  const matWorldUniform = gl.getUniformLocation(program, "matWorld");
  if (!matWorldUniform) {
    throw new Error("Cannot get gl mat world uniform");
  }

  const matViewProjdUniform = gl.getUniformLocation(program, "matViewProj");
  if (!matViewProjdUniform) {
    throw new Error("Cannot get gl mat view proj uniform");
  }

  const cuboidVao = createPositionColorVAO(
    gl,
    cuboidVertexBuffer,
    cuboidIndexBuffer,
    positionAttrib,
    colorAttrib
  );

  const cuboids: Cuboid[] = [
    new Cuboid(vec3.fromValues(5, 0, 0), vec3.fromValues(1, 1, 1)),
    new Cuboid(vec3.fromValues(-5, 0, 0), vec3.fromValues(1, 2, 1)),
    new Cuboid(vec3.fromValues(0, 0, 5), vec3.fromValues(1, 1, 1)),
    new Cuboid(vec3.fromValues(0, 0, -5), vec3.fromValues(1, 2, 1)),
  ];

  const viewMatrix = mat4.create();
  const projectionMatrix = mat4.create();
  const viewProjectionMatrix = mat4.create();

  const cameraPosition = vec3.fromValues(0, 1, 0);
  const cameraTarget = vec3.fromValues(0, 0, 0);
  const cameraFront = vec3.fromValues(0, 0, -1);
  const cameraUp = vec3.fromValues(0, 1, 0);

  let lastFrameTime = performance.now();
  const frame = () => {
    const currentFrameTime = performance.now();
    const dt = (currentFrameTime - lastFrameTime) / 1000;
    lastFrameTime = currentFrameTime;

    vec3.add(cameraTarget, cameraPosition, cameraFront);
    mat4.lookAt(
      viewMatrix,
      cameraPosition,
      cameraTarget /* cameraPosition + cameraFront */,
      cameraUp
    );

    mat4.perspective(
      projectionMatrix,
      glMatrix.toRadian(70),
      canvas.width / canvas.height,
      0.1,
      100.0
    );

    mat4.mul(viewProjectionMatrix, projectionMatrix, viewMatrix);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.frontFace(gl.CCW);

    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.useProgram(program);

    gl.uniformMatrix4fv(matViewProjdUniform, false, viewProjectionMatrix);

    cuboids.forEach((cuboid) => {
      cuboid.draw(gl, cuboidVao, matWorldUniform, CUBOID_INDICES.length);
    });

    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
