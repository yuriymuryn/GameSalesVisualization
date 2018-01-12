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
function TopGames() {
    var self = this;

    this.x;
    this.y;
    this.svg;
    this.g;
    this.serie;

    this.structure = {};
    this.data = [];  
    this.yearMin;
    this.yearMax;
    this.yearMinCurrent;
    this.yearMaxCurrent;

    // SIZES
    this.width;     // div width
    this.height;    // div height
    this.c_margin;  // chart margin
    this.c_width;   // chart width
    this.c_height;  // chart height

    this.transition_time = 1000;

    this.selected_view = "sales";

    this.processRow = function(row) {
        var name = row.Name,
            sales = +row.Global_Sales || 0,
            critic = +row.Critic_Score || 0,
            user = +row.User_Score*10 || 0,
            year = +row.Year_of_Release,
            genre = row.Genre
            publisher = row.Publisher;
        
        if (!year) return;

        if (!this.yearMin || this.yearMin > year) this.yearMin = year;
        if (!this.yearMax || this.yearMax < year) this.yearMax = year;

        if (!this.structure[name]){
            this.structure[name] = {"sales": sales, "critic":critic, "user":user, "year":year, "genre":genre, "publisher":publisher};
        } else {
            this.structure[name].sales += sales;
            this.structure[name].critic = critic;
            this.structure[name].user = user;
        }
    }

    this.draw = function(div_id) {
        this.yearMinCurrent = this.yearMin;
        this.yearMaxCurrent = this.yearMax;

        getSizes(div_id);
        processData();

        this.svg = d3.select(div_id).append('svg')
            .attr('width', this.width )
            .attr('height', this.height);

        this.g = this.svg.append("g").attr("transform", "translate(" + this.c_margin.left + "," + this.c_margin.top + ")");
        
        this.x = d3.scaleLinear().range([0, this.c_width]);
        this.y = d3.scaleBand().range([this.c_height, 0]).padding(0.1);
        
        /* AXIS */
        this.xaxis = this.g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.c_height  + ")")
        .call(d3.axisBottom(this.x));
        
        this.yaxis = this.g.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(this.y));
        
        updateChart();
        addButtons(div_id);
    }

    function processData() {
        var arr = Object.keys(self.structure).map(function (key) { 
            var tmp = self.structure[key]
            tmp.name = key;
            return tmp; });
        self.data = arr;
    }

    function orderAndLimitData(data, by, yearMin, yearMax) {
        //sort bars based on value
        var new_data = data.sort(function (a, b) {
            return d3.descending(a[by], b[by]);
        }).filter(function (el) {
            return (yearMin <= el.year && el.year <= yearMax);
        }).slice(0, 10).reverse();
        return new_data;
    }

    function getSizes(div_id){
        self.width = $(div_id).width() || 700;
        self.height = $(div_id).height() || 400;

        self.c_margin = {top: 40, right: 50, bottom: 30, left:235};
        self.c_width = self.width - self.c_margin.left - self.c_margin.right;
        self.c_height = self.height - self.c_margin.top - self.c_margin.bottom;
    }

    function addButtons(div_id) {
        // Define the div for the tooltip
        self.tooltip_div = d3.select(div_id).append("div").attr("class","tooltip").style("visibility", "hidden");

        var btnGrp = self.svg.append("g");
        self.btn1 = btnGrp.append("rect")
            .attr("class", "btnView selectedView")
            .attr("x", 0)
            .attr("width", 70)
            .attr("height", 30)
            .on("click",btnSalesCallback)
            .on("mouseover", function(){return self.tooltip_div.style("visibility", "visible").text("Top games ordered by number of sales");})
            .on("mousemove", function(){return self.tooltip_div.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
            .on("mouseout", function(){return self.tooltip_div.style("visibility", "hidden");});
        
        btnGrp.append("text")
            .attr("x", 10)
            .attr("y", 22)
            .attr("class", "btwViewText")
            .text("Sales");

        self.btn2 = btnGrp.append("rect")
            .attr("class", "btnView")
            .attr("x", 80)
            .attr("width", 150)
            .attr("height", 30)
            .on("click",btnCriticCallback)
            .on("mouseover", function(){return self.tooltip_div.style("visibility", "visible").text("Top games ordered by critics rating");})
            .on("mousemove", function(){return self.tooltip_div.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
            .on("mouseout", function(){return self.tooltip_div.style("visibility", "hidden");});
        
        btnGrp.append("text")
            .attr("x", 90)
            .attr("y", 22)
            .attr("class", "btwViewText")
            .text("Critics Rating");

        self.btn3 = btnGrp.append("rect")
            .attr("class", "btnView")
            .attr("x", 240)
            .attr("width", 150)
            .attr("height", 30)
            .on("click",btnUserCallback)
            .on("mouseover", function(){return self.tooltip_div.style("visibility", "visible").text("Top games ordered by users rating");})
            .on("mousemove", function(){return self.tooltip_div.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
            .on("mouseout", function(){return self.tooltip_div.style("visibility", "hidden");});
        
        btnGrp.append("text")
            .attr("x", 250)
            .attr("y", 22)
            .attr("class", "btwViewText")
            .text("Users Rating");


        // Year slider

        d3.select(div_id).append("p")
            .attr("id","yearStart");

        d3.select(div_id).append("div")
            .attr("id","slider-range-year-top");

        d3.select(div_id).append("p")
            .attr("id","yearEnd");
                
        $( function() {
            $( "#slider-range-year-top" ).slider({
                range: true,
                min: self.yearMin,
                max: self.yearMax,
                values: [ self.yearMin, self.yearMax ],
                slide: function( event, ui ) {
                    $( "#yearStart" ).html(ui.values[ 0 ]);
                    self.yearMinCurrent = +ui.values[ 0 ];
                    $( "#yearEnd" ).html(ui.values[ 1 ]);
                    self.yearMaxCurrent = +ui.values[ 1 ];
                    self.g.selectAll(".topserie").remove();
                    updateChart();
                }
            });
            $( "#yearStart" ).html(self.yearMin);
            $( "#yearEnd" ).html(self.yearMax);
        } );
    }

    function btnSalesCallback() {
        self.g.selectAll(".topserie").remove();

        self.selected_view = "sales";
        updateChart();
        
        self.btn1.attr("class", "btnView selectedView");
        self.btn2.attr("class", "btnView");
        self.btn3.attr("class", "btnView");
    }

    function btnCriticCallback() {
        self.g.selectAll(".topserie").remove();

        self.selected_view = "critic";
        updateChart();

        self.btn1.attr("class", "btnView");
        self.btn2.attr("class", "btnView selectedView");
        self.btn3.attr("class", "btnView");
    }

    function btnUserCallback() {
        self.g.selectAll(".topserie").remove();

        self.selected_view = "user";
        updateChart();

        self.btn1.attr("class", "btnView");
        self.btn2.attr("class", "btnView");
        self.btn3.attr("class", "btnView selectedView");
    }

    function updateChart() {
        var byValue = self.selected_view;
        var data = orderAndLimitData(self.data, byValue, self.yearMinCurrent, self.yearMaxCurrent);

        var xmin = 90;
        var xmax = 100;
        if (byValue == "sales") {
            xmin = 0;
            xmax = d3.max(data, function(d) { return d[byValue] });
        }
        else {
            xmin = Math.max(d3.min(data, function(d) { return d[byValue] }) - 10, 0);
            xmax = Math.min(d3.max(data, function(d) { return d[byValue] }) + 10, 100);
        }

        self.x.domain([xmin, xmax]).nice();
        self.y.domain(data.map(function (d) { return d.name; })).padding(0.1);

        self.serie = self.g.selectAll(".topserie")
            .data(data)
            .enter().append("g")
                .attr("class", "topserie");

        //append rects
        self.serie.append("rect")
            .on("mouseover", function(d){return self.tooltip_div.style("visibility", "visible").html("Year of realease: "+d.year+"<br/>Genre: "+d.genre+"<br/>Publisher: "+d.publisher);})
            .on("mousemove", function(){return self.tooltip_div.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
            .on("mouseout", function(){return self.tooltip_div.style("visibility", "hidden");})
            .attr("class", "bar")
            .attr("x", 1)
            .attr("y", function (d) {return self.y(d.name);})
            .attr("height", self.y.bandwidth())
            .transition().duration(self.transition_time)
            .attr("width", function (d) { return self.x(d[byValue]);})
            

        self.serie.append("text")
            .attr("class", "bartext")
            .attr("text-anchor", "start")
            .attr("fill", "black")
            .attr("y", function(d,i) {
                return self.y(d.name) + 20;
            })
            .transition().duration(self.transition_time)
            .attr("x", function(d,i) {
                return self.x(d[byValue]) + 10;;
            })
            .text(function(d){
                return byValue == "sales" ? parseFloat(d[byValue]).toFixed(2) + " M" : d[byValue];
            });

        self.yaxis.call(d3.axisLeft(self.y).ticks(3));
        self.xaxis.call(d3.axisBottom(self.x).ticks(3));
    }
}

