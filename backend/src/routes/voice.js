import multer from "multer";
const upload = multer({ dest: "uploads/" });
export const voiceUploadMiddleware = upload.single("audio");
export async function handleVoiceCoach(req, res) {
  res.json({ coach: "Coach G", transcript: "Demo voice question", answer: "Coach G voice route is installed. Add OpenAI transcription later for live speech recognition." });
}
