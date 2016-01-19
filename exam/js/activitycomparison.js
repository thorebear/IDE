// creates a barchart from the 'base' data clicked in the heatmap as a reference
function create_activity_comparison(data, parameter, color, maxValue){
    wc.ac_margin_left = 60;
    wc.ac_margin_top = 20;
    wc.ac_margin_right = 0;
    wc.ac_margin_bottom = 60;
    
    var nTicks = 5;

    var ac_svg = d3.select("#activity_comparison");
    wc.ac_svg_width  = parseInt(ac_svg.style("width"));
    wc.ac_svg_height = parseInt(ac_svg.style("height"));

    var xcenter = wc.ac_margin_left + (wc.ac_svg_width - (wc.ac_margin_left + wc.ac_margin_right))/2 

    // use input from data
    var avg      = data.average,
        sum      = data.sum,
        weekdata = data.parameter;

    // to calculate local variables ...
    var weeks  = weekdata.map(function(obj){return obj.week}),
        vals   = weekdata.map(function(obj){return obj.parameter}),
        btitle = wc.dayScale(data.day) + " " + data.hour + ":00" + "-"+ (data.hour+1) + ":00",
        ctitle = wc.dayScale(data.day) + " " + data.hour + ":00" + "-"+ (data.hour+1) + ":00";

    // ... and to calculate stuff available in the 'wc' namespace
    wc.weekScale = d3.scale.ordinal()
	.domain(d3.range(weekdata.length))
	.range(weeks);

    wc.ac_xScale = d3.scale.ordinal()
	.domain(wc.weeks)
	.rangeRoundBands([wc.ac_margin_left, wc.ac_svg_width - wc.ac_margin_right], 0.6 );

    wc.ac_yScale = d3.scale.linear()
	.domain([0, maxValue])
	.range([wc.ac_svg_height - wc.ac_margin_bottom, wc.ac_margin_top]).nice();

    wc.ac_offset = (wc.ac_svg_width - (wc.ac_margin_right + wc.ac_margin_left))*(1-0.58)/(wc.nWeeks*2); 

    // bars and their alignment
    // primary selected interval
    ac_svg.append('g').attr('class', 'base bar');

    ac_base = ac_svg.select('.base.bar')
	.selectAll('rect')
	.data(weekdata)

    ac_base.transition()
	.attr('y', function(d){ return  wc.ac_yScale(d.parameter)} )
	.attr('height', function(d){ return wc.ac_yScale(0) - wc.ac_yScale(d.parameter)})
	.attr('fill', color);
    
    ac_base.enter()
	.append('rect')
	.attr('x', function(d){ return wc.ac_xScale(d.week) - wc.ac_offset} )
	.attr('y', function(d){ return  wc.ac_yScale(d.parameter)} )
	.attr('height', function(d){ return wc.ac_yScale(0) - wc.ac_yScale(d.parameter)})
	.attr('width', wc.ac_xScale.rangeBand() )
	.attr('stroke', 'black')
	.attr('fill', color);

    ac_base.exit()
	.remove()

    // secondary interval, shown on hover
    ac_svg.append('g').attr('class', 'comp bar');

    ac_comp = ac_svg.select('.comp.bar')
	.selectAll('rect')
	.data(weekdata)

    ac_comp.transition()
	.attr('y', function(d){ return  wc.ac_yScale(d.parameter)} )
	.attr('height', function(d){ return wc.ac_yScale(0) - wc.ac_yScale(d.parameter)})
	.attr('fill', color);

    ac_comp.enter()
	.append('rect')
	.attr('x', function(d){ return wc.ac_xScale(d.week) + wc.ac_offset } )
	.attr('y', function(d){ return  wc.ac_yScale(d.parameter)} )
	.attr('width', wc.ac_xScale.rangeBand() )
	.attr('height', function(d){ return wc.ac_yScale(0) - wc.ac_yScale(d.parameter)})
	.attr('stroke', 'black')
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
	.tickFormat(function(d) { return d3.format("s")(d) })
	.ticks(nTicks);

    // redraw for every click... remove and recreate placeholders
    ac_svg.selectAll('.label').remove();
    ac_svg.selectAll('.axis').remove();

    ac_svg.append('g').attr('class', 'label base');
    ac_svg.append('g').attr('class', 'label comp');

    // draw axes
    ac_svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate( 0, '+(wc.ac_svg_height-wc.ac_margin_bottom)+')')
	.call(xAxis);

    ac_svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate('+(wc.ac_margin_left)+', 0)')
	.call(yAxis);

    // titles and labels as well
    ac_svg.select('.label.base')
	.append('text')
	.attr('x', (wc.ac_margin_left + wc.ac_offset))
	.attr('y', wc.ac_margin_top)
	.attr('fill', getColor(parameter))
	.attr('text-anchor', 'start')
	.text( btitle);

    ac_svg.select('.label.comp')
	.append('text')
	.attr('x', (wc.ac_svg_width - (wc.ac_margin_right + wc.ac_offset)) )
	.attr('y', wc.ac_margin_top)
	.attr('fill', getColor(parameter))
	.attr('text-anchor', 'end')
	.text( ctitle);

    ac_svg.append('text')
        .attr('class', 'label title')
        .attr('x', xcenter )
        .attr('y', (wc.ac_svg_height-(wc.ac_margin_bottom/3)) )
        .attr('fill', getColor(parameter) )
        .attr('text-anchor', 'middle')
        .attr('font-size', '20')
        .text('Week of 1998');

    ac_svg.append('text')
        .attr('class', 'label title')
        .attr('x', xcenter )
        .attr('y', wc.ac_margin_top )
        .attr('fill', getColor(parameter))
        .attr('text-anchor', 'middle')
        .attr('font-size', '20')
        .text( getUnit(parameter) );

    // average label
    ac_svg.select('.label.base')
	.append('text')
	.attr('x', (wc.ac_margin_left + wc.ac_offset) )
	.attr('y', wc.ac_yScale(avg)-5 )
	.attr('fill', getColor(parameter))
	.attr('text-anchor', 'start')
	.text('average');

    ac_svg.select('.label.comp')
	.append('text')
	.attr('x', (wc.ac_svg_width - (wc.ac_margin_right + wc.ac_offset)) )
	.attr('y', wc.ac_yScale(avg)-5 )
	.attr('fill', getColor(parameter))
	.attr('text-anchor', 'end')
	.text('average');

    // average line
    ac_svg.append('line')
        .attr('class', 'base axis avg')
        .attr('x1', wc.ac_margin_left )
        .attr('x2', wc.ac_svg_width - wc.ac_margin_right )
        .attr('y1', wc.ac_yScale(avg) )
        .attr('y2', wc.ac_yScale(avg) )
        .attr('stroke', color )
        .attr('stroke-width', '2');

    ac_svg.append('line')
        .attr('class', 'comp axis avg')
        .attr('x1', wc.ac_margin_left )
        .attr('x2', wc.ac_svg_width - wc.ac_margin_right )
        .attr('y1', wc.ac_yScale(avg) )
        .attr('y2', wc.ac_yScale(avg) )
        .attr('stroke', color )
        .attr('stroke-width', '2');
}

