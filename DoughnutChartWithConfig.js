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
var pie = null;
var svg = null;
var path = null;

var addButton = null;
var subButton = null;
var config = null;

function changedoughnuthole(delta) {
    config.holesize = Number ( config.holesize ) + delta;
    config.holesize = Math.min(config.holesize, 95);
    config.holesize = Math.max(config.holesize, 5);
    log ( "holesize: " + config.holesize );
    setConfig ( config );
}

function archLengthAccessor(dataRow) {
    return dataRow.items[0]; // Use first cell of a row as the arch size
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
// Main Drawing Method
//

function renderCore(sfdata) {

    if (resizing) {
        return;
    }
	
    if ( null == addButton )
    {
        addButton = document.createElement("input");
        addButton.type = "button";
        addButton.value = "Increase Doughnut Hole";
        addButton.name = "add_button";
        addButton.onclick=function(){changedoughnuthole(+5);};
        $("#js_chart").append(addButton);
    }

    if ( null == subButton )
    {
        subButton = document.createElement("input");
        subButton.type = "button";
        subButton.value = "Decrease Doughnut Hole";
        subButton.name = "sub_button";
        subButton.onclick=function(){changedoughnuthole(-5);};
        $("#js_chart").append(subButton);
    }
	
    config = sfdata.config;
    log ( "holesize: " + sfdata.config.holesize );

    // Log entering renderCore
    log ( "Entering renderCore" );
	
    // Extract the columns
    var columns = sfdata.columns;

    // Extract the data array section
    var chartdata = sfdata.data;

    // count the marked rows in the data set, needed later for marking rendering logic
    var markedRows = 0;
    for (var i = 0; i < chartdata.length; i++) {
        if (chartdata[i].hints.marked) {
            markedRows = markedRows + 1;
        }
    }

    // Check if color scheme is set up yet
    if (!color) {
        color = d3.scale.category20();
    }

    // Check if pie object is set up yet
    if (!pie) {
        pie = d3.layout.pie()
        .value(archLengthAccessor) // Tell the pie chart how to extract the arch length value from a data row
        .sort(null);
    }
  
    var width = window.innerWidth;
    var height = window.innerHeight - 10; // Crudely account for button height
    var radius = Math.min(width, height) / 2;

    var arc = d3.svg.arc()
        .innerRadius((radius - 20) * config.holesize/100.0)
        .outerRadius(radius - 20);

    if (!svg) {
        var g = d3.select("#js_chart").append("svg") // Append the svg object and center it on the div
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        svg = d3.select("svg");
    }

    if (!path) {
        var g = svg.select("g");
        //
        // Add arc slices to enable per arch labels
        //
        var arcs = g.selectAll("g.slice") // This selects all <g> elements with class slice (there aren't any yet)
            .data(pie(chartdata))            // Associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties)
            .enter()                      // This will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
            .append("svg:g")              // Create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
            .attr("class", "slice");      // Allow us to style things in the slices (like text)
        
        path = arcs; // Arcs collection

        arcs.append("svg:path") // create the arcs based on the pie data
            .attr("fill", function (d, i) { return color(i); }) // Set the color for each slice to be chosen from the color function defined above
            .attr("d", arc) // This creates the actual SVG path using the associated data (pie) with the arc drawing function
            .attr("opacity", function (d, i) { //Spotfire 5.5 style fading marking coloring
                if (markedRows != chartdata.length && !chartdata[i].hints.marked && markedRows != 0) {
                    return (0.3);
                }
                else {
                    return (1);
                }
            })
            .attr("id", function (d, i) { return (chartdata[i].hints.index); }) // store the index as id for use in marking logic
            .on("mousedown", function () { return; })
            .each(function (d) { this._current = d; });   // store the initial values 

        arcs.append("svg:text") //add a label to each slice
            .attr("transform", function (d) { //set the label's origin to the center of the arc
                // we have to make sure to set these before calling arc.centroid
                d.innerRadius = ((radius - 20) * config.holesize/100.0);
                d.outerRadius = (radius - 20);
                return "translate(" + arc.centroid(d) + ")"; 
            })
            .attr("text-anchor", "middle") 
            .attr("pointer-events", "none")
            .text(function (d, i) {
                return chartdata[i].items[1];  // link back to chartdata for labels
            }); 
    }
    else {
        // If we already have generated the above objects, reshape them as nessecary as required with the renewed data object
        var g = svg.select("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var arcs = g.selectAll("g.slice");
        arcs.remove();

        arcs = g.selectAll("g.slice") 
            .data(pie(chartdata)) 
            .enter() 
            .append("svg:g") 
            .attr("class", "slice"); 

        arcs.append("svg:path")
            .attr("fill", function (d, i) { return color(i); }) 
            .attr("d", arc) 
            .attr("opacity", function (d, i) {
                if (markedRows != chartdata.length && !chartdata[i].hints.marked && markedRows != 0) {
                    return (0.3);
                }
                else {
                    return (1);
                }
            })
            .attr("id", function (d, i) { return (chartdata[i].hints.index); })
            .on("mousedown", function () { return; })
            .each(function (d) { this._current = d; });   // Store the initial values   

        arcs.append("svg:text") // Add a label to each slice
            .attr("transform", function (d) { // Set the label's origin to the center of the arc
                d.innerRadius = ((radius - 20) * config.holesize/100.0);
                d.outerRadius = (radius - 20);
                return "translate(" + arc.centroid(d) + ")"; // This gives us a pair of coordinates like [50, 50]
            })
            .attr("text-anchor", "middle") //center the text on it's origin
            .attr("pointer-events", "none")
            .text(function (d, i) {
                    return chartdata[i].items[1]; 
            }); // Get the label from our original data array
    }

    wait ( sfdata.wait, sfdata.static );
}


// 
// #endregion Drawing Code
//////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// #region Marking Code
//

//
// This method receives the marking mode and marking rectangle coordinates
// on mouse-up when drawing a marking rectangle
//
function markModel(markMode, rectangle) {

    if (svg) {
        // No point in continuing if we don't have an svg object
        // Start collecting indexes of svg objects marked.
        var indicesToMark = [];
        var markData = {};
        markData.markMode = markMode;


        svgElem = svg[0][0];
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
        
        markIndices ( markData );
    }
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
        svg = d3.select("svg");
        if (svg) {
            if (fetchedFirstPlotData) {
                // Just make sure we have something to show
                var width = window.innerWidth;
                var height = window.innerHeight - 10; // Crudely account for button height
                var radius = Math.min(width, height) / 2;

                var arc = d3.svg.arc()
                    .innerRadius((radius - 20) * config.holesize/100.0)
                    .outerRadius(radius - 20);


                svg.attr("width", width)
                   .attr("height", height)

                var g = svg.select("g")
                    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

                var path = svg.selectAll("path")
                    .transition()
                    .duration(300)
                      .attr("d", arc)
                      .each(function (d) { this._current = d; });

                // Reposition the labels
                var arcs = g.selectAll("g.slice");
                arcs.selectAll("text") //add a label to each slice
                        .attr("transform", function (d) { //set the label's origin to the center of the arc
                            //we have to make sure to set these before calling arc.centroid
                            d.innerRadius = ((radius - 20) * config.holesize/100.0);
                            d.outerRadius = (radius - 20);
                            return "translate(" + arc.centroid(d) + ")"; //this gives us a pair of coordinates like [50, 50]
                        });

            }
        }
    }
    resizing = false;
}

// 
// #endregion Resizing Code
//////////////////////////////////////////////////////////////////////////////
