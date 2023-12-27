import { glMatrix, mat4, vec3 } from "gl-matrix";
import {
  createProgram,
  createStaticVertexBuffer,
  createStaticIndexBuffer,
  CUBOID_VERTICES,
  CUBOID_INDICES,
  TEXTURE_COORDINATES,
  VERTEX_NORMALS,
  createPositionTextureNormalsVAO,
  createDirection,
  loadTexture,
} from "./gl";
import { Cuboid } from "./cuboid";
import directionalVertexShader from "./shaders/directional/vertex.vs";
import directionalFragmentShader from "./shaders/directional/fragment.fs";

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
  const catTexture = loadTexture(gl, "images/cat.jpg");
  const catTextureCoordinatesBuffer = createStaticVertexBuffer(
    gl,
    TEXTURE_COORDINATES
  );
  const cuboidNormalsBuffer = createStaticVertexBuffer(gl, VERTEX_NORMALS);

  const program = createProgram(
    gl,
    directionalVertexShader,
    directionalFragmentShader
  );

  const positionAttrib = gl.getAttribLocation(program, "vertexPosition");
  if (positionAttrib < 0) {
    throw new Error("Cannot get gl position attrib");
  }

  const textureAttrib = gl.getAttribLocation(program, "vertexTexture");
  if (textureAttrib < 0) {
    throw new Error("Cannot get gl vertex texture");
  }

  const normalAttrib = gl.getAttribLocation(program, "vertexNormal");
  if (normalAttrib < 0) {
    throw new Error("Cannot get gl vertex normal");
  }

  const matWorldUniform = gl.getUniformLocation(program, "matWorld");
  if (!matWorldUniform) {
    throw new Error("Cannot get gl mat world uniform");
  }

  const matViewProjdUniform = gl.getUniformLocation(program, "matViewProj");
  if (!matViewProjdUniform) {
    throw new Error("Cannot get gl mat view proj uniform");
  }

  const matNormalUniform = gl.getUniformLocation(program, "matNormal");
  if (!matNormalUniform) {
    throw new Error("Cannot get gl mat normal uniform");
  }

  // NOTE: temporary don't use viewPosition, because directional shaders don't use them
  // const viewPositionUniform = gl.getUniformLocation(program, "viewPosition");
  // if (!viewPositionUniform) {
  //   throw new Error("Cannot get gl view position uniform");
  // }

  const uSamplerUniform = gl.getUniformLocation(program, "uSampler");
  if (!uSamplerUniform) {
    throw new Error("Cannot get gl sampler");
  }

  const cuboidVao = createPositionTextureNormalsVAO(
    gl,
    cuboidVertexBuffer,
    cuboidIndexBuffer,
    catTextureCoordinatesBuffer,
    cuboidNormalsBuffer,
    catTexture,
    positionAttrib,
    textureAttrib,
    normalAttrib
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

  let yaw = 0.0;
  let pitch = 0.0;
  const direction = createDirection(yaw, pitch);
  vec3.normalize(cameraFront, direction);

  document.addEventListener("keydown", (event: KeyboardEvent) => {
    const cameraSpeed = 0.1;

    switch (event.key) {
      case "w": {
        vec3.scaleAndAdd(
          cameraPosition,
          cameraPosition,
          cameraFront,
          cameraSpeed
        );
        break;
      }
      case "s": {
        vec3.scaleAndAdd(
          cameraPosition,
          cameraPosition,
          cameraFront,
          -cameraSpeed
        );
        break;
      }
      case "a": {
        const cameraCrossFront = vec3.fromValues(0, 0, 0);
        vec3.cross(cameraCrossFront, cameraFront, cameraUp);
        vec3.normalize(cameraCrossFront, cameraCrossFront);
        vec3.scaleAndAdd(
          cameraPosition,
          cameraPosition,
          cameraCrossFront,
          -cameraSpeed
        );
        break;
      }
      case "d": {
        const cameraCrossFront = vec3.fromValues(0, 0, 0);
        vec3.cross(cameraCrossFront, cameraFront, cameraUp);
        vec3.normalize(cameraCrossFront, cameraCrossFront);
        vec3.scaleAndAdd(
          cameraPosition,
          cameraPosition,
          cameraCrossFront,
          cameraSpeed
        );
        break;
      }
      default: {
        break;
      }
    }
  });

  canvas.addEventListener("mousemove", (event: MouseEvent) => {
    const sensitivity = 0.1;

    yaw += event.movementX * sensitivity;
    pitch -= event.movementY * sensitivity;

    // Angle isn't 90 degrees, because at 90 degrees
    // camera don't render shapes, cameraFront is (0,1,0)
    const ALMOST_RIGHT_ANGLE = 89.9;

    if (pitch > ALMOST_RIGHT_ANGLE) pitch = ALMOST_RIGHT_ANGLE;
    if (pitch < -ALMOST_RIGHT_ANGLE) pitch = -ALMOST_RIGHT_ANGLE;

    const direction = createDirection(yaw, pitch);
    vec3.normalize(cameraFront, direction);
  });

  canvas.addEventListener("click", async () => {
    canvas.requestPointerLock();
  });

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

    // NOTE: temporary don't use viewPosition, because directional shaders don't use them
    // gl.uniform3fv(viewPositionUniform, cameraPosition);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, catTexture);
    gl.uniform1i(uSamplerUniform, 0);

    cuboids.forEach((cuboid) => {
      cuboid.draw(
        gl,
        cuboidVao,
        matWorldUniform,
        matNormalUniform,
        CUBOID_INDICES.length
      );
    });

    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
