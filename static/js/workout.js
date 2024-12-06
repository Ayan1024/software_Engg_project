document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const startButton = document.getElementById('start');
    const stopButton = document.getElementById('stop');
    const timerDisplay = document.getElementById('timer'); // Display for the timer

    let mediaRecorder;
    let chunks = [];
    let timer;
    let seconds = 0;

    // Function to update the timer display
    function updateTimer() {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        seconds++;
    }

    // Function to start the video feed and timer
    function startRecording() {
        fetch('/start_video_feed', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'started') {
                    navigator.mediaDevices.getUserMedia({ video: true })
                        .then(stream => {
                            video.srcObject = stream;
                            mediaRecorder = new MediaRecorder(stream);

                            mediaRecorder.ondataavailable = (event) => {
                                if (event.data.size > 0) {
                                    chunks.push(event.data);
                                }
                            };

                            mediaRecorder.onstop = () => {
                                const blob = new Blob(chunks, { type: 'video/webm' });
                                chunks = [];
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'workout.webm';
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                            };

                            mediaRecorder.start();
                            // Start the timer
                            seconds = 0; // Reset timer
                            timer = setInterval(updateTimer, 1000);
                        });
                }
            });
    }

    // Function to stop the video feed and timer
    function stopRecording() {
        fetch('/stop_video_feed', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'stopped') {
                    clearInterval(timer); // Stop the timer
                    timerDisplay.textContent = '00:00'; // Reset the timer display
                    if (mediaRecorder) {
                        mediaRecorder.stop();
                        video.srcObject.getTracks().forEach(track => track.stop());
                    }
                }
            });
    }

    startButton.addEventListener('click', startRecording);
    stopButton.addEventListener('click', stopRecording);
});
