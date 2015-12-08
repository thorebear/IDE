$(document).ready(function() {
   init();
});

var ass3 = {}

function init(){

    ass3.width = 1200;
    ass3.height = 880;

    ass3.svg1 = d3.select("#map_1")
        .append("svg")
        .attr("width", ass3.width)
        .attr("height", ass3.height);

    ass3.projection = d3.geo.orthographic()
        .scale(300000).rotate( [122.43, -37.78, 0.0] )
        .translate([ass3.width / 2, ass3.height / 2 ])
        .clipAngle(90).precision(.1);
    
    ass3.geoPath = d3.geo.path().projection(ass3.projection);

    d3.json("sfpd_districts.geojson", buildDistrictMap);


}

function buildDistrictMap(json) {

    ass3.policeDistricts = json.features;

    var colors = colorbrewer.Set3[ass3.policeDistricts.length];    

    ass3.svg1.selectAll("path")
        .data(ass3.policeDistricts)
        .enter()
        .append("path")
        .attr("d", ass3.geoPath)
        .style("stroke", "orange")
        .style("stroke-width", 0)
        .style("fill", function(d, i) {
            return colors[i]
        })
        .each(function(d){
            var _this = d3.select(this);
            _this.on("mouseover", function() {
                // Move to front (to ensure the stroke isn't overlapped by anything)
                this.parentNode.appendChild(this);

                ass3.dict_to_crimes[d.properties.district]
                    .forEach(function(crime){
                        // Move each crime in this area to the front
                        crime.parentNode.appendChild(crime);
                    });
                // Set stroke width
                d3.select(this).style("stroke-width",3);
            })
                .on("mouseout", function() {
                    d3.select(this).style("stroke-width",0);
                });
        })

    d3.json("sf_crime.geojson", buildCrimes);
}

function buildCrimes(json) {
    ass3.crime_circles = ass3.svg1.selectAll("circle")
        .data(json.features)
        .enter()
        .append("circle")
    /* Use each() instead of setting the attributes directly,
       to avoid multiple calls to the projection function for each point. */
        .each(function(d){
            var _this = d3.select(this);
            coords = ass3.projection(d.geometry.coordinates);
            _this.attr("cx", coords[0]);
            _this.attr("cy", coords[1]);
        })
            .attr("r", 1)

    ass3.dict_to_crimes = {}
    for(var i = 0; i < ass3.policeDistricts.length; i++){
        var dist = ass3.policeDistricts[i];
        var district_name = dist.properties.district;
        console.log(district_name);
        var _aa = ass3.crime_circles.filter(function(cc){
            return cc.properties.PdDistrict === district_name;
        });
        ass3.dict_to_crimes[district_name] = _aa[0];
    }
}

    
