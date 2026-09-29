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

ENV_FILE="$APP_DIR/.env.local"
env_value() { grep -E "^$1=" "$ENV_FILE" 2>/dev/null | tail -1 | cut -d= -f2-; }

# Replaces or appends KEY=value in .env.local. Portable across BSD and GNU sed by not using sed.
set_env() {
  local tmp
  tmp="$(mktemp)"
  grep -v -E "^$1=" "$ENV_FILE" > "$tmp" 2>/dev/null || true
  echo "$1=$2" >> "$tmp"
  mv "$tmp" "$ENV_FILE"
}

# Starts .env.local from the template and fills in what setup can decide on its own.
ensure_env() {
  [ -f "$ENV_FILE" ] || { cp "$APP_DIR/.env.example" "$ENV_FILE"; echo "Created .env.local from .env.example."; }
  [ -n "$(env_value QUICKMD_API_URL)" ] || set_env QUICKMD_API_URL "https://patient-web-api.gimli.quickmd.dev/"
  [ -n "$(env_value DISCOURSE_URL)" ] || set_env DISCOURSE_URL "http://localhost:$PORT"
  if [ -z "$(env_value DISCOURSE_CONNECT_SECRET)" ]; then
    set_env DISCOURSE_CONNECT_SECRET "$(openssl rand -hex 32)"
    echo "Generated DISCOURSE_CONNECT_SECRET in .env.local."
  fi
}

preflight() {
  if ! docker info >/dev/null 2>&1; then
    echo "Docker isn't running. On a Mac: brew install colima docker && colima start --cpu 4 --memory 12 --disk 60" >&2
    exit 1
  fi
  local mem
  mem="$(docker info -f '{{.MemTotal}}')"
  if [ "$mem" -lt 11000000000 ]; then
    echo "Warning: Docker has $((mem / 1073741824)) GB of memory. Discourse's asset build needs about 12 GB;" >&2
    echo "with less it gets killed and takes the server down. Colima: colima stop && colima start --memory 12" >&2
  fi
}

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
  ensure_env
  local secret new_key=false
  secret="$(env_value DISCOURSE_CONNECT_SECRET)"
  # A key's plaintext is only readable when it's created, so issue a fresh one if we don't have it.
  [ -n "$(env_value DISCOURSE_API_KEY)" ] || new_key=true

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

description = "Hackathon app: log patients out on sign-out"
if $new_key || !ApiKey.exists?(description: description)
  ApiKey.where(description: description).destroy_all
  key = ApiKey.create!(description: description, created_by_id: Discourse::SYSTEM_USER_ID)
  puts "DISCOURSE_API_KEY=#{key.key}"
end
RUBY

  local output
  output="$(dexec bin/rails runner tmp/qmd-setup.rb)"
  rm -f "$DISCOURSE_DIR/tmp/qmd-setup.rb"
  local api_key
  api_key="$(printf '%s\n' "$output" | grep '^DISCOURSE_API_KEY=' | cut -d= -f2- || true)"
  if [ -n "$api_key" ]; then
    set_env DISCOURSE_API_KEY "$api_key"
    echo "Saved a new DISCOURSE_API_KEY to .env.local. Restart npm run dev to pick it up."
  fi
  echo "Configured DiscourseConnect against $APP_URL."
}

case "${1:-}" in
  setup)
    preflight
    ensure_env
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
  configure) preflight; configure ;;
  start) preflight; start_container; start_server ;;
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
