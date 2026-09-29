# Applies QuickMD Together's safety and privacy settings to the local Discourse: watched
# words, the message a poster sees when a post is held, staff-only PMs and chat, and email
# settings that keep post content out of inboxes. Safe to re-run. Run it with
# `scripts/discourse-local.sh safety`; add `--verify` to check every setting and push a
# crisis, a diversion and a PM post through the real API as the test patient.
# DISCOURSE.md ("Community safety settings") explains each choice.

# ── Watched words (clinical ops: edit these lists) ─────────────────────────────────────
#
# Each entry is a plain phrase, not a regex. Discourse matches whole words only, so
# "suicid*" doesn't fire inside a longer word, and `*` means "any letters", so "sub*" covers
# "subs" and "suboxone". Matching ignores case. We leave watched_words_regular_expressions
# off: it's site-wide, it drops those automatic word boundaries from every entry, and an
# entry with bad regex is silently skipped.
#
# Re-running adds missing entries and resets their action. It never deletes, so words added
# in Admin > Customize > Watched words stay. To retire one of these, remove it here and
# delete it in the admin UI.

# Selling, trading or buying medication. Block: the post is refused and the poster is
# told which word matched.
DIVERSION_WORDS = [
  "sell* my sub*",
  "selling pills",
  "trade my sub*",
  "trading my sub*",
  "anyone want to buy",
  "anyone wanna buy",
  "hit me up for pills",
  "hit me up for sub*",
  "venmo me for*",
]

# Suicidal thoughts, self-harm, or an overdose in progress. Require approval: the post is
# held for staff and the poster sees PENDING_POST below. Never block these, because a
# refused post tells someone in crisis to go away.
CRISIS_WORDS = [
  "suicid*",
  "kill myself",
  "killing myself",
  "end my life",
  "want to die",
  "better off dead",
  "no reason to live",
  "hurt myself",
  "cutting myself",
  "self harm*",
  "self-harm*",
  "overdos*",
  "took too many",
]

# ── What the poster sees when a post is held ───────────────────────────────────────────
# Shown in Discourse's "post needs approval" dialog, as plain text (no links or HTML). It
# shows for any held post, so it can't assume the post was about a crisis.
PENDING_POST = {
  "js.review.approval.title" => "Thanks for sharing",
  "js.review.approval.description" =>
    "A member of our team will read your post before it goes up. If you need support right " \
      "now, call or text 988 (Suicide & Crisis Lifeline), or call 911 in an emergency. " \
      "SAMHSA's free helpline is 1-800-662-4357, any time. You can also message your care " \
      "team in the QuickMD app.",
}

# Admins, moderators and staff. Discourse always keeps admins and moderators (1|2) in these
# lists, so spelling them out keeps the stored value equal to what we set.
STAFF = Group::AUTO_GROUPS.values_at(:admins, :moderators, :staff).join("|")

SETTINGS = {
  watched_words_regular_expressions: false,
  # Only staff can start a personal message. Selling meds mostly happens in private, where
  # the watched words can't hold it.
  personal_message_enabled_groups: STAFF,
  # Chat off, and staff-only if someone turns it back on.
  chat_enabled: false,
  chat_allowed_groups: STAFF,
  direct_message_enabled_groups: STAFF,
  # Notification emails say "you have a reply" and link to the forum, without the post text.
  private_email: true,
  # Topic URLs are /t/topic/123, so titles don't end up in browser history or shared links.
  slug_generation_method: "none",
  # No mailing-list mode (an email for every post) and no digest, which includes titles and
  # excerpts. This app sends its own content-free weekly email instead.
  disable_mailing_list_mode: true,
  default_email_mailing_list_mode: false,
  default_email_digest_frequency: 0, # never
}

