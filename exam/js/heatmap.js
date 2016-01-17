// TODO
function heatmap_init() {
    console.log("Initializing the heatmap");

    create_heat_map('hourData', 'htmlhits',
          new Date("Mon Jun 08 1998 21:30:00 GMT+0200 (CEST)"),
          new Date("Sun Jul 12 1998 21:15:00 GMT+0200 (CEST)"));
}


function create_heat_map(dataSet, parameter, startTime, endTime){
    var margin_left = 100;
    var margin_right = 40;
    var margin_top = 60;
    var margin_bottom = 60;
    var xScale, yScale, colorScale;
    
    var wcdata = wc[dataSet];

    hm_svg = d3.select("#heatmap");
    hm_svg.html("");

    var svg_width = parseInt(hm_svg.style("width"));
    var svg_height = parseInt(hm_svg.style("height"));
    var boxwidth = (svg_width - margin_right) / 24;
    var boxheight = (svg_height - margin_bottom) / 7;

    var times = wcdata.map(getTime);
    var weekdays = times.map( function(d) {return d.getDay()} );
    var hours = times.map( function(d) {return d.getHours()} );

    var minDay = d3.min(weekdays);
    var maxDay = d3.max(weekdays);
    var minHour = d3.min(hours);
    var maxHour = d3.max(hours);

    var mydata = extractHeatmapData(wcdata, parameter);
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

    var colorScale = d3.time.scale()
      .domain([0, maxPar])
      .range(['white', 'red']);

    var xScale = d3.time.scale()
      .domain([minHour, maxHour])
      .range([margin_left, svg_width - margin_right - boxwidth]);

    var yScale = d3.time.scale()
      .domain([minDay, maxDay])
      .range([margin_top, svg_height - margin_bottom - boxheight]);

    var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient('bottom')
      .ticks(12);

    var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient('left')
      .ticks(1);


    hm_svg.selectAll('g')
      .data(mydata)
      .enter()
      .append('g')
      .attr('class', 'boxrow')
      .each(function(d, day) {
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
        })
        .each( function(value, hour){
          var _this = d3.select(this);
          _this.on("mousemove", function() {
            showTooltipHeatMap(value, hour, d3.event.pageX, d3.event.pageY);
          });
          _this.on("mouseout", function() {
            hideTooltipHeatMap();
          });
        });
      });
    
    hm_svg.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate('+margin_left+', '+boxheight*0.5+')')
      .call(yAxis);

    hm_svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate('+boxwidth*0.5+', '+(svg_height-margin_bottom)+')')
      .call(xAxis);

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


function hour2ms(ms) {
  return ms * 1000 * 3600
}

function day2ms(ms) {
  return ms * 1000 * 3600 * 24
}


function showTooltipHeatMap(value, hour, x, y) {
    var tooltip_offset_x = 10;
    var tooltip_offset_y = 10;
    var tooltip = d3.select("#tooltip");

    tooltip.html("" + 
     "<b> value: " + value.toString() + ", hour: " + hour.toString() + "</b>" +
     "");

    tooltip.style("visibility", "visible")
      .style("top", y + tooltip_offset_y + "px")
      .style("left", x + tooltip_offset_x +  "px");
}

function hideTooltipHeatMap() {
    var tooltip = d3.select("#tooltip");
    tooltip.style("visibility", "hidden");
}
