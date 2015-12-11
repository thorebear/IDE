$(document).ready(function() {
    init();
});

var ass3 = {}

function init(){

    ass3.width = 1040;
    ass3.height = 680;
    
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

	    d3.json("crime_in_districts.json", function(json){
		ass3.heatmapdata = json;
		buildDistrictHeatMap();
	    });
        });
    });

    d3.json("categories.json", function(json){
	ass3.categories = json;
	buildCategoryMenu();
	setUpHeatMapCategorySelector();
  setUpLinks();
    });
}



function setUpLinks(){

  highlightProstitution( d3.select("#features").select(".prostitution") );
  highlightSouthern( d3.select("#features").select(".southern"));
  highlightDrugs( d3.select("#features").select(".drugs"));

  highlightProstitution( d3.select("#prostitution") );
  highlightSouthern( d3.select("#southern"));
  highlightDrugs( d3.select("#drugs"));

  function highlightProstitution(selection){
    selection.on("mouseover", function(){
      ass3.svg1.selectAll("." + getCircleClass("PROSTITUTION"))
        .attr("r", 4)
        .style("opacity", 1.0)
        .style("fill", "red");
    })
    selection.on("mouseout", function(){
      ass3.svg1.selectAll("." + getCircleClass("PROSTITUTION"))
        .attr("r", 1)
        .style("opacity", 0.5)
        .style("fill", "black");
    }); 
  }

  function highlightSouthern(selection){
    selection.on("mouseover", function(){
      ass3.selectedDistrict = "SOUTHERN";
      showInfoBox(ass3.selectedDistrict);
      ass3.svg1.select("#SOUTHERN")
        .selectAll("path")
        .style("stroke-width", 3);
    })
    selection.on("mouseout", function(){
      ass3.selectedDistrict = undefined;
      showInfoBox(ass3.selectedDistrict);
      ass3.svg1.select("#SOUTHERN")
        .selectAll("path")
        .style("stroke-width", 0);
    }); 
  }  

  function highlightDrugs(selection) {
    selection.on("mouseover", function(){
      ass3.svg1.selectAll("." + getCircleClass("DRUG/NARCOTIC"))
        .attr("r", 4)
        .style("opacity", 1.0)
        .style("fill", "red");
    })
    selection.on("mouseout", function(){
      ass3.svg1.selectAll("." + getCircleClass("DRUG/NARCOTIC"))
        .attr("r", 1)
        .style("opacity", 0.5)
        .style("fill", "black");
    });     
  }

}


function buildDistrictMap(json) {
    var colors = colorbrewer.Set3[ass3.policeDistricts.length];    

    /*
      Add one SVG group for each police districts, these groups
      are used to bound the district path together with all the
      crime circles in the district to gether
    */
    var groups = ass3.svg1
	.append("g")
	.attr("id", "mapgroup")
	.style("transform", "translate(15px,-50px)")
	.selectAll("path")
        .data(ass3.policeDistricts)
        .enter()
	.append("g")
  .classed("path_"+function(d){return d},true) /* <--  */
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
	dist.properties.num_crime_per_category = {};
	
	ass3.categories.forEach(function(category){
	    dist.properties.num_crime_per_category[category] =
		filtered.filter(function(crime) {
		    return crime.properties.Category == category;
		}).length;
	});
	

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
    var offset_x = 10;
    var offset_y = 220;
    menu_group.selectAll("text")
	.data(ass3.categories)
	.enter()
	.append("text")
	.text(function(cat) { return cat })
	.style("cursor", "default")
	.style("opacity", 0.5)
	.style("font-size","11px")
	.attr("x", offset_x )
	.attr("y", function(d, i) { return i*12+offset_y})
  .classed("cat_"+function(d){return d},true) /* <-- */
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
		setInfoboxCrimeCount(undefined);
	    });			 
	});
}

function buildDistrictInfoBox() {
    var infobox_group = ass3
	.svg1.append("g")
	.attr("id", "infobox_group");
    var box_width = 260;
    var box_height = 120;
    var districts = ass3.policeDistricts;

    var offset_y = 248;
    var offset_x = ass3.width - box_width - 10;
    var boxes = infobox_group
	.selectAll("g")
	.data(districts)
	.enter()
	.append("g")
	.classed("infobox", true)
	.attr("id", function(d) { return d.properties.district + "_infobox" })
	.style("opacity", "0.7")
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
	.style("font-size", 24)
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
    if (count === undefined){
	d3.select("#crimecounter")
	    .style("visibility", "hidden");
    } else {
	d3.select("#crimecounter")
	    .style("visibility", "visible")
	    .text("(" + count + ")");
    }
}



/// HEAT MAP STUFF ///

