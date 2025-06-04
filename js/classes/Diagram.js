
class Diagram {
    
    constructor(id,spec) {
        console.log(9120,spec);
        self = this;
        //thisDiagram = this;
        if (id) {
            this._id = id;
        } else {
            this._id = Math.round(10000*Math.random());
        }
        if (spec.title) {
            this._title = spec.title;
                } else {
            this._title = 'no title';
        }
        if (spec.memo) {
            this._memo = spec.memo;
                } else {
            this._memo = 'no memo';
        }
        if (spec.subgraph) {
            if (spec) {
                this._language = 'systo';
                this._subgraph = spec.subgraph;
            } else {
                this._subgraph = {meta:{},nodes:{},arcs:{}};
            }
        } else if (spec.language === 'joint') {
            this._language = 'joint';
            this._joint = {nodes:[],links:[]};
            this._joint.nodes = spec.joint.nodes;
            this._joint.links = spec.joint.links;
        }
        this.jnodeLookup = {};  // Map to lookup jnode from webAKT node.
    }



    // diagram.calculateJlinkParams and diagram.calculateJlinkVertex are the converse
    // of each other.   Note that, while each is a Diagram method, it is stateless,
    // depending purely on its arguments.

    // diagram.calculateJlinkParams(x1,y1,x2,y2,xm,ym) 
    // takes 3 coordinates for the arc (for the start node, end node and vertex), and calculates
    // the arc's 'along' and 'offset' parameters.
    // This is called when the user drags the arc to change its shape.

    // diagram.calculateJlinkVertex(x1,y1,x2,y2,along,offset)
    // takes the arc's 'along' and 'offset parameters, and works out the coordinates of the vertex.  
    // This is called when the arc is first created, and also when the user drags the source or target node.

    // x1,y1: centre of source node
    // x2,y2: centre of target node
    // xc,yc: position of arc control point
    // xm,ym: position of nearest point on line to (xc,yc)
    // along: proportional distance along the straight line
    // offset: distance from line to control point
    // https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line - See section "Another formula"



    calculateJlinkParams (jlink) {
        if (jlink.attributes.vertices) {
            var sourceId = jlink.get('source').id;
            var targetId = jlink.get('target').id;
            var source = this._jgraph.getCell(sourceId);
            var target = this._jgraph.getCell(targetId);

            var sx = source.attributes.position.x + 25;
            var sy = source.attributes.position.y + 15;
            var tx = target.attributes.position.x + 25;
            var ty = target.attributes.position.y + 15;
            var vx = jlink.attributes.vertices[0].x;
            var vy = jlink.attributes.vertices[0].y;
            
            // Equation of straight line between (x1,y1) and (x2,y2): y = mx+k
            var m = (ty-sy)/(tx-sx);   // the slope
            var k = sy-m*sx;           // the constant - value of y when x=0

            var mx = (vx+m*vy-m*k)/(m**2+1);
            var my = m*mx + k;

            var along = (mx-sx)/(tx-sx);
            var offset = Math.sqrt((vx-mx)**2+(vy-my)**2);  // Always positive.

            // To work out which side the arc bends on, we need to work out
            // which side of the straight line between nodes the vertex is on.
            // To do this, we work out the y value for the vertex's x value, and
            // compare that with the vertex's y value.  This depends on the x
            // position of the source and target nodes.
            var qy = m*vx + k;
            if ((sx<tx && vy<qy) || (sx>tx && vy>qy)) {
                offset = -1*offset;
            }

        } else {   // Shouldn't be used.
            along = 0.5;
            offset = 20;
        }
        jlink.along = along;
        jlink.offset = offset;
        return {along:along, offset:offset};
    }


    calculateJlinkVertex (jlink) {
        //console.log(jlink);
        var sourceId = jlink.get('source').id;
        var targetId = jlink.get('target').id;
        var source = this._jgraph.getCell(sourceId);
        var target = this._jgraph.getCell(targetId);
    
        var sx = source.attributes.position.x + 25;
        var sy = source.attributes.position.y + 15;
        var tx = target.attributes.position.x + 25;
        var ty = target.attributes.position.y + 15;
        var along = jlink.along;
        var offset = jlink.offset;

        var mx = sx+(tx-sx)*along;
        var my = sy+(ty-sy)*along;
        var hyp = Math.sqrt((tx-sx)**2 + (ty-sy)**2);

        var vx = mx-(ty-sy)*offset/hyp;
        var vy = my+(tx-sx)*offset/hyp;

        jlink.set('vertices', [{x:vx, y:vy}]);
        return {x:vx, y:vy};
    }



