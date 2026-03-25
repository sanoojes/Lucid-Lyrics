precision highp float;

uniform float t;
uniform sampler2D bca;
uniform sampler2D pca;

uniform vec2 bco;
uniform float bcr;

uniform vec2 cco;
uniform float ccr;

uniform vec2 lco;
uniform float lcr;

uniform vec2 rco;
uniform float rcr;

uniform float br;
uniform float sa;
uniform float co;
uniform float op;

uniform float tr;
uniform float sc;
uniform float rs;
uniform float di;

highp float hash(highp vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}

const vec2 rc = vec2(0.5, 0.5);
vec2 rotateAroundCenter(vec2 point, float angle) {
	vec2 o = (point - rc);

	float s = sin(angle);
	float c = cos(angle);
	mat2 rotation = mat2(c, -s, s, c);
	o = (rotation * o);

	return (rc + o);
}

vec4 swt(sampler2D tex, vec2 uv, float transition) {
	uv = (uv - 0.5) / sc + 0.5;
	vec4 newColor = texture2D(tex, uv);
	vec4 prevColor = texture2D(pca, uv);
	return mix(prevColor, newColor, transition);
}

float se(float dist, float radius, float softness) {
	return 1.0 - smoothstep(radius - softness, radius, dist);
}

const vec4 dc = vec4(0.0, 0.0, 0.0, 0.0);
void main() {
	gl_FragColor = dc;

	vec2 bcof = (gl_FragCoord.xy - bco);
	float bgDist = length(bcof);
	if (bgDist <= bcr) {
		gl_FragColor = swt(
			bca,
			rotateAroundCenter(
				(((bcof / bcr) + 1.0) * 0.5),
				(t * -0.25 * rs)
			),
			tr
		);
		float edgeFade = se(bgDist, bcr, bcr * 0.1);
		gl_FragColor.a = edgeFade;
	}

	vec2 ccof = (gl_FragCoord.xy - cco);
	float centerDist = length(ccof);
	if (centerDist <= ccr) {
		vec4 newColor = swt(
			bca,
			rotateAroundCenter(
				(((ccof / ccr) + 1.0) * 0.5),
				(t * 0.5 * rs)
			),
			tr
		);
		float edgeFade = se(centerDist, ccr, ccr * 0.1);
		newColor.a *= 0.75 * edgeFade;

		gl_FragColor.rgb = ((newColor.rgb * newColor.a) + (gl_FragColor.rgb * (1.0 - newColor.a)));
		gl_FragColor.a = (newColor.a + (gl_FragColor.a * (1.0 - newColor.a)));
	}

	vec2 lcof = (gl_FragCoord.xy - lco);
	float leftDist = length(lcof);
	if (leftDist <= lcr) {
		vec4 newColor = swt(
			bca,
			rotateAroundCenter(
				(((lcof / lcr) + 1.0) * 0.5),
				(t * 1.0 * rs)
			),
			tr
		);
		float edgeFade = se(leftDist, lcr, lcr * 0.1);
		newColor.a *= 0.5 * edgeFade;

		gl_FragColor.rgb = ((newColor.rgb * newColor.a) + (gl_FragColor.rgb * (1.0 - newColor.a)));
		gl_FragColor.a = (newColor.a + (gl_FragColor.a * (1.0 - newColor.a)));
	}

	vec2 rcof = (gl_FragCoord.xy - rco);
	float rightDist = length(rcof);
	if (rightDist <= rcr) {
		vec4 newColor = swt(
			bca,
			rotateAroundCenter(
				(((rcof / rcr) + 1.0) * 0.5),
				(t * -0.75 * rs)
			),
			tr
		);
		float edgeFade = se(rightDist, rcr, rcr * 0.1);
		newColor.a *= 0.5 * edgeFade;

		gl_FragColor.rgb = ((newColor.rgb * newColor.a) + (gl_FragColor.rgb * (1.0 - newColor.a)));
		gl_FragColor.a = (newColor.a + (gl_FragColor.a * (1.0 - newColor.a)));
	}

	gl_FragColor.rgb *= br;

	float gray = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
	gl_FragColor.rgb = mix(vec3(gray), gl_FragColor.rgb, sa);

	gl_FragColor.rgb = (gl_FragColor.rgb - 0.5) * co + 0.5;

	highp vec2 pixelPos = floor(gl_FragCoord.xy);
	highp float noise = hash(vec3(pixelPos, floor(t * 60.0)));
	gl_FragColor.rgb += (noise - 0.5) * di;

	gl_FragColor.a *= op;
}
