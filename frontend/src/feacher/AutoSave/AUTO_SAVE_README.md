# 自動保存機能 - ファイル構造

Repository Explorer アプリケーションの自動保存機能は、以下のファイルに分割されています：

## ファイル構成

### 1. 型定義

**`src/feacher/types/autoSaveTypes.tsx`**

- `FileOrDir`: ファイル/ディレクトリの型定義
- `SaveData`: 保存データの型定義
- `AutoSaveConfig`: 自動保存設定の型定義
- `UseAutoSaveOptions`: 自動保存フック用オプションの型定義

### 2. データ保存サービス

**`src/feacher/services/dataSaveService.tsx`**

- `DataSaveService`: データ保存処理を行うクラス
  - `saveAllData()`: 全データを保存
  - `saveRepositories()`: リポジトリデータを保存
  - `saveFileOrDirData()`: ファイル/ディレクトリデータを保存
  - `saveFileOrDirForRepo()`: 特定リポジトリのデータを保存
  - `hasSaveableData()`: 保存対象データの存在チェック

### 3. 自動保存フック

**`src/feacher/hooks/useAutoSave.tsx`**

- `useAutoSave`: 自動保存機能を提供する React フック
  - 定期的な自動保存（デフォルト 30 秒間隔）
  - ブラウザ終了時の自動保存
  - タブ非表示時の自動保存
  - 設定可能なオプション（間隔、イベントの有効/無効）

### 4. メインコンポーネント

**`src/components/DisplayArea.tsx`**

- 自動保存フックを使用
- 簡潔なコード構成
- 保存処理の詳細はサービス層に委譲

## 使用方法

```tsx
// DisplayArea.tsx での使用例
import { useAutoSave } from "../feacher/hooks/useAutoSave";

const DisplayArea = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [allFetchedItemsDict, setAllFetchedItemsDict] = useState<
    Record<number, FileOrDir[]>
  >({});

  // 自動保存フック（設定はオプション）
  useAutoSave({
    repos,
    allFetchedItemsDict,
    intervalMs: 30000, // 30秒間隔（オプション）
    enableBeforeUnload: true, // ブラウザ終了時保存（オプション）
    enableVisibilityChange: true, // タブ非表示時保存（オプション）
  });

  // ...その他のコンポーネント処理
};
```

## 自動保存のタイミング

1. **定期的な自動保存**: 設定された間隔（デフォルト 30 秒）ごと
2. **ブラウザ終了時**: `beforeunload` イベント発生時
3. **タブ非表示時**: `visibilitychange` イベントで `hidden` 状態になった時

## 設定可能なオプション

- `intervalMs`: 定期保存の間隔（ミリ秒）
- `enableBeforeUnload`: ブラウザ終了時の自動保存を有効にするか
- `enableVisibilityChange`: タブ非表示時の自動保存を有効にするか

## エラーハンドリング

- 自動保存でエラーが発生してもユーザー体験を阻害しない
- エラーはコンソールに警告として出力
- 保存処理の失敗は throw されるが、UI 層では catch される

## メリット

1. **関心の分離**: 保存処理と UI 処理を分離
2. **再利用性**: 他のコンポーネントでも使用可能
3. **テスト容易性**: 各機能を独立してテスト可能
4. **保守性**: 機能ごとにファイルが分離され、保守しやすい
5. **設定可能性**: 自動保存の動作を細かく制御可能
