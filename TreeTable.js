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
    // Step #1
    // Convert to our standard naming convention "name", "id" and "parentid" 
    //
    var html = "";

    for ( var nIndex = 0 ; nIndex < chartdata.length ; nIndex++ )
    {
        var row = chartdata[nIndex];

        if ( ( row != null ) && ( row.items != null ) )
        {
            var path   = row.items[0];
            var type   = row.items[1];
            var parent = row.items[2];
            var bytes  = row.items[3];
            //
            // Write out <TR> entry.
            // treetable() uses "data-tt-id" and "data-tt-parent-id" attributes to determine structure.
            // Only add "data-tt-parent-id" tag if item has a parent.
            //
            html += "<tr data-tt-id='" + path + "'";

            if ( parent && parent.length > 0 )
            {
                html += " data-tt-parent-id='" + parent + "'";
            }
            html += ">";

            if ( type == "spotfire.folder" )
            {
                html += "<td><span class='folder'>" + path + "</span></td>";
            }
            else
            {
                html += "<td><span class='file'>" + path + "</span></td>";
            }
            //
            // Write out <TD> entries for remaining displayed column 
            //
            html += "<td>" + bytes + "</td>";

            html += "</tr>";
        }
    }
    //
    // Create the table header
    //
    var myTable = "";

    myTable += "<table id='table1' class='controller' border='1' align='left'>";
    myTable += "<thead>";
    myTable += "<tr>";

    //
    // Add columns name: '<th>column</th>';
    //
    myTable += "<th>Name</th>";
    myTable += "<th>Bytes</th>";

    myTable += "</tr>";
    myTable += "</thead>";
    //
    // Create the table body
    //
    myTable += "<tbody>";

    myTable += html;

    myTable += "</tbody>";

    myTable += "</table>";
    document.getElementById('js_chart').innerHTML = myTable;


    $(function()
    {
        // initialize with default options
        $( "#table1" ).treetable({
            expandable:   true,
            initialState: "expanded"
        });
    });

    $("#table1 tbody").on("mousedown", "tr", function() {
        $(".selected").not(this).removeClass("selected");
        $(this).addClass("selected");
        //
        // First set the runtime state
        //
        var RuntimeStateInfo = { "selectedNode": $(this).data("ttId") };
		setRuntimeState ( RuntimeStateInfo );
    });

    $("#table1 tbody").on("mousedown", "span", function() {
        if ( $(this).attr('class').indexOf ( "indenter" ) > -1 ) return;
        //
        // Now execute the script "tree_control_click" with the parameter "paramNodeText" = nodeid
        // Two parent() calls due to structure <tr> -> <td> -> <span>
        //
        var ScriptArguments = [{ "Key":"paramNodeText", "Value": $(this).parent().parent().data("ttId") }];
        runScript ( "tree_control_click", ScriptArguments );
        //
        // Make sure the item clicked on is visible
        //
        $(this)[0].scrollIntoView();
    });
	//
	// If a node is currently selected, bring it into view
	//
    if ( sfdata.runtime && sfdata.runtime.selectedNode )
    {
        $("#table1").treetable ( "reveal", sfdata.runtime.selectedNode );
        $( "tr[data-tt-id='" + sfdata.runtime.selectedNode + "']" )[0].scrollIntoView();
        $("#table1").treetable ( "node", sfdata.runtime.selectedNode ).row.addClass("selected");
    }

    wait ( sfdata.wait, sfdata.static );
}

// 
// #endregion Drawing Code
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
