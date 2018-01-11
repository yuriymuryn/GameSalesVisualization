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
// FORMAT > {{platform:{year:[NumJogos,TotalMoney,UserScore,Critic_Score], year:[...]} }, ...}
function processPlatformByYear(structure, years,row){
    var year = +row.Year_of_Release,
        platform = row.Platform,
        globalSlales = +row.Global_Sales,
        userScore = +row.User_Score,
        criticScore = +row.Critic_Score;


    // If some field doesn't exist we skip this entry
    if (!year || !platform || !globalSlales )
        return

    if (!years[year])
        years[year] = [];

    if (platform==2600)
        platform="Atari 2600";

    if (!structure[platform]){
        structure[platform]= {};//{year :[1,globalSlales,userScore,criticScore]};
        structure[platform][year] = [1,globalSlales,userScore,criticScore];

    } else if(!structure[platform][year]) {
        structure[platform][year] = [1,globalSlales,userScore,criticScore];
    } else {
        structure[platform][year][0] += 1;
        structure[platform][year][1] += globalSlales;
        structure[platform][year][2] = (structure[platform][year][2]*(structure[platform][year][0]-1)+userScore)/structure[platform][year][0]; //avg on fly
        structure[platform][year][3] = (structure[platform][year][3]*(structure[platform][year][0]-1)+criticScore)/structure[platform][year][0]; //avg on fly
    }
}


function processPublisherByYear(structure, years,row){
    var year = +row.Year_of_Release,
        publisher = row.Publisher,
        globalSlales = +row.Global_Sales,
        userScore = +row.User_Score,
        criticScore = +row.Critic_Score;


    // If some field doesn't exist we skip this entry
    if (!year || !publisher || !globalSlales )
        return

    if (!years[year])
        years[year] = [];


    if (!structure[publisher]){
        structure[publisher]= {};//{year :[1,globalSlales,userScore,criticScore]};
        structure[publisher][year] = [1,globalSlales,userScore,criticScore];

    } else if(!structure[publisher][year]) {
        structure[publisher][year] = [1,globalSlales,userScore,criticScore];
    } else {
        structure[publisher][year][0] += 1;
        structure[publisher][year][1] += globalSlales;
        structure[publisher][year][2] = (structure[publisher][year][2]*(structure[publisher][year][0]-1)+userScore)/structure[publisher][year][0]; //avg on fly
        structure[publisher][year][3] = (structure[publisher][year][3]*(structure[publisher][year][0]-1)+criticScore)/structure[publisher][year][0]; //avg on fly
    }
}

