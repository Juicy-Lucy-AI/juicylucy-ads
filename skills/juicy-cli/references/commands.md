# juicy command reference

Generated from the CLI's command specs; do not edit by hand.

Global flags on every command: `--human`, `--compact`, `--progress`, `--api-url <url>`, `--help`, `--request-schema`, `--response-schema`, `--version`.

| Command | Purpose |
|---|---|
| `~/.juicylucy/bin/juicy auth help` | How to sign a user in or up — read this before asking them for anything |
| `~/.juicylucy/bin/juicy auth login` | Sign in, or sign up, with a one-time code sent by email |
| `~/.juicylucy/bin/juicy auth status` | Show the signed-in account and balance |
| `~/.juicylucy/bin/juicy auth logout` | End the local session and delete the credentials file |
| `~/.juicylucy/bin/juicy credits balance` | Show the account's credit balance |
| `~/.juicylucy/bin/juicy credits usage` | Credits spent, grouped by campaign, model, variant or day |
| `~/.juicylucy/bin/juicy credits packs` | List the credit packs this account can buy |
| `~/.juicylucy/bin/juicy credits topup` | Create a payment link for a credit pack; a human pays it in a browser |
| `~/.juicylucy/bin/juicy credits topup status` | Show a top-up; with --wait, wait until it is paid |
| `~/.juicylucy/bin/juicy catalog list` | List roles, the models each offers, and what every model is best for |
| `~/.juicylucy/bin/juicy catalog get` | Show one model's catalog row (price, limits, guidance), or its input schema |
| `~/.juicylucy/bin/juicy image generate` | Generate a first frame from a prompt |
| `~/.juicylucy/bin/juicy image edit` | Edit a reference image with an instruction |
| `~/.juicylucy/bin/juicy video generate` | Animate an approved first frame into a clip |
| `~/.juicylucy/bin/juicy audio music` | Generate a soundtrack |
| `~/.juicylucy/bin/juicy audio voiceover` | Generate a voiceover (text-to-speech) |
| `~/.juicylucy/bin/juicy job get` | Show a job; with --wait, poll it; with --project, freeze its output |
| `~/.juicylucy/bin/juicy job cancel` | Cancel a queued or running job |
| `~/.juicylucy/bin/juicy sample list` | List the free sample assets (no sign-in needed) |
| `~/.juicylucy/bin/juicy sample get` | Download a sample into the project and record it (zero credits) |
| `~/.juicylucy/bin/juicy manifest verify` | Check that every manifest record points at a frozen local file |
| `~/.juicylucy/bin/juicy doctor` | Check the local setup: credentials, API, contract, catalog, samples, project |
| `~/.juicylucy/bin/juicy completion` | Print a shell completion script |
| `~/.juicylucy/bin/juicy skill` | Write the generated SKILL.md and command reference for agents |

### `~/.juicylucy/bin/juicy auth help`

How to sign a user in or up — read this before asking them for anything Prints the sign-in method this version supports and the exact steps to follow, for an existing account and for a new one: what to ask the user for, the commands to run, and what never to do with what they gave you. Callers follow this rather than remembering a mechanism, because it changes between versions.

```
~/.juicylucy/bin/juicy auth help
```

Exit codes: 0 ok · 1 API/network · 2 usage · 3 sign-in needed

Network: none; this command runs locally.

Example:

```bash
~/.juicylucy/bin/juicy auth help
```

### `~/.juicylucy/bin/juicy auth login`

Sign in, or sign up, with a one-time code sent by email Two steps without a terminal: --email alone emails a one-time code to the address; --email with --code signs in. An address with no account gets a sign-up code instead (new_account: true): entering it creates the account and accepts the Terms and Privacy Policy, both linked in the email and in the output. On a terminal, prompts for the email and then the code. An account that was given a password signs in with --password-stdin instead. Writes ~/.juicylucy/juicy/credentials (mode 0600).

```
~/.juicylucy/bin/juicy auth login [options]
```

