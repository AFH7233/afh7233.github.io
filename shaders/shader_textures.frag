precision highp float;
varying vec2 vTextureCoord;
varying vec4 vVertexNormal;
varying vec4 vertPos; 

uniform sampler2D uSampler01;
uniform sampler2D uSampler02;
uniform sampler2D uSampler03;
uniform vec4 lightPos;


void main(void) {
    vec3 N = normalize(vVertexNormal.xyz);
    vec3 L = normalize(lightPos.xyz - vertPos.xyz);
    vec3 diffuseColor = vec3(1.0, 1.0, 1.0);
    vec3 ambientColor = vec3(1.0, 1.0, 1.0);

    // Lambert's cosine law
    float mezcla = dot(N, L);
    float lambertian = max(dot(N, L), 0.0);
    vec3 finalColor = ambientColor  + (lambertian * diffuseColor);
    vec4 day = texture2D(uSampler01, vTextureCoord);
    vec4 clouds = texture2D(uSampler02, vTextureCoord);
    vec4 night = texture2D(uSampler03, vTextureCoord);
    vec4 texelColor = vec4(0.0,0.0,0.0,0.0);
    if(mezcla < 0.0){
        texelColor =   (night + clouds)/2.0;
    } else {
        texelColor = (day + clouds)/2.0;
    }
    gl_FragColor = vec4(texelColor.rgb * finalColor.rgb, texelColor.a);

    
}