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
