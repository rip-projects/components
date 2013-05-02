document.writeln('This content generated from javascript');

$(document).on('click', 'a[href=#update]', function(evt) {
    evt.preventDefault();
    if ($('html').data('cache')) {
        $('html').data('cache') .check();
    }
});