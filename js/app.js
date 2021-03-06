(function() {
	
	var increaseButton = document.getElementById('mybutton');
	var decreaseButton = document.getElementById('mybutton2');
	var nameInput = document.getElementById('name');
	
//how to stop zoom and scroll?
	

	/* Mouse and touch events */
	
	
	
	var isTouchSupported = 'ontouchstart' in window;
	var isPointerSupported = navigator.pointerEnabled;
	var isMSPointerSupported =  navigator.msPointerEnabled;
	
	var downEvent = isTouchSupported ? 'touchstart' : (isPointerSupported ? 'pointerdown' : (isMSPointerSupported ? 'MSPointerDown' : 'mousedown'));
	//var moveEvent = isTouchSupported ? 'touchmove' : (isPointerSupported ? 'pointermove' : (isMSPointerSupported ? 'MSPointerMove' : 'mousemove'));
	//var upEvent = isTouchSupported ? 'touchend' : (isPointerSupported ? 'pointerup' : (isMSPointerSupported ? 'MSPointerUp' : 'mouseup'));	  
	
	nameInput.addEventListener('keydown', sendName, false);
	nameInput.addEventListener('blur', sendBlurName, false);
	increaseButton.addEventListener(downEvent, increaseScore, false);
	decreaseButton.addEventListener(downEvent, decreaseScore, false);
	
	//stop double clicking and scrolling?
	//increaseButton.addEventListener('dblclick', donothing, false);
	//increaseButton.addEventListener(upEvent, donothing, false);
	
	

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
		
    }

	function donothing() { console.log("double click stopped");}
	
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
					foundName = true;
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
	
	
    
    // Get Older and Past Drawings!
    /*
	if(drawHistory) {
	    pubnub.history({
	    	channel  : channel,
	    	count    : 50,
	    	callback : function(messages) {
	    		pubnub.each( messages[0], drawFromStream );
	    	}
	    });
	}*/
	
    
    	
	function sendName() {//triggered by click of OK button
		
		if(event.keyCode == 192) //tilda, turns off the box and turns on the graph
		{				
			document.getElementById('box').style.display = "none";//block to replace it
			document.getElementById('chart').style.display = "block";//display: none; in #chart style
			redraw(settings);
			
			
		}
		
		if((event.keyCode == 13)&&!(document.getElementById('name').value === "Enter name..."))//enter , use the checkname thing too
		{				
			document.getElementById('name').readOnly = true;

			myStoredName = document.getElementById('name').value;
			mySavedColor = document.getElementById('myColor').value;
			
			document.getElementById('mybutton').disabled = false;
			document.getElementById('mybutton2').disabled = false;
			
			publish ({
				name: myStoredName,
				score: mySavedScore,
				color: mySavedColor
			});
			
			redraw(settings);
		}
		
	}
	
	function sendBlurName() {//triggered by leaving the input field, equivalent to pressing enter but only if something new written
		
		//console.log("blurred");
		
		
		
		
		if(!(document.getElementById('name').value === "Enter name..."))
		{				
			
			document.getElementById('name').readOnly = true;

			myStoredName = document.getElementById('name').value;
			mySavedColor = document.getElementById('myColor').value;
			

			document.getElementById('mybutton').disabled = false;
			document.getElementById('mybutton2').disabled = false;


			
			publish ({
				name: myStoredName,
				score: mySavedScore,
				color: mySavedColor
			});
			
			redraw(settings);
		}
		
	}
	
	function decreaseScore() {
		
		if(document.getElementById('mybutton').disabled === false)
		{
			//var changedData = document.getElementById('myText').value;
			mySavedScore -= 10;
			if(mySavedScore <0) mySavedScore = 0;

			document.getElementById('qty').value = mySavedScore;

			mySavedColor = document.getElementById('myColor').value;//update color but name stays the same


			publish ({
				name: myStoredName,
				score: mySavedScore,
				color: mySavedColor
			});

			redraw(settings);
		}
	}
	
	function increaseScore() {
		
		if(document.getElementById('mybutton2').disabled === false)
		{
			//var changedData = document.getElementById('myText').value;
			mySavedScore += 10;
			document.getElementById('qty').value = mySavedScore;

			mySavedColor = document.getElementById('myColor').value;//update color but name stays the same


			publish ({
				name: myStoredName,
				score: mySavedScore,
				color: mySavedColor
			});

			redraw(settings);
		}
	}
	
	
	
})();
