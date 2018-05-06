$(document).ready(function() {
	$('#options :button').prop("disabled", true);
	$('#replay').prop("disabled", true);
	$('#debug').prop("checked", false);

	const NOTE_PATHS = {
		1:"C3.wav",
		2:"Csharp3.wav",
		3:"D3.wav",
		4:"Dsharp3.wav",
		5:"E3.wav",
		6:"F3.wav",
		7:"Fsharp3.wav",
		8:"G3.wav",
		9:"Gsharp3.wav",
		10:"A3.wav",
		11:"Asharp3.wav",
		12:"B3.wav",
		13:"C4.wav",
		14:"Csharp4.wav",
		15:"D4.wav",
		16:"Dsharp4.wav",
		17:"E4.wav",
		18:"F4.wav",
		19:"Fsharp4.wav",
		20:"G4.wav",
		21:"Gsharp4.wav",
		22:"A4.wav",
		23:"Asharp4.wav",
		24:"B4.wav",
		25:"C5.wav",
	};
	const NUM_WEIGHTS = 13;

	// Must remember which notes we played to allow replaying
	var firstNote, secondNote;

	/* 
	weights is an array where each index contains a number representing
	how good the user is at guessing the corresponding interval. More
	positive numbers mean they are better, and more negative numbers mean
	they are worse.
	*/
	var weights = new Array(NUM_WEIGHTS);
	initWeights();
	var debug = false;


	// Initializes the weights of the transition matrix uniformly
	function initWeights() {
		for (var i = 0; i < NUM_WEIGHTS; ++i) {
			weights[i] = 0;
		}
	}


	// Plays the first and second notes in sequence
	function playBoth() {
		$('#replay').prop("disabled", true);
		var first = new Audio("Notes/" + NOTE_PATHS[firstNote]);
		var second = new Audio("Notes/" + NOTE_PATHS[secondNote]);
		
		first.addEventListener('ended', function() {
			second.play();
		});
		second.addEventListener('ended', function() {
			$('#replay').prop("disabled", false);
		});

		first.play();
	}


	// Simple model for now, reduce the weight of the one we got right
	// so we get it less often in the future.
	function updateWeightsSuccess(interval) {
		weights[interval] -= 1;
		for (var i = 0; i < NUM_WEIGHTS; ++i) {
			if (i != interval) {
				// Bump up all other scores so examples that haven't been
				// seen in a while start showing up again
				weights[i] += 0.1;
			}
		}
	}

	function updateWeightsFailure(interval) {
		weights[interval] += 1;
		for (var i = 0; i < NUM_WEIGHTS; ++i) {
			if (i != interval) {
				weights[i] += 0.1;
			}
		}
	}


	function sigmoid(x) {
		return 1/(1 + Math.exp(-x));
	}


	function chooseInterval() {
		var intervalErrorRates = new Array(NUM_WEIGHTS);
		var totalError = 0;
		// calculate sum of errors for each interval
		for (var i = 0; i < NUM_WEIGHTS; ++i) {
			intervalErrorRates[i] = 1 - sigmoid(weights[i]);
			totalError += intervalErrorRates[i];
		}

		// normalize
		for (var i = 0; i < NUM_WEIGHTS; ++i) {
			intervalErrorRates[i] /= totalError;
		}

		var sum = 0;
		var rand = Math.random();
		for (var i = 0; i < NUM_WEIGHTS; ++i) {
			sum += intervalErrorRates[i];
			if (rand <= sum) {
				return i;
			}
		}

		if (debug) {
			console.error("Could not find an interval");
		}
		return 0;
	}


	// Controls the clicking of the play button
	$('#play').click(function() {
		if (debug) {
			console.log(weights);			
		}

		// Disable all answer buttons
		$('#options :button').prop('disabled', false);

		// Clear colors
		$('#options :button').prop('style','');
		$(this).prop("disabled", true);
	
		firstNote = Math.floor(Math.random() * 25) + 1;
		var chosenInterval = chooseInterval();

		// array of valid choices
		var choices = []
		if (firstNote + chosenInterval < 26) {
			choices.push(firstNote + chosenInterval);
		}
		if (firstNote - chosenInterval > 0) {
			choices.push(firstNote - chosenInterval);
		}
		secondNote = choices[Math.floor(Math.random() * choices.length)];

		playBoth();
	});


	// Clicking replay just plays both notes again
	$('#replay').click(function() {
		playBoth();
	});


	// When an option is selected, disables all others,
	// records whether is was correct and updates weights
	$('.option').click(function() {
		$('#options :button').prop("disabled", true);
		$('#play').prop("disabled", false);
		$('#play').text("Next");

	
		var selectedInterval = $(this).prop('id').substring(4,5);
		var correctInterval = Math.abs(firstNote - secondNote);

		if (selectedInterval == correctInterval) {
			$(this).css("background-color", "limegreen");
			updateWeightsSuccess(selectedInterval);
		}
		else {
			$(this).css("background-color", "red");
			$('#diff' + Math.abs(firstNote - secondNote)).css("background-color", "limegreen");

			updateWeightsFailure(selectedInterval);
		}
	});

	$('#debug').click(function() {
		if ($(this).is(':checked')) {
			debug = true;
		}
		else {
			debug = false;
		}
	});
});
