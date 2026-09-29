# Seeds the local Discourse so it looks like a lived-in QuickMD Together forum for demos:
# QuickMD branding (logo, colors, a hero banner on the welcome topic), sample members,
# categories, and five topics with replies. Safe to re-run: anything that already
# exists is skipped. Run it with `scripts/discourse-local.sh seed`; add `--reset` to
# delete the sample content and seed it again.
#
# Copy rules, the same ones patient-web follows: nothing about doses or specific
# medications, no crisis language (so it never trips the safety net in PLAN.md), and
# no "taper" or outcome promises. Posts are patients sharing their own experience,
# never advice about anyone else's care.

ASSETS = ENV.fetch("QMD_SEED_ASSETS")
SEED_EMAIL_DOMAIN = "seed.localhost.test"
SEED_FIELD = "qmd_seed"

# Pseudonyms in the same shape DiscourseConnect gives real patients. These members have
# no SSO record, so nobody can sign in as them.
MEMBERS = %w[patient-5b21c7e0 patient-a93f0d42 patient-7e6d18bc patient-c04a9f31 patient-2d8e5a76]

# QuickMD design-system colors (src/app/globals.css).
CATEGORIES = [
  { name: "Introductions", color: "178199", emoji: "wave", description: "New here? Say hello and share as much or as little as you like." },
  { name: "Wins", color: "3FC2AB", emoji: "tada", description: "Milestones, big and small. Show up for each other." },
  { name: "Visits and refills", color: "00A2B2", emoji: "speech_balloon", description: "Tips for video visits, refills, and the pharmacy. For questions about your own care, message your care team in the QuickMD app." },
  { name: "Day to day", color: "F0B535", emoji: "sunrise", description: "Routines, rough patches, and what helps." },
]

WELCOME = <<~MD
  ![QuickMD Together|1600x560](%<hero>s)

  **Welcome to QuickMD Together.** Everyone here is a QuickMD patient, and everyone shows up under a private username, never their real name.

  - **Introduce yourself** in [Introductions](/c/introductions), as much or as little as you like.
  - **Share a win** in [Wins](/c/wins). Small ones count.
  - **Swap tips** about video visits, refills, and the pharmacy in [Visits and refills](/c/visits-and-refills).

  This is peer support, not medical advice. For anything about your own care, message your care team in the QuickMD app. If you're in crisis, call or text **988**, or call **911**.
MD

