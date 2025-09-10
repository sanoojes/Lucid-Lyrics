import { Vector2, type Vector3 } from 'three';

export type ShaderUniforms = {
  iTime: { value: number };
  iResolution: { value: Vector2 };
  uColor1: { value: Vector3 };
  uColor2: { value: Vector3 };
  uColor3: { value: Vector3 };
  uColor4: { value: Vector3 };
  uColor5: { value: Vector3 };
  uColor6: { value: Vector3 };
  uColor7: { value: Vector3 };
  uColor8: { value: Vector3 };
};

const UNIFORMS = `
uniform vec2 iResolution;
uniform float iTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform vec3 uColor5;
uniform vec3 uColor6;
uniform vec3 uColor7;
uniform vec3 uColor8;
`;

const FRAGMENT_BODY = `
#define S(a,b,t) smoothstep(a,b,t)

mat2 Rot(float a)
{
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

vec2 hash( vec2 p )
{
  p = vec2( dot(p,vec2(2127.1,81.17)), dot(p,vec2(1269.5,283.37)) );
  return fract(sin(p)*43758.5453);
}

float noise( in vec2 p )
{
  vec2 i = floor( p );
  vec2 f = fract( p );
  
  vec2 u = f*f*(3.0-2.0*f);

  float n = mix( mix( dot( -1.0+2.0*hash( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
                      dot( -1.0+2.0*hash( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                 mix( dot( -1.0+2.0*hash( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
                      dot( -1.0+2.0*hash( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
  return 0.5 + 0.5*n;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
  vec2 uv = fragCoord / iResolution.xy;
  float ratio = iResolution.x / iResolution.y;

  vec2 tuv = uv;
  tuv -= .5;

  // rotate with Noise
  float degree = noise(vec2(iTime*.1, tuv.x*tuv.y));

  tuv.y *= 1.0/ratio;
  tuv *= Rot(radians((degree-.5)*720. + 180.));
  tuv.y *= ratio;

  // Wave warp with sin
  float frequency = 5.;
  float amplitude = 30.;
  float speed = iTime * 2.;
  tuv.x += sin(tuv.y*frequency+speed)/amplitude;
  tuv.y += sin(tuv.x*frequency*1.5+speed)/(amplitude*.5);

  // blend multiple layers
  vec3 layer1 = mix(uColor1, uColor2, S(-.3, .2, (tuv*Rot(radians(-5.))).x));
  vec3 layer2 = mix(uColor3, uColor4, S(-.3, .2, (tuv*Rot(radians(-5.))).x));
  vec3 layer3 = mix(uColor5, uColor6, S(-.3, .2, (tuv*Rot(radians(15.))).y));
  vec3 layer4 = mix(uColor7, uColor8, S(-.3, .2, (tuv*Rot(radians(25.))).y));

  vec3 mix12 = mix(layer1, layer2, S(.5, -.3, tuv.y));
  vec3 mix34 = mix(layer3, layer4, S(.5, -.3, tuv.x));

  vec3 finalComp = mix(mix12, mix34, 0.5);

  fragColor = vec4(finalComp,1.0);
}
`;

export const VertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const FragmentShader = `
  ${UNIFORMS}
  precision highp float;
  varying vec2 vUv;

  ${FRAGMENT_BODY}
  
  void main() {
      vec2 fragCoord = vUv * iResolution.xy;
      vec4 outCol;
      mainImage(outCol, fragCoord);
      gl_FragColor = outCol;
  }
`;

export function GetShaderUniforms(
  colors: [Vector3, Vector3, Vector3, Vector3, Vector3, Vector3, Vector3, Vector3]
) {
  return {
    iTime: { value: 0.0 as number },
    iResolution: { value: new Vector2(512, 512) },
    uColor1: { value: colors[0] },
    uColor2: { value: colors[1] },
    uColor3: { value: colors[2] },
    uColor4: { value: colors[3] },
    uColor5: { value: colors[4] },
    uColor6: { value: colors[5] },
    uColor7: { value: colors[6] },
    uColor8: { value: colors[7] },
  };
}
