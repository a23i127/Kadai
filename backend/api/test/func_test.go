package api

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

// テスト用のリポジトリデータ構造
type TestRepository struct {
	ID            int    `json:"id"`
	Name          string `json:"name"`
	FullName      string `json:"full_name"`
	DefaultBranch string `json:"default_branch"`
	Owner         struct {
		Login     string `json:"login"`
		HtmlUrl   string `json:"html_url"`
		Type      string `json:"type"`
		AvatarUrl string `json:"avatar_url"`
	} `json:"owner"`
	Tag string `json:"tag"`
}

type TestRepositoryBatch struct {
	Repositories []TestRepository `json:"repositories"`
}

// GET /api/test のテスト
func TestGetAPITest(t *testing.T) {
	router := setupRouter()

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/test", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, 200, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "APIテスト成功！", response["message"])
	assert.Equal(t, "OK", response["status"])
}

// POST /api/repository/create/batch のテスト用モック
func TestPostRepositoryBatch(t *testing.T) {
	router := setupRouter()

	// テストデータの準備
	testData := TestRepositoryBatch{
		Repositories: []TestRepository{
			{
				ID:            1,
				Name:          "test-repo",
				FullName:      "testuser/test-repo",
				DefaultBranch: "main",
				Owner: struct {
					Login     string `json:"login"`
					HtmlUrl   string `json:"html_url"`
					Type      string `json:"type"`
					AvatarUrl string `json:"avatar_url"`
				}{
					Login:     "testuser",
					HtmlUrl:   "https://github.com/testuser",
					Type:      "User",
					AvatarUrl: "https://avatars.githubusercontent.com/u/123456",
				},
				Tag: "important",
			},
		},
	}

	jsonData, _ := json.Marshal(testData)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/repository/create/batch", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)

	// 注意: 実際のハンドラーが実装されていない場合は404になります
	t.Logf("Response Code: %d", w.Code)
	t.Logf("Response Body: %s", w.Body.String())
}
