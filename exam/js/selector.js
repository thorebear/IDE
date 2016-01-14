var dataSetSelected = 'N/A';
var fromDateSelected = new Date("Thu Apr 30 1998 00:00:00 GMT+0200 (CEST)");
var toDateSelected = new Date("Sun Jul 26 1998 00:00:00 GMT+0200 (CEST)");

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
		'World Cup' : [new Date("Jun 10 1998"), new Date("Jul 12 1998")],
		'Group stage' : [new Date("Jun 10 1998"), new Date("Jun 26 1998")], 
		'Playoffs': [new Date("Jun 26 1998"), new Date("Jul 12 1998")]
            },
	    "startDate": fromDateSelected,
	    "endDate": toDateSelected,
	    "minDate": fromDateSelected,
	    "maxDate": toDateSelected
	},
	function(start, end, label) {
	    $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));

	    fromDateSelected = start._d;
	    toDateSelected = end._d;
	    recreate_line_chart();
	});

    $('#reportrange span').html(moment(fromDateSelected).format('MMMM D, YYYY') + ' - ' + moment(toDateSelected).format('MMMM D, YYYY'));
});


function recreate_line_chart() {
    create_line_chart(dataSetSelected, fromDateSelected, toDateSelected);
}

