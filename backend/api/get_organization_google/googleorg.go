package get_organization_google

import (
	"io"
	"net/http"
	"smsIntern/sms-kadai/backend/auth"

	"github.com/gin-gonic/gin"
)

var gh = &http.Client{}

// Google組織固定のリポジトリ一覧API
func ListGoogleRepos(c *gin.Context) {
	limit := c.DefaultQuery("limit", "10")
	page := c.DefaultQuery("page", "1")

	u := "https://api.github.com/orgs/google/repos?per_page=" + limit + "&page=" + page
	req, _ := http.NewRequest("GET", u, nil)
	auth.Auth(req)

	res, err := gh.Do(req)
	if err != nil {
		c.String(http.StatusBadGateway, err.Error())
		return
	}
	defer res.Body.Close()
	if res.StatusCode >= 400 {
		b, _ := io.ReadAll(res.Body)
		c.Data(res.StatusCode, "application/json", b)
		return
	}

	c.Header("Cache-Control", "public, max-age=60")
	io.Copy(c.Writer, res.Body)
}
