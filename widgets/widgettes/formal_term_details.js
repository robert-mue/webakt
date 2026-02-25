// Local test images
// file:///home/robert/Projects/AKT/webakt/dev/test_image_access.gif
// file:///home/robert/Projects/AKT/webakt/dev/images/Panicum_maximum_reduced.jpg

AKT.widgets.formal_term_details = {};


// Original CSS for slider tool is at the bottom of this file, commented out.

AKT.widgets.formal_term_details.setup = function (widget) {

    console.log('^widgets.formal_term_details^setup()^options='+AKT.simpleStringify(widget.options));
    AKT.state.current_widget = widget;
    var self = this;

    // Thanks to https://webdesign.tutsplus.com/how-to-build-a-simple-carousel-with-vanilla-javascript--cms-41734t 

    console.log('window',AKT.state.window);

    var kbId = widget.options.kbId;
    var kb = AKT.KBs[kbId];

    if (widget.options.mode === 'new') {
        var formalTerm = new FormalTerm({kb:kb});
    } else if (widget.options.mode === 'view' || widget.options.mode === 'edit') {
        var formalTerm = widget.options.item;
        var formalTermSpec = formalTerm.makeSpec();
    }

    //var widgetSettings = $('<div></div>');
    //$(widget.element).find('.content').prepend(widgetSettings);

    // Note: We modify the display of some elements (depending on mode=new/view/edit) 
    // here, at widgie creation time.  This will do for the time being, but may have
    // to be shifted to the display function if/when we allow the same panel to be
    // used repeatedly (instead of creating a new one each time, as now).
    // Note: the 'modal' class indicates that the display style for the element 
    // depends on the mode (i.e. new,view or edit).
    var mode = widget.options.mode;

	if (mode === "new") {
        $(widget.element).find('button').filter('.modal').attr('disabled',false);
        $(widget.element).find('div').filter('.editable').attr('contenteditable',true);

        $(widget.element).find('[local_id="button_update"]').on('change', function(event) {
            console.log('\n***on_change\nwidgetName: ',widgetName, '\noptionId: ',optionId, '\n$(this).val(): ',$(this).val());
            $(widgetElement).blur();
        });
	
	} else if (mode === 'view') {
		$(widget.element).find('.button_update').css({display:'none'});
        $(widget.element).find('button').filter('.modal').attr('disabled',true);
		$(widget.element).find('.button_add_image').css({display:'none'});
		$(widget.element).find('.button_remove_image').css({display:'none'});
        $(widget.element).find('div').filter('.editable').attr('contenteditable',false);
        $(widget.element).find('.input_id').val(widget.options.item_id);
        $(widget.element).find('.div_type').append('<div class="modes_view_and_edit" disabled style="padding-left:3px;font-weight:bold; background:white;">'+formalTerm._type+'</div>');
        $(widget.element).find('.div_language').append('<div class="modes_view_and_edit" disabled style="padding-left:3px;font-weight:bold; background:white;">'+formalTerm._language+'</div>');
        //$(widget.element).find('.div_name').prop('disabled',true);
        if (widget.options.item._type !== 'object') {
            $(widget.element).find('.button_in_hierarchy').css({display:'none'});
		}

	} else if (mode === 'edit') {
        $(widget.element).find('button').filter('.modal').attr('disabled',false);
        $(widget.element).find('div').filter('.editable').attr('contenteditable',true);
        $(widget.element).find('.input_id').val(widget.options.item_id);
        $(widget.element).find('.div_type').append('<div class="modes_view_and_edit" disabled style="padding-left:3px;font-weight:bold; background:white;">'+formalTerm._type+'</div>');
        $(widget.element).find('.div_language').append('<div class="modes_view_and_edit" disabled style="padding-left:3px;font-weight:bold; background:white;">'+formalTerm._language+'</div>');
        //$(widget.element).find('.div_name').prop('disabled',true);
        if (widget.options.item._type !== 'object') {
            $(widget.element).find('.button_in_hierarchy').css({display:'none'});
		}
		
	} else {
		alert('System error in hierarchy_details.js\nNot your fault\nUnrecognised mode '+mode+' in setup()');
        return;
	}


    // ----------------------------------------------------------------------
    // User interaction event handlers

    $(widget.element).find('[local_id="select_type"]').on('change', function(event) {
        console.log(4503,event);
        console.log(4504,$(this).val());
        //$(this).prop('selected',false);
    });





    $(widget.element).find('[local_id="button_statements"]').on('click', function(event) {
        if (AKT.state.action_mode !== 'recording') {
            event.stopPropagation();
        }
        console.log('Clicked on Statements button');
        var kbId = widget.options.kbId;
        var kb = AKT.kbs[kbId];

        var eventShiftKey = event ? event.shiftKey : null;
/*
        var panel = AKT.panelise({
            widget_name:'statements',
            position:{left:'200px',top:'20px'},
            size:{width:'550px',height:'540px'},
            shift_key: event.shiftKey,
            options:{kbId:kbId, filters:{formal_term:true,formal_term_value:tempFormalTerm._id}}
        });
*/
        var panel = AKT.panelise({
            widget_name:'collection',
            position:{left:'20px',top:'20px'},
            size:{width:'550px',height:'540px'},
            shift_key: eventShiftKey,
            options:{kbId:AKT.state.current_kb,item_type:'statement',filters:{formal_term:{[formalTerm._id]:true}}}
        });
/*
        var action = new Action({
            element_id: widget.element[0].id,
            selector:   '.button_statements',
            type:       'click',
            file:       'formal_term_details.js',
            function:   "$(widget.element).find('.button_statements').on('click', function(event) {})",
            message:    'Clicked on the Statements button in the formal_term_details.js widgette.',
            prompt:     'prompt',
            value:      tempFormalTerm._id
        });
        console.log(9001,action);
        AKT.action_list.add(action);
*/
/*
        AKT.recordEvent({
            file:'formal_term_details.js',
            function:'AKT.widgets.formal_term_details.setup()',
            element:widget.element,
            finds:['.button_statements'],
            event:'click',
            value: tempFormalTerm._id,
            message:'Clicked on the Statements button in the formal_term_details panel.'
        });
*/
    });


    $(widget.element).find('[local_id="button_images"]').on('click', function(event) {
        if (AKT.state.action_mode !== 'recording') {
            event.stopPropagation();
        }
        console.log('Clicked on Images button');
        var kbId = widget.options.kbId;
        var kb = AKT.kbs[kbId];

        var eventShiftKey = event ? event.shiftKey : null;

        var panel = AKT.panelise({
            widget_name:'images',
            position:{left:'200px',top:'20px'},
            size:{width:'550px',height:'540px'},
            shift_key: event.shiftKey,
            //options:{kbId:kbId, filters:{formal_term:true,formal_term_value:tempFormalTerm._id}}
            options:{kbId:kbId, filters:{}}
        });
/*
        var action = new Action({
            element_id: widget.element[0].id,
            selector:   '.button_images',
            type:       'click',
            file:       'formal_term_details.js',
            function:   "$(widget.element).find('.button_images').on('click', function(event) {})",
            message:    'Clicked on the Images button in the formal_term_details.js widgette.',
            prompt:     'prompt',
            value:      tempFormalTerm._id
        });
        AKT.action_list.add(action);

        AKT.recordEvent({
            file:'formal_term_details.js',
            function:'AKT.widgets.formal_term_details.setup()',
            element:widget.element,
            finds:['.button_images'],
            event:'click',
            value: tempFormalTerm._id,
            message:'Clicked on the Images button in the formal_term_details panel.'
        });
*/

    });


    $(widget.element).find('[local_id="button_in_hierarchy"]').on('click', function(event) {
        if (AKT.state.action_mode !== 'recording') {
            event.stopPropagation();
        }
        console.debug('Clicked on In hierarchy button');
        var kbId = widget.options.kbId;
        var kb = AKT.KBs[kbId];

        var nodeId = widget.options.item_id;
        var hierarchies = kb._objectHierarchies;

        var hierarchyId = null;
        var hierarchyIds = [];
        $.each(hierarchies, function(id,hierarchy) {
            var hier = hierarchies[id];
            var nodes = hier.getAllDescendants(hier._root);
            if (nodes.includes(nodeId)) {
                console.log('yes!',nodeId,'is in',hier._id);
                hierarchyId = hier._id;
                hierarchyIds.push(hierarchyId);
            } else {
                console.log('no!',nodeId,'is not in',hier._id);
            }
        });

        for (var i=0; i<hierarchyIds.length; i++) {
            hierarchyId = hierarchyIds[i];
            hierarchy = hierarchies[hierarchyId];
            var panel = AKT.panelise({
                widget_name:'hierarchy_details',
                position:{left:'20px',top:'20px'},
                size:{width:'450px',height:'540px'},
                shift_key: event.shiftKey,
                options:{kbId:kbId, mode:'view', tree_type:'object', item_type:'object_hierarchy', item:hierarchy, item_id:hierarchyId, extra:formalTerm._id}
            });
        }

        // Obsolete code - left in as reminder to fix it.
        AKT.recordEvent({
            file:'formal_term_details.js',
            function:'AKT.widgets.formal_term_details.setup()',
            element:widget.element,
            finds:['.button_in_hierarchy'],
            event:'click',
            value: formalTerm._id,
            message:'Clicked on the In Hierarchy button in the formal_term_details panel.'
        });

    });


    $(widget.element).find('[local_id="button_wizard"]').on('click', function(event) {
        if (AKT.state.action_mode !== 'recording') {
            event.stopPropagation();
        }
        console.debug('Clicked on Wizard button');
        var kb = AKT.KBs['atwima'];  // Or AKT.kbs['atwima'];   ??
		
		var formalTerms = kb._formalTerms;
		for (var id in formalTerms) {
			var formalTerm = formalTerms[id];
			
			var type = formalTerm._type;
            var definition = formalTerm._definition;
            var memo = formalTerm._memo;
			var synonyms = 'no,synonyms';
			
 			
			//$(widget.element).find('.div_definition').selected = type;   /// TODO: fix this!!
			//$(widget.element).find('.formal_term_type').find('option[value="'+type+'"]').attr('selected',true);
			widget.options.term_type = type;
			$(widget.element).find('.input_id').val(id);
            $(widget.element).find('.textarea_definition').val(definition);
            $(widget.element).find('.textarea_synonyms').val(synonyms);
            $(widget.element).find('.textarea_memo').val(memo);
			
			$(widget.element).find('.button_update').trigger('click');
		}
	});


    // Jan 2026: Changed back to *NOT* use temp_formal_term pattern.
    // See next update event handler below.
    // Adapted from source_details
/*
    $(widget.element).find('[local_id="button_updateXXXXXXX"]').on('click', function(event) {
        if (AKT.state.action_mode !== 'recording') {
            event.stopPropagation();
        }
        console.log(9999,$(widget.element).find('[local_id="select_type"]').find('option:selected').val());
        console.log('update',widget.options);
        //var kbId = widget.options.kbId;
        var kbId = AKT.state.current_kb;
        var kb = AKT.KBs[kbId];
        console.log(kbId,kb);

        if (widget.options.mode ==='new') {
            var id = $(widget.element).find('.input_id').val();
            if (kb._formalTerms[id]) {
                alert('The formal term "' + id + '" already exists.   Please click the "Edit" button in the formal_terms panel instead.');
                $(widget.element).find('.dialog_close_button').click();
                return;
            }
            if (widget.options.term_type) {
                var type = widget.options.term_type;
            } else {
                type = $(widget.element).find('[local_id="select_type"]').find('option:selected').val();
                widget.options.term_type = type;
            }
            console.log('id:',id,':   type:',type);
            if (!type || type === 'Select the term type...') {
                alert('Please select the type of formal term from the drop-down box.');
                return;
            } else if (!id) {
                alert('Please provide an ID for the formal term.');
            }
            var type = widget.options.term_type;
            var language = widget.options.language;
            var definition = $(widget.element).find('.textarea_definition').val();
            //var synonyms = $(widget.element).find('.textarea_synonyms').val().split(',');
            var memo = $(widget.element).find('.textarea_memo').val();
            //AKT.loadTable(widget.element, 'table_synonyms', formalTerm.synonyms, true);   // Loads rows
            // into a one-column table, one <tr<td>...</td></tr> for each instance of the 3rd argument.

            // Gather up the synonyms.
            var synonyms = [];
            var jqSynonyms = $(widget.element).find('.div_synonym');
            for (var i=0; i<jqSynonyms.length; i++) {
                var jqSynonym = jqSynonyms[i];
                var term = $(jqSynonym).find('input').val();
                if (term) {
                    var lang = $(jqSynonym).find('select option:selected').val();  // *** CHECK
                    if (lang) {
                        var synonym = {term:term,language:lang};
                    } else {
                        synonym = {term:term};
                    }
                    synonyms.push(synonym);
                }
            }

            var images = {};
            $(widget.element).find('.input_image_id').each(function(event){
                var imageId = $(this).val();
                var image = kb._images[imageId];
                images[imageId] = image;
            });
            console.log(9012,images);

            // *** SEE BOTTOM OF PAGE FOR EXPERIMENTAL CODE FOR "CONCEPT"

        } else if (widget.options.mode === 'edit') {
            console.log('EDIT: ',widget.options.item);
            var formalTerm = widget.options.item;
            var id = formalTerm._id;
            var type = formalTerm._type;
            var definition = $(widget.element).find('.textarea_definition').val();
            //var synonyms = $(widget.element).find('.textarea_synonyms').val().split(',');
            var synonyms = [];
            var memo = $(widget.element).find('.textarea_memo').val();
 
            var images = {};
            $(widget.element).find('.input_image_id').each(function(event){  // *** !! Check
                var imageId = $(this).val();
                var image = kb._images[imageId];
                images[imageId] = image;
            });
        }

        tempFormalTerm._id = id;
        tempFormalTerm._type = type;
        tempFormalTerm._definition = definition;
        tempFormalTerm._memo = memo;
        tempFormalTerm._synonyms = synonyms;
        tempFormalTerm._images = images;
        console.log(9601,tempFormalTerm);

        $(widget.element).find('.input_id').val(id);

        kb._formalTerms[id] = tempFormalTerm;
		AKT.saveKbInLocalStorage(kbId)
        $('#message').text('The Formal Terms list has been updated');

        if (widget.options.mode==='new') {
            AKT.trigger('new_item_created_event',{kb:kb,item_type:'formal_term',item:tempFormalTerm});
        } else if (widget.options.mode==='edit') {
            AKT.trigger('item_changed_event',{kb:kb,item_type:'formal_term',item:tempFormalTerm});
        }

        //AKT.trigger('new_formal_term_created_event',{kb:kb,formal_term:formalTerm});
        $('#message').text('The Formal Terms list has been updated');
	    AKT.saveKbInLocalStorage(kbId);
    });
*/

    $(widget.element).find('[local_id="button_update"]').on('click', function(event) {
        if (AKT.state.action_mode !== 'recording') {
            event.stopPropagation();
        }
        console.log(9999,$(widget.element).find('[local_id="select_type"]').find('option:selected').val());
        console.log('update',widget.options);
        //var kbId = widget.options.kbId;
        var kbId = AKT.state.current_kb;
        var kb = AKT.KBs[kbId];
        console.log(kbId,kb);

        if (widget.options.mode ==='new') {
            var id = $(widget.element).find('[local_id="input_id"]').val();
            if (kb._formalTerms[id]) {
                alert('The formal term "' + id + '" already exists.   Please click the "Edit" button in the formal_terms panel instead.');
                $(widget.element).find('.dialog_close_button').click();
                return;
            } else if (id==='') {
                alert('You must provide a name for the new formal term.');
                return;
            }

            var type = $(widget.element).find('[local_id="select_type"]').val();
            var formalTerm = new FormalTerm({id:id,type:type});
            kb._formalTerms[id] = formalTerm;
            widget.options.item = formalTerm;
            console.log(id,type,formalTerm,kb._formalTerms);

        } else if (widget.options.mode === 'edit') {
            var formalTerm = widget.options.item;
        }

        formalTerm._definition = $(widget.element).find('[local_id="textarea_definition"]').val();
        formalTerm._memo = $(widget.element).find('[local_id="textarea_memo"]').val();
        //var synonyms = $(widget.element).find('.textarea_synonyms').val().split(',');
        formalTerm._synonyms = [];   // !!! Fix!

        var ftImageIds = [];   // These are the image IDs for this formal term.
        $(widget.element).find('.div_image').each(function(event){  
            var ftImageId = $(this).find('input').val();
            ftImageIds.push(ftImageId);
        });
        formalTerm._imageIds = ftImageIds;

        if (widget.options.mode === 'new') {
            $('#message').text('A new formal term, '+id+', has been created.');
        } else if (widget.options.mode === 'edit') {
            $('#message').text('The formal term '+id+' has been updated.');
        }

        if (widget.options.mode==='new') {
            AKT.trigger('new_item_created_event',{kb:kb,item_type:'formal_term',item:formalTerm});
        } else if (widget.options.mode==='edit') {
            AKT.trigger('item_changed_event',{kb:kb,item_type:'formal_term',item:formalTerm});
        }
	    AKT.saveKbInLocalStorage(kbId);
    });


    $(widget.element).find('[local_id="button_add_synonym"]').on('click', function(event) {

        $('.ui-dialog').css('z-index',1000000);
        var synonymDialog = $(widget.element).find('.div_synonym');
        $(synonymDialog).css({display:'block'});
        $(synonymDialog).find('button').on('click', function(event) {
            var name = $(synonymDialog).find('[local_id="input_synonym_name').val();
            var language = $(synonymDialog).find('option:selected').text();  // *** CHECK
            if (language) {
                $(widget.element).find('.table_synonyms').append('<tr><td>'+name+' ('+language+')</td></tr>');
            } else {
                $(widget.element).find('.table_synonyms').append('<tr><td>'+name+'</td></tr>');
            }
            var formalTerm = new FormalTerm({id:name,type:'object',kb:kb,synonyms:[],definition:''});
            kb._formalTerms[name] = formalTerm;
            $(synonymDialog).css({display:'none'});
        });   
    });


    // Image-related buttons


    $(widget.element).find('[local_id="button_add_image"]').on('click', function (event) {   // add_image button
        console.log('BUTTON: Clicked on Add image button');
        if (AKT.state.action_mode !== 'recording') {
            event.stopPropagation();
        }

        var kbId = widget.options.kbId;
        var kb = AKT.KBs[kbId];

        AKT.state.current_listener = {uuid:widget.uuid,type:'image'};

        var eventShiftKey = event ? event.shiftKey : null;

        var panel = AKT.panelise({
            widget_name:'images',
            position:{left:'20px',top:'20px'},
            size:{width:'470px',height:'390px'},
            shift_key: event.shiftKey,
            options:{kbId:kbId}
        });
    });


    $(widget.element).find('[local_id="button_remove_image"]').on('click', function (event) {   
        console.log('BUTTON: Clicked on Remove image button - currently does nothing!');
        if (AKT.state.action_mode !== 'recording') {
            event.stopPropagation();
        }

        var kbId = widget.options.kbId;
        var kb = AKT.KBs[kbId];

/* Derived from button_remove_source in statement_details.
   Needs to be adapted for images.
        var statement = widget.options.statement;

        console.log(kb);
        var id = $(widget.element).find('.select_sources').val();
        var source = kb._sources[id];
        console.log(kb,statement,id,source);

        var eventShiftKey = event ? event.shiftKey : null;

        var panel = AKT.panelise({
            widget_name:'source_details',
            position:{left:'20px',top:'20px'},
            size:{width:'470px',height:'390px'},
            shift_key: event.shiftKey,
            options:{kbId:kbId, source:source}
        });
*/
    });


    // This is derived from $(document).on('item_selected_event,...)in statement_details
    // for getting a source.
    // But in this case it detects which image in the images widgette a user has selected.
    // Unlike the statement_details case, this does not pick up that event from the 
    // generic listbox structure, but from the grid of images.
	$(document).on('item_selected_event', function(event,args) {
        console.log(7001,args,widget);
        if (args.item_type !== 'image') return;
        console.log('7002a',AKT.state.current_listener);
        console.log('7002b',widget.uuid);
        console.log('7002c',AKT.state.current_listener.uuid);
        // We are asking: Is the uuid of this widget the same as the widget uuid that is currently
        // awaiting an "item_selected"event"?
        if (AKT.state.current_listener && 
                args.item_type === 'image' &&
                AKT.state.current_listener.type === 'image' && 
                widget.uuid === AKT.state.current_listener.uuid) {
            console.log(7003);
            var kbId = widget.options.kbId;
            var kb = AKT.KBs[kbId];
            var imageId = args.item_id;
            var image = kb._images[imageId];
            console.log('BBB1 ',image);

            $(widget.element).find('.slides-container').append(`
                <li class="slide">
                    <div class="div_image" local_id="div_`+imageId+`" style="width:100%;height:100%;">
                        <img src="`+image._url+`" style="width:100%;height:90%;"></img>
                        <textarea readonly style="width:100%;height:30px;">`+image._caption+`</textarea>
                        <input readonly style="width:100%;height:20px;" value="`+imageId+`">
                    </div>
                </li>
            `);

            AKT.state.current_listener = {uuid:null,listener_id:null};
            AKT.slidersCss(widget);
        }
    });

};



