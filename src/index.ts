import phongVertexShader from "./shaders/phong/vertex.vs";
import phongFragmentShader from "./shaders/phong/fragment.fs";
import gouraudVertexShader from "./shaders/gouraud/vertex.vs";
import gouraudFragmentShader from "./shaders/gouraud/fragment.fs";
import flatVertexShader from "./shaders/flat/vertex.vs";
import flatFragmentShader from "./shaders/flat/fragment.fs";

import { glMatrix, mat4, vec3 } from "gl-matrix";
import * as twgl from "twgl.js";

const createSphereVerticesNormalsTextureCoordinatesIndices = (
  radius: number,
  sectors: number,
  stacks: number
): [Float32Array, Float32Array, Float32Array, Uint16Array] => {
  let vertices: number[] = [];
  let normals: number[] = [];
  let textureCoordinates: number[] = [];

  const lengthInv = 1.0 / radius;
  const sectorStep = (2 * Math.PI) / sectors;
  const stackStep = Math.PI / stacks;
  let x, y, z, xy;
  let sectorAngle, stackAngle;

  for (let i = 0; i <= stacks; ++i) {
    stackAngle = Math.PI / 2 - i * stackStep;
    xy = radius * Math.cos(stackAngle);
    z = radius * Math.sin(stackAngle);

    for (let j = 0; j <= sectors; ++j) {
      sectorAngle = j * sectorStep;

      x = xy * Math.cos(sectorAngle);
      y = xy * Math.sin(sectorAngle);
      vertices.push(x);
      vertices.push(y);
      vertices.push(z);

      normals.push(x * lengthInv);
      normals.push(y * lengthInv);
      normals.push(z * lengthInv);

      textureCoordinates.push(j / sectors);
      textureCoordinates.push(i / stacks);
    }
  }

  let indices: number[] = [];
  let k1, k2;
  for (let i = 0; i < stacks; ++i) {
    k1 = i * (sectors + 1);
    k2 = k1 + sectors + 1;

    for (let j = 0; j < sectors; ++j, ++k1, ++k2) {
      if (i != 0) {
        indices.push(k1);
        indices.push(k2);
        indices.push(k1 + 1);
      }

      if (i != stacks - 1) {
        indices.push(k1 + 1);
        indices.push(k2);
        indices.push(k2 + 1);
      }
    }
  }

  return [
    new Float32Array(vertices),
    new Float32Array(normals),
    new Float32Array(textureCoordinates),
    new Uint16Array(indices),
  ];
};

const createDirection = (yaw: number, pitch: number): vec3 => {
  return vec3.fromValues(
    Math.cos(glMatrix.toRadian(yaw)) * Math.cos(glMatrix.toRadian(pitch)),
    Math.sin(glMatrix.toRadian(pitch)),
    Math.sin(glMatrix.toRadian(yaw)) * Math.cos(glMatrix.toRadian(pitch))
  );
};

