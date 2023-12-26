#version 300 es
precision mediump float;

uniform sampler2D uSampler;

in vec2 fragmentTexture;
in vec3 lighting;

out vec4 outputColor;

void main() {
  vec4 texelColor = texture(uSampler, fragmentTexture);
  outputColor = vec4(texelColor.rgb * lighting, texelColor.a);
}
