// creates a barchart from the 'base' data clicked in the heatmap as a reference
function create_activity_comparison(data, parameter, color, maxValue){
    var margin_left = 100,
        margin_right = 40,
        margin_top = 60,
        margin_bottom = 60,
        boxPadding = 4;

    wc.ac_width = 800;
    wc.ac_height = 400;
    var nTicks = 10;

    var ac_svg = d3.select("#activity_comparison");
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
    
    ac_svg.append('g')
      .attr('class', 'titles');
    ac_svg.append('g')
      .attr('class', 'base');
    ac_svg.append('g')
      .attr('class', 'comp');

    ac_svg.select('.titles')
      .select(".basetitle")
      .append('text')
      .attr('class', 'basetitle')
      .attr('x', 200)
      .attr('y', 20)
      .text( title)
      .attr('fill', getColor(parameter))
      .attr('text-anchor', 'middle');

    wc.weekScale = d3.scale.ordinal()
      .domain(d3.range(weekdata.length))
      .range(weeks);

    wc.acxScale = d3.scale.ordinal()
      .domain(wc.weeks)
      .rangeRoundBands([0,wc.ac_width],0.60);

    wc.acyScale = d3.scale.linear()
      .domain([0, maxValue])
      .range([0, wc.ac_height]);

    var xAxis = d3.svg.axis()
      .scale(wc.acxScale)
      .orient('bottom')
      .ticks(nWeeks)
      .tickFormat(function(d,i){return wc.weekScale(i)});
    
    var yAxis = d3.svg.axis()
      .scale(wc.acyScale)
      .orient('left')
      .ticks(nTicks);

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
      .attr('x', function(d){ return wc.acxScale(d.week)} )
      .attr('y', function(d){return wc.ac_height - wc.acyScale(d.parameter)} )
      .attr('width', wc.acxScale.rangeBand() )
      .attr('height', function(d){return wc.acyScale(d.parameter)})
      .attr('stroke', 'black')
      .attr('stroke-width', '2')
      .attr('fill', color);

}

function update_activity_comparison(data, parameter, color){
  // updates the barchart with an overlay of data hovered over in the heatmap.
    var ac_svg = d3.select("#activity_comparison");
    var offset = 20;

    var svg_width = parseInt(ac_svg.style("width"));
    var svg_height = parseInt(ac_svg.style("height"));

    var avg    = data.average,
        sum    = data.sum,
        weekdata = data.parameter,
        weeks  = weekdata.map(function(obj){return obj.week}),
        vals   = weekdata.map(function(obj){return obj.parameter}),
        title  = "Compared to : " + wc.dayScale(data.day) + " " + data.hour + "-"+ data.hour+1,
        nWeeks = weeks.length;

    ac_svg.select('.titles')
      .select(".comptitle")
      .html("")
      .append('text')
      .attr('class', 'comptitle')
      .attr('x', 600)
      .attr('y', 20)
      .text( title)
      .attr('fill', getColor(parameter))
      .attr('text-anchor', 'middle');

    ac_svg.select(".comp")
      .selectAll('rect')
      .data(weekdata)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', function(d){ return wc.acxScale(d.week) +offset} )
      .attr('y', function(d){return wc.ac_height - wc.acyScale(d.parameter)} )
      .attr('width', wc.acxScale.rangeBand() )
      .attr('height', function(d){return wc.acyScale(d.parameter)})
      .attr('stroke', 'black')
      .attr('stroke-width', '2')
      .attr('fill', color);
}
