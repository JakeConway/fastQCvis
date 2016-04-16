/**
 * Created by jakeconway on 4/16/16.
 */

function fileSelect(file) {

    var index = fileNames.indexOf(file);
    var modules = singleFileContent[index];


    basicStatistics(modules["BasicStatistics"]);
    perBaseSequenceQuality(modules["Perbasesequencequality"]);

    if (modules["Pertilesequencequality"] === undefined) {
        d3.select("#container3").select("svg").remove();
        document.getElementById("three").innerHTML = "";
    }
    else {
        perTileSequenceQuality(modules["Pertilesequencequality"]);
    }

    perSequenceQualityScores(modules["Persequencequalityscores"]);
    perBaseSequenceContent(modules["Perbasesequencecontent"]);
    perSequenceGCcontent(modules["PersequenceGCcontent"]);
    perBaseNContent(modules["PerbaseNcontent"]);
    sequenceLengthDistribution(modules["SequenceLengthDistribution"]);
    sequenceDuplicationLevels(modules["SequenceDuplicationLevels"]);
    overrepresentedSequences(modules["Overrepresentedsequences"]);

    if (modules["AdapterContent"] === undefined) {
        d3.select("#container11").select("svg").remove();
        document.getElementById("eleven").innerHTML = "";
    }
    else {
        adapterContent(modules["AdapterContent"]);
    }

    if (modules["KmerContent"] === undefined) {
        d3.select("#container12").select("svg").remove();
        document.getElementById("twelve").innerHTML = "";
    }
    else {
        kmerContent(modules["KmerContent"]);
    }
}

function basicStatistics(basicStats) {

    document.getElementById("one").innerHTML = "";
    var image = basicStats[0];
    basicStats = basicStats.slice(2);

    var pic = document.createElement("img");
    pic.src = singleFileImages[image];
    pic.width = 30, pic.height = 30;
    var modTitle = document.createTextNode(" Basic Statistics");
    document.getElementById("one").appendChild(pic);
    document.getElementById("one").appendChild(modTitle);

    var splitWords = ["Filename", "type", "Encoding", "Sequences", "quality", "length", "GC"];
    var replacements = ["Filename:", "type:", "Encoding:", "Sequences:", "quality:", "length:", "GC:"];

    if (basicStats[4].indexOf("Sequences flagged as poor quality") === -1) {
        splitWords.splice(4, 1, "Sequences");
        replacements.splice(4, 1, "Sequences:");
    }

    var basicStatsArray = [];
    for (i = 0; i < basicStats.length; i++) {
        basicStatsArray[i] = {Measure: basicStats[i].replace(splitWords[i], replacements[i]).split(":")[0],
            Value: basicStats[i].replace(splitWords[i], replacements[i]).split(":")[1]};
    }

    var bsTable = tabulate(basicStatsArray, ["Measure", "Value"], "#container1");
}

function perBaseSequenceQuality(baseQual) {
    document.getElementById("two").innerHTML = "";

    var image = baseQual[0];
    baseQual = baseQual.slice(2);

    var pic = document.createElement("img");
    pic.src = singleFileImages[image];
    pic.width = 30, pic.height = 30;
    var modTitle = document.createTextNode(" Per base sequence quality");
    document.getElementById("two").appendChild(pic);
    document.getElementById("two").appendChild(modTitle);

    var parameters = [], tickText = [], tickVals = [];

    for (i = 0; i < baseQual.length; i++) {
        baseQual[i] = baseQual[i].replace(/\s+/g, " ");
        baseQual[i].split(" ");
        tickVals[i] = [i + 1];
        tickText[i] = String(baseQual[i].split(" ")[0]);
        parameters[i] = {
            base: parseInt(i + 1),
            mean: baseQual[i].split(" ")[1],
            median: baseQual[i].split(" ")[2],
            lowerQ: baseQual[i].split(" ")[3],
            upperQ: baseQual[i].split(" ")[4],
            tenthP: baseQual[i].split(" ")[5],
            ninetyP: baseQual[i].split(" ")[6]
        };
    }
    var yMax = Math.max.apply(Math, parameters.map(function (parameters) {
        return parameters.ninetyP;
    }));
    var yScale = d3.scale.linear().range([40, 500]).domain([yMax, 0]);
    var xScale = d3.scale.linear().range([40, 500]).domain([0, (parameters.length + 0.5)]);
    var xAxis = d3.svg.axis().scale(xScale)
        .tickValues(tickVals).tickFormat(function (d, i) {
            return tickText[i];
        })
        .ticks(10);
    var yAxis = d3.svg.axis().ticks(parameters.length).scale(yScale).orient("left");


    d3.select("#container2").select("svg").remove();

    var vis = d3.select("#container2").append("svg")
        .attr("width", 650)
        .attr("height", 550);

    var boxes = vis.selectAll("rect")
        .data(parameters)
        .enter()
        .append("rect")
        .attr("width", function (d) {
            var x1 = d.base - 0.4;
            var x2 = d.base + 0.4;
            var w = xScale(x2) - xScale(x1);
            return(w);
        })
        .attr("height", function (d) {
            return (yScale(d.lowerQ) - yScale(d.upperQ));
        })
        .attr("y", function (d) {
            return yScale(d.upperQ);
        })
        .attr("x", function (d) {
            var x = d.base - 0.4;
            return xScale(x);
        })
        .attr("stroke", "black")
        .attr("fill", "yellow");

    var medianLine = vis.selectAll("line")
        .data(parameters)
        .enter()
        .append("line")
        .attr("x1", function (d) {
            var x1 = d.base - 0.4;
            return xScale(x1);
        })
        .attr("x2", function (d) {
            var x2 = (d.base + 0.4);
            return xScale(x2);
        })
        .attr("y1", function (d) {
            return yScale(d.median);
        })
        .attr("y2", function (d) {
            return yScale(d.median);
        })
        .attr("stroke", "red")
        .attr("stroke-opacity", 1)
        .attr("fill", "none");

    var errorLineLow = vis.selectAll("crap.errorLow")
        .data(parameters)
        .enter()
        .append("line")
        .attr("class", "errorLow")
        .attr("x1", function (d) {
            return xScale(d.base);
        })
        .attr("x2", function (d) {
            return xScale(d.base);
        })
        .attr("y1", function (d) {
            return yScale(d.lowerQ);
        })
        .attr("y2", function (d) {
            return yScale(d.tenthP);
        })
        .attr("stroke", "black")
        .attr("fill", "none");

    var errorLineHigh = vis.selectAll("line.errorHigh")
        .data(parameters)
        .enter()
        .append("line")
        .attr("class", "errorHigh")
        .attr("x1", function (d) {
            return xScale(d.base);
        })
        .attr("x2", function (d) {
            return xScale(d.base);
        })
        .attr("y1", function (d) {
            return yScale(d.upperQ);
        })
        .attr("y2", function (d) {
            return yScale(d.ninetyP);
        })
        .attr("stroke", "black")
        .attr("fill", "none");

    var errorBarLow = vis.selectAll("line.eBarLow")
        .data(parameters)
        .enter()
        .append("line")
        .attr("class", "eBarLow")
        .attr("y1", function (d) {
            return yScale(d.tenthP);
        })
        .attr("y2", function (d) {
            return yScale(d.tenthP);
        })
        .attr("x1", function (d) {
            var x1 = d.base - 0.4;
            return xScale(x1);
        })
        .attr("x2", function (d) {
            var x2 = (d.base + 0.4);
            return xScale(x2);
        })
        .attr("stroke", "black")
        .attr("opacity", function (d) {
            if (d.lowerQ !== d.tenthP) {
                return 1;
            }
            else {
                return 0;
            }
        })
        .attr("fill", "none");

    var errorBarHigh = vis.selectAll("line.eBarHigh")
        .data(parameters)
        .enter()
        .append("line")
        .attr("class", "eBarHigh")
        .attr("y1", function (d) {
            return yScale(d.ninetyP);
        })
        .attr("y2", function (d) {
            return yScale(d.ninetyP);
        })
        .attr("x1", function (d) {
            var x1 = d.base - 0.4;
            return xScale(x1);
        })
        .attr("x2", function (d) {
            var x2 = (d.base + 0.4);
            return xScale(x2);
        })
        .attr("stroke", "black")
        .attr("opacity", function (d) {
            if (d.upperQ !== d.ninetyP) {
                return 1;
            }
            else {
                return 0;
            }
        })
        .attr("fill", "none");

    var lineGen = d3.svg.line()
        .x(function (d) {
            return xScale(d.base);
        })
        .y(function (d) {
            return yScale(d.mean);
        });


    vis.append("path")
        .attr("class", "meanLine")
        .attr("d", lineGen(parameters))
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("fill", "none");

    vis.append("text")
        .attr("x", 270)
        .attr("y", 540)
        .attr("class", "x-axis-title")
        .style("text-anchor", "middle")
        .text("Position in read (bp)");

    vis.append("text")
        .attr("x", 300)
        .attr("y", 20)
        .attr("class", "x-axis-title")
        .style("text-anchor", "middle")
        .text("Quality scores scross all bases (Sanger / Illumina encoding)");

    vis.append("svg:g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + 500 + ")")
        .call(xAxis);

    vis.append("svg:g")
        .attr("class", "axis")
        .attr("transform", "translate(" + 4 + "0)")
        .call(yAxis);

}

