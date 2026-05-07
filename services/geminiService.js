async function analyzeImageMock() {
  return { supported: false, message: 'Gemini integration optional and not enabled by default.' };
}

module.exports = { analyzeImageMock };
