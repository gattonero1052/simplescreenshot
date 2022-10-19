//vertex shader
export default `
attribute vec2 a_position;
attribute vec2 a_texcoord;

uniform mat3 u_pos_matrix;
uniform mat3 u_tex_matrix;
uniform vec2 u_resolution;

varying vec2 v_position;
varying vec2 v_texcoord;

void main() {
  vec2 position = 2. * (a_position / u_resolution - vec2(.5));
  v_position = vec2(position);
  position = (u_pos_matrix * vec3(position, 1.)).xy;
  gl_Position = vec4(position, 0, 1.);
  v_texcoord = (u_tex_matrix * vec3(a_texcoord / u_resolution,1.)).xy;
}
`