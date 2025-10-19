
class Hierarchy {
    /**
     * Create a hierarchy.
     * @param {object} spec - an object-literal containing initialising data.
     */
    constructor(spec) {

        if (spec.kb) {
            this._kb = spec.kb;  // The Object, not its ID
        } else {
            var kbId = AKT.state.current_kb;
            this._kb = AKT.KBs[kbId];
        }

        if (spec.id && spec.type && spec.root) {
            this._id = spec.id.replace(/ /g,'_');  // Should have been done already.
            this._type = spec.type;
            this._root = spec.root;
        } else {
            console.log('ERROR ERROR ERROR\nNot your fault.\nMissing id, type or root arguments for new Hierarchy().');
            return null;
        }

        // We only need to store tree_down (the nodes below each node) externally.
        // Here, we work out the converse, tree_up (the node above each node) for
        // efficient lookup in each direction.
        // Example:
        // tree_down = {a:['a1','a2'], b:['b1','b2']}
        // tree_up = {a1:'a', a2:'a', b1:'b', b2:'b'}
        if (spec.tree_down) {
            this._tree_down = spec.tree_down;
            this._tree_up = {};
            for (var id in spec.tree_down) { 
                var lowerIds = spec.tree_down[id];
                for (var j=0; j<lowerIds.length; j++) {
                    var lowerId = lowerIds[j];
                    this._tree_up[lowerId] = id;
                }
            }
                    
        } else {
            this._tree_down = {};
            this._tree_down[this._root] = [];
            this._tree_up = {};
        }
/*
        if (spec.tree_up) {
            this._tree_up = spec.tree_up;
        } else {
            this._tree_up = {};
        }
*/
        this._state = {selected:{},expanded:{},last_added:{},recently_added:{}};

// TODO: This code is still needed!   It handles legacy KBs, in AKT5's old format
// for repesenting hierarchies.   
/*         
        var links = this.cleanLinks(spec.links);
        if (links.length === 0) {
            this._tree_down = {};
            this._tree_down[this._root] = [];
            this._tree_up = {};
        } else {
            var tree = this.makeTree(spec.type,this._id,links);
            this._tree_down = tree[0];
            this._tree_up = tree[1];
        }
*/
    }


    addNode (parentId, nodeId) {
        if (!this._tree_down[parentId]) {
            this._tree_down[parentId] = [];
        }
        this._tree_down[parentId].push(nodeId);
        this._tree_up[nodeId] = parentId;

        this._state.recently_added[nodeId] = true;
        this._state.last_added = {};
        this._state.last_added[nodeId] = true;
    }


// TODO: This code is still needed!   It handles legacy KBs, in AKT5's old format
// for repesenting hierarchies.   See constructor.
    cleanLinks (specLinks) {
        var links = [];
        for (var i=0; i<specLinks.length; i++) {
            var specLink = specLinks[i];
            var hierarchy = specLink.hierarchy.replace(/ /g,'_');
            var item = specLink.item.replace(/ /g,'_');
            var subitem = specLink.subitem.replace(/ /g,'_');
            links.push({hierarchy:hierarchy,item:item,subitem:subitem});
        }
        return links;
    }



    // This method allows for the property value to be computed, rather than simply being
    // a native one for this Class.   See the same method in Statement.js.
    // So, in principle every reference to Collection._PropertyId should be changed to
    // Collection.getPropertyValue(PropertyId).
    getPropertyValue (propertyId) {
        if (this['_'+propertyId]) {
            return this['_'+propertyId];

        } else {
            return null;
        }
    }

// ========================================================== HIERARCHIES
// Each link is a 3-element array;  [HierarchyName,Item,SubItem]
// dimension is one of subtopics or subobjects, being the key for the
// corresonding sections of a kb.


