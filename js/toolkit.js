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
function getNavBody(){
	return document.getElementsByName("left")[0].contentDocument.body
}
function getMainBody(){
	return document.getElementsByName("main")[0].contentDocument.body
}
function obstructPage(mainOnly){
	var doObstruction = function(page){
		var obstruction = '<div id="ATkPageObstructor" style="z-index: 9999; width: 100%; height: 100%; position: absolute; top: 0; left: 0; background-color: #300; opacity: .5;">&nbsp;</div>'
		jQuery(page).append(obstruction)
	    var bh = jQuery(page).outerHeight()
	    var boh = jQuery(page).find("#ATkPageObstructor").outerHeight()
	    if(bh > boh)jQuery(page).find("#ATkPageObstructor").css("height", bh+"px")
	}

    doObstruction(getMainBody())
    if(!mainOnly) doObstruction(getNavBody())
}
function unObstructPage(){
    jQuery(getNavBody()) .find("#ATkPageObstructor").remove()
    jQuery(getMainBody()).find("#ATkPageObstructor").remove()
}
function getProduct(){
    try{ 
	    if( document.title.indexOf("InnGate 3") < 0 ){
	    	console.log("ATk: quitting - not InnGate 3", document.title)
	    	return;
	    }
		
		var mainFrame = top.frames["main"]
	    if( !mainFrame ){
	    	console.log("ATk: quitting - no main frame")
	    	return;
	    }
	    mainFrame = mainFrame.document
	    
	    var captions = document.getElementsByName("main")[0].contentDocument.getElementsByTagName('caption')
	    if( captions.length != 3 ){
	    	console.log("ATk: warning - unexpected number of caption elements in main: " + captions.length)
			
			//Inngate version 3.10 (the one with the graphs) doesn't use caption elements.
			if(jQuery(mainFrame).find("#blurbs-firmware").length == 1){
				try{
					//Wrapped in try so we can cheat.  Don't bother with type checking the found elements; just go for gold.
	    			if(jQuery(mainFrame).find("#blurbs-firmware").find("tbody tr")[0].innerText == "Product	InnGate M300 3.10"){
	    				console.log("ATk: quitting - this is a new inngate; not yet handled")
	    				//TODO: handle these inngates.
	    				return;
	    			}
	    		}catch(e){}
			}
	    	
	    	return;
	    }
	    if( captions[2].innerHTML != "Firmware" ){
	    	console.log("ATk: quitting - caption 3 does not contain firmware information")
	    	return;
	    }
	    
	    var productTr = captions[2].parentElement.children[1].children[1]
	    if( productTr.children[0].innerHTML != "<b>Product</b>" ){
	    	console.log("ATk: quitting - product unknown", productTr)
	    	return;
	    }
	        
	    var product = productTr.children[1].innerHTML
	    chrome.extension.sendRequest({inngate_product: product}, function(){})
    }catch(e){ console.log("ATk: died - error getting product", e)}
}

//don't use window.onload; it can disrupt normal page operation.
//window.onload = getProduct
jQuery(getProduct)

