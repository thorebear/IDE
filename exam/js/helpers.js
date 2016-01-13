function getColor(parameter) {
    if (parameter === 'transferred_bytes'){
	return 'orange';
    }
    if (parameter === 'uusers') {
	return 'blue';
    }
    if (parameter === 'tothits') {
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
    if (parameter === 'uusers') {
	return 'Unique users';
    }
    if (parameter === 'tothits') {
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
    if (parameter === 'uusers') {
	return 'users';
    }
    if (parameter === 'tothits') {
	return 'requests';
    }
    if (parameter === 'htmlhits') {
	return 'page views';
    }
}
