import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import { 
  signInWithPopup, 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink 
} from 'firebase/auth';

const getFriendlyError = (errorMsg) => {
  if (!errorMsg) return null;
  if (errorMsg.includes('auth/invalid-email')) return "Hmm, that email looks strange. Can you check it again?";
  if (errorMsg.includes('auth/user-not-found') || errorMsg.includes('auth/wrong-password')) return "We couldn't recognize those details. Want to try again?";
  if (errorMsg.includes('auth/too-many-requests')) return "Too many tries! Take a quick breather and try again in a minute.";
  if (errorMsg.includes('auth/network-request-failed')) return "Looks like the internet wind is too strong. Check your connection.";
  if (errorMsg.includes('popup-closed-by-user')) return "Sign in was cancelled. We're ready when you are!";
  // Strip "Firebase:" prefix if it exists but keep it simple
  let cleanMsg = errorMsg.replace(/Firebase:\s*/i, '').replace(/\(auth\/.*\)\.?/i, '').trim();
  return "Oops! " + cleanMsg + " Let's give it another shot.";
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user came from a magic link
    const checkEmailLink = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        setIsLoading(true);
        let emailForSignIn = window.localStorage.getItem('emailForSignIn');
        
        if (!emailForSignIn) {
          // User opened the link on a different device. Ask for email to confirm.
          emailForSignIn = window.prompt('Please provide your email for confirmation');
        }
        
        if (emailForSignIn) {
          try {
            await signInWithEmailLink(auth, emailForSignIn, window.location.href);
            window.localStorage.removeItem('emailForSignIn');
            // User is signed in and App.jsx onAuthStateChanged will catch it!
          } catch (err) {
            setError(err.message);
          }
        } else {
          setError("Need email to finish magic link login");
        }
        setIsLoading(false);
      }
    };

    checkEmailLink();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    const actionCodeSettings = {
      // URL you want to redirect back to. The domain (www.example.com) for this
      // URL must be in the authorized domains list in the Firebase Console.
      url: window.location.origin, // This points to current site root
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setMessage("Magic link sent! Check your email cave.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-app)]">
      {/* Left side - Intro */}
      <div className="hidden lg:flex lg:w-[45%] bg-black p-12 text-white flex-col justify-between relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90 z-0" 
          style={{ backgroundImage: 'url(/login-bg.jpg)' }}
        ></div>
        {/* Subtle dark gradient overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30 z-0"></div>
        
        <div className="relative z-10 flex items-center gap-4 drop-shadow-md">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          <span className="font-bold text-4xl tracking-tight text-white">WhatsNext</span>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight leading-tight !text-white drop-shadow-lg">
            Track your job hunt <br/> like a pro.
          </h1>
          <p className="text-lg text-white max-w-md drop-shadow-md font-medium leading-relaxed">
            Keep track of applications, interviews, and offers in one organized cave. Never lose a job rock again.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 lg:p-24 bg-[var(--bg-surface)]">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-12 flex items-center gap-3">
            <svg className="w-10 h-10 text-[var(--text-primary)]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            <span className="font-bold text-3xl tracking-tight text-[var(--text-primary)]">WhatsNext</span>
          </div>
          
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Sign in
          </h2>
          <p className="text-[var(--text-muted)] text-sm mb-10">
            Welcome back! Enter your details below.
          </p>
          
          {error && (
            <div className="bg-zinc-50 border border-zinc-200 text-zinc-600 p-4 rounded-xl mb-6 text-sm flex items-start gap-3 shadow-sm">
              <svg className="w-5 h-5 text-zinc-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span className="leading-relaxed">{getFriendlyError(error)}</span>
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-lg mb-6 text-sm">
              {message}
            </div>
          )}

          {isLoading ? (
            <div className="text-center text-[var(--text-primary)] my-12 py-8">
              <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="font-medium text-sm">Working...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <form onSubmit={handleEmailLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)]">
                    Email address
                  </label>
                  <input 
                    id="email"
                    type="email" 
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-3.5 text-[var(--text-primary)] text-sm focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-colors placeholder:text-gray-400"
                    required
                  />
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-[#111827] hover:bg-black text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
                >
                  Sign in with Magic Link
                </button>
              </form>

              <div className="flex items-center">
                <div className="flex-1 border-t border-gray-200"></div>
                <div className="px-3 text-gray-400 text-xs font-medium uppercase">OR</div>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              <button 
                onClick={handleGoogleLogin}
                className="w-full bg-white text-gray-700 font-medium py-2.5 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