| Flag | Type | Required | Default | Values | Description |
|---|---|---|---|---|---|
| `--email <email>` | string |  |  |  | Account email. Without --code, emails a one-time code to it (a sign-up code if it has no account) |
| `--code <code>` | string |  |  |  | The code from the email; signs in, and for a sign-up code creates the account first |
| `--password-stdin` | boolean |  | off |  | For an account that was given a password: read it from the first line of stdin (on a terminal, prompts with echo off) |

Exit codes: 0 ok · 1 API/network · 2 usage · 3 sign-in needed

Network: required. In a sandbox that blocks the network, allow it before running this command.

Example:

```bash
~/.juicylucy/bin/juicy auth login --email you@example.com
```

### `~/.juicylucy/bin/juicy auth status`

Show the signed-in account and balance

```
~/.juicylucy/bin/juicy auth status
```

Exit codes: 0 ok · 1 API/network · 2 usage · 3 sign-in needed

Network: required. In a sandbox that blocks the network, allow it before running this command.

### `~/.juicylucy/bin/juicy auth logout`

End the local session and delete the credentials file

```
~/.juicylucy/bin/juicy auth logout
```

Exit codes: 0 ok · 1 API/network · 2 usage · 3 sign-in needed

Network: required. In a sandbox that blocks the network, allow it before running this command.

### `~/.juicylucy/bin/juicy credits balance`

Show the account's credit balance

```
~/.juicylucy/bin/juicy credits balance
```

Exit codes: 0 ok · 1 API/network · 2 usage · 3 sign-in needed

Network: required. In a sandbox that blocks the network, allow it before running this command.

### `~/.juicylucy/bin/juicy credits usage`

Credits spent, grouped by campaign, model, variant or day

```
~/.juicylucy/bin/juicy credits usage [options]
```

| Flag | Type | Required | Default | Values | Description |
|---|---|---|---|---|---|
| `--group-by <campaign|model|variant|day>` | string |  | "campaign" | campaign \| model \| variant \| day | Grouping |
| `--since <yyyy-mm-dd>` | string |  |  |  | ISO date; default 30 days ago |
| `--limit <n>` | integer |  | 100 |  | Rows per page |
| `--cursor <cursor>` | string |  |  |  | Continue from a previous next_cursor |
| `--fields <a,b>` | string |  |  |  | Comma-separated fields to keep in the output |

Exit codes: 0 ok · 1 API/network · 2 usage · 3 sign-in needed

Network: required. In a sandbox that blocks the network, allow it before running this command.

Example:

```bash
~/.juicylucy/bin/juicy credits usage --group-by campaign --since 2026-09-01
```

### `~/.juicylucy/bin/juicy credits packs`

List the credit packs this account can buy 1 000 credits = $1.00. Show the packs to the user and let them choose; then `~/.juicylucy/bin/juicy credits topup --pack <id>`.

```
~/.juicylucy/bin/juicy credits packs
```

Exit codes: 0 ok · 1 API/network · 2 usage · 3 sign-in needed

Network: required. In a sandbox that blocks the network, allow it before running this command.

Example:

```bash
~/.juicylucy/bin/juicy credits packs
```

### `~/.juicylucy/bin/juicy credits topup`

Create a payment link for a credit pack; a human pays it in a browser Returns at once with checkout_url, a Stripe-hosted page. The user chooses the pack and pays; you never ask for, see or enter card details, and you never present a payment link that did not come from this command. Repeating the command for the same pack returns the same open link.

```
~/.juicylucy/bin/juicy credits topup --pack <id> [options]
```

| Flag | Type | Required | Default | Values | Description |
|---|---|---|---|---|---|
| `--pack <id>` | string | yes |  |  | A pack id from `~/.juicylucy/bin/juicy credits packs`, chosen by the user |
| `--idempotency-key <key>` | string |  |  |  | Reuse to make a retry land on the same top-up (default: a new key per call) |

Exit codes: 0 ok · 1 API/network · 2 usage · 3 sign-in needed

Network: required. In a sandbox that blocks the network, allow it before running this command.

Example:

```bash
~/.juicylucy/bin/juicy credits topup --pack usd-25
```

### `~/.juicylucy/bin/juicy credits topup status`

