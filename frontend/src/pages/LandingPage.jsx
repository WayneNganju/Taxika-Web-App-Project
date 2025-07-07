import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("en");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "sw" : "en"));
  };

  const text = {
    en: {
      title: "KRA iTax Helper",
      description: "Simplified tax return preparation tool designed specifically for Kenyan taxpayers. File your annual income tax returns easily, securely, and independently.",
      getStarted: "Get Started",
      createAccount: "Create Account",
      why: "Why Choose KRA iTax Helper?",
      login: "Login",
      home: "Home",
      switchLang: "Kiswahili"
    },
    sw: {
      title: "Msaidizi wa KRA iTax",
      description: "Zana rahisi ya maandalizi ya kurudisha ushuru kwa walipa kodi wa Kenya. Jaza fomu zako za ushuru kwa urahisi na usalama.",
      getStarted: "Anza Sasa",
      createAccount: "Fungua Akaunti",
      why: "Kwa Nini Utumie Msaidizi wa iTax?",
      login: "Ingia",
      home: "Nyumbani",
      switchLang: "English"
    }
  };

  const features = [
    { icon: "📄", title: "P9 Upload", desc: "Upload your P9 form easily." },
    { icon: "📊", title: "PAYE Auto Calc", desc: "Automatically calculate PAYE." },
    { icon: "🔒", title: "Secure", desc: "Bank-level data protection." },
    { icon: "📱", title: "Mobile Ready", desc: "Use it on any device." },
    { icon: "🇰🇪", title: "Kenyan-Made", desc: "Built for Kenyan tax law." },
    { icon: "🎁", title: "Free", desc: "100% free to use." },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-sans">
      {/* Header */}
      <header className="flex justify-between items-center p-6 bg-blue-700 shadow-md">
        <h1 className="text-2xl font-bold">🧾 {text[language].title}</h1>
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate("/")} className="hover:underline">🏠 {text[language].home}</button>
          <button onClick={() => navigate("/login")} className="hover:underline">🔐 {text[language].login}</button>
          <button onClick={toggleLanguage} className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
            🌐 {text[language].switchLang}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="text-center py-20 px-6">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">{text[language].title}</h2>
        <p className="max-w-2xl mx-auto text-lg text-gray-100 mb-10">
          {text[language].description}
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md font-semibold shadow"
          >
            🚀 {text[language].getStarted}
          </button>
          <button
            onClick={() => navigate("/register")}
            className="bg-gray-400 hover:bg-gray-500 px-6 py-3 rounded-md font-semibold shadow"
          >
            🆕 {text[language].createAccount}
          </button>
        </div>
      </section>

      {/* Why Choose */}
      <section className="bg-white text-gray-800 py-16 px-6">
        <h3 className="text-3xl font-bold text-center mb-12 text-blue-700">{text[language].why}</h3>
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {features.map((item, idx) => (
            <div key={idx} className="text-center p-6 border rounded-lg bg-white hover:shadow-lg transition">
              <div className="text-5xl mb-4">{item.icon}</div>
              <h4 className="text-xl font-semibold mb-2">{item.title}</h4>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 text-gray-600 text-sm py-4 px-6 flex justify-between">
        <span className="font-semibold">YouWare</span>
        <span>© {new Date().getFullYear()} Wayne Nganju</span>
      </footer>
    </div>
  );
}
