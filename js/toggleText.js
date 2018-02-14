(function($) {
  
    $.fn.toggleButtonText = function() {
      
        return this.each(function() {
            var elt = $(this),
                which = elt.prop('tagName'),
                atxt = elt.data('altText'), 
                dtxt = which === 'BUTTON' ? elt.text() : elt.val();
          
            elt.click(function() {
              if (atxt && which === 'BUTTON') {
                elt.text(elt.text() === dtxt ? atxt : dtxt);
              } else if (atxt && which === 'INPUT') {
                elt.val(elt.val() === dtxt ? atxt : dtxt);
              }
            });
          
        });
    };

})(jQuery);

