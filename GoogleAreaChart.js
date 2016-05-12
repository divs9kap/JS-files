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

google.load('visualization', '1', {packages:['corechart']});

var color = null;
var pie = null;
var svg = null;
var path = null;

var chart1;
var chartdata1;
var options1;

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

    //
    // Calculate the number of data sets (unique Type) in the input data
    //
    var arDataSets = new Array();

    for ( var nIndex = 0 ; nIndex < chartdata.length ; nIndex++ )
    {
        var curItem = chartdata[nIndex];
        //
        // Find any existing Data Sets with the same name
        //
        var result = jQuery.grep ( arDataSets, function(e){ return e.name == curItem.items[1].trim(); });
        //
        // If not found, create new Data Set and add to array
        //
        if ( result.length == 0 )
        {
            arDataSets.push ( new dataset ( arDataSets.length, curItem.items[1].trim(), curItem.items[3].trim(), curItem.items[4].trim() ) );
        }
    }

    //
    // Setup the Data Table 
    // 
    //
    chartdata1 = new google.visualization.DataTable();
    //
    // Add the datetime column
    //
    chartdata1.addColumn ( 'datetime', 'DateTime');
    //
    // Add a column for each Data Set
    //
    for ( var nCol = 0 ; nCol < arDataSets.length ; nCol++ )
    {
        chartdata1.addColumn ( 'number', arDataSets[nCol].name );
    }

    //
    // Populate the data table
    //
    // What we are doing here is a pivot to turn the rows of data into columns, one for each data set
    // However, in addition we need to only have one row of data for each unique Date/Time
    //
    var arRowIndexes = new Array();

    for ( var nRow = 0 ; nRow < chartdata.length ; nRow++ )
    {
        var curRow = chartdata[nRow];

        //
        // Find the corresponding Data Set
        //
        var result = jQuery.grep ( arDataSets, function(e){ return e.name == curRow.items[1].trim(); });
        //
        // If not found, skip this row
        //
        if ( result.length == 0 )
        {
            continue;
        }

        var colNum = result[0].index;

        //
        // Get the timestamp value
        //
        var timestamp = curRow.items[0];
        timestamp = timestamp.substring ( 6 );
        timestamp = timestamp.substring ( 0, timestamp.length - 2 );

        //
        // Check whether an entry already exists in the output data set with this timestamp
        // If it does, update the column value, if not create a new entry and add
        //
        var result = jQuery.grep ( arRowIndexes, function(e){ return e.timestamp == timestamp; });

        if ( result.length == 0 )
        {
            //
            // Not found, add a new row to the chartdata and store the index
            //
            var rownum = chartdata1.addRow ();
            
            arRowIndexes.push ( new rowindex ( timestamp, rownum ) );
        
            //
            // Set the data values
            //
            var d = new Date();
            d.setTime(timestamp);        

            chartdata1.setValue ( rownum, 0, d );

            chartdata1.setValue ( rownum, colNum + 1, curRow.items[2] );
        }
        else
        {
            //
            // Found, update the existing cell value
            //
            chartdata1.setValue ( result[0].rownum, colNum + 1, curRow.items[2] );            
        }        
    }

// alert ( "There were " + nIndex + " rows of data" );
// alert ( "There are now " + chartdata1.getNumberOfRows() + " rows of data" );
// alert ( "There are " + arDataSets.length + " data sets" );

    if ( !chart1 )
    {
        var options1 = {
          title: 'Manufacturing Data Area Chart',
          hAxis: {title: 'Date Time',  titleTextStyle: {color: '#333'}},
          pointSize: 0,
          lineSize: 2,
          vAxis: {minValue: 0},
          series: {}
        };

        var seriesoptions = {};

        for ( var nCol = 0 ; nCol < arDataSets.length ; nCol++ )
        {
            seriesoptions[nCol] = {};
            seriesoptions[nCol].color = arDataSets[nCol].color;

            if ( arDataSets[nCol].charttype == "area chart" )
            {
                seriesoptions[nCol].areaOpacity = 1.0;
            }
            else
            {
                seriesoptions[nCol].areaOpacity = 0.0;
            }
        }

        options1.series = seriesoptions;

        chart1 = new google.visualization.AreaChart(document.getElementById('js_chart'));
        chart1.draw(chartdata1, options1);
    }


    wait ( sfdata.wait, sfdata.static );
 }

function dataset ( index, name, charttype, color )
{
    this.index = index;
    this.name = name;
    this.charttype = charttype;
    this.color = color;
}

function rowindex ( timestamp, rownum )
{
    this.timestamp = timestamp;
    this.rownum = rownum;
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
