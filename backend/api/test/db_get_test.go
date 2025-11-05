package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

// DB取得系のテスト

// GET /api/db/repos のテスト
func TestGetDBRepos(t *testing.T) {
	router := setupRouter()

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/db/repos", nil)
	router.ServeHTTP(w, req)

	// レスポンスをログ出力
	t.Logf("Response Code: %d", w.Code)
	t.Logf("Response Body: %s", w.Body.String())

	// 200 OK または 404 Not Found を許可（データがない場合）
	assert.True(t, w.Code == 200 || w.Code == 404, "Should return 200 or 404")

	if w.Code == 200 {
		var repos []interface{}
		err := json.Unmarshal(w.Body.Bytes(), &repos)
		assert.NoError(t, err, "Response should be valid JSON array")
		t.Logf("Found %d repositories in database", len(repos))
	}
}

// GET /api/db/fileordir/:repoId/* のテスト
func TestGetDBFileOrDir(t *testing.T) {
	router := setupRouter()

	// テストケース
	testCases := []struct {
		name     string
		path     string
		repoId   string
		filePath string
	}{
		{"Root directory", "/api/db/fileordir/1/", "1", ""},
		{"Src directory", "/api/db/fileordir/1/src", "1", "src"},
		{"README file", "/api/db/fileordir/1/README.md", "1", "README.md"},
		{"Components directory", "/api/db/fileordir/1/src/components", "1", "src/components"},
		{"Button component", "/api/db/fileordir/1/src/components/Button.tsx", "1", "src/components/Button.tsx"},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			req, _ := http.NewRequest("GET", tc.path, nil)
			router.ServeHTTP(w, req)

			t.Logf("Test: %s", tc.name)
			t.Logf("Path: %s", tc.path)
			t.Logf("Response Code: %d", w.Code)
			t.Logf("Response Body: %s", w.Body.String())

			// 200 OK または 404 Not Found を許可
			assert.True(t, w.Code == 200 || w.Code == 404, "Should return 200 or 404")

			if w.Code == 200 {
				var result interface{}
				err := json.Unmarshal(w.Body.Bytes(), &result)
				assert.NoError(t, err, "Response should be valid JSON")
			}
		})
	}
}

// データベース統計テスト
func TestDatabaseStats(t *testing.T) {
	router := setupRouter()

	// リポジトリ数を取得
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/db/repos", nil)
	router.ServeHTTP(w, req)

	if w.Code == 200 {
		var repos []interface{}
		err := json.Unmarshal(w.Body.Bytes(), &repos)
		assert.NoError(t, err)

		t.Logf("Database Statistics:")
		t.Logf("- Total repositories: %d", len(repos))

		// 各リポジトリのファイル・ディレクトリ数を確認
		for i := 1; i <= len(repos) && i <= 3; i++ {
			w2 := httptest.NewRecorder()
			req2, _ := http.NewRequest("GET", fmt.Sprintf("/api/db/fileordir/%d/", i), nil)
			router.ServeHTTP(w2, req2)

			if w2.Code == 200 {
				var items []interface{}
				err := json.Unmarshal(w2.Body.Bytes(), &items)
				if err == nil {
					t.Logf("- Repository %d: %d files/directories", i, len(items))
				}
			}
		}
	} else {
		t.Log("No repositories found in database (this is normal for empty database)")
	}
}
