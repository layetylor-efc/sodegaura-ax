# わびすけ 添付画像の反映手順

更新：2026-10-16

## 対象画像

- ユーザー提供：`1000022106.png`（実際の画像形式：JPEG、1536×1152）
- Web表示用：`wabisuke-user-hero.webp`（1024×768、約143 KiB）
- 生成した配布用ZIP：`wabisuke-image-deploy-package.zip`

## GitHub Pagesでの配置先

リポジトリ：`layetylor-efc/sodegaura-ax`  
ファイル名：**`assets/wabisuke-user-hero.webp`**

WebP画像の実ファイルがこのパスに存在すれば、`wabisuke-ai.html` のメイン画像およびトップのわびすけ紹介画像を自動で置換します。未配置・読み込み失敗時は既存の`assets/wabisuke-summer-ai.svg`を表示し、画像の破損表示を避けます。

## QA項目

1. `assets/wabisuke-user-hero.webp` をリポジトリへアップロード後、GitHub Pagesワークフローが成功すること。
2. 専用ページに**実際の添付画像**が4:3の比率で切り取られず表示されること。
3. トップページの紹介画像も同じ画像に変わること。
4. 画面幅360px、768px、1280pxで画像のはみ出しや文字への重なりがないこと。
5. フォントサイズ小／中／大、Top復帰、NCO公式リンク、映画と実在のAIの区別の記述を保持すること。
6. フォールバックが発動した場合、専用ページに「代替のオリジナルSVG画像を表示中」と明示されること。

**状態：WebPファイルのGitHubへのアップロードは未完了。HTML側の参照とフォールバックのみ反映済み。** テスト未実施の項目を合格と記録しない。
