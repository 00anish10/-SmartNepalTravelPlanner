import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

interface GearItem {
  id: string
  category: string
  name: string
  essential: boolean
  buyNPR: number
  rentPerDayNPR: number
  weightG: number
  tip: string
  shop?: string
}

const GEAR_ITEMS: GearItem[] = [
  // Clothing
  { id: 'base-layer-top', category: 'Clothing', name: 'Merino base layer top', essential: true, buyNPR: 4500, rentPerDayNPR: 0, weightG: 200, tip: '2 pairs recommended — wash one, wear one', shop: 'North Face Thamel' },
  { id: 'base-layer-bottom', category: 'Clothing', name: 'Merino base layer bottom', essential: true, buyNPR: 4000, rentPerDayNPR: 0, weightG: 220, tip: 'Great for sleeping too', shop: 'Decathlon Pokhara' },
  { id: 'fleece', category: 'Clothing', name: 'Fleece jacket (mid-layer)', essential: true, buyNPR: 3500, rentPerDayNPR: 150, weightG: 350, tip: 'Grid fleece is best — warm + breathable', shop: "Shona’s Thamel" },
  { id: 'down-jacket', category: 'Clothing', name: 'Down jacket (warm layer)', essential: true, buyNPR: 12000, rentPerDayNPR: 500, weightG: 500, tip: '800-fill power recommended. Rent for ~$4/day', shop: 'Kailash Gear Thamel' },
  { id: 'hardshell', category: 'Clothing', name: 'Waterproof hardshell jacket', essential: true, buyNPR: 8000, rentPerDayNPR: 400, weightG: 400, tip: 'Must have Gore-Tex or equivalent for snow/rain', shop: 'North Face Thamel' },
  { id: 'hardshell-pants', category: 'Clothing', name: 'Waterproof pants', essential: true, buyNPR: 5000, rentPerDayNPR: 250, weightG: 350, tip: 'Side zip is useful for putting on over boots', shop: 'Decathlon Pokhara' },
  { id: 'trekking-pants', category: 'Clothing', name: 'Trekking pants (2 pairs)', essential: true, buyNPR: 4000, rentPerDayNPR: 100, weightG: 400, tip: 'Convertible zip-off pants are popular', shop: "Shona’s Thamel" },
  { id: 'sun-hat', category: 'Clothing', name: 'Sun hat / baseball cap', essential: true, buyNPR: 500, rentPerDayNPR: 0, weightG: 60, tip: 'Intense UV at altitude — do not skip', shop: 'Any Thamel shop' },
  { id: 'winter-hat', category: 'Clothing', name: 'Warm beanie / fleece hat', essential: true, buyNPR: 400, rentPerDayNPR: 0, weightG: 60, tip: 'Must cover ears', shop: 'Any Thamel shop' },
  { id: 'gloves', category: 'Clothing', name: 'Warm gloves + liner gloves', essential: true, buyNPR: 1500, rentPerDayNPR: 100, weightG: 150, tip: 'Waterproof mittens for snow sections', shop: 'Kailash Gear Thamel' },
  { id: 'neck-gaiter', category: 'Clothing', name: 'Neck gaiter / buff', essential: true, buyNPR: 400, rentPerDayNPR: 0, weightG: 30, tip: 'Also useful as face mask in dust', shop: 'Any Thamel shop' },
  { id: 'underwear', category: 'Clothing', name: 'Underwear (3-4 pairs)', essential: true, buyNPR: 2000, rentPerDayNPR: 0, weightG: 140, tip: 'Merino or synthetic — no cotton', shop: 'Decathlon Pokhara' },
  { id: 'trekking-socks', category: 'Clothing', name: 'Trekking socks (3 pairs)', essential: true, buyNPR: 3000, rentPerDayNPR: 0, weightG: 240, tip: 'Merino wool. One pair for sleeping, two for hiking', shop: "Shona’s Thamel" },

  // Footwear
  { id: 'boots', category: 'Footwear', name: 'Waterproof trekking boots', essential: true, buyNPR: 12000, rentPerDayNPR: 600, weightG: 1100, tip: 'Break in before trip. Ankle support is critical', shop: 'North Face Thamel' },
  { id: 'camp-shoes', category: 'Footwear', name: 'Camp shoes / sandals', essential: false, buyNPR: 1500, rentPerDayNPR: 0, weightG: 300, tip: 'Teahouses require removing boots indoors', shop: 'Any Thamel shop' },
  { id: 'gaiters', category: 'Footwear', name: 'Gaiters', essential: false, buyNPR: 2000, rentPerDayNPR: 100, weightG: 200, tip: 'Essential for snow, useful for scree', shop: 'Kailash Gear Thamel' },
  { id: 'crampons', category: 'Footwear', name: 'Microspikes / crampons', essential: false, buyNPR: 4000, rentPerDayNPR: 300, weightG: 400, tip: 'Essential Dec-May for high passes. Rent in Lukla', shop: 'Rent in Lukla' },
  { id: 'trekking-poles', category: 'Footwear', name: 'Trekking poles (pair)', essential: false, buyNPR: 3000, rentPerDayNPR: 200, weightG: 500, tip: 'Reduce knee strain by 40%. Carbon fiber is lighter', shop: "Shona’s Thamel" },

  // Backpack & Storage
  { id: 'backpack', category: 'Backpack', name: 'Backpack 40-60L', essential: true, buyNPR: 10000, rentPerDayNPR: 400, weightG: 1500, tip: '50-60L for teahouse treks, 40L if using porter', shop: 'North Face Thamel' },
  { id: 'daypack', category: 'Backpack', name: 'Daypack 20-30L', essential: true, buyNPR: 4000, rentPerDayNPR: 0, weightG: 400, tip: 'For summit pushes and side hikes while porter carries main bag', shop: 'Decathlon Pokhara' },
  { id: 'dry-bags', category: 'Backpack', name: 'Dry bags / pack liners (3)', essential: true, buyNPR: 1500, rentPerDayNPR: 0, weightG: 150, tip: 'Heavy-duty garbage bag works as budget pack liner', shop: 'Any Thamel shop' },
  { id: 'pack-cover', category: 'Backpack', name: 'Rain cover for backpack', essential: true, buyNPR: 800, rentPerDayNPR: 0, weightG: 100, tip: 'Essential for monsoon treks', shop: 'Any Thamel shop' },

  // Sleeping
  { id: 'sleeping-bag', category: 'Sleeping', name: 'Sleeping bag (-10°C to -20°C)', essential: true, buyNPR: 15000, rentPerDayNPR: 500, weightG: 1500, tip: 'Rent in Kathmandu (~$4/day). Down is warmer/lighter', shop: 'Kailash Gear Thamel' },
  { id: 'sleeping-liner', category: 'Sleeping', name: 'Sleeping bag liner (silk/cotton)', essential: false, buyNPR: 1500, rentPerDayNPR: 0, weightG: 150, tip: 'Adds 5-10°C warmth. Keeps rented bag clean', shop: "Shona’s Thamel" },
  { id: 'earplugs', category: 'Sleeping', name: 'Earplugs + eye mask', essential: false, buyNPR: 300, rentPerDayNPR: 0, weightG: 20, tip: 'Teahouse walls are thin. Snorers are common', shop: 'Any pharmacy' },
  { id: 'inflatable-pillow', category: 'Sleeping', name: 'Inflatable pillow', essential: false, buyNPR: 800, rentPerDayNPR: 0, weightG: 80, tip: 'Much better than using clothes bundle', shop: 'Decathlon Pokhara' },

  // Tech & Navigation
  { id: 'headlamp', category: 'Tech & Navigation', name: 'Headlamp + extra batteries', essential: true, buyNPR: 2500, rentPerDayNPR: 100, weightG: 100, tip: 'Essential for early starts and bathroom visits at night', shop: "Shona’s Thamel" },
  { id: 'powerbank', category: 'Tech & Navigation', name: 'Power bank 20000mAh', essential: true, buyNPR: 3500, rentPerDayNPR: 0, weightG: 350, tip: 'Teahouse charging costs NPR 300-500 per hour', shop: 'Any electronics shop' },
  { id: 'map', category: 'Tech & Navigation', name: 'Trail map + guidebook', essential: true, buyNPR: 1500, rentPerDayNPR: 0, weightG: 150, tip: 'Maps.me offline maps on phone + paper backup', shop: 'Maps available Thamel' },
  { id: 'compass-gps', category: 'Tech & Navigation', name: 'GPS device / compass', essential: false, buyNPR: 25000, rentPerDayNPR: 500, weightG: 200, tip: 'Garmin inReach for remote treks. Rent in Kathmandu', shop: 'Kailash Gear Thamel' },
  { id: 'satellite-phone', category: 'Tech & Navigation', name: 'Satellite phone (remote treks)', essential: false, buyNPR: 60000, rentPerDayNPR: 1000, weightG: 300, tip: 'Required for Upper Mustang, Dolpo, Kanchenjunga', shop: 'Rent in Kathmandu' },

  // Health & Safety
  { id: 'first-aid', category: 'Health & Safety', name: 'Personal first aid kit', essential: true, buyNPR: 1500, rentPerDayNPR: 0, weightG: 200, tip: 'Include diamox for AMS, ibuprofen, imodium, antiseptic', shop: 'Any pharmacy' },
  { id: 'water-purification', category: 'Health & Safety', name: 'Water purification (tablets/filter)', essential: true, buyNPR: 1200, rentPerDayNPR: 0, weightG: 50, tip: 'Aquatabs or Steripen. Saves buying plastic bottles', shop: "Shona’s Thamel" },
  { id: 'water-bottle', category: 'Health & Safety', name: 'Water bottle + thermos (1-2L)', essential: true, buyNPR: 2000, rentPerDayNPR: 0, weightG: 300, tip: 'Nalgene or insulated. Hot water at teahouses', shop: 'Decathlon Pokhara' },
  { id: 'sunscreen', category: 'Health & Safety', name: 'Sunscreen SPF 50+', essential: true, buyNPR: 800, rentPerDayNPR: 0, weightG: 50, tip: 'UV is extreme at altitude. Reapply every 2 hours', shop: 'Any pharmacy' },
  { id: 'lip-balm', category: 'Health & Safety', name: 'Lip balm with SPF', essential: true, buyNPR: 300, rentPerDayNPR: 0, weightG: 10, tip: 'Chapped lips are guaranteed without it', shop: 'Any pharmacy' },
  { id: 'sunglasses', category: 'Health & Safety', name: 'Sunglasses (UV400 / glacier)', essential: true, buyNPR: 3000, rentPerDayNPR: 0, weightG: 60, tip: 'Must have side protection for snow. Snow blindness is real', shop: "Shona’s Thamel" },
  { id: 'hand-sanitizer', category: 'Health & Safety', name: 'Hand sanitizer + wet wipes', essential: true, buyNPR: 400, rentPerDayNPR: 0, weightG: 100, tip: 'No running water at high altitude teahouses', shop: 'Any pharmacy' },
  { id: 'altitude-medication', category: 'Health & Safety', name: 'Diamox (acetazolamide)', essential: false, buyNPR: 1500, rentPerDayNPR: 0, weightG: 20, tip: 'Consult doctor. Start 24h before ascending above 3,000m', shop: 'Prescription pharmacy KTM' },
  { id: 'emergency-whistle', category: 'Health & Safety', name: 'Emergency whistle', essential: false, buyNPR: 200, rentPerDayNPR: 0, weightG: 10, tip: 'Attach to backpack strap. 3 blasts = distress signal', shop: 'Any Thamel shop' },

  // Documents & Extras
  { id: 'passport-copies', category: 'Documents', name: 'Passport copies + photos (4 copies)', essential: true, buyNPR: 200, rentPerDayNPR: 0, weightG: 10, tip: 'Required for TIMS card and each permit checkpoint', shop: 'Print in Kathmandu' },
  { id: 'travel-insurance', category: 'Documents', name: 'Travel insurance (with helicopter evacuation)', essential: true, buyNPR: 8000, rentPerDayNPR: 0, weightG: 0, tip: 'Must cover helicopter rescue up to 6,000m. Get from World Nomads or True Traveller', shop: 'Buy online before trip' },
  { id: 'permits', category: 'Documents', name: 'TIMS card + permits', essential: true, buyNPR: 5400, rentPerDayNPR: 0, weightG: 0, tip: 'TIMS: NPR 2,000 (SAARC) / NPR 4,000 (others). Add national park fees', shop: 'TAAN office Kathmandu' },
  { id: 'cash', category: 'Documents', name: 'Cash (NPR) — sufficient for trek', essential: true, buyNPR: 0, rentPerDayNPR: 0, weightG: 0, tip: 'No ATMs above 3,000m. Budget NPR 3,000-5,000/day', shop: 'ATMs in Kathmandu' },
  { id: 'lock', category: 'Documents', name: 'Small padlock', essential: false, buyNPR: 300, rentPerDayNPR: 0, weightG: 50, tip: 'For teahouse room doors and hostel lockers', shop: 'Any Thamel shop' },
]