Show a top-up; with --wait, wait until it is paid With --wait: exit 0 once paid (balance_credits is the new balance), exit 4 when still unpaid at --timeout (run `next` again), exit 1 with code topup_unpaid when the link expired or failed.

```
~/.juicylucy/bin/juicy credits topup status <topup_id> [options]
```

Arguments:

- `<topup_id>` — The top-up id

| Flag | Type | Required | Default | Values | Description |
|---|---|---|---|---|---|
| `--wait` | boolean |  | off |  | Poll until the top-up is paid or closed |
| `--timeout <duration>` | string |  | "15m" |  | How long to wait |

Exit codes: 0 ok · 1 API/network · 2 usage · 3 sign-in needed · 4 still running (job JSON on stdout, run `next`)

Network: required. In a sandbox that blocks the network, allow it before running this command.

Example:

```bash
~/.juicylucy/bin/juicy credits topup status <topup_id> --wait
```

### `~/.juicylucy/bin/juicy catalog list`

List roles, the models each offers, and what every model is best for Each role has a default model and, under `models`, the ones --model may pick (id or alias). `models` carries every listed model's price, limits and guidance. With --role, only that role and its models.

```
~/.juicylucy/bin/juicy catalog list [options]
```

| Flag | Type | Required | Default | Values | Description |
|---|---|---|---|---|---|
| `--role <role>` | string |  |  |  | Only this role |
| `--refresh` | boolean |  | off |  | Bypass the one-hour cache |
| `--fields <a,b>` | string |  |  |  | Comma-separated fields to keep in the output |

Exit codes: 0 ok · 1 API/network · 2 usage · 3 sign-in needed

Network: required. In a sandbox that blocks the network, allow it before running this command.

Example:

```bash
~/.juicylucy/bin/juicy catalog list
```

### `~/.juicylucy/bin/juicy catalog get`

Show one model's catalog row (price, limits, guidance), or its input schema Takes a model id or alias. With --request-schema, prints the model's input schema from the provider (what `~/.juicylucy/bin/juicy image generate` ultimately sends). Without a <model>, --request-schema prints this command's own flag schema, like every other command.

```
~/.juicylucy/bin/juicy catalog get <model> [options]
```

Arguments:

- `<model>` — Model id or alias, e.g. kling-3-pro

| Flag | Type | Required | Default | Values | Description |
|---|---|---|---|---|---|
| `--refresh` | boolean |  | off |  | Bypass the one-hour cache |

Exit codes: 0 ok · 1 API/network · 2 usage · 3 sign-in needed

Network: required. In a sandbox that blocks the network, allow it before running this command.

Example:

```bash
~/.juicylucy/bin/juicy catalog get kling-3-pro
```

### `~/.juicylucy/bin/juicy image generate`

Generate a first frame from a prompt Freezes the result under .media/first-frames/<variant>.<ext> and appends the manifest record in the same call. Never overwrites: a repeat with a different seed gets -a2, -a3 …

```
~/.juicylucy/bin/juicy image generate --aspect <9:16|4:5|1:1|16:9|3:4|4:3|2:3|3:2|21:9> --variant <name> [options]
```

