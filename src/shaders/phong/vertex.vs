#version 300 es
precision mediump float;

uniform mat4 u_worldViewProjection;
uniform vec3 u_lightWorldPos;
uniform vec3 u_spotLightWorldPos;
uniform mat4 u_world;
uniform mat4 u_viewInverse;
uniform mat4 u_worldInverseTranspose;

in vec4 position;
in vec3 normal;
in vec2 texcoord;
in uint faceId;

out vec4 v_position;
out vec2 v_texCoord;
out vec3 v_normal;
out vec3 v_surfaceToLight;
out vec3 v_surfaceToSpotLight;
out vec3 v_surfaceToView;
flat out uint v_faceId;

void main() {
  v_faceId = faceId;
  v_texCoord = texcoord;
  v_position = u_worldViewProjection * position;
  v_normal = (u_worldInverseTranspose * vec4(normal, 0)).xyz;
  v_surfaceToLight = u_lightWorldPos - (u_world * position).xyz;
  v_surfaceToSpotLight = u_spotLightWorldPos - (u_world * position).xyz;
  v_surfaceToView = (u_viewInverse[3] - (u_world * position)).xyz;
  gl_Position = v_position;
}
