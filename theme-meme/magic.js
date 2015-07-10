/*jshint jquery: true, undef:true, devel:true, indent:2, curly:true, strict:true, browser:true */
/*global WallStream, WallStreamCore */

(function() {
  "use strict";

  var postStack = [];

  var preloadImage = function(url) {
    var img = new Image();
    img.src = url;
  };

  var isUsableComment = function(comment) {
    comment = cleanComment(comment);
    return /\w/.test(comment);
  };

  var cleanComment = function(comment) {
    comment = $("<div>").html(comment).text();
    comment = comment.replace(/#[^\s]+/g, "");
    comment = comment.replace(/https?:\/\/[^\s]+/g, "");

    return $.trim(comment);
  };

  var splitLines = function(text) {
    var lines = [];
    var lineIndex = 0;
    var words = text.split(/[\s]/);
    var maxLineLength = 30;

    while (words.length) {
      var word = words.shift();

      if (!lines[lineIndex]) {
        lines[lineIndex] = [];
      }

      lines[lineIndex].push(word);

      if (lines[lineIndex].join(" ").length >= maxLineLength) {
        lineIndex++;
      }
    }

    return lines.map(function(lineWords) {
      return lineWords.join(" ");
    });
  };

  var scaleMeme = function() {
    var $body = $("body");
    var $container = $(".meme-container");
    var heightScalability = $body.height() / $container.height();
    var widthScalability = $body.width() / $container.width();
    var scale = Math.min(heightScalability, widthScalability);

    $container.css("transform", "scale(" + scale + ")");
  };

  var stream = new WallStreamCore({
    wallId: 14245,
    host: "beta.walls.io",
    port: 81,
    onPost: function(post) {
      if (!post || !post.post_image || !isUsableComment(post.comment)) {
        return false;
      }

      post.comment = cleanComment(post.comment);

      postStack.push(post);
      preloadImage(post.post_image);
    }
  });

  var makeFunny = function() {
    var post = postStack.shift();

    if (!post) {
      return false;
    }

    var $memeContainer = $(".meme-container");
    var $line1 = $memeContainer.find(".line-1");
    var $line2 = $memeContainer.find(".line-2");

    var text = cleanComment(post.comment);
    var lines = splitLines(text);

    $memeContainer.css("background-image", "url(" + post.post_image + ")");
    $line1.text(lines[0]);

    if (lines.length > 1) {
      $line2.text(lines[1]);
    } else {
      $line2.text("");
    }
  };

  setInterval(makeFunny, 3000);
  $(window).resize(scaleMeme);

  makeFunny();
  scaleMeme();

  window.stream = stream;
}());