(() => {
  const canvas = document.getElementById("canvas");
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
    throw new Error("Cannot get canvas element");
  }

  const gl = canvas.getContext("webgl2");
  if (!gl) {
    throw new Error("WebGL2 is not supported");
  }

  const xyzNode = document.getElementById("xyz");
  const yawpitchNode = document.getElementById("yawpitch");
  const fpsNode = document.getElementById("fps");
  if (!xyzNode || !yawpitchNode || !fpsNode) {
    throw new Error("Cannot get xyz, yawpitch or fps node");
  }

  let shadersType: "phong" | "gouraud" | "flat" = "phong";

  const programs = {
    phong: twgl.createProgramInfo(gl, [phongVertexShader, phongFragmentShader]),
    gouraud: twgl.createProgramInfo(gl, [gouraudVertexShader, gouraudFragmentShader]),
    flat: twgl.createProgramInfo(gl, [flatVertexShader, flatFragmentShader]),
  };

  const tex = twgl.createTexture(gl, {
    target: gl.TEXTURE_2D_ARRAY,
    mag: gl.NEAREST,
    src: [
      "images/grass_top.png",
      "images/grass_side.png",
      "images/grass_side.png",
      "images/grass_side.png",
      "images/grass_side.png",
      "images/dirt.png",
    ],
  });

  const uniforms: { [key: string]: any } = {
    u_lightWorldPos: [-100, 100, 100],
    u_lightColor: [1, 0.8, 0.8, 1],
    u_ambient: [0.3, 0.3, 0.3, 1],
    u_specular: [1, 1, 1, 1],
    u_shininess: 50,
    u_specularFactor: 1,
    u_spotLightDirection: vec3.fromValues(0.1, -1.0, 0.0),
    u_spotLightWorldPos: vec3.fromValues(33.0, 31.0, 54.0),
    u_spotLightInner: 0.91,
    u_spotLightOuter: 0.95,
    u_fogNear: 50.0,
    u_fogFar: 100.0,
    u_fogColor: [0.98, 0.502, 0.447, 1.0],
    u_diffuse: tex,
    u_viewInverse: mat4.create(),
    u_world: mat4.create(),
    u_worldInverseTranspose: mat4.create(),
    u_worldViewProjection: mat4.create(),
    u_mode: 0,
    u_day: true,
  };

  // shaders and day/night options
  const shaders = document.getElementById("shaders");
  if (!shaders || !(shaders instanceof HTMLSelectElement)) {
    throw new Error("Cannot get shaders element");
  }

  shaders.addEventListener("change", () => {
    shadersType = shaders.value as "phong" | "gouraud" | "flat";
  });

  const daynight = document.getElementById("daynight");
  if (!daynight || !(daynight instanceof HTMLSelectElement)) {
    throw new Error("Cannot get daynight element");
  }

  daynight.addEventListener("change", () => {
    uniforms.u_day = daynight.value === "day";
  });

  const cubeArrays = {
    position: [
      1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1,
      -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1, -1, 1, 1,
      -1, 1, -1, -1, -1, -1, -1,
    ],
    normal: [
      1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
      -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
    ],
    texcoord: [
      1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1,
      1, 1, 1, 0, 0, 0, 0, 1, 1, 1,
    ],
    faceId: {
      numComponents: 1,
      data: new Uint8Array([2, 2, 2, 2, 1, 1, 1, 1, 0, 0, 0, 0, 5, 5, 5, 5, 3, 3, 3, 3, 4, 4, 4, 4]),
    },
    indices: [
      0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21,
      22, 20, 22, 23,
    ],
  };
  const cubeBufferInfo = twgl.createBufferInfoFromArrays(gl, cubeArrays);

  const preSphereArrays = createSphereVerticesNormalsTextureCoordinatesIndices(2, 20, 20);
  const sphereArrays = {
    position: preSphereArrays[0],
    normal: preSphereArrays[1],
    texcoord: preSphereArrays[2],
    faceId: { numComponents: 1, data: new Uint8Array(preSphereArrays[2].length / 2) },
    indices: preSphereArrays[3],
  };

  const sphereBufferInfo = twgl.createBufferInfoFromArrays(gl, sphereArrays);

  const view = mat4.create();
  const projection = mat4.create();
  const viewProjection = mat4.create();

  const camPosition = vec3.fromValues(33, 31, 54);
  const camTarget = vec3.fromValues(0, 0, 0);
  const camFront = vec3.fromValues(0, 0, -1);
  const camUp = vec3.fromValues(0, 1, 0);

  let yaw = 0.0;
  let pitch = 0.0;
  const direction = createDirection(yaw, pitch);
  vec3.normalize(camFront, direction);

  const cameraSpeed = 0.5;
  const timers: { [key: string]: () => void } = {
    w: () => {
      const beforeY = camPosition[1];
      vec3.scaleAndAdd(camPosition, camPosition, camFront, cameraSpeed);
      camPosition[1] = beforeY;
    },
    s: () => {
      const beforeY = camPosition[1];
      vec3.scaleAndAdd(camPosition, camPosition, camFront, -cameraSpeed);
      camPosition[1] = beforeY;
    },
    a: () => {
      const cameraCrossFront = vec3.fromValues(0, 0, 0);
      vec3.cross(cameraCrossFront, camFront, camUp);
      vec3.normalize(cameraCrossFront, cameraCrossFront);
      vec3.scaleAndAdd(camPosition, camPosition, cameraCrossFront, -cameraSpeed);
    },
    d: () => {
      const cameraCrossFront = vec3.fromValues(0, 0, 0);
      vec3.cross(cameraCrossFront, camFront, camUp);
      vec3.normalize(cameraCrossFront, cameraCrossFront);
      vec3.scaleAndAdd(camPosition, camPosition, cameraCrossFront, cameraSpeed);
    },
    Shift: () => {
      vec3.scaleAndAdd(camPosition, camPosition, camUp, -cameraSpeed);
    },
    " ": () => {
      vec3.scaleAndAdd(camPosition, camPosition, camUp, cameraSpeed);
    },
  };
  const keys: { [key: string]: boolean } = { w: false, s: false, a: false, d: false, Shift: false, " ": false };
  const intervalIds: { [key: string]: NodeJS.Timeout | -1 } = { w: -1, s: -1, a: -1, d: -1, Shift: -1, " ": -1 };

  const keydownEventFn = (event: KeyboardEvent) => {
    const key = event.key;
    if (!(key in timers)) return;

    if (!keys[key] && intervalIds[key] == -1) {
      keys[key] = true;
      intervalIds[key] = setInterval(timers[key], 25);
    }
  };

  const keyupEventFn = (event: KeyboardEvent) => {
    const key = event.key;
    if (!(key in timers)) return;

    if (keys[key] && intervalIds[key] != -1) {
      keys[key] = false;
      clearInterval(intervalIds[key]);
      intervalIds[key] = -1;
    }
  };

  const mousemoveEventFn = (event: MouseEvent) => {
    const sensitivity = 0.1;

    yaw += event.movementX * sensitivity;
    pitch -= event.movementY * sensitivity;

    // Angle isn't 90 degrees, because at 90 degrees
    // camera don't render shapes, cameraFront is (0,1,0)
    const ALMOST_RIGHT_ANGLE = 89.9;

    if (pitch > ALMOST_RIGHT_ANGLE) pitch = ALMOST_RIGHT_ANGLE;
    if (pitch < -ALMOST_RIGHT_ANGLE) pitch = -ALMOST_RIGHT_ANGLE;

    const direction = createDirection(yaw, pitch);
    vec3.normalize(camFront, direction);
  };

  let isPointerLock = false;
  document.onpointerlockchange = (e: Event) => {
    if (isPointerLock) {
      // keyboard movement
      document.removeEventListener("keyup", keyupEventFn);
      document.removeEventListener("keydown", keydownEventFn);

      // mouse movement
      canvas.removeEventListener("mousemove", mousemoveEventFn);
    } else {
      // keyboard movement
      document.addEventListener("keyup", keyupEventFn);
      document.addEventListener("keydown", keydownEventFn);

      // mouse movement
      canvas.addEventListener("mousemove", mousemoveEventFn);
    }

    isPointerLock = !isPointerLock;
  };

  // lock mouse mode
  canvas.addEventListener("click", () => {
    canvas.requestPointerLock();
  });

  let cameraType: "free" | "scene" | "tracking" | "following" = "free";

  const cameraElement = document.getElementById("camera");
  if (!cameraElement || !(cameraElement instanceof HTMLSelectElement)) {
    throw new Error("Cannot get camera element");
  }

  cameraElement.addEventListener("change", () => {
    cameraType = cameraElement.value as "free" | "scene" | "tracking" | "following";
  });

  const calcViewProjection = () => {
    switch (cameraType) {
      case "free": {
        vec3.add(camTarget, camPosition, camFront);
        mat4.lookAt(view, camPosition, camTarget, camUp);
        break;
      }
      case "scene": {
        const _camPosition = vec3.fromValues(5, 50, 5);
        const _camTarget = vec3.fromValues(40, 31, 50);
        mat4.lookAt(view, _camPosition, _camTarget, camUp);
        break;
      }
      case "following": {
        vec3.add(camTarget, uniforms.u_spotLightWorldPos, vec3.normalize(vec3.create(), uniforms.u_spotLightDirection));
        mat4.lookAt(view, uniforms.u_spotLightWorldPos, camTarget, camUp);
        break;
      }
      case "tracking": {
        const _camPosition = vec3.fromValues(32, 50, 60);
        mat4.lookAt(view, _camPosition, uniforms.u_spotLightWorldPos, camUp);
        break;
      }
      default:
        throw new Error("Invalid camera type: " + cameraType);
    }

    mat4.perspective(projection, glMatrix.toRadian(70), canvas.width / canvas.height, 0.1, 1000.0);
    mat4.mul(viewProjection, projection, view);

    return { viewProjection, view };
  };

  const blocks: vec3[] = [];

  const image = new Image(50, 50);
  image.onload = () => {
    const ctx = document.createElement("canvas").getContext("2d");

    if (!ctx) {
      throw new Error("Cannot get canvas context for heightmap");
    }

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const rgba = ctx.getImageData(0, 0, image.width, image.height).data;
    const width = image.width;
    const n = rgba.length;
    for (let i = 0; i < n; i += 4) {
      const x = Math.floor((i / 4) % width) % n;
      const y = Math.floor(i / (4 * width)) % n;
      const rgb = rgba[i] + rgba[+1] + rgba[i + 2];
      blocks.push(vec3.fromValues(x * 2, 2 * Math.floor(rgb / (3 * 15)), y * 2));
    }
  };

  image.src = "images/heightmap.jpg";

  let angle = 0;
  let lastFrameTime = performance.now();
  const frame = () => {
    const currentFrameTime = performance.now();
    const dt = (currentFrameTime - lastFrameTime) / 1000;
    const fps = 1000 / (currentFrameTime - lastFrameTime);

    angle += dt;
    lastFrameTime = currentFrameTime;

    twgl.resizeCanvasToDisplaySize(canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    const { viewProjection, view } = calcViewProjection();

    const programInfo = programs[shadersType];
    gl.useProgram(programInfo.program);

    twgl.setBuffersAndAttributes(gl, programInfo, cubeBufferInfo);

    uniforms.u_viewInverse = mat4.invert(mat4.create(), view);

    // draw (dirt) blocks
    for (let i = 0; i < blocks.length; ++i) {
      const world = mat4.fromTranslation(mat4.create(), blocks[i]);

      uniforms.u_world = world;
      uniforms.u_worldInverseTranspose = mat4.transpose(mat4.create(), mat4.invert(mat4.create(), world));
      uniforms.u_worldViewProjection = mat4.multiply(mat4.create(), viewProjection, world);
      uniforms.u_mode = 0;

      twgl.setUniforms(programInfo, uniforms);
      gl.drawElements(gl.TRIANGLES, cubeBufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
    }

    // draw single circle
    {
      twgl.setBuffersAndAttributes(gl, programInfo, sphereBufferInfo);
      const world = mat4.fromTranslation(mat4.create(), uniforms.u_spotLightWorldPos);

      uniforms.u_spotLightWorldPos = vec3.fromValues(33 + 10 * Math.cos(angle), 31, 54 + 10 * Math.sin(angle));

      uniforms.u_world = world;
      uniforms.u_worldInverseTranspose = mat4.transpose(mat4.create(), mat4.invert(mat4.create(), world));
      uniforms.u_worldViewProjection = mat4.multiply(mat4.create(), viewProjection, world);
      uniforms.u_mode = 1;

      twgl.setUniforms(programInfo, uniforms);
      gl.drawElements(gl.TRIANGLES, sphereBufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
    }

    xyzNode.textContent = `${camPosition[0].toFixed(0)}, ${camPosition[1].toFixed(0)}, ${camPosition[2].toFixed(0)}`;
    yawpitchNode.textContent = `${yaw.toFixed(0)}, ${pitch.toFixed(0)}`;
    fpsNode.textContent = `${fps.toFixed(0)}`;

    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
