//fragment shader
export default `
precision mediump float;

varying vec2 v_position;
varying vec2 v_texcoord;
varying float masked;
uniform sampler2D u_texture;

uniform vec4 u_spotlight;// minx maxx miny maxy

void main() {
  float masked = 1.0;
  float r1 = (v_position.x - u_spotlight[0]) * (u_spotlight[1] - v_position.x);
  float r2 = (v_position.y - u_spotlight[2]) * (u_spotlight[3] - v_position.y);
  if(r1 > 0.0){
    if(r2 > 0.0){
      masked = 0.0;
    }
  }
  gl_FragColor = texture2D(u_texture, v_texcoord);
  gl_FragColor = vec4(gl_FragColor.xyz - gl_FragColor.xyz * masked * .5, 1.);
}
`