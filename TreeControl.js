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

var tree;      // Global tree control object

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

    // Extract the sub-parts
    var columns    = sfdata.columns;
    var chartdata  = sfdata.data;
    var config     = sfdata.config;
    var runtime    = sfdata.runtime;

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
 
    if ( !tree ) 
    { 
        var parsedData = new Array ();
    
        for ( var nIndex = 0 ; nIndex < chartdata.length ; nIndex++ )
        {
            var currentItem = chartdata[nIndex];
        
            if ( ( currentItem != null ) && ( currentItem.items != null ) )
            {
                var newItem = new Object;
        
                newItem['Path']       = currentItem.items[0];
                newItem['Type']       = currentItem.items[1];
                newItem['Bytes']      = currentItem.items[2];
                newItem['Parent']     = currentItem.items[3];
                newItem['Created']    = currentItem.items[4];
                newItem['CreatedBy']  = currentItem.items[5];
                newItem['Modified']   = currentItem.items[6];
                newItem['ModifiedBy'] = currentItem.items[7];
            
                parsedData[nIndex] = newItem;
            }
        }

        var tree = DataStructures.Tree.createFromFlatTable(parsedData);

        var simplifiedTree = tree.toSimpleObject(function(objectToDecorate, originalNode) {
            objectToDecorate.Bytes = originalNode.Bytes;
            if (objectToDecorate.children && objectToDecorate.children.length == 0) {
                delete objectToDecorate.children;
            }

            return objectToDecorate;
        });

        tree = new MooTreeControl({
            div: 'js_chart',
            mode: 'files',
            grid: true,
            theme: config.icons ? config.icons : 'http://localhost/jsviz/lib/mootree/mootree.gif'
        },{
            text: parsedData[0].Path,
            id:   parsedData[0].Path,
            open: true
        });

        for ( var nIndex = 1 ; nIndex < parsedData.length ; nIndex++ )
        {
            var treeParent = tree.get ( parsedData[nIndex].Parent );
            
            if ( treeParent )
            {
                treeParent.insert ( {
                    text: parsedData[nIndex].Path,
                    id:   parsedData[nIndex].Path,
                    open: true
                });
            }
        }
        //
        // Set the current selection from the runtime state data - if present
        // TODO: Figure out how to scroll the tree to make this item visible
        //
        if ( runtime )
        {
            if ( runtime.selectedNode )
            {
                var selNode = tree.get ( runtime.selectedNode );

                if ( selNode )
                {
                    tree.select ( selNode );
                }
            }
        }
        //
        // Now enable nodeClicked function
        // If we had set this earlier, then setting the selection above would have caused a click event.
        //
        tree.onClick = function(node, state) {
                           nodeClicked ( node.id );
                       };

    }

    wait ( sfdata.wait, sfdata.static );
 }

// Function to execute whenever a node in the tree is clicked
// This sets the current runtime state, then executes a Spotfire script
function nodeClicked ( nodeid ) 
{
    //
    // First set the runtime state
    //
    var RuntimeStateInfo = { "selectedNode":nodeid };

    setRuntimeState ( RuntimeStateInfo );

    //
    // Now execute the script "tree_control_click" with the parameter "paramNodeText" = nodeid
    //
    runScript ( "tree_control_click", [{ "Key":"paramNodeText", "Value": nodeid }] );
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
