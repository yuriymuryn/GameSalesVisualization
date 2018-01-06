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

    var windowHalfSize = 3;

    var x_data =[];
    for (var key in dat) {
        if (dat.hasOwnProperty(key)) {
            x_data.push(key);
        }
    }

    console.log(x_data);


    var line_date = [];//line_date1,line_date2

    var line_data_temp = [];
    line_data_temp.push({"Ano":x_data[0],"y":0});
    for (var i = 1; i < x_data.length; i++) {
        var sign = Math.random() > 0.5 ? +1 : -1;
        var y = (line_data_temp[i-1].y+ sign * Math.random());
        line_data_temp.push({"Ano":x_data[i],"y":y})
    }

    line_date.push(line_data_temp);

    line_data_temp = [];

    line_data_temp.push({"Ano":x_data[10],"y":0});
    for (var i = 11; i < x_data.length-8; i++) {
        var sign = Math.random() > 0.5 ? +1 : -1;
        var y = (line_data_temp[(i-10)-1].y+ sign * Math.random());
        line_data_temp.push({"Ano":x_data[i],"y":y})
    }
    line_date.push(line_data_temp);

    console.log(line_date);
    //console.log(data1);

    //var x_scale = d3.scaleLinear().domain([0, data.length]).range([0, width]);

    var x_scale = d3.scalePoint().domain(x_data).range([margin.left, width]);
    console.log("step "+x_scale.step());
    var y_scale = d3.scaleLinear().domain([-10, 10]).range([height, 0]);

    var lines =[];
    var i =0;
    for (i =0;i<2;i++)
        lines.push(d3.line()
            .x(function (d,i) {
                var domain = x_scale.domain();

                var x =  x_scale(d.Ano);
                if (x==null) {
                    //inferir a posicao
                    var step = x_scale.step();
                    var d_min = +domain[0];
                    var d_max = +domain[domain.length - 1];

                    if (d.Ano < d_min)
                        return x_scale(d_min) - step * (d_min - d.Ano);
                    else if (d.Ano>d_max)
                        return x_scale(d_max) + step * (d.Ano - d_max);
                }



                return  x;

            })
            .y(function (d) {
                return y_scale(d.y);
            }));



    var svg = d3.select("#visualisationY")
        .append("svg")
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x_axis = d3.axisBottom(x_scale);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
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
        .attr("width", width-margin.left)
        .attr("height", height);

    var path = svg.append("path")
        .attr("class","path")
        .attr("id","line")
        .attr("clip-path", "url(#clip)")
        .attr("d", lines[0](line_date[0]));

    svg.append("path")
        .attr("class","path")
        .attr("id","line1")
        .attr("clip-path", "url(#clip)")
        .attr("d", lines[1](line_date[1]));
    var last = 20;
    function slideWindow(center) {


        var begin = center-windowHalfSize;
        var end = center+windowHalfSize;
        console.log("begin:", begin, "end:", end);
        var x_slice = x_data.slice(begin,end);

        x_scale.domain(x_slice);
        //efeito de transição em ms podemos usar no play

        var t = svg.transition().duration(500);
        t.select(".x.axis").call(x_axis);//update eixo x
        t.select("#line").attr("d", lines[0](line_date[0]));
        t.select("#line1").attr("d", lines[1](line_date[1]));

    }

    $( "#slider" ).slider({
        min: 0+windowHalfSize,
        max: 42-windowHalfSize,
        slide: function( event, ui ) {

            slideWindow( ui.value);
        }
    });

    $("#slider").slider('value',20);
    slideWindow(20);

}
