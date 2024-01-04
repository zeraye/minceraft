#version 300 es
precision mediump float;

uniform mat4 u_worldViewProjection;
uniform vec3 u_lightWorldPos;
uniform vec3 u_spotLightWorldPos;
uniform vec3 u_spotLightDirection;
uniform float u_spotLightInner;
uniform float u_spotLightOuter;
uniform mat4 u_world;
uniform mat4 u_viewInverse;
uniform mat4 u_worldInverseTranspose;
uniform float u_shininess;

in vec4 position;
in vec3 normal;
in vec2 texcoord;
in uint faceId;

out vec4 v_position;
out vec2 v_texCoord;
flat out uint v_faceId;
flat out float v_lambertian;
flat out float v_specular;
flat out float v_spotLight_light;
flat out float v_spotLight_specular;

void main() {
  v_faceId = faceId;
  v_texCoord = texcoord;
  v_position = u_worldViewProjection * position;
  vec3 v_normal = (u_worldInverseTranspose * vec4(normal, 0)).xyz;
  vec3 v_surfaceToLight = u_lightWorldPos - (u_world * position).xyz;
  vec3 v_surfaceToSpotLight = u_spotLightWorldPos - (u_world * position).xyz;
  vec3 v_surfaceToView = (u_viewInverse[3] - (u_world * position)).xyz;

  vec3 a_normal = normalize(v_normal);
  vec3 surfaceToLight = normalize(v_surfaceToLight);
  vec3 surfaceToView = normalize(v_surfaceToView);
  vec3 halfVector = normalize(surfaceToLight + surfaceToView);

  v_lambertian = max(dot(a_normal, surfaceToLight), 0.0);
  v_specular = (v_lambertian > 0.0) ? pow(max(0.0, dot(a_normal, halfVector)), u_shininess) : 0.0;

  // spot light
  vec3 spotLight_surfaceToLight = normalize(v_surfaceToSpotLight);
  vec3 spotLight_halfVector = normalize(v_surfaceToSpotLight + surfaceToView);
  float spotLight_dotFromDirection = dot(spotLight_surfaceToLight,-u_spotLightDirection);
  float spotLight_inLight = smoothstep(u_spotLightInner, u_spotLightOuter, spotLight_dotFromDirection);
  v_spotLight_light = spotLight_inLight * dot(a_normal, spotLight_surfaceToLight);
  v_spotLight_specular = spotLight_inLight * pow(dot(a_normal, spotLight_halfVector), u_shininess);

  gl_Position = v_position;
}
