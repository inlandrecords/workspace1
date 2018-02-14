(function($) {

	$.fn.opacityToggle = function(duration) {
		var ms = duration || 1;
		return this.each(function() {
			var $elt = $(this);
			$elt.animate({opacity: $elt.css('opacity') < 0.01 ? 1 : 1e-6}, ms);
		});
	};

})(jQuery);
