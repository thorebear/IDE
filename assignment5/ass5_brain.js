$(document).ready(function(){
    init();
});


var scene, camera, renderer, texloader, group;

function init(){
    texloader = new THREE.TextureLoader();

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 100000 );

    group = new THREE.Group();
    scene.add( group );

    renderer = new THREE.WebGLRenderer({alpha:true});
    renderer.setClearColor( 0xffffff, 0);
    renderer.setSize( 800, 800 );
    document.body.appendChild( renderer.domElement );



    var control = new THREE.OrbitControls(camera, renderer.domElement);

    texloader.load('/coronal_stack/slice_128.png', function(texture){
	var geometry = new THREE.PlaneGeometry( 256, 256, 256, 256);    
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	var material = new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide } );
	var plane = new THREE.Mesh( geometry, material );
	group.add( plane );
	render();
    });



    camera.position.z = 350;


}

function render() {
    requestAnimationFrame( render );
    renderer.render( scene, camera );
}

