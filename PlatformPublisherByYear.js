function PlatformPublisherByYear() {
    var self = this;

    //confing param
    this.max_viseble_lines = 4;
    this.currentScoreMethod = 0;//0-sales, 1-userscore, 2- critic_score

    //Sizes
    this.margin = {top: 30, right: 50, bottom: 40, left: 40};

    this.w; //full div width
    this.h; //full div height

    this.width;
    this.height;

    this.labelPadding = 15;
    this.yPadding_xlegend = 10;

    this.windowHalfSize = 3;
    this.pause = true;
    this.currentPausedCenter = this.windowHalfSize;
    this.animationDelay = 1500;
    this.playDelay = 1500;

    //DATA

    this.platformData = {};
    this.publisherData = {};
    this.colors = [];

    this.usingData = this.platformData;

    this.line_date;//linhas do grafico line_date1,line_date2
    this.x_data;//dados para o eixo dos X

    //SVG vars
    this.x_scale;
    this.y_scale;
    this.svg;
    this.x_axis;
    this.y_axis;
    this.image;
    this.top_value;
    this.top_label;
    this.g;
    this.labelWindowHalfSize;

    this.graphHtmlSlider;

    this.lines;

    this.platformNameConvertor = {
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
        "DC":"Dream Cast",
        "Atari":"Atari 2600",
        "3DS":"Nitendo 3DS"
    };

    this.processRow = function(row) {
        processRowPlatform(row);
        processRowPublisher(row);
    };

    this.draw = function(div_id) {
        getSizes(div_id);
        processData(0);
        //gerar 53 cores aleatoriamente
        for (var i = 0; i < 53; i++) {
            self.colors.push(getRandomColor());
        }

        //escalas
        this.x_scale = d3.scalePoint().domain(this.x_data).range([this.margin.left, this.width-this.margin.right]);
        this.y_scale = d3.scaleLinear().domain(findGlobalMinMax()).range([this.height, 0]);




        this.svg = d3.select(div_id)
            .append("svg")
            .attr('width', this.w)
            .attr('height', this.h);
        addButtons(div_id);

        this.g = this.svg.append("g")
            .attr("transform", "translate(0," + (this.margin.top+5) + ")");

        this.x_axis = d3.axisBottom(this.x_scale).tickSize(-this.height).tickPadding(this.yPadding_xlegend);

        this.g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (this.height)+ ")")
            .call(this.x_axis)
            .append("text")
            .attr("class", "axisLegend")
            .attr("x", this.width / 2 + 5)
            .attr("y", this.yPadding_xlegend + 25)
            .style("text-anchor", "middle")
            .attr("fill", "#000")
            .text("Anos");

        this.y_axis = d3.axisLeft(this.y_scale);

        this.g.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + this.margin.left + ",0)")
            .call(this.y_axis)
            .append("text")
            .attr("class", "axisLegend")
            .attr("transform", "rotate(-90)")
            .attr("x", -this.height / 2)
            .attr("y", -this.margin.left + 10)
            .style("text-anchor", "middle")
            .attr("fill", "#000")
            .text("Game Sales (in millions)");

        this.g.append("defs")
            .append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("id", "clip-rect")
            .attr("x", this.margin.left)
            .attr("y", "0")
            .attr("width", this.width - (this.margin.left+this.margin.right))
            .attr("height", this.height+5);

        //criar outros elementos html
        var div = d3.select(div_id);
        var top_div = div.append("div").attr("class","topdiv")
            .style("top", (-this.h+this.margin.top+10)+"px")
            .style("left",10+this.margin.left+"px");


        this.image = top_div.append("img")
            .attr("width","120px")
            .attr("height","90px")
            .attr("src","images\\None.jpg")
            .attr("alt","Image not Found")
            .style("float","left");

        var text_div = top_div.append("div")
            .attr("class","divtop");
        this.top_label = text_div.append("p").text("label top")
            .attr("class","labelTop");

        this.top_value = text_div.append("p").text("label top value")
            .attr("class","labelTop");

        div.append("button")
            .style("float","left")
            .style("position","relative")
            .style("top","-110px")
            .style("left","40px")
            .attr("id","play")
            .text("Play");

        this.graphHtmlSlider = div.append("div")
            .attr("id","slider")
            .style("width","65%")
            .style("top","-115px")
            .style( "margin-right","10%")
            .style( "margin-left","15%")
            .style( "margin-top","10px");

        this.labelWindowHalfSize = div.append("label")
            .style("float","left")
            .style("position","relative")
            .style("top","-563px")
            .style("margin-left","290px")
            .text("Número de anos: "+self.windowHalfSize);

        div.append("div")
            .attr("id","sliderWindowHalfSize")
            .style("width","20%")
            .style("top","-563px")
            .style( "margin-left","420px")
            .style( "margin-top","4px");


        $( "#sliderWindowHalfSize" ).slider({
            min: 2,
            max: this.x_data.length/4,//metade das datas
            value:this.windowHalfSize,
            slide: function( event, ui ) {

                self.windowHalfSize = ui.value;
                if (self.currentPausedCenter<self.windowHalfSize){
                    self.currentPausedCenter = self.windowHalfSize;
                }else if(self.currentPausedCenter>self.x_data.length-self.windowHalfSize){
                    self.currentPausedCenter = self.x_data.length-self.windowHalfSize;
                }

                self.labelWindowHalfSize.text("Número de anos: "+self.windowHalfSize);

                resetCenterSlider();
                console.log("windowHalfSize: value: "+ui.value+" "+self.currentPausedCenter);
                slideWindow(self.currentPausedCenter);
            }
        });

        $("#play").click(function (ev) {
            self.pause = !self.pause;
            if (self.pause==false) {
                if (self.currentPausedCenter == (self.x_data.length - self.windowHalfSize))
                    self.currentPausedCenter = self.windowHalfSize;
                loop(self.currentPausedCenter);
                $(this).text("PAUSE");
            }else{
                $(this).text("PLAY");
            }
        });

        addLinesToSVG();
        resetCenterSlider();
        slideWindow(self.currentPausedCenter);

        /*
       $("#salesbtn").click(function (ev) {
           if (self.currentScoreMethod==0)
               return ;
           self.currentScoreMethod = 0;
           updateLines();
       });

       $("#userScorebtn").click(function (ev) {
           if (self.currentScoreMethod==1)
               return ;
           self.currentScoreMethod = 1;
           updateLines();
       });

       $("#criticScorebtn").click(function (ev) {
           if (self.currentScoreMethod==2)
               return ;
           self.currentScoreMethod = 2;
           updateLines();
       });*/
    };


    function processRowPlatform(row){
        var year = +row.Year_of_Release,
            platform = row.Platform,
            globalSlales = +row.Global_Sales,
            userScore = +row.User_Score,
            criticScore = +row.Critic_Score;


        // If some field doesn't exist we skip this entry
        if (!year || !platform || !globalSlales )
            return;

        if (platform==2600)
            platform="Atari 2600";

        if (!self.platformData[platform]){
            self.platformData[platform]= {};//{year :[1,globalSlales,userScore,criticScore]};
            self.platformData[platform][year] = [1,globalSlales,userScore,criticScore];

        } else if(!self.platformData[platform][year]) {
            self.platformData[platform][year] = [1,globalSlales,userScore,criticScore];
        } else {
            self.platformData[platform][year][0] += 1;
            self.platformData[platform][year][1] += globalSlales;
            self.platformData[platform][year][2] = (self.platformData[platform][year][2]*(self.platformData[platform][year][0]-1)+userScore)/self.platformData[platform][year][0]; //avg on fly
            self.platformData[platform][year][3] = (self.platformData[platform][year][3]*(self.platformData[platform][year][0]-1)+criticScore)/self.platformData[platform][year][0]; //avg on fly
        }
    }

    function processRowPublisher(row){
        var year = +row.Year_of_Release,
            publisher = row.Publisher,
            globalSlales = +row.Global_Sales,
            userScore = +row.User_Score,
            criticScore = +row.Critic_Score;


        // If some field doesn't exist we skip this entry
        if (!year || !publisher || !globalSlales )
            return;

        if (!self.publisherData[publisher]){
            self.publisherData[publisher]= {};//{year :[1,globalSlales,userScore,criticScore]};
            self.publisherData[publisher][year] = [1,globalSlales,userScore,criticScore];

        } else if(!self.publisherData[publisher][year]) {
            self.publisherData[publisher][year] = [1,globalSlales,userScore,criticScore];
        } else {
            self.publisherData[publisher][year][0] += 1;
            self.publisherData[publisher][year][1] += globalSlales;
            self.publisherData[publisher][year][2] = (self.publisherData[publisher][year][2]*(self.publisherData[publisher][year][0]-1)+userScore)/self.publisherData[publisher][year][0]; //avg on fly
            self.publisherData[publisher][year][3] = (self.publisherData[publisher][year][3]*(self.publisherData[publisher][year][0]-1)+criticScore)/self.publisherData[publisher][year][0]; //avg on fly
        }
    }

    function getSizes(div_id) {
        self.w = $(div_id).width() || 700;
        self.h = $(div_id).height() || 400;

        self.width = self.w - self.margin.left - self.margin.right;
        self.height = self.h - self.margin.top - self.margin.bottom;
    }

    function processData(mode) {
        self.line_date = [];
        var min_ano = 2017;
        var max_ano = 1976;
        for (var platform in self.usingData) {
            if (self.usingData.hasOwnProperty(platform)) {
                var line_points = [];
                var atLeastOnePointDiffZero = false;
                //completar com 0 os anos inexistentes
                var anos = Object.keys(self.usingData[platform]);

                for (var i = anos[0]; i <= anos[anos.length - 1]; i++) {
                    if (!self.usingData[platform][i]) {//nao exsite ano
                        line_points.push({
                            "Ano": i,
                            "y": 0,
                            "Name": platform
                        });
                    } else {

                        var y;
                        y = self.usingData[platform][i][mode+1];
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
                    self.line_date.push(line_points);
                }
            }
        }

        self.x_data = [];
        for (var i = min_ano; i <= max_ano; i++)
            self.x_data.push(i);
    }

    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    /**
     * Extende as funcionalidades do X_scale para continua (n queriamos usar o scaler linear)
     * @param ano
     * @returns {*}
     */
    function extend_x_scale(ano) {
        var domain = self.x_scale.domain();

        var x = self.x_scale(ano);

        if (x == null) {
            //inferir a posicao
            var step = self.x_scale.step();
            var d_min = +domain[0];
            var d_max = +domain[domain.length - 1];

            if (ano < d_min)
                return self.x_scale(d_min) - step * (d_min - ano)-self.margin.left;
            else if (ano > d_max)
                return self.x_scale(d_max) + step * (ano - d_max)+self.margin.right;
        }
        return x;
    }

    function findGlobalMinMax() {
        var min_y = 9999999999999999999;
        var max_y = 0;

        for (var i = 0; i < self.line_date.length; i++) {
            for (var j = 0; j < self.line_date[i].length; j++) {
                if (self.line_date[i][j].y > max_y) {
                    max_y = self.line_date[i][j].y
                }

                if (self.line_date[i][j].y < min_y) {
                    min_y = self.line_date[i][j].y
                }
            }
        }

        return [min_y,max_y];
    }

    function getCircleObejctInDomain(d) {
        var domain = self.x_scale.domain();
        var index = null;

        if (d[0].Ano<=domain[domain.length-1] && d[d.length-1].Ano>=domain[domain.length-1]){
            index = (domain.length-1)-(d[0].Ano-domain[0]);
        }else{
            index = d.length-1;
        }
        return index;
    }

    function point_x(d) {//ultimo ponto a ser desenhado
        return extend_x_scale(d[getCircleObejctInDomain(d)].Ano);
    }

    function point_y(d) {//ultimo ponto a ser desenhado
        return self.y_scale(d[getCircleObejctInDomain(d)].y);
    }

    function visibility_y(d) {

        var domain = self.x_scale.domain();
        var ano = domain[domain.length - 1];


        if (d[d.length - 1].Ano <= ano) {
            if (self.y_scale(d[d.length - 1].y) > self.height) {
                return "hidden";
            }
        }

        for (var i = d.length - 1; i >= 0; i--) {

            if (d[i].Ano == ano) {
                if (self.y_scale(d[i].y) > self.height) {
                    return "hidden";
                }
            }
        }
        return "visible";
    }

    function text(d) {
        return d[0].Name.split(" ")[0];
    }


    function addLinesToSVG() {
        self.lines = [];
        /*####  Criar o metodo que gera as linhas para SVG  ###*/
        for (i = 0; i < self.line_date.length; i++)
            self.lines.push(d3.line()
                .curve(d3.curveCardinal)
                .x(function (d) {
                    return extend_x_scale(d.Ano);
                })
                .y(function (d) {
                    return self.y_scale(d.y);
                }));

        //linhas
        self.g.selectAll("linha").data(self.line_date)
            .enter()
            .append("path")
            .attr("class", "linha")
            .attr("id", function (d, i) {
                return "line" + i;
            })
            .attr("clip-path", "url(#clip)")
            .attr('stroke', function (d, i) {
                return self.colors[i]
            })
            .attr("d", function (d, i) {
                return self.lines[i](d)
            });

        self.g.selectAll("circle")
            .data(self.line_date)
            .enter()
            .append("circle")
            .attr("id", function (d, i) {
                return "cir" + i;
            })
            .attr("cx", point_x)
            .attr("cy", point_y)
            .attr("fill", function (d, i) {
                return self.colors[i];
            })
            .style("visibility", "visible")
            .attr("r", "5");

        self.g.selectAll("labels")
            .data(self.line_date)
            .enter()
            .append("text")
            .text(text)
            .style("visibility", "visible")
            .attr("class", "labelText")
            .attr("x", point_x)
            .attr("y", point_y)
            .on("mouseover", function(d){
                var selectedPoint = d[getCircleObejctInDomain(d)];
                var data = [];
                var y_max = self.y_scale.range()[0];

                for (var i=0;i<self.line_date.length;i++){
                    var lIndice = getCircleObejctInDomain(self.line_date[i]);
                    var sel_y = self.y_scale(selectedPoint.y);
                    var line_y = self.y_scale(self.line_date[i][lIndice].y);
                    //console.log(self.line_date[i][lIndice].Ano,selectedPoint.Ano)
                    if (self.line_date[i][lIndice].Ano==selectedPoint.Ano
                        && line_y<=y_max
                        && sel_y+self.labelPadding>line_y
                        && sel_y-self.labelPadding<line_y){
                        if (!self.platformNameConvertor[self.line_date[i][lIndice].Name])
                            data.push(self.line_date[i][lIndice].Name+" - "+self.line_date[i][lIndice].y.toFixed(2));
                        else
                            data.push(self.platformNameConvertor[self.line_date[i][lIndice].Name]+" - "+self.line_date[i][lIndice].y.toFixed(2));
                    }
                }
                data.sort(function (d1,d2) {
                    return d2.split("-")[1]-d1.split("-")[1];
                });
                //console.log(data);
                self.tooltip_div.style("visibility", "visible").html(data.join("<br\>"));
            })
            .on("mousemove", function(){return self.tooltip_div.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
            .on("mouseout", function(){return self.tooltip_div.style("visibility", "hidden");});;
    }

    function removeLinesFromSVG() {
        //linhas
        self.svg.selectAll(".linha").remove();

        self.svg.selectAll(".labelText").remove();

        self.svg.selectAll("circle").remove();
    }

    //FUNÇÃO QUE CRIA O EFEITO DE JANELA DESLIZANTE
    function slideWindow(center) {

        var begin = center-self.windowHalfSize;
        var end = center+self.windowHalfSize;
        //console.log("begin:", begin, "end:", end);
        var x_slice = self.x_data.slice(begin,end);
        self.x_scale.domain(x_slice);

        //calcular o dominio em y para os TOP
        var global_max = 0;
        var max = [];
        for (var i=0;i<self.line_date.length;i++){

            if (self.line_date[i][0].Ano<=x_slice[x_slice.length-1]&&self.line_date[i][self.line_date[i].length-1].Ano>=x_slice[x_slice.length-1]){
                var index = (x_slice.length-1)-(self.line_date[i][0].Ano-x_slice[0]);
                var max_temp = self.line_date[i][index];
                max_temp["index"]=i;//guardar o index da linha
                max.push(max_temp);
            }

            //maximo global
            for (var j=0;j<self.line_date[i].length;j++){
                // todos os pontos do dominio
                if (self.line_date[i][j].Ano>=x_slice[0] && self.line_date[i][j].Ano<=x_slice[x_slice.length-1] && global_max<self.line_date[i][j].y){
                    global_max = self.line_date[i][j].y;
                }
            }
        }

        max.sort(function (a,b) {
            return b.y-a.y;
        });

        var may_y = max[0].y;

        if (max.length>self.max_viseble_lines){
            min_y = max[self.max_viseble_lines-1].y;
        }else
            min_y = 0;

        self.image.attr("src","images\\"+max[0].Name.split(" ")[0]+".jpg");
        if (!self.platformNameConvertor[max[0].Name])
            self.top_label.text(max[0].Name);
        else
            self.top_label.text(self.platformNameConvertor[max[0].Name]);
        self.top_value.text(may_y.toFixed(2)+"M sales");
        //top_div.style("background-color",colors[max[0].index]);

        self.y_scale.domain([min_y,global_max+((global_max-min_y)*1.05-(global_max-min_y))]);//static

        //começar transição de todos os elementos selecionados
        var t = self.svg.transition().duration(self.animationDelay);//.ease(d3.easeCircleIn)

        //escala y e x para o novo dominio de visualização
        t.select(".y.axis").call(self.y_axis);
        t.select(".x.axis").call(self.x_axis);//update eixo x

        t.selectAll(".linha").attr("d",function (d,i) {
            return self.lines[i](self.line_date[i]);
        });

        t.selectAll(".labelText")
            .style("visibility", visibility_y)
            .text(text)
            .attr("x",function (d) {
                return point_x(d)+5;
            })
            .attr("y",function (d) {
                return point_y(d)+5;
            });
        //update dos circulos
        t.selectAll("circle")
            .attr("cx",point_x)
            .attr("cy",point_y)
            .style("visibility", visibility_y)
            .attr("r", "5");
    }

    function resetCenterSlider() {

        if (self.currentPausedCenter<self.windowHalfSize){
            self.currentPausedCenter = self.windowHalfSize;
        }else if(self.currentPausedCenter>self.x_data.length-self.windowHalfSize){
            self.currentPausedCenter = self.x_data.length-self.windowHalfSize;
        }

        $( "#slider" ).slider({
            min: self.windowHalfSize,
            max: self.x_data.length-self.windowHalfSize,
            value: self.currentPausedCenter,
            slide: function( event, ui ) {
                slideWindow( ui.value);
                self.currentPausedCenter = ui.value;
            }
        });
    }

    function updateLines() {
        processData(self.currentScoreMethod);
        removeLinesFromSVG();
        addLinesToSVG();
        resetCenterSlider();
        slideWindow(self.currentPausedCenter);
    }

    //loop da animação
    function loop(i) {
        if (self.pause==true){
            self.currentPausedCenter = i;
            return;
        }
        if (i>self.x_data.length-self.windowHalfSize){
            self.currentPausedCenter = self.x_data.length-self.windowHalfSize;
            $("#play").text("PLAY");
            self.pause = true;
            return;
        }

        $("#slider").slider('value',i);
        slideWindow(i);
        setTimeout(loop,self.playDelay,i+1);
    }

    function addButtons(div_id) {
        // Define the div for the tooltip
        self.tooltip_div = d3.select(div_id).append("div").attr("class","tooltip").style("visibility", "hidden");

        var btnGrp = self.svg.append("g");
        self.btn1 = btnGrp.append("rect")
            .attr("class", "btnView selectedView")
            .attr("x", 40)
            .attr("width", 95)
            .attr("height", 30)
            .on("click",platformBtnCallback)
            .on("mouseover", function(){return self.tooltip_div.style("visibility", "visible").text("Use platform Data");})
            .on("mousemove", function(){return self.tooltip_div.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
            .on("mouseout", function(){return self.tooltip_div.style("visibility", "hidden");});

        btnGrp.append("text")
            .attr("x", 45)
            .attr("y", 22)
            .attr("class", "btwViewText")
            .text("Platform");

        self.btn2 = btnGrp.append("rect")
            .attr("class", "btnView")
            .attr("x", 150)
            .attr("width", 100)
            .attr("height", 30)
            .on("click", publisherBtnCallback)
            .on("mouseover", function(){return self.tooltip_div.style("visibility", "visible").text("Use publisher Data");})
            .on("mousemove", function(){return self.tooltip_div.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
            .on("mouseout", function(){return self.tooltip_div.style("visibility", "hidden");});

        btnGrp.append("text")
            .attr("x", 155)
            .attr("y", 22)
            .attr("class", "btwViewText")
            .text("Publisher");

    }

    function platformBtnCallback() {
        if (self.usingData == self.platformData)
            return;
        self.usingData = self.platformData;
        self.btn1.attr("class", "btnView selectedView");
        self.btn2.attr("class", "btnView");
        updateLines();
    }
    
    function publisherBtnCallback() {
        if (self.usingData == self.publisherData)
            return;
        self.btn2.attr("class", "btnView selectedView");
        self.btn1.attr("class", "btnView");
        self.usingData = self.publisherData;
        updateLines();
    }

}