    convertJointToSysto (jgraph) {
        // April 2025 Major revamp, to make it more obvious about what is going on.

        console.log(1234,jgraph.getElements());
        console.log(1234,jgraph.getLinks());

        var subgraph = {};    // Reminder: "subgraph" is my term for a Systo-syntax graph which 
            // is a subset of the whole KB's graph of causal statements.  It is called subgraph
            // precisely because it is a subset.  
        subgraph.meta = {
            id: this._id,
            name: 'no_name',
            language: 'systo',
            author: 'Robert Muetzelfeldt',
            title: 'no_title',
            description: 'no_description'
        };

        subgraph.nodes = {};
        var elements = jgraph.getElements();   // "elements" is JointJS's term for nodes plus other
            // things which I ignore.
        for (var i=0; i<elements.length; i++) {
            var element = elements[i];
            console.log('\n\n6401 *****************\n',element);
            if (element.id.includes('-')) {
                // Ignore if it's not a regular node.
                // Nov 2024. This is a terrible hack.    I'm not sure why these nodes are in the joint
                // version.  Using the Domini topic as an example, there is one node ID with a long
                // hyphen-separated hex string.
                //console.log(4501,'NO',jointNode);
            } else if (element.id.includes('VERTEX')) {
                console.log(6402,' VERTEX');
                var systoNodeId = element.id.replace(/\n/g,"_").replace(/__/g,"_");  // April 2025 The 2nd operation
                    // should be redundant, since __ should not occur.
                var systoNode = {    // Properties akt_type and json not relevant for a vertex node.
                    akt_type: 'vertex',
                    id: systoNodeId,
                    label: systoNodeId,
                    centrex: element.attributes.position.x,
                    centrey: element.attributes.position.y
                }
                subgraph.nodes[systoNodeId] = systoNode;
            } else {
                var systoNodeId = element.id.replace(/\n/g,"_").replace(/__/g,"_");
                var systoNode = {
                    type: 'object',
                    akt_type: element.akt_type,
                    id: systoNodeId,
                    label: systoNodeId,
                    centrex: element.attributes.position.x,
                    centrey: element.attributes.position.y,
                    json:    element.json
                };
                subgraph.nodes[systoNodeId] = systoNode;
            }
        };

        // Now handle all the JointJS links (Systo arcs)
        subgraph.arcs = {};
        var links = jgraph.getLinks();
        console.log(1600,jgraph);
        console.log(1601,links);
        for (var i=0; i<links.length; i++) {
            var link = links[i];
            if (link.arc) {
                var startNodeId = link.arc.start_node_id;
                var endNodeId = link.arc.end_node_id;
                var systoArc = {
                    akt_type: link.arc.akt_type,
                    start_node_id: startNodeId.replace(/\n/g,"_").replace(/__/g,"_"),
                    end_node_id: endNodeId.replace(/\n/g,"_").replace(/__/g,"_")
                };
                var temp = startNodeId + '_TO_' + endNodeId;
                var systoArcId = temp.replace(/\n/g,"_").replace(/__/g,"_");
                systoArc.id = systoArcId;
                subgraph.arcs[systoArcId] = systoArc;
            }
        };

        this._subgraph = subgraph;
        console.log(4503,this._subgraph);
        return subgraph;

        function getNodeIdFromJointNodeId(jnodes,jnodeId) {
            for (var i=0; i<jnodes.length; i++) {
                var jnode = jnodes[i];
                if (jnode.id === jnodeId) {
                    console.log(8882,jnodeId,jnode);
                    //var result = jointNode.attrs.label.text;
                    var result = jnode.id;
                    return result;
                }
            }
            console.log(8883);
            return 'xxxxx';
        }
    }


    // This is not really a conversion, since it is only used to get systoNode.centrex/centrey
    // values to populate the systoNode instance.

    convertSpringyToSysto () {
        var subgraph = this._subgraph;
        var springy = this._springy;
        for (var i=0; i<springy.node.length; i++) {
            subgraph.centrex = springy.nodes[i].position.x;
            subgraph.centrey = springy.nodes[i].position.y;
        }
        
        // Still trying to decide if conversion methods change Diagram instance state!
        this._subgraph = subgraph;
        return subgraph;
    }


    convertSystoToSpringy () {
        var springy = {nodes:[],edges:[]};
        for (nodeId in this._subgraph.nodes) {
            springy.nodes.push(nodeId);
        }
        for (arcId in this._subgraph.arcs) {
            springy.arcs.push(arcId);
        }

        // Still trying to decide if conversion methods change Diagram instance state!
        this._springy = springy;
        return springy;
    }


// =================================================================================
// =================================================================================
// This section converts a Systo graph to a set of JointJS nodes and arcs ("jnodes" and "jlinks"),
//  and adds them to the JointJS graph.

