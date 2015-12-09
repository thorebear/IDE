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

    ass3.svg1.selectAll("path")
        .data(ass3.policeDistricts)
        .enter()
	.append("g")
	.each(function(d){
            var _this = d3.select(this);
            _this.on("mouseover", function() {
                // Move to front (to ensure the stroke isn't overlapped by anything)
                this.parentNode.appendChild(this);
                d3.select(this).select("path").style("stroke-width",2);
            });
            _this.on("mouseout", function() {
                d3.select(this).select("path").style("stroke-width",0);
            });
        })
	.attr("id", function(d) { return d.properties.district })
        .append("path")
        .attr("d", ass3.geoPath)
        .style("stroke", "black")
        .style("stroke-width", 0)
        .style("fill", function(d, i) {
            return colors[i]
        });

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
	/* Use each() instead of setting the attributes directly,
	   to avoid multiple calls to the projection function for each point. */
            .each(function(d){
		var _this = d3.select(this);
		coords = ass3.projection(d.geometry.coordinates);
		_this.attr("cx", coords[0]);
		_this.attr("cy", coords[1]);
            })
		.attr("r", 1)
    }	
}

    
