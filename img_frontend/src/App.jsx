import React, { useState, useEffect } from 'react'
import ImageUploader from './components/ImageUploader/ImageUploader'
import MaskCanvas from './components/MaskCanvas/MaskCanvas'
import ResultViewer from './components/ResultViewer/ResultViewer'
import IterationControls from './components/IterationControls/IterationControls'
import HistorySidebar from './components/HistorySidebar/HistorySidebar'
import { Button } from './components/UI'
import { inpaintImage } from './api/inpaint'
import { theme } from './theme'
import { useTheme } from './components/context/ThemeContext'

function App() {
  const { isDarkMode, toggleTheme } = useTheme()
  const [originalImage, setOriginalImage] = useState(null)
  const [maskData, setMaskData] = useState(null)
  const [resultImage, setResultImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [jobId, setJobId] = useState(null)
  const [history, setHistory] = useState([])
  const [iterations, setIterations] = useState(2)
  const [currentStep, setCurrentStep] = useState(1)

  const handleImageUpload = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setOriginalImage(e.target.result)
      setResultImage(null)
      setMaskData(null)
      setCurrentStep(2)
    }
    reader.readAsDataURL(file)
  }

  const handleMaskChange = (mask) => {
    setMaskData(mask)
  }

  const handleInpaint = async () => {
    if (!originalImage || !maskData) {
      alert('Please upload an image and draw a mask first')
      return
    }

    setIsProcessing(true)
    setCurrentStep(4)
    try {
      const response = await inpaintImage(originalImage, maskData, iterations)
      setResultImage(response.result_image)
      setJobId(response.job_id)

      const historyItem = {
        id: response.job_id || Date.now(),
        original: originalImage,
        result: response.result_image,
        mask: maskData,
        timestamp: new Date().toISOString(),
        iterations: iterations
      }

      setHistory(prev => [historyItem, ...prev.slice(0, 9)])
    } catch (error) {
      console.error('Inpainting failed:', error)
      alert('Inpainting failed. Please try again.')
      setCurrentStep(3)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClearHistory = () => {
    setHistory([])
    setJobId(null)
    setResultImage(null)
  }

  const handleIterationChange = (newIterations) => {
    setIterations(newIterations)
  }

  const handleHistorySelect = (historyItem) => {
    setOriginalImage(historyItem.original)
    setResultImage(historyItem.result)
    setMaskData(historyItem.mask)
    setIterations(historyItem.iterations || 2)
    setCurrentStep(4)
  }

  const handleNewImage = () => {
    setOriginalImage(null)
    setMaskData(null)
    setResultImage(null)
    setCurrentStep(1)
  }

  const handleEditMask = () => {
    setCurrentStep(2)
  }

  return (
    <div className={`h-screen flex flex-col ${theme.bg.page} overflow-hidden`}>
      {/* Header */}
      <header className={`${theme.bg.card} shadow-md flex-shrink-0 z-20`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm sm:text-base">AI</span>
              </div>
              <div className="hidden sm:block">
                <h1 className={`text-lg font-bold ${theme.text.main}`}>Image Inpainting Studio</h1>
                <p className={`text-xs ${theme.text.secondary}`}>AI-Powered Object Removal</p>
              </div>
              <div className="block sm:hidden">
                <h1 className={`text-base font-bold ${theme.text.main}`}>Inpaint Studio</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className={theme.button.icon}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-zinc-700 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              <button
                onClick={handleNewImage}
                className={`${theme.button.primary} text-xs sm:text-sm px-3 sm:px-5`}
              >
                + New
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Responsive Handling */}
      <main className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto lg:overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 py-3 h-auto lg:h-full">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 h-auto lg:h-full pb-20 lg:pb-0">

              {/* Main Tool Area */}
              <div className={`${theme.card} flex flex-col min-h-[500px] lg:min-h-0`}>
                {/* Step Indicator */}
                <div className="bg-blue-600 px-3 py-2 flex items-center justify-between flex-shrink-0">
                  <h2 className="text-white font-semibold text-sm">
                    {currentStep === 1 ? 'Step 1: Upload' :
                      currentStep === 2 ? 'Step 2: Mask' :
                        currentStep === 3 ? 'Step 3: Configure' : 'Step 4: Result'}
                  </h2>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(step => (
                      <div
                        key={step}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step <= currentStep ? 'bg-white text-blue-600' : 'bg-white/20 text-white/60'
                          }`}
                      >
                        {step < currentStep ? '✓' : step}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  <div className="h-full flex flex-col items-center justify-center w-full">

                    {/* Step 1: Upload */}
                    {currentStep === 1 && (
                      <div className="w-full max-w-2xl">
                        <ImageUploader onImageUpload={handleImageUpload} isLoading={isProcessing} />
                      </div>
                    )}

                    {/* Step 2: Mask */}
                    {currentStep === 2 && originalImage && (
                      <div className="w-full flex flex-col items-center gap-4">
                        <MaskCanvas
                          originalImage={originalImage}
                          onMaskChange={handleMaskChange}
                          disabled={isProcessing}
                          isLoading={isProcessing}
                        />
                        <div className="flex justify-center gap-3 w-full max-w-lg mt-2">
                          <Button variant="secondary" onClick={handleNewImage} size="sm">Cancel</Button>
                          <Button
                            variant="primary"
                            onClick={() => setCurrentStep(3)}
                            disabled={!maskData}
                            size="sm"
                            className="flex-1"
                          >
                            Next Step →
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Configuration */}
                    {currentStep === 3 && originalImage && maskData && (
                      <div className="animate-fade-in-up flex flex-col gap-8">
                        <div className="text-center">
                          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
                            Configure Processing
                          </h2>
                          <p className="text-slate-500 text-lg max-w-md mx-auto">
                            Adjust settings for optimal results
                          </p>
                        </div>

                        <div className="max-w-3xl mx-auto w-full space-y-6">
                          <IterationControls
                            iterations={iterations}
                            onIterationChange={handleIterationChange}
                            isLoading={isProcessing}
                          />

                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                          <h4 className="text-slate-700 font-semibold mb-5">Preview</h4>
                          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                            {/* Original */}
                            <div className="flex flex-col items-center gap-3">
                              <img
                                src={originalImage}
                                alt="Original"
                                className="w-72 h-60 object-contain rounded-xl border-2 border-slate-200 shadow-md bg-white"
                              />
                              <span className="text-sm text-slate-500 font-medium">Original Image</span>
                            </div>

                            <div className="text-2xl text-primary-500 font-bold animate-pulse md:rotate-0 rotate-90">
                              →
                            </div>
                            {/* Original + Mask overlay */}
                            <div className="flex flex-col items-center gap-3">
                              <div className="relative w-72 h-60 rounded-xl border-2 border-slate-200 overflow-hidden shadow-md bg-white">
                                {/* Base image */}
                                <img
                                  src={originalImage}
                                  alt="With mask"
                                  className="absolute inset-0 w-full h-full object-contain"
                                />
                                {/* Mask overlay */}
                                <img
                                  src={maskData}
                                  alt="Mask overlay"
                                  className="absolute inset-0 w-full h-full object-contain opacity-70 mix-blend-multiply"
                                />
                              </div>
                              <span className="text-sm text-slate-500 font-medium">Masked Image</span>
                            </div>
                          </div>
                        </div>
                    </div>
                        <div className="flex justify-center gap-2">
                          <Button variant="secondary" onClick={() => setCurrentStep(2)} size="sm">← Back</Button>
                          <Button variant="primary" onClick={handleInpaint} disabled={isProcessing} size="sm">
                            {isProcessing ? '⏳ Processing...' : ' Start Inpainting →'}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Result */}
                    {currentStep === 4 && (
                      <div className="w-full h-full flex flex-col">
                        <ResultViewer
                          resultImage={resultImage}
                          isLoading={isProcessing}
                          originalImage={originalImage}
                          processingTime={isProcessing ? null : 5.2} // Placeholder or real time
                        />
                        {!isProcessing && resultImage && (
                          <div className="flex justify-center gap-2 mt-4">
                            <Button variant="secondary" onClick={handleEditMask} size="sm">✏️ Edit Mask</Button>
                            <Button variant="primary" onClick={handleNewImage} size="sm">🎨 Start New</Button>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              </div>

              {/* History Sidebar - Collapsible on Mobile? or Stacked */}
              <div className={`${theme.card} flex flex-col lg:h-full lg:overflow-hidden h-[400px]`}>
                <div className="bg-blue-600 px-3 py-2 flex-shrink-0">
                  <h3 className="text-white font-semibold text-sm">🕒 History</h3>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                  <HistorySidebar
                    history={history}
                    onSelect={handleHistorySelect}
                    selectedId={jobId}
                    onClearHistory={handleClearHistory}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
