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

var chart;      // Global chart object used to determine whether Highcharts has been intialized
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

    var width = window.innerWidth;
    var height = window.innerHeight;
    var radius = Math.min(width, height) / 2;
 
    if ( !chart ) 
    { 
        $('#js_chart').highcharts({

        chart: {
                polar: true,
                type: 'line'
        },

        title: {
                text: 'Budget vs spending',
                x: -80
        },

        pane: {
            size: '80%'
        },

        xAxis: {
            categories: ['Sales', 'Marketing', 'Development', 'Customer Support',
                         'Information Technology', 'Administration'],
            tickmarkPlacement: 'on',
            lineWidth: 0
        },

        yAxis: {
            gridLineInterpolation: 'polygon',
            lineWidth: 0,
            min: 0
        },

        tooltip: {
            shared: true,
            pointFormat: '<span style="color:{series.color}">{series.name}: <b>${point.y:,.0f}</b><br/>'
        },

        legend: {
            align: 'right',
            verticalAlign: 'top',
            y: 100,
            layout: 'vertical'
        }

        });

    }

    chart = $('#js_chart').highcharts();

    for ( var nIndex = 0 ; nIndex < chartdata.length ; nIndex++ )
    {
        var row = chartdata[nIndex];
        
        //
        // Check for an existing chart data series with the current id
        //
        var series = chart.get ( row.items[0] );
        
        if ( series != null )
        {
            //
            // Update the existing series with the new data
            //
            series.update ( {
                data: [ Number(row.items[1]), Number(row.items[2]), Number(row.items[3]), Number(row.items[4]), Number(row.items[5]), Number(row.items[6]) ]
            }, false );
        }
        else
        {
            //
            // Create a new series
            // NB Had to use Number() here.  Strange results otherwise...
            //
            chart.addSeries ( {
                id:   row.items[0],
                name: row.items[0],
                data: [ Number(row.items[1]), Number(row.items[2]), Number(row.items[3]), Number(row.items[4]), Number(row.items[5]), Number(row.items[6]) ]
            }, false );
        }
	
    }

    //
    // Loop through chart data series' and remove any no longer needed
    //
    
    for ( nSeriesIndex = 0 ; nSeriesIndex < chart.series.length ; nSeriesIndex++ )
    {
        var series = chart.series[nSeriesIndex];
        var found  = false;
        
        for ( nDataIndex = 0 ; nDataIndex < chartdata.length ; nDataIndex++ )
        {
            var row = chartdata[nDataIndex];

            if ( series.name == row.items[0] )
            {
                found = true;
                break;
            }
        }    

        if ( found != true )
        {
            series.remove ( false );

            nSeriesIndex = 0;
        }
    } 

    chart.redraw ();


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
