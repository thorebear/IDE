var data = []

var list = $(".col-xs-12").children();
list = list.splice(1,list.length-2);

list.forEach(function(a) {
    var child = $(a).children().children();
    var date = child.children(".mu-i-date").text();
    var group = child.children(".mu-i-group").text();
    var stadium = child.children(".mu-i-location").children(".mu-i-stadium").text();
    var hometeam = child.children(".home").children().children(".t-nText").text()
    var homeShort = child.children(".home").children().children(".t-nTri").text()
    var awayteam = child.children(".away").children().children(".t-nText").text()
    var awayShort = child.children(".away").children().children(".t-nTri").text()
    var score = child.children(".s").children().children(".s-score").children().text()
    console.log(homeShort + awayShort + " " + score);

    var a = {
	"date" : date,
	"group" : group,
	"stadium" : stadium,
	"hometeam" : hometeam,
	"homeShort" : homeShort,
	"awayteam" : awayteam,
	"awayShort" : awayShort,
	"score" : score
    }

    data.push(a);
});

console.log(data);
