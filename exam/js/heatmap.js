function heatmap_init() {
    console.log("Initializing the heatmap");
    create_heat_map('unique_users');
}

function create_heat_map(parameter){
    var margin_left = 100,
        margin_right = 20,
        margin_top = 20,
        margin_bottom = 60,
        boxPadding = 4;
    
    var minDay = 0,
        maxDay = 6,
        nDays  = 7,
        minHour = 0,
        maxHour = 23
    nHours  = 24;

    var xScale, yScale, colorScale;

    var wcData  = wc['hourData'];
    // cut the initial 3 days to start on a 'fresh' week
    var tmpData = extract_heatmap_data(wcData.slice(72), parameter); 
    var hmData  = aggregate_heatmap_data(tmpData);
    
    var values  = hmData.map(function(obj){ return obj.max });
    var maxParValue = Math.max(...values);

    // 'start' the bar-chart with initial-valus
    create_activity_comparison(hmData[47], parameter, getColor(parameter), maxParValue);

    var values  = hmData.map(function(obj){ return obj.average });
    var maxPar  = Math.max(...values),
        minPar  = Math.min(...values);
    
    hm_svg = d3.select("#heatmap");
    hm_svg.html("");

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


    var xAxis = d3.svg.axis()
	.scale(xScale)
	.orient('bottom')
	.tickFormat(function(d, i) {
	    if (i % 2 === 0) {
		return d + ":00";
	    } else {
		return "";
	    }
	})
	.ticks(24);

    var yAxis = d3.svg.axis()
	.scale(yScale)
	.orient('left')
	.ticks(nDays)
	.tickFormat(function(d){return wc.dayScale(d)});

    hm_svg.selectAll('rect')
	.data(hmData)
	.enter()
	.append('rect')
	.attr('class','hm_box')
	.attr('id', function(d,i) { return "hm_box_id_" + i })
	.attr('x', function(d) {
            return xScale(d.hour);
	})
	.attr('y', function(d){
            return yScale(d.day);
	})
	.attr('width', hm_width/nHours-boxPadding)
	.attr('height', hm_height/nDays-boxPadding)
	.style('stroke','black')
	.style('stroke-width', 0)
	.attr('fill', function(d) {
            return colorScale(d.average);
	})
	.each( function(d, hour){
            var _this = d3.select(this);
            _this.on("mousemove", function() {
		showTooltipHeatMap(d.day, d.hour, parameter, d.average, d3.event.pageX, d3.event.pageY);
            });
            _this.on("mouseover", function() {
		if (parseInt(_this.style("stroke-width")) === 0){
		    _this.style("stroke-width", 1);
		}
		update_activity_comparison(d, parameter, colorScale(d.average))
            });
            _this.on("click", function() {
		hm_svg.selectAll('.hm_box').style("stroke-width", 0);
		_this.style("stroke-width", "2");
		create_activity_comparison(d, parameter, colorScale(d.average), maxParValue);
            });
            _this.on("mouseout", function() {
		if (parseInt(_this.style("stroke-width")) === 1){
		    _this.style("stroke-width", 0);
		}

		hideTooltipHeatMap();
		//update_activity_comparison([] , parameter, colorScale(d.average))
            });
	});

    hm_svg.append('g')
	.attr('class', 'axisheatmap')
	.attr('transform', 'translate('+margin_left+', '+hm_height*0.5/nDays+')')
	.call(yAxis);

    hm_svg.append('g')
	.attr('class', 'x axis')
	.attr('transform', 'translate( '+(-boxPadding/2)+', '+(svg_height-margin_bottom)+')')
	.call(xAxis);

}


function extract_heatmap_data(dataSet, parameter){
    var dtg, d_day, d_hour, d_week;
    var newData = [];
    for (var i = 0; i < dataSet.length; i++){
	dtg = dataSet[i]['from'];
	d_day = dtg.getDay();
	d_hour = dtg.getHours();
	d_week = getWeek(dtg);

	par = dataSet[i][parameter];
	newData.push({'day':d_day, 'hour':d_hour, 'week':d_week, parameter:par});
    }
    return newData;
}


function aggregate_heatmap_data(hm_data){
    var day = hm_data[0]['day'], 
        hour = hm_data[0]['hour'], 
        week = hm_data[0]['week'], 
        par = hm_data[0]['parameter'],
        sum = 0,
        avg = 0;
    max = 0;
    var out = [ {'day':day, 'hour':hour, 'sum':sum, 'average':avg, 'parameter':[{'week': week, parameter:par}] } ];
    for (var i = 1; i < hm_data.length; i++){
	found = 0;
	for (var j = 0; j < out.length; j++){ // nested for loop, inefficient... hashmap??
            if ((hm_data[i]['day'] === out[j]['day']) & (hm_data[i]['hour'] === out[j]['hour'])){
		week = hm_data[i]['week'], 
		par = hm_data[i]['parameter']          
		out[j]['parameter'].push({'week':week, parameter:par});
		found = 1;
            } 
	}
	if (found === 0) {
            day = hm_data[i]['day'];
            hour = hm_data[i]['hour'];
            week = hm_data[i]['week'], 
            par = hm_data[i]['parameter']
            out.push({'day':day, 'hour':hour, 'sum':sum, 'average':avg, 'parameter':[{'week': week, parameter:par}] });
	}
    }
    for (var i = 0; i < out.length; i++){  
        pars = out[i].parameter.map(function(obj){return obj.parameter});
        out[i]['max'] = Math.max(...pars);
        sum = getSum(out[i]['parameter']);
        out[i]['sum'] = sum;
        out[i]['average'] = sum / out[i]['parameter'].length;
    }
    return out;
}

function getSum(arr){
    var out = 0;
    for (var i = 0; i < arr.length; i++){
	out += arr[i]['parameter'];
    }
    return out;
}

function showTooltipHeatMap(day, hour, parameter, value, x, y) {
    var tooltip_offset_x = 10;
    var tooltip_offset_y = 10;
    var tooltip = d3.select("#tooltip");

    tooltip.html("" + 
		 "<b> " + wc.dayScale(day) + ", " + hour.toString()
		 + ":00" + " - "+ (hour+1).toString() + ":00" + "</b><br/>" +
		 "Average "+getFriendlyName(parameter).toLowerCase() +
		 ": "+ Math.round(value).toString() + " per hour" );

    tooltip.style("visibility", "visible")
	.style("top", y + tooltip_offset_y + "px")
	.style("left", x + tooltip_offset_x +  "px");
}


function hideTooltipHeatMap() {
    var tooltip = d3.select("#tooltip");
    tooltip.style("visibility", "hidden");
}
