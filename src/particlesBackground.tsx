import { useEffect } from 'react';

declare global {
  interface Window {
    particlesJS: {
      load: (id: string, configPath: string, callback?: () => void) => void;
    };
  }
}

const ParticlesBackground = () => {
  useEffect(() => {
    const loadParticles = async () => {
      if (!window.particlesJS) {
        const script = document.createElement('script');
        script.src = '../assets/particles/particles.min.js'; // ✅ No `/public` prefix
        script.onload = () => {
          window.particlesJS.load('particles-js', '../assets/particles/demo/particles.json');

        };
        document.body.appendChild(script);
      } else {
        window.particlesJS.load('particles-js', '../assets/particles/demo/particles.json');

      }
    };

    loadParticles();
  }, []);

  return <div id="particles-js" className="absolute inset-0 z-0" />;
};

export default ParticlesBackground;
