wc = {}

$(document).ready(function() {
    d3.json("data/worldcup.json", function(error, json) {
	if (error) return console.warn(error);

	wc.worldcup = json;

	wc.worldcup.forEach(function(entry) {
	    entry.date = new Date(entry.date);
	});

	loadWCData("data/wc98_log_1hour.json", "hourData", function() {
	    loadWCData("data/wc98_log_24hour.json", "dayData", function() {
		loadWCData("data/wc98_log_0.25hour.json", "quaterData", function() {
		    init();
		});
	    });
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
