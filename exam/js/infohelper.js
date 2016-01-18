$(document).ready(function() {

    d3.select("#matches_type_info_box")
	.html(`
	      <svg width="4" height="14">
	      <rect width="4" height="14" y="6" style="fill:` + 
getColorFromMatchType('Group') + 
`;stroke-width:0;" />
	      </svg> Group match <br/>

	      <svg width="4" height="14">
	      <rect width="4" height="14" y="6" style="fill:` + 
getColorFromMatchType('Round of 16') + 
`;stroke-width:0;" />
	      </svg> Round of 16 <br/>

	      <svg width="4" height="14">
	      <rect width="4" height="14" y="6" style="fill:` + 
getColorFromMatchType('Quarter-finals') + 
`;stroke-width:0;" />
	      </svg> Quarter final <br/>

	      <svg width="4" height="14">
	      <rect width="4" height="14" y="6" style="fill:` + 
getColorFromMatchType('Semi-finals') + 
`;stroke-width:0;" />
	      </svg> Semi-final <br/>

	      <svg width="4" height="14">
	      <rect width="4" height="14" y="6" style="fill:` + 
getColorFromMatchType('Final') + 
`;stroke-width:0;" />
	      </svg> Final / Bronze match <br/>
	      
	      `);



});