AKT.widgets.formal_term_details.display = function (widget) {
    console.log('^widgets.formal_term_details^setup()^options='+AKT.simpleStringify(widget.options));
    console.log(widget.options.item);
    var kbId = widget.options.kbId;
    var kb = AKT.KBs[kbId];


    // Jan 2026 - Reverted to *NOT* using the temp_formal_term pattern.
    if (widget.options.mode !== 'new') {
    var formalTerm = widget.options.item;
        $(widget.element).find('[local_id="input_term"]').val(formalTerm._id);
        $(widget.element).find('[local_id="select_type"]').val(formalTerm._type);
        $(widget.element).find('[local_id="input_language"]').val(formalTerm._language);
        $(widget.element).find('[local_id="textarea_definition"]').val(formalTerm._definition);
        $(widget.element).find('[local_id="textarea_memo"]').val(formalTerm._memo);

        var images = kb._images;   // The KB's image collection
        console.log('AAA1 ',images);
        if (formalTerm._imageIds) {
            var ftImageIds = formalTerm._imageIds;  // The IDs for the images for this formal term.
        } else {
            ftImageIds = [];
        }
        console.log('AAA2 ',ftImageIds);
        for (var i=0; i<ftImageIds.length; i++) {
            var ftImageId = ftImageIds[i];
            var image = images[ftImageId];
            console.log('AAA3 ',i,ftImageId,image);
            $(widget.element).find('.slides-container').append(`
                <li class="slide">
                    <div class="div_image" local_id="div_`+ftImageId+`" style="width:100%;height:100%;">
                        <img src="`+image._url+`" style="width:100%;height:90%;"></img>
                        <textarea readonly style="width:100%;height:30px;">`+image._caption+`</textarea>
                        <input readonly style="width:100%;height:20px;" value="`+ftImageId+`">
                    </div>
                </li>
            `);

            AKT.slidersCss(widget);
        }
    }
    
    // See bottom of file for test code for local images.
};