    // 'node' always means an AKT node, i.e. in the sense used in the AKT manual
    // to refer to the nodes in a (causal) diagram.
    // 'jnode' refers to a Joint node, the object created when you call joint.shapes.standard....();
    // 'arc' refers to an AKT causal link.   'jlink' refers to a Joint link.
    // The prefix akt for aktType is used since the term 'type' has a totally different
    // meaning in AKT and Joint.   In AKT, it is one of attribute, object, process or action.
    // In Joint, it is a type of shape.
    // The node properties id, label, x and y have the same meaning in both contexts.

    // 15th April 2025 Keeping the same name, but changing the way it works.   Previously,
    // it did as the name suggests: convert a Systo graph ("subgraph" in webAKT) to a Joint 
    // graph ("jgraph").   Now, it tkes in a jgraph, and ADDS the nodes and arcs it gets
    // from the Systo graph.    

    convertSystoToJoint (subgraph, jgraph) {
        console.log('\n\n\n===============================\nconvertSystoToJoint(subgraph)\nSysto subgraph',subgraph);
        //var jgraph = this._jgraph;
        //var jgraph = new joint.dia.Graph;
        //this._jgraph = jgraph;
        console.log(5300,subgraph,jgraph);

        for (var nodeId in subgraph.nodes) {
            var node = subgraph.nodes[nodeId];
            delete node.start_node;
            delete node.end_node;
            if (node) {
                var jnode = this.createJnode(node);
                if (jnode) {   // In case something goes wrong...
                    jnode.addTo(jgraph);
                    console.log('\n5301\n',node,'\n',jnode);
                }
            }
        }
        console.log(jgraph);

        for (var arcId in subgraph.arcs) {
            var arc = subgraph.arcs[arcId];
            if (arc.akt_type !== 'condition'){
                console.log('\n8101 non-condition arc:',arc);
                if (arc) {
                    //var n = arc.statements.length;
                    var jlink = this.createJlink(arc);
                    if (jlink) {   // In case something has gone wrong...
                        //console.log(81011,jlink);
                        jlink.addTo(jgraph);
                    }
                }
            }
        }

        for (var arcId in subgraph.arcs) {
            var arc = subgraph.arcs[arcId];
            if (arc.akt_type === 'condition'){
                console.log('\n8102 condition arc:',arc);
                if (arc) {
                    var jlink = this.createJlink(arc);
                    if (jlink) {   // In case something goes wrong...
                        console.log(81021,jlink);
                        jlink.addTo(jgraph);
                    }
                }
            }
        }



        console.log(5305,jgraph);
        return jgraph;  // Probably unnecessary, since it's an object, and passed 
                // in as an argument.
/*
        for (var arcId in subgraph.arcs) {
            var arc = subgraph.arcs[arcId];
            if (arc) {
                var jlink = this.createJlink(arc);
                if (jlink) {   // In case something goes wrong...
                    jlink.addTo(jgraph);
                }
            }
        }
*/
/*
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
*/
    }


