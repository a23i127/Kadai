#!/bin/bash

# API テストスクリプト
echo "🚀 Backend API テスト開始"
echo "================================"

BASE_URL="http://localhost:3030/api"

# カラーコード
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n${BLUE}🗑️  テスト前準備: データベースクリア${NC}"
echo "DELETE $BASE_URL/db/delete-all"
DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/db/delete-all")
echo "Response: $DELETE_RESPONSE"
echo -e "${GREEN}✅ データベースがクリアされました${NC}\n"

# テスト結果カウンター
PASSED=0
FAILED=0

# ヘルパー関数: テスト結果を表示
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        ((FAILED++))
    fi
}

# 1. GET /api/db/repos
echo -e "\n${YELLOW}[TEST 1]${NC} GET /api/db/repos"
curl -s -o /tmp/repos_response.json -w "%{http_code}" "$BASE_URL/db/repos" > /tmp/repos_status.txt
STATUS=$(cat /tmp/repos_status.txt)
if [ "$STATUS" = "200" ]; then
    test_result 0 "リポジトリ一覧取得"
    echo "Response: $(cat /tmp/repos_response.json | jq . 2>/dev/null || cat /tmp/repos_response.json)"
else
    test_result 1 "リポジトリ一覧取得 (Status: $STATUS)"
fi

# 2. POST /api/repository/create/batch
echo -e "\n${YELLOW}[TEST 2]${NC} POST /api/repository/create/batch"
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d @backend/api/test/test_data.json \
  -o /tmp/post_response.json \
  -w "%{http_code}" \
  "$BASE_URL/repository/create/batch" > /tmp/post_status.txt
STATUS=$(cat /tmp/post_status.txt)
if [ "$STATUS" = "200" ] || [ "$STATUS" = "201" ]; then
    test_result 0 "リポジトリバッチ作成"
    echo "Response: $(cat /tmp/post_response.json | jq . 2>/dev/null || cat /tmp/post_response.json)"
else
    test_result 1 "リポジトリバッチ作成 (Status: $STATUS)"
    echo "Error Response: $(cat /tmp/post_response.json)"
fi

# 3. POST /api/repository/create/batch (追加テストデータ)
echo -e "\n${YELLOW}[TEST 3]${NC} POST /api/repository/create/batch (追加データ)"
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d @backend/api/test/test_repository_batch.json \
  -o /tmp/post2_response.json \
  -w "%{http_code}" \
  "$BASE_URL/repository/create/batch" > /tmp/post2_status.txt
STATUS=$(cat /tmp/post2_status.txt)
if [ "$STATUS" = "200" ] || [ "$STATUS" = "201" ]; then
    test_result 0 "追加リポジトリバッチ作成"
    echo "Response: $(cat /tmp/post2_response.json | jq . 2>/dev/null || cat /tmp/post2_response.json)"
else
    test_result 1 "追加リポジトリバッチ作成 (Status: $STATUS)"
    echo "Error Response: $(cat /tmp/post2_response.json)"
fi

# 4. POST /api/file-or-dir/create/batch/:repo_id (FileOrDirテストデータ)
echo -e "\n${YELLOW}[TEST 4]${NC} POST /api/file-or-dir/create/batch/1"
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d @backend/api/test/test_fileordir_data.json \
  -o /tmp/fileordir_response.json \
  -w "%{http_code}" \
  "$BASE_URL/file-or-dir/create/batch/1" > /tmp/fileordir_status.txt
STATUS=$(cat /tmp/fileordir_status.txt)
if [ "$STATUS" = "200" ] || [ "$STATUS" = "201" ]; then
    test_result 0 "FileOrDirバッチ作成"
    echo "Response: $(cat /tmp/fileordir_response.json | jq . 2>/dev/null || cat /tmp/fileordir_response.json)"
else
    test_result 1 "FileOrDirバッチ作成 (Status: $STATUS)"
    echo "Error Response: $(cat /tmp/fileordir_response.json)"
fi

# 5. GET /api/orgs/repos
echo -e "\n${YELLOW}[TEST 5]${NC} GET /api/orgs/repos"
curl -s -o /tmp/orgs_response.json -w "%{http_code}" "$BASE_URL/orgs/repos" > /tmp/orgs_status.txt
STATUS=$(cat /tmp/orgs_status.txt)
if [ "$STATUS" = "200" ]; then
    test_result 0 "GitHub組織リポジトリ取得"
    echo "Response: $(cat /tmp/orgs_response.json | jq '.[0:2]' 2>/dev/null || head -200 /tmp/orgs_response.json)"
else
    test_result 1 "GitHub組織リポジトリ取得 (Status: $STATUS)"
fi

