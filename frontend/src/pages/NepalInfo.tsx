import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

type Tab = 'weather' | 'visa' | 'festivals' | 'emergency' | 'tips'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'weather', label: 'Weather & Seasons', icon: '🌤️' },
  { id: 'visa', label: 'Visa & Entry', icon: '🛂' },
  { id: 'festivals', label: 'Festival Calendar', icon: '🎉' },
  { id: 'emergency', label: 'Emergency Contacts', icon: '🚨' },
  { id: 'tips', label: 'Travel Tips', icon: '💡' },
]

const MONTHLY_WEATHER = [
  { month: 'माघ', ktm: 10, pokhara: 11, chitwan: 18, trek: -5, rain: 15, desc: 'Cold, clear skies. Best for lower elevation treks.' },
  { month: 'फाल्गुण', ktm: 12, pokhara: 14, chitwan: 22, trek: -3, rain: 20, desc: 'Still cold. Increasing warmth. Snow on high passes.' },
  { month: 'चैत', ktm: 16, pokhara: 18, chitwan: 27, trek: 2, rain: 30, desc: 'Spring begins. Rhododendrons bloom. Great for trekking.' },
  { month: 'बैशाख', ktm: 20, pokhara: 22, chitwan: 30, trek: 7, rain: 55, desc: 'Warm. Best month for high altitude. Clear mornings.' },
  { month: 'जेठ', ktm: 23, pokhara: 25, chitwan: 32, trek: 10, rain: 120, desc: 'Pre-monsoon. Afternoon clouds. OK for rain shadow areas.' },
  { month: 'असार', ktm: 24, pokhara: 26, chitwan: 31, trek: 12, rain: 250, desc: 'Monsoon starts. Avoid trekking. Mustang/Dolpo still viable.' },
  { month: 'श्रावण', ktm: 24, pokhara: 26, chitwan: 30, trek: 12, rain: 360, desc: 'Peak monsoon. Upper Mustang, Dolpo, and Nar Phu best.' },
  { month: 'भदौ', ktm: 24, pokhara: 25, chitwan: 30, trek: 11, rain: 310, desc: 'Monsoon continues. Rain shadow treks still possible.' },
  { month: 'असोज', ktm: 22, pokhara: 23, chitwan: 29, trek: 8, rain: 140, desc: 'Monsoon ends. Trails clearing. Perfect trekking month.' },
  { month: 'कार्तिक', ktm: 19, pokhara: 20, chitwan: 27, trek: 4, rain: 40, desc: 'PEAK SEASON. Clearest skies. Book teahouses in advance.' },
  { month: 'मंसिर', ktm: 14, pokhara: 16, chitwan: 24, trek: 0, rain: 10, desc: 'Post-season. Still excellent. Fewer crowds. Cooler nights.' },
  { month: 'पुष', ktm: 11, pokhara: 12, chitwan: 20, trek: -4, rain: 5, desc: 'Winter. Cold but clear. Good for lower treks and Chitwan.' },
]

const VISA_INFO = {
  tourist: [
    { duration: '15 days', feeUSD: 30, feeNPR: 4065 },
    { duration: '30 days', feeUSD: 50, feeNPR: 6775 },
    { duration: '90 days', feeUSD: 125, feeNPR: 16940 },
  ],
  requirements: [
    'Passport valid for at least 6 months from arrival date',
    'One passport-size photo (2×2 inch, white background)',
    'Completed arrival form (provided on flight or at counter)',
    'Proof of accommodation (hotel booking or trekking permit)',
    'Return flight ticket',
  ],
  tips: [
    'Visa on arrival is available for most nationalities at Kathmandu airport and land borders',
    'Pay in USD, EUR, GBP, or NPR — cash only (ATM available after visa)',
    'Indian nationals: No visa required but need valid ID (passport or voter card)',
    'Chinese nationals: Free visa on arrival',
    'SAARC nationals: Free visa on arrival (30 days)',
  ],
}

