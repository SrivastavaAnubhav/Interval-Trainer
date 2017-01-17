$(document).ready(function() {
	$('#options :button').prop("disabled", true);
	$('#replay').prop("disabled", true);

	/* 
	weights is a 14 x 13. Each row has the probability of failing from
	transitioning from the row into the column (i.e. if the relative
	probability of failure with interval value of 4 (major 3rd) is 0.2
	if the previous interval was 9, weights[9][4] = 0.2). The 14th row
	is the start value, when there is no previous interval. Also, any row
	sums to 1.
	*/
	const START = 13;
	var firstNum, secondNum, weights;
	var run = [START]; // initially holds the start symbol 
	initWeights();

	// Prints an element to the test div
	function print(x) {
		$('#test').append("<p>" + x + "</p>");
	}


	// Prints a 1D array to the test div
	function printarr(x) {
		x.forEach(function(element) {
			print(element);
		});
	}


	// Gets an HTML table from an array
	function tableFromArray(arr) {
		var column = "";
		arr.forEach(function(element) {
			column = column.concat("<td>" + element + "</td>");
		});

		return "<tr>" + column + "</tr>";
	}


	// Prints a 2D array to the test div
	function print2darr(x) {
		var rows = "";

		x.forEach(function(row) {
			rows = rows.concat(tableFromArray(row));
		});

		$('#test').append("<table>" + rows + "</table>");
	}


	// Initializes the weights of the transition matrix uniformly
	function initWeights() {
		weights = new Array(14);
		for (var i = 0; i < 14; i++) {
			weights[i] = new Array(13);
			for (var j = 0; j < 13; j++) {
				weights[i][j] = 1/13;
			}
		}

		print2darr(weights);
	}


	// Plays the first and second notes in sequence
	function playBoth() {
		var first = new Audio("Notes/" + getLoc(firstNum));
		var second = new Audio("Notes/" + getLoc(secondNum));
		
		first.addEventListener('ended', function() {
			second.play();
		});

		first.play();
	}


	// Simple model for now, take away weight from the one we got right
	// so that we get it less in the future
	function updateWeightsSuccess(from, to) { 
		for (var i = 0; i < 13; i++) {
			weights[from][i] += 0.01;
		}
		weights[from][to] -= 0.13;
	}

	// Just an inverse to updateWeightsSuccess for now, since weight is only
	// increasing when distance is 0 (i.e. for the element we got wrong)
	function updateWeightsFailure(from, to, distFromEnd) {
		if (distFromEnd == 0) {
			for (var i = 0; i < 13; i++) {
				weights[from][i] -= 0.01;
			}
			weights[from][to] += 0.13;			
		}
	}


	// Takes in an array of numbers and returns the max
	function listmax(ls) {
		cum = 0;
		ls.forEach(function(item) {
			if (item > cum) {
				cum = item;
			}
		});

		return cum;
	}


	function chooseInterval(from) {
		var cumsum = 0;
		var count = -1;
		var rand = Math.random();

		do {
			count++;
			cumsum += weights[from][count];
		} while (rand > cumsum);

		return count;
	}


	// Controls the clicking of the play button
	$('#play').click(function() {
		resetButtons();
		$(this).prop("disabled", true);
		$(this).prop("value", 'gjhjqsfdsh'); // not working (clearly)
	
		firstNum = Math.floor(Math.random() * 25) + 1;
		var chosenInterval = chooseInterval(run[run.length - 1]);

		// array of valid choices
		var choices = []
		if (firstNum + chosenInterval < 26) {
			choices.push(firstNum + chosenInterval);
		}
		if (firstNum - chosenInterval > 0) {
			choices.push(firstNum - chosenInterval);
		}
		secondNum = choices[Math.floor(Math.random() * choices.length)];

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
	
		var selectedNum = $(this).prop('id').substring(4,5);
		var correctNum = Math.abs(firstNum - secondNum);

		run.push(correctNum);

		if (selectedNum == correctNum) {
			$(this).css("background-color", "limegreen");
			updateWeightsSuccess(run[run.length - 2], run[run.length-1]);
		}
		else {
			$(this).css("background-color", "red");
			$('#diff' + Math.abs(firstNum - secondNum)).css("background-color", "limegreen");

			for (var i = run.length - 1; i > 0; i--) {
				updateWeightsFailure(run[i - 1], run[i], run.length - i - 1);
			}

			run = [START];
		}

		$('#test').empty();
		print2darr(weights);

	});
});


// Re-enables buttons
function resetButtons() {
	$('#options :button').prop('disabled', false);
	$('#options :button').prop('style','');
	$('#replay').prop("disabled", false);
}


// Returns the correct note given index
// Maybe one day I will be able to auto-generate audio...
function getLoc(index) {
	var noteLocations = {
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

	return noteLocations[index];
}