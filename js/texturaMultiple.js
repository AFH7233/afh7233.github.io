window.onload = main;


async function main(){
    var gl = initGLContext();
    
    var shaderText	= await readFile("shaders/vertex_shader.glsl");
    var vertexShader = createShader(gl, shaderText, gl.VERTEX_SHADER);

    shaderText = await readFile("shaders/shader_textures.frag");
    var fragmentShader = createShader(gl, shaderText, gl.FRAGMENT_SHADER);

    var program = joinProgram(gl,vertexShader,fragmentShader);
    const programInfo = {
        program: program,
        attributes: {
            vertexPosition: gl.getAttribLocation(program, 'aVertexPosition'),
            vertexNormal: gl.getAttribLocation(program, 'aVertexNormal'),
            textureCoord: gl.getAttribLocation(program, 'aTextureCoord')
        },
        uniforms: {
            projectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(program, 'uModelViewMatrix'),
            cameraMatrix: gl.getUniformLocation(program, 'uCameraMatrix'),
            lightPos: gl.getUniformLocation(program, 'lightPos'),
            uSampler01: gl.getUniformLocation(program, 'uSampler01'),
            uSampler02: gl.getUniformLocation(program, 'uSampler02'),
            uSampler03: gl.getUniformLocation(program, 'uSampler03')
        },
      };
    
      var text = await readFile("Solar_System/Earth/Earth.obj");
      var meshes = readObjects(text);
      
      var objects = meshes
      .filter(mesh => mesh.name == "Earth")
      .map( (mesh, i)=>{
        OBJ.initMeshBuffers(gl, mesh);
        let center = findCenter([mesh]);
        let texture01 =  loadTexture(gl,"Solar_System/Earth/2k_earth_daymap.jpg");
        let texture02 =  loadTexture(gl,"Solar_System/Earth/2k_earth_clouds.jpg");
        let texture03 =  loadTexture(gl,"Solar_System/Earth/2k_earth_nightmap.jpg");
        let object = {};
        object.mesh = mesh;
        object.texture01 = texture01;
        object.texture02 = texture02;
        object.texture03 = texture03;
        object.rotation = 0;
        object.center = center;
        return object;
    });
    var earth = objects[0];


    function render() {
    
        drawScene(gl, programInfo, earth)
    
        requestAnimationFrame(render);
      }

      requestAnimationFrame(render);
}


function initGLContext() {
    const canvas = document.querySelector("#glCanvas");
    var gl = canvas.getContext("webgl2");
  
    if (gl === null) {
      alert("El navegador no soporta webgl");
      return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    return gl;
}

function drawScene(gl, programInfo, object) {
    gl.clearColor(0.0, 0.0, 0.0, 0.5);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);     
    gl.depthFunc(gl.LEQUAL); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var fov =  50 + Number(45);
    const fieldOfView = fov * Math.PI / 180;   
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100000.0;
    const projectionMatrix = mat4.create();
    const cameraMatrix = mat4.create();



    mat4.perspective(projectionMatrix,
                    fieldOfView,
                    aspect,
                    zNear,
                    zFar);

    mat4.lookAt(cameraMatrix, [6.0,0.0,5.0],[6.0,0.0,0.0],[0.0,1.0,0.0]);
    var localMatrix = mat4.create();
    object.rotation =  object.rotation  > (2.0*Math.PI)? 0.0: object.rotation + 0.005*(24.0*2.0*Math.PI)/180.0;
    mat4.translate(localMatrix, localMatrix, [6.0,0.0,0.0]); 
    localMatrix[0] = -1;

    mat4.rotate(localMatrix, localMatrix, 90.0*2.0*(Math.PI)/180.0, [1.0,0.0,0.0]); 
    mat4.rotate(localMatrix, localMatrix, object.rotation, [0.0,1.0,0.0]);

    renderObject(gl, programInfo, object, projectionMatrix, localMatrix, cameraMatrix);
}

function renderObject(gl, programInfo, object3D, projectionMatrix, matrix, cameraMatrix){
    var localMatrix = mat4.create();

    var modelViewMatrix = [];
    mat4.multiply(modelViewMatrix, matrix, localMatrix);
    let mesh = object3D.mesh;
    let texture01 = object3D.texture01;
    let texture02 = object3D.texture02;
    let texture03 = object3D.texture03;
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
        gl.vertexAttribPointer(
            programInfo.attributes.vertexPosition,
            mesh.vertexBuffer.itemSize,
            gl.FLOAT,
            false,
            0,
            0);
        gl.enableVertexAttribArray(
            programInfo.attributes.vertexPosition);
    }

    {
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
        gl.vertexAttribPointer(
            programInfo.attributes.vertexNormal,
            mesh.normalBuffer.itemSize,
            gl.FLOAT,
            false,
            0,
            0);
        gl.enableVertexAttribArray(
            programInfo.attributes.vertexNormal);
      }

    {
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.textureBuffer);
        gl.vertexAttribPointer(
            programInfo.attributes.textureCoord,
            mesh.textureBuffer.itemSize,
            gl.FLOAT,
            false,
            0,
            0);
        gl.enableVertexAttribArray(
            programInfo.attributes.textureCoord);
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);


    gl.useProgram(programInfo.program);
    gl.uniformMatrix4fv(
        programInfo.uniforms.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniforms.modelViewMatrix,
        false,
        modelViewMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniforms.cameraMatrix,
        false,
        cameraMatrix);

    var lightPos  = [0.0,0.0,4.0,1.0];
    vec4.transformMat4(lightPos, lightPos, cameraMatrix);


    gl.uniform4fv(
        programInfo.uniforms.lightPos,
        lightPos);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture01);
    gl.uniform1i(programInfo.uniforms.uSampler01, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture02);
    gl.uniform1i(programInfo.uniforms.uSampler02, 1);

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture03);
    gl.uniform1i(programInfo.uniforms.uSampler03, 2);

    gl.drawElements(gl.TRIANGLES,  mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    
}
  