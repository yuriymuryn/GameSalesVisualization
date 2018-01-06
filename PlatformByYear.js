/*
0: "Name"
1: "Platform"
2: "Year_of_Release"
3: "Genre"
4: "Publisher"
5: "NA_Sales"
6: "EU_Sales"
7: "JP_Sales"
8: "Other_Sales"
9: "Global_Sales"
10: "Critic_Score"
11: "Critic_Count"
12: "User_Score"
13: "User_Count"
14: "Rating"
*/

// FORMAT > {{year:{publisher:[NumJogos,TotalMoney,UserScore,Critic_Score], publisher:[...]} }, ...}
//ou
// FORMAT > {{year:{platform:[NumJogos,TotalMoney,UserScore,Critic_Score], platform:[...]} }, ...}
function processPlatformByYear(structure, row){
    var year = +row.Year_of_Release,
        platform = row.Platform,
        globalSlales = +row.Global_Sales,
        userScore = +row.User_Score,
        criticScore = +row.Critic_Score;


    // If some field doesn't exist we skip this entry
    if (!year || !platform || !globalSlales )
        return

    if (platform==2600)
        platform="Atari 2600";

    if (!structure[year]){
        structure[year]= {};//{platform :[1,globalSlales,userScore,criticScore]};
        structure[year][platform] = [1,globalSlales,userScore,criticScore];

    } else if(!structure[year][platform]) {
        structure[year][platform] = [1,globalSlales,userScore,criticScore];
    } else {
        structure[year][platform][0] += 1;
        structure[year][platform][1] += globalSlales;
        structure[year][platform][2] = (structure[year][platform][2]*(structure[year][platform][0]-1)+userScore)/structure[year][platform][0]; //avg on fly
        structure[year][platform][3] = (structure[year][platform][3]*(structure[year][platform][0]-1)+criticScore)/structure[year][platform][0]; //avg on fly
    }
}

//bases retiradas de http://bl.ocks.org/lucassus/3878348
function generatePlatformByYear(dat, div_id) {


    var margin = {top: 30, right: 50, bottom: 40, left:40};
    var width = 800 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    var windowHalfSize = 50;

    var data = [0];
    for (var i = 1; i < 1000; i++) {
        var sign = Math.random() > 0.5 ? +1 : -1;
        data.push(data[i-1] + sign * Math.random());
    }
    console.log(data);
    var x_scale = d3.scaleLinear().domain([0, data.length]).range([0, width]);
    var y_scale = d3.scaleLinear().domain([d3.min(data), d3.max(data)]).range([height, 0]);

    var line = d3.line()
        .x(function (d,i) {
            return x_scale(i);
        })
        .y(function (d) {
            return y_scale(d);
        });

    var svg = d3.select("#visualisationY")
        .append("svg")
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x_axis = d3.axisBottom(x_scale);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate("+margin.left+"," + height + ")")
        .call(x_axis);

    var y_axis = d3.axisLeft(y_scale);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate("+margin.left+",0)")
        .call(y_axis);

    var clip = svg.append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("id", "clip-rect")
        .attr("x", margin.left)
        .attr("y", "0")
        .attr("width", width)
        .attr("height", height);

    var path = svg.append("path")
        .attr("class","path")
        .attr("clip-path", "url(#clip)")
        .attr("d", line(data));

    function slideWindow(center) {
        var begin = center-windowHalfSize;
        var end = center+windowHalfSize;
        console.log("begin:", begin, "end:", end);
        x_scale.domain([begin,end-1]);

        //efeito de transição em ms podemos usar no play
        var t = svg.transition().duration(0);

        t.select(".x.axis").call(x_scale);//update eixo x
        t.select('.path').attr("d", line(data));
    }

    $( "#slider" ).slider({
        min: 50,
        max: 950,
        slide: function( event, ui ) {

            slideWindow( ui.value);
        }
    });

    slideWindow(50);

}
