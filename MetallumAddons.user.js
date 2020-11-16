// ==UserScript==
// @name        MetallumAddons
// @author      Jed Caychingco
// @description Keyboard shortcuts for metal-archives.com

// @require     https://raw.githubusercontent.com/jed1337/WebpageModifier/master/WebpageModifier.js
// @require     https://raw.githubusercontent.com/ccampbell/mousetrap/master/mousetrap.js
// @require     https://raw.githubusercontent.com/ccampbell/mousetrap/master/plugins/bind-dictionary/mousetrap-bind-dictionary.js

// @require     https://code.jquery.com/jquery-3.3.1.min.js

// @include     http://www.metal-archives.com/*
// @include     https://www.metal-archives.com/*
// @version     5.11
// @grant       none
// @icon        http://is3.mzstatic.com/image/thumb/Purple69/v4/b8/23/15/b8231518-c6c9-3127-f13e-8d9dc2f3046d/source/100x100bb.jpg
// ==/UserScript==

"use strict";
var CONTEXT_CLASS   = "contextArea";

var HIGHLIGHT_CLASS = "highlight";

addCss('.'+HIGHLIGHT_CLASS+'{\
	background: rgba(192, 57, 43,0.8) ! important; \
	border: none ! important; \
	color: #fff ! important; \
	-webkit-transition: linear 0.1s ! important; \
	-o-transition: linear 0.1s ! important; \
	transition: linear 0.1s ! important; \
}');

addCss("."+HIGHLIGHT_CLASS+" a{color:#fff!important ;outline:none}");

$(function() {
	var anchorLength = addAnchors()
	addToggleAllLyricsButton();
	addCopyLyricsButton();

	//Global shortcuts
	Mousetrap.bind({
		'shift+b' : function(){click("a:contains('bookmark')");},
		'shift+f' : function(){topMenuBox(3);},
		'shift+m' : function(){click("a:contains('message')");},
		'shift+u' : function(){click("span.member_name");},
		'shift+h' : function(){click("div#auditTrail", {findPath:"a[href*='history']"});},

		'l'       : function(){$("#login_form > div > input[name=loginUsername]").focus();}, //Focus on the login area
		'/'       : function(){$("#searchQueryBox").focus();} //Focus on the search area
	});

	//Bands view
	if(validPath("www.metal-archives.com\/bands\/")){
		bindJK("table.discog> tbody> tr", "", "td>a[href*='/albums']");
		Mousetrap.bind({
			'shift+a'    : function(){click("a.btn_add");},
			'shift+e'    : function(){click("a.btn_edit");},
			'shift+r'    : function(){click("a.btn_report_error");},
			'ctrl+alt+a' : function(){copy($("h1.band_name").text());},
			'ctrl+alt+g' : function(){copy($("div#band_stats>dl>dt:contains('Genre:')").next().text());},
		});
	}

	//Album view
	if(validPath("www.metal-archives.com\/albums\/")){
		//The comma in "td.prev , td.next" means OR
		//td:has(a), only selects if <td> has an <a> child
		bindJK("#album_sidebar> table.chronology> tbody> tr.prevNext> td.prev:has(a), td.next:has(a)", "", "a");
		Mousetrap.bind({
			'a'          : function(){click("#ToggleLyrics");},
			'c'          : function(){click("#cover");},
			'shift+a'    : function(){click(".band_name> a");},
			'shift+e'    : function(){click("span.ui-icon-pencil:contains('Edit')");},
			'shift+l'    : function(){click("span.ui-icon-person:contains('Edit')");},
			'shift+r'    : function(){click("dl>dd>a[href*='reviews']");},

			'ctrl+alt+c'   : copyLyrics,
			'ctrl+alt+a'   : function(){copy($(".band_name>a").text());},
			'ctrl+shift+a' : function(){copy($(".album_name>a").text());},

			'shift+d'    : function(){download();},
		});

		//Bind anchors to alt + <songnumber>
		//Can't make this into a function for some reason
		for(var i=1; i<=anchorLength; i++){
			(function(i){
				var binding = 'alt+'+(i%10);

				if(i>=10){
					var tens = parseInt(i/10);
					binding = 'alt+'+tens+" "+binding;
				}

				Mousetrap.bind(binding, function(){
					click("a[name="+ i +"]");


					// https://craig.is/killing/mice
					// Prevent default browser action when it sees (alt+someNumber)
					return false;
				});
			})(i);
		}
	}

	//Artist view
	if(validPath("www.metal-archives.com\/artists")){
		Mousetrap.bind({
			'shift+e'    : function(){click("span.ui-icon-pencil:contains('Edit')");},
			// 'shift+H'    : function(){click("a:contains(View update history)");},
		});
	}

	//Search view
	if(validPath("www.metal-archives.com\/search")){
		bindJK("#searchResults>tbody>tr", "", "td>a");
	}
});

