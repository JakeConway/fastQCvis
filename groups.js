/**
 * Created by jakeconway on 5/17/16.
 */

function groupsFunctions(){

    var groups = $("#selected-groups").val();
    var IDs = [];
    var group_data = {};

    for (var i = 0; i < groups.length; i++) {
        IDs.push($("#selected-groups").select2('data')[i]['text'])
        group_data[IDs[i]] = groups[i];
    }


    for (var i = 0; i < IDs.length; i++){
        if (groupData[IDs[i]] == undefined){
            groupData[IDs[i]] = {
                'GC%': []
            };
            var groupfiles = group_data[IDs[i]].split(",");
            generateGroupData(groupfiles, IDs[i]);
        }
    }

    //Functions to visualize the data in the 'groupData' dictionary
    GCcontentBoxPlot(groupData, IDs);
}

function generateGroupData(files, ID){
//    console.log(singleFileContent[fileNames.indexOf(files[0])]);

    //Functions to break up files for group visualizations are in this for loop
    for (var i = 0; i < files.length; i++) {

        groupGCcontent(singleFileContent[fileNames.indexOf(files[i])]["BasicStatistics"], ID);
    }

}

function groupGCcontent(data, ID){
    var GCcontent =  parseInt(data[8].slice(3).trim());
    groupData[ID]['GC%'].push(GCcontent);
}

function GCcontentBoxPlot(groupData, IDs){

    var title = document.getElementById("groups1");
    title.innerHTML = "";
    title.innerHTML = "Distribution of GC content by Group";

    var boxplotData = [];

    for(var i = 0; i < IDs.length; i++){
        var currentdata = groupData[IDs[i]]['GC%'];
        currentdata = currentdata.sort(function(a, b){return a-b});

        boxplotData[i] = {
            max: Math.max.apply(Math, currentdata),
            min: Math.min.apply(Math, currentdata),
            Q1: d3.quantile(currentdata, 0.25),
            median: d3.median(currentdata),
            Q3: d3.quantile(currentdata, 0.75),
            mean: d3.mean(currentdata).toFixed(2),
            x: IDs[i]
        }

    }

    var yMax = Math.max.apply(Math, boxplotData.map(function (boxplotData) {
        return boxplotData.max;
    }));

    //Add 2 to the max to give space at top of plot
    yMax = yMax + 2;

    var yMin = Math.min.apply(Math, boxplotData.map(function (boxplotData) {
        return boxplotData.min;
    }));

    //Subtract 2 to the min to give space at bottom of plot
    yMin = yMin - 2;

    var xLabels = [];
    xLabels.push("");
    xLabels = xLabels.concat(IDs);
    xLabels.push(" ");
    console.log(IDs);

    // Here will be the D3 code for the box plot!
    var yScale = d3.scale.linear().range([40, 500]).domain([yMax, yMin]);
    var xScale = d3.scale.ordinal().rangePoints([40, 500]).domain(xLabels);

    var xAxis = d3.svg.axis().scale(xScale);
    var yAxis = d3.svg.axis().scale(yScale).orient("left");

    var numOfGroups = xLabels.length;
    var BoxWidth = ((460/numOfGroups)*0.9);

    d3.select("#groupscontainer1").select("svg").remove();

    var vis = d3.select("#groupscontainer1").append("svg")
        .attr("width", 650)
        .attr("height", 550);

    var boxes = vis.selectAll("rects")
        .data(boxplotData)
        .enter()
        .append("rect")
        .attr("width", BoxWidth)
        .attr("height", function(d){
            return(yScale(d.Q1) - yScale(d.Q3));
        })
        .attr("x", function(d){
            return (xScale(d.x) - (BoxWidth/2));
        })
        .attr("y", function(d){
            return yScale(d.Q3);
        })
        .attr("fill", "yellow")
        .attr("stroke", "black");

    var eLineUpper = vis.selectAll("eLineUpper")
        .data(boxplotData)
        .enter()
        .append("line")
        .attr("x1", function(d){
            return xScale(d.x);
        })
        .attr("x2", function(d){
            return xScale(d.x);
        })
        .attr("y1", function(d){
            return yScale(d.max);
        })
        .attr("y2", function(d){
            return yScale(d.Q3);
        })
        .attr("stroke", "black")
        .attr("fill", "none")
        .attr("stroke-opacity", 1);

    var eBarUpper = vis.selectAll("eBarUpper")
        .data(boxplotData)
        .enter()
        .append("line")
        .attr("x1", function(d){
            return (xScale(d.x) - (BoxWidth/2));
        })
        .attr("x2", function(d){
            return (xScale(d.x) + (BoxWidth/2));
        })
        .attr("y1", function(d){
           return yScale(d.max);
        })
        .attr("y2", function(d){
            return yScale(d.max);
        })
        .attr("stroke", "black")
        .attr("stroke-opacity", 1)
        .attr("fill", "none");

    var eLineLower = vis.selectAll("eLineLower")
        .data(boxplotData)
        .enter()
        .append("line")
        .attr("x1", function(d){
            return xScale(d.x);
        })
        .attr("x2", function(d){
            return xScale(d.x)
        })
        .attr("y1", function(d){
            return yScale(d.Q1);
        })
        .attr("y2", function(d){
            return yScale(d.min);
        })
        .attr("stroke", "black")
        .attr("stroke-opacity", 1)
        .attr("fill", "none");

    var eBarLower = vis.selectAll("eBarLower")
        .data(boxplotData)
        .enter()
        .append("line")
        .attr("x1", function(d){
            return (xScale(d.x) - (BoxWidth/2));
        })
        .attr("x2", function(d){
            return (xScale(d.x) + (BoxWidth/2));
        })
        .attr("y1", function(d){
            return yScale(d.min);
        })
        .attr("y2", function(d){
            return yScale(d.min);
        })
        .attr("stroke", "black")
        .attr("stroke-opacity", 1)
        .attr("fill", "none");

    var medianLine = vis.selectAll("medianLine")
        .data(boxplotData)
        .enter()
        .append("line")
        .attr("x1", function(d){
            return (xScale(d.x) - (BoxWidth/2));
        })
        .attr("x2", function(d){
            return (xScale(d.x) + (BoxWidth/2));
        })
        .attr("y1", function(d){
            return yScale(d.median);
        })
        .attr("y2", function(d){
            return yScale(d.median);
        })
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("stroke-opactity", 1)
        .attr("fill", "none");

    var meanLine = vis.selectAll("meanLine")
        .data(boxplotData)
        .enter()
        .append("line")
        .attr("x1", function(d){
            return (xScale(d.x) - (BoxWidth/2));
        })
        .attr("x2", function(d){
            return (xScale(d.x) + (BoxWidth/2));
        })
        .attr("y1", function(d){
            return yScale(d.mean);
        })
        .attr("y2", function(d){
            return yScale(d.mean);
        })
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 1)
        .attr("fill", "none");

    vis.append("svg:g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + 500 + ")")
        .call(xAxis);

    vis.append("svg:g")
        .attr("class", "axis")
        .attr("transform", "translate(" + 4 + "0)")
        .call(yAxis);

}