AKT.widgets.formal_term_details.html = `
<div class="content" style="background:inherit;border:none; padding:10px;">
    <div class="id" style="float:left;">
        <legend style="float:left;height:20px;padding-right:5px;">ID</legend><br/>
        <input type="text" class="input_id" local_id="input_id" style="font-weight:bold; float:left; background:white; width:170px; height:20px; resize:horizontal; padding-left:3px;"></input>
    </div>
        
    <div style="float:left;margin-left:18px;">
        <legend>Type</legend>
        <select class="select_type" local_id="select_type" style="margin-top:4px;">
            <option value="object">Object</option>
            <option value="action">Action</option>
            <option value="attribute">Attribute</option>
            <option value="comparison">Comparison</option>
            <option value="link">Link</option>
            <option value="process">Process</option>
            <option value="value">Value</option>
        </select>
    </div>
    <div style="float:left;margin-left:18px;">
        <legend>Language</legend>
        <select class="select_language" local_id="select_language" style="margin-top:4px;">
            <option value="english" selected>English</option>
            <option value="french">French</option>
            <option value="latin">Latin</option>
            <option value="local1">Local1</option>
            <option value="local2">Local2</option>
       </select>
    </div>

    <div style="clear:both;"></div>

    <div style="margin-top:15px; display:none;">

        <div class="object_only">
            <div style="float:left;width:60px;height:20px;">Part of :</div>
            <select class="select_superobjects" local_id="select_superobjects" size=3 style="float:left;width:140px; background:white"></select>

            <div style="float:left;width:45px;height:20px;margin-left:15px;">Parts:</div>
            <select class="select_subobjects" local_id="select_subobjects"  size=3 style="float:left;width:140px; background:white"></select>

            <div style="clear:both;"></div>
        </div>

        <div style="clear:both;"></div>
    </div>

    <div >
        <div style="float:left;">

            <!-- DEFINITION -->
            <div style="margin-top:10px;">
                <div style="width:70px;height:20px;">Definition: </div>
                <textarea class="textarea_definition" local_id="textarea_definition" style="border:solid 1px black; background:white; width:180px;height:65px;"></textarea>
            </div>


            <!--SYNONYMS -->
            <!-- Aug 2025 *** IMPORTANT NOTE ***
                Synonyms are currently held in a table in the Synonym box, one row per synonym.
                They are added with the Add button.
                This approach allows them to be added/removed individually, and to display attributes, such as their "language".
                HOWEVER, at the time of writing, the Add mechanism (and presumably at some stage in the future a Delete
                mechanism) has NOT BEEN INTEGRATED INTO THE EVENT/ACTION-LOG SYSTEM. -->
            <div style="margin-top:10px;">
                <div>
                    <div style="float:left;width:70px;height:20px;">Synonym(s):</div>
                    <button class="button_add_synonym" local_id="button_add_synonym" style="float:left;padding-left:3px;padding-right:3px;margin-bottom:2px;">Add</button>
                    <div style="clear:both;"></div>
                </div>
                <div style="overflow:auto; border:solid 1px black; background:white; width:180px; height:0; min-height:65px;">
                    <table class="table_synonyms" local_id="table_synonyms" style="margin:0px;">
                    </table>
                </div>
                

                <div style="display:none;margin-top:0px;">
                    <button class="button_add" local_id="button_add" style="margin:0px;width:50px;height:30px;">Add</button><br/>
                    <button class="button_delete" local_id="button_delete" style="margin-top:6px;width:50px;height:30px;">Delete</button>
                </div>
            </div>


            <!-- MEMO -->
            <div style="margin-top:10px;">
                <div style="width:70px;height:20px;">Memo: </div>
                <textarea class="textarea_memo" local_id="textarea_memo" style="border:solid 1px black; background:white; width:180px;height:65px;"></textarea>
            </div>
        </div>


        <!-- IMAGE -->
        <!-- Thanks to https://webdesign.tutsplus.com/how-to-build-a-simple-carousel-with-vanilla-javascript--cms-41734t -->
        <!-- Orginal HTML first, then my adapted version.   Eventually all code will be packaged in a single function -->
        <!-- Aug 2025 *** IMPORTANT NOTE *** Currently not integrated into the event-action-log system. -->
        <div class="div_images" style="float:left;width:252px;height:252px;margin:7px;margin-top:30px;background:white;border:solid 1px black;">
            <section class="slider-wrapper">
                <button class="slide-arrow" local_id="slide_arrow_prev" id="slide-arrow-prev">&#8249;</button>
                <button class="slide-arrow" local_id="slide_arrow_next" id="slide-arrow-next">&#8250;</button>
              
                <ul class="slides-container" id="slides-container" style="padding-inline-start:0px;">
              </ul>
            </section>
        </div>

        <div style="clear:both;"></div>
    </div>


    <!-- BUTTONS -->
    <div style="margin-bottom:8px;">
        <button class="button_statements" local_id="button_statements" style="float:left;width:80px;height:25px;margin-left:10px;" title="Shows the statements that contain this formal term.">Statements</button>
        <button class="button_in_hierarchy" local_id="button_in_hierarchy" style="float:left;width:80px;height:25px;margin-left:10px;" title="If this term is an object, shows where it occurs in its object hierarchy." >In Hierarchy</button>

        <div class="div_images_buttons" style="float:left;">
            <button class="button_images" local_id="button_images" style="float:left;width:50px;height:25px;margin-left:10px;" title="Open the Images panel to display all images">Images</button>
            <button class="button_add_image" local_id="button_add_image" style="float:left;width:40px;height:25px;margin-left:0px;">Add</button>
            <button class="button_remove_image" local_id="button_remove_image" style="float:left;width:50px;height:25px;margin-left:0px;" title="Remove image">Remove</button>
            <div style="clear:both;"></div>
        </div>

        <button class="button_update" local_id="button_update" style="float:right;width:60px;height:25px;margin-left:10px;" title="Updates this entry in the knowledge base.">Update</button>
        <a class="button_help" local_id="button_help" href="help.html#ref_formal_term_details" target="_blank" style="float:right;width:60px;height:25px;margin-left:10px;" title="Help on this widget">Help</a>

    </div>
    
    <div style="clear:both;"></div>

    <div class="div_synonym" style="z-index:50000; display:none; background:#f0f0f0;" title="Synonym dialog">
        <p>Enter the synonym and, optionally, select its language.</p>
        <div style="height:auto; margin:7px;">
            <div style="float:left; width:80px;">Name: </div>
            <input type="text" local_id="input_synonym_name" style="float:left; width:100px;"></input>
            <div style="clear:both;"></div>
        </div>

        <div style="height:auto; margin:7px;">
            <div style="float:left; width:80px;">Language: </div>
            <select style="float:left; width:100px; height:20px; background:white;" local_id="select_synonym_language">
                <option></option>
                <option>english</option>
                <option>french</option>
                <option>latin</option>
                <option>local1</option>
                <option>local2</option>
            </select>
            <div style="clear:both;"></div>
        </div>

        <button style="float:right; margin:10px;" local_id="button_synonym_ok">OK</button>
    </div>


</div>     <!-- End of content div -->
`;

