/*
 * Upload Progress for Prototype
 *
 * Example:
 *
 * <style type="text/css">
 * .bar {
 *     width: 300px;
 *     background: #eee;
 *     border: 1px solid #222;
 * }
 * #progressbar {
 *     width: 0px;
 *     height: 24px;
 *     background: #333;
 * }
 * </style>
 *
 * <script type="text/javascript">
 * document.observe('dom:loaded', function() {
 *   $('upload').uploadProgress();
 * });
 * </script>
 *
 * <form action="/some_action" enctype="multipart/form-data" id="upload" method="post">
 *   <input id="myFile" name="myFile" type="file" />
 *   <input type="submit" value="Upload!" />
 * </form>
 * <div class="bar">
 *   <div id="progressbar">&nbsp;</div>
 * </div>
 *
 * You can pass some options to the uploadProgess() call.
 * $('upload').uploadProgress({interval: 5});
 *
 * Port by Edgar J. Suárez - http://mimbles.net
 * Based on the jQuery plugin: http://blog.new-bamboo.co.uk/assets/2007/11/23/jquery.nginxUploadProgress.js
 *
 */
Element.addMethods({
    uploadProgress: function(form, options) {
        form.observe('submit', function() {    
            options = Object.extend({
                interval: 1,
                progress_bar_id: 'progressbar',
                progress_url: '/progress'
            }, options);
            var uuid = '';
            for(var i = 0; i < 32; i++) { uuid += Math.floor(Math.random() * 16).toString(16); }
    
            this.writeAttribute('action', this.readAttribute('action') + '?X-Progress-ID=' + uuid);
            
            new PeriodicalExecuter(function(timer) {
                checkUploadProgress(timer, options['progress_url'], options['progress_bar_id'], uuid)
            }, options['interval']);
        });
    }
});

var checkUploadProgress = function(timer, progress_url, progress_bar_id, uuid) {
    new Ajax.Request(
        progress_url, {
            method: 'get',
            requestHeaders: { 'X-Progress-ID': uuid },
            onSuccess: function(transport) {
                var upload = transport.responseText.evalJSON();
                
                if(upload.state == 'uploading') {
                    var bar = $(progress_bar_id);
                    var w = Math.floor((upload.received / upload.size) * 100);
                    bar.setStyle({width: w + '%'});
                } else {
                    timer.stop();
                }
            },
            onFailure: function() {
                timer.stop();
            }
        }
    );
}
