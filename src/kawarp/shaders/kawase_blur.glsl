precision highp float;
uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_offset;
varying vec2 v_texCoord;

void main() {
  highp vec2 texelSize = 1.0 / u_resolution;
  highp vec4 color = vec4(0.0);

  color += texture2D(u_texture, v_texCoord + vec2(-u_offset, -u_offset) * texelSize);
  color += texture2D(u_texture, v_texCoord + vec2(u_offset, -u_offset) * texelSize);
  color += texture2D(u_texture, v_texCoord + vec2(-u_offset, u_offset) * texelSize);
  color += texture2D(u_texture, v_texCoord + vec2(u_offset, u_offset) * texelSize);

  gl_FragColor = color * 0.25;
}
