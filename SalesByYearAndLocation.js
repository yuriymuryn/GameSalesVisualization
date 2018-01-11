
function SalesByYearAndLocation() {
    var self = this;

    this.x;
    this.y;
    this.svg;
    this.g;
    this.serie;

    this.structure = {}
    this.data = [];  
    this.location_lagend = ["Europe", "North America", "Japan", "Rest of the World"];
    this.labels = ["eu","na","jp","rest"];
    this.colors = ["#98abc5", "#8a89a6", "#7b6888", "#6b486b"];

    // SIZES
    this.width;     // div width
    this.height;    // div height
    this.l_height;  // legend height
    this.l_width;   // legend width
    this.c_margin;  // chart margin
    this.c_width;   // chart width
    this.c_height;  // chart height

    this.transition_time = 1000;

    this.selected_location;
    this.selected_view = 0; // 0 - # ; 1 - %

    this.processRow = function(row) {
        var year = +row.Year_of_Release,
        eu = +row.EU_Sales || 0,
        na = +row.NA_Sales || 0,
        jp = +row.JP_Sales || 0,
        rest = +row.Other_Sales || 0,
        total = +row.Global_Sales || 0;

        // If year doesn't exist we skip this entry
        if (!year)
            return

        if (!this.structure[year]){
            this.structure[year] = [eu,na,jp,rest,total];
        } else {
            this.structure[year][0] += eu;
            this.structure[year][1] += na;
            this.structure[year][2] += jp;
            this.structure[year][3] += rest;
            this.structure[year][4] += total;
        }
    }

    this.draw = function(div_id) {
        getSizes(div_id);
        processData();

        this.svg = d3.select(div_id).append('svg')
            .attr('width', this.width )
            .attr('height', this.height);

        this.top_group = this.svg.append("g");
        addButtons(div_id);

        this.g = this.svg.append("g").attr("transform", "translate(" + this.c_margin.left + "," + this.c_margin.top + ")");
    
        this.x = d3.scaleBand().rangeRound([0, this.c_width]).paddingInner(0.05);
        this.y = d3.scaleLinear().rangeRound([this.c_height, 0]);
        this.z = d3.scaleOrdinal().range(this.colors);
    
        this.maxY = d3.max(this.data, function(d) { return d.total; });
        this.x.domain(this.x_data);
        this.y.domain([0, this.maxY]).nice();
        this.z.domain(this.labels);
    
        
        /* AXIS */
        x_ticks = this.x_data.filter(x => x%5==0) // 5 in 5 years
        this.g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + this.c_height+ ")")
            .call(d3.axisBottom(this.x).tickValues(x_ticks));

        this.yaxis =  this.g.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(this.y).ticks(null, "s"))
        
        this.yaxistext = this.yaxis.append("text")
            .attr("class", "axisLegend")
            .attr("transform","rotate(-90)")
            .attr("x", - this.c_height/2 - 20)
            .attr("y", - 40)
            .style("text-anchor", "middle")
            .attr("fill", "#000");

        this.yaxistext.text("Game Sales (in millions)");
        
        /* LEGEND */
        this.legend =  this.svg.append("g")
            .attr("transform", "translate(0," + (this.height - this.l_height) + ")")
            .attr("text-anchor", "middle")
            .attr("class", "legendTitle")
            .selectAll("g")
            .data(this.location_lagend)
            .enter().append("g")
                .on("click", callbackClickLocation)
                .on("mouseover", callbackMouseOverLocation)
                .on("mouseout", callbackMouseOutLocation)
                .attr("transform", function(d, i) { return "translate("+ (i * self.width/4) +", 0)"; });
        
        this.legend.append("rect")
            .attr("x", 20)
            .attr("width", self.width/4 - 40)
            .attr("height", 15)
            .attr("fill", this.z);
        
        this.legend.append("text")
            .attr("x", self.width/8)
            .attr("y", 25)
            .attr("dy", "0.5em")
            .text(function(d) { return d; });

        this.clickInfo = this.legend.append("text")
            .attr("class", "clickInfo")
            .attr("x", self.width/8)
            .attr("y", 50)
            .attr("dy", "0.5em");

        this.serie = this.g.selectAll(".serie")
            .data(d3.stack().keys(this.labels)(this.data))
            .enter().append("g")
                .attr("class", "serie")
                .attr("fill", function(d) { return self.z(d.key); });

        this.serie.selectAll("rect")
            .data(function(d) { return d; })
            .enter().append("rect")
                .on("mouseover", callbackMouseOverYear)
                .on("mouseout", callbackMouseOutYear)
                .attr("x", function(d) { return self.x(d.data.year); })
                .attr("y", function(d) { return self.y(d[1]); })
                .attr("height", function(d) { return self.y(d[0]) - self.y(d[1]); })
                .attr("width", this.x.bandwidth());
    }

    function processData() {
        self.x_data = Object.keys(self.structure).sort();
        // restructure the data
        for (var i=0, len=self.x_data.length; i<len; i++) {
            y = self.x_data[i];
            self.x_data[i] = +self.x_data[i];
            sales = self.structure[y];
            self.data.push({year:+y, eu:sales[0], na:sales[1], jp:sales[2], rest:sales[3], total:sales[4]});
        }
    }

    function addButtons(div_id) {
        // Define the div for the tooltip
        self.tooltip_div = d3.select(div_id).append("div").attr("class","tooltip").style("visibility", "hidden");

        self.btn1 = self.top_group.append("rect")
            .attr("class", "btnView selectedView")
            .attr("x", 0)
            .attr("width", 25)
            .attr("height", 30)
            .on("click",btnTotalCallback)
            .on("mouseover", function(){return self.tooltip_div.style("visibility", "visible").text("View number of sales");})
            .on("mousemove", function(){return self.tooltip_div.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
            .on("mouseout", function(){return self.tooltip_div.style("visibility", "hidden");});
        
        self.top_group.append("text")
                .attr("x", 8)
                .attr("y", 22)
                .attr("class", "btwViewText")
                .text("#");

        self.btn2 = self.top_group.append("rect")
            .attr("class", "btnView")
            .attr("x", 0)
            .attr("y", 35)
            .attr("width", 25)
            .attr("height", 30)
            .on("click",btnPercCallback)
            .on("mouseover", function(){return self.tooltip_div.style("visibility", "visible").text("View percentage of sales");})
            .on("mousemove", function(){return self.tooltip_div.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
            .on("mouseout", function(){return self.tooltip_div.style("visibility", "hidden");});
        
        
        self.top_group.append("text")
            .attr("x", 4)
            .attr("y", 57)
            .attr("class", "btwViewText")
            .text("%");
    }

    function getSizes(div_id){
        self.width = $(div_id).width() || 700;
        self.height = $(div_id).height() || 400;


        self.l_height = 90;
        self.l_width = self.width;
        self.c_margin = {top: 10, right: 40, bottom: 35, left:65};
        self.c_width = self.width - self.c_margin.left - self.c_margin.right;
        self.c_height = self.height - self.l_height - self.c_margin.top - self.c_margin.bottom;
    }

    function btnTotalCallback() {
        self.selected_view = 0;
        
        self.y.domain([0, self.maxY]).nice();

        var trans = self.svg.transition().duration(self.transition_time);
        trans.selectAll(".serie")
            .selectAll("rect")
                .attr("y", function(d) { return self.y(d[1]); })
                .attr("height", function(d) { return self.y(d[0]) - self.y(d[1]); });
       
        self.yaxistext.transition().delay(self.transition_time*0.6).text("Game Sales (in millions)");
        self.yaxis.transition().duration(self.transition_time).call(d3.axisLeft(self.y).ticks(null, "s"));

        self.legend.style("opacity", 1);
        self.selected_location = null;

        self.btn1.attr("class", "btnView selectedView");
        self.btn2.attr("class", "btnView");
    }
    
    function btnPercCallback() {
        self.selected_view = 1;

        self.y.domain([0, 100]);
        
        var trans = self.svg.transition().duration(self.transition_time);
        trans.selectAll(".serie")
            .selectAll("rect")
                .attr("y", function(d) { return self.y(d[1]/d.data.total*100); })
                .attr("height", function(d) { return self.y(d[0]/d.data.total*100) - self.y(d[1]/d.data.total*100); });
       
        self.yaxistext.transition().delay(self.transition_time*0.6).text("Game Sales %"); 
        self.yaxis.transition().duration(self.transition_time).call(d3.axisLeft(self.y).ticks(null, "s"));

        self.legend.style("opacity", 1);
        self.selected_location = null;

        self.btn2.attr("class", "btnView selectedView");
        self.btn1.attr("class", "btnView");
    }

    function callbackMouseOverYear(d){
        var selectedYear = d.data.year;
        
        self.serie.selectAll("rect")
            .style("opacity", function(d) {
                if (d.data.year == selectedYear) {
                    self.clickInfo.text(function(t) { 
                        var l = self.labels[self.location_lagend.indexOf(t)];
                        
                        if (self.selected_view==0)
                            return parseFloat(d.data[l]).toFixed(2) + " M";
                        else
                            return parseFloat(d.data[l]/d.data.total*100).toFixed(1) + " %"
                        })
                    return 1;
                }
                else 
                    return 0.7;
            });
    }

    function callbackMouseOutYear(d){
        self.serie.selectAll("rect").style("opacity", 1);
        self.clickInfo.text(function(t) { return ""; })
    }

    function callbackClickLocation(d){
        var selectedLocation = d;
        var idx = self.location_lagend.indexOf(d);

        if (self.selected_location == selectedLocation) {
            if (self.selected_view==0)
                btnTotalCallback();
            else 
                btnPercCallback();
        }
        else {
            self.legend.style("opacity", function(d) {
                return d == selectedLocation ? 1 : 0.2;
            });
            self.selected_location = selectedLocation;

            
            var years = {};
            for (var i = 0; i < self.x_data.length; ++i) {
                years[self.x_data[i]] = -1;
            }
            var maxY = d3.max(self.data, function(d) { 
                if (self.selected_view==0)
                    return d3.max([d.eu,d.jp,d.na,d.rest]);
                if (self.selected_view==1)
                    return d3.max([d.eu/d.total*100,d.jp/d.total*100,d.na/d.total*100,d.rest/d.total*100]); 
            });
            self.y.domain([0, maxY]).nice();
            var trans = self.svg.transition().duration(self.transition_time);
            trans.selectAll(".serie")
                .selectAll("rect")
                    .attr("height", function(d) {
                        var d0, d1;
                        if (self.selected_view==0){
                            d0 = d[0];
                            d1 = d[1];
                        }
                        else {
                            d0 = d[0]/d.data.total*100;
                            d1 = d[1]/d.data.total*100;
                        }
                        years[d.data.year] += 1;
                        if (years[d.data.year] == idx) {
                            return self.y(d0) - self.y(d1); 
                        }
                        else {
                            return 0; 
                        }
                    })
                    .attr("y", function(d) {
                        var d0, d1;
                        if (self.selected_view==0){
                            d0 = d[0];
                            d1 = d[1];
                        }
                        else {
                            d0 = d[0]/d.data.total*100;
                            d1 = d[1]/d.data.total*100;
                        }
                        return self.y(0) - (self.y(d0) - self.y(d1)); 
                    })
                .transition().duration(self.transition_time);

            self.yaxis.transition().duration(self.transition_time).call(d3.axisLeft(self.y).ticks(null, "s"));
            
        }        
    }

    function callbackMouseOverLocation(d){ 
        var selectedLocation = d;
        self.legend.style("stroke", function(d) {
            return d == selectedLocation ? "black" : "none";
        });
    }

    function callbackMouseOutLocation(d){ 
        var selectedLocation = d;
        self.legend.style("stroke", "none");
    }
}

