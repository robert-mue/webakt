/*
This is a mistake.  On reflection, this should be  widget (not a widgette) rather 
than a class - it's a reuseable component, with its own HTML, styling and code.  
It's correctable, but that can wait.
*/

class Listbox {

    constructor(args) {
        console.log('\n*** Class Listbox constructor: args=',args);
        // This is weird.   Each table needs a unique ID.   I use the widget instance id,
        // e.g. statements_1 (which rules out having more than 1 table in a widget...).
        //  But... it seems that the id cannot have an underscore in it!    You get a 
        // sorttable.js error if you do.   So I strip out the underscores.

        if (!AKT.state.listbox_counter) {
            AKT.state.listbox_counter = 0;
        }
        var id = args.widget_element[0].id;
        var tableId = id.replaceAll('_','')+AKT.state.listbox_counter;
        AKT.state.listbox_counter += 1;

        self = this;
        this.args = args;
        var widget = args.widget;
        var divElement = $(args.widget_element).find('.'+args.div_element_class);
        $(divElement).empty();
        this.divElement = divElement;

        // A webAKT "listbox" consists of two parts:
        // - a table, where each row corresponds to one item (e.g. a statement, a source...);
        // - a set of controls.   Currently, just buttons.
        // I use w3-css for layout, so define the latter first, so that the table can be a 
        // w3-rest class, i.e. expands to fill available space.
        var divListbox = $(`
        <div class="mylistbox div_listbox_buttons w3-row">
            <!--div class="w3-col w3-right w3-container" style="width:75px;margin:15px;">
                <button class="button_new" style="width:70px;height:27px;">New</button><br/>
                <button class="button_view" style="width:70px;height:27px;">View</button><br/>
                <button class="button_edit" style="width:70px;height:27px;">Edit</button><br/>
                <button class="button_delete" style="width:70px;height:27px;">Delete</button>
                <button class="button_select_all" style="width:70px;height:27px;">Select all</button>
                <button class="button_invert" style="width:70px;height:27px;">Invert</button>
            </div-->

            <div class="div_listbox_table" 
                style="overflow-y:auto;  max-height:300px; border:solid 1px black; background:white;">
                <table class="sortable" style="margin:3px; ">
                    <thead></thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
        `);
        $(divElement).append(divListbox);

        //$(divElement).option('alsoResizable',divListbox);
        //$(divListbox).resizable();

        //$(divElement).find('table').attr('id',tableId);

        // Build the table header.
        var trElement = $('<tr></tr>');
        $(trElement).append('<th style="text-align:left;vertical-align:top;width:20px;background:white;"> </th>');
        $.each(args.property_names, function(i, propertyName) {
            $(trElement).append('<th style="text-align:left; vertical-align:top; min-width:70px;max-width:100px;background:white;color:black;">'+propertyName+'</th>');   
        });
        $(divListbox).find('thead').append(trElement);

        if (Object.keys(args.items).length===0) {
            
        } else {
            // Now build up all the rows in the body of the table.
            $.each(args.items, function(key,item) {
                var trElement = $('<tr class="tr_listbox '+key+'" data-key="'+key+'"></tr>');
                if (args.include_key) {   // Include the item's key if wanted.
                    $(trElement).append('<td style="text-align:left;vertical-align:top;">'+key+'</td>');
                }
                $(trElement).append('<td style="text-align:left; max-width:100px; vertical-align:top; background:white;"><input type="checkbox"></input></td>');   

                $.each(args.property_names, function(i, propertyName) {
                    var propertyValue = item.getPropertyValue(propertyName);
                    if (Array.isArray(propertyValue)) {
                        var propertyValueString = '';
                        for (var i=0; i<propertyValue.length; i++) {
                            if (i>0) propertyValueString += ',';
                            propertyValueString += propertyValue[i];
                        }
                    } else if (typeof propertyValue === 'object') {
                        var propertyString = JSON.stringify(propertyValue);
                    } else {
                        propertyValueString = propertyValue;
                    }
                    if (typeof propertyValue === 'string') {
                        // In order to get rid of text colouring (i.e. text that includes <span> elements to
                        // set the colour of individual words), I first put the string into a dummy HTML element,
                        // then extract the plain text from that element.  This strips out all the markup inside
                        // the HTML.   I guess there's a neater way, but this does the job.
                        var tdHtmlElement = $('<span>'+propertyValueString+'</span>');
                        var text = $(tdHtmlElement).text();

                        text = propertyValueString;
                        // This is to enable neat word-wrapping for the "formal" version of statements.
                        // Maybe try using CSS word-wrapping, which would not involve changing the text.
                        text = text.replaceAll(',',', ');
                        $(trElement).append('<td style="text-align:left; vertical-align:top; max-width:300px;">'+text+'</td>');   
                    } else {
                        $(trElement).append('<td style="text-align:left; vertical-align:top; max-width:300px;">'+propertyValueString+'</td>');   
                    }
                });
                $(divListbox).find('tbody').append(trElement);
            });
        }

/*
        var tableElement = $('<table id="'+tableId+'" class="sortable" style="margin:3px;"></table>');
        this.tableElement = tableElement;

        var theadElement = $('<thead></thead>');
        var trElement = $('<tr></tr>');
        $(trElement).append('<th style="text-align:left;vertical-align:top;"> </th>');
        $.each(args.property_names, function(i, propertyName) {
            $(trElement).append('<th style="text-align:left; vertical-align:top; max-width:500px;">'+propertyName+'</th>');   
        });
        $(theadElement).append(trElement);
        $(tableElement).append(theadElement);
        
        var tbodyElement = $('<tbody></tbody>');
        $(tableElement).append(tbodyElement);

        $.each(args.items, function(key,item) {
            var trElement = $('<tr class="tr_listbox '+key+'" data-key="'+key+'"></tr>');
            if (args.include_key) {   // Include the item's key if wanted.
                $(trElement).append('<td style="text-align:left;vertical-align:top;">'+key+'</td>');
            }

            $(trElement).append('<td style="text-align:left; vertical-align:top; background:white;"><input type="checkbox"></input></td>');   

            $.each(args.property_names, function(i, propertyName) {
                var property = item[propertyName];
                if (typeof property === 'object') {
                    var propertyString = JSON.stringify(property);
                } else {
                    propertyString = property;
                }
                if (typeof property === 'string') {
                    // In order to get rid of text colouring (i.e. text that includes <span> elements to
                    // set the colour of individual words), I first put the string into a dummy HTML element,
                    // then extract the plain text from that element.  This strips out all the markup inside
                    // the HTML.   I guess there's a neater way, but this does the job.
                    var tdHtmlElement = $('<span>'+propertyString+'</span>');
                    var text = $(tdHtmlElement).text();

                    text = propertyString;
                    // This is to enable neat word-wrapping for the "formal" version of statements.
                    // Maybe try using CSS word-wrapping, which would not involve changing the text.
                    text = text.replaceAll(',',', ');
                    $(trElement).append('<td style="text-align:left; vertical-align:top; max-width:500px;">'+text+'</td>');   
                }
            });
            $(tbodyElement).append(trElement);
        });
        $(tableElement).find('tr:even').css({background:'white'});
        $(tableElement).find('tr:odd').css({background:'#e8e8e8'});
        $(divElement).append(tableElement);

        var controlsElement = $(`
            <button class="button_new" style="width:70px;height:27px;">New</button><br/>
            <button class="button_view" style="width:70px;height:27px;">View</button><br/>
            <button class="button_edit" style="width:70px;height:27px;">Edit</button><br/>
            <button class="button_delete" style="width:70px;height:27px;">Delete</button>
            <button class="button_select_all" style="width:70px;height:27px;">Select all</button>
            <button class="button_invert" style="width:70px;height:27px;">Invert</button>
        `);
        $(divElement).append(controlsElement);
*/
        //var newTableObject = document.getElementById(tableId)
        //sorttable.makeSortable(newTableObject);

        // Code to enable automatic vertical resizing when the containing Panel is resized.
        // Aug 2024; Doesn't work!   Not sure why not.   Work on hold for the time being.
        var panelHeight = $(args.widget_element).height();   // This returns a pure number
        var currentMylistboxHeight = Math.max(200,$(divElement).height());
        var restHeight = panelHeight - currentMylistboxHeight;
        //var h = $(args.widget_element).height()-145;   // TODO: This is for the statements() widgette!!
        // The 145 needs to be calcuated by subtracting the current table height from the
        // current Panel height.  Or something like that...
        //$(args.widget_element).find('.mylistbox').css('height',h+'px');
        $(args.widget_element).on( "resizexxx", function( event, ui ) {
            var h = $(args.widget_element).height() - restHeight;   // TODO: Ditto!!!
            h = Math.floor(h);
            //$(args.widget_element).find('.mylistbox').css('height',h+'px');
            $(args.widget_element).find('.mylistbox').height(h);
            $(args.widget_element).find('.div_listbox_table').height(h);
            $(args.widget_element).find('table').height(h);
        });

/*
        $(divElement).find('input[type=checkbox]').on('click', function (event, value) {
            var key = $(this).parent().parent().attr('data-key');
            console.log(3300,key);
            console.log('\n');
            var xs = $(divElement).find('input:checked');
            for (var i=0;i<xs.length;i++) {
                var x = xs[i];
                var y = $(x).parent().parent().attr('data-key');
                console.log(3303,y);
            }
            console.log('\n');
        });
*/

        // Not sure what this event handler is for.   Maybe I just put it in to
        // check that self.findCheckedIds() works properly.
        $(divElement).find('input[type=checkbox]').on('click', function (event, value) {
            //var checkedIds = self.findCheckedIds();
            //console.log(checkedIds);
        });

        $(divElement).find('.tr_listbox').on('click', function (event, value) {
            event.stopPropagation();
            // Needed this, since this.value is blank when triggered (in AKT.singleStep).
            //if (this.value === '') {
            //    var optionValue = value;
            //} else {
            //    optionValue = this.value;
            //}
            
            $(this).find('input[type=checkbox]').prop('checked',true);

            var key = $(this).attr('data-key');
            if (!value || key === value) {
                $(divElement).find('tr:even').css({background:'white'});
                $(divElement).find('tr:odd').css({background:'#e8e8e8'});
                $(divElement).find('.tr_listbox').removeAttr('data-selected');
                $(this).css({background:'yellow'});
                $(this).attr('data-selected','yes');
                AKT.trigger('item_selected_event',{
				    item_type:args.item_type,
				    item_id:key
                });

    /*
                AKT.recordEvent({
                    file:'webakt.js',
                    function:'AKT.myListbox',
                    element:args.widget_element,
                    finds:['.tr_listbox'],
                    event:'click',
                    message:'Clicked on a myListbox table row in '+args.widget_element[0].id,
                    value:key
                });
    */
                var action = new Action({
                    file:       'Listbox.js',
                    function:   "$(divElement).find('.tr_listbox').on('click', function (event, value) {}",
                    element_id: args.widget_element[0].id,
                    selector:   '.tr_listbox',
                    type:       'click',
                    message:    'Clicked on a Listbox table row in '+args.widget_element[0].id,
                    prompt:     'Click on the <b>'+$(this)[0].dataset.key+'</b> item in the listbox',
                    before:     'About to select <b>'+$(this)[0].dataset.key+'</b> by clicking its checkbox.',
                    after:      'Selected <b>'+$(this)[0].dataset.key+'</b> by clickng its checkbox.',
                    value:      key
                });
                AKT.action_list.add(action);

                AKT.event_records.push(action._event);
                AKT.setEventRecords('event_records', AKT.event_records);
            }
        });


// =====================================================  BUTTONS

        // BUTTON: New
        $(widget.element).find('.button_newxxx').on('click', function (event) { 
            console.log('BUTTON: Clicked on the New button');
            event.stopPropagation();
            
            console.log('New: args:',args);
            var kb = args.kb;
            var kbId = kb._id;
            var itemtype = args.item_type;
            if (args.tree_type) {
                var treeType = args.tree_type;
            } else {
                treeType = null;
            }

            var panel = AKT.panelise({
                widget_name:  itemtype+'_details',
                position:     {left:'650px',top:'20px'},
                size:         {width:'580px',height:'450px'},
                shift_key:    event.shiftKey,
                options:      {kbId:kbId, mode:'new', tree_type:treeType}
            });
        });


        //  BUTTON: View
        $(widget.element).find('.button_viewxxx').on('click', function (event) {   // View button
            console.log('BUTTON: Clicked on View button');
            event.stopPropagation();

            console.log('View: args:',args);

            var kb = args.kb;
            var kbId = kb._id;
            var itemType = args.item_type;
            if (args.tree_type) {
                var treeType = args.tree_type;
            } else {
                treeType = null;
            }

            var selectedItemIds = self.findCheckedIds();

            if (selectedItemIds.length === 0) {
                alert('Please select one '+itemType+' from the list.');

            } else if (selectedItemIds.length >1) {
                alert('You can only select one '+itemType+' from the list.');

            } else {
                // This is a way of allowing us to set options that are specific to a particular
                // type of item.
                // So, if itemType = 'statement', then this sets the custom option 'statement' to the
                // item itself, i.e. a particular statement.  This means that, when the user clicks 
                // the View or Edit button, the relevant xxx_details panel gets the otem it is 
                // expecting.    For example, if the Listbox is in the statements panel, then the
                // statement_details panel is created when the user clicks View or Edit, and the 
                // widget.options object contains the property 'statement', whose value is the
                // currently-selected statement.
                var itemId = selectedItemIds[0];
                // TODO: Fix this hack!
                // Answer is to add the collection name (the key used in the KB) as another
                // argument for the new Listbox call.
                if (itemType === 'formal_term') {           
                    var items = kb._formalTerms;
                } else if (itemType === 'hierarchy') { 
                    if (treeType === 'object') {
                        items = kb._objectHierarchies;
                    } else {
                        items = kb._topicHierarchies;
                    }
                } else {
                    var items = kb['_'+itemType+'s'];
                }
                console.log(8701,args,itemType,items,itemId);
                var item = items[itemId];   

                var options = {kbId:kbId, mode:'view', item_type:itemType, item_id:itemId, item:item, tree_type:'object'};
                options[itemType+'_id'] = itemId;
                options[itemType] = item;

                var panel = AKT.panelise({
                    widget_name:  itemType+'_details',
                    position:     {left:'650px',top:'20px'},
                    size:         {width:'580px',height:'450px'},
                    shift_key:    event.shiftKey,
                    options:      options
                });
            }
        });


        //  BUTTON: Edit
        $(widget.element).find('.button_editxxx').on('click', function (event) {   // View button
            console.log('BUTTON: Clicked on dit button');
            event.stopPropagation();

            console.log('Edit args:',args);

            var kb = args.kb;
            var kbId = kb._id;
            var itemType = args.item_type;
            var treeType = args.tree_type;
            if (args.tree_type) {
                var treeType = args.tree_type;
            } else {
                treeType = null;
            }

            var selectedItemIds = self.findCheckedIds();

            if (selectedItemIds.length === 0) {
                alert('Please select one '+itemType+' from the list.');

            } else if (selectedItemIds.length >1) {
                alert('You can only select one '+itemType+' from the list.');

            } else {
                // See the comments in the View button click event handler.
                var itemId = selectedItemIds[0];
                if (itemType === 'formal_term') {           // TODO: Fix this hack!
                    var items = kb._formalTerms;
                } else if (itemType === 'hierarchy') { 
                    if (treeType === 'object') {
                        items = kb._objectHierarchies;
                    } else {
                        items = kb._topicHierarchies;
                    }
                } else {
                    var items = kb['_'+itemType+'s'];
                }
                var item = items[itemId];   

                var options = {kbId:kbId, mode:'edit', item_type:itemType, item_id:itemId, item:item, tree_type:treeType};
                options[itemType+'_id'] = itemId;
                options[itemType] = item;

                var panel = AKT.panelise({
                    widget_name:  itemType+'_details',
                    position:     {left:'650px',top:'20px'},
                    size:         {width:'580px',height:'450px'},
                    shift_key:    event.shiftKey,
                    options:      options
                });
            }
        });


        // BUTTON: Delete
        $(divElement).find('.button_deletexxx').on('click', function (event) {   // Delete button
            console.log('BUTTON: Clicked on the Delete button');
            event.stopPropagation();

            var kbId = AKT.state.current_kb;
            var kb = AKT.KBs[kbId];
            var itemType = args.item_type;

            self.deleteCheckedIds();
            var itemIds = self.findCheckedIds();
            AKT.trigger(itemType+'_deleted_event',{  // TODO: Allow more than one item.
			    item_type:  itemType,
			    item_id:    itemIds[0]});
		    AKT.saveKbInLocalStorage(kbId);
        });


        // BUTTON: Select_all
        $(divElement).find('.button_select_allxxx').on('click', function (event) {   // Select_all button
            console.log('select_all');
            if ($(this).text() === 'Select all') {
                self.selectAll();
                $(this).text('Deselect all');
            } else {
                self.deselectAll();
                $(this).text('Select all');
            }
        });


        // Button Invert
        // Inverting the checked status of items is useful for deleting all but a few.
        // The code is a cunning way to do this inverting.  
        // We fits set the data-checked HTML attribute to false for all checkboxes.
        // We then set it to true for those that are currently checked, and then set their checked property to be false.
        // Finally, we set the checked property to be true for all the rest.
        $(divElement).find('.button_invertxxx').on('click', function (event) {   // Select_all button
            self.invertChecked();
        });

    }

