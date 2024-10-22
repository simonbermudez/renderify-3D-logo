import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Post Processing
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { HalftonePass } from 'three/examples/jsm/postprocessing/HalftonePass';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';

var camera, scene, renderer,
light1, light2, light3, light4, light5, light6, light7,
object, stats, controls, composer, renderPass, bloomPass, glitchPass;

var clock = new THREE.Clock();
var mixer; // Add this line to declare the animation mixer


init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = 100;
    scene = new THREE.Scene();


    //model

    // var loader = new OBJLoader();
    // loader.load( 'https://simonbermudez.com/logo/models/sb.obj', function ( obj ) {

    //     object = obj;
    //     object.scale.multiplyScalar( 300 );
    //     object.position.y = - 15;
        
    //     // Adding Material
    //     // object.traverse(function(child) {
    //     // 	if (child instanceof THREE.Mesh){
    //     // 		child.material = logo_material;
    //     // 	}
    //     // });
    //     // var logo = new THREE.Mesh(object, logo_material)
    //     scene.add( object );

    // } );

    var sphere = new THREE.SphereBufferGeometry( 0.5, 16, 8 );

    /* floor  */    
    const helper = new THREE.GridHelper( 1000, 40, 0x303030, 0x303030 );
    helper.position.y = - 25;
    scene.add( helper );


    //lights

    light1 = new THREE.PointLight( 0xff0040, 2, 50 );
    light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xff0040 } ) ) );
    scene.add( light1 );

    light2 = new THREE.PointLight( 0x0040ff, 2, 50 );
    light2.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x0040ff } ) ) );
    scene.add( light2 );

    light3 = new THREE.PointLight( 0x80ff80, 2, 50 );
    light3.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x80ff80 } ) ) );
    scene.add( light3 );

    light4 = new THREE.PointLight( 0xffaa00, 2, 50 );
    light4.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffaa00 } ) ) );
    scene.add( light4 );

    light5 = new THREE.PointLight( 0xd400ff, 2, 50 );
    light5.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xd400ff } ) ) );
    scene.add( light5 );

    light6 = new THREE.PointLight( 0x00ddff, 2, 50 );
    light6.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x00ddff } ) ) );
    scene.add( light6 );

    light7 = new THREE.PointLight( 0xffffff, 2, 50 );
    // light7.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffffff } ) ) );
    scene.add( light7 );

    //renderer

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    controls = new OrbitControls( camera, renderer.domElement );

    // Post Processing
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    
    const params = {
        shape: 1,
        radius: 4,
        rotateR: Math.PI / 12,
        rotateB: Math.PI / 12 * 2,
        rotateG: Math.PI / 12 * 3,
        scatter: 0,
        blending: 1,
        blendingMode: 1,
        greyscale: false,
        disable: false
    };

    bloomPass = new UnrealBloomPass( 
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.5,
        0.1,
        0.5
    );

    glitchPass = new GlitchPass();
    
    const halftonePass = new HalftonePass( window.innerWidth, window.innerHeight, params );
    
    // Add FXAA pass
    const fxaaPass = new ShaderPass(FXAAShader);
    const pixelRatio = renderer.getPixelRatio();
    fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * pixelRatio);
    fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * pixelRatio);

    composer.addPass(renderPass);
    composer.addPass(bloomPass);
    composer.addPass(glitchPass);
    composer.addPass(fxaaPass);  // Add FXAA as the last pass

    setTimeout(() => composer.removePass(glitchPass), 1000)
    // composer.addPass( halftonePass );


    // GLTF model loading
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
        './models/renderify/renderify.gltf',
        (gltf) => {
            const model = gltf.scene;
            // You can modify the model here if needed
            // For example, scaling:
            let scaleFactor = 500;

            model.scale.set(scaleFactor, scaleFactor, scaleFactor);
            model.rotation.y = -Math.PI / 2;
            model.position.y = -25;
            scene.add(model);

            // Set up animations
            mixer = new THREE.AnimationMixer(model);
            const animations = gltf.animations;
            if (animations && animations.length) {
                animations.forEach((clip) => {
                    mixer.clipAction(clip).play();
                });
            }
        },
        (progress) => {
            console.log(`Loading model... ${(progress.loaded / progress.total * 100).toFixed(2)}%`);
        },
        (error) => {
            console.error('An error occurred while loading the model:', error);
        }
    );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    // Update FXAA uniforms
    const fxaaPass = composer.passes.find(pass => pass.name === 'ShaderPass' && pass.material.uniforms['resolution']);
    if (fxaaPass) {
        const pixelRatio = renderer.getPixelRatio();
        fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * pixelRatio);
        fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * pixelRatio);
    }
}

function animate() {


    
    requestAnimationFrame( animate );
    
    // stats.update();
    render();
}

function render() {

    var time = Date.now() * 0.0005;
    var delta = clock.getDelta();

    // Update animations
    if (mixer) {
        mixer.update(delta);
    }

    if( object ) object.rotation.y -= 0.5 * delta;

    light1.position.x = Math.sin( time * 0.7 ) * 30;
    light1.position.y = Math.cos( time * 0.5 ) * 40;
    light1.position.z = Math.cos( time * 0.3 ) * 30;

    light2.position.x = Math.cos( time * 0.3 ) * 30;
    light2.position.y = Math.sin( time * 0.5 ) * 40;
    light2.position.z = Math.sin( time * 0.7 ) * 30;

    light3.position.x = Math.sin( time * 0.7 ) * 30;
    light3.position.y = Math.cos( time * 0.3 ) * 40;
    light3.position.z = Math.sin( time * 0.5 ) * 30;

    light4.position.x = Math.sin( time * 0.3 ) * 30;
    light4.position.y = Math.cos( time * 0.7 ) * 40;
    light4.position.z = Math.sin( time * 0.5 ) * 30;

    light5.position.x = Math.sin( time * 0.1 ) * 30;
    light5.position.y = Math.cos( time * 0.2 ) * 40;
    light5.position.z = Math.sin( time * 0.3 ) * 30;

    light6.position.x = Math.sin( time * 0.4 ) * 30;
    light6.position.y = Math.cos( time * 0.5 ) * 40;
    light6.position.z = Math.sin( time * 0.6 ) * 30;

    renderer.render( scene, camera );

    composer.render()

}

window.addEventListener('resize', function(event){
    onWindowResize()
});