function download(){
	var query = [
		"download",
		$(".band_name>a").text(),
		$(".album_name>a").text(),
		"rar"
	].join(" ");

	window.location.href="https://www.google.com/search?q="+query;
}

/**
* :param: selContext Where to find selHighlight and selFocus
* :param: selHighlight which item to highlight in the context
* :param: selFocus which item to bring focus to
*/
function highLight(letter, selContext, selHighlight, selFocus) {
	 checkSelector(selContext);

	 if(selHighlight!==""){
		 checkSelector(selHighlight);
	 }

	 checkSelector(selFocus);

	 var context = $(selContext);
	 var index   = context.index($("."+CONTEXT_CLASS));

	 //So that we can see more of the results. Explained more below (when .focus() is used)
	 var nextIndex;

	 context.eq(index).find(selHighlight).removeClass(HIGHLIGHT_CLASS);

	 if(selHighlight===""){
		  context.eq(index).removeClass(HIGHLIGHT_CLASS);
	 }

	 context.eq(index).removeClass(CONTEXT_CLASS);

	 // alert("before, index="+index+" nextIndex="+nextIndex);
	 var old = index;
	 if ( letter === 'k' ) {
		  if(index >= 0){
				index--;
		  }
		  nextIndex = index-1;
	 } else if ( letter === 'j' ) {
		  index++;
		  if(index === context.length){
				index = 0;
		  }
		  nextIndex = index+1;
	 }
	 // alert("after, index="+index+" nextIndex="+nextIndex);

	 //So that we can see more of context.eq(index)
	 //If we go down, it'll move 2 places down (nextIndex), go back to the original spot, then go down 1 place (index)
	 context.eq(nextIndex).find(selFocus).focus();

	 //We just put it in a currentContext so we don't keep referencing context.eq(...)
	 var currentContext = context.eq(index);
	 currentContext.addClass(CONTEXT_CLASS).find(selFocus).focus();
	 currentContext.find(selHighlight).addClass(HIGHLIGHT_CLASS).find(selFocus).focus();

	 if(selHighlight===""){
		  currentContext.addClass(HIGHLIGHT_CLASS).find(selFocus).focus();
	 }
}

function topMenuBox(num){
	click($("#top_menu_box > .menu_style_1 > li:nth-child("+num+") > a"))
}

function addAnchors(){
	var songNumbers = $("tbody>tr>td[width=20]>a");
	for (var i = 0; i < songNumbers.length; i++) {
		var id = (i+1);
		songNumbers[i].setAttribute("href", "#"+id);
		songNumbers[i].setAttribute("name", id);
	}
	return songNumbers.length;
}

function addToggleAllLyricsButton(){
	var tbody        = $(".table_lyrics > tbody");
	var lyricButtons = tbody.find("tr > td > a[id^=lyricsButton]");   //a's id starts with lyricsButton

	var button = $("<a/>", {
		id:   "ToggleLyrics",
		text: "Toggle all lyrics",
		click: function() {
			lyricButtons.each(function(){
				$(this).click();
			});
		}
	});

	// Only add a togle lyrics button if there are lyrics to toggle.
	if(lyricButtons.length>0){
		tbody.find("tr:last > td:last").append(button);
	}
}

function copyLyrics(){
	var anchor = window.location.hash.substring(1);
	$("a[name="+anchor+"]").parent().parent().find("button")[0].click()
}

function addCopyLyricsButton(){
	var trs   = $(".table_lyrics > tbody >tr:has(a[id^=lyricsButton])");
	var a     = trs.find("td>a[id^=lyricsButton]")
	var hrefs = a.map(function(){
		return this.getAttribute("href")
	})

	for (var i = 0; i < trs.length; i++) {
		trs[i].append(makeCopyLyricsButton(hrefs[i]));
	}
}

function makeCopyLyricsButton(href){
	if(href.indexOf('#')==0){
		href = href.substring(1, href.length);
	}

	toggleLyrics(href);     //Opens lyrics
	toggleLyrics(href);     //Closes lyrics

	var button = $("<button/>", {
		text:  "CL",
		click: function() {
			var lyrics = $("#lyrics_"+href).text().trim();
			if(lyrics === "(loading lyrics...)"){
				alert("The lyrics haven't loaded yet");
			}

			copy(lyrics);
		}
	});
	return button[0];
}