import React, { useState, useRef, forwardRef, useImperativeHandle } from "react";

const MicButton = forwardRef(({ onText }, ref) => {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const setupRecognition = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript;
      onText(transcript);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
  };

  const startMic = () => {
    if (!recognitionRef.current) setupRecognition();
    recognitionRef.current.start();
    setListening(true);
  };

  const stopMic = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  const handleClick = () => {
    listening ? stopMic() : startMic();
  };

  useImperativeHandle(ref, () => ({ stopMic, startMic }));

  return (
    <div
      className="relative flex items-center justify-center w-8 h-8 ml-2 cursor-pointer"
      onClick={handleClick}
    >
      {/* Waveform circles */}
      {listening && (
        <>
          <span className="absolute w-8 h-8 rounded-full bg-purple-400 opacity-20 animate-ping"></span>
          <span className="absolute w-10 h-10 rounded-full bg-purple-400 opacity-15 animate-ping delay-150"></span>
          <span className="absolute w-12 h-12 rounded-full bg-purple-400 opacity-10 animate-ping delay-300"></span>
        </>
      )}

      {/* Mic icon */}
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full ${
          listening ? "bg-white text-purple-600" : "bg-purple-600 text-white"
        }`}
      >
        <i className="ri-mic-fill text-sm"></i>
      </div>
    </div>
  );
});

export default MicButton;
