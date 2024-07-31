function showMessages() {
    const container = document.querySelector('.threads-container');
    container.style.display = 'block';
    const button = document.querySelector('.show-messages-btn');
    button.style.display = 'none';
}

function toggleInput(icon) {
    const form = icon.closest('form');
    const input = form.querySelector('input[type="text"]');
    const submit = form.querySelector('input[type="submit"]');
    input.classList.toggle('hidden');
    submit.classList.toggle('hidden');
}

function toggleReplies(button) {
    const repliesContainer = button.nextElementSibling;
    if (repliesContainer.style.display === 'block') {
        repliesContainer.style.display = 'none';
        button.textContent = 'Show Replies';
    } else {
        repliesContainer.style.display = 'block';
        button.textContent = 'Hide Replies';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const infoIdButtons = document.querySelectorAll('.infoid-btn');

    infoIdButtons.forEach(button => {
        button.addEventListener('click', function() {
            const queryId = button.getAttribute('data-query-id');

            // Send the query ID to the server using fetch
            fetch('/log-query-id', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ queryId: queryId })
            })
            .then(response => response.json())
            .then(data => {
                // console.log('Query ID sent to server:', data.queryId);
            })
            .catch(error => {
                console.error('Error sending query ID:', error);
            });
        });
    });
});
