import * as faceapi from "face-api.js";
import React, { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [models, setModel] = useState(false);
  const [startVideo, setstartVideo] = useState(false);

  const videoRef = useRef();
  const videoHeight = 400;
  const videoWidth = 400;
  const borderRadius = 50;
  const canvasRef = useRef();

  const [faces, setFaces] = useState();

  // To Load Models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + "/models";

      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]).then(setModel(true));
    };
    loadModels();
  }, []);

  // To handle Capture
  const handleImage = () => {
    // canvasRef.current
    //   .getContext("2d")
    //   .clearRect(0, 0, videoWidth, videoHeight);

      // console.log(canvasRef.current
      //   .getContext("2d")
      //   .clearRect(0, 0, videoWidth, videoHeight));
  };

  // To open webcam
  const startWebcamVideo = () => {
    setstartVideo(true);
    navigator.mediaDevices
      .getUserMedia({ video: { width: 300 } })
      .then((stream) => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error("error:", err);
      });
  };

  // to detect face
  const handleVideo = () => {
    setInterval(async () => {
      if (canvasRef && canvasRef.current) {
        canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(
          videoRef.current
        );
        const displaySize = {
          width: videoWidth,
          height: videoHeight,
          borderRadius: borderRadius,
        };

        faceapi.matchDimensions(canvasRef.current, displaySize);

        const detections = await faceapi
          .detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceLandmarks()
          .withFaceExpressions();

        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );

        canvasRef &&
          canvasRef.current &&
          canvasRef.current
            .getContext("2d")
            .clearRect(0, 0, videoWidth, videoHeight);
        canvasRef &&
          canvasRef.current &&
          faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
        canvasRef &&
          canvasRef.current &&
          faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
        canvasRef &&
          canvasRef.current &&
          faceapi.draw.drawFaceExpressions(
            canvasRef.current,
            resizedDetections
          );
        // console.log(canvasRef.current.toDataURL("image/jpeg"));
      }
    }, 100);
  };

  // Close webcam
  const closeWebcam = () => {
    videoRef.current.pause();
    videoRef.current.srcObject.getTracks()[0].stop();
    setstartVideo(false);
  };

  return (
    <div className="face__container">
      <h2>Hello Let's Capture your face</h2>
      <div>
        {startWebcamVideo && models ? (
          <button onClick={closeWebcam} className="btn--face">
            Close
          </button>
        ) : (
          <button onClick={startVideo} className="btn--face">
            Start
          </button>
        )}
      </div>
      {startVideo ? (
        models ? (
          <>
            <div
            >
              <video
                ref={videoRef}
                height={videoHeight}
                width={videoWidth}
                onPlay={handleVideo}
                
              />
              <canvas ref={canvasRef} style={{ position: "absolute" }} />
            </div>
          </>
        ) : (
          <div>loading...</div>
        )
      ) : (
        <></>
      )}

      {/* { startVideo === true ? <button disabled={startVideo}>Capture</button> : <button disabled>Face not detected</button>} */}
      {/* <button
        disabled={!startVideo}
        className="btn--capture"
        onClickCapture={handleImage}
      >
        Capture
      </button> */}
      <button
        // disabled={!startVideo}
        className="btn--capture"
        onClick={handleImage}
      >
        Capture
      </button>

      {/* <img src={canvasRef.current.toDataURL("image/webp")} alt="new"/> */}
    </div>
  );
}

export default App;
