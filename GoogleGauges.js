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

google.load('visualization', '1', {packages:['gauge']});

var _gauges  = [];
var _options = [];

function setOptions(name, size, min, max)
{
    var options = {
        width: size,
        height: size,
        min: undefined != min ? min : 0,
        max: undefined != max ? max : 100,
        redFrom: 450, 
        redTo: 500,
        yellowFrom:350, 
        yellowTo: 450,
        minorTicks: 10
    };

	var range = options.max - options.min;

    options.yellowFrom = options.min + range * 0.75;
    options.yellowTo   = options.min + range * 0.9;
    options.redFrom    = options.min + range * 0.9;
    options.redTo      = options.max;

    _options[name] = options;
}

function createGauge(name, size, min, max)
{
    setOptions ( name, size, min, max );

    _gauges[name]  = new google.visualization.Gauge(document.getElementById(name));
}

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

    // Extract the config params section
    var config = sfdata.config;
	
	var gaugesize = undefined != config.gaugesize ? config.gaugesize : 50;

	for (idx = 0; idx < columns.length; idx+=2){
		//
		// Assume the data set contains pairs of data.
		// First the value then the max value for each set
		//
		if ( (( idx + 2 )) > chartdata[0].items.length ) break;

		var colname   = columns[idx];
		var colmaxval = chartdata[0].items[idx+1];

		var divId = "_gauge" + [idx];
        //
		// Create a nested div if we don't have one
		//
		if (!_gauges[divId]) {
			if (!($(divId).length > 0))
			{
				$('#js_chart').append('<DIV id="' + divId + '" style="float:left"></DIV>');
				createGauge(divId, gaugesize, 0, colmaxval);
			}			
		}
		//
		// Call setOptions in case range had changed since gauge was created
		//
		setOptions ( divId, gaugesize, 0, colmaxval);
		//
		// Format value to 2 decimal places
		//
		var dataval = Math.round ( chartdata[0].items[idx] * 100.0 ) / 100.0;

        var gaugedata = google.visualization.arrayToDataTable([
          ['Label', 'Value'],
          [colname, dataval]
        ]);

        _gauges[divId].draw(gaugedata, _options[divId]);
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
    }
    resizing = false;
}

// 
// #endregion Resizing Code
//////////////////////////////////////////////////////////////////////////////
