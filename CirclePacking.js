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

var diameter = null;
var format = null;
var pack = null;
var simplifiedTree = null;

function drawChart( diameter )
{
    format = d3.format(",d");

    pack = d3.layout.pack()
        .size([diameter - 4, diameter - 4])
        .value(function(d) { return d.Bytes; });

    mysvg = d3.select("#js_chart").append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .append("g")
        .attr("transform", "translate(2,2)");

    var node = mysvg.datum(simplifiedTree).selectAll(".node")
        .data(pack.nodes)
        .enter().append("g")
        .attr("class", function(d) { return d.children ? "node" : "leaf node"; })
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    node.append("title")
        .text(function(d) { return d.Path + ": " + format(d.Bytes) + " Bytes"; });

    node.append("circle")
        .attr("r", function(d) { return d.r; });
            
    node.filter(function(d) { return !d.children; }).append("text")
        .attr("dy", ".3em")
        .style("text-anchor", "middle")
        .text(function(d) { return d.Path.substring(0, d.r / 3); });
}

d3.select(self.frameElement).style("height", diameter + "px");

//
// Main Drawing Method
//

function renderCore(sfdata) 
{
    if (resizing) {
        return;
    }

    // Extract the columns
    var columns = sfdata.columns;

    // Extract the data array section
    var chartdata = sfdata.data;

    // count the marked rows in the data set, needed later for marking rendering logic
    var markedRows = 0;
    for (var i = 0; i < chartdata.length; i++) 
    {
        if (chartdata[i].hints.marked) 
        {
            markedRows = markedRows + 1;
        }
    }

    var width = window.innerWidth;
    var height = window.innerHeight;
    var diameter = Math.min(width, height) * 0.98;

    var parsedData = new Array ();
    
    for ( var nIndex = 0 ; nIndex < chartdata.length ; nIndex++ )
    {
        var currentItem = chartdata[nIndex];
        
        if ( ( currentItem != null ) && ( currentItem.items != null ) )
        {
            var newItem = new Object;
        
            newItem['Path']       = currentItem.items[0];
            newItem['Type']       = currentItem.items[1];
            newItem['Bytes']      = currentItem.items[2];
            newItem['Parent']     = currentItem.items[3];
            newItem['Created']    = currentItem.items[4];
            newItem['CreatedBy']  = currentItem.items[5];
            newItem['Modified']   = currentItem.items[6];
            newItem['ModifiedBy'] = currentItem.items[7];
            
            parsedData[nIndex] = newItem;
        }
    }

    var tree = DataStructures.Tree.createFromFlatTable(parsedData);

    simplifiedTree = tree.toSimpleObject(function(objectToDecorate, originalNode) {
        objectToDecorate.Bytes = originalNode.Bytes;

        if (objectToDecorate.children && objectToDecorate.children.length == 0) {
            delete objectToDecorate.children;
        }

        return objectToDecorate;
    });
    //
    // Delete the existing Diagram
    //
    d3.select("svg").remove();

    drawChart ( diameter );

    wait ( sfdata.wait, sfdata.static );
}

// 
// #endregion Drawing Code
//////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// #region Resizing Code
//

var resizing = false;

window.onresize = function (event) {
    resizing = true;
    //
    // Confirm that the js_chart div exists AND the svg element exists AND we have plotted data previously
    //
    if ($("#js_chart")) {
        svg = d3.select("svg");
        if (svg) {
            if (fetchedFirstPlotData) {
                //
                // Calculate the new Diagram size
                //
                var width = window.innerWidth;
                var height = window.innerHeight;
                var diameter = Math.min(width, height) * 0.98;
                //
                // Delete the existing Diagram
                //
                d3.select("svg").remove();
                //
                // Draw the new Diagram using the cached data
                //
                drawChart ( diameter );;
            }
        }
    }
    resizing = false;
}

// 
// #endregion Resizing Code
//////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// #region Marking Code
//

function mark(event)
{    
    return false;
}

// Send marked area to Server or Pro Client.
function markModel(markMode, rectangle) {
}

// 
// #endregion Marking Code
//////////////////////////////////////////////////////////////////////////////
