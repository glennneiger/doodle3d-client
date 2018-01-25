/*
 * This file is part of the Doodle3D project (http://doodle3d.com).
 *
 * Copyright (c) 2013, Doodle3D
 * This software is licensed under the terms of the GNU GPL v2 or later.
 * See file LICENSE.txt or visit http://www.gnu.org/licenses/gpl.html for full license details.
 */

var twistIncrement = Math.PI/1800;

var btnNew, btnPrevious, btnNext, btnOops, btnStop, btnInfo;
var btnSettings, btnWordArt;
var btnToggleEdit, buttonGroupEdit, btnZoom, btnMove, btnRotate;
var btnToggleVerticalShapes, btnHeight, btnTwist, btnShape, btnConv, btnStraight, btnSine, btnDiv;
var buttonGroupAdd, popupWordArt;
var btnScan, popupScan;

var state;
var prevState;
var hasControl;

var gcodeGenerateDelayer;
var gcodeGenerateDelay = 50;

var preheatDelay;
var preheatDelayTime = 15*1000;

var connectingHintDelay = null;
var connectingHintDelayTime = 20 * 1000;


function initButtonBehavior() {
	console.log("f:initButtonBehavior");

	btnOops = new Button("#btnOops");
	btnInfo = new Button("#btnInfo");
	btnSettings = new Button("#btnSettings");
	btnNew = new Button("#btnNew");
	btnPrint= new Button("#btnPrint");
	btnStop = new Button("#btnStop");
	btnPrevious = new Button("#btnPrevious");
	btnNext = new Button("#btnNext");
	btnSave = new Button("#btnSave");
	buttonGroupAdd = $("#buttonGroupAdd");
	btnShape = new Button("#btnShape");
	btnWordArt = new Button("#btnWordArt");
    btnScan = new Button("#btnScan");
	popupWordArt = $("#popupWordArt");
	popupShape = $("#popupShape");
    popupScan = $("#popupScan");
	popupMask = $("#popupMask");
	logoPanel = $("#logopanel");
	btnToggleEdit = new Button("#btnToggleEdit");
	buttonGroupEdit = $("#buttonGroupEdit");
	btnZoom = new Button("#btnZoom");
	btnMove = new Button("#btnMove");
	btnRotate = new Button("#btnRotate");
	btnToggleVerticalShapes = new Button("#btnToggleVerticalShapes");
	buttonGroupVerticalShapes = $("#buttonGroupVerticalShapes");
	btnHeight = new Button("#btnHeight");
	btnTwist = new Button("#btnTwist");
	btnStraight = new Button("#btnStraight");
	btnDiv = new Button("#btnDiv");
	btnConv = new Button("#btnConv");
	btnSine = new Button("#btnSine");
	btnAdd = new Button("#btnAdd");

	$(".btn").Button(); //initalize other buttons

	logoPanel.on("onButtonClick", onLogo);
	btnNew.on("onButtonClick", onBtnNew);
	btnAdd.on("onButtonClick", onBtnAdd);
	btnWordArt.on("onButtonClick", onBtnWordArt);
	btnShape.on("onButtonClick", onBtnShape);
    btnScan.on("onButtonClick", onBtnScan);
	btnPrint.on("onButtonClick", print);
	btnStop.on("onButtonClick", stopPrint);
	btnSave.on("onButtonClick", saveSketch);
	btnPrevious.on("onButtonClick", previousSketch);
	btnNext.on("onButtonClick", nextSketch);
	btnOops.on("onButtonHold", onBtnOops);
	// vertical shape buttons
	btnToggleVerticalShapes.on("onButtonClick", onBtnToggleVerticalShapes);
	btnHeight.on("onButtonHold", onBtnHeight);
	btnTwist.on("onButtonHold", onBtnTwist);
	btnStraight.on("onButtonClick", onBtnStraight);
	btnDiv.on("onButtonClick", onBtnDiv);
	btnConv.on("onButtonClick", onBtnConv);
	btnSine.on("onButtonClick", onBtnSine);

	btnToggleEdit.on("onButtonClick", onBtnToggleEdit);
	btnMove.on("onButtonHold", onBtnMove);
	btnZoom.on("onButtonHold", onBtnZoom);
	btnRotate.on("onButtonHold", onBtnRotate);

	//getSavedSketchStatus();
	// listSketches();
	// setSketchModified(false);
	// updateSketchButtonStates();

	function onBtnToggleVerticalShapes() {
		var btnImg;
		if (buttonGroupVerticalShapes.is(":hidden")) {
			btnImg = "img/buttons/btnArrowClose.png";
		} else {
			btnImg = "img/buttons/btnArrowOpen.png";
		}
		btnToggleVerticalShapes.attr("src",btnImg);

		buttonGroupVerticalShapes.fadeToggle(BUTTON_GROUP_SHOW_DURATION);
	}

	function onLogo() {
		location.reload();
	}

	function onBtnAdd() {
		buttonGroupAdd.fadeToggle(BUTTON_GROUP_SHOW_DURATION);
	}

	function onBtnStraight() {
		setVerticalShape(verticalShapes.NONE);
	}
	function onBtnDiv() {
		setVerticalShape(verticalShapes.DIVERGING);
	}
	function onBtnConv() {
		setVerticalShape(verticalShapes.CONVERGING);
	}
	function onBtnSine() {
		setVerticalShape(verticalShapes.SINUS);
	}

	function hitTest(cursor,button,radius) {
		return distance(cursor.x,cursor.y,button.x,button.y)<radius;
	}


	function onBtnToggleEdit() {
		var btnImg;
		if(buttonGroupEdit.is(":hidden")) {
			btnImg = "img/buttons/btnArrowClose.png";
		} else {
			btnImg = "img/buttons/btnArrowOpen.png";
		}
		btnToggleEdit.attr("src",btnImg);

		buttonGroupEdit.fadeToggle(BUTTON_GROUP_SHOW_DURATION);
	}
	function onBtnMove(e,cursor) {
		var w = btnMove.width();
		var h = btnMove.height();
		var speedX = (cursor.x-w/2)*0.3;
		var speedY = (cursor.y-h/2)*0.3;
		//console.log("move speed: ",speedX,speedY);
		moveShape(speedX,speedY);
	}
	function onBtnZoom(e,cursor) {
		var h = btnZoom.height();
		var multiplier = (h/2-cursor.y)*0.003	+ 1;
		zoomShape(multiplier);
	}
	function onBtnRotate(e,cursor) {
		var h = btnZoom.height();
		var multiplier = (h/2-cursor.y)*0.003;
		rotateShape(-multiplier);
	}

	function onBtnHeight(e,cursor) {
		var h = btnHeight.height();
		if(cursor.y < h/2) {
			previewUp(true);
		} else {
			previewDown(true);
		}
	}
	function onBtnTwist(e,cursor) {
		var h = btnTwist.height();
		var multiplier = (cursor.y-h/2)*0.0005;
		previewTwist(multiplier,true);
	}

	function onBtnOops(e) {
		oopsUndo();
	}

	function onBtnNew(e) {
		newSketch();
	}

	function onBtnWordArt(e) {
		showWordArtDialog();
	}

	function onBtnShape(e) {
		showShapeDialog();
		buttonGroupAdd.fadeOut();
	}

    function onBtnScan(e) {
        showScanDialog();
		buttonGroupAdd.fadeOut();
    }
    
}