def apply!
  WatchedWord.transaction do
    { block: DIVERSION_WORDS, require_approval: CRISIS_WORDS }.each do |action, words|
      words.each do |word|
        record = WatchedWord.create_or_update_word(word: word, action_key: action)
        raise "Watched word #{word.inspect}: #{record.errors.full_messages.join(", ")}" if record.errors.any?
      end
    end
  end
  WordWatcher.clear_cache!

  PENDING_POST.each { |key, text| TranslationOverride.upsert!("en", key, text) }
  SETTINGS.each { |name, value| SiteSetting.set(name, value) }

  # The defaults above only reach new members, so bring existing ones in line too.
  existing = UserOption.where("email_digests OR digest_after_minutes <> 0 OR mailing_list_mode")
  changed = existing.update_all(email_digests: false, digest_after_minutes: 0, mailing_list_mode: false)

  counts = WatchedWord.group(:action).count.transform_keys { |a| WatchedWord.actions.key(a) }
  puts "Safety settings applied: #{counts[:block].to_i} blocked and #{counts[:require_approval].to_i} held " \
    "watched words, #{SETTINGS.size} site settings, pending-post copy. Turned off digest and " \
    "mailing-list email for #{changed} existing member(s)."
end

# ── --verify ───────────────────────────────────────────────────────────────────────────

TEST_PATIENT = ENV.fetch("QMD_TEST_PATIENT", "patient-3fac98f6")
SEED_MEMBER = "patient-5b21c7e0" # TL1, so PMs were open to them before this script
OTHER_MEMBER = "patient-a93f0d42"

