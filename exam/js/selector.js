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
		'World Cup' : [new Date("Jun 10 1998"), new Date("Jul 12 1998 Jul 23:59:59 GMT+0200 (CEST)")],
		'Group stage' : [new Date("Jun 10 1998"), new Date("Jun 26 1998 23:59:59 GMT+0200 (CEST)")], 
		'Playoffs': [new Date("Jun 27 1998"), new Date("Jul 12 1998 23:59:59 GMT+0200 (CEST)")]
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
		svg.select("#" + getMatchIdentifier(match)).transition().style("opacity", 0.2);
	    });
	});
    });
}


function recreate_line_chart() {
    create_line_chart(dataSetSelected, fromDateSelected, toDateSelected);
}

