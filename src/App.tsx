import React, { useState, useRef, useEffect } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { ChromePicker } from 'react-color'; // Import ChromePicker
import { removeBackground } from '@imgly/background-removal';
import '@fontsource/roboto'; // Add a Google Font from 2024 (Robust Font support)
import '@fontsource/open-sans';
import '@fontsource/lobster';
import '@fontsource/abril-fatface';
import '@fontsource/raleway';
import '@fontsource/playfair-display';

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputText, setOutputText] = useState('');
  const [textX, setTextX] = useState(50);
  const [textY, setTextY] = useState(50);
  const [textColor, setTextColor] = useState('#e0e0e0');
  const [fontWeight, setFontWeight] = useState(100); // Updated state for font weight (100 - 1000)
  const [fontSize, setFontSize] = useState(48); // New state for font size
  const [fontFamily, setFontFamily] = useState('Roboto'); // New state for font family
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = async () => {
    if (image) {
      setIsProcessing(true);
      try {
        const blob = await (await fetch(image)).blob();
        const result = await removeBackground(blob);
        setProcessedImage(URL.createObjectURL(result));
      } catch (error) {
        console.error('Background removal failed:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleReset = () => {
    setImage(null);
    setProcessedImage(null);
    setOutputText('');
    setTextX(50);
    setTextY(50);
    setTextColor('#e0e0e0');
    setFontWeight(400); // Reset font weight
    setFontSize(48); // Reset font size
  };

  const handleOutputTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setOutputText(e.target.value);
  };

  const handleTextColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextColor(e.target.value);
  };

  useEffect(() => {
    if (processedImage && image && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const originalImage = new Image();
      const img = new Image();

      originalImage.onload = () => {
        img.onload = () => {
          canvas.width = originalImage.width;
          canvas.height = originalImage.height;

          ctx!.drawImage(originalImage, 0, 0);

          if (outputText) {
            // Apply dynamically selected font family, size, weight, and color
            ctx!.font = `${fontWeight} ${fontSize}px ${fontFamily}`; // Dynamic font family
            ctx!.fillStyle = textColor;
            ctx!.textAlign = 'center';
            ctx!.textBaseline = 'middle';

            const x = (textX / 100) * canvas.width;
            const y = (textY / 100) * canvas.height;

            function wrapText(
              context: CanvasRenderingContext2D,
              text: string,
              x: number,
              y: number,
              maxWidth: number,
              lineHeight: number
            ) {
              const words = text.split(' ');
              let line = '';

              for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = context.measureText(testLine);
                const testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                  context.fillText(line, x, y);
                  line = words[n] + ' ';
                  y += lineHeight;
                } else {
                  line = testLine;
                }
              }
              context.fillText(line, x, y);
            }

            wrapText(ctx!, outputText, x, y, canvas.width - 40, fontSize + 10); // Adjusted line height
          }

          ctx!.globalCompositeOperation = 'source-atop';
          ctx!.drawImage(img, 0, 0);

          ctx!.globalCompositeOperation = 'source-over';
        };

        img.src = processedImage;
      };

      originalImage.src = image;
    }
  }, [
    image,
    processedImage,
    outputText,
    textX,
    textY,
    textColor,
    fontWeight,
    fontSize,
    fontFamily,
  ]); // Add fontFamily to dependency array

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = 'processed_image_with_text.png';
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="OverlayMagic Logo"
            className="mx-auto w-16 h-16 mb-4"
          />
          <h1 className="text-4xl font-bold text-purple-600">OverlayMagic</h1>
        </div>

        {/* Image upload section */}
        {!image && (
          <div className="border-4 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <span className="mt-2 block text-sm font-semibold text-gray-900">
                Upload an image
              </span>
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        )}

        {image && !processedImage && (
          <div className="mb-8">
            <img
              src={image}
              alt="Original"
              className="max-w-full h-auto mb-4"
            />
            <button
              onClick={handleRemoveBackground}
              disabled={isProcessing}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Remove Background'}
            </button>
          </div>
        )}

        {processedImage && (
          <div className="mb-8">
            <canvas ref={canvasRef} className="max-w-full h-auto mb-4" />
            <div className="mb-4">
              <textarea
                value={outputText}
                onChange={handleOutputTextChange}
                placeholder="Enter text to appear behind the subject..."
                className="w-full p-2 border border-gray-300 rounded"
                rows={3}
              />
            </div>

            {/* Sliders for Text Position, Size, and Color */}
            <div className="mb-4 space-y-4">
              <div>
                <label
                  htmlFor="textX"
                  className="block text-sm font-medium text-gray-700"
                >
                  Text X Position: {textX}%
                </label>
                <input
                  type="range"
                  id="textX"
                  min="0"
                  max="100"
                  value={textX}
                  onChange={(e) => setTextX(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label
                  htmlFor="textY"
                  className="block text-sm font-medium text-gray-700"
                >
                  Text Y Position: {textY}%
                </label>
                <input
                  type="range"
                  id="textY"
                  min="0"
                  max="100"
                  value={textY}
                  onChange={(e) => setTextY(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Slider for Font Size */}
              <div>
                <label
                  htmlFor="fontSize"
                  className="block text-sm font-medium text-gray-700"
                >
                  Font Size: {fontSize}px
                </label>
                <input
                  type="range"
                  id="fontSize"
                  min="20"
                  max="2000"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Slider for Font Weight */}
              <div>
                <label
                  htmlFor="fontWeight"
                  className="block text-sm font-medium text-gray-700"
                >
                  Font Weight: {fontWeight}
                </label>
                <input
                  type="range"
                  id="fontWeight"
                  min="100"
                  max="1000"
                  step="100"
                  value={fontWeight}
                  onChange={(e) => setFontWeight(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              {/* Dropdown for Font Family */}
              <div>
                <label
                  htmlFor="fontFamily"
                  className="block text-sm font-medium text-gray-700"
                >
                  Font Family
                </label>
                <select
                  id="fontFamily"
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lobster">Lobster</option>
                  <option value="Abril Fatface">Abril Fatface</option>
                  <option value="Raleway">Raleway</option>
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Lato">Lato</option>
                  <option value="Oswald">Oswald</option>
                  <option value="Merriweather">Merriweather</option>
                  <option value="Nunito">Nunito</option>
                  <option value="Bebas Neue">Bebas Neue</option>
                  <option value="Pacifico">Pacifico</option>
                  <option value="Quicksand">Quicksand</option>
                  <option value="Fira Sans">Fira Sans</option>
                  <option value="Inconsolata">Inconsolata</option>
                  <option value="Josefin Sans">Josefin Sans</option>
                  <option value="Dancing Script">Dancing Script</option>
                  <option value="Indie Flower">Indie Flower</option>
                </select>
              </div>

              {/* Color Picker for Text Color */}
              <div>
                <label
                  htmlFor="textColor"
                  className="block text-sm font-medium text-gray-700"
                >
                  Text Color
                </label>
                <ChromePicker
                  color={textColor}
                  onChange={(color) => setTextColor(color.hex)} // Updates state with chosen color
                  disableAlpha={false} // Optionally allow alpha transparency
                />
              </div>
            </div>

            {/* Download and Reset buttons */}
            <button
              onClick={handleDownload}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition mr-4"
            >
              Download
            </button>
            <button
              onClick={handleReset}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
