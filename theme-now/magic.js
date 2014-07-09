/*jshint jquery: true, undef:true, devel:true, indent:2, curly:true, strict:true, browser:true */
/*global WallStream, WallStreamCore */

(function() {
  "use strict";

  var
  createPostHtml = function(post) {
    return WallStream.tmpl($("#post-template").html(), post);
  },
  stream = new WallStreamCore({
    accessToken: "5f864451221b0e8d2ff61b3179ac1a3b5d4ac9e3",
    fields: ["id", "type", "external_name", "comment", "post_image"],
    onPost: function(post) {
      console.log(post);

      if (post.comment.length > 80) {
        post.comment = post.comment.substr(0, 77) + "…";
      }

      $(".wall")
      .prepend(createPostHtml(post))
      .find(".post").slice(20).remove();
    }
  });
}());