/* Original CSS
.slider-wrapper {
  margin: 1rem;
  position: relative;
  overflow: hidden;
}
.slides-container {
  height: calc(100vh - 2rem);
  width: 100%;
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  overflow: scroll;
  scroll-behavior: smooth;
}
.slide {
  width: 100%;
  height: 100%;
  flex: 1 0 100%;
}

... To get rid of horizontal scrollbar...
.slides-container {
    scrollbar-width: none;  Firefox 
    -ms-overflow-style: none;   Internet Explorer 10+ 
}
 WebKit 
.slides-container::-webkit-scrollbar { 
    width: 0;
    height: 0;
}
*/

/*
.slide-arrow {
  position: absolute;
  display: flex;
  top: 0;
  bottom: 0;
  margin: auto;
  height: 4rem;
  background-color: white;
  border: none;
  width: 2rem;
  font-size: 3rem;
  padding: 0;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 100ms;
}
.slide-arrow:hover,
.slide-arrow:focus {
  opacity: 1;
}
#slide-arrow-prev {
  left: 0;
  padding-left: 0.25rem;
  border-radius: 0 2rem 2rem 0;
}
#slide-arrow-next {
  right: 0;
  padding-left: 0.75rem;
  border-radius: 2rem 0 0 2rem;
}
*/

    /* Carousel slider original code
    const slidesContainer = document.getElementById("slides-container");
    const slide = document.querySelector(".slide");
    const prevButton = document.getElementById("slide-arrow-prev");
    const nextButton = document.getElementById("slide-arrow-next");
    nextButton.addEventListener("click", () => {
      const slideWidth = slide.clientWidth;
      slidesContainer.scrollLeft += slideWidth;
    });
    prevButton.addEventListener("click", () => {
      const slideWidth = slide.clientWidth;
      slidesContainer.scrollLeft -= slideWidth;
    });
    */

            // Check which if any of the synonyms are already formal terms.
            // If none, then the new formal term will result in the creation of a new 
            // Concept.    
            // If just one, then its Concept will be used for the new formal term, and
            // also for the other synonyms (if any).
            // If more than one, then that's an error if their Concepts are different. That
            // should not have been allowed to occur!
            // Nov 2023: The following code is work in progress, indeed class Concept() is 
            // not yet implemented.
