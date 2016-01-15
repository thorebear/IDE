// TODO
function init() {
    console.log("Initializing the heatmap");

    create_heat_map('hourData', 'htmlhits',
          new Date("Mon Jun 08 1998 21:30:00 GMT+0200 (CEST)"),
          new Date("Sun Jul 12 1998 21:15:00 GMT+0200 (CEST)"));
}

var margin_left = 20;
var margin_right = 20;
var margin_top = 60;
var margin_bottom = 30;
var svg_width, svg_height, svg;
var xScale;
var data;

function create_heat_map(dataSet, parameter, startTime, endTime){
    data = wc[dataSet];

    svg = d3.select("#heatmap");

    svg.html("");

    svg_width = parseInt(svg.style("width"));
    svg_height = parseInt(svg.style("height"));

    var times = data.map(getTime);

    var weekdays = times.map(getDay);
    var hours = times.map(getHour);

    var minDay = d3.min(weekdays);
    var maxDay = d3.max(weekdays);

    var minHour = d3.min(hours);
    var maxHour = d3.max(hours);

    console.log("Min day: " + minDay);
    console.log("Max day: " + maxDay);
    console.log("Min hour: " + minHour);
    console.log("Max hour: " + maxHour);

    yScale = d3.time.scale()
      .domain([startDay, endDay])
      .range([margin_bottom, svg_height - margin_top]);

    var yAxis = d3.svg.axis()
      .scale(xScale)
      .orient('left')
      .ticks(1);

    svg.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(0, 0)')
      .call(yAxis);

    var hits = data.map(function(entry) { 
      return [entry[parameter],entry[parameter]] 
    }

    hits.forEach(function(parameter) {
      addBox(parameter);
    });

}

function addBox(parameter){
    // too much of a hack? There must exists a cleaner solution using d3
    if (svg.select("#" + parameter + "_group")[0][0] !== null){
  console.warn("Cannot add the line, the line for " + parameter + " already exists");
  return;
    }

}

/*    
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
  .style("opacity", "0.2")
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
  .attr('r', 3)
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
*/


var tooltip_offset_x = 10;
var tooltip_offset_y = 10;

function showTooltip(index, x, y) {
    var tooltip = d3.select("#tooltip");

    var entry = wc[dataSetSelected][index];
    
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
