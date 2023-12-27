import { mat4, quat, vec3 } from "gl-matrix";

export const createSphereVerticesNormalsTextureCoordinatesIndices = (
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

export class Sphere {
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
