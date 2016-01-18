function init() {
    create_line_chart(dataSetSelected, fromDateSelected, toDateSelected);
}

var margin_left = 120;
var margin_right = 120;
var margin_top = 100;
var margin_bottom = 30;
var svg_width, svg_height, svg;
var xScale;
var data;

function create_line_chart(dataSet, startTime, endTime){
    data = datefilter(wc[dataSet], startTime, endTime);

    svg = d3.select("#line_chart");

    svg.html("");

    svg_width = parseInt(svg.style("width"));
    svg_height = parseInt(svg.style("height"));

    var times = data.map(getTime);

    var minTime = d3.min(times);
    var maxTime = d3.max(times);
    console.log("Min time: " + minTime);
    console.log("Max time: " + maxTime);
	
    xScale = d3.time
     	.scale()
     	.domain([startTime, endTime])
	.range([margin_left, svg_width - margin_right]);


    var xAxis = d3.svg.axis()
	.scale(xScale)
	.orient('bottom')
	.ticks(10);

    svg.append('g')
	.attr('class', 'x axis')
	.attr('transform', 'translate(0, ' + (svg_height - margin_bottom) + ')')
	.call(xAxis);

    addMatches();

    getActiveParameters().forEach(function(parameter) {
	addLine(parameter);
    });


}

function addLine(parameter){
    // too much of a hack? There must exists a cleaner solution using d3
    if (svg.select("#" + parameter + "_group")[0][0] !== null){
	console.warn("Cannot add the line, the line for " + parameter + " already exists");
	return;
    }
    
    var color = getColor(parameter);
    var accessor = function(d) {
	return d[parameter];
    };
    var values = data.map(accessor);
    var minY = d3.min(values);
    var maxY = d3.max(values);
    console.log("Min value for " + parameter + ": " + minY);
    console.log("Max value for " + parameter + ": " + maxY);

    var yScale = d3.scale.linear()
	.domain([minY, maxY])
	.range([svg_height - margin_bottom, margin_top]);

    var lineGen = d3.svg.line()
	.x(function(d) {
	    return xScale(getTime(d));
	})
	.y(function(d) {
	    return yScale(accessor(d));
	});

    var areaGen = d3.svg.area()
	.x(function(d) { return xScale(getTime(d)); })
	.y0(svg_height-margin_bottom)
	.y1(function(d) { return yScale(accessor(d)); });


    var group = svg.append("g")
	.attr("id", parameter + "_group");

    group.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", areaGen)
    	.style("fill", color)
    	.style("opacity", "0.1")
    	.style("pointer-events", "none");
    
    group.append("svg:path")
    	.attr("d", lineGen(data))
    	.attr("stroke", color)
    	.attr("stroke-width", 1)
    	.attr("fill", "none");

    group.selectAll("circle")
	.data(data)
	.enter()
	.append("circle")
	.attr('cy', function(d) {
	    return yScale(accessor(d));
	})
	.attr('cx', function(d) {
	    return xScale(getTime(d));
	})
	.attr('r', d3.min([5, d3.max([1.5, 300 / data.length])]))
	.attr('fill', color)
	.attr('class', function(d, i) {
	    return "circle-for-index-" + i;
	})
	.each(function(d, i){
	    var _this = d3.select(this);
	    _this.on("mousemove", function() {
		showTooltip(d, d3.event.pageX, d3.event.pageY);
	    });
	    _this.on("mouseover", function() {
		svg.selectAll(".circle-for-index-" + i)
		    .style("stroke-width", 1)
		    .style("stroke", "black");
	    });
	    _this.on("mouseout", function() {
		hideTooltip();
		svg.selectAll(".circle-for-index-" + i)
		    .style("stroke-width", 0)
		    .style("stroke", "black");
	    });
	});

    //Define Y axis
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient(getYAxisOrientation(parameter))
        .ticks(3);

    //Create Y axis
    var yAxisGroup = group.append("g")
	.style("stroke", color)
	.attr("class", "yaxis")
	.attr("transform", "translate(" + getYAxisPosition(parameter) + ",0)")
	.call(yAxis);

    yAxisGroup.selectAll(".tick").select("text").style("stroke","none").style("fill", color);
}

var tooltip_offset_x = 10;
var tooltip_offset_y = 10;

function getYAxisPosition(parameter) {
    if (parameter === 'transferred_bytes'){
	return svg_width-margin_right + 10;
    }
    if (parameter === 'unique_users') {
	return svg_width-margin_right+70;
    }
    if (parameter === 'total_hits') {
	return margin_left -10 ;
    }
    if (parameter === 'htmlhits') {
	return margin_left - 70;
    }
}

