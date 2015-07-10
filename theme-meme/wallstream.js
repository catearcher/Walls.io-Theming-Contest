(function() {
  var WallStream, WallStreamCore,
    __slice = [].slice;

  String.prototype.camelize = function() {
    return this.split(/-/).reduce(function(a, b) {
      if (/^\w+$/.test(b)) {
        return a + (a ? b[0].toUpperCase() : b[0]) + b.slice(1);
      } else {
        return a;
      }
    });
  };

  WallStream = (function() {
    var defaults;

    defaults = {
      template: '<p id="<%=id%>"><%=comment%></p>',
      maxPosts: 10,
      insertPosition: "before"
    };

    function WallStream(el, options) {
      var $el, callback, renderPost, stream;
      if (options == null) {
        options = {};
      }
      $el = $(el);
      options = $.extend({}, defaults, options);
      this.$el = $el;
      renderPost = function(post) {
        var $html, html, maxPosts, posts, sliceOptions, template;
        template = $.isFunction(options.template) ? options.template(post) : options.template;
        html = WallStream.tmpl(template, post);
        callback(options.beforeInsert, html, post);
        if (options.insertPosition === "before") {
          $el.prepend($html = $(html));
        } else {
          $el.append($html = $(html));
        }
        if ((maxPosts = options.maxPosts) !== false) {
          sliceOptions = {
            after: [0, maxPosts * -1],
            before: [maxPosts]
          };
          posts = $el.children();
          posts.slice.apply(posts, sliceOptions[options.insertPosition]).remove();
        }
        return callback(options.afterInsert, $html, post);
      };
      callback = function() {
        var args, callback;
        callback = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        if ($.isFunction(callback)) {
          return callback.apply(window, args);
        }
      };
      stream = new WallStreamCore($.extend(options, {
        onPost: renderPost
      }));
      this.stop = stream.stop;
      this.start = stream.start;
      this.destroy = function() {
        stream.destroy();
        stream = null;
        return $el.trigger("wallstream.destroyed");
      };
    }

    return WallStream;

  })();

  window.WallStream = WallStream;

  WallStreamCore = (function() {
    var defaults, onPostCallbacks, preparePost;

    onPostCallbacks = [];

    defaults = {
      wallId: null,
      host: "node1.walls.io",
      port: 443,
      includeBacklog: true,
      onPost: function() {}
    };

    preparePost = function(checkin) {
      delete checkin.modified;
      delete checkin.created;
      delete checkin.wall_id;
      return checkin;
    };

    function WallStreamCore(options) {
      options = $.extend({}, defaults, options);
      if (!options.wallId) {
        throw new Error("WallStreamCore: wallId missing");
      }
      onPostCallbacks.push(options.onPost);
      this.socket = io.connect("https://" + options.host + ":" + options.port);
      this.socket.on("connect", (function(_this) {
        return function() {
          return _this.socket.emit("subscribe", {
            wallId: options.wallId,
            includeBacklog: options.includeBacklog
          });
        };
      })(this));
      this.socket.on("new checkins", (function(_this) {
        return function(checkins) {
          var checkin, onPostCallback, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = onPostCallbacks.length; _i < _len; _i++) {
            onPostCallback = onPostCallbacks[_i];
            _results.push((function() {
              var _j, _len1, _results1;
              _results1 = [];
              for (_j = 0, _len1 = checkins.length; _j < _len1; _j++) {
                checkin = checkins[_j];
                _results1.push(onPostCallback(preparePost(checkin)));
              }
              return _results1;
            })());
          }
          return _results;
        };
      })(this));
      this.on = function(event, callback) {
        if (event === "post") {
          onPostCallbacks.push(callback);
        }
        return this;
      };
      this.destroy = function() {
        return this.stop();
      };
      this.start = function() {
        if (this.socket.disconnected) {
          this.socket.connect();
        }
        return this;
      };
      this.stop = function() {
        this.socket.disconnect();
        return this;
      };
      this.start();
    }

    return WallStreamCore;

  })();

  window.WallStreamCore = WallStreamCore;

  (function() {
    var cache, tmpl;
    cache = {};
    window.WallStream.tmpl = tmpl = function(str, data) {
      var fn;
      fn = (!/\W/.test(str) ? cache[str] = cache[str] || tmpl(document.getElementById(str).innerHTML) : new Function("obj", "var p=[],print=function(){p.push.apply(p,arguments);};" + "with(obj){p.push('" + str.replace(/[\r\t\n]/g, " ").split("<%").join("\t").replace(/((^|%>)[^\t]*)'/g, "$1\r").replace(/\t=(.*?)%>/g, "',$1,'").split("\t").join("');").split("%>").join("p.push('").split("\r").join("\\'") + "');}return p.join('');"));
      if (data) {
        return fn(data);
      } else {
        return fn;
      }
    };
  })();

}).call(this);
