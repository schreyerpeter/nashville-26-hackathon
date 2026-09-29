# Seeds the local Discourse with a handful of sample members, categories, and topics so
# the forum looks lived-in for demos. Safe to re-run: everything is found by name first.
# Run it with `scripts/discourse-local.sh seed`.
#
# The content is deliberately ordinary peer support. Nothing mentions doses, medications,
# or crisis, so it never trips the safety net in PLAN.md.

SEED_EMAIL_DOMAIN = "seed.localhost.test"

# Pseudonyms in the same shape DiscourseConnect gives real patients. These members have
# no SSO record, so nobody can sign in as them.
MEMBERS = %w[patient-5b21c7e0 patient-a93f0d42 patient-7e6d18bc patient-c04a9f31 patient-2d8e5a76]

CATEGORIES = [
  { name: "Introductions", color: "0E76BD", description: "Say hello and share as much or as little as you like." },
  { name: "Wins", color: "3AB54A", description: "Milestones, big and small." },
  { name: "Day to day", color: "F1592A", description: "Routines, rough patches, and what helps." },
  { name: "Using QuickMD", color: "8C6238", description: "Tips for visits, the app, and the pharmacy. For questions about your own care, message your provider." },
]

TOPICS = [
  {
    category: "Introductions",
    author: 0,
    days_ago: 12,
    title: "Hi from Tennessee, three months in",
    raw: <<~MD,
      Hi everyone. I've been with QuickMD for about three months and finally decided to say hello.

      I work nights, so video visits have been the only way I could make treatment fit. Mostly I'm here to read, but I'd love to hear how long other people have been at it and what surprised you early on.
    MD
    replies: [
      { author: 1, raw: "Welcome! Almost a year for me. What surprised me was how much easier the second month was than the first. Glad you're here." },
      { author: 3, raw: "Fellow night-shift person here. Early-morning visits right after work have been a lifesaver." },
    ],
  },
  {
    category: "Wins",
    author: 2,
    days_ago: 6,
    title: "90 days today",
    raw: <<~MD,
      Nothing dramatic, I just wanted to tell people who'd get it: 90 days today.

      I made myself a proper breakfast and took the long way to work. Small, but it felt like mine.
    MD
    replies: [
      { author: 0, raw: "That's huge. The long way to work is a great way to mark it." },
      { author: 4, raw: "Congratulations! Saving this for when I hit mine." },
    ],
  },
  {
    category: "Day to day",
    author: 3,
    days_ago: 4,
    title: "What do you do on the hard evenings?",
    raw: <<~MD,
      Evenings are my rough stretch, especially after 8pm when the house gets quiet.

      So far a walk around the block and texting my sister help. What's on your list?
    MD
    replies: [
      { author: 1, raw: "I keep a puzzle going on the kitchen table. Twenty minutes of that resets my head." },
      { author: 2, raw: "Cooking something that takes a while. Chopping vegetables is weirdly calming." },
    ],
  },
  {
    category: "Using QuickMD",
    author: 4,
    days_ago: 3,
    title: "Tips for getting more out of video visits",
    raw: <<~MD,
      A few things that made my visits go better:

      - Write your questions down during the week, because I always forget in the moment
      - Have your pharmacy's name and address handy
      - Sit somewhere quiet with the light in front of you, not behind

      Anything you'd add?
    MD
    replies: [
      { author: 0, raw: "Check your camera and mic five minutes early. Saved me a scramble more than once." },
    ],
  },
  {
    category: "Day to day",
    author: 1,
    days_ago: 1,
    title: "Sleep routines that actually helped",
    raw: <<~MD,
      My sleep was all over the place for the first few weeks. What finally worked for me was boring: the same bedtime every night, phone charging in the kitchen, and a paperback instead of scrolling.

      Curious whether anyone else found something that stuck.
    MD
    replies: [
      { author: 3, raw: "Phone in another room was the big one for me too. Took a week to stop reaching for it." },
    ],
  },
]

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

categories = CATEGORIES.to_h do |attrs|
  category = Category.find_by(name: attrs[:name]) ||
    Category.create!(name: attrs[:name], color: attrs[:color], user: Discourse.system_user)
  category.update!(description: attrs[:description]) if category.description.blank?
  [attrs[:name], category]
end

created = 0
TOPICS.each do |t|
  next if Topic.exists?(title: t[:title])

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