# 6. GET /api/db/repos (DBから保存済みリポジトリ取得)
echo -e "\n${YELLOW}[TEST 6]${NC} GET /api/db/repos (保存済みリポジトリ一覧)"
curl -s -o /tmp/db_repos_response.json -w "%{http_code}" "$BASE_URL/db/repos" > /tmp/db_repos_status.txt
STATUS=$(cat /tmp/db_repos_status.txt)
if [ "$STATUS" = "200" ]; then
    test_result 0 "DB保存済みリポジトリ取得"
    echo "Response: $(cat /tmp/db_repos_response.json | jq . 2>/dev/null || cat /tmp/db_repos_response.json)"
    
    # レスポンスからrepo_idを抽出してFileOrDirテストで使用
    REPO_ID=$(cat /tmp/db_repos_response.json | jq -r '.[0].id // 1' 2>/dev/null || echo "1")
    echo "Extracted repo_id for FileOrDir test: $REPO_ID"
else
    test_result 1 "DB保存済みリポジトリ取得 (Status: $STATUS)"
    REPO_ID="1"  # フォールバック値
fi

# 7. GET /api/db/fileordir/:repoId/* (DBからファイル・ディレクトリ取得)
echo -e "\n${YELLOW}[TEST 7]${NC} GET /api/db/fileordir/${REPO_ID}/ (ルートディレクトリ)"
curl -s -o /tmp/db_fileordir_root_response.json -w "%{http_code}" "$BASE_URL/db/fileordir/${REPO_ID}/" > /tmp/db_fileordir_root_status.txt
STATUS=$(cat /tmp/db_fileordir_root_status.txt)
if [ "$STATUS" = "200" ]; then
    test_result 0 "DBファイル・ディレクトリ取得（ルート）"
    echo "Response: $(cat /tmp/db_fileordir_root_response.json | jq . 2>/dev/null || cat /tmp/db_fileordir_root_response.json)"
else
    test_result 1 "DBファイル・ディレクトリ取得（ルート） (Status: $STATUS)"
fi

# 8. GET /api/db/fileordir/:repoId/src (特定パス)
echo -e "\n${YELLOW}[TEST 8]${NC} GET /api/db/fileordir/${REPO_ID}/src (srcディレクトリ)"
curl -s -o /tmp/db_fileordir_src_response.json -w "%{http_code}" "$BASE_URL/db/fileordir/${REPO_ID}/src" > /tmp/db_fileordir_src_status.txt
STATUS=$(cat /tmp/db_fileordir_src_status.txt)
if [ "$STATUS" = "200" ]; then
    test_result 0 "DBファイル・ディレクトリ取得（src）"
    echo "Response: $(cat /tmp/db_fileordir_src_response.json | jq . 2>/dev/null || cat /tmp/db_fileordir_src_response.json)"
else
    test_result 1 "DBファイル・ディレクトリ取得（src） (Status: $STATUS)"
    echo "Note: srcディレクトリが存在しない場合は正常です"
fi

# 9. GET /api/db/fileordir/:repoId/README.md (特定ファイル)
echo -e "\n${YELLOW}[TEST 9]${NC} GET /api/db/fileordir/${REPO_ID}/README.md (READMEファイル)"
curl -s -o /tmp/db_fileordir_readme_response.json -w "%{http_code}" "$BASE_URL/db/fileordir/${REPO_ID}/README.md" > /tmp/db_fileordir_readme_status.txt
STATUS=$(cat /tmp/db_fileordir_readme_status.txt)
if [ "$STATUS" = "200" ]; then
    test_result 0 "DBファイル・ディレクトリ取得（README）"
    echo "Response: $(cat /tmp/db_fileordir_readme_response.json | jq . 2>/dev/null || cat /tmp/db_fileordir_readme_response.json)"
else
    test_result 1 "DBファイル・ディレクトリ取得（README） (Status: $STATUS)"
    echo "Note: README.mdが存在しない場合は正常です"
fi

# テスト結果サマリー
echo -e "\n================================"
echo -e "${GREEN}PASSED: $PASSED${NC}"
echo -e "${RED}FAILED: $FAILED${NC}"
echo -e "TOTAL: $((PASSED + FAILED))"

# クリーンアップ
rm -f /tmp/test_*.json /tmp/test_*.txt /tmp/repos_*.json /tmp/repos_*.txt /tmp/post*.json /tmp/post*.txt /tmp/orgs_*.json /tmp/orgs_*.txt /tmp/fileordir_*.json /tmp/fileordir_*.txt /tmp/db_*.json /tmp/db_*.txt

if [ $FAILED -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}すべてのテストが成功しました！${NC}"
    exit 0
else
    echo -e "\n❌ ${RED}一部のテストが失敗しました${NC}"
    exit 1
fi
