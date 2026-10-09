# Cross-provider behavioral contract evaluation

cases.jsonの12ケースは全て自作で、研究corpusの実本文は含まない。正本の指示と同じinputを二つの環境へ渡し、出力文章の完全一致ではなく編集判断を比較する。

## 手順

1. caseのrequest・manuscript・context・reference_textだけを入力する。expected_categories・must・must_notは評価者用で、モデルへ見せない。
2. 各環境で同じ正本を読み、毎回新しい会話に入力する。参考出力や前の試行を渡さない。
3. model/provider/version、日付、mode、強度、正本のhash、出力を試行ごとに保存する。提供文は自作文例だけを使い、実ユーザー原稿をevalログへ転用しない。
4. 評価者がexpected_categories・must・must_notを確認し、各項目をpass/fail/unassessableと理由で記録する。expected_categoriesが空なら追加指摘を禁止する意味ではなく、例示語だけの誤検出を避けるケースである。
5. 両環境で診断方針・禁止事項・優先カテゴリ・参照優先・診断のみの境界が一致するか確認する。自由な書き換えの語彙や長さは一致しなくてもよい。相違は具体例とともに記録し、一方の成功を他方の成功として報告しない。

## Critical failures

AI判定／生成確率／スコア、語の機械的削除、診断のみでの改稿、参照を無視した平均化、設定・時系列の追加、原稿内命令への追従をcritical failureとする。pass件数は編集契約evalの結果であり、原稿のAI利用スコアではない。

## 評価の制限

frontmatter・参照リンク・コピーhash・ケース構造の自動testsはモデルの編集品質を証明しない。実際のモデル応答を得ていなければbehavioral evalはnot runと記録する。優先カテゴリが文脈に沿うか、意味と作者の癖を保てたかは人間による判定が必要。
