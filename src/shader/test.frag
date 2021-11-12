uniform sampler2D tex;
varying vec3 vColor;
varying vec2 vUvs;

void main() {
    float x = vUvs.x;
    float y = vUvs.y;
    float intensity = sin(sqrt(x * x + y * y));
    gl_FragColor = intensity * vec4(1.0, 0.0, 0.0, 1.0);
}