const FESTIVALS = [
  { name: 'Dashain', dates: 'असोज-कार्तिक (15 days)', desc: 'Nepal\'s biggest festival. Family reunions, blessings from elders, kite flying, and massive swings.', type: 'National' },
  { name: 'Tihar', dates: 'कार्तिक-मंसिर (5 days)', desc: 'Festival of lights. Worship crows, dogs, cows, and Laxmi (goddess of wealth). Beautiful oil lamps everywhere.', type: 'National' },
  { name: 'Holi', dates: 'चैत', desc: 'Festival of colors. Play with colored powder and water. Celebrated with great enthusiasm in Kathmandu and Pokhara.', type: 'National' },
  { name: 'Buddha Jayanti', dates: 'बैशाख-जेठ', desc: 'Birth of Lord Buddha. Major celebrations at Lumbini, Swayambhunath, and Boudhanath.', type: 'Religious' },
  { name: 'Indra Jatra', dates: 'असोज', desc: 'Kathmandu\'s biggest street festival. Chariot processions, masked dances, and the living goddess Kumari.', type: 'Local (KTM)' },
  { name: 'Tiji Festival', dates: 'जेठ', desc: 'Three-day Tibetan Buddhist festival in Lo Manthang, Upper Mustang. Chasing demons away.', type: 'Local (Mustang)' },
  { name: 'Mani Rimdu', dates: 'कार्तिक-मंसिर', desc: 'Sherpa Buddhist festival at Tengboche Monastery (Everest region). Masked dances and blessings.', type: 'Local (Khumbu)' },
  { name: 'Losar', dates: 'फाल्गुण-चैत', desc: 'Tibetan New Year. Celebrated in Mustang, Dolpo, and Himalayan Buddhist communities.', type: 'Cultural' },
  { name: 'Gai Jatra', dates: 'भदौ', desc: 'Cow festival. Parades, comedy, and satire in the streets of Kathmandu Valley.', type: 'Local' },
  { name: 'Chhath', dates: 'कार्तिक-मंसिर', desc: 'Sun worship festival. Celebrated primarily in the Terai region near rivers and ponds.', type: 'Regional' },
]

const EMERGENCY_CONTACTS = [
  { category: 'Police', numbers: ['100', '9851137034 (Tourist Police)'], note: 'Tourist Police in Thamel, Kathmandu' },
  { category: 'Ambulance', numbers: ['102', '1144'], note: 'Private ambulance services also available' },
  { category: 'Fire', numbers: ['101'], note: 'Limited coverage outside Kathmandu Valley' },
  { category: 'Tourist Helpline', numbers: ['1144'], note: '24/7 multi-lingual support' },
  { category: 'Mountain Rescue', numbers: ['+977-1-4700754'], note: 'Civil Aviation Authority — helicopter coordination' },
  { category: 'Himalayan Rescue', numbers: ['+977-9851161121'], note: 'HRA — AMS and trekking emergencies' },
  { category: 'Kathmandu Hospitals', numbers: ['Mediciti: +977-1-5970001', 'Norvic: +977-1-4254831', 'Teaching: +977-1-4412303'], note: '24/7 emergency services' },
  { category: 'Embassies', numbers: ['US: +977-1-4234000', 'UK: +977-1-4237100', 'India: +977-1-4410900', 'China: +977-1-4440615'], note: 'Contact your embassy for lost passport or emergency' },
]

const TRAVEL_TIPS = [
  { icon: '💰', title: 'Money Matters', tips: ['ATMs widely available in Kathmandu, Pokhara, and major towns', 'Carry cash (NPR) for trekking — no ATMs above 3,000m', 'Exchange rate: ~135 NPR = 1 USD (check current rate)', 'Credit cards accepted in hotels and restaurants only'] },
  { icon: '📱', title: 'Connectivity', tips: ['Buy NTC or Ncell SIM at airport (NPR 500-1,000 with data)', 'Mobile data works in most towns. Limited above 3,500m', 'WiFi available in most teahouses (NPR 100-300 per night)', 'Download offline maps (Maps.me) before trekking'] },
  { icon: '🍜', title: 'Food & Water', tips: ['Dal Bhat (lentil soup + rice) is the national meal — all-you-can-eat on treks', 'Drink only bottled or purified water (NPR 20-100 per liter)', 'Avoid raw salads and unpeeled fruits outside cities', 'Carry water purification tablets for trekking'] },
  { icon: '🧥', title: 'Dress Code', tips: ['Dress modestly at temples — cover shoulders and knees', 'Remove shoes before entering temples and homes', 'Layering is key for trekking: base + fleece + shell', 'Down jacket essential for any trek above 3,000m'] },
  { icon: '🏛️', title: 'Cultural Etiquette', tips: ['Always ask permission before photographing people', 'Use right hand for giving/receiving (left hand is impure)', 'Do not point your feet at people or religious objects', 'Walk clockwise around stupas and prayer wheels', 'Shoes off before entering any gompa (monastery)'] },
  { icon: '🌱', title: 'Responsible Travel', tips: ['Carry reusable water bottle — stop buying plastic', 'Support local teahouses and Nepali-owned businesses', 'Pay porters fairly (min Rs 2,430/day) — their welfare matters', 'Pack out all non-biodegradable waste', 'Use eco-friendly toiletries to protect mountain waters'] },
]

