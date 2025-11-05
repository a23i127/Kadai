package auth

import (
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

func Auth(req *http.Request) {
	// .envファイルを読み込む（既に読み込まれていれば2重読み込みは無害）
	_ = godotenv.Load(".env")

	if tok := os.Getenv("GITHUB_TOKEN"); tok != "" {
		req.Header.Set("Authorization", "Bearer "+tok)
	} else {
		println("WARNING: GITHUB_TOKEN not found in environment variables")
	}
	req.Header.Set("Accept", "application/vnd.github+json")
}
