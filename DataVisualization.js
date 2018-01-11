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

$(document).ready(function(){
    sales_year_location = new SalesByYearAndLocation();
    top_games = new TopGames();
    platform_publisher = new PlatformPublisherByYear();
    
    d3.csv("data/Video_Game_Sales_as_of_Jan_2017.csv", parseDataset);
});

function parseDataset(data) {
    var platform_year = {};
    var publisher_year = {};
    var years = {};

    for (var i = 0, len = data.length; i < len; i++) {
        if (!data[i].Year_of_Release)
            console.log(data[i])
        // line processing
        sales_year_location.processRow(data[i]);
        top_games.processRow(data[i]);
        platform_publisher.processRow(data[i]);
        processPlatformByYear(platform_year,years,data[i]);
        processPublisherByYear(publisher_year,years,data[i])
    }
    
    sales_year_location.locations = ["Europe", "North America", "Japan", "Rest of the Word"];
    sales_year_location.draw("#salesYearLocation"); 

    top_games.draw("#topGames");

    platform_publisher.draw("#visualisationY");
    //generatePlatformByYear(platform_year,publisher_year,years,"#visualisationY");

}


// TODO ja nao e mais usada, deixo para ja para ver o exemplo
function generateScoreVsSales(data) {
    var margin = {top: 30, right: 50, bottom: 40, left:40};
	var width = 600 - margin.left - margin.right;
	var height = 400 - margin.top - margin.bottom;

	var svg = d3.select('#visualisationX')
		.append('svg')
		.attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	// The API for scales have changed in v4. There is a separate module d3-scale which can be used instead. The main change here is instead of d3.scale.linear, we have d3.scaleLinear.
	var xScale = d3.scaleLinear()
		.range([0, width]);

	var yScale = d3.scaleLinear()
		.range([height, 0]);

	// square root scale.
	var radius = d3.scaleSqrt()
		.range([2,5]);

	// the axes are much cleaner and easier now. No need to rotate and orient the axis, just call axisBottom, axisLeft etc.
	var xAxis = d3.axisBottom()
		.scale(xScale);

	var yAxis = d3.axisLeft()
		.scale(yScale);

	// again scaleOrdinal
	var color = d3.scaleOrdinal(d3.schemeCategory20);



    xScale.domain(d3.extent(data, function(d){ return d[0]; })).nice();

    yScale.domain(d3.extent(data, function(d){ return d[1]; })).nice();

    // adding axes is also simpler now, just translate x-axis to (0,height) and it's alread defined to be a bottom axis. 
    svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .attr('class', 'x axis')
        .call(xAxis);

    // y-axis is translated to (0,0)
    svg.append('g')
        .attr('transform', 'translate(0,0)')
        .attr('class', 'y axis')
        .call(yAxis);


    var bubble = svg.selectAll('.bubble')
        .data(data)
        .enter().append('circle')
        .attr('class', 'bubble')
        .attr('cx', function(d){return xScale(d[0]);})
        .attr('cy', function(d){ return yScale(d[1]); })
        .attr('r', '5px')
        .style('fill', function(d){ 
            return color(d[2]);
        });

    bubble.append('title')
        .attr('x', function(d){ return radius(d[0]); })
        .text(function(d){
            return d[2];
        });

    // adding label. For x-axis, it's at (10, 10), and for y-axis at (width, height-10).
    svg.append('text')
        .attr('x', 10)
        .attr('y', 10)
        .attr('class', 'label')
        .text('Sales');


    svg.append('text')
        .attr('x', width)
        .attr('y', height - 10)
        .attr('text-anchor', 'end')
        .attr('class', 'label')
        .text('Score');

    // I feel I understand legends much better now.
    // define a group element for each color i, and translate it to (0, i * 20). 
    var legend = svg.selectAll('legend')
        .data(color.domain())
        .enter().append('g')
        .attr('class', 'legend')
        .attr('transform', function(d,i){ return 'translate(0,' + i * 20 + ')'; });

    // give x value equal to the legend elements. 
    // no need to define a function for fill, this is automatically fill by color.
    legend.append('rect')
        .attr('x', width)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', color);

    // add text to the legend elements.
    // rects are defined at x value equal to width, we define text at width - 6, this will print name of the legends before the rects.
    legend.append('text')
        .attr('x', width - 6)
        .attr('y', 9)
        .attr('dy', '.35em')
        .style('text-anchor', 'end')
        .text(function(d){ return d; });

    // d3 has a filter fnction similar to filter function in JS. Here it is used to filter d3 components.
    legend.on('click', function(type){
        d3.selectAll('.bubble')
            .style('opacity', 0)
            .filter(function(d){
                return d[2] == type;
            })
            .style('opacity', 1);
    });

}