function update_activity_comparison(data, parameter, color){
    // updates the barchart with an overlay of data hovered over in the heatmap.
    var ac_svg = d3.select("#activity_comparison");

    var avg      = data.average,
        sum      = data.sum,
        weekdata = data.parameter;

    var ctitle   = ctitle = wc.dayScale(data.day) + " " + data.hour + ":00" + "-"+ (data.hour+1) + ":00";

    // secondary title is updated
    ac_svg.select('.label.comp').remove();
    ac_svg.select('.avg.comp').remove();
    ac_svg.append('g').attr('class', 'label comp');

    ac_svg.append('line')
        .attr('class', 'comp axis avg')
        .attr('x1', wc.ac_margin_left )
        .attr('x2', wc.ac_svg_width - wc.ac_margin_right )
        .attr('y1', wc.ac_yScale(avg) )
        .attr('y2', wc.ac_yScale(avg) )
	.attr('stroke-width', 2)
        .attr('stroke', color);

    ac_svg.select('.label.comp')
	.append('text')
	.attr('x', (wc.ac_svg_width - (wc.ac_margin_right + wc.ac_offset)) )
	.attr('y', wc.ac_margin_top)
	.attr('fill', getColor(parameter))
	.attr('text-anchor', 'end')
	.text( ctitle);

    ac_svg.select('.label.comp')
	.append('text')
	.attr('x', (wc.ac_svg_width - (wc.ac_margin_right + wc.ac_offset)) )
	.attr('y', wc.ac_yScale(avg)-5 )
	.attr('fill', getColor(parameter))
	.attr('text-anchor', 'end')
	.text('average');


    // secondary bars are updated
    comp_bars = ac_svg.select('.comp.bar')
	.selectAll('rect')
	.data(weekdata);

    comp_bars.transition(500)
	.attr('y', function(d){ return  wc.ac_yScale(d.parameter)} )
	.attr('height', function(d){ return wc.ac_yScale(0) - wc.ac_yScale(d.parameter)})
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
	.attr('y', function(d){ return  wc.ac_yScale(d.parameter)} )
	.attr('height', function(d){ return wc.ac_yScale(0) - wc.ac_yScale(d.parameter)})
	.attr('width', wc.ac_xScale.rangeBand() )
	.attr('stroke', 'black')
	.attr('fill', color);

    comp_bars.exit()
	.remove()

}
