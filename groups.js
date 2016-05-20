/**
 * Created by jakeconway on 5/17/16.
 */

var modules = ["AdapterContent",
    "BasicStatistics",
"KmerContent",
"Overrepresentedsequences",
"PerbaseGCcontent",
"PerbaseNcontent",
"Perbasesequencecontent",
"Perbasesequencequality",
"PersequenceGCcontent",
"Persequencequalityscores",
"SequenceDuplicationLevels",
"SequenceLengthDistribution",
"Pertilesequencequality"];

function groupsFunctions(){

    $("#groups").show();

    $(function() {
        $( "#groups3tabs").tabs();
    });

    var groups = $("#selected-groups").val();
    var IDs = [];
    var group_data = {};

    for (var i = 0; i < groups.length; i++) {
        IDs.push($("#selected-groups").select2('data')[i]['text']);
        group_data[IDs[i]] = groups[i];
    }


    for (var i = 0; i < IDs.length; i++){
        if (groupData[IDs[i]] == undefined){
            groupData[IDs[i]] = {
                'GC%': [],
                SequenceLength: [],
                statuses: []
            };
            var groupfiles = group_data[IDs[i]].split(",");

            //Send all of the files from the group to the generateGroupData function
            //Which will populate the groupData dictionary for that group
            generateGroupData(groupfiles, IDs[i]);
        }
    }

    //Functions to visualize the data in the 'groupData' dictionary
    GroupBoxPlot(groupData, IDs, 'GC%', "#groupscontainer1", "groups1", "Distribution of GC content by Group");
    GroupBoxPlot(groupData, IDs, 'SequenceLength', "#groupscontainer2", "groups2",
        "Distribution of Sequence Lengths by Group");
    GroupModuleStatusBarPlot(groupData, IDs);
}

function generateGroupData(files, ID){
//    console.log(singleFileContent[fileNames.indexOf(files[0])]);

    //Functions to break up files for group visualizations are in this for loop
    for (var i = 0; i < files.length; i++) {

        groupGCcontent(singleFileContent[fileNames.indexOf(files[i])]["BasicStatistics"], ID);
        groupSequenceLength(singleFileContent[fileNames.indexOf(files[i])]["BasicStatistics"], ID);
        groupModuleStatus(singleFileContent[fileNames.indexOf(files[i])], ID);
    }

}

function groupGCcontent(data, ID){
    var GCcontent =  parseInt(data[8].slice(3).trim());
    groupData[ID]['GC%'].push(GCcontent);
}

function groupSequenceLength(data, ID){
    var SequenceLength = parseInt(data[7].slice(15).trim());
    groupData[ID]['SequenceLength'].push(SequenceLength);
}

function groupModuleStatus(data, ID){
    var modstatuses = [];
    for (var i = 0; i < modules.length; i++){
        if (data[modules[i]] != undefined) {
            modstatuses[i] = modules[i] + " " + data[modules[i]][0];
        }
        else{
            modstatuses[i] = modules[i] + " " + "unknown";
        }
    }
    groupData[ID]['statuses'].push(modstatuses);
}

