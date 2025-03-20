document.addEventListener("DOMContentLoaded", function() {
  // Elements
  const buttons = document.querySelectorAll("#buttons button");
  const feedback = document.getElementById("puzzleFeedback");
  const submitBtn = document.getElementById("submitPuzzle");
  const dialSection = document.getElementById("dial-section");
  const dial1 = document.getElementById("dial1");
  const dial2 = document.getElementById("dial2");

  // Track current puzzle phase: 1 = button sequence, 2 = dial adjustment
  let phase = 1;
  let sequenceInput = "";
  const correctSequence = "BADC"; // Correct button pattern
  const forbiddenPattern = "BAAD"; // Forbidden code
  const correctDial1 = 3;
  const correctDial2 = 7;

  // Utility: count matching characters in correct positions
  function countSequenceMatches(input, correct) {
    let matches = 0;
    for (let i = 0; i < Math.min(input.length, correct.length); i++) {
      if (input[i] === correct[i]) {
        matches++;
      }
    }
    return matches;
  }

  // Utility: themed hint for sequence input
  function getSequenceHint(input) {
    const matches = countSequenceMatches(input, correctSequence);
    if (matches === 0) {
      return "The symbols remain a jumbled enigma.";
    } else if (matches < correctSequence.length) {
      return `You have ${matches} symbol(s) resonating with the hidden code.`;
    }
    return "";
  }

  // Utility: themed feedback for dial values
  function getDialFeedback(current, correct, dialName) {
    const diff = Math.abs(current - correct);
    if (diff === 0) {
      return `The ${dialName} aligns perfectly.`;
    } else if (diff === 1) {
      return `The ${dialName} shimmers almost in harmony.`;
    } else if (current < correct) {
      return `The ${dialName} seems too low, yearning to rise.`;
    } else {
      return `The ${dialName} is set too high, lost in the void.`;
    }
  }

  // Handle button clicks (active only in Phase 1)
  buttons.forEach(button => {
    button.addEventListener("click", function() {
      if (phase === 1) {
        const value = button.getAttribute("data-value");
        sequenceInput += value;
        feedback.textContent = "Current Sequence: " + sequenceInput;
      }
    });
  });

  // Handle submit button click (acts for both phases)
  submitBtn.addEventListener("click", function() {
    if (phase === 1) {
      // Phase 1: Process button sequence
      if (sequenceInput === forbiddenPattern) {
        feedback.textContent = "A chilling wind howls... You have invoked the forbidden sequence 'DEATH'. The manor condemns you! Restarting...";
        setTimeout(() => window.location.reload(), 3000);
        return;
      }
      if (sequenceInput === correctSequence) {
        feedback.textContent = "The hidden symbols resonate... The control panel reveals the secret dials!";
        // Reveal the dials and transition to Phase 2
        dialSection.style.display = "block";
        // Optionally hide the button panel since it's no longer needed
        document.getElementById("buttons").style.display = "none";
        phase = 2;
        // Clear sequence input for clarity (if needed)
        sequenceInput = "";
      } else {
        const hint = getSequenceHint(sequenceInput);
        feedback.textContent = `The control panel murmurs: "${hint}" Try again.`;
        sequenceInput = ""; // Reset sequence input for a new attempt
      }
    } else if (phase === 2) {
      // Phase 2: Process dial values
      const currentDial1 = parseInt(dial1.value, 10);
      const currentDial2 = parseInt(dial2.value, 10);
      if (currentDial1 === correctDial1 && currentDial2 === correctDial2) {
        feedback.textContent = "The mechanisms click into place, and the secret door creaks open...";
      } else {
        const dial1Feedback = getDialFeedback(currentDial1, correctDial1, "first dial");
        const dial2Feedback = getDialFeedback(currentDial2, correctDial2, "second dial");
        feedback.textContent = `The dials whisper: "${dial1Feedback} ${dial2Feedback}" Adjust them carefully.`;
      }
    }
  });
});
