function fibonacci(n) {
  var output = [];
  
  if (n === 1) {
    output = [0];
  } else if (n === 2) {
    output = [0, 1];
  } else {
    output = [0, 1];
    
    for (var i = 2; i < n; i++) {
      output.push(output[output.length - 2] + output[output.length - 1]);
    }
  }
  
  return output;
}

document.getElementById('generateButton').addEventListener('click', function() {
  var outputDiv = document.getElementById('output');
  var inputNumber = document.getElementById('inputNumber').value;
  var n = parseInt(inputNumber, 10); // Parse the input value as an integer
  if (isNaN(n) || n <= 0) {
    outputDiv.textContent = "Please enter a valid positive integer.";
    return;
  }
  var sequence = fibonacci(n);
  outputDiv.textContent = sequence.join(', ');
});