//Could store the results of this function globally to prevent unneccessary recalculations
//Takes no time at all to do when choosing ~200 files per group... haven't tested with more
function groupModuleStatusCounts(groupdata, IDs){

    var groupStatuses = {};
    for (var i = 0; i < IDs.length; i++){
        var statusData = {
            "BasicStatistics": {
                "pass": 0,
                "warn": 0,
                "fail": 0,
                "unknown": 0
            },
            "KmerContent": {
                "pass": 0,
                "warn": 0,
                "fail": 0,
                "unknown": 0
            },
            "Overrepresentedsequences": {
                "pass": 0,
                "warn": 0,
                "fail": 0,
                "unknown": 0
            },
            "PerbaseGCcontent": {
                "pass": 0,
                "warn": 0,
                "fail": 0,
                "unknown": 0
            },
            "PerbaseNcontent": {
                "pass": 0,
                "warn": 0,
                "fail": 0,
                "unknown": 0
            },
            "Perbasesequencecontent": {
                "pass": 0,
                "warn": 0,
                "fail": 0,
                "unknown": 0
            },
            "Perbasesequencequality": {
                "pass": 0,
                "warn": 0,
                "fail": 0,
                "unknown": 0
            },
            "PersequenceGCcontent": {
                "pass": 0,
                "warn": 0,
                "fail": 0,
                "unknown": 0
            },
            "Persequencequalityscores": {
                "pass": 0,
                "warn": 0,
                "fail": 0,
                "unknown": 0
            },
            "SequenceDuplicationLevels": {
                "pass": 0,
                "warn": 0,
                "fail": 0,
                "unknown": 0
            },
            "SequenceLengthDistribution": {
                "pass": 0,
                "warn": 0,
                "fail": 0,
                "unknown": 0
            },
            "Pertilesequencequality": {
                "pass": 0,
                "warn": 0,
                "fail": 0,
                "unknown": 0
            },
            "AdapterContent": {
                "pass": 0,
                "warn": 0,
                "fail": 0,
                "unknown": 0
            }
        };

        groupStatuses[IDs[i]] = groupdata[IDs[i]]['statuses'];
        for (var j = 0; j < groupStatuses[IDs[i]].length; j++){
            var modules = groupStatuses[IDs[i]][j];
            statusData.AdapterContent[modules[0].split(" ")[1]] = statusData.AdapterContent[modules[0].split(" ")[1]] + 1;
            statusData.BasicStatistics[modules[1].split(" ")[1]] = statusData.BasicStatistics[modules[1].split(" ")[1]] + 1;
            statusData.KmerContent[modules[2].split(" ")[1]] = statusData.KmerContent[modules[2].split(" ")[1]] + 1;
            statusData.Overrepresentedsequences[modules[3].split(" ")[1]] = statusData.Overrepresentedsequences[modules[3].split(" ")[1]] + 1;
            statusData.PerbaseGCcontent[modules[4].split(" ")[1]] = statusData.PerbaseGCcontent[modules[4].split(" ")[1]] + 1;
            statusData.PerbaseNcontent[modules[5].split(" ")[1]] = statusData.PerbaseNcontent[modules[5].split(" ")[1]] + 1;
            statusData.Perbasesequencecontent[modules[6].split(" ")[1]] = statusData.Perbasesequencecontent[modules[6].split(" ")[1]] + 1;
            statusData.Perbasesequencequality[modules[7].split(" ")[1]] = statusData.Perbasesequencequality[modules[7].split(" ")[1]] + 1;
            statusData.PersequenceGCcontent[modules[8].split(" ")[1]] = statusData.PersequenceGCcontent[modules[8].split(" ")[1]] + 1;
            statusData.Persequencequalityscores[modules[9].split(" ")[1]] = statusData.Persequencequalityscores[modules[9].split(" ")[1]] + 1;
            statusData.SequenceDuplicationLevels[modules[10].split(" ")[1]] = statusData.SequenceDuplicationLevels[modules[10].split(" ")[1]] + 1;
            statusData.SequenceLengthDistribution[modules[11].split(" ")[1]] = statusData.SequenceLengthDistribution[modules[11].split(" ")[1]] + 1;
            statusData.Pertilesequencequality[modules[12].split(" ")[1]] = statusData.Pertilesequencequality[modules[12].split(" ")[1]] + 1;
        }
        groupStatuses[IDs[i]] = statusData;
    }

    return groupStatuses;

}

