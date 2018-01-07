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


//{{year:{platform:[NumJogos,TotalMoney,UserScore,Critic_Score], platform:[...]} }, ...}
//bases retiradas de http://bl.ocks.org/lucassus/3878348
function generatePlatformByYear(dat, years,div_id) {

    var MAX_TOP = 4;
    var scoreMethod = 0;//0-sales, 1-userscore, 2- critic_score

    var margin = {top: 30, right: 50, bottom: 40, left:40};
    var width = 800 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    var windowHalfSize = 3;
    var pause = true;
    var currentPausedCenter = windowHalfSize;
    var animationDelay = 1500;
    var playDelay = 1500;

    //dados para o eixo dos X
    var x_data =[];
    anos = Object.keys(years);
    for (var i=anos[0];i<=anos[anos.length-1];i++)
        x_data.push(i);

    console.log(x_data);


    //criar os dados das linhas ex: 2 linhas com 2 pontos
    // [[{Ano,y,Name,Color},{Ano,y,Name,Color}],[{Ano,y,Name,Color},{Ano,y,Name,Color}]]

    var line_date = [];//line_date1,line_date2
    console.log(dat);
    for (var platform in dat) {
        if (dat.hasOwnProperty(platform)) {
            var line_points = [];
            //completar com 0 os anos inexistentes
            var anos = Object.keys(dat[platform]);

            for (var i = anos[0];i<=anos[anos.length-1];i++){
                if (!dat[platform][i]) {//nao exsite ano
                    line_points.push({
                        "Ano": i,
                        "y": 0,
                        "Name": platform
                    });
                }else {
                    var y;
                    if (scoreMethod==0)
                        y=dat[platform][i][1];
                    else if(scoreMethod==1)
                        y=dat[platform][i][2];
                    else if(scoreMethod==2)
                        y=dat[platform][i][3];
                    line_points.push({
                        "Ano": +i,
                        "y": y,
                        //"y":dat[platform][i][2],
                        //"y":dat[platform][i][3],
                        "Name": platform
                    });
                }

            }

            line_date.push(line_points);

        }
    }


    console.log("data");
    //line_date = [line_date[7]];//.slice(0,20);
    console.log(line_date);

    //console.log(data1);

    //var x_scale = d3.scaleLinear().domain([0, data.length]).range([0, width]);

    //criação de escala descontinua, NOTA para datas o prof tinha dito para usar o Point
    var x_scale = d3.scalePoint().domain(x_data).range([margin.left, width]);

    //função que extende as funcionalidades de x_scale para escala continua
    function extend_x_scale(ano){
        var domain = x_scale.domain();

        var x =  x_scale(ano);

        if (x==null) {
            //inferir a posicao
            var step = x_scale.step();
            var d_min = +domain[0];
            var d_max = +domain[domain.length - 1];

            if (ano < d_min)
                return x_scale(d_min) - step * (d_min - ano);
            else if (ano>d_max)
                return x_scale(d_max) + step * (ano - d_max);
        }
        return  x;
    }

    //encontrar o limite do dominio do Y, nao necessario visto que o slideWindow vai dar override
    var min_y = 9999999999999999999;
    var max_y = 0;

    for (var i=0;i<line_date.length;i++){
        for (var j=0;j<line_date[i].length;j++){
            if (line_date[i][j].y>max_y){
                max_y = line_date[i][j].y
            }

            if (line_date[i][j].y<min_y){
                min_y = line_date[i][j].y
            }
        }
    }
    var y_scale = d3.scaleLinear().domain([min_y,max_y]).range([height, 0]);

    /*
        FUNÇÕES PARA MANIPULAR OS CIRCULOS E O TEXTO, PARA ACOMPANHAR O ULTIMO PONTO DESENHADO DA LINHA
     */

    function circle_x(d){//ultimo ponto a ser desenhado
        var domain = x_scale.domain();
        var ano = domain[domain.length-1];

        var ano_min = 2016;
        var ano_max = 1978;
        for (var i = 0; i<d.length;i++ ){
            if (d[i].Ano>ano_max)
                ano_max = d[i].Ano;
            if (d[i].Ano<ano_min)
                ano_min = d[i].Ano;
        }

        if (ano_max>=ano && ano_min<=ano){
            //esta no domino
            return extend_x_scale(ano);
        }


        return extend_x_scale(d[d.length-1].Ano)
    }

    function circle_y(d){//ultimo ponto a ser desenhado
        var domain = x_scale.domain();
        var ano = domain[domain.length-1];

        for (var i = 0; i<d.length;i++ ){
            if (d[i].Ano==ano){
                //esta no dominio
                return y_scale(d[i].y);
            }
        }
        return  y_scale(d[d.length-1].y);
    }

    function visibility_y(d) {

        var domain = x_scale.domain();
        var ano = domain[domain.length-1];


        if (d[d.length-1].Ano<=ano){
            if (y_scale(d[d.length-1].y)>height){
                return "hidden";
            }
        }

        for (var i=d.length-1;i>=0;i--){

            if (d[i].Ano==ano){
                if (y_scale(d[i].y)>height){
                    return "hidden";
                }
            }
        }
        return "visible";
    }

    /*
        END
     */

    /*####  Criar o metodo que gera as linhas para SVG  ###*/
    var lines =[];
    for (i =0;i<line_date.length;i++)
        lines.push(d3.line()
            .x(function (d) {
                return extend_x_scale(d.Ano);
            })
            .y(function (d) {
                return y_scale(d.y);
            }));


    /**
     * CRIAÇÃO DOS ELEMENTOS SVG
     */

    var svg = d3.select("#visualisationY")
        .append("svg")
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x_axis = d3.axisBottom(x_scale).tickSize(-height);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(x_axis);

    var y_axis = d3.axisLeft(y_scale);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate("+margin.left+",0)")
        .call(y_axis);

    svg.append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("id", "clip-rect")
        .attr("x", margin.left)
        .attr("y", "0")
        .attr("width", width-(margin.left))
        .attr("height", height);

    //linhas
    for (var i=0;i<line_date.length;i++) {
        svg.append("path")
            .attr("class", "path")
            .attr("id", "line"+i)
            .attr("clip-path", "url(#clip)")
            .attr("d", lines[i](line_date[i]));
    }


    svg.selectAll("labels")
        .data(line_date)
        .enter()
        .append("text")
        .text(function (d) {
            return d[0].Name;
        })
        .attr("id",function (d,i) {
            return "text"+i;
        })
        .style("visibility", "visible")
        .attr("x",circle_x)
        .attr("y",circle_y);

    svg.selectAll("circle")
        .data(line_date)
        .enter()
        .append("circle")
        .attr("id", function (d,i) {
            return "cir"+i;
        })
        .attr("cx", circle_x)
        .attr("cy", circle_y)
        .attr("fill", "white")
        .attr("class","labelText")
        .attr("stroke","black")
        .style("visibility", "visible")
        .attr("r", function (d, i) {
            return 5;
        });



    //FUNÇÃO QUE CRIA O EFEITO DE JANELA DESLIZANTE
    function slideWindow(center) {

        var begin = center-windowHalfSize;
        var end = center+windowHalfSize;
        //console.log("begin:", begin, "end:", end);
        var x_slice = x_data.slice(begin,end);
        x_scale.domain(x_slice);

        //calcular o dominio em y para os TOP
        //por agora esta a ver o max e min
        var min_y = 9999999999999999999;
        var max_y = 0;

        for (var i=0;i<line_date.length;i++){
            for (var j=0;j<line_date[i].length;j++){

                if (line_date[i][j].Ano==x_slice[x_slice.length-1]){
                    if (line_date[i][j].y>=max_y){
                        max_y = line_date[i][j].y
                    }
                    if (line_date[i][j].y<=min_y){
                        min_y = line_date[i][j].y
                    }
                }
            }
        }
        //console.log("max_y "+max_y+" min_y "+min_y);
        y_scale.domain([max_y-50,max_y+50]);//static

        //começar transição de todos os elementos selecionados
        var t = svg.transition().duration(animationDelay);

        //escala y e x para o novo dominio de visualização
        t.select(".y.axis").call(y_axis);
        t.select(".x.axis").call(x_axis);//update eixo x

        //update da linha e do texto
        for (var i=0 ;i< line_date.length;i++) {
            t.select("#line"+i).attr("d", lines[i](line_date[i]));
            t.select("#text"+i)//nao deu com selectAll n sei pq
                .style("visibility", visibility_y)
                .attr("x",function (d) {
                    return circle_x(d)+5;
                })
                .attr("y",function (d) {
                    return circle_y(d)+5;
                })
                .text(function (d) {
                    return d[0].Name;
                });

        }
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
            currentPausedCenter = windowHalfSize;
            return;
        }

        $("#slider").slider('value',i);
        slideWindow(i);
        setTimeout(loop,playDelay,i+1);
    }

    $("#play").click(function (ev) {
        pause = !pause;
        if (pause==false) {
            loop(currentPausedCenter);
            $(this).text("PAUSE");
        }else{
            $(this).text("PLAY");
        }
    });

    slideWindow(currentPausedCenter);

}
