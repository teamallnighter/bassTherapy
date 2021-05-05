// Utility function
function Util () {};

/* 
	class manipulation functions
*/
Util.hasClass = function(el, className) {
	if (el.classList) return el.classList.contains(className);
	else return !!el.getAttribute('class').match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
};

Util.addClass = function(el, className) {
	var classList = className.split(' ');
 	if (el.classList) el.classList.add(classList[0]);
  else if (!Util.hasClass(el, classList[0])) el.setAttribute('class', el.getAttribute('class') +  " " + classList[0]);
 	if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
	var classList = className.split(' ');
	if (el.classList) el.classList.remove(classList[0]);	
	else if(Util.hasClass(el, classList[0])) {
		var reg = new RegExp('(\\s|^)' + classList[0] + '(\\s|$)');
    el.setAttribute('class', el.getAttribute('class').replace(reg, ' '));
	}
	if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
	if(bool) Util.addClass(el, className);
	else Util.removeClass(el, className);
};

Util.setAttributes = function(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

/* 
  DOM manipulation
*/
Util.getChildrenByClassName = function(el, className) {
  var children = el.children,
    childrenByClass = [];
  for (var i = 0; i < el.children.length; i++) {
    if (Util.hasClass(el.children[i], className)) childrenByClass.push(el.children[i]);
  }
  return childrenByClass;
};

Util.is = function(elem, selector) {
  if(selector.nodeType){
    return elem === selector;
  }

  var qa = (typeof(selector) === 'string' ? document.querySelectorAll(selector) : selector),
    length = qa.length,
    returnArr = [];

  while(length--){
    if(qa[length] === elem){
      return true;
    }
  }

  return false;
};

/* 
	Animate height of an element
*/
Util.setHeight = function(start, to, element, duration, cb, timeFunction) {
	var change = to - start,
	    currentTime = null;

  var animateHeight = function(timestamp){  
    if (!currentTime) currentTime = timestamp;         
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = parseInt((progress/duration)*change + start);
    if(timeFunction) {
      val = Math[timeFunction](progress, start, to - start, duration);
    }
    element.style.height = val+"px";
    if(progress < duration) {
        window.requestAnimationFrame(animateHeight);
    } else {
    	if(cb) cb();
    }
  };
  
  //set the height of the element before starting animation -> fix bug on Safari
  element.style.height = start+"px";
  window.requestAnimationFrame(animateHeight);
};

/* 
	Smooth Scroll
*/

Util.scrollTo = function(final, duration, cb, scrollEl) {
  var element = scrollEl || window;
  var start = element.scrollTop || document.documentElement.scrollTop,
    currentTime = null;

  if(!scrollEl) start = window.scrollY || document.documentElement.scrollTop;
      
  var animateScroll = function(timestamp){
  	if (!currentTime) currentTime = timestamp;        
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = Math.easeInOutQuad(progress, start, final-start, duration);
    element.scrollTo(0, val);
    if(progress < duration) {
      window.requestAnimationFrame(animateScroll);
    } else {
      cb && cb();
    }
  };

  window.requestAnimationFrame(animateScroll);
};

/* 
  Focus utility classes
*/

//Move focus to an element
Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName("body")[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex','-1');
    element.focus();
  }
};

/* 
  Misc
*/

Util.getIndexInArray = function(array, el) {
  return Array.prototype.indexOf.call(array, el);
};

Util.cssSupports = function(property, value) {
  if('CSS' in window) {
    return CSS.supports(property, value);
  } else {
    var jsProperty = property.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase();});
    return jsProperty in document.body.style;
  }
};

// merge a set of user options into plugin defaults
// https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
Util.extend = function() {
  // Variables
  var extended = {};
  var deep = false;
  var i = 0;
  var length = arguments.length;

  // Check if a deep merge
  if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
    deep = arguments[0];
    i++;
  }

  // Merge the object into the extended object
  var merge = function (obj) {
    for ( var prop in obj ) {
      if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
        // If deep merge and property is an object, merge properties
        if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
          extended[prop] = extend( true, extended[prop], obj[prop] );
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  // Loop through each object and conduct a merge
  for ( ; i < length; i++ ) {
    var obj = arguments[i];
    merge(obj);
  }

  return extended;
};

// Check if Reduced Motion is enabled
Util.osHasReducedMotion = function() {
  if(!window.matchMedia) return false;
  var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(matchMediaObj) return matchMediaObj.matches;
  return false; // return false if not supported
}; 

/* 
	Polyfills
*/
//Closest() method
if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
	Element.prototype.closest = function(s) {
		var el = this;
		if (!document.documentElement.contains(el)) return null;
		do {
			if (el.matches(s)) return el;
			el = el.parentElement || el.parentNode;
		} while (el !== null && el.nodeType === 1); 
		return null;
	};
}

//Custom Event() constructor
if ( typeof window.CustomEvent !== "function" ) {

  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
}

/* 
	Animation curves
*/
Math.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};

Math.easeInQuart = function (t, b, c, d) {
	t /= d;
	return c*t*t*t*t + b;
};

Math.easeOutQuart = function (t, b, c, d) { 
  t /= d;
	t--;
	return -c * (t*t*t*t - 1) + b;
};

Math.easeInOutQuart = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t*t*t + b;
	t -= 2;
	return -c/2 * (t*t*t*t - 2) + b;
};

Math.easeOutElastic = function (t, b, c, d) {
  var s=1.70158;var p=d*0.7;var a=c;
  if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
  if (a < Math.abs(c)) { a=c; var s=p/4; }
  else var s = p/(2*Math.PI) * Math.asin (c/a);
  return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
};


/* JS Utility Classes */

// make focus ring visible only for keyboard navigation (i.e., tab key) 
(function() {
  var focusTab = document.getElementsByClassName('js-tab-focus'),
    shouldInit = false,
    outlineStyle = false,
    eventDetected = false;

  function detectClick() {
    if(focusTab.length > 0) {
      resetFocusStyle(false);
      window.addEventListener('keydown', detectTab);
    }
    window.removeEventListener('mousedown', detectClick);
    outlineStyle = false;
    eventDetected = true;
  };

  function detectTab(event) {
    if(event.keyCode !== 9) return;
    resetFocusStyle(true);
    window.removeEventListener('keydown', detectTab);
    window.addEventListener('mousedown', detectClick);
    outlineStyle = true;
  };

  function resetFocusStyle(bool) {
    var outlineStyle = bool ? '' : 'none';
    for(var i = 0; i < focusTab.length; i++) {
      focusTab[i].style.setProperty('outline', outlineStyle);
    }
  };

  function initFocusTabs() {
    if(shouldInit) {
      if(eventDetected) resetFocusStyle(outlineStyle);
      return;
    }
    shouldInit = focusTab.length > 0;
    window.addEventListener('mousedown', detectClick);
  };

  initFocusTabs();
  window.addEventListener('initFocusTabs', initFocusTabs);
}());

function resetFocusTabsStyle() {
  window.dispatchEvent(new CustomEvent('initFocusTabs'));
};
// File#: _1_accordion
// Usage: codyhouse.co/license
(function() {
	var Accordion = function(element) {
		this.element = element;
		this.items = Util.getChildrenByClassName(this.element, 'js-accordion__item');
		this.version = this.element.getAttribute('data-version') ? '-'+this.element.getAttribute('data-version') : '';
		this.showClass = 'accordion'+this.version+'__item--is-open';
		this.animateHeight = (this.element.getAttribute('data-animation') == 'on');
		this.multiItems = !(this.element.getAttribute('data-multi-items') == 'off'); 
		// deep linking options
		this.deepLinkOn = this.element.getAttribute('data-deep-link') == 'on';
		// init accordion
		this.initAccordion();
	};

	Accordion.prototype.initAccordion = function() {
		//set initial aria attributes
		for( var i = 0; i < this.items.length; i++) {
			var button = this.items[i].getElementsByTagName('button')[0],
				content = this.items[i].getElementsByClassName('js-accordion__panel')[0],
				isOpen = Util.hasClass(this.items[i], this.showClass) ? 'true' : 'false';
			Util.setAttributes(button, {'aria-expanded': isOpen, 'aria-controls': 'accordion-content-'+i, 'id': 'accordion-header-'+i});
			Util.addClass(button, 'js-accordion__trigger');
			Util.setAttributes(content, {'aria-labelledby': 'accordion-header-'+i, 'id': 'accordion-content-'+i});
		}

		//listen for Accordion events
		this.initAccordionEvents();

		// check deep linking option
		this.initDeepLink();
	};

	Accordion.prototype.initAccordionEvents = function() {
		var self = this;

		this.element.addEventListener('click', function(event) {
			var trigger = event.target.closest('.js-accordion__trigger');
			//check index to make sure the click didn't happen inside a children accordion
			if( trigger && Util.getIndexInArray(self.items, trigger.parentElement) >= 0) self.triggerAccordion(trigger);
		});
	};

	Accordion.prototype.triggerAccordion = function(trigger) {
		var bool = (trigger.getAttribute('aria-expanded') === 'true');

		this.animateAccordion(trigger, bool, false);

		if(!bool && this.deepLinkOn) {
			history.replaceState(null, '', '#'+trigger.getAttribute('aria-controls'));
		}
	};

	Accordion.prototype.animateAccordion = function(trigger, bool, deepLink) {
		var self = this;
		var item = trigger.closest('.js-accordion__item'),
			content = item.getElementsByClassName('js-accordion__panel')[0],
			ariaValue = bool ? 'false' : 'true';

		if(!bool) Util.addClass(item, this.showClass);
		trigger.setAttribute('aria-expanded', ariaValue);
		self.resetContentVisibility(item, content, bool);

		if( !this.multiItems && !bool || deepLink) this.closeSiblings(item);
	};

	Accordion.prototype.resetContentVisibility = function(item, content, bool) {
		Util.toggleClass(item, this.showClass, !bool);
		content.removeAttribute("style");
		if(bool && !this.multiItems) { // accordion item has been closed -> check if there's one open to move inside viewport 
			this.moveContent();
		}
	};

	Accordion.prototype.closeSiblings = function(item) {
		//if only one accordion can be open -> search if there's another one open
		var index = Util.getIndexInArray(this.items, item);
		for( var i = 0; i < this.items.length; i++) {
			if(Util.hasClass(this.items[i], this.showClass) && i != index) {
				this.animateAccordion(this.items[i].getElementsByClassName('js-accordion__trigger')[0], true, false);
				return false;
			}
		}
	};

	Accordion.prototype.moveContent = function() { // make sure title of the accordion just opened is inside the viewport
		var openAccordion = this.element.getElementsByClassName(this.showClass);
		if(openAccordion.length == 0) return;
		var boundingRect = openAccordion[0].getBoundingClientRect();
		if(boundingRect.top < 0 || boundingRect.top > window.innerHeight) {
			var windowScrollTop = window.scrollY || document.documentElement.scrollTop;
			window.scrollTo(0, boundingRect.top + windowScrollTop);
		}
	};

	Accordion.prototype.initDeepLink = function() {
		if(!this.deepLinkOn) return;
		var hash = window.location.hash.substr(1);
		if(!hash || hash == '') return;
		var trigger = this.element.querySelector('.js-accordion__trigger[aria-controls="'+hash+'"]');
		if(trigger && trigger.getAttribute('aria-expanded') !== 'true') {
			this.animateAccordion(trigger, false, true);
			setTimeout(function(){trigger.scrollIntoView(true);});
		}
	};

	window.Accordion = Accordion;
	
	//initialize the Accordion objects
	var accordions = document.getElementsByClassName('js-accordion');
	if( accordions.length > 0 ) {
		for( var i = 0; i < accordions.length; i++) {
			(function(i){new Accordion(accordions[i]);})(i);
		}
	}
}());
// File#: _1_adaptive-navigation
// Usage: codyhouse.co/license
(function() {
  var AdaptNav = function(element) {
    this.element = element;
    this.list = this.element.getElementsByClassName('js-adapt-nav__list')[0];
    this.items = this.element.getElementsByClassName('js-adapt-nav__item');
    this.moreBtn = this.element.getElementsByClassName('js-adapt-nav__item--more')[0];
    this.dropdown = this.moreBtn.getElementsByTagName('ul')[0];
    this.dropdownItems = this.dropdown.getElementsByTagName('a');
    this.dropdownClass = 'adapt-nav__dropdown--is-visible';
    this.resizing = false;
    // check if items already outrun nav
    this.outrunIndex = this.items.length;
    // reset alignment
    this.resetAlignment = Util.hasClass(this.list, 'justify-end');
    initAdaptNav(this);
  };

  function initAdaptNav(nav) {
    nav.resizing = true;
    resetOutrun(nav, '', true); // initially hide all elements
    resetAdaptNav.bind(nav)(); // reset navigation based on available space

    // listen to resize
    window.addEventListener('resize', function(event){
      if(nav.resizing) return;
      nav.resizing = true;
      window.requestAnimationFrame(resetAdaptNav.bind(nav));
    });

    // wait for font to be loaded
    if(document.fonts) {
      document.fonts.ready.then(function() {
        if(nav.resizing) return;
        nav.resizing = true;
        window.requestAnimationFrame(resetAdaptNav.bind(nav));
      });
    }

    /* dropdown behaviour */
    // init aria-labels
		Util.setAttributes(nav.moreBtn, {'aria-expanded': 'false', 'aria-haspopup': 'true', 'aria-controls': nav.dropdown.getAttribute('id')});
    
    // toggle dropdown on click
    nav.moreBtn.addEventListener('click', function(event){
      if( nav.dropdown.contains(event.target) ) return;
			event.preventDefault();
			toggleMoreDropdown(nav, !Util.hasClass(nav.dropdown, nav.dropdownClass), true);
    });

    // keyboard events 
		nav.dropdown.addEventListener('keydown', function(event) {
			// use up/down arrow to navigate list of menu items
			if( (event.keyCode && event.keyCode == 40) || (event.key && event.key.toLowerCase() == 'arrowdown') ) {
				navigateItems(nav, event, 'next');
			} else if( (event.keyCode && event.keyCode == 38) || (event.key && event.key.toLowerCase() == 'arrowup') ) {
				navigateItems(nav, event, 'prev');
			}
    });

		window.addEventListener('keyup', function(event){
      if( event.keyCode && event.keyCode == 9 || event.key && event.key.toLowerCase() == 'tab' ) { //close dropdown if focus is outside dropdown element
				if (!nav.moreBtn.contains(document.activeElement)) toggleMoreDropdown(nav, false, false);
			} else if( event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape' ) {// close menu on 'Esc'
        toggleMoreDropdown(nav, false, false);
			} 
		});
    
    // close menu when clicking outside it
		window.addEventListener('click', function(event){
			if( !nav.moreBtn.contains(event.target)) toggleMoreDropdown(nav, false);
		});
  };

  function resetAdaptNav() { // reset nav appearance
    var totalWidth = getListWidth(this.list),
      moreWidth = getFullWidth(this.moreBtn),
      maxPosition = totalWidth - moreWidth,
      cloneList = '',
      hideAll = false;

    // take care of possible right alignment
    if(this.resetAlignment) Util.removeClass(this.list, 'justify-end');

    cloneList = resetOutrun(this, cloneList, false);
    // loop through items -> create clone (if required) and append to dropdown
    for(var i = 0; i < this.outrunIndex; i++) {
      if( Util.hasClass(this.items[i], 'is-hidden')) {
        Util.addClass(this.items[i], 'adapt-nav__item--hidden');
        Util.removeClass(this.items[i], 'is-hidden');
      }
      var right = this.items[i].offsetWidth + this.items[i].offsetLeft + parseFloat(window.getComputedStyle(this.items[i]).getPropertyValue("margin-right"));
      if(right >= maxPosition || hideAll) {
        var clone = this.items[i].cloneNode(true);
        cloneList = cloneList + modifyClone(clone);
        Util.addClass(this.items[i], 'is-hidden');
        hideAll = true;
      } else {
        Util.removeClass(this.items[i], 'is-hidden');
      }
      Util.removeClass(this.items[i], 'adapt-nav__item--hidden');
    }

    if(this.resetAlignment) Util.addClass(this.list, 'justify-end');

    Util.toggleClass(this.moreBtn, 'adapt-nav__item--hidden', (cloneList == ''));
    this.dropdown.innerHTML = cloneList;
    Util.addClass(this.element, 'adapt-nav--is-visible');
    this.outrunIndex = this.items.length;
    this.resizing = false;
  };

  function resetOutrun(nav, cloneList, bool) {
    if(nav.items[0].offsetLeft < 0 || (bool && nav.outrunIndex > 1)) {
      nav.outrunIndex = nav.outrunIndex - 1;
      var clone = nav.items[nav.outrunIndex].cloneNode(true);
      Util.addClass(nav.items[nav.outrunIndex], 'is-hidden');
      cloneList = modifyClone(clone) + cloneList;
      return resetOutrun(nav, cloneList, bool);
    } else {
      if(bool) nav.outrunIndex = nav.items.length;
      return cloneList;
    }
  };

  function getListWidth(list) { // get total width of container minus right padding
    var style = window.getComputedStyle(list);
    return parseFloat(list.getBoundingClientRect().width) - parseFloat(style.getPropertyValue("padding-right"));
  };

  function getFullWidth(item) { // get width of 'More Links' button
    return parseFloat(window.getComputedStyle(item).getPropertyValue("width"));
  };

  function toggleMoreDropdown(nav, bool, moveFocus) { // toggle menu visibility
    Util.toggleClass(nav.dropdown, nav.dropdownClass, bool);
		if(bool) {
			nav.moreBtn.setAttribute('aria-expanded', 'true');
			Util.moveFocus(nav.dropdownItems[0]);
      nav.dropdown.addEventListener("transitionend", function(event) {Util.moveFocus(nav.dropdownItems[0]);}, {once: true});
      placeDropdown(nav);
		} else {
			nav.moreBtn.setAttribute('aria-expanded', 'false');
      if(moveFocus) Util.moveFocus(nav.moreBtn.getElementsByTagName('button')[0]);
      nav.dropdown.style.right = '';
		}
  };

  function placeDropdown(nav) { // make sure dropdown is visible the viewport
    var dropdownLeft = nav.dropdown.getBoundingClientRect().left;
    if(dropdownLeft < 0) nav.dropdown.style.right = (dropdownLeft - 4)+'px';
  };

  function navigateItems(nav, event, direction) { // navigate through dropdown items
    event.preventDefault();
		var index = Util.getIndexInArray(nav.dropdownItems, event.target),
			nextIndex = direction == 'next' ? index + 1 : index - 1;
		if(nextIndex < 0) nextIndex = nav.dropdownItems.length - 1;
		if(nextIndex > nav.dropdownItems.length - 1) nextIndex = 0;
		Util.moveFocus(nav.dropdownItems[nextIndex]);
  };
  
  function modifyClone(clone) { // assign new classes to cloned elements inside the dropdown
    Util.addClass(clone, 'adapt-nav__dropdown-item');
    Util.removeClass(clone, 'js-adapt-nav__item is-hidden adapt-nav__item--hidden adapt-nav__item');
    var link = clone.getElementsByClassName('adapt-nav__link');
    if(link.length > 0) {
      Util.addClass(link[0], 'adapt-nav__dropdown-link js-tab-focus');
      link[0].style.outline = 'none';
      Util.removeClass(link[0], 'adapt-nav__link');
    }
    return clone.outerHTML;
  };

  //initialize the AdaptNav objects
  var adaptNavs = document.getElementsByClassName('js-adapt-nav'),
    flexSupported = Util.cssSupports('align-items', 'stretch');
	if( adaptNavs.length > 0) {
		for( var i = 0; i < adaptNavs.length; i++) {(function(i){
      if(flexSupported) new AdaptNav(adaptNavs[i]);
      else Util.addClass(adaptNavs[i], 'adapt-nav--is-visible');
    })(i);}
	}
}());
// File#: _1_anim-menu-btn
// Usage: codyhouse.co/license
(function() {
	var menuBtns = document.getElementsByClassName('js-anim-menu-btn');
	if( menuBtns.length > 0 ) {
		for(var i = 0; i < menuBtns.length; i++) {(function(i){
			initMenuBtn(menuBtns[i]);
		})(i);}

		function initMenuBtn(btn) {
			btn.addEventListener('click', function(event){	
				event.preventDefault();
				var status = !Util.hasClass(btn, 'anim-menu-btn--state-b');
				Util.toggleClass(btn, 'anim-menu-btn--state-b', status);
				// emit custom event
				var event = new CustomEvent('anim-menu-btn-clicked', {detail: status});
				btn.dispatchEvent(event);
			});
		};
	}
}());
// File#: _1_animated-headline
// Usage: codyhouse.co/license
(function() {
  var TextAnim = function(element) {
    this.element = element;
    this.wordsWrapper = this.element.getElementsByClassName(' js-text-anim__wrapper');
    this.words = this.element.getElementsByClassName('js-text-anim__word');
    this.selectedWord = 0;
    // interval between two animations
    this.loopInterval = parseFloat(getComputedStyle(this.element).getPropertyValue('--text-anim-pause'))*1000 || 1000;
    // duration of single animation (e.g., time for a single word to rotate)
    this.transitionDuration = parseFloat(getComputedStyle(this.element).getPropertyValue('--text-anim-duration'))*1000 || 1000;
    // keep animating after first loop was completed
    this.loop = (this.element.getAttribute('data-loop') && this.element.getAttribute('data-loop') == 'off') ? false : true;
    this.wordInClass = 'text-anim__word--in';
    this.wordOutClass = 'text-anim__word--out';
    // check for specific animations
    this.isClipAnim = Util.hasClass(this.element, 'text-anim--clip');
    if(this.isClipAnim) {
      this.animBorderWidth = parseInt(getComputedStyle(this.element).getPropertyValue('--text-anim-border-width')) || 2;
      this.animPulseClass = 'text-anim__wrapper--pulse';
    }
    initTextAnim(this);
  };

  function initTextAnim(element) {
    // make sure there's a word with the wordInClass
    setSelectedWord(element);
    // if clip animation -> add pulse class
    if(element.isClipAnim) {
      Util.addClass(element.wordsWrapper[0], element.animPulseClass);
    }
    // init loop
    loopWords(element);
  };

  function setSelectedWord(element) {
    var selectedWord = element.element.getElementsByClassName(element.wordInClass);
    if(selectedWord.length == 0) {
      Util.addClass(element.words[0], element.wordInClass);
    } else {
      element.selectedWord = Util.getIndexInArray(element.words, selectedWord[0]);
    }
  };

  function loopWords(element) {
    // stop animation after first loop was completed
    if(!element.loop && element.selectedWord == element.words.length - 1) {
      return;
    }
    var newWordIndex = getNewWordIndex(element);
    setTimeout(function() {
      if(element.isClipAnim) { // clip animation only
        switchClipWords(element, newWordIndex);
      } else {
        switchWords(element, newWordIndex);
      }
    }, element.loopInterval);
  };

  function switchWords(element, newWordIndex) {
    // switch words
    Util.removeClass(element.words[element.selectedWord], element.wordInClass);
    Util.addClass(element.words[element.selectedWord], element.wordOutClass);
    Util.addClass(element.words[newWordIndex], element.wordInClass);
    // reset loop
    resetLoop(element, newWordIndex);
  };

  function resetLoop(element, newIndex) {
    setTimeout(function() { 
      // set new selected word
      Util.removeClass(element.words[element.selectedWord], element.wordOutClass);
      element.selectedWord = newIndex;
      loopWords(element); // restart loop
    }, element.transitionDuration);
  };

  function switchClipWords(element, newWordIndex) {
    // clip animation only
    var startWidth =  element.words[element.selectedWord].offsetWidth,
      endWidth = element.words[newWordIndex].offsetWidth;
    
    // remove pulsing animation
    Util.removeClass(element.wordsWrapper[0], element.animPulseClass);
    // close word
    animateWidth(startWidth, element.animBorderWidth, element.wordsWrapper[0], element.transitionDuration, function() {
      // switch words
      Util.removeClass(element.words[element.selectedWord], element.wordInClass);
      Util.addClass(element.words[newWordIndex], element.wordInClass);
      element.selectedWord = newWordIndex;

      // open word
      animateWidth(element.animBorderWidth, endWidth, element.wordsWrapper[0], element.transitionDuration, function() {
        // add pulsing class
        Util.addClass(element.wordsWrapper[0], element.animPulseClass);
        loopWords(element);
      });
    });
  };

  function getNewWordIndex(element) {
    // get index of new word to be shown
    var index = element.selectedWord + 1;
    if(index >= element.words.length) index = 0;
    return index;
  };

  function animateWidth(start, to, element, duration, cb) {
    // animate width of a word for the clip animation
    var currentTime = null;

    var animateProperty = function(timestamp){  
      if (!currentTime) currentTime = timestamp;         
      var progress = timestamp - currentTime;
      
      var val = Math.easeInOutQuart(progress, start, to - start, duration);
      element.style.width = val+"px";
      if(progress < duration) {
          window.requestAnimationFrame(animateProperty);
      } else {
        cb();
      }
    };
  
    //set the width of the element before starting animation -> fix bug on Safari
    element.style.width = start+"px";
    window.requestAnimationFrame(animateProperty);
  };

  // init TextAnim objects
  var textAnim = document.getElementsByClassName('js-text-anim'),
    reducedMotion = Util.osHasReducedMotion();
  if( textAnim ) {
    if(reducedMotion) return;
    for( var i = 0; i < textAnim.length; i++) {
      (function(i){ new TextAnim(textAnim[i]);})(i);
    }
  }
}());
// File#: _1_article-preview-v3
// Usage: codyhouse.co/license
(function() {
  var Story3 = function(element) {
    this.element = element;
    // data attributes
    this.src = this.element.getAttribute('data-story-img-src');
    this.align = this.element.getAttribute('data-story-img-align') ? this.element.getAttribute('data-story-img-align') : 'right';
    this.offset = this.element.getAttribute('data-story-img-offset-x') ? this.element.getAttribute('data-story-img-offset-x') : '0px';
    this.width = this.element.getAttribute('data-story-img-width') ? this.element.getAttribute('data-story-img-width') : '30%';
    this.customClasses = this.element.getAttribute('data-story-img-class') ? this.element.getAttribute('data-story-img-class') : 'display@lg';
    // preview classes
    this.previewClass = 'story-v3__preview-img js-story-v3__preview-img'+' '+this.customClasses;
    this.previewVisibleClass = 'story-v3__preview-img--is-visible';
    this.preview = false; // will use this to store the preview img element
    // params needed for event listening
    this.eventBind = false;
    this.mousePosition = false;
    // used during mousemove
    this.previewMoving = false;
    initStory3(this);
  };

  function initStory3(story) {
    // create img preview element
    createPreview(story);
    // bind events
    story.eventBind = handleEvent.bind(story);
    story.element.addEventListener('mouseenter', story.eventBind);
  };

  function createPreview(story) {
    story.preview = document.createElement('img');
    story.element.appendChild(story.preview);
    Util.addClass(story.preview, story.previewClass);
    Util.setAttributes(story.preview, {'aria-hidden': true, 'src': story.src});
  };

  function handleEvent(event) {
    switch(event.type) {
      case 'mouseenter': {
        showPreview(this, event);
        break;
      }
      case 'mouseleave': {
        hidePreview(this, event);
        break;
      }
      case 'mousemove': {
        movePreview(this, event);
        break;
      }
    }
  };

  function showPreview(story, event) {
    // show preview
    story.preview.setAttribute('style', getPreviewStyle(story));
    Util.addClass(story.preview, story.previewVisibleClass);
    // bind events
    story.element.addEventListener('mouseleave', story.eventBind);
    story.element.addEventListener('mousemove', story.eventBind);
    // store mouse position
    story.mousePosition = [event.clientX, event.clientY];
  };

  function hidePreview(story, event) {
    // hide image
    Util.removeClass(story.preview, story.previewVisibleClass);
    story.preview.style.transform = '';
    // remove events
    story.element.removeEventListener('mouseleave', story.eventBind);
		story.element.removeEventListener('mousemove', story.eventBind);
  };

  function movePreview(story, event) { // parallax effect
    if(story.previewMoving) return;
    story.previewMoving = true;
    window.requestAnimationFrame(function(){
      updatePreviewPosition(story, event);
      story.previewMoving = false;
    });
  };

  function updatePreviewPosition(story, event) {
    // move preview image
    var translateX = event.clientX - story.mousePosition[0],
      translateY = event.clientY - story.mousePosition[1];
    translateX = resetTranslateValue(translateX);
    translateY = resetTranslateValue(translateY); 
    story.preview.style.transform = 'translateY(calc(-50% + '+translateY+'px)) translateX('+translateX+'px)';
  };

  function getPreviewStyle(story) {
    var storyRect = story.element.getBoundingClientRect(),
      horizontalStyle = '';
    if(story.align == 'right') {
      horizontalStyle = 'right:'+getValue(storyRect.width, story.offset)+'px;';
    } else {
      horizontalStyle = 'left:'+getValue(storyRect.width, story.offset)+'px;';
    }
    var style = 'width: '+getValue(storyRect.width, story.width)+'px;'+horizontalStyle;

    return style;
  };

  function getValue(width, val) {
    if(val.indexOf('%') > -1) {
      return width*parseInt(val)/100;
    } else {
      return parseInt(val);
    }
  };

  function resetTranslateValue(val) {
    return parseInt(val/30);
  };

  window.Story3 = Story3;

  // init the Story3 objects
  var story3 = document.getElementsByClassName('js-story-v3');
  if(story3.length > 0) {
    for( var i = 0; i < story3.length; i++) {
      (function(i){ new Story3(story3[i]);})(i);
    }
  }
}());
// File#: _1_back-to-top
// Usage: codyhouse.co/license
(function() {
  var backTop = document.getElementsByClassName('js-back-to-top')[0];
  if( backTop ) {
    var dataElement = backTop.getAttribute('data-element');
    var scrollElement = dataElement ? document.querySelector(dataElement) : window;
    var scrollDuration = parseInt(backTop.getAttribute('data-duration')) || 300, //scroll to top duration
      scrollOffsetInit = parseInt(backTop.getAttribute('data-offset-in')) || parseInt(backTop.getAttribute('data-offset')) || 0, //show back-to-top if scrolling > scrollOffset
      scrollOffsetOutInit = parseInt(backTop.getAttribute('data-offset-out')) || 0, 
      scrollOffset = 0,
      scrollOffsetOut = 0,
      scrolling = false;

    // check if target-in/target-out have been set
    var targetIn = backTop.getAttribute('data-target-in') ? document.querySelector(backTop.getAttribute('data-target-in')) : false,
      targetOut = backTop.getAttribute('data-target-out') ? document.querySelector(backTop.getAttribute('data-target-out')) : false;

    updateOffsets();
    
    //detect click on back-to-top link
    backTop.addEventListener('click', function(event) {
      event.preventDefault();
      if(!window.requestAnimationFrame) {
        scrollElement.scrollTo(0, 0);
      } else {
        dataElement ? Util.scrollTo(0, scrollDuration, false, scrollElement) : Util.scrollTo(0, scrollDuration);
      } 
      //move the focus to the #top-element - don't break keyboard navigation
      Util.moveFocus(document.getElementById(backTop.getAttribute('href').replace('#', '')));
    });
    
    //listen to the window scroll and update back-to-top visibility
    checkBackToTop();
    if (scrollOffset > 0 || scrollOffsetOut > 0) {
      scrollElement.addEventListener("scroll", function(event) {
        if( !scrolling ) {
          scrolling = true;
          (!window.requestAnimationFrame) ? setTimeout(function(){checkBackToTop();}, 250) : window.requestAnimationFrame(checkBackToTop);
        }
      });
    }

    function checkBackToTop() {
      updateOffsets();
      var windowTop = scrollElement.scrollTop || document.documentElement.scrollTop;
      if(!dataElement) windowTop = window.scrollY || document.documentElement.scrollTop;
      var condition =  windowTop >= scrollOffset;
      if(scrollOffsetOut > 0) {
        condition = (windowTop >= scrollOffset) && (window.innerHeight + windowTop < scrollOffsetOut);
      }
      Util.toggleClass(backTop, 'back-to-top--is-visible', condition);
      scrolling = false;
    }

    function updateOffsets() {
      scrollOffset = getOffset(targetIn, scrollOffsetInit, true);
      scrollOffsetOut = getOffset(targetOut, scrollOffsetOutInit);
    }

    function getOffset(target, startOffset, bool) {
      var offset = 0;
      if(target) {
        var windowTop = scrollElement.scrollTop || document.documentElement.scrollTop;
        if(!dataElement) windowTop = window.scrollY || document.documentElement.scrollTop;
        var boundingClientRect = target.getBoundingClientRect();
        offset = bool ? boundingClientRect.bottom : boundingClientRect.top;
        offset = offset + windowTop;
      }
      if(startOffset && startOffset) {
        offset = offset + parseInt(startOffset);
      }
      return offset;
    }
  }
}());
// File#: _1_chameleonic-header
// Usage: codyhouse.co/license
(function() {
  var ChaHeader = function(element) {
    this.element = element;
    this.sections = document.getElementsByClassName('js-cha-section');
    this.header = this.element.getElementsByClassName('js-cha-header')[0];
    // handle mobile behaviour
    this.headerTrigger = this.element.getElementsByClassName('js-cha-header__trigger');
    this.modal = document.getElementsByClassName('js-cha-modal');
    this.focusMenu = false;
    this.firstFocusable = null;
		this.lastFocusable = null;
    initChaHeader(this);
  };

  function initChaHeader(element) {
    // set initial status
    for(var j = 0; j < element.sections.length; j++) {
      initSection(element, j);
    }

    // handle mobile behaviour
    if(element.headerTrigger.length > 0) {
      initMobileVersion(element);
    }

    // make sure header element is visible when in focus
    element.header.addEventListener('focusin', function(event){
      checkHeaderVisible(element);
    });
  };

  function initSection(element, index) {
    // clone header element inside each section
    var cloneItem = (index == 0) ? element.element : element.element.cloneNode(true);
    Util.removeClass(cloneItem, 'js-cha-header-clip');
    var customClasses = element.sections[index].getAttribute('data-header-class');
    // hide clones to SR
    cloneItem.setAttribute('aria-hidden', 'true');
    if( customClasses ) Util.addClass(cloneItem.getElementsByClassName('js-cha-header')[0], customClasses);
    // keyborad users - make sure cloned items are not tabbable
    if(index != 0) {
      // reset tab index
      resetTabIndex(cloneItem);
      element.sections[index].insertBefore(cloneItem, element.sections[index].firstChild);
    }
  }

  function resetTabIndex(clone) {
    var focusable = clone.querySelectorAll('[href], button, input');
    for(var i = 0; i < focusable.length; i++) {
      focusable[i].setAttribute('tabindex', '-1');
    }
  };

  function initMobileVersion(element) {
    //detect click on nav trigger
    var triggers = document.getElementsByClassName('js-cha-header__trigger');
    for(var i = 0; i < triggers.length; i++) {
      triggers[i].addEventListener("click", function(event) {
        event.preventDefault();
        var ariaExpanded = !Util.hasClass(element.modal[0], 'is-visible');
        //show nav and update button aria value
        Util.toggleClass(element.modal[0], 'is-visible', ariaExpanded);
        element.headerTrigger[0].setAttribute('aria-expanded', ariaExpanded);
        if(ariaExpanded) { //opening menu -> move focus to first element inside nav
          getFocusableElements(element);
          element.firstFocusable.focus();
        } else if(element.focusMenu) {
          if(window.scrollY < element.focusMenu.offsetTop) element.focusMenu.focus();
          element.focusMenu = false;
        }
      });
    }

    // close modal on click
    element.modal[0].addEventListener("click", function(event) {
      if(!event.target.closest('.js-cha-modal__close')) return;
      closeModal(element);
    });
    
    // listen for key events
		window.addEventListener('keydown', function(event){
			// listen for esc key
			if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
				// close navigation on mobile if open
				if(element.headerTrigger[0].getAttribute('aria-expanded') == 'true' && isVisible(element.headerTrigger[0])) {
          closeModal(element);
				}
			}
			// listen for tab key
			if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) {
				trapFocus(element, event);
			}
		});
  };

  function closeModal(element) {
    element.focusMenu = element.headerTrigger[0]; // move focus to menu trigger when menu is close
		element.headerTrigger[0].click();
  };

  function trapFocus(element, event) {
    if( element.firstFocusable == document.activeElement && event.shiftKey) {
			//on Shift+Tab -> focus last focusable element when focus moves out of modal
			event.preventDefault();
			element.lastFocusable.focus();
		}
		if( element.lastFocusable == document.activeElement && !event.shiftKey) {
			//on Tab -> focus first focusable element when focus moves out of modal
			event.preventDefault();
			element.firstFocusable.focus();
		}
  };

  function getFocusableElements(element) {
		//get all focusable elements inside the modal
		var allFocusable = element.modal[0].querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary');
		getFirstVisible(element, allFocusable);
		getLastVisible(element, allFocusable);
	};

	function getFirstVisible(element, elements) {
		//get first visible focusable element inside the modal
		for(var i = 0; i < elements.length; i++) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				element.firstFocusable = elements[i];
				return true;
			}
		}
	};

	function getLastVisible(element, elements) {
		//get last visible focusable element inside the modal
		for(var i = elements.length - 1; i >= 0; i--) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				element.lastFocusable = elements[i];
				return true;
			}
		}
  };
  
  function checkHeaderVisible(element) {
    if(window.scrollY > element.sections[0].offsetHeight - element.header.offsetHeight) window.scrollTo(0, 0);
  };

  function isVisible(element) {
		return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
	};

  // init the ChaHeader Object
  var chaHader = document.getElementsByClassName('js-cha-header-clip'),
    clipPathSupported = Util.cssSupports('clip-path', 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)') || Util.cssSupports('-webkit-clip-path', 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)');
  if(chaHader.length > 0 && clipPathSupported) {
    for(var i = 0; i < chaHader.length; i++) {
      new ChaHeader(chaHader[i]);
    }
  }
}());
// File#: _1_col-table
// Usage: codyhouse.co/license
(function() {
  var ColTable = function(element) {
    this.element = element;
    this.header = this.element.getElementsByTagName('thead')[0];
    this.body = this.element.getElementsByTagName('tbody')[0];
    this.headerRows = this.header.getElementsByTagName('th');
    this.tableRows = this.body.getElementsByTagName('tr');
    this.collapsedLayoutClass = 'cl-table--collapsed';
    this.mainColCellClass = 'cl-table__th-inner';
    initTable(this);
  };

  function initTable(table) {
    // create additional table content + set table roles
    addTableContent(table);
    setTableRoles(table);

    // custom event emitted when window is resized
    table.element.addEventListener('update-col-table', function(event){
      checkTableLayour(table);
    });

    // mobile version - listent to click/key enter on the row -> expand it
    table.element.addEventListener('click', function(event){
      revealColDetails(table, event);
    });
    table.element.addEventListener('keydown', function(event){
      if(event.keyCode && event.keyCode == 13 || event.key && event.key.toLowerCase() == 'enter') {
        revealColDetails(table, event);
      }
    });
  };

  function checkTableLayour(table) {
    var layout = getComputedStyle(table.element, ':before').getPropertyValue('content').replace(/\'|"/g, '');
    Util.toggleClass(table.element, table.collapsedLayoutClass, layout != 'expanded');
  };

  function addTableContent(table) {
    // for the collapsed version, add a ul with list of details for each table column heading
    var content = [];
    for(var i = 0; i < table.tableRows.length; i++) {
      var cells = table.tableRows[i].getElementsByClassName('cl-table__cell');
      for(var j = 1; j < cells.length; j++) {
        if( i == 0) content[j] = '';
        content[j] = content[j] + '<li class="cl-table__item"><span class="cl-table__label">'+cells[0].innerHTML+':</span><span>'+cells[j].innerHTML+'</span></li>';
      }
    }
    // append new content to each col th
    for(var j = 1; j < table.headerRows.length; j++) {
      var colContent = '<input type="text" class="cl-table__input" aria-hidden="true"><span class="cl-table__th-inner">'+table.headerRows[j].innerHTML+'<i class="cl-table__th-icon" aria-hidden="true"></i></span><ul class="cl-table__list" aria-hidden="true">'+content[j]+'</ul>';
      table.headerRows[j].innerHTML = colContent;
      Util.addClass(table.headerRows[j], 'js-'+table.mainColCellClass);
    }
  };

  function setTableRoles(table) {
    var trElements = table.header.getElementsByTagName('tr');
    for(var i=0; i < trElements.length; i++) {
      trElements[i].setAttribute('role', 'row');
    }
    var thElements = table.header.getElementsByTagName('th');
    for(var i=0; i < thElements.length; i++) {
      thElements[i].setAttribute('role', 'cell');
    }
  };

  function revealColDetails(table, event) {
    var col = event.target.closest('.js-'+table.mainColCellClass);
    if(!col || event.target.closest('.cl-table__list')) return;
    Util.toggleClass(col, 'cl-table__cell--show-list', !Util.hasClass(col, 'cl-table__cell--show-list'));
  };

  //initialize the ColTable objects
	var colTables = document.getElementsByClassName('js-cl-table');
	if( colTables.length > 0 ) {
    var j = 0,
    colTablesArray = [];
		for( var i = 0; i < colTables.length; i++) {
      var beforeContent = getComputedStyle(colTables[i], ':before').getPropertyValue('content');
      if(beforeContent && beforeContent !='' && beforeContent !='none') {
        (function(i){colTablesArray.push(new ColTable(colTables[i]));})(i);
        j = j + 1;
      }
    }
    
    if(j > 0) {
      var resizingId = false,
        customEvent = new CustomEvent('update-col-table');
      window.addEventListener('resize', function(event){
        clearTimeout(resizingId);
        resizingId = setTimeout(doneResizing, 300);
      });

      function doneResizing() {
        for( var i = 0; i < colTablesArray.length; i++) {
          (function(i){colTablesArray[i].element.dispatchEvent(customEvent)})(i);
        };
      };

      (window.requestAnimationFrame) // init table layout
        ? window.requestAnimationFrame(doneResizing)
        : doneResizing();
    }
	}
}());
// File#: _1_collapse
// Usage: codyhouse.co/license
(function() {
  var Collapse = function(element) {
    this.element = element;
    this.triggers = document.querySelectorAll('[aria-controls="'+this.element.getAttribute('id')+'"]');
    this.animate = this.element.getAttribute('data-collapse-animate') == 'on';
    this.animating = false;
    initCollapse(this);
  };

  function initCollapse(element) {
    if ( element.triggers ) {
      // set initial 'aria-expanded' attribute for trigger elements
      updateTriggers(element, !Util.hasClass(element.element, 'is-hidden'));

      // detect click on trigger elements
			for(var i = 0; i < element.triggers.length; i++) {
				element.triggers[i].addEventListener('click', function(event) {
					event.preventDefault();
					toggleVisibility(element);
				});
			}
    }
    
    // custom event
    element.element.addEventListener('collapseToggle', function(event){
      toggleVisibility(element);
    });
  };

  function toggleVisibility(element) {
    var bool = Util.hasClass(element.element, 'is-hidden');
    if(element.animating) return;
    element.animating = true;
    animateElement(element, bool);
    updateTriggers(element, bool);
  };

  function animateElement(element, bool) {
    // bool === true -> show content
    if(!element.animate || !window.requestAnimationFrame) {
      Util.toggleClass(element.element, 'is-hidden', !bool);
      element.animating = false;
      return;
    }

    // animate content height
    Util.removeClass(element.element, 'is-hidden');
    var initHeight = !bool ? element.element.offsetHeight: 0,
      finalHeight = !bool ? 0 : element.element.offsetHeight;

    Util.addClass(element.element, 'overflow-hidden');
    
    Util.setHeight(initHeight, finalHeight, element.element, 200, function(){
      if(!bool) Util.addClass(element.element, 'is-hidden');
      element.element.removeAttribute("style");
      Util.removeClass(element.element, 'overflow-hidden');
      element.animating = false;
    }, 'easeInOutQuad');
  };

  function updateTriggers(element, bool) {
    for(var i = 0; i < element.triggers.length; i++) {
      bool ? element.triggers[i].setAttribute('aria-expanded', 'true') : element.triggers[i].removeAttribute('aria-expanded');
    };
  };

  window.Collapse = Collapse;

  //initialize the Collapse objects
	var collapses = document.getElementsByClassName('js-collapse');
	if( collapses.length > 0 ) {
    for( var i = 0; i < collapses.length; i++) {
      new Collapse(collapses[i]);
    }
  }
}());
// File#: _1_color-swatches
// Usage: codyhouse.co/license
(function() {
  var ColorSwatches = function(element) {
    this.element = element;
    this.select = false;
    initCustomSelect(this); // replace <select> with custom <ul> list
    this.list = this.element.getElementsByClassName('js-color-swatches__list')[0];
    this.swatches = this.list.getElementsByClassName('js-color-swatches__option');
    this.labels = this.list.getElementsByClassName('js-color-swatch__label');
    this.selectedLabel = this.element.getElementsByClassName('js-color-swatches__color');
    this.focusOutId = false;
    initColorSwatches(this);
  };

  function initCustomSelect(element) {
    var select = element.element.getElementsByClassName('js-color-swatches__select');
    if(select.length == 0) return;
    element.select = select[0];
    var customContent = '';
    for(var i = 0; i < element.select.options.length; i++) {
      var ariaChecked = i == element.select.selectedIndex ? 'true' : 'false',
        customClass = i == element.select.selectedIndex ? ' color-swatches__item--selected' : '',
        customAttributes = getSwatchCustomAttr(element.select.options[i]);
      customContent = customContent + '<li class="color-swatches__item js-color-swatches__item'+customClass+'" role="radio" aria-checked="'+ariaChecked+'" data-value="'+element.select.options[i].value+'"><span class="js-color-swatches__option js-tab-focus" tabindex="0"'+customAttributes+'><span class="sr-only js-color-swatch__label">'+element.select.options[i].text+'</span><span aria-hidden="true" style="'+element.select.options[i].getAttribute('data-style')+'" class="color-swatches__swatch"></span></span></li>';
    }

    var list = document.createElement("ul");
    Util.setAttributes(list, {'class': 'color-swatches__list js-color-swatches__list', 'role': 'radiogroup'});

    list.innerHTML = customContent;
    element.element.insertBefore(list, element.select);
    Util.addClass(element.select, 'is-hidden');
  };

  function initColorSwatches(element) {
    // detect focusin/focusout event - update selected color label
    element.list.addEventListener('focusin', function(event){
      if(element.focusOutId) clearTimeout(element.focusOutId);
      updateSelectedLabel(element, document.activeElement);
    });
    element.list.addEventListener('focusout', function(event){
      element.focusOutId = setTimeout(function(){
        resetSelectedLabel(element);
      }, 200);
    });

    // mouse move events
    for(var i = 0; i < element.swatches.length; i++) {
      handleHoverEvents(element, i);
    }

    // --select variation only
    if(element.select) {
      // click event - select new option
      element.list.addEventListener('click', function(event){
        // update selected option
        resetSelectedOption(element, event.target);
      });

      // space key - select new option
      element.list.addEventListener('keydown', function(event){
        if( (event.keyCode && event.keyCode == 32 || event.key && event.key == ' ') || (event.keyCode && event.keyCode == 13 || event.key && event.key.toLowerCase() == 'enter')) {
          // update selected option
          resetSelectedOption(element, event.target);
        }
      });
    }
  };

  function handleHoverEvents(element, index) {
    element.swatches[index].addEventListener('mouseenter', function(event){
      updateSelectedLabel(element, element.swatches[index]);
    });
    element.swatches[index].addEventListener('mouseleave', function(event){
      resetSelectedLabel(element);
    });
  };

  function resetSelectedOption(element, target) { // for --select variation only - new option selected
    var option = target.closest('.js-color-swatches__item');
    if(!option) return;
    var selectedSwatch =  element.list.querySelector('.color-swatches__item--selected');
    if(selectedSwatch) {
      Util.removeClass(selectedSwatch, 'color-swatches__item--selected');
      selectedSwatch.setAttribute('aria-checked', 'false');
    }
    Util.addClass(option, 'color-swatches__item--selected');
    option.setAttribute('aria-checked', 'true');
    // update select element
    updateNativeSelect(element.select, option.getAttribute('data-value'));
  };

  function resetSelectedLabel(element) {
    var selectedSwatch =  element.list.getElementsByClassName('color-swatches__item--selected');
    if(selectedSwatch.length > 0 ) updateSelectedLabel(element, selectedSwatch[0]);
  };

  function updateSelectedLabel(element, swatch) {
    var newLabel = swatch.getElementsByClassName('js-color-swatch__label');
    if(newLabel.length == 0 ) return;
    element.selectedLabel[0].textContent = newLabel[0].textContent;
  };

  function updateNativeSelect(select, value) {
		for (var i = 0; i < select.options.length; i++) {
			if (select.options[i].value == value) {
				select.selectedIndex = i; // set new value
				select.dispatchEvent(new CustomEvent('change')); // trigger change event
				break;
			}
		}
  };
  
  function getSwatchCustomAttr(swatch) {
    var customAttrArray = swatch.getAttribute('data-custom-attr');
    if(!customAttrArray) return '';
    var customAttr = ' ',
      list = customAttrArray.split(',');
    for(var i = 0; i < list.length; i++) {
      var attr = list[i].split(':')
      customAttr = customAttr + attr[0].trim()+'="'+attr[1].trim()+'" ';
    }
    return customAttr;
  };

  //initialize the ColorSwatches objects
	var swatches = document.getElementsByClassName('js-color-swatches');
	if( swatches.length > 0 ) {
    for( var i = 0; i < swatches.length; i++) {
      new ColorSwatches(swatches[i]);
    }
  }
}());
// File#: _1_countdown
// Usage: codyhouse.co/license
(function() {
  var CountDown = function(element) {
    this.element = element;
    this.labels = this.element.getAttribute('data-labels') ? this.element.getAttribute('data-labels').split(',') : [];
    this.intervalId;
    // set visible labels
    this.setVisibleLabels();
    //create countdown HTML
    this.createCountDown();
    //store time elements
    this.days = this.element.getElementsByClassName('js-countdown__value--0')[0];
    this.hours = this.element.getElementsByClassName('js-countdown__value--1')[0];
    this.mins = this.element.getElementsByClassName('js-countdown__value--2')[0];
    this.secs = this.element.getElementsByClassName('js-countdown__value--3')[0];
    this.endTime = this.getEndTime();
    //init counter
    this.initCountDown();
  };

  CountDown.prototype.setVisibleLabels = function() {
    this.visibleLabels = this.element.getAttribute('data-visible-labels') ? this.element.getAttribute('data-visible-labels').split(',') : [];
    this.visibleLabels = this.visibleLabels.map(function(label){
      return label.trim();
    });
  };

  CountDown.prototype.createCountDown = function() {
    var wrapper = document.createElement("div");
    Util.setAttributes(wrapper, {'aria-hidden': 'true', 'class': 'countdown__timer'});

    for(var i = 0; i < 4; i++) {
      var timeItem = document.createElement("span"),
        timeValue = document.createElement("span"),
        timeLabel = document.createElement('span');
      
      timeItem.setAttribute('class', 'countdown__item');
      timeValue.setAttribute('class', 'countdown__value countdown__value--'+i+' js-countdown__value--'+i);
      timeItem.appendChild(timeValue);

      if( this.labels && this.labels.length > 0 ) {
        timeLabel.textContent = this.labels[i].trim();
        timeLabel.setAttribute('class', 'countdown__label');
        timeItem.appendChild(timeLabel);
      }
      
      wrapper.appendChild(timeItem);
    }
    // append new content to countdown element
    this.element.insertBefore(wrapper, this.element.firstChild);
    // this.element.appendChild(wrapper);
  };

  CountDown.prototype.getEndTime = function() {
    // get number of remaining seconds 
    if(this.element.getAttribute('data-timer')) return Number(this.element.getAttribute('data-timer'))*1000 + new Date().getTime();
    else if(this.element.getAttribute('data-countdown')) return Number(new Date(this.element.getAttribute('data-countdown')).getTime());
  };

  CountDown.prototype.initCountDown = function() {
    var self = this;
    this.intervalId = setInterval(function(){
      self.updateCountDown(false);
    }, 1000);
    this.updateCountDown(true);
  };
  
  CountDown.prototype.updateCountDown = function(bool) {
    // original countdown function
    // https://gist.github.com/adriennetacke/f5a25c304f1b7b4a6fa42db70415bad2
    var time = parseInt( (this.endTime - new Date().getTime())/1000 ),
      days = 0,
      hours = 0,
      mins = 0,
      seconds = 0;

    if(isNaN(time) || time < 0) {
      clearInterval(this.intervalId);
      this.emitEndEvent();
    } else {
      days = parseInt(time / 86400);
      time = (time % 86400);
      hours = parseInt(time / 3600);
      time = (time % 3600);
      mins = parseInt(time / 60);
      time = (time % 60);
      seconds = parseInt(time);
    }
    
    // hide days/hours/mins if not available 
    if(bool && days == 0 && this.visibleLabels.indexOf('d') < 0) this.days.parentElement.style.display = "none";
    if(bool && days == 0 && hours == 0 && this.visibleLabels.indexOf('h') < 0) this.hours.parentElement.style.display = "none";
    if(bool && days == 0 && hours == 0 && mins == 0 && this.visibleLabels.indexOf('m') < 0) this.mins.parentElement.style.display = "none";
    
    this.days.textContent = days;
    this.hours.textContent = this.getTimeFormat(hours);
    this.mins.textContent = this.getTimeFormat(mins);
    this.secs.textContent = this.getTimeFormat(seconds);
  };

  CountDown.prototype.getTimeFormat = function(time) {
    return ('0'+ time).slice(-2);
  };

  CountDown.prototype.emitEndEvent = function(time) {
    var event = new CustomEvent('countDownFinished');
    this.element.dispatchEvent(event);
  };

  //initialize the CountDown objects
  var countDown = document.getElementsByClassName('js-countdown');
  if( countDown.length > 0 ) {
    for( var i = 0; i < countDown.length; i++) {
      (function(i){new CountDown(countDown[i]);})(i);
    }
  }
}());
// File#: _1_details
// Usage: codyhouse.co/license
(function() {
	var Details = function(element, index) {
		this.element = element;
		this.summary = this.element.getElementsByClassName('js-details__summary')[0];
		this.details = this.element.getElementsByClassName('js-details__content')[0];
		this.htmlElSupported = 'open' in this.element;
		this.initDetails(index);
		this.initDetailsEvents();
	};

	Details.prototype.initDetails = function(index) {
		// init aria attributes 
		Util.setAttributes(this.summary, {'aria-expanded': 'false', 'aria-controls': 'details--'+index, 'role': 'button'});
		Util.setAttributes(this.details, {'aria-hidden': 'true', 'id': 'details--'+index});
	};

	Details.prototype.initDetailsEvents = function() {
		var self = this;
		if( this.htmlElSupported ) { // browser supports the <details> element 
			this.element.addEventListener('toggle', function(event){
				var ariaValues = self.element.open ? ['true', 'false'] : ['false', 'true'];
				// update aria attributes when details element status change (open/close)
				self.updateAriaValues(ariaValues);
			});
		} else { //browser does not support <details>
			this.summary.addEventListener('click', function(event){
				event.preventDefault();
				var isOpen = self.element.getAttribute('open'),
					ariaValues = [];

				isOpen ? self.element.removeAttribute('open') : self.element.setAttribute('open', 'true');
				ariaValues = isOpen ? ['false', 'true'] : ['true', 'false'];
				self.updateAriaValues(ariaValues);
			});
		}
	};

	Details.prototype.updateAriaValues = function(values) {
		this.summary.setAttribute('aria-expanded', values[0]);
		this.details.setAttribute('aria-hidden', values[1]);
	};

	//initialize the Details objects
	var detailsEl = document.getElementsByClassName('js-details');
	if( detailsEl.length > 0 ) {
		for( var i = 0; i < detailsEl.length; i++) {
			(function(i){new Details(detailsEl[i], i);})(i);
		}
	}
}());
// File#: _1_diagonal-movement
// Usage: codyhouse.co/license
/*
  Modified version of the jQuery-menu-aim plugin
  https://github.com/kamens/jQuery-menu-aim
  - Replaced jQuery with Vanilla JS
  - Minor changes
*/
(function() {
  var menuAim = function(opts) {
    init(opts);
  };

  window.menuAim = menuAim;

  function init(opts) {
    var activeRow = null,
      mouseLocs = [],
      lastDelayLoc = null,
      timeoutId = null,
      options = Util.extend({
        menu: '',
        rows: false, //if false, get direct children - otherwise pass nodes list 
        submenuSelector: "*",
        submenuDirection: "right",
        tolerance: 75,  // bigger = more forgivey when entering submenu
        enter: function(){},
        exit: function(){},
        activate: function(){},
        deactivate: function(){},
        exitMenu: function(){}
      }, opts),
      menu = options.menu;

    var MOUSE_LOCS_TRACKED = 3,  // number of past mouse locations to track
      DELAY = 300;  // ms delay when user appears to be entering submenu

    /**
     * Keep track of the last few locations of the mouse.
     */
    var mouseMoveFallback = function(event) {
      (!window.requestAnimationFrame) ? mousemoveDocument(event) : window.requestAnimationFrame(function(){mousemoveDocument(event);});
    };

    var mousemoveDocument = function(e) {
      mouseLocs.push({x: e.pageX, y: e.pageY});

      if (mouseLocs.length > MOUSE_LOCS_TRACKED) {
        mouseLocs.shift();
      }
    };

    /**
     * Cancel possible row activations when leaving the menu entirely
     */
    var mouseleaveMenu = function() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // If exitMenu is supplied and returns true, deactivate the
      // currently active row on menu exit.
      if (options.exitMenu(this)) {
        if (activeRow) {
          options.deactivate(activeRow);
        }

        activeRow = null;
      }
    };

    /**
     * Trigger a possible row activation whenever entering a new row.
     */
    var mouseenterRow = function() {
      if (timeoutId) {
        // Cancel any previous activation delays
        clearTimeout(timeoutId);
      }

      options.enter(this);
      possiblyActivate(this);
    },
    mouseleaveRow = function() {
      options.exit(this);
    };

    /*
     * Immediately activate a row if the user clicks on it.
     */
    var clickRow = function() {
      activate(this);
    };  

    /**
     * Activate a menu row.
     */
    var activate = function(row) {
      if (row == activeRow) {
        return;
      }

      if (activeRow) {
        options.deactivate(activeRow);
      }

      options.activate(row);
      activeRow = row;
    };

    /**
     * Possibly activate a menu row. If mouse movement indicates that we
     * shouldn't activate yet because user may be trying to enter
     * a submenu's content, then delay and check again later.
     */
    var possiblyActivate = function(row) {
      var delay = activationDelay();

      if (delay) {
        timeoutId = setTimeout(function() {
          possiblyActivate(row);
        }, delay);
      } else {
        activate(row);
      }
    };

    /**
     * Return the amount of time that should be used as a delay before the
     * currently hovered row is activated.
     *
     * Returns 0 if the activation should happen immediately. Otherwise,
     * returns the number of milliseconds that should be delayed before
     * checking again to see if the row should be activated.
     */
    var activationDelay = function() {
      if (!activeRow || !Util.is(activeRow, options.submenuSelector)) {
        // If there is no other submenu row already active, then
        // go ahead and activate immediately.
        return 0;
      }

      function getOffset(element) {
        var rect = element.getBoundingClientRect();
        return { top: rect.top + window.pageYOffset, left: rect.left + window.pageXOffset };
      };

      var offset = getOffset(menu),
          upperLeft = {
              x: offset.left,
              y: offset.top - options.tolerance
          },
          upperRight = {
              x: offset.left + menu.offsetWidth,
              y: upperLeft.y
          },
          lowerLeft = {
              x: offset.left,
              y: offset.top + menu.offsetHeight + options.tolerance
          },
          lowerRight = {
              x: offset.left + menu.offsetWidth,
              y: lowerLeft.y
          },
          loc = mouseLocs[mouseLocs.length - 1],
          prevLoc = mouseLocs[0];

      if (!loc) {
        return 0;
      }

      if (!prevLoc) {
        prevLoc = loc;
      }

      if (prevLoc.x < offset.left || prevLoc.x > lowerRight.x || prevLoc.y < offset.top || prevLoc.y > lowerRight.y) {
        // If the previous mouse location was outside of the entire
        // menu's bounds, immediately activate.
        return 0;
      }

      if (lastDelayLoc && loc.x == lastDelayLoc.x && loc.y == lastDelayLoc.y) {
        // If the mouse hasn't moved since the last time we checked
        // for activation status, immediately activate.
        return 0;
      }

      // Detect if the user is moving towards the currently activated
      // submenu.
      //
      // If the mouse is heading relatively clearly towards
      // the submenu's content, we should wait and give the user more
      // time before activating a new row. If the mouse is heading
      // elsewhere, we can immediately activate a new row.
      //
      // We detect this by calculating the slope formed between the
      // current mouse location and the upper/lower right points of
      // the menu. We do the same for the previous mouse location.
      // If the current mouse location's slopes are
      // increasing/decreasing appropriately compared to the
      // previous's, we know the user is moving toward the submenu.
      //
      // Note that since the y-axis increases as the cursor moves
      // down the screen, we are looking for the slope between the
      // cursor and the upper right corner to decrease over time, not
      // increase (somewhat counterintuitively).
      function slope(a, b) {
        return (b.y - a.y) / (b.x - a.x);
      };

      var decreasingCorner = upperRight,
        increasingCorner = lowerRight;

      // Our expectations for decreasing or increasing slope values
      // depends on which direction the submenu opens relative to the
      // main menu. By default, if the menu opens on the right, we
      // expect the slope between the cursor and the upper right
      // corner to decrease over time, as explained above. If the
      // submenu opens in a different direction, we change our slope
      // expectations.
      if (options.submenuDirection == "left") {
        decreasingCorner = lowerLeft;
        increasingCorner = upperLeft;
      } else if (options.submenuDirection == "below") {
        decreasingCorner = lowerRight;
        increasingCorner = lowerLeft;
      } else if (options.submenuDirection == "above") {
        decreasingCorner = upperLeft;
        increasingCorner = upperRight;
      }

      var decreasingSlope = slope(loc, decreasingCorner),
        increasingSlope = slope(loc, increasingCorner),
        prevDecreasingSlope = slope(prevLoc, decreasingCorner),
        prevIncreasingSlope = slope(prevLoc, increasingCorner);

      if (decreasingSlope < prevDecreasingSlope && increasingSlope > prevIncreasingSlope) {
        // Mouse is moving from previous location towards the
        // currently activated submenu. Delay before activating a
        // new menu row, because user may be moving into submenu.
        lastDelayLoc = loc;
        return DELAY;
      }

      lastDelayLoc = null;
      return 0;
    };

    var reset = function(triggerDeactivate) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (activeRow && triggerDeactivate) {
        options.deactivate(activeRow);
      }

      activeRow = null;
    };

    var destroyInstance = function() {
      menu.removeEventListener('mouseleave', mouseleaveMenu);  
      document.removeEventListener('mousemove', mouseMoveFallback);
      if(rows.length > 0) {
        for(var i = 0; i < rows.length; i++) {
          rows[i].removeEventListener('mouseenter', mouseenterRow);  
          rows[i].removeEventListener('mouseleave', mouseleaveRow);
          rows[i].removeEventListener('click', clickRow);  
        }
      }
      
    };

    /**
     * Hook up initial menu events
     */
    menu.addEventListener('mouseleave', mouseleaveMenu);  
    var rows = (options.rows) ? options.rows : menu.children;
    if(rows.length > 0) {
      for(var i = 0; i < rows.length; i++) {(function(i){
        rows[i].addEventListener('mouseenter', mouseenterRow);  
        rows[i].addEventListener('mouseleave', mouseleaveRow);
        rows[i].addEventListener('click', clickRow);  
      })(i);}
    }

    document.addEventListener('mousemove', mouseMoveFallback);

    /* Reset/destroy menu */
    menu.addEventListener('reset', function(event){
      reset(event.detail);
    });
    menu.addEventListener('destroy', destroyInstance);
  };
}());


// File#: _1_dialog
// Usage: codyhouse.co/license
(function() {
  var Dialog = function(element) {
    this.element = element;
    this.triggers = document.querySelectorAll('[aria-controls="'+this.element.getAttribute('id')+'"]');
    this.firstFocusable = null;
		this.lastFocusable = null;
		this.selectedTrigger = null;
		this.showClass = "dialog--is-visible";
    initDialog(this);
  };

  function initDialog(dialog) {
    if ( dialog.triggers ) {
			for(var i = 0; i < dialog.triggers.length; i++) {
				dialog.triggers[i].addEventListener('click', function(event) {
					event.preventDefault();
					dialog.selectedTrigger = event.target;
					showDialog(dialog);
					initDialogEvents(dialog);
				});
			}
    }
    
    // listen to the openDialog event -> open dialog without a trigger button
		dialog.element.addEventListener('openDialog', function(event){
			if(event.detail) self.selectedTrigger = event.detail;
			showDialog(dialog);
			initDialogEvents(dialog);
		});
  };

  function showDialog(dialog) {
		Util.addClass(dialog.element, dialog.showClass);
    getFocusableElements(dialog);
		dialog.firstFocusable.focus();
		// wait for the end of transitions before moving focus
		dialog.element.addEventListener("transitionend", function cb(event) {
			dialog.firstFocusable.focus();
			dialog.element.removeEventListener("transitionend", cb);
		});
		emitDialogEvents(dialog, 'dialogIsOpen');
  };

  function closeDialog(dialog) {
    Util.removeClass(dialog.element, dialog.showClass);
		dialog.firstFocusable = null;
		dialog.lastFocusable = null;
		if(dialog.selectedTrigger) dialog.selectedTrigger.focus();
		//remove listeners
		cancelDialogEvents(dialog);
		emitDialogEvents(dialog, 'dialogIsClose');
  };
  
  function initDialogEvents(dialog) {
    //add event listeners
		dialog.element.addEventListener('keydown', handleEvent.bind(dialog));
		dialog.element.addEventListener('click', handleEvent.bind(dialog));
  };

  function cancelDialogEvents(dialog) {
		//remove event listeners
		dialog.element.removeEventListener('keydown', handleEvent.bind(dialog));
		dialog.element.removeEventListener('click', handleEvent.bind(dialog));
  };
  
  function handleEvent(event) {
		// handle events
		switch(event.type) {
      case 'click': {
        initClick(this, event);
      }
      case 'keydown': {
        initKeyDown(this, event);
      }
		}
  };
  
  function initKeyDown(dialog, event) {
		if( event.keyCode && event.keyCode == 27 || event.key && event.key == 'Escape' ) {
			//close dialog on esc
			closeDialog(dialog);
		} else if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
			//trap focus inside dialog
			trapFocus(dialog, event);
		}
	};

	function initClick(dialog, event) {
		//close dialog when clicking on close button
		if( !event.target.closest('.js-dialog__close') ) return;
		event.preventDefault();
		closeDialog(dialog);
	};

	function trapFocus(dialog, event) {
		if( dialog.firstFocusable == document.activeElement && event.shiftKey) {
			//on Shift+Tab -> focus last focusable element when focus moves out of dialog
			event.preventDefault();
			dialog.lastFocusable.focus();
		}
		if( dialog.lastFocusable == document.activeElement && !event.shiftKey) {
			//on Tab -> focus first focusable element when focus moves out of dialog
			event.preventDefault();
			dialog.firstFocusable.focus();
		}
	};

  function getFocusableElements(dialog) {
    //get all focusable elements inside the dialog
		var allFocusable = dialog.element.querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary');
		getFirstVisible(dialog, allFocusable);
		getLastVisible(dialog, allFocusable);
  };

  function getFirstVisible(dialog, elements) {
    //get first visible focusable element inside the dialog
		for(var i = 0; i < elements.length; i++) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				dialog.firstFocusable = elements[i];
				return true;
			}
		}
  };

  function getLastVisible(dialog, elements) {
    //get last visible focusable element inside the dialog
		for(var i = elements.length - 1; i >= 0; i--) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				dialog.lastFocusable = elements[i];
				return true;
			}
		}
  };

  function emitDialogEvents(dialog, eventName) {
    var event = new CustomEvent(eventName, {detail: dialog.selectedTrigger});
		dialog.element.dispatchEvent(event);
  };

  //initialize the Dialog objects
	var dialogs = document.getElementsByClassName('js-dialog');
	if( dialogs.length > 0 ) {
		for( var i = 0; i < dialogs.length; i++) {
			(function(i){new Dialog(dialogs[i]);})(i);
		}
	}
}());
// File#: _1_drawer
// Usage: codyhouse.co/license
(function() {
	var Drawer = function(element) {
		this.element = element;
		this.content = document.getElementsByClassName('js-drawer__body')[0];
		this.triggers = document.querySelectorAll('[aria-controls="'+this.element.getAttribute('id')+'"]');
		this.firstFocusable = null;
		this.lastFocusable = null;
		this.selectedTrigger = null;
		this.isModal = Util.hasClass(this.element, 'js-drawer--modal');
		this.showClass = "drawer--is-visible";
		this.initDrawer();
	};

	Drawer.prototype.initDrawer = function() {
		var self = this;
		//open drawer when clicking on trigger buttons
		if ( this.triggers ) {
			for(var i = 0; i < this.triggers.length; i++) {
				this.triggers[i].addEventListener('click', function(event) {
					event.preventDefault();
					if(Util.hasClass(self.element, self.showClass)) {
						self.closeDrawer(event.target);
						return;
					}
					self.selectedTrigger = event.target;
					self.showDrawer();
					self.initDrawerEvents();
				});
			}
		}

		// if drawer is already open -> we should initialize the drawer events
		if(Util.hasClass(this.element, this.showClass)) this.initDrawerEvents();
	};

	Drawer.prototype.showDrawer = function() {
		var self = this;
		this.content.scrollTop = 0;
		Util.addClass(this.element, this.showClass);
		this.getFocusableElements();
		Util.moveFocus(this.element);
		// wait for the end of transitions before moving focus
		this.element.addEventListener("transitionend", function cb(event) {
			Util.moveFocus(self.element);
			self.element.removeEventListener("transitionend", cb);
		});
		this.emitDrawerEvents('drawerIsOpen', this.selectedTrigger);
	};

	Drawer.prototype.closeDrawer = function(target) {
		Util.removeClass(this.element, this.showClass);
		this.firstFocusable = null;
		this.lastFocusable = null;
		if(this.selectedTrigger) this.selectedTrigger.focus();
		//remove listeners
		this.cancelDrawerEvents();
		this.emitDrawerEvents('drawerIsClose', target);
	};

	Drawer.prototype.initDrawerEvents = function() {
		//add event listeners
		this.element.addEventListener('keydown', this);
		this.element.addEventListener('click', this);
	};

	Drawer.prototype.cancelDrawerEvents = function() {
		//remove event listeners
		this.element.removeEventListener('keydown', this);
		this.element.removeEventListener('click', this);
	};

	Drawer.prototype.handleEvent = function (event) {
		switch(event.type) {
			case 'click': {
				this.initClick(event);
			}
			case 'keydown': {
				this.initKeyDown(event);
			}
		}
	};

	Drawer.prototype.initKeyDown = function(event) {
		if( event.keyCode && event.keyCode == 27 || event.key && event.key == 'Escape' ) {
			//close drawer window on esc
			this.closeDrawer(false);
		} else if( this.isModal && (event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' )) {
			//trap focus inside drawer
			this.trapFocus(event);
		}
	};

	Drawer.prototype.initClick = function(event) {
		//close drawer when clicking on close button or drawer bg layer 
		if( !event.target.closest('.js-drawer__close') && !Util.hasClass(event.target, 'js-drawer') ) return;
		event.preventDefault();
		this.closeDrawer(event.target);
	};

	Drawer.prototype.trapFocus = function(event) {
		if( this.firstFocusable == document.activeElement && event.shiftKey) {
			//on Shift+Tab -> focus last focusable element when focus moves out of drawer
			event.preventDefault();
			this.lastFocusable.focus();
		}
		if( this.lastFocusable == document.activeElement && !event.shiftKey) {
			//on Tab -> focus first focusable element when focus moves out of drawer
			event.preventDefault();
			this.firstFocusable.focus();
		}
	}

	Drawer.prototype.getFocusableElements = function() {
		//get all focusable elements inside the drawer
		var allFocusable = this.element.querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary');
		this.getFirstVisible(allFocusable);
		this.getLastVisible(allFocusable);
	};

	Drawer.prototype.getFirstVisible = function(elements) {
		//get first visible focusable element inside the drawer
		for(var i = 0; i < elements.length; i++) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				this.firstFocusable = elements[i];
				return true;
			}
		}
	};

	Drawer.prototype.getLastVisible = function(elements) {
		//get last visible focusable element inside the drawer
		for(var i = elements.length - 1; i >= 0; i--) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				this.lastFocusable = elements[i];
				return true;
			}
		}
	};

	Drawer.prototype.emitDrawerEvents = function(eventName, target) {
		var event = new CustomEvent(eventName, {detail: target});
		this.element.dispatchEvent(event);
	};

	//initialize the Drawer objects
	var drawer = document.getElementsByClassName('js-drawer');
	if( drawer.length > 0 ) {
		for( var i = 0; i < drawer.length; i++) {
			(function(i){new Drawer(drawer[i]);})(i);
		}
	}
}());
// File#: _1_expandable-search
// Usage: codyhouse.co/license
(function() {
	var expandableSearch = document.getElementsByClassName('js-expandable-search');
	if(expandableSearch.length > 0) {
		for( var i = 0; i < expandableSearch.length; i++) {
			(function(i){ // if user types in search input, keep the input expanded when focus is lost
				expandableSearch[i].getElementsByClassName('js-expandable-search__input')[0].addEventListener('input', function(event){
					Util.toggleClass(event.target, 'expandable-search__input--has-content', event.target.value.length > 0);
				});
			})(i);
		}
	}
}());
// File#: _1_filter-navigation
// Usage: codyhouse.co/license
(function() {
  var FilterNav = function(element) {
    this.element = element;
    this.wrapper = this.element.getElementsByClassName('js-filter-nav__wrapper')[0];
    this.nav = this.element.getElementsByClassName('js-filter-nav__nav')[0];
    this.list = this.nav.getElementsByClassName('js-filter-nav__list')[0];
    this.control = this.element.getElementsByClassName('js-filter-nav__control')[0];
    this.modalClose = this.element.getElementsByClassName('js-filter-nav__close-btn')[0];
    this.placeholder = this.element.getElementsByClassName('js-filter-nav__placeholder')[0];
    this.marker = this.element.getElementsByClassName('js-filter-nav__marker');
    this.layout = 'expanded';
    initFilterNav(this);
  };

  function initFilterNav(element) {
    checkLayout(element); // init layout
    if(element.layout == 'expanded') placeMarker(element);
    element.element.addEventListener('update-layout', function(event){ // on resize - modify layout
      checkLayout(element);
    });

    // update selected item
    element.wrapper.addEventListener('click', function(event){
      var newItem = event.target.closest('.js-filter-nav__btn');
      if(newItem) {
        updateCurrentItem(element, newItem);
        return;
      }
      // close modal list - mobile version only
      if(Util.hasClass(event.target, 'js-filter-nav__wrapper') || event.target.closest('.js-filter-nav__close-btn')) toggleModalList(element, false);
    });

    // open modal list - mobile version only
    element.control.addEventListener('click', function(event){
      toggleModalList(element, true);
    });
    
    // listen for key events
		window.addEventListener('keyup', function(event){
			// listen for esc key
			if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
				// close navigation on mobile if open
				if(element.control.getAttribute('aria-expanded') == 'true' && isVisible(element.control)) {
					toggleModalList(element, false);
				}
			}
			// listen for tab key
			if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) {
				// close navigation on mobile if open when nav loses focus
				if(element.control.getAttribute('aria-expanded') == 'true' && isVisible(element.control) && !document.activeElement.closest('.js-filter-nav__wrapper')) toggleModalList(element, false);
			}
		});
  };

  function updateCurrentItem(element, btn) {
    if(btn.getAttribute('aria-current') == 'true') {
      toggleModalList(element, false);
      return;
    }
    var activeBtn = element.wrapper.querySelector('[aria-current]');
    if(activeBtn) activeBtn.removeAttribute('aria-current');
    btn.setAttribute('aria-current', 'true');
    // update trigger label on selection (visible on mobile only)
    element.placeholder.textContent = btn.textContent;
    toggleModalList(element, false);
    if(element.layout == 'expanded') placeMarker(element);
  };

  function toggleModalList(element, bool) {
    element.control.setAttribute('aria-expanded', bool);
    Util.toggleClass(element.wrapper, 'filter-nav__wrapper--is-visible', bool);
    if(bool) {
      element.nav.querySelectorAll('[href], button:not([disabled])')[0].focus();
    } else if(isVisible(element.control)) {
      element.control.focus();
    }
  };

  function isVisible(element) {
		return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
	};

  function checkLayout(element) {
    if(element.layout == 'expanded' && switchToCollapsed(element)) { // check if there's enough space 
      element.layout = 'collapsed';
      Util.removeClass(element.element, 'filter-nav--expanded');
      Util.addClass(element.element, 'filter-nav--collapsed');
      Util.removeClass(element.modalClose, 'is-hidden');
      Util.removeClass(element.control, 'is-hidden');
    } else if(element.layout == 'collapsed' && switchToExpanded(element)) {
      element.layout = 'expanded';
      Util.addClass(element.element, 'filter-nav--expanded');
      Util.removeClass(element.element, 'filter-nav--collapsed');
      Util.addClass(element.modalClose, 'is-hidden');
      Util.addClass(element.control, 'is-hidden');
    }
    // place background element
    if(element.layout == 'expanded') placeMarker(element);
  };

  function switchToCollapsed(element) {
    return element.nav.scrollWidth > element.nav.offsetWidth;
  };

  function switchToExpanded(element) {
    element.element.style.visibility = 'hidden';
    Util.addClass(element.element, 'filter-nav--expanded');
    Util.removeClass(element.element, 'filter-nav--collapsed');
    var switchLayout = element.nav.scrollWidth <= element.nav.offsetWidth;
    Util.removeClass(element.element, 'filter-nav--expanded');
    Util.addClass(element.element, 'filter-nav--collapsed');
    element.element.style.visibility = 'visible';
    return switchLayout;
  };

  function placeMarker(element) {
    var activeElement = element.wrapper.querySelector('.js-filter-nav__btn[aria-current="true"]');
    if(element.marker.length == 0 || !activeElement ) return;
    element.marker[0].style.width = activeElement.offsetWidth+'px';
    element.marker[0].style.transform = 'translateX('+(activeElement.getBoundingClientRect().left - element.list.getBoundingClientRect().left)+'px)';
  };

  var filterNav = document.getElementsByClassName('js-filter-nav');
  if(filterNav.length > 0) {
    var filterNavArray = [];
    for(var i = 0; i < filterNav.length; i++) {
      filterNavArray.push(new FilterNav(filterNav[i]));
    }

    var resizingId = false,
      customEvent = new CustomEvent('update-layout');

    window.addEventListener('resize', function() {
      clearTimeout(resizingId);
      resizingId = setTimeout(doneResizing, 100);
    });

    // wait for font to be loaded
    if(document.fonts) {
      document.fonts.onloadingdone = function (fontFaceSetEvent) {
        doneResizing();
      };
    }

    function doneResizing() {
      for( var i = 0; i < filterNavArray.length; i++) {
        (function(i){filterNavArray[i].element.dispatchEvent(customEvent)})(i);
      };
    };
  }
}());
// File#: _1_filter
// Usage: codyhouse.co/license

(function() {
  var Filter = function(opts) {
    this.options = Util.extend(Filter.defaults , opts); // used to store custom filter/sort functions
    this.element = this.options.element;
    this.elementId = this.element.getAttribute('id');
    this.items = this.element.querySelectorAll('.js-filter__item');
    this.controllers = document.querySelectorAll('[aria-controls="'+this.elementId+'"]'); // controllers wrappers
    this.fallbackMessage = document.querySelector('[data-fallback-gallery-id="'+this.elementId+'"]');
    this.filterString = []; // combination of different filter values
    this.sortingString = '';  // sort value - will include order and type of argument (e.g., number or string)
    // store info about sorted/filtered items
    this.filterList = []; // list of boolean for each this.item -> true if still visible , otherwise false
    this.sortingList = []; // list of new ordered this.item -> each element is [item, originalIndex]
    
    // store grid info for animation
    this.itemsGrid = []; // grid coordinates
    this.itemsInitPosition = []; // used to store coordinates of this.items before animation
    this.itemsIterPosition = []; // used to store coordinates of this.items before animation - intermediate state
    this.itemsFinalPosition = []; // used to store coordinates of this.items after filtering
    
    // animation off
    this.animateOff = this.element.getAttribute('data-filter-animation') == 'off';
    // used to update this.itemsGrid on resize
    this.resizingId = false;
    // default acceleration style - improve animation
    this.accelerateStyle = 'will-change: transform, opacity; transform: translateZ(0); backface-visibility: hidden;';

    // handle multiple changes
    this.animating = false;
    this.reanimate = false;

    initFilter(this);
  };

  function initFilter(filter) {
    resetFilterSortArray(filter, true, true); // init array filter.filterList/filter.sortingList
    createGridInfo(filter); // store grid coordinates in filter.itemsGrid
    initItemsOrder(filter); // add data-orders so that we can reset the sorting

    // events handling - filter update
    for(var i = 0; i < filter.controllers.length; i++) {
      filter.filterString[i] = ''; // reset filtering

      // get proper filter/sorting string based on selected controllers
      (function(i){
        filter.controllers[i].addEventListener('change', function(event) {  
          if(event.target.tagName.toLowerCase() == 'select') { // select elements
            (!event.target.getAttribute('data-filter'))
              ? setSortingString(filter, event.target.value, event.target.options[event.target.selectedIndex])
              : setFilterString(filter, i, 'select');
          } else if(event.target.tagName.toLowerCase() == 'input' && (event.target.getAttribute('type') == 'radio' || event.target.getAttribute('type') == 'checkbox') ) { // input (radio/checkboxed) elements
            (!event.target.getAttribute('data-filter'))
              ? setSortingString(filter, event.target.getAttribute('data-sort'), event.target)
              : setFilterString(filter, i, 'input');
          } else {
            // generic inout element
            (!filter.controllers[i].getAttribute('data-filter'))
              ? setSortingString(filter, filter.controllers[i].getAttribute('data-sort'), filter.controllers[i])
              : setFilterString(filter, i, 'custom');
          }

          updateFilterArray(filter);
        });

        filter.controllers[i].addEventListener('click', function(event) { // retunr if target is select/input elements
          var filterEl = event.target.closest('[data-filter]');
          var sortEl = event.target.closest('[data-sort]');
          if(!filterEl && !sortEl) return;
          if(filterEl && ( filterEl.tagName.toLowerCase() == 'input' || filterEl.tagName.toLowerCase() == 'select')) return;
          if(sortEl && (sortEl.tagName.toLowerCase() == 'input' || sortEl.tagName.toLowerCase() == 'select')) return;
          if(sortEl && Util.hasClass(sortEl, 'js-filter__custom-control')) return;
          if(filterEl && Util.hasClass(filterEl, 'js-filter__custom-control')) return;
          // this will be executed only for a list of buttons -> no inputs
          event.preventDefault();
          resetControllersList(filter, i, filterEl, sortEl);
          sortEl 
            ? setSortingString(filter, sortEl.getAttribute('data-sort'), sortEl)
            : setFilterString(filter, i, 'button');
          updateFilterArray(filter);
        });

        // target search inputs -> update them on 'input'
        filter.controllers[i].addEventListener('input', function(event) {
          if(event.target.tagName.toLowerCase() == 'input' && (event.target.getAttribute('type') == 'search' || event.target.getAttribute('type') == 'text') ) {
            setFilterString(filter, i, 'custom');
            updateFilterArray(filter);
          }
        });
      })(i);
    }

    // handle resize - update grid coordinates in filter.itemsGrid
    window.addEventListener('resize', function() {
      clearTimeout(filter.resizingId);
      filter.resizingId = setTimeout(function(){createGridInfo(filter)}, 300);
    });

    // check if there are filters/sorting values already set
    checkInitialFiltering(filter);

    // reset filtering results if filter selection was changed by an external control (e.g., form reset) 
    filter.element.addEventListener('update-filter-results', function(event){
      // reset filters first
      for(var i = 0; i < filter.controllers.length; i++) filter.filterString[i] = '';
      filter.sortingString = '';
      checkInitialFiltering(filter);
    });
  };

  function checkInitialFiltering(filter) {
    for(var i = 0; i < filter.controllers.length; i++) { // check if there's a selected option
      // buttons list
      var selectedButton = filter.controllers[i].getElementsByClassName('js-filter-selected');
      if(selectedButton.length > 0) {
        var sort = selectedButton[0].getAttribute('data-sort');
        sort
          ? setSortingString(filter, selectedButton[0].getAttribute('data-sort'), selectedButton[0])
          : setFilterString(filter, i, 'button');
        continue;
      }

      // input list
      var selectedInput = filter.controllers[i].querySelectorAll('input:checked');
      if(selectedInput.length > 0) {
        var sort = selectedInput[0].getAttribute('data-sort');
        sort
          ? setSortingString(filter, sort, selectedInput[0])
          : setFilterString(filter, i, 'input');
        continue;
      }
      // select item
      if(filter.controllers[i].tagName.toLowerCase() == 'select') {
        var sort = filter.controllers[i].getAttribute('data-sort');
        sort
          ? setSortingString(filter, filter.controllers[i].value, filter.controllers[i].options[filter.controllers[i].selectedIndex])
          : setFilterString(filter, i, 'select');
         continue;
      }
      // check if there's a generic custom input
      var radioInput = filter.controllers[i].querySelector('input[type="radio"]'),
        checkboxInput = filter.controllers[i].querySelector('input[type="checkbox"]');
      if(!radioInput && !checkboxInput) {
        var sort = filter.controllers[i].getAttribute('data-sort');
        var filterString = filter.controllers[i].getAttribute('data-filter');
        if(sort) setSortingString(filter, sort, filter.controllers[i]);
        else if(filterString) setFilterString(filter, i, 'custom');
      }
    }

    updateFilterArray(filter);
  };

  function setSortingString(filter, value, item) { 
    // get sorting string value-> sortName:order:type
    var order = item.getAttribute('data-sort-order') ? 'desc' : 'asc';
    var type = item.getAttribute('data-sort-number') ? 'number' : 'string';
    filter.sortingString = value+':'+order+':'+type;
  };

  function setFilterString(filter, index, type) { 
    // get filtering array -> [filter1:filter2, filter3, filter4:filter5]
    if(type == 'input') {
      var checkedInputs = filter.controllers[index].querySelectorAll('input:checked');
      filter.filterString[index] = '';
      for(var i = 0; i < checkedInputs.length; i++) {
        filter.filterString[index] = filter.filterString[index] + checkedInputs[i].getAttribute('data-filter') + ':';
      }
    } else if(type == 'select') {
      if(filter.controllers[index].multiple) { // select with multiple options
        filter.filterString[index] = getMultipleSelectValues(filter.controllers[index]);
      } else { // select with single option
        filter.filterString[index] = filter.controllers[index].value;
      }
    } else if(type == 'button') {
      var selectedButtons = filter.controllers[index].querySelectorAll('.js-filter-selected');
      filter.filterString[index] = '';
      for(var i = 0; i < selectedButtons.length; i++) {
        filter.filterString[index] = filter.filterString[index] + selectedButtons[i].getAttribute('data-filter') + ':';
      }
    } else if(type == 'custom') {
      filter.filterString[index] = filter.controllers[index].getAttribute('data-filter');
    }
  };

  function resetControllersList(filter, index, target1, target2) {
    // for a <button>s list -> toggle js-filter-selected + custom classes
    var multi = filter.controllers[index].getAttribute('data-filter-checkbox'),
      customClass = filter.controllers[index].getAttribute('data-selected-class');
    
    customClass = (customClass) ? 'js-filter-selected '+ customClass : 'js-filter-selected';
    if(multi == 'true') { // multiple options can be on
      (target1) 
        ? Util.toggleClass(target1, customClass, !Util.hasClass(target1, 'js-filter-selected'))
        : Util.toggleClass(target2, customClass, !Util.hasClass(target2, 'js-filter-selected'));
    } else { // only one element at the time
      // remove the class from all siblings
      var selectedOption = filter.controllers[index].querySelector('.js-filter-selected');
      if(selectedOption) Util.removeClass(selectedOption, customClass);
      (target1) 
        ? Util.addClass(target1, customClass)
        : Util.addClass(target2, customClass);
    }
  };

  function updateFilterArray(filter) { // sort/filter strings have been updated -> so you can update the gallery
    if(filter.animating) {
      filter.reanimate = true;
      return;
    }
    filter.animating = true;
    filter.reanimate = false;
    createGridInfo(filter); // get new grid coordinates
    sortingGallery(filter); // update sorting list 
    filteringGallery(filter); // update filter list
    resetFallbackMessage(filter, true); // toggle fallback message
    if(reducedMotion || filter.animateOff) {
      resetItems(filter);
    } else {
      updateItemsAttributes(filter);
    }
  };

  function sortingGallery(filter) {
    // use sorting string to reorder gallery
    var sortOptions = filter.sortingString.split(':');
    if(sortOptions[0] == '' || sortOptions[0] == '*') {
      // no sorting needed
      restoreSortOrder(filter);
    } else { // need to sort
      if(filter.options[sortOptions[0]]) { // custom sort function -> user takes care of it
        filter.sortingList = filter.options[sortOptions[0]](filter.sortingList);
      } else {
        filter.sortingList.sort(function(left, right) {
          var leftVal = left[0].getAttribute('data-sort-'+sortOptions[0]),
          rightVal = right[0].getAttribute('data-sort-'+sortOptions[0]);
          if(sortOptions[2] == 'number') {
            leftVal = parseFloat(leftVal);
            rightVal = parseFloat(rightVal);
          }
          if(sortOptions[1] == 'desc') return leftVal <= rightVal ? 1 : -1;
          else return leftVal >= rightVal ? 1 : -1;
        });
      }
    }
  };

  function filteringGallery(filter) {
    // use filtering string to reorder gallery
    resetFilterSortArray(filter, true, false);
    // we can have multiple filters
    for(var i = 0; i < filter.filterString.length; i++) {
      //check if multiple filters inside the same controller
      if(filter.filterString[i] != '' && filter.filterString[i] != '*' && filter.filterString[i] != ' ') {
        singleFilterGallery(filter, filter.filterString[i].split(':'));
      }
    }
  };

  function singleFilterGallery(filter, subfilter) {
    if(!subfilter || subfilter == '' || subfilter == '*') return;
    // check if we have custom options
    var customFilterArray = [];
    for(var j = 0; j < subfilter.length; j++) {
      if(filter.options[subfilter[j]]) { // custom function
        customFilterArray[subfilter[j]] = filter.options[subfilter[j]](filter.items);
      }
    }

    for(var i = 0; i < filter.items.length; i++) {
      var filterValues = filter.items[i].getAttribute('data-filter').split(' ');
      var present = false;
      for(var j = 0; j < subfilter.length; j++) {
        if(filter.options[subfilter[j]] && customFilterArray[subfilter[j]][i]) { // custom function
          present = true;
          break;
        } else if(subfilter[j] == '*' || filterValues.indexOf(subfilter[j]) > -1) {
          present = true;
          break;
        }
      }
      filter.filterList[i] = !present ? false : filter.filterList[i];
    }
  };

  function updateItemsAttributes(filter) { // set items before triggering the update animation
    // get offset of all elements before animation
    storeOffset(filter, filter.itemsInitPosition);
    // set height of container
    filter.element.setAttribute('style', 'height: '+parseFloat(filter.element.offsetHeight)+'px; width: '+parseFloat(filter.element.offsetWidth)+'px;');

    for(var i = 0; i < filter.items.length; i++) { // remove is-hidden class from items now visible and scale to zero
      if( Util.hasClass(filter.items[i], 'is-hidden') && filter.filterList[i]) {
        filter.items[i].setAttribute('data-scale', 'on');
        filter.items[i].setAttribute('style', filter.accelerateStyle+'transform: scale(0.5); opacity: 0;')
        Util.removeClass(filter.items[i], 'is-hidden');
      }
    }
    // get new elements offset
    storeOffset(filter, filter.itemsIterPosition);
    // translate items so that they are in the right initial position
    for(var i = 0; i < filter.items.length; i++) {
      if( filter.items[i].getAttribute('data-scale') != 'on') {
        filter.items[i].setAttribute('style', filter.accelerateStyle+'transform: translateX('+parseInt(filter.itemsInitPosition[i][0] - filter.itemsIterPosition[i][0])+'px) translateY('+parseInt(filter.itemsInitPosition[i][1] - filter.itemsIterPosition[i][1])+'px);');
      }
    }

    animateItems(filter)
  };

  function animateItems(filter) {
    var transitionValue = 'transform '+filter.options.duration+'ms cubic-bezier(0.455, 0.03, 0.515, 0.955), opacity '+filter.options.duration+'ms';

    // get new index of items in the list
    var j = 0;
    for(var i = 0; i < filter.sortingList.length; i++) {
      var item = filter.items[filter.sortingList[i][1]];
        
      if(Util.hasClass(item, 'is-hidden') || !filter.filterList[filter.sortingList[i][1]]) {
        // item is hidden or was previously hidden -> final position equal to first one
        filter.itemsFinalPosition[filter.sortingList[i][1]] = filter.itemsIterPosition[filter.sortingList[i][1]];
        if(item.getAttribute('data-scale') == 'on') j = j + 1; 
      } else {
        filter.itemsFinalPosition[filter.sortingList[i][1]] = [filter.itemsGrid[j][0], filter.itemsGrid[j][1]]; // left/top
        j = j + 1; 
      }
    } 

    setTimeout(function(){
      for(var i = 0; i < filter.items.length; i++) {
        if(filter.filterList[i] && filter.items[i].getAttribute('data-scale') == 'on') { // scale up item
          filter.items[i].setAttribute('style', filter.accelerateStyle+'transition: '+transitionValue+'; transform: translateX('+parseInt(filter.itemsFinalPosition[i][0] - filter.itemsIterPosition[i][0])+'px) translateY('+parseInt(filter.itemsFinalPosition[i][1] - filter.itemsIterPosition[i][1])+'px) scale(1); opacity: 1;');
        } else if(filter.filterList[i]) { // translate item
          filter.items[i].setAttribute('style', filter.accelerateStyle+'transition: '+transitionValue+'; transform: translateX('+parseInt(filter.itemsFinalPosition[i][0] - filter.itemsIterPosition[i][0])+'px) translateY('+parseInt(filter.itemsFinalPosition[i][1] - filter.itemsIterPosition[i][1])+'px);');
        } else { // scale down item
          filter.items[i].setAttribute('style', filter.accelerateStyle+'transition: '+transitionValue+'; transform: scale(0.5); opacity: 0;');
        }
      };
    }, 50);  
    
    // wait for the end of transition of visible elements
    setTimeout(function(){
      resetItems(filter);
    }, (filter.options.duration + 100));
  };

  function resetItems(filter) {
    // animation was off or animation is over -> reset attributes
    for(var i = 0; i < filter.items.length; i++) {
      filter.items[i].removeAttribute('style');
      Util.toggleClass(filter.items[i], 'is-hidden', !filter.filterList[i]);
      filter.items[i].removeAttribute('data-scale');
    }
    
    for(var i = 0; i < filter.items.length; i++) {// reorder
      filter.element.appendChild(filter.items[filter.sortingList[i][1]]);
    }

    filter.items = [];
    filter.items = filter.element.querySelectorAll('.js-filter__item');
    resetFilterSortArray(filter, false, true);
    filter.element.removeAttribute('style');
    filter.animating = false;
    if(filter.reanimate) {
      updateFilterArray(filter);
    }

    resetFallbackMessage(filter, false); // toggle fallback message

    // emit custom event - end of filtering
    filter.element.dispatchEvent(new CustomEvent('filter-selection-updated'));
  };

  function resetFilterSortArray(filter, filtering, sorting) {
    for(var i = 0; i < filter.items.length; i++) {
      if(filtering) filter.filterList[i] = true;
      if(sorting) filter.sortingList[i] = [filter.items[i], i];
    }
  };

  function createGridInfo(filter) {
    var containerWidth = parseFloat(window.getComputedStyle(filter.element).getPropertyValue('width')),
      itemStyle, itemWidth, itemHeight, marginX, marginY, colNumber;

    // get offset first visible element
    for(var i = 0; i < filter.items.length; i++) {
      if( !Util.hasClass(filter.items[i], 'is-hidden') ) {
        itemStyle = window.getComputedStyle(filter.items[i]),
        itemWidth = parseFloat(itemStyle.getPropertyValue('width')),
        itemHeight = parseFloat(itemStyle.getPropertyValue('height')),
        marginX = parseFloat(itemStyle.getPropertyValue('margin-left')) + parseFloat(itemStyle.getPropertyValue('margin-right')),
        marginY = parseFloat(itemStyle.getPropertyValue('margin-bottom')) + parseFloat(itemStyle.getPropertyValue('margin-top')),
        colNumber = parseInt((containerWidth + marginX)/(itemWidth+marginX));
        filter.itemsGrid[0] = [filter.items[i].offsetLeft, filter.items[i].offsetTop]; // left, top
        break;
      }
    }

    for(var i = 1; i < filter.items.length; i++) {
      var x = i < colNumber ? i : i % colNumber,
        y = i < colNumber ? 0 : Math.floor(i/colNumber);
      filter.itemsGrid[i] = [filter.itemsGrid[0][0] + x*(itemWidth+marginX), filter.itemsGrid[0][1] + y*(itemHeight+marginY)];
    }
  };

  function storeOffset(filter, array) {
    for(var i = 0; i < filter.items.length; i++) {
      array[i] = [filter.items[i].offsetLeft, filter.items[i].offsetTop];
    }
  };

  function initItemsOrder(filter) {
    for(var i = 0; i < filter.items.length; i++) {
      filter.items[i].setAttribute('data-init-sort-order', i);
    }
  };

  function restoreSortOrder(filter) {
    for(var i = 0; i < filter.items.length; i++) {
      filter.sortingList[parseInt(filter.items[i].getAttribute('data-init-sort-order'))] = [filter.items[i], i];
    }
  };

  function resetFallbackMessage(filter, bool) {
    if(!filter.fallbackMessage) return;
    var show = true;
    for(var i = 0; i < filter.filterList.length; i++) {
      if(filter.filterList[i]) {
        show = false;
        break;
      }
    };
    if(bool) { // reset visibility before animation is triggered
      if(!show) Util.addClass(filter.fallbackMessage, 'is-hidden');
      return;
    }
    Util.toggleClass(filter.fallbackMessage, 'is-hidden', !show);
  };

  function getMultipleSelectValues(multipleSelect) {
    // get selected options of a <select multiple> element
    var options = multipleSelect.options,
      value = '';
    for(var i = 0; i < options.length; i++) {
      if(options[i].selected) {
        if(value != '') value = value + ':';
        value = value + options[i].value;
      }
    }
    return value;
  };

  Filter.defaults = {
    element : false,
    duration: 400
  };

  window.Filter = Filter;

  // init Filter object
  var filterGallery = document.getElementsByClassName('js-filter'),
    reducedMotion = Util.osHasReducedMotion();
  if( filterGallery.length > 0 ) {
    for( var i = 0; i < filterGallery.length; i++) {
      var duration = filterGallery[i].getAttribute('data-filter-duration');
      if(!duration) duration = Filter.defaults.duration;
      new Filter({element: filterGallery[i], duration: duration});
    }
  }
}());
// File#: _1_flash-message
// Usage: codyhouse.co/license
(function() {
	var FlashMessage = function(element) {
		this.element = element;
		this.showClass = "flash-message--is-visible";
		this.messageDuration = parseInt(this.element.getAttribute('data-duration')) || 3000;
		this.triggers = document.querySelectorAll('[aria-controls="'+this.element.getAttribute('id')+'"]');
		this.temeoutId = null;
		this.isVisible = false;
		this.initFlashMessage();
	};

	FlashMessage.prototype.initFlashMessage = function() {
		var self = this;
		//open modal when clicking on trigger buttons
		if ( self.triggers ) {
			for(var i = 0; i < self.triggers.length; i++) {
				self.triggers[i].addEventListener('click', function(event) {
					event.preventDefault();
					self.showFlashMessage();
				});
			}
		}
		//listen to the event that triggers the opening of a flash message
		self.element.addEventListener('showFlashMessage', function(){
			self.showFlashMessage();
		});
	};

	FlashMessage.prototype.showFlashMessage = function() {
		var self = this;
		Util.addClass(self.element, self.showClass);
		self.isVisible = true;
		//hide other flash messages
		self.hideOtherFlashMessages();
		if( self.messageDuration > 0 ) {
			//hide the message after an interveal (this.messageDuration)
			self.temeoutId = setTimeout(function(){
				self.hideFlashMessage();
			}, self.messageDuration);
		}
	};

	FlashMessage.prototype.hideFlashMessage = function() {
		Util.removeClass(this.element, this.showClass);
		this.isVisible = false;
		//reset timeout
		clearTimeout(this.temeoutId);
		this.temeoutId = null;
	};

	FlashMessage.prototype.hideOtherFlashMessages = function() {
		var event = new CustomEvent('flashMessageShown', { detail: this.element });
		window.dispatchEvent(event);
	};

	FlashMessage.prototype.checkFlashMessage = function(message) {
		if( !this.isVisible ) return; 
		if( this.element == message) return;
		this.hideFlashMessage();
	};

	//initialize the FlashMessage objects
	var flashMessages = document.getElementsByClassName('js-flash-message');
	if( flashMessages.length > 0 ) {
		var flashMessagesArray = [];
		for( var i = 0; i < flashMessages.length; i++) {
			(function(i){flashMessagesArray.push(new FlashMessage(flashMessages[i]));})(i);
		}

		//listen for a flash message to be shown -> close the others
		window.addEventListener('flashMessageShown', function(event){
			flashMessagesArray.forEach(function(element){
				element.checkFlashMessage(event.detail);
			});
		});
	}
}());
// File#: _1_form-validator
// Usage: codyhouse.co/license
(function() {
  var FormValidator = function(opts) {
    this.options = Util.extend(FormValidator.defaults , opts);
		this.element = this.options.element;
    this.input = [];
    this.textarea = [];
    this.select = [];
    this.errorFields = [];
    this.errorFieldListeners = [];
		initFormValidator(this);
	};

  //public functions
  FormValidator.prototype.validate = function(cb) {
    validateForm(this);
    if(cb) cb(this.errorFields);
  };

  // private methods
  function initFormValidator(formValidator) {
    formValidator.input = formValidator.element.querySelectorAll('input');
    formValidator.textarea = formValidator.element.querySelectorAll('textarea');
    formValidator.select = formValidator.element.querySelectorAll('select');
  };

  function validateForm(formValidator) {
    // reset input with errors
    formValidator.errorFields = []; 
    // remove change/input events from fields with error
    resetEventListeners(formValidator);
    
    // loop through fields and push to errorFields if there are errors
    for(var i = 0; i < formValidator.input.length; i++) {
      validateField(formValidator, formValidator.input[i]);
    }

    for(var i = 0; i < formValidator.textarea.length; i++) {
      validateField(formValidator, formValidator.textarea[i]);
    }

    for(var i = 0; i < formValidator.select.length; i++) {
      validateField(formValidator, formValidator.select[i]);
    }

    // show errors if any was found
    for(var i = 0; i < formValidator.errorFields.length; i++) {
      showError(formValidator, formValidator.errorFields[i]);
    }

    // move focus to first field with error
    if(formValidator.errorFields.length > 0) formValidator.errorFields[0].focus();
  };

  function validateField(formValidator, field) {
    if(!field.checkValidity()) {
      formValidator.errorFields.push(field);
      return;
    }
    // check for custom functions
    var customValidate = field.getAttribute('data-validate');
    if(customValidate && formValidator.options.customValidate[customValidate]) {
      formValidator.options.customValidate[customValidate](field, function(result) {
        if(!result) formValidator.errorFields.push(field);
      });
    }
  };

  function showError(formValidator, field) {
    // add error classes
    toggleErrorClasses(formValidator, field, true);

    // add event listener
    var index = formValidator.errorFieldListeners.length;
    formValidator.errorFieldListeners[index] = function() {
      toggleErrorClasses(formValidator, field, false);
      field.removeEventListener('change', formValidator.errorFieldListeners[index]);
      field.removeEventListener('input', formValidator.errorFieldListeners[index]);
    };
    field.addEventListener('change', formValidator.errorFieldListeners[index]);
    field.addEventListener('input', formValidator.errorFieldListeners[index]);
  };

  function toggleErrorClasses(formValidator, field, bool) {
    bool ? Util.addClass(field, formValidator.options.inputErrorClass) : Util.removeClass(field, formValidator.options.inputErrorClass);
    if(formValidator.options.inputWrapperErrorClass) {
      var wrapper = field.closest('.js-form-validate__input-wrapper');
      if(wrapper) {
        bool ? Util.addClass(wrapper, formValidator.options.inputWrapperErrorClass) : Util.removeClass(wrapper, formValidator.options.inputWrapperErrorClass);
      }
    }
  };

  function resetEventListeners(formValidator) {
    for(var i = 0; i < formValidator.errorFields.length; i++) {
      toggleErrorClasses(formValidator, formValidator.errorFields[i], false);
      formValidator.errorFields[i].removeEventListener('change', formValidator.errorFieldListeners[i]);
      formValidator.errorFields[i].removeEventListener('input', formValidator.errorFieldListeners[i]);
    }

    formValidator.errorFields = [];
    formValidator.errorFieldListeners = [];
  };
  
  FormValidator.defaults = {
    element : '',
    inputErrorClass : 'form-control--error',
    inputWrapperErrorClass: 'form-validate__input-wrapper--error',
    customValidate: {}
  };
  window.FormValidator = FormValidator;
}());
// File#: _1_hiding-nav
// Usage: codyhouse.co/license
(function() {
  var hidingNav = document.getElementsByClassName('js-hide-nav');
  if(hidingNav.length > 0 && window.requestAnimationFrame) {
    var mainNav = Array.prototype.filter.call(hidingNav, function(element) {
      return Util.hasClass(element, 'js-hide-nav--main');
    }),
    subNav = Array.prototype.filter.call(hidingNav, function(element) {
      return Util.hasClass(element, 'js-hide-nav--sub');
    });
    
    var scrolling = false,
      previousTop = window.scrollY,
      currentTop = window.scrollY,
      scrollDelta = 10,
      scrollOffset = 150, // scrollY needs to be bigger than scrollOffset to hide navigation
      headerHeight = 0; 

    var navIsFixed = false; // check if main navigation is fixed
    if(mainNav.length > 0 && Util.hasClass(mainNav[0], 'hide-nav--fixed')) navIsFixed = true;

    // store button that triggers navigation on mobile
    var triggerMobile = getTriggerMobileMenu();
    var prevElement = createPrevElement();
    var mainNavTop = 0;
    // list of classes the hide-nav has when it is expanded -> do not hide if it has those classes
    var navOpenClasses = hidingNav[0].getAttribute('data-nav-target-class'),
      navOpenArrayClasses = [];
    if(navOpenClasses) navOpenArrayClasses = navOpenClasses.split(' ');
    getMainNavTop();
    if(mainNavTop > 0) {
      scrollOffset = scrollOffset + mainNavTop;
    }
    
    // init navigation and listen to window scroll event
    getHeaderHeight();
    initSecondaryNav();
    initFixedNav();
    resetHideNav();
    window.addEventListener('scroll', function(event){
      if(scrolling) return;
      scrolling = true;
      window.requestAnimationFrame(resetHideNav);
    });

    window.addEventListener('resize', function(event){
      if(scrolling) return;
      scrolling = true;
      window.requestAnimationFrame(function(){
        if(headerHeight > 0) {
          getMainNavTop();
          getHeaderHeight();
          initSecondaryNav();
          initFixedNav();
        }
        // reset both navigation
        hideNavScrollUp();

        scrolling = false;
      });
    });

    function getHeaderHeight() {
      headerHeight = mainNav[0].offsetHeight;
    };

    function initSecondaryNav() { // if there's a secondary nav, set its top equal to the header height
      if(subNav.length < 1 || mainNav.length < 1) return;
      subNav[0].style.top = (headerHeight - 1)+'px';
    };

    function initFixedNav() {
      if(!navIsFixed || mainNav.length < 1) return;
      mainNav[0].style.marginBottom = '-'+headerHeight+'px';
    };

    function resetHideNav() { // check if navs need to be hidden/revealed
      currentTop = window.scrollY;
      if(currentTop - previousTop > scrollDelta && currentTop > scrollOffset) {
        hideNavScrollDown();
      } else if( previousTop - currentTop > scrollDelta || (previousTop - currentTop > 0 && currentTop < scrollOffset) ) {
        hideNavScrollUp();
      } else if( previousTop - currentTop > 0 && subNav.length > 0 && subNav[0].getBoundingClientRect().top > 0) {
        setTranslate(subNav[0], '0%');
      }
      // if primary nav is fixed -> toggle bg class
      if(navIsFixed) {
        var scrollTop = window.scrollY || window.pageYOffset;
        Util.toggleClass(mainNav[0], 'hide-nav--has-bg', (scrollTop > headerHeight + mainNavTop));
      }
      previousTop = currentTop;
      scrolling = false;
    };

    function hideNavScrollDown() {
      // if there's a secondary nav -> it has to reach the top before hiding nav
      if( subNav.length  > 0 && subNav[0].getBoundingClientRect().top > headerHeight) return;
      // on mobile -> hide navigation only if dropdown is not open
      if(triggerMobile && triggerMobile.getAttribute('aria-expanded') == "true") return;
      // check if main nav has one of the following classes
      if( mainNav.length > 0 && (!navOpenClasses || !checkNavExpanded())) {
        setTranslate(mainNav[0], '-100%'); 
        mainNav[0].addEventListener('transitionend', addOffCanvasClass);
      }
      if( subNav.length  > 0 ) setTranslate(subNav[0], '-'+headerHeight+'px');
    };

    function hideNavScrollUp() {
      if( mainNav.length > 0 ) {setTranslate(mainNav[0], '0%'); Util.removeClass(mainNav[0], 'hide-nav--off-canvas');mainNav[0].removeEventListener('transitionend', addOffCanvasClass);}
      if( subNav.length  > 0 ) setTranslate(subNav[0], '0%');
    };

    function addOffCanvasClass() {
      mainNav[0].removeEventListener('transitionend', addOffCanvasClass);
      Util.addClass(mainNav[0], 'hide-nav--off-canvas');
    };

    function setTranslate(element, val) {
      element.style.transform = 'translateY('+val+')';
    };

    function getTriggerMobileMenu() {
      // store trigger that toggle mobile navigation dropdown
      var triggerMobileClass = hidingNav[0].getAttribute('data-mobile-trigger');
      if(!triggerMobileClass) return false;
      if(triggerMobileClass.indexOf('#') == 0) { // get trigger by ID
        var trigger = document.getElementById(triggerMobileClass.replace('#', ''));
        if(trigger) return trigger;
      } else { // get trigger by class name
        var trigger = hidingNav[0].getElementsByClassName(triggerMobileClass);
        if(trigger.length > 0) return trigger[0];
      }
      
      return false;
    };

    function createPrevElement() {
      // create element to be inserted right before the mainNav to get its top value
      if( mainNav.length < 1) return false;
      var newElement = document.createElement("div"); 
      newElement.setAttribute('aria-hidden', 'true');
      mainNav[0].parentElement.insertBefore(newElement, mainNav[0]);
      var prevElement =  mainNav[0].previousElementSibling;
      prevElement.style.opacity = '0';
      return prevElement;
    };

    function getMainNavTop() {
      if(!prevElement) return;
      mainNavTop = prevElement.getBoundingClientRect().top + window.scrollY;
    };

    function checkNavExpanded() {
      var navIsOpen = false;
      for(var i = 0; i < navOpenArrayClasses.length; i++){
        if(Util.hasClass(mainNav[0], navOpenArrayClasses[i].trim())) {
          navIsOpen = true;
          break;
        }
      }
      return navIsOpen;
    };
    
  } else {
    // if window requestAnimationFrame is not supported -> add bg class to fixed header
    var mainNav = document.getElementsByClassName('js-hide-nav--main');
    if(mainNav.length < 1) return;
    if(Util.hasClass(mainNav[0], 'hide-nav--fixed')) Util.addClass(mainNav[0], 'hide-nav--has-bg');
  }
}());
// File#: _1_image-magnifier
// Usage: codyhouse.co/license

(function() {
  var ImageMagnifier = function(element) {
    this.element = element;
    this.asset = this.element.getElementsByClassName('js-img-mag__asset')[0];
    this.ready = false;
    this.scale = 1;
    this.intervalId = false;
    this.moving = false;
    this.moveEvent = false;
    initImageMagnifier(this);
  };

  function initImageMagnifier(imgMag) {
    // wait for the image to be loaded
    imgMag.asset.addEventListener('load', function(){
      initImageMagnifierMove(imgMag);
    });
    if(imgMag.asset.complete) {
      initImageMagnifierMove(imgMag);
    }
  };

  function initImageMagnifierMove(imgMag) {
    if(imgMag.ready) return;
    imgMag.ready = true;
    initImageMagnifierScale(imgMag); // get image scale
    // listen to mousenter event
    imgMag.element.addEventListener('mouseenter', handleEvent.bind(imgMag));
  };

  function initImageMagnifierScale(imgMag) {
    var customScale = imgMag.element.getAttribute('data-scale');
    if(customScale) { // use custom scale set in HTML
      imgMag.scale = customScale;
    } else { // use natural width of image to get the scale value
      imgMag.scale = imgMag.asset.naturalWidth/imgMag.element.offsetWidth;
      // round to 2 places decimal
      imgMag.scale = Math.floor((imgMag.scale*100))/100;
      if(imgMag.scale > 1.2)  imgMag.scale = imgMag.scale - 0.2;
    }
  };

  function initImageMove(imgMag) { // add move event listeners
    imgMag.moveEvent = handleEvent.bind(imgMag);
    imgMag.element.addEventListener('mousemove', imgMag.moveEvent);
    imgMag.element.addEventListener('mouseleave', imgMag.moveEvent);
  };

  function cancelImageMove(imgMag) { // remove move event listeners
		if(imgMag.intervalId) {
			(!window.requestAnimationFrame) ? clearInterval(imgMag.intervalId) : window.cancelAnimationFrame(imgMag.intervalId);
			imgMag.intervalId = false;
    }
    if(imgMag.moveEvent) {
      imgMag.element.removeEventListener('mousemove', imgMag.moveEvent);
      imgMag.element.removeEventListener('mouseleave', imgMag.moveEvent);
      imgMag.moveEvent = false;
    }
  };

  function handleEvent(event) {
		switch(event.type) {
			case 'mouseenter':
				startMove(this, event);
				break;
			case 'mousemove':
				move(this, event);
				break;
			case 'mouseleave':
				endMove(this);
				break;
		}
  };
  
  function startMove(imgMag, event) {
    imgMag.moving = true;
    initImageMove(imgMag); // listen to mousemove event
    zoomImageMagnifier(imgMag, event);
  };

  function move(imgMag, event) {
    if(!imgMag.moving || imgMag.intervalId) return;
    (!window.requestAnimationFrame) 
      ? imgMag.intervalId = setTimeout(function(){zoomImageMagnifier(imgMag, event);}, 250)
      : imgMag.intervalId = window.requestAnimationFrame(function(){zoomImageMagnifier(imgMag, event);});
  };

  function endMove(imgMag) {
    imgMag.moving = false;
    cancelImageMove(imgMag); // remove event listeners
    imgMag.asset.removeAttribute('style'); // reset image style
  };

  function zoomImageMagnifier(imgMag, event) { // zoom effect on mousemove
    var elementRect = imgMag.element.getBoundingClientRect();
    var translateX = (elementRect.left - event.clientX);
    var translateY = (elementRect.top - event.clientY);
    if(translateX > 0) translateX = 0;if(translateX < -1*elementRect.width) translateX = -1*elementRect.width;
    if(translateY > 0) translateY = 0;if(translateY < -1*elementRect.height) translateX = -1*elementRect.height;
    var transform = 'translateX('+translateX*(imgMag.scale - 1)+'px) translateY('+translateY*(imgMag.scale - 1)+'px) scale('+imgMag.scale+')';
    imgMag.asset.setAttribute('style', 'transform: '+transform+';');
    imgMag.intervalId = false;
  };

  // init ImageMagnifier object
  var imageMag = document.getElementsByClassName('js-img-mag');
  if( imageMag.length > 0 ) {
    for( var i = 0; i < imageMag.length; i++) {
      new ImageMagnifier(imageMag[i]);
    }
  }
}());
// File#: _1_immersive-section-transition
// Usage: codyhouse.co/license
(function() {
  var ImmerseSectionTr = function(element) {
    this.element = element;
    this.media = this.element.getElementsByClassName('js-immerse-section-tr__media');
    this.scrollContent = this.element.getElementsByClassName('js-immerse-section-tr__content');
    if(this.media.length < 1) return;
    this.figure = this.media[0].getElementsByClassName('js-immerse-section-tr__figure');
    if(this.figure.length < 1) return;
    this.visibleFigure = false;
    this.mediaScale = 1;
    this.mediaInitHeight = 0;
    this.elementPadding = 0;
    this.scrollingFn = false;
    this.scrolling = false;
    this.active = false;
    this.scrollDelta = 0; // amount to scroll for full-screen scaleup
    initImmerseSectionTr(this);
  };

  function initImmerseSectionTr(element) {
    initContainer(element);
    resetSection(element);

    // listen to resize event and reset values
    element.element.addEventListener('update-immerse-section', function(event){
      resetSection(element);
    });

    // detect when the element is sticky - update scale value and opacity layer 
    var observer = new IntersectionObserver(immerseSectionTrCallback.bind(element));
    observer.observe(element.media[0]);
  };

  function resetSection(element) {
    getVisibleFigure(element);
    checkEffectActive(element);
    if(element.active) {
      Util.removeClass(element.element, 'immerse-section-tr--disabled');
      updateMediaHeight(element);
      getMediaScale(element); 
      updateMargin(element);
      setScaleValue.bind(element)();
    } else {
      // reset appearance
      Util.addClass(element.element, 'immerse-section-tr--disabled');
      element.media[0].style = '';
      element.scrollContent[0].style = '';
      updateScale(element, 1);
      updateOpacity(element, 0);
    }
    element.element.dispatchEvent(new CustomEvent('immersive-section-updated', {detail: {active: element.active, asset: element.visibleFigure}}));
  };

  function getVisibleFigure(element) { // get visible figure element
    element.visibleFigure = false;
    for(var i = 0; i < element.figure.length; i++) {
      if(window.getComputedStyle(element.figure[i]).getPropertyValue('display') != 'none') {
        element.visibleFigure = element.figure[i];
        break;
      }
    }
  };

  function updateMediaHeight(element) { // set sticky element padding/margin + height
    element.mediaInitHeight = element.visibleFigure.offsetHeight;
    element.scrollDelta = (window.innerHeight - element.visibleFigure.offsetHeight) > (window.innerWidth - element.visibleFigure.offsetWidth)
      ? (window.innerHeight - element.visibleFigure.offsetHeight)/2
      : (window.innerWidth - element.visibleFigure.offsetWidth)/2;
    if(element.scrollDelta > window.innerHeight) element.scrollDelta = window.innerHeight;
    if(element.scrollDelta < 200) element.scrollDelta = 200;
    element.media[0].style.height = window.innerHeight+'px';
    element.media[0].style.paddingTop = (window.innerHeight - element.visibleFigure.offsetHeight)/2+'px';
    element.media[0].style.marginTop = (element.visibleFigure.offsetHeight - window.innerHeight)/2+'px';
  };

  function getMediaScale(element) { // get media final scale value
    var scaleX = roundValue(window.innerWidth/element.visibleFigure.offsetWidth),
      scaleY = roundValue(window.innerHeight/element.visibleFigure.offsetHeight);

    element.mediaScale = Math.max(scaleX, scaleY);
    element.elementPadding = parseInt(window.getComputedStyle(element.element).getPropertyValue('padding-top'));
  };

  function roundValue(value) {
    return (Math.ceil(value*100)/100).toFixed(2);
  };

  function updateMargin(element) { // update distance between media and content elements
    if(element.scrollContent.length > 0) element.scrollContent[0].style.marginTop = element.scrollDelta+'px';
  };

  function setScaleValue() { // update asset scale value
    if(!this.active) return; // effect is not active
    var offsetTop = (window.innerHeight - this.mediaInitHeight)/2;
    var top = this.element.getBoundingClientRect().top + this.elementPadding;

    if( top < offsetTop && top > offsetTop - this.scrollDelta) {
      var scale = 1 + (top - offsetTop)*(1 - this.mediaScale)/this.scrollDelta;
      updateScale(this, scale);
      updateOpacity(this, 0);
    } else if(top >= offsetTop) {
      updateScale(this, 1);
      updateOpacity(this, 0);
    } else {
      updateScale(this, this.mediaScale);
      updateOpacity(this, 1.8*( offsetTop - this.scrollDelta - top)/ window.innerHeight);
    }

    this.scrolling = false;
  };

  function updateScale(element, value) { // apply new scale value
    element.visibleFigure.style.transform = 'scale('+value+')';
    element.visibleFigure.style.msTransform = 'scale('+value+')';
  };

  function updateOpacity(element, value) { // update layer opacity
    element.element.style.setProperty('--immerse-section-tr-opacity', value);
  };

  function immerseSectionTrCallback(entries) { // intersectionObserver callback
    if(entries[0].isIntersecting) {
      if(this.scrollingFn) return; // listener for scroll event already added
      immerseSectionTrScrollEvent(this);
    } else {
      if(!this.scrollingFn) return; // listener for scroll event already removed
      window.removeEventListener('scroll', this.scrollingFn);
      this.scrollingFn = false;
    }
  };

  function immerseSectionTrScrollEvent(element) { // listen to scroll when asset element is inside the viewport
    element.scrollingFn = immerseSectionTrScrolling.bind(element);
    window.addEventListener('scroll', element.scrollingFn);
  };

  function immerseSectionTrScrolling() { // update asset scale on scroll
    if(this.scrolling) return;
    this.scrolling = true;
    window.requestAnimationFrame(setScaleValue.bind(this));
  };

  function initContainer(element) {
    // add a padding to the container to fix the collapsing-margin issue
    if(parseInt(window.getComputedStyle(element.element).getPropertyValue('padding-top')) == 0) element.element.style.paddingTop = '1px';
  };

  function checkEffectActive(element) { //check if effect needs to be activated
    element.active = true;
    if(element.visibleFigure.offsetHeight >= window.innerHeight) element.active = false;
    if( window.innerHeight - element.visibleFigure.offsetHeight >= 600) element.active = false;
  };

  //initialize the ImmerseSectionTr objects
  var immerseSections = document.getElementsByClassName('js-immerse-section-tr'),
    reducedMotion = Util.osHasReducedMotion(),
    intObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);

  if(immerseSections.length < 1 ) return;
	if( !reducedMotion && intObserverSupported) {
    var immerseSectionsArray = [];
		for( var i = 0; i < immerseSections.length; i++) {
      (function(i){immerseSectionsArray.push(new ImmerseSectionTr(immerseSections[i]));})(i);
    }

    if(immerseSectionsArray.length > 0) {
      var resizingId = false,
        customEvent = new CustomEvent('update-immerse-section');
      
      window.addEventListener('resize', function() {
        clearTimeout(resizingId);
        resizingId = setTimeout(doneResizing, 500);
      });

      function doneResizing() {
        for( var i = 0; i < immerseSectionsArray.length; i++) {
          (function(i){immerseSectionsArray[i].element.dispatchEvent(customEvent)})(i);
        };
      };
    };
  } else { // effect deactivated
    for( var i = 0; i < immerseSections.length; i++) Util.addClass(immerseSections[i], 'immerse-section-tr--disabled');
  }
}());
// File#: _1_lazy-load
// Usage: codyhouse.co/license
(function() {
  var LazyLoad = function(elements) {
    this.elements = elements;
    initLazyLoad(this);
  };

  function initLazyLoad(asset) {
    if(lazySupported) setAssetsSrc(asset);
    else if(intersectionObsSupported) observeAssets(asset);
    else scrollAsset(asset);
  };

  function setAssetsSrc(asset) {
    for(var i = 0; i < asset.elements.length; i++) {
      if(asset.elements[i].getAttribute('data-bg') || asset.elements[i].tagName.toLowerCase() == 'picture') { // this could be an element with a bg image or a <source> element inside a <picture>
        observeSingleAsset(asset.elements[i]);
      } else {
        setSingleAssetSrc(asset.elements[i]);
      } 
    }
  };

  function setSingleAssetSrc(img) {
    if(img.tagName.toLowerCase() == 'picture') {
      setPictureSrc(img);
    } else {
      setSrcSrcset(img);
      var bg = img.getAttribute('data-bg');
      if(bg) img.style.backgroundImage = bg;
      if(!lazySupported || bg) img.removeAttribute("loading");
    }
  };

  function setPictureSrc(picture) {
    var pictureChildren = picture.children;
    for(var i = 0; i < pictureChildren.length; i++) setSrcSrcset(pictureChildren[i]);
    picture.removeAttribute("loading");
  };

  function setSrcSrcset(img) {
    var src = img.getAttribute('data-src');
    if(src) img.src = src;
    var srcset = img.getAttribute('data-srcset');
    if(srcset) img.srcset = srcset;
  };

  function observeAssets(asset) {
    for(var i = 0; i < asset.elements.length; i++) {
      observeSingleAsset(asset.elements[i]);
    }
  };

  function observeSingleAsset(img) {
    if( !img.getAttribute('data-src') && !img.getAttribute('data-srcset') && !img.getAttribute('data-bg') && img.tagName.toLowerCase() != 'picture') return; // using the native lazyload with no need js lazy-loading

    var threshold = img.getAttribute('data-threshold') || '200px';
    var config = {rootMargin: threshold};
    var observer = new IntersectionObserver(observerLoadContent.bind(img), config);
    observer.observe(img);
  };

  function observerLoadContent(entries, observer) { 
    if(entries[0].isIntersecting) {
      setSingleAssetSrc(this);
      observer.unobserve(this);
    }
  };

  function scrollAsset(asset) {
    asset.elements = Array.prototype.slice.call(asset.elements);
    asset.listening = false;
    asset.scrollListener = eventLazyLoad.bind(asset);
    document.addEventListener("scroll", asset.scrollListener);
    asset.resizeListener = eventLazyLoad.bind(asset);
    document.addEventListener("resize", asset.resizeListener);
    eventLazyLoad.bind(asset)(); // trigger before starting scrolling/resizing
  };

  function eventLazyLoad() {
    var self = this;
    if(self.listening) return;
    self.listening = true;
    setTimeout(function() {
      for(var i = 0; i < self.elements.length; i++) {
        if ((self.elements[i].getBoundingClientRect().top <= window.innerHeight && self.elements[i].getBoundingClientRect().bottom >= 0) && getComputedStyle(self.elements[i]).display !== "none") {
          setSingleAssetSrc(self.elements[i]);

          self.elements = self.elements.filter(function(image) {
            return image.hasAttribute("loading");
          });

          if (self.elements.length === 0) {
            if(self.scrollListener) document.removeEventListener("scroll", self.scrollListener);
            if(self.resizeListener) window.removeEventListener("resize", self.resizeListener);
          }
        }
      }
      self.listening = false;
    }, 200);
  };

  window.LazyLoad = LazyLoad;

  var lazyLoads = document.querySelectorAll('[loading="lazy"]'),
    lazySupported = 'loading' in HTMLImageElement.prototype,
    intersectionObsSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
  
  if( lazyLoads.length > 0 ) {
    new LazyLoad(lazyLoads);
  };
  
}());
// File#: _1_looping_tabs
// Usage: codyhouse.co/license
(function() { 
  var LoopTab = function(opts) {
    this.options = Util.extend(LoopTab.defaults , opts);
		this.element = this.options.element;
		this.tabList = this.element.getElementsByClassName('js-loop-tabs__controls')[0];
		this.listItems = this.tabList.getElementsByTagName('li');
		this.triggers = this.tabList.getElementsByTagName('a');
		this.panelsList = this.element.getElementsByClassName('js-loop-tabs__panels')[0];
    this.panels = Util.getChildrenByClassName(this.panelsList, 'js-loop-tabs__panel');
    this.assetsList = this.element.getElementsByClassName('js-loop-tabs__assets')[0];
		this.assets = this.assetsList.getElementsByTagName('li');
		this.videos = getVideoElements(this);
    this.panelShowClass = 'loop-tabs__panel--selected';
		this.assetShowClass = 'loop-tabs__asset--selected';
		this.assetExitClass = 'loop-tabs__asset--exit';
    this.controlActiveClass = 'loop-tabs__control--selected';
    // autoplay
    this.autoplayPaused = false;
		this.loopTabAutoId = false;
		this.loopFillAutoId = false;
		this.loopFill = 0;
		initLoopTab(this);
	};
	
	function getVideoElements(tab) {
		var videos = [];
		for(var i = 0; i < tab.assets.length; i++) {
			var video = tab.assets[i].getElementsByTagName('video');
			videos[i] = video.length > 0 ? video[0] : false;
		}
		return videos;
	};
  
  function initLoopTab(tab) {
    //set initial aria attributes
		tab.tabList.setAttribute('role', 'tablist');
		for( var i = 0; i < tab.triggers.length; i++) {
			var bool = Util.hasClass(tab.triggers[i], tab.controlActiveClass),
        panelId = tab.panels[i].getAttribute('id');
			tab.listItems[i].setAttribute('role', 'presentation');
			Util.setAttributes(tab.triggers[i], {'role': 'tab', 'aria-selected': bool, 'aria-controls': panelId, 'id': 'tab-'+panelId});
			Util.addClass(tab.triggers[i], 'js-loop-tabs__trigger'); 
      Util.setAttributes(tab.panels[i], {'role': 'tabpanel', 'aria-labelledby': 'tab-'+panelId});
      Util.toggleClass(tab.panels[i], tab.panelShowClass, bool);
			Util.toggleClass(tab.assets[i], tab.assetShowClass, bool);
			
			resetVideo(tab, i, bool); // play/pause video if available

			if(!bool) tab.triggers[i].setAttribute('tabindex', '-1'); 
		}
		// add autoplay-off class if needed
		!tab.options.autoplay && Util.addClass(tab.element, 'loop-tabs--autoplay-off');
		//listen for Tab events
		initLoopTabEvents(tab);
  };

  function initLoopTabEvents(tab) {
		if(tab.options.autoplay) { 
			initLoopTabAutoplay(tab); // init autoplay
			// pause autoplay if user is interacting with the tabs
			tab.element.addEventListener('focusin', function(event){
				pauseLoopTabAutoplay(tab);
				tab.autoplayPaused = true;
			});
			tab.element.addEventListener('focusout', function(event){
				tab.autoplayPaused = false;
				initLoopTabAutoplay(tab);
			});
		}

    //click on a new tab -> select content
		tab.tabList.addEventListener('click', function(event) {
			if( event.target.closest('.js-loop-tabs__trigger') ) triggerLoopTab(tab, event.target.closest('.js-loop-tabs__trigger'), event);
		});
		
    //arrow keys to navigate through tabs 
		tab.tabList.addEventListener('keydown', function(event) {
			if( !event.target.closest('.js-loop-tabs__trigger') ) return;
			if( event.keyCode && event.keyCode == 39 || event.key && event.key.toLowerCase() == 'arrowright' ) {
				pauseLoopTabAutoplay(tab);
				selectNewLoopTab(tab, 'next', true);
			} else if( event.keyCode && event.keyCode == 37 || event.key && event.key.toLowerCase() == 'arrowleft' ) {
				pauseLoopTabAutoplay(tab);
				selectNewLoopTab(tab, 'prev', true);
			}
		});
  };

  function initLoopTabAutoplay(tab) {
		if(!tab.options.autoplay || tab.autoplayPaused) return;
		tab.loopFill = 0;
		var selectedTab = tab.tabList.getElementsByClassName(tab.controlActiveClass)[0];
		// reset css variables
		for(var i = 0; i < tab.triggers.length; i++) {
			if(cssVariableSupport) tab.triggers[i].style.setProperty('--loop-tabs-filling', 0);
		}
		
		tab.loopTabAutoId = setTimeout(function(){
      selectNewLoopTab(tab, 'next', false);
		}, tab.options.autoplayInterval);
		
		if(cssVariableSupport) { // tab fill effect
			tab.loopFillAutoId = setInterval(function(){
				tab.loopFill = tab.loopFill + 0.005;
				selectedTab.style.setProperty('--loop-tabs-filling', tab.loopFill);
			}, tab.options.autoplayInterval/200);
		}
  };

  function pauseLoopTabAutoplay(tab) { // pause autoplay
    if(tab.loopTabAutoId) {
			clearTimeout(tab.loopTabAutoId);
			tab.loopTabAutoId = false;
			clearInterval(tab.loopFillAutoId);
			tab.loopFillAutoId = false;
			// make sure the filling line is scaled up
			var selectedTab = tab.tabList.getElementsByClassName(tab.controlActiveClass);
			if(selectedTab.length > 0) selectedTab[0].style.setProperty('--loop-tabs-filling', 1);
		}
  };

  function selectNewLoopTab(tab, direction, bool) {
    var selectedTab = tab.tabList.getElementsByClassName(tab.controlActiveClass)[0],
			index = Util.getIndexInArray(tab.triggers, selectedTab);
		index = (direction == 'next') ? index + 1 : index - 1;
		//make sure index is in the correct interval 
		//-> from last element go to first using the right arrow, from first element go to last using the left arrow
		if(index < 0) index = tab.listItems.length - 1;
		if(index >= tab.listItems.length) index = 0;	
		triggerLoopTab(tab, tab.triggers[index]);
		bool && tab.triggers[index].focus();
  };

  function triggerLoopTab(tab, tabTrigger, event) {
		pauseLoopTabAutoplay(tab);
		event && event.preventDefault();	
		var index = Util.getIndexInArray(tab.triggers, tabTrigger);
		//no need to do anything if tab was already selected
		if(Util.hasClass(tab.triggers[index], tab.controlActiveClass)) return;
		
		for( var i = 0; i < tab.triggers.length; i++) {
			var bool = (i == index),
				exit = Util.hasClass(tab.triggers[i], tab.controlActiveClass);
			Util.toggleClass(tab.triggers[i], tab.controlActiveClass, bool);
      Util.toggleClass(tab.panels[i], tab.panelShowClass, bool);
			Util.toggleClass(tab.assets[i], tab.assetShowClass, bool);
			Util.toggleClass(tab.assets[i], tab.assetExitClass, exit);
			tab.triggers[i].setAttribute('aria-selected', bool);
			bool ? tab.triggers[i].setAttribute('tabindex', '0') : tab.triggers[i].setAttribute('tabindex', '-1');

			resetVideo(tab, i, bool); // play/pause video if available

			// listen for the end of animation on asset element and remove exit class
			if(exit) {(function(i){
				tab.assets[i].addEventListener('transitionend', function cb(event){
					tab.assets[i].removeEventListener('transitionend', cb);
					Util.removeClass(tab.assets[i], tab.assetExitClass);
				});
			})(i);}
		}
    
    // restart tab autoplay
    initLoopTabAutoplay(tab);
	};

	function resetVideo(tab, i, bool) {
		if(tab.videos[i]) {
			if(bool) {
				tab.videos[i].play();
			} else {
				tab.videos[i].pause();
				tab.videos[i].currentTime = 0;
			} 
		}
	};

  LoopTab.defaults = {
    element : '',
    autoplay : true,
    autoplayInterval: 5000
  };

  //initialize the Tab objects
	var loopTabs = document.getElementsByClassName('js-loop-tabs');
	if( loopTabs.length > 0 ) {
		var reducedMotion = Util.osHasReducedMotion(),
			cssVariableSupport = ('CSS' in window) && Util.cssSupports('color', 'var(--var)');
		for( var i = 0; i < loopTabs.length; i++) {
			(function(i){
        var autoplay = (loopTabs[i].getAttribute('data-autoplay') && loopTabs[i].getAttribute('data-autoplay') == 'off' || reducedMotion) ? false : true,
        autoplayInterval = (loopTabs[i].getAttribute('data-autoplay-interval')) ? loopTabs[i].getAttribute('data-autoplay-interval') : 5000;
        new LoopTab({element: loopTabs[i], autoplay : autoplay, autoplayInterval : autoplayInterval});
      })(i);
		}
	}
}());
// File#: _1_header
// Usage: codyhouse.co/license
(function() {
	var mainHeader = document.getElementsByClassName('js-header');
	if( mainHeader.length > 0 ) {
		var trigger = mainHeader[0].getElementsByClassName('js-header__trigger')[0],
			nav = mainHeader[0].getElementsByClassName('js-header__nav')[0];

		// we'll use these to store the node that needs to receive focus when the mobile menu is closed 
		var focusMenu = false;

		//detect click on nav trigger
		trigger.addEventListener("click", function(event) {
			event.preventDefault();
			toggleNavigation(!Util.hasClass(nav, 'header__nav--is-visible'));
		});

		// listen for key events
		window.addEventListener('keyup', function(event){
			// listen for esc key
			if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
				// close navigation on mobile if open
				if(trigger.getAttribute('aria-expanded') == 'true' && isVisible(trigger)) {
					focusMenu = trigger; // move focus to menu trigger when menu is close
					trigger.click();
				}
			}
			// listen for tab key
			if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) {
				// close navigation on mobile if open when nav loses focus
				if(trigger.getAttribute('aria-expanded') == 'true' && isVisible(trigger) && !document.activeElement.closest('.js-header')) trigger.click();
			}
		});

		// listen for resize
		var resizingId = false;
		window.addEventListener('resize', function() {
			clearTimeout(resizingId);
			resizingId = setTimeout(doneResizing, 500);
		});

		function doneResizing() {
			if( !isVisible(trigger) && Util.hasClass(mainHeader[0], 'header--expanded')) toggleNavigation(false); 
		};
	}

	function isVisible(element) {
		return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
	};

	function toggleNavigation(bool) { // toggle navigation visibility on small device
		Util.toggleClass(nav, 'header__nav--is-visible', bool);
		Util.toggleClass(mainHeader[0], 'header--expanded', bool);
		trigger.setAttribute('aria-expanded', bool);
		if(bool) { //opening menu -> move focus to first element inside nav
			nav.querySelectorAll('[href], input:not([disabled]), button:not([disabled])')[0].focus();
		} else if(focusMenu) {
			focusMenu.focus();
			focusMenu = false;
		}
	};
}());
// File#: _1_modal-window
// Usage: codyhouse.co/license
(function() {
	var Modal = function(element) {
		this.element = element;
		this.triggers = document.querySelectorAll('[aria-controls="'+this.element.getAttribute('id')+'"]');
		this.firstFocusable = null;
		this.lastFocusable = null;
		this.moveFocusEl = null; // focus will be moved to this element when modal is open
		this.modalFocus = this.element.getAttribute('data-modal-first-focus') ? this.element.querySelector(this.element.getAttribute('data-modal-first-focus')) : null;
		this.selectedTrigger = null;
		this.preventScrollEl = this.getPreventScrollEl();
		this.showClass = "modal--is-visible";
		this.initModal();
	};

	Modal.prototype.getPreventScrollEl = function() {
		var scrollEl = false;
		var querySelector = this.element.getAttribute('data-modal-prevent-scroll');
		if(querySelector) scrollEl = document.querySelector(querySelector);
		return scrollEl;
	};

	Modal.prototype.initModal = function() {
		var self = this;
		//open modal when clicking on trigger buttons
		if ( this.triggers ) {
			for(var i = 0; i < this.triggers.length; i++) {
				this.triggers[i].addEventListener('click', function(event) {
					event.preventDefault();
					if(Util.hasClass(self.element, self.showClass)) {
						self.closeModal();
						return;
					}
					self.selectedTrigger = event.target;
					self.showModal();
					self.initModalEvents();
				});
			}
		}

		// listen to the openModal event -> open modal without a trigger button
		this.element.addEventListener('openModal', function(event){
			if(event.detail) self.selectedTrigger = event.detail;
			self.showModal();
			self.initModalEvents();
		});

		// listen to the closeModal event -> close modal without a trigger button
		this.element.addEventListener('closeModal', function(event){
			if(event.detail) self.selectedTrigger = event.detail;
			self.closeModal();
		});

		// if modal is open by default -> initialise modal events
		if(Util.hasClass(this.element, this.showClass)) this.initModalEvents();
	};

	Modal.prototype.showModal = function() {
		var self = this;
		Util.addClass(this.element, this.showClass);
		this.getFocusableElements();
		if(this.moveFocusEl) {
			this.moveFocusEl.focus();
			// wait for the end of transitions before moving focus
			this.element.addEventListener("transitionend", function cb(event) {
				self.moveFocusEl.focus();
				self.element.removeEventListener("transitionend", cb);
			});
		}
		this.emitModalEvents('modalIsOpen');
		// change the overflow of the preventScrollEl
		if(this.preventScrollEl) this.preventScrollEl.style.overflow = 'hidden';
	};

	Modal.prototype.closeModal = function() {
		if(!Util.hasClass(this.element, this.showClass)) return;
		Util.removeClass(this.element, this.showClass);
		this.firstFocusable = null;
		this.lastFocusable = null;
		this.moveFocusEl = null;
		if(this.selectedTrigger) this.selectedTrigger.focus();
		//remove listeners
		this.cancelModalEvents();
		this.emitModalEvents('modalIsClose');
		// change the overflow of the preventScrollEl
		if(this.preventScrollEl) this.preventScrollEl.style.overflow = '';
	};

	Modal.prototype.initModalEvents = function() {
		//add event listeners
		this.element.addEventListener('keydown', this);
		this.element.addEventListener('click', this);
	};

	Modal.prototype.cancelModalEvents = function() {
		//remove event listeners
		this.element.removeEventListener('keydown', this);
		this.element.removeEventListener('click', this);
	};

	Modal.prototype.handleEvent = function (event) {
		switch(event.type) {
			case 'click': {
				this.initClick(event);
			}
			case 'keydown': {
				this.initKeyDown(event);
			}
		}
	};

	Modal.prototype.initKeyDown = function(event) {
		if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
			//trap focus inside modal
			this.trapFocus(event);
		} else if( (event.keyCode && event.keyCode == 13 || event.key && event.key == 'Enter') && event.target.closest('.js-modal__close')) {
			event.preventDefault();
			this.closeModal(); // close modal when pressing Enter on close button
		}	
	};

	Modal.prototype.initClick = function(event) {
		//close modal when clicking on close button or modal bg layer 
		if( !event.target.closest('.js-modal__close') && !Util.hasClass(event.target, 'js-modal') ) return;
		event.preventDefault();
		this.closeModal();
	};

	Modal.prototype.trapFocus = function(event) {
		if( this.firstFocusable == document.activeElement && event.shiftKey) {
			//on Shift+Tab -> focus last focusable element when focus moves out of modal
			event.preventDefault();
			this.lastFocusable.focus();
		}
		if( this.lastFocusable == document.activeElement && !event.shiftKey) {
			//on Tab -> focus first focusable element when focus moves out of modal
			event.preventDefault();
			this.firstFocusable.focus();
		}
	}

	Modal.prototype.getFocusableElements = function() {
		//get all focusable elements inside the modal
		var allFocusable = this.element.querySelectorAll(focusableElString);
		this.getFirstVisible(allFocusable);
		this.getLastVisible(allFocusable);
		this.getFirstFocusable();
	};

	Modal.prototype.getFirstVisible = function(elements) {
		//get first visible focusable element inside the modal
		for(var i = 0; i < elements.length; i++) {
			if( isVisible(elements[i]) ) {
				this.firstFocusable = elements[i];
				break;
			}
		}
	};

	Modal.prototype.getLastVisible = function(elements) {
		//get last visible focusable element inside the modal
		for(var i = elements.length - 1; i >= 0; i--) {
			if( isVisible(elements[i]) ) {
				this.lastFocusable = elements[i];
				break;
			}
		}
	};

	Modal.prototype.getFirstFocusable = function() {
		if(!this.modalFocus || !Element.prototype.matches) {
			this.moveFocusEl = this.firstFocusable;
			return;
		}
		var containerIsFocusable = this.modalFocus.matches(focusableElString);
		if(containerIsFocusable) {
			this.moveFocusEl = this.modalFocus;
		} else {
			this.moveFocusEl = false;
			var elements = this.modalFocus.querySelectorAll(focusableElString);
			for(var i = 0; i < elements.length; i++) {
				if( isVisible(elements[i]) ) {
					this.moveFocusEl = elements[i];
					break;
				}
			}
			if(!this.moveFocusEl) this.moveFocusEl = this.firstFocusable;
		}
	};

	Modal.prototype.emitModalEvents = function(eventName) {
		var event = new CustomEvent(eventName, {detail: this.selectedTrigger});
		this.element.dispatchEvent(event);
	};

	function isVisible(element) {
		return element.offsetWidth || element.offsetHeight || element.getClientRects().length;
	};

	//initialize the Modal objects
	var modals = document.getElementsByClassName('js-modal');
	// generic focusable elements string selector
	var focusableElString = '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary';
	if( modals.length > 0 ) {
		var modalArrays = [];
		for( var i = 0; i < modals.length; i++) {
			(function(i){modalArrays.push(new Modal(modals[i]));})(i);
		}

		window.addEventListener('keydown', function(event){ //close modal window on esc
			if(event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape') {
				for( var i = 0; i < modalArrays.length; i++) {
					(function(i){modalArrays[i].closeModal();})(i);
				};
			}
		});
	}
}());
// File#: _1_notice
// Usage: codyhouse.co/license
(function() {
  function initNoticeEvents(notice) {
    notice.addEventListener('click', function(event){
      if(event.target.closest('.js-notice__hide-control')) {
        event.preventDefault();
        Util.addClass(notice, 'notice--hide');
      }
    });
  };
  
  var noticeElements = document.getElementsByClassName('js-notice');
  if(noticeElements.length > 0) {
    for(var i=0; i < noticeElements.length; i++) {(function(i){
      initNoticeEvents(noticeElements[i]);
    })(i);}
  }
}());
// File#: _1_off-canvas-content
// Usage: codyhouse.co/license
(function() {
	var OffCanvas = function(element) {
		this.element = element;
		this.wrapper = document.getElementsByClassName('js-off-canvas')[0];
		this.main = document.getElementsByClassName('off-canvas__main')[0];
		this.triggers = document.querySelectorAll('[aria-controls="'+this.element.getAttribute('id')+'"]');
		this.closeBtn = this.element.getElementsByClassName('js-off-canvas__close-btn');
		this.selectedTrigger = false;
		this.firstFocusable = null;
		this.lastFocusable = null;
		this.animating = false;
		initOffCanvas(this);
	};	

	function initOffCanvas(panel) {
		panel.element.setAttribute('aria-hidden', 'true');
		for(var i = 0 ; i < panel.triggers.length; i++) { // listen to the click on off-canvas content triggers
			panel.triggers[i].addEventListener('click', function(event){
				panel.selectedTrigger = event.currentTarget;
				event.preventDefault();
				togglePanel(panel);
			});
		}

		// listen to the triggerOpenPanel event -> open panel without a trigger button
		panel.element.addEventListener('triggerOpenPanel', function(event){
			if(event.detail) panel.selectedTrigger = event.detail;
			openPanel(panel);
		});
		// listen to the triggerClosePanel event -> open panel without a trigger button
		panel.element.addEventListener('triggerClosePanel', function(event){
			closePanel(panel);
		});
	};

	function togglePanel(panel) {
		var status = (panel.element.getAttribute('aria-hidden') == 'true') ? 'close' : 'open';
		if(status == 'close') openPanel(panel);
		else closePanel(panel);
	};

	function openPanel(panel) {
		if(panel.animating) return; // already animating
		emitPanelEvents(panel, 'openPanel', '');
		panel.animating = true;
		panel.element.setAttribute('aria-hidden', 'false');
		Util.addClass(panel.wrapper, 'off-canvas--visible');
		getFocusableElements(panel);
		var transitionEl = panel.element;
		if(panel.closeBtn.length > 0 && !Util.hasClass(panel.closeBtn[0], 'js-off-canvas__a11y-close-btn')) transitionEl = 	panel.closeBtn[0];
		transitionEl.addEventListener('transitionend', function cb(){
			// wait for the end of transition to move focus and update the animating property
			panel.animating = false;
			Util.moveFocus(panel.element);
			transitionEl.removeEventListener('transitionend', cb);
		});
		if(!transitionSupported) panel.animating = false;
		initPanelEvents(panel);
	};

	function closePanel(panel, bool) {
		if(panel.animating) return;
		panel.animating = true;
		panel.element.setAttribute('aria-hidden', 'true');
		Util.removeClass(panel.wrapper, 'off-canvas--visible');
		panel.main.addEventListener('transitionend', function cb(){
			panel.animating = false;
			if(panel.selectedTrigger) panel.selectedTrigger.focus();
			setTimeout(function(){panel.selectedTrigger = false;}, 10);
			panel.main.removeEventListener('transitionend', cb);
		});
		if(!transitionSupported) panel.animating = false;
		cancelPanelEvents(panel);
		emitPanelEvents(panel, 'closePanel', bool);
	};

	function initPanelEvents(panel) { //add event listeners
		panel.element.addEventListener('keydown', handleEvent.bind(panel));
		panel.element.addEventListener('click', handleEvent.bind(panel));
	};

	function cancelPanelEvents(panel) { //remove event listeners
		panel.element.removeEventListener('keydown', handleEvent.bind(panel));
		panel.element.removeEventListener('click', handleEvent.bind(panel));
	};

	function handleEvent(event) {
		switch(event.type) {
			case 'keydown':
				initKeyDown(this, event);
				break;
			case 'click':
				initClick(this, event);
				break;
		}
	};

	function initClick(panel, event) { // close panel when clicking on close button
		if( !event.target.closest('.js-off-canvas__close-btn')) return;
		event.preventDefault();
		closePanel(panel, 'close-btn');
	};

	function initKeyDown(panel, event) {
		if( event.keyCode && event.keyCode == 27 || event.key && event.key == 'Escape' ) {
			//close off-canvas panel on esc
			closePanel(panel, 'key');
		} else if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
			//trap focus inside panel
			trapFocus(panel, event);
		}
	};

	function trapFocus(panel, event) {
		if( panel.firstFocusable == document.activeElement && event.shiftKey) {
			//on Shift+Tab -> focus last focusable element when focus moves out of panel
			event.preventDefault();
			panel.lastFocusable.focus();
		}
		if( panel.lastFocusable == document.activeElement && !event.shiftKey) {
			//on Tab -> focus first focusable element when focus moves out of panel
			event.preventDefault();
			panel.firstFocusable.focus();
		}
	};

	function getFocusableElements(panel) { //get all focusable elements inside the off-canvas content
		var allFocusable = panel.element.querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary');
		getFirstVisible(panel, allFocusable);
		getLastVisible(panel, allFocusable);
	};

	function getFirstVisible(panel, elements) { //get first visible focusable element inside the off-canvas content
		for(var i = 0; i < elements.length; i++) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				panel.firstFocusable = elements[i];
				return true;
			}
		}
	};

	function getLastVisible(panel, elements) { //get last visible focusable element inside the off-canvas content
		for(var i = elements.length - 1; i >= 0; i--) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				panel.lastFocusable = elements[i];
				return true;
			}
		}
	};

	function emitPanelEvents(panel, eventName, target) { // emit custom event
		var event = new CustomEvent(eventName, {detail: target});
		panel.element.dispatchEvent(event);
	};

	//initialize the OffCanvas objects
	var offCanvas = document.getElementsByClassName('js-off-canvas__panel'),
		transitionSupported = Util.cssSupports('transition');
	if( offCanvas.length > 0 ) {
		for( var i = 0; i < offCanvas.length; i++) {
			(function(i){new OffCanvas(offCanvas[i]);})(i);
		}
	}
}());
// File#: _1_overscroll-section
// Usage: codyhouse.co/license
(function() {
  var OverscrollSection = function(element) {
    this.element = element;
    this.stickyContent = this.element.getElementsByClassName('js-overscroll-section__sticky-content');
    this.scrollContent = this.element.getElementsByClassName('js-overscroll-section__scroll-content');
    this.scrollingFn = false;
    this.scrolling = false;
    this.resetOpacity = false;
    this.disabledClass = 'overscroll-section--disabled';
    initOverscrollSection(this);
  };

  function initOverscrollSection(element) {
    // set position of sticky element
    setTop(element);
    // create a new node - to be inserted before the scroll element
    createPrevElement(element);
    // on resize -> reset element top position
    element.element.addEventListener('update-overscroll-section', function(){
      setTop(element);
      setPrevElementTop(element);
    });
    // set initial opacity value
    animateOverscrollSection.bind(element)(); 
    // change opacity of layer
    var observer = new IntersectionObserver(overscrollSectionCallback.bind(element));
    observer.observe(element.prevElement);
  };

  function createPrevElement(element) {
    if(element.scrollContent.length == 0) return;
    var newElement = document.createElement("div"); 
    newElement.setAttribute('aria-hidden', 'true');
    element.element.insertBefore(newElement, element.scrollContent[0]);
    element.prevElement =  element.scrollContent[0].previousElementSibling;
    element.prevElement.style.opacity = '0';
    setPrevElementTop(element);
  };

  function setPrevElementTop(element) {
    element.prevElementTop = element.prevElement.getBoundingClientRect().top + window.scrollY;
  };

  function overscrollSectionCallback(entries) {
    if(entries[0].isIntersecting) {
      if(this.scrollingFn) return; // listener for scroll event already added
      overscrollSectionInitEvent(this);
    } else {
      if(!this.scrollingFn) return; // listener for scroll event already removed
      window.removeEventListener('scroll', this.scrollingFn);
      updateOpacityValue(this, 0);
      this.scrollingFn = false;
    }
  };

  function overscrollSectionInitEvent(element) {
    element.scrollingFn = overscrollSectionScrolling.bind(element);
    window.addEventListener('scroll', element.scrollingFn);
  };

  function overscrollSectionScrolling() {
    if(this.scrolling) return;
    this.scrolling = true;
    window.requestAnimationFrame(animateOverscrollSection.bind(this));
  };

  function animateOverscrollSection() {
    if(this.stickyContent.length == 0) return;
    setPrevElementTop(this);
    if( parseInt(this.stickyContent[0].style.top) != window.innerHeight - this.stickyContent[0].offsetHeight) {
      setTop(this);
    }
    if(this.prevElementTop - window.scrollY < window.innerHeight*2/3) {
      var opacity = Math.easeOutQuart(window.innerHeight*2/3 + window.scrollY - this.prevElementTop, 0, 1, window.innerHeight*2/3);
      if(opacity > 0 ) {
        this.resetOpacity = false;
        updateOpacityValue(this, opacity);
      } else if(!this.resetOpacity) {
        this.resetOpacity = true;
        updateOpacityValue(this, 0);
      } 
    } else {
      updateOpacityValue(this, 0);
    }
    this.scrolling = false;
  };

  function updateOpacityValue(element, value) {
    element.element.style.setProperty('--overscroll-section-opacity', value);
  };

  function setTop(element) {
    if(element.stickyContent.length == 0) return;
    var translateValue = window.innerHeight - element.stickyContent[0].offsetHeight;
    element.stickyContent[0].style.top = translateValue+'px';
    // check if effect should be disabled
    Util.toggleClass(element.element, element.disabledClass, translateValue > 2);
  };

  //initialize the OverscrollSection objects
  var overscrollSections = document.getElementsByClassName('js-overscroll-section');
  var stickySupported = Util.cssSupports('position', 'sticky') || Util.cssSupports('position', '-webkit-sticky'),
    intObservSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype),
    reducedMotion = Util.osHasReducedMotion();
	if( overscrollSections.length > 0 && stickySupported && !reducedMotion && intObservSupported) {
    var overscrollSectionsArray = [];
		for( var i = 0; i < overscrollSections.length; i++) {
      (function(i){overscrollSectionsArray.push(new OverscrollSection(overscrollSections[i]));})(i);
    }
    
    var resizingId = false,
      customEvent = new CustomEvent('update-overscroll-section');

    window.addEventListener('resize', function() {
      clearTimeout(resizingId);
      resizingId = setTimeout(doneResizing, 100);
    });

    // wait for font to be loaded
    document.fonts.onloadingdone = function (fontFaceSetEvent) {
      doneResizing();
    };

    function doneResizing() {
      for( var i = 0; i < overscrollSectionsArray.length; i++) {
        (function(i){overscrollSectionsArray[i].element.dispatchEvent(customEvent)})(i);
      };
    };
	}
}());
// File#: _1_parallax-image
// Usage: codyhouse.co/license
(function() {
  var ParallaxImg = function(element, rotationLevel) {
    this.element = element;
    this.figure = this.element.getElementsByClassName('js-parallax-img__assets')[0];
    this.imgs = this.element.getElementsByTagName('img');
    this.maxRotation = rotationLevel || 2; // rotate level
    if(this.maxRotation > 5) this.maxRotation = 5;
    this.scale = 1;
    this.animating = false;
    initParallax(this);
    initParallaxEvents(this);
  };

  function initParallax(element) {
    element.count = 0;
    window.requestAnimationFrame(checkImageLoaded.bind(element));
    for(var i = 0; i < element.imgs.length; i++) {(function(i){
      var loaded = false;
      element.imgs[i].addEventListener('load', function(){
        if(loaded) return;
        element.count = element.count + 1;
      });
      if(element.imgs[i].complete && !loaded) {
        loaded = true;
        element.count = element.count + 1;
      }
    })(i);}
  };

  function checkImageLoaded() {
    if(this.count >= this.imgs.length) {
      initScale(this);
      if(this.loaded) {
        window.cancelAnimationFrame(this.loaded);
        this.loaded = false;
      }
    } else {
      this.loaded = window.requestAnimationFrame(checkImageLoaded.bind(this));
    }
  };

  function initScale(element) {
    var maxImgResize = getMaxScale(element);
    element.scale = maxImgResize/(Math.sin(Math.PI / 2 - element.maxRotation*Math.PI/180));
    element.figure.style.transform = 'scale('+element.scale+')';  
    Util.addClass(element.element, 'parallax-img--loaded');  
  };

  function getMaxScale(element) {
    var minWidth = 0;
    var maxWidth = 0;
    for(var i = 0; i < element.imgs.length; i++) {
      var width = element.imgs[i].getBoundingClientRect().width;
      if(width < minWidth || i == 0 ) minWidth = width;
      if(width > maxWidth || i == 0 ) maxWidth = width;
    }
    var scale = Math.ceil(10*maxWidth/minWidth)/10;
    if(scale < 1.1) scale = 1.1;
    return scale;
  }

  function initParallaxEvents(element) {
    element.element.addEventListener('mousemove', function(event){
      if(element.animating) return;
      element.animating = true;
      window.requestAnimationFrame(moveImage.bind(element, event));
    });
  };

  function moveImage(event, timestamp) {
    var wrapperPosition = this.element.getBoundingClientRect();
    var rotateY = 2*(this.maxRotation/wrapperPosition.width)*(wrapperPosition.left - event.clientX + wrapperPosition.width/2);
    var rotateX = 2*(this.maxRotation/wrapperPosition.height)*(event.clientY - wrapperPosition.top - wrapperPosition.height/2);

    if(rotateY > this.maxRotation) rotateY = this.maxRotation;
		if(rotateY < -1*this.maxRotation) rotateY = -this.maxRotation;
		if(rotateX > this.maxRotation) rotateX = this.maxRotation;
    if(rotateX < -1*this.maxRotation) rotateX = -this.maxRotation;
    this.figure.style.transform = 'scale('+this.scale+') rotateX('+rotateX+'deg) rotateY('+rotateY+'deg)';
    this.animating = false;
  };

  window.ParallaxImg = ParallaxImg;

  //initialize the ParallaxImg objects
	var parallaxImgs = document.getElementsByClassName('js-parallax-img');
	if( parallaxImgs.length > 0 && Util.cssSupports('transform', 'translateZ(0px)')) {
		for( var i = 0; i < parallaxImgs.length; i++) {
			(function(i){
        var rotationLevel = parallaxImgs[i].getAttribute('data-perspective');
        new ParallaxImg(parallaxImgs[i], rotationLevel);
      })(i);
		}
	};
}());
// File#: _1_pre-header
// Usage: codyhouse.co/license
(function() {
	var preHeader = document.getElementsByClassName('js-pre-header');
	if(preHeader.length > 0) {
		for(var i = 0; i < preHeader.length; i++) {
			(function(i){ addPreHeaderEvent(preHeader[i]);})(i);
		}

		function addPreHeaderEvent(element) {
			var close = element.getElementsByClassName('js-pre-header__close-btn')[0];
			if(close) {
				close.addEventListener('click', function(event) {
					event.preventDefault();
					Util.addClass(element, 'pre-header--is-hidden');
				});
			}
		}
	}
}());
// File#: _1_rating
// Usage: codyhouse.co/license
(function() {
	var Rating = function(element) {
		this.element = element;
		this.icons = this.element.getElementsByClassName('js-rating__control')[0];
		this.iconCode = this.icons.children[0].parentNode.innerHTML;
		this.initialRating = [];
		this.initialRatingElement = this.element.getElementsByClassName('js-rating__value')[0];
		this.ratingItems;
		this.selectedRatingItem;
    this.readOnly = Util.hasClass(this.element, 'js-rating--read-only');
		this.ratingMaxValue = 5;
		this.getInitialRating();
		this.initRatingHtml();
	};

	Rating.prototype.getInitialRating = function() {
		// get the rating of the product
		if(!this.initialRatingElement || !this.readOnly) {
			this.initialRating = [0, false];
			return;
		}

		var initialValue = Number(this.initialRatingElement.textContent);
		if(isNaN(initialValue)) {
			this.initialRating = [0, false];
			return;
		}

		var floorNumber = Math.floor(initialValue);
		this.initialRating[0] = (floorNumber < initialValue) ? floorNumber + 1 : floorNumber;
		this.initialRating[1] = (floorNumber < initialValue) ? Math.round((initialValue - floorNumber)*100) : false;
	};

	Rating.prototype.initRatingHtml = function() {
		//create the star elements
		var iconsList = this.readOnly ? '<ul>' : '<ul role="radiogroup">';
		
		//if initial rating value is zero -> add a 'zero' item 
		if(this.initialRating[0] == 0 && !this.initialRating[1]) {
			iconsList = iconsList+ '<li class="rating__item--zero rating__item--checked"></li>';
		}

		// create the stars list 
		for(var i = 0; i < this.ratingMaxValue; i++) { 
			iconsList = iconsList + this.getStarHtml(i);
		}
		iconsList = iconsList + '</ul>';

		// --default variation only - improve SR accessibility including a legend element 
		if(!this.readOnly) {
			var labelElement = this.element.getElementsByTagName('label');
			if(labelElement.length > 0) {
				var legendElement = '<legend class="'+labelElement[0].getAttribute('class')+'">'+labelElement[0].textContent+'</legend>';
				iconsList = '<fieldset>'+legendElement+iconsList+'</fieldset>';
				Util.addClass(labelElement[0], 'is-hidden');
			}
		}

		this.icons.innerHTML = iconsList;
		
		//init object properties
		this.ratingItems = this.icons.getElementsByClassName('js-rating__item');
		this.selectedRatingItem = this.icons.getElementsByClassName('rating__item--checked')[0];

		//show the stars
		Util.removeClass(this.icons, 'rating__control--is-hidden');

		//event listener
		!this.readOnly && this.initRatingEvents();// rating vote enabled
	};

	Rating.prototype.getStarHtml = function(index) {
		var listItem = '';
		var checked = (index+1 == this.initialRating[0]) ? true : false,
			itemClass = checked ? ' rating__item--checked' : '',
			tabIndex = (checked || (this.initialRating[0] == 0 && !this.initialRating[1] && index == 0) ) ? 0 : -1,
			showHalf = checked && this.initialRating[1] ? true : false,
			iconWidth = showHalf ? ' rating__item--half': '';
		if(!this.readOnly) {
			listItem = '<li class="js-rating__item'+itemClass+iconWidth+'" role="radio" aria-label="'+(index+1)+'" aria-checked="'+checked+'" tabindex="'+tabIndex+'"><div class="rating__icon">'+this.iconCode+'</div></li>';
		} else {
			var starInner = showHalf ? '<div class="rating__icon">'+this.iconCode+'</div><div class="rating__icon rating__icon--inactive">'+this.iconCode+'</div>': '<div class="rating__icon">'+this.iconCode+'</div>';
			listItem = '<li class="js-rating__item'+itemClass+iconWidth+'">'+starInner+'</li>';
		}
		return listItem;
	};

	Rating.prototype.initRatingEvents = function() {
		var self = this;

		//click on a star
		this.icons.addEventListener('click', function(event){
			var trigger = event.target.closest('.js-rating__item');
			self.resetSelectedIcon(trigger);
		});

		//keyboard navigation -> select new star
		this.icons.addEventListener('keydown', function(event){
			if( event.keyCode && (event.keyCode == 39 || event.keyCode == 40 ) || event.key && (event.key.toLowerCase() == 'arrowright' || event.key.toLowerCase() == 'arrowdown') ) {
				self.selectNewIcon('next'); //select next star on arrow right/down
			} else if(event.keyCode && (event.keyCode == 37 || event.keyCode == 38 ) || event.key && (event.key.toLowerCase() == 'arrowleft' || event.key.toLowerCase() == 'arrowup')) {
				self.selectNewIcon('prev'); //select prev star on arrow left/up
			} else if(event.keyCode && event.keyCode == 32 || event.key && event.key == ' ') {
				self.selectFocusIcon(); // select focused star on Space
			}
		});
	};

	Rating.prototype.selectNewIcon = function(direction) {
		var index = Util.getIndexInArray(this.ratingItems, this.selectedRatingItem);
		index = (direction == 'next') ? index + 1 : index - 1;
		if(index < 0) index = this.ratingItems.length - 1;
		if(index >= this.ratingItems.length) index = 0;	
		this.resetSelectedIcon(this.ratingItems[index]);
		this.ratingItems[index].focus();
	};

	Rating.prototype.selectFocusIcon = function(direction) {
		this.resetSelectedIcon(document.activeElement);
	};

	Rating.prototype.resetSelectedIcon = function(trigger) {
		if(!trigger) return;
		Util.removeClass(this.selectedRatingItem, 'rating__item--checked');
		Util.setAttributes(this.selectedRatingItem, {'aria-checked': false, 'tabindex': -1});
		Util.addClass(trigger, 'rating__item--checked');
		Util.setAttributes(trigger, {'aria-checked': true, 'tabindex': 0});
		this.selectedRatingItem = trigger; 
		// update select input value
		var select = this.element.getElementsByTagName('select');
		if(select.length > 0) {
			select[0].value = trigger.getAttribute('aria-label');
		}
	};
	
	//initialize the Rating objects
	var ratings = document.getElementsByClassName('js-rating');
	if( ratings.length > 0 ) {
		for( var i = 0; i < ratings.length; i++) {
			(function(i){new Rating(ratings[i]);})(i);
		}
	};
}());
// File#: _1_read-more
// Usage: codyhouse.co/license
(function() {
  var ReadMore = function(element) {
    this.element = element;
    this.moreContent = this.element.getElementsByClassName('js-read-more__content');
    this.count = this.element.getAttribute('data-characters') || 200;
    this.counting = 0;
    this.btnClasses = this.element.getAttribute('data-btn-class');
    this.ellipsis = this.element.getAttribute('data-ellipsis') && this.element.getAttribute('data-ellipsis') == 'off' ? false : true;
    this.btnShowLabel = 'Read more';
    this.btnHideLabel = 'Read less';
    this.toggleOff = this.element.getAttribute('data-toggle') && this.element.getAttribute('data-toggle') == 'off' ? false : true;
    if( this.moreContent.length == 0 ) splitReadMore(this);
    setBtnLabels(this);
    initReadMore(this);
  };

  function splitReadMore(readMore) { 
    splitChildren(readMore.element, readMore); // iterate through children and hide content
  };

  function splitChildren(parent, readMore) {
    if(readMore.counting >= readMore.count) {
      Util.addClass(parent, 'js-read-more__content');
      return parent.outerHTML;
    }
    var children = parent.childNodes;
    var content = '';
    for(var i = 0; i < children.length; i++) {
      if (children[i].nodeType == Node.TEXT_NODE) {
        content = content + wrapText(children[i], readMore);
      } else {
        content = content + splitChildren(children[i], readMore);
      }
    }
    parent.innerHTML = content;
    return parent.outerHTML;
  };

  function wrapText(element, readMore) {
    var content = element.textContent;
    if(content.replace(/\s/g,'').length == 0) return '';// check if content is empty
    if(readMore.counting >= readMore.count) {
      return '<span class="js-read-more__content">' + content + '</span>';
    }
    if(readMore.counting + content.length < readMore.count) {
      readMore.counting = readMore.counting + content.length;
      return content;
    }
    var firstContent = content.substr(0, readMore.count - readMore.counting);
    firstContent = firstContent.substr(0, Math.min(firstContent.length, firstContent.lastIndexOf(" ")));
    var secondContent = content.substr(firstContent.length, content.length);
    readMore.counting = readMore.count;
    return firstContent + '<span class="js-read-more__content">' + secondContent + '</span>';
  };

  function setBtnLabels(readMore) { // set custom labels for read More/Less btns
    var btnLabels = readMore.element.getAttribute('data-btn-labels');
    if(btnLabels) {
      var labelsArray = btnLabels.split(',');
      readMore.btnShowLabel = labelsArray[0].trim();
      readMore.btnHideLabel = labelsArray[1].trim();
    }
  };

  function initReadMore(readMore) { // add read more/read less buttons to the markup
    readMore.moreContent = readMore.element.getElementsByClassName('js-read-more__content');
    if( readMore.moreContent.length == 0 ) {
      Util.addClass(readMore.element, 'read-more--loaded');
      return;
    }
    var btnShow = ' <button class="js-read-more__btn '+readMore.btnClasses+'">'+readMore.btnShowLabel+'</button>';
    var btnHide = ' <button class="js-read-more__btn is-hidden '+readMore.btnClasses+'">'+readMore.btnHideLabel+'</button>';
    if(readMore.ellipsis) {
      btnShow = '<span class="js-read-more__ellipsis" aria-hidden="true">...</span>'+ btnShow;
    }

    readMore.moreContent[readMore.moreContent.length - 1].insertAdjacentHTML('afterend', btnHide);
    readMore.moreContent[0].insertAdjacentHTML('afterend', btnShow);
    resetAppearance(readMore);
    initEvents(readMore);
  };

  function resetAppearance(readMore) { // hide part of the content
    for(var i = 0; i < readMore.moreContent.length; i++) Util.addClass(readMore.moreContent[i], 'is-hidden');
    Util.addClass(readMore.element, 'read-more--loaded'); // show entire component
  };

  function initEvents(readMore) { // listen to the click on the read more/less btn
    readMore.btnToggle = readMore.element.getElementsByClassName('js-read-more__btn');
    readMore.ellipsis = readMore.element.getElementsByClassName('js-read-more__ellipsis');

    readMore.btnToggle[0].addEventListener('click', function(event){
      event.preventDefault();
      updateVisibility(readMore, true);
    });
    readMore.btnToggle[1].addEventListener('click', function(event){
      event.preventDefault();
      updateVisibility(readMore, false);
    });
  };

  function updateVisibility(readMore, visibile) {
    for(var i = 0; i < readMore.moreContent.length; i++) Util.toggleClass(readMore.moreContent[i], 'is-hidden', !visibile);
    // reset btns appearance
    Util.toggleClass(readMore.btnToggle[0], 'is-hidden', visibile);
    Util.toggleClass(readMore.btnToggle[1], 'is-hidden', !visibile);
    if(readMore.ellipsis.length > 0 ) Util.toggleClass(readMore.ellipsis[0], 'is-hidden', visibile);
    if(!readMore.toggleOff) Util.addClass(readMore.btn, 'is-hidden');
    // move focus
    if(visibile) {
      var targetTabIndex = readMore.moreContent[0].getAttribute('tabindex');
      Util.moveFocus(readMore.moreContent[0]);
      resetFocusTarget(readMore.moreContent[0], targetTabIndex);
    } else {
      Util.moveFocus(readMore.btnToggle[0]);
    }
  };

  function resetFocusTarget(target, tabindex) {
    if( parseInt(target.getAttribute('tabindex')) < 0) {
			target.style.outline = 'none';
			!tabindex && target.removeAttribute('tabindex');
		}
  };

  //initialize the ReadMore objects
	var readMore = document.getElementsByClassName('js-read-more');
	if( readMore.length > 0 ) {
		for( var i = 0; i < readMore.length; i++) {
			(function(i){new ReadMore(readMore[i]);})(i);
		}
	};
}());
// File#: _1_reveal-effects
// Usage: codyhouse.co/license
(function() {
	var fxElements = document.getElementsByClassName('reveal-fx');
	var intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
	if(fxElements.length > 0) {
		// deactivate effect if Reduced Motion is enabled
		if (Util.osHasReducedMotion() || !intersectionObserverSupported) {
			fxRemoveClasses();
			return;
		}
		//on small devices, do not animate elements -> reveal all
		if( fxDisabled(fxElements[0]) ) {
			fxRevealAll();
			return;
		}

		var fxRevealDelta = 120; // amount (in pixel) the element needs to enter the viewport to be revealed - if not custom value (data-reveal-fx-delta)
		
		var viewportHeight = window.innerHeight,
			fxChecking = false,
			fxRevealedItems = [],
			fxElementDelays = fxGetDelays(), //elements animation delay
			fxElementDeltas = fxGetDeltas(); // amount (in px) the element needs enter the viewport to be revealed (default value is fxRevealDelta) 
		
		
		// add event listeners
		window.addEventListener('load', fxReveal);
		window.addEventListener('resize', fxResize);
		window.addEventListener('restartAll', fxRestart);

		// observe reveal elements
		var observer = [];
		initObserver();

		function initObserver() {
			for(var i = 0; i < fxElements.length; i++) {
				observer[i] = new IntersectionObserver(
					function(entries, observer) { 
						if(entries[0].isIntersecting) {
							fxRevealItemObserver(entries[0].target);
							observer.unobserve(entries[0].target);
						}
					}, 
					{rootMargin: "0px 0px -"+fxElementDeltas[i]+"px 0px"}
				);
	
				observer[i].observe(fxElements[i]);
			}
		};

		function fxRevealAll() { // reveal all elements - small devices
			for(var i = 0; i < fxElements.length; i++) {
				Util.addClass(fxElements[i], 'reveal-fx--is-visible');
			}
		};

		function fxResize() { // on resize - check new window height and reveal visible elements
			if(fxChecking) return;
			fxChecking = true;
			(!window.requestAnimationFrame) ? setTimeout(function(){fxReset();}, 250) : window.requestAnimationFrame(fxReset);
		};

		function fxReset() {
			viewportHeight = window.innerHeight;
			fxReveal();
		};

		function fxReveal() { // reveal visible elements
			for(var i = 0; i < fxElements.length; i++) {(function(i){
				if(fxRevealedItems.indexOf(i) != -1 ) return; //element has already been revelead
				if(fxElementIsVisible(fxElements[i], i)) {
					fxRevealItem(i);
					fxRevealedItems.push(i);
				}})(i); 
			}
			fxResetEvents(); 
			fxChecking = false;
		};

		function fxRevealItem(index) {
			if(fxElementDelays[index] && fxElementDelays[index] != 0) {
				// wait before revealing element if a delay was added
				setTimeout(function(){
					Util.addClass(fxElements[index], 'reveal-fx--is-visible');
				}, fxElementDelays[index]);
			} else {
				Util.addClass(fxElements[index], 'reveal-fx--is-visible');
			}
		};

		function fxRevealItemObserver(item) {
			var index = Util.getIndexInArray(fxElements, item);
			if(fxRevealedItems.indexOf(index) != -1 ) return; //element has already been revelead
			fxRevealItem(index);
			fxRevealedItems.push(index);
			fxResetEvents(); 
			fxChecking = false;
		};

		function fxGetDelays() { // get anmation delays
			var delays = [];
			for(var i = 0; i < fxElements.length; i++) {
				delays.push( fxElements[i].getAttribute('data-reveal-fx-delay') ? parseInt(fxElements[i].getAttribute('data-reveal-fx-delay')) : 0);
			}
			return delays;
		};

		function fxGetDeltas() { // get reveal delta
			var deltas = [];
			for(var i = 0; i < fxElements.length; i++) {
				deltas.push( fxElements[i].getAttribute('data-reveal-fx-delta') ? parseInt(fxElements[i].getAttribute('data-reveal-fx-delta')) : fxRevealDelta);
			}
			return deltas;
		};

		function fxDisabled(element) { // check if elements need to be animated - no animation on small devices
			return !(window.getComputedStyle(element, '::before').getPropertyValue('content').replace(/'|"/g, "") == 'reveal-fx');
		};

		function fxElementIsVisible(element, i) { // element is inside viewport
			return (fxGetElementPosition(element) <= viewportHeight - fxElementDeltas[i]);
		};

		function fxGetElementPosition(element) { // get top position of element
			return element.getBoundingClientRect().top;
		};

		function fxResetEvents() { 
			if(fxElements.length > fxRevealedItems.length) return;
			// remove event listeners if all elements have been revealed
			window.removeEventListener('load', fxReveal);
			window.removeEventListener('resize', fxResize);
		};

		function fxRemoveClasses() {
			// Reduced Motion on or Intersection Observer not supported
			while(fxElements[0]) {
				// remove all classes starting with 'reveal-fx--'
				var classes = fxElements[0].getAttribute('class').split(" ").filter(function(c) {
					return c.lastIndexOf('reveal-fx--', 0) !== 0;
				});
				fxElements[0].setAttribute('class', classes.join(" ").trim());
				Util.removeClass(fxElements[0], 'reveal-fx');
			}
		};

		function fxRestart() {
      // restart the reveal effect -> hide all elements and re-init the observer
      if (Util.osHasReducedMotion() || !intersectionObserverSupported || fxDisabled(fxElements[0])) {
        return;
      }
      // check if we need to add the event listensers back
      if(fxElements.length <= fxRevealedItems.length) {
        window.addEventListener('load', fxReveal);
        window.addEventListener('resize', fxResize);
      }
      // remove observer and reset the observer array
      for(var i = 0; i < observer.length; i++) {
        if(observer[i]) observer[i].disconnect();
      }
      observer = [];
      // remove visible class
      for(var i = 0; i < fxElements.length; i++) {
        Util.removeClass(fxElements[i], 'reveal-fx--is-visible');
      }
      // reset fxRevealedItems array
      fxRevealedItems = [];
      // restart observer
      initObserver();
    };
	}
}());
// File#: _1_revealing-section
// Usage: codyhouse.co/license
(function() {
  var RevealingSection = function(element) {
    this.element = element;
    this.scrollingFn = false;
    this.scrolling = false;
    this.resetOpacity = false;
    initRevealingSection(this);
  };

  function initRevealingSection(element) {
    // set position of sticky element
    setBottom(element);
    // create a new node - to be inserted before the sticky element
    createPrevElement(element);
    // on resize -> reset element bottom position
    element.element.addEventListener('update-reveal-section', function(){
      setBottom(element);
      setPrevElementTop(element);
    });
    animateRevealingSection.bind(element)(); // set initial status
    // change opacity of layer
    var observer = new IntersectionObserver(revealingSectionCallback.bind(element));
		observer.observe(element.prevElement);
  };

  function createPrevElement(element) {
    var newElement = document.createElement("div"); 
    newElement.setAttribute('aria-hidden', 'true');
    element.element.parentElement.insertBefore(newElement, element.element);
    element.prevElement =  element.element.previousElementSibling;
    element.prevElement.style.opacity = '0';
    setPrevElementTop(element);
  };

  function setPrevElementTop(element) {
    element.prevElementTop = element.prevElement.getBoundingClientRect().top + window.scrollY;
  };

  function revealingSectionCallback(entries, observer) {
		if(entries[0].isIntersecting) {
      if(this.scrollingFn) return; // listener for scroll event already added
      revealingSectionInitEvent(this);
    } else {
      if(!this.scrollingFn) return; // listener for scroll event already removed
      window.removeEventListener('scroll', this.scrollingFn);
      updateOpacityValue(this, 0);
      this.scrollingFn = false;
    }
  };
  
  function revealingSectionInitEvent(element) {
    element.scrollingFn = revealingSectionScrolling.bind(element);
    window.addEventListener('scroll', element.scrollingFn);
  };

  function revealingSectionScrolling() {
    if(this.scrolling) return;
    this.scrolling = true;
    window.requestAnimationFrame(animateRevealingSection.bind(this));
  };

  function animateRevealingSection() {
    if(this.prevElementTop - window.scrollY < window.innerHeight) {
      var opacity = (1 - (window.innerHeight + window.scrollY - this.prevElementTop)/window.innerHeight).toFixed(2);
      if(opacity > 0 ) {
        this.resetOpacity = false;
        updateOpacityValue(this, opacity);
      } else if(!this.resetOpacity) {
        this.resetOpacity = true;
        updateOpacityValue(this, 0);
      } 
    }
    this.scrolling = false;
  };

  function updateOpacityValue(element, value) {
    element.element.style.setProperty('--reavealing-section-overlay-opacity', value);
  };

  function setBottom(element) {
    var translateValue = window.innerHeight - element.element.offsetHeight;
    if(translateValue > 0) translateValue = 0;
    element.element.style.bottom = ''+translateValue+'px';
  };

  //initialize the Revealing Section objects
  var revealingSection = document.getElementsByClassName('js-revealing-section');
  var stickySupported = Util.cssSupports('position', 'sticky') || Util.cssSupports('position', '-webkit-sticky');
	if( revealingSection.length > 0 && stickySupported) {
    var revealingSectionArray = [];
		for( var i = 0; i < revealingSection.length; i++) {
      (function(i){revealingSectionArray.push(new RevealingSection(revealingSection[i]));})(i);
    }
    
    var resizingId = false,
      customEvent = new CustomEvent('update-reveal-section');

    window.addEventListener('resize', function() {
      clearTimeout(resizingId);
      resizingId = setTimeout(doneResizing, 100);
    });

    // wait for font to be loaded
    if(document.fonts) {
      document.fonts.onloadingdone = function (fontFaceSetEvent) {
        doneResizing();
      };
    }

    function doneResizing() {
      for( var i = 0; i < revealingSectionArray.length; i++) {
        (function(i){revealingSectionArray[i].element.dispatchEvent(customEvent)})(i);
      };
    };
	}
}());
// File#: _1_side-navigation-v2
// Usage: codyhouse.co/license
(function() {
  var SideNav2 = function(element) {
    this.element = element;
    this.controller = this.element.getElementsByClassName('js-sidenav-v2__control');
    this.staticLayoutClass = 'sidenav-v2--static';
    this.expandedClass = 'sidenav-v2--expanded';
    this.isStatic = Util.hasClass(this.element, this.staticLayoutClass);
    this.layout = 'static';
    this.customStatic = this.element.getAttribute('data-static-class');
    this.sideNavItems = this.element.getElementsByClassName('js-sidenav-v2__link');
    initSideNav2(this);
  };

  function initSideNav2(element) {
    checkNavLayour(element);

    // custom event emitted when window is resized
    element.element.addEventListener('update-side-nav-v2', function(event){
      checkNavLayour(element);
    });

    // collapsed version only (mobile)
    initCollapsedVersion(element);
  };

  function initCollapsedVersion(element) { // collapsed version only (mobile)
    if(element.controller.length < 1) return;
    
    // toggle nav visibility
    element.controller[0].addEventListener('click', function(event){
      var isOpen = Util.hasClass(element.element, element.expandedClass);
      toggleSideNav(element, isOpen);
    });

    // close expanded version on esc
    element.element.addEventListener('keydown', function(event){
      if(element.layout == 'static') return;
      if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape') ) {
        toggleSideNav(element, true);
        element.controller[0].focus();
      }
    });
  };

  function toggleSideNav(element, bool) {
    Util.toggleClass(element.element, element.expandedClass, !bool);
    bool ? element.controller[0].removeAttribute('aria-expanded') : element.controller[0].setAttribute('aria-expanded', 'true');
    if(!bool && element.sideNavItems.length > 0) {
      element.sideNavItems[0].focus();
    }
  };

  function checkNavLayour(element) {
    if(element.isStatic) return;
    element.layout = getComputedStyle(element.element, ':before').getPropertyValue('content').replace(/\'|"/g, '');
    Util.toggleClass(element.element, element.staticLayoutClass, element.layout == 'static');
    if(element.customStatic) Util.toggleClass(element.element, element.customStatic, element.layout == 'static');
  };

  //initialize the SideNav2 objects
	var sideNav = document.getElementsByClassName('js-sidenav-v2');
	if( sideNav.length > 0 ) {
    var sideNavArray = [];
		for( var i = 0; i < sideNav.length; i++) {
      (function(i){sideNavArray.push(new SideNav2(sideNav[i]));})(i);
    }

    var resizingId = false,
      customEvent = new CustomEvent('update-side-nav-v2');
    window.addEventListener('resize', function(event){
      clearTimeout(resizingId);
      resizingId = setTimeout(doneResizing, 300);
    });

    function doneResizing() {
      for( var i = 0; i < sideNavArray.length; i++) {
        (function(i){sideNavArray[i].element.dispatchEvent(customEvent)})(i);
      };
    };

    (window.requestAnimationFrame) // init side nav layout
      ? window.requestAnimationFrame(doneResizing)
      : doneResizing();
	}
}());
// File#: _1_skip-link
// Usage: codyhouse.co/license
(function() {
  function initSkipLinkEvents(skipLink) {
    // toggle class skip-link--focus if link is in focus/loses focus
    skipLink.addEventListener('focusin', function(){
      Util.addClass(skipLink, 'skip-link--focus');
    });
    skipLink.addEventListener('focusout', function(){
      Util.removeClass(skipLink, 'skip-link--focus');
    });
  };

  var skipLinks = document.getElementsByClassName('skip-link');
	if( skipLinks.length > 0 ) {
		for( var i = 0; i < skipLinks.length; i++) {
			initSkipLinkEvents(skipLinks[i]);
		}
  }
}());
// File#: _1_smooth-scrolling
// Usage: codyhouse.co/license
(function() {
	var SmoothScroll = function(element) {
		if(!('CSS' in window) || !CSS.supports('color', 'var(--color-var)')) return;
		this.element = element;
		this.scrollDuration = parseInt(this.element.getAttribute('data-duration')) || 300;
		this.dataElementY = this.element.getAttribute('data-scrollable-element-y') || this.element.getAttribute('data-scrollable-element') || this.element.getAttribute('data-element');
		this.scrollElementY = this.dataElementY ? document.querySelector(this.dataElementY) : window;
		this.dataElementX = this.element.getAttribute('data-scrollable-element-x');
		this.scrollElementX = this.dataElementY ? document.querySelector(this.dataElementX) : window;
		this.initScroll();
	};

	SmoothScroll.prototype.initScroll = function() {
		var self = this;

		//detect click on link
		this.element.addEventListener('click', function(event){
			event.preventDefault();
			var targetId = event.target.closest('.js-smooth-scroll').getAttribute('href').replace('#', ''),
				target = document.getElementById(targetId),
				targetTabIndex = target.getAttribute('tabindex'),
				windowScrollTop = self.scrollElementY.scrollTop || document.documentElement.scrollTop;

			// scroll vertically
			if(!self.dataElementY) windowScrollTop = window.scrollY || document.documentElement.scrollTop;

			var scrollElementY = self.dataElementY ? self.scrollElementY : false;

			var fixedHeight = self.getFixedElementHeight(); // check if there's a fixed element on the page
			Util.scrollTo(target.getBoundingClientRect().top + windowScrollTop - fixedHeight, self.scrollDuration, function() {
				// scroll horizontally
				self.scrollHorizontally(target, fixedHeight);
				//move the focus to the target element - don't break keyboard navigation
				Util.moveFocus(target);
				history.pushState(false, false, '#'+targetId);
				self.resetTarget(target, targetTabIndex);
			}, scrollElementY);
		});
	};

	SmoothScroll.prototype.scrollHorizontally = function(target, delta) {
    var scrollEl = this.dataElementX ? this.scrollElementX : false;
    var windowScrollLeft = this.scrollElementX ? this.scrollElementX.scrollLeft : document.documentElement.scrollLeft;
    var final = target.getBoundingClientRect().left + windowScrollLeft - delta,
      duration = this.scrollDuration;

    var element = scrollEl || window;
    var start = element.scrollLeft || document.documentElement.scrollLeft,
      currentTime = null;

    if(!scrollEl) start = window.scrollX || document.documentElement.scrollLeft;
		// return if there's no need to scroll
    if(Math.abs(start - final) < 5) return;
        
    var animateScroll = function(timestamp){
      if (!currentTime) currentTime = timestamp;        
      var progress = timestamp - currentTime;
      if(progress > duration) progress = duration;
      var val = Math.easeInOutQuad(progress, start, final-start, duration);
      element.scrollTo({
				left: val,
			});
      if(progress < duration) {
        window.requestAnimationFrame(animateScroll);
      }
    };

    window.requestAnimationFrame(animateScroll);
  };

	SmoothScroll.prototype.resetTarget = function(target, tabindex) {
		if( parseInt(target.getAttribute('tabindex')) < 0) {
			target.style.outline = 'none';
			!tabindex && target.removeAttribute('tabindex');
		}	
	};

	SmoothScroll.prototype.getFixedElementHeight = function() {
		var scrollElementY = this.dataElementY ? this.scrollElementY : document.documentElement;
    var fixedElementDelta = parseInt(getComputedStyle(scrollElementY).getPropertyValue('scroll-padding'));
		if(isNaN(fixedElementDelta) ) { // scroll-padding not supported
			fixedElementDelta = 0;
			var fixedElement = document.querySelector(this.element.getAttribute('data-fixed-element'));
			if(fixedElement) fixedElementDelta = parseInt(fixedElement.getBoundingClientRect().height);
		}
		return fixedElementDelta;
	};
	
	//initialize the Smooth Scroll objects
	var smoothScrollLinks = document.getElementsByClassName('js-smooth-scroll');
	if( smoothScrollLinks.length > 0 && !Util.cssSupports('scroll-behavior', 'smooth') && window.requestAnimationFrame) {
		// you need javascript only if css scroll-behavior is not supported
		for( var i = 0; i < smoothScrollLinks.length; i++) {
			(function(i){new SmoothScroll(smoothScrollLinks[i]);})(i);
		}
	}
}());
// File#: _1_social-sharing
// Usage: codyhouse.co/license
(function() {
  function initSocialShare(button) {
    button.addEventListener('click', function(event){
      event.preventDefault();
      var social = button.getAttribute('data-social');
      var url = getSocialUrl(button, social);
      (social == 'mail')
        ? window.location.href = url
        : window.open(url, social+'-share-dialog', 'width=626,height=436');
    });
  };

  function getSocialUrl(button, social) {
    var params = getSocialParams(social);
    var newUrl = '';
    for(var i = 0; i < params.length; i++) {
      var paramValue = button.getAttribute('data-'+params[i]);
      if(params[i] == 'hashtags') paramValue = encodeURI(paramValue.replace(/\#| /g, ''));
      if(paramValue) {
        (social == 'facebook') 
          ? newUrl = newUrl + 'u='+encodeURIComponent(paramValue)+'&'
          : newUrl = newUrl + params[i]+'='+encodeURIComponent(paramValue)+'&';
      }
    }
    if(social == 'linkedin') newUrl = 'mini=true&'+newUrl;
    return button.getAttribute('href')+'?'+newUrl;
  };

  function getSocialParams(social) {
    var params = [];
    switch (social) {
      case 'twitter':
        params = ['text', 'hashtags'];
        break;
      case 'facebook':
      case 'linkedin':
        params = ['url'];
        break;
      case 'pinterest':
        params = ['url', 'media', 'description'];
        break;
      case 'mail':
        params = ['subject', 'body'];
        break;
    }
    return params;
  };

  var socialShare = document.getElementsByClassName('js-social-share');
  if(socialShare.length > 0) {
    for( var i = 0; i < socialShare.length; i++) {
      (function(i){initSocialShare(socialShare[i])})(i);
    }
  }
}());
// File#: _1_sticky-hero
// Usage: codyhouse.co/license
(function() {
	var StickyBackground = function(element) {
		this.element = element;
		this.scrollingElement = this.element.getElementsByClassName('sticky-hero__content')[0];
		this.nextElement = this.element.nextElementSibling;
		this.scrollingTreshold = 0;
		this.nextTreshold = 0;
		initStickyEffect(this);
	};

	function initStickyEffect(element) {
		var observer = new IntersectionObserver(stickyCallback.bind(element), { threshold: [0, 0.1, 1] });
		observer.observe(element.scrollingElement);
		if(element.nextElement) observer.observe(element.nextElement);
	};

	function stickyCallback(entries, observer) {
		var threshold = entries[0].intersectionRatio.toFixed(1);
		(entries[0].target ==  this.scrollingElement)
			? this.scrollingTreshold = threshold
			: this.nextTreshold = threshold;

		Util.toggleClass(this.element, 'sticky-hero--media-is-fixed', (this.nextTreshold > 0 || this.scrollingTreshold > 0));
	};


	var stickyBackground = document.getElementsByClassName('js-sticky-hero'),
		intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
	if(stickyBackground.length > 0 && intersectionObserverSupported) { // if IntersectionObserver is not supported, animations won't be triggeres
		for(var i = 0; i < stickyBackground.length; i++) {
			(function(i){ // if animations are enabled -> init the StickyBackground object
        if( Util.hasClass(stickyBackground[i], 'sticky-hero--overlay-layer') || Util.hasClass(stickyBackground[i], 'sticky-hero--scale')) new StickyBackground(stickyBackground[i]);
      })(i);
		}
	}
}());
// File#: _1_swipe-content
(function() {
	var SwipeContent = function(element) {
		this.element = element;
		this.delta = [false, false];
		this.dragging = false;
		this.intervalId = false;
		initSwipeContent(this);
	};

	function initSwipeContent(content) {
		content.element.addEventListener('mousedown', handleEvent.bind(content));
		content.element.addEventListener('touchstart', handleEvent.bind(content));
	};

	function initDragging(content) {
		//add event listeners
		content.element.addEventListener('mousemove', handleEvent.bind(content));
		content.element.addEventListener('touchmove', handleEvent.bind(content));
		content.element.addEventListener('mouseup', handleEvent.bind(content));
		content.element.addEventListener('mouseleave', handleEvent.bind(content));
		content.element.addEventListener('touchend', handleEvent.bind(content));
	};

	function cancelDragging(content) {
		//remove event listeners
		if(content.intervalId) {
			(!window.requestAnimationFrame) ? clearInterval(content.intervalId) : window.cancelAnimationFrame(content.intervalId);
			content.intervalId = false;
		}
		content.element.removeEventListener('mousemove', handleEvent.bind(content));
		content.element.removeEventListener('touchmove', handleEvent.bind(content));
		content.element.removeEventListener('mouseup', handleEvent.bind(content));
		content.element.removeEventListener('mouseleave', handleEvent.bind(content));
		content.element.removeEventListener('touchend', handleEvent.bind(content));
	};

	function handleEvent(event) {
		switch(event.type) {
			case 'mousedown':
			case 'touchstart':
				startDrag(this, event);
				break;
			case 'mousemove':
			case 'touchmove':
				drag(this, event);
				break;
			case 'mouseup':
			case 'mouseleave':
			case 'touchend':
				endDrag(this, event);
				break;
		}
	};

	function startDrag(content, event) {
		content.dragging = true;
		// listen to drag movements
		initDragging(content);
		content.delta = [parseInt(unify(event).clientX), parseInt(unify(event).clientY)];
		// emit drag start event
		emitSwipeEvents(content, 'dragStart', content.delta, event.target);
	};

	function endDrag(content, event) {
		cancelDragging(content);
		// credits: https://css-tricks.com/simple-swipe-with-vanilla-javascript/
		var dx = parseInt(unify(event).clientX), 
	    dy = parseInt(unify(event).clientY);
	  
	  // check if there was a left/right swipe
		if(content.delta && (content.delta[0] || content.delta[0] === 0)) {
	    var s = getSign(dx - content.delta[0]);
			
			if(Math.abs(dx - content.delta[0]) > 30) {
				(s < 0) ? emitSwipeEvents(content, 'swipeLeft', [dx, dy]) : emitSwipeEvents(content, 'swipeRight', [dx, dy]);	
			}
	    
	    content.delta[0] = false;
	  }
		// check if there was a top/bottom swipe
	  if(content.delta && (content.delta[1] || content.delta[1] === 0)) {
	  	var y = getSign(dy - content.delta[1]);

	  	if(Math.abs(dy - content.delta[1]) > 30) {
	    	(y < 0) ? emitSwipeEvents(content, 'swipeUp', [dx, dy]) : emitSwipeEvents(content, 'swipeDown', [dx, dy]);
	    }

	    content.delta[1] = false;
	  }
		// emit drag end event
	  emitSwipeEvents(content, 'dragEnd', [dx, dy]);
	  content.dragging = false;
	};

	function drag(content, event) {
		if(!content.dragging) return;
		// emit dragging event with coordinates
		(!window.requestAnimationFrame) 
			? content.intervalId = setTimeout(function(){emitDrag.bind(content, event);}, 250) 
			: content.intervalId = window.requestAnimationFrame(emitDrag.bind(content, event));
	};

	function emitDrag(event) {
		emitSwipeEvents(this, 'dragging', [parseInt(unify(event).clientX), parseInt(unify(event).clientY)]);
	};

	function unify(event) { 
		// unify mouse and touch events
		return event.changedTouches ? event.changedTouches[0] : event; 
	};

	function emitSwipeEvents(content, eventName, detail, el) {
		var trigger = false;
		if(el) trigger = el;
		// emit event with coordinates
		var event = new CustomEvent(eventName, {detail: {x: detail[0], y: detail[1], origin: trigger}});
		content.element.dispatchEvent(event);
	};

	function getSign(x) {
		if(!Math.sign) {
			return ((x > 0) - (x < 0)) || +x;
		} else {
			return Math.sign(x);
		}
	};

	window.SwipeContent = SwipeContent;
	
	//initialize the SwipeContent objects
	var swipe = document.getElementsByClassName('js-swipe-content');
	if( swipe.length > 0 ) {
		for( var i = 0; i < swipe.length; i++) {
			(function(i){new SwipeContent(swipe[i]);})(i);
		}
	}
}());
// File#: _1_switch-icon
// Usage: codyhouse.co/license
(function() {
	var switchIcons = document.getElementsByClassName('js-switch-icon');
	if( switchIcons.length > 0 ) {
		for(var i = 0; i < switchIcons.length; i++) {(function(i){
			if( !Util.hasClass(switchIcons[i], 'switch-icon--hover') ) initswitchIcons(switchIcons[i]);
		})(i);}

		function initswitchIcons(btn) {
			btn.addEventListener('click', function(event){	
				event.preventDefault();
				var status = !Util.hasClass(btn, 'switch-icon--state-b');
				Util.toggleClass(btn, 'switch-icon--state-b', status);
				// emit custom event
				var event = new CustomEvent('switch-icon-clicked', {detail: status});
				btn.dispatchEvent(event);
			});
		};
	}
}());
// File#: _1_tabs
// Usage: codyhouse.co/license
(function() {
	var Tab = function(element) {
		this.element = element;
		this.tabList = this.element.getElementsByClassName('js-tabs__controls')[0];
		this.listItems = this.tabList.getElementsByTagName('li');
		this.triggers = this.tabList.getElementsByTagName('a');
		this.panelsList = this.element.getElementsByClassName('js-tabs__panels')[0];
		this.panels = Util.getChildrenByClassName(this.panelsList, 'js-tabs__panel');
		this.hideClass = 'is-hidden';
		this.customShowClass = this.element.getAttribute('data-show-panel-class') ? this.element.getAttribute('data-show-panel-class') : false;
		this.layout = this.element.getAttribute('data-tabs-layout') ? this.element.getAttribute('data-tabs-layout') : 'horizontal';
		// deep linking options
		this.deepLinkOn = this.element.getAttribute('data-deep-link') == 'on';
		// init tabs
		this.initTab();
	};

	Tab.prototype.initTab = function() {
		//set initial aria attributes
		this.tabList.setAttribute('role', 'tablist');
		for( var i = 0; i < this.triggers.length; i++) {
			var bool = (i == 0),
				panelId = this.panels[i].getAttribute('id');
			this.listItems[i].setAttribute('role', 'presentation');
			Util.setAttributes(this.triggers[i], {'role': 'tab', 'aria-selected': bool, 'aria-controls': panelId, 'id': 'tab-'+panelId});
			Util.addClass(this.triggers[i], 'js-tabs__trigger'); 
			Util.setAttributes(this.panels[i], {'role': 'tabpanel', 'aria-labelledby': 'tab-'+panelId});
			Util.toggleClass(this.panels[i], this.hideClass, !bool);

			if(!bool) this.triggers[i].setAttribute('tabindex', '-1'); 
		}

		//listen for Tab events
		this.initTabEvents();

		// check deep linking option
		this.initDeepLink();
	};

	Tab.prototype.initTabEvents = function() {
		var self = this;
		//click on a new tab -> select content
		this.tabList.addEventListener('click', function(event) {
			if( event.target.closest('.js-tabs__trigger') ) self.triggerTab(event.target.closest('.js-tabs__trigger'), event);
		});
		//arrow keys to navigate through tabs 
		this.tabList.addEventListener('keydown', function(event) {
			;
			if( !event.target.closest('.js-tabs__trigger') ) return;
			if( tabNavigateNext(event, self.layout) ) {
				event.preventDefault();
				self.selectNewTab('next');
			} else if( tabNavigatePrev(event, self.layout) ) {
				event.preventDefault();
				self.selectNewTab('prev');
			}
		});
	};

	Tab.prototype.selectNewTab = function(direction) {
		var selectedTab = this.tabList.querySelector('[aria-selected="true"]'),
			index = Util.getIndexInArray(this.triggers, selectedTab);
		index = (direction == 'next') ? index + 1 : index - 1;
		//make sure index is in the correct interval 
		//-> from last element go to first using the right arrow, from first element go to last using the left arrow
		if(index < 0) index = this.listItems.length - 1;
		if(index >= this.listItems.length) index = 0;	
		this.triggerTab(this.triggers[index]);
		this.triggers[index].focus();
	};

	Tab.prototype.triggerTab = function(tabTrigger, event) {
		var self = this;
		event && event.preventDefault();	
		var index = Util.getIndexInArray(this.triggers, tabTrigger);
		//no need to do anything if tab was already selected
		if(this.triggers[index].getAttribute('aria-selected') == 'true') return;
		
		for( var i = 0; i < this.triggers.length; i++) {
			var bool = (i == index);
			Util.toggleClass(this.panels[i], this.hideClass, !bool);
			if(this.customShowClass) Util.toggleClass(this.panels[i], this.customShowClass, bool);
			this.triggers[i].setAttribute('aria-selected', bool);
			bool ? this.triggers[i].setAttribute('tabindex', '0') : this.triggers[i].setAttribute('tabindex', '-1');
		}

		// update url if deepLink is on
		if(this.deepLinkOn) {
			history.replaceState(null, '', '#'+tabTrigger.getAttribute('aria-controls'));
		}
	};

	Tab.prototype.initDeepLink = function() {
		if(!this.deepLinkOn) return;
		var hash = window.location.hash.substr(1);
		var self = this;
		if(!hash || hash == '') return;
		for(var i = 0; i < this.panels.length; i++) {
			if(this.panels[i].getAttribute('id') == hash) {
				this.triggerTab(this.triggers[i], false);
				setTimeout(function(){self.panels[i].scrollIntoView(true);});
				break;
			}
		};
	};

	function tabNavigateNext(event, layout) {
		if(layout == 'horizontal' && (event.keyCode && event.keyCode == 39 || event.key && event.key == 'ArrowRight')) {return true;}
		else if(layout == 'vertical' && (event.keyCode && event.keyCode == 40 || event.key && event.key == 'ArrowDown')) {return true;}
		else {return false;}
	};

	function tabNavigatePrev(event, layout) {
		if(layout == 'horizontal' && (event.keyCode && event.keyCode == 37 || event.key && event.key == 'ArrowLeft')) {return true;}
		else if(layout == 'vertical' && (event.keyCode && event.keyCode == 38 || event.key && event.key == 'ArrowUp')) {return true;}
		else {return false;}
	};
	
	//initialize the Tab objects
	var tabs = document.getElementsByClassName('js-tabs');
	if( tabs.length > 0 ) {
		for( var i = 0; i < tabs.length; i++) {
			(function(i){new Tab(tabs[i]);})(i);
		}
	}
}());
// File#: _1_tilted-img-slideshow
// Usage: codyhouse.co/license
(function() {
  var TiltedSlideshow = function(element) {
    this.element = element;
    this.list = this.element.getElementsByClassName('js-tilted-slideshow__list')[0];
    this.images = this.list.getElementsByClassName('js-tilted-slideshow__item');
    this.selectedIndex = 0;
    this.animating = false;
    // classes
    this.orderClasses = ['tilted-slideshow__item--top', 'tilted-slideshow__item--middle', 'tilted-slideshow__item--bottom'];
    this.moveClasses = ['tilted-slideshow__item--move-out', 'tilted-slideshow__item--move-in'];
    this.interactedClass = 'tilted-slideshow--interacted';
    initTiltedSlideshow(this);
  };

  function initTiltedSlideshow(slideshow) {
    if(!animateImgs) removeTransitions(slideshow);
    
    slideshow.list.addEventListener('click', function(event) {
      Util.addClass(slideshow.element, slideshow.interactedClass);
      animateImgs ? animateImages(slideshow) : switchImages(slideshow);
    });
  };

  function removeTransitions(slideshow) {
    // if reduced motion is on or css variables are not supported -> do not animate images
    for(var i = 0; i < slideshow.images.length; i++) {
      slideshow.images[i].style.transition = 'none';
    }
  };

  function switchImages(slideshow) {
    // if reduced motion is on or css variables are not supported -> switch images without animation
    resetOrderClasses(slideshow);
    resetSelectedIndex(slideshow);
  };

  function resetSelectedIndex(slideshow) {
    // update the index of the top image
    slideshow.selectedIndex = resetIndex(slideshow, slideshow.selectedIndex + 1);
  };

  function resetIndex(slideshow, index) {
    // make sure index is < 3
    if(index >= slideshow.images.length) index = index - slideshow.images.length;
    return index;
  };

  function resetOrderClasses(slideshow) {
    // update the orderClasses for each images
    if(!animateImgs) {
      // top image -> remove top class and add bottom class
      Util.addClass(slideshow.images[slideshow.selectedIndex], slideshow.orderClasses[2]);
      Util.removeClass(slideshow.images[slideshow.selectedIndex], slideshow.orderClasses[0]);
    }

    // middle image -> remove middle class and add top class
    var middleImage = slideshow.images[resetIndex(slideshow, slideshow.selectedIndex + 1)];
    Util.addClass(middleImage, slideshow.orderClasses[0]);
    Util.removeClass(middleImage, slideshow.orderClasses[1]);

    // bottom image -> remove bottom class and add middle class
    var bottomImage = slideshow.images[resetIndex(slideshow, slideshow.selectedIndex + 2)];
    Util.addClass(bottomImage, slideshow.orderClasses[1]);
    Util.removeClass(bottomImage, slideshow.orderClasses[2]);
  };

  function animateImages(slideshow) {
    if(slideshow.animating) return;
    slideshow.animating = true;

    // reset order classes for middle/bottom images
    resetOrderClasses(slideshow);
    
    // animate top image
    var topImage = slideshow.images[slideshow.selectedIndex];
    // remove top class and add move out class
    Util.removeClass(topImage, slideshow.orderClasses[0]);
    Util.addClass(topImage, slideshow.moveClasses[0]);
    
    topImage.addEventListener('transitionend', function cb(event) {
      // remove transition
			topImage.style.transition = 'none';
			topImage.removeEventListener("transitionend", cb);
      
      setTimeout(function(){
        // add bottom + move-in class, remove move-out class
        Util.removeClass(topImage, slideshow.moveClasses[0]);
        Util.addClass(topImage, slideshow.moveClasses[1]+' '+ slideshow.orderClasses[2]);
        setTimeout(function(){
          topImage.style.transition = '';
          // remove move-in class
          Util.removeClass(topImage, slideshow.moveClasses[1]);
          topImage.addEventListener('transitionend', function cbn(event) {
            // reset animating property and selectedIndex index
            resetSelectedIndex(slideshow);
            slideshow.animating = false;
            topImage.removeEventListener("transitionend", cbn);
          });
        }, 10);
      }, 10);
		});
  };

  var tiltedSlideshow = document.getElementsByClassName('js-tilted-slideshow'),
    animateImgs = !Util.osHasReducedMotion() && ('CSS' in window) && CSS.supports('color', 'var(--color-var)');
  if(tiltedSlideshow.length > 0) {
    for(var i = 0; i < tiltedSlideshow.length; i++) {
      new TiltedSlideshow(tiltedSlideshow[i]);
    }
  }
}());
// File#: _1_tooltip
// Usage: codyhouse.co/license
(function() {
	var Tooltip = function(element) {
		this.element = element;
		this.tooltip = false;
		this.tooltipIntervalId = false;
		this.tooltipContent = this.element.getAttribute('title');
		this.tooltipPosition = (this.element.getAttribute('data-tooltip-position')) ? this.element.getAttribute('data-tooltip-position') : 'top';
		this.tooltipClasses = (this.element.getAttribute('data-tooltip-class')) ? this.element.getAttribute('data-tooltip-class') : false;
		this.tooltipId = 'js-tooltip-element'; // id of the tooltip element -> trigger will have the same aria-describedby attr
		// there are cases where you only need the aria-label -> SR do not need to read the tooltip content (e.g., footnotes)
		this.tooltipDescription = (this.element.getAttribute('data-tooltip-describedby') && this.element.getAttribute('data-tooltip-describedby') == 'false') ? false : true; 

		this.tooltipDelay = 300; // show tooltip after a delay (in ms)
		this.tooltipDelta = 10; // distance beetwen tooltip and trigger element (in px)
		this.tooltipTriggerHover = false;
		// tooltp sticky option
		this.tooltipSticky = (this.tooltipClasses && this.tooltipClasses.indexOf('tooltip--sticky') > -1);
		this.tooltipHover = false;
		if(this.tooltipSticky) {
			this.tooltipHoverInterval = false;
		}
		resetTooltipContent(this);
		initTooltip(this);
	};

	function resetTooltipContent(tooltip) {
		var htmlContent = tooltip.element.getAttribute('data-tooltip-title');
		if(htmlContent) {
			tooltip.tooltipContent = htmlContent;
		}
	};

	function initTooltip(tooltipObj) {
		// reset trigger element
		tooltipObj.element.removeAttribute('title');
		tooltipObj.element.setAttribute('tabindex', '0');
		// add event listeners
		tooltipObj.element.addEventListener('mouseenter', handleEvent.bind(tooltipObj));
		tooltipObj.element.addEventListener('focus', handleEvent.bind(tooltipObj));
	};

	function removeTooltipEvents(tooltipObj) {
		// remove event listeners
		tooltipObj.element.removeEventListener('mouseleave',  handleEvent.bind(tooltipObj));
		tooltipObj.element.removeEventListener('blur',  handleEvent.bind(tooltipObj));
	};

	function handleEvent(event) {
		// handle events
		switch(event.type) {
			case 'mouseenter':
			case 'focus':
				showTooltip(this, event);
				break;
			case 'mouseleave':
			case 'blur':
				checkTooltip(this);
				break;
		}
	};

	function showTooltip(tooltipObj, event) {
		// tooltip has already been triggered
		if(tooltipObj.tooltipIntervalId) return;
		tooltipObj.tooltipTriggerHover = true;
		// listen to close events
		tooltipObj.element.addEventListener('mouseleave', handleEvent.bind(tooltipObj));
		tooltipObj.element.addEventListener('blur', handleEvent.bind(tooltipObj));
		// show tooltip with a delay
		tooltipObj.tooltipIntervalId = setTimeout(function(){
			createTooltip(tooltipObj);
		}, tooltipObj.tooltipDelay);
	};

	function createTooltip(tooltipObj) {
		tooltipObj.tooltip = document.getElementById(tooltipObj.tooltipId);
		
		if( !tooltipObj.tooltip ) { // tooltip element does not yet exist
			tooltipObj.tooltip = document.createElement('div');
			document.body.appendChild(tooltipObj.tooltip);
		} 
		
		// reset tooltip content/position
		Util.setAttributes(tooltipObj.tooltip, {'id': tooltipObj.tooltipId, 'class': 'tooltip tooltip--is-hidden js-tooltip', 'role': 'tooltip'});
		tooltipObj.tooltip.innerHTML = tooltipObj.tooltipContent;
		if(tooltipObj.tooltipDescription) tooltipObj.element.setAttribute('aria-describedby', tooltipObj.tooltipId);
		if(tooltipObj.tooltipClasses) Util.addClass(tooltipObj.tooltip, tooltipObj.tooltipClasses);
		if(tooltipObj.tooltipSticky) Util.addClass(tooltipObj.tooltip, 'tooltip--sticky');
		placeTooltip(tooltipObj);
		Util.removeClass(tooltipObj.tooltip, 'tooltip--is-hidden');

		// if tooltip is sticky, listen to mouse events
		if(!tooltipObj.tooltipSticky) return;
		tooltipObj.tooltip.addEventListener('mouseenter', function cb(){
			tooltipObj.tooltipHover = true;
			if(tooltipObj.tooltipHoverInterval) {
				clearInterval(tooltipObj.tooltipHoverInterval);
				tooltipObj.tooltipHoverInterval = false;
			}
			tooltipObj.tooltip.removeEventListener('mouseenter', cb);
			tooltipLeaveEvent(tooltipObj);
		});
	};

	function tooltipLeaveEvent(tooltipObj) {
		tooltipObj.tooltip.addEventListener('mouseleave', function cb(){
			tooltipObj.tooltipHover = false;
			tooltipObj.tooltip.removeEventListener('mouseleave', cb);
			hideTooltip(tooltipObj);
		});
	};

	function placeTooltip(tooltipObj) {
		// set top and left position of the tooltip according to the data-tooltip-position attr of the trigger
		var dimention = [tooltipObj.tooltip.offsetHeight, tooltipObj.tooltip.offsetWidth],
			positionTrigger = tooltipObj.element.getBoundingClientRect(),
			position = [],
			scrollY = window.scrollY || window.pageYOffset;
		
		position['top'] = [ (positionTrigger.top - dimention[0] - tooltipObj.tooltipDelta + scrollY), (positionTrigger.right/2 + positionTrigger.left/2 - dimention[1]/2)];
		position['bottom'] = [ (positionTrigger.bottom + tooltipObj.tooltipDelta + scrollY), (positionTrigger.right/2 + positionTrigger.left/2 - dimention[1]/2)];
		position['left'] = [(positionTrigger.top/2 + positionTrigger.bottom/2 - dimention[0]/2 + scrollY), positionTrigger.left - dimention[1] - tooltipObj.tooltipDelta];
		position['right'] = [(positionTrigger.top/2 + positionTrigger.bottom/2 - dimention[0]/2 + scrollY), positionTrigger.right + tooltipObj.tooltipDelta];
		
		var direction = tooltipObj.tooltipPosition;
		if( direction == 'top' && position['top'][0] < scrollY) direction = 'bottom';
		else if( direction == 'bottom' && position['bottom'][0] + tooltipObj.tooltipDelta + dimention[0] > scrollY + window.innerHeight) direction = 'top';
		else if( direction == 'left' && position['left'][1] < 0 )  direction = 'right';
		else if( direction == 'right' && position['right'][1] + dimention[1] > window.innerWidth ) direction = 'left';
		
		if(direction == 'top' || direction == 'bottom') {
			if(position[direction][1] < 0 ) position[direction][1] = 0;
			if(position[direction][1] + dimention[1] > window.innerWidth ) position[direction][1] = window.innerWidth - dimention[1];
		}
		tooltipObj.tooltip.style.top = position[direction][0]+'px';
		tooltipObj.tooltip.style.left = position[direction][1]+'px';
		Util.addClass(tooltipObj.tooltip, 'tooltip--'+direction);
	};

	function checkTooltip(tooltipObj) {
		tooltipObj.tooltipTriggerHover = false;
		if(!tooltipObj.tooltipSticky) hideTooltip(tooltipObj);
		else {
			if(tooltipObj.tooltipHover) return;
			if(tooltipObj.tooltipHoverInterval) return;
			tooltipObj.tooltipHoverInterval = setTimeout(function(){
				hideTooltip(tooltipObj); 
				tooltipObj.tooltipHoverInterval = false;
			}, 300);
		}
	};

	function hideTooltip(tooltipObj) {
		if(tooltipObj.tooltipHover || tooltipObj.tooltipTriggerHover) return;
		clearInterval(tooltipObj.tooltipIntervalId);
		if(tooltipObj.tooltipHoverInterval) {
			clearInterval(tooltipObj.tooltipHoverInterval);
			tooltipObj.tooltipHoverInterval = false;
		}
		tooltipObj.tooltipIntervalId = false;
		if(!tooltipObj.tooltip) return;
		// hide tooltip
		removeTooltip(tooltipObj);
		// remove events
		removeTooltipEvents(tooltipObj);
	};

	function removeTooltip(tooltipObj) {
		Util.addClass(tooltipObj.tooltip, 'tooltip--is-hidden');
		if(tooltipObj.tooltipDescription) tooltipObj.element.removeAttribute('aria-describedby');
	};

	window.Tooltip = Tooltip;

	//initialize the Tooltip objects
	var tooltips = document.getElementsByClassName('js-tooltip-trigger');
	if( tooltips.length > 0 ) {
		for( var i = 0; i < tooltips.length; i++) {
			(function(i){new Tooltip(tooltips[i]);})(i);
		}
	}
}());
// File#: _2_autocomplete
// Usage: codyhouse.co/license
(function() {
  var Autocomplete = function(opts) {
    if(!('CSS' in window) || !CSS.supports('color', 'var(--color-var)')) return;
    this.options = Util.extend(Autocomplete.defaults, opts);
    this.element = this.options.element;
    this.input = this.element.getElementsByClassName('js-autocomplete__input')[0];
    this.results = this.element.getElementsByClassName('js-autocomplete__results')[0];
    this.resultsList = this.results.getElementsByClassName('js-autocomplete__list')[0];
    this.ariaResult = this.element.getElementsByClassName('js-autocomplete__aria-results');
    this.resultClassName = this.element.getElementsByClassName('js-autocomplete__item').length > 0 ? 'js-autocomplete__item' : 'js-autocomplete__result';
    // store search info
    this.inputVal = '';
    this.typeId = false;
    this.searching = false;
    this.searchingClass = this.element.getAttribute('data-autocomplete-searching-class') || 'autocomplete--searching';
    // dropdown reveal class
    this.dropdownActiveClass =  this.element.getAttribute('data-autocomplete-dropdown-visible-class') || this.element.getAttribute('data-dropdown-active-class');
    // truncate dropdown
    this.truncateDropdown = this.element.getAttribute('data-autocomplete-dropdown-truncate') && this.element.getAttribute('data-autocomplete-dropdown-truncate') == 'on' ? true : false;
    initAutocomplete(this);
    this.autocompleteClosed = false; // fix issue when selecting an option from the list
  };

  function initAutocomplete(element) {
    initAutocompleteAria(element); // set aria attributes for SR and keyboard users
    initAutocompleteTemplates(element);
    initAutocompleteEvents(element);
  };

  function initAutocompleteAria(element) {
    // set aria attributes for input element
    Util.setAttributes(element.input, {'role': 'combobox', 'aria-autocomplete': 'list'});
    var listId = element.resultsList.getAttribute('id');
    if(listId) element.input.setAttribute('aria-owns', listId);
    // set aria attributes for autocomplete list
    element.resultsList.setAttribute('role', 'list');
  };

  function initAutocompleteTemplates(element) {
    element.templateItems = element.resultsList.querySelectorAll('.'+element.resultClassName+'[data-autocomplete-template]');
    if(element.templateItems.length < 1) element.templateItems = element.resultsList.querySelectorAll('.'+element.resultClassName);
    element.templates = [];
    for(var i = 0; i < element.templateItems.length; i++) {
      element.templates[i] = element.templateItems[i].getAttribute('data-autocomplete-template');
    }
  };

  function initAutocompleteEvents(element) {
    // input - keyboard navigation 
    element.input.addEventListener('keyup', function(event){
      handleInputTyped(element, event);
    });

    // if input type="search" -> detect when clicking on 'x' to clear input
    element.input.addEventListener('search', function(event){
      updateSearch(element);
    });

    // make sure dropdown is open on click
    element.input.addEventListener('click', function(event){
      updateSearch(element, true);
    });

    element.input.addEventListener('focus', function(event){
      if(element.autocompleteClosed) {
        element.autocompleteClosed = false;
        return;
      }
      updateSearch(element, true);
    });

    // input loses focus -> close menu
    element.input.addEventListener('blur', function(event){
      checkFocusLost(element, event);
    });

    // results list - keyboard navigation 
    element.resultsList.addEventListener('keydown', function(event){
      navigateList(element, event);
    });

    // results list loses focus -> close menu
    element.resultsList.addEventListener('focusout', function(event){
      checkFocusLost(element, event);
    });

    // close on esc
    window.addEventListener('keyup', function(event){
      if( event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape' ) {
        toggleOptionsList(element, false);
      } else if(event.keyCode && event.keyCode == 13 || event.key && event.key.toLowerCase() == 'enter') { // on Enter - select result if focus is within results list
        selectResult(element, document.activeElement.closest('.'+element.resultClassName), event);
      }
    });

    // select element from list
    element.resultsList.addEventListener('click', function(event){
      selectResult(element, event.target.closest('.'+element.resultClassName), event);
    });
  };

  function checkFocusLost(element, event) {
    if(element.element.contains(event.relatedTarget)) return;
    toggleOptionsList(element, false);
  };

  function handleInputTyped(element, event) {
    if(event.key.toLowerCase() == 'arrowdown' || event.keyCode == '40') {
      moveFocusToList(element);
    } else {
      updateSearch(element);
    }
  };

  function moveFocusToList(element) {
    if(!Util.hasClass(element.element, element.dropdownActiveClass)) return;
    resetSearch(element); // clearTimeout
    // make sure first element is focusable
    var index = 0;
    if(!elementListIsFocusable(element.resultsItems[index])) {
      index = getElementFocusbleIndex(element, index, true);
    }
    getListFocusableEl(element.resultsItems[index]).focus();
  };

  function updateSearch(element, bool) {
    var inputValue = element.input.value;
    if(inputValue == element.inputVal && !bool) return; // input value did not change
    element.inputVal = inputValue;
    if(element.typeId) clearInterval(element.typeId); // clearTimeout
    if(element.inputVal.length < element.options.characters) { // not enough characters to start searching
      toggleOptionsList(element, false);
      return;
    }
    if(bool) { // on focus -> update result list without waiting for the debounce
      updateResultsList(element, 'focus');
      return;
    }
    element.typeId = setTimeout(function(){
      updateResultsList(element, 'type');
    }, element.options.debounce);
  };

  function toggleOptionsList(element, bool) {
    // toggle visibility of options list
    if(bool) {
      if(Util.hasClass(element.element, element.dropdownActiveClass)) return;
      Util.addClass(element.element, element.dropdownActiveClass);
      element.input.setAttribute('aria-expanded', true);
      truncateAutocompleteList(element);
    } else {
      if(!Util.hasClass(element.element, element.dropdownActiveClass)) return;
      if(element.resultsList.contains(document.activeElement)) {
        element.autocompleteClosed = true;
        element.input.focus();
      }
      Util.removeClass(element.element, element.dropdownActiveClass);
      element.input.removeAttribute('aria-expanded');
      resetSearch(element); // clearTimeout
    }
  };

  function truncateAutocompleteList(element) {
    if(!element.truncateDropdown) return;
    // reset max height
    element.resultsList.style.maxHeight = '';
    // check available space 
    var spaceBelow = (window.innerHeight - element.input.getBoundingClientRect().bottom - 10),
      maxHeight = parseInt(getComputedStyle(element.resultsList).maxHeight);

    (maxHeight > spaceBelow) 
      ? element.resultsList.style.maxHeight = spaceBelow+'px' 
      : element.resultsList.style.maxHeight = '';
  };

  function updateResultsList(element, eventType) {
    if(element.searching) return;
    element.searching = true;
    Util.addClass(element.element, element.searchingClass); // show loader
    element.options.searchData(element.inputVal, function(data){
      // data = custom results
      populateResults(element, data);
      Util.removeClass(element.element, element.searchingClass);
      toggleOptionsList(element, true);
      updateAriaRegion(element);
      element.searching = false;
    }, eventType);
  };

  function updateAriaRegion(element) {
    element.resultsItems = element.resultsList.querySelectorAll('.'+element.resultClassName+'[tabindex="-1"]');
    if(element.ariaResult.length == 0) return;
    element.ariaResult[0].textContent = element.resultsItems.length;
  };

  function resetSearch(element) {
    if(element.typeId) clearInterval(element.typeId);
    element.typeId = false;
  };

  function navigateList(element, event) {
    var downArrow = (event.key.toLowerCase() == 'arrowdown' || event.keyCode == '40'),
      upArrow = (event.key.toLowerCase() == 'arrowup' || event.keyCode == '38');
    if(!downArrow && !upArrow) return;
    event.preventDefault();
    var selectedElement = document.activeElement.closest('.'+element.resultClassName) || document.activeElement;
    var index = Util.getIndexInArray(element.resultsItems, selectedElement);
    var newIndex = getElementFocusbleIndex(element, index, downArrow);
    getListFocusableEl(element.resultsItems[newIndex]).focus();
  };

  function getElementFocusbleIndex(element, index, nextItem) {
    var newIndex = nextItem ? index + 1 : index - 1;
    if(newIndex < 0) newIndex = element.resultsItems.length - 1;
    if(newIndex >= element.resultsItems.length) newIndex = 0;
    // check if element can be focused
    if(!elementListIsFocusable(element.resultsItems[newIndex])) {
      // skip this element
      return getElementFocusbleIndex(element, newIndex, nextItem);
    }
    return newIndex;
  };

  function elementListIsFocusable(item) {
    var role = item.getAttribute('role');
    if(role && role == 'presentation') {
      // skip this element
      return false;
    }
    return true;
  };

  function getListFocusableEl(item) {
    var newFocus = item,
      focusable = newFocus.querySelectorAll('button:not([disabled]), [href]');
    if(focusable.length > 0 ) newFocus = focusable[0];
    return newFocus;
  };

  function selectResult(element, result, event) {
    if(!result) return;
    if(element.options.onClick) {
      element.options.onClick(result, element, event, function(){
        toggleOptionsList(element, false);
      });
    } else {
      element.input.value = getResultContent(result);
      toggleOptionsList(element, false);
    }
    element.inputVal = element.input.value;
  };

  function getResultContent(result) { // get text content of selected item
    var labelElement = result.querySelector('[data-autocomplete-label]');
    return labelElement ? labelElement.textContent : result.textContent;
  };

  function populateResults(element, data) {
    var innerHtml = '';

    for(var i = 0; i < data.length; i++) {
      innerHtml = innerHtml + getItemHtml(element, data[i]);
    }
    element.resultsList.innerHTML = innerHtml;
  };

  function getItemHtml(element, data) {
    var clone = getClone(element, data);
    Util.removeClass(clone, 'is-hidden');
    clone.setAttribute('tabindex', '-1');
    for(var key in data) {
      if (data.hasOwnProperty(key)) {
        if(key == 'label') setLabel(clone, data[key]);
        else if(key == 'class') setClass(clone, data[key]);
        else if(key == 'url') setUrl(clone, data[key]);
        else if(key == 'src') setSrc(clone, data[key]);
        else setKey(clone, key, data[key]);
      }
    }
    return clone.outerHTML;
  };

  function getClone(element, data) {
    var item = false;
    if(element.templateItems.length == 1 || !data['template']) item = element.templateItems[0];
    else {
      for(var i = 0; i < element.templateItems.length; i++) {
        if(data['template'] == element.templates[i]) {
          item = element.templateItems[i];
        }
      }
      if(!item) item = element.templateItems[0];
    }
    return item.cloneNode(true);
  };

  function setLabel(clone, label) {
    var labelElement = clone.querySelector('[data-autocomplete-label]');
    labelElement 
      ? labelElement.textContent = label
      : clone.textContent = label;
  };

  function setClass(clone, classList) {
    Util.addClass(clone, classList);
  };

  function setUrl(clone, url) {
    var linkElement = clone.querySelector('[data-autocomplete-url]');
    if(linkElement) linkElement.setAttribute('href', url);
  };

  function setSrc(clone, src) {
    var imgElement = clone.querySelector('[data-autocomplete-src]');
    if(imgElement) imgElement.setAttribute('src', src);
  };

  function setKey(clone, key, value) {
    var subElement = clone.querySelector('[data-autocomplete-'+key+']');
    if(subElement) {
      if(subElement.hasAttribute('data-autocomplete-html')) subElement.innerHTML = value;
      else subElement.textContent = value;
    }
  };

  Autocomplete.defaults = {
    element : '',
    debounce: 200,
    characters: 2,
    searchData: false, // function used to return results
    onClick: false // function executed when selecting an item in the list; arguments (result, obj) -> selected <li> item + Autocompletr obj reference
  };

  window.Autocomplete = Autocomplete;
}());
// File#: _2_carousel
// Usage: codyhouse.co/license
(function() {
  var Carousel = function(opts) {
    this.options = Util.extend(Carousel.defaults , opts);
    this.element = this.options.element;
    this.listWrapper = this.element.getElementsByClassName('carousel__wrapper')[0];
    this.list = this.element.getElementsByClassName('carousel__list')[0];
    this.items = this.element.getElementsByClassName('carousel__item');
    this.initItems = []; // store only the original elements - will need this for cloning
    this.itemsNb = this.items.length; //original number of items
    this.visibItemsNb = 1; // tot number of visible items
    this.itemsWidth = 1; // this will be updated with the right width of items
    this.itemOriginalWidth = false; // store the initial width to use it on resize
    this.selectedItem = 0; // index of first visible item 
    this.translateContainer = 0; // this will be the amount the container has to be translated each time a new group has to be shown (negative)
    this.containerWidth = 0; // this will be used to store the total width of the carousel (including the overflowing part)
    this.ariaLive = false;
    // navigation
    this.controls = this.element.getElementsByClassName('js-carousel__control');
    this.animating = false;
    // autoplay
    this.autoplayId = false;
    this.autoplayPaused = false;
    //drag
    this.dragStart = false;
    // resize
    this.resizeId = false;
    // used to re-initialize js
    this.cloneList = [];
    // store items min-width
    this.itemAutoSize = false;
    // store translate value (loop = off)
    this.totTranslate = 0;
    // modify loop option if navigation is on
    if(this.options.nav) this.options.loop = false;
    // store counter elements (if present)
    this.counter = this.element.getElementsByClassName('js-carousel__counter');
    this.counterTor = this.element.getElementsByClassName('js-carousel__counter-tot');
    initCarouselLayout(this); // get number visible items + width items
    setItemsWidth(this, true); 
    insertBefore(this, this.visibItemsNb); // insert clones before visible elements
    updateCarouselClones(this); // insert clones after visible elements
    resetItemsTabIndex(this); // make sure not visible items are not focusable
    initAriaLive(this); // set aria-live region for SR
    initCarouselEvents(this); // listen to events
    initCarouselCounter(this);
    Util.addClass(this.element, 'carousel--loaded');
  };
  
  //public carousel functions
  Carousel.prototype.showNext = function() {
    showNextItems(this);
  };

  Carousel.prototype.showPrev = function() {
    showPrevItems(this);
  };

  Carousel.prototype.startAutoplay = function() {
    startAutoplay(this);
  };

  Carousel.prototype.pauseAutoplay = function() {
    pauseAutoplay(this);
  };
  
  //private carousel functions
  function initCarouselLayout(carousel) {
    // evaluate size of single elements + number of visible elements
    var itemStyle = window.getComputedStyle(carousel.items[0]),
      containerStyle = window.getComputedStyle(carousel.listWrapper),
      itemWidth = parseFloat(itemStyle.getPropertyValue('width')),
      itemMargin = parseFloat(itemStyle.getPropertyValue('margin-right')),
      containerPadding = parseFloat(containerStyle.getPropertyValue('padding-left')),
      containerWidth = parseFloat(containerStyle.getPropertyValue('width'));

    if(!carousel.itemAutoSize) {
      carousel.itemAutoSize = itemWidth;
    }

    // if carousel.listWrapper is hidden -> make sure to retrieve the proper width
    containerWidth = getCarouselWidth(carousel, containerWidth);

    if( !carousel.itemOriginalWidth) { // on resize -> use initial width of items to recalculate 
      carousel.itemOriginalWidth = itemWidth;
    } else {
      itemWidth = carousel.itemOriginalWidth;
    }

    if(carousel.itemAutoSize) {
      carousel.itemOriginalWidth = parseInt(carousel.itemAutoSize);
      itemWidth = carousel.itemOriginalWidth;
    }
    // make sure itemWidth is smaller than container width
    if(containerWidth < itemWidth) {
      carousel.itemOriginalWidth = containerWidth
      itemWidth = carousel.itemOriginalWidth;
    }
    // get proper width of elements
    carousel.visibItemsNb = parseInt((containerWidth - 2*containerPadding + itemMargin)/(itemWidth+itemMargin));
    carousel.itemsWidth = parseFloat( (((containerWidth - 2*containerPadding + itemMargin)/carousel.visibItemsNb) - itemMargin).toFixed(1));
    carousel.containerWidth = (carousel.itemsWidth+itemMargin)* carousel.items.length;
    carousel.translateContainer = 0 - ((carousel.itemsWidth+itemMargin)* carousel.visibItemsNb);
    // flexbox fallback
    if(!flexSupported) carousel.list.style.width = (carousel.itemsWidth + itemMargin)*carousel.visibItemsNb*3+'px';
    
    // this is used when loop == off
    carousel.totTranslate = 0 - carousel.selectedItem*(carousel.itemsWidth+itemMargin);
    if(carousel.items.length <= carousel.visibItemsNb) carousel.totTranslate = 0;

    centerItems(carousel); // center items if carousel.items.length < visibItemsNb
    alignControls(carousel); // check if controls need to be aligned to a different element
  };

  function setItemsWidth(carousel, bool) {
    for(var i = 0; i < carousel.items.length; i++) {
      carousel.items[i].style.width = carousel.itemsWidth+"px";
      if(bool) carousel.initItems.push(carousel.items[i]);
    }
  };

  function updateCarouselClones(carousel) { 
    if(!carousel.options.loop) return;
    // take care of clones after visible items (needs to run after the update of clones before visible items)
    if(carousel.items.length < carousel.visibItemsNb*3) {
      insertAfter(carousel, carousel.visibItemsNb*3 - carousel.items.length, carousel.items.length - carousel.visibItemsNb*2);
    } else if(carousel.items.length > carousel.visibItemsNb*3 ) {
      removeClones(carousel, carousel.visibItemsNb*3, carousel.items.length - carousel.visibItemsNb*3);
    }
    // set proper translate value for the container
    setTranslate(carousel, 'translateX('+carousel.translateContainer+'px)');
  };

  function initCarouselEvents(carousel) {
    // listen for click on previous/next arrow
    // dots navigation
    if(carousel.options.nav) {
      carouselCreateNavigation(carousel);
      carouselInitNavigationEvents(carousel);
    }

    if(carousel.controls.length > 0) {
      carousel.controls[0].addEventListener('click', function(event){
        event.preventDefault();
        showPrevItems(carousel);
        updateAriaLive(carousel);
      });
      carousel.controls[1].addEventListener('click', function(event){
        event.preventDefault();
        showNextItems(carousel);
        updateAriaLive(carousel);
      });

      // update arrow visility -> loop == off only
      resetCarouselControls(carousel);
      // emit custom event - items visible
      emitCarouselActiveItemsEvent(carousel)
    }
    // autoplay
    if(carousel.options.autoplay) {
      startAutoplay(carousel);
      // pause autoplay if user is interacting with the carousel
      carousel.element.addEventListener('mouseenter', function(event){
        pauseAutoplay(carousel);
        carousel.autoplayPaused = true;
      });
      carousel.element.addEventListener('focusin', function(event){
        pauseAutoplay(carousel);
        carousel.autoplayPaused = true;
      });
      carousel.element.addEventListener('mouseleave', function(event){
        carousel.autoplayPaused = false;
        startAutoplay(carousel);
      });
      carousel.element.addEventListener('focusout', function(event){
        carousel.autoplayPaused = false;
        startAutoplay(carousel);
      });
    }
    // drag events
    if(carousel.options.drag && window.requestAnimationFrame) {
      //init dragging
      new SwipeContent(carousel.element);
      carousel.element.addEventListener('dragStart', function(event){
        if(event.detail.origin && event.detail.origin.closest('.js-carousel__control')) return;
        if(event.detail.origin && event.detail.origin.closest('.js-carousel__navigation')) return;
        if(event.detail.origin && !event.detail.origin.closest('.carousel__wrapper')) return;
        Util.addClass(carousel.element, 'carousel--is-dragging');
        pauseAutoplay(carousel);
        carousel.dragStart = event.detail.x;
        animateDragEnd(carousel);
      });
      carousel.element.addEventListener('dragging', function(event){
        if(!carousel.dragStart) return;
        if(carousel.animating || Math.abs(event.detail.x - carousel.dragStart) < 10) return;
        var translate = event.detail.x - carousel.dragStart + carousel.translateContainer;
        if(!carousel.options.loop) {
          translate = event.detail.x - carousel.dragStart + carousel.totTranslate; 
        }
        setTranslate(carousel, 'translateX('+translate+'px)');
      });
    }
    // reset on resize
    window.addEventListener('resize', function(event){
      pauseAutoplay(carousel);
      clearTimeout(carousel.resizeId);
      carousel.resizeId = setTimeout(function(){
        resetCarouselResize(carousel);
        // reset dots navigation
        resetDotsNavigation(carousel);
        resetCarouselControls(carousel);
        setCounterItem(carousel);
        startAutoplay(carousel);
        centerItems(carousel); // center items if carousel.items.length < visibItemsNb
        alignControls(carousel);
        // emit custom event - items visible
        emitCarouselActiveItemsEvent(carousel)
      }, 250)
    });
    // keyboard navigation
    carousel.element.addEventListener('keydown', function(event){
			if(event.keyCode && event.keyCode == 39 || event.key && event.key.toLowerCase() == 'arrowright') {
				carousel.showNext();
			} else if(event.keyCode && event.keyCode == 37 || event.key && event.key.toLowerCase() == 'arrowleft') {
				carousel.showPrev();
			}
		});
  };

  function showPrevItems(carousel) {
    if(carousel.animating) return;
    carousel.animating = true;
    carousel.selectedItem = getIndex(carousel, carousel.selectedItem - carousel.visibItemsNb);
    animateList(carousel, '0', 'prev');
  };

  function showNextItems(carousel) {
    if(carousel.animating) return;
    carousel.animating = true;
    carousel.selectedItem = getIndex(carousel, carousel.selectedItem + carousel.visibItemsNb);
    animateList(carousel, carousel.translateContainer*2+'px', 'next');
  };

  function animateDragEnd(carousel) { // end-of-dragging animation
    carousel.element.addEventListener('dragEnd', function cb(event){
      carousel.element.removeEventListener('dragEnd', cb);
      Util.removeClass(carousel.element, 'carousel--is-dragging');
      if(event.detail.x - carousel.dragStart < -40) {
        carousel.animating = false;
        showNextItems(carousel);
      } else if(event.detail.x - carousel.dragStart > 40) {
        carousel.animating = false;
        showPrevItems(carousel);
      } else if(event.detail.x - carousel.dragStart == 0) { // this is just a click -> no dragging
        return;
      } else { // not dragged enought -> do not update carousel, just reset
        carousel.animating = true;
        animateList(carousel, carousel.translateContainer+'px', false);
      }
      carousel.dragStart = false;
    });
  };

  function animateList(carousel, translate, direction) { // takes care of changing visible items
    pauseAutoplay(carousel);
    Util.addClass(carousel.list, 'carousel__list--animating');
    var initTranslate = carousel.totTranslate;
    if(!carousel.options.loop) {
      translate = noLoopTranslateValue(carousel, direction);
    }
    setTimeout(function() {setTranslate(carousel, 'translateX('+translate+')');});
    if(transitionSupported) {
      carousel.list.addEventListener('transitionend', function cb(event){
        if(event.propertyName && event.propertyName != 'transform') return;
        Util.removeClass(carousel.list, 'carousel__list--animating');
        carousel.list.removeEventListener('transitionend', cb);
        animateListCb(carousel, direction);
      });
    } else {
      animateListCb(carousel, direction);
    }
    if(!carousel.options.loop && (initTranslate == carousel.totTranslate)) {
      // translate value was not updated -> trigger transitionend event to restart carousel
      carousel.list.dispatchEvent(new CustomEvent('transitionend'));
    }
    resetCarouselControls(carousel);
    setCounterItem(carousel);
    // emit custom event - items visible
    emitCarouselActiveItemsEvent(carousel)
  };

  function noLoopTranslateValue(carousel, direction) {
    var translate = carousel.totTranslate;
    if(direction == 'next') {
      translate = carousel.totTranslate + carousel.translateContainer;
    } else if(direction == 'prev') {
      translate = carousel.totTranslate - carousel.translateContainer;
    } else if(direction == 'click') {
      translate = carousel.selectedDotIndex*carousel.translateContainer;
    }
    if(translate > 0)  {
      translate = 0;
      carousel.selectedItem = 0;
    }
    if(translate < - carousel.translateContainer - carousel.containerWidth) {
      translate = - carousel.translateContainer - carousel.containerWidth;
      carousel.selectedItem = carousel.items.length - carousel.visibItemsNb;
    }
    if(carousel.visibItemsNb > carousel.items.length) translate = 0;
    carousel.totTranslate = translate;
    return translate + 'px';
  };

  function animateListCb(carousel, direction) { // reset actions after carousel has been updated
    if(direction) updateClones(carousel, direction);
    carousel.animating = false;
    // reset autoplay
    startAutoplay(carousel);
    // reset tab index
    resetItemsTabIndex(carousel);
  };

  function updateClones(carousel, direction) {
    if(!carousel.options.loop) return;
    // at the end of each animation, we need to update the clones before and after the visible items
    var index = (direction == 'next') ? 0 : carousel.items.length - carousel.visibItemsNb;
    // remove clones you do not need anymore
    removeClones(carousel, index, false);
    // add new clones 
    (direction == 'next') ? insertAfter(carousel, carousel.visibItemsNb, 0) : insertBefore(carousel, carousel.visibItemsNb);
    //reset transform
    setTranslate(carousel, 'translateX('+carousel.translateContainer+'px)');
  };

  function insertBefore(carousel, nb, delta) {
    if(!carousel.options.loop) return;
    var clones = document.createDocumentFragment();
    var start = 0;
    if(delta) start = delta;
    for(var i = start; i < nb; i++) {
      var index = getIndex(carousel, carousel.selectedItem - i - 1),
        clone = carousel.initItems[index].cloneNode(true);
      Util.addClass(clone, 'js-clone');
      clones.insertBefore(clone, clones.firstChild);
    }
    carousel.list.insertBefore(clones, carousel.list.firstChild);
    emitCarouselUpdateEvent(carousel);
  };

  function insertAfter(carousel, nb, init) {
    if(!carousel.options.loop) return;
    var clones = document.createDocumentFragment();
    for(var i = init; i < nb + init; i++) {
      var index = getIndex(carousel, carousel.selectedItem + carousel.visibItemsNb + i),
        clone = carousel.initItems[index].cloneNode(true);
      Util.addClass(clone, 'js-clone');
      clones.appendChild(clone);
    }
    carousel.list.appendChild(clones);
    emitCarouselUpdateEvent(carousel);
  };

  function removeClones(carousel, index, bool) {
    if(!carousel.options.loop) return;
    if( !bool) {
      bool = carousel.visibItemsNb;
    }
    for(var i = 0; i < bool; i++) {
      if(carousel.items[index]) carousel.list.removeChild(carousel.items[index]);
    }
  };

  function resetCarouselResize(carousel) { // reset carousel on resize
    var visibleItems = carousel.visibItemsNb;
    // get new items min-width value
    resetItemAutoSize(carousel);
    initCarouselLayout(carousel); 
    setItemsWidth(carousel, false);
    resetItemsWidth(carousel); // update the array of original items -> array used to create clones
    if(carousel.options.loop) {
      if(visibleItems > carousel.visibItemsNb) {
        removeClones(carousel, 0, visibleItems - carousel.visibItemsNb);
      } else if(visibleItems < carousel.visibItemsNb) {
        insertBefore(carousel, carousel.visibItemsNb, visibleItems);
      }
      updateCarouselClones(carousel); // this will take care of translate + after elements
    } else {
      // reset default translate to a multiple value of (itemWidth + margin)
      var translate = noLoopTranslateValue(carousel);
      setTranslate(carousel, 'translateX('+translate+')');
    }
    resetItemsTabIndex(carousel); // reset focusable elements
  };

  function resetItemAutoSize(carousel) {
    if(!cssPropertiesSupported) return;
    // remove inline style
    carousel.items[0].removeAttribute('style');
    // get original item width 
    carousel.itemAutoSize = getComputedStyle(carousel.items[0]).getPropertyValue('width');
  };

  function resetItemsWidth(carousel) {
    for(var i = 0; i < carousel.initItems.length; i++) {
      carousel.initItems[i].style.width = carousel.itemsWidth+"px";
    }
  };

  function resetItemsTabIndex(carousel) {
    var carouselActive = carousel.items.length > carousel.visibItemsNb;
    var j = carousel.items.length;
    for(var i = 0; i < carousel.items.length; i++) {
      if(carousel.options.loop) {
        if(i < carousel.visibItemsNb || i >= 2*carousel.visibItemsNb ) {
          carousel.items[i].setAttribute('tabindex', '-1');
        } else {
          if(i < j) j = i;
          carousel.items[i].removeAttribute('tabindex');
        }
      } else {
        if( (i < carousel.selectedItem || i >= carousel.selectedItem + carousel.visibItemsNb) && carouselActive) {
          carousel.items[i].setAttribute('tabindex', '-1');
        } else {
          if(i < j) j = i;
          carousel.items[i].removeAttribute('tabindex');
        }
      }
    }
    resetVisibilityOverflowItems(carousel, j);
  };

  function startAutoplay(carousel) {
    if(carousel.options.autoplay && !carousel.autoplayId && !carousel.autoplayPaused) {
      carousel.autoplayId = setInterval(function(){
        showNextItems(carousel);
      }, carousel.options.autoplayInterval);
    }
  };

  function pauseAutoplay(carousel) {
    if(carousel.options.autoplay) {
      clearInterval(carousel.autoplayId);
      carousel.autoplayId = false;
    }
  };

  function initAriaLive(carousel) { // create an aria-live region for SR
    if(!carousel.options.ariaLive) return;
    // create an element that will be used to announce the new visible slide to SR
    var srLiveArea = document.createElement('div');
    Util.setAttributes(srLiveArea, {'class': 'sr-only js-carousel__aria-live', 'aria-live': 'polite', 'aria-atomic': 'true'});
    carousel.element.appendChild(srLiveArea);
    carousel.ariaLive = srLiveArea;
  };

  function updateAriaLive(carousel) { // announce to SR which items are now visible
    if(!carousel.options.ariaLive) return;
    carousel.ariaLive.innerHTML = 'Item '+(carousel.selectedItem + 1)+' selected. '+carousel.visibItemsNb+' items of '+carousel.initItems.length+' visible';
  };

  function getIndex(carousel, index) {
    if(index < 0) index = getPositiveValue(index, carousel.itemsNb);
    if(index >= carousel.itemsNb) index = index % carousel.itemsNb;
    return index;
  };

  function getPositiveValue(value, add) {
    value = value + add;
    if(value > 0) return value;
    else return getPositiveValue(value, add);
  };

  function setTranslate(carousel, translate) {
    carousel.list.style.transform = translate;
    carousel.list.style.msTransform = translate;
  };

  function getCarouselWidth(carousel, computedWidth) { // retrieve carousel width if carousel is initially hidden
    var closestHidden = carousel.listWrapper.closest('.sr-only');
    if(closestHidden) { // carousel is inside an .sr-only (visually hidden) element
      Util.removeClass(closestHidden, 'sr-only');
      computedWidth = carousel.listWrapper.offsetWidth;
      Util.addClass(closestHidden, 'sr-only');
    } else if(isNaN(computedWidth)){
      computedWidth = getHiddenParentWidth(carousel.element, carousel);
    }
    return computedWidth;
  };

  function getHiddenParentWidth(element, carousel) {
    var parent = element.parentElement;
    if(parent.tagName.toLowerCase() == 'html') return 0;
    var style = window.getComputedStyle(parent);
    if(style.display == 'none' || style.visibility == 'hidden') {
      parent.setAttribute('style', 'display: block!important; visibility: visible!important;');
      var computedWidth = carousel.listWrapper.offsetWidth;
      parent.style.display = '';
      parent.style.visibility = '';
      return computedWidth;
    } else {
      return getHiddenParentWidth(parent, carousel);
    }
  };

  function resetCarouselControls(carousel) {
    if(carousel.options.loop) return;
    // update arrows status
    if(carousel.controls.length > 0) {
      (carousel.totTranslate == 0) 
        ? carousel.controls[0].setAttribute('disabled', true) 
        : carousel.controls[0].removeAttribute('disabled');
      (carousel.totTranslate == (- carousel.translateContainer - carousel.containerWidth) || carousel.items.length <= carousel.visibItemsNb) 
        ? carousel.controls[1].setAttribute('disabled', true) 
        : carousel.controls[1].removeAttribute('disabled');
    }
    // update carousel dots
    if(carousel.options.nav) {
      var selectedDot = carousel.navigation.getElementsByClassName(carousel.options.navigationItemClass+'--selected');
      if(selectedDot.length > 0) Util.removeClass(selectedDot[0], carousel.options.navigationItemClass+'--selected');

      var newSelectedIndex = getSelectedDot(carousel);
      if(carousel.totTranslate == (- carousel.translateContainer - carousel.containerWidth)) {
        newSelectedIndex = carousel.navDots.length - 1;
      }
      Util.addClass(carousel.navDots[newSelectedIndex], carousel.options.navigationItemClass+'--selected');
    }

    (carousel.totTranslate == 0 && (carousel.totTranslate == (- carousel.translateContainer - carousel.containerWidth) || carousel.items.length <= carousel.visibItemsNb))
        ? Util.addClass(carousel.element, 'carousel--hide-controls')
        : Util.removeClass(carousel.element, 'carousel--hide-controls');
  };

  function emitCarouselUpdateEvent(carousel) {
    carousel.cloneList = [];
    var clones = carousel.element.querySelectorAll('.js-clone');
    for(var i = 0; i < clones.length; i++) {
      Util.removeClass(clones[i], 'js-clone');
      carousel.cloneList.push(clones[i]);
    }
    emitCarouselEvents(carousel, 'carousel-updated', carousel.cloneList);
  };

  function carouselCreateNavigation(carousel) {
    if(carousel.element.getElementsByClassName('js-carousel__navigation').length > 0) return;
  
    var navigation = document.createElement('ol'),
      navChildren = '';

    var navClasses = carousel.options.navigationClass+' js-carousel__navigation';
    if(carousel.items.length <= carousel.visibItemsNb) {
      navClasses = navClasses + ' is-hidden';
    }
    navigation.setAttribute('class', navClasses);

    var dotsNr = Math.ceil(carousel.items.length/carousel.visibItemsNb),
      selectedDot = getSelectedDot(carousel),
      indexClass = carousel.options.navigationPagination ? '' : 'sr-only'
    for(var i = 0; i < dotsNr; i++) {
      var className = (i == selectedDot) ? 'class="'+carousel.options.navigationItemClass+' '+carousel.options.navigationItemClass+'--selected js-carousel__nav-item"' :  'class="'+carousel.options.navigationItemClass+' js-carousel__nav-item"';
      navChildren = navChildren + '<li '+className+'><button class="reset js-tab-focus" style="outline: none;"><span class="'+indexClass+'">'+ (i+1) + '</span></button></li>';
    }
    navigation.innerHTML = navChildren;
    carousel.element.appendChild(navigation);
  };

  function carouselInitNavigationEvents(carousel) {
    carousel.navigation = carousel.element.getElementsByClassName('js-carousel__navigation')[0];
    carousel.navDots = carousel.element.getElementsByClassName('js-carousel__nav-item');
    carousel.navIdEvent = carouselNavigationClick.bind(carousel);
    carousel.navigation.addEventListener('click', carousel.navIdEvent);
  };

  function carouselRemoveNavigation(carousel) {
    if(carousel.navigation) carousel.element.removeChild(carousel.navigation);
    if(carousel.navIdEvent) carousel.navigation.removeEventListener('click', carousel.navIdEvent);
  };

  function resetDotsNavigation(carousel) {
    if(!carousel.options.nav) return;
    carouselRemoveNavigation(carousel);
    carouselCreateNavigation(carousel);
    carouselInitNavigationEvents(carousel);
  };

  function carouselNavigationClick(event) {
    var dot = event.target.closest('.js-carousel__nav-item');
    if(!dot) return;
    if(this.animating) return;
    this.animating = true;
    var index = Util.getIndexInArray(this.navDots, dot);
    this.selectedDotIndex = index;
    this.selectedItem = index*this.visibItemsNb;
    animateList(this, false, 'click');
  };

  function getSelectedDot(carousel) {
    return Math.ceil(carousel.selectedItem/carousel.visibItemsNb);
  };

  function initCarouselCounter(carousel) {
    if(carousel.counterTor.length > 0) carousel.counterTor[0].textContent = carousel.itemsNb;
    setCounterItem(carousel);
  };

  function setCounterItem(carousel) {
    if(carousel.counter.length == 0) return;
    var totalItems = carousel.selectedItem + carousel.visibItemsNb;
    if(totalItems > carousel.items.length) totalItems = carousel.items.length;
    carousel.counter[0].textContent = totalItems;
  };

  function centerItems(carousel) {
    if(!carousel.options.justifyContent) return;
    Util.toggleClass(carousel.list, 'justify-center', carousel.items.length < carousel.visibItemsNb);
  };

  function alignControls(carousel) {
    if(carousel.controls.length < 1 || !carousel.options.alignControls) return;
    if(!carousel.controlsAlignEl) {
      carousel.controlsAlignEl = carousel.element.querySelector(carousel.options.alignControls);
    }
    if(!carousel.controlsAlignEl) return;
    var translate = (carousel.element.offsetHeight - carousel.controlsAlignEl.offsetHeight);
    for(var i = 0; i < carousel.controls.length; i++) {
      carousel.controls[i].style.marginBottom = translate + 'px';
    }
  };

  function emitCarouselActiveItemsEvent(carousel) {
    emitCarouselEvents(carousel, 'carousel-active-items', {firstSelectedItem: carousel.selectedItem, visibleItemsNb: carousel.visibItemsNb});
  };

  function emitCarouselEvents(carousel, eventName, eventDetail) {
    var event = new CustomEvent(eventName, {detail: eventDetail});
    carousel.element.dispatchEvent(event);
  };

  function resetVisibilityOverflowItems(carousel, j) {
    if(!carousel.options.overflowItems) return;
    var itemWidth = carousel.containerWidth/carousel.items.length,
      delta = (window.innerWidth - itemWidth*carousel.visibItemsNb)/2,
      overflowItems = Math.ceil(delta/itemWidth);

    for(var i = 0; i < overflowItems; i++) {
      var indexPrev = j - 1 - i; // prev element
      if(indexPrev >= 0 ) carousel.items[indexPrev].removeAttribute('tabindex');
      var indexNext = j + carousel.visibItemsNb + i; // next element
      if(indexNext < carousel.items.length) carousel.items[indexNext].removeAttribute('tabindex');
    }
  };

  Carousel.defaults = {
    element : '',
    autoplay : false,
    autoplayInterval: 5000,
    loop: true,
    nav: false,
    navigationItemClass: 'carousel__nav-item',
    navigationClass: 'carousel__navigation',
    navigationPagination: false,
    drag: false,
    justifyContent: false,
    alignControls: false,
    overflowItems: false
  };

  window.Carousel = Carousel;

  //initialize the Carousel objects
  var carousels = document.getElementsByClassName('js-carousel'),
    flexSupported = Util.cssSupports('align-items', 'stretch'),
    transitionSupported = Util.cssSupports('transition'),
    cssPropertiesSupported = ('CSS' in window && CSS.supports('color', 'var(--color-var)'));

  if( carousels.length > 0) {
    for( var i = 0; i < carousels.length; i++) {
      (function(i){
        var autoplay = (carousels[i].getAttribute('data-autoplay') && carousels[i].getAttribute('data-autoplay') == 'on') ? true : false,
          autoplayInterval = (carousels[i].getAttribute('data-autoplay-interval')) ? carousels[i].getAttribute('data-autoplay-interval') : 5000,
          drag = (carousels[i].getAttribute('data-drag') && carousels[i].getAttribute('data-drag') == 'on') ? true : false,
          loop = (carousels[i].getAttribute('data-loop') && carousels[i].getAttribute('data-loop') == 'off') ? false : true,
          nav = (carousels[i].getAttribute('data-navigation') && carousels[i].getAttribute('data-navigation') == 'on') ? true : false,
          navigationItemClass = carousels[i].getAttribute('data-navigation-item-class') ? carousels[i].getAttribute('data-navigation-item-class') : 'carousel__nav-item',
          navigationClass = carousels[i].getAttribute('data-navigation-class') ? carousels[i].getAttribute('data-navigation-class') : 'carousel__navigation',
          navigationPagination = (carousels[i].getAttribute('data-navigation-pagination') && carousels[i].getAttribute('data-navigation-pagination') == 'on') ? true : false,
          overflowItems = (carousels[i].getAttribute('data-overflow-items') && carousels[i].getAttribute('data-overflow-items') == 'on') ? true : false,
          alignControls = carousels[i].getAttribute('data-align-controls') ? carousels[i].getAttribute('data-align-controls') : false,
          justifyContent = (carousels[i].getAttribute('data-justify-content') && carousels[i].getAttribute('data-justify-content') == 'on') ? true : false;
        new Carousel({element: carousels[i], autoplay : autoplay, autoplayInterval : autoplayInterval, drag: drag, ariaLive: true, loop: loop, nav: nav, navigationItemClass: navigationItemClass, navigationPagination: navigationPagination, navigationClass: navigationClass, overflowItems: overflowItems, justifyContent: justifyContent, alignControls: alignControls});
      })(i);
    }
  };
}());
// File#: _2_dropdown
// Usage: codyhouse.co/license
(function() {
	var Dropdown = function(element) {
		this.element = element;
		this.trigger = this.element.getElementsByClassName('js-dropdown__trigger')[0];
		this.dropdown = this.element.getElementsByClassName('js-dropdown__menu')[0];
		this.triggerFocus = false;
		this.dropdownFocus = false;
		this.hideInterval = false;
		// sublevels
		this.dropdownSubElements = this.element.getElementsByClassName('js-dropdown__sub-wrapper');
		this.prevFocus = false; // store element that was in focus before focus changed
		this.addDropdownEvents();
	};
	
	Dropdown.prototype.addDropdownEvents = function(){
		//place dropdown
		var self = this;
		this.placeElement();
		this.element.addEventListener('placeDropdown', function(event){
			self.placeElement();
		});
		// init dropdown
		this.initElementEvents(this.trigger, this.triggerFocus); // this is used to trigger the primary dropdown
		this.initElementEvents(this.dropdown, this.dropdownFocus); // this is used to trigger the primary dropdown
		// init sublevels
		this.initSublevels(); // if there are additional sublevels -> bind hover/focus events
	};

	Dropdown.prototype.placeElement = function() {
		// remove inline style first
		this.dropdown.removeAttribute('style');
		// check dropdown position
		var triggerPosition = this.trigger.getBoundingClientRect(),
			isRight = (window.innerWidth < triggerPosition.left + parseInt(getComputedStyle(this.dropdown).getPropertyValue('width')));

		var xPosition = isRight ? 'right: 0px; left: auto;' : 'left: 0px; right: auto;';
		this.dropdown.setAttribute('style', xPosition);
	};

	Dropdown.prototype.initElementEvents = function(element, bool) {
		var self = this;
		element.addEventListener('mouseenter', function(){
			bool = true;
			self.showDropdown();
		});
		element.addEventListener('focus', function(){
			self.showDropdown();
		});
		element.addEventListener('mouseleave', function(){
			bool = false;
			self.hideDropdown();
		});
		element.addEventListener('focusout', function(){
			self.hideDropdown();
		});
	};

	Dropdown.prototype.showDropdown = function(){
		if(this.hideInterval) clearInterval(this.hideInterval);
		// remove style attribute
		this.dropdown.removeAttribute('style');
		this.placeElement();
		this.showLevel(this.dropdown, true);
	};

	Dropdown.prototype.hideDropdown = function(){
		var self = this;
		if(this.hideInterval) clearInterval(this.hideInterval);
		this.hideInterval = setTimeout(function(){
			var dropDownFocus = document.activeElement.closest('.js-dropdown'),
				inFocus = dropDownFocus && (dropDownFocus == self.element);
			// if not in focus and not hover -> hide
			if(!self.triggerFocus && !self.dropdownFocus && !inFocus) {
				self.hideLevel(self.dropdown, true);
				// make sure to hide sub/dropdown
				self.hideSubLevels();
				self.prevFocus = false;
			}
		}, 300);
	};

	Dropdown.prototype.initSublevels = function(){
		var self = this;
		var dropdownMenu = this.element.getElementsByClassName('js-dropdown__menu');
		for(var i = 0; i < dropdownMenu.length; i++) {
			var listItems = dropdownMenu[i].children;
			// bind hover
	    new menuAim({
	      menu: dropdownMenu[i],
	      activate: function(row) {
	      	var subList = row.getElementsByClassName('js-dropdown__menu')[0];
	      	if(!subList) return;
	      	Util.addClass(row.querySelector('a'), 'dropdown__item--hover');
	      	self.showLevel(subList);
	      },
	      deactivate: function(row) {
	      	var subList = row.getElementsByClassName('dropdown__menu')[0];
	      	if(!subList) return;
	      	Util.removeClass(row.querySelector('a'), 'dropdown__item--hover');
	      	self.hideLevel(subList);
	      },
	      submenuSelector: '.js-dropdown__sub-wrapper',
	    });
		}
		// store focus element before change in focus
		this.element.addEventListener('keydown', function(event) { 
			if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
				self.prevFocus = document.activeElement;
			}
		});
		// make sure that sublevel are visible when their items are in focus
		this.element.addEventListener('keyup', function(event) {
			if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
				// focus has been moved -> make sure the proper classes are added to subnavigation
				var focusElement = document.activeElement,
					focusElementParent = focusElement.closest('.js-dropdown__menu'),
					focusElementSibling = focusElement.nextElementSibling;

				// if item in focus is inside submenu -> make sure it is visible
				if(focusElementParent && !Util.hasClass(focusElementParent, 'dropdown__menu--is-visible')) {
					self.showLevel(focusElementParent);
				}
				// if item in focus triggers a submenu -> make sure it is visible
				if(focusElementSibling && !Util.hasClass(focusElementSibling, 'dropdown__menu--is-visible')) {
					self.showLevel(focusElementSibling);
				}

				// check previous element in focus -> hide sublevel if required 
				if( !self.prevFocus) return;
				var prevFocusElementParent = self.prevFocus.closest('.js-dropdown__menu'),
					prevFocusElementSibling = self.prevFocus.nextElementSibling;
				
				if( !prevFocusElementParent ) return;
				
				// element in focus and element prev in focus are siblings
				if( focusElementParent && focusElementParent == prevFocusElementParent) {
					if(prevFocusElementSibling) self.hideLevel(prevFocusElementSibling);
					return;
				}

				// element in focus is inside submenu triggered by element prev in focus
				if( prevFocusElementSibling && focusElementParent && focusElementParent == prevFocusElementSibling) return;
				
				// shift tab -> element in focus triggers the submenu of the element prev in focus
				if( focusElementSibling && prevFocusElementParent && focusElementSibling == prevFocusElementParent) return;
				
				var focusElementParentParent = focusElementParent.parentNode.closest('.js-dropdown__menu');
				
				// shift tab -> element in focus is inside the dropdown triggered by a siblings of the element prev in focus
				if(focusElementParentParent && focusElementParentParent == prevFocusElementParent) {
					if(prevFocusElementSibling) self.hideLevel(prevFocusElementSibling);
					return;
				}
				
				if(prevFocusElementParent && Util.hasClass(prevFocusElementParent, 'dropdown__menu--is-visible')) {
					self.hideLevel(prevFocusElementParent);
				}
			}
		});
	};

	Dropdown.prototype.hideSubLevels = function(){
		var visibleSubLevels = this.dropdown.getElementsByClassName('dropdown__menu--is-visible');
		if(visibleSubLevels.length == 0) return;
		while (visibleSubLevels[0]) {
			this.hideLevel(visibleSubLevels[0]);
	 	}
	 	var hoveredItems = this.dropdown.getElementsByClassName('dropdown__item--hover');
	 	while (hoveredItems[0]) {
			Util.removeClass(hoveredItems[0], 'dropdown__item--hover');
	 	}
	};

	Dropdown.prototype.showLevel = function(level, bool){
		if(bool == undefined) {
			//check if the sublevel needs to be open to the left
			Util.removeClass(level, 'dropdown__menu--left');
			var boundingRect = level.getBoundingClientRect();
			if(window.innerWidth - boundingRect.right < 5 && boundingRect.left + window.scrollX > 2*boundingRect.width) Util.addClass(level, 'dropdown__menu--left');
		}
		Util.addClass(level, 'dropdown__menu--is-visible');
		Util.removeClass(level, 'dropdown__menu--is-hidden');
	};

	Dropdown.prototype.hideLevel = function(level, bool){
		if(!Util.hasClass(level, 'dropdown__menu--is-visible')) return;
		Util.removeClass(level, 'dropdown__menu--is-visible');
		Util.addClass(level, 'dropdown__menu--is-hidden');
		
		level.addEventListener('transitionend', function cb(event){
			if(event.propertyName != 'opacity') return;
			level.removeEventListener('transitionend', cb);
			Util.removeClass(level, 'dropdown__menu--is-hidden dropdown__menu--left');
			if(bool && !Util.hasClass(level, 'dropdown__menu--is-visible')) level.setAttribute('style', 'width: 0px');
		});
	};

	window.Dropdown = Dropdown;

	var dropdown = document.getElementsByClassName('js-dropdown');
	if( dropdown.length > 0 ) { // init Dropdown objects
		for( var i = 0; i < dropdown.length; i++) {
			(function(i){new Dropdown(dropdown[i]);})(i);
		}
	}
}());
// File#: _2_flexi-header
// Usage: codyhouse.co/license
(function() {
  var flexHeader = document.getElementsByClassName('js-f-header');
	if(flexHeader.length > 0) {
		var menuTrigger = flexHeader[0].getElementsByClassName('js-anim-menu-btn')[0],
			firstFocusableElement = getMenuFirstFocusable();

		// we'll use these to store the node that needs to receive focus when the mobile menu is closed 
		var focusMenu = false;

		resetFlexHeaderOffset();

		menuTrigger.addEventListener('anim-menu-btn-clicked', function(event){
			toggleMenuNavigation(event.detail);
		});

		// listen for key events
		window.addEventListener('keyup', function(event){
			// listen for esc key
			if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
				// close navigation on mobile if open
				if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger)) {
					focusMenu = menuTrigger; // move focus to menu trigger when menu is close
					menuTrigger.click();
				}
			}
			// listen for tab key
			if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) {
				// close navigation on mobile if open when nav loses focus
				if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger) && !document.activeElement.closest('.js-f-header')) menuTrigger.click();
			}
		});

		// listen for resize
		var resizingId = false;
		window.addEventListener('resize', function() {
			clearTimeout(resizingId);
			resizingId = setTimeout(doneResizing, 500);
		});

		function getMenuFirstFocusable() {
			var focusableEle = flexHeader[0].getElementsByClassName('f-header__nav')[0].querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'),
				firstFocusable = false;
			for(var i = 0; i < focusableEle.length; i++) {
				if( focusableEle[i].offsetWidth || focusableEle[i].offsetHeight || focusableEle[i].getClientRects().length ) {
					firstFocusable = focusableEle[i];
					break;
				}
			}

			return firstFocusable;
    };
    
    function isVisible(element) {
      return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
		};

		function doneResizing() {
			if( !isVisible(menuTrigger) && Util.hasClass(flexHeader[0], 'f-header--expanded')) {
				menuTrigger.click();
			}
			resetFlexHeaderOffset();
		};
		
		function toggleMenuNavigation(bool) { // toggle menu visibility on small devices
			Util.toggleClass(document.getElementsByClassName('f-header__nav')[0], 'f-header__nav--is-visible', bool);
			Util.toggleClass(flexHeader[0], 'f-header--expanded', bool);
			menuTrigger.setAttribute('aria-expanded', bool);
			if(bool) firstFocusableElement.focus(); // move focus to first focusable element
			else if(focusMenu) {
				focusMenu.focus();
				focusMenu = false;
			}
		};

		function resetFlexHeaderOffset() {
			// on mobile -> update max height of the flexi header based on its offset value (e.g., if there's a fixed pre-header element)
			document.documentElement.style.setProperty('--f-header-offset', flexHeader[0].getBoundingClientRect().top+'px');
		};
	}
}());
// File#: _2_floating-side-nav
// Usage: codyhouse.co/license
(function() {
  var FSideNav = function(element) {
		this.element = element;
    this.triggers = document.querySelectorAll('[aria-controls="'+this.element.getAttribute('id')+'"]');
    this.list = this.element.getElementsByClassName('js-float-sidenav__list')[0];
    this.anchors = this.list.querySelectorAll('a[href^="#"]');
    this.sections = getSections(this);
    this.sectionsContainer = document.getElementsByClassName('js-float-sidenav-target');
		this.firstFocusable = getFSideNavFirstFocusable(this);
		this.selectedTrigger = null;
    this.showClass = "float-sidenav--is-visible";
    this.clickScrolling = false;
    this.intervalID = false;
		initFSideNav(this);
  };

  function getSections(nav) {
    var sections = [];
    // get all content sections
    for(var i = 0; i < nav.anchors.length; i++) {
      var section = document.getElementById(nav.anchors[i].getAttribute('href').replace('#', ''));
      if(section) sections.push(section);
    }
    return sections;
  };

  function getFSideNavFirstFocusable(nav) {
    var focusableEle = nav.element.querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'),
				firstFocusable = false;
    for(var i = 0; i < focusableEle.length; i++) {
      if( focusableEle[i].offsetWidth || focusableEle[i].offsetHeight || focusableEle[i].getClientRects().length ) {
        firstFocusable = focusableEle[i];
        break;
      }
    }

    return firstFocusable;
  };
  
  function initFSideNav(nav) {
    initButtonTriggers(nav); // mobile version behaviour

    initAnchorEvents(nav); // select anchor in list

    if(intersectionObserverSupported) {
      initSectionScroll(nav); // update anchor appearance on scroll
    } else {
      Util.addClass(nav.element, 'float-sidenav--on-target');
    }
  };

  function initButtonTriggers(nav) { // mobile only
    if ( !nav.triggers ) return;

    for(var i = 0; i < nav.triggers.length; i++) {
      nav.triggers[i].addEventListener('click', function(event) {
        openFSideNav(nav, event);
      });
    }

    // close side nav when clicking on close button/bg layer
    nav.element.addEventListener('click', function(event) {
      if(event.target.closest('.js-float-sidenav__close-btn') || Util.hasClass(event.target, 'js-float-sidenav')) {
        closeFSideNav(nav, event);
      }
    });

    // listen for key events
		window.addEventListener('keyup', function(event){
			// listen for esc key
			if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
				// close navigation on mobile if open
				closeFSideNav(nav, event);
			}
			// listen for tab key
			if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) { // close navigation on mobile if open when nav loses focus
        if( !document.activeElement.closest('.js-float-sidenav')) closeFSideNav(nav, event, true);
			}
		});
  };

  function openFSideNav(nav, event) { // open side nav - mobile only
    event.preventDefault();
    nav.selectedTrigger = event.target;
    event.target.setAttribute('aria-expanded', 'true');
    Util.addClass(nav.element, nav.showClass);
    nav.element.addEventListener('transitionend', function cb(event){
      nav.element.removeEventListener('transitionend', cb);
      nav.firstFocusable.focus();
    });
  };

  function closeFSideNav(nav, event, bool) { // close side nav - mobile only
    if( !Util.hasClass(nav.element, nav.showClass) ) return;
    if(event) event.preventDefault();
    Util.removeClass(nav.element, nav.showClass);
    if(!nav.selectedTrigger) return;
    nav.selectedTrigger.setAttribute('aria-expanded', 'false');
    if(!bool) nav.selectedTrigger.focus();
    nav.selectedTrigger = false; 
  };

  function initAnchorEvents(nav) {
    nav.list.addEventListener('click', function(event){
      var anchor = event.target.closest('a[href^="#"]');
      if(!anchor || Util.hasClass(anchor, 'float-sidenav__link--selected')) return;
      if(nav.clickScrolling) { // a different link has already been clicked
        event.preventDefault();
        return;
      }
      // reset link apperance 
      nav.clickScrolling = true;
      resetAnchors(nav, anchor);
      closeFSideNav(nav, false, true);
      if(!canScroll()) window.dispatchEvent(new CustomEvent('scroll'));
    });
  };

  function canScroll() {
    var pageHeight = document.documentElement.offsetHeight,
      windowHeight = window.innerHeight,
      scrollPosition = window.scrollY || window.pageYOffset || document.body.scrollTop + (document.documentElement && document.documentElement.scrollTop || 0);
    
    return !(pageHeight - 2 <= windowHeight + scrollPosition);
  };

  function resetAnchors(nav, anchor) {
    if(!intersectionObserverSupported) return;
    for(var i = 0; i < nav.anchors.length; i++) Util.removeClass(nav.anchors[i], 'float-sidenav__link--selected');
    if(anchor) Util.addClass(anchor, 'float-sidenav__link--selected');
  };

  function initSectionScroll(nav) {
    // check when a new section enters the viewport
    var observer = new IntersectionObserver(
      function(entries, observer) { 
        entries.forEach(function(entry){
          var threshold = entry.intersectionRatio.toFixed(1);
          
          if(!nav.clickScrolling) { // do not update classes if user clicked on a link
            getVisibleSection(nav);
          }

          // if first section is not inside the viewport - reset anchors
          if(nav.sectionsContainer && entry.target == nav.sections[0] && threshold == 0 && nav.sections[0].getBoundingClientRect().top > 0) {
            setSectionsLimit(nav);
          }
        });

        // check if there's a selected dot and toggle the --on-target class from the nav
        Util.toggleClass(nav.element, 'float-sidenav--on-target', nav.list.getElementsByClassName('float-sidenav__link--selected').length != 0);
      }, 
      {
        rootMargin: "0px 0px -50% 0px"
      }
    );

    for(var i = 0; i < nav.sections.length; i++) {
      observer.observe(nav.sections[i]);
    }

    // detect when sections container is inside/outside the viewport
    if(nav.sectionsContainer) {
      var containerObserver = new IntersectionObserver(
        function(entries, observer) { 
          entries.forEach(function(entry){
            var threshold = entry.intersectionRatio.toFixed(1);

            if(entry.target.getBoundingClientRect().top < 0) {
              if(threshold == 0) {
                setSectionsLimit(nav);
              } else {
                activateLastSection(nav);
              }
            }
          });
        },
        {threshold: [0, 0.1, 1]}
      );

      containerObserver.observe(nav.sectionsContainer[0]);
    }

    // detect the end of scrolling -> reactivate IntersectionObserver on scroll
    nav.element.addEventListener('float-sidenav-scroll', function(event){
      if(!nav.clickScrolling) getVisibleSection(nav);
      nav.clickScrolling = false;
    });
  };

  function setSectionsLimit(nav) {
    if(!nav.clickScrolling) resetAnchors(nav, false);
    Util.removeClass(nav.element, 'float-sidenav--on-target');
  };

  function activateLastSection(nav) {
    Util.addClass(nav.element, 'float-sidenav--on-target');
    if(nav.list.getElementsByClassName('float-sidenav__link--selected').length == 0 ) {
      Util.addClass(nav.anchors[nav.anchors.length - 1], 'float-sidenav__link--selected');
    }
  };

  function getVisibleSection(nav) {
    if(nav.intervalID) return;
    nav.intervalID = setTimeout(function(){
      var halfWindowHeight = window.innerHeight/2,
      index = -1;
      for(var i = 0; i < nav.sections.length; i++) {
        var top = nav.sections[i].getBoundingClientRect().top;
        if(top < halfWindowHeight) index = i;
      }
      if(index > -1) {
        resetAnchors(nav, nav.anchors[index]);
      }
      nav.intervalID = false;
    }, 100);
  };

  //initialize the Side Nav objects
  var fixedNav = document.getElementsByClassName('js-float-sidenav'),
    intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
  
  var fixedNavArray = [];
	if( fixedNav.length > 0 ) {
		for( var i = 0; i < fixedNav.length; i++) {
			(function(i){ fixedNavArray.push(new FSideNav(fixedNav[i])) ; })(i);
    }
    
    // listen to window scroll -> reset clickScrolling property
    var scrollId = false,
      customEvent = new CustomEvent('float-sidenav-scroll');
      
    window.addEventListener('scroll', function() {
      clearTimeout(scrollId);
      scrollId = setTimeout(doneScrolling, 100);
    });

    function doneScrolling() {
      for( var i = 0; i < fixedNavArray.length; i++) {
        (function(i){fixedNavArray[i].element.dispatchEvent(customEvent)})(i);
      };
    };
	}
}());
// File#: _2_footnotes
// Usage: codyhouse.co/license
(function() {
	var Footnote = function(element) {
		this.element = element;
		this.link = this.element.getElementsByClassName('footnotes__back-link')[0];
		this.contentLink = document.getElementById(this.link.getAttribute('href').replace('#', ''));
		this.initFootnote();
	};

	Footnote.prototype.initFootnote = function() {
		Util.setAttributes(this.contentLink, {
			'aria-label': 'Footnote: '+this.element.getElementsByClassName('js-footnote__label')[0].textContent,
			'data-tooltip-class': 'tooltip--lg tooltip--sticky',
			'data-tooltip-describedby': 'false',
			'title': this.getFootnoteContent(),
		});
		new Tooltip(this.contentLink);
	};

	Footnote.prototype.getFootnoteContent = function() {
		var clone = this.element.cloneNode(true);
		clone.removeChild(clone.getElementsByClassName('footnotes__back-link')[0]);
		return clone.innerHTML;
	};

	//initialize the Footnote objects
	var footnotes = document.getElementsByClassName('js-footnotes__item');
	if( footnotes.length > 0 ) {
		for( var i = 0; i < footnotes.length; i++) {
			(function(i){new Footnote(footnotes[i]);})(i);
		}
	}
}());
// File#: _2_full-screen-select
(function() {
	var CustomSelect = function(element) {
		this.element = element;
		this.items = this.element.children;
		initCustomSelect(this);
	};

	function initCustomSelect(select) {
		// arrow navigation
		select.element.addEventListener('keydown', function(event){
			if( event.keyCode && event.keyCode == 40 || event.key && event.key.toLowerCase() == 'arrowdown' ) {
				selectOption(select, 1); // go to next option
			} else if( event.keyCode && event.keyCode == 38 || event.key && event.key.toLowerCase() == 'arrowup' ) {
				selectOption(select, -1); // go to prev option
			}
		});
	};

	function selectOption(select, direction) {
		var focusElement = document.activeElement,
			index = Util.getIndexInArray(select.items, focusElement.closest('li'));
		if(index < 0) return;
		index = index + direction;
		if( index < 0 ) index = select.items.length - 1;
		if( index >= select.items.length) index = 0;
		Util.moveFocus(select.items[index].getElementsByTagName(focusElement.tagName)[0]);
	};

	//initialize the CustomSelect objects
	var customSelect = document.getElementsByClassName('js-full-screen-select');
	if( customSelect.length > 0 ) {
		for( var i = 0; i < customSelect.length; i++) {
			(function(i){new CustomSelect(customSelect[i]);})(i);
		}
	}
}());
// File#: _2_grid-switch
// Usage: codyhouse.co/license
(function() {
  var GridSwitch = function(element) {
    this.element = element;
    this.controller = this.element.getElementsByClassName('js-grid-switch__controller')[0];
    this.items = this.element.getElementsByClassName('js-grid-switch__item');
    this.contentElements = this.element.getElementsByClassName('js-grid-switch__content');
    // store custom classes
    this.classList = [[this.element.getAttribute('data-gs-item-class-1'), this.element.getAttribute('data-gs-content-class-1')], [this.element.getAttribute('data-gs-item-class-2'), this.element.getAttribute('data-gs-content-class-2')]];
    initGridSwitch(this);
  };

  function initGridSwitch(element) {
    // get selected state and apply style
    var selectedInput = element.controller.querySelector('input:checked');
    if(selectedInput) {
      setGridAppearance(element, selectedInput.value);
    }
    // reveal grid
    Util.addClass(element.element, 'grid-switch--is-visible');
    // a new layout has been selected 
    element.controller.addEventListener('change', function(event) {
      setGridAppearance(element, event.target.value);
    });
  };

  function setGridAppearance(element, value) {
    var newStatus = parseInt(value) - 1,
      oldStatus = newStatus == 1 ? 0 : 1;
      
    for(var i = 0; i < element.items.length; i++) {
      Util.removeClass(element.items[i], element.classList[oldStatus][0]);
      Util.removeClass(element.contentElements[i], element.classList[oldStatus][1]);
      Util.addClass(element.items[i], element.classList[newStatus][0]);
      Util.addClass(element.contentElements[i], element.classList[newStatus][1]);
    }
  };

  //initialize the GridSwitch objects
	var gridSwitch = document.getElementsByClassName('js-grid-switch');
	if( gridSwitch.length > 0 ) {
		for( var i = 0; i < gridSwitch.length; i++) {
			(function(i){new GridSwitch(gridSwitch[i]);})(i);
    }
  }
}());
// File#: _2_image-comparison-slider
// Usage: codyhouse.co/license
(function() {
  var ComparisonSlider = function(element) {
    this.element = element;
    this.modifiedImg = this.element.getElementsByClassName('js-compare-slider__img--modified')[0];
    this.handle = this.element.getElementsByClassName('js-compare-slider__handle')[0];
    this.keyboardHandle = this.element.getElementsByClassName('js-compare-slider__input-handle')[0];
    this.captions = this.element.getElementsByClassName('js-compare-slider__caption');
    // drag
    this.dragStart = false;
    this.animating = false;
    this.leftPosition = 50;
    // store container width
    this.sliderWidth = getSliderWidth(this);
    initComparisonSlider(this);
  };

  function getSliderWidth(slider) {
    return slider.element.offsetWidth;
  };

  function initComparisonSlider(slider) {
    // initial animation
    if(reducedMotion) { // do not animate slider elements
      Util.addClass(slider.element, 'compare-slider--reduced-motion compare-slider--in-viewport');
    } else if(intersectionObserverSupported) { // reveal slider elements when it enters the viewport
      var observer = new IntersectionObserver(sliderObserve.bind(slider), { threshold: [0, 0.3] });
      observer.observe(slider.element);
      modifiedImgAnimation(slider);
    } else { // reveal slider elements right away
      Util.addClass(slider.element, 'compare-slider--in-viewport');
      modifiedImgAnimation(slider);
    }
    // init drag functionality
    new SwipeContent(slider.element);
    slider.element.addEventListener('dragStart', function(event){
      if(!event.detail.origin.closest('.js-compare-slider__handle')) return;
      Util.addClass(slider.element, 'compare-slider--is-dragging');
      if(!slider.dragStart) {
        slider.dragStart = event.detail.x;
        detectDragEnd(slider);
      }
    });
    // slider.element.addEventListener('dragging', function(event){
    slider.element.addEventListener('mousemove', function(event){
      sliderDragging(slider, event)
    });
    slider.element.addEventListener('touchmove', function(event){
      sliderDragging(slider, event)
    });

    // detect mouse leave
    slider.element.addEventListener('mouseleave', function(event){
      sliderResetDragging(slider, event);
    });
    slider.element.addEventListener('touchend', function(event){
      sliderResetDragging(slider, event);
    });

    // on resize -> update slider width
    window.addEventListener('resize', function(){
      slider.sliderWidth = getSliderWidth(slider);
    });

    // detect change in keyboardHandle input -> allow keyboard navigation
    slider.keyboardHandle.addEventListener('change', function(event){
      slider.leftPosition = Number(slider.keyboardHandle.value);
      updateCompareSlider(slider, 0);
    });
  };

  function modifiedImgAnimation(slider) {
    // make sure modified img animation runs only one time
    slider.modifiedImg.addEventListener('animationend', function cb() {
      slider.modifiedImg.removeEventListener('animationend', cb);
      slider.modifiedImg.style.animation = 'none';
    });
  };

  function sliderDragging(slider, event) {
    if(!slider.dragStart) return;
    var pageX = event.pageX || event.touches[0].pageX;
    if(slider.animating || Math.abs(pageX - slider.dragStart) < 5) return;
    slider.animating = true;
    updateCompareSlider(slider, pageX - slider.dragStart);
    slider.dragStart = pageX;
  };

  function sliderResetDragging(slider, event) {
    if(!slider.dragStart) return;
    if(event.pageX < slider.element.offsetLeft) {
      slider.leftPosition = 0;
      updateCompareSlider(slider, 0);
    }
    if(event.pageX > slider.element.offsetLeft + slider.element.offsetWidth) {
      slider.leftPosition = 100;
      updateCompareSlider(slider, 0);
    }
  };

  function sliderObserve(entries, observer) {
    if(entries[0].intersectionRatio.toFixed(1) > 0) { // reveal slider elements when in viewport
      Util.addClass(this.element, 'compare-slider--in-viewport');
      observer.unobserve(this.element);
    }
  };

  function detectDragEnd(slider) {
    document.addEventListener('click', function cb(event){
      document.removeEventListener('click', cb);
      Util.removeClass(slider.element, 'compare-slider--is-dragging');
      updateCompareSlider(slider, event.detail.x - slider.dragStart);
      slider.dragStart = false;
    });
  };

  function updateCompareSlider(slider, delta) {
    var percentage = (delta*100/slider.sliderWidth);
    if(isNaN(percentage)) return;
    slider.leftPosition = Number((slider.leftPosition + percentage).toFixed(2));
    if(slider.leftPosition < 0) slider.leftPosition = 0;
    if(slider.leftPosition > 100) slider.leftPosition = 100; 
    // update slider elements -> modified img width + handle position + input element (keyboard accessibility)
    slider.keyboardHandle.value = slider.leftPosition;
    slider.handle.style.left = slider.leftPosition + '%';
    slider.modifiedImg.style.width = slider.leftPosition + '%'; 
    updateCompareLabels(slider);
    slider.animating = false;
  };

  function updateCompareLabels(slider) { // update captions visibility
    for(var i = 0; i < slider.captions.length; i++) {
      var delta = ( i == 0 ) 
        ? slider.captions[i].offsetLeft - slider.modifiedImg.offsetLeft - slider.modifiedImg.offsetWidth
        : slider.modifiedImg.offsetLeft + slider.modifiedImg.offsetWidth - slider.captions[i].offsetLeft - slider.captions[i].offsetWidth;
      Util.toggleClass(slider.captions[i], 'compare-slider__caption--is-hidden', delta < 10);
    }
  };

  window.ComparisonSlider = ComparisonSlider;
  
  //initialize the ComparisonSlider objects
  var comparisonSliders = document.getElementsByClassName('js-compare-slider'),
    intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype),
    reducedMotion = Util.osHasReducedMotion();
	if( comparisonSliders.length > 0 ) {
		for( var i = 0; i < comparisonSliders.length; i++) {
			(function(i){
        new ComparisonSlider(comparisonSliders[i]);
      })(i);
    }
	}
}());
// File#: _2_image-zoom
// Usage: codyhouse.co/license

(function() {
  var ImageZoom = function(element, index) {
    this.element = element;
    this.lightBoxId = 'img-zoom-lightbox--'+index;
    this.imgPreview = this.element.getElementsByClassName('js-image-zoom__preview')[0];
    
    initImageZoomHtml(this); // init markup
    
    this.lightbox = document.getElementById(this.lightBoxId);
    this.imgEnlg = this.lightbox.getElementsByClassName('js-image-zoom__fw')[0];
    this.input = this.element.getElementsByClassName('js-image-zoom__input')[0];
    this.animate = this.element.getAttribute('data-morph') != 'off';
    
    initImageZoomEvents(this); //init events
  };

  function initImageZoomHtml(imageZoom) {
    // get zoomed image url
    var url = imageZoom.element.getAttribute('data-img');
    if(!url) url = imageZoom.imgPreview.getAttribute('src');

    var lightBox = document.createElement('div');
    Util.setAttributes(lightBox, {class: 'image-zoom__lightbox js-image-zoom__lightbox', id: imageZoom.lightBoxId, 'aria-hidden': 'true'});
    lightBox.innerHTML = '<img src="'+url+'" class="js-image-zoom__fw"></img>';
    document.body.appendChild(lightBox);
    
    var keyboardInput = '<input aria-hidden="true" type="checkbox" class="image-zoom__input js-image-zoom__input"></input>';
    imageZoom.element.insertAdjacentHTML('afterbegin', keyboardInput);

  };

  function initImageZoomEvents(imageZoom) {
    // toggle lightbox on click
    imageZoom.imgPreview.addEventListener('click', function(event){
      toggleFullWidth(imageZoom, true);
      imageZoom.input.checked = true;
    });
    imageZoom.lightbox.addEventListener('click', function(event){
      toggleFullWidth(imageZoom, false);
      imageZoom.input.checked = false;
    });
    // detect swipe down to close lightbox
    new SwipeContent(imageZoom.lightbox);
    imageZoom.lightbox.addEventListener('swipeDown', function(event){
      toggleFullWidth(imageZoom, false);
      imageZoom.input.checked = false;
    });
    // keyboard accessibility
    imageZoom.input.addEventListener('change', function(event){
      toggleFullWidth(imageZoom, imageZoom.input.checked);
    });
    imageZoom.input.addEventListener('keydown', function(event){
      if( (event.keyCode && event.keyCode == 13) || (event.key && event.key.toLowerCase() == 'enter') ) {
        imageZoom.input.checked = !imageZoom.input.checked;
        toggleFullWidth(imageZoom, imageZoom.input.checked);
      }
    });
  };

  function toggleFullWidth(imageZoom, bool) {
    if(animationSupported && imageZoom.animate) { // start expanding animation
      window.requestAnimationFrame(function(){
        animateZoomImage(imageZoom, bool);
      });
    } else { // show lightbox without animation
      Util.toggleClass(imageZoom.lightbox, 'image-zoom__lightbox--is-visible', bool);
    }
  };

  function animateZoomImage(imageZoom, bool) {
    // get img preview position and dimension for the morphing effect
    var rect = imageZoom.imgPreview.getBoundingClientRect(),
      finalWidth = imageZoom.lightbox.getBoundingClientRect().width;
    var init = (bool) ? [rect.top, rect.left, rect.width] : [0, 0, finalWidth],
      final = (bool) ? [-rect.top, -rect.left, parseFloat(finalWidth/rect.width)] : [rect.top + imageZoom.lightbox.scrollTop, rect.left, parseFloat(rect.width/finalWidth)];
    
    if(bool) {
      imageZoom.imgEnlg.setAttribute('style', 'top: '+init[0]+'px; left:'+init[1]+'px; width:'+init[2]+'px;');
    }
    
    // show modal
    Util.removeClass(imageZoom.lightbox, 'image-zoom__lightbox--no-transition');
    Util.addClass(imageZoom.lightbox, 'image-zoom__lightbox--is-visible');

    imageZoom.imgEnlg.addEventListener('transitionend', function cb(event){ // reset elements once animation is over
      if(!bool) Util.removeClass(imageZoom.lightbox, 'image-zoom__lightbox--is-visible');
      Util.addClass(imageZoom.lightbox, 'image-zoom__lightbox--no-transition');
      imageZoom.imgEnlg.removeAttribute('style');
      imageZoom.imgEnlg.removeEventListener('transitionend', cb);
    });
    
    // animate image and bg
    imageZoom.imgEnlg.style.transform = 'translateX('+final[1]+'px) translateY('+final[0]+'px) scale('+final[2]+')';
    Util.toggleClass(imageZoom.lightbox, 'image-zoom__lightbox--animate-bg', bool);
  };

  // init ImageZoom object
  var imageZoom = document.getElementsByClassName('js-image-zoom'),
    animationSupported = window.requestAnimationFrame && !Util.osHasReducedMotion();
  if( imageZoom.length > 0 ) {
    var imageZoomArray = [];
    for( var i = 0; i < imageZoom.length; i++) {
      imageZoomArray.push(new ImageZoom(imageZoom[i], i));
    }

    // close Zoom Image lightbox on Esc
    window.addEventListener('keydown', function(event){
      if((event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'esc')) {
        for( var i = 0; i < imageZoomArray.length; i++) {
          imageZoomArray[i].input.checked = false;
          if(Util.hasClass(imageZoomArray[i].lightbox, 'image-zoom__lightbox--is-visible')) toggleFullWidth(imageZoomArray[i], false);
        }
      }
    });
  }
}());
// File#: _2_main-header-v3
// Usage: codyhouse.co/license
(function() {
	var mainHeader = document.getElementsByClassName('js-header-v3');
	if(mainHeader.length > 0) {
		var menuTrigger = mainHeader[0].getElementsByClassName('js-toggle-menu')[0],
			searchTrigger = mainHeader[0].getElementsByClassName('js-toggle-search'),
			navigation = mainHeader[0].getElementsByClassName('header-v3__nav')[0];

		// we'll use these to store the node that needs to receive focus when the mobile menu/search input are closed 
		var focusSearch = false,
			focusMenu = false;
			
		// set delays for list items inside navigation -> mobile animation
		var navItems = Util.getChildrenByClassName(navigation.getElementsByClassName('header-v3__nav-list')[0], 'header-v3__nav-item');
		for(var i = 0; i < navItems.length; i++) {
			setTransitionDelay(navItems[i], i);
		}
		// toggle navigation on mobile
		menuTrigger.addEventListener('switch-icon-clicked', function(event){ // toggle menu visibility an small devices
			toggleNavigation(event.detail);
		});
		// toggle search on desktop
		if(searchTrigger.length > 0) {
			searchTrigger[0].addEventListener('switch-icon-clicked', function(event){ // toggle menu visibility an small devices
				toggleSearch(event.detail);
			});
		}
		
		window.addEventListener('keyup', function(event){
			// listen for esc key events
			if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
				// close navigation on mobile if open
				if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger)) {
					focusMenu = menuTrigger; // move focus to menu trigger when menu is close
					menuTrigger.click();
				}
				// close search if open
				if(searchTrigger.length > 0 && searchTrigger[0].getAttribute('aria-expanded') == 'true' && isVisible(searchTrigger[0])) {
					focusSearch = searchTrigger[0]; // move focus to search trigger when search is close
					searchTrigger[0].click();
				}
			}
			// listen for tab key
			if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) {
				// close navigation on mobile if open when nav loses focus
				if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger) && !document.activeElement.closest('.js-header-v3')) menuTrigger.click();
			}
		});

		// listen for resize
		var resizingId = false;
		window.addEventListener('resize', function() {
			clearTimeout(resizingId);
			resizingId = setTimeout(doneResizing, 300);
		});

		function toggleNavigation(bool) {
			Util.addClass(navigation, 'header-v3__nav--is-visible');
			Util.addClass(menuTrigger, 'switch-icon--disabled');
			menuTrigger.setAttribute('aria-expanded', bool);
			// animate navigation height
			var finalHeight = bool ? window.innerHeight: 0,
				initHeight = bool ? 0 : window.innerHeight; 
			navigation.style.height = initHeight+'px';

			setTimeout(function(){
				navigation.style.height = finalHeight+'px';
				Util.toggleClass(navigation, 'header-v3__nav--animate-children', bool);
			}, 50);

			navigation.addEventListener('transitionend', function cb(event){
				if (event.propertyName !== 'height') return;
				if(finalHeight > 0) {
					var firstFocusableElement = getMenuFirstFocusable();
					firstFocusableElement.focus(); // move focus to first focusable element
				} else {
					Util.removeClass(navigation, 'header-v3__nav--is-visible header-v3__nav--animate-children');
					if(focusMenu) { // we may need to move the focus to a new element
						focusMenu.focus();
						focusMenu = false;
					}
				}
				
				navigation.removeEventListener('transitionend', cb);
				navigation.removeAttribute('style');
				Util.removeClass(menuTrigger, 'switch-icon--disabled');
			});
			// toggle expanded class to header
			Util.toggleClass(mainHeader[0], 'header-v3--expanded', bool);
		};

		function toggleSearch(bool){
			Util.addClass(searchTrigger[0], 'switch-icon--disabled');
			Util.toggleClass(mainHeader[0], 'header-v3--show-search', bool);
			searchTrigger[0].setAttribute('aria-expanded', bool);
			mainHeader[0].addEventListener('transitionend', function cb(){
				mainHeader[0].removeEventListener('transitionend', cb);
				Util.removeClass(searchTrigger[0], 'switch-icon--disabled');
				if(bool) mainHeader[0].getElementsByClassName('header-v3__nav-item--search-form')[0].getElementsByTagName('input')[0].focus();
				else if(focusSearch) {// move focus to a new element when closing the search
					focusSearch.focus();
					focusSearch = false;
				}
			});

			// toggle expanded class to header
			Util.toggleClass(mainHeader[0], 'header-v3--expanded', bool);
		};

		function doneResizing() {
			// check if main nav is visible (small devices only)
			if( !isVisible(menuTrigger) && menuTrigger.getAttribute('aria-expanded') == 'true') menuTrigger.click();
			// check if search input is visible
			if( searchTrigger.length > 0 && !isVisible(searchTrigger[0]) && searchTrigger[0].getAttribute('aria-expanded') == 'true') searchTrigger[0].click();
		};

		function getMenuFirstFocusable() {
			var focusableEle = mainHeader[0].getElementsByClassName('header-v3__nav')[0].querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'),
				firstFocusable = false;
			for(var i = 0; i < focusableEle.length; i++) {
				if( focusableEle[i].offsetWidth || focusableEle[i].offsetHeight || focusableEle[i].getClientRects().length ) {
					firstFocusable = focusableEle[i];
					break;
				}
			}

			return firstFocusable;
		};

		function setTransitionDelay(element, index) {
			element.style.transitionDelay = parseFloat((index/20) + 0.1).toFixed(2)+'s';
		};

		function isVisible(element) {
			return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
		};
	}
}());
// File#: _2_modal-video
// Usage: codyhouse.co/license
(function() {
	var ModalVideo = function(element) {
		this.element = element;
		this.modalContent = this.element.getElementsByClassName('js-modal-video__content')[0];
		this.media = this.element.getElementsByClassName('js-modal-video__media')[0];
		this.contentIsIframe = this.media.tagName.toLowerCase() == 'iframe';
		this.modalIsOpen = false;
		this.initModalVideo();
	};

	ModalVideo.prototype.initModalVideo = function() {
		var self = this;
		// reveal modal content when iframe is ready
		this.addLoadListener();
		// listen for the modal element to be open -> set new iframe src attribute
		this.element.addEventListener('modalIsOpen', function(event){
			self.modalIsOpen = true;
			self.media.setAttribute('src', event.detail.closest('[aria-controls]').getAttribute('data-url'));
		});
		// listen for the modal element to be close -> reset iframe and hide modal content
		this.element.addEventListener('modalIsClose', function(event){
			self.modalIsOpen = false;
			Util.addClass(self.element, 'modal--is-loading');
			self.media.setAttribute('src', '');
		});
	};

	ModalVideo.prototype.addLoadListener = function() {
		var self = this;
		if(this.contentIsIframe) {
			this.media.onload = function () {
				self.revealContent();
			};
		} else {
			this.media.addEventListener('loadedmetadata', function(){
				self.revealContent();
			});
		}
		
	};

	ModalVideo.prototype.revealContent = function() {
		if( !this.modalIsOpen ) return;
		Util.removeClass(this.element, 'modal--is-loading');
		this.contentIsIframe ? this.media.contentWindow.focus() : this.media.focus();
	};

	//initialize the ModalVideo objects
	var modalVideos = document.getElementsByClassName('js-modal-video__media');
	if( modalVideos.length > 0 ) {
		for( var i = 0; i < modalVideos.length; i++) {
			(function(i){new ModalVideo(modalVideos[i].closest('.js-modal'));})(i);
		}
	}
}());
// File#: _2_morphing-image-modal
// Usage: codyhouse.co/license
(function() {
  var MorphImgModal = function(opts) {
    this.options = Util.extend(MorphImgModal.defaults, opts);
    this.element = this.options.element;
    this.modalId = this.element.getAttribute('id');
    this.triggers = document.querySelectorAll('[aria-controls="'+this.modalId+'"]');
    this.selectedImg = false;
    // store morph elements
    this.morphBg = document.getElementsByClassName('js-morph-img-bg');
    this.morphImg = document.getElementsByClassName('js-morph-img-clone');
    // store modal content
    this.modalContent = this.element.getElementsByClassName('js-morph-img-modal__content');
    this.modalImg = this.element.getElementsByClassName('js-morph-img-modal__img');
    this.modalInfo = this.element.getElementsByClassName('js-morph-img-modal__info');
    // store close btn element
    this.modalCloseBtn = document.getElementsByClassName('js-morph-img-close-btn');
    // animation duration
    this.animationDuration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--morph-img-modal-transition-duration'))*1000 || 300;
    // morphing animation should run
    this.animating = false;
    this.reset = false;
    initMorphModal(this);
  };

  function initMorphModal(element) {
    if(element.morphImg.length < 1) return;
    element.morphEl = element.morphImg[0].getElementsByTagName('image');
    element.morphRect  = element.morphImg[0].getElementsByTagName('rect');
    initMorphModalMarkup(element);
    initMorphModalEvents(element);
  };

  function initMorphModalMarkup(element) {
    // append the clip path + <image> elements to use to morph the image
    element.morphImg[0].innerHTML = '<svg><defs><clipPath id="'+element.modalId+'-clip"><rect/></clipPath></defs><image height="100%" width="100%" clip-path="url(#'+element.modalId+'-clip)"></image></svg>';
  };

  function initMorphModalEvents(element) {
    // morph modal was open
    element.element.addEventListener('modalIsOpen', function(event){
      var target = event.detail.closest('[aria-controls="'+element.modalId+'"]');
      setModalImg(element, target);
      setModalContent(element, target);
      toggleModalCloseBtn(element, true);
    });

    // morph modal was closed
    element.element.addEventListener('modalIsClose', function(event){
      element.reset = false;
      element.animating = true;
      Util.addClass(element.modalContent[0], 'opacity-0');
      animateImg(element, false, function() {
        if(element.reset) return; // user opened a new modal before the animation was complete - no need to reset the modal
        element.selectedImg = false;
        resetMorphModal(element, false);
        element.animating = false;
      });
      toggleModalCloseBtn(element, false);
    });

    // close modal clicking on close btn
    if(element.modalCloseBtn.length > 0) {
      element.modalCloseBtn[0].addEventListener('click', function(event) {
        element.element.click();
      });
    }
  };

  function setModalImg(element, target) {
    if(!target) return;
    element.selectedImg = (target.tagName.toLowerCase() == 'img') ? target : target.querySelector('img');
    var src = element.selectedImg.getAttribute('data-modal-src') || element.selectedImg.getAttribute('src');
    // update url modal image + morph
    if(element.modalImg.length > 0) element.modalImg[0].setAttribute('src', src);
    Util.setAttributes(element.morphEl[0], {'xlink:href': src, 'href': src});
    element.reset = false;
    element.animating = true;  
    // wait for image to be loaded, then animate
    loadImage(element, src, function() {
      animateImg(element, true, function() {
        if(element.reset) return; // user closed the modal before the animation was complete - no need to reset the modal
        resetMorphModal(element, true);
        element.animating = false;
      });
    });
  };

  function loadImage(element, src, cb) {
    var image = new Image();
    var loaded = false;
    image.onload = function () {
      if(loaded) return;
      cb();
    }
    image.src = src;
    if(image.complete) {
      loaded = true;
      cb();
    }
  };

  function setModalContent(element, target) {
    // load the modal info details - using the searchData custom function the user defines
    if(element.modalInfo.length < 1) return;
    element.options.searchData(target, function(data){
      element.modalInfo[0].innerHTML = data;
    });
  };

  function toggleModalCloseBtn(element, bool) {
    if(element.modalCloseBtn.length > 0) {
      Util.toggleClass(element.modalCloseBtn[0], 'morph-img-close-btn--is-visible', bool);
    }
  };

  function animateImg(element, isOpening, cb) {
    Util.removeClass(element.morphImg[0], 'is-hidden');

    var galleryImgRect = element.selectedImg.getBoundingClientRect(),
      modalImgRect = element.modalImg[0].getBoundingClientRect();

    runClipAnimation(element, galleryImgRect, modalImgRect, isOpening, cb);
  };

  function runClipAnimation(element, startRect, endRect, isOpening, cb) {
    // retrieve all animation params
    // main element animation (<div>)
    var elInitHeight = startRect.height,
      elIntWidth = startRect.width,
      elInitTop = startRect.top,
      elInitLeft = startRect.left;
    
    var elScale = Math.max(endRect.height/startRect.height, endRect.width/startRect.width);

    var elTranslateX = endRect.left - startRect.left + (endRect.width - startRect.width*elScale)*0.5,
      elTranslateY = endRect.top - startRect.top + (endRect.height - startRect.height*elScale)*0.5;

    // clip <rect> animation
    var rectScaleX = endRect.width/(startRect.width*elScale),
      rectScaleY = endRect.height/(startRect.height*elScale);

    element.morphImg[0].style = 'height:'+elInitHeight+'px; width:'+elIntWidth+'px; top:'+elInitTop+'px; left:'+elInitLeft+'px;';

    element.morphRect[0].setAttribute('transform', 'scale('+1+','+1+')');

    // init morph bg
    element.morphBg[0].style.height = startRect.height + 'px';
    element.morphBg[0].style.width = startRect.width + 'px';
    element.morphBg[0].style.top = startRect.top + 'px';
    element.morphBg[0].style.left = startRect.left + 'px';

    Util.removeClass(element.morphBg[0], 'is-hidden');
    
    animateRectScale(element, elInitHeight, elIntWidth, elScale, elTranslateX, elTranslateY, rectScaleX, rectScaleY, isOpening, cb);
  };

  function animateRectScale(element, height, width, elScale, elTranslateX, elTranslateY, rectScaleX, rectScaleY, isOpening, cb) {
    var isMobile = getComputedStyle(element.element, ':before').getPropertyValue('content').replace(/\'|"/g, '') == 'mobile';

    var currentTime = null,
      duration =  element.animationDuration;

    var startRect = element.selectedImg.getBoundingClientRect(),
      endRect = element.modalContent[0].getBoundingClientRect();
    
    var scaleX = endRect.width/startRect.width,
      scaleY = endRect.height/startRect.height;
  
    var translateX = endRect.left - startRect.left,
      translateY = endRect.top - startRect.top;

    var animateScale = function(timestamp){  
      if (!currentTime) currentTime = timestamp;         
      var progress = timestamp - currentTime;
      if(progress > duration) progress = duration;
      
      // main element values
      if(isOpening) {
        var elScalePr = Math.easeOutQuart(progress, 1, elScale - 1, duration),
        elTransXPr = Math.easeOutQuart(progress, 0, elTranslateX, duration),
        elTransYPr = Math.easeOutQuart(progress, 0, elTranslateY, duration);
      } else {
        var elScalePr = Math.easeOutQuart(progress, elScale, 1 - elScale, duration),
        elTransXPr = Math.easeOutQuart(progress, elTranslateX, - elTranslateX, duration),
        elTransYPr = Math.easeOutQuart(progress, elTranslateY, - elTranslateY, duration);
      }
      
      // rect values
      if(isOpening) {
        var rectScaleXPr = Math.easeOutQuart(progress, 1, rectScaleX - 1, duration),
          rectScaleYPr = Math.easeOutQuart(progress, 1, rectScaleY - 1, duration);
      } else {
        var rectScaleXPr = Math.easeOutQuart(progress, rectScaleX,  1 - rectScaleX, duration),
          rectScaleYPr = Math.easeOutQuart(progress, rectScaleY, 1 - rectScaleY, duration);
      }

      element.morphImg[0].style.transform = 'translateX('+elTransXPr+'px) translateY('+elTransYPr+'px) scale('+elScalePr+')';

      element.morphRect[0].setAttribute('transform', 'translate('+(width/2)*(1 - rectScaleXPr)+' '+(height/2)*(1 - rectScaleYPr)+') scale('+rectScaleXPr+','+rectScaleYPr+')');

      if(isOpening) {
        var valScaleX = Math.easeOutQuart(progress, 1, (scaleX - 1), duration),
          valScaleY = isMobile ? Math.easeOutQuart(progress, 1, (scaleY - 1), duration): rectScaleYPr*elScalePr,
          valTransX = Math.easeOutQuart(progress, 0, translateX, duration),
          valTransY = isMobile ? Math.easeOutQuart(progress, 0, translateY, duration) : elTransYPr + (elScalePr*height - rectScaleYPr*elScalePr*height)/2;
      } else {
        var valScaleX = Math.easeOutQuart(progress, scaleX, 1 - scaleX, duration),
          valScaleY = isMobile ? Math.easeOutQuart(progress, scaleY, 1 - scaleY, duration) : rectScaleYPr*elScalePr,
          valTransX = Math.easeOutQuart(progress, translateX, - translateX, duration),
          valTransY = isMobile ? Math.easeOutQuart(progress, translateY, - translateY, duration) : elTransYPr + (elScalePr*height - rectScaleYPr*elScalePr*height)/2;
      }

      // morph bg
      element.morphBg[0].style.transform = 'translateX('+valTransX+'px) translateY('+valTransY+'px) scale('+valScaleX+','+valScaleY+')';

      if(progress < duration) {
        window.requestAnimationFrame(animateScale);
      } else if(cb) {
        cb();
      }
    };
    
    window.requestAnimationFrame(animateScale);
  };
  
  function resetMorphModal(element, isOpening) {
    // reset modal at the end of an opening/closing animation
    Util.toggleClass(element.modalContent[0], 'opacity-0', !isOpening);
    Util.toggleClass(element.modalInfo[0], 'opacity-0', !isOpening);
    Util.addClass(element.morphBg[0], 'is-hidden');
    Util.addClass(element.morphImg[0], 'is-hidden');
    if(!isOpening) {
      element.modalImg[0].removeAttribute('src');
      element.modalInfo[0].innerHTML = '';
      element.morphEl[0].removeAttribute('xlink:href');
      element.morphEl[0].removeAttribute('href');
      element.morphBg[0].removeAttribute('style');
      element.morphImg[0].removeAttribute('style');
    }
  };

  window.MorphImgModal = MorphImgModal;

  MorphImgModal.defaults = {
    element : '',
    searchData: false, // function used to return results
  };
}());
// File#: _2_off-canvas-navigation
// Usage: codyhouse.co/license
(function() {
  var OffCanvasNav = function(element) {
    this.element = element;
    this.panel = this.element.getElementsByClassName('js-off-canvas__panel')[0];
    this.trigger = document.querySelectorAll('[aria-controls="'+this.panel.getAttribute('id')+'"]')[0];
    this.svgAnim = this.trigger.getElementsByTagName('circle');
    initOffCanvasNav(this);
  };

  function initOffCanvasNav(canvas) {
    if(transitionSupported) {
      // do not allow click on menu icon while the navigation is animating
      canvas.trigger.addEventListener('click', function(event){
        canvas.trigger.style.setProperty('pointer-events', 'none');
      });
      canvas.panel.addEventListener('openPanel', function(event){
        canvas.trigger.style.setProperty('pointer-events', 'none');
      });
      canvas.panel.addEventListener('transitionend', function(event){
        if(event.propertyName == 'visibility') {
          canvas.trigger.style.setProperty('pointer-events', '');
        }
      });
    }

    if(canvas.svgAnim.length > 0) { // create the circle fill-in effect
      var circumference = (2*Math.PI*canvas.svgAnim[0].getAttribute('r')).toFixed(2);
      canvas.svgAnim[0].setAttribute('stroke-dashoffset', circumference);
      canvas.svgAnim[0].setAttribute('stroke-dasharray', circumference);
      Util.addClass(canvas.trigger, 'offnav-control--ready-to-animate');
    }
    
    canvas.panel.addEventListener('closePanel', function(event){
      // if the navigation is closed using keyboard or a11y close btn -> change trigger icon appearance (from arrow to menu icon) 
      if(event.detail == 'key' || event.detail == 'close-btn') {
        canvas.trigger.click();
      }
    });
  };

  // init OffCanvasNav objects
  var offCanvasNav = document.getElementsByClassName('js-off-canvas--nav'),
    transitionSupported = Util.cssSupports('transition');
	if( offCanvasNav.length > 0 ) {
		for( var i = 0; i < offCanvasNav.length; i++) {
			(function(i){new OffCanvasNav(offCanvasNav[i]);})(i);
		}
	}
}());
// File#: _2_slideshow
// Usage: codyhouse.co/license
(function() {
	var Slideshow = function(opts) {
		this.options = slideshowAssignOptions(Slideshow.defaults , opts);
		this.element = this.options.element;
		this.items = this.element.getElementsByClassName('js-slideshow__item');
		this.controls = this.element.getElementsByClassName('js-slideshow__control'); 
		this.selectedSlide = 0;
		this.autoplayId = false;
		this.autoplayPaused = false;
		this.navigation = false;
		this.navCurrentLabel = false;
		this.ariaLive = false;
		this.moveFocus = false;
		this.animating = false;
		this.supportAnimation = Util.cssSupports('transition');
		this.animationOff = (!Util.hasClass(this.element, 'slideshow--transition-fade') && !Util.hasClass(this.element, 'slideshow--transition-slide') && !Util.hasClass(this.element, 'slideshow--transition-prx'));
		this.animationType = Util.hasClass(this.element, 'slideshow--transition-prx') ? 'prx' : 'slide';
		this.animatingClass = 'slideshow--is-animating';
		initSlideshow(this);
		initSlideshowEvents(this);
		initAnimationEndEvents(this);
	};

	Slideshow.prototype.showNext = function() {
		showNewItem(this, this.selectedSlide + 1, 'next');
	};

	Slideshow.prototype.showPrev = function() {
		showNewItem(this, this.selectedSlide - 1, 'prev');
	};

	Slideshow.prototype.showItem = function(index) {
		showNewItem(this, index, false);
	};

	Slideshow.prototype.startAutoplay = function() {
		var self = this;
		if(this.options.autoplay && !this.autoplayId && !this.autoplayPaused) {
			self.autoplayId = setInterval(function(){
				self.showNext();
			}, self.options.autoplayInterval);
		}
	};

	Slideshow.prototype.pauseAutoplay = function() {
		var self = this;
		if(this.options.autoplay) {
			clearInterval(self.autoplayId);
			self.autoplayId = false;
		}
	};

	function slideshowAssignOptions(defaults, opts) {
		// initialize the object options
		var mergeOpts = {};
		mergeOpts.element = (typeof opts.element !== "undefined") ? opts.element : defaults.element;
		mergeOpts.navigation = (typeof opts.navigation !== "undefined") ? opts.navigation : defaults.navigation;
		mergeOpts.autoplay = (typeof opts.autoplay !== "undefined") ? opts.autoplay : defaults.autoplay;
		mergeOpts.autoplayInterval = (typeof opts.autoplayInterval !== "undefined") ? opts.autoplayInterval : defaults.autoplayInterval;
		mergeOpts.swipe = (typeof opts.swipe !== "undefined") ? opts.swipe : defaults.swipe;
		return mergeOpts;
	};

	function initSlideshow(slideshow) { // basic slideshow settings
		// if no slide has been selected -> select the first one
		if(slideshow.element.getElementsByClassName('slideshow__item--selected').length < 1) Util.addClass(slideshow.items[0], 'slideshow__item--selected');
		slideshow.selectedSlide = Util.getIndexInArray(slideshow.items, slideshow.element.getElementsByClassName('slideshow__item--selected')[0]);
		// create an element that will be used to announce the new visible slide to SR
		var srLiveArea = document.createElement('div');
		Util.setAttributes(srLiveArea, {'class': 'sr-only js-slideshow__aria-live', 'aria-live': 'polite', 'aria-atomic': 'true'});
		slideshow.element.appendChild(srLiveArea);
		slideshow.ariaLive = srLiveArea;
	};

	function initSlideshowEvents(slideshow) {
		// if slideshow navigation is on -> create navigation HTML and add event listeners
		if(slideshow.options.navigation) {
			// check if navigation has already been included
			if(slideshow.element.getElementsByClassName('js-slideshow__navigation').length == 0) {
				var navigation = document.createElement('ol'),
					navChildren = '';

				var navClasses = 'slideshow__navigation js-slideshow__navigation';
				if(slideshow.items.length <= 1) {
					navClasses = navClasses + ' is-hidden';
				} 
				
				navigation.setAttribute('class', navClasses);
				for(var i = 0; i < slideshow.items.length; i++) {
					var className = (i == slideshow.selectedSlide) ? 'class="slideshow__nav-item slideshow__nav-item--selected js-slideshow__nav-item"' :  'class="slideshow__nav-item js-slideshow__nav-item"',
						navCurrentLabel = (i == slideshow.selectedSlide) ? '<span class="sr-only js-slideshow__nav-current-label">Current Item</span>' : '';
					navChildren = navChildren + '<li '+className+'><button class="reset"><span class="sr-only">'+ (i+1) + '</span>'+navCurrentLabel+'</button></li>';
				}
				navigation.innerHTML = navChildren;
				slideshow.element.appendChild(navigation);
			}
			
			slideshow.navCurrentLabel = slideshow.element.getElementsByClassName('js-slideshow__nav-current-label')[0]; 
			slideshow.navigation = slideshow.element.getElementsByClassName('js-slideshow__nav-item');

			var dotsNavigation = slideshow.element.getElementsByClassName('js-slideshow__navigation')[0];

			dotsNavigation.addEventListener('click', function(event){
				navigateSlide(slideshow, event, true);
			});
			dotsNavigation.addEventListener('keyup', function(event){
				navigateSlide(slideshow, event, (event.key.toLowerCase() == 'enter'));
			});
		}
		// slideshow arrow controls
		if(slideshow.controls.length > 0) {
			// hide controls if one item available
			if(slideshow.items.length <= 1) {
				Util.addClass(slideshow.controls[0], 'is-hidden');
				Util.addClass(slideshow.controls[1], 'is-hidden');
			}
			slideshow.controls[0].addEventListener('click', function(event){
				event.preventDefault();
				slideshow.showPrev();
				updateAriaLive(slideshow);
			});
			slideshow.controls[1].addEventListener('click', function(event){
				event.preventDefault();
				slideshow.showNext();
				updateAriaLive(slideshow);
			});
		}
		// swipe events
		if(slideshow.options.swipe) {
			//init swipe
			new SwipeContent(slideshow.element);
			slideshow.element.addEventListener('swipeLeft', function(event){
				slideshow.showNext();
			});
			slideshow.element.addEventListener('swipeRight', function(event){
				slideshow.showPrev();
			});
		}
		// autoplay
		if(slideshow.options.autoplay) {
			slideshow.startAutoplay();
			// pause autoplay if user is interacting with the slideshow
			slideshow.element.addEventListener('mouseenter', function(event){
				slideshow.pauseAutoplay();
				slideshow.autoplayPaused = true;
			});
			slideshow.element.addEventListener('focusin', function(event){
				slideshow.pauseAutoplay();
				slideshow.autoplayPaused = true;
			});
			slideshow.element.addEventListener('mouseleave', function(event){
				slideshow.autoplayPaused = false;
				slideshow.startAutoplay();
			});
			slideshow.element.addEventListener('focusout', function(event){
				slideshow.autoplayPaused = false;
				slideshow.startAutoplay();
			});
		}
		// detect if external buttons control the slideshow
		var slideshowId = slideshow.element.getAttribute('id');
		if(slideshowId) {
			var externalControls = document.querySelectorAll('[data-controls="'+slideshowId+'"]');
			for(var i = 0; i < externalControls.length; i++) {
				(function(i){externalControlSlide(slideshow, externalControls[i]);})(i);
			}
		}
		// custom event to trigger selection of a new slide element
		slideshow.element.addEventListener('selectNewItem', function(event){
			// check if slide is already selected
			if(event.detail) {
				if(event.detail - 1 == slideshow.selectedSlide) return;
				showNewItem(slideshow, event.detail - 1, false);
			}
		});

		// keyboard navigation
		slideshow.element.addEventListener('keydown', function(event){
			if(event.keyCode && event.keyCode == 39 || event.key && event.key.toLowerCase() == 'arrowright') {
				slideshow.showNext();
			} else if(event.keyCode && event.keyCode == 37 || event.key && event.key.toLowerCase() == 'arrowleft') {
				slideshow.showPrev();
			}
		});
	};

	function navigateSlide(slideshow, event, keyNav) { 
		// user has interacted with the slideshow navigation -> update visible slide
		var target = ( Util.hasClass(event.target, 'js-slideshow__nav-item') ) ? event.target : event.target.closest('.js-slideshow__nav-item');
		if(keyNav && target && !Util.hasClass(target, 'slideshow__nav-item--selected')) {
			slideshow.showItem(Util.getIndexInArray(slideshow.navigation, target));
			slideshow.moveFocus = true;
			updateAriaLive(slideshow);
		}
	};

	function initAnimationEndEvents(slideshow) {
		// remove animation classes at the end of a slide transition
		for( var i = 0; i < slideshow.items.length; i++) {
			(function(i){
				slideshow.items[i].addEventListener('animationend', function(){resetAnimationEnd(slideshow, slideshow.items[i]);});
				slideshow.items[i].addEventListener('transitionend', function(){resetAnimationEnd(slideshow, slideshow.items[i]);});
			})(i);
		}
	};

	function resetAnimationEnd(slideshow, item) {
		setTimeout(function(){ // add a delay between the end of animation and slideshow reset - improve animation performance
			if(Util.hasClass(item,'slideshow__item--selected')) {
				if(slideshow.moveFocus) Util.moveFocus(item);
				emitSlideshowEvent(slideshow, 'newItemVisible', slideshow.selectedSlide);
				slideshow.moveFocus = false;
			}
			Util.removeClass(item, 'slideshow__item--'+slideshow.animationType+'-out-left slideshow__item--'+slideshow.animationType+'-out-right slideshow__item--'+slideshow.animationType+'-in-left slideshow__item--'+slideshow.animationType+'-in-right');
			item.removeAttribute('aria-hidden');
			slideshow.animating = false;
			Util.removeClass(slideshow.element, slideshow.animatingClass); 
		}, 100);
	};

	function showNewItem(slideshow, index, bool) {
		if(slideshow.items.length <= 1) return;
		if(slideshow.animating && slideshow.supportAnimation) return;
		slideshow.animating = true;
		Util.addClass(slideshow.element, slideshow.animatingClass); 
		if(index < 0) index = slideshow.items.length - 1;
		else if(index >= slideshow.items.length) index = 0;
		// skip slideshow item if it is hidden
		if(bool && Util.hasClass(slideshow.items[index], 'is-hidden')) {
			slideshow.animating = false;
			index = bool == 'next' ? index + 1 : index - 1;
			showNewItem(slideshow, index, bool);
			return;
		}
		// index of new slide is equal to index of slide selected item
		if(index == slideshow.selectedSlide) {
			slideshow.animating = false;
			return;
		}
		var exitItemClass = getExitItemClass(slideshow, bool, slideshow.selectedSlide, index);
		var enterItemClass = getEnterItemClass(slideshow, bool, slideshow.selectedSlide, index);
		// transition between slides
		if(!slideshow.animationOff) Util.addClass(slideshow.items[slideshow.selectedSlide], exitItemClass);
		Util.removeClass(slideshow.items[slideshow.selectedSlide], 'slideshow__item--selected');
		slideshow.items[slideshow.selectedSlide].setAttribute('aria-hidden', 'true'); //hide to sr element that is exiting the viewport
		if(slideshow.animationOff) {
			Util.addClass(slideshow.items[index], 'slideshow__item--selected');
		} else {
			Util.addClass(slideshow.items[index], enterItemClass+' slideshow__item--selected');
		}
		// reset slider navigation appearance
		resetSlideshowNav(slideshow, index, slideshow.selectedSlide);
		slideshow.selectedSlide = index;
		// reset autoplay
		slideshow.pauseAutoplay();
		slideshow.startAutoplay();
		// reset controls/navigation color themes
		resetSlideshowTheme(slideshow, index);
		// emit event
		emitSlideshowEvent(slideshow, 'newItemSelected', slideshow.selectedSlide);
		if(slideshow.animationOff) {
			slideshow.animating = false;
			Util.removeClass(slideshow.element, slideshow.animatingClass);
		}
	};

	function getExitItemClass(slideshow, bool, oldIndex, newIndex) {
		var className = '';
		if(bool) {
			className = (bool == 'next') ? 'slideshow__item--'+slideshow.animationType+'-out-right' : 'slideshow__item--'+slideshow.animationType+'-out-left'; 
		} else {
			className = (newIndex < oldIndex) ? 'slideshow__item--'+slideshow.animationType+'-out-left' : 'slideshow__item--'+slideshow.animationType+'-out-right';
		}
		return className;
	};

	function getEnterItemClass(slideshow, bool, oldIndex, newIndex) {
		var className = '';
		if(bool) {
			className = (bool == 'next') ? 'slideshow__item--'+slideshow.animationType+'-in-right' : 'slideshow__item--'+slideshow.animationType+'-in-left'; 
		} else {
			className = (newIndex < oldIndex) ? 'slideshow__item--'+slideshow.animationType+'-in-left' : 'slideshow__item--'+slideshow.animationType+'-in-right';
		}
		return className;
	};

	function resetSlideshowNav(slideshow, newIndex, oldIndex) {
		if(slideshow.navigation) {
			Util.removeClass(slideshow.navigation[oldIndex], 'slideshow__nav-item--selected');
			Util.addClass(slideshow.navigation[newIndex], 'slideshow__nav-item--selected');
			slideshow.navCurrentLabel.parentElement.removeChild(slideshow.navCurrentLabel);
			slideshow.navigation[newIndex].getElementsByTagName('button')[0].appendChild(slideshow.navCurrentLabel);
		}
	};

	function resetSlideshowTheme(slideshow, newIndex) {
		var dataTheme = slideshow.items[newIndex].getAttribute('data-theme');
		if(dataTheme) {
			if(slideshow.navigation) slideshow.navigation[0].parentElement.setAttribute('data-theme', dataTheme);
			if(slideshow.controls[0]) slideshow.controls[0].parentElement.setAttribute('data-theme', dataTheme);
		} else {
			if(slideshow.navigation) slideshow.navigation[0].parentElement.removeAttribute('data-theme');
			if(slideshow.controls[0]) slideshow.controls[0].parentElement.removeAttribute('data-theme');
		}
	};

	function emitSlideshowEvent(slideshow, eventName, detail) {
		var event = new CustomEvent(eventName, {detail: detail});
		slideshow.element.dispatchEvent(event);
	};

	function updateAriaLive(slideshow) {
		slideshow.ariaLive.innerHTML = 'Item '+(slideshow.selectedSlide + 1)+' of '+slideshow.items.length;
	};

	function externalControlSlide(slideshow, button) { // control slideshow using external element
		button.addEventListener('click', function(event){
			var index = button.getAttribute('data-index');
			if(!index || index == slideshow.selectedSlide + 1) return;
			event.preventDefault();
			showNewItem(slideshow, index - 1, false);
		});
	};

	Slideshow.defaults = {
    element : '',
    navigation : true,
    autoplay : false,
    autoplayInterval: 5000,
    swipe: false
  };

	window.Slideshow = Slideshow;
	
	//initialize the Slideshow objects
	var slideshows = document.getElementsByClassName('js-slideshow');
	if( slideshows.length > 0 ) {
		for( var i = 0; i < slideshows.length; i++) {
			(function(i){
				var navigation = (slideshows[i].getAttribute('data-navigation') && slideshows[i].getAttribute('data-navigation') == 'off') ? false : true,
					autoplay = (slideshows[i].getAttribute('data-autoplay') && slideshows[i].getAttribute('data-autoplay') == 'on') ? true : false,
					autoplayInterval = (slideshows[i].getAttribute('data-autoplay-interval')) ? slideshows[i].getAttribute('data-autoplay-interval') : 5000,
					swipe = (slideshows[i].getAttribute('data-swipe') && slideshows[i].getAttribute('data-swipe') == 'on') ? true : false;
				new Slideshow({element: slideshows[i], navigation: navigation, autoplay : autoplay, autoplayInterval : autoplayInterval, swipe : swipe});
			})(i);
		}
	}
}());
// File#: _2_sticky-sharebar
// Usage: codyhouse.co/license
(function() {
  var StickyShareBar = function(element) {
    this.element = element;
    this.contentTarget = document.getElementsByClassName('js-sticky-sharebar-target');
    this.showClass = 'sticky-sharebar--on-target';
    this.threshold = '50%'; // Share Bar will be revealed when .js-sticky-sharebar-target element reaches 50% of the viewport
    initShareBar(this);
  };

  function initShareBar(shareBar) {
    if(shareBar.contentTarget.length < 1) {
      Util.addClass(shareBar.element, shareBar.showClass);
      return;
    }
    if(intersectionObserverSupported) {
      initObserver(shareBar); // update anchor appearance on scroll
    } else {
      Util.addClass(shareBar.element, shareBar.showClass);
    }
  };

  function initObserver(shareBar) {
    var observer = new IntersectionObserver(
      function(entries, observer) { 
        Util.toggleClass(shareBar.element, shareBar.showClass, entries[0].isIntersecting);
      }, 
      {rootMargin: "0px 0px -"+shareBar.threshold+" 0px"}
    );
    observer.observe(shareBar.contentTarget[0]);
  };

  //initialize the StickyShareBar objects
  var stickyShareBar = document.getElementsByClassName('js-sticky-sharebar'),
    intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
  
	if( stickyShareBar.length > 0 ) {
		for( var i = 0; i < stickyShareBar.length; i++) {
			(function(i){ new StickyShareBar(stickyShareBar[i]); })(i);
    }
	}
}());
// File#: _2_svg-slideshow
// Usage: codyhouse.co/license
(function() {
  var ImgSlideshow = function(opts) {
    this.options = Util.extend(ImgSlideshow.defaults , opts);
		this.element = this.options.element;
		this.items = this.element.getElementsByClassName('js-svg-slideshow__item');
		this.controls = this.element.getElementsByClassName('js-svg-slideshow__control'); 
		this.selectedSlide = 0;
		this.autoplayId = false;
		this.autoplayPaused = false;
		this.navigation = false;
		this.navCurrentLabel = false;
		this.ariaLive = false;
		this.animating = false;
		this.animatingClass = 'svg-slideshow--is-animating';
    // store svg animation paths
		this.masks = this.element.getElementsByClassName('js-svg-slideshow__mask');
    this.maskNext = getMaskPoints(this, 'next');
		this.maskPrev = getMaskPoints(this, 'prev');
		// random number for mask id
		this.maskId = getRandomInt(0, 10000);
		initSlideshow(this);
		initSlideshowEvents(this);
		revealSlideshow(this);
  };

  function getMaskPoints(slideshow, direction) { // store the path points - will be used to transition between slides
    var array = [];
		var index = direction == 'next' ? 0 : 1;
		var groupElements = slideshow.masks[index].getElementsByTagName('g');
		for(var j = 0; j < groupElements.length; j++) {
			array[j] = [];
			var paths =  groupElements[j].getElementsByTagName('path');
			for(var i = 0; i < paths.length; i++) {
				array[j].push(paths[i].getAttribute('d'));
			}
		}
    return array;
	};
	
	function getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min;
	};
  
  function initSlideshow(slideshow) { // basic slideshow settings
    // reset slide items content -> replace img element with svg
    for(var i = 0; i < slideshow.items.length; i++) {
      initSlideContent(slideshow, slideshow.items[i], i);
    }
		// if no slide has been selected -> select the first one
		if(slideshow.element.getElementsByClassName('svg-slideshow__item--selected').length < 1) Util.addClass(slideshow.items[0], 'svg-slideshow__item--selected');
		slideshow.selectedSlide = Util.getIndexInArray(slideshow.items, slideshow.element.getElementsByClassName('svg-slideshow__item--selected')[0]);
		// create an element that will be used to announce the new visible slide to SR
		var srLiveArea = document.createElement('div');
		Util.setAttributes(srLiveArea, {'class': 'sr-only js-svg-slideshow__aria-live', 'aria-live': 'polite', 'aria-atomic': 'true'});
		slideshow.element.appendChild(srLiveArea);
		slideshow.ariaLive = srLiveArea;
  };

  function initSlideContent(slideshow, slide, index) {
		// replace each slide content with a svg element including image + clip-path
		var imgElement = slide.getElementsByTagName('img')[0],
			imgPath = imgElement.getAttribute('src'),
      imgAlt =  imgElement.getAttribute('alt'),
			viewBox = slideshow.masks[0].getAttribute('viewBox').split(' '),
      imageCode = '<image height="'+viewBox[3]+'px" width="'+viewBox[2]+'px" clip-path="url(#img-slide-'+slideshow.maskId+'-'+index+')" xlink:href="'+imgPath+'" href="'+imgPath+'"></image>';
		
			var slideContent = '<svg aria-hidden="true" viewBox="0 0 '+viewBox[2]+' '+viewBox[3]+'"><defs><clipPath id="img-slide-'+slideshow.maskId+'-'+index+'">';

			for(var i = 0; i < slideshow.maskNext.length; i++) {
				slideContent = slideContent + '<path d="'+slideshow.maskNext[i][slideshow.maskNext[i].length - 1]+'"></path>';
			}

			slideContent = slideContent + '</clipPath></defs>'+imageCode+'</svg>';

    slide.innerHTML = imgElement.outerHTML + slideContent;
    if(imgAlt) slide.setAttribute('aria-label', imgAlt);
  };

  function initSlideshowEvents(slideshow) {
    // if slideshow navigation is on -> create navigation HTML and add event listeners
		if(slideshow.options.navigation) {
			var navigation = document.createElement('ol'),
				navChildren = '';
			
			navigation.setAttribute('class', 'svg-slideshow__navigation');
			for(var i = 0; i < slideshow.items.length; i++) {
				var className = (i == slideshow.selectedSlide) ? 'class="svg-slideshow__nav-item svg-slideshow__nav-item--selected js-svg-slideshow__nav-item"' :  'class="svg-slideshow__nav-item js-svg-slideshow__nav-item"',
					navCurrentLabel = (i == slideshow.selectedSlide) ? '<span class="sr-only js-svg-slideshow__nav-current-label">Current Item</span>' : '';
				navChildren = navChildren + '<li '+className+'><button class="reset"><span class="sr-only">'+ (i+1) + '</span>'+navCurrentLabel+'</button></li>';
			}

			navigation.innerHTML = navChildren;
			slideshow.navCurrentLabel = navigation.getElementsByClassName('js-svg-slideshow__nav-current-label')[0]; 
			slideshow.element.appendChild(navigation);
			slideshow.navigation = slideshow.element.getElementsByClassName('js-svg-slideshow__nav-item');

			navigation.addEventListener('click', function(event){
				navigateSlide(slideshow, event, true);
			});
			navigation.addEventListener('keyup', function(event){
				navigateSlide(slideshow, event, (event.key.toLowerCase() == 'enter'));
			});
		}
    // slideshow arrow controls
		if(slideshow.controls.length > 0) {
			slideshow.controls[0].addEventListener('click', function(event){
				event.preventDefault();
				showNewItem(slideshow, slideshow.selectedSlide - 1, 'prev', true);
			});
			slideshow.controls[1].addEventListener('click', function(event){
				event.preventDefault();
        showNewItem(slideshow, slideshow.selectedSlide + 1, 'next', true);
			});
    }
    // swipe events
    if(slideshow.options.swipe) {
			//init swipe
			new SwipeContent(slideshow.element);
			slideshow.element.addEventListener('swipeLeft', function(event){
				showNewItem(slideshow, slideshow.selectedSlide + 1, 'next');
			});
			slideshow.element.addEventListener('swipeRight', function(event){
        showNewItem(slideshow, slideshow.selectedSlide - 1, 'prev');
			});
		}
    // autoplay
		if(slideshow.options.autoplay) {
			startAutoplay(slideshow);
			// pause autoplay if user is interacting with the slideshow
			slideshow.element.addEventListener('mouseenter', function(event){
				pauseAutoplay(slideshow);
				slideshow.autoplayPaused = true;
			});
			slideshow.element.addEventListener('focusin', function(event){
				pauseAutoplay(slideshow);
				slideshow.autoplayPaused = true;
			});
			slideshow.element.addEventListener('mouseleave', function(event){
				slideshow.autoplayPaused = false;
				startAutoplay(slideshow);
			});
			slideshow.element.addEventListener('focusout', function(event){
				slideshow.autoplayPaused = false;
				startAutoplay(slideshow);
			});
		}
		// init slide theme colors
		resetSlideshowTheme(slideshow, slideshow.selectedSlide);
	};
	
	function revealSlideshow(slideshow) {
		Util.addClass(slideshow.element, 'svg-slideshow--loaded');
	};

  function showNewItem(slideshow, index, direction, bool) { // update visible slide
		if(slideshow.animating) return;
		slideshow.animating = true;
		Util.addClass(slideshow.element, slideshow.animatingClass);
		if(index < 0) index = slideshow.items.length - 1;
		else if(index >= slideshow.items.length) index = 0;
		// reset dot navigation appearance
		resetSlideshowNav(slideshow, index, slideshow.selectedSlide);
		// animate slide
		newItemAnimate(slideshow, index, slideshow.selectedSlide, direction);
		// if not autoplay, announce new slide to SR
    if(bool) updateAriaLive(slideshow, index); 
		// reset controls/navigation color themes
		resetSlideshowTheme(slideshow, index);
  };

  function newItemAnimate(slideshow, newIndex, oldIndex, direction) {
    // start slide transition
    var path = slideshow.items[newIndex].getElementsByTagName('path'),
			mask = direction == 'next' ? slideshow.maskNext : slideshow.maskPrev;
		for(var i = 0; i < path.length; i++) {
			path[i].setAttribute('d', mask[i][0]);
		}
    
    Util.addClass(slideshow.items[newIndex], 'svg-slideshow__item--animating');
    morphPath(path, mask, slideshow.options.transitionDuration, function(){ // morph callback function
      slideshow.items[oldIndex].setAttribute('aria-hidden', 'true');
      slideshow.items[newIndex].removeAttribute('aria-hidden');
      Util.addClass(slideshow.items[newIndex], 'svg-slideshow__item--selected');
      Util.removeClass(slideshow.items[newIndex], 'svg-slideshow__item--animating');
      Util.removeClass(slideshow.items[oldIndex], 'svg-slideshow__item--selected');
      slideshow.selectedSlide = newIndex;
			slideshow.animating = false;
			Util.removeClass(slideshow.element, slideshow.animatingClass);
      // reset autoplay
      pauseAutoplay(slideshow);
      startAutoplay(slideshow);
    });
  };

	function morphPath(path, points, duration, cb) { // morph 
		if(reducedMotion || !animeJSsupported) { // if reducedMotion on or JS animation not supported -> do not animate
			for(var i = 0; i < path.length; i++) {
				path[i].setAttribute('d', points[i][points[i].length - 1]);
			}
			cb();
      return;
		}
		for(var i = 0; i < path.length; i++) {
			var delay = i*100,
				cbFunction = (i == path.length - 1) ? cb : false;
			morphSinglePath(path[i], points[i], delay, duration, cbFunction);
		}
	};
	
	function morphSinglePath(path, points, delay, duration, cb) {
		var dAnimation = (points.length == 3) 
			? [{ value: [points[0], points[1]]}, { value: [points[1], points[2]]}]
			: [{ value: [points[0], points[1]]}];
    anime({
			targets: path,
			d: dAnimation,
      easing: 'easeOutQuad',
			duration: duration,
			delay: delay,
      complete: function() {
        if(cb) cb();
      }
    });
	};

  function navigateSlide(slideshow, event, keyNav) { 
		// user has interacted with the slideshow dot navigation -> update visible slide
		var target = event.target.closest('.js-svg-slideshow__nav-item');
		if(keyNav && target && !Util.hasClass(target, 'svg-slideshow__nav-item--selected')) {
      var index = Util.getIndexInArray(slideshow.navigation, target),
        direction = slideshow.selectedSlide < index ? 'next' : 'prev';
      showNewItem(slideshow, index, direction, true);
		}
	};
  
  function resetSlideshowNav(slideshow, newIndex, oldIndex) {
    if(slideshow.navigation) { // update selected dot
			Util.removeClass(slideshow.navigation[oldIndex], 'svg-slideshow__nav-item--selected');
			Util.addClass(slideshow.navigation[newIndex], 'svg-slideshow__nav-item--selected');
			slideshow.navCurrentLabel.parentElement.removeChild(slideshow.navCurrentLabel);
			slideshow.navigation[newIndex].getElementsByTagName('button')[0].appendChild(slideshow.navCurrentLabel);
		}
	};
	
	function resetSlideshowTheme(slideshow, newIndex) { 
		// apply to controls/dot navigation, the same color-theme of the selected slide
		var dataTheme = slideshow.items[newIndex].getAttribute('data-theme');
		if(dataTheme) {
			if(slideshow.navigation) slideshow.navigation[0].parentElement.setAttribute('data-theme', dataTheme);
			if(slideshow.controls[0]) slideshow.controls[0].parentElement.setAttribute('data-theme', dataTheme);
		} else {
			if(slideshow.navigation) slideshow.navigation[0].parentElement.removeAttribute('data-theme');
			if(slideshow.controls[0]) slideshow.controls[0].parentElement.removeAttribute('data-theme');
		}
	};

  function updateAriaLive(slideshow, index) { // announce new selected slide to SR
    var announce = 'Item '+(index + 1)+' of '+slideshow.items.length,
      label = slideshow.items[index].getAttribute('aria-label');
    if(label) announce = announce+' '+label;
		slideshow.ariaLive.innerHTML = announce;
  };

  function startAutoplay(slideshow) {
		if(slideshow.options.autoplay && !slideshow.autoplayId && !slideshow.autoplayPaused) {
			slideshow.autoplayId = setInterval(function(){
				showNewItem(slideshow, slideshow.selectedSlide + 1, 'next');
			}, slideshow.options.autoplayInterval);
		}
  };

  function pauseAutoplay(slideshow) {
    if(slideshow.options.autoplay) {
			clearInterval(slideshow.autoplayId);
			slideshow.autoplayId = false;
		}
  };
  
  //initialize the ImgSlideshow objects
  var slideshows = document.getElementsByClassName('js-svg-slideshow'),
		reducedMotion = Util.osHasReducedMotion(),
		animeJSsupported = window.Map; // test if the library used for the animation works
	if( slideshows.length > 0 ) {
		for( var i = 0; i < slideshows.length; i++) {
			(function(i){
				var navigation = (slideshows[i].getAttribute('data-navigation') && slideshows[i].getAttribute('data-navigation') == 'off') ? false : true,
					autoplay = (slideshows[i].getAttribute('data-autoplay') && slideshows[i].getAttribute('data-autoplay') == 'on') ? true : false,
					autoplayInterval = (slideshows[i].getAttribute('data-autoplay-interval')) ? slideshows[i].getAttribute('data-autoplay-interval') : 5000,
					swipe = (slideshows[i].getAttribute('data-swipe') && slideshows[i].getAttribute('data-swipe') == 'on') ? true : false,
					transitionDuration = (slideshows[i].getAttribute('data-transition-duration')) ? slideshows[i].getAttribute('data-transition-duration') : 400;
				new ImgSlideshow({element: slideshows[i], navigation: navigation, autoplay : autoplay, autoplayInterval : autoplayInterval, swipe : swipe, transitionDuration: transitionDuration});
			})(i);
		}
	}
}());
// File#: _3_drop-menu
// Usage: codyhouse.co/license
(function() {
  var DropMenu = function(element) {
    this.element = element;
    this.innerElement = this.element.getElementsByClassName('js-drop-menu__inner');
    this.trigger = document.querySelector('[aria-controls="'+this.element.getAttribute('id')+'"]');
    this.autocompleteInput = false;
    this.autocompleteList = false;
    this.animationDuration = parseFloat(getComputedStyle(this.element).getPropertyValue('--drop-menu-transition-duration')) || 0.3;
    // store some basic classes
    this.menuIsVisibleClass = 'drop-menu--is-visible';
    this.menuLevelClass = 'js-drop-menu__list';
    this.menuBtnInClass = 'js-drop-menu__btn--sublist-control';
    this.menuBtnOutClass = 'js-drop-menu__btn--back';
    this.levelInClass = 'drop-menu__list--in';
    this.levelOutClass = 'drop-menu__list--out';
    // store the max height of the element
    this.maxHeight = false;
    // store drop menu layout 
    this.layout = false;
    // vertical gap - desktop layout
    this.verticalGap = parseInt(getComputedStyle(this.element).getPropertyValue('--drop-menu-gap-y')) || 4;
    // store autocomplete search results
    this.searchResults = [];
    // focusable elements
    this.focusableElements = [];
    initDropMenu(this);
  };

  function initDropMenu(menu) {
    // trigger drop menu opening/closing
    toggleDropMenu(menu);
    // toggle sublevels
    menu.element.addEventListener('click', function(event){
      // check if we need to show a new sublevel
      var menuBtnIn = event.target.closest('.'+menu.menuBtnInClass);
      if(menuBtnIn) showSubLevel(menu, menuBtnIn);
      // check if we need to go back to a previous level
      var menuBtnOut = event.target.closest('.'+menu.menuBtnOutClass);
      if(menuBtnOut) hideSubLevel(menu, menuBtnOut);
    });
    // init automplete search
    initAutocomplete(menu);
    // close drop menu on focus out
    initFocusOut(menu);
  };

  function toggleDropMenu(menu) { // toggle drop menu
    if(!menu.trigger) return;
    // actions to be performed when closing the drop menu
    menu.dropMenuClosed = function(event) {
      if(event.propertyName != 'visibility') return;
      if(getComputedStyle(menu.element).getPropertyValue('visibility') != 'hidden') return;
      menu.element.removeEventListener('transitionend', menu.dropMenuClosed);
      menu.element.removeAttribute('style');
      resetAllLevels(menu); // go back to main list
      resetAutocomplete(menu); // if autocomplte is enabled -> reset input fields
    };

    // on mobile - close drop menu when clicking on close btn
    menu.element.addEventListener('click', function(event){
      var target = event.target.closest('.js-drop-menu__close-btn');
      if(!target || !dropMenuVisible(menu)) return;
      menu.trigger.click();
    });

    // click on trigger
    menu.trigger.addEventListener('click', function(event){
      menu.element.removeEventListener('transitionend', menu.dropMenuClosed);
      var isVisible = dropMenuVisible(menu);
      Util.toggleClass(menu.element, menu.menuIsVisibleClass, !isVisible);
      isVisible ? menu.trigger.removeAttribute('aria-expanded') : menu.trigger.setAttribute('aria-expanded', true);
      if(isVisible) {
        menu.element.addEventListener('transitionend', menu.dropMenuClosed);
      } else {
        menu.element.addEventListener('transitionend', function cb(){
          menu.element.removeEventListener('transitionend', cb);
          focusFirstElement(menu, menu.element);
        });
        getLayoutValue(menu);
        setDropMenuMaxHeight(menu); // set max-height
        placeDropMenu(menu); // desktop only
      }
    });
  };

  function dropMenuVisible(menu) {
    return Util.hasClass(menu.element, menu.menuIsVisibleClass);
  };

  function showSubLevel(menu, menuBtn) {
    var mainLevel = menuBtn.closest('.'+menu.menuLevelClass),
      subLevel = Util.getChildrenByClassName(menuBtn.parentNode, menu.menuLevelClass);
    if(!mainLevel || subLevel.length == 0 ) return;
    // trigger classes
    Util.addClass(subLevel[0], menu.levelInClass);
    Util.addClass(mainLevel, menu.levelOutClass);
    Util.removeClass(mainLevel, menu.levelInClass);
    // animate height of main element
    animateDropMenu(menu, mainLevel.offsetHeight, subLevel[0].offsetHeight, function(){
      focusFirstElement(menu, subLevel[0]);
    });
  };

  function hideSubLevel(menu, menuBtn) {
    var subLevel = menuBtn.closest('.'+menu.menuLevelClass),
      mainLevel = subLevel.parentNode.closest('.'+menu.menuLevelClass);
    if(!mainLevel || !subLevel) return;
    // trigger classes
    Util.removeClass(subLevel, menu.levelInClass);
    Util.addClass(mainLevel, menu.levelInClass);
    Util.removeClass(mainLevel, menu.levelOutClass);
    // animate height of main element
    animateDropMenu(menu, subLevel.offsetHeight, mainLevel.offsetHeight, function(){
      var menuBtnIn = Util.getChildrenByClassName(subLevel.parentNode, menu.menuBtnInClass);
      if(menuBtnIn.length > 0) menuBtnIn[0].focus();
      // if primary level -> reset height of element + inner element
      if(Util.hasClass(mainLevel, 'js-drop-menu__list--main') && menu.layout == 'desktop') {
        menu.element.style.height = '';
        if(menu.innerElement.length > 0) menu.innerElement[0].style.height = '';
      }
    });
  };

  function animateDropMenu(menu, initHeight, finalHeight, cb) {
    if(menu.innerElement.length < 1 || menu.layout == 'mobile') {
      if(cb) setTimeout(function(){cb();}, menu.animationDuration*1000);
      return;
    }
    var resetHeight = false;
    // make sure init and final height are smaller than max height
    if(initHeight > menu.maxHeight) initHeight = menu.maxHeight;
    if(finalHeight > menu.maxHeight) {
      resetHeight = finalHeight;
      finalHeight = menu.maxHeight;
    }
    var change = finalHeight - initHeight,
      currentTime = null,
      duration = menu.animationDuration*1000;

    var animateHeight = function(timestamp){  
      if (!currentTime) currentTime = timestamp;         
      var progress = timestamp - currentTime;
      if(progress > duration) progress = duration;
      var val = Math.easeOutQuart(progress, initHeight, change, duration);
      menu.element.style.height = val+"px";
      if(progress < duration) {
        window.requestAnimationFrame(animateHeight);
      } else {
        menu.innerElement[0].style.height = resetHeight ? resetHeight+'px' : '';
        if(cb) cb();
      }
    };
    
    //set the height of the element before starting animation -> fix bug on Safari
    menu.element.style.height = initHeight+"px";
    window.requestAnimationFrame(animateHeight);
  };

  function resetAllLevels(menu) {
    var openLevels = menu.element.getElementsByClassName(menu.levelInClass),
      closeLevels = menu.element.getElementsByClassName(menu.levelOutClass);
    while(openLevels[0]) {
      Util.removeClass(openLevels[0], menu.levelInClass);
    }
    while(closeLevels[0]) {
      Util.removeClass(closeLevels[0], menu.levelOutClass);
    }
  };

  function focusFirstElement(menu, level) {
    var element = getFirstFocusable(level);
    element.focus();
  };

  function getFirstFocusable(element) {
    var elements = element.querySelectorAll(focusableElString);
    for(var i = 0; i < elements.length; i++) {
			if(elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length) {
				return elements[i];
			}
		}
  };

  function getFocusableElements(menu) { // all visible focusable elements
    var elements = menu.element.querySelectorAll(focusableElString);
    menu.focusableElements = [];
    for(var i = 0; i < elements.length; i++) {
			if( isVisible(menu, elements[i]) ) menu.focusableElements.push(elements[i]);
		}
  };

  function isVisible(menu, element) {
    var elementVisible = false;
    if( (element.offsetWidth || element.offsetHeight || element.getClientRects().length) && getComputedStyle(element).getPropertyValue('visibility') == 'visible') {
      elementVisible = true;
      if(menu.element.contains(element) && element.parentNode) elementVisible = isVisible(menu, element.parentNode);
    }
    return elementVisible;
  };

  function initAutocomplete(menu) {
    if(!Util.hasClass(menu.element, 'js-autocomplete')) return;
    // get list of search results
    getSearchResults(menu);
    var autocompleteCharacters = 1;
    menu.autocompleteInput = menu.element.getElementsByClassName('js-autocomplete__input');
    menu.autocompleteList = menu.element.getElementsByClassName('js-autocomplete__results');
    new Autocomplete({
      element: menu.element,
      characters: autocompleteCharacters,
      searchData: function(query, cb) {
        var data = [];
        if(query.length >= autocompleteCharacters) {
          data = menu.searchResults.filter(function(item){
            return item['label'].toLowerCase().indexOf(query.toLowerCase()) > -1;
          });
        }
        cb(data);
      }
    });
  };

  function resetAutocomplete(menu) {
    if(menu.autocompleteInput && menu.autocompleteInput.length > 0) {
      menu.autocompleteInput[0].value = '';
    }
  };

  function getSearchResults(menu) {
    var anchors = menu.element.getElementsByClassName('drop-menu__link');
    for(var i = 0; i < anchors.length; i++) {
      menu.searchResults.push({label: anchors[i].textContent, url: anchors[i].getAttribute('href')});
    }
  };

  function setDropMenuMaxHeight(menu) {
    if(!menu.trigger) return;
    if(menu.layout == 'mobile') {
      menu.maxHeight = '100%';
      menu.element.style.maxHeight = menu.maxHeight;
      if(menu.autocompleteList.length > 0) menu.autocompleteList[0].style.maxHeight = 'calc(100% - '+menu.autocompleteInput[0].offsetHeight+'px)';
    } else {
      menu.maxHeight = window.innerHeight - menu.trigger.getBoundingClientRect().bottom - menu.verticalGap - 15;
      menu.element.style.maxHeight = menu.maxHeight + 'px';
      if(menu.autocompleteList.length > 0) menu.autocompleteList[0].style.maxHeight = (menu.maxHeight - menu.autocompleteInput[0].offsetHeight) + 'px';
    }
  };

  function getLayoutValue(menu) {
    menu.layout = getComputedStyle(menu.element, ':before').getPropertyValue('content').replace(/\'|"/g, '');
  };

  function placeDropMenu(menu) {
    if(menu.layout == 'mobile') {
      menu.element.style.top = menu.element.style.left = menu.element.style.right = '';
    } else {
      var selectedTriggerPosition = menu.trigger.getBoundingClientRect();
			
      var left = selectedTriggerPosition.left,
        right = (window.innerWidth - selectedTriggerPosition.right),
        isRight = (window.innerWidth < selectedTriggerPosition.left + menu.element.offsetWidth);

      var rightVal = 'auto', leftVal = 'auto';
      if(isRight) {
        rightVal = right+'px';
      } else {
        leftVal = left+'px';
      }

      var topVal = (selectedTriggerPosition.bottom+menu.verticalGap)+'px';
      if( isRight && (right + menu.element.offsetWidth) > window.innerWidth) {
        rightVal = 'auto';
        leftVal = parseInt((window.innerWidth - menu.element.offsetWidth)/2)+'px';
      }
      menu.element.style.top = topVal;
      menu.element.style.left = leftVal;
      menu.element.style.right = rightVal;
    }
  };

  function closeOnResize(menu) {
    getLayoutValue(menu);
    if(menu.layout == 'mobile' || !dropMenuVisible(menu)) return;
    menu.trigger.click();
  };

  function closeOnClick(menu, target) {
    if(menu.layout == 'mobile' || !dropMenuVisible(menu)) return;
    if(menu.element.contains(target) || menu.trigger.contains(target)) return;
    menu.trigger.click();
  };

  function initFocusOut(menu) {
    menu.element.addEventListener('keydown', function(event){
      if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
        getFocusableElements(menu);
        if( (menu.focusableElements[0] == document.activeElement && event.shiftKey) || (menu.focusableElements[menu.focusableElements.length - 1] == document.activeElement && !event.shiftKey)) {
          menu.trigger.click();
        }
      } else if(event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape' && dropMenuVisible(menu)) {
        menu.trigger.click();
			}
    });
  };

  // init DropMenu objects
  var dropMenus = document.getElementsByClassName('js-drop-menu');
  var focusableElString = '[href], input:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable], summary';
  if( dropMenus.length > 0 ) {
    var dropMenusArray = [];
    for( var i = 0; i < dropMenus.length; i++) {(function(i){
      dropMenusArray.push(new DropMenu(dropMenus[i]));
    })(i);}

    // on resize -> close all drop menu elements
		window.addEventListener('resize', function(event){
			dropMenusArray.forEach(function(element){
				closeOnResize(element);
			});
    });
    
    // close drop menu when clicking outside it
		window.addEventListener('click', function(event){
      dropMenusArray.forEach(function(element){
				closeOnClick(element, event.target);
			});
		});
  }
}());
// File#: _3_mega-site-navigation
// Usage: codyhouse.co/license
(function() {
  var MegaNav = function(element) {
    this.element = element;
    this.search = this.element.getElementsByClassName('js-mega-nav__search');
    this.searchActiveController = false;
    this.menu = this.element.getElementsByClassName('js-mega-nav__nav');
    this.menuItems = this.menu[0].getElementsByClassName('js-mega-nav__item');
    this.menuActiveController = false;
    this.itemExpClass = 'mega-nav__item--expanded';
    this.classIconBtn = 'mega-nav__icon-btn--state-b';
    this.classSearchVisible = 'mega-nav__search--is-visible';
    this.classNavVisible = 'mega-nav__nav--is-visible';
    this.classMobileLayout = 'mega-nav--mobile';
    this.classDesktopLayout = 'mega-nav--desktop';
    this.layout = 'mobile';
    // store dropdown elements (if present)
    this.dropdown = this.element.getElementsByClassName('js-dropdown');
    // expanded class - added to header when subnav is open
    this.expandedClass = 'mega-nav--expanded';
    // check if subnav should open on hover
    this.hover = this.element.getAttribute('data-hover') && this.element.getAttribute('data-hover') == 'on';
    initMegaNav(this);
  };

  function initMegaNav(megaNav) {
    setMegaNavLayout(megaNav); // switch between mobile/desktop layout
    initSearch(megaNav); // controll search navigation
    initMenu(megaNav); // control main menu nav - mobile only
    initSubNav(megaNav); // toggle sub navigation visibility
    
    megaNav.element.addEventListener('update-menu-layout', function(event){
      setMegaNavLayout(megaNav); // window resize - update layout
    });
  };

  function setMegaNavLayout(megaNav) {
    var layout = getComputedStyle(megaNav.element, ':before').getPropertyValue('content').replace(/\'|"/g, '');
    if(layout == megaNav.layout) return;
    megaNav.layout = layout;
    Util.toggleClass(megaNav.element, megaNav.classDesktopLayout, megaNav.layout == 'desktop');
    Util.toggleClass(megaNav.element, megaNav.classMobileLayout, megaNav.layout != 'desktop');
    if(megaNav.layout == 'desktop') {
      closeSubNav(megaNav, false);
      // if the mega navigation has dropdown elements -> make sure they are in the right position (viewport awareness)
      triggerDropdownPosition(megaNav);
    } 
    closeSearch(megaNav, false);
    resetMegaNavOffset(megaNav); // reset header offset top value
    resetNavAppearance(megaNav); // reset nav expanded appearance
  };

  function resetMegaNavOffset(megaNav) {
    document.documentElement.style.setProperty('--mega-nav-offset-y', megaNav.element.getBoundingClientRect().top+'px');
  };

  function closeNavigation(megaNav) { // triggered by Esc key press
    // close search
    closeSearch(megaNav);
    // close nav
    if(Util.hasClass(megaNav.menu[0], megaNav.classNavVisible)) {
      toggleMenu(megaNav, megaNav.menu[0], 'menuActiveController', megaNav.classNavVisible, megaNav.menuActiveController, true);
    }
    //close subnav 
    closeSubNav(megaNav, false);
    resetNavAppearance(megaNav); // reset nav expanded appearance
  };

  function closeFocusNavigation(megaNav) { // triggered by Tab key pressed
    // close search when focus is lost
    if(Util.hasClass(megaNav.search[0], megaNav.classSearchVisible) && !document.activeElement.closest('.js-mega-nav__search')) {
      toggleMenu(megaNav, megaNav.search[0], 'searchActiveController', megaNav.classSearchVisible, megaNav.searchActiveController, true);
    }
    // close nav when focus is lost
    if(Util.hasClass(megaNav.menu[0], megaNav.classNavVisible) && !document.activeElement.closest('.js-mega-nav__nav')) {
      toggleMenu(megaNav, megaNav.menu[0], 'menuActiveController', megaNav.classNavVisible, megaNav.menuActiveController, true);
    }
    // close subnav when focus is lost
    for(var i = 0; i < megaNav.menuItems.length; i++) {
      if(!Util.hasClass(megaNav.menuItems[i], megaNav.itemExpClass)) continue;
      var parentItem = document.activeElement.closest('.js-mega-nav__item');
      if(parentItem && parentItem == megaNav.menuItems[i]) continue;
      closeSingleSubnav(megaNav, i);
    }
    resetNavAppearance(megaNav); // reset nav expanded appearance
  };

  function closeSearch(megaNav, bool) {
    if(megaNav.search.length < 1) return;
    if(Util.hasClass(megaNav.search[0], megaNav.classSearchVisible)) {
      toggleMenu(megaNav, megaNav.search[0], 'searchActiveController', megaNav.classSearchVisible, megaNav.searchActiveController, bool);
    }
  } ;

  function initSearch(megaNav) {
    if(megaNav.search.length == 0) return;
    // toggle search
    megaNav.searchToggles = document.querySelectorAll('[aria-controls="'+megaNav.search[0].getAttribute('id')+'"]');
    for(var i = 0; i < megaNav.searchToggles.length; i++) {(function(i){
      megaNav.searchToggles[i].addEventListener('click', function(event){
        // toggle search
        toggleMenu(megaNav, megaNav.search[0], 'searchActiveController', megaNav.classSearchVisible, megaNav.searchToggles[i], true);
        // close nav if it was open
        if(Util.hasClass(megaNav.menu[0], megaNav.classNavVisible)) {
          toggleMenu(megaNav, megaNav.menu[0], 'menuActiveController', megaNav.classNavVisible, megaNav.menuActiveController, false);
        }
        // close subnavigation if open
        closeSubNav(megaNav, false);
        resetNavAppearance(megaNav); // reset nav expanded appearance
      });
    })(i);}
  };

  function initMenu(megaNav) {
    if(megaNav.menu.length == 0) return;
    // toggle nav
    megaNav.menuToggles = document.querySelectorAll('[aria-controls="'+megaNav.menu[0].getAttribute('id')+'"]');
    for(var i = 0; i < megaNav.menuToggles.length; i++) {(function(i){
      megaNav.menuToggles[i].addEventListener('click', function(event){
        // toggle nav
        toggleMenu(megaNav, megaNav.menu[0], 'menuActiveController', megaNav.classNavVisible, megaNav.menuToggles[i], true);
        // close search if it was open
        if(Util.hasClass(megaNav.search[0], megaNav.classSearchVisible)) {
          toggleMenu(megaNav, megaNav.search[0], 'searchActiveController', megaNav.classSearchVisible, megaNav.searchActiveController, false);
        }
        resetNavAppearance(megaNav); // reset nav expanded appearance
      });
    })(i);}
  };

  function toggleMenu(megaNav, element, controller, visibleClass, toggle, moveFocus) {
    var menuIsVisible = Util.hasClass(element, visibleClass);
    Util.toggleClass(element, visibleClass, !menuIsVisible);
    Util.toggleClass(toggle, megaNav.classIconBtn, !menuIsVisible);
    menuIsVisible ? toggle.removeAttribute('aria-expanded') : toggle.setAttribute('aria-expanded', 'true');
    if(menuIsVisible) {
      if(toggle && moveFocus) toggle.focus();
      megaNav[controller] = false;
    } else {
      if(toggle) megaNav[controller] = toggle;
			getFirstFocusable(element).focus(); // move focus to first focusable element
    }
  };

  function getFirstFocusable(element) {
    var focusableEle = element.querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'),
		  firstFocusable = false;
    for(var i = 0; i < focusableEle.length; i++) {
      if( focusableEle[i].offsetWidth || focusableEle[i].offsetHeight || focusableEle[i].getClientRects().length ) {
        firstFocusable = focusableEle[i];
        break;
      }
    }
    return firstFocusable;
  };

  function initSubNav(megaNav) {
    // toggle subnavigation visibility
    megaNav.element.addEventListener('click', function(event){
      if(megaNav.hover && megaNav.layout == 'desktop') return; // data-hover="on"
      toggleSubNav(megaNav, event);
    });

    if(megaNav.hover) { // data-hover="on" => use mouse events 
      megaNav.element.addEventListener('mouseover', function(event) {
        if(megaNav.layout != 'desktop') return;
        toggleSubNav(megaNav, event)
      });

      megaNav.element.addEventListener('mouseout', function(event){
        if(megaNav.layout != 'desktop') return;
        var mainItem = event.target.closest('.js-mega-nav__item');
        if(!mainItem) return;
        var triggerBtn = mainItem.getElementsByClassName('js-mega-nav__control');
        if(triggerBtn.length < 1) return;
        var itemExpanded = Util.hasClass(mainItem, megaNav.itemExpClass);
        if(!itemExpanded) return;
        var mainItemHover = event.relatedTarget;
        if(mainItemHover && mainItem.contains(mainItemHover)) return;
        
        Util.toggleClass(mainItem, megaNav.itemExpClass, !itemExpanded);
        itemExpanded ? triggerBtn[0].removeAttribute('aria-expanded') : triggerBtn[0].setAttribute('aria-expanded', 'true');
      });
    }
  };

  function toggleSubNav(megaNav, event) {
    var triggerBtn = event.target.closest('.js-mega-nav__control');
    if(!triggerBtn) return;
    var mainItem = triggerBtn.closest('.js-mega-nav__item');
    if(!mainItem) return;
    var itemExpanded = Util.hasClass(mainItem, megaNav.itemExpClass);
    if(megaNav.hover && itemExpanded && megaNav.layout == 'desktop') return;
    Util.toggleClass(mainItem, megaNav.itemExpClass, !itemExpanded);
    itemExpanded ? triggerBtn.removeAttribute('aria-expanded') : triggerBtn.setAttribute('aria-expanded', 'true');
    if(megaNav.layout == 'desktop' && !itemExpanded) closeSubNav(megaNav, mainItem);
    // close search if open
    closeSearch(megaNav, false);
    resetNavAppearance(megaNav); // reset nav expanded appearance
  };

  function closeSubNav(megaNav, selectedItem) {
    // close subnav when a new sub nav element is open
    if(megaNav.menuItems.length == 0 ) return;
    for(var i = 0; i < megaNav.menuItems.length; i++) {
      if(megaNav.menuItems[i] != selectedItem) closeSingleSubnav(megaNav, i);
    }
  };

  function closeSingleSubnav(megaNav, index) {
    Util.removeClass(megaNav.menuItems[index], megaNav.itemExpClass);
    var triggerBtn = megaNav.menuItems[index].getElementsByClassName('js-mega-nav__control');
    if(triggerBtn.length > 0) triggerBtn[0].removeAttribute('aria-expanded');
  };

  function triggerDropdownPosition(megaNav) {
    // emit custom event to properly place dropdown elements - viewport awarness
    if(megaNav.dropdown.length == 0) return;
    for(var i = 0; i < megaNav.dropdown.length; i++) {
      megaNav.dropdown[i].dispatchEvent(new CustomEvent('placeDropdown'));
    }
  };

  function resetNavAppearance(megaNav) {
    ( (megaNav.element.getElementsByClassName(megaNav.itemExpClass).length > 0 && megaNav.layout == 'desktop') || megaNav.element.getElementsByClassName(megaNav.classSearchVisible).length > 0 ||(megaNav.element.getElementsByClassName(megaNav.classNavVisible).length > 0 && megaNav.layout == 'mobile'))
      ? Util.addClass(megaNav.element, megaNav.expandedClass)
      : Util.removeClass(megaNav.element, megaNav.expandedClass);
  };

  //initialize the MegaNav objects
  var megaNav = document.getElementsByClassName('js-mega-nav');
  if(megaNav.length > 0) {
    var megaNavArray = [];
    for(var i = 0; i < megaNav.length; i++) {
      (function(i){megaNavArray.push(new MegaNav(megaNav[i]));})(i);
    }

    // key events
    window.addEventListener('keyup', function(event){
			if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) { // listen for esc key events
        for(var i = 0; i < megaNavArray.length; i++) {(function(i){
          closeNavigation(megaNavArray[i]);
        })(i);}
			}
			// listen for tab key
			if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) { // close search or nav if it looses focus
        for(var i = 0; i < megaNavArray.length; i++) {(function(i){
          closeFocusNavigation(megaNavArray[i]);
        })(i);}
			}
    });

    window.addEventListener('click', function(event){
      if(!event.target.closest('.js-mega-nav')) closeNavigation(megaNavArray[0]);
    });
    
    // resize - update menu layout
    var resizingId = false,
      customEvent = new CustomEvent('update-menu-layout');
    window.addEventListener('resize', function(event){
      clearTimeout(resizingId);
      resizingId = setTimeout(doneResizing, 200);
    });

    function doneResizing() {
      for( var i = 0; i < megaNavArray.length; i++) {
        (function(i){megaNavArray[i].element.dispatchEvent(customEvent)})(i);
      };
    };

    (window.requestAnimationFrame) // init mega site nav layout
      ? window.requestAnimationFrame(doneResizing)
      : doneResizing();
  }
}());