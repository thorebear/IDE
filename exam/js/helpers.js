function getColor(parameter) {
    if (parameter === 'transferred_bytes'){
	return 'orange';
    }
    if (parameter === 'unique_users') {
	return 'blue';
    }
    if (parameter === 'total_hits') {
	return 'green';
    }
    if (parameter === 'htmlhits') {
	return 'red';
    }
}

function getFriendlyName(parameter) {
    if (parameter === 'transferred_bytes'){
	return 'Traffic';
    }
    if (parameter === 'unique_users') {
	return 'Unique users';
    }
    if (parameter === 'total_hits') {
	return 'Requests';
    }
    if (parameter === 'htmlhits') {
	return 'Pageviews';
    }
}

function getUnit(parameter) {
    if (parameter === 'transferred_bytes'){
	return 'GB';
    }
    if (parameter === 'unique_users') {
	return 'users';
    }
    if (parameter === 'total_hits') {
	return 'requests';
    }
    if (parameter === 'htmlhits') {
	return 'page views';
    }
}

function getFormat(dataset) {
    if (dataset === 'hourData') {
	return "dddd d/M/yyyy - HH:mm";
    }
    if (dataset === 'dayData') {
	return "dddd d/M/yyyy";
    }
    if (dataset === 'quaterData') {
	return "dddd d/M/yyyy - HH:mm";
    }
}

function datefilter(dataset, minDate, maxDate){
    return dataset.filter( function(entry) {
        return getTime(entry) >= minDate && getTime(entry) <= maxDate;
    });
}

function getMatchIdentifier(match){
    return (match.stadium + match.homeShort + match.awayShort).split(" ").join("").split(",").join("");
}

function getMatchesOnSameTime(match) {
    var result = wc.worldcup.filter(function(match_x) {
	return match_x.date.toString() === match.date.toString() &&
	    getMatchIdentifier(match) !== getMatchIdentifier(match_x);
    });
    return result;
}

function getMatchesWithTeam(country) {
    return wc.worldcup.filter(function(match) {
	return match.hometeam === country || match.awayteam === country;
    });
}
