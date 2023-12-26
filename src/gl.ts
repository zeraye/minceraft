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
