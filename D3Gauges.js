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

var gauges = [];

function dictSize (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
}

function createGauge(name, label, size, min, max)
{
	var config = 
	{
		size: size,
		label: label,
		min: undefined != min ? min : 0,
		max: undefined != max ? max : 100,
		minorTicks: 5
	}
	
	var range = config.max - config.min;
	config.yellowZones = [{ from: config.min + range*0.75, to: config.min + range*0.9 }];
	config.redZones = [{ from: config.min + range*0.9, to: config.max }];
	
	gauges[name] = new Gauge(name, config);
	gauges[name].render();
}


function updateGauges()
{
	for (var key in gauges)
	{
		var value = getRandomValue(gauges[key])
		gauges[key].redraw(value);
	}
}

//
// Main Drawing Method
//

function renderCore(sfdata){

    if (resizing) {
        return;
    }

    // Extract the columns
    var columns = sfdata.columns;

    // Extract the data array section
    var chartdata = sfdata.data;

    // Extract the config params section
    var config = sfdata.config;
	
	var gaugesize = undefined != config.gaugesize ? config.gaugesize : 50;
	
	var idx;

	for (idx = 0; idx < columns.length; idx+=2){
		//
		// Assume the data set contains pairs of data.
		// First the value then the max value for each set
		//
		if ( (( idx + 2 )) > chartdata[0].items.length ) break;

		var column = columns[idx];
		var colmaxval = chartdata[0].items[idx+1];

		var divId = "_gauge" + [idx];
		// Create a nested div if we don't have one
		if (!gauges[divId]) {
			if (!($(divId).length > 0))
			{
				$('#js_chart').append('<DIV id="' + divId + '" style="float:left"></DIV>');
				createGauge(divId, column, gaugesize, 0, colmaxval);
			}
			
		}
		// Redraw if the column or size has changed
		if ((gauges[divId].config.label != column) || (gauges[divId].config.size != gaugesize) )
		{
			var div = d3.select("#" + divId);
			div.selectAll("svg").remove();
			createGauge(divId, column, gaugesize, 0, colmaxval);
		}
		// Update with the actual data
		if (chartdata.length > 0 && chartdata[0].items[idx])
		{
			gauges[divId].redraw(chartdata[0].items[idx]);
		}
	}

	// Remove any empty divs
	var totnum = dictSize(gauges);
	for (n = idx; n < totnum; n++)
	{
		divId = "_gauge" + n
		d3.select("#" + divId).remove();
		gauges[divId] = null;
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
    // No resizing logic for now
}

// 
// #endregion Resizing Code
//////////////////////////////////////////////////////////////////////////////



