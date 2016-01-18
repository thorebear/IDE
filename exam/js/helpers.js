function getColor(parameter) {
    var colorSet = colorbrewer.Set1[4];
    if (parameter === 'transferred_bytes'){
	return colorSet[0];
    }
    if (parameter === 'unique_users') {
	return colorSet[1];
    }
    if (parameter === 'total_hits') {
	return colorSet[2];
    }
    if (parameter === 'htmlhits') {
	return colorSet[3];
    }
}

function getColorFromMatchType(type) {
    var colorSet = colorbrewer.Set2[5];
    if (type.startsWith("Group")) {
	return colorSet[0];
    }
    if (type === "Round of 16") {
	return colorSet[1];
    }
    if (type === "Quarter-finals") {
	return colorSet[2];
    }
    if (type === "Semi-finals") {
	return colorSet[3];
    }
    if (type === "Bronze match" || type === "Final") {
	return colorSet[4];
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
	return 'MB';
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

function fifaShortToFlagShort(fifa) {
    return {
	"BRA" : "br",
	"DEN" : "dk",
	"USA" : "us",
	"MEX" : "mx",
	"JAM" : "jm",
	"COL" : "co",
	"PAR" : "py",
	"CHI" : "cl",
	"ARG" : "ar",
	"SCO" : "gb-sct",
	"ENG" : "gb-eng",
	"NED" : "nl",
	"BEL" : "be",
	"FRA" : "fr",
	"ESP" : "es",
	"GER" : "de",
	"AUT" : "at",
	"CRO" : "hr",
	"ITA" : "it",
	"YUG" : "zz",
	"ROU" : "ro",
	"BUL" : "bg",
	"NOR" : "no",
	"TUN" : "tn",
	"MAR" : "ma",
	"NGA" : "ng",
	"CMR" : "cm",
	"RSA" : "za",
	"KSA" : "sa",
	"IRN" : "ir",
	"KOR" : "kr",
	"JPN" : "jp"
    }[fifa];    
}
