var barchart_data;

function bar_chart_init() {
    barchart_data = wc.hourData;
    create_bar_chart(2,4, 'unique_users');
}

function create_bar_chart(hoursBeforeMatch, hoursAfterMatch, parameter) {
    
    var team_data = {};

    wc.worldcup.forEach(function(match) {
	var fromTime = match.date.clone().add(- hoursBeforeMatch).hours();
	var toTime = match.date.clone().add(hoursAfterMatch).hours();
	var data = datefilter(barchart_data, fromTime, toTime);
	match[parameter] = d3.sum(data, function(x) { return x[parameter] });
	if (team_data[match.hometeam] === undefined) {
	    team_data[match.hometeam] = [];
	}
	team_data[match.hometeam].push(match);

	if (team_data[match.awayteam] === undefined) {
	    team_data[match.awayteam] = [];
	}
	team_data[match.awayteam].push(match);
    });

    var countries = [];
    for (var key in team_data) {
	if (team_data.hasOwnProperty(key)) {
	    countries.push(key);
	    var matches = team_data[key];
	    var group_matches = [];
	    var roundOf16 = [];
	    var quarterFinals = [];
	    var semifinals = [];
	    var finals = [];
	    matches.forEach(function(match) {
		var type = match.group;
		if (type.startsWith("Group")) {
		    group_matches.push(match);
		}
		if (type === "Round of 16") {
		    roundOf16.push(match);
		}
		if (type === "Quarter-finals") {
		    quarterFinals.push(match);
		}
		if (type === "Semi-finals") {
		    semifinals.push(match);
		}
		if (type === "Bronze match" || type === "Final") {
		    finals.push(match);
		}
	    });

	    team_data[key].group_result =
		d3.sum(group_matches, function(match) { return match[parameter] });
	    team_data[key].roundOf16_result =
		d3.sum(roundOf16, function(match) { return match[parameter] });
	    team_data[key].quarterFinals_result =
		d3.sum(quarterFinals, function(match) { return match[parameter] });
	    team_data[key].semifinals_result =
		d3.sum(semifinals, function(match) { return match[parameter] });
	    team_data[key].finals_result =
		d3.sum(finals, function(match) { return match[parameter] });

	}
    }


    /// Making the chart!
    var bar_svg = d3.select("#barchart");

    bar_svg.html("");

    bar_svg_width = parseInt(bar_svg.style("width"));
    bar_svg_height = parseInt(bar_svg.style("height"));
    bar_margin_bottom = 10;
    bar_margin_right = 20;
    bar_margin_left = 100;
    bar_margin_top = 10;

    var max_value = d3.max(countries, function(country) {
	var d = team_data[country];
	return d.group_result + d.roundOf16_result + d.quarterFinals_result
	    + d.semifinals_result + d.finals_result;
    });

    console.log(max_value);
    
    var yScale = d3.scale.ordinal()
	.rangeRoundBands([bar_margin_top, bar_svg_height - bar_margin_bottom - bar_margin_top], .1);

    var xScale = d3.scale.linear()
	.range([bar_margin_left, bar_svg_width - bar_margin_right]).nice();

    var yAxis = d3.svg.axis()
	.scale(yScale)
	.orient("left");

    var xAxis = d3.svg.axis()
	.scale(xScale)
	.ticks(3)
	.tickFormat(function(d) { return d3.format("s")(d) + " " + getUnit(parameter); })
	.orient("bottom");

    var colorScale = d3.scale.ordinal().domain([0,4]).range(colorbrewer.Set2[5]);

    var layers = d3.layout.stack()(["group_result", "roundOf16_result",
		       "quarterFinals_result",
		       "semifinals_result", "finals_result"].map(function(c) {
			   return countries.map(function(d) {
			       return {x: d, y: team_data[d][c] }
			   })}));
					       
    xScale.domain([0, max_value]);
    yScale.domain(layers[0].map(function(d) { return d.x }));


    var layer = bar_svg.selectAll(".layer")
	.data(layers)
	.enter()
	.append("g")
	.attr("class", "layer")
	.style("fill", function(d, i) { return colorScale(i); });

    layer.selectAll("rect")
	.data(function(d) { return d; })
	.enter()
	.append("rect")
	.attr("x", function(d) { return xScale(d.y0); })
	.attr("y", function(d) { return yScale(d.x); })
	.attr("width", function(d) { return xScale(d.y0 + d.y) - xScale(d.y0); })
	.attr("height", yScale.rangeBand() - 1);

    bar_svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + (bar_svg_height - bar_margin_bottom - bar_margin_top) + ")")
	.call(xAxis);

    bar_svg.append("g")
	.attr("class", "y axis")
	.attr("transform", "translate(" + bar_margin_left + ",0)")
	.call(yAxis);    
}

