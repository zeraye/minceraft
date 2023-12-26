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

