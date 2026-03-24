precision highp float;
uniform sampler2D u_texture1;
uniform sampler2D u_texture2;
uniform float u_blend;
varying vec2 v_texCoord;

void main() {
  vec4 color1 = texture2D(u_texture1, v_texCoord);
  vec4 color2 = texture2D(u_texture2, v_texCoord);
  gl_FragColor = mix(color1, color2, u_blend);
}
