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
	    csv_data.forEach(function(d) { console.log(d.District)});
            ass3.policeDistricts.forEach(function(district){
                pop_data = csv_data.filter(function (d) {
                    return d.District === district.properties.district;
                })[0];
                district.properties.population = pop_data;
            });
            buildDistrictMap();
        });
    });

    d3.json("categories.json", function(json){
	ass3.categories = json;
	buildCategoryMenu();
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
	.style("opacity", "0.7")
	.each(function(d, group_index){
            var _this = d3.select(this);
            _this.on("mouseover", function() {
                // Move to front (to ensure the stroke isn't overlapped by anything)
                this.parentNode.appendChild(this);
                _this.select("path").style("stroke-width",2);
		_this.attr("opacity", "1.0");

		/*
		  If no district is selected, update the info on mouse over!
		 */
		if ($(".selected").length == 0){
		    showInfoBox(d.properties.district);
		}
            });
            _this.on("mouseout", function() {

		if (!_this.classed("selected")){
		    _this.style("opacity", "0.7");
                    _this.select("path").style("stroke-width",0);
		}
            });

	    // Remove the possible to select a district
	    _this.on("click", function(district) {
		// If the class is already selected, deselect it:
		if (_this.classed("selected")){
		    _this
			.classed("selected", false)
			.style("opacity", "0.7")
			.select("path")
			.style("stroke-width", 0);
		} else {		
		// else select it
		    _this
			.classed("selected", true)
			.style("opacity", "1.0")
			.select("path")
			.style("stroke-width", 3);
		}
		
		// for each group expect the clicked one:
		groups
		    .filter(function(d, i) {
			return d.properties.district != _this.attr("id")
		    })
		    .classed("selected", false)
		    .each(function(d) {
			var _group = d3.select(this);
			_group
			    .style("opacity", "0.7");
		    })
			.select("path").style("stroke-width",0);

		// Show the right infobox
		showInfoBox(district.properties.district);
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

	dist.properties.num_of_crimes = filtered.length;

	d3.select("#" + district_name)
	    .selectAll("circle")
	    .data(filtered)
	    .enter()
            .append("circle")
	    .attr("class", function(d) {
		return getCircleClass(d.properties.Category) +
		    " " + d.properties.PdDistrict + "_district";
	    })
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

    buildDistrictInfoBox();
}

function buildCategoryMenu() {
    var menu_group = ass3.svg1.append("g").attr("id", "menu_group");
    var offset_x = 50;
    var offset_y = 300;
    menu_group.selectAll("text")
	.data(ass3.categories)
	.enter()
	.append("text")
	.text(function(cat) { return cat })
	.style("opacity", 0.5)
	.style("font-size","11px")
	.attr("x", offset_x )
	.attr("y", function(d, i) { return i*12+offset_y})
	.each(function(d) {
	    var _this = d3.select(this);
	    _this.on("mouseover", function() {
		_this.style("opacity", 1.0);
		var circles = d3.selectAll("." + getCircleClass(d))
		    .attr("r", 4)
		    .style("fill", "red");

		if (ass3.selectedDistrict){
		    var crime_count = circles
			.filter("." + ass3.selectedDistrict + "_district")
			.size();
		    setInfoboxCrimeCount(crime_count);
		}
	    });
	    _this.on("mouseout", function(){
		_this.style("opacity", 0.5);
		d3.selectAll("." + getCircleClass(d))
		    .attr("r", 1)
		    .style("fill", "black");
	    });			 
	});
}

function buildDistrictInfoBox() {
    var infobox_group = ass3
	.svg1.append("g")
	.attr("id", "infobox_group");
    var box_width = 260;
    var box_height = 500;
    var districts = ass3.policeDistricts;

    var offset_y = 288;
    var offset_x = ass3.width - box_width - 1;
    var boxes = infobox_group
	.selectAll("g")
	.data(districts)
	.enter()
	.append("g")
	.classed("infobox", true)
	.attr("id", function(d) { return d.properties.district + "_infobox" })
	.style("visibility", "hidden");

    boxes.append("rect")
	.attr("width", box_width)
	.attr("height", box_height)
	.attr("x", offset_x)
	.attr("y", offset_y)
	.style("stroke", "black")
	.style("stroke-width", "1")
	.style("fill", "white");

    // Add headline
    boxes.append("text")
	.attr("x", offset_x + (box_width/2))
	.attr("y", offset_y + 36)
	.style("text-anchor", "middle")
	.style("font-size", 36)
	.text(function(d) { return d.properties.district} );

    // Add population information
    boxes.append("text")
	.attr("x", offset_x + 8)
	.attr("y", offset_y + 72)
	.style("font-size", 18)
	.text(function(d) {
	    return "Population: " + d.properties.population.Population;
	});

    boxes.append("text")
	.attr("x", offset_x + 8)
	.attr("y", offset_y + 92)
	.style("font-size", 18)
	.text(function(d) {
	    var res = "Number of crimes: "
	    if (d.properties.num_of_crimes !== undefined){
		return res + d.properties.num_of_crimes;
	    } else {
		return res + "N/A";
	    }
	});

    infobox_group.append("text")
	.attr("x", offset_x + 210)
	.attr("y", offset_y + 92)
	.attr("id", "crimecounter")
	.text("(12)")
	.style("font-size", 18)
	.style("fill", "red")
	.style("visibility", "hidden");
}

function getCircleClass(cat) {
    // slash cannot be used in d3 selectors, so we replace them in class name
    return cat.replace("/","_").replace(" ","") + "_circle";
}

function showInfoBox(district) {
    ass3.selectedDistrict = district;
    d3.selectAll(".infobox")
	.style("visibility", "hidden");
    d3.select("#" + district + "_infobox")
	.style("visibility", "visible");
}

function setInfoboxCrimeCount(count) {
    d3.select("#crimecounter")
	.style("visibility", "visible")
	.text("(" + count + ")");
}

