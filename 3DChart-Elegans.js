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

//
// Main Drawing Method
//

function renderCore(sfdata)
{
    if (resizing) {
        return;
    }

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

    var width = window.innerWidth;
    var height = window.innerHeight;
    //
    // Extract the Config section
    //
    var myConfig = sfdata.config;

	var chartdata3d = new Object();

    var options = new Object();
     
    options.width  = width;
    options.height = height;
    options.world_width  = width;
    options.world_height = height;

    options.has_legend = false;

	if ( !myConfig || !myConfig.charttype || myConfig.charttype == "line" )
	{
		var x_arr = [], y_arr = [], z_arr = [];

		for(var i = 0 ; i < chartdata.length ; i++ )
		{
			var currentItem = chartdata[i];

			x_arr.push(currentItem.items[1]);
			y_arr.push(currentItem.items[2]);
			z_arr.push(currentItem.items[3]);
		}

		chartdata3d = {x:x_arr, y:y_arr, z:z_arr};

		var stage = new Elegans.Stage(d3.select("#js_chart")[0][0], options);
		var surface = new Elegans.Line(chartdata3d,options);

		stage.add(surface);
		stage.render();
	}
	else if ( myConfig.charttype == "wave" )
	{
		chartdata3d.x = [], chartdata3d.y = [], chartdata3d.z = [];
		for ( var i = 0 ; i < 41 ; i++ )
		{
			chartdata3d.x.push([]);
			chartdata3d.y.push([]);
			chartdata3d.z.push([]);

			for ( var j = 0 ; j < 41 ; j++ )
			{
				var nIndex = 41 * i + j;

				chartdata3d.x[i][j] = chartdata[nIndex].items[0];
				chartdata3d.y[i][j] = chartdata[nIndex].items[1];
				chartdata3d.z[i][j] = chartdata[nIndex].items[2];
			}
		}

		var stage = new Elegans.Stage(d3.select("#js_chart")[0][0], options);
		var surface = new Elegans.Surface(chartdata3d,options);

		stage.add(surface);
		stage.render();

	}

    wait(sfdata.wait, sfdata.static)
}

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

//////////////////////////////////////////////////////////////////////////////
// #region Marking Code
//

function mark(event)
{
}

// 
// #endregion Marking Code
//////////////////////////////////////////////////////////////////////////////
