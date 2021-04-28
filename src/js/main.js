$( document ).ready(function(){
  new WOW().init();

  $(".mobile").click(function() {
    $(this).toggleClass("expanded");
  });
});