function stopPrint() {
	// btnStop.disable();
	// $.get("/set?code=M104 S200\nG21\nM107\nG28 X0 Y0 Z0\nM109 S200\nG28 Z0\nG1 Z15 F9000\nG92 E0\nG91\nG1 F200 E20\nG92 E0\nG92 E0\nG1 F9000\nG90\n", function() {
		$.get("/set?cmd={P:X}");	
	// });
}


function print(e) {
	console.log("print");

	var gcode = generate_gcode();
	if (!gcode || gcode=="") {
		console.log("no gcode to print");
		return;
	}

	var blob = new Blob([gcode.join('\n')],{type: "application/octet-stream"});
    var fd = new FormData();
	fd.append("blob", blob, "doodle3d.gcode");

	// $.get("/set?code=M104 S200", function() { //heatup
		// $.get("/set?code=G28 X0 Y0", function() { //show movement
		// $.get("/set?code=M563 S5", function() { //speed up Upload via WiFi
			$.ajax({ //start download
		        type: 'POST',
		        url: '/upload',
		        cache: false,
		        data: fd,
		        processData: false,
		        // contentDisposition: 'form-data; name="file"; filename="doodle.gcode',
		        contentType: false
		    }).done(function(data) {
		        console.log(data);

				// setTimeout(function() {
				// 	btnStop.enable();
				// 	$.get("/set?code=M565"); //start printing cache.gc
				// },3000)
				
		    });
		// });
    // });
}