    addColumn () {
    }

    findCheckedIds () {
        var itemKeys = [];
        var checkedInputs = $(this.divElement).find('input:checked');
        for (var i=0; i<checkedInputs.length; i++) {
            var checkedInput = checkedInputs[i];
            var itemKey = $(checkedInput).parent().parent().attr('data-key');
            itemKeys.push(itemKey);
        }
        return itemKeys;
    }

    deleteCheckedIds () {
        console.log(this.args);
        var kb = this.args.kb;
        var containerObject = this.args.container_object;
        var itemKeys = [];
        var checkedInputs = $(this.divElement).find('input:checked');
        for (var i=0; i<checkedInputs.length; i++) {
            var checkedInput = checkedInputs[i];
            console.log(i,checkedInput);
            var itemKey = $(checkedInput).parent().parent().attr('data-key');
            console.log(kb,containerObject,itemKey);
            delete kb['_'+containerObject][itemKey];
        }
    }


    selectAll () {
            $(this.divElement).find('input[type=checkbox]').prop('checked',true);
    }


    deselectAll () {
            $(this.divElement).find('input[type=checkbox]').prop('checked',false);
    }


    invertChecked () {
       $(this.divElement).find('input[type=checkbox]').attr('data-checked',false);
       $(this.divElement).find('input[type=checkbox]:checked').attr('data-checked',true).prop('checked',false);
       $(this.divElement).find('input[type=checkbox][data-checked=false]').prop('checked',true);
    }


    removeColumn () {
    }

    addRow () {
    }

    removeRow () {
    }

    refresh () {
    }


}
