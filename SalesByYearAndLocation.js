
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

    this.processRow = function(row) {
        var year = +row.Year_of_Release,
        eu = +row.EU_Sales || 0,
        na = +row.NA_Sales || 0,
        jp = +row.JP_Sales || 0,
        rest = +row.Other_Sales || 0,
        total = +row.Global_Sales || 0;

        // If year doesn't exist we skip this entry
        if (!year){
            return
        }

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
        this.getSizes(div_id);
        this.addButtons(div_id);
        this.processData();

        this.svg = d3.select(div_id).append('svg')
            .attr('width', this.width )
            .attr('height', this.height)
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
            .attr("transform", "translate(0," + this.c_height + ")")
            .call(d3.axisBottom(this.x).tickValues(x_ticks));

        this.yaxis =  this.g.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(this.y).ticks(null, "s"))
        
        this.yaxistext = this.yaxis.append("text")
            .attr("class", "axisLegend")
            .attr("transform","rotate(-90)")
            .attr("x", - this.c_height/2)
            .attr("y", - 40)
            .style("text-anchor", "middle")
            .attr("fill", "#000");

        this.yaxistext.text("Game Sales (in millions)");
        
        /* LEGEND */
        var legend =  this.svg.append("g")
            .attr("transform", "translate(0," + (this.height - this.l_height) + ")")
            .attr("text-anchor", "middle")
            .attr("class", "legendTitle")
            .selectAll("g")
            .data(this.location_lagend)
            .enter().append("g")
                .attr("transform", function(d, i) { return "translate("+ (i * self.width/4) +", 0)"; });
        
        legend.append("rect")
            .attr("x", 1)
            .attr("width", self.width/4 - 2)
            .attr("height", 10)
            .attr("fill", this.z);
        
        legend.append("text")
            .attr("x", self.width/8)
            .attr("y", 20)
            .attr("dy", "0.5em")
            .text(function(d) { return d; });

        
        this.serie = this.g.selectAll(".serie")
            .data(d3.stack().keys(this.labels)(this.data))
            .enter().append("g")
                .attr("class", "serie")
                .attr("fill", function(d) { return self.z(d.key); });

        this.serie.selectAll("rect")
            .data(function(d) { return d; })
            .enter().append("rect")
            .attr("x", function(d) { return self.x(d.data.year); })
            .attr("y", function(d) { return self.y(d[1]); })
            .attr("height", function(d) { return self.y(d[0]) - self.y(d[1]); })
                .transition()
                .delay(function(d, i) { return i * 20; })
            .attr("width", this.x.bandwidth());

        
    }

    this.processData = function() {
        this.x_data = Object.keys(this.structure).sort();
        // restructure the data
        for (var i=0, len=this.x_data.length; i<len; i++) {
            y = this.x_data[i];
            this.x_data[i] = +this.x_data[i];
            sales = this.structure[y];
            this.data.push({year:+y, eu:sales[0], na:sales[1], jp:sales[2], rest:sales[3], total:sales[4]});
        }
    }

    this.addButtons = function(div_id) {

        var btnTotal=$('<input/>').attr({ type: "button", id: "changeTotalSales", value: "Sales Number", class: "totalSalesButton" });
        $(div_id).append(btnTotal);
        var btnPerc=$('<input/>').attr({ type: "button", id: "changePercSales", value: "Sales %", class: "totalSalesButton" });
        $(div_id).append(btnPerc);

        btnTotal.on("click", function() {
            self.y.domain([0, self.maxY]).nice();

            var trans = self.svg.transition().duration(self.transition_time);
            trans.selectAll(".serie")
                .selectAll("rect")
                    .attr("y", function(d) { return self.y(d[1]); })
                    .attr("height", function(d) { return self.y(d[0]) - self.y(d[1]); });
           
            self.yaxistext.transition().delay(self.transition_time).text("Game Sales (in millions)");
		    self.yaxis.transition().duration(self.transition_time).call(d3.axisLeft(self.y).ticks(null, "s"));
        });

        btnPerc.on("click", function() {
            self.y.domain([0, 100]);
            
            var trans = self.svg.transition().duration(self.transition_time);
            trans.selectAll(".serie")
                .selectAll("rect")
                    .attr("y", function(d) { return self.y(d[1]/d.data.total*100); })
                    .attr("height", function(d) { return self.y(d[0]/d.data.total*100) - self.y(d[1]/d.data.total*100); });
           
            self.yaxistext.transition().delay(self.transition_time*0.6).text("Game Sales %"); 
		    self.yaxis.transition().duration(self.transition_time*0.6).call(d3.axisLeft(self.y).ticks(null, "s"));
        });
    }

    this.getSizes = function(div_id){
        this.width = $(div_id).width() || 700;
        this.height = $(div_id).height() || 400;

        this.l_height = 100;
        this.l_width = this.width;
        this.c_margin = {top: 20, right: 40, bottom: 40, left:60};
        this.c_width = this.width - this.c_margin.left - this.c_margin.right;
        this.c_height = this.height - this.l_height - this.c_margin.top - this.c_margin.bottom;
    }
}

