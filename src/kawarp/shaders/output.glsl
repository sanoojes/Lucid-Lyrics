precision highp float;
uniform sampler2D u_texture;
uniform float u_saturation;
uniform float u_dithering;
uniform float u_time;
uniform float u_scale;
uniform vec2 u_resolution;
varying vec2 v_texCoord;

highp float hash(highp vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}

void main() {
  vec2 uv = (v_texCoord - 0.5) / u_scale + 0.5;
  uv = clamp(uv, 0.0, 1.0);

  vec4 color = texture2D(u_texture, uv);

  vec2 center = v_texCoord - 0.5;
  float vignette = 1.0 - dot(center, center) * 0.3;
  color.rgb *= vignette;

  float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  color.rgb = mix(vec3(gray), color.rgb, u_saturation);

  highp vec2 pixelPos = floor(v_texCoord * u_resolution);
  highp float noise = hash(vec3(pixelPos, floor(u_time * 60.0)));
  color.rgb += (noise - 0.5) * u_dithering;

  gl_FragColor = color;
}
