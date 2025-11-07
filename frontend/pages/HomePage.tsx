import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full dark:bg-slate-900/80 bg-white/80 backdrop-blur-md shadow-sm z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">SB</span>
              </div>
              <span className="text-2xl font-bold gradient-text dark:text-white">Study Buddy AI</span>
            </div>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="px-6 py-2 dark:text-gray-300 text-primary-600 dark:hover:text-white hover:text-primary-700 font-medium transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="btn-primary"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center animate-fade-in">
            <div className="inline-block mb-4 px-4 py-2 bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400 rounded-full text-sm font-semibold">
              🚀 AI-Powered Learning Assistant
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight dark:text-white text-gray-900">
              Learn Smarter with
              <br />
              <span className="gradient-text">AI-Powered Study Buddy</span>
            </h1>
            <p className="text-xl dark:text-gray-300 text-gray-600 mb-8 max-w-2xl mx-auto">
              Upload your study materials and chat with an intelligent AI that understands your content.
              Get instant answers, explanations, and personalized learning support 24/7.
            </p>

            <div className="flex gap-4 justify-center mb-12">
              <Link
                href="/signup"
                className="btn-primary text-lg px-8 py-4 shadow-premium"
              >
                Start Learning Free →
              </Link>
              <Link
                href="#features"
                className="btn-secondary text-lg px-8 py-4"
              >
                See How It Works
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">10K+</div>
                <div className="dark:text-gray-400 text-gray-600">Active Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">500K+</div>
                <div className="dark:text-gray-400 text-gray-600">Questions Answered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">98%</div>
                <div className="dark:text-gray-400 text-gray-600">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 dark:bg-slate-900 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 dark:text-white text-gray-900">Premium Features</h2>
            <p className="text-xl dark:text-gray-300 text-gray-600">Everything you need to excel in your studies</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card-hover dark:bg-slate-800 bg-white p-8 rounded-2xl border dark:border-slate-700 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <span className="text-3xl">📚</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 dark:text-white text-gray-900">Smart Document Upload</h3>
              <p className="dark:text-gray-300 text-gray-700 mb-4">
                Upload PDFs, DOCX, and TXT files. Our AI automatically extracts and indexes content for instant retrieval.
              </p>
              <ul className="space-y-2 dark:text-gray-300 text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 dark:text-green-400 mr-2">✓</span> PDF text extraction
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 dark:text-green-400 mr-2">✓</span> Multiple file formats
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 dark:text-green-400 mr-2">✓</span> Unlimited storage
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="card-hover dark:bg-slate-800 bg-white p-8 rounded-2xl border dark:border-slate-700 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 dark:text-white text-gray-900">Intelligent AI Chat</h3>
              <p className="dark:text-gray-300 text-gray-700 mb-4">
                Ask questions and get accurate answers based on your uploaded materials. Like having a personal tutor.
              </p>
              <ul className="space-y-2 dark:text-gray-300 text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 dark:text-green-400 mr-2">✓</span> Context-aware responses
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 dark:text-green-400 mr-2">✓</span> Powered by GPT-3.5
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 dark:text-green-400 mr-2">✓</span> 24/7 availability
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="card-hover dark:bg-slate-800 bg-white p-8 rounded-2xl border dark:border-slate-700 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 dark:text-white text-gray-900">Chat History & Organization</h3>
              <p className="dark:text-gray-300 text-gray-700 mb-4">
                Keep all your conversations organized. Never lose track of important discussions and insights.
              </p>
              <ul className="space-y-2 dark:text-gray-300 text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 dark:text-green-400 mr-2">✓</span> Unlimited chat history
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 dark:text-green-400 mr-2">✓</span> Easy search & filter
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 dark:text-green-400 mr-2">✓</span> Export conversations
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 dark:bg-slate-900 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 dark:text-white text-gray-900">How It Works</h2>
            <p className="text-xl dark:text-gray-300 text-gray-600">Get started in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: 1,
                title: 'Upload Your Materials',
                description: 'Upload PDFs, notes, textbooks, or any study material you want help with.'
              },
              {
                number: 2,
                title: 'Ask Questions',
                description: 'Chat with AI about your materials. Get explanations, summaries, and answers.'
              },
              {
                number: 3,
                title: 'Learn & Excel',
                description: 'Master your subjects faster with personalized AI assistance available 24/7.'
              }
            ].map((step) => (
              <div key={step.number} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold shadow-glow">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-3 dark:text-white text-gray-900">{step.title}</h3>
                <p className="dark:text-gray-300 text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-700 dark:to-purple-700 text-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of students who are already learning smarter with Study Buddy AI
          </p>
          <Link
            href="/signup"
            className="inline-block px-10 py-4 bg-white dark:bg-gray-100 text-primary-600 dark:text-primary-700 rounded-xl font-bold text-lg hover:bg-gray-100 dark:hover:bg-white transform hover:scale-105 transition-all shadow-premium"
          >
            Get Started Free - No Credit Card Required
          </Link>
          <p className="mt-6 text-sm text-white/80">Free forever • No hidden fees • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-slate-950 text-gray-300 py-12">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">SB</span>
                </div>
                <span className="text-white font-bold">Study Buddy AI</span>
              </div>
              <p className="text-sm text-gray-400">
                Your intelligent learning companion powered by advanced AI technology.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Tutorials</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 dark:border-slate-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Study Buddy AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
