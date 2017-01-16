// ==UserScript==
// @name        Metallum Shortcuts
// @author      Jed Caychingco
// @description Keyboard shortcuts for metal-archives.com

// @require     https://raw.githubusercontent.com/ccampbell/mousetrap/master/mousetrap.js
// @require     https://raw.githubusercontent.com/ccampbell/mousetrap/master/plugins/bind-dictionary/mousetrap-bind-dictionary.js

// @include     http://www.metal-archives.com/*
// @version     4.1
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
	var anchorLength = addAnchors()
	addToggleAllLyricsButton();
	addCopyLyricsButton();

	//Global shortcuts
	Mousetrap.bind({
		'shift+h' : function(){topMenuBox(1);},
		'shift+r' : function(){topMenuBox(2);},
		'shift+f' : function(){topMenuBox(3);},
		'l'       : login,
		'/'       : function(){Focus($("#searchQueryBox"));}
	});

	//Artist view
	if(window.location.href.startsWith("http:\/\/www.metal-archives.com\/bands\/")){
		//Href starts with http://...metal-ar...albums
		var path = 'table.discog> tbody> tr> td> a[href^="http://www.metal-archives.com/albums"]';

		Mousetrap.bind({
			'j' : function(){highLight('j', path);},
			'k' : function(){highLight('k', path);}
		});
	}

	//Album view
	if(window.location.href.startsWith("http:\/\/www.metal-archives.com\/albums\/")){

		var path = '#album_sidebar > table.chronology > tbody > .prevNext > td:not(.arrows)> a';
		Mousetrap.bind({
			'a'          : function(){$("#ToggleLyrics").click();},
			'c'          : function(){$("#cover").click();},
			
			'j'          : function(){highLight('j', path);},
			'k'          : function(){highLight('k', path);},
			
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
});


function highLight(letter, path) {

	var context = $(path);
	var hlight  = $('.highlight');
	var index   = context.index(hlight);

	context.eq(index).removeClass('highlight');

	if ( letter === 'k' ) {
		index--;
	} else if ( letter === 'j' ) {
		index++;
	}
	context.eq(index).addClass('highlight').focus();
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

function discography(letter) {
	Focus($("#album_sidebar > table.chronology > tbody > .prevNext> td:not(.arrows)> a")
		[letter==="n"? 0 : 1]
	);
}

function addAnchors(){
	var songNumbers = $("tbody>tr>td[width=20]>a");
	// while(songNumbers.length>10){
	// 	songNumbers.splice(-1);
	// }
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
		// text:  href,
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