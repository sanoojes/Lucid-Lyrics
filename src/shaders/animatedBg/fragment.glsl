precision highp float;

uniform sampler2D tMap;
uniform sampler2D tPrevMap;

uniform float uTime;
uniform float uFade;
uniform float uBrightness;
uniform float uSaturation;
uniform float uContrast;
uniform float uOpacity; 
uniform vec2 uResolution;

const vec2 CENTER = vec2(0.5, 0.5);

float easeFade(float t) {
  t = clamp(t, 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

float hash21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}

float smoothNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

vec2 rotateAround(vec2 point, vec2 pivot, float angle) {
  vec2 o = point - pivot;
  float s = sin(angle), c = cos(angle);
  return pivot + mat2(c, -s, s, c) * o;
}

vec4 sampleBlended(vec2 uv, float angle, float distAmt) {
  float n = smoothNoise(uv * 2.5 + uTime * 0.15) * 2.0 - 1.0;
  vec2 distUV = uv + vec2(n, -n) * distAmt;

  vec2 rotated = rotateAround(distUV, CENTER, angle);
  rotated.y = 1.0 - rotated.y;

  vec4 prev = texture2D(tPrevMap, rotated);
  vec4 curr = texture2D(tMap, rotated);
  return mix(prev, curr, easeFade(uFade));
}

float circleMask(vec2 offset, float radius, float feather) {
  float d = length(offset);
  return 1.0 - smoothstep(radius - feather, radius, d);
}

vec4 over(vec4 src, vec4 dst) {
  float a = src.a + dst.a * (1.0 - src.a);
  vec3 rgb = (a > 0.0) ? (src.rgb * src.a + dst.rgb * dst.a * (1.0 - src.a)) / a : vec3(0.0);
  return vec4(rgb, a);
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 center = uResolution * 0.5;
  float minDim = min(uResolution.x, uResolution.y);
  float aspect = uResolution.x / uResolution.y;

  vec4 finalColor = vec4(0.0);
  {
    float r = length(uResolution) * 1.2;
    vec2 off = fc - center;
    vec2 uv = (off / r + 1.0) * 0.5;
    finalColor = over(sampleBlended(uv, uTime * -0.1, 0.15), finalColor);
    finalColor.a = 1.0;
  }

  {
    float ox = sin(uTime * 0.15) * uResolution.x * 0.35;
    float oy = cos(uTime * 0.22) * uResolution.y * 0.35;
    vec2 orig = center + vec2(ox, oy);
    float r = minDim * 0.9;
    float feather = r * 0.6;
    vec2 off = fc - orig;
    float mask = circleMask(off, r, feather);
    if(mask > 0.001) {
      vec2 uv = (off / r + 1.0) * 0.5;
      vec4 col = sampleBlended(uv, uTime * 0.4, 0.25);
      col.a *= mask * 0.6;
      finalColor = over(col, finalColor);
    }
  }

  {
    float ox = cos(uTime * 0.18 + 1.5) * uResolution.x * 0.4;
    float oy = sin(uTime * 0.13 + 2.5) * uResolution.y * 0.3;
    vec2 orig = center + vec2(ox, oy);
    float r = minDim * 0.8;
    float feather = r * 0.6;
    vec2 off = fc - orig;
    float mask = circleMask(off, r, feather);
    if(mask > 0.001) {
      vec2 uv = (off / r + 1.0) * 0.5;
      vec4 col = sampleBlended(uv, uTime * -0.35, 0.25);
      col.a *= mask * 0.6;
      finalColor = over(col, finalColor);
    }
  }

  {
    float ox = sin(uTime * 0.11 + 3.1) * uResolution.x * 0.3;
    float oy = cos(uTime * 0.19 + 4.2) * uResolution.y * 0.4;
    vec2 orig = center + vec2(ox, oy);
    float r = minDim * 0.7;
    float feather = r * 0.6;
    vec2 off = fc - orig;
    float mask = circleMask(off, r, feather);
    if(mask > 0.001) {
      vec2 uv = (off / r + 1.0) * 0.5;
      vec4 col = sampleBlended(uv, uTime * 0.5, 0.2);
      col.a *= mask * 0.7;
      finalColor = over(col, finalColor);
    }
  }

  {
    float ox = cos(uTime * 0.25 + 5.0) * uResolution.x * 0.45;
    float oy = sin(uTime * 0.21 + 1.0) * uResolution.y * 0.45;
    vec2 orig = center + vec2(ox, oy);
    float r = minDim * 0.5;
    float feather = r * 0.6;
    vec2 off = fc - orig;
    float mask = circleMask(off, r, feather);
    if(mask > 0.001) {
      vec2 uv = (off / r + 1.0) * 0.5;
      vec4 col = sampleBlended(uv, uTime * -0.6, 0.3);
      col.a *= mask * 0.5;
      finalColor = over(col, finalColor);
    }
  }

  {
    vec2 uv = fc / uResolution;
    float vign = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
    vign = pow(vign * 16.0, 0.35);
    finalColor.rgb *= mix(0.60, 1.0, vign);
  }

  finalColor.rgb *= uBrightness;

  float gray = dot(finalColor.rgb, vec3(0.299, 0.587, 0.114));
  finalColor.rgb = mix(vec3(gray), finalColor.rgb, uSaturation);

  finalColor.rgb = (finalColor.rgb - 0.5) * uContrast + 0.5;

  {
    float luma = dot(finalColor.rgb, vec3(0.299, 0.587, 0.114));
    float edge = smoothstep(0.55, 0.85, luma) * 0.018;
    finalColor.r = clamp(finalColor.r + edge, 0.0, 1.0);
    finalColor.b = clamp(finalColor.b - edge, 0.0, 1.0);
  }

  gl_FragColor = vec4(finalColor.rgb, finalColor.a * uOpacity);
}
