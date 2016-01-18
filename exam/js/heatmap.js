function heatmap_init() {
    console.log("Initializing the heatmap");
    create_heat_map('htmlhits');
}




function create_heat_map(parameter){
    var margin_left = 100,
        margin_right = 40,
        margin_top = 60,
        margin_bottom = 60,
        xScale, yScale, colorScale;
    
    var minDay = 0,
        maxDay = 6,
        minHour = 0,
        maxHour = 23;

    var wcData  = wc['hourData'];
    var tmpData = extract_heatmap_data(wcData, parameter);
    var hmData  = aggregate_heatmap_data(tmpData);

    var values  = hmData.map(function(obj){ return obj.average });
    var maxPar  = Math.max(...values),
        minPar  = Math.min(...values);

    hm_svg = d3.select("#heatmap");
    hm_svg.html("");

    var svg_width = parseInt(hm_svg.style("width"));
    var svg_height = parseInt(hm_svg.style("height"));
    var boxwidth = (svg_width - margin_right ) / 24;
    var boxheight = (svg_height - margin_bottom ) / 7;

    var colorScale = d3.scale.linear()
      .domain([0, maxPar])
      .range(['white', getColor(parameter) ]);

    var xScale = d3.scale.linear()
      .domain([minHour, maxHour+1])
      .range([margin_left, svg_width - margin_right - boxwidth]);

    var yScale = d3.scale.linear()
      .domain([minDay, maxDay])
      .range([margin_top, svg_height - margin_bottom - boxheight]);

    dayScale = d3.scale.ordinal()
      .domain([1,2,3,4,5,6,0])
      .range(['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']);

    var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient('bottom')
      .ticks(12+1);

    var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient('left')
      .ticks(7)
      .tickFormat(function(d){return dayScale(d)});

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
      .attr('width', boxwidth)
      .attr('height', boxheight)
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

    hm_svg.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate('+margin_left+', '+boxheight*0.5+')')
      .call(yAxis);

    hm_svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate( 0, '+(svg_height-margin_bottom)+')')
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


function getWeek( d ) { 
  // https://gist.github.com/dblock/1081513
  // Create a copy of this date object  
  var target  = new Date(d.valueOf());  
  // ISO week date weeks start on monday  
  // so correct the day number  
  var dayNr   = (d.getDay() + 6) % 7;  
  // Set the target to the thursday of this week so the  
  // target date is in the right year  
  target.setDate(target.getDate() - dayNr + 3);  
  // ISO 8601 states that week 1 is the week  
  // with january 4th in it  
  var jan4    = new Date(target.getFullYear(), 0, 4);  
  // Number of days between target date and january 4th  
  var dayDiff = (target - jan4) / 86400000;    
  // Calculate week number: Week 1 (january 4th) plus the    
  // number of weeks between target date and january 4th    
  var weekNr = 1 + Math.ceil(dayDiff / 7);    
  return weekNr;    
}


function showTooltipHeatMap(day, hour, parameter, value, x, y) {
    var tooltip_offset_x = 10;
    var tooltip_offset_y = 10;
    var tooltip = d3.select("#tooltip");

    tooltip.html("" + 
     "<b> " + dayScale(day) + ": " + hour.toString() + "-"+ (hour+1).toString() + "</b><br/>" +
     "Average "+parameter+": "+Math.round(value).toString() );

    tooltip.style("visibility", "visible")
      .style("top", y + tooltip_offset_y + "px")
      .style("left", x + tooltip_offset_x +  "px");
}


function hideTooltipHeatMap() {
    var tooltip = d3.select("#tooltip");
    tooltip.style("visibility", "hidden");
}