    createJnode (node) {
        //console.log('\n\ncreateJnode\n',6601,node);
        var jgraph = this._jgraph;
        //console.log(6602,jgraph);
        var id = node.id;
        if (node.akt_type) {
            var aktType = node.akt_type;
        } else {
            aktType = 'vertex';
        }
        var label = node.label;
        var x = node.centrex;
        var y = node.centrey;
        var json = node.json;
        //console.log(6603,json);

        var label = id.replace(/_/g, ' ');
        var labelWrapped = AKT.mywrap(label,15).wrappedString;

        if (aktType === 'attribute') {  
            var jnode = new joint.shapes.standard.Rectangle({id:id});   
            jnode.id = id;
            jnode.json = json;
            jnode.position(x-25, y-15);
            jnode.resize(50, 30);
            jnode.attr({
                body: {stroke: 'black', strokeWidth: 1, fill:'white'},
                label: {
                    text: labelWrapped,
                    textVerticalAnchor: 'top',
                    textAnchor: 'left',
                    refX: 4,
                    refY: 3,
                    fontSize:9,
                    style: { stroke: 'black', strokeWidth:0.3}
                }
            });
            jnode.akt_type = 'attribute';
            jnode.status = 'no_name';
            jnode.addTo(jgraph);  // I wanted to do in calling function (node_details:ok button), but 
                    // got Joint error.
            jnode.on('change:position', function(thisNode, position) {
                console.log(9899,thisNode);
                updateMidnodes(thisNode,jgraph);
            });
            jnode.attr('body/magnet', true).attr('text/pointer-events', 'none');

        } else if (aktType === 'object') {  
            var jnode = new joint.shapes.standard.Rectangle({id:id});
            jnode.id = id;
            jnode.json = json;
            jnode.position(x-25, y-15);
            jnode.resize(50,30);
            jnode.attr({
                body: {stroke: 'blue', strokeWidth: 1, fill:'white'},
                label: {
                    text: labelWrapped,
                    textVerticalAnchor: 'top',
                    textAnchor: 'left',
                    refX: 4,
                    refY: 3,
                    fontSize:9,
                    style: { stroke: 'black', strokeWidth:0.3}
                }
            });
            jnode.akt_type = 'object';
            jnode.status = 'no_name';
            jnode.addTo(jgraph);
            jnode.on('change:position', function(element, position) {
                updateMidnodes(element,jgraph);
            });
            jnode.attr('body/magnet', true).attr('text/pointer-events', 'none');

        } else if (aktType === 'process') {  
            var jnode = new joint.shapes.standard.Ellipse({id:id});
            jnode.json = json;
            jnode.position(x-25, y-15);
            jnode.resize(50, 30);
            jnode.attr({
                body: {fill: 'white',stroke:'#00ff00',strokeWidth:1},
                label: {
                    text: labelWrapped, 
                    fontSize:9, 
                    style: { stroke: 'black', strokeWidth:0.3}
                }
            });

            jnode.akt_type = 'process';
            jnode.status = 'no_name';
            jnode.addTo(jgraph);
            jnode.on('change:position', function(element, position) {
                updateMidnodes(element,jgraph);
            });
            jnode.attr('body/magnet', true).attr('text/pointer-events', 'none');

        } else if (aktType === 'action') {
            var jnode = new joint.shapes.examples.CustomRectangle({id:id});
            jnode.json = json;
            jnode.position(x-25, y-15);
            jnode.resize(50,30);
            jnode.attr({
                body: {fill: 'white',stroke:'red',strokeWidth:1},
                label: {
                    text:labelWrapped, 
                    fontSize:9, 
                    style: { stroke: 'black', strokeWidth:0.3}
                }
            });

            jnode.akt_type = 'action';
            jnode.status = 'no_name';
            jnode.addTo(jgraph);
            jnode.on('change:position', function(element, position) {
                updateMidnodes(element,jgraph);
            });
            jnode.attr('body/magnet', true).attr('text/pointer-events', 'none');

        } else if (aktType === 'vertexxxx') {  
            var jnode = new joint.shapes.standard.Rectangle({id:id});   
            jnode.id = id;
            jnode.json = json;
            jnode.position(x-3, y-3);
            jnode.resize(7, 7);
            jnode.attr({
                body: {stroke: 'blue', strokeWidth: 1, fill:'yellow'}
            });
            jnode.akt_type = 'vertex';
            jnode.status = 'no_name';
            jnode.addTo(jgraph);
            //jnode.on('change:position', function(element, position) {
            //    self.updateMidnodes(element,jgraph);
            //});
            jnode.attr('body/magnet', true).attr('text/pointer-events', 'none');
        }

        $('.diagram_button_left').css({border:'solid 1px #808080', background:'#f0f0f0'});
        AKT.state.aktType = 'pointer';

        // This is the formal Prolog-style syntax for the node, basically
        // AKT's formal grammar for att_value statements or the components
        // of causal statements, without the value part.
        // This is derived from Statement.generateFormal(), suitably cut down since
        // it's just for node JSON.
        if (jnode) {
            jnode.makeNodeFormal = function (json) {
                    
                var formal = walk(json);
                return formal;

                function walk (part) {
                    if (typeof part === "string") {  
                        return part;

                    } else {   // Unnecessarily generalised, since max of 3 (I think) cases.
                        var result = part[0]+'(';
                        for (var i=1; i<part.length; i++) {
                            var comma = i<part.length-1?',':'';
                            result += walk(part[i])+comma;
                        }
                        result += ')';
                        return result;
                    }
                }
            }

            // Functions added as methods to the JointJs Element class (for nodes),
            // to create various forms of names/labels for a node from the 
            // nodes JSON attribute.
            jnode.makeNodeName = function (json) {
                console.log(7610,json);
                if (typeof json === 'string') {
                    var array = [json];
                } else {
                    var array = json.flat(99);
                }
                var label = '';
                var j = 0;
                for (var i=0; i<array.length; i++) {
                    var a = array[i];
                    if (a!=='attribute' && a!=='part' && a!=='process' && a!=='action' && a!=='object') {
                        j += 1;
                        label += j===1 ? a : '_'+a;
                    }
                }
                console.log('label:',label);
                console.log('------------------------------\n\n');
                return label;
            }

            // This is the label that appears inside the node in the diagram,
            // consisting of the formal terms joined by newlines (\n), so that
            // the label fits inside the nodes box.
            jnode.makeNodeLabelWrapped = function (json) {
                var label1 = this.makeNodeName(json);
                var label2 = label1.replace(/_/g, ' ');
                return AKT.mywrap(label2);
            }

            this.jnodeLookup[id] = jnode;
            return jnode;

        } else {
            console.log('ERROR: Diagram.js  jnode has not been created.\n',
                'id = ',id,'     aktType = ',aktType);
            return null;
        }


        function updateMidnodes (element,jgraph) {
            console.log(9901,element);
            _.each(jgraph.getLinks(), function(jlink) {
                var sourceId = jlink.get('source').id;
                var targetId = jlink.get('target').id;
                if (element.id === sourceId || element.id === targetId) {
                    //var params = self.calculateJlinkVertex(jlink);
                    console.log(9902,jlink);
                    var params = jlink.calculateVertex();
                }
            });
        }

    }


