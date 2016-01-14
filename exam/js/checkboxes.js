var parameters = ['transferred_bytes', 'unique_users', 'total_hits', 'htmlhits' ];

$(document).ready(function() {
    parameters.forEach(function(parameter) {
	var checkbox = $("[name='" + parameter + "_checkbox']");
	checkbox.bootstrapSwitch({
	    'labelText':getFriendlyName(parameter),
	    'labelWidth': 100
	});

	checkbox.siblings(".bootstrap-switch-handle-on").css("background-color", getColor(parameter));

	checkbox.on('switchChange.bootstrapSwitch', function(event, state) {
	    if(state) {
	     	addLine(parameter);
	    } else {
		removeLine(parameter);
	    }
	});
    });
});

function getActiveParameters() {
    var activeParameters = [];
    parameters.forEach(function(parameter) {
	var checkbox = $("[name='" + parameter + "_checkbox']");
	if (checkbox.bootstrapSwitch('state')){
	    activeParameters.push(parameter);
	}
    });
    return activeParameters;
}
