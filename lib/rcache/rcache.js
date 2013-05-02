(function() {
    var RCache = function(element, options) {
        var that = this;
        var key;

        this.$el = $(element);
        this.version = null;

        options = $.extend({}, this.$el.data(), options);
        this.options = $.extend({}, RCache.defaultOptions, options);
        this.options.interval = parseInt(this.options.interval, 10);

        if (this.options.interval > 100) {
            setTimeout(function _interval() {
                window.applicationCache.update();
                setTimeout(_interval, that.options.interval);
            }, this.options.interval);
        }

        window.applicationCache.addEventListener('updateready', function(e) {
            that.onUpdateReady(e);
        }, false);

        $(document).ready(function() {
            that.check();
        });
    };

    RCache.prototype.onUpdateReady = function(evt) {
        if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
            window.applicationCache.swapCache();
            if (confirm('A new version of this site is available. Load it?')) {
                window.location.reload();
            }
        } else {
            // Manifest didn't changed. Nothing new to server.
        }
    };

    RCache.prototype.check = function(cb) {
        var that = this;
        $.get(this.$el.attr('manifest') + '?t=' + (new Date()).getTime(), function(data) {
            var v = data.match(/version:(.*)/);
            v = (v[1] || '').trim();

            if (that.version != v) {
                window.applicationCache.update();
            }
            window.localStorage['rcache.version'] = that.version = v;

            $('[data-cache-version]').html(that.version);
            $('[data-cache-version]').val(that.version);

            if (cb) return cb(null, v);
        }).fail(function() {
            that.version = that.version || window.localStorage['rcache.version'];

            $('[data-cache-version]').html(that.version);
            $('[data-cache-version]').val(that.version);

            if (cb) return cb(new Error('Offline'), that.version);
        });
    };

    $.fn.rcache = function() {
        if ($(this)[0].tagName.toUpperCase() !== 'HTML') return this;

        if ($(this).data('cache')) return this;

        $(this).data('cache', new RCache(this));
    };

    $.fn.rcache.defaultOptions = {
        'interval': -1
    };

    if ($('html').attr('manifest')) {
        $('html').rcache();
    }
})($);
// Check if a new cache is available on page load.
// window.addEventListener('load', function(e) {

//     var appCache = window.applicationCache;

//     setInterval(function() {
//         console.log('check');
//         appCache.update();
//     }, 1000);
//     window.applicationCache.addEventListener('updateready', function(e) {
//         if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
//             // Browser downloaded a new app cache.
//             // Swap it in and reload the page to get the new hotness.
//             window.applicationCache.swapCache();
//             if (confirm('A new version of this site is available. Load it?')) {
//                 window.location.reload();
//             }
//         } else {
//             // Manifest didn't changed. Nothing new to server.
//         }
//     }, false);


//     function handleCacheEvent(e) {
//         console.log(e.type);
//     }

//     function handleCacheError(e) {
//       alert('Error: Cache failed to update!');
//     }


//     // Fired after the first cache of the manifest.
//     appCache.addEventListener('cached', handleCacheEvent, false);

//     // Checking for an update. Always the first event fired in the sequence.
//     appCache.addEventListener('checking', handleCacheEvent, false);

//     // An update was found. The browser is fetching resources.
//     appCache.addEventListener('downloading', handleCacheEvent, false);

//     // The manifest returns 404 or 410, the download failed,
//     // or the manifest changed while the download was in progress.
//     appCache.addEventListener('error', handleCacheError, false);

//     // Fired after the first download of the manifest.
//     appCache.addEventListener('noupdate', handleCacheEvent, false);

//     // Fired if the manifest file returns a 404 or 410.
//     // This results in the application cache being deleted.
//     appCache.addEventListener('obsolete', handleCacheEvent, false);

//     // Fired for each resource listed in the manifest as it is being fetched.
//     appCache.addEventListener('progress', handleCacheEvent, false);

//     // Fired when the manifest resources have been newly redownloaded.
//     appCache.addEventListener('updateready', handleCacheEvent, false);

// }, false);