function perTileSequenceQuality(tileQuals) {
    document.getElementById("three").innerHTML = "";

    var image = tileQuals[0];
    tileQuals = tileQuals.slice(2);

    var pic = document.createElement("img");
    pic.src = singleFileImages[image];
    pic.width = 30, pic.height = 30;
    var modTitle = document.createTextNode(" Per tile sequence quality");
    document.getElementById("three").appendChild(pic);
    document.getElementById("three").appendChild(modTitle);

    var parameters = [], base = [], tile = [];
    for (i = 0; i < tileQuals.length; i++) {
        tileQuals[i] = tileQuals[i].replace(/\s+/g, " ");
        base[i] = tileQuals[i].split(" ")[1];
        tile[i] = tileQuals[i].split(" ")[0];
        parameters[i] = {
            tile: parseInt(tileQuals[i].split(" ")[0]),
            base: tileQuals[i].split(" ")[1],
            mean: parseFloat(tileQuals[i].split(" ")[2])
        };
    }



    var numOfBases = base.unique().length;
    var numOfTiles = tile.unique().length;
    base = base.unique();
    tile = tile.unique();
    var mean = [], baseTileArray = [], holderArray = [],
        totalMean = [], std = [];
    for (var i = 0; i < numOfBases; i++) {
        var index = base[i];
        for (var j = 0; j < parameters.length; j++) {
            if (parameters[j].base === index) {
                holderArray.push(parameters[j]);
                mean.push(parameters[j].mean);
            }
        }
        baseTileArray[i] = holderArray;
        baseTileArray[i].sort(function (a, b) {
            if (a.tile > b.tile) {
                return 1;
            }
            if (a.tile < b.tile) {
                return -1;
            }
            // a must be equal to b
            return 0;
        });

        totalMean[i] = d3.mean(mean);
        std[i] = d3.deviation(mean);
        holderArray = [];
        mean = [];
    }

    tile = tile.sort(function (a, b) {
        return b - a;
    });

    var yScale = d3.scale.ordinal().rangePoints([40, 500]).domain(tile),
        xScale = d3.scale.ordinal().rangePoints([40, 500]).domain(base);
    var xAxis = d3.svg.axis().scale(xScale);
    var yAxis = d3.svg.axis().scale(yScale).orient("left");


    d3.select("#container3").select("svg").remove();

    var vis = d3.select("#container3").append("svg")
        .attr("width", 650)
        .attr("height", 550);

    vis.append("text")
        .attr("x", 270)
        .attr("y", 540)
        .attr("class", "x-axis-title")
        .style("text-anchor", "middle")
        .text("Position in read (bp)");

    vis.append("text")
        .attr("x", 300)
        .attr("y", 20)
        .attr("class", "x-axis-title")
        .style("text-anchor", "middle")
        .text("Quality per tile");

    vis.append("svg:g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + 500 + ")")
        .call(xAxis);

    vis.append("svg:g")
        .attr("class", "axis")
        .attr("transform", "translate(" + 4 + "0)")
        .call(yAxis);

    var tileWidth = 460 / numOfBases;
    var tileHeight = 460 / numOfTiles;
    for (var i = 0; i < baseTileArray.length; i++) {
        var colorScale = d3.scale.linear().domain([totalMean[i], (std[i] + totalMean[i])])
            .range(["blue", "green", "yellow", "orange", "red"]);
        var rects = vis.selectAll("rects")
            .data(baseTileArray[i])
            .enter()
            .append("rect")
            .attr("width", function () {
                return tileWidth;
            })
            .attr("height", function () {
                return tileHeight;
            })
            .attr("x", function (d) {
                return xScale(d.base);
            })
            .attr("y", function (d) {
                return yScale(d.tile);
            })
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .style("fill", function (d) {
                return colorScale(d.mean);
            });
    }
}

