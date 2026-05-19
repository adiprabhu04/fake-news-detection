import HeroSection from '@/components/home/HeroSection'
import BentoGrid from '@/components/home/BentoGrid'
import StatsSection from '@/components/home/StatsSection'
import TechStack from '@/components/home/TechStack'
import CTASection from '@/components/home/CTASection'
import Footer from '@/components/home/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <StatsSection />
      <BentoGrid />
      <TechStack />
      <CTASection />
      <Footer />
    </div>
  )
}
