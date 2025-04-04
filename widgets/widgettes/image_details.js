AKT.widgets.image_details = {};


AKT.widgets.image_details.settings = {width:'400px',height:'440px'};


AKT.widgets.image_details.setup = function (widget) {

    var mode = widget.options.mode;
    if (mode === 'new') {

    } else if (mode === 'view') {
        $(widget.element).find('.button_update').css({display:'none'});
        $(widget.element).find('.button_show').css({display:'none'});
        $(widget.element).find('div').attr('contenteditable',false);

    } else if (mode === 'edit') {
        $(widget.element).find('.button_show').css({display:'none'});
    }

    $(widget.element).find('.button_update').on('click', function() {
        event.stopPropagation();

        var kbId = AKT.state.current_kb;
        var kb = AKT.KBs[kbId];

        console.log('Show image');
    });



    $(widget.element).find('.button_showxxx').on('click', function() {
        console.log('button_show');
        event.stopPropagation();

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


    $(widget.element).find('.button_show').on('click', function() {
       var url = $(widget.element).find('.div_url').text();
       $(widget.element).find('.img_image').attr('src',url);
    });


    $(widget.element).find('.button_update').on('click', function() {
        event.stopPropagation();

        var kbId = AKT.state.current_kb;
        var kb = AKT.KBs[kbId];

        if (widget.options.mode ==='new') {
            console.log($(widget.element).find('.div_id').text());
            var id = $(widget.element).find('.div_id').text();
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

            var caption = $(widget.element).find('.div_caption').text();
            if (!caption) {
                alert('You must enter a caption before updating the knowledge base with this new Image.');
                return;
            }

            var url = $(widget.element).find('.div_url').text();
            if (!url) {
                alert('You must enter a URL before updating the knowledge base with this new Image.');
                return;
            }

            var caption = $(widget.element).find('.div_caption').text();
            if (!caption) {
                //alert('You must enter a caption before updating the knowledge base with this new Image.');
                //return;
            }

            var credits = $(widget.element).find('.div_credits').text();
            if (!credits) {
                //alert('You must enter credits information before updating the knowledge base with this new Image.');
                //return;
            }

            var memo = $(widget.element).find('.div_memo').text();

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
    console.log(widget.options);
    var kbId = widget.options.kbId;
    var kb = AKT.kbs[kbId];
    var image = widget.options.image; 

    if (image) {
        console.log(image);
        $(widget.element).find('.div_id').text(image._id);
        $(widget.element).find('.div_caption').text(image._caption);
        $(widget.element).find('.div_url').text(image._url);
        $(widget.element).find('.div_caption').text(image._caption);
        $(widget.element).find('.div_credits').text(image._credits);
        $(widget.element).find('.div_memo').text(image._memo);
        $(widget.element).find('.img_image').attr('src',image._url);
    }

};


AKT.widgets.image_details.html = `
<div class="content" style="border:none;padding:15px;">

    <div style="float:left;">

        <div>
        <div style="float:left;width:30px;">ID</div>
            <div class="div_id" contenteditable style="float:left; overflow:hidden; height:20px; width:220px; background:white; border:solid 1px black; padding-left:5px;"></div><br/>
            <div style="clear:both;"></div>
       </div>

        <div>
            <div style="float:left;width:70px;">Caption</div><br/>
            <div class="div_caption" contenteditable style="float:left; overflow:hidden; height:35px; width:250px; background:white; border:solid 1px black; padding-left:5px;"></div><br/>
            <div style="clear:both;"></div>
       </div>

        <div>
            <div style="float:left;width:70px;margin-top:7px;">URL</div><br/>
            <div class="div_url" contenteditable style="float:left; word-wrap:break-word; overflow:auto; height:35px; width:250px; background:white; border:solid 1px black;padding-left:5px;">https://live.staticflickr.com/65535/51003646781_4a3a37e4ce.jpg</div><br/>
            <div style="clear:both;"></div>
       </div>

        <div>
            <div style="float:left;width:70px;margin-top:7px;">Credits</div><br/>
            <div class="div_credits" contenteditable style="float:left;overflow:auto;height:67px;width:250px;background:white;border:solid 1px black;padding-left:5px;"></div>
            <div style="clear:both;"></div>
       </div>

        <div>
            <div style="float:left;width:70px;margin-top:7px;">Memo</div><br/>
            <div class="div_memo" contenteditable style="float:left;overflow:auto;height:67px;width:250px;background:white;border:solid 1px black;padding-left:5px;"></div>
            <div style="clear:both;"></div>
        </div>

    </div>

    </div>
        <img class="img_image" style="float:left;width:300px;height:300px;margin:10px;border:solid 1px black"></img>
        <button class="button_show" style="float:right;">Show image</button>
    </div>

    <div style="clear:both;"></div>

    <button class="button_update" style="float:right;height:25px;width:40px;margin-right:20px;margin-bottom:20px;">Update</button>

</div>     <!-- End of content div -->
`;