function perSequenceQualityScores(qscores) {
    document.getElementById("four").innerHTML = "";

    var image = qscores[0];
    qscores = qscores.slice(2);

    var pic = document.createElement("img");
    pic.src = singleFileImages[image];
    pic.width = 30, pic.height = 30;
    var modTitle = document.createTextNode(" Per sequence quality scores");
    document.getElementById("four").appendChild(pic);
    document.getElementById("four").appendChild(modTitle);


    var qscoresDict = [], read = [], quality = [];

    for (i = 0; i < qscores.length; i++) {
        qscores[i] = qscores[i].replace(/\s+/g, " ");

        read[i] = parseInt(qscores[i].split(" ")[0]);
        quality[i] = qscores[i].split(" ")[1];

        qscoresDict[i] = {read: parseInt(qscores[i].split(" ")[0]),
            quality: qscores[i].split(" ")[1]};
    }

    var xMax = Math.max.apply(null, read);
    var yMax = Math.max.apply(null, quality);

    var xScale = d3.scale.linear().range([40, 500]).domain([0, (xMax + 1)]);
    var yScale = d3.scale.linear().range([40, 500]).domain([yMax, 0]);

    var xAxis = d3.svg.axis().scale(xScale);
    var yAxis = d3.svg.axis().scale(yScale).orient("left");


    d3.select("#container4").select("svg").remove();

    var vis = d3.select("#container4").append("svg")
        .attr("width", 650)
        .attr("height", 550);

    var lineSvg = vis.append("g");

    var focus = vis.append("g").style("display", "none");

    vis.append("text")
        .attr("x", 370)
        .attr("y", 540)
        .attr("class", "x-axis-title")
        .style("text-anchor", "middle")
        .text("Mean Sequence Quality (Phred Score)");

    vis.append("text")
        .attr("x", 375)
        .attr("y", 20)
        .attr("class", "x-axis-title")
        .style("text-anchor", "middle")
        .text("Quality score distribution over all sequences");

    vis.append("svg:g")
        .attr("class", "axis")
        .attr("transform", "translate(100," + 500 + ")")
        .call(xAxis);

    vis.append("svg:g")
        .attr("class", "axis")
        .attr("transform", "translate(" + 14 + "0)")
        .call(yAxis);

    var lineGen = d3.svg.line()
        .x(function (d) {
            return xScale(d.read);
        })
        .y(function (d)
        {
            return yScale(d.quality);
        });

    lineSvg.append("path")
        .attr("transform", "translate(100," + 0 + ")")
        .attr('d', lineGen(qscoresDict))
        .attr('stroke', 'green')
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .on("mouseover", function () {
            focus.style("display", null);
        })
        .on("mouseout", function () {
            focus.style("display", "none");
        })
        .on("mousemove", mousemove);

    focus.append("circle")
        .attr("class", "y")
        .style("fill", "none")
        .style("stroke", "green")
        .style("stroke-width", 2)
        .attr("r", 4);

    focus.append("text").attr("id", "text1");
    focus.append("text").attr("id", "text2");

    function mousemove() {
        var x = Math.round(xScale.invert(d3.mouse(this)[0]));
        var y = quality[read.indexOf(x)];
        focus.select("circle.y")
            .attr("cx", xScale(xScale.invert(d3.mouse(this)[0])))
            .attr("cy", yScale(yScale.invert(d3.mouse(this)[1])))
            .attr("transform", "translate(" + 100 + ")");

        focus.select("#text1")
            .attr("x", (xScale(xScale.invert(d3.mouse(this)[0]))))
            .attr("y", (yScale(yScale.invert(d3.mouse(this)[1]))))
            .attr("text-anchor", "left")
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .attr("transform", "translate(" + 0 + ")")
            .html("read: " + x);

        focus.select("#text2")
            .attr("x", (xScale(xScale.invert(d3.mouse(this)[0]))))
            .attr("y", (yScale(yScale.invert(d3.mouse(this)[1]))))
            .attr("text-anchor", "left")
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .attr("transform", "translate(0,10)")
            .html("quality: " + y);
    }
}

