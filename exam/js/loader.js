wc = {}

$(document).ready(function() {
    d3.json("data/wc_day44_1_new.json", function(error, json) {
	if (error) return console.warn(error);

	wc.hourData = json;

	wc.hourData.forEach(function(entry) {
	    entry.from = new Date(entry.from);
	    entry.transferred_bytes =
		Math.round((entry.transferred_bytes / (1024 * 1024)) * 100) / 100;
	});

	init();
    });
});
