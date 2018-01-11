
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
            user = +row.User_Score*10 || 0;

        if (!this.structure[name]){
            this.structure[name] = {"sales": sales, "critic":critic, "user":user};
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
        
        var data = orderAndLimitData(this.data, "sales");
        this.x.domain([0, d3.max(data, function(d) { return d.sales; })]);
        this.y.domain(data.map(function (d) { return d.name; })).padding(0.1);
        
        /* AXIS */
        this.xaxis = this.g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.c_height + ")")
            .call(d3.axisBottom(this.x));

        this.yaxis = this.g.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(this.y));

        this.serie = this.g.selectAll(".topserie")
            .data(data)
            .enter().append("g")
                .attr("class", "topserie");

        //append rects
        this.serie.append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", function (d) {return self.y(d.name);})
            .attr("width", function (d) { return self.x(d.sales);})
            .attr("height", self.y.bandwidth());
    }

    function processData() {
        var arr = Object.keys(self.structure).map(function (key) { 
            var tmp = self.structure[key]
            tmp.name = key;
            return tmp; });
        self.data = arr;
    }

    function orderAndLimitData(data, by) {
        //sort bars based on value
        var new_data = data.sort(function (a, b) {
            return d3.descending(a[by], b[by]);
        }).slice(0, 10).reverse();
        return new_data;
    }

    function getSizes(div_id){
        self.width = $(div_id).width() || 700;
        self.height = $(div_id).height() || 400;

        self.c_margin = {top: 40, right: 0, bottom: 0, left:250};
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
            .on("mousemove", function(){return self.tooltip_div.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
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
            .on("mousemove", function(){return self.tooltip_div.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
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
            .on("mousemove", function(){return self.tooltip_div.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
            .on("mouseout", function(){return self.tooltip_div.style("visibility", "hidden");});
        
        btnGrp.append("text")
            .attr("x", 250)
            .attr("y", 22)
            .attr("class", "btwViewText")
            .text("Users Rating");
    }

    function btnSalesCallback() {
        var data = orderAndLimitData(self.data, "sales");
        self.x.domain([0, d3.max(data, function(d) { return d.sales; })]);
        self.y.domain(data.map(function (d) { return d.name; })).padding(0.1);

        self.g.selectAll(".topserie").remove()
        
        self.serie = self.g.selectAll(".topserie")
            .data(data)
            .enter().append("g")
                .attr("class", "topserie");

        //append rects
        self.serie.append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", function (d) {return self.y(d.name);})
            .attr("height", self.y.bandwidth())
            .transition().duration(self.transition_time)
            .attr("width", function (d) { return self.x(d.sales);});

        self.yaxis.call(d3.axisLeft(self.y));
        self.xaxis.call(d3.axisBottom(self.x));

        self.btn1.attr("class", "btnView selectedView");
        self.btn2.attr("class", "btnView");
        self.btn3.attr("class", "btnView");
    }

    function btnCriticCallback() {
        var data = orderAndLimitData(self.data, "critic");
        self.x.domain([90, d3.max(data, function(d) { return d.critic; })]);
        self.y.domain(data.map(function (d) { return d.name; })).padding(0.1);

        self.g.selectAll(".topserie").remove()
        
        self.serie = self.g.selectAll(".topserie")
            .data(data)
            .enter().append("g")
                .attr("class", "topserie");

        //append rects
        self.serie.append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", function (d) {return self.y(d.name);})
            .attr("height", self.y.bandwidth())
            .transition().duration(self.transition_time)
            .attr("width", function (d) { return self.x(d.critic);});
        
        self.yaxis.call(d3.axisLeft(self.y));
        self.xaxis.call(d3.axisBottom(self.x));

        self.btn1.attr("class", "btnView");
        self.btn2.attr("class", "btnView selectedView");
        self.btn3.attr("class", "btnView");
    }

    function btnUserCallback() {
        var data = orderAndLimitData(self.data, "user");
        self.x.domain([80, d3.max(data, function(d) { return d.user; })]);
        self.y.domain(data.map(function (d) { return d.name; })).padding(0.1);

        self.g.selectAll(".topserie").remove()
        
        self.serie = self.g.selectAll(".topserie")
            .data(data)
            .enter().append("g")
                .attr("class", "topserie");

        //append rects
        self.serie.append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", function (d) {return self.y(d.name);})
            .attr("height", self.y.bandwidth())
            .transition().duration(self.transition_time)
            .attr("width", function (d) { return self.x(d.user);});

        self.yaxis.call(d3.axisLeft(self.y));
        self.xaxis.call(d3.axisBottom(self.x));

        self.btn1.attr("class", "btnView");
        self.btn2.attr("class", "btnView");
        self.btn3.attr("class", "btnView selectedView");
    }
}