function perBaseSequenceContent(baseContent) {
    document.getElementById("five").innerHTML = "";

    var image = baseContent[0];
    baseContent = baseContent.slice(2);

    var pic = document.createElement("img");
    pic.src = singleFileImages[image];
    pic.width = 30, pic.height = 30;
    var modTitle = document.createTextNode(" Per base sequence content");
    document.getElementById("five").appendChild(pic);
    document.getElementById("five").appendChild(modTitle);


    var parameters = [], bases = [], A = [], T = [], G = [], C = [];

    for (var i = 0; i < baseContent.length; i++) {
        baseContent[i] = baseContent[i].replace(/\s+/g, " ");
        bases[0] = "0";
        bases[i + 1] = String(baseContent[i].split(" ")[0]);
        parameters[i] = {
            base: String(baseContent[i].split(" ")[0]),
            G: parseFloat(baseContent[i].split(" ")[1]),
            A: parseFloat(baseContent[i].split(" ")[2]),
            T: parseFloat(baseContent[i].split(" ")[3]),
            C: parseFloat(baseContent[i].split(" ")[4])
        };
    }

    var yScale = d3.scale.linear().range([40, 500]).domain([100, 0]),
        xScale = d3.scale.ordinal().rangePoints([40, 500]).domain(bases);
    var xAxis = d3.svg.axis().scale(xScale);
    var yAxis = d3.svg.axis().scale(yScale).orient("left");
    var interactiveX = d3.scale.linear().range([40, 500])
        .domain([parseFloat(parseInt(parameters[0].base)), parameters.length]);


    d3.select("#container5").select("svg").remove();

    var vis = d3.select("#container5").append("svg")
        .attr("width", 650)
        .attr("height", 550);

    var focusG = vis.append("g")
        .style("display", "none");

    var focusA = vis.append("g")
        .style("display", "none");

    var focusT = vis.append("g")
        .style("display", "none");

    var focusC = vis.append("g")
        .style("display", "none");

    vis.append("text")
        .attr("x", 270)
        .attr("y", 540)
        .attr("class", "x-axis-title")
        .style("text-anchor", "middle")
        .text("Position in read (bp)");

    vis.append("text")
        .attr("x", 300)
        .attr("y", 20)
        .attr("class", "x-axis-title")
        .style("text-anchor", "middle")
        .text("Sequence content across all bases");

    focusG.append("circle")
        .attr("class", "G")
        .style("fill", "none")
        .attr("r", 4);
    focusA.append("circle")
        .attr("class", "A")
        .style("fill", "none")
        .attr("r", 4);
    focusT.append("circle")
        .attr("class", "T")
        .style("fill", "none")
        .attr("r", 4);
    focusC.append("circle")
        .attr("class", "C")
        .style("fill", "none")
        .attr("r", 4);

    focusG.append("text")
        .attr("id", "Gtext1");
    focusG.append("text")
        .attr("id", "Gtext2");
    focusA.append("text")
        .attr("id", "Atext1");
    focusA.append("text")
        .attr("id", "Atext2");
    focusT.append("text")
        .attr("id", "Ttext1");
    focusT.append("text")
        .attr("id", "Ttext2");
    focusC.append("text")
        .attr("id", "Ctext1");
    focusC.append("text")
        .attr("id", "Ctext2");

    var G_lineGen = d3.svg.line()
        .x(function (d) {
            return xScale(d.base);
        })
        .y(function (d)
        {
            return yScale(d.G);
        });
    var A_lineGen = d3.svg.line()
        .x(function (d) {
            return xScale(d.base);
        })
        .y(function (d)
        {
            return yScale(d.A);
        });
    var T_lineGen = d3.svg.line()
        .x(function (d) {
            return xScale(d.base);
        })
        .y(function (d)
        {
            return yScale(d.T);
        });
    var C_lineGen = d3.svg.line()
        .x(function (d) {
            return xScale(d.base);
        })
        .y(function (d)
        {
            return yScale(d.C);
        });

    var Gline = vis.append("path")
        .attr('d', G_lineGen(parameters))
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('fill', 'none')
        .on("mouseover", function () {
            focusG.style("display", null);
        })
        .on("mouseout", function () {
            focusG.style("display", "none");
        })
        .on("mousemove", mousemoveG);
    var Aline = vis.append("path")
        .attr('d', A_lineGen(parameters))
        .attr('stroke', 'green')
        .attr('stroke-width', 1)
        .attr('fill', 'none')
        .on("mouseover", function () {
            focusA.style("display", null);
        })
        .on("mouseout", function () {
            focusA.style("display", "none");
        })
        .on("mousemove", mousemoveA);
    var Tline = vis.append("path")
        .attr('d', T_lineGen(parameters))
        .attr('stroke', 'red')
        .attr('stroke-width', 1)
        .attr('fill', 'none')
        .on("mouseover", function () {
            focusT.style("display", null);
        })
        .on("mouseout", function () {
            focusT.style("display", "none");
        })
        .on("mousemove", mousemoveT);
    var Cline = vis.append("path")
        .attr('d', C_lineGen(parameters))
        .attr('stroke', 'blue')
        .attr('stroke-width', 1)
        .attr('fill', 'none')
        .on("mouseover", function () {
            focusC.style("display", null);
        })
        .on("mouseout", function () {
            focusC.style("display", "none");
        })
        .on("mousemove", mousemoveC);

    vis.append("svg:g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + 500 + ")")
        .call(xAxis);

    vis.append("svg:g")
        .attr("class", "axis")
        .attr("transform", "translate(" + 4 + "0)")
        .call(yAxis);

    function mousemoveG() {
        var index = ((Math.round(interactiveX.invert(d3.mouse(this)[0]))) - 1);
        var x = parameters[index].base;
        var y = parameters[index].G;
        y = +y.toFixed(2);
        focusG.select("circle.G")
            .attr("cx", interactiveX(interactiveX.invert(d3.mouse(this)[0])))
            .attr("cy", yScale(yScale.invert(d3.mouse(this)[1])))
            .attr("stroke", "black")
            .attr("transform", "translate(" + 0 + ")");
        focusG.select("#Gtext1")
            .attr("x", (interactiveX(interactiveX.invert(d3.mouse(this)[0]))))
            .attr("y", (yScale(yScale.invert(d3.mouse(this)[1]))))
            .attr("text-anchor", "left")
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .attr("transform", "translate(25,0)")
            .html("position: " + x);
        focusG.select("#Gtext2")
            .attr("x", (interactiveX(interactiveX.invert(d3.mouse(this)[0]))))
            .attr("y", (yScale(yScale.invert(d3.mouse(this)[1]))))
            .attr("text-anchor", "left")
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .attr("transform", "translate(25,10)")
            .html("percentage G: " + y);
    }

    function mousemoveA() {
        var index = ((Math.round(interactiveX.invert(d3.mouse(this)[0]))) - 1);
        var x = parameters[index].base;
        var y = parameters[index].A;
        y = +y.toFixed(2);
        focusA.select("circle.A")
            .attr("cx", interactiveX(interactiveX.invert(d3.mouse(this)[0])))
            .attr("cy", yScale(yScale.invert(d3.mouse(this)[1])))
            .attr("stroke", "green")
            .attr("transform", "translate(" + 0 + ")");
        focusA.select("#Atext1")
            .attr("x", (interactiveX(interactiveX.invert(d3.mouse(this)[0]))))
            .attr("y", (yScale(yScale.invert(d3.mouse(this)[1]))))
            .attr("text-anchor", "left")
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .attr("transform", "translate(25,0)")
            .html("position: " + x);
        focusA.select("#Atext2")
            .attr("x", (interactiveX(interactiveX.invert(d3.mouse(this)[0]))))
            .attr("y", (yScale(yScale.invert(d3.mouse(this)[1]))))
            .attr("text-anchor", "left")
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .attr("transform", "translate(25,10)")
            .html("percentage A: " + y);
    }

    function mousemoveT() {
        var index = ((Math.round(interactiveX.invert(d3.mouse(this)[0]))) - 1);
        var x = parameters[index].base;
        var y = parameters[index].T;
        y = +y.toFixed(2);
        focusT.select("circle.T")
            .attr("cx", interactiveX(interactiveX.invert(d3.mouse(this)[0])))
            .attr("cy", yScale(yScale.invert(d3.mouse(this)[1])))
            .attr("stroke", "red")
            .attr("transform", "translate(" + 0 + ")");
        focusT.select("#Ttext1")
            .attr("x", (interactiveX(interactiveX.invert(d3.mouse(this)[0]))))
            .attr("y", (yScale(yScale.invert(d3.mouse(this)[1]))))
            .attr("text-anchor", "left")
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .attr("transform", "translate(25,0)")
            .html("position: " + x);
        focusT.select("#Ttext2")
            .attr("x", (interactiveX(interactiveX.invert(d3.mouse(this)[0]))))
            .attr("y", (yScale(yScale.invert(d3.mouse(this)[1]))))
            .attr("text-anchor", "left")
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .attr("transform", "translate(25,10)")
            .html("percentage T: " + y);
    }

    function mousemoveC() {
        var index = ((Math.round(interactiveX.invert(d3.mouse(this)[0]))) - 1);
        var x = parameters[index].base;
        var y = parameters[index].C;
        y = +y.toFixed(2);
        focusC.select("circle.C")
            .attr("cx", interactiveX(interactiveX.invert(d3.mouse(this)[0])))
            .attr("cy", yScale(yScale.invert(d3.mouse(this)[1])))
            .attr("stroke", "blue")
            .attr("transform", "translate(" + 0 + ")");
        focusC.select("#Ctext1")
            .attr("x", (interactiveX(interactiveX.invert(d3.mouse(this)[0]))))
            .attr("y", (yScale(yScale.invert(d3.mouse(this)[1]))))
            .attr("text-anchor", "left")
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .attr("transform", "translate(25,0)")
            .html("position: " + x);
        focusC.select("#Ctext2")
            .attr("x", (interactiveX(interactiveX.invert(d3.mouse(this)[0]))))
            .attr("y", (yScale(yScale.invert(d3.mouse(this)[1]))))
            .attr("text-anchor", "left")
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .attr("transform", "translate(25,10)")
            .html("percentage C: " + y);
    }

}

