#version 300 es
precision mediump float;

uniform sampler2D uSampler;

// in vec3 fragmentColor;
in vec2 fragmentTexture;

out vec4 outputColor;

void main() {
  // outputColor = vec4(fragmentColor, 1.0);
  outputColor = texture(uSampler, fragmentTexture);
}
