#version 300 es
precision mediump float;

uniform mat4 matViewProj;
uniform mat4 matWorld;
uniform mat4 matNormal;

in vec3 vertexPosition;
// in vec3 vertexColor;
in vec2 vertexTexture;
in vec3 vertexNormal;

// out vec3 fragmentColor;
out vec2 fragmentTexture;
out vec3 lighting;

void main() {
  // fragmentColor = vertexColor;
  gl_Position = matViewProj * matWorld * vec4(vertexPosition, 1.0);
  fragmentTexture = vertexTexture;

  // lighting
  // vec3 ambientLight = vec3(0.3, 0.3, 0.3);
  vec3 ambientLight = vec3(0.1, 0.1, 0.1);
  vec3 directionalLightColor = vec3(1, 1, 1);
  vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

  vec4 transformedNormal = matNormal * vec4(vertexNormal, 1.0);

  float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
  lighting = ambientLight + (directionalLightColor * directional);
}