function perSequenceGCcontent(GCcontent) {
    document.getElementById("six").innerHTML = "";

    var image = GCcontent[0];
    var GCcontent = GCcontent.slice(2);

    var pic = document.createElement("img");
    pic.src = singleFileImages[image];
    pic.width = 30, pic.height = 30;
    var modTitle = document.createTextNode(" Per sequence GC content");
    document.getElementById("six").appendChild(pic);
    document.getElementById("six").appendChild(modTitle);


    var parameters = [], content = [], total = 0, probability = [],
        expectation = [], yMax = [];

    for (var i = 0; i < GCcontent.length; i++) {
        GCcontent[i] = GCcontent[i].replace(/\s+/g, " ");
        total = total + parseFloat(GCcontent[i].split(" ")[1]);
        parameters[i] = {
            GCnumber: parseInt(GCcontent[i].split(" ")[0]),
            ContentCount: parseFloat(GCcontent[i].split(" ")[1]),
            theoretical: 0
        };
    }
    for (var i = 0; i < parameters.length; i++) {
        probability[i] = parameters[i].ContentCount / total;
        expectation[i] = probability[i] * parameters[i].GCnumber;
    }
    expectation = d3.sum(expectation);
    var std = [];
    for (var i = 0; i < parameters.length; i++) {
        std[i] = Math.pow((parameters[i].GCnumber - expectation), 2);
        std[i] = std[i] * probability[i];
    }
    std = Math.sqrt(d3.sum(std));
    var n = parseFloat(1) / ((std) * (Math.sqrt(2 * Math.PI)));
    var exp, numer, pdfNormValue;
    var denom = 2 * (std * std);

    for (var i = 0; i < parameters.length; i++) {
        numer = (-(Math.pow(parameters[i].GCnumber - expectation, 2)));
        exp = numer / denom;
        pdfNormValue = n * (Math.pow(Math.E, exp));
        parameters[i].theoretical = pdfNormValue * total;
    }

    yMax[0] = Math.max.apply(Math, parameters.map(function (parameters) {
        return parameters.ContentCount;
    }));
    yMax[1] = Math.max.apply(Math, parameters.map(function (parameters) {
        return parameters.theoretical;
    }));
    yMax = Math.max.apply(null, yMax);

    var yScale = d3.scale.linear().range([40, 500]).domain([yMax, 0]),
        xScale = d3.scale.linear().range([40, 500]).domain([0, parameters.length]);
    var xAxis = d3.svg.axis().scale(xScale);
    var yAxis = d3.svg.axis().scale(yScale).orient("left");


    d3.select("#container6").select("svg").remove();

    var vis = d3.select("#container6").append("svg")
        .attr("width", 650)
        .attr("height", 550);

    var focusA = vis.append("g")
        .style("display", "none");

    var focusT = vis.append("g")
        .style("display", "none");

    focusA.append("circle")
        .attr("class", "A")
        .style("fill", "none")
        .attr("r", 4);
    focusT.append("circle")
        .attr("class", "T")
        .style("fill", "none")
        .attr("r", 4);

    focusA.append("text")
        .attr("id", "Atext1");
    focusA.append("text")
        .attr("id", "Atext2");
    focusT.append("text")
        .attr("id", "Ttext1");
    focusT.append("text")
        .attr("id", "Ttext2");

    vis.append("text")
        .attr("x", 370)
        .attr("y", 540)
        .attr("class", "x-axis-title")
        .style("text-anchor", "middle")
        .text("Mean GC content (%)");

    vis.append("text")
        .attr("x", 300)
        .attr("y", 15)
        .attr("class", "x-axis-title")
        .style("text-anchor", "middle")
        .text("GC distribution over all sequences");

    var lineGen = d3.svg.line()
        .x(function (d) {
            return xScale(d.GCnumber);
        })
        .y(function (d) {
            return yScale(d.ContentCount);
        });
    var T_lineGen = d3.svg.line()
        .x(function (d) {
            return xScale(d.GCnumber);
        })
        .y(function (d) {
            return yScale(d.theoretical);
        });

    var actualLine = vis.append("path")
        .attr("transform", "translate(100," + 0 + ")")
        .attr('d', lineGen(parameters))
        .attr('stroke', 'red')
        .attr('stroke-width', 1)
        .attr('fill', 'none')
        .on("mouseover", function () {
            focusA.style("display", null);
        })
        .on("mouseout", function () {
            focusA.style("display", "none");
        })
        .on("mousemove", mousemoveA);

    var theoreticalLine = vis.append("path")
        .attr("transform", "translate(100," + 0 + ")")
        .attr("d", T_lineGen(parameters))
        .attr("stroke", "blue")
        .attr("stroke-width", 1)
        .attr("fill", "none")
        .on("mouseover", function () {
            focusT.style("display", null);
        })
        .on("mouseout", function () {
            focusT.style("display", "none");
        })
        .on("mousemove", mousemoveT);

    vis.append("svg:g")
        .attr("class", "axis")
        .attr("transform", "translate(100," + 500 + ")")
        .call(xAxis);

    vis.append("svg:g")
        .attr("class", "axis")
        .attr("transform", "translate(" + 14 + "0)")
        .call(yAxis);

    function mousemoveA() {
        var index = ((Math.round(xScale.invert(d3.mouse(this)[0]))) - 1);
        var x = parameters[index].GCnumber;
        var y = parameters[index].ContentCount;
        y = +y.toFixed(2);
        focusA.select("circle.A")
            .attr("cx", xScale(xScale.invert(d3.mouse(this)[0])))
            .attr("cy", yScale(yScale.invert(d3.mouse(this)[1])))
            .attr("stroke", "red")
            .attr("transform", "translate(100,0)");
        focusA.select("#Atext1")
            .attr("x", (xScale(xScale.invert(d3.mouse(this)[0]))))
            .attr("y", (yScale(yScale.invert(d3.mouse(this)[1]))))
            .attr("text-anchor", "left")
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .attr("transform", "translate(125,0)")
            .html("GC %: " + x);
        focusA.select("#Atext2")
            .attr("x", (xScale(xScale.invert(d3.mouse(this)[0]))))
            .attr("y", (yScale(yScale.invert(d3.mouse(this)[1]))))
            .attr("text-anchor", "left")
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .attr("transform", "translate(125,10)")
            .html("count: " + y);
    }

    function mousemoveT() {
        var index = ((Math.round(xScale.invert(d3.mouse(this)[0]))) - 1);
        var x = parameters[index].GCnumber;
        var y = parameters[index].theoretical;
        y = +y.toFixed(2);
        focusT.select("circle.T")
            .attr("cx", xScale(xScale.invert(d3.mouse(this)[0])))
            .attr("cy", yScale(yScale.invert(d3.mouse(this)[1])))
            .attr("stroke", "blue")
            .attr("transform", "translate(100,0)");
        focusT.select("#Ttext1")
            .attr("x", (xScale(xScale.invert(d3.mouse(this)[0]))))
            .attr("y", (yScale(yScale.invert(d3.mouse(this)[1]))))
            .attr("text-anchor", "left")
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .attr("transform", "translate(125,0)")
            .html("GC %: " + x);
        focusT.select("#Ttext2")
            .attr("x", (xScale(xScale.invert(d3.mouse(this)[0]))))
            .attr("y", (yScale(yScale.invert(d3.mouse(this)[1]))))
            .attr("text-anchor", "left")
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .attr("transform", "translate(125,10)")
            .html("count: " + y);
    }

}

