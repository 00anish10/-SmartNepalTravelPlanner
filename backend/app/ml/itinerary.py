from typing import List, Dict, Any, Optional


class GreedyItineraryOptimizer:
    def generate(
        self,
        destination: Dict[str, Any],
        preferences: Dict[str, Any],
    ) -> Dict[str, Any]:
        days = []
        total_cost = 0.0
        total_cost_npr = 0.0
        cumulative_gain_above_3k = 0
        acclimatization_days = 0
        duration = preferences.get("duration", 7)
        starting_city = preferences.get("starting_city", "Kathmandu")
        dest_name = destination["name"]
        dest_alt = destination.get("altitude_max", 4000)
        cost_per_day = destination.get("cost_per_day_usd", 50)
        cluster = destination.get("cluster", "")
        budget = preferences.get("budget", 99999)
        fitness = preferences.get("fitness_level", "moderate")
        accommodation_type = preferences.get("accommodation_type", "mid")

        is_trek = "trek" in cluster.lower() or "himalayan" in cluster.lower() or "remote" in cluster.lower()
        is_culture = "cultural" in cluster.lower()
        is_wildlife = "wildlife" in cluster.lower()
        is_adventure = "adventure" in cluster.lower()

        day = 1

        if starting_city:
            city_cost = self._accommodation_cost(accommodation_type) * 0.8
            days.append(self._make_day(
                day, starting_city, "Arrival & Rest",
                self._arrival_note(starting_city, is_trek),
                1400, 0, city_cost, city_cost * 135,
                f"Overnight in {starting_city}."
            ))
            total_cost += city_cost
            total_cost_npr += city_cost * 135
            day += 1

            if is_trek:
                days.append(self._make_day(
                    day, starting_city, "Preparation & Permits",
                    "Visit TAAN office for TIMS card and conservation area permits. Last-minute gear check.",
                    1400, 0, 40, 40 * 135,
                    f"Permit costs: TIMS Rs 2,700, park entry ~Rs 2,970. Allow 4-5 hours."
                ))
                total_cost += 40
                total_cost_npr += 40 * 135
                day += 1

        if is_trek and starting_city == "Kathmandu":
            days.append(self._make_day(
                day, "Kathmandu → Pokhara", "Domestic Flight",
                "Fly to Pokhara (30 min). Book morning flight for clearest mountain views.",
                1400, 0, 120, 120 * 135,
                "Flight cost includes 15kg baggage."
            ))
            total_cost += 120
            total_cost_npr += 120 * 135
            day += 1

        trek_days_available = duration - (day - 1)
        if trek_days_available < 0:
            trek_days_available = 0

        if is_trek:
            result = self._build_trek_itinerary(
                dest_name, trek_days_available, 1000, dest_alt,
                cost_per_day, day, total_cost, total_cost_npr,
                cumulative_gain_above_3k, acclimatization_days,
                starting_city, fitness, accommodation_type
            )
            days.extend(result["days"])
            total_cost = result["total_cost"]
            total_cost_npr = result["total_cost_npr"]
            day = result["day"]
        elif is_culture:
            result = self._build_cultural_itinerary(
                dest_name, trek_days_available, cost_per_day, day,
                total_cost, total_cost_npr, starting_city, accommodation_type
            )
            days.extend(result["days"])
            total_cost = result["total_cost"]
            total_cost_npr = result["total_cost_npr"]
            day = result["day"]
        elif is_wildlife:
            result = self._build_wildlife_itinerary(
                dest_name, trek_days_available, cost_per_day, day,
                total_cost, total_cost_npr, starting_city, accommodation_type
            )
            days.extend(result["days"])
            total_cost = result["total_cost"]
            total_cost_npr = result["total_cost_npr"]
            day = result["day"]
        elif is_adventure:
            result = self._build_adventure_itinerary(
                dest_name, trek_days_available, cost_per_day, day,
                total_cost, total_cost_npr, starting_city, accommodation_type
            )
            days.extend(result["days"])
            total_cost = result["total_cost"]
            total_cost_npr = result["total_cost_npr"]
            day = result["day"]
        else:
            for rd in range(trek_days_available):
                alt_val = 1400
                city_cost = self._accommodation_cost(accommodation_type)
                days.append(self._make_day(
                    day, dest_name, "Exploration Day",
                    f"Explore {dest_name}. Visit local attractions and cultural sites.",
                    alt_val, 0, city_cost, city_cost * 135,
                    f"Enjoy local cuisine and culture."
                ))
                total_cost += city_cost
                total_cost_npr += city_cost * 135
                day += 1

        remaining_days = duration - (day - 1)
        if remaining_days > 0:
            for rd in range(remaining_days):
                if rd == 0 and is_trek:
                    day_cost = self._accommodation_cost(accommodation_type) * 1.2
                    days.append(self._make_day(
                        day, f"Return to {starting_city}", "Return Journey",
                        "Trek back to trailhead. Drive or fly back.",
                        1400, -500, day_cost, day_cost * 135,
                        "Celebratory dinner. Rest."
                    ))
                else:
                    day_cost = self._accommodation_cost(accommodation_type) * 0.8
                    days.append(self._make_day(
                        day, starting_city, "Departure / Buffer Day",
                        "Free time for souvenir shopping. Airport transfer buffer.",
                        1400, 0, day_cost, day_cost * 135,
                        "Allow 3 hours before flight for international departure."
                    ))
                total_cost += day_cost
                total_cost_npr += day_cost * 135
                day += 1

        emergency_buffer = round(total_cost * 0.15, 2)
        emergency_buffer_npr = round(total_cost_npr * 0.15, 2)

        warnings = []
        if total_cost > budget:
            warnings.append(
                f"Total estimated cost Rs {total_cost * 135:.0f} exceeds your budget of Rs {budget * 135:.0f}. "
                f"Consider cheaper accommodation or shorter duration."
            )
        if dest_alt > 3500 and fitness in ("sedentary", "moderate"):
            warnings.append(
                f"This destination reaches {dest_alt}m — recommended fitness: active/athletic. "
                f"Prepare with cardio and strength training."
            )
        if is_trek and dest_alt > 4000 and accommodation_type == "budget":
            warnings.append(
                "Budget accommodation above 4,000m may lack heating. Pack a warm sleeping bag."
            )

        return {
            "days": days,
            "total_cost": round(total_cost, 2),
            "total_cost_npr": round(total_cost_npr, 2),
            "emergency_buffer": emergency_buffer,
            "emergency_buffer_npr": emergency_buffer_npr,
            "grand_total": round(total_cost + emergency_buffer, 2),
            "grand_total_npr": round(total_cost_npr + emergency_buffer_npr, 2),
            "warnings": warnings,
        }

    def _make_day(self, day, location, activity, notes, altitude, alt_gain, cost, cost_npr, accommodation):
        is_trek_day = "trek" in activity.lower() or "acclimatization" in activity.lower() or "summit" in activity.lower()
        return {
            "day": day,
            "location": location,
            "activity": activity,
            "altitude": altitude,
            "altitude_gain": alt_gain,
            "est_cost_usd": round(cost, 2),
            "est_cost_npr": round(cost_npr, 2),
            "notes": notes,
            "accommodation": accommodation,
            "meals": "Breakfast, Lunch, Dinner" if is_trek_day else "Breakfast only (lunch/dinner extra)",
        }

    def _accommodation_cost(self, acc_type: str) -> float:
        return {"budget": 30, "mid": 55, "luxury": 120}.get(acc_type, 55)

    def _ams_reminder(self, altitude: int) -> str:
        if altitude > 4000:
            return "AMS WATCH: Monitor for headache, nausea. Descend if symptoms persist."
        elif altitude > 3500:
            return "Stay hydrated. Avoid alcohol. Watch for AMS symptoms."
        return "Standard hydration protocol."

    def _arrival_note(self, city: str, is_trek: bool) -> str:
        if city == "Kathmandu":
            return "Arrive at Tribhuvan International Airport. Transfer to hotel. Rest after your flight."
        return f"Arrive in {city}. Settle into your accommodation. Evening walk to explore the area."

    def _build_trek_itinerary(self, dest_name, days_avail, start_alt, max_alt,
                              cost_per_day, day, total_cost, total_cost_npr,
                              cum_gain, acclim_days, starting_city, fitness, acc_type):
        segments = self._get_trek_locations(dest_name, days_avail)
        alt = start_alt
        acc_cost = self._accommodation_cost(acc_type)

        result_days = []
        for i in range(min(days_avail, len(segments))):
            seg = segments[i]
            remaining = max_alt - alt
            if remaining > 0 and i < len(segments) - 2:
                actual_gain = min(500, remaining // max(len(segments) - i, 1))
                actual_gain = max(actual_gain, 100)
            elif remaining <= 0:
                actual_gain = -max(200, abs(remaining) // 2)
            else:
                actual_gain = 300
            alt += actual_gain
            alt = max(alt, start_alt)
            alt = min(alt, max_alt)

            seg_cost = acc_cost * (0.7 if "Rest" in seg["activity"] else 1.0)
            result_days.append(self._make_day(
                day, seg["name"], seg["activity"],
                seg.get("notes", f"Trek day {i+1}"),
                alt, actual_gain if actual_gain > 0 else 0,
                seg_cost, seg_cost * 135,
                seg.get("accommodation", "Teahouse")
            ))
            total_cost += seg_cost
            total_cost_npr += seg_cost * 135
            day += 1

            if alt > 3000:
                cum_gain += max(actual_gain, 0)
            if cum_gain >= 1000 and alt > 3000:
                rest_cost = acc_cost * 0.6
                result_days.append(self._make_day(
                    day, seg["name"], "Acclimatization Rest Day",
                    "Mandatory rest day for altitude adaptation. Short exploration walk. Hydrate well.",
                    alt, 0, rest_cost, rest_cost * 135,
                    "Acclimatization rest. " + self._ams_reminder(alt)
                ))
                total_cost += rest_cost
                total_cost_npr += rest_cost * 135
                cum_gain = 0
                day += 1

        return {
            "days": result_days,
            "total_cost": total_cost,
            "total_cost_npr": total_cost_npr,
            "day": day,
        }

    def _build_cultural_itinerary(self, dest_name, days_avail, cost_per_day,
                                  day, total_cost, total_cost_npr, start_city, acc_type):
        acc_cost = self._accommodation_cost(acc_type)
        dests = {
            "Kathmandu Valley": [
                {"name": "Kathmandu", "act": "Pashupatinath & Boudhanath", "alt": 1400},
                {"name": "Kathmandu", "act": "Swayambhunath & Patan Durbar", "alt": 1400},
                {"name": "Bhaktapur", "act": "Bhaktapur Durbar Square", "alt": 1400},
                {"name": "Patan", "act": "Patan Museum & Golden Temple", "alt": 1400},
            ],
            "Lumbini": [
                {"name": "Lumbini", "act": "Maya Devi Temple & Sacred Garden", "alt": 100},
                {"name": "Lumbini", "act": "World Peace Pagoda & Monasteries", "alt": 100},
            ],
            "Bandipur": [
                {"name": "Bandipur", "act": "Newari Village Walk", "alt": 1030},
                {"name": "Bandipur", "act": "Siddha Gufa Cave & Tundikhel", "alt": 1030},
            ],
        }

        sites = dests.get(dest_name, [{"name": dest_name, "act": "Cultural Exploration", "alt": 1400}])
        result_days = []
        for i in range(min(days_avail, len(sites))):
            s = sites[i]
            result_days.append(self._make_day(
                day, s["name"], s["act"],
                f"Explore cultural heritage sites in {s['name']}. Visit temples, museums, and local markets.",
                s["alt"], 0, acc_cost, acc_cost * 135,
                f"Local restaurant for traditional cuisine."
            ))
            total_cost += acc_cost
            total_cost_npr += acc_cost * 135
            day += 1

        remaining = days_avail - len(sites)
        for i in range(remaining):
            result_days.append(self._make_day(
                day, dest_name, "Free Exploration",
                f"Continue exploring {dest_name}. Visit local artisan workshops and try local food.",
                1400, 0, acc_cost * 0.8, acc_cost * 0.8 * 135,
                "Free day to explore at your own pace."
            ))
            total_cost += acc_cost * 0.8
            total_cost_npr += acc_cost * 0.8 * 135
            day += 1

        return {"days": result_days, "total_cost": total_cost, "total_cost_npr": total_cost_npr, "day": day}

    def _build_wildlife_itinerary(self, dest_name, days_avail, cost_per_day,
                                  day, total_cost, total_cost_npr, start_city, acc_type):
        acc_cost = self._accommodation_cost(acc_type)
        wildlife_acts = [
            ("Jungle Safari", "Morning jeep safari to spot rhinos, deer, and exotic birds."),
            ("Canoe Ride & Walk", "Canoe along the river. Guided jungle walk with naturalist."),
            ("Bird Watching", "Early morning bird walk. Over 500 species in the park."),
            ("Cultural Evening", "Visit local Tharu village. Traditional dance performance."),
            ("Elephant Safari", "Elephant-back safari for closer wildlife encounters."),
        ]

        result_days = []
        for i in range(min(days_avail, len(wildlife_acts))):
            act_name, act_desc = wildlife_acts[i]
            result_days.append(self._make_day(
                day, dest_name, act_name, act_desc,
                200, 0, acc_cost * 1.1, acc_cost * 1.1 * 135,
                "Jungle resort or safari lodge."
            ))
            total_cost += acc_cost * 1.1
            total_cost_npr += acc_cost * 1.1 * 135
            day += 1

        remaining = days_avail - len(wildlife_acts)
        for i in range(remaining):
            result_days.append(self._make_day(
                day, dest_name, "Nature Walk & Relaxation",
                "Leisurely nature walk. Spa or relaxation at the resort.",
                200, 0, acc_cost * 0.8, acc_cost * 0.8 * 135,
                "Relaxation day."
            ))
            total_cost += acc_cost * 0.8
            total_cost_npr += acc_cost * 0.8 * 135
            day += 1

        return {"days": result_days, "total_cost": total_cost, "total_cost_npr": total_cost_npr, "day": day}

    def _build_adventure_itinerary(self, dest_name, days_avail, cost_per_day,
                                   day, total_cost, total_cost_npr, start_city, acc_type):
        acc_cost = self._accommodation_cost(acc_type)
        adventure_map = {
            "Pokhara": [
                ("Paragliding", "Tandem paragliding off Sarangkot. 30-min flight over Phewa Lake."),
                ("Ultralight Flight", "15-min ultralight aircraft over the Annapurna range."),
                ("Phewa Lake Boating", "Rowboat or kayak on Phewa Lake. Visit Tal Barahi Temple."),
                ("Zip-lining & Bungee", "World's 2nd highest zip-line. Canyon swing nearby."),
                ("World Peace Pagoda", "Hike to the pagoda for panoramic sunset views."),
            ],
            "Ghorepani Poon Hill": [
                ("Poon Hill Sunrise", "Pre-dawn hike to Poon Hill (3,210m) for Himalayan sunrise panorama."),
                ("Ghandruk Village", "Descend to traditional Gurung village. Visit the cultural museum."),
            ],
        }

        acts = adventure_map.get(dest_name, [
            ("Adventure Activity", f"Enjoy adventure sports and activities in {dest_name}."),
            ("Scenic Exploration", f"Explore the natural beauty around {dest_name}."),
        ])

        result_days = []
        for i in range(min(days_avail, len(acts))):
            act_name, act_desc = acts[i]
            alt = 1100 if "Pokhara" in dest_name else 2000
            result_days.append(self._make_day(
                day, dest_name, act_name, act_desc,
                alt, 0, acc_cost * 1.2, acc_cost * 1.2 * 135,
                "Hotel or guesthouse."
            ))
            total_cost += acc_cost * 1.2
            total_cost_npr += acc_cost * 1.2 * 135
            day += 1

        remaining = days_avail - len(acts)
        for i in range(remaining):
            result_days.append(self._make_day(
                day, dest_name, "Leisure Day",
                f"Free time to explore {dest_name} at your own pace.",
                1100, 0, acc_cost * 0.8, acc_cost * 0.8 * 135,
                "Relax and enjoy the surroundings."
            ))
            total_cost += acc_cost * 0.8
            total_cost_npr += acc_cost * 0.8 * 135
            day += 1

        return {"days": result_days, "total_cost": total_cost, "total_cost_npr": total_cost_npr, "day": day}

    def _get_trek_locations(self, dest_name: str, days: int) -> List[Dict]:
        trek_routes = {
            "Everest Base Camp": [
                {"name": "Lukla", "activity": "Flight & Trek Start", "notes": "Fly KTM→Lukla (35 min). Trek to Phakding (2,610m).", "accommodation": "Teahouse in Phakding"},
                {"name": "Namche Bazaar", "activity": "Trek", "notes": "Climb through pine forests to Namche (3,440m). First Everest views.", "accommodation": "Teahouse in Namche"},
                {"name": "Namche Bazaar", "activity": "Acclimatization Rest Day", "notes": "Hike to Everest View Hotel (3,962m). Explore markets.", "accommodation": "Teahouse in Namche"},
                {"name": "Tengboche", "activity": "Trek", "notes": "Visit famous Tengboche Monastery (3,860m). Himalayan panorama.", "accommodation": "Teahouse in Tengboche"},
                {"name": "Dingboche", "activity": "Trek", "notes": "Cross Imja Khola. Enter alpine zone (4,410m).", "accommodation": "Teahouse in Dingboche"},
                {"name": "Dingboche", "activity": "Acclimatization Rest Day", "notes": "Hike to Nagarjun Hill (5,100m) for adaptation.", "accommodation": "Teahouse in Dingboche"},
                {"name": "Lobuche", "activity": "Trek", "notes": "Gradual ascent past memorials (4,940m).", "accommodation": "Teahouse in Lobuche"},
                {"name": "Gorakshep / EBC", "activity": "Everest Base Camp", "notes": "Reach EBC (5,364m) via Gorakshep. Summit day!", "accommodation": "Teahouse in Gorakshep"},
                {"name": "Kala Patthar", "activity": "Sunrise Summit", "notes": "Pre-dawn hike to Kala Patthar (5,644m). Descend to Pheriche.", "accommodation": "Teahouse in Pheriche"},
                {"name": "Namche Bazaar", "activity": "Return Trek", "notes": "Long descent day through rhododendron forests.", "accommodation": "Teahouse in Namche"},
                {"name": "Lukla", "activity": "Return Trek", "notes": "Final trek day. Celebrate with your crew.", "accommodation": "Teahouse in Lukla"},
            ],
            "Annapurna Circuit": [
                {"name": "Jagat", "activity": "Trek Start", "notes": "Drive KTM→Jagat. Begin trek along Marsyangdi.", "accommodation": "Teahouse in Jagat"},
                {"name": "Dharapani", "activity": "Trek", "notes": "Follow river through forests (1,860m).", "accommodation": "Teahouse in Dharapani"},
                {"name": "Chame", "activity": "Trek", "notes": "Enter Manang district. Views of Annapurna II (2,670m).", "accommodation": "Teahouse in Chame"},
                {"name": "Pisang", "activity": "Trek", "notes": "Pass waterfalls and pine forests (3,200m).", "accommodation": "Teahouse in Pisang"},
                {"name": "Manang", "activity": "Trek", "notes": "Dramatic valley views (3,540m).", "accommodation": "Teahouse in Manang"},
                {"name": "Manang", "activity": "Acclimatization Rest Day", "notes": "Explore village. Hike to Gangapurna Lake.", "accommodation": "Teahouse in Manang"},
                {"name": "Thorong Phedi", "activity": "Trek", "notes": "Climb to base of Thorong La (4,450m).", "accommodation": "Teahouse at Thorong Phedi"},
                {"name": "Thorong La / Muktinath", "activity": "Pass Crossing", "notes": "Cross 5,416m pass. Visit Muktinath temple.", "accommodation": "Teahouse in Muktinath"},
                {"name": "Jomsom", "activity": "Trek", "notes": "Descend Kali Gandaki gorge (2,720m).", "accommodation": "Teahouse in Jomsom"},
                {"name": "Pokhara", "activity": "Return Flight", "notes": "Scenic flight Jomsom→Pokhara.", "accommodation": "Hotel in Pokhara"},
            ],
            "Annapurna Base Camp": [
                {"name": "Nayapul", "activity": "Trek Start", "notes": "Drive Pokhara→Nayapul. Trek to Tikhedhunga (1,540m).", "accommodation": "Teahouse in Tikhedhunga"},
                {"name": "Ghorepani", "activity": "Trek", "notes": "Climb through rhododendron forests (2,860m).", "accommodation": "Teahouse in Ghorepani"},
                {"name": "Poon Hill / Tadapani", "activity": "Sunrise Hike", "notes": "Poon Hill sunrise (3,210m). Trek to Tadapani (2,630m).", "accommodation": "Teahouse in Tadapani"},
                {"name": "Sinuwa", "activity": "Trek", "notes": "Descend and climb through lush forest (2,350m).", "accommodation": "Teahouse in Sinuwa"},
                {"name": "Deurali", "activity": "Trek", "notes": "Enter bamboo and alpine zone (3,230m).", "accommodation": "Teahouse in Deurali"},
                {"name": "Annapurna Base Camp", "activity": "ABC Summit", "notes": "Reach ABC (4,130m). Surrounded by Annapurna massif!", "accommodation": "Teahouse at ABC"},
                {"name": "Bamboo", "activity": "Return Trek", "notes": "Descend through Machhapuchhre BC (2,310m).", "accommodation": "Teahouse in Bamboo"},
                {"name": "Pokhara", "activity": "Return Journey", "notes": "Final descent to Nayapul. Drive to Pokhara.", "accommodation": "Hotel in Pokhara"},
            ],
            "Langtang Valley": [
                {"name": "Syabrubesi", "activity": "Trek Start", "notes": "Drive KTM→Syabrubesi (7 hrs, 1,500m).", "accommodation": "Teahouse in Syabrubesi"},
                {"name": "Lama Hotel", "activity": "Trek", "notes": "Follow Langtang River (2,470m).", "accommodation": "Teahouse at Lama Hotel"},
                {"name": "Langtang Village", "activity": "Trek", "notes": "Enter Langtang Valley. Yak pastures (3,430m).", "accommodation": "Teahouse in Langtang"},
                {"name": "Kyanjin Gompa", "activity": "Trek", "notes": "Visit cheese factory (3,870m). Explore monastery.", "accommodation": "Teahouse at Kyanjin"},
                {"name": "Kyanjin Gompa", "activity": "Acclimatization & Exploration", "notes": "Hike Kyanjin Ri (4,773m) for panoramic views.", "accommodation": "Teahouse at Kyanjin"},
                {"name": "Lama Hotel", "activity": "Return Trek", "notes": "Descend through valley.", "accommodation": "Teahouse at Lama Hotel"},
                {"name": "Kathmandu", "activity": "Return Journey", "notes": "Drive back to Kathmandu.", "accommodation": "Hotel in Kathmandu"},
            ],
            "Manaslu Circuit": [
                {"name": "Soti Khola", "activity": "Trek Start", "notes": "Drive KTM→Soti Khola (700m). Begin trek.", "accommodation": "Teahouse"},
                {"name": "Machha Khola", "activity": "Trek", "notes": "Follow Budhi Gandaki River (900m).", "accommodation": "Teahouse"},
                {"name": "Jagat", "activity": "Trek", "notes": "Enter restricted area checkpoint (1,400m).", "accommodation": "Teahouse"},
                {"name": "Deng", "activity": "Trek", "notes": "Climb through forest (1,860m).", "accommodation": "Teahouse"},
                {"name": "Namrung", "activity": "Trek", "notes": "Tibetan Buddhist villages (2,630m).", "accommodation": "Teahouse"},
                {"name": "Samagaon", "activity": "Trek", "notes": "Base of Manaslu (3,530m). Explore.", "accommodation": "Teahouse"},
                {"name": "Samagaon", "activity": "Acclimatization Rest Day", "notes": "Hike to Manaslu Base Camp viewpoint.", "accommodation": "Teahouse"},
                {"name": "Samdo", "activity": "Trek", "notes": "Approach Larkya La (3,860m).", "accommodation": "Teahouse"},
                {"name": "Larkya La Phedi", "activity": "Trek", "notes": "Base camp for pass crossing (4,460m).", "accommodation": "Teahouse"},
                {"name": "Larkya La / Bimthang", "activity": "Pass Crossing", "notes": "Cross 5,106m pass. Descend to Bimthang.", "accommodation": "Teahouse"},
                {"name": "Dharapani", "activity": "Trek", "notes": "Join Annapurna Circuit trail.", "accommodation": "Teahouse"},
                {"name": "Kathmandu", "activity": "Return Journey", "notes": "Drive back to Kathmandu via Besisahar.", "accommodation": "Hotel in Kathmandu"},
            ],
        }

        fallback = [
            {"name": f"Trek Point {i+1}", "activity": "Trek Day", "notes": f"Trekking day {i+1}. Enjoy the stunning mountain scenery.", "accommodation": "Teahouse / Camp"}
            for i in range(days)
        ]

        return trek_routes.get(dest_name, fallback)
