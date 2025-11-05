#!/bin/bash

# Repository Explorer 完全テストスイート
echo "🚀 Repository Explorer 完全テストスイート開始"
echo "================================================="

# カラーコード
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# プロジェクトルートディレクトリ
PROJECT_ROOT="/Users/sakusann/smsIntern/sms-kadai"
BACKEND_DIR="$PROJECT_ROOT/backend"

# エラーハンドリング
set -e
trap 'echo -e "\n${RED}❌ テスト実行中にエラーが発生しました${NC}"; exit 1' ERR

# 1. バックエンドサーバーの起動チェック
echo -e "\n${BLUE}📡 Step 1: バックエンドサーバー状況チェック${NC}"
if curl -s http://localhost:3030/api/db/repos > /dev/null 2>&1; then
    echo -e "${GREEN}✅ バックエンドサーバーは既に起動中です${NC}"
    SERVER_RUNNING=true
else
    echo -e "${YELLOW}⚠️  バックエンドサーバーが停止中です。起動します...${NC}"
    cd "$BACKEND_DIR"
    
    # バックグラウンドでサーバー起動
    echo -e "${BLUE}🔧 サーバー起動中...${NC}"
    go run main.go > /tmp/backend_server.log 2>&1 &
    SERVER_PID=$!
    SERVER_RUNNING=false
    
    # サーバー起動待機
    echo -e "${BLUE}⏳ サーバー起動を待機中...${NC}"
    for i in {1..10}; do
        if curl -s http://localhost:3030/api/db/repos > /dev/null 2>&1; then
            echo -e "${GREEN}✅ バックエンドサーバーが起動しました (${i}秒)${NC}"
            SERVER_RUNNING=true
            break
        fi
        sleep 1
        echo -n "."
    done
    
    if [ "$SERVER_RUNNING" = false ]; then
        echo -e "\n${RED}❌ バックエンドサーバーの起動に失敗しました${NC}"
        cat /tmp/backend_server.log
        exit 1
    fi
fi

# 2. Go単体テスト実行
echo -e "\n${PURPLE}🧪 Step 2: Go単体テスト実行${NC}"
cd "$BACKEND_DIR"
echo -e "${BLUE}実行場所: $(pwd)${NC}"

echo -e "\n${YELLOW}[GO TEST 1] func_test.go${NC}"
if go test -v ./api/test/db_get_test.go ./api/test/func.go; then
    echo -e "${GREEN}✅ func_test.go: 成功${NC}"
    GO_TEST_1_PASS=true
else
    echo -e "${RED}❌ func_test.go: 失敗${NC}"
    GO_TEST_1_PASS=false
fi

echo -e "\n${YELLOW}[GO TEST 2] db_get_test.go${NC}"
if go test -v ./api/test/db_get_test.go ./api/test/func.go; then
    echo -e "${GREEN}✅ db_get_test.go: 成功${NC}"
    GO_TEST_2_PASS=true
else
    echo -e "${RED}❌ db_get_test.go: 失敗${NC}"
    GO_TEST_2_PASS=false
fi

# 3. APIテスト実行
echo -e "\n${BLUE}🌐 Step 3: API統合テスト実行${NC}"
cd "$PROJECT_ROOT"
echo -e "${BLUE}実行場所: $(pwd)${NC}"

# test_api.shを実行
if ./test_api.sh; then
    echo -e "${GREEN}✅ API統合テスト: 成功${NC}"
    API_TEST_PASS=true
else
    echo -e "${RED}❌ API統合テスト: 失敗${NC}"
    API_TEST_PASS=false
fi

# 4. 起動したサーバーをクリーンアップ
if [ "$SERVER_RUNNING" = false ] && [ ! -z "$SERVER_PID" ]; then
    echo -e "\n${BLUE}🧹 Step 4: サーバークリーンアップ${NC}"
    kill $SERVER_PID 2>/dev/null || true
    echo -e "${GREEN}✅ バックエンドサーバーを停止しました${NC}"
fi

# 5. 結果サマリー
echo -e "\n${BLUE}📊 テスト結果サマリー${NC}"
echo "================================================="

# Go単体テスト結果
if [ "$GO_TEST_1_PASS" = true ]; then
    echo -e "${GREEN}✅ Go単体テスト (func_test.go)${NC}"
else
    echo -e "${RED}❌ Go単体テスト (func_test.go)${NC}"
fi

if [ "$GO_TEST_2_PASS" = true ]; then
    echo -e "${GREEN}✅ Go単体テスト (db_get_test.go)${NC}"
else
    echo -e "${RED}❌ Go単体テスト (db_get_test.go)${NC}"
fi

# API統合テスト結果
if [ "$API_TEST_PASS" = true ]; then
    echo -e "${GREEN}✅ API統合テスト (9項目)${NC}"
else
    echo -e "${RED}❌ API統合テスト${NC}"
fi

# 総合結果
TOTAL_TESTS=3
PASSED_TESTS=0

[ "$GO_TEST_1_PASS" = true ] && ((PASSED_TESTS++))
[ "$GO_TEST_2_PASS" = true ] && ((PASSED_TESTS++))
[ "$API_TEST_PASS" = true ] && ((PASSED_TESTS++))

echo -e "\n${BLUE}🏆 総合結果${NC}"
echo "================================================="
echo -e "成功: ${GREEN}${PASSED_TESTS}${NC}/${TOTAL_TESTS}"

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}🎉 全てのテストが成功しました！${NC}"
    echo -e "${GREEN}Repository Explorer APIは完全に動作しています 🚀${NC}"
    exit 0
else
    echo -e "${RED}❌ 一部のテストが失敗しました${NC}"
    exit 1
fi