function perBaseNContent(Ncontent) {
    document.getElementById("seven").innerHTML = "";

    var image = Ncontent[0];
    Ncontent = Ncontent.slice(2);

    var pic = document.createElement("img");
    pic.src = singleFileImages[image];
    pic.width = 30, pic.height = 30;
    var modTitle = document.createTextNode(" Per base N content");
    document.getElementById("seven").appendChild(pic);
    document.getElementById("seven").appendChild(modTitle);

    var parameters = [], bases = [];
    bases[0] = "0";

    for (var i = 0; i < Ncontent.length; i++) {
        Ncontent[i] = Ncontent[i].replace(/\s+/g, " ");
        bases[i + 1] = String(Ncontent[i].split(" ")[0]);
        parameters[i] = {
            base: String(Ncontent[i].split(" ")[0]),
            nCount: parseFloat(Ncontent[i].split(" ")[1])
        };
    }

    var yScale = d3.scale.linear().range([40, 500]).domain([100, 0]),
        xScale = d3.scale.ordinal().rangePoints([40, 500]).domain(bases);
    var xAxis = d3.svg.axis().scale(xScale);
    var yAxis = d3.svg.axis().scale(yScale).orient("left");


    d3.select("#container7").select("svg").remove();

    var vis = d3.select("#container7").append("svg")
        .attr("width", 650)
        .attr("height", 550);

    vis.append("text")
        .attr("x", 270)
        .attr("y", 540)
        .attr("class", "x-axis-title")
        .style("text-anchor", "middle")
        .text("Position in read (bp)");

    vis.append("text")
        .attr("x", 300)
        .attr("y", 20)
        .attr("class", "x-axis-title")
        .style("text-anchor", "middle")
        .text("N content across all bases");

    var lineGen = d3.svg.line()
        .x(function (d) {
            return xScale(d.base);
        })
        .y(function (d) {
            return yScale(d.nCount);
        });

    var line = vis.append("path")
        .attr("transform", "translate(0," + 0 + ")")
        .attr('d', lineGen(parameters))
        .attr('stroke', 'red')
        .attr('stroke-width', 1.5)
        .attr('fill', 'none');

    vis.append("svg:g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + 500 + ")")
        .call(xAxis);

    vis.append("svg:g")
        .attr("class", "axis")
        .attr("transform", "translate(" + 4 + "0)")
        .call(yAxis);
}

function sequenceLengthDistribution(sequenceLength) {
    document.getElementById("eight").innerHTML = "";

    var image = sequenceLength[0];
    sequenceLength = sequenceLength.slice(2);

    var pic = document.createElement("img");
    pic.src = singleFileImages[image];
    pic.width = 30, pic.height = 30;
    var modTitle = document.createTextNode(" Sequence Length Distribution");
    document.getElementById("eight").appendChild(pic);
    document.getElementById("eight").appendChild(modTitle);


    var parameters = [], lengths = [];
    lengths[0] = "0";

    for (var i = 0; i < sequenceLength.length; i++) {
        sequenceLength[i] = sequenceLength[i].replace(/\s+/g, " ");
        lengths[i + 1] = String(sequenceLength[i].split(" ")[0]);
        parameters[i] = {
            length: String(sequenceLength[i].split(" ")[0]),
            count: parseFloat(sequenceLength[i].split(" ")[1])
        };
    }
    if (parameters.length === 1 && parameters[0].length !== 0) {
        var number = parseInt(parameters[0].length);
        lengths = [];
        lengths[0] = String((number - 1));
        lengths[1] = String((number));
        lengths[2] = String((number + 1));
        parameters = [{length: String((number - 1)), count: 0},
            {length: String((number)), count: parameters[0].count},
            {length: String((number + 1)), count: 0}];
    }
    var yMax = Math.max.apply(Math, parameters.map(function (parameters) {
        return parameters.count;
    }));
    //var xMax = Math.max.apply(Math,parameters.map(function(parameters){return parameters.length;}));
    //var xMin = Math.min.apply(Math,parameters.map(function(parameters){return parameters.length;}));
    var yScale = d3.scale.linear().range([40, 500]).domain([yMax, 0]),
        xScale = d3.scale.ordinal().rangePoints([40, 500]).domain(lengths);
    var xAxis = d3.svg.axis().scale(xScale);
    var yAxis = d3.svg.axis().scale(yScale).orient("left");


    d3.select("#container8").select("svg").remove();

    var vis = d3.select("#container8").append("svg")
        .attr("width", 650)
        .attr("height", 550);

    vis.append("text")
        .attr("x", 370)
        .attr("y", 540)
        .attr("class", "x-axis-title")
        .style("text-anchor", "middle")
        .text("Sequence Length (bp)");

    vis.append("text")
        .attr("x", 370)
        .attr("y", 20)
        .attr("class", "x-axis-title")
        .style("text-anchor", "middle")
        .text("Distribution of sequence lengths across all sequences");

    var lineGen = d3.svg.line()
        .x(function (d) {
            return xScale(d.length);
        })
        .y(function (d) {
            return yScale(d.count);
        });

    var line = vis.append("path")
        .attr("transform", "translate(100," + 0 + ")")
        .attr("d", lineGen(parameters))
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr("fill", "none");

    vis.append("svg:g")
        .attr("class", "axis")
        .attr("transform", "translate(100," + 500 + ")")
        .call(xAxis);

    vis.append("svg:g")
        .attr("class", "axis")
        .attr("transform", "translate(" + 14 + "0)")
        .call(yAxis);
}

