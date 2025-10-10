package auth

import (
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

func Auth(req *http.Request) {
	// .envファイルを読み込む（既に読み込まれていれば2重読み込みは無害）
	_ = godotenv.Load("backend/.env")
	if tok := os.Getenv("GH_TOKEN"); tok != "" {
		req.Header.Set("Authorization", "Bearer "+tok)
	}
	req.Header.Set("Accept", "application/vnd.github+json")
}
