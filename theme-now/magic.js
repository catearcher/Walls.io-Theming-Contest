/*jshint jquery: true, undef:true, devel:true, indent:2, curly:true, strict:true, browser:true */

(function() {
  "use strict";

  $(".wall").wallStream({
    accessToken: "5f864451221b0e8d2ff61b3179ac1a3b5d4ac9e3",
    template: $("#post-template").html(),
    insertPosition: "after",
    beforeInsert: function(html, post) {
      console.log(post);

      return html;
    }
  });
}());