    createJlink (arc) {
        console.log(5701,'createJlink',arc);
        var jgraph = this._jgraph;
        var self = this;

        //try {
            var aktType = arc.akt_type;
            var id = arc.id;
            var sourceId = arc.start_node_id;

            // Hide all vertex nodes (used as target for condition arc).
            _.each(jgraph.getElements(), function(jnode) {
                if (jnode.attributes.size.width === 7) {  // TODO: Horrible way of finding vertex 
                                                          // node on causal arcs for condition arcs.
                    jnode.attr('./display','none');
                }
            });

            var targetId = arc.end_node_id;
            
            var source = jgraph.getCell(sourceId);
            var target = jgraph.getCell(targetId);
            if (source && target) {
                console.log(arc,source,target);
                if (arc.along) {
                    var along = arc.along;
                } else {
                    along = 0.5;
                }
                if (arc.offset) {
                    var offset = arc.offset;
                } else {
                    offset = 20;
                }

/*
                var n = arc.statements.length;
                if (n === 1) {
                    var col = '#dd0000';
                } else { 
                    col = 'black';
                }
*/
                var col = '#dd0000';

                console.log(5702,aktType);

                if (aktType === 'causes1way') {
                    console.log(5703);
                    var jlink = new joint.shapes.standard.Link({
                        akt_id: id,
                        id: id,
                        source: source,
                        target: target,
                        smooth: true,
                        z: -1,
                        akt_type:'causes1way',
                        attrs: {
                            line: {
                                stroke: col,
                                strokeWidth:2,
                                targetMarker: {
                                    'fill': '#dd0000',
                                    'stroke': 'none',
                                    'type': 'path',
                                    'd': 'M 12 -6 0 0 12 6 Z'
                                }
                            }
                        }
                    });
                    if (jlink) {
                        jlink.calculateParams = function () {
                            console.log(7630,self);
                            console.log(this);
                            console.log(7631,jlink);
                            return self.calculateJlinkParams(jlink);
                        }
                        jlink.calculateVertex = function () {
                            return self.calculateJlinkVertex(jlink);
                        }
                        jlink.along = along;
                        jlink.offset = offset;
                        jlink.arc = arc;
                        jlink.addTo(jgraph);
                        jlink.set('akt_id',id);
                        jlink.set('akt_type','causes1way');
                        //jlink.set('akt_type',type);
                        //jlink.set('vertices', [this.calculateJlinkVertex(jlink)]);
                        var vertex = jlink.calculateVertex();
                        jlink.set('vertices', [jlink.calculateVertex()]);

                        var vertexNodeId = AKT.makeId('vertex_node',[sourceId,targetId]);
                        //var jnodeVertex = new joint.shapes.examples.CustomRectangle({id:'VERTEX_'+jlink.id});
                        var jnodeVertex = new joint.shapes.examples.CustomRectangle({id:vertexNodeId});
                        jnodeVertex.position(vertex.x-3, vertex.y-3);
                        jnodeVertex.resize(7,7);
                        jnodeVertex.attr({
                            body: {fill: '#dd0000',stroke:'black',strokeWidth:1}
                        });
                        jnodeVertex.attr('./display','none');
                        jnodeVertex.addTo(jgraph);
                        jlink.jnode_vertex = jnodeVertex;
                    }

                } else if (aktType === 'causes2way') {
                    var jlink = new joint.shapes.standard.Link({
                        akt_id: id,
                        id: id,
                        source: source,
                        target: target,
                        smooth: true,
                        z: -1,
                        type:'causes1way',
                        attrs: {
                            line: {
                                stroke: col,
                                strokeWidth:2,
                                sourceMarker: {
                                    'fill': '#00dd00',
                                    'stroke': 'none',
                                    'type': 'path',
                                    'd': 'M 12 -6 0 0 12 6 Z'
                                },
                                targetMarker: {
                                    'fill': '#00dd00',
                                    'stroke': 'none',
                                    'type': 'path',
                                    'd': 'M 12 -6 0 0 12 6 Z'
                                }
                            }
                        }
                    });
                    if (jlink) {
                        jlink.calculateParams = function () {
                            return self.calculateJlinkParams(jlink);
                        }
                        jlink.calculateVertex = function () {
                            return self.calculateJlinkVertex(jlink);
                        }
                        jlink.along = along;
                        jlink.offset = offset;
                        jlink.addTo(jgraph);
                        jlink.set('akt_id',id);
                        jlink.set('aktType','causes2way');
                        jlink.set('vertices', [this.calculateJlinkVertex(jlink)]);
                    }

                } else if (aktType === 'link') {
                    var along = 0.5;
                    var jlink = new joint.shapes.standard.Link({
                        id: [sourceId,targetId].sort().join(),
                        source: { id: sourceId },
                        target: { id: targetId },
                        along: along,
                        smooth: true,
                        z: -1,
                        akt_type: 'link',
                        attrs: {
                            line:{stroke:'blue'},
                            '.marker-target': { d: 'M 12 0 L 0 6 L 12 12 z'},
                            '.marker-source': { d: 'M 12 0 L 0 6 L 12 12 z'},
                            '.connection': { fill:'blue', stroke: 'blue', 'stroke-width': 3 },
                             sourceMarker: {
                                    'fill': 'green',
                                    'stroke': 'none',
                                    //'d': 'M 5 -10 L -15 0 L 5 10 Z'
                                    'd': 'M 10 -10 L -15 0 L 5 10 Z'
                              }

                        }
                    });
                    jlink.addTo(jgraph);
                    jlink.set('akt_id',id);
                    jlink.set('akt_type','link');
                    jlink.set('vertices', [this.calculateCurveVertexPosition(source, target, along, offset)]);

               
                } else if (aktType === 'condition') {
                    console.log(8710,aktType,id,source,link);
                    var jlink = new joint.shapes.standard.Link({
                        akt_id: id,
                        id: id,
                        source: source,
                        target: target,
                        smooth: true,
                        z: -1,
                        akt_type:'condition',
                        attrs: {
                            line: {
                                stroke: '#dd00dd',
                                strokeWidth:2,
                                targetMarker: {
                                    'fill': '#dd00dd',
                                    'stroke': 'none',
                                    'type': 'path',
                                    'd': 'M 12 -6 0 0 12 6 Z'
                                }
                            }
                        }
                    });
                    if (jlink) {
                        jlink.calculateParams = function () {
                            return self.calculateJlinkParams(jlink);
                        }
                        jlink.calculateVertex = function () {
                            return self.calculateJlinkVertex(jlink);
                        }
                        jlink.along = along;
                        jlink.offset = offset;
                        jlink.arc = arc;
                        jlink.addTo(jgraph);
                        jlink.set('akt_id',id);
                        jlink.set('akt_type','condition');
                        //jlink.set('vertices', [this.calculateJlinkVertex(jlink)]);
                        var vertex = jlink.calculateVertex();
                        jlink.set('vertices', [jlink.calculateVertex()]);
                    }
                }
            } else {
                console.log('\n\nERROR: could not create source or target node.\n\n');
            }
            $('.diagram_button_left').css({border:'solid 1px #808080', background:'#f0f0f0'});
            AKT.state.aktType = 'pointer';
            _.each(jgraph.getElements(), function(el) {
                el.removeAttr('body/magnet').removeAttr('text/pointer-events');
            });


            return jlink;
        //}
/*
        catch(error) {
            console.log('\nERROR while executing diagram.createJlink(arc) in Diagram.js\n',
                'arc:',arc,'\n',
                'error:',error);
            return null;
        }
*/
    }

// =========================================================================
// =========================================================================


