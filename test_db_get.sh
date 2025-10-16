#!/bin/bash

# DBから取得するAPIのテスト専用スクリプト
echo "🗃️  Database GET API テスト"
echo "================================"

BASE_URL="http://localhost:3030/api"

# カラーコード
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "\n${BLUE}💾 データベース保存済みデータの取得テスト${NC}"

# 1. 保存済みリポジトリ一覧を取得
echo -e "\n${YELLOW}[1] リポジトリ一覧取得${NC}"
echo "GET $BASE_URL/db/repos"
curl -s "$BASE_URL/db/repos" | jq . 2>/dev/null || curl -s "$BASE_URL/db/repos"

# リポジトリIDを動的に取得
REPO_ID=$(curl -s "$BASE_URL/db/repos" | jq -r '.[0].id' 2>/dev/null)
echo "使用するリポジトリID: $REPO_ID"

# 2. 特定リポジトリのファイル・ディレクトリ構造を取得
echo -e "\n${YELLOW}[2] リポジトリID=${REPO_ID}のルートディレクトリ${NC}"
echo "GET $BASE_URL/db/fileordir/$REPO_ID/"
curl -s "$BASE_URL/db/fileordir/$REPO_ID/" | jq . 2>/dev/null || curl -s "$BASE_URL/db/fileordir/$REPO_ID/"

echo -e "\n${YELLOW}[3] リポジトリID=${REPO_ID}のsrcディレクトリ${NC}"
echo "GET $BASE_URL/db/fileordir/$REPO_ID/src"
curl -s "$BASE_URL/db/fileordir/$REPO_ID/src" | jq . 2>/dev/null || curl -s "$BASE_URL/db/fileordir/$REPO_ID/src"

echo -e "\n${YELLOW}[4] リポジトリID=${REPO_ID}のREADME.md${NC}"
echo "GET $BASE_URL/db/fileordir/$REPO_ID/README.md"
curl -s "$BASE_URL/db/fileordir/$REPO_ID/README.md" | jq . 2>/dev/null || curl -s "$BASE_URL/db/fileordir/$REPO_ID/README.md"

echo -e "\n${YELLOW}[5] リポジトリID=${REPO_ID}のcoreディレクトリ${NC}"
echo "GET $BASE_URL/db/fileordir/$REPO_ID/core"
curl -s "$BASE_URL/db/fileordir/$REPO_ID/core" | jq . 2>/dev/null || curl -s "$BASE_URL/db/fileordir/$REPO_ID/core"

echo -e "\n${YELLOW}[6] リポジトリID=${REPO_ID}のpom.xml${NC}"
echo "GET $BASE_URL/db/fileordir/$REPO_ID/pom.xml"
curl -s "$BASE_URL/db/fileordir/$REPO_ID/pom.xml" | jq . 2>/dev/null || curl -s "$BASE_URL/db/fileordir/$REPO_ID/pom.xml"

# 3. 詳細なファイル情報を取得
echo -e "\n${YELLOW}[7] 詳細ファイル情報 - .github ディレクトリ${NC}"
echo "GET $BASE_URL/db/fileordir/$REPO_ID/.github"
curl -s "$BASE_URL/db/fileordir/$REPO_ID/.github" | jq . 2>/dev/null || curl -s "$BASE_URL/db/fileordir/$REPO_ID/.github"

echo -e "\n${YELLOW}[8] 詳細ファイル情報 - extensions ディレクトリ${NC}"
echo "GET $BASE_URL/db/fileordir/$REPO_ID/extensions"
curl -s "$BASE_URL/db/fileordir/$REPO_ID/extensions" | jq . 2>/dev/null || curl -s "$BASE_URL/db/fileordir/$REPO_ID/extensions"

echo -e "\n${BLUE}🔍 データ検証${NC}"

# 4. データ検証
echo -e "\n${YELLOW}[9] データ統計確認${NC}"
REPO_COUNT=$(curl -s "$BASE_URL/db/repos" | jq 'length' 2>/dev/null || echo "ERROR")
echo "保存済みリポジトリ数: $REPO_COUNT"

ROOT_FILES=$(curl -s "$BASE_URL/db/fileordir/$REPO_ID/" | jq 'length' 2>/dev/null || echo "ERROR")
echo "リポジトリ${REPO_ID}のルートファイル・ディレクトリ数: $ROOT_FILES"

SRC_FILES=$(curl -s "$BASE_URL/db/fileordir/$REPO_ID/src" | jq 'length' 2>/dev/null || echo "ERROR")
echo "リポジトリ${REPO_ID}のsrcディレクトリ内数: $SRC_FILES"

echo -e "\n${GREEN}✅ DBテスト完了${NC}"
echo "================================"
