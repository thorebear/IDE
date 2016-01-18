function create_activity_comparison(data, parameter){
  // creates a barchart from the 'base' data clicked in the heatmap as a reference
    var margin_left = 100,
        margin_right = 40,
        margin_top = 60,
        margin_bottom = 60,
        boxPadding = 4;

    var ac_width = 800;
    var ac_height = 400;
    var nTicks = 10;

    ac_svg = d3.select("#activity_comparison");
    ac_svg.html("");

    var svg_width = parseInt(ac_svg.style("width"));
    var svg_height = parseInt(ac_svg.style("height"));

    var avg    = data.average,
        sum    = data.sum,
        weekdata = data.parameter,
        weeks  = weekdata.map(function(obj){return obj.week}),
        vals   = weekdata.map(function(obj){return obj.parameter}),
        title  = wc.dayScale(data.day) + " " + data.hour + "-"+ data.hour+1,
        nWeeks = weeks.length;
    
    console.log(weeks)

    ac_svg.append('g')
      .attr('class', 'titles');
    ac_svg.append('g')
      .attr('class', 'base');
    ac_svg.append('g')
      .attr('class', 'comp');

    ac_svg.select(".titles")
      .append('text')
      .attr('class', 'svgtitle')
      .attr('x', 500)
      .attr('y', 20)
      .text( title)
      .attr('fill', 'blue')
      .attr('text-anchor', 'middle')

    var ac_max = Math.max(...vals); 

    weekScale = d3.scale.ordinal()
      .domain(d3.range(weekdata.length))
      .range(weeks)

    var xScale = d3.scale.ordinal()
      .domain(d3.range(weekdata.length))
      .rangeRoundBands([0,ac_width],0.60)

    var yScale = d3.scale.linear()
      .domain([0, ac_max])
      .range([0, ac_height])

    var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient('bottom')
      .ticks(nWeeks)
      .tickFormat(weekScale());
    
    var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient('left')
      .ticks(nTicks)

    ac_svg.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate('+margin_left+', 0)')
      .call(yAxis);

    ac_svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate( 0, '+(svg_height-margin_bottom)+')')
      .call(xAxis);

    ac_svg.select(".base")
      .selectAll('rect')
      .data(weekdata)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', function(d,i){ return xScale(i)} )
      .attr('y', function(d){return ac_height - yScale(d.parameter)} )
      .attr('width', xScale.rangeBand() )
      .attr('height', function(d){return yScale(d.parameter)})
      .attr('stroke', 'black')
      .attr('stroke-width', '2')
      .attr('fill', getColor(parameter))
}

function update_activity_comparison(data, parameter){
  // updates the barchart with an overlay of data hovered over in the heatmap.
}

/*    
    var minDay = 0,
        maxDay = 6,
        nDays  = 7,
        minHour = 0,
        maxHour = 23
        nHours  = 24;

    var xScale, yScale, colorScale;

    var values  = hmData.map(function(obj){ return obj.average });
    var maxPar  = Math.max(...values),
        minPar  = Math.min(...values);


    var svg_width = parseInt(hm_svg.style("width"));
    var svg_height = parseInt(hm_svg.style("height"));

    var hm_width = svg_width - margin_left - margin_right,
        hm_height = svg_height - margin_top - margin_bottom;

    var colorScale = d3.scale.linear()
      .domain([0, maxPar])
      .range(['white', getColor(parameter) ]);

    var xScale = d3.scale.linear()
      .domain([minHour, maxHour+1])
      .range([margin_left, margin_left + hm_width]);

    var yScale = d3.scale.linear()
      .domain([minDay, maxDay])
      .range([margin_top, (nDays/(nDays+1)) *(margin_top + hm_height )]);


    hm_svg.selectAll('rect')
      .data(hmData)
      .enter()
      .append('rect')
      .attr('class', 'hm_box')
      .attr('x', function(d) {
        return xScale(d.hour);
      })
      .attr('y', function(d){
        return yScale(d.day);
      })
      .attr('width', hm_width/nHours-boxPadding)
      .attr('height', hm_height/nDays-boxPadding)
      .attr('fill', function(d) {
        return colorScale(d.average);
      })
      .each( function(d, hour){
        var _this = d3.select(this);
        _this.on("mousemove", function() {
          showTooltipHeatMap(d.day, d.hour, parameter, d.average, d3.event.pageX, d3.event.pageY);
        });
        _this.on("mouseout", function() {
          hideTooltipHeatMap();
        });
      });

*/