| Flag | Type | Required | Default | Values | Description |
|---|---|---|---|---|---|
| `--role <first-frame>` | string |  | "first-frame" | first-frame | Catalog role |
| `--model <id|alias>` | string |  |  |  | Model for this role, by id or alias; `~/.juicylucy/bin/juicy catalog list --role <role>` shows the choices |
| `--prompt <text>` | string |  |  |  | The prompt |
| `--prompt-file <path>` | string |  |  |  | Read the prompt from a file |
| `--project <dir>` | string |  | "." |  | Project directory holding .media/ |
| `--campaign <name>` | string |  |  |  | Campaign label recorded in the manifest and ledger |
| `--max-cost <credits>` | integer |  |  |  | Refuse before submitting if the quote exceeds this many credits |
| `--preset` | boolean |  | on |  | Apply the ad-safe preset: no on-image text, logos or device UI |
| `--force` | boolean |  | off |  | Generate again even if the manifest already has this exact input |
| `--wait` | boolean |  | on |  | Poll until the job finishes |
| `--idempotency-key <key>` | string |  |  |  | Override the idempotency key (defaults to the input hash) |
| `--aspect <9:16|4:5|1:1|16:9|3:4|4:3|2:3|3:2|21:9>` | string | yes |  | 9:16 \| 4:5 \| 1:1 \| 16:9 \| 3:4 \| 4:3 \| 2:3 \| 3:2 \| 21:9 | Aspect ratio |
| `--seed <n>` | integer |  | 1 |  | Seed, recorded in the manifest; --force draws a fresh one unless this is given |
| `--variant <name>` | string | yes |  |  | Variant name; the output is .media/first-frames/<variant>.<ext> |
| `--resolution <0.5K|1K|2K|4K>` | string |  | "1K" | 0.5K \| 1K \| 2K \| 4K | Output resolution; which values a model accepts is in the catalog (default model: 1K, 2K, 4K) |
| `--quality <low|medium|high|xhigh|max>` | string |  | "high" | low \| medium \| high \| xhigh \| max | Rendering quality, on models that take one (the default model does); higher costs more: low for drafts, xhigh or max for finals |
| `--format <png|jpeg|webp>` | string |  | "png" | png \| jpeg \| webp | Output format |
| `--timeout <duration>` | string |  | "5m" |  | How long to wait |

Exit codes: 0 ok · 1 API/network · 2 usage · 3 sign-in needed · 4 still running (job JSON on stdout, run `next`) · 5 insufficient credits

Network: required. In a sandbox that blocks the network, allow it before running this command.

Example:

```bash
~/.juicylucy/bin/juicy image generate --role first-frame --aspect 9:16 --variant v03 --prompt "…" --project .
```

### `~/.juicylucy/bin/juicy image edit`

Edit a reference image with an instruction Uploads the reference image(s) and asks the edit model to change only what the prompt names. The preserve-list belongs in the prompt.

```
~/.juicylucy/bin/juicy image edit --variant <name> --image <path> [options]
```

| Flag | Type | Required | Default | Values | Description |
|---|---|---|---|---|---|
| `--role <first-frame-edit>` | string |  | "first-frame-edit" | first-frame-edit | Catalog role |
| `--model <id|alias>` | string |  |  |  | Model for this role, by id or alias; `~/.juicylucy/bin/juicy catalog list --role <role>` shows the choices |
| `--prompt <text>` | string |  |  |  | The prompt |
| `--prompt-file <path>` | string |  |  |  | Read the prompt from a file |
| `--project <dir>` | string |  | "." |  | Project directory holding .media/ |
| `--campaign <name>` | string |  |  |  | Campaign label recorded in the manifest and ledger |
| `--max-cost <credits>` | integer |  |  |  | Refuse before submitting if the quote exceeds this many credits |
| `--preset` | boolean |  | on |  | Apply the ad-safe preset: no on-image text, logos or device UI |
| `--force` | boolean |  | off |  | Generate again even if the manifest already has this exact input |
| `--wait` | boolean |  | on |  | Poll until the job finishes |
| `--idempotency-key <key>` | string |  |  |  | Override the idempotency key (defaults to the input hash) |
| `--aspect <9:16|4:5|1:1|16:9|3:4|4:3|2:3|3:2|21:9>` | string |  |  | 9:16 \| 4:5 \| 1:1 \| 16:9 \| 3:4 \| 4:3 \| 2:3 \| 3:2 \| 21:9 | Aspect ratio (optional for edits: the default model follows the first reference image, others choose) |
| `--seed <n>` | integer |  | 1 |  | Seed, recorded in the manifest; --force draws a fresh one unless this is given |
| `--variant <name>` | string | yes |  |  | Variant name; the output is .media/first-frames/<variant>.<ext> |
| `--resolution <0.5K|1K|2K|4K>` | string |  | "1K" | 0.5K \| 1K \| 2K \| 4K | Output resolution; which values a model accepts is in the catalog (default model: 1K, 2K, 4K) |
| `--quality <low|medium|high|xhigh|max>` | string |  | "high" | low \| medium \| high \| xhigh \| max | Rendering quality, on models that take one (the default model does); higher costs more: low for drafts, xhigh or max for finals |
| `--format <png|jpeg|webp>` | string |  | "png" | png \| jpeg \| webp | Output format |
| `--timeout <duration>` | string |  | "5m" |  | How long to wait |
| `--image <path>` | string (repeatable) | yes |  |  | Reference image(s), up to 4, uploaded for you |

