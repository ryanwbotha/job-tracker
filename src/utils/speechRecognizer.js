/**
 * Speech Recognition helper utilizing browser Web Speech API (webkitSpeechRecognition)
 */
export class VoiceNoteRecorder {
  constructor(onTranscriptCallback, onErrorCallback) {
    this.recognition = null;
    this.isRecording = false;
    this.onTranscript = onTranscriptCallback;
    this.onError = onErrorCallback;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript && this.onTranscript) {
          this.onTranscript(finalTranscript.trim());
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (this.onError) {
          this.onError(event.error);
        }
      };

      this.recognition.onend = () => {
        this.isRecording = false;
      };
    }
  }

  isSupported() {
    return !!this.recognition;
  }

  start() {
    if (!this.recognition) {
      if (this.onError) this.onError('Speech recognition not supported in this browser.');
      return false;
    }
    try {
      this.recognition.start();
      this.isRecording = true;
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  stop() {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
    }
  }
}
