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
var chart = null;
var svg = null;

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
    for (var i = 0; i < chartdata.length; i++) {
        if (chartdata[i].hints.marked) {
            markedRows = markedRows + 1;
        }
    }
    //
    // Assume trellis variable at first column
    //
    var trellis = [];
    var trellisCount = 0;

    for (var t = 0; t < chartdata.length; t++) {
        if (chartdata[0]) 
        {
            var trellisVar = String(chartdata[t].items[0]);
            if (!trellis[trellisVar])
            {
                trellis[trellisVar] = [];
                trellisCount++;

                for (var u = 0; u < chartdata[t].items.length; u++)
                {
                    var anonArr = [];
                    trellis[trellisVar].push(anonArr);
                }
            }
        }
    }

    var years = [];
    var months = [];
    var rate = [];

    for (var i = 0; i < chartdata.length; i++) {
        var trellisVar = String(chartdata[i].items[0]);

        if (chartdata[0]) {
            //years[i] = chartdata[i].items[0];
            trellis[trellisVar][0].push(chartdata[i].items[0]);
        }

        if (chartdata[1]) {
            //months[i] = chartdata[i].items[1];
            trellis[trellisVar][1].push(chartdata[i].items[1]);
        }

        if (chartdata[2]) {
            rate[i] = chartdata[i].items[2];
            trellis[trellisVar][2].push(chartdata[i].items[2]);
        }
    }

    // Check if color scheme is set up yet
    if (!color) {
        color = d3.scale.category20();
    }

    var width = window.innerWidth;
    var height = window.innerHeight;

    var hMode = sfdata.config.mode.toLowerCase();  // The display mode of the Horizon Chart - "mirror" or "offset"
    var hInterpolate = sfdata.config.interpolate.toLowerCase(); // Interpolation mode of the Horizon Chart "linear", "basis", "monotone", "step-after" etc
    var hBands = sfdata.config.bands; // The number of overlapping bands on the Horizon Chart

    //
    // Calculate the mean of the data set.  We will then plot the deviation from mean, 
    // offset so that positive is above-mean and negative is below-mean.
    //
    var mean = rate.reduce(function(p, v) { return p + v; }, 0) / rate.length;
    //
    // Find the maximum positive or negative deviation from mean so as to scale all charts equally
    //
    var ymax = rate.reduce ( 
        function ( previous, current ) 
        {
            if ( ( current - mean ) > previous ) return ( current - mean );
            if ( ( -current - mean ) > previous ) return ( -current - mean );
            return previous;
        }, 0);

    // Dirty reset for quick demo code only
    if (chart)
    {
        chart = null;
    }

    if (!chart) {
        chart = [];
        for (var trellisName in trellis)
        {
            chart.push(d3.horizon()
                .width(width)
                .height(height / trellisCount)
                .bands(hBands)
                .mode(hMode)  // mirror or offset
                .interpolate(hInterpolate) // basis, linear etc
                .yscale(ymax)); // Scale each chart the same
        }
    }

    // Dirty reset for demo code only
    if(svg)
    {
        var div = d3.select("#js_chart").selectAll("div").remove();
        svg = null;
    }

    if (!svg) {
        svg = [];
        var idx = 0;
        for (var trellisName in trellis)
        {
            var divHeight =Math.round(height / trellisCount);
            var div = d3.select("#js_chart").append("div").attr('id', "trellis" + String(idx));
            div[0][0].style.position = "absolute";
            div[0][0].style.left = "100px";
            div[0][0].style.top = String((divHeight  * idx) - 5) + "px";
            
            var divlable = d3.select("#js_chart").append("div").attr('id', "label" + String(idx));
            divlable[0][0].style.position = "absolute";
            divlable[0][0].style.left = "10px";
            divlable[0][0].style.top = String(Math.round(divHeight  * idx + divHeight * 0.35)) + "px"; // yay for magic numbers
            divlable[0][0].textContent=trellisName;
            
            var svgObj = div.append("svg")
                .attr("width", width)
                .attr("height", height / trellisCount - 5); //yey for magic numbers
            svg.push(svgObj);
            idx++;
        }
    }
    
    var trellisIndex = -1;
    for (var trellisName in trellis)
    {
    
        trellisIndex++;
        var data2 = {};
        data2.month = trellis[trellisName][1];
        data2.year = trellis[trellisName][0];
        data2.rate = trellis[trellisName][2];
    
        // Transpose column values to rows.
        var data3 = data2.rate.map(function(rate, i) {
            return [Date.UTC(data2.year[i], data2.month[i] - 1), rate - mean];
            //return [Date.UTC(trellis[trellisName][0][i], trellis[trellisName][1][i] - 1), rate - mean];
        });

        // Render the chart.
        svg[trellisIndex].data([data3]).call(chart[trellisIndex]);

        /*
        // Enable mode buttons.
        d3.selectAll("#horizon-controls input[name=mode]").on("change", function() {
            svg.call(chart.duration(0).mode(this.value));
        });

        // Enable bands buttons.
        d3.selectAll("#horizon-bands button").data([-1, 1]).on("click", function(d) {
         var n = Math.max(1, chart.bands() + d);
        d3.select("#horizon-bands-value").text(n);
        svg.call(chart.duration(1000).bands(n).height(height / n));
        });
        */
    }

    wait ( sfdata.wait, sfdata.static );
}

// 
// #endregion Drawing Code
//////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// #region Marking Code
//

// Mark an area.
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
                var height = window.innerHeight;

                svg.attr("width", width)
                   .attr("height", height)
            }
        }
    }
    resizing = false;
}

// 
// #endregion Resizing Code
//////////////////////////////////////////////////////////////////////////////