/*
            var nAlreadyKnown = 0;
            var alreadyKnowns = [];
            for (var i=0; i<synonyms.length; i++) {
                var synonym = synonyms[i];
                if (kb._formalTerms[synonym.name]) {
                    nAlreadyKnown += 1;
                    alreadyKnowns.push(synonym);  
                }
            }
            
            if (nAlreadyKnown === 0) {
                var concept = new Concept(synonym);
                //var conceptId = AKT.createNewId('concept');  Implement this.
                AKT.state.counter.concepts += 1;  // Temporary
                var iConcept = AKT.state.counter.concepts;
                kb._concepts[iConcept] = concept;
                for (var i=0; i<synonyms.length; i++) {
                    var synonym = synonyms[i];
                    synonym.concept =  concept;   //TODO: No!
                }
            } else if (nAlreadyKnown >0) {
            } else {  // Check if their Concepts are different!
            }                    
*/

/*
        if (formalTerm.id === "nyanya") {
            $(widget.element).find('.div_image').append('<img style="width:250px; height:250px;" SRC="images/momordica_charantia.gif">');
        } else if (formalTerm.id === "cocoyam") {
            $(widget.element).find('.div_image').append('<img style="width:250px; height:250px;" SRC="images/Bakweri_cocoyam_farmer_from_Cameroon.jpg">');
        } else if (formalTerm.id === "esre") {
            $(widget.element).find('.div_image').append('<img style="width:250px; height:250px;" SRC="images/Panicum_maximum_reduced.jpg">');
        } else {
            AKT5.show('<img style="float:right; margin:10px; width:200px; height:200px; background:white;" SRC="no_image.gif">');
        }
        AKT.slidersCss(widget);
*/

