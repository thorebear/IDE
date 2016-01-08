$(document).ready(function(){
    init();
});


var scene, camera, renderer, texloader, group, gui;
var coronalPlane, sagittalPlane, axialPlane;

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


    gui = new DAT.GUI({
	height : 5 * 32 - 1
    });

    gui.add({ coronal: 128 }, 'coronal').min(1).max(256).step(1)
	.onChange(function(val) {
	    var valString = "" + val;
	    while(valString.length < 3){
		valString = "0" + valString;
	    }
	    texloader.load('/coronal_stack/slice_' + valString + '.png', function(texture){
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		var material = new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide } );
		coronalPlane.material = material;
		coronalPlane.material.needsUpdate;
		coronalPlane.position.z = val;
	    });
	});

    gui.add({ sagittal: 128 }, 'sagittal').min(1).max(256).step(1)
	.onChange(function(val) {
	    var valString = "" + val;
	    while(valString.length < 3){
		valString = "0" + valString;
	    }
	    texloader.load('/sagittal_stack/slice_' + valString + '.png', function(texture){
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		var material = new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide } );
		sagittalPlane.material = material;
		sagittalPlane.material.needsUpdate;
		sagittalPlane.position.x = val;
	    });
	});

    gui.add({ axial: 128 }, 'axial').min(1).max(256).step(1)
	.onChange(function(val) {
	    var valString = "" + val;
	    while(valString.length < 3){
		valString = "0" + valString;
	    }
	    texloader.load('/axial_stack/slice_' + valString + '.png', function(texture){
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		var material = new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide } );
		axialPlane.material = material;
		axialPlane.material.needsUpdate;
		axialPlane.position.y = val;
	    });
	});


    var control = new THREE.OrbitControls(camera, renderer.domElement);

    texloader.load('/coronal_stack/slice_128.png', function(texture){
	var geometry = new THREE.PlaneGeometry( 256, 256, 256, 256);    
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	var material = new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide } );
	coronalPlane = new THREE.Mesh( geometry, material );
	group.add( coronalPlane );
	coronalPlane.position.z = 128;
	coronalPlane.position.x = 128;
	coronalPlane.position.y = 128;
    });
    
    texloader.load('/sagittal_stack/slice_128.png', function(texture){
	var geometry = new THREE.PlaneGeometry( 256, 256, 256, 256);    
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	var material = new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide } );
	sagittalPlane = new THREE.Mesh( geometry, material );
	sagittalPlane.rotation.y = Math.PI / 2;
	group.add( sagittalPlane );
	sagittalPlane.position.z = 128;
	sagittalPlane.position.x = 128;
	sagittalPlane.position.y = 128;
    });

    texloader.load('/axial_stack/slice_128.png', function(texture){
	var geometry = new THREE.PlaneGeometry( 256, 256, 256, 256);    
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	var material = new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide } );
	axialPlane = new THREE.Mesh( geometry, material );
	axialPlane.rotation.x = Math.PI / 2;
	group.add( axialPlane );
	axialPlane.position.z = 128;
	axialPlane.position.x = 128;
	axialPlane.position.y = 128;
    });

    camera.position.z = 450;
    camera.position.x = 128;
    camera.position.y = 128;

    render();
}

function render() {
    requestAnimationFrame( render );
    renderer.render( scene, camera );
}

