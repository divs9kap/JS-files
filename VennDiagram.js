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

//
// Globals
//

//
// Indicates whether visualization  has previously been rendered.
// This controls whether the visualization will transition to new
// values or redraw from scratch.
//
var redraw = false;

//
// Indicates whether plot data has been fetched.
//
var fetchedFirstPlotData = false;

//
// Current value of Venn Diagram data - used for resizing
//
var sets = null;

//
// Code
//

//
// Main visualization function.
// Draws the Visualization based on the data supplied and the current window size
//
function renderCore(sfdata) {

    if (resizing) {
        return;
    }

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

    var width = window.innerWidth * 0.9;
    var height = window.innerHeight * 0.9;
    
    var ValA = chartdata[0].items[0];
    var ValB = chartdata[0].items[1];
    var ValC = chartdata[0].items[2];
    
    var IntersectAB = chartdata[0].items[3];
    var IntersectBC = chartdata[0].items[4];
    var IntersectAC = chartdata[0].items[5];

    var IntersectABC = chartdata[0].items[6];
    
    // define sets and set set intersections
    sets = [{label: "A", size: ValA}, {label: "B", size: ValB}, {label: "C", size: ValC}],
    overlaps = [{sets: [0,1], size: IntersectAB},{sets: [1,2], size: IntersectBC},{sets: [0,2], size: IntersectAC},{sets: [0,1,2], size: IntersectABC}];

    // get positions for each set
    sets = venn.venn(sets, overlaps);

    selectedNode = document.getElementById('js_chart');

    if (redraw) {
        venn.updateD3Diagram(d3.select(selectedNode), sets);
    }
    else {
        venn.drawD3Diagram(d3.select(selectedNode), sets, width, height);

        redraw = true;
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
}

// 
// #endregion Marking Code
//////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// #region Resizing Code
//

//
// Indicates whether a resizing operation is in progress.
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
                // Calculate the new Venn Diagram size
                //
                var width = window.innerWidth * 0.9;
                var height = window.innerHeight * 0.9;
                //
                // Delete the existing Venn Diagram
                //
                d3.select("svg").remove();
                //
                // Draw the new Venn Diagram using the cached data
                //
                venn.drawD3Diagram(d3.select(document.getElementById('js_chart')), sets, width, height);
            }
        }
    }
    resizing = false;
}




// 
// #endregion Resizing Code
//////////////////////////////////////////////////////////////////////////////
