import React, { useState } from 'react';

// You will need to replace this with your actual Space URL after deployment
// Example: "https://huggingface.co/spaces/your-username/antigravity-ai"
// API Endpoint usually: "https://your-username-antigravity-ai.hf.space"
const DEFAULT_API_URL = "https://YOUR_SPACE_URL.hf.space";

export default function Generator() {
    const [prompt, setPrompt] = useState("");
    const [negativePrompt, setNegativePrompt] = useState("low quality, bad anatomy, worst quality, text, watermark");
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [status, setStatus] = useState("");
    const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);

    const generateImage = async () => {
        if (!prompt) return;
        setLoading(true);
        setStatus("Initializing...");
        setImage(null);

        try {
            // Connect to Gradio API
            // We use the /call/predict endpoint or direct client if available
            // For raw fetch, we often use the /api/predict or /run/predict depending on Gradio version

            setStatus("Sending request to AI...");

            const response = await fetch(`${apiUrl}/api/predict`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    data: [
                        prompt,
                        negativePrompt,
                        20, // steps
                        7.5 // cfg
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            setStatus("Processing...");
            const result = await response.json();

            // Gradio returns { data: [output_result, ...], ... }
            // Image is usually a base64 string or a url
            if (result.data && result.data[0]) {
                setImage(result.data[0]);
                setStatus("Complete!");
            } else {
                throw new Error("No data returned");
            }

        } catch (e) {
            console.error(e);
            setStatus(`Error: ${e instanceof Error ? e.message : "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0f19] text-white font-sans flex flex-col items-center py-10 px-4">
            <div className="max-w-4xl w-full">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 mb-4">
                        Antigravity AI
                    </h1>
                    <p className="text-gray-400 text-lg">想像力を解き放て。</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Controls */}
                    <div className="bg-[#151922] p-6 rounded-2xl border border-gray-800 shadow-xl backdrop-blur-sm bg-opacity-80">
                        <div className="space-y-6">

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">プロンプト (どんな画像を作りたい？)</label>
                                <textarea
                                    className="w-full bg-[#0b0f19] border border-gray-700 rounded-xl p-4 text-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                                    rows={4}
                                    placeholder="例: 未来的な都市、空飛ぶ車、サイバーパンク風..."
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">ネガティブプロンプト (除外したい要素)</label>
                                <textarea
                                    className="w-full bg-[#0b0f19] border border-gray-700 rounded-xl p-4 text-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all placeholder-gray-600 text-sm"
                                    rows={2}
                                    value={negativePrompt}
                                    onChange={(e) => setNegativePrompt(e.target.value)}
                                    placeholder="例: 低画質、指が多い、ぼやけた..."
                                />
                            </div>

                            {/* API URL Config */}
                            <div>
                                <label className="block text-sm font-bold text-pink-400 mb-2">▼ ここにURLを入力してください (Hugging Face Direct URL)</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#0b0f19] border-2 border-pink-500/30 rounded-lg p-3 text-white text-base focus:ring-2 focus:ring-pink-500 outline-none shadow-inner"
                                    value={apiUrl}
                                    onChange={(e) => setApiUrl(e.target.value)}
                                    placeholder="https://...hf.space"
                                />
                            </div>

                            <button
                                onClick={generateImage}
                                disabled={loading}
                                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${loading
                                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white"
                                    }`}
                            >
                                {loading ? "生成中..." : "画像を生成する"}
                            </button>

                            {status && (
                                <div className="text-center text-sm text-gray-400 animate-pulse">
                                    {status}
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-[#151922] rounded-2xl border border-gray-800 shadow-xl flex items-center justify-center min-h-[400px] overflow-hidden relative">
                        {image ? (
                            <img src={image} alt="Generated" className="w-full h-full object-contain" />
                        ) : (
                            <div className="text-center text-gray-600">
                                <div className="mb-2 text-4xl">🎨</div>
                                <p>ここに生成された画像が表示されます</p>
                            </div>
                        )}

                        {/* Loading Overlay */}
                        {loading && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
                                <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