Exit codes: 0 ok · 1 API/network · 2 usage · 3 sign-in needed · 4 still running (job JSON on stdout, run `next`) · 5 insufficient credits

Network: required. In a sandbox that blocks the network, allow it before running this command.

Example:

```bash
~/.juicylucy/bin/juicy image edit --image .media/references/ref-frame.png --variant v01 --prompt "Same framing, same light. Replace …"
```

### `~/.juicylucy/bin/juicy video generate`

Animate an approved first frame into a clip Image-to-video. The prompt describes only the motion. The default model always generates clip audio and takes 5–15 s. `~/.juicylucy/bin/juicy catalog list --role motion` shows every model, what it is best for and what it costs, and --model picks one. Output: .media/video/<variant>.mp4 with a manifest record whose `from` names the frame.

```
~/.juicylucy/bin/juicy video generate --image <path> --duration <n> --variant <name> [options]
```

| Flag | Type | Required | Default | Values | Description |
|---|---|---|---|---|---|
| `--role <motion>` | string |  | "motion" | motion | Catalog role |
| `--model <id|alias>` | string |  |  |  | Model for this role, by id or alias; `~/.juicylucy/bin/juicy catalog list --role <role>` shows the choices |
| `--image <path>` | string | yes |  |  | The approved first frame (local path, uploaded for you) |
| `--prompt <text>` | string |  |  |  | The prompt |
| `--prompt-file <path>` | string |  |  |  | Read the prompt from a file |
| `--project <dir>` | string |  | "." |  | Project directory holding .media/ |
| `--campaign <name>` | string |  |  |  | Campaign label recorded in the manifest and ledger |
| `--max-cost <credits>` | integer |  |  |  | Refuse before submitting if the quote exceeds this many credits |
| `--preset` | boolean |  | on |  | Apply the ad-safe preset: no on-image text, logos or device UI |
| `--force` | boolean |  | off |  | Generate again even if the manifest already has this exact input |
| `--wait` | boolean |  | on |  | Poll until the job finishes |
| `--idempotency-key <key>` | string |  |  |  | Override the idempotency key (defaults to the input hash) |
| `--duration <n>` | integer | yes |  |  | Clip length in whole seconds; the range depends on the model (default model: 5–15) |
| `--seed <n>` | integer |  | 1 |  | Seed, recorded in the manifest; --force draws a fresh one unless this is given |
| `--variant <name>` | string | yes |  |  | Variant name; the output is .media/video/<variant>.mp4 |
| `--resolution <360p|480p|540p|720p|768p|1080p|4k>` | string |  | "720p" | 360p \| 480p \| 540p \| 720p \| 768p \| 1080p \| 4k | Output resolution; which values a model accepts is in the catalog |
| `--with-audio` | boolean |  | off |  | Let the model generate clip audio, on models with an audio switch (off by default); the default model always generates it |
| `--multi-clip` | boolean |  | off |  | Allow the model's multi-clip camera changes (off by default; models with a multi-clip switch only) |
| `--negative-prompt <text>` | string |  |  |  | Appended to the preset's negative prompt |
| `--timeout <duration>` | string |  | "20m" |  | How long to wait |

Exit codes: 0 ok · 1 API/network · 2 usage · 3 sign-in needed · 4 still running (job JSON on stdout, run `next`) · 5 insufficient credits

Network: required. In a sandbox that blocks the network, allow it before running this command.

Example:

```bash
~/.juicylucy/bin/juicy video generate --image .media/first-frames/v03.png --duration 12 --variant v03 --prompt "slow push-in, hands lift…" --project .
```