    createSystoNode (nodeJson) {
        var kbId = widget.options.kbId;
        var kb = AKT.KBs[kbId];
        var subgraph = kb._subgraph;
        var nodes = subgraph.nodes;
        var arcs = subgraph.arcs;

        var truncated = nodeJson.slice(0,-1);  // Removes the last element, i.e. the value element.
        var flat = truncated.flat(99); // Flattens the possibly-nested array.
        var filtered = flat.filter(function(v) {  // Removes keywords.
            return v!=='attribute' && v!== 'process' && v!== 'action' && v!=='part' && v!=='object';
        });
        var nodeId = filtered.join('_');   // Concatenates into a string.
        nodeIdPair[i] = nodeId;
        // TODO: Add type, x,y...
        nodes[nodeId] = {
            id:nodeId,
            type:'object',
            akt_type: 'attribute',   // !!! ALLOW FOR THE OTHER TYPES !!!
            label:nodeId,
            json:node,
            x:500*Math.random(),y:500*Math.random(),
            statementIds:[statementId]
        };  
    }



// ================================================================================================
// Springy

/* This is what a springyGraphJSON looks like...
springyGraphJSON = {
  "nodes": ["mark", "higgs", "other", "etc"],
  "edges": [
    ["mark", "higgs"],
    ["mark", "etc"],
    ["mark", "other"]
  ]
};
*/
    graphLayoutSpringy () {
        var self = this;

        var springyGraphJson = {nodes:[],edges:[]};
        for (var nodeId in this._subgraph.nodes) {
            springyGraphJson.nodes.push(nodeId);
        }
        for (var arcId in this._subgraph.arcs) {
            var arc = this._subgraph.arcs[arcId];
            springyGraphJson.edges.push([arc.start_node.id,arc.end_node.id]);
        }
        var springyGraph = new Springy.Graph();
        springyGraph.loadJSON(springyGraphJson);
        console.log('903 Initial springyGraph:',springyGraph);
        var layout = new Springy.Layout.ForceDirected(
          springyGraph,
          50.0, // Spring stiffness
          400.0, // Node repulsion
          0.5, // Damping
          1 // Threshold used to determine render stop (default is 0.01)
        );

        var renderer = new Springy.Renderer(
          layout,
          function clear() {
          },
          function drawEdge(edge, p1, p2) {
          },
          function drawNode(node, p) {
            node.p = p;
          },
          function done() {
            console.log(904,'Springy.done');
            var subgraph = self._subgraph;
            var xmin = 0;
            var xmax = 0;
            var ymin = 0;
            var ymax = 0;
            for (var i=0; i<springyGraph.nodes.length; i++) {
                xmin = springyGraph.nodes[i].p.x < xmin ? springyGraph.nodes[i].p.x : xmin;
                xmax = springyGraph.nodes[i].p.x > xmax ? springyGraph.nodes[i].p.x : xmax;
                ymin = springyGraph.nodes[i].p.y < ymin ? springyGraph.nodes[i].p.y : ymin;
                ymax = springyGraph.nodes[i].p.y > ymax ? springyGraph.nodes[i].p.y : xmax;
            }
            var xscale = 1200/(xmax-xmin);
            var yscale = 500/(ymax-ymin);
            if (xscale > 25) xscale = 25;
            if (yscale > 20) yscale = 20;

            for (var i=0; i<springyGraph.nodes.length; i++) {
                var nodeId = springyGraph.nodes[i].id;
                if (nodeId && subgraph.nodes[nodeId]) {
                    subgraph.nodes[nodeId].centrex = 100+Math.round(xscale*(springyGraph.nodes[i].p.x-xmin));
                    subgraph.nodes[nodeId].centrey = 100+Math.round(yscale*(springyGraph.nodes[i].p.y-ymin));
                } else {
                    console.log('*** ERROR',i,nodeId);
                }
            }
            self._subgraph = subgraph;

            //AKT.trigger('diagram_ready_event',{});
            self.render('jointjs');

            //return subgraph;
          },
          function start() {
            AKT.state.layout_counter = 0;
          },
          function frame() {
            AKT.state.layout_counter += 1;
            if (AKT.state.layout_counter % 50 == 0) console.debug(AKT.state.layout_counter);
          }
        );
        renderer.start();
    }



