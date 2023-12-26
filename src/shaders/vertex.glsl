#version 300 es
precision mediump float;

uniform mat4 matViewProj;
uniform mat4 matWorld;

in vec3 vertexPosition;
// in vec3 vertexColor;
in vec2 vertexTexture;

// out vec3 fragmentColor;
out vec2 fragmentTexture;

void main() {
  // fragmentColor = vertexColor;
  gl_Position = matViewProj * matWorld * vec4(vertexPosition, 1.0);
  fragmentTexture = vertexTexture;
}
