# Speech-to-Text Options

Your app now supports multiple speech-to-text providers! Here are your options:

## 🚀 **Option 1: Native Speech Recognition (RECOMMENDED & FREE!)**

**✅ Works immediately - no API keys needed!**

- **Cost**: FREE
- **Setup**: Already configured as default
- **Pros**:
  - No API costs
  - Works offline
  - Real-time transcription
  - Built into Android/iOS
- **Cons**:
  - Less accurate than cloud services
  - Limited to device languages

### How to use:
Just run the app! It's already configured to use native speech recognition.

---

## 🌟 **Option 2: Google Cloud Speech-to-Text**

**✅ Best balance of cost and accuracy**

- **Cost**: 60 minutes/month FREE, then $0.024/minute
- **Accuracy**: Excellent
- **Languages**: 125+

### Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable Speech-to-Text API
3. Create API key
4. Copy `.env.example` to `.env`
5. Add:
   ```
   SPEECH_PROVIDER=google
   GOOGLE_CLOUD_API_KEY=your_api_key_here
   ```

---

## 🤖 **Option 3: OpenAI Whisper**

**✅ Highest accuracy**

- **Cost**: $0.006/minute
- **Accuracy**: Best in class
- **Languages**: 50+

### Setup:
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create account and get API key
3. Copy `.env.example` to `.env`
4. Add:
   ```
   SPEECH_PROVIDER=openai
   OPENAI_API_KEY=sk-your_key_here
   ```

---

## 🧪 **Option 4: Mock/Testing Mode**

For development and testing without any API.

```
SPEECH_PROVIDER=mock
```

---

## 📊 **Comparison Table**

| Provider | Cost | Setup Difficulty | Accuracy | Real-time | Languages |
|----------|------|------------------|----------|-----------|-----------|
| **Native** | FREE | None ✅ | Good | Yes | Device |
| **Google** | $0.024/min* | Easy | Excellent | Yes | 125+ |
| **OpenAI** | $0.006/min | Easy | Best | No | 50+ |
| **Mock** | FREE | None | N/A | Yes | N/A |

*60 minutes free per month

---

## 🔧 **Configuration**

Create a `.env` file (copy from `.env.example`):

```bash
# Choose your provider
SPEECH_PROVIDER=native  # or 'google', 'openai', 'mock'

# Add API keys only for the provider you choose
GOOGLE_CLOUD_API_KEY=your_google_key_here
OPENAI_API_KEY=your_openai_key_here
```

---

## 🎯 **Recommendation**

**For most users**: Start with `native` (free, works immediately)
**For better accuracy**: Upgrade to `google` (generous free tier)
**For best accuracy**: Use `openai` (most expensive but best results)

---

## 🔊 **How It Works**

1. **Press microphone button** 🎤
2. **Start speaking** - see "Listening..." in input field
3. **Real-time transcription** - text appears as you speak
4. **Press microphone again or Send** to stop

---

## ⚙️ **Advanced Configuration**

In `config.ts`, you can customize:

```typescript
export const SPEECH_CONFIG = {
  PROVIDER: 'native',           // Provider choice
  LANGUAGE: 'en-US',           // Language code
  CONTINUOUS: true,            // Keep listening
  INTERIM_RESULTS: true,       // Show partial results
};
```

---

## 🚨 **Troubleshooting**

### "Failed to start recording"
- Check microphone permissions
- Make sure no other app is using mic

### No transcription appearing
- Verify API key is correct (for cloud providers)
- Check internet connection (for cloud providers)
- Try native provider as fallback

### Poor accuracy
- Speak clearly and at normal volume
- Use in quiet environment
- Consider upgrading to cloud provider

---

## 💡 **Tips for Best Results**

1. **Speak clearly** at normal pace
2. **Quiet environment** reduces errors
3. **6-12 inches** from device microphone
4. **Wait for "Listening..."** before speaking
5. **Pause briefly** between sentences

---

## 🔮 **Future Enhancements**

We're considering adding:
- Azure Speech Services
- AWS Transcribe
- Offline speech models
- Custom language models
- Multiple language support

---

Ready to test? Just run your app and try the voice feature! 🎤