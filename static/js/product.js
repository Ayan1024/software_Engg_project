document.getElementById('emailForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const emailInput = document.getElementById('emailInput').value;

    if (emailInput === '') {
        alert('Please enter your email');
    } else {
        fetch('/submit-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: emailInput })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Thank you for booking, we'll notify you");
                document.getElementById('emailForm').reset();
            } else {
                alert('There was an error. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('There was an error. Please try again.');
        });
    }
});
