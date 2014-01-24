/*******************************************************************************
* unofficial ANTLabs toolkit (uATk) - a chrome extension.
* Copyright 2014 Savannah Scriptworks (savsw.org).
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
var product    = ""
var dryRun     = true
var rm_noExpire, rm_validUntil, rm_validUntilVal

chrome.extension.onRequest.addListener(function(r, s, rp){
	if("inngate_product" in r){
		//This event is fired from toolkit.js getProduct() when it identifies the page as an innGate.
		//This is what causes the ATk icon to be displayed in the address bar.
		product = r.inngate_product
		chrome.pageAction.show(s.tab.id)
	}
	if(r.inngate_action == "removeAccounts"){
		//Used to do it this way, but then it stopped working so we changed to undefined below.
		//TODO: investigate what happened.
		var tab = s.id
		if(tab < 0) tab = null

		//Pull the options from storage:
		var ignoreWithDescription = localStorage.getItem("ignoreWithDescription")
		var idsIgnore    = localStorage.getItem("idsIgnore")
		if(idsIgnore == "undefined") idsIgnore = ""
		var idsIgnoreURL = localStorage.getItem("idsIgnoreURL") //TODO: this.  grab the URL content and append to idsIgnore

		//These scripts are in toolkit.js
		//send the options to the tab:
		chrome.tabs.executeScript(undefined, {code: "var ATkOpts = { ignoreWithDescription: " + ignoreWithDescription + ", idsIgnore: '" + idsIgnore + "'}"})
		//launch the cleaner script:
	    chrome.tabs.executeScript(undefined, {code: "removeAccounts.begin" + 
	    	"(" + dryRun + "," + rm_noExpire + "," + rm_validUntil + ",'" + rm_validUntilVal + "')"
		})
	}
})