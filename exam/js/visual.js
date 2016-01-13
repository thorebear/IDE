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
    if (svg.select("#htmlhits" + "_group")[0][0] !== null){
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

    var area = d3.svg.area()
	.x(function(d) { return xScale(getTime(d)); })
	.y0(svg_height-margin_bottom)
	.y1(function(d) { return yScale(accessor(d)); });

    var group = svg.append("g")
	.attr("id", parameter + "_group");

    group.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area)
	.style("fill", color)
	.style("opacity", "0.2");
    
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
	.attr('fill', color);
}

function removeLine(parameter) {
    d3.select("#" + parameter + "_group")
	.remove();
}

function getTime(entry){
    return entry.from;
}


