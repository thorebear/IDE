// creates a barchart from the 'base' data clicked in the heatmap as a reference
function create_activity_comparison(data, parameter, color, maxValue){
    wc.ac_margin_left = 100;
    wc.ac_margin_top = 60;
    
    var margin_right = 00,
        margin_bottom = 60,
        boxPadding = 4;

    var nTicks = 5;

    var ac_svg = d3.select("#activity_comparison");

    var svg_width  = parseInt(ac_svg.style("width"));
    var svg_height = parseInt(ac_svg.style("height"));

    wc.ac_width    = svg_width - margin_left - margin_right,
    wc.ac_height   = svg_height - wc.ac_margin_top - margin_bottom;

    // use input from data
    var avg      = data.average,
        sum      = data.sum,
        weekdata = data.parameter;

    var weeks  = weekdata.map(function(obj){return obj.week}),
        vals   = weekdata.map(function(obj){return obj.parameter}),
        btitle = wc.dayScale(data.day) + " " + data.hour + "-"+ (data.hour+1),
        ctitle = "Compared to "+wc.dayScale(data.day) + " " + data.hour + "-"+ (data.hour+1);
    
    wc.weekScale = d3.scale.ordinal()
      .domain(d3.range(weekdata.length))
      .range(weeks);

    wc.ac_xScale = d3.scale.ordinal()
      .domain(wc.weeks)
      .rangeRoundBands([wc.ac_margin_left, svg_width- margin_right], 0.6 );

    wc.ac_yScale = d3.scale.linear()
      .domain([0, maxValue])
      .range([svg_height-margin_bottom, wc.ac_margin_top]);

    wc.ac_offset = 30; 
    wc.ac_offset = (svg_width - (margin_right + wc.ac_margin_left))*(1-0.6)/(wc.nWeeks*2); 

    console.log(wc.ac_offset)
    // SVG alterations
    // titles
    ac_svg.select('.btitle').remove();
    ac_svg.append('g').attr('class', 'btitle');
    ac_svg.select('.btitle')
      .append('text')
      .attr('x', (wc.ac_margin_left + wc.ac_offset))
      .attr('y', wc.ac_margin_top)
      .attr('fill', getColor(parameter))
      .attr('text-anchor', 'left')
      .text( btitle);

    ac_svg.select('.ctitle').remove();
    ac_svg.append('g').attr('class', 'ctitle');
    ac_svg.select('.ctitle')
      .append('text')
      .attr('x', (2*wc.ac_margin_left + 2*wc.ac_offset))
      .attr('y', wc.ac_margin_top)
      .attr('fill', getColor(parameter))
      .attr('text-anchor', 'left')
      .text( ctitle);


    // bars and their alignment
    // primary selected interval
    ac_svg.append('g').attr('class', 'base');

    ac_base = ac_svg.select('.base')
      .selectAll('rect')
      .data(weekdata)

    ac_base.transition()
      .attr('y', function(d){ return  wc.ac_yScale(d.parameter)} )
      .attr('height', function(d){ return wc.ac_yScale(0) - wc.ac_yScale(d.parameter)})
      .attr('fill', color);
      
    ac_base.enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', function(d){ return wc.ac_xScale(d.week) - wc.ac_offset} )
      .attr('y', function(d){ return  wc.ac_yScale(d.parameter)} )
      .attr('height', function(d){ return wc.ac_yScale(0) - wc.ac_yScale(d.parameter)})
      .attr('width', wc.ac_xScale.rangeBand() )
      .attr('stroke', 'black')
      .attr('stroke-width', '2')
      .attr('fill', color);

    ac_base.exit()
      .remove()
    // secondary interval, shown on hover
    ac_svg.append('g').attr('class', 'comp');

    ac_comp = ac_svg.select('.comp')
      .selectAll('rect')
      .data(weekdata)

    ac_comp.transition()
      .attr('y', function(d){ return  wc.ac_yScale(d.parameter)} )
      .attr('height', function(d){ return wc.ac_yScale(0) - wc.ac_yScale(d.parameter)})
      .attr('fill', color);

    ac_comp.enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', function(d){ return wc.ac_xScale(d.week) + wc.ac_offset } )
      .attr('y', function(d){ return  wc.ac_yScale(d.parameter)} )
      .attr('width', wc.ac_xScale.rangeBand() )
      .attr('height', function(d){ return wc.ac_yScale(0) - wc.ac_yScale(d.parameter)})
      .attr('stroke', 'black')
      .attr('stroke-width', '2')
      .attr('fill', color);

    ac_comp.exit()
      .remove();
    // Axes and ticks
    var xAxis = d3.svg.axis()
      .scale(wc.ac_xScale)
      .orient('bottom')
      .ticks(wc.nWeeks)
      .tickFormat(function(d,i){return wc.weekScale(i)});
    
    var yAxis = d3.svg.axis()
      .scale(wc.ac_yScale)
      .orient('left')
      .ticks(nTicks);

    ac_svg.selectAll('.axis').remove();

    ac_svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate( 0, '+(svg_height-margin_bottom)+')')
      .call(xAxis);

    ac_svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate('+(wc.ac_margin_left-2)+', 0)')
      .call(yAxis);

}

function update_activity_comparison(data, parameter, color){
  // updates the barchart with an overlay of data hovered over in the heatmap.
    var ac_svg = d3.select("#activity_comparison");

    var avg      = data.average,
        sum      = data.sum,
        weekdata = data.parameter;

    var ctitle   = "Compared to : " + wc.dayScale(data.day) + " " + data.hour + "-"+ (data.hour+1);

    // secondary title is updated
    ac_svg.select('.ctitle').remove();

    ac_svg.append('g').attr('class', 'ctitle');

    ac_svg.select('.ctitle')
      .append('text')
      .attr('x', (2*wc.ac_margin_left + 2*wc.ac_offset))
      .attr('y', wc.ac_margin_top)
      .attr('fill', getColor(parameter))
      .attr('text-anchor', 'left')
      .text( ctitle);

    // secondary bars are updated
    comp_bars = ac_svg.select('.comp')
      .selectAll('rect')
      .data(weekdata);

    comp_bars.transition(500)
      .delay(500)
      .attr('y', function(d){ return  wc.ac_yScale(d.parameter)} )
      .attr('height', function(d){ return wc.ac_yScale(0) - wc.ac_yScale(d.parameter)})
//      .attr('y', function(d){ return wc.ac_height - wc.ac_yScale(d.parameter)} )
//      .attr('height', function(d){ return wc.ac_yScale(d.parameter)})
      .each("start", function(d){
        d3.select(this)
          .transition()
          .duration(200)
          .attr('width', 5 )
          .attr('x', function(d){ return wc.ac_xScale(d.week) + 1.5*wc.ac_offset} )
          .attr('fill', 'white')
      })
      .each("end", function(d){
        d3.select(this)
          .transition()
          .duration(200)
          .attr('width', wc.ac_xScale.rangeBand() )
          .attr('x', function(d){ return wc.ac_xScale(d.week) + wc.ac_offset} )
          .attr('fill', color)
      });

    comp_bars.enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', function(d){ return wc.ac_xScale(d.week) + wc.ac_offset} )
//      .attr('y', function(d){ return wc.ac_height - wc.ac_yScale(d.parameter)} )
      .attr('y', function(d){ return  wc.ac_yScale(d.parameter)} )
      .attr('height', function(d){ return wc.ac_yScale(0) - wc.ac_yScale(d.parameter)})
      .attr('width', wc.ac_xScale.rangeBand() )
//      .attr('height', function(d){ return wc.ac_yScale(d.parameter)})
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