const CATEGORIES = [...new Set(GEAR_ITEMS.map(g => g.category))]

type Season = 'all' | 'spring' | 'summer' | 'autumn' | 'winter'

const SEASON_GEAR: Record<string, string[]> = {
  spring: ['base-layer-top', 'base-layer-bottom', 'fleece', 'down-jacket', 'hardshell', 'trekking-pants', 'sun-hat', 'gloves', 'trekking-socks', 'boots', 'backpack', 'sleeping-bag', 'sleeping-liner', 'headlamp', 'water-purification', 'sunscreen', 'lip-balm', 'sunglasses', 'first-aid', 'passport-copies', 'travel-insurance', 'permits', 'cash'],
  summer: ['base-layer-top', 'hardshell', 'hardshell-pants', 'trekking-pants', 'sun-hat', 'trekking-socks', 'boots', 'camp-shoes', 'daypack', 'dry-bags', 'pack-cover', 'headlamp', 'water-purification', 'sunscreen', 'lip-balm', 'sunglasses', 'hand-sanitizer', 'first-aid', 'emergency-whistle', 'passport-copies'],
  autumn: ['base-layer-top', 'base-layer-bottom', 'fleece', 'down-jacket', 'hardshell', 'hardshell-pants', 'trekking-pants', 'winter-hat', 'gloves', 'neck-gaiter', 'trekking-socks', 'boots', 'gaiters', 'trekking-poles', 'backpack', 'daypack', 'dry-bags', 'sleeping-bag', 'sleeping-liner', 'earplugs', 'headlamp', 'powerbank', 'first-aid', 'water-purification', 'sunscreen', 'lip-balm', 'sunglasses', 'hand-sanitizer', 'altitude-medication', 'passport-copies', 'travel-insurance', 'permits', 'cash'],
  winter: ['base-layer-top', 'base-layer-bottom', 'fleece', 'down-jacket', 'hardshell', 'hardshell-pants', 'trekking-pants', 'winter-hat', 'gloves', 'neck-gaiter', 'underwear', 'trekking-socks', 'boots', 'gaiters', 'crampons', 'trekking-poles', 'backpack', 'daypack', 'dry-bags', 'sleeping-bag', 'sleeping-liner', 'earplugs', 'inflatable-pillow', 'headlamp', 'powerbank', 'map', 'first-aid', 'water-purification', 'water-bottle', 'sunscreen', 'lip-balm', 'sunglasses', 'hand-sanitizer', 'altitude-medication', 'emergency-whistle', 'passport-copies', 'travel-insurance', 'permits', 'cash', 'lock'],
}

