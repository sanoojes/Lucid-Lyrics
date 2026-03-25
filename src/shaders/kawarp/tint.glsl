precision highp float;
uniform sampler2D u_texture;
uniform vec3 u_tintColor;
uniform float u_tintIntensity;
varying vec2 v_texCoord;

void main() {
  vec4 color = texture2D(u_texture, v_texCoord);
  float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));

  float darkMask = 1.0 - smoothstep(0.0, 0.5, luma);

  color.rgb = mix(color.rgb, u_tintColor, darkMask * u_tintIntensity);

  gl_FragColor = color;
}
