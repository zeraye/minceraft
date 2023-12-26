import { glMatrix, vec3 } from "gl-matrix";

const createStaticBuffer = (
  gl: WebGL2RenderingContext,
  data: ArrayBuffer,
  target: number
): WebGLBuffer => {
  const buffer = gl.createBuffer();
  if (!buffer) {
    throw new Error("Cannot create gl buffer");
  }

  gl.bindBuffer(target, buffer);
  gl.bufferData(target, data, gl.STATIC_DRAW);
  gl.bindBuffer(target, null);

  return buffer;
};
export const createStaticVertexBuffer = (
  gl: WebGL2RenderingContext,
  data: ArrayBuffer
): WebGLBuffer => {
  return createStaticBuffer(gl, data, gl.ARRAY_BUFFER);
};

export const createStaticIndexBuffer = (
  gl: WebGL2RenderingContext,
  data: ArrayBuffer
): WebGLBuffer => {
  return createStaticBuffer(gl, data, gl.ELEMENT_ARRAY_BUFFER);
};

export const createProgram = (
  gl: WebGL2RenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string
): WebGLProgram => {
  const program = gl.createProgram();
  if (!program) {
    throw new Error("Cannot create gl program");
  }

  createShader(gl, program, vertexShaderSource, gl.VERTEX_SHADER);
  createShader(gl, program, fragmentShaderSource, gl.FRAGMENT_SHADER);

  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Cannot link gl program. ${gl.getProgramInfoLog(program)}`);
  }

  return program;
};

const createShader = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  shaderSource: string,
  shaderType: number
): void => {
  const shader = gl.createShader(shaderType);

  if (!shader) {
    throw new Error("Cannot create gl shader");
  }

  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`Cannot compile gl shader. ${gl.getShaderInfoLog(shader)}`);
  }

  gl.attachShader(program, shader);
};

export const CUBOID_VERTICES = new Float32Array([
  // Front face
  -1.0, -1.0, 1.0, 1, 0, 0, 1.0, -1.0, 1.0, 1, 0, 0, 1.0, 1.0, 1.0, 1, 0, 0,
  -1.0, 1.0, 1.0, 1, 0, 0,

  // Back face
  -1.0, -1.0, -1.0, 1, 0, 0, -1.0, 1.0, -1.0, 1, 0, 0, 1.0, 1.0, -1.0, 1, 0, 0,
  1.0, -1.0, -1.0, 1, 0, 0,

  // Top face
  -1.0, 1.0, -1.0, 0, 1, 0, -1.0, 1.0, 1.0, 0, 1, 0, 1.0, 1.0, 1.0, 0, 1, 0,
  1.0, 1.0, -1.0, 0, 1, 0,

  // Bottom face
  -1.0, -1.0, -1.0, 0, 1, 0, 1.0, -1.0, -1.0, 0, 1, 0, 1.0, -1.0, 1.0, 0, 1, 0,
  -1.0, -1.0, 1.0, 0, 1, 0,

  // Right face
  1.0, -1.0, -1.0, 0, 0, 1, 1.0, 1.0, -1.0, 0, 0, 1, 1.0, 1.0, 1.0, 0, 0, 1,
  1.0, -1.0, 1.0, 0, 0, 1,

  // Left face
  -1.0, -1.0, -1.0, 0, 0, 1, -1.0, -1.0, 1.0, 0, 0, 1, -1.0, 1.0, 1.0, 0, 0, 1,
  -1.0, 1.0, -1.0, 0, 0, 1,
]);

export const CUBOID_INDICES = new Uint16Array([
  // Front
  0, 1, 2, 0, 2, 3,
  // Back
  4, 5, 6, 4, 6, 7,
  // Top
  8, 9, 10, 8, 10, 11,
  // Bottom
  12, 13, 14, 12, 14, 15,
  // Right
  16, 17, 18, 16, 18, 19,
  // Left
  20, 21, 22, 20, 22, 23,
]);

export const TEXTURE_COORDINATES = new Float32Array([
  // Front
  0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
  // Back
  0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
  // Top
  0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
  // Bottom
  0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
  // Right
  0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
  // Left
  0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
]);

export const VERTEX_NORMALS = new Float32Array([
  // Front
  0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
  // Back
  0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
  // Top
  0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
  // Bottom
  0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
  // Right
  1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
  // Left
  -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
]);

export const createPositionColorVAO = (
  gl: WebGL2RenderingContext,
  vertexBuffer: WebGLBuffer,
  indexBuffer: WebGLBuffer,
  positionAttribLocation: number,
  colorAttribLocation: number
): WebGLVertexArrayObject => {
  const vao = gl.createVertexArray();
  if (!vao) {
    throw new Error("Cannot create gl vertex array");
  }

  gl.bindVertexArray(vao);

  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(colorAttribLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // format: xyzrgb xyzrgb ...
  gl.vertexAttribPointer(
    positionAttribLocation,
    3,
    gl.FLOAT,
    false,
    6 * Float32Array.BYTES_PER_ELEMENT,
    0
  );
  gl.vertexAttribPointer(
    colorAttribLocation,
    3,
    gl.FLOAT,
    false,
    6 * Float32Array.BYTES_PER_ELEMENT,
    3 * Float32Array.BYTES_PER_ELEMENT
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  gl.bindVertexArray(null);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return vao;
};

export const createPositionTextureNormalsVAO = (
  gl: WebGL2RenderingContext,
  vertexBuffer: WebGLBuffer,
  indexBuffer: WebGLBuffer,
  textureBuffer: WebGLBuffer,
  normalsBuffer: WebGLBuffer,
  texture: WebGLTexture,
  positionAttribLocation: number,
  textureAttribLocation: number,
  normalAttribLocation: number
): WebGLVertexArrayObject => {
  const vao = gl.createVertexArray();
  if (!vao) {
    throw new Error("Cannot create gl vertex array");
  }

  gl.bindVertexArray(vao);

  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(textureAttribLocation);
  gl.enableVertexAttribArray(normalAttribLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // format: xyzrgb xyzrgb ...
  gl.vertexAttribPointer(
    positionAttribLocation,
    3,
    gl.FLOAT,
    false,
    6 * Float32Array.BYTES_PER_ELEMENT,
    0
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);

  gl.vertexAttribPointer(textureAttribLocation, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);

  gl.vertexAttribPointer(normalAttribLocation, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  gl.bindVertexArray(null);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return vao;
};

export const createDirection = (yaw: number, pitch: number): vec3 => {
  return vec3.fromValues(
    Math.cos(glMatrix.toRadian(yaw)) * Math.cos(glMatrix.toRadian(pitch)),
    Math.sin(glMatrix.toRadian(pitch)),
    Math.sin(glMatrix.toRadian(yaw)) * Math.cos(glMatrix.toRadian(pitch))
  );
};

const powOf2 = (number: number): boolean => {
  return (number & (number - 1)) === 0;
};

// Source: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL#loading_textures
export const loadTexture = (
  gl: WebGL2RenderingContext,
  url: string
): WebGLTexture => {
  const texture = gl.createTexture();
  if (!texture) {
    throw new Error("Cannot create gl texture");
  }

  const target = gl.TEXTURE_2D;
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const format = gl.RGBA;
  const type = gl.UNSIGNED_BYTE;
  const pixels = new Uint8Array([0, 255, 0, 255]);

  // Image can load some time. Before this, set texture full green.
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    target,
    level,
    internalFormat,
    width,
    height,
    border,
    format,
    type,
    pixels
  );

  const image = new Image();
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(target, level, internalFormat, format, type, image);

    if (powOf2(image.width) && powOf2(image.height)) {
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  return texture;
};