### `~/.juicylucy/bin/juicy audio music`

Generate a soundtrack Text-to-music. The model has no seed, so the same prompt does not reproduce the same track; --force is the only way to get a second take and it is recorded as a new attempt. Output: .media/audio/<name>.<ext>.

```
~/.juicylucy/bin/juicy audio music --duration <n> --name <name> [options]
```

| Flag | Type | Required | Default | Values | Description |
|---|---|---|---|---|---|
| `--role <soundtrack>` | string |  | "soundtrack" | soundtrack | Catalog role |
| `--model <id|alias>` | string |  |  |  | Model for this role, by id or alias; `~/.juicylucy/bin/juicy catalog list --role <role>` shows the choices |
| `--prompt <text>` | string |  |  |  | The prompt |
| `--prompt-file <path>` | string |  |  |  | Read the prompt from a file |
| `--project <dir>` | string |  | "." |  | Project directory holding .media/ |
| `--campaign <name>` | string |  |  |  | Campaign label recorded in the manifest and ledger |
| `--max-cost <credits>` | integer |  |  |  | Refuse before submitting if the quote exceeds this many credits |
| `--force` | boolean |  | off |  | Generate again even if the manifest already has this exact input |
| `--wait` | boolean |  | on |  | Poll until the job finishes |
| `--idempotency-key <key>` | string |  |  |  | Override the idempotency key (defaults to the input hash) |
| `--duration <n>` | integer | yes |  |  | Track length in whole seconds |
| `--name <name>` | string | yes |  |  | Track name; the output is .media/audio/<name>.<ext> |
| `--timeout <duration>` | string |  | "10m" |  | How long to wait |

Exit codes: 0 ok · 1 API/network · 2 usage · 3 sign-in needed · 4 still running (job JSON on stdout, run `next`) · 5 insufficient credits

Network: required. In a sandbox that blocks the network, allow it before running this command.

Example:

```bash
~/.juicylucy/bin/juicy audio music --duration 30 --name bed --prompt "upbeat, bright, no vocals" --project .
```

### `~/.juicylucy/bin/juicy audio voiceover`

Generate a voiceover (text-to-speech) Speaks the prompt. The default is ElevenLabs V3 via fal: one voice, mp3, $0.10 per 1000 characters, tags included. Direct delivery in the script with tags such as [whispers], [laughs] or [excited]. Use --model gemini-tts for separate --style instructions, wav/ogg output or multi-speaker dialogue. Use --force for another take, recorded as a new attempt. A wav records its length as duration_seconds. Output: .media/audio/<name>.<ext>.

```
~/.juicylucy/bin/juicy audio voiceover --name <name> [options]
```

