// This file(mainly) contains event handlers for dialog controls, ordered
// alphabetically.

// A note on the use of event.stopPropagation()...
// This is added to *every* event handler, on the grounds that the *only*
// thing we want to do with that event is the immediate task of actioning
// whatever control was interacted with (e.g. button clicked, listbox 
// selection made).   It is important to stop events bubbling up to the 
// level of the panel, because there is a general-purpose handler (for the 
// selector '.panel') which brings it to the top whenever the body of the 
// panel is clicked.  If we didn't intercept clicks on buttons etc, then 
// any such click would bring its panel to the top, which is what we do not
// want if the job of the click is to open up a new dialog panel.



$(document).ready(function() {

    //AKT.cola = cola;
    //console.log('webakt1: ',cola);

    //AKT.KBs['atwima'].generateCsv();
    
    //var termx = new Termx({term:'a1'});
    //console.log(termx);


    //console.log($('#my_iframe').contents().find("p").text());

    $('section').css({display:'none'});

    var spec = {};
    spec.tree = {top:['a','b','c','d'],c:['e','f']};
    var hierarchyDisplay = new HierarchyDisplay(spec);


    // Text-to-speech - search below for test_text_to_speech()
    //AKT.text_to_speech('Click on the View button');


    // -----------------------------------------------------------------------------
    // ACTION LOGS



    for (var logId in AKT.action_logs) {
        $('#select_action_log_open').append('<option value="'+logId+'">'+logId+'</option>');
    }


    $('#select_action_log').on('change', function() {
        var logId = $(this).selected();
        console.log('open_action_log:',logId);
        var current_action_log = AKT.action_logs[logId];
        AKT.state.current_action_log = current_action_log;
    })
 


    // -----------------------------------------------------------------------------

    AKT.state.pendingEvent = null;

    var actionLogString = localStorage.getItem('current_action_log');
    if (actionLogString) {
        try {
            AKT.state.current_action_log = new ActionLog(JSON.parse(actionLogString));
        }
        catch(error) {
            console.log('ERROR - cannot parse current_action_log in LocalStorage.');
            console.log('error:',error);
            localStorage.removeItem('current_action_log');
            AKT.state.current_action_log = new ActionLog({actions:[],meta:{}})       }
    } else {
        console.log('WARNING - No current_action_log in LocalStorage.');
        AKT.state.current_action_log = new ActionLog({actions:[],meta:{}});
    }


    $('body').on('click','button', function(event) {

        console.log('$$$$',AKT.state);
        if (AKT.state.action_mode !== 'recording') return;

        console.log(event);
        console.log(AKT.state);
        var localId = $(event.target).attr('local_id');

        var value = $(event.target).text();
        console.log('\n\n\n\n',AKT.state.current_action_log._actions.length+' 010000000000000000000\nclick: button: '+value+': '+localId);
        event.stopPropagation();

        if (AKT.state.pending_event) {
            AKT.processPendingEvent(event,AKT.state.pending_event);
        }

        var top = $(event.target.closest('.panel'));
        if (top && top[0]) {
            
            var id = top[0].id;

            if (localId === 'button_close') {
                var panelId = id;
                $('#panel_list').find('.'+panelId).remove();
                $('#'+panelId).remove();
                $('#'+panelId)['dialog_Generic']('destroy');
                $('#'+panelId).css({display:'none'});
            }

            AKT.incrementZindex("$('body').on('click','button', function(event) {...})",id);
            var localId = $(event.target).attr('local_id');
            var value = $(event.target).text();
            var eventType = event.type;
            var elementType = event.target.localName;

            var actionSpec = {
                element_id: id,
                selector: '[local_id="'+localId+'"]',
                type:           eventType,
                message:        'Clicked on a button',
                before:         'previous_action',
                after:          'next_action',
                prompt:         'Click on a button',
                value:          value,
                event_type:     'click',
                upper_selector: '#'+id,
                local_selector: '[local_id="'+localId+'"]'
            }
            AKT.state.current_action_log.add(actionSpec);
        }
    });




    $('body').on('click','div.panel',function(event) {
        if (AKT.state.action_mode !== 'recording') return;

        console.log('\n\nmousedown: div.panel: ',event);
        console.log(event);
        console.log(AKT.state);
        var localId = $(event.target).attr('local_id');

        var value = $(event.target).text();
        //console.log('\n\n\n\n',AKT.state.current_action_log._actions.length+' 000000000000000000000\nclick: button: '+value+': '+localId);
        event.stopPropagation();

        if (AKT.state.pending_event) {
            AKT.processPendingEvent(event,AKT.state.pending_event);
        }

        var top = $(event.target.closest('.panel'));
        if (top && top[0]) {
            
            var id = top[0].id;
            var panelId = id;

            var actionSpec = {
                element_id: id,
                selector:       '#'+id,
                type:           'click',
                message:        'Clicked on a panel',
                before:         'previous_action',
                after:          'next_action',
                prompt:         'Click anywhere in the panel '+id,
                value:          null,
                event_type:     'click',
                upper_selector: '#'+id,
                local_selector: null
            }
            AKT.state.current_action_log.add(actionSpec);
/*
            var zindex = $('#'+panelId).css('z-index');
            console.log('zindex before:',panelId,zindex);
            var zindex = AKT.incrementZindex("webakt1.js: $('body').on('click','div.panel',...): click. ID:"+panelId,1);
            $('#'+panelId).css('z-index',zindex);
            console.log('zindex after:',panelId,zindex);
*/
        }
    });



    $('body').on('mousedown','div.div_title',function(event) {
        if (AKT.state.action_mode !== 'recording') return;

        console.log('\n\nmousedown: div.div_title: ',event);
        AKT.state.panel_start = {x:event.clientX,y:event.clientY};
    });


    $('body').on('mouseup','div.div_title',function(event) {
        if (AKT.state.action_mode !== 'recording') return;

        console.log('\n\nmouseup: div.panel.titlebar: ',event);
        var start = AKT.state.panel_start;
        var end = {x:event.clientX,y:event.clientY}
        if (Math.abs(start.x-start.y,end.x-end.y)<10) {
            return;
        } else {
            var top = $(event.target.closest('.panel'));
            if (top && top[0]) {
                var id = top[0].id;
                AKT.incrementZindex("$('body').on('click','button', function(event) {...})",id);
                var localId = 'statement_collection_1';   //$(event.target).attr('local_id');
                var value = $(event.target).text();
                var eventType = event.type;
                var elementType = event.target.localName;

                var actionSpec = {
                    element_id:     id,
                    selector:       '[local_id="'+localId+'"]',
                    type:           'end_drag',
                    message:        'Clicked on a button',
                    before:         'previous_action',
                    after:          'next_action',
                    prompt:         'Click on a button',
                    value:          end,
                    event_type:     'end_drag',
                    upper_selector: '#'+id,
                    local_selector: '[local_id="'+localId+'"]'
                }
                AKT.state.current_action_log.add(actionSpec);
            } else {
                return;
            }
        }
    });




    $('body').on('click','div.div_expand_collapse', function(event) {
        if (AKT.state.action_mode !== 'recording') return;

        var localId = $(event.target).parent().attr('local_id');
        var value = $(event.target).text();
        console.log('\n\n\n\n',AKT.state.current_action_log._actions.length+' 0000000000000000000123\nclick: tr.treetable_tr: '+value+': '+localId);
        console.log(event);
        console.log(AKT.state);
        event.stopPropagation();

        if (AKT.state.pending_event) {
            AKT.processPendingEvent(event,AKT.state.pending_event);
        }

        var top = $(event.target.closest('.panel'));
        if (top && top[0]) {
            
            console.log(top[0].id);
            console.log($(event.target));
            console.log($(event.target).parent());
            console.log($(event.target).parent().parent());
            console.log($(event.target).parent().parent().parent());
            var id = top[0].id;
            var localId = $(event.target).attr('local_id');
            var value = $(event.target).text();
            var eventType = event.type;
            var elementType = event.target.localName;

            var actionSpec = {
                element_id: id,
                selector: '[local_id="'+localId+'"]',
                type:           eventType,
                message:        'Clicked on a treetable_tr',
                before:         'previous_action',
                after:          'next_action',
                prompt:         'Click on a treetable_tr',
                value:          value,
                event_type:     'click',
                upper_selector: '#'+id,
                local_selector: '[local_id="'+localId+'"]'
            }
            AKT.state.current_action_log.add(actionSpec);
        }
    });




    $('body').on('click','div.div_id', function(event) {
        if (AKT.state.action_mode !== 'recording') return;

        var localId = $(event.target).parent().attr('local_id');
        var value = $(event.target).text();
        console.log('\n\n\n\n',AKT.state.current_action_log._actions.length+' 0000000000000000000124\nclick: tr.treetable_tr: '+value+': '+localId);
        console.log(event);
        console.log(AKT.state);
        event.stopPropagation();

        if (AKT.state.pending_event) {
            AKT.processPendingEvent(event,AKT.state.pending_event);
        }

        var top = $(event.target.closest('.panel'));
        if (top && top[0]) {
            
            console.log(top[0].id);
            console.log($(event.target));
            console.log($(event.target).parent());
            console.log($(event.target).parent().parent());
            console.log($(event.target).parent().parent().parent());
            var id = top[0].id;
            var localId = $(event.target).attr('local_id');
            var value = $(event.target).text();
            var eventType = event.type;
            var elementType = event.target.localName;

            var actionSpec = {
                element_id: id,
                selector: '[local_id="'+localId+'"]',
                type:           eventType,
                message:        'Clicked on a treetable_tr',
                before:         'previous_action',
                after:          'next_action',
                prompt:         'Click on a treetable_tr',
                value:          value,
                event_type:     'click',
                upper_selector: '#'+id,
                local_selector: '[local_id="'+localId+'"]'
            }
            AKT.state.current_action_log.add(actionSpec);
        }
    });



    $('body').on('input','textarea', function(event) {
        if (AKT.state.action_mode !== 'recording') return;

        console.log('\n\n\n\n',AKT.state.current_action_log._actions.length+' 0000000000000000000000000000000000000\ninput: textarea');
        event.stopPropagation();

        if (AKT.state.pending_event) {
            AKT.processPendingEvent(event,AKT.state.pending_event);
        }
        AKT.state.pending_event = event;
    });


    $('body').on('input','input[type="text"]', function(event) {
        if (AKT.state.action_mode !== 'recording') return;

        console.log('\n\n\n\n',AKT.state.current_action_log._actions.length+' 1200000000000000000000000000000000000\ninput: input[type="text"]');
        event.stopPropagation();

        if (AKT.state.pending_event) {
            AKT.processPendingEvent(event,AKT.state.pending_event);
        }
        AKT.state.pending_event = event;
    });


    $('body').on('click','input[type="checkbox"]', function(event) {
        if (AKT.state.action_mode !== 'recording') return;

        console.log(6011,event);
        //console.log('\n\n\n\n',AKT.state.current_action_log._actions.length+' 0000000000000000000000000000000000000\ninput: input[type="checkbox"]');
        event.stopPropagation();

        if (AKT.state.pending_event) {
            AKT.processPendingEvent(event,AKT.state.pending_event);
        }

        var top = $(event.target.closest('.panel'));
        console.log(6012,top);
        if (top && top[0]) {
            console.log(6013,top[0]);
            var id = top[0].id;
            var localId = $(event.target).attr('local_id');
            var value = $(event.target).is(':checked');
            var eventType = event.currentTarget.type;
            var elementType = event.target.localName;

            var actionSpec = {
                element_id:   id,
                element_type: elementType,
                selector:     '[local_id="'+localId+'"]',
                type:         eventType,
                event_type:   'click',
                input_type:   'checkbox',   //event.target.type,
                message:      'Clicked on checkbox',
                before:       'next_action',
                prompt:       'Click on a button',
                value:        value,
                upper_selector: '#'+id,
                local_selector: '[local_id="'+localId+'"]'
           }
            AKT.state.current_action_log.add(actionSpec);
            console.log(6014,actionSpec);
        }
    });




    $('#panel_list').on('click','.panel_list_item', function(event) {
        if (AKT.state.action_mode !== 'recording') return;

        console.log(event);
        console.log(AKT.state);
        var localId = $(event.target).attr('local_id');

        var value = $(event.target).text();
        console.log('\n\n\n\n',AKT.state.current_action_log._actions.length+' 000000000000000000000\nclick: button: '+value+': '+localId);
        event.stopPropagation();

        if (AKT.state.pending_event) {
            AKT.processPendingEvent(event,AKT.state.pending_event);
        }

        var id = 'panel_list';

        AKT.incrementZindex("$('body').on('click','button', function(event) {...})",id);
        var localId = $(event.target).attr('local_id');
        var eventType = event.type;
        var elementType = event.target.localName;

        var actionSpec = {
            element_id: id,
            selector: '[local_id="'+localId+'"]',
            type:           eventType,
            message:        'Clicked on a button',
            before:         'previous_action',
            after:          'next_action',
            prompt:         'Click on a button',
            value:          value,
            event_type:     'click',
            upper_selector: '#'+id,
            local_selector: '[local_id="'+localId+'"]'
        }
        AKT.state.current_action_log.add(actionSpec);
    });


    $('body').on('click','input[type="radio"]', function(event) {
        if (AKT.state.action_mode !== 'recording') return;

        console.log(6001);
        //console.log('\n\n\n\n',AKT.state.current_action_log.actions._length+' 0000000000000000000000000000000000000\ninput: input[type="radio"]');
        event.stopPropagation();

        if (AKT.state.pending_event) {
            AKT.processPendingEvent(event,AKT.state.pending_event);
        }

        var top = $(event.target.closest('.panel'));
        console.log(6002,top);
        if (top && top[0]) {
            console.log(6003,top[0]);
            var id = top[0].id;
            var localId = $(event.target).attr('local_id');
            var value = $(event.target).is(':checked');
            var eventType = event.type;
            var elementType = event.target.localName;

            var actionSpec = {
                element_id: id,
                selector: '[local_id="'+localId+'"]',
                type: eventType,
                event_type:   'click',  
                input_type:   'radio',   //event.target.type,
                message:'Clicked on a button',
                before:'previous_action',
                after:'next_action',
                prompt:'Click on a button',
                value: value,
                upper_selector: '#'+id,
                local_selector: '[local_id="'+localId+'"]'
           }
            AKT.state.current_action_log.add(actionSpec);
            console.log('\n\n== '+actionSpec);
        }
    });


    $('body').on('change','select', function(event) {
        if (AKT.state.action_mode !== 'recording') return;

        console.log('\n\n\n\n',AKT.state.current_action_log._actions.length+' 0000000000000000000000000000000000000\nchange:select');
        event.stopPropagation();

        console.log(3331,event);
        console.log(3332,$(event.target).val(),$(event.currentTarget).val());

        if (AKT.state.pending_event) {
            AKT.processPendingEvent(event,AKT.state.pending_event);
        }

        var top = $(event.target.closest('.panel'));
        if (top && top[0]) {
            
            var id = top[0].id;
            var localId = $(event.target).attr('local_id');
            var value = $(event.target).val();
            var eventType = event.type;
            var elementType = event.target.localName;

            var actionSpec = {
                element_id: id,
                selector: '[local_id="'+localId+'"]',
                type: eventType,
                message:'Changed the selected option in a select element',
                before:'previous_action',
                after:'next_action',
                prompt:'Choose an option',
                value: value,
                upper_selector: '#'+id,
                local_selector: '[local_id="'+localId+'"]'
            }
            AKT.state.current_action_log.add(actionSpec);
        }
    });



    $('body').on('click','trxxx', function(event) {
        if (AKT.state.action_mode !== 'recording') return;

        console.log('\n\n\n\n',AKT.state.current_action_log._actions.length+' 0000000000000000000000000000000000000\nclick:tr');
        //event.stopPropagation();

        console.log(3341,event);
        console.log(3342,$(event.target).val(),$(event.currentTarget).val());
        console.log(3343,$(event.target).text(),$(event.currentTarget).text());
        console.log(3344,$(event.target).parent().attr('local_id'));
        console.log(3344,$(event.target).parent().parent().attr('local_id'));

        if (AKT.state.pending_event) {
            AKT.processPendingEvent(event,AKT.state.pending_event);
        }

        var top = $(event.target.closest('.panel'));
        if (top && top[0]) {
            
            var id = top[0].id;
            var localId = $(event.target).parent().parent().attr('local_id');
            var value = $(event.target).val();
            var eventType = event.type;
            var elementType = event.target.localName;

            var actionSpec = {
                element_id: id,
                selector: '[local_id="'+localId+'"]',
                type: eventType,
                message:'Changed the selected option in a select element',
                before:'previous_action',
                after:'next_action',
                prompt:'Choose an option',
                value: value
            }
            AKT.state.current_action_log.add(actionSpec);
        }
    });

    // function AKT.processPendingEvent(event,pendingEvent) {} Put into webakt.js



    var a = 'a1';
    var ol = {a1:99};
    var ol1 = {[a]:98};

    var termx = new Termx({term_id:'a1'});
    termx.addTerm('b1');

            var URL = 'help.html';
            //var URL = 'help.html#ref_'+subname;
            //var URL = 'help.html ref_'+'formal_term_details';
            //$(this).append('<a href="'+URL+'" class="popup">+</a>');
            var name = '_blank';
            var specs = 'location=yes,height=570,width=520,scrollbars=yes,status=yes';
            //window.open(URL, name, specs);
            //window.open('https://www.bbc.co.uk', name, specs);
            console.log('AKT.state:',AKT.state);

    // Dialog windows
    $( "#dialog1" ).dialog({
        autoOpen:  false,
        closeText: ''
    });

/*
    var diagram = new Diagram('diagram1','systo',{meta:{},nodes:{},arcs:{}});
    diagram.convertCausalToSysto();
    console.log(diagram);
    diagram.graphLayoutCola();
    console.log(diagram);
    //diagram.graphLayoutSpringy();
*/
    //console.debug(JSON.stringify(AKT.kbs.atwima,null,4));
/*
    var allStatements = AKT.kbs[AKT.state.current_kb].sentences;
    var statements = AKT.booleanSearch(allStatements,'trees');
    var aktGraph = AKT.makeGraphFromStatements(statements);
    console.debug(aktGraph);
    var aktGraphLayouted = AKT.graphLayoutSpringy(aktGraph);
    console.debug(aktGraphLayouted);
    //var jointGraph = AKT.makeJointGraph(aktGraphLayouted);
    //console.debug(jointGraph);
*/

    // ===============================================================
    // Read a KB in from a local file
    // This is totally orthodox method.
    // Credits: https://stackoverflow.com/questions/4408707/jquery-read-text-file-from-file-system
    window.onload = function(event) {
        //document.getElementById('file_open').addEventListener('change', handleFileSelect, false);
    }

    // -----------------------------------------------------
    // Monitor all events (with a view to making an event-playback mechanism...)
    //$(document.body).on("click mousedown mouseup focus blur keydown change",function(e){
    //     console.log(e);
    //});

    // ------------------------------------------------------

    //$('#dialog_Metadata').dialog_Metadata();

/*
  // Writing a KB to file.
  // This is unorthodox, probably deprecated, and might not work in the future.
    // From http://jsfiddle.net/bntoejzh/
    var textFile = null;
    var makeTextFile = function (text) {
        var data = new Blob([text], {type: 'text/plain'});

        // If we are replacing a previously generated file we need to
        // manually revoke the object URL to avoid memory leaks.
        if (textFile !== null) {
            window.URL.revokeObjectURL(textFile);
        }

        textFile = window.URL.createObjectURL(data);
        return textFile;
      };

      var create = document.getElementById('create');
      //var textbox = document.getElementById('textbox');

      create.addEventListener('click', function () {
          var link = document.getElementById('downloadlink');
          //link.href = makeTextFile(textbox.value);

          // TODO: check this out.  Not sure why it is "atwima1" 
          // Get name from the textbox?
          // Make up a name, and tell the user?
          link.href = makeTextFile(JSON.stringify(AKT.kbs.atwima1));
          link.style.display = 'block';
      }, false);
*/

    $('#node_object_dialog').draggable();
    $('#node_attribute_dialog').draggable();
    $('#link_causes1way_dialog').draggable();

    //var kbId = AKT.state.current_kb;

    $('#welcome').css({display:"none"});
    $('#menus').css({display:"block"});

    //var formalTerms = AKT5.formal_terms(kbId,111);
    
    //var topicTree = AKT.makeTree(kbId,"subtopics");

    //var objectTree = AKT.makeTree(kbId,"subobjects");

    AKT.processMenus();
	AKT.processFileSystemAccessAPI(); 

/*
let el1 = document.getElementById('menu_file_openkb');
el1.addEventListener('click', async () => {
  // Destructure the one-element array.
  [fileHandle] = await window.showOpenFilePicker();
  // Do something with the file handle.
  const file = await fileHandle.getFile();
  const contents = await file.text();
  console.log(contents);
});
*/

/*  May 2023
    for (var kbId in AKT.kbs) {
        var kb = AKT.kbs[kbId];
        AKT.KBs[kbId] = new Kb({name:kbId,kb_from_file:kb});
        $('#menu_kb_selectkb').find('ul').append(
            '<li id="menu_kb_selectkb_'+kbId+'" class="menus-dropdown submenu leaf live" style="background:rgb(212,208,200);">'+
                '<a href="#" style="background: rgb(212, 208, 200); color: rgb(0, 0, 0);">'+kbId+'</a>'+
            '</li>');
    }
    AKT.changeKb('atwima');
    var kb = AKT.KBs['atwima'];
    kb.extractFormalTerms();

    //kb.crosscheckFormalTerms();

    var kbIds = [];
    for (kbId in AKT.kbs) {
        kbIds.push(kbId);
    }
*/

    // 'current_kb' is the last KB used, whatever its ID.
	AKT.loadKbFromLocalStorage('current_kb');


    //AKT.KBs.atwima.buildKbFromCsv(AKT.bulk.statements,AKT.bulk.sources);

    //AKT.loadSubmenus('menu_kb_selectkb',kbIds,false);

    //var filteredStatements = AKT.KBs.atwima.filter({type:'attribute'}).filter({conditional:'yes'});
    //var filteredStatements = AKT.KBs.atwima.filter({formal_term:'nyanya'});
    //console.log(AKT.KBs.atwima._filteredStatements);

    $('#zoom_in').on('click', function() {
        console.debug('zoom_in');
        $('#workspace').css({transform:'scale(1)'});
    });
    $('#zoom_out').on('click', function() {
        console.debug('zoom_out');
        $('#workspace').css({transform:'scale(0.6)','transform-origin': '0 0 0'});
    });

    // Miscellaneous event handlers for built-in dialog windows
    $('#button_file_new').on('click',function() {
        var a = $('#input_file_new').val();
        console.log('.button_file_new button clicked');
        alert('clicked '+a+'...'+b);
    });

/*
    console.log('button event handler');
    $('button').on('click',function(event,aaa) {
        console.log('--- button event:',event,aaa);
    });
*/
/*
    var sentences = AKT.kbs[kbId].sentences;
    for (var i=0; i<sentences.length; i++) {
        var sentence = sentences[i];
        var json = AKT.convert_formal_to_json(sentence.formal);
        if (json) {
            var english = AKT.convert_json_to_english(json);
            if (english) {
                sentence.english = english.replace(/  /g," ");
            } else {
                sentence.english = 'ERROR json>english: '+sentence.formal;
                console.debug(sentence.english);
            }
        } else {
            sentence.english = 'ERROR formal>json: '+sentence.formal;
            console.debug(sentence.english);
        }           
    }
*/
    // Elements that respond to a click highlighted in yellow.
    $('#welcome60').css({background:'yellow'});
    $('.dialog_close_button').css({background:'yellow'});
    $('#boolean_search110').css({background:'yellow'});
    $('#boolean_search800').css({background:'yellow'});
    $('#general_memo101').css({background:'yellow'});
    $('#topicHierarchies400').css({background:'yellow'});
    $('#addtopic101').css({background:'yellow'});
    $('#macros102').css({background:'yellow'});
    $('#macros400').css({background:'yellow'});
    $('#macros_montage102').css({background:'yellow'});
    $('#macros_montage400').css({background:'yellow'});
    $('#statementdetails100').css({background:'yellow'});
    $('#statementdetails102').css({background:'yellow'});
    $('#statementdetails802').css({background:'yellow'});
    $('#topicHierarchies103').css({background:'yellow'});
    $('#topicHierarchies400').css({background:'yellow'});
    $('#topic_hierarchy402').css({background:'yellow'});
    $('#topic_hierarchy102').css({background:'yellow'});
    $('#topic_hierarchy104').css({background:'yellow'});
    $('#topic_hierarchy105').css({background:'yellow'});
    $('#topic_hierarchy107').css({background:'yellow'});
    $('#topic_hierarchy108').css({background:'yellow'});
    $('#viewallstatements102').css({background:'yellow'});
    $('#viewallstatements400').css({background:'yellow'});

    $('.panel').draggable({containment:'#workspace',handle:".title-bar"});

    AKT.menusClickHandler($('#menus'));

/*
    if (!AKT.kbs[kbId].extras) {
        AKT.kbs[kbId].extras = {};
    }
    var topicTree = AKT.makeTree(kbId, "subtopics");
    AKT.kbs[kbId].extras.topicTree = topicTree;
*/
    $('#div_node_template_dialog').css({display:'none'});



    $(document).on('keydown',function(event) {
        //console.log('--',event,'--');
        //console.log(AKT.state);
        //console.log('****');
        if (AKT.state.stepping_through_recording) {
            //var nextEventMessage = AKT.action_list._actions[AKT.state.stepCounter+1]._prompt;
            $('#message').html(nextEventMessage);
            var key = event.originalEvent.key;
            //if (key === 'a') {
            //    AKT.action_list.oneStep(AKT.action_list._actions);
            //}
        }
    });


    // For getting filename, see https://stackoverflow.com/questions/24245105/how-to-get-the-filename-from-the-javascript-filereader
    function handleFileSelect(event) {
        var mode = 'text';   // 'json'
        var fileReader = new FileReader();
        fileReader.fileName = document.getElementById('file_open').files[0].name;
        console.log('##1 ',fileReader.fileName);
        fileReader.onload = function(event) {
            var fileName = event.target.fileName;
            var fname = fileName.substring(0,fileName.lastIndexOf('.'));
            var kbId = fname;
            console.log('\n===', fname);
            var kbText = event.target.result;
            console.debug(kbText);
            if (mode === 'json') {
                var kbObject = JSON.parse(kbText);
                console.log(kbObject);
                //AKT.state.current_kb = kbId;
                AKT.changeKb(kbId);
                AKT.kbs[kbId] = kbObject;
            } else {    // text
                var lines = kbText.split('\n');
                for (var i=0; i<lines.length; i++) {
                    if (lines[i].charAt(0) !== '%' && lines[i].charAt(0) !== '') {
                        console.log('\n',lines[i]);
                        var bits = lines[i].split(':');
                        var sourceId = bits[0];
                        var formal = bits[1];
                        console.log('...'+formal+'...');
                        var json = AKT.convert_formal_to_json(formal);
                        console.log(json);
                        if (json) {
                            var english = AKT.translate(json);
                            //console.debug(english);
                        } else {
                            //alert('Error in the line "'+lines[i]);
                        }
                    }
                }
            }
            var li = '<li id="menu_kb_selectkb_'+fname+
                '" class="menus-dropdown submenu leaf live '+fname+'" style="background:white;" name="'+fname+'"><a href="#">'+fname+
                '</a></li>';
            $('#menu_kb_closekb > ul').append(li);
            $('#menu_kb_selectkb > ul').append(li);
            $('#menu_kb_freezeopenkb > ul').append(li);
        }
        var file = event.target.files[0];
        fileReader.readAsText(file);
        document.getElementById('file_open').value = null;
        $('#open_kb').css({display:'none'});
    }
	


});