function sequenceDuplicationLevels(levels) {
    document.getElementById("nine").innerHTML = "";

    var image = levels[0];
    levels = levels.slice(3);

    var pic = document.createElement("img");
    pic.src = singleFileImages[image];
    pic.width = 30, pic.height = 30;
    var modTitle = document.createTextNode(" Sequence Duplication Levels");
    document.getElementById("nine").appendChild(pic);
    document.getElementById("nine").appendChild(modTitle);

    var parameters = [], numbers = [], percentD = [], percentT = [];

    for (var i = 0; i < levels.length; i++) {
        levels[i] = levels[i].replace(/\s+/g, " ");
        numbers[i] = levels[i].split(" ")[0];
        percentD[i] = levels[i].split(" ")[1];
        percentT[i] = levels[i].split(" ")[2];
        parameters[i] = {
            number: levels[i].split(" ")[0],
            percentD: parseFloat(levels[i].split(" ")[1]),
            percentT: parseFloat(levels[i].split(" ")[2])
        };
    }
    var yScale = d3.scale.linear().range([40, 500]).domain([100, 0]);
    var xScale = d3.scale.ordinal().rangePoints([40, 500]).domain(numbers);
    var interactiveX = d3.scale.linear().range([40, 500])
        .domain([parseFloat(numbers[0]), numbers.length]);

    var xAxis = d3.svg.axis().scale(xScale);
    var yAxis = d3.svg.axis().scale(yScale).orient("left");

    var D_lineGen = d3.svg.line()
        .x(function (d) {
            return xScale(d.number);
        })
        .y(function (d) {
            return yScale(d.percentD);
        });
    var T_lineGen = d3.svg.line()
        .x(function (d) {
            return xScale(d.number);
        })
        .y(function (d) {
            return yScale(d.percentT);
        });

    d3.select("#container9").select("svg").remove();

    var vis = d3.select("#container9").append("svg")
        .attr("width", 650)
        .attr("height", 550);

    var focusD = vis.append("g")
        .style("display", "none");

    var focusT = vis.append("g")
        .style("display", "none");

    var lineSvg = vis.append("g");

    vis.append("text")
        .attr("x", 270)
        .attr("y", 540)
        .attr("class", "x-axis-title")
        .style("text-anchor", "middle")
        .text("Sequence Duplication Level");

    focusD.append("circle")
        .attr("class", "D")
        .style("fill", "none")
        .attr("r", 4);

    focusT.append("circle")
        .attr("class", "T")
        .style("fill", "none")
        .attr("r", 4);

    focusD.append("text")
        .attr("id", "text1");
    focusD.append("text")
        .attr("id", "text2");

    focusT.append("text")
        .attr("id", "text1");
    focusT.append("text")
        .attr("id", "text2");

    var Dline = lineSvg.append("path")
        .attr("d", D_lineGen(parameters))
        .attr("stroke", "red")
        .attr("stroke-width", 1)
        .attr("fill", "none")
        .on("mouseover", function () {
            focusD.style("display", null);
        })
        .on("mouseout", function () {
            focusD.style("display", "none");
        })
        .on("mousemove", mousemoveD);

    var Tline = lineSvg.append("path")
        .attr("d", T_lineGen(parameters))
        .attr("stroke", "blue")
        .attr("stroke-width", 1)
        .attr("fill", "none")
        .on("mouseover", function () {
            focusT.style("display", null);
        })
        .on("mouseout", function () {
            focusT.style("display", "none");
        })
        .on("mousemove", mousemoveT);

    vis.append("svg:g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + 500 + ")")
        .call(xAxis);

    vis.append("svg:g")
        .attr("class", "axis")
        .attr("transform", "translate(" + 4 + "0)")
        .call(yAxis);


    function mousemoveD() {
        var index = ((Math.round(interactiveX.invert(d3.mouse(this)[0]))) - 1);
        var x = numbers[index];
        var y = parseFloat(percentD[index]);
        y = +y.toFixed(2);

        focusD.select("circle.D")
            .attr("cx", interactiveX(interactiveX.invert(d3.mouse(this)[0])))
            .attr("cy", yScale(yScale.invert(d3.mouse(this)[1])))
            .attr("stroke", "red")
            .attr("transform", "translate(" + 0 + ")");

        focusD.select("#text1")
            .attr("x", (interactiveX(interactiveX.invert(d3.mouse(this)[0]))))
            .attr("y", (yScale(yScale.invert(d3.mouse(this)[1]))))
            .attr("text-anchor", "left")
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .attr("transform", "translate(25,0)")
            .html("duplication level: " + x);

        focusD.select("#text2")
            .attr("x", (interactiveX(interactiveX.invert(d3.mouse(this)[0]))))
            .attr("y", (yScale(yScale.invert(d3.mouse(this)[1]))))
            .attr("text-anchor", "left")
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .attr("transform", "translate(25,10)")
            .html("percent: " + y);

    }
    function mousemoveT() {
        var index = ((Math.round(interactiveX.invert(d3.mouse(this)[0]))) - 1);
        var x = numbers[index];
        var y = parseFloat(percentT[index]);
        y = +y.toFixed(2);

        focusT.select("circle.T")
            .attr("cx", interactiveX(interactiveX.invert(d3.mouse(this)[0])))
            .attr("cy", yScale(yScale.invert(d3.mouse(this)[1])))
            .attr("stroke", "blue")
            .attr("transform", "translate(" + 0 + ")");

        focusT.select("#text1")
            .attr("x", (interactiveX(interactiveX.invert(d3.mouse(this)[0]))))
            .attr("y", (yScale(yScale.invert(d3.mouse(this)[1]))))
            .attr("text-anchor", "left")
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .attr("transform", "translate(25,0)")
            .html("duplication level: " + x);

        focusT.select("#text2")
            .attr("x", (interactiveX(interactiveX.invert(d3.mouse(this)[0]))))
            .attr("y", (yScale(yScale.invert(d3.mouse(this)[1]))))
            .attr("text-anchor", "left")
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .attr("transform", "translate(25,10)")
            .html("percent: " + y);
    }

}

