// Fallback speech recognition using MediaRecorder for HTTP environments
export class FallbackSpeechRecognition {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording: boolean = false;
  private stream: MediaStream | null = null;

  async initialize(): Promise<boolean> {
    try {
      // Get microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      console.log('✅ Fallback speech recognition initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize fallback speech recognition:', error);
      return false;
    }
  }

  async startRecording(onResult: (text: string) => void, onError: (error: string) => void): Promise<boolean> {
    if (!this.stream) {
      onError('Microphone not available. Please allow microphone access.');
      return false;
    }

    try {
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(this.stream);
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        
        // Convert to text using a simple fallback method
        // In a real implementation, you'd send this to a speech-to-text service
        onResult('Fallback: Please type your response manually');
      };

      this.mediaRecorder.onerror = (event) => {
        onError(`Recording error: ${event.error}`);
      };

      this.mediaRecorder.start(1000); // Collect data every second
      this.isRecording = true;
      
      console.log('🎤 Fallback recording started');
      return true;
    } catch (error) {
      onError(`Failed to start recording: ${error}`);
      return false;
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      console.log('🛑 Fallback recording stopped');
    }
  }

  cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
}
