console.log("Running");

$(document).ready(function(){
    d3.csv("atoms.csv", function(data) {
	ass5.atoms = data;
	init();
    });
});

var ass5 = {}

function init(){
    ass5.scene = new THREE.Scene();
    ass5.camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 320 );

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

    ass5.camera.position.z = 50;
    ass5.camera.position.x = (maxX - minX) / 2 - 100;
    ass5.camera.position.y = (maxY - minY) / 2;

    var control = new THREE.OrbitControls(ass5.camera,ass5.renderer.domElement);

    console.log(ass5.camera.position);

    render();
}

function render() {
    requestAnimationFrame( render );

    ass5.renderer.render( ass5.scene, ass5.camera );
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
