import React, { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import "./App.css";

function App() {
  const [models, setModelsLoaded] = useState(false);
  const [startWebcam, setStartWebcam] = useState(false);

  const videoRef = useRef();
  const videoHeight = 400;
  const videoWidth = 400;
  const borderRadius = 50;
  const canvasRef = useRef();

  // const [faces, setFaces] = useState();

  // To Load Models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + "/models";

      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]).then(setModelsLoaded(true));
    };
    loadModels();
  }, []);

  //   // To handle Capture
  //   const handleImage = () => {
  //     // canvasRef.current
  //     //   .getContext("2d")
  //     //   .clearRect(0, 0, videoWidth, videoHeight);

  //       // console.log(canvasRef.current
  //       //   .getContext("2d")
  //       //   .clearRect(0, 0, videoWidth, videoHeight));
  //   };

  //   // To open webcam
  const startVideo = () => {
    setStartWebcam(true);
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

  // To detect face
  const handleVideoOnPlay = () => {
    setInterval(async () => {
      if (canvasRef && canvasRef.current) {
        canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(
          videoRef.current
        );
        const displaySize = {
          width: videoWidth,
          height: videoHeight,
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
      }
    }, 100);
  };

  // to close webcam
  const closeWebcam = () => {
    videoRef.current.pause();
    videoRef.current.srcObject.getTracks()[0].stop();
    setStartWebcam(false);
  };

  return (
    <div className="face__container">
      <h2>Hello Let's Capture your face</h2>
      <div>
        {startWebcam && models ? (
          <button onClick={closeWebcam} className="btn--face">
            Close
          </button>
        ) : (
          <button onClick={startVideo} className="btn--face">
            Start
          </button>
        )}
      </div>
      {startWebcam ? (
        models ? (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "10px",
              }}
            >
              <video
                ref={videoRef}
                height={videoHeight}
                width={videoWidth}
                onPlay={handleVideoOnPlay}
                style={{ borderRadius: "10px" }}
              />
              <canvas ref={canvasRef} style={{ position: "absolute" }} />
            </div>
          </div>
        ) : (
          <div>Loading...</div>
        )
      ) : (
        <></>
      )}
      <button
        // disabled={!startVideo}
        className="btn--capture"
        // onClick={handleImage}
      >
        Capture
      </button>
    </div>
  );
}

export default App;