TOPICS = [
  {
    category: "Introductions",
    author: 0,
    days_ago: 12,
    title: "New here, one month in with QuickMD",
    raw: <<~MD,
      Hi all. I started with QuickMD about a month ago and finally worked up the nerve to post.

      My first video visit was from my car on a lunch break, which I did not expect to work as well as it did. My member advocate called the next week just to check in, and honestly that's what made me stick with it.

      How long have you all been with QuickMD?
    MD
    replies: [
      { author: 1, raw: "Welcome! Almost a year for me. The car-on-lunch-break visit is a classic. I've done more than I can count." },
      { author: 3, raw: "Glad you posted. Eight months here. The check-in calls meant a lot to me early on too." },
    ],
  },
  {
    category: "Wins",
    author: 2,
    days_ago: 8,
    title: "Shout-out to my member advocate",
    raw: <<~MD,
      I just wrapped up my six months with my member advocate and wanted to say it somewhere people would get it.

      She never once made me feel judged. When I missed a visit in month two, she didn't lecture me. She helped me find a time that actually worked with my shifts. I haven't missed one since.
    MD
    replies: [
      { author: 0, raw: "This is so good to read. Mine just reached out for the first time last week." },
      { author: 4, raw: "Same experience here. Having someone who's been there makes a huge difference." },
    ],
  },
  {
    category: "Visits and refills",
    author: 4,
    days_ago: 5,
    title: "How do you stay on top of refill timing?",
    raw: <<~MD,
      I keep cutting it close with my refills and scrambling at the pharmacy. What's your system?

      Right now I'm just relying on the app notification, which I keep swiping away.
    MD
    replies: [
      { author: 1, raw: "I put a calendar reminder for a few days before my recurring visit, not the day of. That buffer saved me more than once." },
      { author: 3, raw: "I also call my pharmacy the morning after my visit to make sure it came through. Takes two minutes." },
    ],
  },
  {
    category: "Visits and refills",
    author: 3,
    days_ago: 3,
    title: "Taking video visits from work without anyone overhearing",
    raw: <<~MD,
      My visits land during the workday and my office is open plan. Where do you all take yours?

      I've been using a supply closet, but I'm not sure it counts as a long-term plan.
    MD
    replies: [
      { author: 2, raw: "Car in the parking lot, every time. Headphones in, windows up." },
      { author: 0, raw: "I book a small meeting room and just call it a 1:1. Nobody has ever asked." },
    ],
  },
  {
    category: "Day to day",
    author: 1,
    days_ago: 1,
    title: "What helps on the hard evenings?",
    raw: <<~MD,
      Evenings are my rough stretch, especially after 8pm when the house gets quiet.

      So far a walk around the block and texting my sister help. What's on your list?
    MD
    replies: [
      { author: 4, raw: "I keep a puzzle going on the kitchen table. Twenty minutes of that resets my head." },
      { author: 2, raw: "Cooking something that takes a while. Chopping vegetables is weirdly calming." },
    ],
  },
  {
    category: "Wins",
    author: 3,
    days_ago: 2,
    title: "Six weeks of showing up to every visit",
    raw: <<~MD,
      Small one, but it's mine: six weeks in a row, no missed or rescheduled visits.

      What helped was putting the visit in my phone as a recurring event with a 30-minute alert, and setting out a glass of water and my notes before I sign on. It's a tiny ritual, and it makes the visit feel like something I'm doing for me.
    MD
    replies: [
      { author: 0, raw: "Six weeks is a real streak. I love the ritual idea, stealing it." },
      { author: 2, raw: "Congrats! The notes-ready trick is underrated." },
      { author: 4, raw: "This made my morning. Keep going." },
    ],
  },
  {
    category: "Introductions",
    author: 4,
    days_ago: 4,
    title: "Hello from someone who works nights",
    raw: <<~MD,
      Long-time lurker, first-time poster. I work overnight shifts, so my "morning" is your evening and most of my visits happen when everyone else is winding down.

      Are there other night-shift folks here? Would love to hear how you fit the schedule around sleep.
    MD
    replies: [
      { author: 1, raw: "Welcome! Overnight for two years here. I book my visits right after I wake up, before the day gets away from me." },
      { author: 3, raw: "Not nights, but my hours are all over the place. Booking the same weekday and time each week made things click for me." },
    ],
  },
  {
    category: "Day to day",
    author: 0,
    days_ago: 6,
    title: "Small routines that actually stuck",
    raw: <<~MD,
      I've tried a lot of big overhauls that lasted about four days. What's worked are the tiny ones: a glass of water when I wake up, ten minutes outside at lunch, and a text to one friend every night.

      What's on your list of tiny things that stuck?
    MD
    replies: [
      { author: 2, raw: "Making the bed. It sounds silly but it gives the day a first win." },
      { author: 1, raw: "Music on while I cook dinner. That's it. That's the routine." },
      { author: 4, raw: "Stretching for two minutes before I get out of bed. Zero willpower required." },
    ],
  },
  {
    category: "Visits and refills",
    author: 1,
    days_ago: 9,
    title: "Your first video visit: what I wish I'd known",
    raw: <<~MD,
      For anyone nervous about their first video visit, here's what I'd tell my past self:

      - Test your camera and sound five minutes early. The app walks you through it.
      - Find a spot with decent light and a door that closes.
      - Write down two or three things you want to talk about so you don't blank.
      - It's a normal conversation. Your provider has seen it all.
    MD
    replies: [
      { author: 3, raw: "The write-it-down tip is the one. I had a note open on my phone for my first three visits." },
      { author: 0, raw: "Wish I'd read this a month ago. Sharing it with my sister who starts next week." },
    ],
  },
]

def upload(filename, type)
  File.open(File.join(ASSETS, filename)) do |file|
    UploadCreator.new(file, filename, type: type, for_site_setting: type != "composer").create_for(Discourse.system_user.id)
  end
end

system = Discourse.system_user

# --reset: remove what an earlier seed created, including the first, generic version.
if ENV["QMD_SEED_RESET"] == "1"
  seeded_users = User.where("username IN (?)", MEMBERS)
  Topic.where(user_id: seeded_users.select(:id)).find_each { |t| PostDestroyer.new(system, t.first_post, context: "QuickMD sample content reset").destroy if t.first_post }
  (CATEGORIES.map { |c| c[:name] } + ["Using QuickMD"]).each do |name|
    Category.find_by(name: name)&.then { |c| c.topics.where.not(id: c.topic_id).none? ? c.destroy! : nil }
  end
  puts "Removed earlier sample content."
end

# Branding: logo, favicon, and a QuickMD color scheme on the default theme.
SiteSetting.logo = upload("logo.png", "logo") if SiteSetting.logo.blank? || ENV["QMD_SEED_RESET"] == "1"
SiteSetting.logo_small = upload("logo-small.png", "logo_small") if SiteSetting.logo_small.blank? || ENV["QMD_SEED_RESET"] == "1"
SiteSetting.favicon = SiteSetting.logo_small if SiteSetting.favicon.blank?

scheme = ColorScheme.find_by(name: "QuickMD") || ColorScheme.create_from_base(
  name: "QuickMD",
  colors: {
    "primary" => "253845",           # deep-navy-80, body text
    "secondary" => "FFFFFF",
    "tertiary" => "178199",          # coastal-blue-50, links and primary buttons
    "quaternary" => "00A2B2",        # primary-coastal-blue
    "header_background" => "FFFFFF",
    "header_primary" => "253845",
    "highlight" => "F0B535",         # amber-50
    "success" => "006268",           # emerald-50
    "love" => "E45735",
  },
)
Theme.find_by(id: SiteSetting.default_theme_id)&.update!(color_scheme_id: scheme.id)

