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
	var firstNum, secondNum, weights;
	var run = [];
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
	function helper(e) {
		var column = "";
		e.forEach(function(element) {
			column = column.concat("<td>" + e + "</td>");
		});

		return "<tr>" + column + "</tr>";
	}


	// Prints a 2D array to the test div
	function print2darr(x) {
		var rows = "";

		x.forEach(function(element) {
			rows = rows.concat(helper(element));
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


	function updateWeightsGood(row) {
		var initial = weights[row][13];
		var final = initial + adjustGood(initial);
		var change = (1 - final)/(1 - initial); //should be >1
		for (var i = 0; i < 14; i++) {
			weights[row][i] *= change;
		}
		weights[row][13] = final;
	}


	function adjustGood(x) {
		// returns the value to decrease fail rate by (negative)
		return 5*Math.pow(x-0.6, 2)/9 - 0.2;
	}


	// t is how far from the end start is; can only change one pair at a time
	function updateWeightsBad(start, next, t) {
		var a = weights[start][next]; // a is the initial value
		var diff = (a*adjustBad(a) - a)/t; // the corrected difference between a and the final value 
		var final = a + diff;
		var change = (1 - final)/(1 - a);
		for (var i = 0; i < 14; i++) {
			weights[start][i] *= change;
		}
		weights[start][next] = final;
	}


	function adjustBad(x) {
		return 1 + 1/(1+ Math.exp(-4)) - 1/(1 + Math.exp((-8)*x + 4));
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


	function chooseInterval() {
		var maxes = [];
		var globmax = 0;
		for (var i = 0; i < 13; i++) {
			if (listmax(weights[i]) > globmax) {
				globmax = listmax(weights[i]);
			}
		}

		for (var i = 0; i < 13; i++) {
			if (listmax(weights[i]) == globmax) {
				maxes.push(i);
			}
		}
		return maxes[Math.floor(Math.random() *  maxes.length)];
	}


	// Controls the clicking of the play button
	$('#play').click(function() {
		resetButtons();
		$(this).prop("disabled", true);
		$(this).prop("value", 'gjhjqsfdsh'); // not working (clearly)
	
		firstNum = Math.floor(Math.random() * 25) + 1;
		var chosenInterval = chooseInterval();

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
			updateWeightsGood(run[run.length - 1]); // previous element was a success
		}
		else {
			$(this).css("background-color", "red");
			$('#diff' + Math.abs(firstNum - secondNum)).css("background-color", "limegreen");
			run.push(13);
			var l = run.length;
//			print("Length is " + l);
//			printarr(run);
			debugger;
			for(var i = l - 2; i > -1; i--) {
//				print("i is " + i);
				updateWeightsBad(run[i], run[i+1], l - i - 1);
			}

			run = [];
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