function init() {
    console.log("Initializing the visualisations");

    create_line_chart();
}

var margin_left = 20;
var margin_right = 20;
var margin_top = 20;
var margin_bottom = 30;
var svg_width, svg_height, svg;
var xScale;

function create_line_chart(){
    var data = wc.hourData;
   
    svg = d3.select("#line_chart");
    svg_width = parseInt(svg.style("width"));
    svg_height = parseInt(svg.style("height"));

    var times = data.map(getTime);

    var minTime = d3.min(times);
    var maxTime = d3.max(times);
    console.log("Min time: " + minTime);
    console.log("Max time: " + maxTime);
	
    xScale = d3.time
     	.scale()
     	.domain([minTime, maxTime])
	.range([margin_left, svg_width - margin_right]);

    var xAxis = d3.svg.axis()
	.scale(xScale)
	.orient('bottom')
	.ticks(d3.time.hour, 1);

    svg.append('g')
	.attr('class', 'x axis')
	.attr('transform', 'translate(0, ' + (svg_height - margin_bottom) + ')')
	.call(xAxis);

    addLine('transferred_bytes');
}

function addLine(parameter){
    // too much of a hack? There must exists a cleaner solution using d3
    if (svg.select("#" + parameter + "_group")[0][0] !== null){
	console.warn("Cannot add the line, the line for " + parameter + " already exists");
	return;
    }

    
    var data = wc.hourData;
    
    var color = getColor(parameter);
    var accessor = function(d) {
	return d[parameter];
    };
    var values = data.map(accessor).map(parseInt);
    var minY = d3.min(values);
    var maxY = d3.max(values);

    var yScale = d3.scale.linear()
	.domain([minY, maxY])
	.range([margin_top, svg_height - margin_bottom]);

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
	.style("opacity", "0.2")
	.style("pointer-events", "none");
    
    group.append("svg:path")
	.attr("d", lineGen(data))
	.attr("stroke", color)
	.attr("stroke-width", 3)
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
	.attr('r', 5)
	.attr('fill', color)
	.each(function(d, i){
	    var _this = d3.select(this);
	    _this.on("mousemove", function() {
		showTooltip(i, d3.event.pageX, d3.event.pageY);
	    });
	    _this.on("mouseout", function() {
		hideTooltip();
	    });
	});
}

var tooltip_offset_x = 10;
var tooltip_offset_y = 10;

function showTooltip(index, x, y) {
    var tooltip = d3.select("#tooltip");

    var entry = wc.hourData[index];
    
    tooltip.html("" + 
		 "<b>" + entry.from.toString("dddd M/d/yyyy - HH:mm") + "</b>" +
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


