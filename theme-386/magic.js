/*jshint jquery: true, undef:true, devel:true, indent:2, curly:true, strict:true, browser:true */
/*global WallStream, WallStreamCore */

(function() {
  "use strict";

  var
  createPostHtml = function(post) {
    return WallStream.tmpl($("#post-template").html(), post);
  },
  preparePost = function(post) {
    if (post.comment && post.comment.length > 100) {
      post.comment = post.comment.substr(0, 97) + "…";
    }

    return post;
  },
  insertPost = function(post) {
    var $post = $(createPostHtml(post));

    $(".wall").prepend($post);
  },
  pruneOldPosts = function() {
    $(".post").slice(10).remove();
  },
  stream = new WallStreamCore({
    wallId: 13228,
    onPost: function(post) {
      console.log(post);

      post = preparePost(post);
      insertPost(post);
      pruneOldPosts();
    }
  });

  window.stream = stream;
}());
