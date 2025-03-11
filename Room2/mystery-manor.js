document.addEventListener("DOMContentLoaded", function() {
  // Elements
  const buttons = document.querySelectorAll("#buttons button");
  const feedback = document.getElementById("puzzleFeedback");
  const submitBtn = document.getElementById("submitPuzzle");
  const dial1 = document.getElementById("dial1");
  const dial2 = document.getElementById("dial2");

  // Variables to track the puzzle state
  let sequenceInput = "";
  const correctSequence = "BADC"; // Example correct sequence
  const correctDial1 = 3; // Expected number (as a number)
  const correctDial2 = 7; // Expected number (as a number)

  // Utility function: count characters in correct positions
  function countSequenceMatches(input, correct) {
    let matches = 0;
    for (let i = 0; i < Math.min(input.length, correct.length); i++) {
      if (input[i] === correct[i]) {
        matches++;
      }
    }
    return matches;
  }

  // Utility function: create themed feedback for the dials
  function getDialFeedback(current, correct, dialName) {
    let diff = Math.abs(current - correct);
    if (diff === 0) {
      return `The ${dialName} is perfectly aligned.`;
    } else if (diff === 1) {
      return `The ${dialName} shimmers almost in tune.`;
    } else if (current < correct) {
      return `The ${dialName} seems too low, as if yearning to rise.`;
    } else {
      return `The ${dialName} is set too high, echoing in the void.`;
    }
  }

  // Handle button clicks to build the sequence
  buttons.forEach(button => {
    button.addEventListener("click", function() {
      const value = button.getAttribute("data-value");
      sequenceInput += value;
      feedback.textContent = "Current Sequence: " + sequenceInput;
    });
  });

  // Handle puzzle submission
  submitBtn.addEventListener("click", function() {
    // Read current dial values as numbers
    const currentDial1 = parseInt(dial1.value, 10);
    const currentDial2 = parseInt(dial2.value, 10);
    
    // Check if both the button sequence and dials are exactly correct
    if (sequenceInput === correctSequence &&
        currentDial1 === correctDial1 &&
        currentDial2 === correctDial2) {
      feedback.textContent = "Success! The secret door creaks open as the mechanisms click into place.";
      // Here you might trigger a transition to the next room or update the game state
    } else {
      // Determine how close the sequence is
      const sequenceMatches = countSequenceMatches(sequenceInput, correctSequence);
      let sequenceHint = "";
      if (sequenceMatches === 0) {
        sequenceHint = "The symbols seem utterly foreign.";
      } else if (sequenceMatches < correctSequence.length) {
        sequenceHint = `You have ${sequenceMatches} symbol(s) in harmony with the hidden code.`;
      }
      
      // Create feedback for the dials
      const dial1Feedback = getDialFeedback(currentDial1, correctDial1, "first dial");
      const dial2Feedback = getDialFeedback(currentDial2, correctDial2, "second dial");

      // Provide an overall themed hint to guide the user
      feedback.textContent = `The control panel hums with enigmatic energy. ${sequenceHint} ` +
                             `${dial1Feedback} ${dial2Feedback} Adjust your inputs and try once more.`;
      
      // Reset the sequence for a new attempt
      sequenceInput = "";
    }
  });
});