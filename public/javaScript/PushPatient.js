var PhenoTips=(function(b){var a=b.widgets=b.widgets||{};a.PushPatientWidget=Class.create({initialize:function(){this._pushManyPatients=false;var f=$$("div[id^=push-patient]");if(f.length==0){f=$$("a[id^=pushall-server]");if(f.length==0){return}this._pushManyPatients=true}this._serviceURL=new XWiki.Document("PushPatientService","PhenoTips").getURL("get","outputSyntax=plain");this._patientId=XWiki.currentDocument.page;this._initUI();var i=this;this._observeSave=function(){i._launchUI()};for(var e=0;e<f.length;e++){var c=f[e];var d=this._pushManyPatients?c:c.down("a");if(!d){continue}var h=c.readAttribute("name");var g=function(j){return function(k){k.stop();k.findElement().blur();i._selectedServer=j;if(k.findElement(".editbody")){new XWiki.widgets.ConfirmationBox({onYes:function(){document.fire("xwiki:actions:save",{"continue":true,form:k.findElement("form")});document.observe("xwiki:document:saved",i._observeSave)},onNo:function(){i._launchUI()}},{confirmationText:"Save before exporting?",showCancelButton:true})}else{i._launchUI()}}};d.observe("click",g(h))}},_initUI:function(){var g=function(k,j,i){return new Element("div",{id:k,"class":"section"}).insert(j&&new Element("h2").update(j)||"").insert(i&&new Element("p",{"class":"intro xHint"}).update(i)||"").insert(new Element("div",{"class":"section-contents"}))};var c=this._pushManyPatients?"Where to send all the patient data to?":"Where to send this patient profile?";var e=this._pushManyPatients?"Remote PhenoTips server where all the data will be sent":"Remote PhenoTips server where this patient's data will be sent";this._container=new Element("form",{id:"push-patients-ui","class":"xform",method:"post",action:this._serviceURL});this._container.insert(g("server-selection",c,e)).insert(g("user-selection","Authentication on remote server","Please choose the user name to be used to authenticate on the server and send the data; this user will be marked as the reporter on the remote server.")).insert(g("group-selection","Remote PhenoTips group","The PhenoTips group you would like to share this patient with on the remote server. If a group is selected, the group would be the owner and the given remote user will be a collaborator. If no group is selected, the given remote user will be the only owner."));if(!this._pushManyPatients){this._container.insert(g("fields-selection","Patient data preview","Please review the data that will be sent to the server"))}this._checkBoxApprove=new Element("input",{type:"checkbox",id:"approve-checkbox",value:"approve"});var f=new Element("label",{id:"approve-label"});var d=this._pushManyPatients?" I agree to push patient data to this server":" I agree to push this data to the server";f.insert(this._checkBoxApprove).insert(d);this._approveElement=new Element("div",{"class":"confirm-push plainmessage"});this._approveElement.insert(f);if(this._pushManyPatients){this._container.insert("<br/>")}this._container.insert(this._approveElement);this._serverManager=this._container.down("#server-selection .section-contents");this._userManager=this._container.down("#user-selection .section-contents");this._groupManager=this._container.down("#group-selection .section-contents");this._fieldsManager=this._pushManyPatients?null:this._container.down("#fields-selection .section-contents");this._initServerSelector();this._initMainFormActions();var h=this._pushManyPatients?"Pushing patient data to a remote PhenoTips instance...":"Pushing "+this._patientId+" to a remote database...";this._dialog=new b.widgets.ModalPopup(this._container,false,{title:h,verticalPosition:"top",removeOnClose:false})},_generateServerFirstMessage:function(){return new Element("div",{"class":"warningmessage"}).update("Please select server first")},_generateServerAndUserFirstMessage:function(){return new Element("div",{"class":"warningmessage"}).update("Please select server and valid user first")},_generateNoPatientJSONMessage:function(d){var c=new Element("input",{type:"button",name:"retry",value:"Retry","class":"button secondary"}).wrap("span",{"class":"buttonwrapper"});var e=this;c.observe("click",function(f){e._generateDataPreview(d)});return new Element("div",{"class":"errormessage"}).update("Failed to generate preview of the patient data").insert(c)},_generateNoServerListMessage:function(){var c=new Element("input",{type:"button",name:"retry",value:"Retry","class":"button secondary"}).wrap("span",{"class":"buttonwrapper"});var d=this;c.observe("click",function(e){d._launchUI()});return new Element("div",{"class":"errormessage"}).update("Can not access the list of remote servers. Please contact your administrator for further details.").insert(c)},_generateCantConnectToServerMessage:function(d,g,e){var c=new Element("input",{type:"button",name:"retry",value:"Retry","class":"button secondary"}).wrap("span",{"class":"buttonwrapper"});var f=this;c.observe("click",function(h){f._loginAndGetConfig(g,e)});return new Element("div",{"class":"errormessage"}).update(d+" ").insert(c)},_generateNoPushServerConfiguredMessage:function(){return new Element("div",{"class":"errormessage"}).update("No remote PhenoTips target servers are configured in your system.<br/>Please contact your administrator for further details.")},_generateIncorrectCredentialsMessage:function(){return new Element("div",{"class":"errormessage"}).update("Unable to authenticate user: incorrect credentials")},_generateFailedToPushPatient:function(e,d,h){var c=new Element("div",{"class":"errormessage"}).update(e);if(d){var d=new Element("input",{type:"button",name:"retry",value:"Retry","class":"button secondary"}).wrap("span",{"class":"buttonwrapper"});var g=this;d.observe("click",function(i){g._pushPatient()});c.insert(d)}if(h){var f=new Element("input",{type:"button",name:"retry",value:"Push as a new patient","class":"button secondary"}).wrap("span",{"class":"buttonwrapper"});var g=this;f.observe("click",function(i){g._selectPushNewPatient();g._pushPatient()});c.insert(f)}return c},_onUnapprovedUser:function(){this._patientData=undefined;this._groupManager.update(this._generateServerAndUserFirstMessage());!this._pushManyPatients&&this._fieldsManager.update(this._generateServerAndUserFirstMessage());this._pushButton.disable();this._approveElement.hide();this._pushResultSection.update("");this._patientFieldList=undefined;this._userGroupsList=undefined},_onNoServerSelected:function(){this._lastApprovedUser=undefined;this._lastSelectedGroup=undefined;this._userLoginError=undefined;this._serverInfo.hide();this._userManager.update(this._generateServerFirstMessage());this._onUnapprovedUser()},_disableControl:function(c){c.disable();c.__wasDisabledState=true},_disableInputs:function(e){this._container.addClassName("loading");var d=this._container.getElementsByTagName("input");for(var c=0;c<d.length;c++){if(d[c].disabled){d[c].__wasDisabledState=true}else{d[c].disable()}}this._serverSelector.down("select").disable();if(!e){this._cancelButton.enable()}},_restoreInputs:function(){this._container.removeClassName("loading");var d=this._container.getElementsByTagName("input");for(var c=0;c<d.length;c++){if(d[c].__wasDisabledState){delete (d[c].__wasDisabledState)}else{d[c].enable()}}this._serverSelector.down("select").enable()},_launchUI:function(){var c=this;document.stopObserving("xwiki:document:saved",c._observeSave);if(this.__launchUIAjaxInProgress){return}this._remoteServers={};this._numAvailableServers=0;this._onNoServerSelected();this._serverLoadMessages.update(new Element("div",{"class":"infomessage"}).update("Retrieving server list..."));this._serverLoadMessages.show();this._serverSelector.hide();this._container.addClassName("loading");new Ajax.Request(this._serviceURL,{method:c._container.method,parameters:{"do":"getremotes",patientId:c._patientId},onCreate:function(){c.__launchUIAjaxInProgress=true;c._dialog.showDialog();c._container.up(".msdialog-modal-container").style.zIndex=3001},onSuccess:function(d){console.log("PUSH: Got response for the getremotes request");var e=d.responseJSON;if(!e||e.length==0){c._serverLoadMessages.update(c._generateNoPushServerConfiguredMessage())}else{c._serverLoadMessages.hide();c._populateServerList(e)}},onFailure:function(d){c._serverLoadMessages.update(c._generateNoServerListMessage())},on0:function(d){d.request.options.onFailure(d)},onComplete:function(){c.__launchUIAjaxInProgress=false;c._container.removeClassName("loading");console.log("PUSH: getting remotes - complete")}})},_queryStoredUserName:function(){var c=this;this._userManager.update("");new Ajax.Request(this._serviceURL,{method:c._container.method,parameters:{"do":"getuser",serverid:this._selectedServer},onCreate:function(){console.log("PUSH: get username - start");c._disableInputs()},onSuccess:function(d){if(d.responseJSON.remoteUserName){c._lastApprovedUser=d.responseJSON.remoteUserName}},onFailure:function(d){console.log("PUSH: couldn't not get the user last used for this server")},on0:function(d){d.request.options.onFailure(d)},onComplete:function(){c._restoreInputs();console.log("PUSH: getting username - complete");if(c._lastApprovedUser){c._loginAndGetConfig(c._lastApprovedUser,null)}else{c._updateUserList()}}})},_loginAndGetConfig:function(f,c){console.log("loginAndGetConfig: probing "+f);var e=this;var d={"do":"getremoteconfig",serverid:this._selectedServer,savetoken:true};if(c){d.usr=f;d.pwd=c}new Ajax.Request(this._serviceURL,{method:e._container.method,parameters:d,onCreate:function(){console.log("PUSH: get remote config - start");e._disableInputs()},onSuccess:function(g){console.log("PUSH: Got response from server: "+stringifyObject(g.responseJSON));e._lastLoginResponse=g.responseJSON},onFailure:function(g){console.log("PUSH: unable to get a response from remote server");e._lastLoginResponse={status:"error",serverconnectproblem:true}},on0:function(g){g.request.options.onFailure(g)},onComplete:function(){this._restoreInputs();console.log("PUSH: get remote config - complete");if(this._lastLoginResponse.status=="success"){console.log("--> login successful!");this._lastApprovedUser=f;this._updateUserList();this._populateGroupsAndData(this._lastLoginResponse.groups,this._lastLoginResponse.serverfields,this._lastLoginResponse.updatesEnabled)}else{console.log("--> login failed!");if(this._lastApprovedUser==f){this._lastApprovedUser=undefined}this._updateUserList(f,this._lastLoginResponse,f,c)}}.bind(this)})},_logoutUser:function(){var d=this;var c={"do":"removetokens",serverid:this._selectedServer};new Ajax.Request(this._serviceURL,{method:d._container.method,parameters:c,onCreate:function(){console.log("PUSH: logout user");try{d._disableInputs()}catch(f){console.log("ERROR: "+f)}},onSuccess:function(e){d._lastLoginResponse=undefined;d._lastApprovedUser=undefined;d._updateUserList()},onFailure:function(e){alert("Failed to log out")},on0:function(e){e.request.options.onFailure(e)},onComplete:function(){this._restoreInputs();console.log("PUSH: logout - complete")}.bind(this)})},_updateUserList:function(d,f,c,p){if(f){if(this._lastLoginResponse.unauthorizedserver){this._userManager.update(this._generateCantConnectToServerMessage("This server is not authorized to push patients to the selected server.<br/>please contact your administrator",c,p));return}if(this._lastLoginResponse.serverconnectproblem){this._userManager.update(this._generateCantConnectToServerMessage("Cannot connect to selected PhenoTips server.",c,p));return}}console.log("updateUserList: "+d+", last approved: "+this._lastApprovedUser);var h=this;var e=new Element("table",{id:"user-list"});var n=function(v,r,u,q,w){var x=new Element("tr");var s=new Element("input",{type:"radio",value:u,name:"select-user"});if(v){s.checked=true}var t=new Element("label").insert(s).insert(u);x.insert(new Element("span",{"class":"fa fa-"+r}).wrap("td")).insert(t.wrap("td"));if(w){x.insert(w.wrap("td",{"class":"controlled-element"}))}s.observe("change",function(B){var z=B.findElement("input");var y=z.up("table").getElementsByTagName("input");for(var A=0;A<y.length;A++){if(y[A].getAttribute("name")!="select-user"){y[A].disable()}}var y=z.up("tr").getElementsByTagName("input");for(var A=0;A<y.length;A++){y[A].enable()}q()});return x};var j=false;if(this._lastApprovedUser){j=!d||(this._lastApprovedUser==d);var m=new Element("input",{type:"button",name:"logout",value:"Log out","class":"button secondary"}).wrap("span",{"class":"buttonwrapper"});m.observe("click",function(q){this._onUnapprovedUser();this._logoutUser()}.bind(this));var k=n(j,"check","Currently authenticated user: <strong>"+this._lastApprovedUser+"</strong>&nbsp;",function(){this._userLoginError.hide();this._onUnapprovedUser();this._loginAndGetConfig(this._lastApprovedUser)}.bind(this),m);e.insert(k)}var i=new Element("span",{"class":"user-password-box"});var g=new Element("input",{type:"text",id:"newusername",value:"",placeholder:"user name",size:12});if(d){g.value=d}var l=new Element("input",{type:"password",id:"password",value:"",placeholder:"password",size:12});var o=new Element("input",{type:"button",id:"authorizenewuser",name:"authorize",value:"Log in","class":"button secondary"});o.observe("click",function(q){if(l.value!=""){this._userLoginError.hide();this._loginAndGetConfig(g.value,l.value)}else{this._userLoginError.update("No password provided");this._userLoginError.show()}}.bind(this));if(j){g.disable();l.disable();o.disable()}i.insert(g.wrap("label",{"class":"fa fa-user"})).insert(" ").insert(l.wrap("label",{"class":"fa fa-key"})).insert(" ").insert(o.wrap("span",{"class":"buttonwrapper"}));if(this._lastApprovedUser){e.insert(n(!j,"user","Another remote user: ",this._onUnapprovedUser.bind(this),i))}else{e.insert(i.wrap("td",{"class":"controlled-element"}).wrap("tr"))}this._userLoginError=new Element("div",{"class":"errormessage"});this._userLoginError.hide();this._userManager.update(e).insert(this._userLoginError);if(f){if(this._lastLoginResponse.loginfailed&&p!=""){this._userLoginError.update("Unable to authorize user: incorrect credentials");this._userLoginError.show()}}},_populateGroupsAndData:function(d,c,e){if(!e){this._remoteServers[this._selectedServer]["noUpdates"]=true}this._displayGroupPicker(d);if(this._pushManyPatients){this._showApproveCheckbox()}else{this._generateDataPreview(c)}},_displayGroupPicker:function(c){if(!c){c=this._userGroupsList;if(!this._userGroupsList){return}}else{this._userGroupsList=c}console.log("Groups: "+stringifyObject(c));var d=new Element("table",{id:"user-list"});var e=function(l,h,k,m){var n=new Element("tr");var i=new Element("input",{type:"radio",value:m,name:"select-group"});if(l){i.checked=true}var j=new Element("label").insert(i).insert(k);n.insert(new Element("span",{"class":"fa fa-"+h}).wrap("td")).insert(j.wrap("td"));return n};if(!this._updatingExistingPatient()){var f="None";if(c.length==0){f+=" <span class ='hint'>(user "+this._lastApprovedUser+" does not belong to any PhenoTips groups on the selected server)</span>"}d.insert(e(true,"user",f,"__self"));c.each(function(h){d.insert(e(false,"group",h,h))})}else{var g="Keep existing group(s)";g+=" <span class ='hint'>(the group can't be changed when updating an existing patient)</span>";d.insert(e(true,"check",g,"__self"))}this._groupManager.update(d);if(this._remoteServers[this._selectedServer]["noUpdates"]){this._disableUpdateOption()}},_generateDataPreview:function(c){this._patientFieldList=c;var d=this;new Ajax.Request(this._serviceURL,{method:d._container.method,parameters:{"do":"getpatientjson",patientid:d._patientId,fields:Object.toJSON(this._patientFieldList)},onCreate:function(){console.log("PUSH: get patient JSON - start");d._disableInputs()},onSuccess:function(e){console.log("PUSH: Got response from server: "+stringifyObject(e.responseJSON));d._displayPatientData(e.responseJSON)},onFailure:function(e){console.log("PUSH: unable to get patient JSON");d._fieldsManager.update(d._generateNoPatientJSONMessage(c))},on0:function(e){e.request.options.onFailure(e)},onComplete:function(){d._restoreInputs();console.log("PUSH: get patient JSON - complete")}})},_displayPatientData:function(c){this._showApproveCheckbox();this._patientData=c;this._fieldsManager.update(this._generatePatientDataPreview(c))},_showApproveCheckbox:function(){this._checkBoxApprove.checked=false;this._checkBoxApprove.enable();this._approveElement.show()},_generatePatientDataPreview:function(d){var e=[{name:"external_id",title:"Identifier",callback:"__displayId"},{name:"sex",title:"Sex",callback:"__displaySex"},{name:"features",title:"Phenotipic features",callback:"__displayFeatures"},{name:"disorders",title:"Known disorders",callback:"__displayFeatures"},];var c=new Element("dl");var f=this;e.each(function(g){d[g.name]&&f[g.callback]&&c.insert(new Element("dt").update(g.title||g.name)).insert(f[g.callback](d[g.name]).addClassName("data-preview-section"))});return c},__displayId:function(c){return new Element("dd").insert(c)},__displaySex:function(c){return new Element("dd").insert((c=="F")?"Female":(c=="M"?"Male":"Unknown"))},__displayFeatures:function(d){var c=new Element("dd");d.each(function(e){c.insert(new Element("div",{"class":(e.observed=="no"?"negative":"")}).update((e.observed=="no"?"NO ":"")+e.label).insert(e.id&&new Element("span",{"class":"hint"}).update(" ("+e.id+")")||""))});return c},_populateServerList:function(j){this._remoteServers={};var n=[];this._numAvailableServers=j.length;for(var h=0;h<j.length;h++){var e=j[h].serverinfo;var d=j[h].pushinfo;var c=e.serverID;n.push(c);e.serverURL=this._addHTTP(e.serverURL);var f=d?d.lastPushAgeInHours:-1;var g=d?d.remotePatientID:"";var m=d?d.remotePatientGUID:"";var l=d?(e.serverURL+d.remotePatientURL):"";this._remoteServers[c]={url:e.serverURL,desc:e.serverDescription,pushAgeHours:f,remoteID:g,remoteGUID:m,remoteURL:l}}n.sort();var k=this;this._selectServer(this._selectedServer)},_selectServer:function(d,c){this._selectedServer=d;var h=this._remoteServers[d];var m=new Element("a",{href:h.url,target:"_blank","class":"remote-server-name"}).update(this._selectedServer);if(this._numAvailableServers==1){this._serverInfo.update("There is only one configured remote server: ")}var n="";if(h.pushAgeHours!==undefined&&h.pushAgeHours>=0){n=new Element("dd");var o=new Element("p",{id:"server-description"});var l=h.pushAgeHours;o.insert("This patient has been uploaded to this server ");if(l<1){o.insert(" less than an hour ago")}else{if(l>=48){o.insert(" "+Math.floor(l/24)+" days ago")}else{o.insert(" "+l+" hours ago")}}o.insert(" as ").insert(new Element("a",{href:h.remoteURL,target:"_blank"}).update(h.remoteID)).insert(".");o.insert("<br/>Further pushes will attempt to update the patient on the remote server.");n.insert(o);var k=this;var e=new Element("p");var j=new Element("input",{type:"radio",value:"update",id:"choice-update-patient",name:"new-or-update"});j.checked=true;j.observe("change",function(){k._displayGroupPicker()});var g=new Element("label",{hidden:true}).insert(new Element("span",{"class":"fa fa-refresh"}).update(" ")).insert(j).insert("Update remote patient");var i=new Element("input",{type:"radio",value:"new",id:"choice-new-patient",name:"new-or-update"});i.observe("change",function(){k._displayGroupPicker()});var f=new Element("label",{hidden:true}).insert(new Element("span",{"class":"fa fa-plus-square"}).update(" ")).insert(i).insert("Create new remote patient");n.insert(g).insert(f)}this._serverInfo.update(new Element("dl").insert(m.clone(true).wrap("dt")).insert(h.desc&&new Element("dd",{"class":"hint"}).update(h.desc)||"").insert(n||""));if(!c){this._serverInfo.show();this._queryStoredUserName()}},_onServerOptionChange:function(){var c=this._serverSelector.down("select");var d=c.options[c.selectedIndex].value;this._onNoServerSelected();if(d!="none"){this._selectServer(d)}},_initServerSelector:function(){this._serverLoadMessages=new Element("div",{id:"server-load-messages"});this._serverLoadMessages.hide();var c=new Element("select",{id:"server-selector"});c.insert(new Element("option",{value:"none"}).update("Loading server list..."));c.observe("change",this._onServerOptionChange.bind(this));this._serverSelector=new Element("div",{id:"server-selector-div"});this._serverSelector.hide();this._serverSelector.update(c);this._serverInfo=new Element("div",{id:"server-info"});this._serverManager.update(this._serverLoadMessages).insert(this._serverSelector).insert(this._serverInfo)},_initMainFormActions:function(){var e=this;var d=new Element("div",{"class":"buttons"});d.insert(new Element("input",{type:"hidden",name:"xaction",value:"push"}));d.insert(new Element("input",{type:"hidden",name:"patient",value:this._patientId}));var c=this._pushManyPatients?"Next: Select patients and data fields to be pushed":"Push";d.insert(new Element("input",{type:"submit",name:"submit",value:c,"class":"button",id:"push_patient_button"}).wrap("span",{"class":"buttonwrapper"}));d.insert(new Element("input",{type:"button",name:"close",value:"Cancel","class":"button secondary"}).wrap("span",{"class":"buttonwrapper"}));this._container.insert(d);this._pushResultSection=new Element("div",{"class":"section-contents"});this._container.insert(this._pushResultSection);this._cancelButton=d.down('input[name="close"]');this._cancelButton.observe("click",function(f){e._dialog.closeDialog()});this._pushButton=d.down('input[name="submit"]');this._checkBoxApprove.observe("click",function(f){if(e._checkBoxApprove.checked){e._pushResultSection.update("");e._pushButton.enable()}else{e._pushButton.disable()}e._pushResultSection.update("")});this._container.observe("submit",function(f){f.stop();if(e._pushManyPatients){e._pushMultiplePatients()}else{e._pushPatient()}})},_updatingExistingPatient:function(){var d=false;var c=document.getElementById("choice-update-patient");if(c){d=c.checked}return d},_selectPushNewPatient:function(){var c=document.getElementById("choice-update-patient");var d=document.getElementById("choice-new-patient");if(c&&d){c.checked=false;d.checked=true}},_disableUpdateOption:function(){var e=document.getElementById("choice-new-patient");if(e){e.checked=true}var c=document.getElementById("choice-update-patient-label");if(c){var d=document.getElementById("server-description");d.insert("<p>Selected server does not allow updating existing patients, so can only push again to a new patient record.</p>");c.hide()}},_pushPatient:function(c,f,e){var h=this;if(h._pushManyPatients&&(!c||!f)){return}if(!h._pushManyPatients){h._pushResultSection.update("")}var c=c?c:this._patientId;var g={"do":"push",serverid:this._selectedServer,patientid:c};g.fields=e?Object.toJSON(e):Object.toJSON(this._patientFieldList);if(h._pushManyPatients){g.guid="auto"}else{if(this._updatingExistingPatient()){g.guid=h._remoteServers[h._selectedServer].remoteGUID}}var d=$$('input:checked[type=radio][name="select-group"]')[0].value;if(d!="__self"){g.groupname=d}console.log("PUSH request params: "+stringifyObject(g));new Ajax.Request(this._serviceURL,{method:h._container.method,parameters:g,onCreate:function(){h._disableInputs(true)},onSuccess:function(j){try{console.log("Got response: "+stringifyObject(j.responseJSON));var k=j.responseJSON;if(h._pushManyPatients){f(k,c);return}if(k.status=="success"){h._checkBoxApprove.checked=false;var n=h._remoteServers[h._selectedServer].url+k.patienturl;h._remoteServers[h._selectedServer]["pushAgeHours"]=0;h._remoteServers[h._selectedServer]["remoteID"]=k.patientid;h._remoteServers[h._selectedServer]["remoteGUID"]=k.patientguid;h._remoteServers[h._selectedServer]["remoteURL"]=n;if(h._updatingExistingPatient()){var m="(<a href='"+n+"' target='_blank'>click here to open remote patient</a>)";h._pushResultSection.update(new Element("div",{"class":"infomessage"}).update("Updated patient successfully. "+m))}else{var i="<a href='"+n+"' target='_blank'>"+k.patientid+"</a>";h._pushResultSection.update(new Element("div",{"class":"infomessage"}).update("Pushed patient successfully, ID of the new patient on the remote server is "+i))}h._selectServer(h._selectedServer,true);h._displayGroupPicker()}else{if(k.updatesdisabled){h._pushResultSection.update(h._generateFailedToPushPatient("Unable to update this patient - updates are disbaled on the remote server."))}else{if(k.invalidguid){h._pushResultSection.update(h._generateFailedToPushPatient("Unable to update this patient - stored remote GUID is incorrect. Maybe the patient was deleted on the remote server.&nbsp;",false,true))}else{if(k.accessdeniedguid){h._pushResultSection.update(h._generateFailedToPushPatient("Unable to update this patient - access denied. Check if the given remote user has access rights to update the patient."))}else{if(k.accessdeniedguid){h._pushResultSection.update(h._generateFailedToPushPatient("Unable to update this patient: access denied"))}else{if(k.cantconnect){h._pushResultSection.update(h._generateFailedToPushPatient("Unable to connect to server",true))}else{h._pushResultSection.update(h._generateFailedToPushPatient("Unable to update this patient",true))}}}}}}}catch(l){console.log("EXCEPTION: "+l);h._pushResultSection.update(h._generateFailedToPushPatient("Error updating patient ("+l+")",true))}},onFailure:function(j){if(h._pushManyPatients){f({status:"error"},c);return}var i=false;var k=j.statusText;if(j.statusText==""||j.status==12031){k="Server not responding";i=true}h._pushResultSection.update(h._generateFailedToPushPatient(k,i))},on0:function(i){if(h._pushManyPatients){f({status:"error"},c);return}i.request.options.onFailure(i)},onComplete:function(){h._restoreInputs();if(!h._checkBoxApprove.checked){h._pushButton.disable()}}})},_addHTTP:function(c){if(!/^(f|ht)tps?:\/\//i.test(c)){c="http://"+c}return c},_pushMultiplePatients:function(){var h=this;var f=function(i,k){h._checkBoxApprove.checked=false;var m=new Element("div",{"class":"multi-push-results infomessage"});h._pushResultSection.update(m);var l=0;var j=function(o,p){if(o&&p){if(o.status!="success"){m.className="multi-push-results errormessage";if(o.cantconnect){m.insert(" unable to connect to the remote server.");return}var q="failed.";if(o.invalidguid){q="unable to update: stored remote GUID is incorrect."}else{if(o.accessdeniedguid){q="unable to update: access denied."}}m.insert(" "+q+"<br/>")}else{m.innerHTML=m.innerHTML.replace(/Pushing (\w+?)\.\.\.$/,"");var s=h._remoteServers[h._selectedServer].url+o.patienturl;var r="<a href='"+s+"' target='_blank'>"+o.patientid+"</a>";m.insert("<div class='pushed-ok-message'>Pushed "+p+" successfully, remote patient ID is "+r+"</div>")}}if(l<i.length){var n=i[l++];m.insert("Pushing "+n+"...");h._pushPatient(n,j,k)}};j()};var c=function(i,j){if(i.length==0){return}var k="Do you want to push the following "+i.length+" patients to "+h._selectedServer+"?<br/><div class='plainmessage multi-push-patient-list'><ol>";i.each(function(l){k+="<li>"+l+"</li>"});k+="</ol></div>";new XWiki.widgets.ConfirmationBox({onYes:function(){f(i,j)},},{confirmationText:k,showCancelButton:false})};var d=function(){alert("Failed to get the list of patients to be pushed")};var g=$("phenotips_export");if(!g){return}var e=new b.widgets.ModalPopup('<img src="/resources/icons/xwiki/ajax%2Dloader%2Dlarge.gif"/>',false,{title:"Export options",verticalPosition:"top",removeOnClose:true,extraClassName:"export-dialog"});e.showDialog();new Ajax.Request(new XWiki.Document("ExportPreferences","PhenoTips").getURL("get","space="+/space=([^&]+)/.exec(g.href)[1]+"&multipatient=true&remoteserver="+this._selectedServer),{onSuccess:function(j){var i=e.dialogBox._x_contentPlug;i.update(j.responseText);i.__dialog=e;document.fire("xwiki:dom:updated",{elements:[i],multiPushPreferences:i,callbackOK:c,callbackFail:d})}})}});return b}(PhenoTips||{}));["xwiki:dom:updated"].each(function(a){document.observe(a,function(f){if(!f.memo||!f.memo.multiPushPreferences||!f.memo.callbackOK){return}var d=f.memo.multiPushPreferences.__dialog;var c=f.memo.callbackOK;var e=f.memo.callbackFail;var b=$("push-multiple-patients");b&&b.observe("click",function(l){l.stop();var n=$("filter-match-count");var k=n&&n.up("form");if(k){var i=[];var h=k.down("ul.field-list");var m=h.select('input[name="columns"]');m.each(function(o){if(o.checked){i.push(o.identify().replace("columns_",""))}});var j="/bin/get/PhenoTips/Export?list=true&"+k.serialize();var g=new Ajax.Request(j,{method:"get",onSuccess:function(p){var o=[];p.responseJSON.each(function(q){o.push(q.replace("data.",""))});c(o,i)},onFailure:function(o){e&&e()}})}d.closeDialog()})})});document.observe("xwiki:dom:loaded",function(){new PhenoTips.widgets.PushPatientWidget()});function stringifyObject(a){return _printObjectInternal(a,1)}function _printObjectInternal(d,e){if(e>10){return"...[too deep, possibly a recursive object]..."}var b="";if(typeof d=="object"){if(Object.prototype.toString.call(d)==="[object Array]"){b="[";for(var c=0;c<d.length;c++){if(c>0){b+=", "}b+=_printObjectInternal(d[c],e+1)}b+="]"}else{b="{";var a=0;if(e==0){b+="\n"}for(property in d){if(!d.hasOwnProperty(property)){continue}if(e!=0&&a!=0){b+=", "}b+=property+": "+_printObjectInternal(d[property],e+1);if(e==0){b+="\n"}a++}b+="}"}}else{if(typeof d=="string"){b="'"+d+"'"}else{b=""+d}}return b};