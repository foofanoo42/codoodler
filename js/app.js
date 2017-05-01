(function() {
	/* Canvas */

	var canvas = document.getElementById('drawCanvas');
	var ctx = canvas.getContext('2d');
	var nameButton = document.getElementById('nameButton');
	
	//var color = document.querySelector(':checked').getAttribute('data-color');
	

	
	//canvas.width = Math.min(document.documentElement.clientWidth, window.innerWidth || 300);
	//canvas.height = Math.min(document.documentElement.clientHeight, window.innerHeight || 300);
	canvas.width = 200;
	canvas.height = 100;
		
	//ctx.arc(95,50,40,0,2*Math.PI); 
	
	//ctx.strokeStyle = color;
	//ctx.lineWidth = '3';
	//ctx.lineCap = ctx.lineJoin = 'round';

	/* Mouse and touch events */
	
	/*
	document.getElementById('colorSwatch').addEventListener('click', function() {
		color = document.querySelector(':checked').getAttribute('data-color');
	}, false);
	*/
	
	var isTouchSupported = 'ontouchstart' in window;
	var isPointerSupported = navigator.pointerEnabled;
	var isMSPointerSupported =  navigator.msPointerEnabled;
	
	var downEvent = isTouchSupported ? 'touchstart' : (isPointerSupported ? 'pointerdown' : (isMSPointerSupported ? 'MSPointerDown' : 'mousedown'));
	//var moveEvent = isTouchSupported ? 'touchmove' : (isPointerSupported ? 'pointermove' : (isMSPointerSupported ? 'MSPointerMove' : 'mousemove'));
	//var upEvent = isTouchSupported ? 'touchend' : (isPointerSupported ? 'pointerup' : (isMSPointerSupported ? 'MSPointerUp' : 'mouseup'));
	 	  
	canvas.addEventListener(downEvent, sendScoreName, false);//using to send first data through pubnub score and name
	nameButton.addEventListener(downEvent, sendName, false);
	fiveButton.addEventListener(downEvent, sendScoreName, false);
	
	//canvas.addEventListener(moveEvent, draw, false);
	//canvas.addEventListener(upEvent, endDraw, false);

	/* PubNub */

	var channel = 'somethingelse';

	var pubnub = PUBNUB.init({
		publish_key     : 'pub-c-2e42a4a0-0bde-4e21-8596-bc786a8e013a',
		subscribe_key   : 'sub-c-9cc1c084-2715-11e7-894d-0619f8945a4f',
						   
		//uuid: "myUniqueUUID",//added , may be unneccesary
		leave_on_unload : true,
		ssl		: document.location.protocol === "https:"
	});

	pubnub.subscribe({
		channel: channel,
		callback: updateGraphData,
		withPresence: true,
		presence: function(m){
			if(m.occupancy > 1){
				document.getElementById('unit').textContent = 'connected';
			}
   			document.getElementById('occupancy').textContent = m.occupancy;
   			
			//console.log(m.occupancy);
			var p = document.getElementById('occupancy').parentNode;
   			p.classList.add('anim');
   			p.addEventListener('transitionend', function(){p.classList.remove('anim');}, false);
			
			
   		}
	});

	function publish(data) {
		pubnub.publish({
			channel: channel,
			message: data
		});
		
		
		//console.log("sending stuff to pubnub");
		//increment();
		//console.log("incrementing");
		
		//testdraw();
     }

    /* Draw on canvas */
	
	function testdraw(){
		
		//ctx.fillText('Hello world', 20, 0);
	}

    function drawOnCanvas(color, plots) {
    	ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(plots[0].x, plots[0].y);

    	for(var i=1; i<plots.length; i++) {
	    	ctx.lineTo(plots[i].x, plots[i].y);
	    }
	    ctx.stroke();
		
		
		
    }

	function updateGraphData(message) { //called back by the subscribe event.
		
			var foundName = false;
		
			for(var i = 0; i < currentData.length; i++)
			{
				if (currentData[i].name === message.name)//look for my name
				{//find the next empty data from the top
					
					var changedName = currentData[i];
					//changedName.name = message.name;
					changedName.value = message.score;
					changedName.color = message.color;
					currentData[i] = changedName;
					i = 100;//quit loop
					
					
				}
				
				if (i === currentData.length) foundName = false; //couldn't find the name, place it on a space
			}
			
			if(foundName === false)//place it on a space
			{
			
				for(var i = 0; i < currentData.length; i++)//this loop not tested
				{
					if (currentData[i].name === " ")
					{//find the next empty data from the top
						
						var changedName = currentData[i];
						changedName.name = message.name;
						changedName.value = message.score;
						changedName.color = message.color;
						currentData[i] = changedName;
						i = 100;//quit loop
						
						
					}
					
				}
			}
			
	
			//changedName.name = message.name;
	
			//currentData[5] = changedName;
	}
	
	/*
    function drawFromStream(message) {//used to be called back by subscribe
		
		if(!message || message.plots.length < 1) return;
		drawOnCanvas(message.color, message.plots);
		
    }
    
    // Get Older and Past Drawings!
    if(drawHistory) {
	    pubnub.history({
	    	channel  : channel,
	    	count    : 50,
	    	callback : function(messages) {
	    		pubnub.each( messages[0], drawFromStream );
	    	}
	    });
	}*/
    var isActive = false;
    
	/*
	var plots = [];

	function draw(e) {
		e.preventDefault(); // prevent continuous touch event process e.g. scrolling!
	  	if(!isActive) return;

    	var x = isTouchSupported ? (e.targetTouches[0].pageX - canvas.offsetLeft) : (e.offsetX || e.layerX - canvas.offsetLeft);
    	var y = isTouchSupported ? (e.targetTouches[0].pageY - canvas.offsetTop) : (e.offsetY || e.layerY - canvas.offsetTop);

    	plots.push({x: (x << 0), y: (y << 0)}); // round numbers for touch screens

    	drawOnCanvas(color, plots);
		//ctx.fillText('Hello world', 100, 100);
		
	}
	
	function startDraw(e) {
	  	e.preventDefault();
	  	
		//isActive = true;
		//turning off drawing from working this way
		
	}
	
	function endDraw(e) {
	  	e.preventDefault();
	  	isActive = false;
	  
	  	publish({
	  		color: color,
	  		plots: plots
	  	});

	  	plots = [];
	}
	*/
	
	function sendName() {//triggered by click of OK button
		
		//var changedData = document.getElementById('myText').value;
		myStoredName = document.getElementById('myText').value;
		mySavedColor = document.getElementById('myColor').value;
		
		//changedData.name = document.getElementById('myText').value;
		
		publish ({
			name: myStoredName,
			score: mySavedScore,
			color: mySavedColor
		});
		
		redraw(settings);
		
		
	}
	
	function sendScoreName() {
		
		//var changedData = document.getElementById('myText').value;
		mySavedScore += 5;
				
				
		publish ({
			name: myStoredName,
			score: mySavedScore,
			color: mySavedColor
		});
		
		redraw(settings);
	}
	
	
	
})();
