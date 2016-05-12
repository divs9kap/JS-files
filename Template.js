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
    // Replace the following code with actual Visualization code
    // This code just displays a summary of the data passed in to renderCore
    //
    displayWelcomeMessage ( document.getElementById ( "js_chart" ), sfdata );

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
function markModel(markMode, rectangle)
{
	// Implementation of logic to call markIndices or markIndices2 goes here
}

//
// Legacy mark function 2014 HF2
//
function mark(event)
{
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

//
// This is a sample visualization that indicates that JSViz is installed
// and configured correctly.  It is an example of how to draw standard
// HTML objects based on the data sent from JSViz.
//
function displayWelcomeMessage ( div, data )
{
    var table;
    var html;

    div.innerHTML = "";
    //
    // Display welcome message
    //
    var h1_welcome = document.createElement('h1');
    var tn_welcome = document.createTextNode('Welcome to JSViz!');
    h1_welcome.appendChild ( tn_welcome );

    div.appendChild ( h1_welcome );  
    //
    // For 2016 build, add version and date information
    //
    if ( typeof(JSViz) != 'undefined' )
    {
        var build_text = 'Build ' + JSViz.version.major +'.' + JSViz.version.minor +'.' + JSViz.version.build + '.' + JSViz.version.revision + ', ' + JSViz.version.date;
        var h2_build = document.createElement('h2');
        var tn_build = document.createTextNode( build_text );
        h2_build.appendChild ( tn_build );

        div.appendChild ( h2_build );  
    }
    //
    // Display table summary
    //
    var h2_summary = document.createElement('h2');
    var tn_summary = document.createTextNode('Data Table Summary');
    h2_summary.appendChild ( tn_summary );

    div.appendChild ( h2_summary );  

    table = document.createElement('table');

    html = '<table>';
    //
    // Display table name
    //
    html += '<tr>';

    html += '<th>Table Name</th>';
    html += '<td>' + data.baseTableHints.tableName + '</td>';

    html += '</tr>';
    //
    // Display number of columns
    //
    html += '<tr>';

    html += '<th>Number of Columns</th>';
    html += '<td>' + data.columns.length + '</td>';

    html += '</tr>';
    //
    // Display number of rows, marked and visible
    //
    html += '<tr>';

    html += '<th>Number of Rows</th>';
    html += '<td>' + data.baseTableHints.rows + '</td>';

    html += '</tr>';

    html += '<tr>';

    html += '<th>Marked</th>';
    html += '<td>' + data.baseTableHints.marked + '</td>';

    html += '</tr>';

    html += '<tr>';

    html += '<th>Visible</th>';
    html += '<td>' + data.baseTableHints.visible + '</td>';

    html += '</tr>';

    html += '</table>';

    div.innerHTML += html;

    //
    // Print the first 10 rows
    //
    var maxrows = Math.min ( data.data.length, 10 );

    var h2_firstrows = document.createElement('h2');
    var tn_firstrows = document.createTextNode ( ( maxrows == data.data.length ? 'All' :  ( 'First ' + maxrows ) ) + ' Rows of Data:' );
    h2_firstrows.appendChild ( tn_firstrows );

    div.appendChild ( h2_firstrows );  
    
    table = document.createElement('table');

    html = '<table>';

    html += '<tr>';

    var numcols = data.columns.length;

    for ( var nCol = 0; nCol < numcols; nCol++ )
    {
        html += '<th border="1">' + data.columns[nCol] + '</th>';
    }

    html += '<th>Marked</th>';
    html += '<th>Index</th>';

    html += '</tr>';

    for ( var nRow = 0; nRow < maxrows ; nRow++)
    {
        html += '<tr>';

        for (var nCol = 0; nCol < numcols; nCol++)
        {
            html += '<td>' + data.data[nRow].items[nCol].toString() + '</td>';
        }
        
        marked = ( data.data[nRow].hints.marked ) ? true : false;

        html += '<td>' + marked + '</td>';

        markindex = data.data[nRow].hints.index;

        html += '<td>' + markindex + '</td>';

        html += '</tr>';
    }
    
    html += '</table>';

    div.innerHTML += html;
}
