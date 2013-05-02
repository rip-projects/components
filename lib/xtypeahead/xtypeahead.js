(function($) {

    var XTypeAhead = function(element, options) {
        var that = this;

        this.$el = $(element);
        this.$hidden = $('<input type="hidden" name="' + this.$el.attr('name') + '" />');
        this.$el.removeAttr('name');
        this.$el.after(this.$hidden);

        this.options = $.extend({}, this.$el.data(), options);
        if (typeof this.options.source == 'string') {
            var split = this.options.source.split(':');

            this.uriType = split[0].toLowerCase();
            if (this.uriType.indexOf('http') !== 0) {
                switch(this.uriType) {
                    case 'model':
                        this.uri = this.options.source;
                        this.model = split[1];
                        this.valueKey = split[2] || 'id';
                        this.textKey = split[3] || 'name';
                        this.queryKey = split[3] || 'q';
                        this.options.source = $.proxy(this.getSource, this);
                        break;
                }
            }

        }
        this.source = this.options.source;

        this.options.updater = $.proxy(this.updater, this);
        if (this.uri) {
            this.options.matcher = $.proxy(this.matcher, this);
            this.options.sorter = $.proxy(this.sorter, this);
            this.options.highlighter = $.proxy(this.highlighter, this);
        }

        this.$el.on('focus', this.$el.typeahead.bind(this.$el, 'lookup'));

        this.$el.typeahead(this.options);

        this.$hidden.val(this.$el.val());
        this.getSelection(this.$el.val(), function(err, value) {
            that.$el.val(value).trigger('change');
        });
    };

    XTypeAhead.prototype.updater = function(value, type) {
        if (type == 'value') {
            this.$hidden.val(value);
        }
        return value;
    };

    XTypeAhead.prototype.matcher = function(item) {
        // var q = this.$el.data('typeahead').query;
        // if (item[this.queryKey].toLowerCase().indexOf(q.trim().toLowerCase()) != -1) {
        //     return true;
        // }
        return true;
    };

    XTypeAhead.prototype.sorter = function(items) {
        return items;
    };

    XTypeAhead.prototype.highlighter = function (item) {
        var q = this.$el.data('typeahead').query;
        var regex = new RegExp( '(' + q + ')', 'gi' );
        return item.replace( regex, "<strong>$1</strong>" );
    };

    XTypeAhead.prototype.getSelection = function(key, cb) {
        if ($.isFunction(this.source)) {
            this.source(key, function(value) {
                if (cb) cb(null, value);
            }, true);
        } else {
            if (cb) cb(null, this.source[key]);
        }
    };

    XTypeAhead.prototype.getSource = function(q, next, isGetKey) {
        var that = this;

        if (isGetKey) {
            if (!q) return;
            $.get(APP.siteURL('/' + this.model + '/' + q + '.json'), function(item) {
                var text = item[that.textKey];
                if (next) return next(text);
            }).fail(function() {
                console.error('fail', arguments);
            });
        } else {
            if (this.ajaxTimeout) clearTimeout(this.ajaxTimeout);

            this.ajaxTimeout = setTimeout(function () {
                if (that.ajaxTimeout) clearTimeout(that.ajaxTimeout);

                if (q === "") {
                    that.hide();
                    return;
                }

                var data = {};
                data[that.queryKey + '!like'] = q;
                data.limit = that.$el.data('typeahead').options.items;

                $.get(APP.siteURL('/' + that.model + '/entries.json'), data, function (result) {
                    var items = {};
                    if (result.entries) {
                        for(var i in result.entries) {
                            items[result.entries[i][that.valueKey]] = result.entries[i][that.textKey];
                        }
                    }
                    next(items);
                });
            }, this.options.ajaxdelay);
        }
    };

    $.fn.xtypeahead = function() {
        if ($(this).length <= 0 || $(this).data('xtypeahead')) return $(this);
        $(this).data('xtypeahead', new XTypeAhead(this));
        return $(this);
    };

    var $script = $($('script')[$('script').length - 1]);
    if ($script.attr('data-auto')) {
        $(function() {
            $('[data-provide=xtypeahead]').xtypeahead();
        });
    }
})(jQuery);