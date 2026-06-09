import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const HIMALAYAN_PEAKS = [
  { name: 'Everest', height: '8,848m', color: '#FF9933' },
  { name: 'Annapurna', height: '8,091m', color: '#DC143C' },
  { name: 'Lhotse', height: '8,516m', color: '#4A90D9' },
  { name: 'Makalu', height: '8,485m', color: '#D4A843' },
]

const FEATURES = [
  {
    icon: '🤖',
    title: 'AI-Powered Recommendations',
    desc: 'Content-based filtering with cosine similarity matching your preferences to 27+ destinations',
  },
  {
    icon: '🧗',
    title: 'Smart Itinerary Engine',
    desc: 'Greedy optimization with altitude constraints, acclimatization rules, and budget tracking',
  },
  {
    icon: '🏔️',
    title: 'Difficulty Classification',
    desc: 'Decision tree classifier evaluating altitude, terrain, and ascent rate for accurate grading',
  },
  {
    icon: '💰',
    title: 'Transparent Budgeting',
    desc: 'Real-time cost breakdown with 15% emergency buffer and permit fee calculations',
  },
]

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      <HeroSection isAuthenticated={!!user} />
      <FeaturesSection />
      <SeasonSection />
      <DestinationsPreview />
      <CTASection isAuthenticated={!!user} />
    </div>
  )
}

function HeroSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  const navigate = useNavigate()

  const handleStartPlanning = () => {
    if (isAuthenticated) {
      navigate('/preferences')
    } else {
      navigate('/login?redirect=/preferences')
    }
  }
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/0 via-midnight/60 to-midnight" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-saffron/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-crimson/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="inline-block tag-pill mb-6">🇳🇵 Nepal's #1 AI Travel Planner</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-6xl md:text-8xl font-bold mb-6 leading-tight"
        >
          Discover the
          <br />
          <span className="text-gradient">Himalayas</span>
          <br />
          with AI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg md:text-xl text-stone max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          From Everest Base Camp to the hidden valleys of Dolpo — let our machine-learning engine craft
          your perfect Nepal adventure with personalized itineraries, safety protocols, and real-time budget tracking.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={handleStartPlanning}
            className="btn-primary px-8 py-4 rounded-xl text-lg inline-block cursor-pointer"
          >
            Start Planning 🚀
          </button>
          <Link
            to="/recommendations"
            className="btn-secondary px-8 py-4 rounded-xl text-lg inline-block"
          >
            Explore Destinations
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-16 flex justify-center gap-8"
        >
          {HIMALAYAN_PEAKS.map((peak) => (
            <div key={peak.name} className="text-center">
              <div
                className="text-3xl mb-1"
                style={{ color: peak.color }}
              >
                ▲
              </div>
              <div className="text-sm font-medium text-snow">{peak.name}</div>
              <div className="text-xs text-stone">{peak.height}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.03 }}
        transition={{ duration: 2 }}
        className="absolute bottom-0 left-0 right-0 h-48"
        style={{
          background: 'repeating-linear-gradient(45deg, #fff 0px, #fff 2px, transparent 2px, transparent 4px)',
        }}
      />
    </section>
  )
}

