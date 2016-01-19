function linkcreate1() {

    $("#timeIntervalSelector").selectpicker('val', 'dayData');
    $("#timeIntervalSelector").trigger("change");

    // disable all checkboxes
    parameters.forEach(function(parameter) {
	var checkbox = $("[name='" + parameter + "_checkbox']");
	checkbox.bootstrapSwitch('state', false, false);
    });

    $("[name='" + "htmlhits" + "_checkbox']").bootstrapSwitch('state', true, false);


    $("#reportrange").data('daterangepicker')
	.callback(moment("Jun 12 1998"),
		  moment("Jul 12 1998 Jul 23:59:59 GMT+0200 (CEST)"));
}

function linkcreate2() {
    $("#timeIntervalSelector").selectpicker('val', 'quaterData');
    $("#timeIntervalSelector").trigger("change");

    // disable all checkboxes
    parameters.forEach(function(parameter) {
	var checkbox = $("[name='" + parameter + "_checkbox']");
	checkbox.bootstrapSwitch('state', false, false);
    });

    $("[name='" + "transferred_bytes" + "_checkbox']").bootstrapSwitch('state', true, false);

    $("#reportrange").data('daterangepicker')
	.callback(moment("Jun 10 1998"),
		  moment("Jun 15 1998 23:59:59 GMT+0200 (CEST)"));
}

function linkcreate3() {
    $("#barChartParameterSelector").selectpicker('val', 'unique_users');

    $('.range-slider').jRange('setValue', '0,2');
    barFrom = 0;
    barTo = 2;

    $("#barChartParameterSelector").trigger("change");
}

function linkcreate4() {
    $("#heatmapParameterSelector").selectpicker('val', 'htmlhits');

    $("#heatmapParameterSelector").trigger("change");

    d3.select("#hm_box_id_32").on("click")();
}