//{{year:{platform:[NumJogos,TotalMoney,UserScore,Critic_Score], platform:[...]} }, ...}
//bases retiradas de http://bl.ocks.org/lucassus/3878348
function generatePlatformByYear(dat, dat1,years,div_id) {

    var platformNameConvertor = {
      "X" : "Xbox",
      "X360" : "Xbox 360",
      "XOne" : "Xbox One",
      "Wii" : "Nitendo Wii",
        "NES":"Nintendo Entertainment System",
        "PS":"Play Station",
        "PS2":"Play Station 2",
        "PS3":"Play Station 3",
        "PS4":"Play Station 4",
        "PSP":"Play Station Portable",
        "PSV":"Play Station Vita",
        "G":"GameBoy",
        "DS":"Nitendo DS",
        "SNES":"Super Nitendo",
        "GBA":"GameBoy Advance",
        "GC":"GameBoy Color",
        "N64":"Nitendo 64",
        "PC":"Computador",
        "WiiU":"Wii U",
        "GEN":"Mega Drive",
        "DC":"Dream Cast"
    };

    var MAX_TOP = 4;
    var currentScoreMethod = 0;//0-sales, 1-userscore, 2- critic_score

    var usingDate = dat;

    var margin = {top: 30, right: 50, bottom: 40, left: 40};

    var w = $(div_id).width() || 700;
    var h = $(div_id).height() || 400;

    var width = w - margin.left - margin.right;
    var height = h - margin.top - margin.bottom;

    var y_xlegend = 10;

    var windowHalfSize = 3;
    var pause = true;
    var currentPausedCenter = windowHalfSize;
    var animationDelay = 1500;
    var playDelay = 1500;

    var line_date = null;//line_date1,line_date2
    var x_data = null;//dados para o eixo dos X

    function createDataForLines(mode) {
        line_date = [];
        var min_ano = 2017;
        var max_ano = 1977;
        for (var platform in usingDate) {
            if (usingDate.hasOwnProperty(platform)) {
                var line_points = [];
                var atLeastOnePointDiffZero = false;
                //completar com 0 os anos inexistentes
                var anos = Object.keys(usingDate[platform]);

                for (var i = anos[0]; i <= anos[anos.length - 1]; i++) {
                    if (!usingDate[platform][i]) {//nao exsite ano
                        line_points.push({
                            "Ano": i,
                            "y": 0,
                            "Name": platform
                        });
                    } else {

                        var y;
                        if (mode == 0)
                            y = usingDate[platform][i][1];
                        else if (mode == 1)
                            y = usingDate[platform][i][2];
                        else if (mode == 2)
                            y = usingDate[platform][i][3];
                        if (y!=0)
                            atLeastOnePointDiffZero = true;
                        line_points.push({
                            "Ano": +i,
                            "y": y,
                            //"y":dat[platform][i][2],
                            //"y":dat[platform][i][3],
                            "Name": platform
                        });
                    }
                }
                if (atLeastOnePointDiffZero) {
                    //console.log("insert "+platform);
                    if (anos[0]<min_ano){
                        min_ano = anos[0]
                    }
                    if (anos[anos.length - 1]>max_ano){
                        max_ano = anos[anos.length - 1]
                    }
                    line_date.push(line_points);
                }
            }
        }

        x_data = [];
        for (var i = min_ano; i <= max_ano; i++)
            x_data.push(i);
    }

    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    var colors = [];
    for (var i = 0; i < 53; i++) {
        colors.push(getRandomColor());
    }

    //criar os dados das linhas ex: 2 linhas com 2 pontos

    console.log(dat);

    // [[{Ano,y,Name,Color},{Ano,y,Name,Color}],[{Ano,y,Name,Color},{Ano,y,Name,Color}]]
    //cria data e preenche var line_date e x_date
    createDataForLines(currentScoreMethod);

    console.log(x_data);


    console.log("data");
    //line_date = [line_date[7]];//.slice(0,20);
    console.log(line_date);

    //console.log(data1);

    //var x_scale = d3.scaleLinear().domain([0, data.length]).range([0, width]);

    //criação de escala descontinua, NOTA para datas o prof tinha dito para usar o Point
    var x_scale = d3.scalePoint().domain(x_data).range([margin.left, width-margin.right]);

    //função que extende as funcionalidades de x_scale para escala continua
    function extend_x_scale(ano) {
        var domain = x_scale.domain();

        var x = x_scale(ano);

        if (x == null) {
            //inferir a posicao
            var step = x_scale.step();
            var d_min = +domain[0];
            var d_max = +domain[domain.length - 1];

            if (ano < d_min)
                return x_scale(d_min) - step * (d_min - ano)-margin.left;
            else if (ano > d_max)
                return x_scale(d_max) + step * (ano - d_max)+margin.right;
        }
        return x;
    }

    //encontrar o limite do dominio do Y, nao necessario visto que o slideWindow vai dar override
    var min_y = 9999999999999999999;
    var max_y = 0;

    for (var i = 0; i < line_date.length; i++) {
        for (var j = 0; j < line_date[i].length; j++) {
            if (line_date[i][j].y > max_y) {
                max_y = line_date[i][j].y
            }

            if (line_date[i][j].y < min_y) {
                min_y = line_date[i][j].y
            }
        }
    }
    var y_scale = d3.scaleLinear().domain([min_y, max_y]).range([height, 0]);

    /*
        FUNÇÕES PARA MANIPULAR OS CIRCULOS E O TEXTO, PARA ACOMPANHAR O ULTIMO PONTO DESENHADO DA LINHA
     */

    function getCircleObejctInDomain(d) {
        var domain = x_scale.domain();
        var index = null;

        if (d[0].Ano<=domain[domain.length-1] && d[d.length-1].Ano>=domain[domain.length-1]){
            index = (domain.length-1)-(d[0].Ano-domain[0]);
        }else{
            index = d.length-1;
        }
        return index;
    }

    function circle_x(d) {//ultimo ponto a ser desenhado
        return extend_x_scale(d[getCircleObejctInDomain(d)].Ano);
    }

    function circle_y(d) {//ultimo ponto a ser desenhado
        return y_scale(d[getCircleObejctInDomain(d)].y);
    }

    function visibility_y(d) {

        var domain = x_scale.domain();
        var ano = domain[domain.length - 1];


        if (d[d.length - 1].Ano <= ano) {
            if (y_scale(d[d.length - 1].y) > height) {
                return "hidden";
            }
        }

        for (var i = d.length - 1; i >= 0; i--) {

            if (d[i].Ano == ano) {
                if (y_scale(d[i].y) > height) {
                    return "hidden";
                }
            }
        }
        return "visible";
    }

    function text(d) {
        return d[0].Name.split(" ")[0] + " " +d[getCircleObejctInDomain(d)].y.toFixed(2);
    }

    /*
        END
     */


    /**
     * CRIAÇÃO DOS ELEMENTOS SVG
     */

    var svg = d3.select("#visualisationY")
        .append("svg")
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x_axis = d3.axisBottom(x_scale).tickSize(-height).tickPadding(y_xlegend);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height)+ ")")
        .call( x_axis)
        .append("text")
        .attr("class", "axisLegend")
        .attr("x", width / 2 + 5)
        .attr("y", y_xlegend + 25)
        .style("text-anchor", "middle")
        .attr("fill", "#000")
        .text("Anos");

    var y_axis = d3.axisLeft(y_scale);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(y_axis)
        .append("text")
        .attr("class", "axisLegend")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .style("text-anchor", "middle")
        .attr("fill", "#000")
        .text("Game Sales (in millions)");

    svg.append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("id", "clip-rect")
        .attr("x", margin.left)
        .attr("y", "0")
        .attr("width", width - (margin.left+margin.right))
        .attr("height", height+5);


    var top_div = d3.select(div_id).append("div").attr("class","topdiv")
        .style("top", (-h+10)+"px")
        .style("left",10+margin.left+"px");


    var image = top_div.append("img")
        .attr("width","120px")
        .attr("height","90px")
        .attr("src","images\\None.jpg")
        .attr("alt","Image not Found")
        .style("float","left");

    var text_div = top_div.append("div")
        .attr("class","divtop");
    var top_label = text_div.append("p").text("label top")
        .attr("class","labelTop")

    var top_value = text_div.append("p").text("label top value")
        .attr("class","labelTop")


    var lines = null;
    function addLinesToSVG() {
        lines = [];
        /*####  Criar o metodo que gera as linhas para SVG  ###*/
        for (i = 0; i < line_date.length; i++)
            lines.push(d3.line()
                .curve(d3.curveCardinal)
                .x(function (d) {
                    return extend_x_scale(d.Ano);
                })
                .y(function (d) {
                    return y_scale(d.y);
                }));

        //linhas
        svg.selectAll("linha").data(line_date)
            .enter()
            .append("path")
            .attr("class", "linha")
            .attr("id", function (d, i) {
                return "line" + i;
            })
            .attr("clip-path", "url(#clip)")
            .attr('stroke', function (d, i) {
                return colors[i]
            })
            .attr("d", function (d, i) {
                return lines[i](d)
            });

        svg.selectAll("labels")
            .data(line_date)
            .enter()
            .append("text")
            .text(text)
            .style("visibility", "visible")
            .attr("class", "labelText")
            .attr("x", circle_x)
            .attr("y", circle_y);

        svg.selectAll("circle")
            .data(line_date)
            .enter()
            .append("circle")
            .attr("id", function (d, i) {
                return "cir" + i;
            })
            .attr("cx", circle_x)
            .attr("cy", circle_y)
            .attr("fill", function (d, i) {
                return colors[i];
            })
            .style("visibility", "visible")
            .attr("r", function (d, i) {
                return 5;
            });
    }

    function removeLinesFromSVG() {
        //linhas
        svg.selectAll(".linha").remove();

        svg.selectAll(".labelText").remove();

        svg.selectAll("circle").remove();
    }

    //FUNÇÃO QUE CRIA O EFEITO DE JANELA DESLIZANTE
    function slideWindow(center) {

        var begin = center-windowHalfSize;
        var end = center+windowHalfSize;
        //console.log("begin:", begin, "end:", end);
        var x_slice = x_data.slice(begin,end);
        x_scale.domain(x_slice);

        //calcular o dominio em y para os TOP
        //por agora esta a ver o max e min
        //var min_y = {y:9999999999999999999};
        var max_y = {y:0};
        var global_max = 0;
        var max = [];
        for (var i=0;i<line_date.length;i++){

            if (line_date[i][0].Ano<=x_slice[x_slice.length-1]&&line_date[i][line_date[i].length-1].Ano>=x_slice[x_slice.length-1]){
                var index = (x_slice.length-1)-(line_date[i][0].Ano-x_slice[0]);
                var max_temp = line_date[i][index];
                max_temp["index"]=i;//guardar o index da linha
                max.push(max_temp);
            }

            //maximo global
            for (var j=0;j<line_date[i].length;j++){
                // todos os pontos do dominio
                if (line_date[i][j].Ano>=x_slice[0] && line_date[i][j].Ano<=x_slice[x_slice.length-1] && global_max<line_date[i][j].y){
                    global_max = line_date[i][j].y;
                }
            }
        }

        max.sort(function (a,b) {
            return b.y-a.y;
        });

        if (max.length>MAX_TOP){
            min_y = max[MAX_TOP-1].y;
        }else
            min_y = 0;

        var may_y = max[0].y;


        $("#top").text("Top: "+max[0].Name+" : "+may_y.toFixed(2));
        image.attr("src","images\\"+max[0].Name.split(" ")[0]+".jpg");
        if (!platformNameConvertor[max[0].Name])
            top_label.text(max[0].Name);
        else
            top_label.text(platformNameConvertor[max[0].Name]);
        top_value.text(may_y.toFixed(2)+"M sales");
        //top_div.style("background-color",colors[max[0].index]);

        //console.log("max_y "+max_y+" min_y "+min_y);
       // y_scale.domain([0,max_y.y+(max_y.y*1.43-max_y.y)+2]);//static
        y_scale.domain([min_y,global_max+((global_max-min_y)*1.05-(global_max-min_y))]);//static
        //começar transição de todos os elementos selecionados
        var t = svg.transition().duration(animationDelay);//.ease(d3.easeCircleIn)


        //escala y e x para o novo dominio de visualização
        t.select(".y.axis").call(y_axis);
        t.select(".x.axis").call(x_axis);//update eixo x

        t.selectAll(".linha").attr("d",function (d,i) {
            return lines[i](line_date[i]);
        });

        t.selectAll(".labelText")
            .style("visibility", visibility_y)
            .text(text)
            .attr("x",function (d) {
                return circle_x(d)+5;
            })
            .attr("y",function (d) {
                return circle_y(d)+5;
            });
        //update dos circulos
        t.selectAll("circle")
            .attr("cx",circle_x)
            .attr("cy", circle_y)
            .style("visibility", visibility_y)
            .attr("r", function (d, i) {
                return 5;
            });



    }

    //botao de slider
    function resetCenterSlider() {

        if (currentPausedCenter<windowHalfSize){
            currentPausedCenter = windowHalfSize;
        }else if(currentPausedCenter>x_data.length-windowHalfSize){
            currentPausedCenter = x_data.length-windowHalfSize;
        }

        $( "#slider" ).slider({
            min: 0+windowHalfSize,
            max: x_data.length-windowHalfSize,
            value: currentPausedCenter,
            slide: function( event, ui ) {
                slideWindow( ui.value);
                currentPausedCenter = ui.value;
            }
        });
    }
    resetCenterSlider();

    function updateLines() {
        createDataForLines(currentScoreMethod);
        removeLinesFromSVG();
        addLinesToSVG();
        resetCenterSlider();
        slideWindow(currentPausedCenter);
    }

    $( "#sliderWindowHalfSize" ).slider({
        min: 2,
        max: x_data.length/4,//metade das datas
        value:windowHalfSize,
        slide: function( event, ui ) {

            windowHalfSize = ui.value;
            if (currentPausedCenter<windowHalfSize){
                currentPausedCenter = windowHalfSize;
            }else if(currentPausedCenter>x_data.length-windowHalfSize){
                currentPausedCenter = x_data.length-windowHalfSize;
            }

            resetCenterSlider();
            console.log("windowHalfSize: value: "+ui.value+" "+currentPausedCenter);
            slideWindow(currentPausedCenter);
        }
    });

    //loop da animação
    function loop(i) {
        if (pause==true){
            currentPausedCenter = i;
            return;
        }
        if (i>x_data.length-windowHalfSize){
            currentPausedCenter = x_data.length-windowHalfSize;
            $("#play").text("PLAY");
            pause = true;
            return;
        }

        $("#slider").slider('value',i);
        slideWindow(i);
        setTimeout(loop,playDelay,i+1);
    }

    $("#play").click(function (ev) {
        pause = !pause;
        if (pause==false) {
            if (currentPausedCenter == (x_data.length - windowHalfSize))
                currentPausedCenter = windowHalfSize;
            loop(currentPausedCenter);
            $(this).text("PAUSE");
        }else{
            $(this).text("PLAY");
        }
    });

    $("#salesbtn").click(function (ev) {
        if (currentScoreMethod==0)
            return ;
        currentScoreMethod = 0;
        updateLines();
    });

    $("#userScorebtn").click(function (ev) {
        if (currentScoreMethod==1)
            return ;
        currentScoreMethod = 1;
        updateLines();
    });

    $("#criticScorebtn").click(function (ev) {
        if (currentScoreMethod==2)
            return ;
        currentScoreMethod = 2;
        updateLines();
    });

    $("#platformbtn").click(function (ev) {
        if (usingDate == dat)
            return;
        usingDate = dat;
        updateLines();
    });

    $("#publisherbtn").click(function (ev) {
        if (usingDate == dat1)
            return;
        usingDate = dat1;
        updateLines();
    });

    addLinesToSVG();
    slideWindow(currentPausedCenter);
    //axis a negrito

}
