// Javascript library for common ML interactive tasks

var MLI = MLI || {};

// jQuery.noConflict();

// jQuery(document).ready(function($) {

(function(ml, undefined){
 // Begin CONSTANTS
 // ---------------
	ml.version = "1.0";

	// Colors for buttons and sliders
	ml.COLORS = {
		BLUE: "#4f81bd", // rgb(79, 129, 189)
		LIGHTBLUE: "#becfe4", // rgb(190, 207, 228)
		ORANGE: "#f79646", // rgb(247, 150, 70)
		LIGHTORANGE: "#fbd5b5", // rgb(251, 213, 181)
		RED: "#c0504d", // rgb(192, 80, 77)
		LIGHTRED: "#e5b9b7", // rgb(229, 185, 183)
		GREEN: "#9bbb59", // rgb(155, 187, 89)
		LIGHTGREEN: "#cdddac", // rgb(205, 221, 172)
		PURPLE: "#8064a2", // rgb(128, 100, 162)
		LIGHTPURPLE: "#ccc1d9", // rgb(204, 193, 217)
		BLACK: "#000000", // rgb(0, 0, 0)
		LIGHTBLACK: "#999999", // rgb(153, 153, 153)
		GRAY: "#595959",
		EVALGRAY: "rgba(89, 89, 89, 0.5)",
		EVALBLUE: "rgba(79, 129, 189, 0.5)",
		EVALORANGE: "rgba(247, 150, 70, 0.5)",
		EVALRED: "rgba(192, 80, 77, 0.5)",
		EVALGREEN: "rgba(155, 187, 89, 0.5)",
		EVALPURPLE: "rgba(128, 100, 162, 0.5)"
	};

	// Duration of slideToggle() animation for sliderAreas
	ml.SLIDERDURATION = 200;

	// End CONSTANTS	
  // -------------

	// Mathalicious blues:

	// darker: 
	//		hex: #24689F, rgb(36, 104, 159)
	// lighter:
	//		hex: #CBE1F3, rgb(203, 225, 243)

	// Takes a number (w/ or w/out a decmial) and inserts commas for place value
	ml.addCommas = function(nStr) {
		nStr += '';
    var xDecimalSplit = nStr.split('.');
    var xBeforeDecimal = xDecimalSplit[0];
    var x2 = xDecimalSplit.length > 1 ? '.' + xDecimalSplit[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(xBeforeDecimal)) {
        xBeforeDecimal = xBeforeDecimal.replace(rgx, '$1' + ',' + '$2');
    }
    return xBeforeDecimal + x2;
	};

	// Get a random float between min and max to [dec] decmial places
	ml.randRange = function(min, max, dec) {
		dec = dec === undefined ? 2 : dec;
		return parseFloat((Math.random() * (max - min) + min).toFixed(dec));
	};

	// Get a random integer between min and max
	ml.randInt = function (min, max) {
		if (arguments.length === 1) max = arguments[0], min = 0;
		return ~~(Math.random() * (max - min + 1)) + min;
	};

	// Return a random element from an array
	ml.sample = function(arr) {
		return arr[~~(Math.random() * arr.length)];
	};
		
	// Return a randomly shuffled copy of an array
	ml.shuffle = function(arr) {
		var counter = arr.length, temp, index;
		while (counter--) {
			index = (Math.random() * counter) | 0;
			temp = arr[counter];
			arr[counter] = arr[index];
			arr[index] = temp;
		}
		return arr;
	};

	// Get a random n-sized sample from an array
	ml.nsample = function(arr, size) {
		return arr.length >= size ? ml.shuffle(arr).slice(0, size) : undefined;
	};


	// Return the number of decimal places in a number
	ml.decimalPlaces = function(num) {
		  var match = (''+num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
  if (!match) { return 0; }
  return Math.max(
       0,
       // Number of digits right of decimal point.
       (match[1] ? match[1].length : 0)
       // Adjust for scientific notation.
       - (match[2] ? +match[2] : 0));
	};


	// Set up a new Calculator
	// {expressions: boolean, menus: boolean, menus: boolean, graphpaper: boolean, keypad: boolean, zoomButtons: boolean, solutions: boolean, bounds: array, url: string, autoResize: boolean, expressionsCollapsed: boolean, onload: function, lockViewport: boolean}
	ml.setUpCalc = function(graphId, options) {
		var calc, elt = document.getElementById(graphId);
		if (!options) {
			calc = Desmos.Calculator(elt); // if no options are passed in, use all the Desmos defaults
		} else {
			calc = Desmos.Calculator(elt, {
				expressions: options.expressions === undefined ? true : options.expressions,
				expressionsCollapsed: options.expressionsCollapsed === undefined ? true : options.expressionsCollapsed,
				menus: options.menus === undefined ? true : options.menus,
				graphpaper: options.graphpaper === undefined ? true : options.graphpaper,
				keypad: options.keypad ? true : false,
				zoomButtons: options.zoomButtons ? true : false,
				lockViewport: options.lockViewport ? true : false,
				solutions: options.solutions === undefined ? true : options.solutions,
				// v0.4 stuff to remove branding and border
				branding: options.branding ? true : false,
				border: options.border ? true : false
			});
		}

		var resize = function() {
			calc.resize();
			if (options && options.bounds !== undefined) {
				calc.setViewport(options.bounds);
			}
		};

		if (options && (options.autoResize !== false)) {
			window.addEventListener("resize", resize, false);
		}

		if (options && options.url !== undefined) {
			$.getJSON(options.url).done(function(msg) {
				calc.setState(JSON.stringify(msg.state));
				resize(); // wait until the graph state is loaded...
				if (options && options.onload !== undefined) options.onload();
			}).fail(function() { // fallback to JSONP if the first request fails (here's looking at you, IE9)
				$.getJSON(options.url + '?callback=?').done(function(msg) {
					calc.setState(JSON.stringify(msg.state));
					resize(); // wait until the graph state is loaded...
					if (options && options.onload !== undefined) options.onload();
				});
			});
		} else {
			resize(); // ...calling it at least once fixes the whitespace bug and sets user bounds
		}

	return calc;
	}; 

	// Toggle the visibility of Desmos expressions
	// exprObj is an object with Desmos IDs of the form { '17': {hidden: boolean}, ... }
	ml.toggleVis = function(calcVarName, exprObj, desID) {
		exprObj[desID].hidden = !exprObj[desID].hidden;
		calcVarName.setExpression({id: desID, hidden: exprObj[desID].hidden});
	};

	// Remove/delete Desmos expressions from an array of IDs
	ml.removeByIds = function(calcVarName, arr) {
		for (var i=0, j=arr.length; i<j; i++) {
			calcVarName.removeExpression({id: arr[i]});
		}
	};

	// Set the evaluator segments and x-points to MLI.COLORS.EVALGRAY and .GRAY, respectively
	// evalObject must be of the form { functionID: segs: [seg1id, seg2id], pt: pointid }
	// for example { '16':  segs: ['11', '13'], pt: '19'}...
	// put this into your initialization function and pass into the onload option of MLI.setUpCalc
	ml.setUpEvaluator = function(calcID, evalObject) {
		for (var graphID in evalObject) {
			calcID.setExpressions([
				{id: evalObject[graphID].segs[0], color: ml.COLORS.EVALGRAY},
				{id: evalObject[graphID].segs[1], color: ml.COLORS.EVALGRAY},
				{id: evalObject[graphID].pt, color: ml.COLORS.GRAY}
			]);
		}
	};

	// helpers to get data from desmos graphs
	ml.getIdByListIndex = function(calc, idx) {
		return calc._calc.getState().expressions.list[idx - 1].id;
	}
	
	ml.toggleById = function(calc, id) {
		var hiddenStatus = this.getExpressionById(calc, id).hidden;
		calc.setExpression({id: id, hidden: !hiddenStatus});
	}

	ml.getExpressionById = function(calc, id) {
		var list = calc._calc.getState().expressions.list;
		for (var i = 0; i < list.length; i++) {
			if (list[i].id === id) return list[i]
		}
		return -1;
	}

	ml.setUpSlider = function(options) {
		// options takes the following properties:
		// min - minimum value
		// max - maximum value
		// step - step size
		// value - initial value
		// color - slider color
		// callback - function to invoke when slider value changes
		// label - identifier for where in the DOM to append the slider and update its displayed value
		// decimals - what to round to (default = 0)
		var min = options.min || 0;
		var max = typeof options.max === 'number' ? options.max : Math.max(100,min + 100);
		var step = options.step || (max - min)/100;
		var value = typeof options.value === 'number' ? options.value : min; 
		var color = options.color ? options.color.toUpperCase() : 'BLUE';
		var slider = new ScrubberView();
		var decimals = options.decimals || 0;
		var $sliderVal = $("." + options.label + "-val");
		slider.min(min).max(max).step(step).value(value);
		slider.thumb.style.background = this.COLORS[color];
		slider.thumb.style.borderColor = this.COLORS["LIGHT" + color];
		slider.onValueChanged = function(v) {
			$sliderVal.text(this.addCommas(v.toFixed(decimals)));
			options.callback(v);
		}.bind(this);
		$sliderVal.text(this.addCommas(slider.value().toFixed(decimals)));
		$("#" + options.label + "-slider").append(slider.elt); 
		return slider;
	};

	// Set up a new GeoGebra applet
  // Probably neatest to store "base" in a variable and then pass *that* into setUpGGB(), because the base64 string is going to be suuuuuuper long
	// appID = string, divID = string, width = int, height = int, base = string
	ml.setUpGGB = function(appID, divID, width, height, base) {
		var parameters = {
			"id":appID,
			"width":width,
			"height":height,
			"showToolBar":false,
			"borderColor":null,
			"showMenuBar":false,
			"showAlgebraInput":false,
			"showResetIcon":false,
			"enableLabelDrags":false,
			"enableShiftDragZoom":false,
			"enableRightClick":false,
			"capturingThreshold":null,
			"showToolBarHelp":false,
			"errorDialogsActive":true,
			"useBrowserForJS":false,
			"ggbBase64": base
		};

		var sketch = new GGBApplet(parameters, "4.4");
		sketch.setFontsCSSURL("../../../third_party_tools/GeoGebra/ggbFonts.css");

		/***********************************************************************
		 * BREAK IN CASE OF GEOGEBRA EMERGENCY!!!                              *
		 *                                                                     *
		 * Uncomment the following line to manually force a global rollback to *
		 * version 4.4 for every call of MLI.setUPGGB() when something         *
		 * horrific and unfixable happens to version 5.0.  Comment it out      *
		 * again whenever things seem to get back to normal.  In the meantime, *
		 * contact Michael Borcherds (michael@geogebra.org) and plead with him *
		 * to try and fix things.                                              *
		 *                                                                     *
		 *                              Yours in frustration,                  *
		 *                              Chris Lusto                            *
		 ***********************************************************************/
		// sketch.setHTML5Codebase('http://web.geogebra.org/4.4/webSimple/');

		sketch.inject(divID, "preferhtml5");


		return sketch;
	};

	// Toggle the text of a button
  // btnObj is an object with id attirbutes (strings) as keys of the form { "button1" : { defaultText: "something", altText: "something else" }, ... }
	ml.toggleText = function(btnObj, tgt) {
		tgt = $(tgt);
		var id = tgt.attr("id");
		var currentValue = tgt.val();
		if (btnObj[id])
			tgt.val(currentValue === btnObj[id].defaultText ? btnObj[id].altText : btnObj[id].defaultText);
	};

	// Toggle between two classes (useful for buttons)
	ml.toggleButtonClass = function(toggleArea, class1, class2) {
		var context = $(toggleArea);
		if (context.hasClass(class1)) {
			context.removeClass(class1).addClass(class2);
		} else if (context.hasClass(class2)) {
			context.removeClass(class2).addClass(class1);
		}
	};

	// Set up default toggling behavior for td cells. Use the 'toggletd' class to wrap content you'd like to be toggled.
	MLI.setUpTableToggling = function() {
	    var toggleCells = $('.toggletd');
	    toggleCells.click(function() {
	        $(this).opacityToggle();
	    });
	    var hideAll = function() {
	        toggleCells.css('opacity', 1e-6);
	    };
	    var showAll = function() {
	        toggleCells.css('opacity', 1);
	    };
	    $('#show-all').click(showAll);
	    $('#hide-all').click(hideAll);
	};

	// Override the bin height (useful if we expect contents to be too tall)
  ml.setBinHeight = function(lessonName, questionNumber, defaultHeight, respondtodiv, assetVal, autoCollapse) {
    autoCollapse = (typeof autoCollapse === "undefined") ? false : autoCollapse;
    assetVal = (typeof assetVal === "undefined") ? "0" : assetVal;
    var bin;
    bin = parent.document.querySelectorAll("iframe[src^='http://assets" + assetVal + ".mathalicious.com/lessons/" + lessonName + "/html/" + lessonName + "_Q" + questionNumber + "']");
    if (bin.length > 0) {
    	bin[0].style.height = Math.max(defaultHeight, respondtodiv.height()) + 'px';
    }
    if (autoCollapse == true) {
    	// put code in here later if we want to set autoCollapse on
    }
  };

})(MLI);

$(function() {

	var buttonClasses = ["ml-red", "ml-blue", "ml-green", "ml-orange", "ml-purple", "ml-black", "ml-gray", "ml-grey"];
	
	var toggleHideShow = function(el) {
		for (var i=0;i<buttonClasses.length;i++) {
			MLI.toggleButtonClass(el, buttonClasses[i] + "-show", buttonClasses[i] + "-hide");
		}
	};

	var showColor = function(el) {
		for (var i=0;i<buttonClasses.length;i++) {
			if (el.hasClass(buttonClasses[i] + "-hide")) {
				el.removeClass(buttonClasses[i] + "-hide").addClass(buttonClasses[i] + "-show");
			}
		}
	};

	var hideColor = function(el) {
		for (var i=0;i<buttonClasses.length;i++) {
			if (el.hasClass(buttonClasses[i] + "-show")) {
				el.removeClass(buttonClasses[i] + "-show").addClass(buttonClasses[i] + "-hide");
			}
		}
	};

	$(".btn").on("click", function() {
		if (!/btn-dropdown/.test($(this).attr('class'))) {
			toggleHideShow(this);
		}
		MLI.toggleButtonClass(this, 'btn-dropdown-off', 'btn-dropdown-on');
		if ($(this).hasClass('btn-dropdown-off')) {
			$(this).val($("<div>").html(dropdownOff).text());
		} else if ($(this).hasClass('btn-dropdown-on')) {
			$(this).val($("<div>").html(dropdownOn).text());
		}
	});

	// evaluator button logic
	$(".btn-sidebar").click(function() {
		var $btnSidebar = $(this);
		var $siblings = $btnSidebar.siblings();
		var sidebarHidden = /-hide/.test($btnSidebar.attr('class'));
		
		// grab evaluator and ensure synced with button
		var $eval = $siblings.filter(function(idx, el) {
			return $(el).hasClass('btn-eval');
		}).first();
		if ($eval.length && sidebarHidden && 
				/-show/.test($eval.attr('class'))) { $eval.trigger('click'); }
		
		// grab dropdown and ensure synced with button
		var $dropdown = $siblings.filter(function(idx, el) {
			return /btn-dropdown/.test($(el).attr('class'));
		}).first();
		if ($dropdown.length) {
			sidebarHidden ? hideColor($dropdown) : showColor($dropdown);
		}
	});

	$(".btn-eval").click(function() {
		var sib = $(this).siblings()[$(this).siblings().length-1];
		if (sib.className.search(/-hide/) > -1 && this.className.search(/-show/) > -1) { $(sib).click(); }
	});

	// evaluator button character (currently horizontal arrow)
	var specialChar = "&target;";
	var dropdownOn = "&dtrif;";
	var dropdownOff = "&rtrif;";

	$(".btn-eval").val($("<div>").html(specialChar).text()); // hack to dynamically append special characters into value attribute
	$(".btn-dropdown-off").val($("<div>").html(dropdownOff).text());
	$(".btn-dropdown-on").val($("<div>").html(dropdownOn).text());

});
