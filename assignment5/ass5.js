
$(document).ready(function(){
    d3.csv("atoms.csv", function(data) {
	d3.csv("bounds.csv", function(data2) {
	    ass5.bounds = data2;
	    ass5.atoms = data;
	    init();
	});
    });
});

var ass5 = {}

function init(){
    ass5.scene = new THREE.Scene();
    ass5.camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 20 );

    ass5.renderer = new THREE.WebGLRenderer({alpha:true});
    ass5.renderer.setClearColor( 0xffffff, 0);
    ass5.renderer.setSize( 800, 800 );
    document.body.appendChild( ass5.renderer.domElement );

    var maxZ = d3.max(ass5.atoms, function(d) { return d.z });
    var minZ = d3.min(ass5.atoms, function(d) { return d.z });
    var maxX = d3.max(ass5.atoms, function(d) { return d.x });
    var minX = d3.min(ass5.atoms, function(d) { return d.x });
    var maxY = d3.max(ass5.atoms, function(d) { return d.y });
    var minY = d3.min(ass5.atoms, function(d) { return d.y });

    console.log("(" + minX + "," + maxX + "),(" + minY + "," + maxY + ")");

    var geometry = new THREE.SphereGeometry( 0.1, 128, 128);    

    for (var i = 0; i < ass5.bounds.length; i++){
	var bound = ass5.bounds[i];
	cylinderMesh(ass5.bounds[i], ass5.scene);
    }

    for (var i = 0; i < ass5.atoms.length; i++){
	var material = new THREE.MeshPhongMaterial( { specular: 0x555555, shininess: 10 } );
	var atom_data = ass5.atoms[i];
	var color = new THREE.Color( getAtomColor(atom_data.element) );

	material.color = color;
	var atom = new THREE.Mesh( geometry, material );

	ass5.scene.add( atom );
	atom.position.set(atom_data.x * 1, atom_data.y * 1, atom_data.z * 1);
    }

    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 1, 1 ).normalize();
    ass5.scene.add(light);

    ass5.camera.position.z = 17;
    ass5.camera.position.x = -36;
    ass5.camera.position.y = 41;

    var control = new THREE.OrbitControls(ass5.camera,ass5.renderer.domElement);

    console.log(ass5.camera.position);

    render();
}

function render() {
    requestAnimationFrame( render );

    ass5.renderer.render( ass5.scene, ass5.camera );
}

function getDistance(a, b){
    return Math.sqrt((a.x-b.x)^2 + (a.y-b.y)^2 + (a.z - b.z)^2);
}

function getAtomColor(element) {
    if (element == 'N'){
	return 0x0033ff;
    }

    if (element == 'C'){
	return 0x878c8f;
    }

    if (element == 'O'){
	return 0xff0000;
    }

    if (element == 'S'){
	return 0xffff00;
    }
}

// Based on answer on http://stackoverflow.com/questions/15316127/three-js-line-vector-to-cylinder
function cylinderMesh(bound, scene) {

    var pointX = new THREE.Vector3(parseFloat(bound.x1),
				   parseFloat(bound.y1),
				   parseFloat(bound.z1));
    var pointY = new THREE.Vector3(parseFloat(bound.x2),
				   parseFloat(bound.y2),
				   parseFloat(bound.z2));
    var material = new THREE.MeshPhongMaterial( { specular: 0x555555,
						  shininess: 10,
						  color: 0x707070} );
    var direction = new THREE.Vector3().subVectors(pointY, pointX);
    var orientation = new THREE.Matrix4();
    orientation.lookAt(pointX, pointY, new THREE.Object3D().up);
    orientation.multiply(new THREE.Matrix4().set(1, 0, 0, 0,
						 0, 0, 1, 0,
						 0, -1, 0, 0,
						 0, 0, 0, 1));

    var edgeGeometry = new THREE.CylinderGeometry(0.02, 0.02, direction.length(), 8, 1);
    var edge = new THREE.Mesh(edgeGeometry, material);
    edge.applyMatrix(orientation);
    scene.add(edge);
    edge.position.set((pointY.x + pointX.x) / 2,(pointY.y + pointX.y) / 2,(pointY.z + pointX.z) / 2);
}
