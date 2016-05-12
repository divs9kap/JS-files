/*
 Copyright (c) 2016 TIBCO Software Inc

 THIS SOFTWARE IS PROVIDED BY TIBCO SOFTWARE INC. ''AS IS'' AND ANY EXPRESS OR
 IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT 
 SHALL TIBCO SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, 
 EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, 
 OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

//////////////////////////////////////////////////////////////////////////////
// #region Drawing Code
//

var color = null;

var pies = [];
var svgs = [];
var paths = [];
var tableCount = 0;

function dictSize(obj) {
    "use strict";
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            size = size + 1;
        }
    }
    return size;
}

function archLengthAccessor(dataRow) {
    return dataRow.items[0]; // Use first cell of a row as the arch size
}


//
// Main Drawing Method
//

function renderCore(sfdata) {

	var pieIndex;
    var dataIndex;	
    
	if (resizing) {
        return;
    }
    //
    // Check if the color scheme is set up yet
    //
    if (!color) {
        color = d3.scale.category20();
    }
    
    var allData = [];
    
    if (sfdata.additionalTables)
    {
        var addTabs = sfdata.additionalTables;
        sfdata.additionalTables = null;
        allData.push(sfdata);
        allData = allData.concat(addTabs);
    }
    else
    {
        allData.push(sfdata);
    }
        
    var width = Math.floor(window.innerWidth / allData.length),
	    height = Math.floor(window.innerHeight),
		radius = Math.min(width, height) / 2,
		divId ="";
		
    for (pieIndex = 0; pieIndex < allData.length; pieIndex++)
    {
        divId ='js_pie' + pieIndex;
        if (($(divId).length <= 0))
        {
            //
            // Create a DIV tag within js_chart DIV for this gauge control
            //
            $('#js_chart').append('<DIV id="' + divId + '" style="float:left"></DIV>');
        }
    }
    
    // To know which marking to use where
    tableCount = allData.length;
    var columns;
	var myData;
	var myDataSettingName;
	var markedRows;
	var i;
	
    for (dataIndex = 0; dataIndex < allData.length; dataIndex++)
    {
        // Extract the columns
        columns = allData[dataIndex].columns;

        // Extract the data array section
        myData = allData[dataIndex].data;
        myDataSettingName = "";
        
        if (allData.length > 1)
        { // Do multi setting marking
            myDataSettingName = allData[dataIndex].baseTableHints.settingName + ":";
        }
        

        // count the marked rows in the data set, needed later for marking rendering logic
        markedRows = 0;
        for (i = 0; i < myData.length; i++) {
            if (myData[i].hints.marked) {
                markedRows = markedRows + 1;
            }
        }
        
        // Check if pie object is set up yet
        if (!pies[allData[dataIndex].baseTableHints.settingName]) {
            pies[allData[dataIndex].baseTableHints.settingName] = d3.layout.pie()
                                                            .value(archLengthAccessor) // Tell the pie chart how to extract the arch length value from a data row
                                                            .sort(null);
        }
            
        var arc = d3.svg.arc()
                .innerRadius(radius - (radius * 0.3))
                .outerRadius(radius - (radius * 0.1));

        if(!svgs[allData[dataIndex].baseTableHints.settingName])
        {
            //var divLength = $("#js_pie0").length;
            var g = d3.select("#js_pie" + dataIndex).append("svg") // Append the svg object and center it on the div
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            //svg = d3.select("svg");
            svgs[allData[dataIndex].baseTableHints.settingName] = d3.select("#js_pie" + dataIndex).select("svg");

        }

        if (!paths[allData[dataIndex].baseTableHints.settingName]) {
            var pie = pies[allData[dataIndex].baseTableHints.settingName];
            //var g = svg.select("g"); // Add the g object to the svg
            var g = svgs[allData[dataIndex].baseTableHints.settingName].select("g");
            var pie = pies[allData[dataIndex].baseTableHints.settingName];
            var arcs = g.selectAll("g.slice") // Add arc slices to enable per arch labels
                .data(pie(myData)) 
                .enter() 
                .append("svg:g") 
                .attr("class", "slice"); 
            
            paths[allData[dataIndex].baseTableHints.settingName] = arcs; // Arcs collection

            arcs.append("svg:path") // create the arcs based on the pie data
                .attr("fill", function (d, i) { return color(i); }) 
                .attr("d", arc) 
                .attr("opacity", function (d, i) { //Spotfire 5.5 style fading marking coloring
                    if (markedRows != myData.length && !myData[i].hints.marked && markedRows != 0) {
                        return (0.3);
                    }
                    else {
                        return (1);
                    }
                })
                .attr("id", function (d, i) { return (myDataSettingName + myData[i].hints.index); }) // store the index as id for use in marking logic
                .on("mousedown", function () { return; })
                .each(function (d) { this._current = d; });   // store the initial values 

            arcs.append("svg:text") //add a label to each slice
                .attr("transform", function (d) { //set the label's origin to the center of the arc
                    //we have to make sure to set these before calling arc.centroid
                    d.innerRadius = (radius - (radius * 0.5));
                    d.outerRadius = (radius - (radius * 0.2));
                    return "translate(" + arc.centroid(d) + ")"; 
                })
                .attr("text-anchor", "middle") 
                .attr("pointer-events", "none")
                .text(function (d, i) {
                        return myData[i].items[1];  // link back to myData for labels
                    }); 


        }
        else 
        {
            // If we already have generated the above objects, reshape them as nessecary as required with the renewed data object
            //var g = svg.select("g")
            var pie = pies[allData[dataIndex].baseTableHints.settingName];
            var g = svgs[allData[dataIndex].baseTableHints.settingName].select("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            var arcs = g.selectAll("g.slice");
            arcs.remove();

            arcs = g.selectAll("g.slice") 
                .data(pie(myData)) 
                .enter() 
                .append("svg:g")
                .attr("class", "slice"); 

            arcs.append("svg:path")
                .attr("fill", function (d, i) { return color(i); }) 
                .attr("d", arc)
                .attr("opacity", function (d, i) {
                    if (markedRows != myData.length && !myData[i].hints.marked && markedRows != 0) {
                        return (0.3);
                    }
                    else {
                        return (1);
                    }
                })
                .attr("id", function (d, i) { return (myDataSettingName + myData[i].hints.index); })
                .on("mousedown", function () { return; })
                .each(function (d) { this._current = d; });

            arcs.append("svg:text") 
                .attr("transform", function (d) { 
                    d.innerRadius = (radius - 100);
                    d.outerRadius = (radius - 20);
                    return "translate(" + arc.centroid(d) + ")"; 
                })
                .attr("text-anchor", "middle")
                .attr("pointer-events", "none")
                .text(function (d, i) { return myData[i].items[1]; }); 
        }
    }

    wait ( sfdata.wait, sfdata.static );
}

// Store the displayed angles in _current.
// Then, interpolate from _current to the new angles.
// During the transition, _current is updated in-place by d3.interpolate.
function arcTween(a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function (t) {
        return arc(i(t));
    };
}

// 
// #endregion Drawing Code
//////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// #region Marking Code
//

function markModel(markMode, rectangle) {

    if (tableCount > 1)
    {
        return markModel2(markMode, rectangle);
    }

    for (var key in svgs) {
        var svgElem = svgs[key][0][0];
        // No point in continuing if we don't have an svg object
        // Start collecting indexes of svg objects marked.
        var indicesToMark = [];
        var markData = {};
        markData.markMode = markMode;

        var rpos = svgElem.createSVGRect();
        rpos.x = rectangle.x;
        rpos.y = rectangle.y;
        rpos.height = rectangle.height; // + one to get the item under the click
        rpos.width = rectangle.width; // + one to get the item under the click
        var elements = svgElem.getIntersectionList(rpos, svgElem);
        for (var index = 0; index < elements.length; index = index + 1) {
            if (elements[index].id) {
                indicesToMark.push(elements[index].id);
            }
        }

        markData.indexSet = indicesToMark;

        elements = svgElem.getIntersectionList(rpos, svgElem);
        for (var index = 0; index < elements.length; index = index + 1) {
            if (elements[index].id) {
                indicesToMark.push(elements[index].id);
            }
        }

        markIndices ( markData );

        break;        
    }
}

// Send marked area to Server or Pro Client.
function markModel2(markMode, rectangle) {

    // No point in continuing if we don't have an svg object
    // Start collecting indexes of svg objects marked.
    //var indicesToMark = [];
    var indicesToMark2 = {};
    var markData = {};
    var dict = [];
	var keyDict = {};
	
    markData.markMode = markMode;
    for (var key in svgs) {
        var svgElem = svgs[key][0][0];
        var rpos = svgElem.createSVGRect();

        rpos.x = rectangle.x - svgElem.parentNode.offsetLeft;
        rpos.y = rectangle.y - svgElem.parentNode.offsetTop;
        rpos.height = rectangle.height; // + one to get the item under the click
        rpos.width = rectangle.width; // + one to get the item under the click
        var elements = svgElem.getIntersectionList(rpos, svgElem);
        for (var index = 0; index < elements.length; index = index + 1) {
            if (elements[index].id) {
                var parts = elements[index].id.split(":");
                if (!indicesToMark2[parts[0]])
                {
                    indicesToMark2[parts[0]] = [];
                }
                indicesToMark2[parts[0]].push(parts[1]);
            }
        }
        
		
        for (var key in indicesToMark2)
        {
			if (!keyDict[key])
			{
				dict.push({"Key" :key, "Value":indicesToMark2[key]});
			}
			keyDict[key] = true; // only want one copy of markings
        }
    }
    
    markData.indexSetDict = dict;

    markData.indexSet = indicesToMark2;

    markIndices2 ( markData );
}

// 
// #endregion Marking Code
//////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// #region Resizing Code
//

var resizing = false;

window.onresize = function (event) {
    resizing = true;
    if ($("#js_chart")) {
        if (fetchedFirstPlotData) {
            //
            // Chart will be arranged horizontally, given space
            //            
            var width = Math.floor(window.innerWidth / dictSize(svgs));
            var height = Math.floor(window.innerHeight);
            var radius = Math.min(width, height) / 2;

            var arc = d3.svg.arc()
                .innerRadius(radius - (radius * 0.3))
                .outerRadius(radius - (radius * 0.1));

            var lSvgs = d3.selectAll("svg");
            
            lSvgs.attr("width", width)
                .attr("height", height);

            var g = lSvgs.select("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            var path = lSvgs.selectAll("path")
                .transition()
                .duration(300)
                  .attr("d", arc)
                  .each(function (d) { this._current = d; });

            // Reposition the labels
            var arcs = g.selectAll("g.slice");
            arcs.selectAll("text")
                    .transition()
                    .duration(300)            //add a label to each slice
                    .attr("transform", function (d) { //set the label's origin to the center of the arc
                        //we have to make sure to set these before calling arc.centroid
                        d.innerRadius = (radius - 100);
                        d.outerRadius = (radius - 20);
                        return "translate(" + arc.centroid(d) + ")"; //this gives us a pair of coordinates like [50, 50]
                    });
        }
    }
    resizing = false;
};

// 
// #endregion Resizing Code
//////////////////////////////////////////////////////////////////////////////
