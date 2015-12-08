$(document).ready(function() {
   init();
});

function init(){

    var width = 1200;
    var height = 880;

    var svg = d3.select("#map_1")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    var projection = d3.geo.orthographic()
        .scale(300000).rotate( [122.43, -37.78, 0.0] )
        .translate([width / 2, height / 2 ])
        .clipAngle(90).precision(.1);
    
    var geoPath = d3.geo.path().projection(projection);

    d3.json("sfpd_districts.geojson",function(json) {

        var colors = colorbrewer.Set3[json.features.length];
        
        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", geoPath)
            .style("stroke", "black")
            .style("stroke-width", 0)
            .style("fill", function(d, i) {
                return colors[i]
            })
            .on("mouseover", function() {
                // Move to front (to ensure the stroke isn't overlapped by anything)
                this.parentNode.appendChild(this);
                // Set stroke width
                d3.select(this).style("stroke-width",3);
            })
            .on("mouseout", function() {
                d3.select(this).style("stroke-width",0);
            });


    });
}
