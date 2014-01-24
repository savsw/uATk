/*******************************************************************************
* unofficial ANTLabs toolkit (uATk) - a chrome extension.
* Copyright 2013 Savannah Scriptworks (savsw.org).
*
*    This program is free software: you can redistribute it and/or modify
*    it under the terms of the GNU General Public License as published by
*    the Free Software Foundation, either version 3 of the License, or
*    (at your option) any later version.
*
*    This program is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU General Public License for more details.
*
*    You should have received a copy of the GNU General Public License
*    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* Authors:
*   Secesh aka Matthew R Chase (matt@chasefox.net)
*******************************************************************************/
function loadFromStorage(){
	if(localStorage.getItem("ignoreWithDescription")){
		jQuery("#ignoreWithDescription").addClass("fa-check")
	}else{
		jQuery("#ignoreWithDescription").removeClass("fa-check")
	}
	var idsIgnoreURL = localStorage.getItem("idsIgnoreURL")
	if(idsIgnoreURL != "undefined") jQuery('#idsIgnoreURL').val(idsIgnoreURL)
	var idsIgnore = localStorage.getItem("idsIgnore")
	if(idsIgnore != "undefined") jQuery('#idsIgnore').val(idsIgnore)
}

function loaded(){
	jQuery(".tapCheck").bind("click", function(){
		jQuery(this).find("i").toggleClass("fa-check")
	}).bind("focus", function(){
		//prevent element highlight border indicating focus.
		jQuery(this).blur()
	})

	jQuery('button:last').bind("click", function(){
		localStorage.setItem("ignoreWithDescription", jQuery('#ignoreWithDescription').hasClass("fa-check"))
		localStorage.setItem("idsIgnoreURL", jQuery('#idsIgnoreURL').val())
		localStorage.setItem("idsIgnore", jQuery('#idsIgnore').val())
		window.close()
	})

	loadFromStorage()
	
}
jQuery(loaded)