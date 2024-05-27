const codeEditor = document.getElementById('code-editor');

function fetchCode() {
    fetch('fetch_code.php')
        .then(response => response.text())
        .then(data => {
            codeEditor.value = data;
        });
}

function updateCode() {
    const code = codeEditor.value;
    fetch('update_code.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `code=${encodeURIComponent(code)}`,
    });
}

codeEditor.addEventListener('input', updateCode);

fetchCode();
setInterval(fetchCode, 1000);  // Fetch code updates every second
