// 3 April 2022
// This is a merger of the original diagram.js (used for drawing diagrams; kept as diagram_frozen2.js), and the diagram.js
// which was used for displaying automatically-generated graph layouts for diagrams generated
// from causal links for a chosen topic (kept as diagram_layout_only_for_class.js).

// 28 April 2022
// Extracted code for putting up the "node template" dialog, to make it into a separate widget (node_details.js - 
// a widget, not a widgette).   

// 7 August 2023 Now made into a separate widgette.

// 17 May 2024 Copied from diagram.js and renamed diagram_details.js to fit in with
// new "collection" approach.

AKT.widgets.diagram_details = {};


AKT.widgets.diagram_details.setup = function (widget) {
    console.log('\n\nXXX Starting akt.diagram: setup()');
    console.log('XXX widget.options: ',widget.options);

    AKT.state.current_widget = widget;

    var self = this;

    //$('.dialog').draggable();

    var mode = widget.options.mode;
    if (mode === 'new') {
    } else if (mode === 'view') {
        $(widget.element).find('.div_editting').css({display:'none'});
    } else if (mode === 'edit') {
        $(widget.element).find('.div_topics').css({display:'none'});
    }


    $(widget.element).find('.diagram_button_left').css({width:'80px',padding:'2px'});
    $(widget.element).find('.diagram_button_right').css({width:'90px',padding:'3px'});

    $(widget.element).find('.table_attribute_cause_effect_values').css({
        'border-collapse':'collapse'});
    $(widget.element).find('.table_attribute_cause_effect_values tr').css({
        'border-collapse':'collapse'});
    $(widget.element).find('.table_attribute_cause_effect_values th').css({
        'border-collapse':'collapse', border:'solid 1px black', width:'70px', height:'20px'});
    $(widget.element).find('.table_attribute_cause_effect_values td').css({
        'border-collapse':'collapse',  'border':'solid 1px black', width:'70px', height:'20px'});

    var instance = "something_unique";  // .... the widget's UUID
    var kbId = widget.options.kbId;
    var kb = AKT.KBs[kbId];
 


    // We either create an empty jgraph (Joint graph) here if mode='new', or 
    // we create the jgraph in diagram.convertSystoToJoint(), and populate it
    // with nodes and arcs from the Systo subgraph.

    // Reminder: we refer to "subgraph", not "graph", since it is a graph formed
    // by a subset of all the causal statements in the KB.

    // Note that "item" is the generic term (across all collections) for one 
    // instance of a collection.    We could also used item_id and look up the
    // instance, should we decide that is a better way of doing things.

    // From now on in this widget, we should just be working with the (Joint) jgraph,
    // not the (Systo) subgraph, until we invoke Springy for performing graph-layout,
    // or perform an Update of the KB, which stores just the Systo graph in the diagram
    // object.
    var mode = widget.options.mode;
    if (mode === 'new') {
        console.log('9100 New');
        var diagram = new Diagram('new','systo');
        widget.diagram = diagram;

    } else if (mode === 'view') {
        diagram = widget.options.item;
        widget.diagram = diagram;
        var subgraph = diagram._subgraph;
        //var jgraph = diagram.convertSystoToJoint(subgraph);

    } else if (mode === 'edit') {  // NOTE that we do not currently clone the diagram!
                // So any operations here modify the KB's diagram instance!
        diagram = widget.options.item;
        widget.diagram = diagram;
        var subgraph = diagram._subgraph;
        //var jgraph = diagram.convertSystoToJoint(subgraph);
    }

    var jgraph = new joint.dia.Graph;
    widget.jgraph = jgraph;
    diagram._jgraph = jgraph;
    AKT.state.current_graph = jgraph;
    

    // Change width and height here to create a bigger canvas, and cause the panel itself to size accordingly.
    //var paper = new joint.dia.Paper({ el: $(widget.element).find('.div_paper'), width: 1100, height: 600, gridSize: 1, model: graph, linkPinning:false });
    var paper = new joint.dia.Paper({
        el: $(widget.element).find('.div_paper'), 
        width: 700, 
        height: 500, 
        gridSize: 1, 
        model: jgraph, 
        linkPinning:false });

    paper.scale(1);
    widget.scale = 1;

    // Listbox with plain list of topics.
    if (mode === 'new' || mode ==='edit') {
        //console.log(9121);
        var hierarchyId_filter = 'all';

        var statements = kb._statements;
        var statementsArray = [];
        for (var statementId in statements) {
            var statement = statements[statementId];
            var formalTerms = statement.getFormalTerms();
            statement._terms = formalTerms;
            statementsArray.push(statement);
        }
        console.log(91211,statements);

        var topics = kb.findTopics({hierarchyId:hierarchyId_filter});
        for (var topicId in topics) {
            //console.log(9122,topicId);
            var topic = topics[topicId];
            console.log('\nTOPIC:',topicId,topic._search_term);

            var formalTerms = topic.getFormalTerms();
            //console.log('@@@ 9123',formalTerms);
            // We don't need both ways of storing the topic's formal terms!   
            // topic._formal_terms is obviously better.
            kb._lookup.formal_terms_for_topic[topicId] = formalTerms;
            topic._formal_terms = formalTerms;

            var topicStatements = statementsArray.filter(check);
            function check (statement) {
                if (statement._formal.search('causes') !== -1) {  // Cheeky hack for causes1way or causes2way.
                        // Note that this finds the number of causal *statements* for a topic, *not* the 
                        // number of diagram arcs, for a particular topic.   It is therefore just an 
                        // approximateindex of how many arcs will be displayed.
                        // Need to check for "if" when conditional att_value() statements can also be
                        // be included in diagram.
                    for (var term in topic._formal_terms) {
                        if (statement._terms[term]) {
                            return true;
                        }
                    }
                }
            }
            console.log(9125,topicId,topicStatements.length);
            if (topic._search_term.search(' and ') !== -1) {
                console.log(topic._search_term.search(' and '));
                topic._info = topicId+': ---';
            } else {
                topic._info = topicId+': '+topicStatements.length;
            }
/*
            var subgraph = diagram.makeSubgraph(topic,false);
            var nNodes = Object.keys(subgraph.nodes).length; 
            var nArcs = Object.keys(subgraph.arcs).length;  

            var nConditional = 0;
            for (var iArc in subgraph.arcs) {
                var arc = subgraph.arcs[iArc];
                if (arc.akt_type === 'condition') {
                    nConditional += 1;               
                }
            }
            topic._info = topicId+': '+nNodes+'/'+nArcs+' ('+nConditional+')';
*/
        } 
        console.log();
    }


    AKT.loadSelectOptions(widget.element, 'listbox_topics', topics, ['_id','_info'],{title:'_search_term'});
    // End of topics listbox



    $(widget.element).on( "resizexxx", function(event, ui) {
        var width = $(widget.element).width()-250;   //For when left and right button blocks are displayed...
        height = $(widget.element).height()-100;
        //var width = $(widget.element).width()-0;
        //var height = $(widget.element).height()-50;
        $(widget.element).find('.div_paper').css({width:width+'px',height:height+'px'});
        paper.scaleContentToFit({ padding: 10 });
    });

    
    // This is the info box that appears when e.g. user hovers over a jlink.
    // For future ref, try this wordwrapping function:
    // https://stackoverflow.com/questions/23823295/word-wrapping-in-jointjs
    var jlinkInfobox = new joint.shapes.standard.Rectangle();   
    //var jlinkInfobox = joint.shapes.basic.TextBlock();
    jlinkInfobox.position(300,300);  //This is set according to current mouse position.
    jlinkInfobox.resize(300, 60);
    jlinkInfobox.attr({
        body: {
            stroke: 'black', 
            strokeWidth: 1, 
            fill:'#f0f0a0', 
            display:'none'
        },
        label: {
            textWrap: {
                text: ''
            },
            textVerticalAnchor: 'top',
            textAnchor: 'left',
            refX: 4,
            refY: 3,
            fontSize:11,
            style: { stroke: 'black', strokeWidth:0.3}
        }
        //display: 'none'
    });
    jlinkInfobox.akt_type = 'attribute';
    jlinkInfobox.status = 'no_name';
    jlinkInfobox.addTo(jgraph);
    widget.jlinkInfobox = jlinkInfobox;
    
    console.log(jgraph);

    var m = {};
    AKT.state.aktType = 'pointer';
    var count = {object:0, attribute:0, process:0, action:0, causes1way:0, causes2way:0, link:0};
    var nodeReady = false;
    var flowPad = null;
    var influencePad = null;

    // Presentational attributes.
    var attrs = {
        elementDefault: {
            text: { fill: '#fff', style: { 'text-shadow': '1px 1px 1px #999', 'text-transform': 'capitalize' }},
            circle: { fill: '#feb663', stroke: 'white' }
        },
        elementSelected: {
            circle: { fill: '#9687fe' }
        },
        elementHighlighted: {
            circle: { fill: '#31d0c6' }
        },
        linkDefault: {
            '.connection': { stroke: '#6a6c8a', 'stroke-width': 1 }
        },
        linkDefaultDirected: {
            '.marker-target': { d: 'M 12 0 L 0 6 L 12 12 z' }
        },
        linkHighlighted: {
            '.connection': { stroke: '#33334e', 'stroke-width': 5 }
        },
        linkFlow: {
            '.marker-target': { d: 'M 12 0 L 0 6 L 12 12 z'},
            '.connection': { stroke: '#33334e', 'stroke-width': 5 }
        },
        linkInfluence: {
            '.marker-target': { d: 'M 12 0 L 0 6 L 12 12 z' }
        }
    };



    joint.shapes.standard.Rectangle.define('examples.CustomRectangle',
        {
            attrs: {
                body: {
                    rx: 10, // add a corner radius
                    ry: 10,
                    strokeWidth: 2,
                    fill: 'white',
                    stroke: 'blue'
                },
                label: {
                    textAnchor: 'left', // align text to left
                    refX: 10, // offset text from right edge of model bbox
                    fill: 'black',
                    fontSize: 10
                }
            }
        }, 
        {
            // inherit joint.shapes.standard.Rectangle.markup
        }, 
        {
            createRandom: function() {

                var rectangle = new this();

                var fill = '#' + ('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6);
                var stroke = '#' + ('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6);
                var strokeWidth = Math.floor(Math.random() * 6);
                var strokeDasharray = Math.floor(Math.random() * 6) + ' ' + Math.floor(Math.random() * 6);
                var radius = Math.floor(Math.random() * 21);

                rectangle.attr({
                    body: {
                        fill: fill,
                        stroke: stroke,
                        strokeWidth: strokeWidth,
                        strokeDasharray: strokeDasharray,
                        rx: radius,
                        ry: radius
                    },
                    label: { // ensure visibility on dark backgrounds
                        fill: 'black',
                        stroke: 'white',
                        strokeWidth: 1,
                        fontWeight: 'bold'
                    }
                });

                return rectangle;
            }
        }
    );


    // Store datalist option values in arrays, one for each syntactic element
    var syntacticElementTypes = ['actions', 'attributes','objects', 'parts', 'processes', 'values'];
    AKT.state.memory = {};
    $.each(syntacticElementTypes, function(i, aktType) {
        AKT.state.memory[aktType] = [];
        var list = $('#'+aktType).find('option');
        $.each(list, function(j,item) {
            AKT.state.memory[aktType].push(item.value);
        });
    });

    $('#cause_attval_options > input').attr('disabled','true');
    $('#effect_attval_options > input').attr('disabled','true');
    $('#cause_attval_options > label').css({color:'#808080'});
    $('#effect_attval_options > label').css({color:'#808080'});





// =========================  BUTTON EVENT HANDLERS  =======================================

    $(widget.element).find('.button_all').on('click', function () {
        event.stopPropagation();
        var kbId = widget.options.kbId;
        var kb = AKT.KBs[kbId];
        jgraph.clear();
        AKT.state.diagram_counter += 1;
        AKT.state.current_diagram = diagram;  // The object, not the ID

        var subgraph = {nodes:{},arcs:{}};  // This is the subgraph, for this diagram.

        var statements = kb._statements;
        for (var statementId in statements) {
            var statement = statements[statementId];
            var arc = statement._arc;
            if (arc) {
                var startNode = arc.start_node;
                var endNode = arc.end_node;
                subgraph.nodes[startNode.id] = startNode;
                subgraph.nodes[endNode.id] = endNode;
                subgraph.arcs[arc.id] = arc;
            }
        }

        diagram._subgraph = subgraph;
        diagram.graphLayoutSpringy(widget);
        $(widget.element).blur();
    });


    $('.diagram_save').on('click', function() {
        $('#save_diagram_local_storage').css({display:'block'});
    });


    $(widget.element).find('.button_update').on('click', function() {
        console.log('\n*** Click event on Update button in diagram_details.js');
        event.stopPropagation();
        var kbId = widget.options.kbId;
        var kb = AKT.KBs[kbId];

        if (widget.diagram._subgraph) {
            widget.diagram.printSubgraph('From Update',widget.diagram._subgraph);
        }

        var mode = widget.options.mode;
        console.log(8401,mode);
        if (mode === 'new') {
            $(widget.element).find('.div_meta').css({display:'block'});
        } else if (mode === 'view') {
            alert('You cannot sace changes to the diagram in View mode.');
        } else if (mode === 'edit') {
            console.log(8402,jgraph);
            widget.diagram._joint = jgraph;   // Hopefully, redundant, if the function-like approach works.
            widget.diagram._jgraph = jgraph;   // Ditto.  Duplicate properties are retained during the refactoring process!
            widget.diagram._subgraph = widget.diagram.convertJointToSysto(jgraph);
            console.log(8403,widget.diagram._subgraph);
            var id = widget.diagram._id;
            console.log(8404,widget.diagram);
            kb._diagrams[id] = widget.diagram;
            AKT.saveKbInLocalStorage(kbId)
            $('#message').text('The Diagram list has been updated');
            AKT.trigger('item_changed_event',{kb:kb,item_type:'diagram',item:widget.diagram});
       }
        
    });


    $(widget.element).find('.button_meta_ok').on('click', function() {
        console.log('\n*** Click event on OK button in diagram_details.js, meta dialog.');
        var id = $(widget.element).find('.div_id').text();
        var title = $(widget.element).find('.div_title').text();
        var memo = $(widget.element).find('.div_memo').text();

        // April 2025 Major refactoring to get rid of jointObject and diagram._joint 
        // (same thing), since that was just a reconfiguration of information in jgraph.
        // It was confusing to have a 4th way of representing a graph (after Systo, Joint
        // and Springy).
        // So, the following code has now been subsumed into Diagram.js: convertJointToSysto(jgraph).
        // We still create a jointObject there (now called joint), but that is now purely a local thing,
        // rather than something that is passed around.
        // Note: the jgraph is now passed as an argument, to make the code more function-like, 
        // replacing the previous structure of having a _joint property for the Diagram class.
        // The following commented-out code is left in to shw what used to happen.
/*
        var jointObject = {nodes:[],links:[]};
        _.each(jgraph.getElements(), function(el) {
            jointObject.nodes.push(el.attributes);
        });
        _.each(jgraph.getLinks(), function(el) {
            jointObject.links.push(el.attributes);
        });
*/

        //var diagram = new Diagram(id,{id:id, title:title, memo:memo, language:'joint', joint:jointObject});
        //if (!kb._diagrams) {
        //    kb._diagrams = {};
        //}

        console.log(5051,'\n----------');
        console.log(widget.diagram);
        console.log(jgraph);
        widget.diagram._joint = jgraph;   // Hopefully, redundant, if the function-like approach works.
        widget.diagram._jgraph = jgraph;   // Ditto.  Duplicate properties are retained during the refactoring process!
        widget.diagram._subgraph = widget.diagram.convertJointToSysto(jgraph);
        widget.diagram.printSubgraph('Printing from diagram_details:button_meta_ok',widget.diagram._subgraph);
        widget.diagram._id = id;
        widget.diagram._title = title;
        widget.diagram._memo = memo;
        kb._diagrams[id] = widget.diagram;
		AKT.saveKbInLocalStorage(kbId)
        $('#message').text('The Diagram list has been updated');

        if (widget.options.mode==='new') {
            AKT.trigger('new_item_created_event',{kb:kb,item_type:'diagram',item:diagram});
        } else if (widget.options.mode==='edit') {
            AKT.trigger('item_changed_event',{kb:kb,item_type:'diagram',item:diagram});
        }

        $(widget.element).find('.div_id').text('');
        $(widget.element).find('.div_title').text('');
        $(widget.element).find('.div_memo').text('');
        $(widget.element).find('.div_meta').css({display:'none'});
    });


    $('#save_diagram_local_storage_ok').on('click', function(event) {
        console.log('\n90. clicked on Save button');
        $('#save_diagram_local_storage').css({display:'none'});
        var title = $('#save_diagram_local_storage_title').val();
        saveDiagramToLocalStorage(jgraph, title);
    });


    $(widget.element).find('.button_load').on('click', function() {
        jgraph.removeCells(jgraph.getElements());
        jgraph.removeLinks(jgraph.getLinks());
        $(widget.element).find('.div_load_diagram_local_storage').css({display:'block'});
    });


    $(widget.element).find('.button_load_diagram_local_storage_ok').on('click', function(event,element) {
        var title = $(widget.element).find('.div_load_diagram_local_storage_title').text();
        $(widget.element).find('.div_load_diagram_local_storage').css({display:'none'});
        var diagramString = localStorage.getItem(title);
        console.log(7770,diagramString);
        var jointObject = JSON.parse(diagramString); 
        var nodes = jointObject.nodes;
        for (var i=0; i<nodes.length; i++) {
            var node = new joint.shapes.standard.Rectangle(nodes[i]);
            node.addTo(jgraph);
        }
        var links = jointObject.links;
        for (var i=0; i<links.length; i++) {
            console.log(links[i]);
            var link = new joint.shapes.standard.Link(links[i]);
            link.addTo(jgraph);
        }
    });


/*
Here is the problem.   Do we have a separate data structure, stored with the diagram's 
causal link, for the cause and/or effect values?  Or do we just keep them with the
relevant statements?   The latter is in keeping with DRY.  It involves a bit more
work whenever a causal link is opened (we have to extract the attribute's value from 
the statement's JSON) but hey, that's not hard, and ensures consistency.   I think that's
what I'll do.   
*/
    $(widget.element).find('.link_causes1way_dialog_ok').on('click', function() {
        console.log('\nEVENT Clicked on link_causes1way_dialog_ok in diagram_details.js');
        var kbId = AKT.state.current_kb;
        var kb = AKT.KBs[kbId];

        var sourceJson = JSON.parse(JSON.stringify(AKT.state.currentSourceNode.json));    // There has to be a better way.   Maybe
        var targetJson = JSON.parse(JSON.stringify(AKT.state.currentTargetNode.json));    // use a data-attribute, or a text field?
        console.log(6661,sourceJson,targetJson);

        var rows = $(widget.element).find('.table_values').find('tr');
        console.log(rows);

        var values = {};   // Convenience storage of attribute values from table,
                           // one entry for each statement.
        for (var i=1;i<rows.length;i++) {   // Ignore the first (header) row in the table.
            var row = rows[i];
            var statementId = $(row).find('td:eq(1)').text();  // This selects the second <td>
            values[statementId] = {
                status: $(row).data('status'),    // 'existing_statement' or 'new_statement'
                cause:  $(row).find('td[data-role="cause"]').text(),
                effect: $(row).find('td[data-role="effect"]').text()
            };
            if (values[statementId].cause === '') delete values[statementId].cause;
            if (values[statementId].effect === '') delete values[statementId].effect;

            console.log(i,'existing',$(rows[i]).find('[data-status="existing_statement"][data-role="cause"]').text(),'===>',$(rows[i]).find('[data-status="existing_statement"][data-role="effect"]').text());
        }
        console.log('@@@',values);

        // Now modify values in existing statement, create a new statement, or delete a statement,
        // depending on the value of the 'status' property.
        for (var statementId in values) {
            console.log('@',statementId,values[statementId]);
            if (values[statementId].status === 'existing_statement') {
                var statement = kb._statements[statementId];
                console.log('@@',statement);
                if (values[statementId].cause) {
                    console.log('@cause');
                    statement.resetValue('cause',values[statementId].cause);
                }
                if (values[statementId].effect) {
                    console.log('@effect');
                    statement.resetValue('effect',values[statementId].effect);
                }

            } else if (values[statementId].status = 'new_statement') {
                var sourceValue = values[statementId].cause;
                var targetValue = values[statementId].effect;

                var sourceJson = JSON.parse(JSON.stringify(AKT.state.currentSourceNode.json));    // There has to be a better way.   Maybe
                var targetJson = JSON.parse(JSON.stringify(AKT.state.currentTargetNode.json));    // use a data-attribute, or a text field?
                console.log(6001,AKT.state);
                console.log(6002,JSON.stringify(sourceJson));
                console.log(6003,JSON.stringify(targetJson));
                // TODO: att_value must be treated separately for each of source and target nodes, since 
                // object/process/action don't have a value!
                if (sourceJson[0] === 'attribute') {
                    sourceJson[0] = 'att_value';
                    //sourceJson.pop();
                }
                if (targetJson[0] === 'attribute') {
                    targetJson[0] = 'att_value';
                    //targetJson.pop();
                }
                if (sourceValue) {
                    //sourceJson.push(sourceValue);
                    sourceJson[3] = sourceValue;
                }
                if (targetValue) {
                    //targetJson.push(targetValue);
                    targetJson[3] = targetValue;
                }
                console.log(6004,JSON.stringify(sourceJson));
                console.log(6005,JSON.stringify(targetJson));
                var json = ['causes1way',sourceJson, targetJson];
                console.log(6006,JSON.stringify(json));
                var n = kb.findLargestIndex(kb._statements,'s')+1;
                var id = 's'+n;
                console.log(6007,id);
                var statement = new Statement({id:id,json:json,type:'causal'});
                console.log(6008,statement);
                var formal = statement.makeFormalFromJson();
                console.log(6009,formal);
                var english = statement.makeEnglishFromJson();
                statement.makeNodesAndArc();
                statement._formal = formal;
                console.log(i,n,id);
                console.log(json);
                console.log(formal);
                kb._statements[id] = statement;

                var formalTerms = statement.classifyFormalTerms();
                for (var id in formalTerms) {
                    var formalTerm = new FormalTerm({id:id,type:formalTerms[id][0],kb:kb,synonyms:[],description:''});
                    kb._formalTerms[id] = formalTerm;
                }

                AKT.trigger('new_item_created_event',{kb:kb,item_type:'statement',item:statement});
                AKT.trigger('item_changed_event',{kb:kb,item_type:'statement',item:statement});

            } else if (values[statementId].status = 'delete_statement') {
            }
        }


        for (var i=0;i<rows.length;i++) {
            console.log(i,'new',$(rows[i]).find('[data-status="new_statement"]').text());
        }
/*
        for (var i=1; i<=3; i++) {
            console.log('\n**',i);
            var sourceValue = $(this).parent().parent().find('.cause_value_'+i+' input').val();
            var targetValue = $(this).parent().parent().find('.effect_value_'+i+' input').val();
            if (sourceValue === '' && targetValue === '') break;

            console.log(i,sourceValue,targetValue);
            var sourceJson = JSON.parse(JSON.stringify(AKT.state.currentSourceNode.json));    // There has to be a better way.   Maybe
            var targetJson = JSON.parse(JSON.stringify(AKT.state.currentTargetNode.json));    // use a data-attribute, or a text field?
            console.log(6001,AKT.state);
            console.log(6002,JSON.stringify(sourceJson));
            console.log(6003,JSON.stringify(targetJson));
            // TODO: att_value must be treated separately for each of source and target nodes, since 
            // object/process/action don't have a value!
            if (sourceJson[0] === 'attribute') {
                sourceJson[0] = 'att_value';
                sourceJson.pop();
            }
            if (targetJson[0] === 'attribute') {
                targetJson[0] = 'att_value';
                targetJson.pop();
            }
            if (sourceValue) {
                sourceJson.push(sourceValue);
            }
            if (targetValue) {
                targetJson.push(targetValue);
            }
            console.log(6004,JSON.stringify(sourceJson));
            console.log(6005,JSON.stringify(targetJson));
            var json = ['causes1way',sourceJson, targetJson];
            console.log(6006,JSON.stringify(json));
            var n = kb.findLargestIndex(kb._statements,'s')+1;
            var id = 's'+n;
            console.log(6007,id);
            var statement = new Statement({id:id,json:json,type:'causal'});
            console.log(6008,statement);
            var formal = statement.makeFormalFromJson();
            console.log(6009,formal);
            var english = statement.makeEnglishFromJson();
            statement.makeNodesAndArc();
            statement._formal = formal;
            console.log(i,n,id);
            console.log(json);
            console.log(formal);
            kb._statements[id] = statement;

            var formalTerms = statement.classifyFormalTerms();
            for (var id in formalTerms) {
                var formalTerm = new FormalTerm({id:id,type:formalTerms[id][0],kb:kb,synonyms:[],description:''});
                kb._formalTerms[id] = formalTerm;
            }

            AKT.trigger('new_item_created_event',{kb:kb,item_type:'statement',item:statement});
            AKT.trigger('item_changed_event',{kb:kb,item_type:'statement',item:statement});
        }
*/
        $(this).parent().parent().css({display:'none'});
    });


    $(widget.element).find('.link_causes1way_dialog_cancel').on('click', function() {
        $(this).parent().parent().css({display:'none'});
    });


    // Add another, blank, row in the attribute-values table.
    $(widget.element).find('.link_causes1way_dialog_add').on('click', function() {
        var jnodes = AKT.state.current_jnodes;
        var jnodeSource = jnodes.source;
        var jnodeTarget = jnodes.target;

        var dialog = $(widget.element).find('.link_causes1way_dialog');

        widget.tentativeNewStatementCounter += 1;
        var tentativeStatementId = 's'+(kb.findLargestIndex(kb._statements,'s')+widget.tentativeNewStatementCounter);

        var tr = $('<tr data-status="new_statement"></tr>');

        $(tr).append('<td><input type="checkbox"></input></td>');

        $(tr).append('<td class="new_attribute_value">'+tentativeStatementId+'</td>');

        if (jnodeSource.json[0] === 'attribute'){
            $(tr).append('<td  data-status="new_statement" data-role="cause" data-statement_id="'+tentativeStatementId+'" contenteditable style="border:solid 1px black;padding:5px;"></td>');
        }

        if (jnodeTarget.json[0] === 'attribute'){
             $(tr).append('<td data-status="new_statement" data-role="effect" data-statement_id="'+tentativeStatementId+'" contenteditable style="border:solid 1px black;padding:5px;"></td>');
        }
        $(dialog).find('.table_values').append(tr);
    });


    // Click an Add Node button
    $('.button_add_node').on('click', function(event,item) {
        var category = event.currentTarget.dataset.category;  // 'node' or 'link'
        var aktType = event.currentTarget.dataset.akt_type;
        process_node_or_link_button(this, category, aktType);   // 'attribute', 'object', 'process' or 'action'
    });

    // Click an Add Link button
    $('.button_add_link').on('click', function(event,item) {
        var category = event.currentTarget.dataset.category;  // 'node' or 'link'
        var aktType = event.currentTarget.dataset.akt_type;   // 'causes1way', 'causes2way' or 'link'
        console.log('===',category,aktType);

        process_node_or_link_button(this, category, aktType);
    });


    $('.link_condition').on('click', function () {

        _.each(jgraph.getElements(), function(jnode) {
            if (jnode.attributes.size.width === 7) {  // TODO: Horrible way of finding vertex 
                                                      // node on causal arcs for condition arcs.
                jnode.attr('./display','block');
            }
        });

    });


    $('.button_delete_node_or_link').on('click', function () {
        var jgraph = diagram._jgraph;
        _.each(jgraph.getLinks(), function(jlink) {
            if (jlink.selected) {
                jgraph.getCell(jlink.id).remove();
            }
        });
        _.each(jgraph.getElements(), function(jnode) {
            if (jnode.selected) {
                _.each(jgraph.getLinks(), function(jlink) {
                    if (jlink.source.id===jnode.id || jlink.target.id===jnode.id) {
                        jgraph.getCell(jlink.id).remove();
                    }
                });
                jgraph.getCell(jnode.id).remove();
            }
        });
    });


    $('.button_zoom_in').on('click', function(event,item) {

        event.preventDefault();
        ev = event.originalEvent;

        console.log(V(paper.viewport).scale().sx);

        //var delta = Math.max(-1, Math.min(1, (0.5 || -ev.detail))) / 50;
        var scaleChange = 1/0.9;
        var offsetX = (ev.offsetX || ev.clientX - $(this).offset().left); // offsetX is not defined in FF
        var offsetY = (ev.offsetY || ev.clientY - $(this).offset().top); // offsetY is not defined in FF
        var p = offsetToLocalPoint(offsetX, offsetY);
        //var newScale = V(paper.viewport).scale().sx + delta; // the current paper scale changed by delta

        //if (newScale > 0.1 && newScale < 2) {
            paper.setOrigin(0, 0); // reset the previous viewport translation
            //paper.scale(newScale, newScale, p.x, p.y);
            widget.scale = widget.scale*scaleChange;
            paper.scale(widget.scale,widget.scale,550,300);
        //}

        function offsetToLocalPoint(x, y) {
            var svgPoint = paper.svg.createSVGPoint();
            svgPoint.x = x;
            svgPoint.y = y;
            // Transform point into the viewport coordinate system.
            var pointTransformed = svgPoint.matrixTransform(paper.viewport.getCTM().inverse());
            return pointTransformed;
        }
    });


    $('.button_zoom_out').on('click', function(event,item) {

        event.preventDefault();
        ev = event.originalEvent;

        //var delta = Math.max(-1, Math.min(1, (0.5 || -ev.detail))) / 50;
        var scaleChange = 0.9;
        var offsetX = (ev.offsetX || ev.clientX - $(this).offset().left); // offsetX is not defined in FF
        var offsetY = (ev.offsetY || ev.clientY - $(this).offset().top); // offsetY is not defined in FF
        var p = offsetToLocalPoint(offsetX, offsetY);
        //var newScale = V(paper.viewport).scale().sx + delta; // the current paper scale changed by delta

        console.log(offsetX,offsetY,p.x,p.y);
        //if (newScale > 0.25 && newScale < 4) {
            paper.setOrigin(0, 0); // reset the previous viewport translation
            //paper.scale(newScale, newScale, p.x, p.y);
            widget.scale = widget.scale*scaleChange;
            paper.scale(widget.scale,widget.scale,600,300);
        //}

        function offsetToLocalPoint(x, y) {
            var svgPoint = paper.svg.createSVGPoint();
            svgPoint.x = x;
            svgPoint.y = y;
            // Transform point into the viewport coordinate system.
            var pointTransformed = svgPoint.matrixTransform(paper.viewport.getCTM().inverse());
            return pointTransformed;
        }
    });

// ================================   Buttons in node and link creation dialogs
    $('.diagram_node_dialog').on('click', function() {
        $(this).css({display:'none'});
    });

    $('.diagram_link_dialog').on('click', function() {
        $(this).css({display:'none'});
    });


// =========================== LISTBOX HANDLERS  ==============================

    $(widget.element).find('.button_display').on('click', function() {
        console.log('.button_display');
        event.stopPropagation();
        var kbId = widget.options.kbId;
        var kb = AKT.KBs[kbId];
        jgraph.clear();
        var topicId = $(widget.element).find('.listbox_topics').val();
        var topic = kb._topics[topicId];
        AKT.state.diagram_counter += 1;
        AKT.state.current_diagram = diagram;  // The object, not the ID

        console.log('\n\nCalling diagram.makeSubgraph() from button_display');
        diagram._subgraph = diagram.makeSubgraph(topic,true);
        console.log('\n==+++',diagram._subgraph);
        if (Object.keys(diagram._subgraph.arcs).length > 0) {
            diagram.graphLayoutSpringy(widget);
            $(widget.element).blur();
        } else {
            alert('There are no causal statements for the chosen topic.');
        }
        jlinkInfobox.addTo(jgraph);
    });


    $(widget.element).find('.checkbox_arc_info').on('click', function () {

        if ($(widget.element).find('.checkbox_arc_info').is(':checked')) {
        } else {
            jlinkInfobox.attr({
                body:{display:'none'},
                label:{display:'none'}
            });
        }
    });



// ===========================  JOINT HANDLERS  ===============================
/*   Left over from faied svg-drag-zoom experiment
    paper.on('blank:pointerdown', function() {
      panZoom.enablePan();
    });
      
    paper.on('blank:pointerup', function() {
      panZoom.disablePan();
    });
*/
// =============================================================================================
// Code for panning.
//First solution in https://stackoverflow.com/questions/28431384/how-to-make-a-paper-draggable/35149108#35149108
// Tried subsequent svg-pan-zoom.  Worked in standalone demo, but got some untraceable error when added in here.
// anyway, this very simple solution works finr, even with scaling.

    paper.on('blank:pointerdown', function(event, x, y) {
        //var scale = V(paper.viewport).scale(); 
        var scale = widget.scale;
        console.log('scale:',scale);
        widget.dragStartPosition = { x: x * scale, y: y * scale};    
 
        jlinkInfobox.attr({
            body:{display:'none'},
            label:{display:'none'}
        });
    });


    paper.on('cell:pointerup blank:pointerup', function(cellView, x, y) {
        delete widget.dragStartPosition;
    });


    $(widget.element).find('.div_paper').mousemove(function(event) {
        if (widget.dragStartPosition) {
            paper.translate(event.offsetX - widget.dragStartPosition.x, 
                    event.offsetY - widget.dragStartPosition.y);
        }
    });

// ===============================================================================================


    paper.on('blank:pointerdblclick', function(evt, x, y) {
        console.log('diagram.js: paper.on("blank:pointerdblclick"');
        evt.stopPropagation();
        var kbId = widget.options.kbId;
        var kb = AKT.KBs[kbId];

        var nodeTypes = {attribute:true, object:true, process:true, action:true};
        var nodeType = AKT.state.aktType;
        console.log(':::',nodeType,x,y);

        $('.diagram_button_left').css({border:'solid 1px #808080', background:'#f0f0f0'});

        var panel = AKT.panelise({
            widget_name:'node_details',
            position:{left:'20px',top:'20px'},
            size:{width:'410px',height:'375px'},
            shift_key: event.shiftKey,
            options:{
                kbId:kbId, 
                opened_by_widgie:widget,
                diagram:  diagram,
                mode:     'new_node',
                node_type:nodeType,
                x:        x,
                y:        y
            }
        });

        AKT.state.aktType = 'pointer';
    });



    //====================================================

    paper.on('element:pointerdblclick', function(elementView) {
        AKT.state.currentElement = elementView.model;
    });


    paper.on({
        'element:contextmenu': onElementRightClick
    });

    function onElementRightClick(view) {
    }


    // -------------------------------------------------------------
    // NODE ("ELEMENT") EVENTS

    paper.on('element:pointerdblclick', function(elementView) {
        console.log('diagram.js paper.on("cell:pointerdblclick"');
        //var isElement = cellView.model.isElement();
        //var type = cellView.model.type;
        //var message = (isElement ? 'Element' : 'Link') + ' clicked';

        var jnode = elementView.model;

        //if (isElement) {
            /*$('#div_node_details_dialog').node_details('option',{
                mode:'node',   // Alternatives are statement types ('attval','cause','effect')
                node_type:type, 
                node_id:cellView.model.id, 
                node:cellView.model
            });
            $('#div_node_details_dialog').css({display:'block'});*/
        $(widget.element).dialog_Generic('option','mode','node');
        $(widget.element).dialog_Generic('option','node_type',jnode.akt_type);
        $(widget.element).dialog_Generic('option','node_id',jnode.id);
        $(widget.element).dialog_Generic('option','node',jnode);
        $(widget.element).css('display','block');
        var kbId = widget.options.kbId;
        var kb = AKT.kbs[kbId];

        var panel = AKT.panelise({
            widget_name:'node_details',
            position:{left:'20px',top:'20px'},
            size:{width:'410px',height:'375px'},
            shift_key: event.shiftKey,
            options:{kbId:kbId, opened_by_widgie:widget,
                diagram:  diagram,
                mode:     'existing_node',  
                node_type:jnode.akt_type, 
                node_id:  jnode.id, 
                node:     jnode
            }
        });

        var kbId = widget.options.kbId;
        var kb = AKT.kbs[kbId];
    });



    paper.on('element:pointerclick', function(elementView) {
        console.log('\ndiagram.js: paper.on("element:pointerclick"');
        var jnode = elementView.model;
        console.log(jnode.selected,jnode.attributes.attrs);
        console.log(jnode);

        if (jnode.selected) {
            jnode.attr({
                body: {
                    stroke: 'black', 
                    strokeWidth: 1, 
                    fill:'white'
                }
            });
            jnode.selected = false;
        
        } else {
            jnode.attr({
                body: {
                    stroke: 'blue', 
                    strokeWidth: 2, 
                    fill:'white'
                }
            });
            jnode.selected = true;
        }
    });


    paper.on('element:pointermove', function (jnodeView) {
        var jnode = jnodeView.model;
        _.each(jgraph.getLinks(), function(jlink) {
            if (jlink.attributes.source.id===jnode.id || jlink.attributes.target.id===jnode.id) {
                if (jlink.jnode_vertex && jlink.jnode_vertex.position) {  // See comment for link:pointermove
                    jlink.jnode_vertex.position(jlink.attributes.vertices[0].x-5,jlink.attributes.vertices[0].y-5);
                }
            }
        });
    });

    paper.on('element:mouseenterxxx', function(element) {
    });


    paper.on('element:mouseleavexxx', function(element) {
    });


    // -------------------------------------------------------------
    // ARC ("LINK") EVENTS

    paper.on('link:pointermove', function (jlinkView) {
        var jlink = jlinkView.model;
        // Not sure why jlink does not have a jnode_vertex for one arc.   So following test is
        // a hack to stop the console error messages.  I think, but am not sure, that this
        // is a separate issue from the jnode_vertex on the condition arc not moving when (and 
        // only when) a node on the causal arc it points to is moved.
        if (jlink.jnode_vertex && jlink.jnode_vertex.position) {
            jlink.jnode_vertex.position(jlink.attributes.vertices[0].x-5,jlink.attributes.vertices[0].y-5);
        }
    });


    // This event is triggered in two quite different situations.

    // First, when the user drags an arc to change its shape.   In this case,
    // all we do is recalculate and change the jlink along and offset parameters.

    // Second, when a new jlink is drawn between 2 nodes.   In this case,
    // the temporary link that is drawn as the user moves the mouse between
    // the 2 nodes (a straight line) is replaced by a webAKT one, created with
    // diagram.createJlink().  
    paper.on('link:pointerup', function(linkView) {
        console.log('\nEVENT link:pointerup in diagram.js');
        console.log('linkView.model:',linkView.model);
        console.log('aktType:',AKT.state.aktType);

        var diagram = widget.diagram;
        console.log('diagram:',diagram);

        var jlink = linkView.model;

        // This is for when the user has just finished dragging an existing jlink...
        if (jlink.along) {  // Existing link test: the jlink already has an 'along' property.
            var jlinkParams = jlink.calculateParams(); // Re-calculate the parameters
            jlink.along = jlinkParams.along;
            jlink.offset = jlinkParams.offset;

        // ... and this is for the first time, when a new link has just been dragged.
        } else {   // The jlink doesn't already have an 'along' property.
            var aktType = AKT.state.aktType;  // From the jlink type button the user has clicked.
            console.log(aktType);

            try {
                var along = 0.5;
                var offset = 20;
                jgraph.getCell(linkView.model.id).remove(); // Remove the temporary link -
                                // the straight line displayed when the link is dragged.
                var sourceId = linkView.model.attributes.source.id;
                var targetId = linkView.model.attributes.target.id;
       
                var arc = {
                    id: AKT.makeId('causal_arc',[sourceId,targetId]),
                    start_node: {id:sourceId},
                    end_node: {id:targetId},
                    start_node_id: sourceId,
                    end_node_id: targetId,
                    along: along,
                    offset: offset,
                    akt_type: aktType
                };
                var jlink = diagram.createJlink(arc);
                jlink.addTo(diagram._jgraph);

            } catch (error) {
                console.log(error);
            }
        }
    });


    paper.on('link:mouseover', function(linkView, event) {
        //if ($(widget.element).find('.checkbox_arc_info').is(':checked')) {
        if (true) {
            var jlink = linkView.model;
            //console.log(jlink);
            //console.log(jlink.arc.statements);
            //var x = jlink.attributes.vertices[0].x;
            //var y = jlink.attributes.vertices[0].y;
            if (jlink.arc && jlink.arc.statements) {
                jlinkInfobox.position(event.originalEvent.offsetX+15,event.originalEvent.offsetY);
                //jlinkInfobox.position(x+15,y);  //This is set according to current mouse position.
                var statements = jlink.arc.statements;
                var text = '';
                for (var i=0; i<statements.length; i++) {
                    if (i>0) text += '\n';
                    text += statements[i]._id+': '+statements[i]._formal.replaceAll(',',', ');
                    //var textWrapped = AKT.mywrap(statement._formal,100).wrappedString;
                }
                jlinkInfobox.attr({
                    body:{display:'block'},
                    label:{
                        //text:statement._id+': '+text,
                        textWrap:{text:text,width:200,height:null},
                        display:'block'
                    }
                });
                jlinkInfobox.toFront();
            }
        }
    });


    paper.on('link:pointerclick', function(linkView) {
        console.log('diagram.js: paper.on("link:pointerclick"');
        var jlink = linkView.model;

        if (jlink.selected) {
            jlink.attr({
                line:{
                    stroke:'#dd0000',
                    strokeWidth:2,
                    targetMarker: {
                        'fill': 'green',
                        'stroke': 'none',
                        'type': 'path',
                        'd': 'M 12 -6 0 0 12 6 Z'
                    }
                }
            });
            jlink.selected = false;
        
        } else {
            jlink.attr({
                line:{
                    stroke:'#0000dd',
                    strokeWidth:3,
                    targetMarker: {
                        'fill': 'black',
                        'stroke': 'none',
                        'type': 'path',
                        'd': 'M 12 -6 0 0 12 6 Z'
                    }
                }
            });
            jlink.selected = true;
        }
    });


    paper.on('link:pointerdblclick', function(linkView) {
        console.log('diagram.js: paper.on("link:pointerdblclick"');

        widget.tentativeNewStatementCounter = 0;

        var jlink = linkView.model;
        console.log(3101,jlink);

        var arc = jlink.arc;
        AKT.state.current_arc = arc;

        console.log('\n\n#####\n#####\n#####\n',jlink,'\n\n');

        if (jlink.attributes.akt_type === 'condition') {
            return;
        }

        jlink.attr({
            line:{
                stroke:'green',
                strokeWidth:3
            }
        });
        var sourceId = linkView.model.attributes.source.id;
        console.log(7600,sourceId,jgraph);

        var jnodeSource = jgraph.getCell(sourceId);
        console.log('jnodeSource:',jnodeSource);
        AKT.state.currentSourceNode = jnodeSource;
        console.log(3102,jnodeSource);
        jnodeSource.attr({
            body:{
                stroke:'blue',
                strokeWidth:1
            }
        });
        var targetId = linkView.model.attributes.target.id;
        var jnodeTarget = jgraph.getCell(targetId);
        console.log('jnodeTarget:',jnodeTarget);
        AKT.state.currentTargetNode = jnodeTarget;
        jnodeTarget.attr({
            body:{
                stroke:'blue',
                strokeWidth:1
            }
        });
        console.log(7601,sourceId,targetId);
        console.log(7602,jnodeSource,jnodeTarget);
        AKT.state.current_jnodes = {source:jnodeSource,target:jnodeTarget};

        var kbId = AKT.state.current_kb;

        //console.log(7603,arc.statements);
        //for (var i=0; i<arc.statements.length; i++) {
        //    var statement = arc.statements[i];
        //    console.log(7604,statement._id);
        //}

        var dialog = $(widget.element).find('.link_causes1way_dialog');
        dialog.find('.span_source').text(jnodeSource.makeNodeName(jnodeSource.json)+': '+jnodeSource.makeNodeFormal(jnodeSource.json));
        dialog.find('.span_target').text(jnodeTarget.makeNodeName(jnodeTarget.json)+': '+jnodeTarget.makeNodeFormal(jnodeTarget.json));
        $(dialog).find('.table_values').empty();

        // Only build up a table of values if at least one of cause or effect has attribute values.
        if (jnodeSource.json[0] === 'attribute' || jnodeTarget.json[0] === 'attribute'){
            //var tr = $(dialog).find('.table_values').append('<tr></tr>');
            var tr = $('<tr></tr>');
            $(tr).append('<td></td>');

            $(tr).append('<td style="padding-right:10px;">Statement ID</td>');
            if (jnodeSource.json[0] === 'attribute'){
                $(tr).append('<td style="padding-right:10px;">Cause attribute value</td>');
            }
            if (jnodeTarget.json[0] === 'attribute'){
                $(tr).append('<td>Effect attribute value</td>');
            }
            $(dialog).find('.table_values').append(tr);

            if (arc.statements) {
                for (var i=0; i<arc.statements.length; i++) {
                    var tr = $('<tr data-status="existing_statement"></tr>');

                    $(tr).append('<td><input type="checkbox"></input></td>');
                    var statement = arc.statements[i];
                    console.log(7604,statement._id);

                    $(tr).append('<td class="'+statement._id+'">'+statement._id+'</td>');

                    if (jnodeSource.json[0] === 'attribute'){
                        $(tr).append('<td contenteditable style="border:solid 1px black;padding:5px;" data-role="cause">'+statement._arc.start_value+'</td>');
                    }

                    if (jnodeTarget.json[0] === 'attribute'){
                         $(tr).append('<td contenteditable style="border:solid 1px black;padding:5px;" data-role="effect">'+statement._arc.end_value+'</td>');
                   }
                   $(dialog).find('.table_values').append(tr);
                }
            }
        }

        dialog.css({display:'block'});
    });


// ==================================== CUSTOM EVENT LISTENERS =====================

    // This custom event is triggered when the graph is ready to be rendered,
    // i.e. when the Springy.Renderer's "done()" method (in the Diagram.
    // graphLayoutSpringy method) is being executed.
    $(document).on('diagram_ready_event', function(event,args) {
        console.log(args);
        if (AKT.state.diagram_counter >= 1) {
            var diagram = AKT.state.current_diagram;  // The object, not the ID
            diagram.render('jointjs');
        }
    });


    // This custom event is triggered when a node has been edited, and the OK button
    // clicked.
    $(document).on('node_edited_event', function(event,args) {
        console.log(args);
    });


// ==================================  FUNCTIONS  ==================================


    // --------------------------------------------------------------------------------

    function process_node_or_link_button(button, group, aktType) {
        if (AKT.state.aktType === aktType) {
            $('.diagram_button_left').css({border:'solid 1px #808080', background:'#f0f0f0'});
            AKT.state.aktType = 'pointer';
            if (group === 'link') {
                _.each(jgraph.getElements(), function(el) {
                    el.removeAttr('body/magnet').removeAttr('text/pointer-events');
                });
            }
        } else {
            $('.diagram_button_left').css({border:'solid 1px #808080', background:'#f0f0f0'});
            $(button).css({border:'solid 1px #808080', background:'#88ff88'});
            AKT.state.aktType = aktType;
            console.log('====',group,aktType);
            if (group === 'link') {
                _.each(jgraph.getElements(), function(el) {
                    el.attr('body/magnet', true).attr('text/pointer-events', 'none');
                });
            }
        }
    }


    function makeId(aktType) {
        count[aktType] += 1;
        return aktType+count[aktType];
    }


    function resetAll(paper) {
        console.log('\n******* resetAll()');
        paper.drawBackground({
            color: 'white'
        })

        var elements = paper.model.getElements();
        for (var i = 0, ii = elements.length; i < ii; i++) {
            var currentElement = elements[i];
            currentElement.attr('body/stroke', 'black');
            currentElement.on('change', function () {
                console.log('xxx');
            });
        }

        var links = paper.model.getLinks();
        for (var j = 0, jj = links.length; j < jj; j++) {
            var currentLink = links[j];
            currentLink.attr('line/stroke', 'black');
            currentLink.label(0, {
                attrs: {
                    body: {
                        stroke: 'black'
                    }
                }
            })
        }
    }


    function saveDiagramToLocalStorage(jgraph, key) {
        //console.log('\n102 function saveDiagramToLocalStorage',key);
        var jointObject = {nodes:[],links:[]};
        _.each(jgraph.getElements(), function(el) {
            jointObject.nodes.push(el.attributes);
        });
        _.each(jgraph.getLinks(), function(el) {
            jointObject.links.push(el.attributes);
        });
        //console.log(jointObject);
        
        var diagramString = JSON.stringify(jointObject);
        localStorage.setItem(key, diagramString);
    }

    // IMPORTANT: See https://jsfiddle.net/ubj194ps/
    // and my demo at webakt_extra/JointJS,
    // and the svg-pan-zoom page at https://www.npmjs.com/package/svg-pan-zoom?activeTab=readme
    // and this StackOverflow page: https://stackoverflow.com/questions/28431384/how-to-make-a-paper-draggable/35149108#35149108
/*
    const panZoom = svgPanZoom(paper.svg, {
        viewportSelector: paper.layers,
        zoomEnabled: true,
        panEnabled: true,
        controlIconsEnabled: true,
        maxZoom: 2,
        minZoom: 0.1,
        onUpdatedCTM: (function() {
          var currentMatrix = paper.matrix();
          console.log(currentMatrix);
        	return function onUpdatedCTM(matrix) {
             const { a, d, e, f } = matrix;
             const { a: ca, d: cd, e: ce, f: cf } = currentMatrix;         
             const translateChanged = (e !== ce || f !== cf)
             if (translateChanged) {
	             paper.trigger('translate', e - ce, f - cf);
             }
             const scaleChanged = (a !== ca || d !== cd);         
             if (scaleChanged) {
	             paper.trigger('scale', a, d, e, f);
             }
             currentMatrix = matrix;
          }
        })()
    });
*/
    console.log('End of setup');
};




AKT.widgets.diagram_details.display = function (widget) {
    console.log('\ndiagram:display() ',AKT.state,widget.options);

    var mode = widget.options.mode;

    if (mode === 'new') {
        if (AKT.state.diagram_counter >= 1) {
            var diagram = AKT.state.current_diagram;  // The object, not the ID
            diagram.render('jointjs');
        }

    } else if (mode === 'view') {
        var diagram = widget.options.item;
        var diagramId = widget.options.item_id;
        var subgraph = diagram._subgraph;
        diagram.convertSystoToJoint(subgraph, widget.jgraph);  // 15 April 2025 New version
        diagram._jgraph = widget.jgraph;
        diagram.render('jointjs');

    } else if (mode === 'edit') {
        var diagram = widget.options.item;
        var diagramId = widget.options.item_id;
        var subgraph = diagram._subgraph;
        diagram.convertSystoToJoint(subgraph, widget.jgraph);  // 15 April 2025 New version
        diagram._jgraph = widget.jgraph;
        diagram.render('jointjs');
    }
};




AKT.widgets.diagram_details.html = `
<div class="content" style="border:none;padding:5px;">

    <!-- ============== statement popup ================== -->
    <div class="popup div_statement" style="position:absolute; visibility:hidden; left:20px; top:50px; padding:4px; width:500px; border:solid 3px blue; background:#eeffee; z-index:10000;">Statement...</div>

    <!-- ============== diagram metadata popup ================== -->
    <div class="popup div_meta" style="position:absolute; display:none; left:20px; top:50px; padding:4px; width:300px; border:solid 3px blue; background:#eeffee; z-index:10000;">
        <div>ID</div><div class="div_id" class="float:left;" contenteditable style="width:70px;height:20px;border:solid 1px black;"></div><br/>
        <div>Title</div><div class="div_title" class="float:left;" contenteditable style="width:200px;height:20px;border:solid 1px black;"></div><br/>
        <div>Memo</div><div class="div_memo" class="float:left;" contenteditable style="width:200px;height:100px;border:solid 1px black;"></div><br/>
        <button class="button_meta_ok" style="float:right;">OK</button>
        <button class="button_meta_cancel" style="float:right;">Cancel</button>
    </div>



    <!-- ============== top div ================= -->
    <div class="top_div div_editting" style="width:100%; background:#d4d0c8;">
        <div style="float:left; margin-left:10px;">
            <input type="radio" id="all" name="view" value="all" checked>
            <label for="all">all</label>
            <input type="radio" id="causal" name="view" value="causal" style="margin-left:10px;">
            <label for="causal">causal</label>
            <input type="radio" id="link" name="view" value="link" style="margin-left:10px;">
            <label for="link">link</label>
        </div>
        <!--input type="button" style="float:left;margin-left:8%;" id="'+instance+'_copy_to_clipboard" value="Copy to Clipboard"-->
        <!--input type="button" style="float:left;margin-left:8%;" id="load_acheampong" value="Load acheampong">
        <input type="button" style="float:left;margin-left:8%;" id="show_acheampong" value="Show acheampong"-->

        <div class="div_topics">
            <div style="float:left;margin-left:30px;">Topic</div>
            <select class="listbox_topics" style="float:left; margin-left:5px;"></select>
            <input type="button" style="float:left;margin-left:10px;" class="button_display" value="Display">
        </div>

        <button class="button_topic_details" title="This opens up the standard topic_details panel for the selected topic.">Topic details</button>
        <button class="button_topic_display" title="This generates a layout for the selected topic, and displays it.">Display topic</button>
        <button class="button_diagram_redisplay" title="This generates a new layout for the whole diagram, and re-displays it.">Re-display diagram</button>
        <button class="button_update" title="This adds the diagram to the current knowledge base, or modifies it if it exists alread.">Update</button>

        <!-- Pension off the following 3 lines -->
        <input type="button" class="button_update" style="float:left;margin-left:10px;" value="Update">
        <input type="button" class="button_load" style="float:left;margin-left:10px;" id="'+instance+'_load diagram_load" value="Load">
        <input type="button" onclick="layout();" style="float:left;margin-left:3%;" id="'+instance+'_menu" value="Menu">
    </div>

    <!-- ============== main div ================= -->
    <!-- The container for left_div, right_div and diagram_div -->
    <div class="main_div w3-row">

        <!-- ============== left div ================= -->
        <div class="left_div w3-col w3-left w3-container div_editting" style="margin-top:0px; padding:5px; width:110px;">
            <fieldset style="position:static;">
                <legend>Add node</legend>
                <input type="button" class="button_add_node button_add_attribute diagram_button_left node_attribute" data-category="node" data-akt_type="attribute" value="Attribute"><br>
                <input type="button" class="button_add_node button_add_object diagram_button_left node_object" data-category="node" data-akt_type="object" value="Object"><br>
                <input type="button" class="button_add_node button_add_process diagram_button_left node_process" data-category="node" data-akt_type="process"  value="Process"><br>
                <input type="button" class="button_add_node button_add_action diagram_button_left node_action" data-category="node" data-akt_type="action" value="Action"><br>
             </fieldset>

            <fieldset style="position:static;">
                <legend>Add link</legend>
                <input type="button" class="button_add_link button_add_causes1way diagram_button_left link_causes1way" data-category="link" data-akt_type="causes1way" value="Causes1way" style="width:60px;"><br>
                <input type="button" class="button_add_link button_add_causes2way diagram_button_left link_causes2way" data-category="link" data-akt_type="causes2way" value="Causes2way" style="width:60px;"><br>
                <input type="button" class="button_add_link button_add_link diagram_button_left link_link" data-category="link" data-akt_type="link" value="Link" style="width:60px;"><br>
                <input type="button" class="button_add_link button_add_link diagram_button_left link_condition" data-category="link" data-akt_type="condition" value="Condition" style="width:60px;"><br>
             </fieldset>

            <fieldset style="position:static;">
                <legend>Delete</legend>
                <input type="button" class="button_delete_node_or_link diagram_button_left" value="Node/Link" style="width:60px;"><br>
             </fieldset>

            <fieldset style="position:static;">
                <legend>Hide</legend>
                <input type="button" disabled class="button_hide_node_or_link diagram_button_left" value="Node/Link" style="width:60px;"><br>
             </fieldset>'

            <fieldset style="position:static;">
                <legend>Show/Hide</legend>
                <input type="checkbox" disabled class="checkbox_node_info" style="float:left;" value="node_info" style="width:60px; color:#c0c0c0;">&nbsp;Node info</input><br/>
                <input type="checkbox" disabled class="checkbox_arc_info" style="float:left;" value="arc_info" style="width:60px; color:#c0c0c0;">&nbsp;Arc info</input>
             </fieldset>
        </div>    <!-- End of left div -->

        <!-- ============== right div ================= -->
        <div class="right_div w3-col w3-right w3-container div_editting" style="margin-top:0px; padding:5px; width:130px;">
            <fieldset style="position:static;">
                <legend>Zoom</legend>
                <input type="button" class="button_zoom_in diagram_button_right" value="Zoom in">
                <input type="button" class="button_zoom_out diagram_button_right" value="Zoom out">
                <input type="button" disabled class="button_centre_zoom diagram_button_right" value="Centre Zoom">
             </fieldset>

            <fieldset style="position:static;">
                <legend>Label Mode</legend>
                <input type="button" disabled class="button_label_mode_left" style="float:left;" value="&lt;">
                <input type="button" disabled class="button_label_mode_right" style="float:left;" value="&gt;">
                <input type="button" disabled class="button_label_mode_auto" style="float:left; width:40px;" value="Auto">
             </fieldset>

            <fieldset style="position:static;">
                <input type="button" disabled class="button_refresh diagram_button_right" value="Refresh">
                <input type="button" disabled class="button_show_paths diagram_button_right" value="Show Paths">
                <input type="button" disabled class="button_print_window diagram_button_right" value="Print Window">
                <input type="button" disabled class="button_statements diagram_button_right" value="Statements">
            </fieldset>

            <fieldset style="position:static;">
                <legend>Explore</legend>
                <input type="button" disabled class="button_navigate diagram_button_right" value="Navigate">
                <input type="button" disabled class="button_sources diagram_button_right" value="Sources">
                <input type="button" disabled class="button_causes diagram_button_right" value="Causes">
                <input type="button" disabled class="button_effects diagram_button_right" value="Effects">
                <input type="button" disabled class="button_undo diagram_button_right" value="Undo">
             </fieldset>

            <fieldset style="position:static;">
                <legend>Select Diagram</legend>
                <input type="button" disabled class="button_select_diagram_left" style="float:left; width:44px;" value="&lt;">
                <input type="button" disabled class="button_select_diagram_right" style="float:left; width:44px;" value="&gt;">
             </fieldset>
        </div>

        <!-- =========== diagram div =================== -->
        <div id="paper" class="w3-rest w3-container div_paper" style="background:white; width:500px; height:500px;"></div>

    </div>  <!-- End of main_div, the w3.css container for left_div, right_div and diagram_div -->


    <!-- =========== DIALOGS ======================================================================= -->

    <!-- =========== link_causes1way_dialog ============ -->
    <div class="dialog always_on_top link_causes1way_dialog" style="display:none;position:absolute;border:solid 1px black; background:white; left:50px;top:80px;padding-bottom:10px;z-index:100000;">

        <div class="dialog_title" style="background:#ffa0a0;">
            <div class="dialog_id">link_causes1way_dialog</div>link_causes1way_dialog
        </div>

        <div class="dialog_body" style="border:none; padding:10px;">
            <div><span>Cause: </span><span class="span_source"></span></span></div>
            <div><span>Effect:</span><span class="span_target"></span></span></div>

            <div>
                <table class="table_values" style="border-spacing:10px 0px;margin-top:10px;"></table>
                <!--table class="table_attribute_cause_values" style="float:left;">
                    <tr>
                        <th>Cause attribute's value</td>
                    </tr>
                    <tr>
                        <td class="cause_value_1"><input type="text" style="background:white;"></input></td>
                    </tr>
                    <tr>
                        <td class="cause_value_2"><input type="text" style="background:white;"></input></td>
                    </tr>
                    <tr>
                        <td class="cause_value_3"><input type="text" style="background:white;"></input></td>
                    </tr>
                </table>
                <table class="table_attribute_effect_values" style="float:left;">
                    <tr>
                        <th>Effect attribute's value</td>
                    </tr>
                    <tr>
                        <td class="effect_value_1"><input type="text" style="background:white;"></input></td>
                    </tr>
                    <tr>
                        <td class="effect_value_2"><input type="text" style="background:white;"></input></td>
                    </tr>
                    <tr>
                        <td class="effect_value_3"><input type="text" style="background:white;"></input></td>
                    </tr>
                </table --->
                <div style="clear:both;"></div>
            </div>

            <input type="button" class="link_causes1way_dialog_add" style="float:left;margin-left:10px;" value="Add">
            <input type="button" class="link_causes1way_dialog_view" style="float:left;margin-left:50px;" value="View">
            <input type="button" class="link_causes1way_dialog_edit" style="float:left;margin-left:10px;" value="Edit">
            <input type="button" class="link_causes1way_dialog_delete" style="float:left;margin-left:10px;" value="Delete">
            <input type="button" class="link_causes1way_dialog_ok" style="float:right;" value="OK">
            <input type="button" class="link_causes1way_dialog_cancel" style="float:right;" value="Cancel">
        </div>
    </div>     <!-- End of dialog div -->



    <!-- ------------------------------------------------------------------------ -->
    <!-- Node template dialog (container element for the node_details.js widget) -->
    <!--div id="div_node_details_dialog" class="dialog always_on_top" style="display:none; position:absolute; border:solid 1px black; background:#d4d0c8;left:50px;top:80px;z-index:100000">
    </div-->


    <!-- =========== save_diagram_local_storage ============ -->
    <div id="save_diagram_local_storage" class="dialog always_on_top" style="display:none; position:absolute; border:solid 1px black; background:#d4d0c8;left:20px;top:40px;width:300px;height:185px;z-index:100000">

        <div class="dialog_title">
            <div class="dialog_id">save_diagram_local_storage</div>save_diagram_local_storage<input type="button" value="X" class="dialog_close_button"/>
        </div>

        <div class="dialog_body" style="border:none;background:#d4d0c8; padding:10px;height:162px;">
            <input type="text" style="float:right;" id="save_diagram_local_storage_title">
            <label for="save_diagram_local_storage_title" style="margin-right:5px;float:right;">Diagram title</label>
            <br/>
            <input type="button" id="save_diagram_local_storage_ok" style="float:right;" value="OK">
            <input type="button" id="save_diagram_local_storage_cancel" style="float:right;" value="Cancel">
        </div>
    </div>     <!-- End of dialog div -->


    <!-- =========== load_diagram_local_storage ============ -->
    <div class="div_load_diagram_local_storage dialog always_on_top" style="display:none; position:absolute; border:solid 1px black; background:#d4d0c8;left:20px;top:40px;width:300px;height:185px;z-index:100000">

        <div class="dialog_title">
            <div class="dialog_id">load_diagram_local_storage</div>load_diagram_local_storage<input type="button" value="X" class="dialog_close_button"/>
        </div>

        <div class="dialog_body" style="border:none;background:#d4d0c8; padding:10px;height:162px;">
            <div contenteditable style="float:right;background:white;border:solid 1px #808080;width:100px;height:20px;" class="div_load_diagram_local_storage_title"></div>
            <label style="margin-right:5px;float:right;">Diagram title</label>
            <br/>
            <input type="button" class="button_load_diagram_local_storage_ok" style="float:right;" value="OK">
            <input type="button" class="button_load_diagram_local_storage_cancel" style="float:right;" value="Cancel">
        </div>
    </div>     <!-- End of dialog div -->



    <!-- =========== make_subdiagram ============ -->
    <div id="make_subdiagram" class="dialog always_on_top" style="display:none; position:absolute; border:solid 1px black; background:#d4d0c8;left:20px;top:40px;width:300px;height:185px;z-index:100000">

        <div class="dialog_title">
            <div class="dialog_id">make_subdiagram</div>make_subdiagram<input type="button" value="X" class="dialog_close_button"/>
        </div>

        <div class="dialog_body" style="border:none;background:#d4d0c8; padding:10px;height:162px;">
            <input type="text" style="float:right;" id="make_subdiagram_title">
            <label for="make_subdiagram_title" style="margin-right:5px;float:right;">Search expression</label>
            <br/>
            <input type="button" id="make_subdiagram_ok" style="float:right;" value="OK">
            <input type="button" id="make_subdiagram_cancel" style="float:right;" value="Cancel">
        </div>
    </div>     <!-- End of dialog div -->
</div>
`;


