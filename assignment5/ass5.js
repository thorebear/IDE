//noinspection JSUnresolvedFunction
$(document).ready(function(){
    d3.csv("atoms.csv", function(data) {
	ass5.atoms = data;
	init();
    });
});

var ass5 = {}

function init(){
    ass5.scene = new THREE.Scene();
    ass5.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    ass5.renderer = new THREE.WebGLRenderer();
    ass5.renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( ass5.renderer.domElement );

    var geometry = new THREE.SphereGeometry( 20, 64, 64);    

    var material = new THREE.MeshPhongMaterial( { ambient: 0x050505, color: 0x0033ff, specular: 0x555555, shininess: 30 } );
    for (var i = 0; i < ass5.atoms.length; i++){
	var atom_data = ass5.atoms[i];
	var atom = new THREE.Mesh( geometry, material );

	console.log(atom_data.x);
	ass5.scene.add( atom );
	atom.position.set(atom_data.x * 100, atom_data.y * 100, atom_data.z * 100);
    }

    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 1, 1 ).normalize();
    ass5.scene.add(light);

    ass5.camera.position.z = 500;
    ass5.camera.position.x = -20 * 100;
    ass5.camera.position.y = 20 * 100;

    render();
}

function render() {
    requestAnimationFrame( render );
    ass5.renderer.render( ass5.scene, ass5.camera );
}
