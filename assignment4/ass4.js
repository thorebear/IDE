$(document).ready(function() {
   init();
});

var ass3 = {}

function init(){

    ass3.width = 1200;
    ass3.height = 880;

    ass3.svg1 = d3.select("#map_1")
        .append("svg")
        .attr("width", ass3.width)
        .attr("height", ass3.height);

    ass3.projection = d3.geo.orthographic()
        .scale(300000).rotate( [122.43, -37.78, 0.0] )
        .translate([ass3.width / 2, ass3.height / 2 ])
        .clipAngle(90).precision(.1);
    
    ass3.geoPath = d3.geo.path().projection(ass3.projection);

    d3.json("sfpd_districts.geojson", function(json){
        d3.csv("population.csv", function(csv_data) {
            ass3.policeDistricts = json.features;
            ass3.policeDistricts.forEach(function(district){
                pop_data = csv_data.filter(function (d) {
                    return d.District === district.properties.district;
                })[0];
                district.properties.population = pop_data;
            });
            buildDistrictMap();
        });
    });
}

function buildDistrictMap(json) {
    var colors = colorbrewer.Set3[ass3.policeDistricts.length];    

    /*
      Add one SVG group for each police districts, these groups
      are used to bound the district path together with all the
      crime circles in the district to gether
    */
    var groups = ass3.svg1.selectAll("path")
        .data(ass3.policeDistricts)
        .enter()
	.append("g")
	.attr("opacity", "0.5")
	.each(function(d, group_index){
            var _this = d3.select(this);
            _this.on("mouseover", function() {
                // Move to front (to ensure the stroke isn't overlapped by anything)
                this.parentNode.appendChild(this);
                _this.select("path").style("stroke-width",2);
		_this.attr("opacity", "1.0");
            });
            _this.on("mouseout", function() {

		if (!_this.classed("selected")){
		    _this.attr("opacity", "0.5");
                    _this.select("path").style("stroke-width",0);
		}
            });
	    _this.on("click", function() {

		// for the clicked group
		_this
		    .classed("selected", true)
		    .attr("opacity", "1.0")
		    .select("path")
		    .style("stroke-width", 3);
		
		
		// for each group expect the clicked one:
		groups
		    .filter(function(d, i) {
			return d.properties.district != _this.attr("id")
		    })
		    .classed("selected", false)
		    .each(function(d) {
			var _group = d3.select(this);
			_group
			    .attr("opacity", "0.5");
		    })
                    .select("path").style("stroke-width",0);
	    });

        })
	    /*
	      Gives the group element ID=<Police district name>,
	      which we can use to add crime cicles to the correct districts. 
	    */
	.attr("id", function(d) { return d.properties.district })

    /*
      Add the path for each district, with the data bounded to the group element
    */
    var paths = groups.append("path")
        .attr("d", ass3.geoPath)
        .style("stroke", "black")
        .style("stroke-width", 0)
        .style("fill", function(d, i) {
            return colors[i]
        });

    // Load and add the crime circles to the map
    d3.json("sf_crime.geojson", buildCrimes);
}

function buildCrimes(json) {
    for(var i = 0; i < ass3.policeDistricts.length; i++){
        var dist = ass3.policeDistricts[i];
        var district_name = dist.properties.district;
	var filtered = json.features.filter(function(crime) {
	    return crime.properties.PdDistrict === district_name;
	});
	d3.select("#" + district_name)
	    .selectAll("circle")
	    .data(filtered)
	    .enter()
            .append("circle")
	    .attr("r", 1)
	/* Use each() instead of setting the attributes directly,
	   to avoid multiple calls to the projection function for each point. */
            .each(function(d){
		var _this = d3.select(this);
		coords = ass3.projection(d.geometry.coordinates);
		_this.attr("cx", coords[0]);
		_this.attr("cy", coords[1]);
            })
    }
}

    
