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
        title  = wc.dayScale(data.day) + " " + data.hour + "-"+ (data.hour+1),
        nWeeks = weeks.length;
    
    console.log(title)
    console.log(wc.dayScale(data.day), data.hour, (data.hour+1))
    
    ac_svg.append('g')
      .attr('class', 'basetitle');
    ac_svg.append('g')
      .attr('class', 'comptitle');
    ac_base = ac_svg.append('g')
      .attr('class', 'base');
    ac_comp = ac_svg.append('g')
      .attr('class', 'comp');

    ac_svg.select('.basetitle')
      .append('text')
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

    ac_base.selectAll('rect')
      .data(weekdata)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', function(d){ return wc.acxScale(d.week)} )
      .attr('y', function(d){ return wc.ac_height - wc.acyScale(d.parameter)} )
      .attr('width', wc.acxScale.rangeBand() )
      .attr('height', function(d){ return wc.acyScale(d.parameter)})
      .attr('stroke', 'black')
      .attr('stroke-width', '2')
      .attr('fill', color);

    wc.ac_offset = 30;

    ac_comp.selectAll('rect')
      .data(weekdata)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', function(d){ return wc.acxScale(d.week) + wc.ac_offset } )
      .attr('y', function(d){ return wc.ac_height - wc.acyScale(d.parameter)} )
      .attr('width', wc.acxScale.rangeBand() )
      .attr('height', function(d){ return wc.acyScale(d.parameter)})
      .attr('stroke', 'black')
      .attr('stroke-width', '2')
      .attr('fill', color);

}

function update_activity_comparison(data, parameter, color){
  // updates the barchart with an overlay of data hovered over in the heatmap.
    var ac_svg = d3.select("#activity_comparison");

    var svg_width = parseInt(ac_svg.style("width"));
    var svg_height = parseInt(ac_svg.style("height"));

    var avg    = data.average,
        sum    = data.sum,
        weekdata = data.parameter,
        weeks  = weekdata.map(function(obj){return obj.week}),
        vals   = weekdata.map(function(obj){return obj.parameter}),
        title  = "Compared to : " + wc.dayScale(data.day) + " " + data.hour + "-"+ (data.hour+1),
        nWeeks = weeks.length;

    comp_bars = ac_svg.select('.comp')
      .selectAll('rect')
      .data(weekdata);

    ac_svg.select('.titles')
      .append('text')
      .attr('x', 600)
      .attr('y', 20)
      .text( title)
      .attr('fill', getColor(parameter))
      .attr('text-anchor', 'middle');

    comp_bars.transition(500)
      .delay(500)
      .attr('y', function(d){ return wc.ac_height - wc.acyScale(d.parameter)} )
      .attr('height', function(d){ return wc.acyScale(d.parameter)})
      .each("start", function(d){
        d3.select(this)
          .transition(20)
          .attr('width', 5 )
          .attr('x', function(d){ return wc.acxScale(d.week) +1.35*wc.ac_offset} )
          .attr('fill', 'white')
      })
      .each("end", function(d){
        d3.select(this)
          .transition(20)
          .attr('width', wc.acxScale.rangeBand() )
          .attr('x', function(d){ return wc.acxScale(d.week) +wc.ac_offset} )
          .attr('fill', color)
      });

    comp_bars.enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', function(d){ return wc.acxScale(d.week) +wc.ac_offset} )
      .attr('y', function(d){ return wc.ac_height - wc.acyScale(d.parameter)} )
      .attr('width', wc.acxScale.rangeBand() )
      .attr('height', function(d){ return wc.acyScale(d.parameter)})
      .attr('stroke', 'black')
      .attr('stroke-width', '2')
      .attr('fill', color);

    comp_bars.exit()
      .remove()

}

/*
        // purpose is to redraw the hand in the handsvg based on index
        var points = handsvg.selectAll('circle')
           .data(data[i], function(d){ return d});

        // update points via a smooth transition 
        points.transition()
           .delay(100)
           .duration(1000)
           .attr('cx',function(d){return bxScale(d[0]);})
           .attr('cy',function(d){return byScale(d[1]);})
           .style("fill", "red");

        // enter new points
        points.enter()
           .append('circle')
           .attr('cy',bh/2)
           .attr('r',circleradius)
           .attr('opacity', '0')
           .attr('cx',function(d){return bxScale(d[0]);})
           .attr('cy',function(d){return byScale(d[1]);});

        // remove exiting (old) points
        points.exit()
           .remove();
*/