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

 // FORMAT > {{year:[EU,NA,JP,REST,TOTAL]}, ...}
function processSalesByYearAndLocation(structure, row){
    var year = +row.Year_of_Release,
        eu = +row.EU_Sales,
        na = +row.NA_Sales,
        jp = +row.JP_Sales,
        rest = +row.Other_Sales,
        total = +row.Global_Sales;

    // If some field doesn't exist we skip this entry
    if (!year || !eu || !na || !jp || !rest || !total)
        return

    if (!structure[year]){
        structure[year] = [eu,na,jp,rest,total];

    } else {
        structure[year][0] += eu;
        structure[year][1] += na;
        structure[year][2] += jp;
        structure[year][3] += rest;
        structure[year][4] += total;
    }
}

/*
  EXEMPLO MODIFICADO, DE: http://bl.ocks.org/mbostock/3943967
*/
function generateSalesByYearAndLocation(data, labels, div_id) {
    var margin = {top: 30, right: 50, bottom: 40, left:40};
	var width = 800 - margin.left - margin.right;
	var height = 400 - margin.top - margin.bottom;

	var svg = d3.select('#salesYearLocation')
		.append('svg')
		.attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
    var n = 4, // The number of series.
        m = 58; // The number of values per series.

    // The xz array has m elements, representing the x-values shared by all series.
    // The yz array has n elements, representing the y-values of each of the n series.
    // Each yz[i] is an array of m non-negative numbers representing a y-value for xz[i].
    // The y01z array has the same structure as yz, but with stacked [y₀, y₁] instead of y.
    var xz = d3.range(m),
        yz = d3.range(n).map(function() { return bumps(m); }),
        y01z = d3.stack().keys(d3.range(n))(d3.transpose(yz)),
        yMax = d3.max(yz, function(y) { return d3.max(y); }),
        y1Max = d3.max(y01z, function(y) { return d3.max(y, function(d) { return d[1]; }); });

    var x = d3.scaleBand()
        .domain(xz)
        .rangeRound([0, width])
        .padding(0.08);

    var y = d3.scaleLinear()
        .domain([0, y1Max])
        .range([height, 0]);

    var color = d3.scaleOrdinal()
        .domain(d3.range(n))
        .range(d3.schemeCategory20c);

    var series = g.selectAll(".series")
    .data(y01z)
    .enter().append("g")
        .attr("fill", function(d, i) { return color(i); });

    var rect = series.selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
        .attr("x", function(d, i) { return x(i); })
        .attr("y", height)
        .attr("width", x.bandwidth())
        .attr("height", 0);

    rect.transition()
        .delay(function(d, i) { return i * 10; })
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); });

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
            .tickSize(0)
            .tickPadding(6));

    d3.selectAll("input")
        .on("change", changed);

    var timeout = d3.timeout(function() {
    d3.select("input[value=\"grouped\"]")
        .property("checked", true)
        .dispatch("change");
    }, 2000);
}

function changed() {
    timeout.stop();
    if (this.value === "grouped") transitionGrouped();
    else transitionStacked();
  }
  
  function transitionGrouped() {
    y.domain([0, yMax]);
  
    rect.transition()
        .duration(500)
        .delay(function(d, i) { return i * 10; })
        .attr("x", function(d, i) { return x(i) + x.bandwidth() / n * this.parentNode.__data__.key; })
        .attr("width", x.bandwidth() / n)
      .transition()
        .attr("y", function(d) { return y(d[1] - d[0]); })
        .attr("height", function(d) { return y(0) - y(d[1] - d[0]); });
  }
  
  function transitionStacked() {
    y.domain([0, y1Max]);
  
    rect.transition()
        .duration(500)
        .delay(function(d, i) { return i * 10; })
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
      .transition()
        .attr("x", function(d, i) { return x(i); })
        .attr("width", x.bandwidth());
  }
  
  // Returns an array of m psuedorandom, smoothly-varying non-negative numbers.
  // Inspired by Lee Byron’s test data generator.
  // http://leebyron.com/streamgraph/
  function bumps(m) {
    var values = [], i, j, w, x, y, z;
  
    // Initialize with uniform random values in [0.1, 0.2).
    for (i = 0; i < m; ++i) {
      values[i] = 0.1 + 0.1 * Math.random();
    }
  
    // Add five random bumps.
    for (j = 0; j < 5; ++j) {
      x = 1 / (0.1 + Math.random());
      y = 2 * Math.random() - 0.5;
      z = 10 / (0.1 + Math.random());
      for (i = 0; i < m; i++) {
        w = (i / m - y) * z;
        values[i] += x * Math.exp(-w * w);
      }
    }
  
    // Ensure all values are positive.
    for (i = 0; i < m; ++i) {
      values[i] = Math.max(0, values[i]);
    }
  
    return values;
  }