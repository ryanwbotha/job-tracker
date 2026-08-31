import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import { 
  signInWithPopup, 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink 
} from 'firebase/auth';
import { Crosshair, WarningCircle, CheckCircle, Spinner } from '@phosphor-icons/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

const getFriendlyError = (errorMsg) => {
  if (!errorMsg) return null;
  if (errorMsg.includes('auth/invalid-email')) return "Hmm, that email looks strange. Can you check it again?";
  if (errorMsg.includes('auth/user-not-found') || errorMsg.includes('auth/wrong-password')) return "We couldn't recognize those details. Want to try again?";
  if (errorMsg.includes('auth/too-many-requests')) return "Too many tries! Take a quick breather and try again in a minute.";
  if (errorMsg.includes('auth/network-request-failed')) return "Looks like the internet wind is too strong. Check your connection.";
  if (errorMsg.includes('popup-closed-by-user')) return "Sign in was cancelled. We're ready when you are!";
  let cleanMsg = errorMsg.replace(/Firebase:\s*/i, '').replace(/\(auth\/.*\)\.?/i, '').trim();
  return "Oops! " + cleanMsg + " Let's give it another shot.";
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkEmailLink = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        setIsLoading(true);
        let emailForSignIn = window.localStorage.getItem('emailForSignIn');
        
        if (!emailForSignIn) {
          emailForSignIn = window.prompt('Please provide your email for confirmation');
        }
        
        if (emailForSignIn) {
          try {
            await signInWithEmailLink(auth, emailForSignIn, window.location.href);
            window.localStorage.removeItem('emailForSignIn');
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
      url: window.location.origin,
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
    <div className="flex min-h-screen bg-background">
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
          <Crosshair className="w-12 h-12 text-white" weight="bold" />
          <span className="font-bold text-4xl tracking-tight text-white">WhatsNext</span>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight leading-tight text-white drop-shadow-lg">
            Track your job hunt <br/> like a pro.
          </h1>
          <p className="text-lg text-white max-w-md drop-shadow-md font-medium leading-relaxed">
            Keep track of applications, interviews, and offers in one organized workspace. Never lose track of an opportunity again.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 lg:p-24 bg-card">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-12 flex items-center gap-3">
            <Crosshair className="w-10 h-10 text-primary" weight="bold" />
            <span className="font-bold text-3xl tracking-tight text-foreground">WhatsNext</span>
          </div>
          
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Sign in
          </h2>
          <p className="text-muted-foreground text-sm mb-10">
            Welcome back! Enter your details below.
          </p>
          
          {error && (
            <div className="bg-destructive/15 border border-destructive/20 text-destructive p-4 rounded-xl mb-6 text-sm flex items-start gap-3 shadow-sm">
              <WarningCircle className="w-5 h-5 mt-0.5 flex-shrink-0" weight="fill" />
              <span className="leading-relaxed">{getFriendlyError(error)}</span>
            </div>
          )}

          {message && (
            <div className="bg-primary/15 border border-primary/20 text-primary p-4 rounded-xl mb-6 text-sm flex items-start gap-3 shadow-sm">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" weight="fill" />
              <span className="leading-relaxed">{message}</span>
            </div>
          )}

          {isLoading ? (
            <div className="text-center text-foreground my-12 py-8 flex flex-col items-center">
              <Spinner className="w-8 h-8 animate-spin mb-4" />
              <p className="font-medium text-sm">Working...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <form onSubmit={handleEmailLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email">
                    Email address
                  </Label>
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Sign in with Magic Link
                </Button>
              </form>

              <div className="flex items-center">
                <div className="flex-1 border-t border-border"></div>
                <div className="px-3 text-muted-foreground text-xs font-medium uppercase">OR</div>
                <div className="flex-1 border-t border-border"></div>
              </div>

              <Button 
                variant="outline" 
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
