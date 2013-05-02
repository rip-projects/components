(function($) {

    var AppContext = function(element) {
        this.$el = $(element);

        this.app = this.$el.data();
    };

    AppContext.prototype.get = function(obj, key, raw) {
        if (!key && 'string'===typeof obj) {
            key = obj;
            obj = this;
        }

        var last = key.indexOf('.');
        if (last === -1) {
            if (typeof obj[key] == 'function' && !raw) {
                return obj[key]();
            } else {
                return obj[key];
            }
        } else {
            var k1 = key.split('.');

            var obkey = key.substr(0, last);
            var newkey = key.substr(last + 1);

            var newob = obj[obkey];
            if (typeof newob == 'function' && !raw) {
                newob = newob();
            }

            return this.get(newob, newkey, raw);
        }
    };

    AppContext.prototype.siteURL = function(uri) {
        return this.get('app.siteurl') + uri;
    };

    var $script = $($('script')[$('script').length - 1]);
    if ($script.attr('data-auto')) {
        var noConflict = window.APP;
        window.APP = new AppContext($script);
        window.APP.noConflict = noConflict;

        $('html').data('app', window.APP);
    }

})(jQuery);