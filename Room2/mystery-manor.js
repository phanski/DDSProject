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
    const correctDial1 = "3";
    const correctDial2 = "7";
  
    // Handle button clicks
    buttons.forEach(button => {
      button.addEventListener("click", function() {
        const value = button.getAttribute("data-value");
        sequenceInput += value;
        feedback.textContent = "Current Sequence: " + sequenceInput;
      });
    });
  
    // Handle puzzle submission
    submitBtn.addEventListener("click", function() {
      const currentDial1 = dial1.value;
      const currentDial2 = dial2.value;
      
      // Check if both the button sequence and dials are correct
      if (sequenceInput === correctSequence && currentDial1 === correctDial1 && currentDial2 === correctDial2) {
        feedback.textContent = "Success! The secret door unlocks, revealing a hidden passage.";
        // Here you might trigger a transition to the next room or update the game state
      } else {
        feedback.textContent = "Incorrect settings. The sequence or dial positions are off. Please try again.";
        sequenceInput = ""; // Reset the sequence for a new attempt
      }
    });
  });
  