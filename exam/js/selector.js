var dataSetSelected = 'dayData';
var fromDateSelected = new Date("Jun 10 1998");
var toDateSelected = new Date("Jul 12 1998 23:59:59 GMT+0200 (CEST)");

$(document).ready(function() {
    $("#timeIntervalSelector").change(function(){
	var value = $(this).val();
	dataSetSelected = value;
	recreate_line_chart();
    });

    dataSetSelected = $("#timeIntervalSelector").val();
    
    $('#reportrange').daterangepicker(
	{
	    locale: {
		format: 'DD-MM-YYYY'
	    },
            ranges:{
		'World Cup' : [new Date("Jun 10 1998"),
			       new Date("Jul 12 1998 Jul 23:59:59 GMT+0200 (CEST)")],
		'Group stage' : [new Date("Jun 10 1998"),
				 new Date("Jun 26 1998 23:59:59 GMT+0200 (CEST)")], 
		'Playoffs': [new Date("Jun 27 1998"),
			     new Date("Jul 12 1998 23:59:59 GMT+0200 (CEST)")]
            },
	    "startDate": fromDateSelected,
	    "endDate": toDateSelected,
	    "minDate": new Date("May 01 1998"),
	    "maxDate": new Date("Jul 26 1998")
	},
	function(start, end, label) {
	    $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));

	    fromDateSelected = start._d;
	    toDateSelected = end._d;
	    recreate_line_chart();
	});

    $('#reportrange span').html(moment(fromDateSelected).format('MMMM D, YYYY') + ' - ' + moment(toDateSelected).format('MMMM D, YYYY'));

    $('.range-slider').jRange({
	from: -4,
	to: 6,
	showScale: false,
	theme: "theme-blue",
	step: 0.25,
	format: '%s H',
	width: 185,
	showLabels: true,
	isRange : true,
	ondragend: function() {
	    var value = $(".range-slider").val().split(',');
	    barFrom = parseFloat(value[0]);
	    barTo = parseFloat(value[1]);
	    recreate_bar_chart();
	},
	onbarclicked: function() {
	    var value = $(".range-slider").val().split(',');
	    barFrom = parseFloat(value[0]);
	    barTo = parseFloat(value[1]);
	    recreate_bar_chart();
	}
    });

    $("#barChartParameterSelector").on("change", function() {
	barParameter = $(this).val();
	recreate_bar_chart();
    });

    $("#heatmapParameterSelector").on("change", function() {
	create_heat_map($(this).val());
    });
});

// All selector code that needs data to be loaded!
function selector_init() {
    // Set up group team selectors!
    d3.selectAll(".group_team").each(function() {
	var _this = d3.select(this);
	var country = _this.text().substring(1);
	var matches = getMatchesWithTeam(country);
	_this.on("mouseover", function() {
	    matches.forEach(function(match, index) {
		svg.select("#" + getMatchIdentifier(match)).transition().style("opacity", 1);
	    });
	});

	_this.on("mouseout", function() {
	    matches.forEach(function(match, index) {
		svg.select("#" + getMatchIdentifier(match)).transition().style("opacity", 0.3);
	    });
	});
    });
}

var barFrom = -2;
var barTo = 4;
var barParameter = "unique_users";


function recreate_line_chart() {
    create_line_chart(dataSetSelected, fromDateSelected, toDateSelected);
}

function recreate_bar_chart() {
    create_bar_chart(-barFrom, barTo, barParameter);
}
