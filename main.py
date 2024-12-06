from flask import Flask, render_template, Response, request, jsonify
import cv2

app = Flask(__name__)

video_running = False
cap = None

@app.route("/")
def welcome():
    return render_template('index.html')

@app.route('/workout')
def workout():
    return render_template('workout.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/product', methods=['GET', 'POST'])
def product():
    if request.method == 'POST':
        name = request.form['name']
        return f'Thanks For Your Order {name}'
    return render_template('product.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/start_video_feed', methods=['POST'])
def start_video_feed():
    global video_running, cap
    if not video_running:
        video_running = True
        cap = cv2.VideoCapture(0)  # Start capturing video
    return jsonify({'status': 'started'})

@app.route('/stop_video_feed', methods=['POST'])
def stop_video_feed():
    global video_running, cap
    if video_running:
        video_running = False
        if cap:
            cap.release()  # Stop capturing video
            cap = None
    return jsonify({'status': 'stopped'})

def generate_frames():
    global cap
    while video_running and cap and cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        # Encode the frame as a JPEG
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

if __name__ == "__main__":
    app.run(debug=True)