    makeSubgraph (topic,show) {
        if (show) console.log('\n\ndiagram.makeSubgraph');
        // kb.getStatements(filtering by causal and searchExpression)
        
        var kbId = AKT.state.current_kb;
        var kb = AKT.KBs[kbId];

        var subgraph = {nodes:{},arcs:{}};  // This is the subgraph, for this diagram.

        //var statements = kb.findStatements({att_value:false,comparison:false,topic:true,topic_value:searchExpression});

        var filters = {type:{causal:true},topic:{[topic._id]:true}};
        var statements = kb.getStatements(filters);

        
        console.log(9301,Object.keys(statements).length);

        for (var statementId in statements) {
            var statement = statements[statementId];
            var arc = statement._arc;

            // IMPORTANT NOTE, Oct 2023
            // I have no idea why, but for some reason arcs, in the global KB graph (kb._graph.arcs), that had >1 statements
            // associated with them, only had a single statement after the procesesing below.    I fixed it by the 
            // condition if (arc && !subgraph.arcs[arc.id]) {...,   All that does is to save re-creating the subgraph
            // nodes and arc for duplicates, but I can't see why that should have fixed the issue.
            //if (arc) {
            if (arc && !subgraph.arcs[arc.id]) {
                var startNode = arc.start_node;
                var endNode = arc.end_node;
                subgraph.nodes[startNode.id] = startNode;
                subgraph.nodes[endNode.id] = endNode;
                subgraph.arcs[arc.id] = arc;
            }
            var arc1 = statement._arcCondition;
            if (arc1) {
                //if (show) console.log('11111 condition',arc);
                var startNode = arc1.start_node;
                var endNode = arc1.end_node;
                subgraph.nodes[startNode.id] = startNode;
                subgraph.nodes[endNode.id] = endNode;
                subgraph.arcs[arc1.id] = arc1;
            }
            var arc2 = statement._ghostArcCause;
            if (arc2) {
                //if (show) console.log('11111 toCause',arc);
                var startNode = arc2.start_node;
                var endNode = arc2.end_node;
                subgraph.nodes[startNode.id] = startNode;
                subgraph.nodes[endNode.id] = endNode;
                subgraph.arcs[arc2.id] = arc2;
            }
            var arc3 = statement._ghostArcEffect;
            if (arc3) {
                //if (show) console.log('11111 toEffect',arc);
                var startNode = arc3.start_node;
                var endNode = arc3.end_node;
                subgraph.nodes[startNode.id] = startNode;
                subgraph.nodes[endNode.id] = endNode;
                subgraph.arcs[arc3.id] = arc3;
            }
        }

        return subgraph;
    }


