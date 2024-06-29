
        // Retrieve the result from localStorage and display it
        var loveResult = localStorage.getItem('loveResult');
        if (loveResult) {
            document.getElementById('result').textContent = loveResult;
            // Clear the result from localStorage to avoid displaying it again on subsequent visits
            localStorage.removeItem('loveResult');
        }