window.removeAccounts = new function(){
	this._processPage = function(){
		//We're going to use thead to check our columns.  The number of columns can change depending on the model.
		var thead = document.getElementsByName('main')[0].contentDocument.getElementsByTagName('thead')[0].children
		//The first tbody element is in the search form.  dunno where the second is right off (didn't look).
        var rows  = document.getElementsByName('main')[0].contentDocument.getElementsByTagName('tbody')[2].children
        
        var deleted = 0
        

        for(var row = 0; row < rows.length; row++){
            var userid      = rows[row].children[1].innerHTML
            var access_code = rows[row].children[2].innerHTML
            var valid_until = rows[row].children[6].innerHTML
            var description = rows[row].children[9].innerHTML
            var id = false
            if(userid      != '&nbsp;') id = userid
            if(access_code != '&nbsp;') id = access_code
            if(!id) continue;

            if(ATkOpts.ignoreWithDescription && description != "&nbsp;") continue
			
			var ignoreThisId = false
			for(var ignoreId = 0; ignoreId < ATkOpts.idsIgnore.length; ignoreId++){
				if(ATkOpts.idsIgnore[ignoreId] == id){
					ignoreThisId = true
					break;
				}
			}
			if(ignoreThisId) continue;


            this._options.totalAccounts++

        	if(valid_until == '&nbsp;'){
        		if(this._options.rm_noExpire){
	                try{ //TODO: DRY.  see below.
	                	//the checkbox is the last column in the table, regardless of model
	                	//(some models have more columns in the tabls)
	                	var checkbox = rows[row].children[rows[row].children.length-1].children[0]
	                    if(!this._options.dryRun) checkbox.checked = "checked"
	                	this._options.accountIds.push(id)
	                	deleted++
	                	console.log("would delete " + id + " because of noExpire")
	                }catch(e){}
	            }
	        }else if(this._options.rm_validUntil){
                valid_until = valid_until.substr(0, valid_until.indexOf(" "))
                valid_until = valid_until.split("/")
                if(this._options.dateFormat == "short"){
                    valid_until = new Date(valid_until[2], valid_until[1]-1, valid_until[0])
                }else if(this._options.dateFormat == "short_US"){
                    valid_until = new Date(valid_until[2], valid_until[0]-1, valid_until[1])
                }else{
                    alert("Cannot proceed!\nDo not know how to process date.\nFormat is: " + this._options.dateFormat)
                    return;
                }

                // return;
                if(valid_until < this._options.validUntilVal.date){
                    try{  //TODO: DRY.  see above.
                       	//the checkbox is the last column in the table, regardless of model
                		//(some models have more columns in the tabls)
                		var checkbox = rows[row].children[rows[row].children.length-1].children[0]
                    	if(!this._options.dryRun) checkbox.checked = "checked"
	                    this._options.accountIds.push(id)
	                    deleted++
	                    console.log("would delete " + id + " because of date comparison")
                    }catch(e){}
                }
	        }
        }
        
        if(deleted==0 || deleted<10){ //if we're only deleting a few, let's move on.
            if(this._options.currentPage < this._options.pageTotal){
                this._options.currentPage++
                this._loadPage()
            }else{
				window.unObstructPage()
				chrome.extension.sendRequest({finishedProcessing : true}, function(){})
                if(this._options.dryRun){
                    alert(
                        "This was a DRY RUN; no changes were attempted.\n\n" +
                        "Of " + this._options.totalAccounts + " accounts, " +
                        this._options.accountIds.length + " would be deleted."
                    )
                }else{
                    alert(
                        "All done!\n\n" +
                        "Of " + this._options.totalAccounts + " accounts, " +
                        this._options.accountIds.length + " were deleted."
                    )
                }
            }
        }else{
            if(!this._options.dryRun){
                jQuery('frame[name="main"]:first').on('load', {o: this}, function(e){
                    jQuery('frame[name="main"]:first').off('load')
                    window.obstructPage(true)
                    e.data.o._loadPage.apply(e.data.o, [])
                })
                document.getElementsByName('main')[0].contentDocument.getElementsByTagName('form')[1].submit()
            }else{
                this._options.currentPage++
                this._loadPage()
            }
        }
    }
	this._loadPage = function(column){
        jQuery('frame[name="main"]:first').on('load', {o: this}, function(e){
            jQuery('frame[name="main"]:first').off('load')
            window.obstructPage(true)
            //every time we load the page, we need to count how many pages remain.
            e.data.o._countPages.apply(e.data.o, [])
        })
       	
       	column = this._options.sortColumn || 7
       	var sortOptions = '&ord=asc&col=' + column
        document.getElementsByName('main')[0].location = '/admin/index-main.ant?m=auth.local&p=local&pag=' + this._options.currentPage + sortOptions
    }
	this._countPages = function(){
        var length = document.getElementsByName("main")[0].contentDocument.forms[1].children[1].children.length
        var href = document.getElementsByName("main")[0].contentDocument.forms[1].children[1].children[length-1]
        var arr = href.innerHTML.split("&amp;")
        var pages = false
        for(var i in arr){
            var arg = arr[i].split("=")
            if(arg[0] == "pag") pages = arg[1]
        }
        this._options.pageTotal = pages
        
        this._processPage()
    }

    this._processDateFormat = function(){
        this._options.dateFormat = document.getElementsByName('main')[0].contentDocument.getElementById('format_date').value
        //console.log(this._options.dateFormat)
        this._loadPage()
    }
    this._getDateTime = function(){
        jQuery('frame[name="main"]:first').on('load', {o: this}, function(e){
            jQuery('frame[name="main"]:first').off('load')
            window.obstructPage(true)
            e.data.o._processDateFormat.apply(e.data.o, [])
        })
        document.getElementsByName('main')[0].location = '/admin/index-main.ant?m=sys&p=settings&node=70'
    }





    this._options = {}
    this.begin = function(dryRun, rm_noExpire, rm_validUntil, rm_validUntilVal){
        this._options = {
            currentPage   : 1,
            pageTotal     : 0,
            
            accountIds    : [],
            totalAccounts : 0,
            
            dryRun        : dryRun,
            rm_noExpire   : rm_noExpire,
            rm_validUntil : rm_validUntil,
            validUntilVal : {
                date      : new Date(rm_validUntilVal),
                string    : rm_validUntilVal
            },
            dateFormat    : false //of the innGate (defined later)- short: "dd/mm/yyyy", short_US: "mm/dd/yyyy"
        }
        
        window.obstructPage()
        this._getDateTime()

        ATkOpts.idsIgnore = ATkOpts.idsIgnore.split(" ")
    }
}