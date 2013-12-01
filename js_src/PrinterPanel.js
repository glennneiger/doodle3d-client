function PrinterPanel() {
	this.wifiboxURL;
	this.element;
	
	this.retryDelay 					= 1000; 
	this.retryDelayer; 									// setTimout instance
	//this.timeoutTime 					= 3000;
	
	this.printerType;
	this.printerSettingsNames;
	
	var self = this;

	this.init = function(wifiboxURL,element) {
		self.wifiboxURL = wifiboxURL;
		self.element = element;
		
		self.printerSelector 	= element.find("#printerType");
		self.printerSelector.change(self.printerSelectorChanged);
		
		var formElements = element.find("[name]");
		self.printerSettingsNames = [];
		formElements.each( function(index,element) {
			self.printerSettingsNames.push(element.name);
		});
	}
	this.printerSelectorChanged = function(e) {
		console.log("PrinterPanel:printerSelectorChanged");
		console.log("self: ", self);
		self.printerType = self.printerSelector.find("option:selected").val();
		self.savePrinterType(self.loadPrinterSettings);
	}
	
	this.savePrinterType = function(complete) {
		console.log("PrinterPanel:savePrinterType");
		var postData = {}; 
		postData[self.printerSelector.attr("name")] = self.printerType;
		console.log("postData: ",postData);
		$.ajax({
			url: self.wifiboxURL + "/config/",
			type: "POST",
			dataType: 'json',
			data: postData,
			success: function(response){
				console.log("PrinterPanel:savePrinterType response: ",response);
				if(complete) complete();
			}
		}).fail(function() {
			console.log("PrinterPanel:savePrinterType: failed");
		});
	}
	this.loadPrinterSettings = function() {
		console.log("PrinterPanel:loadPrinterSettings");
		console.log("  self.printerSettingsNames: ",self.printerSettingsNames);
		var getData = {}; 
		$.each(self.printerSettingsNames, function(key, val) {
			getData[val] = "";
		});
		console.log("getData: ",getData);
		$.ajax({
			url: self.wifiboxURL + "/config/",
			dataType: 'json',
			data: getData,
			success: function(response){
				console.log("PrinterPanel:loadPrinterSettings response: ",response);
				
				self.fillForm(response.data,self.element);
			}
		}).fail(function() {
			console.log("PrinterPanel:loadPrinterSettings: failed");
		});
	}
}