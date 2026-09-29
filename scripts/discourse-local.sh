#!/usr/bin/env bash
# Runs Discourse's official development container locally, wired to this app's
# DiscourseConnect endpoint. See DISCOURSE.md.
#
#   scripts/discourse-local.sh setup   # first time: start the container, install, migrate, configure
#   scripts/discourse-local.sh start   # start the container and the Discourse dev server
#   scripts/discourse-local.sh stop    # stop both
#   scripts/discourse-local.sh logs    # follow the dev server log
#
# Discourse serves on http://localhost:4200 (not its usual 3000, which this app uses), and
# Mailpit catches every email it sends at http://localhost:8025.
set -euo pipefail

DISCOURSE_DIR="${DISCOURSE_DIR:-$HOME/quickmd/discourse}"
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_URL="${APP_URL:-http://localhost:3000}"
PORT=4200
NAME=discourse_dev
IMAGE=discourse/discourse_dev:release

# Like Discourse's d/exec, minus -it so it also works from scripts.
dexec() { docker exec -u discourse:discourse -w /src "$NAME" "$@"; }

env_value() { grep -E "^$1=" "$APP_DIR/.env.local" 2>/dev/null | tail -1 | cut -d= -f2-; }

ensure_source() {
  [ -d "$DISCOURSE_DIR" ] || git clone --depth 1 https://github.com/discourse/discourse.git "$DISCOURSE_DIR"
}

start_container() {
  if docker ps --format '{{.Names}}' | grep -qx "$NAME"; then return; fi
  if docker ps -a --format '{{.Names}}' | grep -qx "$NAME"; then docker start "$NAME" >/dev/null; return; fi
  mkdir -p "$DISCOURSE_DIR/data/postgres"
  docker run -d \
    -p 127.0.0.1:$PORT:$PORT -p 127.0.0.1:8025:8025 \
    -v "$DISCOURSE_DIR/data/postgres:/shared/postgres_data:delegated" \
    -v "$DISCOURSE_DIR:/src:delegated" \
    -e UNICORN_BIND_ALL=true -e UNICORN_PORT=$PORT \
    --hostname=discourse --name="$NAME" --restart=always \
    "$IMAGE" /sbin/boot >/dev/null
  # Postgres and Redis come up with the container; give them a moment.
  sleep 5
}

start_server() {
  # The image's `mailhog` is Mailpit; Discourse's d/mailhog runs it in the foreground. Dev mail goes to its SMTP on 1025.
  dexec pgrep -x mailhog >/dev/null 2>&1 || docker exec -d -u discourse:discourse "$NAME" mailhog
  if dexec pgrep -f pitchfork >/dev/null 2>&1; then echo "Discourse is already running."; return; fi
  docker exec -d -u discourse:discourse -w /src "$NAME" bash -lc "bin/dev > log/dev-server.log 2>&1"
  echo "Starting Discourse on http://localhost:$PORT (first boot builds assets, a few minutes)..."
  for _ in $(seq 1 120); do
    curl -fs -o /dev/null "http://localhost:$PORT/srv/status" && { echo "Discourse is up."; return; }
    sleep 5
  done
  echo "Still starting; follow it with: $0 logs" >&2
}

configure() {
  local secret
  secret="$(env_value DISCOURSE_CONNECT_SECRET)"
  [ -n "$secret" ] || { echo "Set DISCOURSE_CONNECT_SECRET in .env.local first." >&2; exit 1; }

  cat > "$DISCOURSE_DIR/tmp/qmd-setup.rb" <<RUBY
admin = User.find_by_email("admin@localhost.test") || User.new(email: "admin@localhost.test", username: "qmd_admin")
admin.password = SecureRandom.hex(16)
admin.active = true
admin.approved = true
admin.save!
admin.grant_admin!
admin.email_tokens.update_all(confirmed: true)

group = Group.find_or_initialize_by(name: "patients")
group.full_name = "Patients"
group.visibility_level = Group.visibility_levels[:owners]
group.members_visibility_level = Group.visibility_levels[:owners]
group.save!

{
  title: "QuickMD Community",
  site_description: "A private community for QuickMD patients.",
  contact_email: "admin@localhost.test",
  port: "$PORT",
  login_required: true,
  wizard_enabled: false,
  enable_names: false,
  external_system_avatars_url: "",
  automatically_download_gravatars: false,
  email_editable: false,
  auth_overrides_email: true,
  auth_overrides_username: true,
  discourse_connect_overrides_groups: true,
  maximum_session_age: 720,
  discourse_connect_url: "$APP_URL/api/discourse/sso",
  discourse_connect_secret: "$secret",
  logout_redirect: "$APP_URL/api/discourse/logout",
  enable_discourse_connect: true,
}.each { |k, v| SiteSetting.set(k, v) }

key = ApiKey.where(description: "Hackathon app: log patients out on sign-out").first ||
  ApiKey.create!(description: "Hackathon app: log patients out on sign-out", created_by_id: Discourse::SYSTEM_USER_ID)
puts "DISCOURSE_API_KEY=#{key.key}" if key.key_available?
RUBY

  local output
  output="$(dexec bin/rails runner tmp/qmd-setup.rb)"
  rm -f "$DISCOURSE_DIR/tmp/qmd-setup.rb"
  local api_key
  api_key="$(printf '%s\n' "$output" | grep '^DISCOURSE_API_KEY=' | cut -d= -f2- || true)"
  if [ -n "$api_key" ]; then
    sed -i '' '/^DISCOURSE_API_KEY=/d' "$APP_DIR/.env.local"
    echo "DISCOURSE_API_KEY=$api_key" >> "$APP_DIR/.env.local"
    echo "Saved a new DISCOURSE_API_KEY to .env.local."
  fi
  echo "Configured DiscourseConnect against $APP_URL."
}

case "${1:-}" in
  setup)
    ensure_source
    docker pull "$IMAGE"
    start_container
    mkdir -p "$DISCOURSE_DIR/tmp"
    dexec bundle install
    dexec pnpm install
    dexec bin/rake db:create db:migrate
    configure
    start_server
    ;;
  configure) configure ;;
  start) start_container; start_server ;;
  stop)
    docker stop "$NAME" >/dev/null 2>&1 || true
    echo "Stopped."
    ;;
  logs) tail -f "$DISCOURSE_DIR/log/dev-server.log" ;;
  *)
    sed -n '2,11p' "$0" | sed 's/^# \{0,1\}//'
    exit 1
    ;;
esac