| Flag | Type | Required | Default | Values | Description |
|---|---|---|---|---|---|
| `--role <voiceover>` | string |  | "voiceover" | voiceover | Catalog role |
| `--model <id|alias>` | string |  |  |  | Model for this role, by id or alias; `~/.juicylucy/bin/juicy catalog list --role <role>` shows the choices |
| `--prompt <text>` | string |  |  |  | The text to speak, inline delivery tags included |
| `--prompt-file <path>` | string |  |  |  | Read the text to speak from a file |
| `--project <dir>` | string |  | "." |  | Project directory holding .media/ |
| `--campaign <name>` | string |  |  |  | Campaign label recorded in the manifest and ledger |
| `--max-cost <credits>` | integer |  |  |  | Refuse before submitting if the quote exceeds this many credits |
| `--force` | boolean |  | off |  | Generate again even if the manifest already has this exact input |
| `--wait` | boolean |  | on |  | Poll until the job finishes |
| `--idempotency-key <key>` | string |  |  |  | Override the idempotency key (defaults to the input hash) |
| `--voice <voice>` | string |  |  |  | Voice; the model's default when omitted (Rachel on ElevenLabs V3; Kore on Gemini). `~/.juicylucy/bin/juicy catalog get <model>` lists a model's voices |
| `--style <text>` | string |  |  |  | Delivery direction that is not spoken, e.g. "warm and unhurried, British accent" (gemini-tts only; free and not spoken) |
| `--language <language>` | string |  |  |  | Language: an ISO 639-1 code such as en or da on ElevenLabs V3; "English (US)" on Gemini; detected when omitted |
| `--speaker <alias>=<voice>` | string (repeatable) |  |  |  | Multi-speaker (gemini-tts only): <alias>=<voice>, given 2 to 10 times; prompt lines start with the alias ("Host: Welcome back"). Replaces --voice |
| `--temperature <n>` | number |  |  |  | Variation in the delivery: lower is steadier, higher more varied (gemini-tts; its default is 1) |
| `--stability <n>` | number |  |  |  | Voice consistency, 0–1; lower is more expressive (elevenlabs-v3; default 0.5) |
| `--emotion <happy|sad|angry|fearful|disgusted|surprised|neutral>` | string |  |  | happy \| sad \| angry \| fearful \| disgusted \| surprised \| neutral | Emotion of the delivery (minimax-speech) |
| `--speed <n>` | number |  |  |  | Pace, 1 is the model's own (minimax-speech) |
| `--pitch <n>` | integer |  |  |  | Pitch shift in semitones, 0 is the model's own; a negative one as --pitch=-3 (minimax-speech) |
| `--format <wav|mp3|ogg>` | string |  |  | wav \| mp3 \| ogg | Audio format; defaults to mp3 on ElevenLabs V3, wav on Gemini. MiniMax requires --format mp3 |
| `--name <name>` | string | yes |  |  | Voiceover name; the output is .media/audio/<name>.<ext> |
| `--timeout <duration>` | string |  | "5m" |  | How long to wait |

Exit codes: 0 ok · 1 API/network · 2 usage · 3 sign-in needed · 4 still running (job JSON on stdout, run `next`) · 5 insufficient credits

Network: required. In a sandbox that blocks the network, allow it before running this command.

Example:

```bash
~/.juicylucy/bin/juicy audio voiceover --name hook --voice Rachel --prompt "[excited] Fresh juice, at your door by seven." --project .
```

### `~/.juicylucy/bin/juicy job get`

Show a job; with --wait, poll it; with --project, freeze its output The resume path after exit 4. With --project and a succeeded job, downloads the output, freezes it under .media/ and appends the manifest record exactly as the originating command would have.

```
~/.juicylucy/bin/juicy job get <job_id> [options]
```

Arguments:

- `<job_id>` — The job id

| Flag | Type | Required | Default | Values | Description |
|---|---|---|---|---|---|
| `--wait` | boolean |  | off |  | Poll until terminal |
| `--timeout <duration>` | string |  | "20m" |  | How long to wait |
| `--project <dir>` | string |  |  |  | Freeze the output into this project's .media/ |
| `--variant <name>` | string |  |  |  | Override the variant recorded at submit |
| `--name <name>` | string |  |  |  | Override the audio name recorded at submit |
| `--fields <a,b>` | string |  |  |  | Comma-separated fields to keep in the output |

Exit codes: 0 ok · 1 API/network · 2 usage · 3 sign-in needed · 4 still running (job JSON on stdout, run `next`)

Network: required. In a sandbox that blocks the network, allow it before running this command.

Example:

```bash
~/.juicylucy/bin/juicy job get <job_id>
```

### `~/.juicylucy/bin/juicy job cancel`

Cancel a queued or running job

```
~/.juicylucy/bin/juicy job cancel <job_id>
```

Arguments:

- `<job_id>` — The job id

Exit codes: 0 ok · 1 API/network · 2 usage · 3 sign-in needed

Network: required. In a sandbox that blocks the network, allow it before running this command.

### `~/.juicylucy/bin/juicy sample list`

List the free sample assets (no sign-in needed)

```
~/.juicylucy/bin/juicy sample list [options]
```

| Flag | Type | Required | Default | Values | Description |
|---|---|---|---|---|---|
| `--fits <blueprint>` | string |  |  |  | Only samples that fit this blueprint |
| `--kind <image|video|audio>` | string |  |  | image \| video \| audio | Only this kind |
| `--fields <a,b>` | string |  |  |  | Comma-separated fields to keep in the output |

