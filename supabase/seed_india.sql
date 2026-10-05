-- Voyage seed content: destinations and festivals across India.
-- GENERATED from supabase/india-content.json by scripts/make-seed.mjs. Edit the JSON, then re-run the script.
-- Run supabase/image_credits.sql FIRST (adds the photo-credit columns), then this file.
-- Safe to re-run: it replaces any rows with the same names, and nothing else references them.
-- Photos are hosted on Wikimedia Commons under open licences; credits are stored with each row and shown in the app.
-- Festival dates change every year: check them before each season.

delete from destinations where name in ('Jaipur', 'Udaipur', 'Agra', 'Varanasi', 'Amritsar', 'Rishikesh', 'Leh Ladakh', 'Goa', 'Alleppey', 'Munnar', 'Hampi', 'Darjeeling', 'Havelock Island', 'Pondicherry');

insert into destinations (name, country, region, image_url, image_credit, image_source_url, short_description, full_description, best_time_to_visit, tags, highlights)
values
  ('Jaipur', 'India', 'Rajasthan', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/41/East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg/960px-East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 'Chainwit. · CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:East_facade_Hawa_Mahal_Jaipur_from_ground_level_(July_2022)_-_img_01.jpg',
   'Pink walls, hilltop forts, and bazaars that never sleep.',
   'Jaipur is Rajasthan''s rose-coloured capital, where palaces and hilltop forts sit beside crowded, colourful markets. Start early at Hawa Mahal before the heat builds, spend the afternoon among royal courtyards and observatory instruments, and finish with a bazaar crawl for textiles, jewellery and blue pottery.',
   'Nov – Mar', array['Family', 'Chill']::text[],
   array['Hawa Mahal in the morning light', 'Amber Fort and its mirror palace', 'City Palace and Jantar Mantar observatory', 'Bapu Bazaar for textiles and jewellery', 'Sunset over the city from Nahargarh Fort']::text[]),
  ('Udaipur', 'India', 'Rajasthan', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/20191207_Lake_Pichola%2C_City_Palace%2C_Udaipur%2C_1516_7254.jpg/960px-20191207_Lake_Pichola%2C_City_Palace%2C_Udaipur%2C_1516_7254.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 'Jakub Hałun · CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:20191207_Lake_Pichola,_City_Palace,_Udaipur,_1516_7254.jpg',
   'Lake palaces, quiet ghats, and sunset boat rides.',
   'Udaipur wraps white-marble palaces around a string of shimmering lakes. It is the most romantic stop in Rajasthan: glide across Lake Pichola at dusk, wander the lanes of the old city, and watch the City Palace glow from a rooftop café.',
   'Oct – Mar', array['Chill', 'Family']::text[],
   array['Sunset boat ride on Lake Pichola', 'City Palace museum complex', 'Jag Mandir island palace', 'Sajjangarh Monsoon Palace viewpoint', 'Evening folk dance at Bagore Ki Haveli']::text[]),
  ('Agra', 'India', 'Uttar Pradesh', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1f/Taj_Mahal_N-UP-A28-a.jpg/960px-Taj_Mahal_N-UP-A28-a.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 'Asitjain · CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:Taj_Mahal_N-UP-A28-a.jpg',
   'Home of the Taj Mahal, and Mughal grandeur beyond it.',
   'Agra is where the Mughal empire left its most famous mark. Reach the Taj Mahal at opening time for soft light and thinner crowds, then explore the red sandstone walls of Agra Fort and catch the monument from across the river at sunset.',
   'Oct – Mar', array['Family', 'Chill']::text[],
   array['Taj Mahal at sunrise', 'Agra Fort''s red sandstone halls', 'Mehtab Bagh for a sunset view of the Taj', 'Itimad-ud-Daulah, the ''Baby Taj''', 'Day trip to Fatehpur Sikri']::text[]),
  ('Varanasi', 'India', 'Uttar Pradesh', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/40/Boats_at_sunrise_Ganges_River_Varanasi_Uttar_Pradesh_Schwiki.jpg/960px-Boats_at_sunrise_Ganges_River_Varanasi_Uttar_Pradesh_Schwiki.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 'Schwiki · CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Boats_at_sunrise_Ganges_River_Varanasi_Uttar_Pradesh_Schwiki.jpg',
   'Ancient ghats, evening aarti, and the pulse of the Ganges.',
   'Varanasi is among the oldest living cities on Earth, and life here unfolds on the river steps. Drift past the ghats at dawn by boat, join the lamp-lit Ganga aarti at dusk, and get lost in the lanes of the old city, where temples, silk shops and tea stalls share every corner.',
   'Oct – Mar', array['Pilgrimage', 'Adventurous']::text[],
   array['Sunrise boat ride along the ghats', 'Ganga aarti at Dashashwamedh Ghat', 'Kashi Vishwanath Temple', 'Walking the lanes of the old city', 'Day trip to Sarnath']::text[]),
  ('Amritsar', 'India', 'Punjab', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Hamandir_Sahib_%28Golden_Temple%29.jpg/960px-Hamandir_Sahib_%28Golden_Temple%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 'Oleg Yunakov · CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:Hamandir_Sahib_(Golden_Temple).jpg',
   'The Golden Temple, community kitchens, and Punjabi warmth.',
   'Amritsar is the spiritual heart of Sikhism, and the Golden Temple sets the tone for the whole city: calm, welcoming and generous. Visit at dawn or after dark when the sanctuary glows over its pool, share a meal at the free community kitchen, and finish with the flag-lowering ceremony at the Wagah border.',
   'Oct – Mar', array['Pilgrimage', 'Family']::text[],
   array['The Golden Temple at dawn and night', 'A meal at the langar community kitchen', 'Jallianwala Bagh memorial', 'Wagah border flag ceremony', 'Amritsari kulcha and lassi in the old city']::text[]),
  ('Rishikesh', 'India', 'Uttarakhand', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/13/Ganga_ghats%2C_Laxman_jhula%2C_Rishikesh.jpg/960px-Ganga_ghats%2C_Laxman_jhula%2C_Rishikesh.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 'आशीष_भटनागर · CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:Ganga_ghats,_Laxman_jhula,_Rishikesh.jpg',
   'Yoga, white-water rafting, and the Ganges leaving the mountains.',
   'Rishikesh sits where the Ganges spills out of the Himalayan foothills, and it suits both seekers and thrill-chasers. Raft the rapids in the morning, cross the suspension bridges, then settle into a yoga class or the evening river aarti.',
   'Feb – May, Sep – Nov', array['Adventurous', 'Pilgrimage', 'Chill']::text[],
   array['White-water rafting on the Ganges', 'Laxman Jhula and Ram Jhula bridges', 'Evening aarti at Triveni Ghat', 'Yoga and meditation at the ashrams', 'Cafés and viewpoints above the river']::text[]),
  ('Leh Ladakh', 'India', 'Ladakh', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3b/Pangong_Lake%2C_Ladakh%2C_India_04.jpg/960px-Pangong_Lake%2C_Ladakh%2C_India_04.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 'Geet Arts · CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Pangong_Lake,_Ladakh,_India_04.jpg',
   'High passes, blue lakes, and monasteries in thin air.',
   'Ladakh is a high-altitude desert of stark ridgelines, turquoise lakes and whitewashed monasteries. Give yourself a few days to adjust to the altitude in Leh, then head out over the mountain passes to Pangong Tso and the dunes of Nubra Valley.',
   'May – Sep', array['Adventurous']::text[],
   array['Pangong Tso at golden hour', 'Nubra Valley dunes and double-humped camels', 'Khardung La mountain pass', 'Thiksey and Hemis monasteries', 'Leh Palace and the old bazaar']::text[]),
  ('Goa', 'India', 'Goa', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cb/Rocks_on_Palolem_Beach_South_Goa.jpg/960px-Rocks_on_Palolem_Beach_South_Goa.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 'Vachary · CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Rocks_on_Palolem_Beach_South_Goa.jpg',
   'Beach days, Portuguese lanes, and easygoing evenings.',
   'Goa is India''s coastal escape, mixing long beaches with a Portuguese-era old town. Pick a quiet stretch like Palolem or Agonda for sunbathing, explore the pastel lanes of Fontainhas, and save your evenings for seafood by the water.',
   'Nov – Feb', array['Chill', 'Family']::text[],
   array['Palolem and Agonda beaches', 'Old Goa''s churches and cathedrals', 'Fontainhas Latin Quarter', 'Anjuna flea market', 'Dudhsagar Falls day trip']::text[]),
  ('Alleppey', 'India', 'Kerala', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c4/Nedumudy_-_Houseboat.jpg/960px-Nedumudy_-_Houseboat.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 'Ingo Mehling · CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Nedumudy_-_Houseboat.jpg',
   'Houseboats drifting through the Kerala backwaters.',
   'Alleppey, also called Alappuzha, is the gateway to Kerala''s backwaters: a maze of canals and lagoons lined with coconut palms and paddy fields. Float through on a houseboat, stop in small villages by canoe, and eat fresh fish curry prepared on board.',
   'Oct – Mar', array['Chill', 'Family']::text[],
   array['Overnight houseboat cruise', 'Canoe through village canals', 'Kuttanad''s below-sea-level paddy fields', 'Alappuzha beach and lighthouse', 'Marari beach for a quiet stay']::text[]),
  ('Munnar', 'India', 'Kerala', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/99/Tea_plantations_in_Munnar.jpg/960px-Tea_plantations_in_Munnar.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 'www.eatoutzone.com · CC BY 3.0', 'https://commons.wikimedia.org/wiki/File:Tea_plantations_in_Munnar.jpg',
   'Rolling tea hills and cool mountain mornings.',
   'Munnar''s slopes are covered in neat green tea plantations, with mist drifting through the valleys at sunrise. Walk between the tea rows, look for the rare Nilgiri tahr at Eravikulam, and enjoy the cool air that makes it a favourite escape from Kerala''s coastal heat.',
   'Oct – Feb', array['Chill', 'Family']::text[],
   array['Tea plantation walks', 'Eravikulam National Park and its Nilgiri tahr', 'Mattupetty Dam boat ride', 'Top Station viewpoint', 'Tea museum and factory visit']::text[]),
  ('Hampi', 'India', 'Karnataka', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Complex_of_Virupaksha_Temple%2C_Hampi_%2804%29.jpg/960px-Complex_of_Virupaksha_Temple%2C_Hampi_%2804%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 'iMahesh · CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Complex_of_Virupaksha_Temple,_Hampi_(04).jpg',
   'Boulder-strewn ruins of a lost empire.',
   'Hampi''s ruined temples and bazaars lie scattered among enormous granite boulders on the Tungabhadra river. Hire a bicycle to cover the sprawl, climb a hilltop for sunrise or sunset, and cross the river by coracle to the quieter side.',
   'Oct – Feb', array['Adventurous', 'Pilgrimage']::text[],
   array['Virupaksha Temple', 'Vittala Temple and its stone chariot', 'Sunset at Hemakuta Hill', 'Coracle ride on the Tungabhadra', 'Sunrise from Matanga Hill']::text[]),
  ('Darjeeling', 'India', 'West Bengal', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d6/Kanchenjunga_range_from_tea_gardens_of_darjeeling.jpg/960px-Kanchenjunga_range_from_tea_gardens_of_darjeeling.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 'Souviknshm · CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Kanchenjunga_range_from_tea_gardens_of_darjeeling.jpg',
   'Tea estates and Himalayan views on a toy train line.',
   'Darjeeling is a hill station draped over a ridge, with tea estates all around and Kanchenjunga on the horizon on clear days. Rise before dawn for the sunrise viewpoint, ride the narrow-gauge Himalayan railway, and taste first-flush tea at the source.',
   'Mar – May, Oct – Dec', array['Chill', 'Family']::text[],
   array['Sunrise at Tiger Hill', 'Darjeeling Himalayan Railway toy train', 'Tea estate tours and tastings', 'Batasia Loop and war memorial', 'Himalayan Mountaineering Institute']::text[]),
  ('Havelock Island', 'India', 'Andaman and Nicobar Islands', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/87/Havelock_Island%2C_Radhanagar_Beach_before_sunset%2C_Andaman_Islands.jpg/960px-Havelock_Island%2C_Radhanagar_Beach_before_sunset%2C_Andaman_Islands.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 'Vyacheslav Argenberg · CC BY 4.0', 'https://commons.wikimedia.org/wiki/File:Havelock_Island,_Radhanagar_Beach_before_sunset,_Andaman_Islands.jpg',
   'Clear water, coral reefs, and some of India''s best beaches.',
   'Havelock, officially Swaraj Dweep, is the Andamans'' main beach destination, with clear water, white sand and healthy coral just offshore. Spend the days snorkelling or diving, kayak through mangroves, and end the day on Radhanagar Beach at sunset.',
   'Oct – Feb', array['Chill', 'Adventurous']::text[],
   array['Radhanagar Beach at sunset', 'Scuba diving and snorkelling over coral', 'Kayaking through mangroves', 'Sunrise at Kalapathar Beach', 'Elephant Beach water activities']::text[]),
  ('Pondicherry', 'India', 'Puducherry', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/60/Rock_Beach%2C_in_Pondicherry_06.jpg/960px-Rock_Beach%2C_in_Pondicherry_06.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 'Pinakpani · CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Rock_Beach,_in_Pondicherry_06.jpg',
   'French-colonial streets, sea breeze, and spiritual retreats.',
   'Pondicherry blends a French-colonial old quarter with a laid-back seaside rhythm. Wander the mustard-yellow streets of the French Quarter, cycle along the Promenade at dawn, and visit nearby Auroville, an experimental township built around a golden meditation dome.',
   'Oct – Mar', array['Chill', 'Pilgrimage']::text[],
   array['Walking the French Quarter', 'Promenade and Rock Beach at dawn', 'Auroville and the Matrimandir', 'Sri Aurobindo Ashram', 'Paradise Beach day trip']::text[]);

