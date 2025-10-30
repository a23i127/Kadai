package get_organization_google

import (
	"io"
	"net/http"
	"net/url"
	"smsIntern/sms-kadai/backend/auth"

	"github.com/gin-gonic/gin"
)

var gh = &http.Client{}

// Google組織固定のリポジトリ一覧API
func ListGoogleRepos(c *gin.Context) {
	owner := "google"       // 常にgoogle固定
	repo := c.Query("repo") // 指定があれば単一リポジトリ取得
	limit := c.DefaultQuery("limit", "10")
	page := c.DefaultQuery("page", "1")

	var u string
	if repo != "" {
		// 特定リポジトリ
		u = "https://api.github.com/repos/" + url.PathEscape(owner) + "/" + url.PathEscape(repo)
	} else {
		// 一覧
		u = "https://api.github.com/orgs/" + url.PathEscape(owner) + "/repos?per_page=" + url.QueryEscape(limit) + "&page=" + url.QueryEscape(page)
	}

	req, _ := http.NewRequest("GET", u, nil)
	auth.Auth(req)

	res, err := gh.Do(req)
	if err != nil {
		c.String(http.StatusBadGateway, err.Error())
		return
	}
	defer res.Body.Close()

	// GitHubのステータスをそのまま返す
	if res.StatusCode >= 400 {
		b, _ := io.ReadAll(res.Body)
		c.Data(res.StatusCode, "application/json", b)
		return
	}

	// ページネーション情報をヘッダーに追加
	c.Header("X-Current-Page", page)
	c.Header("X-Per-Page", limit)
	c.Header("Cache-Control", "public, max-age=60")

	// GitHubのLink ヘッダーがあれば転送（次ページ情報など）
	if linkHeader := res.Header.Get("Link"); linkHeader != "" {
		c.Header("Link", linkHeader)
	}

	io.Copy(c.Writer, res.Body)
}