export default function PackingChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('packing_checked')
    return saved ? JSON.parse(saved) : {}
  })
  const [showEssentialOnly, setShowEssentialOnly] = useState(false)
  const [season, setSeason] = useState<Season>(() => {
    const prefs = sessionStorage.getItem('recommendations')
    if (prefs) {
      try {
        const p = JSON.parse(prefs)
        const s = p.user_preferences?.season
        if (['spring', 'summer', 'autumn', 'winter'].includes(s)) return s as Season
      } catch {}
    }
    return 'all'
  })

  useEffect(() => {
    localStorage.setItem('packing_checked', JSON.stringify(checked))
  }, [checked])

  const toggle = (id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const totalEssential = GEAR_ITEMS.filter(g => g.essential).length
  const checkedEssential = GEAR_ITEMS.filter(g => g.essential && checked[g.id]).length
  const allItemsCount = showEssentialOnly ? GEAR_ITEMS.filter(g => g.essential).length : GEAR_ITEMS.length
  const allChecked = GEAR_ITEMS.filter(g => showEssentialOnly ? g.essential : true).every(g => checked[g.id])
  const totalBuyCost = GEAR_ITEMS.reduce((s, g) => s + (checked[g.id] ? g.buyNPR : 0), 0)
  const totalWeight = GEAR_ITEMS.reduce((s, g) => s + (checked[g.id] ? g.weightG : 0), 0)

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold"><span className="text-gradient">Packing</span> Checklist</h1>
            <span className="tag-pill">🎒 Interactive</span>
          </div>
          <p className="text-stone">Complete packing guide with local prices in NPR from Thamel & Pokhara gear shops</p>
        </motion.div>

        {/* Progress & Controls */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="card-gradient rounded-xl p-4 border border-white/10">
            <div className="text-xs text-stone uppercase tracking-wider mb-1">Essential Progress</div>
            <div className="text-2xl font-bold text-saffron">{checkedEssential} / {totalEssential}</div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
              <motion.div className="h-full bg-saffron rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(checkedEssential / totalEssential) * 100}%` }}
              />
            </div>
          </div>
          <div className="card-gradient rounded-xl p-4 border border-white/10">
            <div className="text-xs text-stone uppercase tracking-wider mb-1">Gear Value (checked)</div>
            <div className="text-2xl font-bold text-snow">
              Rs {totalBuyCost.toLocaleString()}
            </div>
          </div>
          <div className="card-gradient rounded-xl p-4 border border-white/10">
            <div className="text-xs text-stone uppercase tracking-wider mb-1">Total Weight</div>
            <div className="text-2xl font-bold text-snow">{(totalWeight / 1000).toFixed(1)} kg</div>
            <div className="text-xs text-stone">{totalWeight > 12000 ? '⚠️ Over 12kg — consider renting gear at destination' : '✓ Within recommended limit'}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={() => setShowEssentialOnly(!showEssentialOnly)}
            className={`px-4 py-2 rounded-xl text-sm transition-all ${
              showEssentialOnly ? 'bg-saffron/20 text-saffron border-saffron/30' : 'bg-white/5 text-stone border-white/10'
            } border`}
          >
            {showEssentialOnly ? 'Essential Only' : 'Show All Items'}
          </button>
          {(['all', 'spring', 'summer', 'autumn', 'winter'] as const).map((s) => (
            <button key={s} onClick={() => setSeason(s)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all border capitalize ${
                season === s ? 'bg-saffron/20 text-saffron border-saffron/30' : 'bg-white/5 text-stone border-white/10'
              }`}
            >
              {s === 'all' ? 'All Seasons' : s}
            </button>
          ))}
          <button
            onClick={() => {
              if (allChecked) {
                setChecked({})
              } else {
                const all: Record<string, boolean> = {}
                GEAR_ITEMS.forEach(g => {
                  if (showEssentialOnly ? g.essential : true) all[g.id] = true
                })
                setChecked(all)
              }
            }}
            className="px-4 py-2 rounded-xl text-sm border border-white/10 bg-white/5 text-stone hover:text-snow transition-all"
          >
            {allChecked ? 'Uncheck All' : 'Check All'}
          </button>
        </div>

        {/* Gear Table */}
        <div className="card-gradient rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="py-3 px-3 w-10"></th>
                <th className="py-3 px-3 text-left text-stone font-medium">Item</th>
                <th className="py-3 px-3 text-left text-stone font-medium hidden md:table-cell">Category</th>
                <th className="py-3 px-3 text-right text-stone font-medium">
                  Buy (Rs)
                </th>
                <th className="py-3 px-3 text-right text-stone font-medium hidden lg:table-cell">
                  Rent/day (Rs)
                </th>
                <th className="py-3 px-3 text-right text-stone font-medium hidden md:table-cell">Weight</th>
              </tr>
            </thead>
            <tbody>
              {GEAR_ITEMS.filter(g => {
                if (showEssentialOnly && !g.essential) return false
                if (season !== 'all' && !SEASON_GEAR[season]?.includes(g.id)) return false
                return true
              }).map((item, i) => {
                const isChecked = !!checked[item.id]
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.01 }}
                    onClick={() => toggle(item.id)}
                    className={`border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5 ${
                      isChecked ? 'bg-tea/5' : ''
                    } ${item.essential && !isChecked ? 'border-l-2 border-l-saffron' : ''}`}
                  >
                    <td className="py-2.5 px-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggle(item.id)}
                        className="w-4 h-4 accent-saffron rounded"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-sm ${isChecked ? 'line-through text-stone' : 'text-snow'}`}>
                        {item.name}
                      </span>
                      {item.essential && <span className="ml-1.5 text-[10px] text-crimson">*</span>}
                      <div className="text-[10px] text-stone mt-0.5">{item.tip}</div>
                    </td>
                    <td className="py-2.5 px-3 hidden md:table-cell">
                      <span className="text-[10px] text-stone">{item.category}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`text-xs ${isChecked ? 'text-stone' : 'text-snow'}`}>
                        Rs {item.buyNPR.toLocaleString()}
                      </span>
                      {item.shop && (
                        <div className={`text-[9px] ${isChecked ? 'text-stone/50' : 'text-saffron/60'}`}>{item.shop}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right hidden lg:table-cell">
                      <span className={`text-xs ${isChecked ? 'text-stone' : 'text-stone'}`}>
                        {item.rentPerDayNPR > 0 ? `Rs ${item.rentPerDayNPR}` : '—'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right hidden md:table-cell">
                      <span className={`text-xs ${isChecked ? 'text-stone' : 'text-stone'}`}>
                        {item.weightG > 0 ? `${(item.weightG / 1000).toFixed(1)}kg` : '—'}
                      </span>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Rent vs Buy Guide */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="card-gradient rounded-xl p-5 border border-white/10">
            <div className="text-sm font-semibold text-saffron mb-2">🛒 Buy in Thamel</div>
            <p className="text-xs text-stone leading-relaxed">
              Most gear is available in Kathmandu's Thamel district at 30-50% below Western retail.
              Popular shops: North Face Factory Outlet, Shona's Alpine, Kailash Gear, and Decathlon Pokhara.
              Bargaining expected — start at 60% of asking price.
            </p>
          </div>
          <div className="card-gradient rounded-xl p-5 border border-white/10">
            <div className="text-sm font-semibold text-saffron mb-2">🔄 Rent to Save</div>
            <p className="text-xs text-stone leading-relaxed">
              Rent sleeping bags (Rs 540/day), down jackets (Rs 540/day), trekking poles (Rs 200/day) in Thamel.
              For 10-day trek: renting sleeping bag costs Rs 5,400 vs Rs 14,850 to buy. Quality is generally good.
              Return at end of trek — many shops offer refund on undamaged gear.
            </p>
          </div>
          <div className="card-gradient rounded-xl p-5 border border-white/10">
            <div className="text-sm font-semibold text-saffron mb-2">📦 Porter Weight Limit</div>
            <p className="text-xs text-stone leading-relaxed">
              Porters carry max 30kg (usually shared between 2 trekkers). Your personal daypack:
              8-12kg. Keep total pack weight under 15kg for teahouse treks.
              Excess weight = higher porter cost + slower progress.
            </p>
          </div>
        </div>

        {/* Season Notes */}
        <div className="mt-6 card-gradient rounded-xl p-5 border border-white/10">
          <div className="text-sm font-semibold text-saffron mb-2">📅 Seasonal Packing Notes</div>
          <div className="grid md:grid-cols-3 gap-4 text-xs text-stone">
            <div>
              <span className="text-snow font-medium">Spring (Mar-May):</span> Warmer but expect afternoon clouds.
              Microspikes useful for early season high passes. Lighter sleeping bag OK.
            </div>
            <div>
              <span className="text-snow font-medium">Monsoon (Jun-Aug):</span> Waterproof everything.
              Extra dry bags essential. Leech socks for lower trails. Umbrella useful.
            </div>
            <div>
              <span className="text-snow font-medium">Autumn (Sep-Nov):</span> Best weather but colder nights.
              -15°C sleeping bag. Down jacket essential. Microspikes for late season snow.
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/preferences" className="btn-primary px-8 py-3.5 rounded-xl inline-block">
            Start Planning Your Trip 🏔️
          </Link>
        </div>
      </div>
    </div>
  )
}
