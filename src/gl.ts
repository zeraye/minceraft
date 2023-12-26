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
