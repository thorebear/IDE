wc = {}

$(document).ready(function() {
    loadWCData("data/wc98_log_1hour.json", "hourData", function() {
	loadWCData("data/wc98_log_24hour.json", "dayData", function() {
	    // load more data...
	    init();
	});
    });
});


function loadWCData(fileName, dataName, callback) {
    d3.json(fileName, function(error, json) {
	if (error) return console.warn(error);

	json = json.filter(function(d) { return d !== null });

	wc[dataName] = json;

	wc[dataName].forEach(function(entry) {
	    entry.from = new Date(entry.from);
	    entry.transferred_bytes =
		Math.round((entry.transferred_bytes / (1024 * 1024)) * 100) / 100;
	});

	callback();
    });
}