function buildDistrictHeatMap(category) {
    d3.select("#heatmap").selectAll("*").remove();
    
    var data = ass3.heatmapdata;

    // Compute the crime pr people rate:
    ass3.policeDistricts.forEach(function(d) {

	var district_name = d.properties.district;
	if (category){
	    d.properties.crimePerPeople = 1000 * data[district_name][category] / d.properties.population.Population;
	} else {
	    d.properties.crimePerPeople = 1000 * data[district_name]["total"] / d.properties.population.Population;
	}
    });

    // Set up scale, for coloring the heat map:
    var min_cpp = d3.min(ass3.policeDistricts, function(d) {
	return d.properties.crimePerPeople;
    });

    var max_cpp = d3.max(ass3.policeDistricts, function(d) {
	return d.properties.crimePerPeople;
    });

    var scale_length = 400;

    var scale = d3.scale.linear()
	.domain([max_cpp, 0])
	.range([0,scale_length]).nice();

    var colorScale = d3.scale.linear()
	.domain([0,scale_length])
	.range(['orange','white']);

    var colorAxis = d3.svg.axis()
	.scale(scale)
	.orient("left");
    
    ass3.heat_width = 600;
    ass3.heat_height = 500;
    
    ass3.svg_heat = d3.select("#heatmap")
	.append("svg")
        .attr("width", ass3.heat_width)
        .attr("height", ass3.heat_height);

    ass3.heat_projection = d3.geo.orthographic()
        .scale(200000).rotate( [122.43, -37.78, 0.0] )
        .translate([ass3.heat_width / 2, ass3.heat_height / 2 ])
        .clipAngle(90).precision(.1);
    
    ass3.geoPath_heat = d3.geo.path().projection(ass3.heat_projection);

    var axis_group = ass3.svg_heat.append("g")
	.attr("class", "axis")
	.style("transform", "translate(60px,60px)");

    for (var i = 0; i < scale_length; i++) {
	axis_group.append("rect")
	    .attr("width", 40)
	    .attr("height", 1)
	    .attr("y", i)
	    .attr("x", 0)
	    .style("fill", colorScale(i));
    }

    axis_group.call(colorAxis)
	.style("stroke-width", 1);

    d3.selectAll('.axis line, .axis path')
	.style("stroke-width","1px");


    // Add lines around the color bar
    // Right
    axis_group.append("line")
	.attr("x1", 40)
	.attr("x2", 40)
	.attr("y1", 0)
	.attr("y2", scale_length)
	.style("stroke", "black")
	.style("stroke-width", 1);
    // Top
    axis_group.append("line")
	.attr("x1", 0)
	.attr("x2", 40)
	.attr("y1", 0)
	.attr("y2", 0)
	.style("stroke", "black")
	.style("stroke-width", 1);
    // Bottom
    axis_group.append("line")
	.attr("x1", 0)
	.attr("x2", 40)
	.attr("y1", scale_length)
	.attr("y2", scale_length)
	.style("stroke", "black")
	.style("stroke-width", 1);

    
    var groups = ass3.svg_heat
	.append("g")
	.attr("id", "heatmapgroup")
	.style("transform", "translate(55px,-30px)")
	.selectAll("path")
        .data(ass3.policeDistricts)
        .enter()
	.append("g")
    //	.style("opacity", "0.7")
	.attr("id", function(d) { return "heat_" + d.properties.district });
    /*
      Add the path for each district, with the data bounded to the group element
    */
    var paths = groups.append("path")
        .attr("d", ass3.geoPath_heat)
        .style("stroke", "grey")
        .style("stroke-width", 1)
        .style("fill", function(d) {
	    return colorScale(scale(d.properties.crimePerPeople));
	})
        .each(function(d,i) {
            _this = d3.select(this);
	    _this.on("mouseover", function(){
                tooltip.style("visibility", "visible");
                var c = ""
                if (category) {
                    c = category.substring(0,1) +
                        category.substring(1).toLowerCase();
                } else {
                    c = "All crimes"
                }
                tooltip.html(
                    "District: " + d.properties.district.substring(0,1) +
                        d.properties.district.substring(1).toLowerCase() + "<br\>"
                        + c + ": " + d.properties.crimePerPeople.toFixed(2)
                )
            })
	        .on("mousemove", function(){
                    tooltip
                        .style("top", (d3.event.pageY-10)+"px")
                        .style("left",(d3.event.pageX+10)+"px");
                })
	        .on("mouseout", function(){
                    tooltip.style("visibility", "hidden");
                });
        });

    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .classed("tooltip_box", true);

}

function setUpHeatMapCategorySelector(){
    _selector = $("#category_selector");
    ass3.categories.forEach(function(cat){
	_selector.append($("<option></option>")
                         .attr("value",cat)
                         .text(cat.substring(0,1) + cat.substring(1).toLowerCase()));
    });

    _selector.change(function(){
	buildDistrictHeatMap(this.value);
    });
}


