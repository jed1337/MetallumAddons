// ==UserScript==
// @name        Metallum Shortcuts
// @author      Jed Caychingco
// @description Keyboard shortcuts for metal-archives.com

// @require     https://raw.githubusercontent.com/ccampbell/mousetrap/master/mousetrap.js
// @require     https://raw.githubusercontent.com/ccampbell/mousetrap/master/plugins/bind-dictionary/mousetrap-bind-dictionary.js

// @include     http://www.metal-archives.com/*
// @include     https://www.metal-archives.com/*
// @version     5.2
// @grant       none
// @icon        http://is3.mzstatic.com/image/thumb/Purple69/v4/b8/23/15/b8231518-c6c9-3127-f13e-8d9dc2f3046d/source/100x100bb.jpg
// ==/UserScript==

"use strict";

addCss('.highlight{\
	background: rgba(192, 57, 43,0.8) ! important; \
	border: none ! important; \
	color: #fff ! important; \
	-webkit-transition: linear 0.1s ! important; \
	-o-transition: linear 0.1s ! important; \
	transition: linear 0.1s ! important; \
}');
addCss(".highlight a{color:#fff; outline:none}");

function addCss(css) {
	var head, style;
	head = document.getElementsByTagName('head')[0];
	if (!head) { return; }
	style = document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = css;
	head.appendChild(style);
}

$(function() {
	var anchorLength = addAnchors()
	addToggleAllLyricsButton();
	addCopyLyricsButton();

	//Global shortcuts
	Mousetrap.bind({
		'shift+h' : function(){$("div#auditTrail").find("a[href*='history']")[0].click()},
		'shift+r' : function(){topMenuBox(2);},
		'shift+f' : function(){topMenuBox(3);},
		'l'       : login,
		'/'       : function(){Focus($("#searchQueryBox"));}
	});

	//Artist view
	if(validPath("www.metal-archives.com\/bands\/")){
		bindJK("table.discog> tbody> tr", "td>a[href*='/albums']");
	}

	//Album view
	if(validPath("www.metal-archives.com\/albums\/")){
		//The comma in "td.prev , td.next" means OR
		//td:has(a), only selects if <td> has an <a> child
		bindJK("#album_sidebar> table.chronology> tbody> tr.prevNext> td.prev:has(a), td.next:has(a)", "a");
		Mousetrap.bind({
			'a'          : function(){$("#ToggleLyrics").click();},
			'c'          : function(){$("#cover").click();},

			'shift+a'    : function(){$(".band_name> a")[0].click();},
			'ctrl+alt+c' : copyLyrics
		});

		//Bind anchors to alt + <songnumber>
		for(var i=1; i<=anchorLength; i++){
			(function(i){
				var binding = 'alt+'+(i%10);

				if(i>=10){
					var tens = parseInt(i/10);
					binding = 'alt+'+tens+" "+binding;
				}

				Mousetrap.bind(binding, function(){
					$("a[name="+ i +"]")[0].click();
				});
			})(i);
		}
	}

	//Search view
	if(validPath("www.metal-archives.com\/search")){
		bindJK("#searchResults>tbody>tr", "td>a");
	}
});

function bindJK(pathTR, pathA){
	Mousetrap.bind({
		'j': function(){highLight('j', pathTR, pathA);},
		'k': function(){highLight('k', pathTR, pathA);}
	});
}

function validPath(href){
	return window.location.href.indexOf(href)>0;
}


function highLight(letter, pathTR, pathA) {
	var context = $(pathTR);
	var hl      = "highlight";
	var index   = context.index($('.'+hl));

	context.eq(index).removeClass(hl);
	var old = index;
	if ( letter === 'k' ) {
		if(index >= 0){
			index--;
		}
	} else if ( letter === 'j' ) {
		index++;
		if(index === context.length){
			index = 0;
		}
	}
	context.eq(index).addClass(hl).find(pathA).focus();
}

function Focus(selector, frequency=4){
	selector.focus();

	for (var i=0; i < frequency; i++){
		setTimeout(function(){
			selector.toggleClass('highlight');
		}, (150* i));
	}
}

function topMenuBox(num){
	$("#top_menu_box > .menu_style_1 > li:nth-child("+num+") > a")[0].click();
}

function login(){
	Focus($("#login_form > div > input[name=loginUsername]"));
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
	var lyricButtons = tbody.find("tr > td > a[id^=lyricsButton]");	//a's id starts with lyricsButton

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
	toggleLyrics(href);
	toggleLyrics(href);


	var button = $("<button/>", {
		text:  "CL",
		click: function() {
			var lyrics = $("#lyrics_"+href).text().trim();
			if(lyrics === "(loading lyrics...)"){
				alert("The lyrics haven't loaded yet");
			}

			// Create a "hidden" textarea to support multi-line
			// and append it to the end of body
			var $temp = $("<textarea>");
			$("body").append($temp);

			// Put the lyrics in it and highlight it
			$temp.val(lyrics).select();

			// Copy the highlighted text
			document.execCommand("copy");

			// Remove it from the body
			$temp.remove();
		}
	});
	return button[0];
}