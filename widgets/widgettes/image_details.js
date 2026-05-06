AKT.widgets.image_details = {};


AKT.widgets.image_details.settings = {width:'600px',height:'440px'};


AKT.widgets.image_details.setup = function (widget) {
    console.log('^widgets.image_details^setup()^options='+AKT.simpleStringify(widget.options));
    console.log('***',widget.element[0].style.width);
    widget.element[0].style.width = '600px';   // Weirdly, I can't find where to set this in CSS!

    var mode = widget.options.mode;
    if (mode === 'new') {

    } else if (mode === 'view') {
        $(widget.element).find('.button_update').css({display:'none'});
        $(widget.element).find('.button_show_image').css({display:'none'});
        $(widget.element).find('div').attr('contenteditable',false);

    } else if (mode === 'edit') {
        $(widget.element).find('.button_show_image').css({display:'none'});
    }



    $(widget.element).find('.button_show_imagexxx').on('click', function() {
        console.log('button_show_image');
        //event.stopPropagation();

        var kbId = AKT.state.current_kb;
        var kb = AKT.KBs[kbId];

        //var image = kb._images['ciat15'];
        var imageId = 'ciat20';
        var url = 'https://live.staticflickr.com/65535/51003646781_4a3a37e4ce.jpg';
        var caption = 'test';
        var divImage = `
        <div style="width:100%;height:100%;">
            <img src="`+url+`" style="width:100%;height:90%;"></img>
            <div>`+caption+`</div>
            <div class="div_image_id">`+imageId+`</div>
        </div>
        `;
        $(widget.element).find('.img_image').append(divImage);
    });


    $(widget.element).find('[local_id="button_show_image"]').on('click', function() {
        console.log('button_show_image');
        var url = $(widget.element).find('.textarea_url').val();
        console.log('url',url);
        $(widget.element).find('.img_image').attr('src',url);
    });


    $(widget.element).find('[local_id="button_update"]').on('click', function() {
        //event.stopPropagation();

        var kbId = AKT.state.current_kb;
        var kb = AKT.KBs[kbId];

        if (widget.options.mode ==='new') {
            console.log($(widget.element).find('.input_id').val());
            var id = $(widget.element).find('.input_id').val();
            if (!id) {
                alert('You must enter an ID before updating the knowledge base with this new Image.');
                return;
            }
            for (var existingId in kb._images) {
                if (id === existingId) {
                    if (!confirm('There is already an image with the ID "'+id+'" in the knowledge base.\n\nClick Cancel to change the ID you have provided\n  or\nClick OK to replace the previous image with the current one.')) {
                        return;
                    }
                }
            }

            var caption = $(widget.element).find('[local_id="textarea_caption"]').val();
            if (!caption) {
                alert('You must enter a caption before updating the knowledge base with this new Image.');
                return;
            }

            var url = $(widget.element).find('[local_id="textarea_url"]').val();
            if (!url) {
                alert('You must enter a URL before updating the knowledge base with this new Image.');
                return;
            }

            var caption = $(widget.element).find('[local_id="textarea_caption"]').val();
            if (!caption) {
                //alert('You must enter a caption before updating the knowledge base with this new Image.');
                //return;
            }

            var credits = $(widget.element).find('[local_id="textarea_credits"]').val();
            if (!credits) {
                //alert('You must enter credits information before updating the knowledge base with this new Image.');
                //return;
            }

            var memo = $(widget.element).find('[local_id="textarea_memo"]').val();

            console.log({id:id,caption:caption,url:url,caption:caption,credits:credits,memo:memo});
            var image = new Image(id,{id:id,caption:caption,url:url,caption:caption,credits:credits,memo:memo});
			console.log(image);
            widget.options.image = image;  // TODO: fix this hack.
        }

        kb._images[id] = image;
        AKT.trigger('image_changed_event',{});
		AKT.saveKbInLocalStorage(kbId);
        $('#message').text('Images have been updated');
    });
};


AKT.widgets.image_details.display = function (widget) {
    console.log('^widgets.image_details^display()^options='+AKT.simpleStringify(widget.options));
    console.log(widget.options);
    var kbId = widget.options.kbId;
    var kb = AKT.kbs[kbId];
    var image = widget.options.image; 

    if (image) {
        console.log(image);
        $(widget.element).find('[local_id="input_id"]').val(image._id);
        $(widget.element).find('[local_id="textarea_caption"]').val(image._caption);
        $(widget.element).find('[local_id="textarea_url"]').val(image._url);
        $(widget.element).find('[local_id="textarea_credits"]').val(image._credits);
        $(widget.element).find('[local_id="textarea_memo"]').val(image._memo);
        $(widget.element).find('[local_id="textarea_image"]').attr('src',image._url);
    }

};


AKT.widgets.image_details.html = `
<div class="content" style="border:none;padding:15px;">

    <div style="float:left;">

        <div>
            <div style="float:left;width:30px;">ID</div>
            <input type="text" class="input_id" local_id="input_id" style="float:left; overflow:hidden; height:20px; width:220px; background:white; border:solid 1px black; padding-left:5px;"></input><br/>
            <div style="clear:both;"></div>
       </div>

        <div>
            <div style="float:left;width:70px;">Caption</div><br/>
            <textarea class="textarea_caption" local_id="textarea_caption" style="float:left; overflow:hidden; height:35px; width:250px; background:white; border:solid 1px black; padding-left:5px;"></textarea><br/>
            <div style="clear:both;"></div>
       </div>

        <div>
            <div style="float:left;width:70px;margin-top:7px;">URL</div><br/>
            <textarea class="textarea_url" local_id="textarea_url" style="float:left; word-wrap:break-word; overflow:auto; height:35px; width:250px; background:white; border:solid 1px black;padding-left:5px;">https://live.staticflickr.com/65535/51003646781_4a3a37e4ce.jpg</textarea><br/>
            <div style="clear:both;"></div>
       </div>

        <div>
            <div style="float:left;width:70px;margin-top:7px;">Credits</div><br/>
            <textarea class="textarea_credits" local_id="textarea_credits" style="float:left;overflow:auto;height:67px;width:250px;background:white;border:solid 1px black;padding-left:5px;"></textarea>
            <div style="clear:both;"></div>
       </div>

        <div>
            <div style="float:left;width:70px;margin-top:7px;">Memo</div><br/>
            <textarea class="textarea_memo" local_id="textarea_meno" style="float:left;overflow:auto;height:67px;width:250px;background:white;border:solid 1px black;padding-left:5px;"></textarea>
            <div style="clear:both;"></div>
        </div>

    </div>

    </div>
        <img class="img_image" local_id="img_image" style="float:left;width:300px;height:300px;margin:10px;border:solid 1px black"></img>
        <button class="button_show_image"  local_id="button_show_image" style="float:right;">Show image</button>
    </div>

    <div style="clear:both;"></div>

    <button class="button_update" local_id="button_update" style="float:right;height:25px;width:40px;margin-right:20px;margin-bottom:20px;">Update</button>

</div>     <!-- End of content div -->
`;



