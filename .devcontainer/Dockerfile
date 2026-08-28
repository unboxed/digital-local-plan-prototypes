FROM node:lts-trixie

# Use bash with pipefail
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

ARG TZ
ENV TZ="$TZ"

ARG CLAUDE_CODE_VERSION=latest

# Install useful tools (sudo intentionally omitted for security)
RUN apt-get update && apt-get install -y --no-install-recommends \
  dnsutils \
  docker-cli \
  fd-find \
  fzf \
  gh \
  git \
  gnupg2 \
  jq \
  less \
  lsof \
  man-db \
  nano \
  pipx \
  procps \
  psmisc \
  ripgrep \
  unzip \
  vim \
  zsh \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Ensure default node user has access to /usr/local/share
RUN mkdir -p /usr/local/share/npm-global && \
  chown -R node:node /usr/local/share

# Persist bash history.
RUN SNIPPET="export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
  && mkdir /commandhistory \
  && touch /commandhistory/.bash_history \
  && chown -R node:node /commandhistory

# Set `DEVCONTAINER` environment variable to help with orientation
ENV DEVCONTAINER=true

# Create workspace and config directories and set permissions
RUN mkdir -p /workspace /home/node/.claude && \
  chown -R node:node /workspace /home/node/.claude

WORKDIR /workspace

ARG GIT_DELTA_VERSION=0.18.2
RUN ARCH=$(dpkg --print-architecture) && \
  wget "https://github.com/dandavison/delta/releases/download/${GIT_DELTA_VERSION}/git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb" && \
  dpkg -i "git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb" && \
  rm "git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb"

# Set up non-root user
USER node

# Install global packages
ENV NPM_CONFIG_PREFIX=/usr/local/share/npm-global
ENV PATH=$PATH:/usr/local/share/npm-global/bin

# Set the default shell to zsh rather than sh
ENV SHELL=/bin/zsh

# Set the default editor and visual
ENV EDITOR=nano
ENV VISUAL=nano

# Install uv to manage
RUN pipx install uv
ENV PATH="$PATH:/home/node/.local/bin"

# Default powerline10k theme
ARG ZSH_IN_DOCKER_VERSION=1.2.0
RUN sh -c "$(wget -O- https://github.com/deluan/zsh-in-docker/releases/download/v${ZSH_IN_DOCKER_VERSION}/zsh-in-docker.sh)" -- \
  -p git \
  -p fzf \
  -a "source /usr/share/doc/fzf/examples/key-bindings.zsh" \
  -a "source /usr/share/doc/fzf/examples/completion.zsh" \
  -a "export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
  -x

# Install Claude
RUN npm install -g @anthropic-ai/claude-code@${CLAUDE_CODE_VERSION}

# Security hardening script – sourced from shell rc file before the interactive guard
# See the "VS Code IPC hardening" section for why this is needed
RUN <<EOF
mkdir -p /home/node/.config && cat << 'HARDEN' > /home/node/.config/security-harden.sh
unset VSCODE_IPC_HOOK_CLI VSCODE_GIT_IPC_HANDLE GIT_ASKPASS \
      VSCODE_GIT_ASKPASS_MAIN VSCODE_GIT_ASKPASS_NODE VSCODE_GIT_ASKPASS_EXTRA_ARGS \
      REMOTE_CONTAINERS_IPC REMOTE_CONTAINERS_SOCKETS REMOTE_CONTAINERS_DISPLAY_SOCK \
      WAYLAND_DISPLAY
export BROWSER= SSH_AUTH_SOCK= GPG_AGENT_INFO=
HARDEN
EOF

RUN sed -i '1i source ~/.config/security-harden.sh 2>/dev/null || true' ~/.bashrc
RUN sed -i '1i source ~/.config/security-harden.sh 2>/dev/null || true' ~/.zshrc

RUN <<EOF
mkdir -p /home/node/.config/gh && cat << 'GITCONFIG' > /home/node/.gitconfig
[credential "https://github.com"]
        helper =
        helper = !/usr/bin/gh auth git-credential
[credential "https://gist.github.com"]
        helper =
        helper = !/usr/bin/gh auth git-credential
GITCONFIG
EOF
