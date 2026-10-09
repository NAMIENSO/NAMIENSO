# AI共同執筆・作者文体復元 / author-voice-restorer

このSkillはAI文章を判定するものではありません。
AI共同執筆時に生じうる文章の均質化、説明過多、人物声の希薄化などを編集上の問題として検査し、作者固有の文体へ戻すことを目的とします。

## Canonical source

正本は `skills/author-voice-restorer/`。各環境へ同じファイルをコピーし、別のSKILL.mdを書かない。frontmatterはname/descriptionのみ。モデルAPI、MCP、固有tool syntax、dynamic context injection、subagent frontmatterに依存しない。

```text
skills/author-voice-restorer/
├── SKILL.md
├── README.md
├── references/
│   ├── editing-principles.md
│   ├── diagnostics.md
│   ├── author-voice.md
│   └── research-background.md
├── examples/
│   ├── diagnosis-only.md
│   ├── standard-rewrite.md
│   └── voice-restore.md
└── evals/
    ├── README.md
    └── cases.json
```

全資料は[SKILL.md](SKILL.md)から一段で参照する。参照原稿なしのStructural Cleanup、人物・場面設定を使うContextual Editing、作者自身の参照を最優先するAuthor Voice Restoreの3モード。強度はlight/standard/aggressive、既定standard。

## Install / verify（Windows・PowerShell）

リポジトリrootから、PyYAMLのあるPython 3.12以降で実行する。本workspaceのvenvを利用できる。symlinkは不要。

```powershell
.\.venv\Scripts\python.exe scripts/install_skill.py --target all-project
.\.venv\Scripts\python.exe scripts/verify_skill.py
# PowerShell wrapperでも同じcopy → verify
.\scripts\install.ps1 -Target all-project
```

| target | コピー先 |
|---|---|
| codex-project | `.codex/skills/author-voice-restorer/` と `.agents/skills/author-voice-restorer/` |
| claude-project | `.claude/skills/author-voice-restorer/` |
| all-project | 上記3ディレクトリ |
| codex-user | `~/.agents/skills/author-voice-restorer/` |
| claude-user | `~/.claude/skills/author-voice-restorer/` |

`--project-root`で別workspaceを指定できる。user-levelは明示したtargetだけを変更する。未インストールのverifyはnot installedと表示する。

2026-10-09に確認した[Codex公式資料](https://learn.chatgpt.com/docs/build-skills)では、現在のrepo/user自動発見先は`.agents/skills` / `~/.agents/skills`。要件の`.codex/skills`も同期するが、そのパス単独での現行自動発見は保証しない。旧runtimeの`.codex/skills`と混同せず、codex-projectは現行発見先にも同じbytesを置く。

installerは全targetの競合を事前確認する。`.skill-sync.json`に前回copyした相対pathとSHA256を記録し、前回管理済み・未変更のstaleファイルだけ削除する。無関係なユーザーファイルを残し、未管理の異なる同名ファイル・ユーザー変更済みファイルは上書きしない。symlink/junction・path traversal・case collisionを拒否する。force上書き・ディレクトリ全体の削除はない。

各fileは一時fileからreplaceし、コピー後hashを照合する。OSのI/O障害時に全targetをまとめてrollbackするtransactionではない。失敗時は原因を解消してverifyし、手作業の変更を無断で消さない。

## Codex

project installationは上記codex-projectを使う。CLI / IDEでは`$author-voice-restorer`をpromptに含めるか`/skills`から選ぶ。desktopのUIによってはSkill選択の@ mentionを使う。見つからなければ再起動して確認する。descriptionに合う編集依頼では自動選択も可能。[公式の呼び出し仕様](https://learn.chatgpt.com/docs/build-skills)

```text
$author-voice-restorer
この小説のAIっぽさを消して。standardで該当部分を直して。
（原稿を添える）
```

## Claude Code

project installationは`.claude/skills/author-voice-restorer/`。[公式skills資料](https://code.claude.com/docs/en/skills)のnameによるslash invocationとdescriptionによる自動発見を使う。適用されるproject設定や同名personal Skill等によって発見・優先順位は変わる。

```text
/author-voice-restorer
診断だけして。本文は直さないで。
（原稿を添える）
```

## 使用例

- **A**「この小説のAIっぽさを消して。」→ standard cleanup。AI判定へ進まず、文章編集として必要な範囲を改稿する。[例](examples/standard-rewrite.md)
- **B**「診断だけして。本文は直さないで。」→ diagnosis only。部分改稿も勝手に提示しない。[例](examples/diagnosis-only.md)
- **C**「この過去作を私の文体の参考にして、新しい原稿を私らしい文章へ戻して。」→ Author Voice Restore。自作の参照原稿と新原稿を分けて提供する。[例](examples/voice-restore.md)

作者参照は地の文・人物台詞を区別し、どの作品／場面の声を優先するか指定できる。平均文長や句読点を数値で合わせるのではなく、省略、語りの距離、短文、情報順、ユーモア等の選択を参考にする。参照がなければ作者の文体を捏造しない。

主な診断は説明重複、読者が分かる内容の再説明、過剰な主体再提示、連続する汎用反応、抽象語への逃避、接続の過説明、末尾要約、場面に合わない単調さ、交換可能な台詞、場面固有性の薄さ、作者参照からの逸脱。特定語句や反応の禁止リストではない。

## Cross-provider behavioral contract

出力文章の完全一致は要求しない。両環境で診断方針、禁止事項、優先修正カテゴリ、AI判定をしないこと、作者参照優先、診断だけなら改稿しないことが一致すべきである。

YOMIKUSA研究では小標本の候補は不安定で、題材・genre・作者・作品構成を変えると差が消えることがあった。複数ジャンルへ一般化する単純な特徴は確認されず、差の不在も立証していない。単語ブラックリスト、特定記号の増減、AI臭スコア、生成確率、利用推定を提供しない。[研究背景](references/research-background.md)

## Tests / eval

```powershell
.\.venv\Scripts\python.exe -m pytest tests/test_skill_portability.py -q -p no:cacheprovider --basetemp=data/skill_tests
.\.venv\Scripts\python.exe scripts/verify_skill.py
```

自作12ケースは[eval手順](evals/README.md)と[cases.json](evals/cases.json)に保存。expected項目は評価者専用で、モデルへの入力には含めない。AI生成を判定するgraderではなく編集契約の評価である。

静的検証と同期testsは実モデルの編集品質を保証しない。実際に両環境の出力を比較していなければcross-provider behavioral evalはnot run。文脈の解釈・修正案・確信度はモデルによって異なりうる。短い参照から作者全体を推測せず、設定不足で意味が変わりうる編集には不確実さを示す。

標準形式は[Agent Skills specification](https://agentskills.io/specification)を参照。研究本文や実ユーザー原稿をこのSkillの例・fixturesへ転用しない。Skill全文をAGENTS.md / CLAUDE.mdへ複製しない。