function GroupBoxPlot(groupData, IDs, contentname, divID, headerID, modTitle){

    var title = document.getElementById(headerID);
    title.innerHTML = "";
    title.innerHTML = modTitle;

    var boxplotData = [];

    for(var i = 0; i < IDs.length; i++){
        var currentdata = groupData[IDs[i]][contentname];
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

    // Here will be the D3 code for the box plot!
    var yScale = d3.scale.linear().range([40, 500]).domain([yMax, yMin]);
    var xScale = d3.scale.ordinal().rangePoints([40, 500]).domain(xLabels);

    var xAxis = d3.svg.axis().scale(xScale);
    var yAxis = d3.svg.axis().scale(yScale).orient("left");

    var numOfGroups = xLabels.length;
    var BoxWidth = ((460/numOfGroups)*0.9);

    d3.select(divID).select("svg").remove();

    var vis = d3.select(divID).append("svg")
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
        .attr("stroke-width", 1.5)
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
        .attr("stroke-width", 1.5)
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

function GroupModuleStatusBarPlot(barData, IDs){
    var barData = groupModuleStatusCounts(barData, IDs);

    var plotData = [];

    for(var i = 0; i < 13; i++){
        var moduleData = [];
        var tab = i + 1;
        for (var j = 0; j < IDs.length; j++){
            var passHeight = barData[IDs[j]][modules[i]].pass;
            var passY = passHeight;
            var warnHeight = barData[IDs[j]][modules[i]].warn;
            var warnY = passY + barData[IDs[j]][modules[i]].warn;
            var failHeight = barData[IDs[j]][modules[i]].fail;
            var failY = warnY + barData[IDs[j]][modules[i]].fail;
            var unknownHeight = barData[IDs[j]][modules[i]].unknown;
            var unknownY = failY + barData[IDs[j]][modules[i]].unknown;
            moduleData[j] = {
                x: IDs[j],
                pass_count: passHeight.toString(),
                pass_y: passY,
                warn_count: warnHeight.toString(),
                warn_y: warnY,
                fail_count: failHeight.toString(),
                fail_y: failY,
                unknown_count: unknownHeight.toString(),
                unknown_y: unknownY,
                module: modules[i],
                divID: ("#tab" + tab.toString())
            }
        }
        plotData[i] = moduleData;
    }

    //For look to fill tab divs with d3 plots
    for (var i = 0; i < 13; i++){
        var tabNumber = i+1;
        var divID = "#tab" + tabNumber.toString();

        d3.select(divID).select("svg").remove();

        var current_mod_data = plotData[i];

        var yMax = Math.max.apply(Math, current_mod_data.map(function (current_mod_data) {
            return current_mod_data.unknown_y;
        }));

        var xLabels  = [];
        xLabels.push("");
        xLabels = xLabels.concat(IDs);
        xLabels.push(" ");

        var xScale = d3.scale.ordinal().rangePoints([40, 500]).domain(xLabels);
        var yScale = d3.scale.linear().range([40, 500]).domain([yMax ,0]);

        var xAxis = d3.svg.axis().scale(xScale);
        var yAxis = d3.svg.axis().scale(yScale).orient("left");

        var numOfGroups = xLabels.length;
        var BoxWidth = ((460/numOfGroups)*0.9);

        var vis = d3.select(divID).append("svg")
            .attr("height", 550)
            .attr("width", 650);

        var images = vis.append("g");

        var passed = vis.selectAll("passedRects")
            .data(current_mod_data)
            .enter()
            .append("rect")
            .attr("x", function(d){
                return (xScale(d.x) - (BoxWidth/2));
            })
            .attr("y", function(d){
                return yScale(d.pass_y);
            })
            .attr("width", BoxWidth)
            .attr("height", function(d){
                return (yScale(0) - yScale(d.pass_y));
            })
            .attr("fill", "green");

        var warned = vis.selectAll("warnRects")
            .data(current_mod_data)
            .enter()
            .append("rect")
            .attr("x", function(d){
                return (xScale(d.x) - (BoxWidth/2))
            })
            .attr("y", function(d){
                return yScale(d.warn_y);
            })
            .attr("width", BoxWidth)
            .attr("height", function(d){
                return (yScale(d.pass_y) - yScale(d.warn_y));
            })
            .attr("fill", "orange");

        var failed = vis.selectAll("failedRects")
            .data(current_mod_data)
            .enter()
            .append("rect")
            .attr("x", function(d){
                return (xScale(d.x) - (BoxWidth/2))
            })
            .attr("y", function(d){
                return yScale(d.fail_y);
            })
            .attr("width", BoxWidth)
            .attr("height", function(d){
                return (yScale(d.warn_y) - yScale(d.fail_y));
            })
            .attr("fill", "red");

        var unknown = vis.selectAll("unknownRects")
            .data(current_mod_data)
            .enter()
            .append("rect")
            .attr("x", function(d){
                return (xScale(d.x) - (BoxWidth/2))
            })
            .attr("y", function(d){
                return yScale(d.unknown_y);
            })
            .attr("width", BoxWidth)
            .attr("height", function(d){
                return (yScale(d.fail_y) - yScale(d.unknown_y));
            })
            .attr("fill", "gray");

        var border = vis.selectAll("borders")
            .data(current_mod_data)
            .enter()
            .append("rect")
            .attr("x", function(d){
                return (xScale(d.x) - (BoxWidth/2));
            })
            .attr("y", function(d){
                return yScale(d.unknown_y);
            })
            .attr("width", BoxWidth)
            .attr("height", function(d){
                return (yScale(0) - yScale(d.unknown_y))
            })
            .attr("fill", "black")
            .attr("fill-opacity", 0)
            .attr("stroke", "none")
            .attr("stroke-width", 2)
            .on("mouseover", function(d){

                var current_vis = d3.select(d.divID).select("svg");

                current_vis.append("text")
                    .attr("x", 610)
                    .attr("y", 52)
                    .attr("id", "groupStatusText")
                    .attr("text-anchor", "start")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "11px")
                    .attr("font-weight", "bold")
                    .attr("fill", "black")
                    .text(d.pass_count);
                current_vis.append("text")
                    .attr("x", 610)
                    .attr("y", 77)
                    .attr("id", "groupStatusText")
                    .attr("text-anchor", "start")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "11px")
                    .attr("font-weight", "bold")
                    .attr("fill", "black")
                    .text(d.warn_count);
                current_vis.append("text")
                    .attr("x", 610)
                    .attr("y", 102)
                    .attr("id", "groupStatusText")
                    .attr("text-anchor", "start")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "11px")
                    .attr("font-weight", "bold")
                    .attr("fill", "black")
                    .text(d.fail_count);
                current_vis.append("text")
                    .attr("x", 610)
                    .attr("y", 127)
                    .attr("id", "groupStatusText")
                    .attr("text-anchor", "start")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "11px")
                    .attr("font-weight", "bold")
                    .attr("fill", "black")
                    .text(d.unknown_count);

                d3.select(this).attr("stroke", "black");
            })
            .on("mouseout", function(){

                var tabID = $("#groups3tabs").tabs();
                tabID = tabID.tabs('option', 'active');
                tabID = tabID + 1;
                tabID = ("#tab" + tabID.toString());
//                console.log(tabID);

                var current_vis = d3.select(tabID).select("svg");
                current_vis.selectAll("#groupStatusText").remove();

                d3.select(this).attr("stroke", "none");
            });


        var passImg = images.append("svg:image")
            .attr("xlink:href", singleFileImages.pass)
            .attr("width", 20)
            .attr("height", 20)
            .attr("x", 580)
            .attr("y", 40);
        var warnImg = images.append("svg:image")
            .attr("xlink:href", singleFileImages.warn)
            .attr("width", 20)
            .attr("height", 20)
            .attr("x", 580)
            .attr("y", 65);
        var failImg = images.append("svg:image")
            .attr("xlink:href", singleFileImages.fail)
            .attr("width", 20)
            .attr("height", 20)
            .attr("x", 580)
            .attr("y", 90);
        var unknownImg = images.append("svg:image")
            .attr("xlink:href", singleFileImages.unknown)
            .attr("width", 23)
            .attr("height", 23)
            .attr("x", 580)
            .attr("y", 115);

        vis.append("svg:g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + 500 + ")")
            .call(xAxis);

        vis.append("svg:g")
            .attr("class", "axis")
            .attr("transform", "translate(" + 4 + "0)")
            .call(yAxis);
    }

}