    makeTree (typeId,hierarchyId,links) {
        //console.log('makeTree: ',typeId,hierarchyId,links);
        var treeDown = {};
        //treeDown[hierarchyId] = [];
        var treeUp = {};
        //if (typeId === 'object') console.log('/n',typeId,hierarchyId,links);
        if (Array.isArray(links)) {    // It's this one, not the else option below, 
                                       // since hierarchy links are the exception
                                       // and stored in an array rather than an object,
                                       // since they don't really have a 'key'.
            for (var i=0; i<links.length; i++) {
                var link = links[i];
                link.item = link.item.replace(/ /g,'_');
                link.subitem = link.subitem.replace(/ /g,'_');
                if (link.hierarchy === hierarchyId && link.item !== 'top') {
                    if (!treeDown[link.item]) {
                        treeDown[link.item] = [];
                    }
                    treeDown[link.item].push(link.subitem);
                    treeUp[link.subitem] = link.item;
                }
            }
        } else {
            for (var id in links) {
                var link = links[id];
                if (link.hierarchy === hierarchyId && link.item !== 'top') {
                    if (!treeDown[link.item]) {
                        treeDown[link.item] = [];
                    }
                    treeDown[link.item].push(link.subitem);
                    treeUp[link.subitem] = link.item;
                }
            }
        }
        return [treeDown,treeUp];
    }



    makeUlTree () {
        var hierarchyId = this._id;
        var treeDown = this._tree_down;
        console.log('-- ',hierarchyId, treeDown);
        var ul = $('<ul class="myUL"></ul>');
        getAll(ul, treeDown, hierarchyId, 0);
        return ul;

        function getAll(ul, treeDown, node, level) {
            level += 1;
            var children = treeDown[node];
            for (var i=0; i<children.length; i++) {
                if (level === 1) {
                    var li = $('<li id="'+hierarchyId+'_'+children[i]+'" class="level'+level+'">'+children[i]+'</li>');
                } else {
                    li = $('<li id="'+hierarchyId+'_'+children[i]+'" class="level'+level+'">'+children[i]+'</li>');
                }
                $(ul).append(li);
                if (treeDown[children[i]]) {
                    var ul1 = $('<ul class="nested"></ul>');
                    $(li).append(ul1);
                    getAll(ul1, treeDown, children[i], level);
                }
            }
        }
    };


    findChildren (node) {
        var treeDown = this._tree_down;
        var children = treeDown[node];
    /*
        var children = treeDown[node];
        if (children) {
            for (var i=0; i<children.length; i++) {
                descendants.push(children[i]);
                getAll(treeDown, children[i], descendants);
            }
        }
    */
        return children;
};

    //Explanation:
    //The treetable itself is contructed using a Hierarchy method, which sort-of seems right.
    // However, since we (currently) re-create the whole HTML <table> each time the user
    // makes some sort of change (adding a hierarchy, subhierarchy or object/topic), we need to 
    // remember the state of the hierarchy as displayed (which node is selected; whether the
    // hierarchy itself and its subhoerarchies are collapsed or expanded.   Arguably, this is
    // including functionality in the Hierarchy class which shouldn't be here, being more concerned
    // with display, and
    //     hierarchy.getCurrentState()
    //  is wrong, since there could be more than one display for one hierarchy, so we have to use
    //     hierarchy.getCurrentState(table),
    // but I think it's better than cluttering up the code for the hierarchy display
    // code (currently in the widgette "hierarchy_tree").

    // Hierarchy.state: properties:
    // - expanded
    // - selected
    // - last_added... so that it can be highlghted to bring it to the user's attention.
    // - recently_added... so that the user knows which have been added "recently".
    getCurrentState (tableTreetable) {
        // Don't re-initialise state.last_added and state.recently_added.
        var state = this._state;
        state.expanded = {};
        state.selected = {};
        $(tableTreetable).find('.expanded').each(function(index) {
            var id = $(this).data('tt-id');
            state.expanded[id] = true;
        });
        $(tableTreetable).find('.selected').each(function(index) {
            var id = $(this).data('tt-id');
            state.selected[id] = true;
        });
        this._state = state;
    }



    getAllDescendants (node) {
        var treeDown = this._tree_down;
        var descendants = getAll(treeDown, node, []);
        return descendants;

        function getAll(treeDown, node, descendants) {
            var children = treeDown[node];
            if (children) {
                for (var i=0; i<children.length; i++) {
                    descendants.push(children[i]);
                    getAll(treeDown, children[i], descendants);
                }
            }
            return descendants;
        }
    }


    getAllAncestors (node) {
        var treeUp = this._tree_up;
        var ancestors = getAll(treeUp, node, []);
        return ancestors;

        function getAll(treeUp, node, ancestors) {
            var parent = treeUp[node];
            if (parent && parent !== 'top') {
                ancestors.push(parent);
                getAll(treeUp, parent, ancestors);
            }
            return ancestors;
        }
    }
	
	createBranch () {

	}


