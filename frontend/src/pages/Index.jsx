
import HeroSection from "/src/components/HeroSection";
import ProblemSection from "/src/components/ProblemSection";
import SolutionSection from "/src/components/SolutionSection";
import FeaturesSection from "/src/components/FeaturesSection";
import WorkflowSection from "/src/components/WorkflowSection";



import Footer from "/src/components/Footer";
import Navbar from "/src/components/Navbar";

const Index = () => {
  return (
    <main className="min-h-screen">
     <Navbar/>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <WorkflowSection />

      
    
      <Footer />
    </main>
  );
};

export default Index;