export default function NepalInfo() {
  const [tab, setTab] = useState<Tab>('weather')

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gradient">Nepal</span> Travel Guide
          </h1>
          <p className="text-stone">Everything you need to know about traveling in Nepal</p>
        </motion.div>

        {/* Tab bar */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all ${
                tab === t.id
                  ? 'bg-saffron/10 text-saffron border border-saffron/30'
                  : 'bg-white/5 text-stone border border-white/10 hover:border-white/30'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <AnimateSection tabKey={tab}>
          {tab === 'weather' && <WeatherTab />}
          {tab === 'visa' && <VisaTab />}
          {tab === 'festivals' && <FestivalsTab />}
          {tab === 'emergency' && <EmergencyTab />}
          {tab === 'tips' && <TipsTab />}
        </AnimateSection>

        <div className="mt-12 text-center">
          <Link to="/preferences" className="btn-primary px-8 py-3.5 rounded-xl inline-block">
            Start Planning Your Trip 🏔️
          </Link>
        </div>
      </div>
    </div>
  )
}

function AnimateSection({ children, tabKey }: { children: React.ReactNode; tabKey: string }) {
  return (
    <motion.div
      key={tabKey}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

function WeatherTab() {
  const [highlight, setHighlight] = useState<string | null>(null)
  return (
    <div>
      <div className="card-gradient rounded-xl p-6 border border-white/10 mb-6">
        <h2 className="text-lg font-semibold mb-2">Nepal Weather by Month</h2>
        <p className="text-sm text-stone mb-4">Average temperatures (°C) and rainfall for key destinations. Click a row for details.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm">
            <thead>
              <tr className="border-b border-white/10 text-stone">
                <th className="py-2 pr-3 text-left font-medium">Month</th>
                <th className="py-2 px-2 text-center font-medium">Kathmandu</th>
                <th className="py-2 px-2 text-center font-medium">Pokhara</th>
                <th className="py-2 px-2 text-center font-medium">Chitwan</th>
                <th className="py-2 px-2 text-center font-medium">High Altitude</th>
                <th className="py-2 px-2 text-center font-medium">Rain (mm)</th>
              </tr>
            </thead>
            <tbody>
              {MONTHLY_WEATHER.map((m, i) => {
                const isPeak = m.month === 'कार्तिक' || m.month === 'मंसिर'
                const isMonsoon = m.rain > 200
                return (
                  <tr
                    key={m.month}
                    onClick={() => setHighlight(highlight === m.month ? null : m.month)}
                    className={`border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5 ${
                      highlight === m.month ? 'bg-saffron/5' : ''
                    } ${isPeak ? 'bg-tea/5' : ''} ${isMonsoon ? 'bg-crimson/5' : ''}`}
                  >
                    <td className="py-2 pr-3 font-medium text-snow">{m.month}</td>
                    <td className="py-2 px-2 text-center">{m.ktm}°</td>
                    <td className="py-2 px-2 text-center">{m.pokhara}°</td>
                    <td className="py-2 px-2 text-center">{m.chitwan}°</td>
                    <td className="py-2 px-2 text-center">{m.trek}°</td>
                    <td className="py-2 px-2 text-center">{m.rain}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {highlight && (() => {
          const m = MONTHLY_WEATHER.find(x => x.month === highlight)!
          return (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <p className="text-sm text-snow">{m.desc}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {m.month === 'कार्तिक' || m.month === 'मंसिर' ? <span className="tag-pill text-[10px] bg-tea/20 text-tea">Peak Season</span> : null}
                {m.rain > 200 ? <span className="tag-pill text-[10px] bg-crimson/20 text-crimson">Monsoon</span> : null}
                {m.month === 'चैत' || m.month === 'बैशाख' ? <span className="tag-pill text-[10px]">Spring Trekking</span> : null}
                {m.month === 'पुष' || m.month === 'माघ' || m.month === 'फाल्गुण' ? <span className="tag-pill text-[10px]">Winter</span> : null}
              </div>
            </motion.div>
          )
        })()}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card-gradient rounded-xl p-5 border border-white/10">
          <h3 className="text-sm font-semibold text-saffron mb-3 uppercase tracking-wider">Best Times by Region</h3>
          <ul className="space-y-2 text-sm text-stone">
            <li className="flex items-start gap-2"><span className="text-tea shrink-0">•</span> <span><strong className="text-snow">High Himalaya:</strong> Mar-जेठ, Sep-Nov</span></li>
            <li className="flex items-start gap-2"><span className="text-tea shrink-0">•</span> <span><strong className="text-snow">Kathmandu Valley:</strong> Year-round (Oct-Mar best)</span></li>
            <li className="flex items-start gap-2"><span className="text-tea shrink-0">•</span> <span><strong className="text-snow">Chitwan/Bardia:</strong> Oct-Mar (dry, animals visible)</span></li>
            <li className="flex items-start gap-2"><span className="text-tea shrink-0">•</span> <span><strong className="text-snow">Upper Mustang/Dolpo:</strong> Jun-Sep (rain shadow)</span></li>
            <li className="flex items-start gap-2"><span className="text-tea shrink-0">•</span> <span><strong className="text-snow">Lumbini:</strong> Oct-Mar (avoid summer heat)</span></li>
          </ul>
        </div>

        <div className="card-gradient rounded-xl p-5 border border-white/10">
          <h3 className="text-sm font-semibold text-saffron mb-3 uppercase tracking-wider">Legend</h3>
          <div className="space-y-2 text-sm text-stone">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-tea/40" /> <span>Peak Season</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-crimson/40" /> <span>Monsoon</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-saffron/40" /> <span>Shoulder Season</span></div>
            <p className="text-xs text-stone mt-3">Temperatures are averages. High altitude temps are at ~4,000m. Actual conditions vary by specific trail and elevation.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function VisaTab() {
  return (
    <div className="space-y-6">
      <div className="card-gradient rounded-xl p-6 border border-white/10">
        <h2 className="text-lg font-semibold mb-1">Nepal Tourist Visa</h2>
        <p className="text-sm text-stone mb-4">Visa on arrival available for most nationalities at Tribhuvan International Airport and land border crossings.</p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-stone">
                <th className="py-2 text-left font-medium">Duration</th>
                <th className="py-2 text-right font-medium">Fee (Rs)</th>
              </tr>
            </thead>
            <tbody>
              {VISA_INFO.tourist.map((v) => (
                <tr key={v.duration} className="border-b border-white/5">
                  <td className="py-2 text-snow">{v.duration}</td>
                  <td className="py-2 text-right text-snow">Rs {v.feeNPR.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="text-sm font-semibold text-saffron uppercase tracking-wider mb-2">Requirements</h3>
        <ul className="space-y-1 mb-4">
          {VISA_INFO.requirements.map((r, i) => (
            <li key={i} className="text-sm text-stone flex items-start gap-2">
              <span className="text-saffron shrink-0">•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card-gradient rounded-xl p-5 border border-white/10">
        <h3 className="text-sm font-semibold text-saffron uppercase tracking-wider mb-3">Important Notes</h3>
        <ul className="space-y-2">
          {VISA_INFO.tips.map((t, i) => (
            <li key={i} className="text-sm text-stone flex items-start gap-2">
              <span className="text-saffron shrink-0">💡</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function FestivalsTab() {
  return (
    <div className="card-gradient rounded-xl border border-white/10 overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-1">Nepal Festival Calendar</h2>
        <p className="text-sm text-stone mb-4">Nepal follows the Bikram Sambat calendar. Dates vary slightly each year.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-white/10 bg-white/5 text-stone">
              <th className="py-3 px-4 text-left font-medium">Festival</th>
              <th className="py-3 px-4 text-left font-medium">When</th>
              <th className="py-3 px-4 text-left font-medium">Type</th>
              <th className="py-3 px-4 text-left font-medium hidden md:table-cell">Description</th>
            </tr>
          </thead>
          <tbody>
            {FESTIVALS.map((f, i) => (
              <tr key={f.name} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-3 px-4 text-snow font-medium">{f.name}</td>
                <td className="py-3 px-4 text-stone text-xs">{f.dates}</td>
                <td className="py-3 px-4">
                  <span className={`tag-pill text-[10px] ${
                    f.type === 'National' ? 'bg-tea/20 text-tea border-tea/30' :
                    f.type.includes('Local') ? 'bg-saffron/20 text-saffron border-saffron/30' :
                    'bg-amber/20 text-amber border-amber/30'
                  }`}>{f.type}</span>
                </td>
                <td className="py-3 px-4 text-stone text-xs hidden md:table-cell">{f.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function EmergencyTab() {
  return (
    <div className="space-y-6">
      <div className="card-gradient rounded-xl p-6 border border-crimson/30">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🚨</span>
          <div>
            <h2 className="text-lg font-semibold">Emergency Contacts</h2>
            <p className="text-sm text-stone">Save these numbers. Download offline maps before your trek.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {EMERGENCY_CONTACTS.map((ec) => (
            <div key={ec.category} className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs text-saffron uppercase tracking-wider mb-1 font-semibold">{ec.category}</div>
              {ec.numbers.map((n, i) => (
                <div key={i} className="text-sm text-snow font-mono">{n}</div>
              ))}
              <div className="text-xs text-stone mt-1">{ec.note}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-gradient rounded-xl p-6 border border-white/10">
        <h3 className="text-sm font-semibold text-saffron uppercase tracking-wider mb-3">Printable Emergency Card</h3>
        <p className="text-sm text-stone mb-4">Print this card and keep it with your passport while trekking.</p>
        <div className="p-6 rounded-xl bg-white/5 border-2 border-dashed border-white/20 max-w-md print-card">
          <div className="text-center mb-3">
            <div className="text-xl font-bold text-saffron">🏔️ Nepal Trek AI</div>
            <div className="text-xs text-stone">EMERGENCY CONTACT CARD</div>
          </div>
          <div className="space-y-1 text-xs">
            <div><span className="text-stone">Police:</span> <span className="text-snow font-mono">100</span></div>
            <div><span className="text-stone">Ambulance:</span> <span className="text-snow font-mono">102</span></div>
            <div><span className="text-stone">Tourist Helpline:</span> <span className="text-snow font-mono">1144</span></div>
            <div><span className="text-stone">Mountain Rescue:</span> <span className="text-snow font-mono">+977-1-4700754</span></div>
            <div className="border-t border-white/10 pt-1 mt-1">
              <div><span className="text-stone">Your Name:</span> <span className="text-snow">________________</span></div>
              <div><span className="text-stone">Emergency Contact:</span> <span className="text-snow">________________</span></div>
              <div><span className="text-stone">Travel Insurance:</span> <span className="text-snow">________________</span></div>
              <div><span className="text-stone">Policy #:</span> <span className="text-snow">________________</span></div>
            </div>
          </div>
          <div className="mt-3 text-[8px] text-center text-stone">Keep this card with your passport at all times.</div>
        </div>
        <button
          onClick={() => { window.print(); toast.success('Print dialog opened') }}
          className="btn-secondary px-6 py-2.5 rounded-xl text-sm mt-4"
        >
          🖨️ Print Card
        </button>
      </div>
    </div>
  )
}

function TipsTab() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {TRAVEL_TIPS.map((section) => (
        <div key={section.title} className="card-gradient rounded-xl p-5 border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{section.icon}</span>
            <h3 className="font-semibold text-snow">{section.title}</h3>
          </div>
          <ul className="space-y-2">
            {section.tips.map((tip, i) => (
              <li key={i} className="text-xs text-stone flex items-start gap-2">
                <span className="text-saffron shrink-0 mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