function FeaturesSection() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            How <span className="text-gradient">Nepal Trek AI</span> Works
          </h2>
          <p className="text-stone max-w-2xl mx-auto">
            Four intelligent engines working together to plan your perfect Nepal journey
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card-gradient rounded-2xl p-6 hover:border-saffron/30 transition-all duration-300"
            >
              <span className="text-3xl mb-4 block">{feature.icon}</span>
              <h3 className="text-lg font-semibold mb-2 text-snow">{feature.title}</h3>
              <p className="text-stone text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DestinationsPreview() {
  const clusters = [
    { name: 'High Himalayan Treks', count: '9 treks', color: '#FF9933', desc: 'EBC, Annapurna, Manaslu, Langtang...' },
    { name: 'Cultural Heritage', count: '5 sites', color: '#D4A843', desc: 'Kathmandu, Lumbini, Bhaktapur...' },
    { name: 'Wildlife & Terai', count: '3 parks', color: '#2D8B4B', desc: 'Chitwan, Bardia, Koshi Tappu...' },
    { name: 'Adventure & Mid-Hill', count: '5 hubs', color: '#4A90D9', desc: 'Pokhara, Poon Hill, Sarangkot...' },
    { name: 'Remote Wilderness', count: '5 regions', color: '#DC143C', desc: 'Dolpo, Mustang, Rara, Humla...' },
  ]

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            27+ Destinations Across <span className="text-gradient">5 Clusters</span>
          </h2>
          <p className="text-stone max-w-2xl mx-auto">
            K-Means clustered by altitude, cost, terrain, and activity mix
          </p>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-4">
          {clusters.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card-gradient rounded-xl p-5 text-center hover:scale-105 transition-transform cursor-pointer"
              style={{ borderColor: `${c.color}33`, borderWidth: 1 }}
            >
              <div className="text-2xl font-bold mb-1" style={{ color: c.color }}>
                {c.count}
              </div>
              <div className="text-sm font-semibold mb-1">{c.name}</div>
              <div className="text-xs text-stone">{c.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SeasonSection() {
  const monthNames = ['माघ','फाल्गुण','चैत','बैशाख','जेठ','असार','श्रावण','भदौ','असोज','कार्तिक','मंसिर','पुष']
  const now = new Date()
  const month = monthNames[now.getMonth()]
  const day = now.getDate()

  const seasonData = [
    { name: 'Spring (Mar-जेठ)', months: ['चैत','बैशाख','जेठ'], icon: '🌸', color: '#2D8B4B', rec: ['Everest Base Camp', 'Annapurna Circuit', 'Langtang Valley', 'Pokhara'], desc: 'Rhododendrons in bloom, clear mornings, warm days. Best for high-altitude treks.' },
    { name: 'Summer/Monsoon (Jun-Aug)', months: ['असार','श्रावण','भदौ'], icon: '☔', color: '#4A90D9', rec: ['Upper Mustang', 'Dolpo', 'Nar Phu', 'Kathmandu Valley'], desc: 'Rain shadow treks in Mustang/Dolpo are at their best. Valley culture tours still viable.' },
    { name: 'Autumn (Sep-Nov)', months: ['असोज','कार्तिक','मंसिर'], icon: '🍂', color: '#FF9933', rec: ['Everest Base Camp', 'Annapurna Circuit', 'Manaslu Circuit', 'Chitwan', 'Lumbini'], desc: 'PEAK SEASON — clearest skies, perfect temperatures. All destinations at their best.' },
    { name: 'Winter (Dec-Feb)', months: ['पुष','माघ','फाल्गुण'], icon: '❄️', color: '#D4A843', rec: ['Chitwan', 'Bardia', 'Lumbini', 'Kathmandu Valley', 'Bandipur'], desc: 'Cold but clear. Best for lowland Terai parks and cultural sites. Fewer crowds.' },
  ]

  const current = seasonData.find(s => s.months.includes(month)) || seasonData[2]

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-2">
            <span className="text-gradient">Right Now</span> in Nepal
          </h2>
          <p className="text-stone">It's {month} {day} — {current.name} season</p>
        </motion.div>

        <motion.div
          key={current.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card-gradient rounded-2xl p-8 border text-center max-w-3xl mx-auto"
          style={{ borderColor: `${current.color}44` }}
        >
          <div className="text-5xl mb-4">{current.icon}</div>
          <h3 className="text-2xl font-bold mb-2">{current.name}</h3>
          <p className="text-stone mb-6 max-w-xl mx-auto">{current.desc}</p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {current.rec.map((r) => (
              <span key={r} className="tag-pill">{r}</span>
            ))}
          </div>
          <Link to="/destinations" className="btn-secondary px-6 py-3 rounded-xl text-sm inline-block">
            Browse All 27 Destinations →
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function CTASection({ isAuthenticated }: { isAuthenticated: boolean }) {
  const navigate = useNavigate()

  const handleJourney = () => {
    if (isAuthenticated) {
      navigate('/preferences')
    } else {
      navigate('/login?redirect=/preferences')
    }
  }

  return (
    <section className="py-24 relative">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="card-gradient rounded-3xl p-12 neon-border glow"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready for the <span className="text-gradient">Adventure</span> of a Lifetime?
          </h2>
          <p className="text-stone mb-8 max-w-xl mx-auto">
            Answer a few quick questions and let AI build your personalized Nepal itinerary —
            complete with safety protocols, budget tracking, and day-by-day scheduling.
          </p>
          <button
            onClick={handleJourney}
            className="btn-primary px-10 py-4 rounded-xl text-lg inline-block cursor-pointer"
          >
            Start Your Journey 🏔️
          </button>
        </motion.div>
      </div>
    </section>
  )
}
