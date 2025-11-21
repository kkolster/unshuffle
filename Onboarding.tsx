import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Music, Shuffle, CheckCircle, Trophy, ChevronRight, ChevronLeft } from 'lucide-react';
import gsap from 'gsap';
import logo from 'figma:asset/15f22610a9b8fe2b582dce5af8f1c63a73f02093.png';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const logoRef = useRef<HTMLImageElement>(null);

  // GSAP Animation - Music-inspired pulse and wobble
  useEffect(() => {
    if (logoRef.current) {
      // Create a timeline for the logo animation (plays once)
      const tl = gsap.timeline();
      
      tl.to(logoRef.current, {
        scale: 1.1,
        duration: 0.6,
        ease: "power1.inOut",
      })
      .to(logoRef.current, {
        scale: 1,
        duration: 0.6,
        ease: "power1.inOut",
      })
      .to(logoRef.current, {
        scale: 1.05,
        duration: 0.6,
        ease: "power1.inOut",
      })
      .to(logoRef.current, {
        scale: 1,
        duration: 0.6,
        ease: "power1.inOut",
      });

      return () => {
        tl.kill();
      };
    }
  }, []);

  const steps = [
    {
      icon: <Music className="w-16 h-16" style={{ color: '#19a5c9' }} />,
      title: "Welcome to unshuffle!",
      description: "The daily music puzzle game where you guess the correct order of song segments.",
      image: null,
      showLogo: true,
    },
    {
      icon: <Shuffle className="w-16 h-16" style={{ color: '#f16272' }} />,
      title: "How to Play",
      description: "Listen to 8 scrambled segments of a song. Your goal is to figure out the correct order to hear the song as it was meant to be played.",
      image: null,
    },
    {
      icon: <CheckCircle className="w-16 h-16" style={{ color: '#19a5c9' }} />,
      title: "Make Your Guess",
      description: "Click the buttons 1-8 in the order you think is correct. You have 6 attempts to get it right. Green means correct position, yellow means correct number but wrong position.",
      image: null,
    },
    {
      icon: <Trophy className="w-16 h-16" style={{ color: '#f16272' }} />,
      title: "Discover New Music",
      description: "Each day features a new song from emerging artists. Win to unlock the full track and discover amazing new music!",
      image: null,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #1c1634 0%, #15122c 100%)' }}>
      <div className="w-full max-w-md mx-auto">
        <Card className="backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-slate-700/50" style={{ backgroundColor: '#261f44' }}>
          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  backgroundColor: index === currentStep ? '#19a5c9' : 'rgba(255, 255, 255, 0.2)',
                  width: index === currentStep ? '24px' : '8px',
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6 -mt-4">
              {steps[currentStep].showLogo ? (
                <img
                  ref={logoRef}
                  src={logo}
                  alt="unshuffle logo"
                  className="w-24 h-24"
                />
              ) : (
                steps[currentStep].icon
              )}
            </div>
            <h2 className="text-white text-2xl font-[Michroma] mb-4">
              {steps[currentStep].title}
            </h2>
            <p className="text-white/70 font-[Myanmar_Khyay] leading-relaxed">
              {steps[currentStep].description}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-center items-center gap-4">
            <Button
              onClick={handlePrev}
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-0"
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex gap-3 flex-1 max-w-xs">
              {currentStep < steps.length - 1 && (
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-[#15122c] hover:text-[#1c1634] rounded-xl font-[Myanmar_Khyay] cursor-pointer"
                >
                  Skip
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1 text-white rounded-xl hover:opacity-90 font-[Myanmar_Khyay] cursor-pointer"
                style={{ backgroundColor: '#19a5c9' }}
              >
                {currentStep === steps.length - 1 ? "Let's Play!" : "Next"}
                {currentStep < steps.length - 1 && <ChevronRight className="w-5 h-5 ml-2" />}
              </Button>
            </div>

            <div className={currentStep === 0 ? 'w-10' : ''} />
          </div>
        </Card>
      </div>
    </div>
  );
}