    // This is a generic template for any task that requires recursing down through the 
    // hierarchy tree.   
    // For any specific use, I suggest copying this code then adapting it as required.
    // See getAll() for an example (generating one <tr> for each node).
    // To order the nodes at a particular level, change
    //     var children = treeDown[node_id];
    // to
    //     var children = treeDown[node_id].sort();
    // To use, call it with:
    //   treeDown: the hierarchy's tree_down property;
    //   node_id: the id of any node in the tree, typicaly the top one;
    //   level: usually 0.

    recurse (treeDown, nodeId, level) {
        console.log(level, nodeId);
        if (treeDown[nodeId]) {
            level += 1;
            var children = treeDown[nodeId];

            for (var i=0; i<children.length; i++) {
                var childId = children[i];
                this.recurse(treeDown, childId, level);
            }
        }
    }


    setDisplayMode (widget, nodeId, level, mode) {
        if (this._tree_down[nodeId]) {
            level += 1;
            var children = this._tree_down[nodeId];
            for (var i=0; i<children.length; i++) {
                var childId = children[i];
                $(widget.element).find('tr.'+childId).css({display:mode});
                this.setDisplayMode(widget, childId, level, mode);
            }
        }
    }


    // =========================================================================================
    // Treetable display


    makeTreetable (widget) {
        console.log('TREETABLE makeTreetable:::', widget.options);
        var hierarchyId = widget.options.item._id;
        var type = widget.options.item._type;
        var kb = widget.options.item._kb;
        var rootId = widget.options.item._root;
        var treeDown = widget.options.item._tree_down;
        var self = widget.options.item;

        var table = $('<table class="table_treetable '+this._id+'" data-hierarchy-id="' + hierarchyId + '"style="margin:2px;font-size:10px;"></table>');
        //var thead = $('<thead><tr><th>Object</th><th>Position</th></tr></thead>');
        var tbody = $('<tbody></tbody>');
        $(table).append(tbody);

        // This is where we actually build the table, recursing down the levels in the hierarchy,
        // and inserting a table row for every node (branch or leaf) in the hierarchy..
        //console.log('\n\n\n??????????????????????????????????????????????????');
        //.log('tbody:',tbody);
        //console.log('treeDown:',treeDown);
        //console.log('rootId:',rootId);
        //console.log('\n');
        if (Object.keys(treeDown).length > 0) {
            var k=0;
            var level = 0;
            getAll(tbody, treeDown, null, rootId, level);  // parentId is null.
        }
/*
        $(table).on("click", "tr", function() {
            console.log(5711,$(this));
            console.log(5712,$(this).data('node_id'));
            if ($(this).attr('data-selected') === 'yes') {
                $(this).css({background:'white'});
                $(this).attr('data-selected','no');
                widget.selected_node_id = null;
            } else {
                $('*[data-selected="yes"]').css({background:'white'});
                $('*[data-selected="yes"]').attr('data-selected','no');
                $(this).css({background:'yellow'});
                $(this).attr('data-selected','yes');
                widget.selected_node_id = $(this).data('node_id');
            }
            console.log(this);
            console.log($(this));
        });
*/
        $(table).on("click", ".div_id", function() {
            var tr = $(this).parent().parent().parent();

            console.log(5711,$(this));
            console.log(5712,$(tr));
            console.log(5713,$(tr).data('node_id'));
            if ($(tr).attr('data-selected') === 'yes') {
                $(tr).css({background:'white'});
                $(tr).attr('data-selected','no');
                widget.selected_node_id = null;
            } else {
                $('*[data-selected="yes"]').css({background:'white'});
                $('*[data-selected="yes"]').attr('data-selected','no');
                $(tr).css({background:'yellow'});
                $(tr).attr('data-selected','yes');
                widget.selected_node_id = $(tr).data('node_id');
            }
        });
	

        if (!this._state) {
            this._state = {
                expanded:{},       // Show subtree for specified node(s).
                selected:{},       // Mark this node as having been selected.
                last_added:{},     // Mark this node as being the last one added.
                recently_added:{}  // Mark these node(s) as having been added recently.
            };
        }

/*
        for (var id in this._state.expanded) {
            $(table).treetable('expandNode',id);
        }

        for (var id in this._state.selected) {
            $(table).find('tr[data-tt-id=' + id + ']').addClass("selected");
        }

        for (var id in this._state.last_added) {
            $(table).find('tr[data-tt-id=' + id + ']').addClass("last_added");
        }

        for (var id in this._state.recently_added) {
            $(table).find('tr[data-tt-id=' + id + ']').addClass("recently_added");
        }
*/

        return table;

        function getAll(tbody, treeDown, parentId, node_id, level) {
            //console.log('\ngetAll:',level,parentId,node_id);
            //console.log(treeDown);

            if (treeDown[node_id] && treeDown[node_id].length > 0) {
                var isEmptyBranch = false;
            } else {
                isEmptyBranch = true;
            }

            // Obviously, following is temporary hack until a proper selection mechanism for user.
            if (type === 'object') {
                var tr = buildTableRow(parentId,node_id,level,isEmptyBranch,type,['_id','_synonyms']);
            } else if (type === 'topic') {
                tr = buildTableRow(parentId,node_id,level,isEmptyBranch,type,['_id','_search_term']);
            }
            $(tbody).append(tr);

            if (treeDown[node_id]) {
                level += 1;
                var children = treeDown[node_id].sort();
                //console.log(children);

                for (var i=0; i<children.length; i++) {
                    //k += 1;
                    var childId = children[i];
                    //if (treeDown[childId]) {
                        getAll(tbody, treeDown, node_id, childId, level);
                    //}
                }
            }
        }


        function buildTableRow (parentId,node_id,level,isEmptyBranch,hierType,propertyIds) {
            console.log('TREETABLE - buildTableRow');
            console.log(parentId,node_id,level,isEmptyBranch,hierType);

            var kbId = AKT.state.current_kb;
            var kb = AKT.KBs[kbId];

            if (!level) {
                var level = 0;
            }

            var tr = $('<tr class="treetable_tr '+node_id+'" data-level="'+level+'" data-node_id="'+node_id+'"></tr>');

            if (parentId) {
                $(tr).attr('data-parent_id',parentId);
            }

            // item is either a formal term of type object, or a topic, depending on the 
            // type of hierarchy.
            if (hierType === 'object') {
                if (kb._formalTerms[node_id]) {
                    var item = kb._formalTerms[node_id];
                } else {
                    item = new FormalTerm();   // Use default settings - TODO: remove this temporary measure
                    kb._formalTerms[node_id] = item;
                }
            } else {
                item = kb._topics[node_id];
            }

            if (item) {
                //var td = $('<td><button>'+level+'</button></td>');
                
                var td = $('<td style="vertical-align:top;"></td>');
                $(tr).append(td);

                var div = $('<div></div>');
                $(td).append(div);
                var indent = 20*level;
                // Triangles: https://www.w3schools.com/charsets/ref_utf_geometric.asp
                var div1 = $('<div class="div_indent" style="float:left;vertical-align:top;color:white;width:'+indent+'px;">.</div>');
                if (isEmptyBranch) {
                    var div2 = $('<div class="div_expand_collapse" style="float:left;vertical-align:top;width:20px;color:white;">.</div>');
                } else {
                    var div2 = $('<div class="div_expand_collapse" local_id="div_expand_collapse_'+node_id+'" style="float:left;font-size:14px;line-height:12px;padding-left:4px;max-height:12px;color:blue;">&#11167;</div>');  // 9660
                }
                var div3 = $('<div class="div_id"  local_id="div_id_'+node_id+'" style="float:left;vertical-align:top;max-width:150px;">'+node_id+'</div>');
                var divClear = $('<div style="clear:both;"></div>');
                $(div).append(div1).append(div3).append(div2).append(divClear);

                for (var i=1; i<propertyIds.length; i++) {
                    var propId = propertyIds[i];
                    // Remove JSON double-quotes, and insert a space after every comma to
                    // get word-wrapping for Boolean expressions (only needed for topics).
                    if (item[propId]) {
                        var tdString = JSON.stringify(item[propId]).replaceAll('"','').replaceAll(',',', ');
                    } else {
                        tdString = '-+-';
                    }

                    // This is needed to stop long first cell starting at left-hand edge.
                    if (i === 0) {
                        var td = $('<td style="vertical-align:top;max-width:200px;vertical-align:top;">'+spaces[level]+tdString+'</td>');
                    } else {
                        var td = $('<td style="vertical-align:top;max-width:200px;vertical-align:top;">'+tdString+'</td>');
                    }
                    $(tr).append(td);
                }
            } else {
                for (var i=0; i<propertyIds.length; i++) {
                    var td = $('<td>+++</td>');
                    $(tr).append(td);
                }
            }
           
            return tr;
        }

    }

}
