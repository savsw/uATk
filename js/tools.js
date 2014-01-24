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
var dryRun = true
function sync_dryRun(){
	dryRun = jQuery("#rm_dryRun").hasClass("fa-check")
	chrome.extension.getBackgroundPage().dryRun = dryRun
}
var rm_noExpire = false
function sync_rm_noExpire(){
	rm_noExpire = jQuery("#rm_noExpire").hasClass("fa-check")
	chrome.extension.getBackgroundPage().rm_noExpire = rm_noExpire
}
var rm_validUntil = false
function sync_rm_validUntil(){
	rm_validUntil = jQuery("#rm_validUntil").hasClass("fa-check")
	chrome.extension.getBackgroundPage().rm_validUntil = rm_validUntil
}
var rm_validUntilVal = false
function sync_rm_validUntilVal(){
	rm_validUntilVal = jQuery("#rm_validUntilVal").val()
	chrome.extension.getBackgroundPage().rm_validUntilVal = rm_validUntilVal
}
function syncVars(){
	sync_dryRun()
	sync_rm_noExpire()
	sync_rm_validUntil()
	sync_rm_validUntilVal()
}
/*
function _rm_noExpireAction(){
	console.log("Going to Remove accounts with no expiration.")
	chrome.extension.sendRequest({inngate_action: 'rm_noExpire'}, function(){} )
	window.close()
}
function rm_noExpire(){
	updateDryRun()
	
	jQuery("table:first").hide()
	jQuery("#confirmAction").html("delete all accounts with no valid_until date")
	jQuery("#confirmed").off("click").on("click", {}, _rm_noExpireAction)
	jQuery("#confirm").show()
	if(dryRun) jQuery("#confirmAction").prepend("DRY RUN: ")
}

function _rm_validUntilAction(){
	chrome.extension.sendRequest( {inngate_action: 'rm_validUntil'}, function(){} )
	window.close()
}
function rm_validUntil(){
	updateDryRun()
	
	var date = jQuery("#validUntilVal").val()
	if(date.length > 0){
		date = date.split("/")
		var dateStr = date[2] + "-" + date[0] + "-" + date[1]
		date = new Date(date[2], date[0]-1, date[1])
		chrome.extension.getBackgroundPage().validUntil = date

		jQuery("table:first").hide()
		jQuery("#confirmAction").html("delete all accounts older than " + dateStr)
		jQuery("#confirmed").off("click").on("click", {}, _rm_validUntilAction)
		jQuery("#confirm").show()
		if(dryRun) jQuery("#confirmAction").prepend("DRY RUN: ")
	}else{
		$("#validUntilVal").addClass("ui-state-error")
	}
}
*/

function checkForm(){

	//updates global variables from UI and syncs them to the background page.
	syncVars()

	//Fail unless at least one option is chosen.
	if( !(rm_validUntil || rm_noExpire) ) return setNoSelect()
	
	//dryRun is optional.  We just want to make it visible.
	if(!dryRun){ jQuery("#info2").hide(); jQuery("#warn2").show() }

	//date is required if we're going to rm_validUntil
	if(rm_validUntil){ if(!rm_validUntilVal) return setNoDate() }
	
	//We're OK to proceed, so let's move the confirmAction panel.
	var html = "<ul>"
	if(rm_noExpire)  html += "<li>accounts with no expiration</li>"
	if(rm_validUntil)html += "<li>accounts with valid_until before " + rm_validUntilVal + "</li>"
	html += "</ul>"
	
	jQuery("#actions").html(html)
	jQuery("#chooseOptions").hide()
	jQuery("#confirmAction").show()
}

function showError(error){
	jQuery("#info").hide()
	jQuery("#error").html(error).show()
}
function hideError(){
	jQuery("#error").html("").hide()
	jQuery("#info").show()
}
function setNoDate(){
	jQuery("div.date").addClass("has-error")
	showError("date is required when this option is enabled")
}
function clearNoDate(){
	jQuery("div.date").removeClass("has-error")
	hideError()
}
function setNoSelect(){
		jQuery("i#rm_validUntil").parent().addClass("btn-danger").removeClass("btn-default")
		jQuery("i#rm_noExpire")  .parent().addClass("btn-danger").removeClass("btn-default")

		showError("you must choose one of these options")
}
function clearNoSelect(){
	hideError()
	jQuery(".btn-danger").addClass("btn-default").removeClass("btn-danger")
}

function removeAccounts(){
	//Send the request to background.js.  By the time we get here, we've already sync'd the variables.
	chrome.extension.sendRequest( {inngate_action: 'removeAccounts'}, function(){} )
	window.close()
}

function loaded(){
	jQuery('.product').html(chrome.extension.getBackgroundPage().product)
	
	jQuery("i#rm_noExpire")  .parent().bind("click", clearNoSelect)
	jQuery("i#rm_validUntil").parent().bind("click", function(){
		clearNoSelect()
		clearNoDate()
	})
	jQuery(".tapCheck").bind("click", function(){
		//Clear any errors.  We're using a sloppy select, but that's OK.
		jQuery(".btn-danger").addClass("btn-default").removeClass("btn-danger")

		jQuery(this).find("i").toggleClass("fa-check")
	}).bind("focus", function(){
		//prevent element highlight border indicating focus.
		jQuery(this).blur()
	})

	jQuery("#rm_validUntilVal").bind("change", clearNoDate)

	jQuery("button#deleteAccounts").bind("click", checkForm)
	jQuery("button#rm_back").bind("click", function(){
		jQuery("#chooseOptions").show()
		jQuery("#confirmAction").hide()

		//Reset the display of the confirmAction panel:
		jQuery("#actions").html("")
		jQuery("#info2").show()
		jQuery("#warn2").hide()

	})

	jQuery("button#rm_confirmed").bind("click", removeAccounts)
	jQuery(".input-group.date").datepicker({format: "yyyy-mm-dd", autoclose: true, todayHighlight: true})
}

jQuery(loaded)