#version 300 es
precision mediump float;

in vec4 v_position;
in vec2 v_texCoord;
in vec3 v_normal;
in vec3 v_surfaceToLight;
in vec3 v_surfaceToSpotLight;
in vec3 v_surfaceToView;
flat in uint v_faceId;

uniform vec4 u_lightColor;
uniform vec4 u_ambient;
uniform mediump sampler2DArray u_diffuse;
uniform int u_sideIndex;
uniform vec4 u_specular;
uniform float u_shininess;
uniform float u_specularFactor;
uniform vec3 u_spotLightDirection;
uniform float u_spotLightInner;
uniform float u_spotLightOuter;
uniform float u_fogNear;
uniform float u_fogFar;
uniform vec4 u_fogColor;
uniform int u_mode;

out vec4 fragColor;

void main() {
  vec4 diffuseColor = texture(u_diffuse, vec3(v_texCoord, v_faceId));
  if (v_faceId == uint(0)) {
    diffuseColor += vec4(0.0, 0.5, 0.0, 1.0);
  }

  if (u_mode == 1) {
    diffuseColor = vec4(0.0, 0.0, 1.0, 1.0);
  }

  vec3 a_normal = normalize(v_normal);
  vec3 surfaceToLight = normalize(v_surfaceToLight);
  vec3 surfaceToView = normalize(v_surfaceToView);
  vec3 halfVector = normalize(surfaceToLight + surfaceToView);

  float lambertian = max(dot(a_normal, surfaceToLight), 0.0);
  float specular = (lambertian > 0.0) ? pow(max(0.0, dot(a_normal, halfVector)), u_shininess) : 0.0;

  // spot light
  vec3 spotLight_surfaceToLight = normalize(v_surfaceToSpotLight);
  vec3 spotLight_halfVector = normalize(v_surfaceToSpotLight + surfaceToView);
  float spotLight_dotFromDirection = dot(spotLight_surfaceToLight,-u_spotLightDirection);
  float spotLight_inLight = smoothstep(u_spotLightInner, u_spotLightOuter, spotLight_dotFromDirection);
  float spotLight_light = spotLight_inLight * dot(a_normal, spotLight_surfaceToLight);
  float spotLight_specular = spotLight_inLight * pow(dot(a_normal, spotLight_halfVector), u_shininess);

  vec4 outColor = vec4(
    (u_lightColor * max(spotLight_light, 1.0) * (
      diffuseColor * u_ambient +
      diffuseColor * lambertian +
      u_specular * (specular + max(spotLight_specular, 0.0)) * u_specularFactor
    )).rgb, diffuseColor.a);

  float fogAmount = smoothstep(u_fogNear, u_fogFar, v_position.z);
  fragColor = mix(outColor, u_fogColor, fogAmount);
}