function overrepresentedSequences(sequences) {
    document.getElementById("ten").innerHTML = "";

    var image = sequences[0];
    sequences = sequences.slice(2);

    var pic = document.createElement("img");
    pic.src = singleFileImages[image];
    pic.width = 30, pic.height = 30;
    var modTitle = document.createTextNode(" Overrepresented sequences");
    document.getElementById("ten").appendChild(pic);
    document.getElementById("ten").appendChild(modTitle);


    var overrepSequenceArray = [];
    var firstThreeRows;
    var source;

    for (i = 0; i < sequences.length; i++) {

        firstThreeRows = sequences[i].replace(/\s+/g, ' ').trim().split(" ");
        source = firstThreeRows.slice(3).join(" ");
        overrepSequenceArray[i] = {Sequence: firstThreeRows[0],
            Count: firstThreeRows[1],
            Percentage: firstThreeRows[2],
            'Possible Source': source
        };
    }

    var overrepSeqTable = tabulate(overrepSequenceArray,
        ["Sequence", "Count", "Percentage", "Possible Source"],
        "#container10");
}

function adapterContent(content) {
    document.getElementById("eleven").innerHTML = "";

    var image = content[0];
    content = content.slice(2);

    var pic = document.createElement("img");
    pic.src = singleFileImages[image];
    pic.width = 30, pic.height = 30;
    var modTitle = document.createTextNode(" Adapter Content");
    document.getElementById("eleven").appendChild(pic);
    document.getElementById("eleven").appendChild(modTitle);


    var numOfAdapters = (content[0].replace(/\s+/g, " ").split(" ").length - 1);
    var parameters = [], keys = [], pos = [];

    pos.push("0");
    for (var i = 0; i < numOfAdapters; i++) {
        keys[i] = String(i);
    }
    for (var i = 0; i < content.length; i++) {
        content[i] = content[i].replace(/\s+/g, " ");
        var obj = {};
        for (var j = 0; j < numOfAdapters; j++) {
            var key = String(keys[j]);
            obj[key] = parseFloat(content[i].split(" ")[j + 1]);
        }
        obj["position"] = content[i].split(" ")[0];
        pos[i + 1] = content[i].split(" ")[0];
        parameters.push(obj);
    }

    var yScale = d3.scale.linear().range([40, 500]).domain([100, 0]),
        xScale = d3.scale.ordinal().rangePoints([40, 500]).domain(pos);

    var xAxis = d3.svg.axis().scale(xScale);
    var yAxis = d3.svg.axis().scale(yScale).orient("left");

    d3.select("#container11").select("svg").remove();

    var vis = d3.select("#container11").append("svg")
        .attr("width", 650)
        .attr("height", 550);

    vis.append("text")
        .attr("x", 270)
        .attr("y", 540)
        .attr("class", "x-axis-title")
        .style("text-anchor", "middle")
        .text("Position in read (bp)");

    vis.append("text")
        .attr("x", 300)
        .attr("y", 20)
        .attr("class", "x-axis-title")
        .style("text-anchor", "middle")
        .text("% Adapter");

    for (var i = 0; i < keys.length; i++) {

        var lineGen = d3.svg.line()
            .x(function (d) {
                return xScale(d.position);
            })
            .y(function (d) {
                var index = i;
                return yScale(d[index]);
            });

        vis.append("path")
            .attr("d", lineGen(parameters))
            .attr("stroke", colors[i])
            .attr("stroke-width", 2)
            .attr("fill", "none");
    }

    vis.append("svg:g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + 500 + ")")
        .call(xAxis);

    vis.append("svg:g")
        .attr("class", "axis")
        .attr("transform", "translate(" + 4 + "0)")
        .call(yAxis);

}

function kmerContent(content) {
    document.getElementById("twelve").innerHTML = "";
    var image = content[0];
    content = content.slice(2);


    var pic = document.createElement("img");
    pic.src = singleFileImages[image];
    pic.width = 30, pic.height = 30;
    var modTitle = document.createTextNode(" Kmer Content");
    document.getElementById("twelve").appendChild(pic);
    document.getElementById("twelve").appendChild(modTitle);


    var parameters = [];
    for (var i = 0; i < content.length; i++) {
        content[i] = content[i].replace(/\s+/g, " ");
        parameters[i] = {
            Sequence: content[i].split(" ")[0],
            Count: content[i].split(" ")[1],
            PValue: content[i].split(" ")[2],
            'Obs/Exp Max': content[i].split(" ")[3],
            'Max Obs/Exp Position': content[i].split(" ")[4]
        };
    }
    tabulate(parameters, ["Sequence", "Count", "PValue", "Obs/Exp Max",
        "Max Obs/Exp Position"], "#container12");
}

function tabulate(data, columns, divID) {

    d3.select(divID).select("table").remove();

    var table = d3.select(divID).append("table"),
        thead = table.append("thead"),
        tbody = table.append("tbody");

    // append the header row
    thead.append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
        .text(function (column) {
            return column;
        });
    // create a row for each object in the data
    var rows = tbody.selectAll("tr")
        .data(data)
        .enter()
        .append("tr");
    // create a cell in each row for each column
    var cells = rows.selectAll("td")
        .data(function (row) {
            return columns.map(function (column) {
                return {column: column, value: row[column]};
            });
        })
        .enter()
        .append("td")
        .text(function (d) {
            return d.value;
        });

    return table;
}

Array.prototype.contains = function (v) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === v)
            return true;
    }
    return false;
};
Array.prototype.unique = function () {
    var arr = [];
    for (var i = 0; i < this.length; i++) {
        if (!arr.contains(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr;
};