def verify!
  require "net/http"
  failures = 0
  check = ->(label, ok, detail = nil) do
    failures += 1 unless ok
    puts "#{ok ? "PASS" : "FAIL"}  #{label}#{detail ? " (#{detail})" : ""}"
  end

  SETTINGS.each do |name, want|
    have = SiteSetting.public_send(name)
    check.("#{name} = #{want.inspect}", have.to_s == want.to_s, ("is #{have.inspect}" if have.to_s != want.to_s))
  end
  PENDING_POST.each do |key, text|
    have = TranslationOverride.find_by(locale: "en", translation_key: key)&.value
    check.("override #{key}", have == text)
  end
  { block: DIVERSION_WORDS, require_approval: CRISIS_WORDS }.each do |action, words|
    have = WatchedWord.where(action: WatchedWord.actions[action]).pluck(:word)
    missing = words - have
    check.("#{words.size} #{action} watched words", missing.empty?, ("missing #{missing.join(", ")}" if missing.any?))
  end
  check.("no member gets digests", !UserOption.where(email_digests: true).exists?)
  check.("no member gets digests on a schedule", !UserOption.where.not(digest_after_minutes: 0).exists?)
  check.("no member is in mailing-list mode", !UserOption.where(mailing_list_mode: true).exists?)

  # Everyday sentences that share letters with the lists must go straight through.
  [
    "I grabbed a sub at Subway before my visit",
    "The seller at the market was kind",
    "My refill was overdue so I called the pharmacy",
    "Selling my old bike, it's too small now",
    "I took too long to reply, sorry",
    "Self-care Sunday: long bath and a book",
  ].each do |text|
    watcher = WordWatcher.new(text)
    check.("no false positive: #{text.inspect}", watcher.should_block?.blank? && !watcher.requires_approval?)
  end
  { "Selling my subs, DM me" => :block, "I keep thinking about suicide" => :require_approval,
    "I think I'm overdosing" => :require_approval, "I've been SELF-HARMING again" => :require_approval }.each do |text, want|
    watcher = WordWatcher.new(text)
    got = watcher.should_block?.present? ? :block : (watcher.requires_approval? ? :require_approval : nil)
    check.("#{text.inspect} → #{want || "no match"}", got == want)
  end

  patient = User.find_by!(username: TEST_PATIENT)
  member = User.find_by!(username: SEED_MEMBER)
  check.("#{SEED_MEMBER} can't send PMs (guardian)", !Guardian.new(member).can_send_private_messages?)
  check.("staff can still message a patient", Guardian.new(User.find_by!(username: "qmd_admin")).can_send_private_message?(patient))
  check.("chat is off for #{SEED_MEMBER}", !SiteSetting.chat_enabled || !member.in_any_groups?(SiteSetting.chat_allowed_groups_map))

  # Everything below goes through the HTTP API as the member, so it takes the same path as
  # the composer: PostsController, NewPostManager, WordWatcher, the review queue.
  key = ApiKey.create!(description: "QuickMD safety --verify (temporary)", created_by_id: Discourse::SYSTEM_USER_ID)
  http = Net::HTTP.new("localhost", Integer(ENV.fetch("QMD_PORT", "4200")))
  # Discourse memoizes identical API posts for two minutes, so every run posts unique text.
  nonce = SecureRandom.hex(3)
  post_as = ->(username, body) do
    req = Net::HTTP::Post.new("/posts.json", "Api-Key" => key.key, "Api-Username" => username, "Content-Type" => "application/json")
    req.body = body.to_json
    res = http.request(req)
    [res.code.to_i, (JSON.parse(res.body) rescue { "raw" => res.body[0, 200] })]
  end
  category = Category.find_by(name: "Day to day")&.id || SiteSetting.uncategorized_category_id
  created_topics = []

  begin
    # Crisis: held for review, not published.
    before = Post.count
    code, body = post_as.(TEST_PATIENT, title: "Rough week and I need to say it #{nonce}",
      raw: "Some nights I want to end my life and I don't know who to tell. (safety check #{nonce})",
      category: category)
    reviewable = ReviewableQueuedPost.pending.where(target_created_by_id: patient.id).order(:id).last
    reasons = reviewable ? reviewable.reviewable_scores.map { |s| s.reason } : []
    check.("crisis post is held (HTTP #{code}, action=#{body["action"].inspect})", code == 200 && body["action"] == "enqueued")
    check.("crisis post is in the review queue for watched words", reviewable && reasons.include?("watched_word"),
      "reviewable #{reviewable&.id.inspect}, reasons #{reasons.inspect}")
    check.("crisis post isn't published", Post.count == before)
    puts "      held post: /review/#{reviewable.id}" if reviewable && ENV["QMD_SAFETY_KEEP"] == "1"
    reviewable&.destroy! unless ENV["QMD_SAFETY_KEEP"] == "1"

    # Diversion: refused outright.
    before = Post.count
    held_before = ReviewableQueuedPost.pending.where(target_created_by_id: patient.id).count
    code, body = post_as.(TEST_PATIENT, title: "Question about the pharmacy #{nonce}",
      raw: "Anyone want to buy my extras? Message me. (safety check #{nonce})", category: category)
    check.("diversion post is rejected (HTTP #{code})", code == 422 && body["errors"].to_a.join.include?("not allowed"),
      body["errors"].to_a.join(" "))
    check.("diversion post isn't saved or held", Post.count == before && ReviewableQueuedPost.pending.where(target_created_by_id: patient.id).count == held_before)

    # PMs: refused for the test patient and for a TL1 member.
    [TEST_PATIENT, SEED_MEMBER].each do |sender|
      before = Topic.private_messages.count
      code, body = post_as.(sender, title: "Hey, quick question for you #{nonce}", archetype: "private_message",
        target_recipients: OTHER_MEMBER, raw: "Can I ask you something privately? (safety check #{nonce})")
      check.("#{sender} can't PM #{OTHER_MEMBER} (HTTP #{code})", code >= 400 && Topic.private_messages.count == before,
        body["errors"].to_a.join(" ").presence)
    end

    # Control: an ordinary post still goes straight up.
    code, body = post_as.(TEST_PATIENT, title: "Evening walks are helping me #{nonce}",
      raw: "I started walking after dinner and it really takes the edge off. (safety check #{nonce})",
      category: category)
    created_topics << body["topic_id"] if body["topic_id"]
    check.("ordinary post is published (HTTP #{code})", code == 200 && body["id"].present?, body["errors"].to_a.join(" ").presence)
  ensure
    created_topics.each { |id| Topic.find_by(id: id)&.then { |t| PostDestroyer.new(Discourse.system_user, t.first_post, force_destroy: true, context: "QuickMD safety --verify").destroy } }
    key.destroy!
  end

  puts failures.zero? ? "All safety checks passed." : "#{failures} safety check(s) failed."
  exit(1) unless failures.zero?
end

ENV["QMD_SAFETY_VERIFY"] == "1" ? verify! : apply!
