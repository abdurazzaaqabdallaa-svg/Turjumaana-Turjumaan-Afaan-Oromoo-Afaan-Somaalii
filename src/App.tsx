import { useState } from 'react';
import { ArrowRightLeft, Copy, Loader2, Languages, Check } from 'lucide-react';

type Language = 'Afaan Oromoo' | 'Afaan Somaalii';

export default function App() {
  const [sourceLang, setSourceLang] = useState<Language>('Afaan Oromoo');
  const [targetLang, setTargetLang] = useState<Language>('Afaan Somaalii');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sourceText,
          from: sourceLang,
          to: targetLang,
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed. Please try again.');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setTranslatedText(data.translatedText);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-5xl mb-8 flex items-center space-x-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
          <Languages className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Turjumaana / Turjumaan</h1>
          <p className="text-sm text-slate-500 font-medium tracking-wide">Afaan Oromoo &harr; Afaan Somaalii</p>
        </div>
      </header>

      <main className="w-full max-w-5xl flex flex-col gap-6">
        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-white rounded-2xl shadow-sm border border-slate-200 p-2 md:p-3 relative z-10 w-full md:w-max mx-auto md:mx-0">
          <div className="w-full md:w-48 text-center py-2 px-4 rounded-xl font-medium text-slate-700 bg-slate-50 border border-slate-100">
            {sourceLang}
          </div>
          
          <button 
            onClick={handleSwap}
            className="my-3 md:my-0 md:mx-4 p-3 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-indigo-600 active:scale-95 border border-slate-200 md:border-transparent bg-white md:bg-transparent shadow-sm md:shadow-none z-10"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </button>

          <div className="w-full md:w-48 text-center py-2 px-4 rounded-xl font-medium text-slate-700 bg-slate-50 border border-slate-100">
            {targetLang}
          </div>
        </div>

        {/* Translation Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-[-1.5rem] md:mt-0 pt-6 md:pt-0">
          {/* Source Box */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all">
            <textarea
              className="w-full h-48 md:h-64 p-6 resize-none bg-transparent outline-none text-lg placeholder:text-slate-400"
              placeholder="Barreeffama asitti galchi... / Halkan qoraalka geli..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
            />
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs font-medium text-slate-400 ml-2">
                {sourceText.length} arfii / xaraf
              </span>
              <button
                onClick={handleTranslate}
                disabled={isLoading || !sourceText.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-full font-medium transition-colors flex items-center space-x-2 shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Hojiirra...</span>
                  </>
                ) : (
                  <span>Jijjiiri / Turjun</span>
                )}
              </button>
            </div>
          </div>

          {/* Target Box */}
          <div className="bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden flex flex-col relative text-slate-800">
            {isLoading && (
              <div className="absolute inset-0 bg-slate-100/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            )}
            <div className="w-full h-48 md:h-64 p-6 overflow-y-auto text-lg whitespace-pre-wrap">
              {error ? (
                <span className="text-red-500 font-medium">{error}</span>
              ) : translatedText ? (
                translatedText
              ) : (
                <span className="text-slate-400">Hiikkaan asitti mulla'ata / Turjumaanka halkan ayuu kasoo muuqan doonaa...</span>
              )}
            </div>
            <div className="px-4 py-3 border-t border-slate-200 flex justify-end items-center bg-slate-100 mt-auto">
               <button
                  onClick={handleCopy}
                  disabled={!translatedText}
                  className="p-2 text-slate-500 hover:text-slate-800 disabled:opacity-50 hover:bg-slate-200 rounded-full transition-colors flex items-center"
                >
                  {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
      }