Exit codes: 0 ok · 1 API/network · 2 usage · 3 sign-in needed

Network: required. In a sandbox that blocks the network, allow it before running this command.

Example:

```bash
~/.juicylucy/bin/juicy sample list
```

### `~/.juicylucy/bin/juicy sample get`

Download a sample into the project and record it (zero credits) Verifies the sha256, freezes the file under .media/ like a generated asset, and appends a manifest record with source "juicy-sample". Never overwrites.

```
~/.juicylucy/bin/juicy sample get <sample_id> [options]
```

Arguments:

- `<sample_id>` — From `~/.juicylucy/bin/juicy sample list`

| Flag | Type | Required | Default | Values | Description |
|---|---|---|---|---|---|
| `--project <dir>` | string |  | "." |  | Project directory holding .media/ |
| `--variant <name>` | string |  |  |  | Variant name for an image or video (default: the sample id) |
| `--name <name>` | string |  |  |  | Name for an audio track (default: the sample id) |
| `--force` | boolean |  | off |  | Download again even if the manifest already has this sample |

Exit codes: 0 ok · 1 API/network · 2 usage · 3 sign-in needed

Network: required. In a sandbox that blocks the network, allow it before running this command.

Example:

```bash
~/.juicylucy/bin/juicy sample get person-clapping-9x16-12s --project . --variant v01
```

### `~/.juicylucy/bin/juicy manifest verify`

Check that every manifest record points at a frozen local file The mechanical Step 3 gate: every record's file exists and matches its sha256, nothing references a remote URL, every video's `from` is a recorded first frame. Exit 1 if any check fails.

```
~/.juicylucy/bin/juicy manifest verify [options]
```

| Flag | Type | Required | Default | Values | Description |
|---|---|---|---|---|---|
| `--project <dir>` | string |  | "." |  | Project directory holding .media/ |
| `--require-video` | boolean |  | off |  | Every first-frame variant must also have a video record |
| `--strict` | boolean |  | off |  | Fail records whose source is not juicy or juicy-sample |

Exit codes: 0 ok · 1 API/network · 2 usage · 3 sign-in needed

Network: none; this command runs locally.

Example:

```bash
~/.juicylucy/bin/juicy manifest verify --project .
```

### `~/.juicylucy/bin/juicy doctor`

Check the local setup: credentials, API, contract, catalog, samples, project

```
~/.juicylucy/bin/juicy doctor [options]
```

| Flag | Type | Required | Default | Values | Description |
|---|---|---|---|---|---|
| `--project <dir>` | string |  |  |  | Also check that this project's .media/ is writable |
| `--expect-version <x.y.z>` | string |  |  |  | Fail unless the installed version equals this |

Exit codes: 0 ok · 1 API/network · 2 usage · 3 sign-in needed

Network: required. In a sandbox that blocks the network, allow it before running this command.

Example:

```bash
~/.juicylucy/bin/juicy doctor
```

### `~/.juicylucy/bin/juicy completion`

Print a shell completion script

```
~/.juicylucy/bin/juicy completion <shell>
```

Arguments:

- `<shell>` — bash or zsh

Exit codes: 0 ok · 1 API/network · 2 usage · 3 sign-in needed

Network: none; this command runs locally.

Example:

```bash
eval "$(~/.juicylucy/bin/juicy completion zsh)"
```

### `~/.juicylucy/bin/juicy skill`

Write the generated SKILL.md and command reference for agents Used by the plugin build, not by end users. Writes <dir>/juicy-cli/SKILL.md and <dir>/juicy-cli/references/commands.md from the command specs.

```
~/.juicylucy/bin/juicy skill --dir <path>
```

| Flag | Type | Required | Default | Values | Description |
|---|---|---|---|---|---|
| `--dir <path>` | string | yes |  |  | Output directory |

Exit codes: 0 ok · 1 API/network · 2 usage · 3 sign-in needed

Network: none; this command runs locally.

Example:

```bash
~/.juicylucy/bin/juicy skill --dir ./out
```
