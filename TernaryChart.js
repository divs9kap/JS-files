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

var svg;      // The global svg object reference
var corners;  // The global array of corner vertices

var color = null;
var pie = null;
var svg = null;
var path = null;

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

    var width = window.innerWidth - 5;
    var height = window.innerHeight - 5;
 
    if (!svg) 
    {
        svg = d3.select("#js_chart").append("svg")
          .attr("width", 400) /* width */
          .attr("height", 400) /* height */

        var w = 300;
        var h = 260;
        var m = 20;

        corners = [[m,h+m], [w+m,h+m], [(w/2)+m,m]]

        corners.forEach(function(corner, idx) 
        {
            var c1 = idx, c2 = idx + 1; if(c2 >= corners.length) { c2 = 0;}
            svg.append("line")
              .attr("x1", corners[c1][0])
              .attr("y1", corners[c1][1])
              .attr("x2", corners[c2][0])
              .attr("y2", corners[c2][1])
              .classed('axis', true);
        })

        var ticks = [0,20,40,60,80,100], n = ticks.length;

        ticks.forEach(function(v) 
        {
            var coord1 = coord(v, 0, 100-v);
            var coord2 = coord(v, 100-v, 0);
            var coord3 = coord(0, 100-v, v);
            var coord4 = coord(100-v, 0, v);

            if(v !== 0 && v !== 100) 
            {
                svg.append("line")
                  .attr("x1", coord1[0])
                  .attr("y1", coord1[1])
                  .attr("x2", coord2[0])
                  .attr("y2", coord2[1])
                  .classed('tick tick-a', true);

                svg.append("line")
                  .attr("x1", coord2[0])
                  .attr("y1", coord2[1])
                  .attr("x2", coord3[0])
                  .attr("y2", coord3[1])
                  .classed('tick tick-b', true);

                svg.append("line")
                  .attr("x1", coord3[0])
                  .attr("y1", coord3[1])
                  .attr("x2", coord4[0])
                  .attr("y2", coord4[1])
                  .classed('tick tick-c', true);
            }

            svg.append("text")
              .attr("x", coord1[0] - 15)
              .attr("y", coord1[1] )
              .text( function (d) { return v; })
              .classed('tick-text tick-a', true);

            svg.append("text")
              .attr("x", coord2[0] - 6)
              .attr("y", coord2[1] + 10 )
              .text( function (d) { return (100- v); })
              .classed('tick-text tick-b', true);

            svg.append("text")
              .attr("x", coord3[0] + 6)
              .attr("y", coord3[1] )
              .text( function (d) { return v; })
              .classed('tick-text tick-c', true);
        })
    }

    var coords = new Array();

    for ( var nIndex = 0 ; nIndex < chartdata.length ; nIndex++ )
    {
        coords[nIndex] = coord(Number(chartdata[nIndex]['items'][0]), Number(chartdata[nIndex]['items'][1]), Number(chartdata[nIndex]['items'][2]) );
    }

    svg.selectAll("circle").remove();

    var circles = svg.selectAll("circle").data(coords);

    circles.enter().append("circle")
      .attr("cx", function (d) { return d[0]; })
      .attr("cy", function (d) { return d[1]; })
      .attr("r", 6);

    function coord(a, b, c)
    {
        var sum, pos = [0,0];

        sum = a + b + c;

        if(sum !== 0) 
        {
            a /= sum;
            b /= sum;
            c /= sum;
 
            pos[0] = corners[0][0] * a + corners[1][0] * b + corners[2][0] * c;
            pos[1] = corners[0][1] * a + corners[1][1] * b + corners[2][1] * c;
        }

        return pos;
    }

    function scale(/* point */ p, factor) 
    {
        return [p[0] * factor, p[1] * factor];
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

var resizing = false;

window.onresize = function (event) {
    resizing = true;
    if ($("#js_chart")) {
    }
    resizing = false;
}

// 
// #endregion Resizing Code
//////////////////////////////////////////////////////////////////////////////
