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

    for (var i = 0, len = data.length; i < len; i++) {
        if (data[i].Year_of_Release=="2017")
            continue;

        // line processing
        sales_year_location.processRow(data[i]);
        top_games.processRow(data[i]);
        platform_publisher.processRow(data[i]);
    }
    
    sales_year_location.locations = ["Europe", "North America", "Japan", "Rest of the Word"];
    sales_year_location.draw("#salesYearLocation"); 

    top_games.draw("#topGames");

    platform_publisher.draw("#visualisationY");
}
