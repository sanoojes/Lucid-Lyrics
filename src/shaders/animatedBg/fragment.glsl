precision highp float;

uniform float Time;
uniform sampler2D BlurredCoverArt;
uniform sampler2D PreviousCoverArt;

uniform vec2 BackgroundCircleOrigin;
uniform float BackgroundCircleRadius;

uniform vec2 CenterCircleOrigin;
uniform float CenterCircleRadius;

uniform vec2 LeftCircleOrigin;
uniform float LeftCircleRadius;

uniform vec2 RightCircleOrigin;
uniform float RightCircleRadius;

uniform float uBrightness;
uniform float uSaturation;
uniform float uContrast;
uniform float uOpacity;

uniform float uTransition;
uniform float uScale;

const vec2 rotateCenter = vec2(0.5, 0.5);
vec2 RotateAroundCenter(vec2 point, float angle) {
	vec2 offset = (point - rotateCenter);

	float s = sin(angle);
	float c = cos(angle);
	mat2 rotation = mat2(c, -s, s, c);
	offset = (rotation * offset);

	return (rotateCenter + offset);
}

vec4 sampleWithTransition(sampler2D tex, vec2 uv, float transition) {
	uv = (uv - 0.5) / uScale + 0.5;
	vec4 newColor = texture2D(tex, uv);
	vec4 prevColor = texture2D(PreviousCoverArt, uv);
	return mix(prevColor, newColor, transition);
}

const vec4 DefaultColor = vec4(0.0, 0.0, 0.0, 0.0);
void main() {
	gl_FragColor = DefaultColor;

	vec2 BackgroundCircleOffset = (gl_FragCoord.xy - BackgroundCircleOrigin);
	if (length(BackgroundCircleOffset) <= BackgroundCircleRadius) {
		gl_FragColor = sampleWithTransition(
			BlurredCoverArt,
			RotateAroundCenter(
				(((BackgroundCircleOffset / BackgroundCircleRadius) + 1.0) * 0.5),
				(Time * -0.25)
			),
			uTransition
		);
		gl_FragColor.a = 1.0;
	}

	vec2 CenterCircleOffset = (gl_FragCoord.xy - CenterCircleOrigin);
	if (length(CenterCircleOffset) <= CenterCircleRadius) {
		vec4 newColor = sampleWithTransition(
			BlurredCoverArt,
			RotateAroundCenter(
				(((CenterCircleOffset / CenterCircleRadius) + 1.0) * 0.5),
				(Time * 0.5)
			),
			uTransition
		);
		newColor.a *= 0.75;

		gl_FragColor.rgb = ((newColor.rgb * newColor.a) + (gl_FragColor.rgb * (1.0 - newColor.a)));
		gl_FragColor.a = (newColor.a + (gl_FragColor.a * (1.0 - newColor.a)));
	}

	vec2 LeftCircleOffset = (gl_FragCoord.xy - LeftCircleOrigin);
	if (length(LeftCircleOffset) <= LeftCircleRadius) {
		vec4 newColor = sampleWithTransition(
			BlurredCoverArt,
			RotateAroundCenter(
				(((LeftCircleOffset / LeftCircleRadius) + 1.0) * 0.5),
				(Time * 1.0)
			),
			uTransition
		);
		newColor.a *= 0.5;

		gl_FragColor.rgb = ((newColor.rgb * newColor.a) + (gl_FragColor.rgb * (1.0 - newColor.a)));
		gl_FragColor.a = (newColor.a + (gl_FragColor.a * (1.0 - newColor.a)));
	}

	vec2 RightCircleOffset = (gl_FragCoord.xy - RightCircleOrigin);
	if (length(RightCircleOffset) <= RightCircleRadius) {
		vec4 newColor = sampleWithTransition(
			BlurredCoverArt,
			RotateAroundCenter(
				(((RightCircleOffset / RightCircleRadius) + 1.0) * 0.5),
				(Time * -0.75)
			),
			uTransition
		);
		newColor.a *= 0.5;

		gl_FragColor.rgb = ((newColor.rgb * newColor.a) + (gl_FragColor.rgb * (1.0 - newColor.a)));
		gl_FragColor.a = (newColor.a + (gl_FragColor.a * (1.0 - newColor.a)));
	}

	gl_FragColor.rgb *= uBrightness;

	float gray = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
	gl_FragColor.rgb = mix(vec3(gray), gl_FragColor.rgb, uSaturation);

	gl_FragColor.rgb = (gl_FragColor.rgb - 0.5) * uContrast + 0.5;

	gl_FragColor.a *= uOpacity;
}