    render(library,jgraph) {
        console.log(4400,library,jgraph);
        console.log(this._subgraph);
        this.printSubgraph('Printing from Diagram:render()',this._subgraph);

        //var kbId = AKT.state.current_kb;
        //var kb = AKT.KBs[kbId];
        //var id = 'dd101';
        //var testSubgraph = this.makeStringifiableSubgraph(this._subgraph);
        //kb._diagrams[id] = testSubgraph;
        var widget = AKT.state.current_widget;

        if (!library || library === 'jointjs') {
            var jgraph = AKT.state.current_graph;  // TODO: Fix this hack.

            jgraph.clear();
            widget.jlinkInfobox.addTo(jgraph);
            var jointObject = this.convertSystoToJoint(this._subgraph,jgraph);
            //var jointObject = this.convertSystoToJoint(testSubgraph,jgraph);
            console.log(4401,jointObject);
            return;
/*
            var jnodes = jointObject.nodes;
            var jlinks = jointObject.links;

            _.each(jgraph.getElements(), function(el) {
                el.removeAttr('body/magnet').removeAttr('text/pointer-events');
            });

            for (var i=0; i<jlinks.length; i++) {
                var jlink = new joint.shapes.standard.Link(jlinks[i]);
                jlink.on('change:vertices', function () {
                    var params = self.calculateJlinkParams(jlink);
                    console.log('===',params);
                });
                console.log(i,jlink,jlink.attributes,jlink.attributes.source,jlink.attributes.target);
                var jsource = jgraph.getCell(jlink.attributes.source.id);
                var jtarget = jgraph.getCell(jlink.attributes.target.id);
                console.log(jsource,jtarget);
                if (jsource && jtarget) {   // TODO: temporary hack.  Need to see why some targets are undefined.
                    jlink.along = 0.5; 
                    jlink.offset = 5;
                    self.calculateJlinkVertex(jlink);
                    jlink.addTo(jgraph);
                }
            }
*/

            console.log(4402,JSON.stringify(jgraph.toJSON(),null,4));
        } // End of: if (library==='jointjs')...
    }


    // This method allows for the property value to be computed rather than be a native
    // one for this Class.   See the same method in Statement.js
    getPropertyValue (propertyId) {
        if (this['_'+propertyId]) {
            return this['_'+propertyId];

        } else {
            return null;
        }
    }

    
    // This method makes a simplified version of the subgraph by removing all objects
    // (leaving just their instance IDs), ready for stringifying and saving in Local Storage
    // or file.   Apart from making the subgraph more compact, this removes the risk of 
    // JSON.stringify() failing because of circular references.
    // We use the JSON.parse(JSON.stringify()) pattern to isolate the resulting object
    // from the original subgraph, and to guarantee that it is stringifiable.

    makeStringifiableSubgraph (subgraph) {

        if (subgraph.meta) {
            var meta1 = JSON.parse(JSON.stringify(subgraph.meta));
        } else {
            meta1 = {};
        }

        var nodes1 = JSON.parse(JSON.stringify(subgraph.nodes));

        var arcs = subgraph.arcs;
        var arcs1 = {};
        for (var arcId in arcs) {
            var arc = arcs[arcId];
            var arc1 = {
                akt_type:     arc.akt_type,
                end_node_id:  arc.end_node_id,
                end_value:    arc.end_value,
                id:           arc.id,
                start_node_id:arc.start_node_id,
                start_value:  arc.start_value,
                statement_id: arc.statement_id
            }
            arcs1[arcId] = arc1;
        }
        var arcs2 = JSON.parse(JSON.stringify(arcs1));
        
        return {meta:meta1, nodes:nodes1, arcs:arcs2};
    }


    printSubgraph (label,subgraph) {
        var subgraph1 = this.makeStringifiableSubgraph(subgraph);  // subgraph1 is also an object, 
            // but is isolated from the original subgraph so can be modified without affecting
            // the original version.
        console.log('\n\nOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO\n',label,'\n');
        console.log(JSON.stringify(subgraph1,null,4));
        console.log('\noooooooooooooooooooooooooooooooooooooo');
    }


}
