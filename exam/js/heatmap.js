// TODO
function init() {
    console.log("Initializing the heatmap");

    create_heat_map('hourData', 'htmlhits',
          new Date("Mon Jun 08 1998 21:30:00 GMT+0200 (CEST)"),
          new Date("Sun Jul 12 1998 21:15:00 GMT+0200 (CEST)"));
}


function create_heat_map(dataSet, parameter, startTime, endTime){
    var margin_left = 40;
    var margin_right = 40;
    var margin_top = 60;
    var margin_bottom = 60;
    var xScale, yScale, colorScale;
    var data;
    
    data = wc[dataSet];

    hm_svg = d3.select("#heatmap");

    hm_svg.html("");

    var svg_width = parseInt(hm_svg.style("width"));
    var svg_height = parseInt(hm_svg.style("height"));
    var boxwidth = (svg_width - margin_right) / 24;
    var boxheight = (svg_height - margin_bottom) / 7;

    var times = data.map(getTime);
    var weekdays = times.map( function(d) {return d.getDay()} );
    var hours = times.map( function(d) {return d.getHours()} );

    var minDay = d3.min(weekdays);
    var maxDay = d3.max(weekdays);
    var minHour = d3.min(hours);
    var maxHour = d3.max(hours);

    var mydata = extractHeatmapData(data, parameter);
    var minPar = 9999999999;
    var maxPar = -1;
    for (var i = minDay; i <= maxDay; i++) {
      for (var j = minHour; j <= maxHour; j++) {
        if (mydata[i][j] < minPar) {
          minPar = mydata[i][j]
        }
        if (mydata[i][j] > maxPar) {
          maxPar = mydata[i][j]
        }
      }
    }

    console.log("Min day: " + minDay);
    console.log("Max day: " + maxDay);
    console.log("Min hour: " + minHour);
    console.log("Max hour: " + maxHour);
    console.log("Min "+parameter+": " + minPar);
    console.log("Max "+parameter+": " + maxPar);

    colorScale = d3.time.scale()
      .domain([0, maxPar])
      .range(['white', 'red']);

    xScale = d3.time.scale()
      .domain([minHour, maxHour])
      .range([margin_left, svg_width - margin_right - boxwidth]);

    yScale = d3.time.scale()
      .domain([minDay, maxDay])
      .range([margin_top, svg_height - margin_bottom - boxheight]);

    var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient('bottom')
      .ticks(3);

    var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient('left')
      .ticks(1);


    hm_svg.selectAll('g')
      .data(mydata)
      .enter()
      .append('g')
      .each(function(d,day) {
        var _this = d3.select(this)
        _this.selectAll('rect')
        .data(d)
        .enter()
        .append('rect')
        .attr('x', function(_val,hr) {
          return xScale(hr);
        })
        .attr('y', yScale(day))
        .attr('width', boxwidth)
        .attr('height', boxheight)
        .attr('fill', function(val) {
          return colorScale(val);
/*
        .each(function(d, i){
          var _this = d3.select(this);
          _this.on("mousemove", function() {
            showTooltipHeatMap(i, d3.event.pageX, d3.event.pageY);
          });
          _this.on("mouseout", function() {
            hideTooltipHeatMap();
          });
*/
        });
      });


/*  
    hm_svg.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(0, 0)')
      .call(yAxis);
*/
}

function extractHeatmapData(data, parameter){
  var out = []
  data.forEach(function(d) {
    var day = d.from.getDay();
    var hr = d.from.getHours();
    var hits = d[parameter];
    if ( out[day] === undefined) {
      out[day] = [];
    }
    if (out[day][hr] === undefined) {
      out[day][hr] = 0;
    }
    out[day][hr] += hits;
  });
  return out;
}


function showTooltipHeatMap(day, hour, x, y) {
    var tooltip_offset_x = 10;
    var tooltip_offset_y = 10;
    var tooltip = d3.select("#tooltip");

    /*
    var entry = wc[dataSetSelected][index];
    tooltip.html("" + 
     "<b>" + entry.from.toString(getFormat(dataSetSelected)) + "</b>" +
     "");
    */
    tooltip.html("" + 
     "<b> day: " + day.toString() + ", hour: " + hour.toString() + "</b>" +
     "");
    /*
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
 */   
    tooltip.style("visibility", "visible")
      .style("top", y + tooltip_offset_y + "px")
      .style("left", x + tooltip_offset_x +  "px");
}

function hideTooltipHeatMap() {
    var tooltip = d3.select("#tooltip");
    tooltip.style("visibility", "hidden");
}
