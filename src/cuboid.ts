import { mat4, quat, vec3 } from "gl-matrix";

export class Cuboid {
  private matWorld = mat4.create();
  private matNormal = mat4.create();
  private defaultRotation = quat.create();

  constructor(private readonly position: vec3, private readonly scale: vec3) {
    quat.identity(this.defaultRotation);
  }

  draw(
    gl: WebGL2RenderingContext,
    vao: WebGLVertexArrayObject,
    matWorldUniform: WebGLUniformLocation,
    matNormalUniform: WebGLUniformLocation,
    numIndices: number
  ) {
    mat4.identity(this.matWorld);
    mat4.fromRotationTranslationScale(
      this.matWorld,
      this.defaultRotation,
      this.position,
      this.scale
    );
    gl.uniformMatrix4fv(matWorldUniform, false, this.matWorld);

    mat4.invert(this.matNormal, this.matWorld);
    mat4.transpose(this.matNormal, this.matNormal);
    gl.uniformMatrix4fv(matNormalUniform, false, this.matNormal);

    gl.bindVertexArray(vao);
    gl.drawElements(gl.TRIANGLES, numIndices, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
  }
}
