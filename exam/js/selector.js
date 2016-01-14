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
            // ranges: {
            //    'Today': [moment(), moment()],
            //    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            //    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            //    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            //    'This Month': [moment().startOf('month'), moment().endOf('month')],
            //    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            // },
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

