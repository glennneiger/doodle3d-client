/*
 * This file is part of the Doodle3D project (http://doodle3d.com).
 *
 * Copyright (c) 2013, Doodle3D
 * This software is licensed under the terms of the GNU GPL v2 or later.
 * See file LICENSE.txt or visit http://www.gnu.org/licenses/gpl.html for full license details.
 */

// prototype inheritance 
// http://robertnyman.com/2008/10/06/javascript-inheritance-how-and-why/
NetworkPanel.prototype = new FormPanel();
function NetworkPanel() {
	
	// network client mode states
	/*var CLIENT_MODE_STATE = {
		NOT_CONNECTED: "not connected", // also used as first item in networks list
		CONNECTED: "connected",
		CONNECTING: "connecting",
		CONNECTING_FAILED: "connecting failed"
	};
	var _clientModeState = CLIENT_MODE_STATE.NOT_CONNECTED;
	
	// network access point mode states
	var AP_MODE_STATE = {
		NO_AP: "no ap", // also used as first item in networks list
		AP: "ap",
		CREATING_AP: "creating ap"
	};
	var _apModeState = AP_MODE_STATE.NO_AP;
	// network mode
	var NETWORK_MODE = {
		NEITHER: "neither",
		CLIENT: "clientMode",
		ACCESS_POINT: "accessPointMode"
	};
	var _networkMode = NETWORK_MODE.NETWORK_MODE_NEITHER;
	
	var _api = new NetworkAPI();
	var _networks = {};
	var _currentNetwork;					// the ssid of the network the box is on
	var _selectedNetwork;         // the ssid of the selected network in the client mode settings
	var _currentLocalIP = "";
	
	var _currentAP;
	
	var _retryRetrieveStatusDelayTime = 1000;
	var _retryRetrieveStatusDelay;
	// after switching wifi network or creating a access point we delay the status retrieval
	// because the webserver needs time to switch
	var _retrieveNetworkStatusDelayTime = 1000;
	var _retrieveNetworkStatusDelay;
	
	// ui elements
	var _element;
	var _networkSelector;
	var _apFieldSet;
	var _clientFieldSet;
	var _apRadioButton;
	var _clientRadioButton;
	var _btnRefresh
	var _btnConnect;
	var _btnCreate;
	var _passwordField;
	var _passwordLabel;
	var _clientStateDisplay;
	var _apModeStateDisplay;*/
	
	var _self = this;
	
	this.init = function(wifiboxURL,wifiboxCGIBinURL,panelElement) {
		console.log("NetworkPanel:init");
		// super call:
		_self.constructor.prototype.init.call(_self,wifiboxURL,wifiboxCGIBinURL,panelElement);
		
		console.log("  calling readForm from NetworkPanel:init");
		_self.readForm();
		
		/*_api.init(wifiboxURL,wifiboxCGIBinURL);
		
		_element = panelElement;
		_apRadioButton			= _element.find("#ap");
		_clientRadioButton	= _element.find("#client");
		_btnRefresh		 			= _element.find("#refreshNetworks");
		_btnConnect 				= _element.find("#connectToNetwork");
		_btnCreate 					= _element.find("#createAP");
		_networkSelector 		= _element.find("#network");
		_apFieldSet 				= _element.find("#apSettings");
		_clientFieldSet 		= _element.find("#clientSettings");
		_passwordField 			= _element.find("#password");
		_passwordLabel 			= _element.find("#passwordLabel");
		_clientStateDisplay = _element.find("#clientModeState");
		_apModeStateDisplay = _element.find("#apModeState");
		
		_apRadioButton.parent().on('touchstart mousedown',showAPSettings);
		_clientRadioButton.parent().on('touchstart mousedown',showClientSettings);
		_btnRefresh.on('touchstart mousedown',onRefreshClick);
		_btnConnect.on('touchstart mousedown',_self.connectToNetwork);
		_btnCreate.on('touchstart mousedown',_self.createAP);
		_networkSelector.change(networkSelectorChanged);*/
	}
	/*
	 * Handlers
	 */
	/*
	function showAPSettings() {
		_apFieldSet.show();
		_clientFieldSet.hide();
	};
	function showClientSettings() {
		_clientFieldSet.show();
		_apFieldSet.hide();
	};
	function onRefreshClick() {
		_btnRefresh.attr("disabled", true);
		_self.refreshNetworks(function() {
			_btnRefresh.removeAttr("disabled");
		})
	}
	function networkSelectorChanged(e) {
		var selectedOption = $(this).find("option:selected");
		_self.selectNetwork(selectedOption.val());
	};

	this.update = function() {
		console.log("NetworkPanel:update");
		_self.refreshNetworks();
		_self.retrieveStatus(false);
	}
	this.refreshNetworks = function(completeHandler) {
		console.log("NetworkPanel:refreshNetworks");
		_api.scan(function(data) {
			//console.log("NetworkPanel:scanned");
			_networks = {};
			var foundCurrentNetwork = false;
			// fill network selector
			_networkSelector.empty();
			_networkSelector.append(
					$("<option></option>").val(CLIENT_MODE_STATE.NOT_CONNECTED).html(CLIENT_MODE_STATE.NOT_CONNECTED)
			);
			$.each(data.networks, function(index,element) {
				if(element.ssid == _currentNetwork) {
					foundCurrentNetwork = true;
				}
				_networkSelector.append(
						$("<option></option>").val(element.ssid).html(element.ssid)
				);
				_networks[element.ssid] = element;
			});
			if(foundCurrentNetwork) {
				_networkSelector.val(_currentNetwork);
				_self.selectNetwork(_currentNetwork);
			}
			if(completeHandler) completeHandler();
		});
	};
	
	this.retrieveStatus = function(connecting) {
		//console.log("NetworkPanel:retrieveStatus");
		_api.status(function(data) {
			if(typeof data.status === 'string') {
				data.status = parseInt(data.status);
			}
			console.log("NetworkPanel:retrievedStatus status: ",data.status,data.statusMessage);
			
			// Determine which network settings to show
			switch(data.status) {
				case NetworkAPI.STATUS.NOT_CONNECTED:
					setNetworkMode(NETWORK_MODE.NEITHER);
					break;
				case NetworkAPI.STATUS.CONNECTING_FAILED:
				case NetworkAPI.STATUS.CONNECTING:
				case NetworkAPI.STATUS.CONNECTED:
					setNetworkMode(NETWORK_MODE.CLIENT);
					
					if(data.status == SettingsWindow.API_CONNECTED) {
						_networkSelector.val(data.ssid);
	
						_currentNetwork = data.ssid;
						_currentLocalIP = data.localip;
						_self.selectNetwork(data.ssid);
					} else {
						_currentLocalIP = "";
					}
					break;
				case NetworkAPI.STATUS.CREATING:
				case NetworkAPI.STATUS.CREATED:
					setNetworkMode(NETWORK_MODE.ACCESS_POINT);
					
					_currentNetwork = undefined;
					_self.selectNetwork(CLIENT_MODE_STATE.NOT_CONNECTED);
					_networkSelector.val(CLIENT_MODE_STATE.NOT_CONNECTED);
	
					if(data.ssid && data.status == SettingsWindow.API_CREATED) {
						_currentAP = data.ssid;
					}
					break;
			}

			// update status message
			switch(data.status) {
				case NetworkAPI.STATUS.CONNECTING_FAILED:
					setClientModeState(CLIENT_MODE_STATE.CONNECTING_FAILED,data.statusMessage);
					setAPModeState(AP_MODE_STATE.NO_AP,"");
					break;
				case NetworkAPI.STATUS.NOT_CONNECTED:
					setClientModeState(CLIENT_MODE_STATE.NOT_CONNECTED,"");
					setAPModeState(AP_MODE_STATE.NO_AP,"");
					break;
				case NetworkAPI.STATUS.CONNECTING:
					setClientModeState(CLIENT_MODE_STATE.CONNECTING,"");
					setAPModeState(AP_MODE_STATE.NO_AP,"");
					break;
				case NetworkAPI.STATUS.CONNECTED:
					setClientModeState(CLIENT_MODE_STATE.CONNECTED,"");
					setAPModeState(AP_MODE_STATE.NO_AP,"");
					break;
				case NetworkAPI.STATUS.CREATING:
					setClientModeState(CLIENT_MODE_STATE.NOT_CONNECTED,"");
					setAPModeState(AP_MODE_STATE.CREATING_AP,"");
					break;
				case NetworkAPI.STATUS.CREATED:
					setClientModeState(CLIENT_MODE_STATE.NOT_CONNECTED,"");
					setAPModeState(AP_MODE_STATE.AP,"");
					break;
			}
			
			// Keep checking for updates?
			if(connecting) {
				switch(data.status) {
				case NetworkAPI.STATUS.CONNECTING:
				case NetworkAPI.STATUS.CREATING:
					clearTimeout(_retryRetrieveStatusDelay);
				  _retryRetrieveStatusDelay = setTimeout(function() { _self.retrieveStatus(connecting); },_retryRetrieveStatusDelayTime); // retry after delay
					break;
				}
			}
		}, function() {
			console.log("NetworkPanel:retrieveStatus failed");
			clearTimeout(_retryRetrieveStatusDelay);
			_retryRetrieveStatusDelay = setTimeout(function() { _self.retrieveStatus(connecting); }, _retryRetrieveStatusDelayTime); // retry after delay
		});
	};
	function setNetworkMode(mode) {
		//console.log("NetworkPanel:setNetworkMode: ",mode);
		if(mode == _networkMode) return;
		switch(mode) {
			case NETWORK_MODE.NEITHER:
				_apFieldSet.show();
				_clientFieldSet.show();
				break;
			case NETWORK_MODE.CLIENT:
				_clientRadioButton.prop('checked',true);
				_apFieldSet.hide();
				_clientFieldSet.show();
				break;
			case NETWORK_MODE.ACCESS_POINT:
				_apRadioButton.prop('checked',true);
				_apFieldSet.show();
				_clientFieldSet.hide();
				break;
		}
		// TODO
		//self.updatePanel.setNetworkMode(mode);
		_networkMode = mode;
	}
	
	this.selectNetwork = function(ssid) {
		console.log("select network: ",ssid);
		if(ssid == "") return;
		//console.log("  checked");
		_selectedNetwork = ssid;
		if(_networks == undefined || ssid == CLIENT_MODE_STATE.NOT_CONNECTED) {
			hideWiFiPassword();
		} else {
			var network = _networks[ssid];
			if(network.encryption == "none") {
				hideWiFiPassword();
			} else {
				showWiFiPassword();
			}
			_passwordField.val("");
		}
	};
	function showWiFiPassword() {
		_passwordLabel.show();
		_passwordField.show();
	};
	function hideWiFiPassword() {
		_passwordLabel.hide();
		_passwordField.hide();
	};

	function setClientModeState(state,statusMessage) {
		var msg = "";
		switch(state) {
		case SettingsWindow.NOT_CONNECTED:
			_btnConnect.removeAttr("disabled");
			msg = "Not connected";
			break;
		case SettingsWindow.CONNECTED:
			_btnConnect.removeAttr("disabled");
			
			msg = "Connected to: <b>"+_currentNetwork+"</b>.";
			if(_currentLocalIP != undefined && _currentLocalIP != "") {
				var a = "<a href='http://"+_currentLocalIP+"' target='_black'>"+_currentLocalIP+"</a>";
				msg += " (IP: "+a+")";
			}
			break;
		case SettingsWindow.CONNECTING:
			_btnConnect.attr("disabled", true);
			msg = "Connecting... Reconnect by connecting your device to <b>"+_selectedNetwork+"</b> and going to <a href='http://connect.doodle3d.com'>connect.doodle3d.com</a>";
			break;
		case SettingsWindow.CONNECTING_FAILED:
			_btnConnect.removeAttr("disabled");
			msg = statusMessage;
			break;
		}
		_clientStateDisplay.html(msg);
		_clientModeState = state;
	};
	function setAPModeState(state,statusMessage) {
		var msg = "";
		switch(state) {
		case SettingsWindow.NO_AP:
			_btnCreate.removeAttr("disabled");
			msg = "Not currently a access point";
			break;
		case SettingsWindow.AP:
			_btnCreate.removeAttr("disabled");
			msg = "Is access point: <b>"+_currentAP+"</b>";
			break;
		case SettingsWindow.CREATING_AP:
			_btnCreate.attr("disabled", true);
			msg = "Creating access point... Reconnect by connecting your device to <b>"+settings.substituted_ssid+"</b> and going to <a href='http://draw.doodle3d.com'>draw.doodle3d.com</a>";
			break;
		}
		_apModeStateDisplay.html(msg);
		_apModeState = state;
	};

	this.connectToNetwork = function() {
		console.log("NetworkPanel:connectToNetwork");
		if(_selectedNetwork == undefined) return;
		
		// save network related settings and on complete, connect to network
		_self.saveSettings(_self.readForm(),function(validated) {
			if(!validated) return;
			_api.associate(_selectedNetwork,_passwordField.val(),true);
		});
		setClientModeState(CLIENT_MODE_STATE.CONNECTING,"");

		// after switching wifi network or creating a access point we delay the status retrieval
		// because the webserver needs time to switch
		clearTimeout(_retrieveNetworkStatusDelay);
		_retrieveNetworkStatusDelay = setTimeout(function() { _self.retrieveNetworkStatus(true); }, _retrieveNetworkStatusDelayTime);
	};

	this.createAP = function() {
		console.log("createAP");
		if (communicateWithWifibox) {

			// save network related settings and on complete, create access point
			_self.saveSettings(_self.readForm(),function(success) {
				if(!success) return;
				setAPModeState(AP_MODE_STATE.CREATING_AP); // get latest substituted ssid
				$.ajax({
					url: _wifiboxCGIBinURL + "/network/openap",
					type: "POST",
					dataType: 'json',
					timeout: _timeoutTime,
					success: function(response){
						console.log("Settings:createAP response: ",response);
					}
				}).fail(function() {
					console.log("Settings:createAP: timeout (normal behavior)");
					//clearTimeout(self.retrySaveSettingsDelay);
					//self.retrySaveSettingsDelay = setTimeout(function() { self.saveSettings() },self.retryDelay); // retry after delay
				});

				setAPModeState(AP_MODE_STATE.CREATING_AP,"");

				// after switching wifi network or creating a access point we delay the status retrieval
				// because the webserver needs time to switch
				clearTimeout(_retrieveNetworkStatusDelay);
				_retrieveNetworkStatusDelay = setTimeout(function() { _self.retrieveNetworkStatus(true); }, _retrieveNetworkStatusDelayTime);
			});
		}
	};*/
}