function clearMainView() {
	//    console.log("f:clearMainView()");
	ctx.save();
	ctx.clearRect(0,0,canvas.width, canvas.height);
	ctx.restore();
}
function resetPreview() {
	//    console.log("f:resetPreview()");

	// clear preview canvas
	previewCtx.save();
	previewCtx.clearRect(0,0,canvas.width, canvas.height);
	previewCtx.restore();

	// also make new Image, otherwise the previously cached preview can be redrawn with move up/down or twist left/right
	doodleImageCapture = new Image();

	// reset height and rotation to default values
	numLayers 	= previewDefaults.numLayers;     // current number of preview layers
	rStep 			= previewDefaults.rotation; // Math.PI/180; //Math.PI/40; //
}

function oopsUndo() {
	//    console.log("f:oopsUndo()");
	_points.pop();

	if (clientInfo.isSmartphone) {
		// do not recalc the whole preview's bounds during undo if client device is a smartphone
		redrawDoodle(false);
	} else {
		// recalc the whole preview's bounds during if client device is not a smartphone
		redrawDoodle(true);
	}
	redrawPreview();
}

function previewUp(redrawLess) {
	//    console.log("f:previewUp()");
	if (numLayers < maxNumLayers) {
		numLayers++;
	}
	setSketchModified(true);

//	redrawPreview(redrawLess);
	redrawRenderedPreview(redrawLess);
}
function previewDown(redrawLess) {
	//    console.log("f:previewDown()");
	if (numLayers > minNumLayers) {
		numLayers--;
	}
	setSketchModified(true);
//	redrawPreview(redrawLess);
	redrawRenderedPreview(redrawLess);
}
function previewTwistLeft(redrawLess) {
	previewTwist(-twistIncrement,true)
}
function previewTwistRight(redrawLess) {
	previewTwist(twistIncrement,true)
}
function previewTwist(increment,redrawLess) {
	console.log("previewTwist: ",increment);
	if (redrawLess == undefined) redrawLess = false;

	rStep += increment;
	if(rStep < -previewRotationLimit) rStep = -previewRotationLimit;
	else if(rStep > previewRotationLimit) rStep = previewRotationLimit;

	redrawRenderedPreview(redrawLess);
	setSketchModified(true);
}

function resetTwist() {
	rStep = 0;
	redrawRenderedPreview();
	setSketchModified(true);
}

function update() {
	setState(printer.state,printer.hasControl);

	thermometer.update(printer.temperature, printer.targetTemperature);
	progressbar.update(printer.currentLine, printer.totalLines);
}

function setState(newState,newHasControl) {
	if(newState == state && newHasControl == hasControl) return;

	prevState = state;

	console.log("setState: " + prevState + " > " + newState + " ( " + newHasControl + ")");
	setDebugText("State: "+newState);

	// print button
	var printEnabled = (newState == Printer.IDLE_STATE && newHasControl);
	if(printEnabled) {
		btnPrint.enable();
	} else {
		btnPrint.disable();
	}

	// stop button
	var stopEnabled = ((newState == Printer.PRINTING_STATE || newState == Printer.BUFFERING_STATE) && newHasControl);
	if(stopEnabled) {
		btnStop.enable();
	} else {
		btnStop.disable();
	}

	// thermometer
	switch(newState) {
	case Printer.IDLE_STATE: /* fall-through */
	case Printer.BUFFERING_STATE: /* fall-through */
	case Printer.PRINTING_STATE: /* fall-through */
	case Printer.STOPPING_STATE:
		thermometer.show();
		break;
	default:
		thermometer.hide();
	break;
	}

	// progress indicator
	switch(newState) {
	case Printer.PRINTING_STATE:
		progressbar.show();
		break;
	default:
		progressbar.hide();
	break;
	}

	/* settings button */
	switch(newState) {
	case Printer.CONNECTING_STATE: /* fall-through */
	case Printer.IDLE_STATE:
		btnSettings.enable();
		break;
	case Printer.WIFIBOX_DISCONNECTED_STATE: /* fall-through */
	case Printer.BUFFERING_STATE: /* fall-through */
	case Printer.PRINTING_STATE: /* fall-through */
	case Printer.STOPPING_STATE:
		btnSettings.disable();
		break;
	default:
		btnSettings.enable();
	break;
	}

	btnPrevious.disable();
	btnNext.disable()
	btnSave.disable();


	state = newState;
	hasControl = newHasControl;
}
