#version 300 es
precision mediump float;

in vec4 v_position;
in vec2 v_texCoord;
flat in uint v_faceId;
in float v_lambertian;
in float v_specular;
in float v_spotLight_light;
in float v_spotLight_specular;

uniform vec4 u_lightColor;
uniform vec4 u_ambient;
uniform mediump sampler2DArray u_diffuse;
uniform int u_sideIndex;
uniform vec4 u_specular;
uniform float u_specularFactor;
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

  vec4 outColor = vec4((u_lightColor * max(v_spotLight_light, 1.0) * (
      diffuseColor * u_ambient +
      diffuseColor * v_lambertian +
      u_specular * (v_specular + max(v_spotLight_specular, 0.0)) * u_specularFactor
    )).rgb, diffuseColor.a);

  float fogAmount = smoothstep(u_fogNear, u_fogFar, v_position.z);
  fragColor = mix(outColor, u_fogColor, fogAmount);
}
