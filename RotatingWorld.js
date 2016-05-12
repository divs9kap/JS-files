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

var globe = null;
var timer_retval = false;
var velocity;
var projection;
var canvas;
var path;
var land;
var then;
var diameter;
var radius;

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

    if ( globe == null )
    {
        setupGlobe();
    } // if globe

    wait ( sfdata.wait, sfdata.static );
}

function setupGlobe()
{
    var width = window.innerWidth - 5;
    var height = window.innerHeight - 5;

    diameter = Math.min ( width, height );
    radius = diameter/2;

    velocity = .01;
    then = Date.now();

    projection = d3.geo.orthographic()
        .scale(radius - 2)
        .translate([radius, radius])
        .clipAngle(90);

    canvas = d3.select("#js_chart").append("canvas")
        .attr("width", diameter)
        .attr("height", diameter);

    path = d3.geo.path()
        .projection(projection);

    land = topojson.object(world110mObject, world110mObject.objects.land);

    globe = {type: "Sphere"};

    d3.timer(timerFn); // d3.timer
}

function timerFn() 
{
    var angle = velocity * (Date.now() - then);
    projection.rotate([angle,0,0]);

    context = canvas.node().getContext("2d");
    context.clearRect(0, 0, diameter, diameter);

    context.strokeStyle = '#766951';

    context.fillStyle = '#d8ffff';
    context.beginPath(), path.context(context)(globe), context.fill();
    context.beginPath(), path.context(context)(globe), context.stroke();

    context.fillStyle = '#d7c7ad';
    context.beginPath(), path.context(context)(land), context.fill();
    context.beginPath(), path.context(context)(land), context.stroke();

    return timer_retval;
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
        //
        // Stop the existing timer
        //
        timer_retval = true;

        var width = window.innerWidth;
        var height = window.innerHeight;

        diameter = Math.min ( width, height );
        radius = diameter/2;

        d3.select("canvas").remove();
        //
        // Wait for 1/4 second then setup new globe
        //
        setTimeout ( function(){ timer_retval = false; setupGlobe(); }, 250 );

    }
    resizing = false;
}

// 
// #endregion Resizing Code
//////////////////////////////////////////////////////////////////////////////