function getYAxisOrientation(parameter) {
    if (parameter === 'transferred_bytes'){
	return "right";
    }
    if (parameter === 'unique_users') {
	return "right";
    }
    if (parameter === 'total_hits') {
	return "left";
    }
    if (parameter === 'htmlhits') {
	return "left";
    }
}


function showMatchInfo(match, x, y, number) {
    
    showBox(x, y, number);
    
    function showBox(x, y, number) {
	var info = d3.select("#match_info" + number);
	info.select(".home_team").attr("class","home_team flag-icon flag-icon-"
				       + fifaShortToFlagShort(match.homeShort));
	info.select(".away_team").attr("class","away_team flag-icon flag-icon-"
				       + fifaShortToFlagShort(match.awayShort));
	info.select(".match_group").text(match.group);
	info.select(".match_time").text(match.date.toString("dd/MM HH:mm"));

	info.attr("data-identifier", getMatchIdentifier(match));
	
	d3.select("#match_box" + number).style("visibility", "visible")
	    .style("top", y + "px")
	    .style("left", (x - 35) + "px");
    }
}

function hideMatchInfo() {
    d3.select("#match_box1").style("visibility", "hidden");
    d3.select("#match_box2").style("visibility", "hidden");
}

function fifaShortToFlagShort(fifa) {
    return {
	"BRA" : "br",
	"DEN" : "dk",
	"USA" : "us",
	"MEX" : "mx",
	"JAM" : "jm",
	"COL" : "co",
	"PAR" : "py",
	"CHI" : "cl",
	"ARG" : "ar",
	"SCO" : "gb-sct",
	"ENG" : "gb-eng",
	"NED" : "nl",
	"BEL" : "be",
	"FRA" : "fr",
	"ESP" : "es",
	"GER" : "de",
	"AUT" : "at",
	"CRO" : "hr",
	"ITA" : "it",
	"YUG" : "zz",
	"ROU" : "ro",
	"BUL" : "bg",
	"NOR" : "no",
	"TUN" : "tn",
	"MAR" : "ma",
	"NGA" : "ng",
	"CMR" : "cm",
	"RSA" : "za",
	"KSA" : "sa",
	"IRN" : "ir",
	"KOR" : "kr",
	"JPN" : "jp"
    }[fifa];
    
}

function showTooltip(entry, x, y) {
    var tooltip = d3.select("#tooltip");

    tooltip.html("" + 
		 "<b>" + entry.from.toString(getFormat(dataSetSelected)) + "</b>" +
		 "");

    getActiveParameters().forEach(function(parameter) {
	tooltip.html(tooltip.html()
		     + "<br/>"
		     + "<svg width='10' height='10'>"
		     + "<rect width='10' height='10' style='fill:"
		     + getColor(parameter)
		     + ";stroke:black;stroke-width:1'/></svg>"
		     + "\t"
		     + entry[parameter] + " " + getUnit(parameter)
		    );
    });
    
    tooltip.style("visibility", "visible")
	.style("top", y + tooltip_offset_y + "px")
	.style("left", x + tooltip_offset_x +  "px");
}

function hideTooltip() {
    var tooltip = d3.select("#tooltip");
    tooltip.style("visibility", "hidden");
}

function removeLine(parameter) {
    d3.select("#" + parameter + "_group")
	.remove();
}

function getTime(entry){
    return entry.from;
}

function addMatches() {
    var matches = wc.worldcup;

    matches = matches.filter(function(match) {
	return match.date >= fromDateSelected && match.date <= toDateSelected;
    });

    svg.selectAll("rect")
	.data(matches)
	.enter()
	.append("rect")
	.attr("id", function(d) {
	    return getMatchIdentifier(d);
	})
	.attr("x", function(d) {
	    return xScale(d.date);
	})
	.attr("y", margin_top )
	.attr("width", function(d) {
	    // for now we assume that a match is two hours, matches with 'rematch' took ofc longer.
	    return xScale(d.date.clone().add(2).hours()) - xScale(d.date);
	})
	.attr("height", svg_height - margin_top - margin_bottom)
	.style("opacity", 0.3)
	.attr("fill", function(d) {
	    return getColorFromMatchType(d);
	})
	.each(function(match) {
	    var _this = d3.select(this);
	    _this.on("mousemove", function() {
		getMatchesOnSameTime(match).forEach(function(x) {
		    showMatchInfo(x, d3.event.pageX, 55, 2);
		})

		showMatchInfo(match, d3.event.pageX, 130, 1);

		_this.style("opacity",1);
	    });

	    _this.on("mouseout", function() {
		_this.style("opacity", 0.2);
		hideMatchInfo();
	    });
	});
}