delete from events where name in ('Mysuru Dasara', 'Rann Utsav', 'Diwali', 'Pushkar Camel Fair', 'Dev Deepawali', 'Hornbill Festival', 'Jaipur Literature Festival', 'Holi');

insert into events (name, location, event_date, image_url, image_credit, image_source_url, tags)
values
  ('Mysuru Dasara', 'Mysuru, Karnataka', '2026-10-20'::date, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cd/KR_Circle_Mysore_1510.jpg/960px-KR_Circle_Mysore_1510.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 'Basavaraj M · CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:KR_Circle_Mysore_1510.jpg', array['Family', 'Pilgrimage']::text[]),
  ('Rann Utsav', 'Dhordo, Kutch, Gujarat', '2026-11-01'::date, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/White_salt_desert_at_Rann_of_Kutch.jpg/960px-White_salt_desert_at_Rann_of_Kutch.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 'Prof Ranga Sai · CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:White_salt_desert_at_Rann_of_Kutch.jpg', array['Chill', 'Adventurous']::text[]),
  ('Diwali', 'Across India', '2026-11-08'::date, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/73/Diyas_Diwali_Decor_India.jpg/960px-Diyas_Diwali_Decor_India.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 'humdingor · CC BY-SA 2.0', 'https://commons.wikimedia.org/wiki/File:Diyas_Diwali_Decor_India.jpg', array['Family', 'Pilgrimage']::text[]),
  ('Pushkar Camel Fair', 'Pushkar, Rajasthan', '2026-11-17'::date, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Camels_of_Pushkar_Camel_Fair_%282015%29.jpg/960px-Camels_of_Pushkar_Camel_Fair_%282015%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 'Sudipta Dutta Chowdhury · CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Camels_of_Pushkar_Camel_Fair_(2015).jpg', array['Adventurous', 'Family']::text[]),
  ('Dev Deepawali', 'Varanasi, Uttar Pradesh', '2026-11-24'::date, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/46/Ghats_of_Varanasi_Getting_ready_for_Dev_Deepawali_03.jpg/960px-Ghats_of_Varanasi_Getting_ready_for_Dev_Deepawali_03.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 'Goutam1962 · CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Ghats_of_Varanasi_Getting_ready_for_Dev_Deepawali_03.jpg', array['Pilgrimage']::text[]),
  ('Hornbill Festival', 'Kisama, Nagaland', '2026-12-01'::date, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0e/Hornbill_Festival%2CNagaland_2.jpg/960px-Hornbill_Festival%2CNagaland_2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 'Sarangakrishnachetia · CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Hornbill_Festival,Nagaland_2.jpg', array['Adventurous', 'Family']::text[]),
  ('Jaipur Literature Festival', 'Jaipur, Rajasthan', '2027-01-14'::date, null, null, null, array['Chill']::text[]),
  ('Holi', 'Mathura and Vrindavan, Uttar Pradesh', '2027-03-22'::date, 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3a/Holi_Festival_of_Colours.jpg/960px-Holi_Festival_of_Colours.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail', 'Achary K Krishnan · CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Holi_Festival_of_Colours.jpg', array['Family', 'Adventurous']::text[]);