# The banner is capped at 180px and shows the whole post; this shows just the hero,
# full width, with the welcome text left for the topic itself. Its rounded corners, shadow,
# and where it shows live in discourse-theme/common/common.scss.
BRANDING_CSS = <<~SCSS
  #banner { max-height: none; overflow: visible; padding: 0; background: transparent; position: relative; }
  #banner #banner-content > :not(.lightbox-wrapper) { display: none; }
  #banner .lightbox-wrapper, #banner .lightbox, #banner img { display: block; width: 100%; height: auto; }
  #banner .lightbox { pointer-events: none; }
  #banner .lightbox .meta { display: none; }
  #banner .floated-buttons { position: absolute; top: 8px; right: 8px; z-index: 1; }
  #banner .floated-buttons .d-icon { color: #ffffff; }
SCSS
component = Theme.find_by(name: "QuickMD branding") ||
  Theme.create!(name: "QuickMD branding", user_id: Discourse::SYSTEM_USER_ID, component: true)
component.set_field(target: :common, name: :scss, value: BRANDING_CSS)
component.save!
default_theme = Theme.find(SiteSetting.default_theme_id)
default_theme.add_relative_theme!(:child, component) unless default_theme.child_themes.include?(component)

# The welcome topic Discourse creates on install becomes the hero banner.
welcome = Topic.find_by(id: SiteSetting.welcome_topic_id)
if welcome && !welcome.first_post.raw.include?("QuickMD Together|1600x560")
  hero = upload("community-hero.png", "composer")
  PostRevisor.new(welcome.first_post).revise!(
    system,
    { title: "Welcome to QuickMD Together", raw: format(WELCOME, hero: hero.short_url) },
    skip_validations: true,
    bypass_bump: true,
  )
  welcome.reload.make_banner!(system)
end
# Bring the hero back for anyone who closed it, so every demo starts with it showing.
UserProfile.where(dismissed_banner_key: welcome.id).update_all(dismissed_banner_key: nil) if welcome

patients = Group.find_by(name: "patients")
members = MEMBERS.each_with_index.map do |username, i|
  User.find_by(username: username) || begin
    user = User.create!(
      username: username,
      email: "member#{i + 1}@#{SEED_EMAIL_DOMAIN}",
      password: SecureRandom.hex(20),
      active: true,
      approved: true,
      trust_level: TrustLevel[1],
    )
    user.email_tokens.update_all(confirmed: true)
    patients&.add(user)
    user
  end
end

categories = CATEGORIES.each_with_index.to_h do |attrs, position|
  category = Category.find_by(name: attrs[:name]) ||
    Category.create!(name: attrs[:name], color: attrs[:color], text_color: "FFFFFF", user: system, position: position)
  category.update!(description: attrs[:description]) if category.description.blank?
  category.update!(style_type: :emoji, emoji: attrs[:emoji]) if attrs[:emoji] && category.emoji != attrs[:emoji]
  category.topic&.first_post&.then do |about|
    PostRevisor.new(about).revise!(system, { raw: attrs[:description] }, skip_validations: true) unless about.raw == attrs[:description]
  end
  [attrs[:name], category]
end
# Show the new categories in the sidebar: the default covers future members, and the
# updater covers everyone who already exists, including the test patient.
sidebar_ids = categories.values.map(&:id)
SiteSetting.default_navigation_menu_categories = sidebar_ids.join("|")
User.real.find_each { |u| SidebarSectionLinksUpdater.update_category_section_links(u, category_ids: sidebar_ids) }

created = 0
TOPICS.each do |t|
  next if Topic.where(title: t[:title], deleted_at: nil).exists?

  at = t[:days_ago].days.ago
  post = PostCreator.create!(
    members[t[:author]],
    title: t[:title],
    raw: t[:raw],
    category: categories[t[:category]].id,
    created_at: at,
    skip_validations: true,
  )
  t[:replies].each_with_index do |reply, i|
    PostCreator.create!(
      members[reply[:author]],
      topic_id: post.topic_id,
      raw: reply[:raw],
      created_at: at + (i + 1) * 3.hours,
      skip_validations: true,
    )
  end
  created += 1
end

puts "Seeded #{created} new topic(s); #{TOPICS.size - created} already existed."

# Engagement, so the forum reads as lived-in: views on every topic and a few likes on
# each seeded post. Deterministic, and safe to re-run (a member can only like a post once).
seeded_topics = Topic.where(user_id: members.map(&:id), deleted_at: nil).order(:id).to_a
welcome&.update_columns(views: [welcome.views, 212].max)
seeded_topics.each_with_index do |topic, i|
  topic.update_columns(views: [topic.views, 18 + (i * 37) % 130].max)
  topic.posts.order(:post_number).each do |post|
    likers = members.reject { |m| m.id == post.user_id }.first(post.post_number == 1 ? 3 : 1 + (i + post.post_number) % 2)
    likers.each { |m| PostActionCreator.like(m, post) }
  end
end
puts "Added views and likes to #{seeded_topics.size} topic(s)."
