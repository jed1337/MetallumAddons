// ==UserScript==
// @name        Metallum Shortcuts
// @author      Jed Caychingco
// @description Keyboard shortcuts for metal-archives.com

// @require     https://raw.githubusercontent.com/ccampbell/mousetrap/master/mousetrap.js
// @require     https://raw.githubusercontent.com/ccampbell/mousetrap/master/plugins/bind-dictionary/mousetrap-bind-dictionary.js

// @include     http://www.metal-archives.com/*
// @version     3.1
// @grant       none
// @icon        http://is3.mzstatic.com/image/thumb/Purple69/v4/b8/23/15/b8231518-c6c9-3127-f13e-8d9dc2f3046d/source/100x100bb.jpg
// ==/UserScript==

"use strict";

function addCss(css) {
	 var head, style;
	 head = document.getElementsByTagName('head')[0];
	 if (!head) { return; }
	 style = document.createElement('style');
	 style.type = 'text/css';
	 style.innerHTML = css;
	 head.appendChild(style);
}

addCss('.highlight{ \
	 background: rgba(192, 57, 43,0.8) ! important; \
	 border: none ! important; \
	 color: #fff ! important; \
	 -webkit-transition: linear 0.1s ! important; \
	 -o-transition: linear 0.1s ! important; \
	 transition: linear 0.1s ! important; \
	');

$(function() {
	Mousetrap.bind({
		'f' : function forum(){$("#top_menu_box > .menu_style_1 > li:last-child > a")[0].click()},
		'l'       : login,
		'/'       : function search(){Focus($("#searchQueryBox"));},

		'j'       : function next() { highLight('j') },
		'k'       : function prev() { highLight('k') }, 

		'a'       : function toggleLyrics(){$("#ToggleLyrics").click();},
		'shift+a' : function gotoArtist(){$(".band_name> a")[0].click();},
		'c'       : function cover(){$("#cover").click();},
		'm'       : discography
	}); 

	addToggleAllLyricsButton();
});

function highLight(letter) {
	//Href starts with http://...metal-ar...albums
	var media  = $('table.discog> tbody> tr> td> a[href^="http://www.metal-archives.com/albums"]');
	var hlight = $('.highlight');
	var index  = media.index(hlight);

	media.eq(index).removeClass('highlight');

	if ( letter === 'k' ) {
		index--;
	} else if ( letter === 'j' ) {
		index++;
	}
	media.eq(index).addClass('highlight').focus();
}

function login(){
	Focus($("#login_form > div > input[name=loginUsername]"));
}

function discography() {
	Focus($("#album_sidebar > .chronology > tbody > .prevNext> td:not(.arrows)> a:first"));
}

function Focus(selector, frequency=4){
	selector.focus();

	for (var i=0; i < frequency; i++){
		setTimeout(function(){
			selector.toggleClass('highlight');
		}, (150* i));
	}
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
