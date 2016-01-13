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