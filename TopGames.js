
function TopGames() {
    var self = this;

    this.x;
    this.y;
    this.svg;
    this.g;
    this.serie;

    this.structure = {};
    this.data = [];  

    // SIZES
    this.width;     // div width
    this.height;    // div height
    this.c_margin;  // chart margin
    this.c_width;   // chart width
    this.c_height;  // chart height

    this.transition_time = 1000;

    this.selected_view = 0;

    this.processRow = function(row) {
        var name = row.Name,
            sales = +row.Global_Sales || 0,
            critic = +row.Critic_Score || 0,
            user = +row.User_Score*10 || 0,
            year = +row.Year_of_Release || 2017;

        if (!this.structure[name]){
            this.structure[name] = {"sales": sales, "critic":critic, "user":user, "year":year};
        } else {
            this.structure[name].sales += sales;
            this.structure[name].critic = critic;
            this.structure[name].user = user;
        }
    }

    this.draw = function(div_id) {
        getSizes(div_id);
        processData();

        this.svg = d3.select(div_id).append('svg')
            .attr('width', this.width )
            .attr('height', this.height);

        this.g = this.svg.append("g").attr("transform", "translate(" + this.c_margin.left + "," + this.c_margin.top + ")");
    
        addButtons(div_id);

        
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

        updateChart("sales");
    }

    function processData() {
        var arr = Object.keys(self.structure).map(function (key) { 
            var tmp = self.structure[key]
            tmp.name = key;
            return tmp; });
        self.data = arr;
    }

    function orderAndLimitData(data, by, year) {
        //sort bars based on value
        var new_data = data.sort(function (a, b) {
            return d3.descending(a[by], b[by]);
        }).filter(function (el) {
            if (!year) return true;
            return (el.year === year);
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
    }

    function btnSalesCallback() {
        self.g.selectAll(".topserie").remove();

        updateChart("sales");
        
        self.btn1.attr("class", "btnView selectedView");
        self.btn2.attr("class", "btnView");
        self.btn3.attr("class", "btnView");
    }

    function btnCriticCallback() {
        self.g.selectAll(".topserie").remove();

        updateChart("critic");

        self.btn1.attr("class", "btnView");
        self.btn2.attr("class", "btnView selectedView");
        self.btn3.attr("class", "btnView");
    }

    function btnUserCallback() {
        self.g.selectAll(".topserie").remove();

        updateChart("user", 2016);

        self.btn1.attr("class", "btnView");
        self.btn2.attr("class", "btnView");
        self.btn3.attr("class", "btnView selectedView");
    }

    function updateChart(byValue, year) {
        var data = orderAndLimitData(self.data, byValue, year);

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
            .attr("class", "bar")
            .attr("x", 1)
            .attr("y", function (d) {return self.y(d.name);})
            .attr("height", self.y.bandwidth())
            .transition().duration(self.transition_time)
            .attr("width", function (d) { return self.x(d[byValue]);});

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
                let t = byValue == "sales" ? d[byValue] + " M" : d[byValue]

                return t;
            });

        self.yaxis.call(d3.axisLeft(self.y).ticks(3));
        self.xaxis.call(d3.axisBottom(self.x).ticks(3));
    }
}

