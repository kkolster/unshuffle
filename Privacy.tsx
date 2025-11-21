import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import unshuffleLogo from 'figma:asset/b19ac2d27cc741fba24aac501f060ebe6f82b5db.png';

interface PrivacyProps {
  onBack: () => void;
}

export function Privacy({ onBack }: PrivacyProps) {
  const handleBack = () => {
    // Update URL when going back
    window.history.pushState({}, '', '/');
    onBack();
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #1c1634 0%, #15122c 100%)' }}>
      <div className="w-full max-w-2xl mx-auto">
        <div className="backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-slate-700/50" style={{ backgroundColor: '#261f44' }}>
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="sm"
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <img 
              src={unshuffleLogo}
              alt="unshuffle logo"
              className="h-8 w-auto object-contain"
            />
            <div className="w-9" /> {/* Spacer for centering */}
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-white text-2xl font-[Michroma] mb-2">Privacy Policy</h1>
            <p className="text-white/60 text-sm font-[Myanmar_Khyay]">Last updated: November 18, 2024</p>
          </div>

          {/* Content */}
          <div className="space-y-6 text-white/80 font-[Myanmar_Khyay]">
            
            <section className="bg-white/5 rounded-2xl p-6">
              <h2 className="text-white font-[Michroma] text-lg mb-3">Introduction</h2>
              <p className="text-sm leading-relaxed">
                Welcome to unshuffle. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy explains how we collect, use, and safeguard your information when you use our music guessing game.
              </p>
            </section>

            <section className="bg-white/5 rounded-2xl p-6">
              <h2 className="text-white font-[Michroma] text-lg mb-3">Information We Collect</h2>
              <div className="text-sm leading-relaxed space-y-2">
                <p><strong className="text-white">Account Information:</strong> When you sign up, we collect your email address and name (if you sign up via Google, we receive this from Google).</p>
                <p><strong className="text-white">Game Data:</strong> We collect information about your gameplay, including scores, attempts, and completion times to provide leaderboards and track your progress.</p>
                <p><strong className="text-white">Usage Data:</strong> We may collect information about how you interact with our app to improve the user experience.</p>
              </div>
            </section>

            <section className="bg-white/5 rounded-2xl p-6">
              <h2 className="text-white font-[Michroma] text-lg mb-3">How We Use Your Information</h2>
              <div className="text-sm leading-relaxed space-y-2">
                <p>We use your information to:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Provide and maintain our service</li>
                  <li>Track your game progress and statistics</li>
                  <li>Display leaderboards and rankings</li>
                  <li>Send you promotional content about new artists and songs (with your consent)</li>
                  <li>Improve our app and user experience</li>
                </ul>
              </div>
            </section>

            <section className="bg-white/5 rounded-2xl p-6">
              <h2 className="text-white font-[Michroma] text-lg mb-3">Data Storage and Security</h2>
              <p className="text-sm leading-relaxed">
                Your data is stored securely using Supabase, a trusted backend service. We implement appropriate security measures 
                to protect your personal information from unauthorized access, alteration, or disclosure.
              </p>
            </section>

            <section className="bg-white/5 rounded-2xl p-6">
              <h2 className="text-white font-[Michroma] text-lg mb-3">Third-Party Services</h2>
              <div className="text-sm leading-relaxed space-y-2">
                <p>We use third-party services for authentication and data storage:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong className="text-white">Google OAuth:</strong> For secure sign-in (subject to Google's Privacy Policy)</li>
                  <li><strong className="text-white">Supabase:</strong> For database and authentication services</li>
                </ul>
              </div>
            </section>

            <section className="bg-white/5 rounded-2xl p-6">
              <h2 className="text-white font-[Michroma] text-lg mb-3">Your Rights</h2>
              <div className="text-sm leading-relaxed space-y-2">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Access your personal data</li>
                  <li>Request correction of your data</li>
                  <li>Request deletion of your account and data</li>
                  <li>Opt out of promotional emails</li>
                </ul>
              </div>
            </section>

            <section className="bg-white/5 rounded-2xl p-6">
              <h2 className="text-white font-[Michroma] text-lg mb-3">Marketing Communications</h2>
              <p className="text-sm leading-relaxed">
                By creating an account, you agree to receive promotional content about new artists and songs featured in unshuffle. 
                You can unsubscribe from these communications at any time by clicking the unsubscribe link in our emails.
              </p>
            </section>

            <section className="bg-white/5 rounded-2xl p-6">
              <h2 className="text-white font-[Michroma] text-lg mb-3">Children's Privacy</h2>
              <p className="text-sm leading-relaxed">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information 
                from children under 13. If you believe we have collected information from a child under 13, please contact us.
              </p>
            </section>

            <section className="bg-white/5 rounded-2xl p-6">
              <h2 className="text-white font-[Michroma] text-lg mb-3">Changes to This Policy</h2>
              <p className="text-sm leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new 
                privacy policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="bg-white/5 rounded-2xl p-6">
              <h2 className="text-white font-[Michroma] text-lg mb-3">Contact Us</h2>
              <p className="text-sm leading-relaxed">
                If you have any questions about this privacy policy or our data practices, please contact us through the app 
                or reach out to our support team.
              </p>
            </section>

          </div>

          {/* Footer Button */}
          <div className="mt-8">
            <Button
              onClick={handleBack}
              className="w-full bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-[#15122c] hover:text-[#1c1634] backdrop-blur-sm rounded-xl font-[Myanmar_Khyay] cursor-pointer"
            >
              Back to App
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
