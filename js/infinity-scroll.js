/**
 * Copyright 2015 Karl MARQUES <marques.karl@live.fr>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function ($) {

  $.infinityScroll = function (element, options) {

    // private property
    //
    // plugin's default options
    //
    var defaults = {
      loader: null,
      page_init: 0,
      item_per_page: 20,
      data: {},
      renderItem: null,
      timeout: 5000,
      ratio: 5,
      language: {
        loading: 'Loading',
        urlMissing: 'No url for ajax call',
        noMore: 'There is no more data'
      }
    };

    // to avoid confusions, use "plugin" to reference the
    // current instance of the object
    var plugin = this;
    var checking = false, more = true, page = 1;
    plugin.settings = {};

    var loaderDefault = 'data:image/gif;base64,R0lGODlhEAALAPQAAP///wAAANra2tDQ0Orq6gYGBgAAAC4uLoKCgmBgYLq6uiIiIkpKSoqKimRkZL6+viYmJgQEBE5OTubm5tjY2PT09Dg4ONzc3PLy8ra2tqCgoMrKyu7u7gAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCwAAACwAAAAAEAALAAAFLSAgjmRpnqSgCuLKAq5AEIM4zDVw03ve27ifDgfkEYe04kDIDC5zrtYKRa2WQgAh+QQJCwAAACwAAAAAEAALAAAFJGBhGAVgnqhpHIeRvsDawqns0qeN5+y967tYLyicBYE7EYkYAgAh+QQJCwAAACwAAAAAEAALAAAFNiAgjothLOOIJAkiGgxjpGKiKMkbz7SN6zIawJcDwIK9W/HISxGBzdHTuBNOmcJVCyoUlk7CEAAh+QQJCwAAACwAAAAAEAALAAAFNSAgjqQIRRFUAo3jNGIkSdHqPI8Tz3V55zuaDacDyIQ+YrBH+hWPzJFzOQQaeavWi7oqnVIhACH5BAkLAAAALAAAAAAQAAsAAAUyICCOZGme1rJY5kRRk7hI0mJSVUXJtF3iOl7tltsBZsNfUegjAY3I5sgFY55KqdX1GgIAIfkECQsAAAAsAAAAABAACwAABTcgII5kaZ4kcV2EqLJipmnZhWGXaOOitm2aXQ4g7P2Ct2ER4AMul00kj5g0Al8tADY2y6C+4FIIACH5BAkLAAAALAAAAAAQAAsAAAUvICCOZGme5ERRk6iy7qpyHCVStA3gNa/7txxwlwv2isSacYUc+l4tADQGQ1mvpBAAIfkECQsAAAAsAAAAABAACwAABS8gII5kaZ7kRFGTqLLuqnIcJVK0DeA1r/u3HHCXC/aKxJpxhRz6Xi0ANAZDWa+kEAA7AAAAAAAAAAAA';

    var $element = $(element), // reference to the jQuery version of DOM element
      element = element;    // reference to the actual DOM element

    // Constructor
    //
    plugin.init = function () {
      // Merge settings with defaults
      plugin.settings = $.extend(true, {}, defaults, options);

      if (checkRequirements()) {
        getData();
        bindEvents();
      }
    };

    // private method
    //
    // Check requirements
    //
    var checkRequirements = function () {
      var result = true;

      if (plugin.settings.renderItem == null) {
        plugin.settings.renderItem = _renderItem;
      }

      if (plugin.settings.loader == null) {
        plugin.settings.loader = loaderDefault;
      }

      if (!plugin.settings.url) {
        $element.append('<p class="alert alert-error">' + plugin.settings.language.urlMissing + '</p>');
        result = false;
      }

      page = plugin.settings.page_init;

      return result;
    };

    // private method
    //
    // Compute window size
    var windowSize = function () {
      var size = {width: 0, height: 0};
      if (typeof( window.innerWidth ) == 'number') {
        //Non-IE
        size.width = window.innerWidth;
        size.height = window.innerHeight;
      } else if (document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight )) {
        //IE 6+ in 'standards compliant mode'
        size.width = document.documentElement.clientWidth;
        size.height = document.documentElement.clientHeight;
      } else if (document.body && ( document.body.clientWidth || document.body.clientHeight )) {
        //IE 4 compatible
        size.width = document.body.clientWidth;
        size.height = document.body.clientHeight;
      }

      return size;
    };

    // private method
    //
    // Compute window size
    var getData = function () {
      if (more && !checking) {
        checking = true;
        var data = plugin.settings.data;
        data.page = page;
        data.item_per_page = plugin.settings.item_per_page;
        $.ajax({
          url: plugin.settings.url,
          data: data,
          dataType: 'json',
          type: 'POST',
          success: function (json) {
            $.each(json.data, function (index, item) {
              $(element).append(plugin.settings.renderItem(item));
            });
            page++;
            more = json.more;
            if (!more) {
              setTimeout(function () {
                more = true
              }, plugin.settings.timeout);
            }
            checking = false;
          }
        });
      }
    };

    // private method
    //
    // Bind events (drag, drop, click
    //
    var bindEvents = function () {
      $(window).scroll(function () {
        var windowBottom = $(window).scrollTop() + windowSize().height,
          elementBottom = $element.position().top + $element.height(),
          effectiveRatio = (elementBottom - windowBottom) / windowSize().height * 100;

        if (effectiveRatio < plugin.settings.ratio) {
          getData();
        }
      });
    };

    var _renderItem = function (item) {
      return '<span>' + item.title + '</span>';
    };

    // call the "constructor" method
    plugin.init();

  };

  // add the plugin to the jQuery.fn object
  $.fn.infinityScroll = function (options) {

    var args = Array.prototype.slice.call(arguments, 1);

    var returns;

    // iterate through the DOM elements we are attaching the plugin to
    this.each(function () {
      // if plugin has not already been attached to the element

      if (undefined == $(this).data('plugin_infinityScroll') || typeof options === 'object') {


        // create a new instance of the plugin
        // pass the DOM element and the user-provided options as arguments
        var plugin = new $.infinityScroll(this, options);

        // store a reference to the plugin object
        $(this).data('plugin_infinityScroll', plugin);
        console.log("infinity Scroll initialized");

      } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {


        var instance = $(this).data('plugin_infinityScroll');

        if (instance instanceof $.infinityScroll && typeof instance[options] === 'function') {

          returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
        }

        // Allow instances to be destroyed via the 'destroy' method
        if (options === 'destroy') {
          $(this).data('plugin_infinityScroll', null);
        }

      }
    });

    return returns !== undefined ? returns : this;

  };

  // Fix problems with console object when browser debug mode not activated
  if (!window.console) window.console = {log: function () {
  }};

})(jQuery);